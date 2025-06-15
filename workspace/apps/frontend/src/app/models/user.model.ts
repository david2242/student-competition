import { Role } from './current-user';

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  // Password fields for forms only
  password?: string;
  confirmPassword?: string;
}

export type UserList = User[];

export interface SingleUserResponse {
  data: User;
  success: boolean;
  message?: string;
}
