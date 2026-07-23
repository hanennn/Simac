import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  sombre = signal<boolean>(localStorage.getItem('simac-theme') === 'dark');

  constructor() {
    effect(() => {
      const estSombre = this.sombre();
      document.documentElement.classList.toggle('dark-theme', estSombre);
      localStorage.setItem('simac-theme', estSombre ? 'dark' : 'light');
    });
  }

  basculer(): void {
    this.sombre.set(!this.sombre());
  }
}