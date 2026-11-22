import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { ResumenAlumno } from '../../shared/interfaces';

@Component({
  selector: 'app-alumno-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
  standalone: true,
  imports: [RouterLink, IonIcon]
})
export class PanelPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly resumen = signal<ResumenAlumno | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly nombre = computed(() => {
    return this.resumen()?.alumno?.nombre_completo || 'Alumno';
  });

  readonly avance = computed(() => Number(this.resumen()?.alumno?.avance ?? 0));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getResumenAlumno().subscribe({
      next: (res) => {
        this.resumen.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.resumen.set(null);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar tu panel.');
      }
    });
  }

  dato(valor: number | string | null | undefined): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }
}
