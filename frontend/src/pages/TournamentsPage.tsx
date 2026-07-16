import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Search, Trophy, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { PageContainer } from '../components/layout/PageContainer';
import { gameService } from '../features/games/gameService';
import { organizationService } from '../features/organizations/organizationService';
import { tournamentService } from '../features/tournaments/tournamentService';
import type {
  TournamentFormat,
  TournamentInput,
  TournamentStatus,
} from '../features/tournaments/types';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

const emptyTournament: TournamentInput = {
  organizationId: '',
  gameId: '',
  name: '',
  slug: '',
  description: '',
  format: 'SINGLE_ELIMINATION',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  registrationOpensAt: null,
  registrationClosesAt: null,
  startsAt: '',
  endsAt: null,
  minimumTeams: 2,
  maximumTeams: 32,
  minimumRosterSize: 1,
  maximumRosterSize: 5,
  allowSubstitutes: true,
  publicVisible: true,
};

export function TournamentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TournamentStatus | ''>('');
  const [gameId, setGameId] = useState('');
  const [open, setOpen] = useState(false);
  const [tournament, setTournament] = useState(emptyTournament);
  const [notice, setNotice] = useState('');

  const games = useQuery({ queryKey: ['games'], queryFn: () => gameService.list() });
  const organizations = useQuery({
    queryKey: ['organizations', 'tournament-form'],
    queryFn: () => organizationService.list(),
  });
  const tournaments = useQuery({
    queryKey: ['tournaments', query, status, gameId],
    queryFn: () =>
      tournamentService.list({
        query: query || undefined,
        status: status || undefined,
        gameId: gameId || undefined,
      }),
  });
  const createTournament = useMutation({
    mutationFn: tournamentService.create,
    onSuccess: async (created) => {
      setOpen(false);
      setTournament(emptyTournament);
      await queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      navigate(`/tournaments/${created.id}`);
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    createTournament.mutate(tournament);
  };

  return (
    <PageContainer
      title="Tournaments"
      description="Create, publish, and operate structured competitions."
      action={
        <button className="button button-primary" onClick={() => setOpen(true)}>
          <Plus /> Create tournament
        </button>
      }
    >
      <div className="page-toolbar tournament-filters">
        <label className="search-box">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tournaments"
          />
        </label>
        <select value={gameId} onChange={(event) => setGameId(event.target.value)}>
          <option value="">All games</option>
          {games.data?.content.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TournamentStatus | '')}
        >
          <option value="">All statuses</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {tournaments.isLoading && <LoadingState message="Loading tournaments..." />}
      {tournaments.isError && <ErrorState message={getErrorMessage(tournaments.error)} />}
      {tournaments.data?.content.length === 0 && <EmptyState title="No tournaments found" />}
      <div className="tournament-grid">
        {tournaments.data?.content.map((item) => (
          <Link to={`/tournaments/${item.id}`} className="tournament-card" key={item.id}>
            <div className="tournament-card-top">
              <div className="resource-icon">
                <Trophy />
              </div>
              <span className="status-pill">{item.status.replaceAll('_', ' ')}</span>
            </div>
            <div>
              <span className="eyebrow">{item.organizationName}</span>
              <h2>{item.name}</h2>
              <p>{item.gameName} · {item.format.replaceAll('_', ' ')}</p>
            </div>
            <div className="tournament-card-meta">
              <span>
                <CalendarDays /> {formatDateTime(item.startsAt)}
              </span>
              <span>
                <Users /> {item.minimumTeams}–{item.maximumTeams} teams
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Modal open={open} title="Create tournament" onClose={() => setOpen(false)}>
        <form className="form-stack" onSubmit={submit}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field">
            <span>Organization</span>
            <select
              value={tournament.organizationId}
              onChange={(event) =>
                setTournament({ ...tournament, organizationId: event.target.value })
              }
              required
            >
              <option value="">Select organization</option>
              {organizations.data?.content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Game</span>
            <select
              value={tournament.gameId}
              onChange={(event) => setTournament({ ...tournament, gameId: event.target.value })}
              required
            >
              <option value="">Select game</option>
              {games.data?.content.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input
                value={tournament.name}
                onChange={(event) =>
                  setTournament({
                    ...tournament,
                    name: event.target.value,
                    slug: event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-|-$/g, ''),
                  })
                }
                required
              />
            </label>
            <label className="field">
              <span>Slug</span>
              <input
                value={tournament.slug}
                onChange={(event) => setTournament({ ...tournament, slug: event.target.value })}
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                required
              />
            </label>
          </div>
          <label className="field">
            <span>Format</span>
            <select
              value={tournament.format}
              onChange={(event) =>
                setTournament({
                  ...tournament,
                  format: event.target.value as TournamentFormat,
                })
              }
            >
              {formatOptions.map((format) => (
                <option key={format} value={format}>
                  {format.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              rows={3}
              value={tournament.description}
              onChange={(event) =>
                setTournament({ ...tournament, description: event.target.value })
              }
            />
          </label>
          <div className="form-grid">
            <DateField
              label="Registration opens"
              value={tournament.registrationOpensAt}
              onChange={(value) => setTournament({ ...tournament, registrationOpensAt: value })}
            />
            <DateField
              label="Registration closes"
              value={tournament.registrationClosesAt}
              onChange={(value) => setTournament({ ...tournament, registrationClosesAt: value })}
            />
            <DateField
              label="Tournament starts"
              value={tournament.startsAt}
              required
              onChange={(value) => setTournament({ ...tournament, startsAt: value ?? '' })}
            />
            <DateField
              label="Tournament ends"
              value={tournament.endsAt}
              onChange={(value) => setTournament({ ...tournament, endsAt: value })}
            />
          </div>
          <div className="form-grid">
            <NumberField
              label="Minimum teams"
              value={tournament.minimumTeams}
              onChange={(value) => setTournament({ ...tournament, minimumTeams: value })}
            />
            <NumberField
              label="Maximum teams"
              value={tournament.maximumTeams}
              onChange={(value) => setTournament({ ...tournament, maximumTeams: value })}
            />
            <NumberField
              label="Minimum roster"
              value={tournament.minimumRosterSize}
              onChange={(value) => setTournament({ ...tournament, minimumRosterSize: value })}
            />
            <NumberField
              label="Maximum roster"
              value={tournament.maximumRosterSize}
              onChange={(value) => setTournament({ ...tournament, maximumRosterSize: value })}
            />
          </div>
          <label className="field">
            <span>Time zone</span>
            <input
              value={tournament.timeZone}
              onChange={(event) => setTournament({ ...tournament, timeZone: event.target.value })}
              required
            />
          </label>
          <div className="check-row">
            <label>
              <input
                type="checkbox"
                checked={tournament.allowSubstitutes}
                onChange={(event) =>
                  setTournament({ ...tournament, allowSubstitutes: event.target.checked })
                }
              />
              Allow substitutes
            </label>
            <label>
              <input
                type="checkbox"
                checked={tournament.publicVisible}
                onChange={(event) =>
                  setTournament({ ...tournament, publicVisible: event.target.checked })
                }
              />
              Publicly visible
            </label>
          </div>
          <button className="button button-primary" disabled={createTournament.isPending}>
            {createTournament.isPending ? 'Creating...' : 'Create tournament'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}

const statusOptions: TournamentStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const formatOptions: TournamentFormat[] = [
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
  'BATTLE_ROYALE',
  'CUSTOM',
];

function DateField({
  label,
  value,
  required,
  onChange,
}: {
  label: string;
  value: string | null;
  required?: boolean;
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="datetime-local"
        value={value ?? ''}
        required={required}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
