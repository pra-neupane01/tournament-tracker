import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CalendarClock, Edit3, Plus, Trash2, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { TournamentNav } from '../components/tournament/TournamentNav';
import { tournamentService } from '../features/tournaments/tournamentService';
import type {
  TournamentFormat,
  TournamentInput,
  TournamentRuleInput,
  TournamentStatus,
} from '../features/tournaments/types';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime, toLocalDateTimeInput } from '../utils/date';

export function TournamentDetailPage() {
  const { tournamentId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleEditingId, setRuleEditingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState<TournamentInput | null>(null);
  const [rule, setRule] = useState<TournamentRuleInput>({
    title: '',
    content: '',
    sortOrder: 0,
  });
  const [notice, setNotice] = useState('');

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const rules = useQuery({
    queryKey: ['tournament-rules', tournamentId],
    queryFn: () => tournamentService.rules(tournamentId),
  });
  const updateStatus = useMutation({
    mutationFn: (status: TournamentStatus) => tournamentService.updateStatus(tournamentId, status),
    onSuccess: async () => {
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      await queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const updateTournament = useMutation({
    mutationFn: () => tournamentService.update(tournamentId, edit!),
    onSuccess: async () => {
      setEditOpen(false);
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      await queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const saveRule = useMutation({
    mutationFn: (input: TournamentRuleInput) =>
      ruleEditingId
        ? tournamentService.updateRule(tournamentId, ruleEditingId, input)
        : tournamentService.createRule(tournamentId, input),
    onSuccess: async () => {
      setRuleOpen(false);
      setRuleEditingId(null);
      setRule({ title: '', content: '', sortOrder: 0 });
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['tournament-rules', tournamentId] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeRule = useMutation({
    mutationFn: (ruleId: string) => tournamentService.removeRule(tournamentId, ruleId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tournament-rules', tournamentId] }),
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeTournament = useMutation({
    mutationFn: () => tournamentService.remove(tournamentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      navigate('/tournaments');
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  if (tournament.isLoading) {
    return <LoadingState message="Loading tournament..." />;
  }
  if (tournament.isError || !tournament.data) {
    return <ErrorState message={getErrorMessage(tournament.error)} />;
  }

  const item = tournament.data;
  const submitRule = (event: FormEvent) => {
    event.preventDefault();
    saveRule.mutate(rule);
  };

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={item} />
      <TournamentNav tournamentId={tournamentId} />
      <div className="tournament-page-body">
        {notice && <div className="alert alert-error mb-5">{notice}</div>}
        <div className="tournament-actions">
          <label className="field compact-field">
            <span>Lifecycle status</span>
            <select
              value={item.status}
              onChange={(event) => updateStatus.mutate(event.target.value as TournamentStatus)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <div className="review-actions">
            <button
              className="button button-secondary"
              onClick={() => {
                setEdit({
                  organizationId: item.organizationId,
                  gameId: item.gameId,
                  name: item.name,
                  slug: item.slug,
                  description: item.description ?? '',
                  format: item.format,
                  timeZone: item.timeZone,
                  registrationOpensAt: item.registrationOpensAt
                    ? toLocalDateTimeInput(item.registrationOpensAt)
                    : null,
                  registrationClosesAt: item.registrationClosesAt
                    ? toLocalDateTimeInput(item.registrationClosesAt)
                    : null,
                  startsAt: toLocalDateTimeInput(item.startsAt),
                  endsAt: item.endsAt ? toLocalDateTimeInput(item.endsAt) : null,
                  minimumTeams: item.minimumTeams,
                  maximumTeams: item.maximumTeams,
                  minimumRosterSize: item.minimumRosterSize,
                  maximumRosterSize: item.maximumRosterSize,
                  allowSubstitutes: item.allowSubstitutes,
                  publicVisible: item.publicVisible,
                });
                setEditOpen(true);
              }}
            >
              <Edit3 /> Edit tournament
            </button>
            <button
              className="button button-danger"
              onClick={() => removeTournament.mutate()}
              disabled={removeTournament.isPending}
            >
              <Trash2 /> Delete tournament
            </button>
          </div>
        </div>

        <div className="overview-grid">
          <section className="panel">
            <div className="section-heading">
              <CalendarClock />
              <div>
                <h2>Schedule & registration</h2>
                <p>All times use {item.timeZone}.</p>
              </div>
            </div>
            <dl className="detail-list">
              <div><dt>Registration opens</dt><dd>{formatDateTime(item.registrationOpensAt)}</dd></div>
              <div><dt>Registration closes</dt><dd>{formatDateTime(item.registrationClosesAt)}</dd></div>
              <div><dt>Starts</dt><dd>{formatDateTime(item.startsAt)}</dd></div>
              <div><dt>Ends</dt><dd>{formatDateTime(item.endsAt)}</dd></div>
            </dl>
          </section>
          <section className="panel">
            <div className="section-heading">
              <Users />
              <div>
                <h2>Entry constraints</h2>
                <p>Capacity and roster validation rules.</p>
              </div>
            </div>
            <dl className="detail-list">
              <div><dt>Teams</dt><dd>{item.minimumTeams}–{item.maximumTeams}</dd></div>
              <div><dt>Roster size</dt><dd>{item.minimumRosterSize}–{item.maximumRosterSize}</dd></div>
              <div><dt>Substitutes</dt><dd>{item.allowSubstitutes ? 'Allowed' : 'Not allowed'}</dd></div>
              <div><dt>Visibility</dt><dd>{item.publicVisible ? 'Public' : 'Private'}</dd></div>
            </dl>
          </section>
        </div>

        <section className="panel rules-panel">
          <div className="panel-title-row">
            <div className="section-heading">
              <BookOpen />
              <div>
                <h2>Tournament rulebook</h2>
                <p>Ordered rules shown to teams and officials.</p>
              </div>
            </div>
            <button
              className="button button-primary"
              onClick={() => {
                setRuleEditingId(null);
                setRule({ title: '', content: '', sortOrder: rules.data?.length ?? 0 });
                setRuleOpen(true);
              }}
            >
              <Plus /> Add rule
            </button>
          </div>
          {rules.isLoading && <LoadingState message="Loading rules..." />}
          <div className="rule-list">
            {rules.data?.map((item) => (
              <article key={item.id}>
                <div>
                  <span>{item.sortOrder + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                </div>
                <div className="review-actions">
                  <button
                    className="icon-button"
                    onClick={() => {
                      setRuleEditingId(item.id);
                      setRule({
                        title: item.title,
                        content: item.content,
                        sortOrder: item.sortOrder,
                      });
                      setRuleOpen(true);
                    }}
                    aria-label={`Edit ${item.title}`}
                  >
                    <Edit3 />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => removeRule.mutate(item.id)}
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={ruleOpen}
        title={ruleEditingId ? 'Edit tournament rule' : 'Add tournament rule'}
        onClose={() => setRuleOpen(false)}
      >
        <form className="form-stack" onSubmit={submitRule}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field">
            <span>Rule title</span>
            <input
              value={rule.title}
              onChange={(event) => setRule({ ...rule, title: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Content</span>
            <textarea
              rows={6}
              value={rule.content}
              onChange={(event) => setRule({ ...rule, content: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Sort order</span>
            <input
              type="number"
              min={0}
              value={rule.sortOrder}
              onChange={(event) => setRule({ ...rule, sortOrder: Number(event.target.value) })}
            />
          </label>
          <button className="button button-primary" disabled={saveRule.isPending}>
            {saveRule.isPending ? 'Saving...' : 'Save rule'}
          </button>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit tournament" onClose={() => setEditOpen(false)}>
        {edit && (
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              updateTournament.mutate();
            }}
          >
            {notice && <div className="alert alert-error">{notice}</div>}
            <div className="form-grid">
              <label className="field">
                <span>Name</span>
                <input
                  value={edit.name}
                  onChange={(event) => setEdit({ ...edit, name: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Slug</span>
                <input
                  value={edit.slug}
                  onChange={(event) => setEdit({ ...edit, slug: event.target.value })}
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Format</span>
              <select
                value={edit.format}
                onChange={(event) =>
                  setEdit({ ...edit, format: event.target.value as TournamentFormat })
                }
              >
                {formatOptions.map((format) => (
                  <option key={format}>{format}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={3}
                value={edit.description}
                onChange={(event) => setEdit({ ...edit, description: event.target.value })}
              />
            </label>
            <div className="form-grid">
              <EditDate
                label="Registration opens"
                value={edit.registrationOpensAt}
                onChange={(value) => setEdit({ ...edit, registrationOpensAt: value })}
              />
              <EditDate
                label="Registration closes"
                value={edit.registrationClosesAt}
                onChange={(value) => setEdit({ ...edit, registrationClosesAt: value })}
              />
              <EditDate
                label="Starts"
                value={edit.startsAt}
                required
                onChange={(value) => setEdit({ ...edit, startsAt: value ?? '' })}
              />
              <EditDate
                label="Ends"
                value={edit.endsAt}
                onChange={(value) => setEdit({ ...edit, endsAt: value })}
              />
            </div>
            <div className="form-grid">
              <EditNumber
                label="Minimum teams"
                value={edit.minimumTeams}
                onChange={(value) => setEdit({ ...edit, minimumTeams: value })}
              />
              <EditNumber
                label="Maximum teams"
                value={edit.maximumTeams}
                onChange={(value) => setEdit({ ...edit, maximumTeams: value })}
              />
              <EditNumber
                label="Minimum roster"
                value={edit.minimumRosterSize}
                onChange={(value) => setEdit({ ...edit, minimumRosterSize: value })}
              />
              <EditNumber
                label="Maximum roster"
                value={edit.maximumRosterSize}
                onChange={(value) => setEdit({ ...edit, maximumRosterSize: value })}
              />
            </div>
            <label className="field">
              <span>Time zone</span>
              <input
                value={edit.timeZone}
                onChange={(event) => setEdit({ ...edit, timeZone: event.target.value })}
                required
              />
            </label>
            <div className="check-row">
              <label>
                <input
                  type="checkbox"
                  checked={edit.allowSubstitutes}
                  onChange={(event) =>
                    setEdit({ ...edit, allowSubstitutes: event.target.checked })
                  }
                />
                Allow substitutes
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={edit.publicVisible}
                  onChange={(event) =>
                    setEdit({ ...edit, publicVisible: event.target.checked })
                  }
                />
                Publicly visible
              </label>
            </div>
            <button className="button button-primary" disabled={updateTournament.isPending}>
              {updateTournament.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        )}
      </Modal>
    </div>
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

function EditDate({
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

function EditNumber({
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
