import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { AsignacionDocente } from '../../shared/interfaces';

interface GrupoDocente {
  clave_grupo: string;
  semestre: string;
  turno: string;
  clave_periodo: string;
  materias: AsignacionDocente[];
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

  readonly asignaciones = signal<AsignacionDocente[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');

  readonly grupos = computed<GrupoDocente[]>(() => {
    const mapa = new Map<string, GrupoDocente>();

    for (const asignacion of this.asignaciones()) {
      const clave = `${asignacion.clave_periodo}|${asignacion.clave_grupo}`;
      const grupo = mapa.get(clave);

      if (grupo) {
        grupo.materias.push(asignacion);
        continue;
      }

      mapa.set(clave, {
        clave_grupo: asignacion.clave_grupo,
        semestre: String(asignacion.semestre),
        turno: asignacion.turno,
        clave_periodo: asignacion.clave_periodo,
        materias: [asignacion]
      });
    }

    return Array.from(mapa.values()).sort(
      (a, b) =>
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
        grupo.materias.some(
          (materia) =>
            materia.clave_materia.toLowerCase().includes(termino) ||
            materia.nombre_materia.toLowerCase().includes(termino)
        )
    );
  });

  readonly resumen = computed(() => {
    const grupos = this.grupos();
    const periodos = new Set(grupos.map((grupo) => grupo.clave_periodo));

    return {
      grupos: grupos.length,
      materias: new Set(this.asignaciones().map((asignacion) => asignacion.clave_materia)).size,
      asignaciones: this.asignaciones().length,
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

    this.api.getMisAsignaciones().subscribe({
      next: (res) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];
        this.asignaciones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.asignaciones.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar tus grupos asignados.');
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
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
