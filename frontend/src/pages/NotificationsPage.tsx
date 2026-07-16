import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { PageContainer } from '../components/layout/PageContainer';
import { notificationService } from '../features/notifications/notificationService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  });
  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
    },
  });
  const markAll = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
    },
  });

  return (
    <PageContainer
      title="Notifications"
      description="Persistent tournament activity and live updates."
      action={
        <button className="button button-secondary" onClick={() => markAll.mutate()}>
          <CheckCheck /> Mark all read
        </button>
      }
    >
      {notifications.isLoading && <LoadingState message="Loading notifications..." />}
      {notifications.isError && <ErrorState message={getErrorMessage(notifications.error)} />}
      {notifications.data?.content.length === 0 && (
        <EmptyState title="No notifications yet" />
      )}
      <div className="notification-list">
        {notifications.data?.content.map((item) => (
          <button
            key={item.id}
            className={item.read ? '' : 'unread'}
            onClick={async () => {
              await markRead.mutateAsync(item.id);
              if (item.link) navigate(item.link);
            }}
          >
            <div className="resource-icon">
              <Bell />
            </div>
            <div>
              <div>
                <strong>{item.title}</strong>
                <span className="badge">{item.type}</span>
              </div>
              <p>{item.message}</p>
              <small>{formatDateTime(item.createdAt)}</small>
            </div>
          </button>
        ))}
      </div>
    </PageContainer>
  );
}
