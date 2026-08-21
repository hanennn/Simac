import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../shared/sidebar/sidebar';
import { Auth } from '../auth/authService';
import { Inactivite } from '../auth/verrouillage/inactivite';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar],
  templateUrl: './app-layout.html',
  styles: [`
   .dashboard-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px 1fr;
  background: var(--paper);
  font-family: var(--font-body);
  color: var(--text-1);
}

.dashboard-content {
  padding: 28px 40px 48px;
  max-width: 1180px;
}



@media (max-width: 700px) {
  .dashboard-container { grid-template-columns: 1fr; }
  .page-head { flex-direction: column; align-items: flex-start; }
}

  `]
})
export class AppLayout {
  constructor(private authService: Auth, private inactivite: Inactivite) {
    if (this.authService.estConnecte()) {
      this.inactivite.demarrerSurveillance();
    }
  }
}