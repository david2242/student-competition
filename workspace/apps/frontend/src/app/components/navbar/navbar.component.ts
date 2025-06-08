import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";
import { RoleTranslatorService } from "@/app/services/role-translator.service";
import { Role } from "@/app/models/current-user";

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
  private roleTranslator = inject(RoleTranslatorService)
  $isLoggedIn = this.authService.$isLoggedIn;
  $currentUser = this.authService.$currentUser;

  logout() {
    this.authService.logout().subscribe(() => this.router.navigate(['']));
  }

  getRoleTranslation(role: Role): string {
    return this.roleTranslator.translate(role);
  }

  get currentSchoolYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth() + 1;

  const schoolYearStartMonth = 9;
  let startYear: number;

  if (month >= schoolYearStartMonth) {
    startYear = currentYear;
  } else {
    startYear = currentYear - 1;
  }

  const endYear = startYear + 1;
  return `${startYear}/${endYear.toString().slice(2)}`;
}

}
