import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";
import { ILoginRequest } from "@/app/services/auth.types";
import { ToastrService } from "ngx-toastr";

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
  private toastr = inject(ToastrService);

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
        this.toastr.success('Sikeres bejelentkezés!');
        this.router.navigate([ '/' ]);
      },
      error: () => {
        this.toastr.error('Sikertelen bejelentkezés!');
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
