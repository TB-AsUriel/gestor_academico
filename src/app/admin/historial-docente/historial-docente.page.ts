import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { Area, Docente, HistorialDocente, RespuestaApi } from '../../shared/interfaces';

interface HistorialFormulario {
  id_historial?: number;
  matricula_trabajador: string;
  id_rol: number | string;
  fecha_inicio: string;
  fecha_fin: string;
  administrativo: string;
  docente: string;
  estatus: string;
}

@Component({
  selector: 'app-historial-docente',
  templateUrl: './historial-docente.page.html',
  styleUrls: ['./historial-docente.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class HistorialDocentePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly filas = signal<HistorialDocente[]>([]);
  readonly docentes = signal<Docente[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly formOpen = signal(false);
  readonly editando = signal(false);
  readonly valores = signal<HistorialFormulario>(this.valoresIniciales());

  readonly filasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.filas();
    return this.filas().filter((fila) =>
      [
        fila.matricula_trabajador,
        fila.nombre_docente,
        fila.nombre_area,
        fila.estatus
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

    this.api.listarCatalogo<HistorialDocente>('historial-docente').subscribe({
      next: (res) => {
        this.filas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar el historial docente.');
      }
    });
  }

  private cargarOpciones(): void {
    this.api.listarCatalogo<Docente>('docentes').subscribe({
      next: (res) => this.docentes.set(res.data ?? []),
      error: () => this.docentes.set([])
    });

    this.api.listarCatalogo<Area>('areas').subscribe({
      next: (res) => this.areas.set(res.data ?? []),
      error: () => this.areas.set([])
    });
  }

  nuevo(): void {
    this.valores.set(this.valoresIniciales());
    this.editando.set(false);
    this.formOpen.set(true);
  }

  editar(fila: HistorialDocente): void {
    this.valores.set({
      id_historial: Number(fila.id_historial),
      matricula_trabajador: String(fila.matricula_trabajador ?? ''),
      id_rol: Number(fila.id_rol),
      fecha_inicio: String(fila.fecha_inicio ?? ''),
      fecha_fin: fila.fecha_fin || '',
      administrativo: String(fila.administrativo ?? ''),
      docente: String(fila.docente ?? ''),
      estatus: String(fila.estatus ?? '')
    });
    this.editando.set(true);
    this.formOpen.set(true);
  }

  cancelar(): void {
    this.formOpen.set(false);
    this.editando.set(false);
    this.valores.set(this.valoresIniciales());
  }

  setValor(key: keyof HistorialFormulario, valor: unknown): void {
    this.valores.update((actual) => ({ ...actual, [key]: valor }));
  }

  guardar(): void {
    const valores = this.valores();

    if (!valores.matricula_trabajador || !valores.id_rol || !valores.fecha_inicio) {
      void this.mostrarToast('Selecciona docente, área y fecha de inicio.', 'warning');
      return;
    }

    const cuerpo: Record<string, unknown> = {
      matricula_trabajador: valores.matricula_trabajador,
      id_rol: Number(valores.id_rol),
      fecha_inicio: valores.fecha_inicio,
      fecha_fin: valores.fecha_fin || null,
      administrativo: valores.administrativo,
      docente: valores.docente,
      estatus: valores.estatus
    };

    if (this.editando()) {
      cuerpo['id_historial'] = valores.id_historial;
    }

    this.guardando.set(true);
    const peticion = this.editando()
      ? this.api.put<RespuestaApi>('/admin/historial-docente.php', cuerpo)
      : this.api.post<RespuestaApi>('/admin/historial-docente.php', cuerpo);

    peticion.subscribe({
      next: async (res) => {
        this.guardando.set(false);
        await this.mostrarToast(res?.message || 'Historial guardado.', 'success');
        this.cancelar();
        this.cargar();
      },
      error: async (err) => {
        this.guardando.set(false);
        await this.mostrarToast(err?.error?.message || 'No se pudo guardar el historial.', 'danger');
      }
    });
  }

  async eliminar(fila: HistorialDocente): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar registro laboral',
      message: `¿Eliminar el registro de ${fila.nombre_docente} en ${fila.nombre_area}?`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api
              .delete<RespuestaApi>('/admin/historial-docente.php', {
                id_historial: fila.id_historial
              })
              .subscribe({
                next: async (res) => {
                  await this.mostrarToast(res?.message || 'Registro eliminado.', 'success');
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

  private valoresIniciales(): HistorialFormulario {
    return {
      matricula_trabajador: '',
      id_rol: '',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: '',
      administrativo: 'NO',
      docente: 'SI',
      estatus: 'ACTIVO'
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
