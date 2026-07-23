import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive} from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Auth } from '../services/auth';
import { Departement } from '../services/departement';
import { Budget } from '../services/budget';
import { UtilisateurAdmin } from '../services/utilisateur-admin';
import { Depense } from '../services/depense';
import { Theme } from '../services/theme';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  utilisateur = signal<any>(null);
  chargementStats = signal(true);

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  stats = signal({
    departements: 0,
    utilisateurs: 0,
    budgetTotal: 0,
    depensesEnAttente: 0
  });

  constructor(
    private authService: Auth,
    private router: Router,
    private departementService: Departement,
    private budgetService: Budget,
    private utilisateurAdminService: UtilisateurAdmin,
    private depenseService: Depense,
    private themeService: Theme
  ) {}

  get sombre() {
    return this.themeService.sombre;
  }

  basculerTheme(): void {
    console.log('clic détecté, valeur avant:', this.themeService.sombre());
  this.themeService.basculer();
  console.log('valeur après:', this.themeService.sombre());
  }

  ngOnInit(): void {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/login']);
      return;
    }
    this.utilisateur.set(this.authService.recupererUtilisateur());
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    const role = this.utilisateur()?.role;

    if (role === 'ADMIN') {
      forkJoin({
        departements: this.departementService.listerTous(),
        utilisateurs: this.utilisateurAdminService.listerTous(),
        budgets: this.budgetService.listerTous()
      }).subscribe({
        next: (res) => {
          const budgetTotal = res.budgets.reduce((somme, b) => somme + b.montantAlloueBud, 0);
          this.stats.set({
            departements: res.departements.length,
            utilisateurs: res.utilisateurs.length,
            budgetTotal: budgetTotal,
            depensesEnAttente: 0
          });
          this.chargementStats.set(false);
        },
        error: () => this.chargementStats.set(false)
      });
    } else if (role === 'RESPONSABLE_FINANCIER') {
      forkJoin({
        budgets: this.budgetService.listerTous(),
        depenses: this.depenseService.listerTous()
      }).subscribe({
        next: (res) => {
          const budgetTotal = res.budgets.reduce((somme, b) => somme + b.montantAlloueBud, 0);
          const enAttente = res.depenses.filter((d: any) => d.statutDepense === 'EN_ATTENTE').length;
          this.stats.set({
            departements: 0,
            utilisateurs: 0,
            budgetTotal: budgetTotal,
            depensesEnAttente: enAttente
          });
          this.chargementStats.set(false);
        },
        error: () => this.chargementStats.set(false)
      });
    } else if (role === 'CHEF_DEPARTEMENT') {
      this.depenseService.listerMesDepenses().subscribe({
        next: (depenses) => {
          const enAttente = depenses.filter((d: any) => d.statutDepense === 'EN_ATTENTE').length;
          this.stats.set({
            departements: 0,
            utilisateurs: 0,
            budgetTotal: 0,
            depensesEnAttente: enAttente
          });
          this.chargementStats.set(false);
        },
        error: () => this.chargementStats.set(false)
      });
    } else {
      this.chargementStats.set(false);
    }
  }

  seDeconnecter(): void {
    this.authService.deconnexion();
    this.router.navigate(['/login']);
  }

  getInitiales(): string {
    const u = this.utilisateur();
    if (!u) return '';
    return (u.prenom?.[0] || '') + (u.nom?.[0] || '');
  }

  formatRole(): string {
    const roles: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'RESPONSABLE_FINANCIER': 'Responsable financier',
      'CHEF_DEPARTEMENT': 'Chef de département'
    };
    return roles[this.utilisateur()?.role] || '';
  }

  getRoleClass(): string {
    const classes: Record<string, string> = {
      'ADMIN': 'role-admin',
      'RESPONSABLE_FINANCIER': 'role-finance',
      'CHEF_DEPARTEMENT': 'role-chef'
    };
    return classes[this.utilisateur()?.role] || '';
  }

}