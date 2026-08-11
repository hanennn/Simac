import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 import { environment } from '../../environments/environment';

export interface LoginResponse {
  message: string;
  email: string;
}

export interface VerifyOtpResponse {
  token: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  departementId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, motDePasse });
  }

  verifyOtp(email: string, code: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.apiUrl}/verify-otp`, { email, code });
  }

  sauvegarderToken(token: string): void {
    localStorage.setItem('token', token);
  }

  sauvegarderEmailTemporaire(email: string): void {
    sessionStorage.setItem('emailEnAttente', email);
  }

  recupererEmailTemporaire(): string | null {
    return sessionStorage.getItem('emailEnAttente');
  }

  motDePasseOublie(email: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/mot-de-passe-oublie`, { email });
}

reinitialiserMotDePasse(email: string, code: string, nouveauMotDePasse: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(`${this.apiUrl}/reinitialiser-mot-de-passe`, { email, code, nouveauMotDePasse });
}

sauvegarderUtilisateur(utilisateur: any): void {
  localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
}

recupererUtilisateur(): any {
  const data = localStorage.getItem('utilisateur');
  return data ? JSON.parse(data) : null;
}

deconnexion(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('utilisateur');
}

estConnecte(): boolean {
  return !!localStorage.getItem('token');
}

mettreAJourUtilisateurLocal(donnees: Partial<{ nom: string; prenom: string; email: string; role: string }>): void {
  const actuel = this.recupererUtilisateur();
  if (!actuel) return;
  const misAJour = { ...actuel, ...donnees };
  this.sauvegarderUtilisateur(misAJour);
}
}