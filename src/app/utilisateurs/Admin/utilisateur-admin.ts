import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur as UtilisateurModel, UtilisateurRequest } from './utilisateur-admin.model';

@Injectable({ providedIn: 'root' })
export class UtilisateurAdmin {
  private apiUrl = 'http://localhost:8081/api/admin/utilisateurs';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<UtilisateurModel[]> {
    return this.http.get<UtilisateurModel[]>(this.apiUrl);
  }

  creer(request: UtilisateurRequest): Observable<UtilisateurModel> {
    return this.http.post<UtilisateurModel>(this.apiUrl, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  modifier(id: number, request: UtilisateurRequest): Observable<UtilisateurModel> {
    return this.http.put<UtilisateurModel>(`${this.apiUrl}/${id}`, request);
  }

  changerStatut(id: number): Observable<UtilisateurModel> {
    return this.http.patch<UtilisateurModel>(`${this.apiUrl}/${id}/statut`, {});
  }

  listerParDepartement(departementId: number): Observable<UtilisateurModel[]> {
  return this.http.get<UtilisateurModel[]>(`${this.apiUrl}/departement/${departementId}`);
}
}