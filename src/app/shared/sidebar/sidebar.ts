import { Component, signal, TemplateRef, ViewChild, ViewContainerRef, EmbeddedViewRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../auth/authService';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  confirmationOuverte = signal(false);

  @ViewChild('popupTemplate') popupTemplate!: TemplateRef<any>;
  private vueInjectee?: EmbeddedViewRef<any>;

  constructor(
    private authService: Auth,
    private router: Router,
    private viewContainerRef: ViewContainerRef
  ) {}

  utilisateur() {
    return this.authService.recupererUtilisateur();
  }

  demanderDeconnexion(): void {
    this.confirmationOuverte.set(true);

    // Injecte la pop-up directement dans <body>, hors du sidebar,
    // pour eviter le bug de positionnement cause par "position: sticky" sur .sidebar
    this.vueInjectee = this.viewContainerRef.createEmbeddedView(this.popupTemplate);
    this.vueInjectee.rootNodes.forEach(node => document.body.appendChild(node));
  }

  annulerDeconnexion(): void {
    this.fermerPopup();
  }

  confirmerDeconnexion(): void {
    this.fermerPopup();
    this.authService.deconnexion();
    this.router.navigate(['/login']);
  }

  private fermerPopup(): void {
    this.confirmationOuverte.set(false);
    this.vueInjectee?.destroy();
    this.vueInjectee = undefined;
  }
}