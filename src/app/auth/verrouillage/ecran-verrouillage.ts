import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Inactivite } from './inactivite';
import { Auth } from '../authService';
import { creerEtatChargement } from '../../shared/etat-chargement';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ecran-verrouillage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecran-verrouillage.html',
  styleUrl: './ecran-verrouillage.css'
})
export class EcranVerrouillage {
  private readonly apiUrl = ' ${environment.apiUrl}/api/auth';

  motDePasse = '';
  etat = creerEtatChargement(false);

  constructor(
    public inactivite: Inactivite,
    private http: HttpClient,
    private authService: Auth
  ) {}

  utilisateur() {
    return this.authService.recupererUtilisateur();
  }

  deverrouiller(): void {
    if (!this.motDePasse) {
      this.etat.erreur.set('Entrez votre mot de passe.');
      return;
    }

    this.etat.erreur.set('');
    this.etat.chargement.set(true);

    this.http.post<{ valide: boolean }>(`${this.apiUrl}/verifier-mot-de-passe`, {
      motDePasse: this.motDePasse
    }).subscribe({
      next: (res) => {
        this.etat.chargement.set(false);
        if (res.valide) {
          this.motDePasse = '';
          this.inactivite.deverrouiller();
        } else {
          this.etat.erreur.set('Mot de passe incorrect.');
        }
      },
      error: () => {
        this.etat.chargement.set(false);
        this.etat.erreur.set('Une erreur est survenue.');
      }
    });
  }

  seDeconnecter(): void {
    this.authService.deconnexion();
    window.location.href = '/login';
  }
}