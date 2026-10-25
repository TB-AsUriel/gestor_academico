import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Carrera } from '../../shared/interfaces';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-carreras',
  templateUrl: './carreras.page.html',
  styleUrls: ['./carreras.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CarrerasPage implements OnInit {
  carreras: Carrera[] = [];
  loading = false;

  constructor(private api: ApiService, private alertCtrl: AlertController, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.api.getCarreras().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) this.carreras = res;
        else if (res && Array.isArray(res.data)) this.carreras = res.data;
        else this.carreras = [];
        this.loading = false;
      },
      error: async () => {
        this.loading = false;
        const t = await this.toastCtrl.create({ message: 'Error al cargar carreras', duration: 2000, color: 'danger' });
        await t.present();
      }
    });
  }

  async nuevo() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Carrera',
      inputs: [
        { name: 'clave', type: 'text', placeholder: 'Clave' },
        { name: 'nombre', type: 'text', placeholder: 'Nombre' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.clave || !data.nombre) return false;
            this.api.crearCarrera({ clave: data.clave, nombre: data.nombre, activo: true }).subscribe({
              next: async () => {
                const t = await this.toastCtrl.create({ message: 'Carrera creada', duration: 1500, color: 'success' });
                await t.present();
                this.cargar();
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async editar(c: Carrera) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Carrera',
      inputs: [
        { name: 'clave', type: 'text', placeholder: 'Clave', value: c.clave },
        { name: 'nombre', type: 'text', placeholder: 'Nombre', value: c.nombre },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.clave || !data.nombre) return false;
            this.api.actualizarCarrera({ id_carrera: c.id_carrera, clave: data.clave, nombre: data.nombre, activo: c.activo }).subscribe({
              next: async () => {
                const t = await this.toastCtrl.create({ message: 'Carrera actualizada', duration: 1500, color: 'success' });
                await t.present();
                this.cargar();
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminar(c: Carrera) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Eliminar ' + c.nombre + '?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api.eliminarCarrera(c.id_carrera!).subscribe({
              next: async () => {
                const t = await this.toastCtrl.create({ message: 'Carrera eliminada', duration: 1500, color: 'success' });
                await t.present();
                this.cargar();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
