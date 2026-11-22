import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { Carrera, Materia, RespuestaApi, Reticula } from '../../shared/interfaces';

interface ReticulaFormulario {
  clave_reticula?: number;
  plan_estudios: string;
  clave_materia: string;
  semestre: number | string | null;
  creditos: number | string | null;
  cadena_materia: string;
}

@Component({
  selector: 'app-reticula',
  templateUrl: './reticula.page.html',
  styleUrls: ['./reticula.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class ReticulaPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly filas = signal<Reticula[]>([]);
  readonly carreras = signal<Carrera[]>([]);
  readonly materias = signal<Materia[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly formOpen = signal(false);
  readonly editando = signal(false);
  readonly valores = signal<ReticulaFormulario>(this.valoresIniciales());

  readonly filasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.filas();
    return this.filas().filter((fila) =>
      [
        fila.plan_estudios,
        fila.nombre_carrera,
        fila.clave_materia,
        fila.nombre_materia,
        fila.semestre
      ]
        .join(' ')
        .toLowerCase()
        .includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarOpciones();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.listarCatalogo<Reticula>('reticula').subscribe({
      next: (res) => {
        this.filas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar la retícula.');
      }
    });
  }

  private cargarOpciones(): void {
    this.api.listarCatalogo<Carrera>('carreras').subscribe({
      next: (res) => this.carreras.set(res.data ?? []),
      error: () => this.carreras.set([])
    });

    this.api.listarCatalogo<Materia>('materias').subscribe({
      next: (res) => this.materias.set(res.data ?? []),
      error: () => this.materias.set([])
    });
  }

  nuevo(): void {
    this.valores.set(this.valoresIniciales());
    this.editando.set(false);
    this.formOpen.set(true);
  }

  editar(fila: Reticula): void {
    this.valores.set({
      clave_reticula: Number(fila.clave_reticula),
      plan_estudios: String(fila.plan_estudios ?? ''),
      clave_materia: String(fila.clave_materia ?? ''),
      semestre: fila.semestre,
      creditos: fila.creditos ?? null,
      cadena_materia: fila.cadena_materia || ''
    });
    this.editando.set(true);
    this.formOpen.set(true);
  }

  cancelar(): void {
    this.formOpen.set(false);
    this.editando.set(false);
    this.valores.set(this.valoresIniciales());
  }

  setValor(key: keyof ReticulaFormulario, valor: unknown): void {
    this.valores.update((actual) => ({ ...actual, [key]: valor }));
  }

  guardar(): void {
    const valores = this.valores();
    const semestre = Number(valores.semestre);
    const creditos = Number(valores.creditos);

    if (
      !valores.plan_estudios ||
      !valores.clave_materia ||
      !Number.isInteger(semestre) ||
      semestre <= 0 ||
      !Number.isInteger(creditos) ||
      creditos <= 0
    ) {
      void this.mostrarToast('Completa plan, materia, semestre y créditos.', 'warning');
      return;
    }

    const cuerpo: Record<string, unknown> = {
      plan_estudios: valores.plan_estudios,
      clave_materia: valores.clave_materia,
      semestre,
      creditos,
      cadena_materia: valores.cadena_materia.trim() || 'N/A'
    };

    if (this.editando()) {
      cuerpo['clave_reticula'] = valores.clave_reticula;
    }

    this.guardando.set(true);
    const peticion = this.editando()
      ? this.api.put<RespuestaApi>('/admin/reticula.php', cuerpo)
      : this.api.post<RespuestaApi>('/admin/reticula.php', cuerpo);

    peticion.subscribe({
      next: async (res) => {
        this.guardando.set(false);
        await this.mostrarToast(res?.message || 'Retícula actualizada.', 'success');
        this.cancelar();
        this.cargar();
      },
      error: async (err) => {
        this.guardando.set(false);
        await this.mostrarToast(err?.error?.message || 'No se pudo guardar la materia.', 'danger');
      }
    });
  }

  async eliminar(fila: Reticula): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar de la retícula',
      message: `¿Eliminar ${fila.clave_materia} del plan ${fila.plan_estudios}?`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api
              .delete<RespuestaApi>('/admin/reticula.php', {
                clave_reticula: fila.clave_reticula
              })
              .subscribe({
                next: async (res) => {
                  await this.mostrarToast(res?.message || 'Materia eliminada.', 'success');
                  this.cargar();
                },
                error: async (err) => {
                  await this.mostrarToast(err?.error?.message || 'No se pudo eliminar.', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  private valoresIniciales(): ReticulaFormulario {
    return {
      plan_estudios: '',
      clave_materia: '',
      semestre: 1,
      creditos: '',
      cadena_materia: ''
    };
  }

  private async mostrarToast(
    message: string,
    color: 'success' | 'warning' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2400,
      position: 'bottom',
      cssClass: 'app-toast'
    });
    await toast.present();
  }
}
