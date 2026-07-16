import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type { Notification } from './types';

export const notificationService = {
  list: async () => {
    const response = await apiClient.get<APIResponse<PagedResponse<Notification>>>(
      '/notifications',
      { params: { size: 100 } },
    );
    return response.data.data;
  },
  unreadCount: async () => {
    const response = await apiClient.get<APIResponse<{ unreadCount: number }>>(
      '/notifications/unread-count',
    );
    return response.data.data.unreadCount;
  },
  markRead: async (notificationId: string) => {
    const response = await apiClient.patch<APIResponse<Notification>>(
      `/notifications/${notificationId}/read`,
    );
    return response.data.data;
  },
  markAllRead: () => apiClient.post('/notifications/read-all'),
  announce: (tournamentId: string, input: { title: string; message: string }) =>
    apiClient.post(`/tournaments/${tournamentId}/announcements`, input),
};
