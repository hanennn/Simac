import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';
import { AlerteNotification } from './alertes/alerte-notification';
import { Auth } from './auth/authService';
import { Inactivite } from './auth/verrouillage/inactivite';
import { EcranVerrouillage } from './auth/verrouillage/ecran-verrouillage';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule, AlerteNotification, EcranVerrouillage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('simac-frontend');

  afficherSidebar = signal(true);

  private routesSansSidebar = ['/login', '/forgot-password', '/reset-password', '/verify-otp'];

  constructor(private router: Router, private authService: Auth, public inactivite: Inactivite) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      const estPageAuth = this.routesSansSidebar.some(route => url.startsWith(route));
      this.afficherSidebar.set(!estPageAuth);

      // On ne surveille l'inactivite que si l'utilisateur est connecte (hors pages d'auth)
      if (!estPageAuth && this.authService.estConnecte()) {
        this.inactivite.demarrerSurveillance();
      }
    });
  }

  utilisateur() {
    return this.authService.recupererUtilisateur();
  }
}