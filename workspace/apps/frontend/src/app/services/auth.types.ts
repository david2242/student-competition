export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IUpdateProfileRequest {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface IChangePasswordRequest {
  currentPassword?: string | null;
  newPassword?: string | null;
}
