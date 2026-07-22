import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email: string = '';
  message = signal('');
  chargement = signal(false);

  constructor(private authService: Auth, private router: Router) {}

  envoyer(): void {
    this.chargement.set(true);
    this.message.set('');

    this.authService.motDePasseOublie(this.email).subscribe({
      next: (response) => {
        this.chargement.set(false);
        this.message.set(response.message);
        this.authService.sauvegarderEmailTemporaire(this.email);

        setTimeout(() => {
          this.router.navigate(['/reset-password']);
        }, 1500);
      },
      error: () => {
        this.chargement.set(false);
        this.message.set('Une erreur est survenue');
      }
    });
  }
}