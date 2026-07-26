import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departement as DepartementService } from './departement';
import { Departement as DepartementModel, DepartementRequest, CATEGORIES_DEPARTEMENT } from './departement.model';
import { UtilisateurAdmin as UtilisateurAdminService } from '../../utilisateurs/Admin/utilisateur-admin';
import { Utilisateur as UtilisateurModel } from '../../utilisateurs/Admin/utilisateur-admin.model';
import { Sidebar } from '../../shared/sidebar/sidebar';
@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './departements.html',
  styleUrl: './departements.css'
})
export class Departements implements OnInit {

  departements = signal<DepartementModel[]>([]);
  utilisateurs = signal<UtilisateurModel[]>([]);
  departementOuvert = signal<number | null>(null);

  rechercheTerme = signal('');

  departementsFiltres = computed(() => {
    const terme = this.rechercheTerme().toLowerCase().trim();
    if (!terme) return this.departements();
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

  constructor(
    private departementService: DepartementService,
    private utilisateurAdminService: UtilisateurAdminService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.utilisateurAdminService.listerTous().subscribe({
      next: (liste) => this.utilisateurs.set(liste),
      error: () => {} // pas bloquant si ça échoue, le reste de la page fonctionne
    });
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

  utilisateursDuDepartement(idDepart: number): UtilisateurModel[] {
    return this.utilisateurs().filter(u => u.departement && u.departement.idDepart === idDepart);
  }

  toggleDepartement(idDepart: number): void {
    this.departementOuvert.set(this.departementOuvert() === idDepart ? null : idDepart);
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