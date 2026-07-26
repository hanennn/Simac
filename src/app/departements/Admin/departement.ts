import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departement as DepartementModel, DepartementRequest } from './departement.model';

@Injectable({ providedIn: 'root' })
export class Departement {
  private apiUrl = 'http://localhost:8081/api/departements';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<DepartementModel[]> {
    return this.http.get<DepartementModel[]>(`${this.apiUrl}/`);
  }

  trouverParId(id: number): Observable<DepartementModel> {
    return this.http.get<DepartementModel>(`${this.apiUrl}/${id}`);
  }

  creer(request: DepartementRequest): Observable<DepartementModel> {
    return this.http.post<DepartementModel>(`${this.apiUrl}/`, request);
  }

  modifier(id: number, request: DepartementRequest): Observable<DepartementModel> {
    return this.http.put<DepartementModel>(`${this.apiUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}