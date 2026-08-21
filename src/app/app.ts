import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EcranVerrouillage } from './auth/verrouillage/ecran-verrouillage';
import { Inactivite } from './auth/verrouillage/inactivite';
import { ToastContainer } from './shared/toast.container';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, EcranVerrouillage, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('simac-frontend');

  constructor(public inactivite: Inactivite) {}
}