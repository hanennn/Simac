import { Injectable, signal, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Inactivite {
  private readonly DUREE_MS = 5 * 60 * 1000; // 5 minutes
  private minuteur: ReturnType<typeof setTimeout> | null = null;

  verrouille = signal(false);

  constructor(private zone: NgZone) {}

  demarrerSurveillance(): void {
    this.zone.runOutsideAngular(() => {
      ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => this.reinitialiser(), { passive: true });
      });
    });
    this.reinitialiser();
  }

  private reinitialiser(): void {
    if (this.verrouille()) return; // pas de reset une fois verrouille, il faut le mot de passe

    if (this.minuteur) clearTimeout(this.minuteur);
    this.minuteur = setTimeout(() => {
      this.zone.run(() => this.verrouille.set(true));
    }, this.DUREE_MS);
  }

  deverrouiller(): void {
    this.verrouille.set(false);
    this.reinitialiser();
  }
}