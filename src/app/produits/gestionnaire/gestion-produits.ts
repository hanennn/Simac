import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produit_Service } from '../produitService';
import { ProduitRequest } from '../produit.model';
import { CategorieDepartService, CategorieDepart } from '../../departements/Admin/categorie-departement';
import { CategorieDepenseService, CategorieDepense } from '../../depenses/responsable-financier/categorie-depense';
import { Modal } from '../../shared/modal/modal';
import { ToastService } from '../../shared/toast.service';
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

  private toast = inject(ToastService);

  categories = signal<CategorieDepart[]>([]);
  categoriesDepense = signal<CategorieDepense[]>([]);
  produits = signal<ProduitOdoo[]>([]);
  chargementListe = signal(true);
  rechercheTerme = signal('');

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
      error: () => this.toast.erreur('Impossible de charger les catégories département.')
    });

    this.categorieDepenseService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => this.categoriesDepense.set(liste),
      error: () => this.toast.erreur('Impossible de charger les catégories dépense.')
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
        this.toast.erreur('Impossible de charger la liste des produits.');
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

  ouvrirCreation(): void {
    this.formulaire = { ...FORMULAIRE_VIDE };
    this.modalCreationOuvert.set(true);
  }

  fermerCreation(): void {
    this.modalCreationOuvert.set(false);
  }

  creerProduit(): void {
    if (!this.formulaire.nom || !this.formulaire.prix || !this.formulaire.categorie) {
      this.toast.erreur('Nom, prix et catégorie sont obligatoires.');
      return;
    }

    this.enregistrementEnCours.set(true);

    this.produitService.creerProduit(this.formulaire).pipe(take(1)).subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.toast.succes(`Produit "${this.formulaire.nom}" créé avec succès dans Odoo.`);
        this.modalCreationOuvert.set(false);
        this.chargerProduits();
      },
      error: (err) => {
        this.enregistrementEnCours.set(false);
        this.toast.erreur(err.error?.message || "La création du produit a échoué.");
      }
    });
  }

  ouvrirEdition(p: ProduitOdoo): void {
    this.produitEnEdition = p;
    this.formulaireEdition = {
      nom: p.name,
      prix: p.list_price,
      categorie: this.nomCategorieProduit(p),
      description: '',
      categorieDepense: p.x_categorie_depense || ''
    };
    this.modalEditionOuvert.set(true);
  }

  fermerEdition(): void {
    this.modalEditionOuvert.set(false);
    this.produitEnEdition = null;
  }

  enregistrerModification(): void {
    if (!this.produitEnEdition) return;

    this.enregistrementEnCours.set(true);
    this.produitService.modifierProduit(this.produitEnEdition.id, this.formulaireEdition).pipe(take(1)).subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.toast.succes('Produit modifié avec succès.');
        this.fermerEdition();
        this.chargerProduits();
      },
      error: (err) => {
        this.enregistrementEnCours.set(false);
        this.toast.erreur(err.error?.message || "La modification a échoué.");
      }
    });
  }

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
    this.produitService.archiverProduit(p.id).pipe(take(1)).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.toast.succes(`Produit "${p.name}" archivé.`);
        this.produitASupprimer.set(null);
        this.chargerProduits();
      },
      error: (err) => {
        this.suppressionEnCours.set(false);
        this.toast.erreur(err.error?.message || "L'archivage a échoué.");
      }
    });
  }

  vueArchives = signal(false);
  produitsArchives = signal<ProduitOdoo[]>([]);
  chargementArchives = signal(false);

  basculerVue(): void {
    this.vueArchives.set(!this.vueArchives());
    if (this.vueArchives() && this.produitsArchives().length === 0) {
      this.chargerProduitsArchives();
    }
  }

  chargerProduitsArchives(): void {
    this.chargementArchives.set(true);
    this.produitService.listerProduitsArchives().pipe(take(1)).subscribe({
      next: (liste) => {
        this.produitsArchives.set(liste);
        this.chargementArchives.set(false);
      },
      error: () => {
        this.toast.erreur('Impossible de charger les produits archivés.');
        this.chargementArchives.set(false);
      }
    });
  }

  restaurerProduit(p: ProduitOdoo): void {
    this.produitService.restaurerProduit(p.id).pipe(take(1)).subscribe({
      next: () => {
        this.toast.succes(`Produit "${p.name}" restauré.`);
        this.produitsArchives.set(this.produitsArchives().filter(pr => pr.id !== p.id));
        this.chargerProduits();
      },
      error: (err) => {
        this.toast.erreur(err.error?.message || "La restauration a échoué.");
      }
    });
  }
}