import { Route } from '@angular/router';
import { CompetitionListComponent } from "@/app/components/pages/competition/competition-list/competition-list.component";
import {
  CompetitionEditorComponent
} from "@/app/components/pages/competition/competition-editor/competition-editor.component";
import { LoginComponent } from "@/app/components/login/login.component";

export const appRoutes: Route[] = [
  { path: 'competition', component: CompetitionListComponent },
  { path: 'competition/:id', component: CompetitionEditorComponent },
  { path: 'competition-editor', component: CompetitionEditorComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'competition', pathMatch: 'full' },
];
