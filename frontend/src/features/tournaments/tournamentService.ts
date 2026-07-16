import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type {
  Tournament,
  TournamentInput,
  TournamentRule,
  TournamentRuleInput,
  TournamentStatus,
} from './types';

export const tournamentService = {
  list: async (filters: { query?: string; status?: TournamentStatus; gameId?: string } = {}) => {
    const response = await apiClient.get<APIResponse<PagedResponse<Tournament>>>('/tournaments', {
      params: { ...filters, size: 100 },
    });
    return response.data.data;
  },
  get: async (tournamentId: string) => {
    const response = await apiClient.get<APIResponse<Tournament>>(`/tournaments/${tournamentId}`);
    return response.data.data;
  },
  create: async (input: TournamentInput) => {
    const response = await apiClient.post<APIResponse<Tournament>>('/tournaments', input);
    return response.data.data;
  },
  update: async (tournamentId: string, input: TournamentInput) => {
    const response = await apiClient.put<APIResponse<Tournament>>(
      `/tournaments/${tournamentId}`,
      input,
    );
    return response.data.data;
  },
  updateStatus: async (tournamentId: string, status: TournamentStatus) => {
    const response = await apiClient.patch<APIResponse<Tournament>>(
      `/tournaments/${tournamentId}/status`,
      { status },
    );
    return response.data.data;
  },
  remove: (tournamentId: string) => apiClient.delete(`/tournaments/${tournamentId}`),
  rules: async (tournamentId: string) => {
    const response = await apiClient.get<APIResponse<TournamentRule[]>>(
      `/tournaments/${tournamentId}/rules`,
    );
    return response.data.data;
  },
  createRule: async (tournamentId: string, input: TournamentRuleInput) => {
    const response = await apiClient.post<APIResponse<TournamentRule>>(
      `/tournaments/${tournamentId}/rules`,
      input,
    );
    return response.data.data;
  },
  removeRule: (tournamentId: string, ruleId: string) =>
    apiClient.delete(`/tournaments/${tournamentId}/rules/${ruleId}`),
};
