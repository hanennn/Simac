import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Depense as DepenseModel, DepenseRequest } from './depense.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Depense {
  private apiUrl = '${environment.apiUrl}/api/depenses';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<DepenseModel[]> {
    return this.http.get<DepenseModel[]>(this.apiUrl);
  }

  listerMesDepenses(): Observable<DepenseModel[]> {
    return this.http.get<DepenseModel[]>(`${this.apiUrl}/mes-depenses`);
  }

  saisir(request: DepenseRequest): Observable<DepenseModel> {
    return this.http.post<DepenseModel>(this.apiUrl, request);
  }

  valider(id: number): Observable<DepenseModel> {
    return this.http.patch<DepenseModel>(`${this.apiUrl}/${id}/valider`, {});
  }

  rejeter(id: number): Observable<DepenseModel> {
    return this.http.patch<DepenseModel>(`${this.apiUrl}/${id}/rejeter`, {});
  }
}