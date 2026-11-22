import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { ReticulaAlumno } from '../../shared/interfaces';

interface SemestreReticula {
  semestre: number;
  materias: ReticulaAlumno[];
  creditos: number;
}

@Component({
  selector: 'app-alumno-reticula',
  templateUrl: './reticula.page.html',
  styleUrls: ['./reticula.page.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class ReticulaPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly filas = signal<ReticulaAlumno[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly semestres = computed<SemestreReticula[]>(() => {
    const mapa = new Map<number, SemestreReticula>();

    for (const fila of this.filas()) {
      const semestre = Number(fila.semestre);
      let grupo = mapa.get(semestre);
      if (!grupo) {
        grupo = { semestre, materias: [], creditos: 0 };
        mapa.set(semestre, grupo);
      }
      grupo.materias.push(fila);
      grupo.creditos += Number(fila.creditos ?? 0);
    }

    return Array.from(mapa.values()).sort((a, b) => a.semestre - b.semestre);
  });

  readonly resumen = computed(() => {
    const filas = this.filas();
    return {
      total: filas.length,
      cursadas: filas.filter((fila) => fila.situacion === 'CURSADA').length,
      cursando: filas.filter((fila) => fila.situacion === 'CURSANDO').length,
      porCursar: filas.filter((fila) => fila.situacion === 'POR_CURSAR').length,
      creditos: filas.reduce((total, fila) => total + Number(fila.creditos ?? 0), 0)
    };
  });

  readonly carrera = computed(() => this.filas()[0]?.nombre_carrera || '—');
  readonly plan = computed(() => this.filas()[0]?.plan_estudios || '—');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getAlumnoReticula().subscribe({
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

  situacionBadge(situacion: string): string {
    if (situacion === 'CURSADA') return 'badge-success';
    if (situacion === 'CURSANDO') return 'badge-primary';
    return 'badge-warning';
  }

  situacionLabel(situacion: string): string {
    if (situacion === 'CURSADA') return 'Cursada';
    if (situacion === 'CURSANDO') return 'Cursando';
    return 'Por cursar';
  }
}
