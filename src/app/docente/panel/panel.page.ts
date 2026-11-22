import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { ResumenDocente } from '../../shared/interfaces';

@Component({
  selector: 'app-docente-panel',
  templateUrl: './panel.page.html',
  styleUrls: ['./panel.page.scss'],
  standalone: true,
  imports: [RouterLink, IonIcon]
})
export class PanelPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly resumen = signal<ResumenDocente | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly nombre = computed(() => {
    const perfil = this.resumen()?.perfil;
    return perfil?.nombre_completo || 'Docente';
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getResumenDocente().subscribe({
      next: (res) => {
        this.resumen.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.resumen.set(null);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar el panel docente.');
      }
    });
  }
}
