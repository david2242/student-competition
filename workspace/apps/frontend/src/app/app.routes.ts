import { Route } from '@angular/router';
import { CompetitionListComponent } from "@/app/components/pages/competition/competition-list/competition-list.component";
import {
  CompetitionEditorComponent
} from "@/app/components/pages/competition/competition-editor/competition-editor.component";
import { LoginComponent } from "@/app/components/login/login.component";

export const appRoutes: Route[] = [
  { path: 'competition', component: CompetitionListComponent, pathMatch: 'full' },
  { path: 'competition-editor', component: CompetitionEditorComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'competition', pathMatch: 'full' },
];
