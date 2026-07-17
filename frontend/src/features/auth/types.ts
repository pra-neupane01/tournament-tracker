export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORGANIZER'
  | 'TOURNAMENT_MANAGER'
  | 'REFEREE'
  | 'TEAM_MANAGER'
  | 'PLAYER';

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

export interface RegistrationResponse {
  email: string;
  verificationRequired: boolean;
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
