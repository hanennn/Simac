import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from './produit.model';

@Injectable({ providedIn: 'root' })
export class Produit_Service {
  private apiUrl = 'http://localhost:8081/api/produits';

  constructor(private http: HttpClient) {}

  listerMesProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/mes-produits`);
  }

  commander(produitId: number, quantite: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/commander`, { produitId, quantite });
  }
}