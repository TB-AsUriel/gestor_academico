import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { Carrera } from '../../shared/interfaces';

interface CarreraFormulario {
  clave_carrera?: string;
  nombre_carrera?: string;
  total_creditos?: string | number;
  duracion_semestres?: string | number;
}

@Component({
  selector: 'app-carreras',
  templateUrl: './carreras.page.html',
  styleUrls: ['./carreras.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class CarrerasPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly carreras = signal<Carrera[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');

  readonly carrerasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.carreras();

    return this.carreras().filter(
      (carrera) =>
        carrera.clave_carrera.toLowerCase().includes(termino) ||
        carrera.nombre_carrera.toLowerCase().includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getCarreras().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];
        this.carreras.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.carreras.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar las carreras.');
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  async nuevo(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva carrera',
      subHeader: 'Registra la clave, el nombre y los datos del plan de estudios.',
      cssClass: 'app-alert',
      inputs: [
        {
          name: 'clave_carrera',
          type: 'text',
          placeholder: 'Clave (ej. ISC)',
          attributes: { maxlength: '20', autocapitalize: 'characters' }
        },
        {
          name: 'nombre_carrera',
          type: 'text',
          placeholder: 'Nombre de la carrera',
          attributes: { maxlength: '120' }
        },
        {
          name: 'total_creditos',
          type: 'number',
          placeholder: 'Total de créditos',
          min: 1,
          max: 1000
        },
        {
          name: 'duracion_semestres',
          type: 'number',
          placeholder: 'Duración en semestres',
          min: 1,
          max: 20
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data: CarreraFormulario) => {
            const carrera = this.construirCarrera(data);
            if (!carrera) {
              void this.mostrarToast('Completa todos los campos con valores válidos.', 'warning');
              return false;
            }
            this.guardar(carrera, 'crear');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async editar(carrera: Carrera): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Editar carrera',
      subHeader: `Clave: ${carrera.clave_carrera}`,
      cssClass: 'app-alert',
      inputs: [
        {
          name: 'nombre_carrera',
          type: 'text',
          value: carrera.nombre_carrera,
          placeholder: 'Nombre de la carrera',
          attributes: { maxlength: '120' }
        },
        {
          name: 'total_creditos',
          type: 'number',
          value: carrera.total_creditos,
          placeholder: 'Total de créditos',
          min: 1,
          max: 1000
        },
        {
          name: 'duracion_semestres',
          type: 'number',
          value: carrera.duracion_semestres,
          placeholder: 'Duración en semestres',
          min: 1,
          max: 20
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data: CarreraFormulario) => {
            const actualizada = this.construirCarrera({
              ...data,
              clave_carrera: carrera.clave_carrera
            });
            if (!actualizada) {
              void this.mostrarToast('Completa todos los campos con valores válidos.', 'warning');
              return false;
            }
            this.guardar(actualizada, 'editar');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminar(carrera: Carrera): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar carrera',
      message: `¿Eliminar la carrera ${carrera.nombre_carrera}? Esta acción no se puede deshacer.`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api.eliminarCarrera(carrera.clave_carrera).subscribe({
              next: async (res) => {
                await this.mostrarToast(res?.message || 'Carrera eliminada.', 'success');
                this.cargar();
              },
              error: async (err) => {
                await this.mostrarToast(
                  err?.error?.message || 'No se pudo eliminar la carrera. Revisa si tiene grupos asociados.',
                  'danger'
                );
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private guardar(carrera: Carrera, accion: 'crear' | 'editar'): void {
    this.loading.set(true);

    const peticion = accion === 'crear'
      ? this.api.crearCarrera(carrera)
      : this.api.actualizarCarrera(carrera);

    peticion.subscribe({
      next: async (res) => {
        this.loading.set(false);
        await this.mostrarToast(
          res?.message || (accion === 'crear' ? 'Carrera creada.' : 'Carrera actualizada.'),
          'success'
        );
        this.cargar();
      },
      error: async (err) => {
        this.loading.set(false);
        await this.mostrarToast(
          err?.error?.message || (accion === 'crear' ? 'No se pudo crear la carrera.' : 'No se pudo actualizar la carrera.'),
          'danger'
        );
      }
    });
  }

  private construirCarrera(data: CarreraFormulario): Carrera | null {
    const clave = (data.clave_carrera || '').trim().toUpperCase();
    const nombre = (data.nombre_carrera || '').trim();
    const creditos = Number(data.total_creditos);
    const duracion = Number(data.duracion_semestres);

    if (
      !clave ||
      !nombre ||
      !Number.isInteger(creditos) ||
      creditos <= 0 ||
      !Number.isInteger(duracion) ||
      duracion <= 0
    ) {
      return null;
    }

    return {
      clave_carrera: clave,
      nombre_carrera: nombre,
      total_creditos: creditos,
      duracion_semestres: duracion
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
