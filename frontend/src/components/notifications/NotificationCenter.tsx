import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../features/notifications/notificationService';
import { formatDateTime } from '../../utils/date';

export function NotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const unread = useQuery({
    queryKey: ['notification-unread'],
    queryFn: notificationService.unreadCount,
    refetchInterval: 60_000,
  });
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
  const markAllRead = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
    },
  });

  const openNotification = async (id: string, link: string | null) => {
    await markRead.mutateAsync(id);
    setOpen(false);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="notification-center">
      <button
        className="icon-button relative"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell />
        {Boolean(unread.data) && <span className="notification-dot">{unread.data}</span>}
      </button>
      {open && (
        <div className="notification-popover">
          <header>
            <div>
              <strong>Notifications</strong>
              <span>{unread.data ?? 0} unread</span>
            </div>
            <button className="icon-button" onClick={() => markAllRead.mutate()} title="Mark all read">
              <CheckCheck />
            </button>
          </header>
          <div>
            {notifications.data?.content.slice(0, 6).map((item) => (
              <button
                key={item.id}
                className={item.read ? '' : 'unread'}
                onClick={() => void openNotification(item.id, item.link)}
              >
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <span>{formatDateTime(item.createdAt)}</span>
              </button>
            ))}
          </div>
          <Link to="/notifications" onClick={() => setOpen(false)}>
            View notification inbox
          </Link>
        </div>
      )}
    </div>
  );
}
