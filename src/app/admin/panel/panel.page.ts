import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { NumeroLike, ResumenAdmin } from '../../shared/interfaces';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
  standalone: true,
  imports: [RouterLink, IonIcon]
})
export class PanelPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly resumen = signal<ResumenAdmin | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly accesos = [
    { ruta: '/admin/alumnos', titulo: 'Alumnos', icono: 'person-outline' },
    { ruta: '/admin/grupos', titulo: 'Grupos', icono: 'albums-outline' },
    { ruta: '/admin/cargas', titulo: 'Cargas', icono: 'clipboard-outline' },
    { ruta: '/admin/calificaciones', titulo: 'Calificaciones', icono: 'create-outline' }
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getResumenAdmin().subscribe({
      next: (res) => {
        this.resumen.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.resumen.set(null);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar el panel administrativo.');
      }
    });
  }

  conteo(clave: string): NumeroLike {
    return this.resumen()?.conteos?.[clave] ?? 0;
  }

  dato(valor: NumeroLike): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }

  porcentajeOcupacion(inscritos: NumeroLike, cupo: NumeroLike): number {
    const total = Number(cupo);
    if (!total) return 0;
    return Math.min(100, Math.round((Number(inscritos) / total) * 100));
  }
}
