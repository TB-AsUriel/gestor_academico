import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService, Rol } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { ThemeService } from '../core/theme.service';
import { environment } from '../../environments/environment';
import { Usuario } from '../shared/interfaces';

interface LoginRespuesta {
  status: string;
  token?: string;
  rol?: string;
  usuario?: Usuario;
  message?: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class LoginPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  correo = '';
  contra = '';
  ipServidor = '';
  mostrarContra = false;
  readonly loading = signal(false);
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    await this.auth.cargar();
    const guardada = this.auth.getIp();
    this.ipServidor = guardada || this.ipPorDefecto();
  }

  private ipPorDefecto(): string {
    try {
      const url = new URL(environment.apiUrl);
      return url.hostname || 'localhost';
    } catch {
      return 'localhost';
    }
  }

  alternarContra(): void {
    this.mostrarContra = !this.mostrarContra;
  }

  async login(): Promise<void> {
    const correo = this.correo.trim();
    const ip = this.ipServidor.trim();

    if (!ip) {
      this.error.set('Ingresa la IP del servidor.');
      return;
    }
    if (!correo || !this.contra) {
      this.error.set('Ingresa tu usuario/correo y contraseña para continuar.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const base = this.api.resolverBase(ip);
    await this.auth.guardarIp(ip);

    try {
      const res = await firstValueFrom(
        this.http.post<LoginRespuesta>(base + '/auth/login.php', {
          correo,
          usuario: correo,
          contra: this.contra
        })
      );

      if (res.status !== 'ok' || !res.token || !res.rol) {
        this.error.set(res.message || 'Credenciales incorrectas.');
        return;
      }

      const rol = res.rol as Rol;
      await this.auth.iniciar(res.token, rol, {
        id_usuario: res.usuario?.id_usuario,
        correo: res.usuario?.correo || correo,
        nombre: res.usuario?.nombre,
        numero_control: res.usuario?.numero_control != null ? String(res.usuario.numero_control) : null,
        matricula_trabajador: res.usuario?.matricula_trabajador != null ? String(res.usuario.matricula_trabajador) : null
      });

      const rutas: Record<string, string> = {
        ADMIN: '/admin/panel',
        DOCENTE: '/docente/panel',
        ALUMNO: '/alumno/panel'
      };

      const ruta = rutas[rol];

      if (!ruta) {
        this.error.set('El rol de este usuario no está configurado.');
        return;
      }

      const navegacion = await this.router.navigateByUrl(ruta);

      if (!navegacion) {
        this.error.set('No se pudo abrir el panel. Inténtalo de nuevo.');
      }
    } catch (err) {
      const fallo = err as HttpErrorResponse;

      if (fallo.status === 0) {
        this.error.set(`No se pudo conectar con el servidor (${base}). Verifica la IP y que la API esté disponible.`);
      } else {
        this.error.set(fallo.error?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
