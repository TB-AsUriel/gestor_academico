import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { Alumno, CargaAdmin, Grupo, RespuestaApi } from '../../shared/interfaces';

interface CargaFormulario {
  id_carga?: number;
  numero_control: string;
  clave_grupo: string;
}

@Component({
  selector: 'app-admin-cargas',
  templateUrl: './cargas.page.html',
  styleUrls: ['./cargas.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class CargasPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly filas = signal<CargaAdmin[]>([]);
  readonly alumnos = signal<Alumno[]>([]);
  readonly grupos = signal<Grupo[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly formOpen = signal(false);
  readonly editando = signal(false);
  readonly valores = signal<CargaFormulario>(this.valoresIniciales());

  readonly filasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.filas();
    return this.filas().filter((fila) =>
      [
        fila.numero_control,
        fila.nombre_alumno,
        fila.clave_grupo,
        fila.nombre_materia,
        fila.nombre_docente
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

    this.api.listarCatalogo<CargaAdmin>('cargas').subscribe({
      next: (res) => {
        this.filas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar las inscripciones.');
      }
    });
  }

  private cargarOpciones(): void {
    this.api.listarCatalogo<Alumno>('alumnos').subscribe({
      next: (res) => this.alumnos.set(res.data ?? []),
      error: () => this.alumnos.set([])
    });

    this.api.listarCatalogo<Grupo>('grupos').subscribe({
      next: (res) => this.grupos.set(res.data ?? []),
      error: () => this.grupos.set([])
    });
  }

  nuevo(): void {
    this.valores.set(this.valoresIniciales());
    this.editando.set(false);
    this.formOpen.set(true);
  }

  editar(fila: CargaAdmin): void {
    this.valores.set({
      id_carga: fila.id_carga,
      numero_control: String(fila.numero_control ?? ''),
      clave_grupo: String(fila.clave_grupo ?? '')
    });
    this.editando.set(true);
    this.formOpen.set(true);
  }

  cancelar(): void {
    this.formOpen.set(false);
    this.editando.set(false);
    this.valores.set(this.valoresIniciales());
  }

  setValor(key: 'numero_control' | 'clave_grupo', valor: unknown): void {
    this.valores.update((actual) => ({ ...actual, [key]: valor }));
  }

  guardar(): void {
    const valores = this.valores();
    if (!valores.numero_control || !valores.clave_grupo) {
      void this.mostrarToast('Selecciona un alumno y un grupo.', 'warning');
      return;
    }

    const cuerpo: Record<string, unknown> = {
      numero_control: Number(valores.numero_control),
      clave_grupo: Number(valores.clave_grupo)
    };

    if (this.editando()) {
      cuerpo['id_carga'] = valores.id_carga;
    }

    this.guardando.set(true);
    const peticion = this.editando()
      ? this.api.put<RespuestaApi>('/admin/cargas.php', cuerpo)
      : this.api.post<RespuestaApi>('/admin/cargas.php', cuerpo);

    peticion.subscribe({
      next: async (res) => {
        this.guardando.set(false);
        await this.mostrarToast(res?.message || 'Inscripción guardada.', 'success');
        this.cancelar();
        this.cargar();
      },
      error: async (err) => {
        this.guardando.set(false);
        await this.mostrarToast(err?.error?.message || 'No se pudo guardar la inscripción.', 'danger');
      }
    });
  }

  async eliminar(fila: CargaAdmin): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar inscripción',
      message: `¿Eliminar la inscripción de ${fila.nombre_alumno} en ${fila.nombre_materia}?`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api
              .delete<RespuestaApi>('/admin/cargas.php', { id_carga: fila.id_carga })
              .subscribe({
                next: async (res) => {
                  await this.mostrarToast(res?.message || 'Inscripción eliminada.', 'success');
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

  estatusBadge(estatus?: string): string {
    if (estatus === 'APROBADO') return 'badge-success';
    if (estatus === 'REPROBADO') return 'badge-danger';
    return 'badge-primary';
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  private valoresIniciales(): CargaFormulario {
    return {
      numero_control: '',
      clave_grupo: ''
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
