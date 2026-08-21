import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Budget as BudgetService } from '../budget';
import { Budget as BudgetModel, BudgetRequest, PredictionDepassementResponse } from '../budget.model';
import { Departement as DepartementService } from '../../departements/Admin/departement';
import { Departement as DepartementModel } from '../../departements/Admin/departement.model';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { take, takeUntil } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css'
})
export class Budgets implements OnInit {

  budgets = signal<BudgetModel[]>([]);
  departements = signal<DepartementModel[]>([]);

  rechercheTerme = signal('');
  budgetsFiltres = computed(() => {
    const terme = this.rechercheTerme().toLowerCase().trim();
    if (!terme) return this.budgets();
    return this.budgets().filter(b =>
      b.departement?.nomDepart?.toLowerCase().includes(terme)
    );
  });

  etat = creerEtatChargement();

  modalOuvert = signal(false);
  modeEdition = signal(false);
  enregistrementEnCours = signal(false);
  formulaire: BudgetRequest = { montantAlloueBud: 0, dateDebutBud: '', dateFinBud: '', departementId: 0 };
  idEnCoursDeModification: number | null = null;

  budgetASupprimer = signal<BudgetModel | null>(null);
  suppressionEnCours = signal(false);

  // --- Ajout pour la prediction de depassement (pop-up) ---
  budgetPredictionActif = signal<BudgetModel | null>(null);
  predictionResultat = signal<PredictionDepassementResponse | null>(null);
  predictionEnCours = signal(false);
  erreurPrediction = signal<string | null>(null);

  constructor(
    private budgetService: BudgetService,
    private departementService: DepartementService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.departementService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => this.departements.set(liste),
      error: () => {}
    });
  }

  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.budgetService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => {
        this.budgets.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger les budgets.");
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

  // --- Ajout pour la prediction de depassement (pop-up) ---
  estPeriodeEnCours(b: BudgetModel): boolean {
    const aujourdHui = new Date().toISOString().slice(0, 10);
    return b.dateDebutBud <= aujourdHui && aujourdHui <= b.dateFinBud;
  }

  verifierRisque(b: BudgetModel): void {
    this.budgetPredictionActif.set(b);
    this.predictionResultat.set(null);
    this.erreurPrediction.set(null);
    this.predictionEnCours.set(true);

    this.budgetService.predireDepassement(b.idBud).pipe(take(1)).subscribe({
      next: (res) => {
        this.predictionEnCours.set(false);
        this.predictionResultat.set(res);
      },
      error: (err) => {
        this.predictionEnCours.set(false);
        this.erreurPrediction.set(err.error?.message || "Impossible d'obtenir une prédiction pour ce budget.");
      }
    });
  }

  fermerPrediction(): void {
    this.budgetPredictionActif.set(null);
    this.predictionResultat.set(null);
    this.erreurPrediction.set(null);
  }

  ouvrirCreation(): void {
    this.modeEdition.set(false);
    this.idEnCoursDeModification = null;
    this.formulaire = { montantAlloueBud: 0, dateDebutBud: '', dateFinBud: '', departementId: 0 };
    this.modalOuvert.set(true);
  }

  ouvrirModification(b: BudgetModel): void {
    this.modeEdition.set(true);
    this.idEnCoursDeModification = b.idBud;
    this.formulaire = {
      montantAlloueBud: b.montantAlloueBud,
      dateDebutBud: b.dateDebutBud,
      dateFinBud: b.dateFinBud,
      departementId: b.departement.idDepart
    };
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
  }

  enregistrer(): void {
    if (!this.formulaire.montantAlloueBud || !this.formulaire.dateDebutBud || !this.formulaire.dateFinBud || !this.formulaire.departementId) {
      this.etat.erreur.set('Tous les champs sont obligatoires.');
      return;
    }

    this.enregistrementEnCours.set(true);

    const operation = this.modeEdition() && this.idEnCoursDeModification !== null
      ? this.budgetService.modifier(this.idEnCoursDeModification, this.formulaire)
      : this.budgetService.creer(this.formulaire);

    operation.pipe(take(1)).subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.modalOuvert.set(false);
        this.charger();
      },
      error: () => {
        this.enregistrementEnCours.set(false);
        this.etat.erreur.set("L'enregistrement a échoué. Vérifie les champs.");
      }
    });
  }

  demanderSuppression(b: BudgetModel): void {
    this.budgetASupprimer.set(b);
  }

  annulerSuppression(): void {
    this.budgetASupprimer.set(null);
  }

  confirmerSuppression(): void {
    const b = this.budgetASupprimer();
    if (!b) { return; }

    this.suppressionEnCours.set(true);
    this.budgetService.supprimer(b.idBud).pipe(take(1)).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.budgetASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.etat.erreur.set("La suppression a échoué.");
      }
    });
  }
}