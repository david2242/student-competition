import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CompetitionService } from "./services/competition.service";
import {NavbarComponent} from "@/app/components/navbar/navbar.component";

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  competitionService = inject(CompetitionService)

  getAll() {
    this.competitionService.getCompetitions().subscribe((data) => {
      console.log(data);
    });
  };
  title = 'frontend';
}
