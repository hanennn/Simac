import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UtilisateurAdmin {
  private apiUrl = 'http://localhost:8081/api/admin/utilisateurs';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}