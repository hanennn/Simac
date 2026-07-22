import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  constructor(private authService: Auth, private router: Router) {}

  seConnecter(): void {
    this.erreur.set('');
    this.chargement.set(true);

    this.authService.login(this.email, this.motDePasse).subscribe({
      next: () => {
        this.chargement.set(false);
        this.authService.sauvegarderEmailTemporaire(this.email);
        this.router.navigate(['/verify-otp']);
      },
      error: () => {
        this.chargement.set(false);
        this.erreur.set('Email ou mot de passe incorrect');
      }
    });
  }
}