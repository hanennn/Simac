import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../authService';
import { take } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';

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
  etat = creerEtatChargement(false);

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
    this.etat.erreur.set('');
    this.etat.chargement.set(true);

    this.authService.verifyOtp(this.email, this.code)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.etat.chargement.set(false);
          this.authService.sauvegarderToken(response.token);
          this.authService.sauvegarderUtilisateur(response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.etat.chargement.set(false);

          const messageBackend = err.error?.message || 'Code invalide. Réessayez.';
          this.etat.erreur.set(messageBackend);

          const fautReconnecter = messageBackend.toLowerCase().includes('reconnecter');

          if (fautReconnecter) {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2500);
          }
        }
      });
  }
}