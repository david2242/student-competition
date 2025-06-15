import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";
import { RoleTranslatorService } from "@/app/services/role-translator.service";
import { Role } from "@/app/models/current-user";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly roleTranslator = inject(RoleTranslatorService);

  readonly $isLoggedIn = this.authService.$isLoggedIn;
  readonly $currentUser = this.authService.$currentUser;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/'])
    });
  }

  getRoleTranslation(role: Role): string {
    return this.roleTranslator.translate(role);
  }

  get currentSchoolYear(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth() + 1;

    const isNewSchoolYear = month >= 9;
    const startYear = isNewSchoolYear ? currentYear : currentYear - 1;

    return `${startYear}/${(startYear + 1).toString().slice(2)}`; // e.g., "2024/25"
  }

  protected readonly Role = Role;
}
