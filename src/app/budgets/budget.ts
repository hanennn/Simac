import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget as BudgetModel, BudgetRequest } from './budget.model';

@Injectable({ providedIn: 'root' })
export class Budget {
  private apiUrl = 'http://localhost:8081/api/budgets';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<BudgetModel[]> {
    return this.http.get<BudgetModel[]>(this.apiUrl);
  }

  listerParDepartement(departementId: number): Observable<BudgetModel[]> {
    return this.http.get<BudgetModel[]>(`${this.apiUrl}/departement/${departementId}`);
  }

  trouverParId(id: number): Observable<BudgetModel> {
    return this.http.get<BudgetModel>(`${this.apiUrl}/${id}`);
  }

  creer(request: BudgetRequest): Observable<BudgetModel> {
    return this.http.post<BudgetModel>(this.apiUrl, request);
  }

  modifier(id: number, request: BudgetRequest): Observable<BudgetModel> {
    return this.http.put<BudgetModel>(`${this.apiUrl}/${id}`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}