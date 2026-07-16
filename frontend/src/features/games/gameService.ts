import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type { Game, GameInput } from './types';

export const gameService = {
  list: async (includeInactive = false) => {
    const response = await apiClient.get<APIResponse<PagedResponse<Game>>>('/games', {
      params: { size: 100, includeInactive },
    });
    return response.data.data;
  },
  create: async (input: GameInput) => {
    const response = await apiClient.post<APIResponse<Game>>('/games', input);
    return response.data.data;
  },
  update: async (gameId: string, input: GameInput) => {
    const response = await apiClient.put<APIResponse<Game>>(`/games/${gameId}`, input);
    return response.data.data;
  },
  remove: (gameId: string) => apiClient.delete(`/games/${gameId}`),
};
