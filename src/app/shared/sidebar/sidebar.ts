import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../auth/authService';
import { AlerteNotification } from '../../alertes/alerte-notification';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  constructor(private authService: Auth, private router: Router) {}

  utilisateur() {
    return this.authService.recupererUtilisateur();
  }

  seDeconnecter(): void {
    this.authService.deconnexion();
    this.router.navigate(['/login']);
  }
}