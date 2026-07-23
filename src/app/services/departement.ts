import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Departement {
  private apiUrl = 'http://localhost:8081/api/departements';

  constructor(private http: HttpClient) {}

  listerTous(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}