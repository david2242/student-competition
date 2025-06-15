import { Route } from '@angular/router';
import { CompetitionListComponent } from "@/app/components/pages/competition/competition-list/competition-list.component";
import { CompetitionEditorComponent } from "@/app/components/pages/competition/competition-editor/competition-editor.component";
import { LoginComponent } from "@/app/components/login/login.component";
import { WelcomeComponent } from "@/app/components/pages/welcome/welcome.component";
import { UserListComponent } from "@/app/components/pages/user/user-list/user-list.component";
import { UserEditorComponent } from "@/app/components/pages/user/user-editor/user-editor.component";
import { UserAdminComponent } from "@/app/components/pages/user/user-admin/user-admin.component";
import { adminGuard } from "@/app/guards/admin.guard";

export const appRoutes: Route[] = [
  {
    path: 'admin/users',
    component: UserAdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: UserListComponent },
      { path: 'new', component: UserEditorComponent },
      { path: ':id/edit', component: UserEditorComponent }
    ]
  },
  { path: 'competition', component: CompetitionListComponent },
  { path: 'competition/:id', component: CompetitionEditorComponent },
  { path: 'competition-editor', component: CompetitionEditorComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: WelcomeComponent },
  { path: '**', redirectTo: '' }
];
