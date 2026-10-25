import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule]
})
export class LoginPage {
  correo = '';
  contra = '';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';
    this.http.post(environment.apiUrl + '/auth/login.php', { correo: this.correo, contra: this.contra }).subscribe({
      next: async (res: any) => {
        if (res && res.status === 'ok' && res.token && res.rol) {
          await this.auth.iniciar(res.token, res.rol);
          if (res.rol === 'ADMIN') { this.router.navigateByUrl('/admin/carreras'); return; }
          if (res.rol === 'DOCENTE') { this.router.navigateByUrl('/docente/mis-grupos'); return; }
          if (res.rol === 'ALUMNO') { this.router.navigateByUrl('/alumno/mi-horario'); return; }
          this.router.navigateByUrl('/login');
        } else {
          this.error = res?.message || 'Credenciales incorrectas';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Error al iniciar sesion';
        this.loading = false;
      }
    });
  }
}
