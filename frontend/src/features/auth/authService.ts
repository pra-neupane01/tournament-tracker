import type { APIResponse } from '../../types/api';
import { apiClient } from '../../services/api/apiClient';
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  RegistrationResponse,
} from './types';

export const authService = {
  login: async (input: LoginInput) => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/login', input);
    return response.data.data;
  },
  register: async (input: RegisterInput) => {
    const response = await apiClient.post<APIResponse<AuthResponse | RegistrationResponse>>('/auth/register', input);
    return response.data.data;
  },
  verifyEmail: async (token: string) => {
    await apiClient.post<APIResponse<null>>('/auth/verify-email', { token });
  },
  currentUser: async () => {
    const response = await apiClient.get<APIResponse<AuthUser>>('/auth/me');
    return response.data.data;
  },
  logout: (refreshToken: string) =>
    apiClient.post<APIResponse<null>>('/auth/logout', { refreshToken }),
  changePassword: (input: ChangePasswordInput) =>
    apiClient.post<APIResponse<null>>('/auth/change-password', input),
};
