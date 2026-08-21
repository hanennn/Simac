import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { Auth } from '../auth/authService';
import { environment } from '../../environments/environment';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardWebsocket {

  //pas encore connecté
  private client: Client | null = null;
 // Stock connex WebSocket
  private dashboardSubject = new BehaviorSubject<any>(null);

  dashboard$ = this.dashboardSubject.asObservable();

  constructor(private authService: Auth) {}

  connect(): void {
    const token = this.authService.recupererToken();

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connecté');
        this.client?.subscribe('/topic/dashboard/maj', (message: IMessage) => {
          this.dashboardSubject.next(message.body);
        });
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}