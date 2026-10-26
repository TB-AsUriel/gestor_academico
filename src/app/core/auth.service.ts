import { Injectable, inject, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

export type Rol = 'ADMIN' | 'DOCENTE' | 'ALUMNO';

export interface UsuarioActual {
  correo?: string | null;
  rol?: Rol | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  token = signal<string | null>(null);
  rol = signal<Rol | null>(null);
  usuario = signal<UsuarioActual>({ correo: null, rol: null });

  async cargar(): Promise<void> {
    const t = await Preferences.get({ key: 'token' });
    const r = await Preferences.get({ key: 'rol' });
    const c = await Preferences.get({ key: 'correo' });
    this.token.set(t.value);
    const rolVal = r.value as Rol | null;
    this.rol.set(rolVal);
    this.usuario.set({ correo: c.value, rol: rolVal });
  }

  async iniciar(token: string, rol: Rol, correo?: string): Promise<void> {
    await Preferences.set({ key: 'token', value: token });
    await Preferences.set({ key: 'rol', value: rol });
    if (correo) {
      await Preferences.set({ key: 'correo', value: correo });
    }
    this.token.set(token);
    this.rol.set(rol);
    this.usuario.set({ correo: correo || null, rol: rol });
  }

  async logout(): Promise<void> {
    await Preferences.clear();
    this.token.set(null);
    this.rol.set(null);
    this.usuario.set({ correo: null, rol: null });
    this.router.navigateByUrl('/login');
  }

  tieneRol(...roles: Rol[]): boolean {
    const r = this.usuario().rol || this.rol();
    return !!r && roles.includes(r);
  }
}
