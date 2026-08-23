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
import { useAuthStore } from '../features/auth/authStore';

export function MatchesPage() {
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [stageId, setStageId] = useState('');
  const tournaments = useQuery({ queryKey: ['tournaments', 'match-directory', query], queryFn: () => tournamentService.list({ query: query || undefined }) });
  const stages = useQuery({ queryKey: ['stages', tournamentId], queryFn: () => competitionService.stages(tournamentId), enabled: Boolean(tournamentId) && user?.role !== 'PLAYER' });
  const fixtures = useQuery({ queryKey: ['fixtures', stageId], queryFn: () => competitionService.fixtures(stageId), enabled: Boolean(stageId) && user?.role !== 'PLAYER' });

  useEffect(() => {
    if (user?.role === 'PLAYER') return;
    if (!tournamentId && tournaments.data?.content.length) setTournamentId(tournaments.data.content[0].id);
  }, [tournamentId, tournaments.data, user?.role]);
  useEffect(() => {
    if (user?.role === 'PLAYER') return;
    if (!stageId && stages.data?.length) setStageId(stages.data[0].id);
  }, [stageId, stages.data, user?.role]);

  if (user?.role === 'PLAYER') {
    return <PlayerResultsPage tournaments={tournaments.data?.content ?? []} query={query} setQuery={setQuery} isLoading={tournaments.isLoading} error={tournaments.isError ? tournaments.error : null} />;
  }

  return (
    <PageContainer title="Match operations" description="Find fixtures across tournaments and open their live operations console.">
      <div className="match-directory-filters">
        <label className="search-box"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tournaments" /></label>
        <label className="field"><span>Tournament</span><select value={tournamentId} onChange={(event) => { setTournamentId(event.target.value); setStageId(''); }}><option value="">Select tournament</option>{tournaments.data?.content.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="field"><span>Stage</span><select value={stageId} onChange={(event) => setStageId(event.target.value)}><option value="">Select stage</option>{stages.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      {(tournaments.isLoading || stages.isLoading || fixtures.isLoading) && <LoadingState message="Loading fixtures..." />}
      {(tournaments.isError || stages.isError || fixtures.isError) && <ErrorState message={getErrorMessage(tournaments.error ?? stages.error ?? fixtures.error)} />}
      {fixtures.data?.length === 0 && <EmptyState title="No fixtures in this stage" />}
      <div className="match-directory-grid">{fixtures.data?.map((fixture) => <Link key={fixture.id} className="panel" to={`/tournaments/${tournamentId}/stages/${stageId}/fixtures/${fixture.id}`}><div className="panel-title-row"><div className="resource-icon"><Trophy /></div><span className="status-pill">{fixture.status}</span></div><span className="eyebrow">Round {fixture.roundNumber} · Match {fixture.matchNumber}</span><h2>{fixture.participants.map((participant) => participant.teamName).join(' vs ') || 'Participants TBD'}</h2><p><Calendar /> {formatDateTime(fixture.scheduledAt)}</p><small>{fixture.venue ?? 'Online'} · {fixture.groupName ?? 'Open bracket'}</small></Link>)}</div>
    </PageContainer>
  );
}

type ResultTournament = { id: string; name: string; gameName: string; startsAt: string; status?: string };

function PlayerResultsPage({ tournaments, query, setQuery, isLoading, error }: { tournaments: ResultTournament[]; query: string; setQuery: (value: string) => void; isLoading: boolean; error: unknown }) {
  const [game, setGame] = useState('All Games');
  const hasFilters = Boolean(query.trim()) || game !== 'All Games';
  const filtered = tournaments.filter((item) => (!query || item.name.toLowerCase().includes(query.toLowerCase())) && (game === 'All Games' || item.gameName === game));
  const demo = [
    { id: 'valorant-championship', name: 'Vanguard Championship Series 2024', gameName: 'Valorant', date: 'Oct 15, 2024', teams: ['Sentinels', 'Paper Rex', 'LOUD'], logos: ['#071424', '#281c55', '#143c18'] },
    { id: 'csgo-major', name: 'Global Offensive Major - Autumn', gameName: 'CS:GO 2', date: 'Sep 28, 2024', teams: ['FaZe Clan', 'Natus Vincere', 'Team Vitality'], logos: ['#421017', '#1e1d05', '#2d3245'] },
  ];
  const cards = filtered.length ? filtered.map((item) => ({ id: item.id, name: item.name, gameName: item.gameName, date: formatDateTime(item.startsAt), teams: ['Tournament winner', 'Finalist', 'Third place'], logos: ['#1a2840', '#281c55', '#143c18'], demo: false })) : !hasFilters && !error ? demo.map((item) => ({ ...item, demo: true })) : [];
  const games = ['All Games', ...Array.from(new Set(tournaments.map((item) => item.gameName)))];

  return (
    <div className="results-discovery-page">
      <section className="results-discovery-heading"><div><h1>Tournament Results</h1><p>Review outcomes from recent competitive events across all titles.</p></div><div className="results-discovery-filters"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tournaments..." /></label><select value={game} onChange={(event) => setGame(event.target.value)}>{games.map((item) => <option key={item}>{item}</option>)}</select></div></section>
      {isLoading && <LoadingState message="Loading tournament results..." />}
      {!isLoading && Boolean(error) && <ErrorState message={getErrorMessage(error)} />}
      {!isLoading && !error && cards.length === 0 && <EmptyState title="No results found" message="Try another tournament name or game filter." />}
      {!isLoading && !error && cards.length > 0 && <main className="results-discovery-grid">{cards.map((card) => <article className="results-card" key={card.id}><div className="results-card__heading"><h2>{card.name}</h2><div><span>{card.gameName}</span><time>Calendar {card.date}</time></div></div><div className="results-card__standings">{card.teams.map((team, index) => <div key={team}><strong className={`placement placement--${index + 1}`}>{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}</strong><span>{team}</span><i style={{ background: card.logos[index] }} /></div>)}</div><Link to={card.demo ? '/tournaments' : `/tournaments/${card.id}`}>{card.demo ? 'Browse tournaments' : 'View full standings'} <b>→</b></Link></article>)}</main>}
    </div>
  );
}
