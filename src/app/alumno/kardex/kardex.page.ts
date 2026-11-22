import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { AlumnoInfo, KardexMateria, KardexResumen, NumeroLike } from '../../shared/interfaces';

interface SemestreKardex {
  semestre: number;
  materias: KardexMateria[];
  creditos: number;
  aprobadas: number;
}

@Component({
  selector: 'app-alumno-kardex',
  templateUrl: './kardex.page.html',
  styleUrls: ['./kardex.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class KardexPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly reticula = signal<KardexMateria[]>([]);
  readonly alumno = signal<AlumnoInfo | null>(null);
  readonly resumen = signal<KardexResumen>({});
  readonly loading = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly materiaSeleccionada = signal<KardexMateria | null>(null);

  readonly filtradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.reticula();
    return this.reticula().filter((materia) =>
      `${materia.clave_materia} ${materia.nombre_materia} ${materia.semestre} ${materia.tipo_materia || ''} ${this.etiquetaEstado(materia.situacion)}`
        .toLowerCase()
        .includes(termino)
    );
  });

  readonly semestres = computed<SemestreKardex[]>(() => {
    const mapa = new Map<number, SemestreKardex>();
    for (const materia of this.filtradas()) {
      const semestre = Number(materia.semestre) || 0;
      let grupo = mapa.get(semestre);
      if (!grupo) {
        grupo = { semestre, materias: [], creditos: 0, aprobadas: 0 };
        mapa.set(semestre, grupo);
      }
      grupo.materias.push(materia);
      grupo.creditos += Number(materia.creditos) || 0;
      if (materia.situacion === 'APROBADA') grupo.aprobadas += 1;
    }
    return Array.from(mapa.values()).sort((a, b) => a.semestre - b.semestre);
  });

  ngOnInit(): void {
    this.cargar();
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.cerrarSeriacion();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getAlumnoKardex().subscribe({
      next: (res) => {
        this.reticula.set(res.reticula ?? []);
        this.alumno.set(res.alumno ?? null);
        this.resumen.set(res.resumen ?? {});
        this.loading.set(false);
      },
      error: (err) => {
        this.reticula.set([]);
        this.resumen.set({});
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo cargar el kardex.');
      }
    });
  }

  claseEstado(situacion?: string): string {
    switch ((situacion || '').toUpperCase()) {
      case 'APROBADA': return 'aprobada';
      case 'CURSANDO': return 'cursando';
      case 'REPROBADA': return 'reprobada';
      default: return 'pendiente';
    }
  }

  etiquetaEstado(situacion?: string): string {
    switch ((situacion || '').toUpperCase()) {
      case 'APROBADA': return 'Aprobada';
      case 'CURSANDO': return 'Cursando';
      case 'REPROBADA': return 'Reprobada';
      default: return 'Pendiente';
    }
  }

  claveFormateada(clave?: NumeroLike): string {
    const valor = String(clave ?? '').trim();
    return valor ? `MAT-${valor.padStart(3, '0')}` : '—';
  }

  dato(valor: NumeroLike | undefined): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }

  tieneSeriacion(materia: KardexMateria): boolean {
    return Boolean(materia.requisito || materia.habilita?.length);
  }

  abrirSeriacion(materia: KardexMateria): void {
    if (!this.tieneSeriacion(materia)) return;
    this.materiaSeleccionada.set(materia);
  }

  cerrarSeriacion(): void {
    this.materiaSeleccionada.set(null);
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }
}
