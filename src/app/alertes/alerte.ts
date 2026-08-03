import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerte } from './alerte.model';

@Injectable({ providedIn: 'root' })
export class Alerte_Service {
  private apiUrl = 'http://localhost:8081/api/alertes';

  constructor(private http: HttpClient) {}

  listerMesAlertes(): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.apiUrl}/mes-alertes`);
  }

  marquerCommeLue(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/lue`, {});
  }
}