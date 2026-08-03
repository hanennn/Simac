import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';
import { AlerteNotification } from './alertes/alerte-notification';
import { Auth } from './auth/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule, AlerteNotification],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('simac-frontend');

  afficherSidebar = signal(true);

  private routesSansSidebar = ['/login', '/forgot-password', '/reset-password', '/verify-otp'];

  constructor(private router: Router, private authService: Auth) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      const estPageAuth = this.routesSansSidebar.some(route => url.startsWith(route));
      this.afficherSidebar.set(!estPageAuth);
    });
  }

  utilisateur() {
    return this.authService.recupererUtilisateur();
  }
}