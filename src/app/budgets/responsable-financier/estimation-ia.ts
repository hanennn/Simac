import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Budget } from '../budget';
import { EstimationBudgetResponse } from '../budget.model';
import { creerEtatChargement } from '../../shared/etat-chargement';

interface Departement {
  idDepart: number;
  nomDepart: string;
}

@Component({
  selector: 'app-estimation-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estimation-ia.html',
  styleUrl: './estimation-ia.css'
})
export class EstimationIa {
  private readonly departementsUrl = 'http://localhost:8081/api/departements/';

  departements = signal<Departement[]>([]);
  departementSelectionne: number | null = null;

  resultat = signal<EstimationBudgetResponse | null>(null);
  etat = creerEtatChargement(false);

  constructor(private http: HttpClient, private budgetService: Budget) {
    this.http.get<Departement[]>(this.departementsUrl).subscribe({
      next: (deps) => this.departements.set(deps),
      error: () => this.etat.erreur.set('Impossible de charger la liste des départements.')
    });
  }

  estimer(): void {
    if (!this.departementSelectionne) {
      this.etat.erreur.set('Sélectionne un département.');
      return;
    }

    this.etat.erreur.set('');
    this.resultat.set(null);
    this.etat.chargement.set(true);

    this.budgetService.estimerBudget(this.departementSelectionne).subscribe({
      next: (res) => {
        this.etat.chargement.set(false);
        this.resultat.set(res);
      },
      error: (err) => {
        this.etat.chargement.set(false);
        this.etat.erreur.set(err.error?.message || "Erreur lors de l'estimation. Vérifie qu'Ollama tourne bien.");
      }
    });
  }
}