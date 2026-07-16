import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Trash2, UserPlus, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { PageContainer } from '../components/layout/PageContainer';
import { gameService } from '../features/games/gameService';
import { organizationService } from '../features/organizations/organizationService';
import { teamService } from '../features/teams/teamService';
import type {
  RosterMember,
  RosterMemberInput,
  RosterRole,
  TeamInput,
} from '../features/teams/types';
import { getErrorMessage } from '../utils/apiError';

const emptyTeam: TeamInput = {
  name: '',
  shortName: '',
  logoUrl: '',
  gameId: '',
  organizationId: null,
};

const emptyMember: RosterMemberInput = {
  email: '',
  playerUid: '',
  inGameName: '',
  role: 'STARTER',
  active: true,
};

export function TeamsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [team, setTeam] = useState(emptyTeam);
  const [member, setMember] = useState(emptyMember);
  const [notice, setNotice] = useState('');

  const games = useQuery({ queryKey: ['games'], queryFn: () => gameService.list() });
  const organizations = useQuery({
    queryKey: ['organizations', 'team-form'],
    queryFn: () => organizationService.list(),
  });
  const teams = useQuery({
    queryKey: ['teams', gameFilter],
    queryFn: () => teamService.list(gameFilter),
  });
  const roster = useQuery({
    queryKey: ['team-roster', selectedId],
    queryFn: () => teamService.roster(selectedId!),
    enabled: Boolean(selectedId),
  });

  const refreshRoster = () => queryClient.invalidateQueries({ queryKey: ['team-roster', selectedId] });

  const createTeam = useMutation({
    mutationFn: teamService.create,
    onSuccess: async (created) => {
      setTeam(emptyTeam);
      setCreateOpen(false);
      setSelectedId(created.id);
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const addMember = useMutation({
    mutationFn: () => teamService.addRosterMember(selectedId!, member),
    onSuccess: async () => {
      setMember(emptyMember);
      setNotice('');
      await refreshRoster();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const updateMember = useMutation({
    mutationFn: ({ current, patch }: { current: RosterMember; patch: Partial<RosterMemberInput> }) =>
      teamService.updateRosterMember(selectedId!, current.id, {
        email: current.email,
        playerUid: current.playerUid,
        inGameName: current.inGameName,
        role: current.role,
        active: current.active,
        ...patch,
      }),
    onSuccess: refreshRoster,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeMember = useMutation({
    mutationFn: (memberId: string) => teamService.removeRosterMember(selectedId!, memberId),
    onSuccess: refreshRoster,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeTeam = useMutation({
    mutationFn: teamService.remove,
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const selected = teams.data?.content.find((item) => item.id === selectedId);

  const submitTeam = (event: FormEvent) => {
    event.preventDefault();
    createTeam.mutate(team);
  };

  return (
    <PageContainer
      title="Teams & rosters"
      description="Build game-specific teams and maintain competition-ready lineups."
      action={
        <button className="button button-primary" onClick={() => setCreateOpen(true)}>
          <Plus /> Create team
        </button>
      }
    >
      <div className="page-toolbar">
        <label className="field compact-field">
          <span>Filter by game</span>
          <select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)}>
            <option value="">All games</option>
            {games.data?.content.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {teams.isLoading && <LoadingState message="Loading teams..." />}
      {teams.isError && <ErrorState message={getErrorMessage(teams.error)} />}
      {teams.data?.content.length === 0 && <EmptyState title="No teams found" />}

      <div className="split-workspace">
        <div className="card-grid">
          {teams.data?.content.map((item) => (
            <button
              className={`resource-card ${selectedId === item.id ? 'resource-card-active' : ''}`}
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setNotice('');
              }}
            >
              <div className="resource-icon">
                <Shield />
              </div>
              <div>
                <div className="resource-title">
                  <h2>{item.name}</h2>
                  {item.shortName && <span className="badge">{item.shortName}</span>}
                </div>
                <p>{item.gameName}</p>
                <span>
                  <Users /> {item.organizationName ?? 'Independent'} · {item.managerName}
                </span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <aside className="panel workspace-detail">
            <div className="section-heading detail-actions">
              <Users />
              <div>
                <h2>{selected.name} roster</h2>
                <p>Manage player identities, roles, and active status.</p>
              </div>
              <button
                className="icon-button danger"
                onClick={() => removeTeam.mutate(selected.id)}
                aria-label="Delete team"
              >
                <Trash2 />
              </button>
            </div>
            {notice && <div className="alert alert-error mb-4">{notice}</div>}
            <form
              className="form-stack roster-form"
              onSubmit={(event) => {
                event.preventDefault();
                addMember.mutate();
              }}
            >
              <div className="form-grid">
                <label className="field">
                  <span>Registered email</span>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(event) => setMember({ ...member, email: event.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>In-game name</span>
                  <input
                    value={member.inGameName}
                    onChange={(event) => setMember({ ...member, inGameName: event.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Player UID</span>
                  <input
                    value={member.playerUid}
                    onChange={(event) => setMember({ ...member, playerUid: event.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Roster role</span>
                  <select
                    value={member.role}
                    onChange={(event) =>
                      setMember({ ...member, role: event.target.value as RosterRole })
                    }
                  >
                    <option value="CAPTAIN">Captain</option>
                    <option value="STARTER">Starter</option>
                    <option value="SUBSTITUTE">Substitute</option>
                    <option value="COACH">Coach</option>
                  </select>
                </label>
              </div>
              <button className="button button-primary" disabled={addMember.isPending}>
                <UserPlus /> Add roster member
              </button>
            </form>

            {roster.isLoading && <LoadingState message="Loading roster..." />}
            <div className="member-list">
              {roster.data?.map((item) => (
                <div className="roster-row" key={item.id}>
                  <div>
                    <strong>{item.inGameName}</strong>
                    <span>{item.fullName} · {item.playerUid}</span>
                  </div>
                  <select
                    value={item.role}
                    onChange={(event) =>
                      updateMember.mutate({
                        current: item,
                        patch: { role: event.target.value as RosterRole },
                      })
                    }
                  >
                    <option value="CAPTAIN">Captain</option>
                    <option value="STARTER">Starter</option>
                    <option value="SUBSTITUTE">Substitute</option>
                    <option value="COACH">Coach</option>
                  </select>
                  <label className="active-toggle">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(event) =>
                        updateMember.mutate({
                          current: item,
                          patch: { active: event.target.checked },
                        })
                      }
                    />
                    Active
                  </label>
                  <button
                    className="icon-button danger"
                    onClick={() => removeMember.mutate(item.id)}
                    aria-label={`Remove ${item.inGameName}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      <Modal open={createOpen} title="Create team" onClose={() => setCreateOpen(false)}>
        <form className="form-stack" onSubmit={submitTeam}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <div className="form-grid">
            <label className="field">
              <span>Team name</span>
              <input
                value={team.name}
                onChange={(event) => setTeam({ ...team, name: event.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Short name</span>
              <input
                maxLength={20}
                value={team.shortName}
                onChange={(event) => setTeam({ ...team, shortName: event.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>Game</span>
            <select
              value={team.gameId}
              onChange={(event) => setTeam({ ...team, gameId: event.target.value })}
              required
            >
              <option value="">Select a game</option>
              {games.data?.content.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Organization (optional)</span>
            <select
              value={team.organizationId ?? ''}
              onChange={(event) =>
                setTeam({ ...team, organizationId: event.target.value || null })
              }
            >
              <option value="">Independent team</option>
              {organizations.data?.content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Logo URL (optional)</span>
            <input
              value={team.logoUrl}
              onChange={(event) => setTeam({ ...team, logoUrl: event.target.value })}
            />
          </label>
          <button className="button button-primary" disabled={createTeam.isPending}>
            {createTeam.isPending ? 'Creating...' : 'Create team'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}
