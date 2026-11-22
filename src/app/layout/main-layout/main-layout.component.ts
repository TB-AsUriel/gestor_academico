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
    const encabezados: Array<[string, string, string]> = [
      ['/admin/panel', 'Panel administrativo', 'Resumen general de la operación académica.'],
      ['/admin/alumnos', 'Alumnos', 'Administra expedientes, estatus y datos de contacto.'],
      ['/admin/docentes', 'Docentes', 'Plantilla docente y datos institucionales.'],
      ['/admin/carreras', 'Carreras', 'Oferta académica y planes de estudio.'],
      ['/admin/materias', 'Materias', 'Catálogo de asignaturas y créditos.'],
      ['/admin/reticula', 'Retícula', 'Materias por plan de estudios y semestre.'],
      ['/admin/grupos', 'Grupos', 'Apertura de grupos, cupo y asignación docente.'],
      ['/admin/horarios', 'Horarios', 'Bloques de clase, aulas y validación de empalmes.'],
      ['/admin/cargas', 'Cargas académicas', 'Inscripción de alumnos a grupos.'],
      ['/admin/calificaciones', 'Calificaciones', 'Captura y seguimiento de resultados.'],
      ['/admin/edificios', 'Edificios', 'Infraestructura y capacidad instalada.'],
      ['/admin/areas', 'Áreas', 'Áreas de adscripción del personal.'],
      ['/admin/historial-docente', 'Historial docente', 'Trayectoria laboral y estatus del personal.'],
      ['/admin/usuarios', 'Usuarios', 'Accesos, roles y credenciales del sistema.'],
      ['/docente/panel', 'Panel docente', 'Resumen de tu actividad académica.'],
      ['/docente/horario', 'Mi horario', 'Consulta tus clases y espacios asignados.'],
      ['/docente/mis-grupos', 'Mis grupos', 'Grupos, materias y alumnos asignados.'],
      ['/docente/calificaciones', 'Calificaciones', 'Captura las calificaciones de tus grupos.'],
      ['/docente/mi-perfil', 'Mi perfil', 'Datos personales y adscripción.'],
      ['/alumno/panel', 'Panel del alumno', 'Resumen de tu avance académico.'],
      ['/alumno/horario', 'Mi horario', 'Tu agenda académica de la semana.'],
      ['/alumno/carga', 'Mi carga académica', 'Materias inscritas y horarios del periodo.'],
      ['/alumno/kardex', 'Kardex', 'Historial de calificaciones y créditos.'],
      ['/alumno/reticula', 'Retícula', 'Mapa curricular de tu carrera.'],
      ['/alumno/mi-perfil', 'Mi perfil', 'Datos personales y de contacto.']
    ];

    const encontrado = encabezados.find(([ruta]) => url.startsWith(ruta));
    if (encontrado) {
      this.titulo.set(encontrado[1]);
      this.subtitulo.set(encontrado[2]);
      return;
    }

    this.titulo.set('Gestor Académico');
    this.subtitulo.set('');
  }
}
