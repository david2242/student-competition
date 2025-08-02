import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert alert-danger" role="alert" *ngIf="message">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ message }}
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}
