export interface CurrentUser {
  id: number;
  userName: string;
  email: string;
  roles: Role[];
}

export enum Role {
  ADMIN = 'admin',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer',
}
