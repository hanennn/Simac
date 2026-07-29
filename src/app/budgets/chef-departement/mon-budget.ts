import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget as BudgetService } from '../budget';
import { Budget as BudgetModel } from '../budget.model';
import { Auth } from '../../auth/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-mon-budget',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './mon-budget.html',
  styleUrl: './mon-budget.css'
})
export class MonBudget implements OnInit {

  budgets = signal<BudgetModel[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

  constructor(
    private budgetService: BudgetService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    const utilisateur = this.authService.recupererUtilisateur();
    const departementId = utilisateur?.departementId;

    if (!departementId) {
      this.erreur.set("Aucun département associé à votre compte.");
      this.chargement.set(false);
      return;
    }

    this.budgetService.listerParDepartement(departementId).subscribe({
      next: (liste) => {
        this.budgets.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger le budget.");
        this.chargement.set(false);
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