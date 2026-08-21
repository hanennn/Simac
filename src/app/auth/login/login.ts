import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../authService';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  motDePasse: string = '';
  seSouvenir: boolean = true;
  erreur = signal('');
  chargement = signal(false);

  emailInvalide = signal(false);
  motDePasseInvalide = signal(false);

  constructor(private authService: Auth, private router: Router) {}

  private emailValide(email: string): boolean {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email.trim());
  }

  private validerFormulaire(): boolean {
    this.emailInvalide.set(false);
    this.motDePasseInvalide.set(false);

    if (!this.email.trim()) {
      this.erreur.set('L\'adresse email est obligatoire.');
      this.emailInvalide.set(true);
      return false;
    }

    if (!this.emailValide(this.email)) {
      this.erreur.set('Veuillez saisir une adresse email valide (ex: nom@domaine.com).');
      this.emailInvalide.set(true);
      return false;
    }

    if (!this.motDePasse.trim()) {
      this.erreur.set('Le mot de passe est obligatoire.');
      this.motDePasseInvalide.set(true);
      return false;
    }

    return true;
  }

  seConnecter(): void {
    this.erreur.set('');

    if (!this.validerFormulaire()) {
      return;
    }

    this.chargement.set(true);

    this.authService.login(this.email, this.motDePasse).pipe(take(1)).subscribe({
      next: () => {
        this.chargement.set(false);
        this.authService.sauvegarderEmailTemporaire(this.email);
        this.router.navigate(['/verify-otp']);
      },
      error: (err) => {
        this.chargement.set(false);
        this.erreur.set(err.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }
}