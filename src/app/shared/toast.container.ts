import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        class="toast"
        [class.toast-succes]="t.type === 'succes'"
        [class.toast-erreur]="t.type === 'erreur'"
        *ngFor="let t of toastService.toasts()"
      >
        <span>{{ t.texte }}</span>
        <button class="toast-close" (click)="toastService.retirer(t.id)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 3000;
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-width: 280px;
      max-width: 380px;
      padding: 14px 16px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      animation: toast-in 0.25s ease;
      color: #fff;
    }
    .toast-succes {
      background: #1f5c42;
    }
    .toast-erreur {
      background: #c0392b;
    }
    .toast-close {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.8;
      flex-shrink: 0;
    }
    .toast-close:hover {
      opacity: 1;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainer {
  toastService = inject(ToastService);
}