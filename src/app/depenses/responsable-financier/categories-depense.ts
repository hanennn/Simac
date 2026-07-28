import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieDepenseService, CategorieDepense, CategorieRequest } from './categorie-depense';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-categories-depense',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './categories-depense.html',
  styleUrl: './categories-depense.css'
})
export class CategoriesDepense implements OnInit {

  categories = signal<CategorieDepense[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);

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
    this.chargement.set(true);
    this.erreur.set(null);
    this.categorieService.listerTous().subscribe({
      next: (liste: CategorieDepense[]) => {
        this.categories.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les catégories.");
        this.chargement.set(false);
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
      this.erreur.set('Le nom est obligatoire.');
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
        this.erreur.set("L'enregistrement a échoué.");
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
    this.categorieService.supprimer(cat.idCategorie).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.categorieASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.erreur.set("La suppression a échoué (probablement utilisée par une dépense).");
      }
    });
  }
}