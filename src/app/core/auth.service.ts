import { Injectable, inject, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

export type Rol = 'ADMIN' | 'DOCENTE' | 'ALUMNO';

export interface UsuarioActual {
  id_usuario?: number;
  correo?: string | null;
  rol?: Rol | null;
  nombre?: string | null;
  numero_control?: string | null;
  matricula_trabajador?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  token = signal<string | null>(null);
  rol = signal<Rol | null>(null);
  usuario = signal<UsuarioActual>({ correo: null, rol: null });
  serverIp = signal<string>('');

  async cargar(): Promise<void> {
    const claves = [
      'token',
      'rol',
      'correo',
      'nombre',
      'numero_control',
      'matricula_trabajador',
      'server_ip'
    ];
    const valores = await Promise.all(claves.map((key) => Preferences.get({ key })));
    const [token, rol, correo, nombre, numeroControl, matricula, serverIp] = valores;

    const rolVal = rol.value as Rol | null;
    this.token.set(token.value);
    this.rol.set(rolVal);
    this.serverIp.set(serverIp.value ?? '');
    this.usuario.set({
      correo: correo.value,
      rol: rolVal,
      nombre: nombre.value,
      numero_control: numeroControl.value,
      matricula_trabajador: matricula.value
    });
  }

  async guardarIp(ip: string): Promise<void> {
    const valor = (ip || '').trim();
    this.serverIp.set(valor);
    await Preferences.set({ key: 'server_ip', value: valor });
  }

  getIp(): string {
    return this.serverIp();
  }

  async iniciar(
    token: string,
    rol: Rol,
    datos: Omit<Partial<UsuarioActual>, 'rol'> = {}
  ): Promise<void> {
    const usuario: UsuarioActual = {
      ...datos,
      rol
    };

    const guardados: Array<[string, string]> = [['token', token], ['rol', rol]];
    if (usuario.correo) guardados.push(['correo', usuario.correo]);
    if (usuario.nombre) guardados.push(['nombre', usuario.nombre]);
    if (usuario.numero_control) guardados.push(['numero_control', usuario.numero_control]);
    if (usuario.matricula_trabajador) {
      guardados.push(['matricula_trabajador', usuario.matricula_trabajador]);
    }

    await Promise.all(guardados.map(([key, value]) => Preferences.set({ key, value })));

    this.token.set(token);
    this.rol.set(rol);
    this.usuario.set(usuario);
  }

  async logout(): Promise<void> {
    const claves = ['token', 'rol', 'correo', 'nombre', 'numero_control', 'matricula_trabajador'];
    await Promise.all(claves.map((key) => Preferences.remove({ key })));
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
