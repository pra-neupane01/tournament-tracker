import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../auth/authStore';
import { connectNotificationSocket } from './notificationSocket';

export function NotificationStream() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    return connectNotificationSocket(() => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
    });
  }, [isAuthenticated, queryClient]);

  return null;
}
