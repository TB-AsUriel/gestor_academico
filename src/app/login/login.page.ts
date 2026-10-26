import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService, Rol } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { environment } from '../../environments/environment';

interface LoginRespuesta {
  status: string;
  token?: string;
  rol?: string;
  message?: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon]
})
export class LoginPage {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  correo = '';
  contra = '';
  mostrarContra = false;
  readonly loading = signal(false);
  readonly error = signal('');

  alternarContra(): void {
    this.mostrarContra = !this.mostrarContra;
  }

  async login(): Promise<void> {
    const correo = this.correo.trim();

    if (!correo || !this.contra) {
      this.error.set('Ingresa tu correo y contraseña para continuar.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const res = await firstValueFrom(
        this.http.post<LoginRespuesta>(environment.apiUrl + '/auth/login.php', {
          correo,
          contra: this.contra
        })
      );

      if (res.status !== 'ok' || !res.token || !res.rol) {
        this.error.set(res.message || 'Credenciales incorrectas.');
        return;
      }

      const rol = res.rol as Rol;
      await this.auth.iniciar(res.token, rol, correo);

      const rutas: Record<string, string> = {
        ADMIN: '/admin/carreras',
        DOCENTE: '/docente/horario',
        ALUMNO: '/alumno/horario'
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
        this.error.set('No se pudo conectar con el servidor. Revisa que la API esté disponible.');
      } else {
        this.error.set(fallo.error?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
