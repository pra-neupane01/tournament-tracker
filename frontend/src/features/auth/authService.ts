import type { APIResponse } from '../../types/api';
import { apiClient } from '../../services/api/apiClient';
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
} from './types';

export const authService = {
  login: async (input: LoginInput) => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/login', input);
    return response.data.data;
  },
  register: async (input: RegisterInput) => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/register', input);
    return response.data.data;
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
