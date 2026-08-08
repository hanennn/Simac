import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { take, takeUntil } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  email: string = '';
  code: string = '';
  nouveauMotDePasse: string = '';
  message = signal('');
  etat = creerEtatChargement(false);

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    const emailEnAttente = this.authService.recupererEmailTemporaire();
    if (!emailEnAttente) {
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.email = emailEnAttente;
  }

  reinitialiser(): void {
    this.etat.chargement.set(true);
    this.message.set('');

    
    this.authService.reinitialiserMotDePasse(this.email, this.code, this.nouveauMotDePasse).pipe(take(1)).subscribe({
      next: (response) => {
        this.etat.chargement.set(false);
        this.message.set('Mot de passe réinitialisé ! Redirection...');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: () => {
        this.etat.chargement.set(false);
        this.message.set('Code invalide ou expiré');
      }
    });
  }
}