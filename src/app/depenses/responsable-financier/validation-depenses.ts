import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Depense as DepenseService } from '../../depenses/depense';
import { Depense as DepenseModel } from '../depense.model';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { creerEtatChargement } from '../../shared/etat-chargement';

@Component({
  selector: 'app-validation-depenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-depenses.html',
  styleUrl: './validation-depenses.css'
})
export class ValidationDepenses implements OnInit {

  depenses = signal<DepenseModel[]>([]);
  etat = creerEtatChargement();

  filtreStatut = signal<'TOUS' | 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE'>('EN_ATTENTE');

  depensesFiltrees = computed(() => {
    const filtre = this.filtreStatut();
    if (filtre === 'TOUS') return this.depenses();
    return this.depenses().filter(d => d.statutDepense === filtre);
  });

  actionEnCours = signal<number | null>(null);

  constructor(private depenseService: DepenseService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.depenseService.listerTous().subscribe({
      next: (liste) => {
        this.depenses.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger les dépenses.");
        this.etat.chargement.set(false);
      }
    });
  }

  valider(dep: DepenseModel): void {
    this.actionEnCours.set(dep.idDepense);
    this.depenseService.valider(dep.idDepense).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.charger();
      },
      error: () => {
        this.actionEnCours.set(null);
        this.etat.erreur.set("La validation a échoué.");
      }
    });
  }

  rejeter(dep: DepenseModel): void {
    this.actionEnCours.set(dep.idDepense);
    this.depenseService.rejeter(dep.idDepense).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.charger();
      },
      error: () => {
        this.actionEnCours.set(null);
        this.etat.erreur.set("Le rejet a échoué.");
      }
    });
  }

  formatStatut(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }
}