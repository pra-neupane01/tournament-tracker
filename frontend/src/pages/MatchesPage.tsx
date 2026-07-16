import { useQuery } from '@tanstack/react-query';
import { Calendar, Search, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { PageContainer } from '../components/layout/PageContainer';
import { competitionService } from '../features/competition/competitionService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

export function MatchesPage() {
  const [query, setQuery] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [stageId, setStageId] = useState('');
  const tournaments = useQuery({
    queryKey: ['tournaments', 'match-directory', query],
    queryFn: () => tournamentService.list({ query: query || undefined }),
  });
  const stages = useQuery({
    queryKey: ['stages', tournamentId],
    queryFn: () => competitionService.stages(tournamentId),
    enabled: Boolean(tournamentId),
  });
  const fixtures = useQuery({
    queryKey: ['fixtures', stageId],
    queryFn: () => competitionService.fixtures(stageId),
    enabled: Boolean(stageId),
  });

  useEffect(() => {
    if (!tournamentId && tournaments.data?.content.length) {
      setTournamentId(tournaments.data.content[0].id);
    }
  }, [tournamentId, tournaments.data]);

  useEffect(() => {
    if (!stageId && stages.data?.length) {
      setStageId(stages.data[0].id);
    }
  }, [stageId, stages.data]);

  return (
    <PageContainer
      title="Match operations"
      description="Find fixtures across tournaments and open their live operations console."
    >
      <div className="match-directory-filters">
        <label className="search-box">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tournaments"
          />
        </label>
        <label className="field">
          <span>Tournament</span>
          <select
            value={tournamentId}
            onChange={(event) => {
              setTournamentId(event.target.value);
              setStageId('');
            }}
          >
            <option value="">Select tournament</option>
            {tournaments.data?.content.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Stage</span>
          <select value={stageId} onChange={(event) => setStageId(event.target.value)}>
            <option value="">Select stage</option>
            {stages.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(tournaments.isLoading || stages.isLoading || fixtures.isLoading) && (
        <LoadingState message="Loading fixtures..." />
      )}
      {(tournaments.isError || stages.isError || fixtures.isError) && (
        <ErrorState
          message={getErrorMessage(tournaments.error ?? stages.error ?? fixtures.error)}
        />
      )}
      {fixtures.data?.length === 0 && <EmptyState title="No fixtures in this stage" />}
      <div className="match-directory-grid">
        {fixtures.data?.map((fixture) => (
          <Link
            key={fixture.id}
            className="panel"
            to={`/tournaments/${tournamentId}/stages/${stageId}/fixtures/${fixture.id}`}
          >
            <div className="panel-title-row">
              <div className="resource-icon">
                <Trophy />
              </div>
              <span className="status-pill">{fixture.status}</span>
            </div>
            <span className="eyebrow">
              Round {fixture.roundNumber} · Match {fixture.matchNumber}
            </span>
            <h2>
              {fixture.participants.map((participant) => participant.teamName).join(' vs ') ||
                'Participants TBD'}
            </h2>
            <p>
              <Calendar /> {formatDateTime(fixture.scheduledAt)}
            </p>
            <small>
              {fixture.venue ?? 'Online'} · {fixture.groupName ?? 'Open bracket'}
            </small>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
