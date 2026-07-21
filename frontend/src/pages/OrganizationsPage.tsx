import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Edit3,
  Globe2,
  Plus,
  Search,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { gameService } from '../features/games/gameService';
import { tournamentService } from '../features/tournaments/tournamentService';
import type { TournamentFormat, TournamentInput } from '../features/tournaments/types';
import { useState, type FormEvent } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { PageContainer } from '../components/layout/PageContainer';
import { organizationService } from '../features/organizations/organizationService';
import type {
  MembershipRole,
  OrganizationInput,
  OrganizationType,
} from '../features/organizations/types';
import { getErrorMessage } from '../utils/apiError';

const emptyOrganization: OrganizationInput = {
  name: '',
  type: 'EDUCATIONAL_INSTITUTION',
  description: '',
  website: '',
  country: '',
  city: '',
};

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [organization, setOrganization] = useState(emptyOrganization);
  const [member, setMember] = useState<{ email: string; role: MembershipRole }>({
    email: '',
    role: 'MEMBER',
  });
  const [notice, setNotice] = useState('');

  const organizations = useQuery({
    queryKey: ['organizations', search],
    queryFn: () => organizationService.list(search),
  });
  const members = useQuery({
    queryKey: ['organization-members', selectedId],
    queryFn: () => organizationService.members(selectedId!),
    enabled: Boolean(selectedId),
    retry: false,
  });

  const refreshMembers = () =>
    queryClient.invalidateQueries({ queryKey: ['organization-members', selectedId] });

  const saveOrganization = useMutation({
    mutationFn: () =>
      editingId
        ? organizationService.update(editingId, organization)
        : organizationService.create(organization),
    onSuccess: async (created) => {
      setCreateOpen(false);
      setEditingId(null);
      setOrganization(emptyOrganization);
      setSelectedId(created.id);
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeOrganization = useMutation({
    mutationFn: organizationService.remove,
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const addMember = useMutation({
    mutationFn: () => organizationService.addMember(selectedId!, member),
    onSuccess: async () => {
      setMember({ email: '', role: 'MEMBER' });
      setNotice('');
      await refreshMembers();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const updateMember = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: MembershipRole }) =>
      organizationService.updateMember(selectedId!, membershipId, role),
    onSuccess: refreshMembers,
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const removeMember = useMutation({
    mutationFn: (membershipId: string) =>
      organizationService.removeMember(selectedId!, membershipId),
    onSuccess: refreshMembers,
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const selected = organizations.data?.content.find((item) => item.id === selectedId);

  const submitOrganization = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    saveOrganization.mutate();
  };

  return (
    <PageContainer
      title="Organizations & institutions"
      description="Create organizer profiles and manage their members."
      action={
        <button
          className="button button-primary"
          onClick={() => {
            setEditingId(null);
            setOrganization(emptyOrganization);
            setCreateOpen(true);
          }}
        >
          <Plus /> New organization
        </button>
      }
    >
      <div className="page-toolbar">
        <label className="search-box">
          <Search />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search organizations"
          />
        </label>
      </div>

      {organizations.isLoading && <LoadingState message="Loading organizations..." />}
      {organizations.isError && (
        <ErrorState
          message={getErrorMessage(organizations.error)}
          onRetry={() => void organizations.refetch()}
        />
      )}
      {organizations.data?.content.length === 0 && (
        <EmptyState
          title="No organizations yet"
          message="Create an institution, esports organization, or independent organizer."
        />
      )}

      <div className="split-workspace">
        <div className="card-grid">
          {organizations.data?.content.map((item) => (
            <button
              key={item.id}
              className={`resource-card ${selectedId === item.id ? 'resource-card-active' : ''}`}
              onClick={() => {
                setNotice('');
                setSelectedId(item.id);
              }}
            >
              <div className="resource-icon">
                <Building2 />
              </div>
              <div>
                <div className="resource-title">
                  <h2>{item.name}</h2>
                  {item.verified && <span className="badge badge-success">Verified</span>}
                </div>
                <p>{item.type.replaceAll('_', ' ')}</p>
                <span>
                  <Globe2 /> {[item.city, item.country].filter(Boolean).join(', ') || 'Global'}
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
                <h2>{selected.name} members</h2>
                <p>Invite registered users and assign organization access.</p>
              </div>
              <div className="review-actions">
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditingId(selected.id);
                    setOrganization({
                      name: selected.name,
                      type: selected.type,
                      description: selected.description ?? '',
                      website: selected.website ?? '',
                      country: selected.country ?? '',
                      city: selected.city ?? '',
                    });
                    setCreateOpen(true);
                  }}
                  aria-label="Edit organization"
                >
                  <Edit3 />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => removeOrganization.mutate(selected.id)}
                  aria-label="Delete organization"
                >
                  <Trash2 />
                </button>
              </div>
            </div>

            {notice && <div className="alert alert-error">{notice}</div>}
            <form
              className="inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                addMember.mutate();
              }}
            >
              <input
                type="email"
                value={member.email}
                onChange={(event) => setMember({ ...member, email: event.target.value })}
                placeholder="member@example.com"
                required
              />
              <select
                value={member.role}
                onChange={(event) =>
                  setMember({ ...member, role: event.target.value as MembershipRole })
                }
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button className="button button-primary" disabled={addMember.isPending}>
                <UserPlus /> Add
              </button>
            </form>

            {members.isLoading && <LoadingState message="Loading members..." />}
            {members.isError && (
              <div className="alert alert-error">
                {getErrorMessage(
                  members.error,
                  'Only organization members can view and manage this roster.',
                )}
              </div>
            )}
            <div className="member-list">
              {members.data?.map((item) => (
                <div className="member-row" key={item.id}>
                  <div>
                    <strong>{item.fullName}</strong>
                    <span>{item.email}</span>
                  </div>
                  <select
                    value={item.organizationRole}
                    disabled={item.organizationRole === 'OWNER'}
                    onChange={(event) =>
                      updateMember.mutate({
                        membershipId: item.id,
                        role: event.target.value as MembershipRole,
                      })
                    }
                  >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <button
                    className="icon-button danger"
                    disabled={item.organizationRole === 'OWNER'}
                    onClick={() => removeMember.mutate(item.id)}
                    aria-label={`Remove ${item.fullName}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="section-heading detail-actions" style={{ marginTop: '2rem' }}>
              <Trophy />
              <div>
                <h2>{selected.name} Tournaments</h2>
                <p>Manage tournaments for this organization.</p>
              </div>
            </div>
            
            <OrganizationTournaments organizationId={selected.id} />
          </aside>
        )}
      </div>

      <Modal
        open={createOpen}
        title={editingId ? 'Edit organization' : 'Create organization'}
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={submitOrganization} className="form-stack">
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field">
            <span>Name</span>
            <input
              value={organization.name}
              onChange={(event) => setOrganization({ ...organization, name: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Organization type</span>
            <select
              value={organization.type}
              onChange={(event) =>
                setOrganization({
                  ...organization,
                  type: event.target.value as OrganizationType,
                })
              }
            >
              <option value="EDUCATIONAL_INSTITUTION">Educational institution</option>
              <option value="ESPORTS_ORGANIZATION">Esports organization</option>
              <option value="INDEPENDENT_ORGANIZER">Independent organizer</option>
            </select>
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={organization.description}
              onChange={(event) =>
                setOrganization({ ...organization, description: event.target.value })
              }
              rows={3}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>City</span>
              <input
                value={organization.city}
                onChange={(event) => setOrganization({ ...organization, city: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Country</span>
              <input
                value={organization.country}
                onChange={(event) =>
                  setOrganization({ ...organization, country: event.target.value })
                }
              />
            </label>
          </div>
          <label className="field">
            <span>Website</span>
            <input
              value={organization.website}
              onChange={(event) =>
                setOrganization({ ...organization, website: event.target.value })
              }
              placeholder="https://"
            />
          </label>
          <button className="button button-primary" disabled={saveOrganization.isPending}>
            {saveOrganization.isPending
              ? 'Saving...'
              : editingId
                ? 'Save organization'
                : 'Create organization'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}

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

const formatOptions: TournamentFormat[] = [
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'ROUND_ROBIN',
  'SWISS',
  'BATTLE_ROYALE',
  'CUSTOM',
];

function OrganizationTournaments({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tournament, setTournament] = useState({ ...emptyTournament, organizationId });
  const [notice, setNotice] = useState('');
  const [teamType, setTeamType] = useState<'Solo' | 'Duo' | 'Squad'>('Squad');

  const games = useQuery({ queryKey: ['games'], queryFn: () => gameService.list() });
  const tournaments = useQuery({
    queryKey: ['tournaments', { organizationId }],
    queryFn: () => tournamentService.list({}),
  });
  
  const orgTournaments = tournaments.data?.content.filter(t => t.organizationId === organizationId) || [];

  const createTournament = useMutation({
    mutationFn: tournamentService.create,
    onSuccess: async (created) => {
      setOpen(false);
      setTournament({ ...emptyTournament, organizationId });
      await queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      navigate(`/tournaments/${created.id}`);
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    
    // Front-end date validation
    if (tournament.registrationClosesAt && tournament.startsAt && new Date(tournament.registrationClosesAt) > new Date(tournament.startsAt)) {
      setNotice('Registration close must be before the tournament starts.');
      return;
    }
    if (tournament.registrationOpensAt && tournament.registrationClosesAt && new Date(tournament.registrationClosesAt) < new Date(tournament.registrationOpensAt)) {
      setNotice('Registration close must be after registration open.');
      return;
    }

    let minRoster = tournament.minimumRosterSize;
    let maxRoster = tournament.maximumRosterSize;
    
    const selectedGame = games.data?.content.find(g => g.id === tournament.gameId);
    const isFreeFire = selectedGame?.name.toLowerCase().includes('freefire') || selectedGame?.name.toLowerCase().includes('free fire');
    
    if (isFreeFire) {
      if (teamType === 'Solo') {
        minRoster = 1; maxRoster = 1;
      } else if (teamType === 'Duo') {
        minRoster = 2; maxRoster = 2;
      } else {
        minRoster = 4; maxRoster = 5;
      }
    }

    createTournament.mutate({
        ...tournament,
        organizationId,
        minimumRosterSize: minRoster,
        maximumRosterSize: maxRoster,
    });
  };

  return (
    <>
      <button className="button button-primary" onClick={() => setOpen(true)} style={{ marginBottom: '1rem' }}>
        <Plus /> Create tournament
      </button>

      {tournaments.isLoading && <LoadingState message="Loading tournaments..." />}
      {orgTournaments.length === 0 && !tournaments.isLoading && <p className="text-sm text-[var(--color-text-muted)]">No tournaments found for this organization.</p>}
      
      <div className="tournament-grid">
        {orgTournaments.map((item) => (
          <Link to={`/tournaments/${item.id}`} className="tournament-card" key={item.id} style={{ display: 'block', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} />
                <strong>{item.name}</strong>
              </div>
              <span className="badge">{item.status.replaceAll('_', ' ')}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {item.gameName} · {item.format.replaceAll('_', ' ')}
            </div>
          </Link>
        ))}
      </div>

      <Modal open={open} title="Create tournament" onClose={() => setOpen(false)}>
        <form className="form-stack" onSubmit={submit}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <div className="field">
            <span>Select Game</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {games.data?.content.map((game) => {
                const isSelected = tournament.gameId === game.id;
                return (
                  <div 
                    key={game.id} 
                    onClick={() => {
                        const isFreeFire = game.name.toLowerCase().includes('freefire') || game.name.toLowerCase().includes('free fire');
                        setTournament({ ...tournament, gameId: game.id, format: isFreeFire ? 'BATTLE_ROYALE' : 'SINGLE_ELIMINATION' });
                        if (isFreeFire) setTeamType('Squad');
                    }}
                    style={{ 
                        padding: '1rem', 
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #334155', 
                        borderRadius: '0.5rem', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{game.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
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
          {(() => {
              const selectedGame = games.data?.content.find(g => g.id === tournament.gameId);
              const isFreeFire = selectedGame?.name.toLowerCase().includes('freefire') || selectedGame?.name.toLowerCase().includes('free fire');
              
              if (isFreeFire) {
                  return (
                      <div className="form-grid">
                        <label className="field">
                          <span>Format</span>
                          <select
                            value={tournament.format}
                            onChange={(event) => {
                                const newFormat = event.target.value as TournamentFormat;
                                setTournament({
                                    ...tournament,
                                    format: newFormat,
                                });
                                if (newFormat === 'CUSTOM') {
                                    setTeamType('Squad');
                                }
                            }}
                            required
                          >
                            <option value="BATTLE_ROYALE">Battle Royale</option>
                            <option value="CUSTOM">Clash Squad</option>
                          </select>
                        </label>
                        <label className="field">
                          <span>Team Type</span>
                          <select
                            value={teamType}
                            onChange={(event) => setTeamType(event.target.value as any)}
                            required
                          >
                            {tournament.format === 'BATTLE_ROYALE' ? (
                                <>
                                    <option value="Solo">Solo</option>
                                    <option value="Duo">Duo</option>
                                    <option value="Squad">Squad</option>
                                </>
                            ) : (
                                <option value="Squad">Squad</option>
                            )}
                          </select>
                        </label>
                      </div>
                  );
              } else {
                  return (
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
                          required
                        >
                          {formatOptions.map((format) => (
                            <option key={format} value={format}>
                              {format.replaceAll('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </label>
                  );
              }
          })()}
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
    </>
  );
}

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

