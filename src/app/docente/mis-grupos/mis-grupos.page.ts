import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { DocenteCarga } from '../../shared/interfaces';

interface HorarioGrupo {
  dia: string;
  inicio: string;
  fin: string;
  salon: string;
}

interface GrupoDocente {
  clave_grupo: string;
  clave_materia: string;
  nombre_materia: string;
  creditos: number;
  semestre: string;
  turno: string;
  clave_periodo: string;
  nombre_periodo: string;
  periodo_activo: boolean;
  cupo: number;
  inscritos: number;
  horarios: HorarioGrupo[];
}

@Component({
  selector: 'app-mis-grupos',
  templateUrl: './mis-grupos.page.html',
  styleUrls: ['./mis-grupos.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon, RouterLink]
})
export class MisGruposPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly filas = signal<DocenteCarga[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');

  readonly grupos = computed<GrupoDocente[]>(() => {
    const mapa = new Map<string, GrupoDocente>();

    for (const fila of this.filas()) {
      const clave = `${fila.clave_periodo}|${fila.clave_grupo}`;
      let grupo = mapa.get(clave);

      if (!grupo) {
        grupo = {
          clave_grupo: String(fila.clave_grupo ?? ''),
          clave_materia: String(fila.clave_materia ?? ''),
          nombre_materia: String(fila.nombre_materia ?? ''),
          creditos: Number(fila.creditos ?? 0),
          semestre: String((fila as any).semestre ?? ''),
          turno: String((fila as any).turno ?? ''),
          clave_periodo: String(fila.clave_periodo ?? ''),
          nombre_periodo: String(fila.nombre_periodo ?? ''),
          periodo_activo: Number(fila.periodo_activo) === 1,
          cupo: Number((fila as any).cupo ?? 0),
          inscritos: Number(fila.inscritos ?? 0),
          horarios: []
        };
        mapa.set(clave, grupo);
      }

      if (fila.nombre_dia && fila.hora_inicio && fila.hora_fin) {
        const repetido = grupo.horarios.some(
          (horario) =>
            horario.dia === fila.nombre_dia &&
            horario.inicio === fila.hora_inicio &&
            horario.fin === fila.hora_fin
        );
        if (!repetido) {
          grupo.horarios.push({
            dia: fila.nombre_dia,
            inicio: fila.hora_inicio,
            fin: fila.hora_fin,
            salon: fila.salon || '—'
          });
        }
      }
    }

    return Array.from(mapa.values()).sort(
      (a, b) =>
        Number(b.periodo_activo) - Number(a.periodo_activo) ||
        b.clave_periodo.localeCompare(a.clave_periodo) ||
        a.clave_grupo.localeCompare(b.clave_grupo)
    );
  });

  readonly gruposFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.grupos();

    return this.grupos().filter(
      (grupo) =>
        grupo.clave_grupo.toLowerCase().includes(termino) ||
        grupo.clave_materia.toLowerCase().includes(termino) ||
        grupo.nombre_materia.toLowerCase().includes(termino)
    );
  });

  readonly resumen = computed(() => {
    const grupos = this.grupos();
    const periodos = new Set(grupos.map((grupo) => grupo.clave_periodo));

    return {
      grupos: grupos.length,
      materias: new Set(grupos.map((grupo) => grupo.clave_materia)).size,
      alumnos: grupos.reduce((total, grupo) => total + grupo.inscritos, 0),
      periodo:
        periodos.size === 0
          ? '—'
          : periodos.size === 1
            ? Array.from(periodos)[0]
            : `${periodos.size} periodos`
    };
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getDocenteGrupos().subscribe({
      next: (res) => {
        this.filas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar tus grupos asignados.');
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  ocupacion(grupo: GrupoDocente): number {
    if (grupo.cupo <= 0) return 0;
    return Math.min(100, Math.round((grupo.inscritos / grupo.cupo) * 100));
  }

  turnoEtiqueta(turno: string): string {
    const normalizado = (turno || '').toLowerCase();

    if (normalizado.startsWith('mat')) return 'Matutino';
    if (normalizado.startsWith('ves')) return 'Vespertino';
    if (normalizado.startsWith('noc')) return 'Nocturno';
    if (normalizado.startsWith('mix')) return 'Mixto';

    return turno || 'Sin turno';
  }
}
