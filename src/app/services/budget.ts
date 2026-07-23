import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Budget {
  private apiUrl = 'http://localhost:8081/api/budgets';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listerParDepartement(departementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departement/${departementId}`);
  }
}