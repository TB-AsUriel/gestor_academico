import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AppMenuComponent } from '../../shared/components/app-menu/app-menu.component';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [RouterModule, AppMenuComponent, AppHeaderComponent]
})
export class MainLayoutComponent {
  private readonly router = inject(Router);

  readonly titulo = signal('Gestor Académico');
  readonly subtitulo = signal('');

  constructor() {
    this.actualizarEncabezado(this.router.url);
    this.router.events
      .pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((evento) => this.actualizarEncabezado(evento.urlAfterRedirects));
  }

  private actualizarEncabezado(url: string): void {
    if (url.startsWith('/admin/carreras')) {
      this.titulo.set('Carreras');
      this.subtitulo.set('Administra la oferta académica y sus planes de estudio.');
      return;
    }

    if (url.startsWith('/docente/horario')) {
      this.titulo.set('Mi horario');
      this.subtitulo.set('Consulta tus clases y espacios asignados para el periodo.');
      return;
    }

    if (url.startsWith('/docente/mis-grupos')) {
      this.titulo.set('Mis grupos');
      this.subtitulo.set('Revisa las materias y grupos que tienes asignados.');
      return;
    }

    if (url.startsWith('/alumno/horario')) {
      this.titulo.set('Mi horario');
      this.subtitulo.set('Tu agenda académica de la semana.');
      return;
    }

    this.titulo.set('Gestor Académico');
    this.subtitulo.set('');
  }
}
