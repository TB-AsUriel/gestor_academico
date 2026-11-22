import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonIcon, ToastController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import {
  Alumno,
  Docente,
  RespuestaApi,
  RolUsuario,
  UsuarioAdmin
} from '../../shared/interfaces';

interface UsuarioFormulario {
  id_usuario?: number;
  correo: string;
  contra: string;
  rol: RolUsuario;
  numero_control: string;
  matricula_trabajador: string;
  activo: number;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class UsuariosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly alumnos = signal<Alumno[]>([]);
  readonly docentes = signal<Docente[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly formOpen = signal(false);
  readonly editando = signal(false);
  readonly mostrarContrasenas = signal(true);
  readonly mostrarContraFormulario = signal(false);
  readonly valores = signal<UsuarioFormulario>(this.valoresIniciales());

  readonly filtrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.usuarios();
    return this.usuarios().filter((usuario) =>
      [
        usuario.correo,
        usuario.nombre,
        usuario.rol,
        usuario.numero_control,
        usuario.matricula_trabajador
      ]
        .join(' ')
        .toLowerCase()
        .includes(termino)
    );
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarOpciones();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.listarCatalogo<UsuarioAdmin>('usuarios').subscribe({
      next: (res) => {
        this.usuarios.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.usuarios.set([]);
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar los usuarios.');
      }
    });
  }

  private cargarOpciones(): void {
    this.api.listarCatalogo<Alumno>('alumnos').subscribe({
      next: (res) => this.alumnos.set(res.data ?? []),
      error: () => this.alumnos.set([])
    });

    this.api.listarCatalogo<Docente>('docentes').subscribe({
      next: (res) => this.docentes.set(res.data ?? []),
      error: () => this.docentes.set([])
    });
  }

  nuevo(): void {
    this.valores.set(this.valoresIniciales());
    this.editando.set(false);
    this.mostrarContraFormulario.set(false);
    this.formOpen.set(true);
  }

  editar(usuario: UsuarioAdmin): void {
    this.valores.set({
      id_usuario: usuario.id_usuario,
      correo: String(usuario.correo ?? usuario.usuario ?? ''),
      contra: '',
      rol: usuario.rol,
      numero_control: usuario.numero_control != null ? String(usuario.numero_control) : '',
      matricula_trabajador: usuario.matricula_trabajador != null ? String(usuario.matricula_trabajador) : '',
      activo: Number(usuario.activo)
    });
    this.editando.set(true);
    this.mostrarContraFormulario.set(false);
    this.formOpen.set(true);
  }

  cancelar(): void {
    this.formOpen.set(false);
    this.editando.set(false);
    this.mostrarContraFormulario.set(false);
    this.valores.set(this.valoresIniciales());
  }

  alternarContrasenas(): void {
    this.mostrarContrasenas.update((visible) => !visible);
  }

  alternarContraFormulario(): void {
    this.mostrarContraFormulario.update((visible) => !visible);
  }

  setValor(
    key: 'correo' | 'contra' | 'rol' | 'numero_control' | 'matricula_trabajador' | 'activo',
    valor: unknown
  ): void {
    this.valores.update((actual) => ({ ...actual, [key]: valor }));
  }

  guardar(): void {
    const valores = this.valores();
    const correo = valores.correo.trim();
    const contra = valores.contra;

    if (!correo || (!this.editando() && !contra)) {
      void this.mostrarToast('Ingresa correo y contraseña.', 'warning');
      return;
    }
    if (valores.rol === 'ALUMNO' && !valores.numero_control) {
      void this.mostrarToast('Selecciona un alumno.', 'warning');
      return;
    }
    if (valores.rol === 'DOCENTE' && !valores.matricula_trabajador) {
      void this.mostrarToast('Selecciona un docente.', 'warning');
      return;
    }

    const cuerpo: Record<string, unknown> = {
      correo,
      rol: valores.rol,
      numero_control: valores.rol === 'ALUMNO' ? valores.numero_control : null,
      matricula_trabajador: valores.rol === 'DOCENTE' ? valores.matricula_trabajador : null,
      activo: Number(valores.activo)
    };

    if (contra) cuerpo['contra'] = contra;
    if (this.editando()) cuerpo['id_usuario'] = valores.id_usuario;

    this.guardando.set(true);
    const peticion = this.editando()
      ? this.api.put<RespuestaApi>('/admin/usuarios.php', cuerpo)
      : this.api.post<RespuestaApi>('/admin/usuarios.php', cuerpo);

    peticion.subscribe({
      next: async (res) => {
        this.guardando.set(false);
        await this.mostrarToast(res?.message || 'Usuario guardado.', 'success');
        this.cancelar();
        this.cargar();
      },
      error: async (err) => {
        this.guardando.set(false);
        await this.mostrarToast(err?.error?.message || 'No se pudo guardar el usuario.', 'danger');
      }
    });
  }

  async eliminar(usuario: UsuarioAdmin): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Eliminar el acceso de ${usuario.correo}?`,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.api
              .delete<RespuestaApi>('/admin/usuarios.php', { id_usuario: usuario.id_usuario })
              .subscribe({
                next: async (res) => {
                  await this.mostrarToast(res?.message || 'Usuario eliminado.', 'success');
                  this.cargar();
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

  referencia(usuario: UsuarioAdmin): string {
    return String(usuario.numero_control || usuario.matricula_trabajador || '—');
  }

  estaActivo(usuario: UsuarioAdmin): boolean {
    return Number(usuario.activo) === 1;
  }

  contrasenaDe(usuario: UsuarioAdmin): string {
    return usuario.contrasena || 'No disponible';
  }

  fecha(valor?: string | null): string {
    if (!valor) return '—';
    const fecha = new Date(valor.replace(' ', 'T'));
    if (Number.isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  private valoresIniciales(): UsuarioFormulario {
    return {
      correo: '',
      contra: '',
      rol: 'ALUMNO',
      numero_control: '',
      matricula_trabajador: '',
      activo: 1
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
