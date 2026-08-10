import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produit_Service } from '../produitService';
import { ProduitRequest } from '../produit.model';
import { CategorieDepartService, CategorieDepart } from '../../departements/Admin/categorie-departement';
import { CategorieDepenseService, CategorieDepense } from '../../depenses/responsable-financier/categorie-depense';
import { Modal } from '../../shared/modal/modal';
import { take } from 'rxjs';

interface ProduitOdoo {
  id: number;
  name: string;
  list_price: number;
  categ_id: [number, string] | false;
  x_categorie_depense?: string;
}

const FORMULAIRE_VIDE: ProduitRequest = { nom: '', prix: 0, categorie: '', description: '', categorieDepense: '' };

@Component({
  selector: 'app-gestion-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './gestion-produits.html',
  styleUrl: './gestion-produits.css'
})
export class GestionProduits implements OnInit {

  categories = signal<CategorieDepart[]>([]);
  categoriesDepense = signal<CategorieDepense[]>([]);
  produits = signal<ProduitOdoo[]>([]);
  chargementListe = signal(true);
  rechercheTerme = signal('');

  messageSucces = signal('');
  erreur = signal('');
  enregistrementEnCours = signal(false);

  modalCreationOuvert = signal(false);
  formulaire: ProduitRequest = { ...FORMULAIRE_VIDE };

  modalEditionOuvert = signal(false);
  produitEnEdition: ProduitOdoo | null = null;
  formulaireEdition: ProduitRequest = { ...FORMULAIRE_VIDE };

  produitASupprimer = signal<ProduitOdoo | null>(null);
  suppressionEnCours = signal(false);

  constructor(
    private produitService: Produit_Service,
    private categorieDepartService: CategorieDepartService,
    private categorieDepenseService: CategorieDepenseService
  ) {}

  ngOnInit(): void {
    this.categorieDepartService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => this.categories.set(liste),
      error: () => this.erreur.set('Impossible de charger les catégories département.')
    });

    this.categorieDepenseService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => this.categoriesDepense.set(liste),
      error: () => this.erreur.set('Impossible de charger les catégories dépense.')
    });

    this.chargerProduits();
  }

  chargerProduits(): void {
    this.chargementListe.set(true);
    this.produitService.listerTousProduits().pipe(take(1)).subscribe({
      next: (liste) => {
        this.produits.set(liste);
        this.chargementListe.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger la liste des produits.');
        this.chargementListe.set(false);
      }
    });
  }

  produitsFiltres(): ProduitOdoo[] {
    const terme = this.rechercheTerme().toLowerCase().trim();
    if (!terme) return this.produits();
    return this.produits().filter(p =>
      p.name.toLowerCase().includes(terme) ||
      this.nomCategorieProduit(p).toLowerCase().includes(terme)
    );
  }

  nomCategorieProduit(p: ProduitOdoo): string {
    return p.categ_id && p.categ_id[1] ? p.categ_id[1] : 'Non défini';
  }

  initiales(p: ProduitOdoo): string {
    return p.name?.trim().charAt(0).toUpperCase() || '?';
  }

  // --- Creation ---

  ouvrirCreation(): void {
    this.formulaire = { ...FORMULAIRE_VIDE };
    this.erreur.set('');
    this.modalCreationOuvert.set(true);
  }

  fermerCreation(): void {
    this.modalCreationOuvert.set(false);
  }

  creerProduit(): void {
    if (!this.formulaire.nom || !this.formulaire.prix || !this.formulaire.categorie) {
      this.erreur.set('Nom, prix et catégorie sont obligatoires.');
      return;
    }

    this.erreur.set('');
    this.enregistrementEnCours.set(true);

    this.produitService.creerProduit(this.formulaire).subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.messageSucces.set(`Produit "${this.formulaire.nom}" créé avec succès dans Odoo.`);
        this.modalCreationOuvert.set(false);
        this.chargerProduits();
      },
      error: (err) => {
        this.enregistrementEnCours.set(false);
        this.erreur.set(err.error?.message || "La création du produit a échoué.");
      }
    });
  }

  // --- Edition ---

  ouvrirEdition(p: ProduitOdoo): void {
    this.produitEnEdition = p;
    this.formulaireEdition = {
      nom: p.name,
      prix: p.list_price,
      categorie: this.nomCategorieProduit(p),
      description: '',
      categorieDepense: p.x_categorie_depense || ''
    };
    this.erreur.set('');
    this.modalEditionOuvert.set(true);
  }

  fermerEdition(): void {
    this.modalEditionOuvert.set(false);
    this.produitEnEdition = null;
  }

  enregistrerModification(): void {
    if (!this.produitEnEdition) return;

    this.enregistrementEnCours.set(true);
    this.produitService.modifierProduit(this.produitEnEdition.id, this.formulaireEdition).subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.messageSucces.set('Produit modifié avec succès.');
        this.fermerEdition();
        this.chargerProduits();
      },
      error: (err) => {
        this.enregistrementEnCours.set(false);
        this.erreur.set(err.error?.message || "La modification a échoué.");
      }
    });
  }

  // --- Archivage ---

  demanderArchivage(p: ProduitOdoo): void {
    this.produitASupprimer.set(p);
  }

  annulerArchivage(): void {
    this.produitASupprimer.set(null);
  }

  confirmerArchivage(): void {
    const p = this.produitASupprimer();
    if (!p) return;

    this.suppressionEnCours.set(true);
    this.produitService.archiverProduit(p.id).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.messageSucces.set(`Produit "${p.name}" archivé.`);
        this.produitASupprimer.set(null);
        this.chargerProduits();
      },
      error: (err) => {
        this.suppressionEnCours.set(false);
        this.erreur.set(err.error?.message || "L'archivage a échoué.");
      }
    });
  }
}