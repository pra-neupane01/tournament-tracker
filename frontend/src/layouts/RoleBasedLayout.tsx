import type { FC } from 'react';
import { useAuthStore } from '../features/auth/authStore';
import { DashboardLayout } from './DashboardLayout';
import { PlayerLayout } from './PlayerLayout';

export const RoleBasedLayout: FC = () => {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'PLAYER') {
    return <PlayerLayout />;
  }

  // SUPER_ADMIN and ORGANIZER share the operations shell; their permissions
  // are enforced by the API and reflected in the sidebar.
  return <DashboardLayout />;
};
