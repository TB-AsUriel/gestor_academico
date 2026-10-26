import { Component, Input, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { AuthService } from '../../../core/auth.service';
import { ThemeService } from '../../../core/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class AppHeaderComponent {
  @Input() title = 'Gestor Académico';
  @Input() subtitle = '';

  readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);

  readonly rolEtiqueta = computed(() => {
    const rol = this.auth.usuario().rol;
    if (rol === 'ADMIN') return 'Administrador';
    if (rol === 'DOCENTE') return 'Docente';
    if (rol === 'ALUMNO') return 'Alumno';
    return 'Usuario';
  });
}
