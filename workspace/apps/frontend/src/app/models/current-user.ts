import { User } from './user.model';

export interface CurrentUser extends Omit<User, 'password' | 'confirmPassword'> {
  // Add any additional properties specific to the authenticated user
}

export enum Role {
  ADMIN = 'admin',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer',
}

// Type guard to check if a value is a valid Role
export function isRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}

