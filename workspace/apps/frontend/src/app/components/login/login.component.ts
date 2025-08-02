import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";
import { ILoginRequest } from "@/app/services/auth.types";
import { NotificationService } from "@/app/services/notification.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  credentials: ILoginRequest = {
    email: '',
    password: '',
  }
  isLoading = false;

  login() {
    if (this.isLoading) return;

    this.isLoading = true;
    const subscription = this.authService.login(this.credentials).subscribe({
      next: () => {
        this.notification.success('Sikeres bejelentkezés!');
        this.router.navigate([ '/' ]);
      },
      error: () => {
        this.notification.error('Sikertelen bejelentkezés!');
        this.isLoading = false;
        subscription.unsubscribe();
      },
      complete: () => {
        this.isLoading = false;
        subscription.unsubscribe();
      }
    })
  }
}
