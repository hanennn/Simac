import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtp implements OnInit {                                                    
  email: string = '';
  code: string = '';
  erreur = signal('');
  chargement = signal(false);

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    const emailEnAttente = this.authService.recupererEmailTemporaire();
    if (!emailEnAttente) {
      this.router.navigate(['/login']);
      return;
    }
    this.email = emailEnAttente;
  }

  verifier(): void {                                                     
  this.erreur.set('');
  this.chargement.set(true);

  this.authService.verifyOtp(this.email, this.code)
  .pipe(take(1))
  .subscribe({
    next: (response) => {
      this.chargement.set(false);
      this.authService.sauvegarderToken(response.token);
      this.authService.sauvegarderUtilisateur(response);   // ← ligne ajoutée
      this.router.navigate(['/dashboard']);
    },
    error: () => {
      this.chargement.set(false);
      this.erreur.set('Code invalide ou expiré. Redirection vers la connexion...');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  });
}
    
  }
