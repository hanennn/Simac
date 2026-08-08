import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alerte_Service } from './alerte';
import { take, takeUntil } from 'rxjs';
import { Alerte } from './alerte.model';

@Component({
  selector: 'app-alerte-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerte-notification.html',
  styleUrl: './alerte-notification.css'
})
export class AlerteNotification implements OnInit {

  alertes = signal<Alerte[]>([]);
  panneauOuvert = signal(false);

  constructor(private alerteService: Alerte_Service) {}

  ngOnInit(): void {
    this.chargerAlertes();
  }

  chargerAlertes(): void {
    this.alerteService.listerMesAlertes().subscribe({
      next: (liste) => this.alertes.set(liste),
      error: () => {}
    });
  }

  toggle(): void {
    this.panneauOuvert.set(!this.panneauOuvert());
  }

  marquerCommeLue(idAlerte: number): void {
    this.alerteService.marquerCommeLue(idAlerte).pipe(take(1)).subscribe({
      next: () => {
        this.alertes.set(this.alertes().filter(a => a.idAlerte !== idAlerte));
      },
      error: () => {}
    });
  }
}