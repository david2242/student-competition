import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "@/app/components/navbar/navbar.component";
import { AuthService } from "@/app/services/auth.service";

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.info().subscribe();
  }
}
