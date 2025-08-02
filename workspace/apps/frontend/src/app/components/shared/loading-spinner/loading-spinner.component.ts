import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-center align-items-center p-3" [ngStyle]="{ height: size === 'sm' ? '50px' : '100px' }">
      <div class="spinner-border text-primary" [ngClass]="size === 'sm' ? 'spinner-border-sm' : ''" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-2" *ngIf="showText">Loading...</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' = 'md';
  @Input() showText = true;
}
