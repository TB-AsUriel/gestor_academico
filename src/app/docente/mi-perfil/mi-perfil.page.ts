import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { DocentePerfil } from '../../shared/interfaces';

@Component({
  selector: 'app-docente-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class MiPerfilPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastCtrl = inject(ToastController);

  readonly perfil = signal<DocentePerfil | null>(null);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly correo = signal('');
  readonly telefono = signal('');
  readonly calle = signal('');
  readonly colonia = signal('');
  readonly noExterior = signal('');
  readonly noInterior = signal('');
  readonly codigoPostal = signal('');
  readonly municipio = signal('');
  readonly estado = signal('');

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true); this.error.set('');
    this.api.getDocentePerfil().subscribe({
      next: (res) => {
        const p = res.data ?? null;
        this.perfil.set(p);
        this.correo.set(p?.correo_institucional || '');
        this.telefono.set(p?.telefono || '');
        this.calle.set(p?.calle || '');
        this.colonia.set(p?.colonia || '');
        this.noExterior.set(p?.no_exterior || '');
        this.noInterior.set(p?.no_interior || '');
        this.codigoPostal.set(p?.codigo_postal || '');
        this.municipio.set(p?.municipio || '');
        this.estado.set(p?.estado || '');
        this.loading.set(false);
      },
      error: (err) => { this.perfil.set(null); this.loading.set(false); this.error.set(err?.error?.message || 'No se pudo cargar tu perfil.'); }
    });
  }

  guardar(): void {
    this.guardando.set(true);
    this.api.actualizarDocenteInfo({
      telefono: this.telefono().trim(),
      calle: this.calle().trim(),
      colonia: this.colonia().trim(),
      no_exterior: this.noExterior().trim() || null,
      no_interior: this.noInterior().trim() || null,
      codigo_postal: this.codigoPostal().trim(),
      municipio: this.municipio().trim(),
      estado: this.estado().trim()
    }).subscribe({
      next: async (res) => { this.guardando.set(false); this.perfil.set(res.data ?? this.perfil()); await this.mostrarToast(res?.message || 'Perfil actualizado.', 'success'); },
      error: async (err) => { this.guardando.set(false); await this.mostrarToast(err?.error?.message || 'No se pudo actualizar el perfil.', 'danger'); }
    });
  }

  private async mostrarToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({ message, color, duration: 2400, position: 'bottom', cssClass: 'app-toast' });
    await toast.present();
  }
}