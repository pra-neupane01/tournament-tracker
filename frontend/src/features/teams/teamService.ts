import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type { RosterMember, RosterMemberInput, Team, TeamInput } from './types';

export const teamService = {
  list: async (gameId?: string) => {
    const response = await apiClient.get<APIResponse<PagedResponse<Team>>>('/teams', {
      params: { size: 100, gameId: gameId || undefined },
    });
    return response.data.data;
  },
  create: async (input: TeamInput) => {
    const response = await apiClient.post<APIResponse<Team>>('/teams', input);
    return response.data.data;
  },
  update: async (teamId: string, input: TeamInput) => {
    const response = await apiClient.put<APIResponse<Team>>(`/teams/${teamId}`, input);
    return response.data.data;
  },
  remove: (teamId: string) => apiClient.delete(`/teams/${teamId}`),
  roster: async (teamId: string) => {
    const response = await apiClient.get<APIResponse<RosterMember[]>>(`/teams/${teamId}/roster`);
    return response.data.data;
  },
  addRosterMember: async (teamId: string, input: RosterMemberInput) => {
    const response = await apiClient.post<APIResponse<RosterMember>>(
      `/teams/${teamId}/roster`,
      input,
    );
    return response.data.data;
  },
  updateRosterMember: async (
    teamId: string,
    memberId: string,
    input: RosterMemberInput,
  ) => {
    const response = await apiClient.put<APIResponse<RosterMember>>(
      `/teams/${teamId}/roster/${memberId}`,
      input,
    );
    return response.data.data;
  },
  removeRosterMember: (teamId: string, memberId: string) =>
    apiClient.delete(`/teams/${teamId}/roster/${memberId}`),
};
