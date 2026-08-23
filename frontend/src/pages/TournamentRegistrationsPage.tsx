import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Plus, Send, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { TournamentNav } from '../components/tournament/TournamentNav';
import { useAuthStore } from '../features/auth/authStore';
import { registrationFormService } from '../features/registrationForm/registrationFormService';
import type { RegistrationFormField } from '../features/registrationForm/types';
import { registrationService } from '../features/registrations/registrationService';
import type {
  RegistrationStatus,
  TournamentRegistration,
} from '../features/registrations/types';
import { teamService } from '../features/teams/teamService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

export function TournamentRegistrationsPage() {
  const { tournamentId = '' } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RegistrationStatus | ''>('');
  const [teamId, setTeamId] = useState('');
  const [rosterIds, setRosterIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [submitted, setSubmitted] = useState<TournamentRegistration | null>(null);

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const fields = useQuery({
    queryKey: ['registration-form', tournamentId],
    queryFn: () => registrationFormService.list(tournamentId),
  });
  const teams = useQuery({ queryKey: ['teams'], queryFn: () => teamService.list() });
  const roster = useQuery({
    queryKey: ['team-roster', teamId],
    queryFn: () => teamService.roster(teamId),
    enabled: Boolean(teamId),
  });
  const registrations = useQuery({
    queryKey: ['registrations', tournamentId, status],
    queryFn: () => registrationService.list(tournamentId, status || undefined),
    retry: false,
  });

  useEffect(() => {
    setRosterIds([]);
  }, [teamId]);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['registrations', tournamentId] });

  const submitRegistration = useMutation({
    mutationFn: () =>
      registrationService.submit(tournamentId, {
        teamId,
        rosterMemberIds: rosterIds,
        answers,
      }),
    onSuccess: async (result) => {
      setSubmitted(result);
      setNotice('');
      await refresh();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const review = useMutation({
    mutationFn: ({
      registrationId,
      nextStatus,
    }: {
      registrationId: string;
      nextStatus: RegistrationStatus;
    }) =>
      registrationService.review(registrationId, {
        status: nextStatus,
        reviewNotes: reviewNotes[registrationId] ?? '',
      }),
    onSuccess: refresh,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const withdraw = useMutation({
    mutationFn: registrationService.withdraw,
    onSuccess: (result) => {
      setSubmitted(result);
      void refresh();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const directAddMutation = useMutation({
    mutationFn: () => registrationService.directAdd(tournamentId, { teamId }),
    onSuccess: async (result) => {
      setSubmitted(result);
      setNotice('Team directly added successfully.');
      await refresh();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  if (tournament.isLoading) {
    return <LoadingState message="Loading registration workflow..." />;
  }
  if (tournament.isError || !tournament.data) {
    return <ErrorState message={getErrorMessage(tournament.error)} />;
  }

  const managedTeams =
    teams.data?.content.filter((team) => team.managerId === currentUser?.id) ?? [];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    submitRegistration.mutate();
  };

  const directAdd = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    directAddMutation.mutate();
  };

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={tournament.data} />
      <TournamentNav tournamentId={tournamentId} />
      <div className="tournament-page-body">
        {notice && <div className="alert alert-error mb-5">{notice}</div>}
        <div className="registration-grid">
          <section className="panel">
            <div className="section-heading">
              <Send />
              <div>
                <h2>Submit a team</h2>
                <p>Only team managers can submit, and the chosen roster is snapshotted.</p>
              </div>
            </div>
            {submitted && (
              <div className="alert alert-success mb-4">
                {submitted.teamName} is {submitted.status.toLowerCase()}. Registration ID:{' '}
                {submitted.id}
                {submitted.status !== 'WITHDRAWN' && (
                  <button
                    className="text-button"
                    onClick={() => withdraw.mutate(submitted.id)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            )}
            <form className="form-stack" onSubmit={submit}>
              <label className="field">
                <span>Managed team</span>
                <select value={teamId} onChange={(event) => setTeamId(event.target.value)} required>
                  <option value="">Select a team</option>
                  {managedTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} · {team.gameName}
                    </option>
                  ))}
                </select>
              </label>
              {teamId && (
                <fieldset className="selection-fieldset">
                  <legend>Roster snapshot</legend>
                  {roster.isLoading && <LoadingState message="Loading roster..." />}
                  {roster.data?.filter((member) => member.active).map((member) => (
                    <label key={member.id}>
                      <input
                        type="checkbox"
                        checked={rosterIds.includes(member.id)}
                        onChange={(event) =>
                          setRosterIds((current) =>
                            event.target.checked
                              ? [...current, member.id]
                              : current.filter((id) => id !== member.id),
                          )
                        }
                      />
                      <span>
                        <strong>{member.inGameName}</strong>
                        {member.fullName} · {member.role}
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              {fields.data?.map((field) => (
                <AnswerField
                  key={field.id}
                  field={field}
                  value={answers[field.fieldKey] ?? []}
                  onChange={(value) => setAnswers({ ...answers, [field.fieldKey]: value })}
                />
              ))}
              <button
                className="button button-primary"
                disabled={submitRegistration.isPending || !teamId || rosterIds.length === 0}
              >
                <Send /> {submitRegistration.isPending ? 'Submitting...' : 'Submit registration'}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="section-heading">
              <Users />
              <div>
                <h2>Directly add a team</h2>
                <p>Add an existing registered team directly to the tournament.</p>
              </div>
            </div>
            <form className="form-stack" onSubmit={directAdd}>
              <label className="field">
                <span>Select a team</span>
                <select value={teamId} onChange={(event) => setTeamId(event.target.value)} required>
                  <option value="">Select a team</option>
                  {teams.data?.content.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} · {team.gameName}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button button-primary"
                disabled={directAddMutation.isPending || !teamId}
              >
                <Plus /> {directAddMutation.isPending ? 'Adding...' : 'Directly add team'}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-title-row registration-review-heading">
              <div className="section-heading">
                <ClipboardCheck />
                <div>
                  <h2>Organizer review queue</h2>
                  <p>Approve, reject, or waitlist submitted team snapshots.</p>
                </div>
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as RegistrationStatus | '')}
              >
                <option value="">All statuses</option>
                {registrationStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {registrations.isLoading && <LoadingState message="Loading registrations..." />}
            {registrations.isError && (
              <div className="alert alert-error">
                {getErrorMessage(
                  registrations.error,
                  'Organizer access is required to view the full review queue.',
                )}
              </div>
            )}
            {registrations.data?.content.length === 0 && (
              <EmptyState title="No registrations in this view" />
            )}
            <div className="registration-list">
              {registrations.data?.content.map((item) => (
                <article key={item.id}>
                  <div className="registration-summary">
                    <div className="resource-icon">
                      <Users />
                    </div>
                    <div>
                      <div>
                        <h3>{item.teamName}</h3>
                        <span className="status-pill">{item.status}</span>
                      </div>
                      <p>
                        {item.roster.length} players · submitted by {item.submittedBy} ·{' '}
                        {formatDateTime(item.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <details>
                    <summary>Review application</summary>
                    <div className="registration-detail">
                      <div className="snapshot-list">
                        {item.roster.map((player) => (
                          <span key={player.userId}>
                            <ShieldCheck /> {player.inGameName} · {player.rosterRole}
                          </span>
                        ))}
                      </div>
                      {Object.entries(item.answers).map(([key, values]) => (
                        <div className="answer-row" key={key}>
                          <strong>{key.replaceAll('_', ' ')}</strong>
                          <span>{values.join(', ') || '—'}</span>
                        </div>
                      ))}
                      <label className="field">
                        <span>Review notes</span>
                        <textarea
                          rows={2}
                          value={reviewNotes[item.id] ?? item.reviewNotes ?? ''}
                          onChange={(event) =>
                            setReviewNotes({ ...reviewNotes, [item.id]: event.target.value })
                          }
                        />
                      </label>
                      <div className="review-actions">
                        {(['APPROVED', 'WAITLISTED', 'REJECTED'] as RegistrationStatus[]).map(
                          (nextStatus) => (
                            <button
                              key={nextStatus}
                              className="button button-secondary"
                              onClick={() =>
                                review.mutate({ registrationId: item.id, nextStatus })
                              }
                            >
                              {nextStatus.replaceAll('_', ' ')}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const registrationStatuses: RegistrationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'WAITLISTED',
  'WITHDRAWN',
];

function AnswerField({
  field,
  value,
  onChange,
}: {
  field: RegistrationFormField;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const common = {
    required: field.required,
    placeholder: field.placeholder ?? '',
  };

  if (field.type === 'CHECKBOX') {
    return (
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={value[0] === 'true'}
          onChange={(event) => onChange([String(event.target.checked)])}
        />
        {field.label}
      </label>
    );
  }
  if (field.type === 'SELECT') {
    return (
      <label className="field">
        <span>{field.label}</span>
        <select value={value[0] ?? ''} onChange={(event) => onChange([event.target.value])} {...common}>
          <option value="">Select an option</option>
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'MULTI_SELECT') {
    return (
      <label className="field">
        <span>{field.label}</span>
        <select
          multiple
          value={value}
          onChange={(event) =>
            onChange(Array.from(event.target.selectedOptions, (option) => option.value))
          }
          required={field.required}
        >
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'TEXTAREA') {
    return (
      <label className="field">
        <span>{field.label}</span>
        <textarea
          rows={3}
          value={value[0] ?? ''}
          onChange={(event) => onChange([event.target.value])}
          {...common}
        />
      </label>
    );
  }
  return (
    <label className="field">
      <span>{field.label}</span>
      <input
        type={
          field.type === 'EMAIL'
            ? 'email'
            : field.type === 'NUMBER'
              ? 'number'
              : field.type === 'DATE'
                ? 'date'
                : 'text'
        }
        value={value[0] ?? ''}
        onChange={(event) => onChange([event.target.value])}
        minLength={field.minimumLength ?? undefined}
        maxLength={field.maximumLength ?? undefined}
        pattern={field.validationPattern ?? undefined}
        {...common}
      />
      {field.helpText && <small className="field-help">{field.helpText}</small>}
    </label>
  );
}
