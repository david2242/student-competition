import { Route } from '@angular/router';
import { CompetitionListComponent } from "@/app/components/pages/competition/competition-list/competition-list.component";
import { CompetitionEditorComponent } from "@/app/components/pages/competition/competition-editor/competition-editor.component";
import { LoginComponent } from "@/app/components/login/login.component";
import { WelcomeComponent } from "@/app/components/pages/welcome/welcome.component";
import { UserListComponent } from "@/app/components/pages/user/user-list/user-list.component";
import { UserEditorComponent } from "@/app/components/pages/user/user-editor/user-editor.component";
import { UserAdminComponent } from "@/app/components/pages/user/user-admin/user-admin.component";
import { adminGuard } from "@/app/guards/admin.guard";
import { ProfileComponent } from "@/app/components/pages/user/profile/profile.component";
import { ChangePasswordComponent } from "@/app/components/pages/user/change-password/change-password.component";

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
  { path: 'profile', component: ProfileComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: '', component: WelcomeComponent },
  { path: '**', redirectTo: '' }
];
