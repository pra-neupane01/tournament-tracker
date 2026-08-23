import { useQueries, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Calendar,
  Clock,
  Plus,
  Trophy,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuthStore } from '../features/auth/authStore';
import { competitionService } from '../features/competition/competitionService';
import { notificationService } from '../features/notifications/notificationService';
import { registrationService } from '../features/registrations/registrationService';
import { teamService } from '../features/teams/teamService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { formatDateTime } from '../utils/date';

import { PlayerHomePage } from './PlayerHomePage';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'PLAYER') {
    return <PlayerHomePage />;
  }

  return <DashboardAdminPage user={user} />;
}

function DashboardAdminPage({ user }: { user: ReturnType<typeof useAuthStore.getState>['user'] }) {

  const tournaments = useQuery({
    queryKey: ['tournaments', 'dashboard'],
    queryFn: () => tournamentService.list(),
  });
  const teams = useQuery({ queryKey: ['teams'], queryFn: () => teamService.list() });
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  });
  const stageQueries = useQueries({
    queries:
      tournaments.data?.content.slice(0, 12).map((tournament) => ({
        queryKey: ['stages', tournament.id],
        queryFn: () => competitionService.stages(tournament.id),
      })) ?? [],
  });
  const stages = stageQueries.flatMap((query) => query.data ?? []);
  const fixtureQueries = useQueries({
    queries: stages.map((stage) => ({
      queryKey: ['fixtures', stage.id],
      queryFn: () => competitionService.fixtures(stage.id),
    })),
  });
  const pendingQueries = useQueries({
    queries:
      tournaments.data?.content.slice(0, 12).map((tournament) => ({
        queryKey: ['registrations', tournament.id, 'PENDING'],
        queryFn: () => registrationService.list(tournament.id, 'PENDING'),
        retry: false,
      })) ?? [],
  });

  const activeTournaments =
    tournaments.data?.content.filter((item) =>
      ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS'].includes(
        item.status,
      ),
    ).length ?? 0;
  const upcomingFixtures = fixtureQueries
    .flatMap((query) => query.data ?? [])
    .filter((fixture) => fixture.scheduledAt && new Date(fixture.scheduledAt) > new Date())
    .sort(
      (left, right) =>
        new Date(left.scheduledAt!).getTime() - new Date(right.scheduledAt!).getTime(),
    );
  const pendingApprovals = pendingQueries.reduce(
    (total, query) => total + (query.data?.totalElements ?? 0),
    0,
  );

  return (
    <PageContainer
      title={`Welcome, ${user?.fullName?.split(' ')[0] ?? 'competitor'}`}
      description="Your live tournament, team, and match operations at a glance."
      action={
        <Link className="button button-primary" to="/tournaments">
          <Plus /> Create tournament
        </Link>
      }
    >
      <div className="dashboard-stats">
        <Stat icon={<Trophy />} label="Active tournaments" value={activeTournaments} tone="blue" />
        <Stat
          icon={<Users />}
          label="Registered teams"
          value={teams.data?.totalElements ?? 0}
          tone="green"
        />
        <Stat
          icon={<Calendar />}
          label="Upcoming matches"
          value={upcomingFixtures.length}
          tone="purple"
        />
        <Stat icon={<Clock />} label="Pending approvals" value={pendingApprovals} tone="orange" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <h2>Upcoming matches</h2>
              <p>Nearest scheduled fixtures across your tournament workspace.</p>
            </div>
            <Link to="/matches" className="text-link">
              View all <ArrowRight />
            </Link>
          </div>
          <div className="dashboard-list">
            {upcomingFixtures.slice(0, 6).map((fixture) => (
              <div key={fixture.id}>
                <div>
                  <strong>
                    {fixture.participants.map((participant) => participant.teamName).join(' vs ') ||
                      `Match ${fixture.matchNumber}`}
                  </strong>
                  <span>
                    Round {fixture.roundNumber} · {fixture.venue ?? 'Online'}
                  </span>
                </div>
                <time>{formatDateTime(fixture.scheduledAt)}</time>
              </div>
            ))}
            {upcomingFixtures.length === 0 && (
              <p className="muted-copy">No upcoming matches have been scheduled.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title-row">
            <div>
              <h2>Recent activity</h2>
              <p>Persistent notifications from registrations, results, and governance.</p>
            </div>
            <Link to="/notifications" className="text-link">
              Inbox <ArrowRight />
            </Link>
          </div>
          <div className="dashboard-list">
            {notifications.data?.content.slice(0, 6).map((item) => (
              <div key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                </div>
                <time>{formatDateTime(item.createdAt)}</time>
              </div>
            ))}
            {notifications.data?.content.length === 0 && (
              <p className="muted-copy">No recent activity.</p>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'blue' | 'green' | 'purple' | 'orange';
}) {
  return (
    <div className="dashboard-stat">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
