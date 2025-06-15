import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/app/services/auth.service';
import { Role } from '@/app/models/current-user';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-admin.component.html',
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class UserAdminComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  get isAdmin(): boolean {
    return this.authService.hasRole(Role.ADMIN);
  }
  
  constructor() {
    if (!this.isAdmin) {
      this.router.navigate(['/']);
    }
  }
}
