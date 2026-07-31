import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @Input() titre: string = '';
  @Input() petit: boolean = false;
  @Output() fermer = new EventEmitter<void>();

  onFermer(): void {
    this.fermer.emit();
  }
}