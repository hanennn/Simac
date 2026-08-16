import { Component, OnInit, OnDestroy, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { Auth } from '../auth/authService';
import { Departement } from '../departements/Admin/departement';
import { Budget } from '../budgets/budget';
import { UtilisateurAdmin } from '../utilisateurs/Admin/utilisateur-admin';
import { Depense } from '../depenses/depense';
import { Theme } from '../services/theme';
import { take } from 'rxjs';
import { DashboardWebsocket } from './dashboard-websocket';
import { Sidebar } from '../shared/sidebar/sidebar';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  utilisateur = signal<any>(null);
  chargementStats = signal(true);

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  stats = signal({
    departements: 0,
    utilisateurs: 0,
    budgetTotal: 0,
    depensesEnAttente: 0
  });

  @ViewChild('graphiqueBudgets') graphiqueBudgetsRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('graphiqueConsommation') graphiqueConsommationRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('graphiqueStatuts') graphiqueStatutsRef?: ElementRef<HTMLCanvasElement>;

  private budgetsData: any[] = [];
  private depensesData: any[] = [];
  private vueGraphiquesPrete = false;
  private wsSubscription?: Subscription;

  constructor(
    private authService: Auth,
    private router: Router,
    private departementService: Departement,
    private budgetService: Budget,
    private utilisateurAdminService: UtilisateurAdmin,
    private depenseService: Depense,
    private themeService: Theme,
    private dashboardWs: DashboardWebsocket
  ) { }

  get sombre() {
    return this.themeService.sombre;
  }

  basculerTheme(): void {
    this.themeService.basculer();
  }

  ngOnInit(): void {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/login']);
      return;
    }
    this.utilisateur.set(this.authService.recupererUtilisateur());
    this.chargerStatistiques();

    if (this.utilisateur()?.role === 'RESPONSABLE_FINANCIER') {
      this.dashboardWs.connect();
      this.wsSubscription = this.dashboardWs.dashboard$.subscribe((message) => {
        if (message) {
          this.chargerStatistiques();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.vueGraphiquesPrete = true;
    this.tenterAfficherGraphiques();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.dashboardWs.disconnect();
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

          this.budgetsData = res.budgets;
          this.depensesData = res.depenses;

          this.chargementStats.set(false);
          this.tenterAfficherGraphiques();
        },
        error: () => this.chargementStats.set(false)
      });
    } else if (role === 'CHEF_DEPARTEMENT') {
      this.depenseService.listerMesDepenses().pipe(take(1)).subscribe({
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

  private tenterAfficherGraphiques(): void {
    if (!this.vueGraphiquesPrete) return;
    if (this.utilisateur()?.role !== 'RESPONSABLE_FINANCIER') return;
    if (this.budgetsData.length === 0 && this.depensesData.length === 0) return;

    setTimeout(() => {
      this.afficherGraphiqueBudgets();
      this.afficherGraphiqueConsommation();
      this.afficherGraphiqueStatuts();
    });
  }

  private afficherGraphiqueBudgets(): void {
    const canvas = this.graphiqueBudgetsRef?.nativeElement;
    if (!canvas || this.budgetsData.length === 0) return;

    const parDepartement = new Map<string, number>();
    for (const b of this.budgetsData) {
      const nom = b.departement?.nomDepart || 'Non defini';
      parDepartement.set(nom, (parDepartement.get(nom) || 0) + b.montantAlloueBud);
    }

    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: Array.from(parDepartement.keys()),
        datasets: [{
          data: Array.from(parDepartement.values()),
          backgroundColor: ['#1c3350', '#3a578a', '#85b7eb', '#ef9f27', '#c0392b', '#2e7d32']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Répartition des budgets par département' }
        }
      }
    });
  }

  private afficherGraphiqueConsommation(): void {
    const canvas = this.graphiqueConsommationRef?.nativeElement;
    if (!canvas || this.budgetsData.length === 0) return;

    const labels = this.budgetsData.map(b => b.departement?.nomDepart || 'Non defini');
    const taux = this.budgetsData.map(b =>
      b.montantAlloueBud > 0 ? Math.round((b.montantConsommeBud / b.montantAlloueBud) * 100) : 0
    );
    const couleurs = taux.map(t => t >= 100 ? '#c0392b' : t >= 60 ? '#d4a017' : '#2e7d32');

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Taux de consommation (%)',
          data: taux,
          backgroundColor: couleurs
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Taux de consommation par département' }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }

  private afficherGraphiqueStatuts(): void {
    const canvas = this.graphiqueStatutsRef?.nativeElement;
    if (!canvas || this.depensesData.length === 0) return;

    const enAttente = this.depensesData.filter((d: any) => d.statutDepense === 'EN_ATTENTE').length;
    const validees = this.depensesData.filter((d: any) => d.statutDepense === 'VALIDEE').length;
    const rejetees = this.depensesData.filter((d: any) => d.statutDepense === 'REJETEE').length;

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Validées', 'Rejetées'],
        datasets: [{
          data: [enAttente, validees, rejetees],
          backgroundColor: ['#d4a017', '#2e7d32', '#c0392b']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Dépenses par statut' }
        }
      }
    });
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