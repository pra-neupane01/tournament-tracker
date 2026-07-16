import type { FC } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Trophy, Users, Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '../features/auth/authStore';

export const DashboardPage: FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <PageContainer 
      title={`Welcome, ${user?.fullName?.split(' ')[0] ?? 'competitor'}`}
      description="Your tournament operations and competition activity will appear here."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Placeholder summary cards */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Active Tournaments</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">0</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Registered Teams</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">0</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Upcoming Matches</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">0</p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-[var(--color-text-main)]">0</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
        <h3 className="text-lg font-medium text-[var(--color-text-main)] mb-2">No recent activity</h3>
        <p className="text-sm text-[var(--color-text-muted)]">Data will appear here once you create your first tournament.</p>
      </div>
    </PageContainer>
  );
};
