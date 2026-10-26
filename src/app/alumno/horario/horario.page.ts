import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { HorarioGridComponent } from '../../shared/components/horario-grid/horario-grid.component';
import { HorarioBloque } from '../../shared/interfaces';
import { normalizarHorario, resumenHorario } from '../../shared/utils/horario';

@Component({
  selector: 'app-alumno-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
  standalone: true,
  imports: [HorarioGridComponent, IonIcon]
})
export class HorarioPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly bloques = signal<HorarioBloque[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly resumen = computed(() => resumenHorario(this.bloques()));
  readonly periodo = computed(() => this.bloques()[0]?.clave_periodo || 'Periodo actual');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getHorarioAlumno().subscribe({
      next: (res) => {
        this.bloques.set(normalizarHorario(res));
        this.loading.set(false);
      },
      error: (err) => {
        this.bloques.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Verifica tu conexión e inténtalo de nuevo.');
      }
    });
  }
}
