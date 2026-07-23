import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Departement as DepartementService } from '../services/departement';
import { Departement as DepartementModel, DepartementRequest, CATEGORIES_DEPARTEMENT } from '../services/departement.model';

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './departements.html',
  styleUrl: './departements.css'
})
export class Departements implements OnInit {


  departements = signal<DepartementModel[]>([]);

  //recherche 
  rechercheTerme = signal(''); //stock ce qui est tapé

  departementsFiltres = computed(() => {
  const terme = this.rechercheTerme().toLowerCase().trim(); 
  if (!terme) return this.departements(); //liste tout
  return this.departements().filter(d =>
    d.nomDepart.toLowerCase().includes(terme) ||
    d.categorieDepart.toLowerCase().includes(terme) ||
    (d.descDepart || '').toLowerCase().includes(terme)
  );
});


  chargement = signal(true);
  erreur = signal<string | null>(null);

  categories = CATEGORIES_DEPARTEMENT;

  modalOuvert = signal(false);
  modeEdition = signal(false);
  enregistrementEnCours = signal(false);
  formulaire: DepartementRequest = { nomDepart: '', descDepart: '', categorieDepart: '' };
  idEnCoursDeModification: number | null = null;

  departementASupprimer = signal<DepartementModel | null>(null);
  suppressionEnCours = signal(false);

  constructor(private departementService: DepartementService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.departementService.listerTous().subscribe({
      next: (liste) => {
        this.departements.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les départements.");
        this.chargement.set(false);
      }
    });
  }

  ouvrirCreation(): void {
    this.modeEdition.set(false);
    this.idEnCoursDeModification = null;
    this.formulaire = { nomDepart: '', descDepart: '', categorieDepart: '' };
    this.modalOuvert.set(true);
  }

  ouvrirModification(dept: DepartementModel): void {
    this.modeEdition.set(true);
    this.idEnCoursDeModification = dept.idDepart;
    this.formulaire = {
      nomDepart: dept.nomDepart,
      descDepart: dept.descDepart,
      categorieDepart: dept.categorieDepart
    };
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
  }

  enregistrer(): void {
    if (!this.formulaire.nomDepart || !this.formulaire.categorieDepart) {
      this.erreur.set('Le nom et la catégorie sont obligatoires.');
      return;
    }

    this.enregistrementEnCours.set(true);

    const operation = this.modeEdition() && this.idEnCoursDeModification !== null
      ? this.departementService.modifier(this.idEnCoursDeModification, this.formulaire)
      : this.departementService.creer(this.formulaire);

    operation.subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.modalOuvert.set(false);
        this.charger();
      },
      error: () => {
        this.enregistrementEnCours.set(false);
        this.erreur.set("L'enregistrement a échoué. Vérifie les champs et réessaie.");
      }
    });
  }

  demanderSuppression(dept: DepartementModel): void {
    this.departementASupprimer.set(dept);
  }

  annulerSuppression(): void {
    this.departementASupprimer.set(null);
  }

  confirmerSuppression(): void {
    const dept = this.departementASupprimer();
    if (!dept) { return; }

    this.suppressionEnCours.set(true);
    this.departementService.supprimer(dept.idDepart).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.departementASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.erreur.set("La suppression a échoué.");
      }
    });
  }
}