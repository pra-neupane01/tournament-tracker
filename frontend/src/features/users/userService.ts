import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type { AuthUser, UserRole } from '../auth/types';

export interface UserAdminInput {
  role: UserRole;
  enabled: boolean;
  locked: boolean;
}

export const userService = {
  list: async () => {
    const response = await apiClient.get<APIResponse<PagedResponse<AuthUser>>>('/users', {
      params: { size: 100 },
    });
    return response.data.data;
  },
  update: async (userId: string, input: UserAdminInput) => {
    const response = await apiClient.patch<APIResponse<AuthUser>>(`/users/${userId}`, input);
    return response.data.data;
  },
};
