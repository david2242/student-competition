import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "@/app/components/navbar/navbar.component";
import { AuthService } from "@/app/services/auth.service";

declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService.info().subscribe();
  }

  ngAfterViewInit() {
    // Initialize Bootstrap dropdowns
    document.addEventListener('DOMContentLoaded', () => {
      const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
      dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
      });
    });
  }
}
