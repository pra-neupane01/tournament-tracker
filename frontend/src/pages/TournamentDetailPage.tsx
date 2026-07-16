import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CalendarClock, Plus, Trash2, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { tournamentService } from '../features/tournaments/tournamentService';
import type {
  TournamentRuleInput,
  TournamentStatus,
} from '../features/tournaments/types';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

export function TournamentDetailPage() {
  const { tournamentId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ruleOpen, setRuleOpen] = useState(false);
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
  const createRule = useMutation({
    mutationFn: (input: TournamentRuleInput) => tournamentService.createRule(tournamentId, input),
    onSuccess: async () => {
      setRuleOpen(false);
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
    createRule.mutate(rule);
  };

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={item} />
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
          <button
            className="button button-danger"
            onClick={() => removeTournament.mutate()}
            disabled={removeTournament.isPending}
          >
            <Trash2 /> Delete tournament
          </button>
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
            <button className="button button-primary" onClick={() => setRuleOpen(true)}>
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
                <button
                  className="icon-button danger"
                  onClick={() => removeRule.mutate(item.id)}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Modal open={ruleOpen} title="Add tournament rule" onClose={() => setRuleOpen(false)}>
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
          <button className="button button-primary" disabled={createRule.isPending}>
            {createRule.isPending ? 'Saving...' : 'Save rule'}
          </button>
        </form>
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
