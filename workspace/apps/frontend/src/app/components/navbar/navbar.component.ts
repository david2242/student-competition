import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ CommonModule, RouterLink, RouterLinkActive ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  $isLoggedIn = this.authService.$isLoggedIn;

  logout() {
    this.authService.logout().subscribe(() => this.router.navigate(['']));
  }

}
