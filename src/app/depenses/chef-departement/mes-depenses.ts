import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Depense as DepenseService } from '../depense';
import { Depense as DepenseModel } from '../depense.model';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-mes-depenses',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './mes-depenses.html',
  styleUrl: './mes-depenses.css'
})
export class MesDepenses implements OnInit {

  depenses = signal<DepenseModel[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  alerteDepassementVisible = signal(false);
  budgetDepasseInfo = signal<{ nomDepart: string; alloue: number; consomme: number } | null>(null);

  constructor(private depenseService: DepenseService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.depenseService.listerMesDepenses().subscribe({
      next: (liste) => {
        this.depenses.set(liste);
        this.chargement.set(false);
        this.verifierDepassementBudget(liste);
      },
      error: () => {
        this.erreur.set("Impossible de charger vos dépenses.");
        this.chargement.set(false);
      }
    });
  }

  private verifierDepassementBudget(liste: DepenseModel[]): void {
    const depenseAvecBudget = liste.find(d => d.budget);
    if (!depenseAvecBudget) { return; }

    const { montantAlloueBud, montantConsommeBud, departement } = depenseAvecBudget.budget;

    if (montantConsommeBud > montantAlloueBud) {
      this.budgetDepasseInfo.set({
        nomDepart: departement?.nomDepart || 'votre département',
        alloue: montantAlloueBud,
        consomme: montantConsommeBud
      });
      this.alerteDepassementVisible.set(true);
    }
  }

  fermerAlerte(): void {
    this.alerteDepassementVisible.set(false);
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