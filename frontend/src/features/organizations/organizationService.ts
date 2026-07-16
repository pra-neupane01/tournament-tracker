import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type {
  Membership,
  MembershipRole,
  Organization,
  OrganizationInput,
} from './types';

export const organizationService = {
  list: async (query = '') => {
    const response = await apiClient.get<APIResponse<PagedResponse<Organization>>>(
      '/organizations',
      { params: { query: query || undefined, size: 50 } },
    );
    return response.data.data;
  },
  create: async (input: OrganizationInput) => {
    const response = await apiClient.post<APIResponse<Organization>>('/organizations', input);
    return response.data.data;
  },
  members: async (organizationId: string) => {
    const response = await apiClient.get<APIResponse<Membership[]>>(
      `/organizations/${organizationId}/members`,
    );
    return response.data.data;
  },
  addMember: async (
    organizationId: string,
    input: { email: string; role: MembershipRole },
  ) => {
    const response = await apiClient.post<APIResponse<Membership>>(
      `/organizations/${organizationId}/members`,
      input,
    );
    return response.data.data;
  },
  updateMember: async (
    organizationId: string,
    membershipId: string,
    role: MembershipRole,
  ) => {
    const response = await apiClient.patch<APIResponse<Membership>>(
      `/organizations/${organizationId}/members/${membershipId}`,
      { role },
    );
    return response.data.data;
  },
  removeMember: (organizationId: string, membershipId: string) =>
    apiClient.delete(`/organizations/${organizationId}/members/${membershipId}`),
};
