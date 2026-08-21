import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departement as DepartementService } from './departement';
import { Departement as DepartementModel, DepartementRequest } from './departement.model';
import { CategorieDepartService, CategorieDepart } from './categorie-departement';
import { UtilisateurAdmin as UtilisateurAdminService } from '../../utilisateurs/Admin/utilisateur-admin';
import { Utilisateur as UtilisateurModel } from '../../utilisateurs/Admin/utilisateur-admin.model';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { take, takeUntil } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';


@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departements.html',
  styleUrl: './departements.css'
})
export class Departements implements OnInit {

  departements = signal<DepartementModel[]>([]);
  categories = signal<CategorieDepart[]>([]);
  departementOuvert = signal<number | null>(null);

  // --- Chargement a la demande : une Map departementId -> liste d'utilisateurs ---
  usersParDepartement = signal<Map<number, UtilisateurModel[]>>(new Map());
  departementsEnChargement = signal<Set<number>>(new Set());

  rechercheTerme = signal('');
  departementsFiltres = computed(() => {
    const terme = this.rechercheTerme().toLowerCase().trim();
    if (!terme) return this.departements();
    return this.departements().filter(d =>
      d.nomDepart.toLowerCase().includes(terme) ||
      d.categorieDepart.nomCategorie.toLowerCase().includes(terme) ||
      (d.descDepart || '').toLowerCase().includes(terme)
    );
  });

  etat = creerEtatChargement();

  modalOuvert = signal(false);
  modeEdition = signal(false);
  enregistrementEnCours = signal(false);
  formulaire: DepartementRequest = { nomDepart: '', descDepart: '', categorieId: 0 };
  idEnCoursDeModification: number | null = null;

  departementASupprimer = signal<DepartementModel | null>(null);
  suppressionEnCours = signal(false);

  constructor(
    private departementService: DepartementService,
    private utilisateurAdminService: UtilisateurAdminService,
    private categorieDepartService: CategorieDepartService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.categorieDepartService.listerTous().pipe(take(1)).subscribe({
      next: (liste: CategorieDepart[]) => this.categories.set(liste),
      error: () => {}
    });
  }

  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.departementService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => {
        this.departements.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger les départements.");
        this.etat.chargement.set(false);
      }
    });
  }

  utilisateursDuDepartement(idDepart: number): UtilisateurModel[] {
    return this.usersParDepartement().get(idDepart) || [];
  }

  chargementUtilisateursDe(idDepart: number): boolean {
    return this.departementsEnChargement().has(idDepart);
  }

  // --- Ouverture/fermeture avec chargement a la demande ---
  toggleDepartement(idDepart: number): void {
    const dejaOuvert = this.departementOuvert() === idDepart;
    this.departementOuvert.set(dejaOuvert ? null : idDepart);

    if (!dejaOuvert && !this.usersParDepartement().has(idDepart)) {
      this.chargerUtilisateursDuDepartement(idDepart);
    }
  }

  private chargerUtilisateursDuDepartement(idDepart: number): void {
    const enChargement = new Set(this.departementsEnChargement());
    enChargement.add(idDepart);
    this.departementsEnChargement.set(enChargement);

    this.utilisateurAdminService.listerParDepartement(idDepart).pipe(take(1)).subscribe({
      next: (liste) => {
        const map = new Map(this.usersParDepartement());
        map.set(idDepart, liste);
        this.usersParDepartement.set(map);

        const enChargementApres = new Set(this.departementsEnChargement());
        enChargementApres.delete(idDepart);
        this.departementsEnChargement.set(enChargementApres);
      },
      error: () => {
        const enChargementApres = new Set(this.departementsEnChargement());
        enChargementApres.delete(idDepart);
        this.departementsEnChargement.set(enChargementApres);
        this.etat.erreur.set("Impossible de charger les utilisateurs de ce département.");
      }
    });
  }

  ouvrirCreation(): void {
    this.modeEdition.set(false);
    this.idEnCoursDeModification = null;
    this.formulaire = { nomDepart: '', descDepart: '', categorieId: 0 };
    this.modalOuvert.set(true);
  }

  ouvrirModification(dept: DepartementModel): void {
    this.modeEdition.set(true);
    this.idEnCoursDeModification = dept.idDepart;
    this.formulaire = {
      nomDepart: dept.nomDepart,
      descDepart: dept.descDepart,
      categorieId: dept.categorieDepart.idCategorie
    };
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
  }

  enregistrer(): void {
    if (!this.formulaire.nomDepart || !this.formulaire.categorieId) {
      this.etat.erreur.set('Le nom et la catégorie sont obligatoires.');
      return;
    }

    this.enregistrementEnCours.set(true);

    const operation = this.modeEdition() && this.idEnCoursDeModification !== null
      ? this.departementService.modifier(this.idEnCoursDeModification, this.formulaire)
      : this.departementService.creer(this.formulaire);

    operation.pipe(take(1)).subscribe({
      next: () => {
        this.enregistrementEnCours.set(false);
        this.modalOuvert.set(false);
        this.charger();
      },
      error: () => {
        this.enregistrementEnCours.set(false);
        this.etat.erreur.set("L'enregistrement a échoué. Vérifie les champs et réessaie.");
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
    this.departementService.supprimer(dept.idDepart).pipe(take(1)).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.departementASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.etat.erreur.set("La suppression a échoué.");
      }
    });
  }
}