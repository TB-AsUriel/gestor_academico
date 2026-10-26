import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon]
})
export class AppMenuComponent {
  readonly auth = inject(AuthService);

  readonly rolEtiqueta = computed(() => {
    const rol = this.auth.usuario().rol;
    if (rol === 'ADMIN') return 'Administrador';
    if (rol === 'DOCENTE') return 'Docente';
    if (rol === 'ALUMNO') return 'Alumno';
    return 'Usuario';
  });

  readonly inicial = computed(() => {
    const correo = this.auth.usuario().correo;
    return (correo?.charAt(0) || 'U').toUpperCase();
  });

  logout(): void {
    void this.auth.logout();
  }
}
