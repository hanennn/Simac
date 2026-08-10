import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget as BudgetService } from '../budget';
import { Budget as BudgetModel } from '../budget.model';
import { Auth } from '../../auth/authService';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { take, takeUntil } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';

@Component({
  selector: 'app-mon-budget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mon-budget.html',
  styleUrl: './mon-budget.css'
})
export class MonBudget implements OnInit {

  budgets = signal<BudgetModel[]>([]);
  etat = creerEtatChargement();

  constructor(
    private budgetService: BudgetService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    const utilisateur = this.authService.recupererUtilisateur();//récupère l'utilisateur connecté
    const departementId = utilisateur?.departementId; //extrait depart

    if (!departementId) { 
      this.etat.erreur.set("Aucun département associé à votre compte.");
      this.etat.chargement.set(false);
      return;
    }

    this.budgetService.listerParDepartement(departementId).pipe(take(1)).subscribe({ //liste budget
      next: (liste) => {
        this.budgets.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger le budget.");
        this.etat.chargement.set(false);
      }
    });
  }

  soldeRestant(b: BudgetModel): number {
    return b.montantAlloueBud - b.montantConsommeBud;
  }

  estDepasse(b: BudgetModel): boolean {
    return b.montantConsommeBud > b.montantAlloueBud;
  }

  tauxConsommation(b: BudgetModel): number {
    if (b.montantAlloueBud === 0) return 0;
    return Math.min(100, Math.round((b.montantConsommeBud / b.montantAlloueBud) * 100));
  }
}