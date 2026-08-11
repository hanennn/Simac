import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget as BudgetModel, BudgetRequest, EstimationBudgetResponse, PredictionDepassementResponse } from './budget.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class Budget {
  private apiUrl = '${environment.apiUrl}/api/budgets';

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

   estimerBudget(departementId: number): Observable<EstimationBudgetResponse> {
    return this.http.get<EstimationBudgetResponse>(`${this.apiUrl}/estimation/${departementId}`);
  }

  predireDepassement(budgetId: number): Observable<PredictionDepassementResponse> {
    return this.http.get<PredictionDepassementResponse>(`${this.apiUrl}/${budgetId}/prediction`);
  }


  recupererDerniereEstimation(departementId: number): Observable<EstimationBudgetResponse> {
  return this.http.get<EstimationBudgetResponse>(`${this.apiUrl}/estimation/${departementId}/derniere`);
}
  
}