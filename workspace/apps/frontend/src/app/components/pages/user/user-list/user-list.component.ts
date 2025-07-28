import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '@/app/services/user.service';
import { User } from '@/app/models/user.model';
import { Role } from '@/app/models/current-user';
import { NotificationService } from '@/app/services/notification.service';
import { firstValueFrom } from 'rxjs';
import { RoleTranslatorService } from '@/app/services/role-translator.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styles: [`
    .badge {
      padding: 0.35em 0.65em;
      font-size: 0.75em;
      font-weight: 700;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: 0.25rem;
    }

    .badge-admin {
      background-color: #6f42c1;
      color: white;
    }

    .badge-contributor {
      background-color: #0d6efd;
      color: white;
    }

    .badge-viewer {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = false;

  private roleTranslator = inject(RoleTranslatorService);

  constructor(
    private userService: UserService,
    private notification: NotificationService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  private async loadUsers() {
    try {
      this.isLoading = true;
      this.users = await firstValueFrom(this.userService.getAllUsers());
    } catch (error) {
      this.notification.error('Nem sikerült betölteni a felhasználókat');
      console.error('Error loading users:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteUser(userId: string) {
    if (!confirm('Biztosan törölni szeretné ezt a felhasználót?')) {
      return;
    }

    try {
      await firstValueFrom(this.userService.deleteUser(userId));
      this.notification.success('Felhasználó sikeresen törölve');
      await this.loadUsers();
    } catch (error) {
      this.notification.error('Hiba történt a felhasználó törlése közben');
      console.error('Error deleting user:', error);
    }
  }

  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'badge-admin';
      case Role.CONTRIBUTOR:
        return 'badge-contributor';
      case Role.VIEWER:
        return 'badge-viewer';
      default:
        return 'badge-secondary';
    }
  }

  getTranslatedRole(role: Role): string {
    return this.roleTranslator.translate(role);
  }
}
