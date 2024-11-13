import { Route } from '@angular/router';
import {CompetitionListComponent} from "./components/pages/competition/competition-list/competition-list.component";
import {
  CompetitionEditorComponent
} from "./components/pages/competition/competition-editor/competition-editor.component";

export const appRoutes: Route[] = [
  { path: 'competition', component: CompetitionListComponent, pathMatch: 'full' },
  { path: 'competition-editor', component: CompetitionEditorComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'competition', pathMatch: 'full' },
];
