import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'gestor-tema';

  readonly oscuro = signal(false);

  constructor() {
    const guardado = this.leerPreferencia();
    const sistemaOscuro = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const oscuro = guardado ? guardado === 'oscuro' : sistemaOscuro;
    this.aplicar(oscuro, false);
  }

  alternar(): void {
    this.aplicar(!this.oscuro(), true);
  }

  private aplicar(oscuro: boolean, persistir: boolean): void {
    const root = this.document.documentElement;
    root.classList.toggle('ion-palette-dark', oscuro);
    root.style.setProperty('color-scheme', oscuro ? 'dark' : 'light');

    const meta = this.document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', oscuro ? '#0b1220' : '#f5f7fb');

    this.oscuro.set(oscuro);

    if (persistir) {
      try {
        this.document.defaultView?.localStorage.setItem(this.storageKey, oscuro ? 'oscuro' : 'claro');
      } catch {
        return;
      }
    }
  }

  private leerPreferencia(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(this.storageKey) ?? null;
    } catch {
      return null;
    }
  }
}
