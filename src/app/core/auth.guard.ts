import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from './auth.service';

export const roleGuard = (...roles: Rol[]): CanActivateFn => async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token()) {
    await auth.cargar();
  }
  if (auth.tieneRol(...roles)) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
