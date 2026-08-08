import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieDepenseService, CategorieDepense, CategorieRequest } from './categorie-depense';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { take, takeUntil } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';

@Component({
  selector: 'app-categories-depense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-depense.html',
  styleUrl: './categories-depense.css'
})
export class CategoriesDepense implements OnInit {

  categories = signal<CategorieDepense[]>([]);
  etat = creerEtatChargement();

  modalOuvert = signal(false);
  modeEdition = signal(false);
  enregistrementEnCours = signal(false);
  formulaire: CategorieRequest = { nomCategorie: '' };
  idEnCoursDeModification: number | null = null;

  categorieASupprimer = signal<CategorieDepense | null>(null);
  suppressionEnCours = signal(false);

  constructor(private categorieService: CategorieDepenseService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.categorieService.listerTous().pipe(take(1)).subscribe({
      next: (liste: CategorieDepense[]) => {
        this.categories.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger les catégories.");
        this.etat.chargement.set(false);
      }
    });
  }

  ouvrirCreation(): void {
    this.modeEdition.set(false);
    this.idEnCoursDeModification = null;
    this.formulaire = { nomCategorie: '' };
    this.modalOuvert.set(true);
  }

  ouvrirModification(cat: CategorieDepense): void {
    this.modeEdition.set(true);
    this.idEnCoursDeModification = cat.idCategorie;
    this.formulaire = { nomCategorie: cat.nomCategorie };
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
  }

  enregistrer(): void {
    if (!this.formulaire.nomCategorie) {
      this.etat.erreur.set('Le nom est obligatoire.');
      return;
    }

    this.enregistrementEnCours.set(true);

    const operation = this.modeEdition() && this.idEnCoursDeModification !== null
      ? this.categorieService.modifier(this.idEnCoursDeModification, this.formulaire)
      : this.categorieService.creer(this.formulaire);

    operation.subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.modalOuvert.set(false);
        this.charger();
      },
      error: () => {
        this.enregistrementEnCours.set(false);
        this.etat.erreur.set("L'enregistrement a échoué.");
      }
    });
  }

  demanderSuppression(cat: CategorieDepense): void {
    this.categorieASupprimer.set(cat);
  }

  annulerSuppression(): void {
    this.categorieASupprimer.set(null);
  }

  confirmerSuppression(): void {
    const cat = this.categorieASupprimer();
    if (!cat) { return; }

    this.suppressionEnCours.set(true);
    this.categorieService.supprimer(cat.idCategorie).pipe(take(1)).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.categorieASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.etat.erreur.set("La suppression a échoué (probablement utilisée par une dépense).");
      }
    });
  }
}