import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import {
  Calificacion,
  DocenteCarga,
  GrupoCalificaciones,
  NumeroLike
} from '../../shared/interfaces';

interface CalificacionFormulario {
  numero_control: string;
  nombre_alumno: string;
  clave_grupo: string;
  calificacion_ordinaria: number | string;
  calificacion_segunda_oportunidad: number | string;
}

interface GrupoDocente {
  clave_grupo: string;
  nombre_materia: string;
  clave_periodo: string;
  nombre_periodo: string;
  periodo_activo: number;
}

@Component({
  selector: 'app-docente-calificaciones',
  templateUrl: './calificaciones.page.html',
  styleUrls: ['./calificaciones.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class CalificacionesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly grupos = signal<GrupoDocente[]>([]);
  readonly claveGrupo = signal('');
  readonly grupo = signal<GrupoCalificaciones | null>(null);
  readonly calificaciones = signal<Calificacion[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly formOpen = signal(false);
  readonly valores = signal<CalificacionFormulario>(this.valoresIniciales());

  readonly filtradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.calificaciones();
    return this.calificaciones().filter((fila) =>
      `${fila.numero_control} ${fila.nombre_alumno} ${fila.resultado}`
        .toLowerCase()
        .includes(termino)
    );
  });

  readonly resumen = computed(() => {
    const filas = this.calificaciones();
    return {
      total: filas.length,
      capturadas: filas.filter((fila) => Number(fila.capturada) === 1).length,
      aprobados: filas.filter((fila) => (fila.resultado || '').startsWith('APROBADO')).length,
      reprobados: filas.filter((fila) => fila.resultado === 'REPROBADO').length
    };
  });

  ngOnInit(): void {
    this.cargarGrupos();
  }

  cargarGrupos(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getDocenteGrupos().subscribe({
      next: (res) => {
        const filas = res.data ?? [];
        const mapa = new Map<string, GrupoDocente>();

        for (const fila of filas) {
          const claveGrupo = String(fila.clave_grupo ?? '');
          const clavePeriodo = String(fila.clave_periodo ?? '');
          const clave = `${clavePeriodo}|${claveGrupo}`;
          if (!mapa.has(clave)) {
            mapa.set(clave, {
              clave_grupo: claveGrupo,
              nombre_materia: String(fila.nombre_materia ?? ''),
              clave_periodo: clavePeriodo,
              nombre_periodo: String(fila.nombre_periodo ?? ''),
              periodo_activo: Number(fila.periodo_activo)
            });
          }
        }

        const grupos = Array.from(mapa.values()).sort(
          (a, b) =>
            b.periodo_activo - a.periodo_activo ||
            b.clave_periodo.localeCompare(a.clave_periodo) ||
            a.clave_grupo.localeCompare(b.clave_grupo)
        );

        this.grupos.set(grupos);
        this.loading.set(false);

        const solicitado = String(this.route.snapshot.queryParamMap.get('clave_grupo') || '');
        const seleccion =
          grupos.find((grupo) => grupo.clave_grupo === solicitado) ??
          grupos.find((grupo) => grupo.periodo_activo === 1) ??
          grupos[0];

        if (seleccion) {
          this.seleccionarGrupo(seleccion.clave_grupo);
        }
      },
      error: (err) => {
        this.grupos.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar tus grupos.');
      }
    });
  }

  seleccionarGrupo(clave: string): void {
    this.claveGrupo.set(clave);
    this.busqueda.set('');
    this.formOpen.set(false);
    this.cargarCalificaciones();
  }

  cargarCalificaciones(): void {
    const clave = this.claveGrupo();
    if (!clave) return;

    this.loading.set(true);
    this.error.set('');

    this.api.getCalificacionesDocente(clave).subscribe({
      next: (res) => {
        this.grupo.set(res.grupo);
        this.calificaciones.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.grupo.set(null);
        this.calificaciones.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar las calificaciones.');
      }
    });
  }

  capturar(fila: Calificacion): void {
    this.valores.set({
      numero_control: String(fila.numero_control ?? ''),
      nombre_alumno: String(fila.nombre_alumno ?? ''),
      clave_grupo: String(fila.clave_grupo ?? ''),
      calificacion_ordinaria: fila.calificacion_ordinaria ?? '',
      calificacion_segunda_oportunidad: fila.calificacion_segunda_oportunidad ?? ''
    });
    this.formOpen.set(true);
  }

  cancelar(): void {
    this.formOpen.set(false);
    this.valores.set(this.valoresIniciales());
  }

  setValor(
    key: 'calificacion_ordinaria' | 'calificacion_segunda_oportunidad',
    valor: unknown
  ): void {
    this.valores.update((actual) => ({ ...actual, [key]: valor }));
  }

  guardar(): void {
    const valores = this.valores();
    const ordinaria = valores.calificacion_ordinaria === '' ? null : Number(valores.calificacion_ordinaria);
    const segunda = valores.calificacion_segunda_oportunidad === '' ? null : Number(valores.calificacion_segunda_oportunidad);

    if (ordinaria === null && segunda === null) {
      void this.mostrarToast('Captura al menos una calificación.', 'warning');
      return;
    }
    if (!this.calificacionValida(ordinaria) || !this.calificacionValida(segunda)) {
      void this.mostrarToast('Las calificaciones deben estar entre 0 y 100.', 'warning');
      return;
    }

    this.guardando.set(true);
    this.api
      .guardarCalificacion(
        {
          numero_control: valores.numero_control,
          clave_grupo: valores.clave_grupo,
          calificacion_ordinaria: ordinaria,
          calificacion_segunda_oportunidad: segunda,
          capturada: 1
        },
        true
      )
      .subscribe({
        next: async (res) => {
          this.guardando.set(false);
          await this.mostrarToast(res?.message || 'Calificación guardada.', 'success');
          this.cancelar();
          this.cargarCalificaciones();
        },
        error: async (err) => {
          this.guardando.set(false);
          await this.mostrarToast(err?.error?.message || 'No se pudo guardar.', 'danger');
        }
      });
  }

  async eliminar(fila: Calificacion): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar calificación',
      message: `¿Eliminar la calificación de ${fila.nombre_alumno}?`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api
              .eliminarCalificacion(
                {
                  id_historial: fila.id_historial ?? 0,
                  numero_control: String(fila.numero_control ?? ''),
                  clave_grupo: String(fila.clave_grupo ?? '')
                },
                true
              )
              .subscribe({
                next: async (res) => {
                  await this.mostrarToast(res?.message || 'Calificación eliminada.', 'success');
                  this.cargarCalificaciones();
                },
                error: async (err) => {
                  await this.mostrarToast(err?.error?.message || 'No se pudo eliminar.', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  resultadoBadge(resultado: string): string {
    if (resultado.startsWith('APROBADO')) return 'badge-success';
    if (resultado === 'REPROBADO') return 'badge-danger';
    if (resultado === 'EN_CURSO') return 'badge-primary';
    return '';
  }

  capturada(fila: Calificacion): boolean {
    return Number(fila.capturada) === 1;
  }

  dato(valor: NumeroLike | undefined): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  private calificacionValida(valor: number | null): boolean {
    return valor === null || (Number.isFinite(valor) && valor >= 0 && valor <= 100);
  }

  private valoresIniciales(): CalificacionFormulario {
    return {
      numero_control: '',
      nombre_alumno: '',
      clave_grupo: '',
      calificacion_ordinaria: '',
      calificacion_segunda_oportunidad: ''
    };
  }

  private async mostrarToast(
    message: string,
    color: 'success' | 'warning' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2400,
      position: 'bottom',
      cssClass: 'app-toast'
    });
    await toast.present();
  }
}
