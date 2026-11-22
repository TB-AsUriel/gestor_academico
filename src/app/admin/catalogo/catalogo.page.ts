import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { RespuestaApi } from '../../shared/interfaces';
import {
  CATALOGOS,
  CampoCatalogo,
  CatalogoConfig,
  ColumnaCatalogo,
  OpcionCatalogo
} from './catalogo.config';

type Fila = Record<string, any>;

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class CatalogoPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly catalogoKey = signal('');
  readonly config = computed<CatalogoConfig | null>(() => CATALOGOS[this.catalogoKey()] ?? null);

  readonly filas = signal<Fila[]>([]);
  readonly opciones = signal<Record<string, Fila[]>>({});
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly formOpen = signal(false);
  readonly editando = signal(false);
  readonly valores = signal<Fila>({});

  readonly filasFiltradas = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.filas();
    return this.filas().filter((fila) => JSON.stringify(fila).toLowerCase().includes(termino));
  });

  readonly camposVisibles = computed<CampoCatalogo[]>(() => {
    const cfg = this.config();
    if (!cfg) return [];
    return cfg.campos.filter((campo) =>
      this.editando() ? !campo.hideOnEdit : !campo.hideOnCreate
    );
  });

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      const key = String(data['catalogo'] || '');
      this.catalogoKey.set(key);
      this.formOpen.set(false);
      this.busqueda.set('');
      this.cargar();
    });
  }

  cargar(): void {
    const cfg = this.config();
    if (!cfg) return;

    this.loading.set(true);
    this.error.set('');

    this.api.listarCatalogo<Fila>(cfg.endpoint).subscribe({
      next: (res) => {
        this.filas.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.filas.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || `No se pudo cargar ${cfg.titulo.toLowerCase()}.`);
      }
    });

    this.cargarOpciones(cfg);
  }

  private cargarOpciones(cfg: CatalogoConfig): void {
    const fuentes = Array.from(
      new Set(
        cfg.campos
          .map((campo) => campo.optionsFrom)
          .filter((valor): valor is string => typeof valor === 'string' && valor.length > 0)
      )
    );

    for (const fuente of fuentes) {
      this.api.listarCatalogo<Fila>(fuente).subscribe({
        next: (res) => {
          this.opciones.update((actual) => ({ ...actual, [fuente]: res.data ?? [] }));
        },
        error: () => {
          this.opciones.update((actual) => ({ ...actual, [fuente]: [] }));
        }
      });
    }
  }

  opcionesPara(campo: CampoCatalogo): OpcionCatalogo[] {
    if (campo.options) return campo.options;
    if (!campo.optionsFrom) return [];

    const fuente = this.opciones()[campo.optionsFrom] ?? [];
    const valorKey = campo.optionValue || 'id';
    const etiqueta = campo.optionLabel || valorKey;

    return fuente.map((fila) => ({
      value: fila[valorKey],
      label:
        typeof etiqueta === 'function'
          ? etiqueta(fila)
          : String(fila[etiqueta] ?? fila[valorKey] ?? '')
    }));
  }

  trackFila(index: number, fila: Fila): unknown {
    const cfg = this.config();
    return cfg ? fila[cfg.pk] : index;
  }

  mostrarCelda(fila: Fila, columna: ColumnaCatalogo): string {
    if (columna.format) return columna.format(fila);
    const valor = fila[columna.key];
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }

  setValor(key: string, valor: unknown): void {
    this.valores.update((actual) => ({ ...actual, [key]: valor }));
  }

  nuevo(): void {
    const cfg = this.config();
    if (!cfg) return;

    const inicial: Fila = {};
    for (const campo of cfg.campos) {
      inicial[campo.key] = campo.defaultValue ?? '';
    }

    this.valores.set(inicial);
    this.editando.set(false);
    this.formOpen.set(true);
    this.autocompletarNuevo(cfg, inicial);
  }

  private autocompletarNuevo(cfg: CatalogoConfig, inicial: Fila): void {
    if (cfg.endpoint !== 'alumnos' && cfg.endpoint !== 'docentes') return;
    this.api.get<any>(`/admin/${cfg.endpoint}.php?next_correo=1`).subscribe({
      next: (res) => {
        if (this.editando() || !this.formOpen()) return;
        const data = res?.data ?? {};
        this.valores.update((actual) => {
          const next = { ...actual };
          if (!next['correo_institucional'] && data.next_correo) next['correo_institucional'] = data.next_correo;
          if (cfg.endpoint === 'alumnos' && !next['numero_control'] && data.next_numero_control) next['numero_control'] = data.next_numero_control;
          if (cfg.endpoint === 'docentes' && !next['matricula_trabajador'] && data.next_matricula_trabajador) next['matricula_trabajador'] = data.next_matricula_trabajador;
          return next;
        });
      },
      error: () => {}
    });
  }

  editar(fila: Fila): void {
    const cfg = this.config();
    if (!cfg) return;

    const actual: Fila = {};
    for (const campo of cfg.campos) {
      actual[campo.key] = fila[campo.key] ?? campo.defaultValue ?? '';
    }

    this.valores.set(actual);
    this.editando.set(true);
    this.formOpen.set(true);
  }

  cancelar(): void {
    this.formOpen.set(false);
    this.editando.set(false);
    this.valores.set({});
  }

  guardar(): void {
    const cfg = this.config();
    if (!cfg) return;

    const cuerpo: Fila = {};
    for (const campo of cfg.campos) {
      if (!this.editando() && campo.hideOnCreate) continue;

      let valor = this.valores()[campo.key];

      if (campo.required && (valor === '' || valor === null || valor === undefined)) {
        void this.mostrarToast(`Completa el campo “${campo.label}”.`, 'warning');
        return;
      }

      if (campo.type === 'number' && valor !== '' && valor !== null && valor !== undefined) {
        valor = Number(valor);
      } else if (valor === '') {
        valor = null;
      }

      cuerpo[campo.key] = valor;
    }

    this.guardando.set(true);
    const peticion = this.editando()
      ? this.api.put<RespuestaApi>(`/admin/${cfg.endpoint}.php`, cuerpo)
      : this.api.post<RespuestaApi>(`/admin/${cfg.endpoint}.php`, cuerpo);

    peticion.subscribe({
      next: async (res) => {
        this.guardando.set(false);
        await this.mostrarToast(
          res?.message || (this.editando() ? 'Registro actualizado.' : 'Registro creado.'),
          'success'
        );
        this.cancelar();
        this.cargar();
      },
      error: async (err) => {
        this.guardando.set(false);
        await this.mostrarToast(
          err?.error?.message || 'No se pudo guardar el registro.',
          'danger'
        );
      }
    });
  }

  async eliminar(fila: Fila): Promise<void> {
    const cfg = this.config();
    if (!cfg) return;

    const alert = await this.alertCtrl.create({
      header: `Eliminar ${cfg.singular}`,
      message: 'Esta acción no se puede deshacer. Verifica que el registro no tenga dependencias.',
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api
              .delete<RespuestaApi>(`/admin/${cfg.endpoint}.php`, { [cfg.pk]: fila[cfg.pk] })
              .subscribe({
                next: async (res) => {
                  await this.mostrarToast(res?.message || 'Registro eliminado.', 'success');
                  this.cargar();
                },
                error: async (err) => {
                  await this.mostrarToast(
                    err?.error?.message || 'No se pudo eliminar el registro.',
                    'danger'
                  );
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
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
