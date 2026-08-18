import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit, ProduitRequest } from './produit.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Produit_Service {
  private apiUrl = `${environment.apiUrl}/api/produits`;

  constructor(private http: HttpClient) {}

  listerMesProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/mes-produits`);
  }

  commander(lignes: { produitId: number; quantite: number }[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/commander`, { lignes });
}

  // --- Ajout pour le Gestionnaire de produits (parametrage des produits) ---

  creerProduit(produit: ProduitRequest): Observable<any> {
    return this.http.post(this.apiUrl, produit);
  }

  modifierProduit(id: number, produit: ProduitRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, produit);
  }

  archiverProduit(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  listerTousProduits(): Observable<any[]> {
  return this.http.get<any[]>(this.apiUrl);
}

listerProduitsArchives(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/archives`);
}

restaurerProduit(id: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${id}/restaurer`, {});
}
}