import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { CargaAdmin } from '../../shared/interfaces';

interface HorarioCarga {
  dia: string;
  inicio: string;
  fin: string;
  salon: string;
}

interface MateriaCarga {
  clave_materia: string;
  nombre_materia: string;
  clave_grupo: string;
  creditos: number;
  semestre: string;
  turno: string;
  docente: string;
  horarios: HorarioCarga[];
}

interface PeriodoCarga {
  clave_periodo: string;
  nombre_periodo: string;
  activo: boolean;
  materias: MateriaCarga[];
  creditos: number;
}

@Component({
  selector: 'app-alumno-carga',
  templateUrl: './carga.page.html',
  styleUrls: ['./carga.page.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class CargaPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly filas = signal<CargaAdmin[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly periodos = computed<PeriodoCarga[]>(() => {
    const mapa = new Map<string, PeriodoCarga>();

    for (const fila of this.filas()) {
      const clavePeriodo = String(fila.clave_periodo ?? 'ACTUAL');
      let periodo = mapa.get(clavePeriodo);
      if (!periodo) {
        periodo = {
          clave_periodo: clavePeriodo,
          nombre_periodo: String(fila.nombre_periodo ?? 'Carga actual'),
          activo: Number(fila.periodo_activo) === 1 || !fila.clave_periodo,
          materias: [],
          creditos: 0
        };
        mapa.set(clavePeriodo, periodo);
      }

      const claveMateria = String(fila.clave_materia ?? '');
      const claveGrupo = String(fila.clave_grupo ?? '');
      let materia = periodo.materias.find(
        (item) => item.clave_materia === claveMateria && item.clave_grupo === claveGrupo
      );

      if (!materia) {
        materia = {
          clave_materia: claveMateria,
          nombre_materia: String(fila.nombre_materia ?? ''),
          clave_grupo: claveGrupo,
          creditos: Number(fila.creditos ?? 0),
          semestre: String(fila.semestre ?? ''),
          turno: String(fila.turno ?? ''),
          docente: String(fila.nombre_docente ?? 'Sin docente asignado'),
          horarios: []
        };
        periodo.materias.push(materia);
        periodo.creditos += materia.creditos;
      }

      if (fila.nombre_dia && fila.hora_inicio && fila.hora_fin) {
        materia.horarios.push({
          dia: String(fila.nombre_dia),
          inicio: String(fila.hora_inicio),
          fin: String(fila.hora_fin),
          salon: String(fila.salon ?? '-')
        });
      }
    }

    return Array.from(mapa.values()).sort(
      (a, b) => Number(b.activo) - Number(a.activo) || b.clave_periodo.localeCompare(a.clave_periodo)
    );
  });

  readonly totalMaterias = computed(() =>
    this.periodos().reduce((total, periodo) => total + periodo.materias.length, 0)
  );

  readonly totalCreditos = computed(() =>
    this.periodos().reduce((total, periodo) => total + periodo.creditos, 0)
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getAlumnoCarga().subscribe({
      next: (res) => {
        this.filas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar tu carga académica.');
      }
    });
  }
}
