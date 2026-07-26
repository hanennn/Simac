import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurAdmin as UtilisateurAdminService } from '../../utilisateurs/Admin/utilisateur-admin';
import { Utilisateur as UtilisateurModel, UtilisateurRequest, ROLES_UTILISATEUR } from './utilisateur-admin.model';
import { Departement as DepartementService } from '../../departements/Admin/departement';
import { Departement as DepartementModel } from '../../departements/Admin/departement.model';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.css'
})
export class Utilisateurs implements OnInit {

  utilisateurs = signal<UtilisateurModel[]>([]);
  rechercheTerme = signal('');

  utilisateursFiltres = computed(() => {
    const terme = this.rechercheTerme().toLowerCase().trim();
    if (!terme) return this.utilisateurs();
    return this.utilisateurs().filter(u =>
      u.nomUser.toLowerCase().includes(terme) ||
      u.prenomUser.toLowerCase().includes(terme) ||
      u.email.toLowerCase().includes(terme) ||
      this.formatRole(u.role).toLowerCase().includes(terme)
    );
  });

  chargement = signal(true);
  erreur = signal<string | null>(null);

  departements = signal<DepartementModel[]>([]);
  roles = ROLES_UTILISATEUR;

  modalOuvert = signal(false);
  modeEdition = signal(false);
  idEnCoursDeModification: number | null = null;
  enregistrementEnCours = signal(false);
  formulaire: UtilisateurRequest = { nomUser: '', prenomUser: '', email: '', role: '', departementId: null };

  utilisateurASupprimer = signal<UtilisateurModel | null>(null);
  suppressionEnCours = signal(false);

  constructor(
    private utilisateurAdminService: UtilisateurAdminService,
    private departementService: DepartementService
  ) {}

  ngOnInit(): void {
    this.charger();
    this.departementService.listerTous().subscribe({
      next: (liste: DepartementModel[]) => this.departements.set(liste),
      error: () => {}
    });
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.utilisateurAdminService.listerTous().subscribe({
      next: (liste) => {
        this.utilisateurs.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les utilisateurs.");
        this.chargement.set(false);
      }
    });
  }

  ouvrirCreation(): void {
    this.modeEdition.set(false);
    this.idEnCoursDeModification = null;
    this.formulaire = { nomUser: '', prenomUser: '', email: '', role: '', departementId: null };
    this.modalOuvert.set(true);
  }

  ouvrirModification(u: UtilisateurModel): void {
    this.modeEdition.set(true);
    this.idEnCoursDeModification = u.idUser;
    this.formulaire = {
      nomUser: u.nomUser,
      prenomUser: u.prenomUser,
      email: u.email,
      role: u.role,
      departementId: u.departement ? u.departement.idDepart : null
    };
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
  }

  enregistrer(): void {
    if (!this.formulaire.nomUser || !this.formulaire.prenomUser || !this.formulaire.email || !this.formulaire.role) {
      this.erreur.set('Nom, prénom, email et rôle sont obligatoires.');
      return;
    }

    this.enregistrementEnCours.set(true);

    const operation = this.modeEdition() && this.idEnCoursDeModification !== null
      ? this.utilisateurAdminService.modifier(this.idEnCoursDeModification, this.formulaire)
      : this.utilisateurAdminService.creer(this.formulaire);

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

  demanderSuppression(u: UtilisateurModel): void {
    this.utilisateurASupprimer.set(u);
  }

  annulerSuppression(): void {
    this.utilisateurASupprimer.set(null);
  }

  confirmerSuppression(): void {
    const u = this.utilisateurASupprimer();
    if (!u) { return; }

    this.suppressionEnCours.set(true);
    this.utilisateurAdminService.supprimer(u.idUser).subscribe({
      next: () => {
        this.suppressionEnCours.set(false);
        this.utilisateurASupprimer.set(null);
        this.charger();
      },
      error: () => {
        this.suppressionEnCours.set(false);
        this.erreur.set("La suppression a échoué.");
      }
    });
  }

  formatRole(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'CHEF_DEPARTEMENT': 'Chef de département',
      'RESPONSABLE_FINANCIER': 'Responsable financier'
    };
    return labels[role] || role;
  }

  getInitiales(u: UtilisateurModel): string {
    return (u.prenomUser?.[0] || '') + (u.nomUser?.[0] || '');
  }
}