import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategorieDepart {
  idCategorie: number;
  nomCategorie: string;
}

export interface CategorieRequest {
  nomCategorie: string;
}

@Injectable({ providedIn: 'root' })
export class CategorieDepartService {
  private apiUrl = 'http://localhost:8081/api/categories-departement';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<CategorieDepart[]> {
    return this.http.get<CategorieDepart[]>(this.apiUrl);
  }

  creer(request: CategorieRequest): Observable<CategorieDepart> {
    return this.http.post<CategorieDepart>(this.apiUrl, request);
  }

  modifier(id: number, request: CategorieRequest): Observable<CategorieDepart> {
    return this.http.put<CategorieDepart>(`${this.apiUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}