import { signal, WritableSignal } from '@angular/core';

export interface EtatChargement {
  chargement: WritableSignal<boolean>;
  erreur: WritableSignal<string | null>;
}

export function creerEtatChargement(chargementInitial = true): EtatChargement {
  return {
    chargement: signal(chargementInitial),
    erreur: signal<string | null>(null)
  };
}