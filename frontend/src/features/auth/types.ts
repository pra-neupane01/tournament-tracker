export type UserRole = 'SUPER_ADMIN' | 'ORGANIZER' | 'REFEREE' | 'PLAYER';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  enabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
