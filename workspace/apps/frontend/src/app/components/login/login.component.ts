import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";
import { ILoginRequest } from "@/app/services/auth.types";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: ILoginRequest = {
    email: '',
    password: '',
  }

  login() {
    this.authService.login(this.credentials).subscribe(() => this.router.navigate(['/']));
  }
}
