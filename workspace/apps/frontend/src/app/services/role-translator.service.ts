import { Injectable } from '@angular/core';
import { Role } from '../models/current-user';

type RoleTranslations = {
  [key in Role]: string;
};

@Injectable({
  providedIn: 'root'
})
export class RoleTranslatorService {
  private translations: RoleTranslations = {
    [Role.ADMIN]: 'adminisztrátor',
    [Role.CONTRIBUTOR]: 'szerkesztő',
    [Role.VIEWER]: 'megtekintő'
  };

  translate(role: Role): string {
    return this.translations[role] || role;
  }
}
