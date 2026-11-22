import { Routes } from '@angular/router';
import { roleGuard } from './core/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [roleGuard('ADMIN')],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', loadComponent: () => import('./admin/panel/panel.page').then((m) => m.PanelPage) },
      { path: 'carreras', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'carreras' } },
      { path: 'areas', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'areas' } },
      { path: 'materias', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'materias' } },
      { path: 'alumnos', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'alumnos' } },
      { path: 'docentes', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'docentes' } },
      { path: 'edificios', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'edificios' } },
      { path: 'grupos', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'grupos' } },
      { path: 'horarios', loadComponent: () => import('./admin/catalogo/catalogo.page').then((m) => m.CatalogoPage), data: { catalogo: 'horarios' } },
      { path: 'cargas', loadComponent: () => import('./admin/cargas/cargas.page').then((m) => m.CargasPage) },
      { path: 'reticula', loadComponent: () => import('./admin/reticula/reticula.page').then((m) => m.ReticulaPage) },
      { path: 'historial-docente', loadComponent: () => import('./admin/historial-docente/historial-docente.page').then((m) => m.HistorialDocentePage) },
      { path: 'calificaciones', loadComponent: () => import('./admin/calificaciones/calificaciones.page').then((m) => m.CalificacionesPage) },
      { path: 'usuarios', loadComponent: () => import('./admin/usuarios/usuarios.page').then((m) => m.UsuariosPage) },
    ]
  },
  {
    path: 'docente',
    component: MainLayoutComponent,
    canActivate: [roleGuard('DOCENTE')],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', loadComponent: () => import('./docente/panel/panel.page').then((m) => m.PanelPage) },
      { path: 'horario', loadComponent: () => import('./docente/horario/horario.page').then((m) => m.HorarioPage) },
      { path: 'mis-grupos', loadComponent: () => import('./docente/mis-grupos/mis-grupos.page').then((m) => m.MisGruposPage) },
      { path: 'calificaciones', loadComponent: () => import('./docente/calificaciones/calificaciones.page').then((m) => m.CalificacionesPage) },
      { path: 'mi-perfil', loadComponent: () => import('./docente/mi-perfil/mi-perfil.page').then((m) => m.MiPerfilPage) },
    ]
  },
  {
    path: 'alumno',
    component: MainLayoutComponent,
    canActivate: [roleGuard('ALUMNO')],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', loadComponent: () => import('./alumno/panel/panel.page').then((m) => m.PanelPage) },
      { path: 'horario', loadComponent: () => import('./alumno/horario/horario.page').then((m) => m.HorarioPage) },
      { path: 'kardex', loadComponent: () => import('./alumno/kardex/kardex.page').then((m) => m.KardexPage) },
      { path: 'carga', loadComponent: () => import('./alumno/carga/carga.page').then((m) => m.CargaPage) },
      { path: 'reticula', loadComponent: () => import('./alumno/reticula/reticula.page').then((m) => m.ReticulaPage) },
      { path: 'mi-perfil', loadComponent: () => import('./alumno/mi-perfil/mi-perfil.page').then((m) => m.MiPerfilPage) },
      { path: 'mi-horario', redirectTo: 'horario', pathMatch: 'full' },
    ]
  },
];
