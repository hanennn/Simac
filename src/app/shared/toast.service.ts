import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'succes' | 'erreur';
  texte: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private compteur = 0;
  toasts = signal<ToastMessage[]>([]);

  succes(texte: string): void {
    this.ajouter('succes', texte);
  }

  erreur(texte: string): void {
    this.ajouter('erreur', texte);
  }

  private ajouter(type: 'succes' | 'erreur', texte: string): void {
    const id = this.compteur++;
    this.toasts.update(liste => [...liste, { id, type, texte }]);

    setTimeout(() => {
      this.toasts.update(liste => liste.filter(t => t.id !== id));
    }, 4000);
  }

  retirer(id: number): void {
    this.toasts.update(liste => liste.filter(t => t.id !== id));
  }
}