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
      { path: '', redirectTo: 'carreras', pathMatch: 'full' },
      { path: 'carreras', loadComponent: () => import('./admin/carreras/carreras.page').then((m) => m.CarrerasPage) },
    ]
  },
  {
    path: 'docente',
    component: MainLayoutComponent,
    canActivate: [roleGuard('DOCENTE')],
    children: [
      { path: '', redirectTo: 'horario', pathMatch: 'full' },
      { path: 'horario', loadComponent: () => import('./docente/horario/horario.page').then((m) => m.HorarioPage) },
      { path: 'mis-grupos', loadComponent: () => import('./docente/mis-grupos/mis-grupos.page').then((m) => m.MisGruposPage) },
    ]
  },
  {
    path: 'alumno',
    component: MainLayoutComponent,
    canActivate: [roleGuard('ALUMNO')],
    children: [
      { path: '', redirectTo: 'horario', pathMatch: 'full' },
      { path: 'horario', loadComponent: () => import('./alumno/horario/horario.page').then((m) => m.HorarioPage) },
      { path: 'mi-horario', redirectTo: 'horario', pathMatch: 'full' },
    ]
  },
];
