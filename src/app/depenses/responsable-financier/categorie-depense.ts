import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategorieDepense {
  idCategorie: number;
  nomCategorie: string;
}

export interface CategorieRequest {
  nomCategorie: string;
}

@Injectable({ providedIn: 'root' })
export class CategorieDepenseService {
  private apiUrl = 'http://localhost:8081/api/categories-depense';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<CategorieDepense[]> {
    return this.http.get<CategorieDepense[]>(this.apiUrl);
  }

  creer(request: CategorieRequest): Observable<CategorieDepense> {
    return this.http.post<CategorieDepense>(this.apiUrl, request);
  }

  modifier(id: number, request: CategorieRequest): Observable<CategorieDepense> {
    return this.http.put<CategorieDepense>(`${this.apiUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}