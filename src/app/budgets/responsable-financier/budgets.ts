import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Budget as BudgetService } from '../budget';
import { Budget as BudgetModel, BudgetRequest } from '../budget.model';
import { Departement as DepartementService } from '../../departements/Admin/departement';
import { Departement as DepartementModel } from '../../departements/Admin/departement.model';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
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

  chargement = signal(true);
  erreur = signal<string | null>(null);

  modalOuvert = signal(false);
  modeEdition = signal(false);
  enregistrementEnCours = signal(false);
  formulaire: BudgetRequest = { montantAlloueBud: 0, dateDebutBud: '', dateFinBud: '', departementId: 0 };
  idEnCoursDeModification: number | null = null;

  budgetASupprimer = signal<BudgetModel | null>(null);
  suppressionEnCours = signal(false);

  constructor(
    private budgetService: BudgetService,
    private departementService: DepartementService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.departementService.listerTous().subscribe({
      next: (liste) => this.departements.set(liste),
      error: () => {}
    });
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.budgetService.listerTous().subscribe({
      next: (liste) => {
        this.budgets.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les budgets.");
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
      this.erreur.set('Tous les champs sont obligatoires.');
      return;
    }

    this.enregistrementEnCours.set(true);

    const operation = this.modeEdition() && this.idEnCoursDeModification !== null
      ? this.budgetService.modifier(this.idEnCoursDeModification, this.formulaire)
      : this.budgetService.creer(this.formulaire);

    operation.subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.modalOuvert.set(false);
        this.charger();
      },
      error: () => {
        this.enregistrementEnCours.set(false);
        this.erreur.set("L'enregistrement a échoué. Vérifie les champs.");
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
    this.budgetService.supprimer(b.idBud).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.budgetASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.erreur.set("La suppression a échoué.");
      }
    });
  }
}