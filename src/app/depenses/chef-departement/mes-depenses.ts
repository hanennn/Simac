import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Depense as DepenseService } from '../depense';
import { Depense as DepenseModel } from '../depense.model';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { AlerteNotification } from '../../alertes/alerte-notification';
import { creerEtatChargement } from '../../shared/etat-chargement';

@Component({
  selector: 'app-mes-depenses',
  standalone: true,
  imports: [CommonModule, AlerteNotification],
  templateUrl: './mes-depenses.html',
  styleUrl: './mes-depenses.css'
})
export class MesDepenses implements OnInit {

  depenses = signal<DepenseModel[]>([]); //list depenses
  etat = creerEtatChargement();
  alerteDepassementVisible = signal(false); //budget depassé fermé par défaut
  budgetDepasseInfo = signal<{ nomDepart: string; alloue: number; consomme: number } | null>(null);

  constructor(private depenseService: DepenseService) {}

  ngOnInit(): void {
    this.charger(); //charger depense
  }
//au chargmeent de la page
  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.depenseService.listerMesDepenses().subscribe({ //liste depense
      next: (liste) => {
        this.depenses.set(liste);
        this.etat.chargement.set(false);
        this.verifierDepassementBudget(liste);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger vos dépenses.");
        this.etat.chargement.set(false);
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
      this.alerteDepassementVisible.set(true); //genere alerte
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