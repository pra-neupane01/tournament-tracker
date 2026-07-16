import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Gavel,
  MessageSquare,
  Plus,
  RotateCcw,
  Scale,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { TournamentNav } from '../components/tournament/TournamentNav';
import { competitionService } from '../features/competition/competitionService';
import { governanceService } from '../features/governance/governanceService';
import type {
  DisputeStatus,
  PenaltyType,
} from '../features/governance/types';
import { registrationService } from '../features/registrations/registrationService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

export function TournamentGovernancePage() {
  const { tournamentId = '' } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'penalties' | 'disputes'>('penalties');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [penalty, setPenalty] = useState({
    registrationId: '',
    fixtureId: null as string | null,
    type: 'WARNING' as PenaltyType,
    pointsDeducted: 0,
    reason: '',
  });
  const [dispute, setDispute] = useState({
    fixtureId: '',
    registrationId: '',
    resultSubmissionId: null as string | null,
    category: '',
    description: '',
  });
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [comment, setComment] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | ''>('');

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const registrations = useQuery({
    queryKey: ['registrations', tournamentId, 'APPROVED'],
    queryFn: () => registrationService.list(tournamentId, 'APPROVED'),
    retry: false,
  });
  const stages = useQuery({
    queryKey: ['stages', tournamentId],
    queryFn: () => competitionService.stages(tournamentId),
  });
  const fixtures = useQuery({
    queryKey: ['fixtures', selectedStageId],
    queryFn: () => competitionService.fixtures(selectedStageId),
    enabled: Boolean(selectedStageId),
  });
  const penalties = useQuery({
    queryKey: ['penalties', tournamentId],
    queryFn: () => governanceService.penalties(tournamentId),
  });
  const disputes = useQuery({
    queryKey: ['disputes', tournamentId, statusFilter],
    queryFn: () => governanceService.disputes(tournamentId, statusFilter || undefined),
    retry: false,
  });

  useEffect(() => {
    if (!selectedStageId && stages.data?.length) {
      setSelectedStageId(stages.data[0].id);
    }
  }, [selectedStageId, stages.data]);

  const refreshPenalties = () =>
    queryClient.invalidateQueries({ queryKey: ['penalties', tournamentId] });
  const refreshDisputes = () =>
    queryClient.invalidateQueries({ queryKey: ['disputes', tournamentId] });

  const issuePenalty = useMutation({
    mutationFn: () => governanceService.issuePenalty(tournamentId, penalty),
    onSuccess: async () => {
      setPenaltyOpen(false);
      setPenalty({
        registrationId: '',
        fixtureId: null,
        type: 'WARNING',
        pointsDeducted: 0,
        reason: '',
      });
      await refreshPenalties();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const revokePenalty = useMutation({
    mutationFn: governanceService.revokePenalty,
    onSuccess: refreshPenalties,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const openDispute = useMutation({
    mutationFn: () =>
      governanceService.openDispute(dispute.fixtureId, {
        registrationId: dispute.registrationId,
        resultSubmissionId: dispute.resultSubmissionId,
        category: dispute.category,
        description: dispute.description,
      }),
    onSuccess: async () => {
      setDisputeOpen(false);
      setDispute({
        fixtureId: '',
        registrationId: '',
        resultSubmissionId: null,
        category: '',
        description: '',
      });
      await refreshDisputes();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const reviewDispute = useMutation({
    mutationFn: ({
      disputeId,
      status,
    }: {
      disputeId: string;
      status: DisputeStatus;
    }) =>
      governanceService.reviewDispute(disputeId, {
        status,
        resolution: resolution[disputeId] ?? '',
      }),
    onSuccess: refreshDisputes,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const addComment = useMutation({
    mutationFn: (disputeId: string) =>
      governanceService.comment(disputeId, comment[disputeId] ?? ''),
    onSuccess: async (_, disputeId) => {
      setComment({ ...comment, [disputeId]: '' });
      await refreshDisputes();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  if (tournament.isLoading) {
    return <LoadingState message="Loading governance..." />;
  }
  if (tournament.isError || !tournament.data) {
    return <ErrorState message={getErrorMessage(tournament.error)} />;
  }

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={tournament.data} />
      <TournamentNav tournamentId={tournamentId} />
      <div className="tournament-page-body">
        <div className="builder-heading">
          <div>
            <h2>Penalties & disputes</h2>
            <p>Apply tournament policy and resolve contested match outcomes.</p>
          </div>
          <div className="review-actions">
            <button className="button button-secondary" onClick={() => setPenaltyOpen(true)}>
              <Gavel /> Issue penalty
            </button>
            <button className="button button-primary" onClick={() => setDisputeOpen(true)}>
              <Plus /> Open dispute
            </button>
          </div>
        </div>
        {notice && <div className="alert alert-error mb-5">{notice}</div>}
        <div className="operation-tabs">
          <button className={tab === 'penalties' ? 'active' : ''} onClick={() => setTab('penalties')}>
            <AlertTriangle /> Penalties
          </button>
          <button className={tab === 'disputes' ? 'active' : ''} onClick={() => setTab('disputes')}>
            <Scale /> Disputes
          </button>
        </div>

        {tab === 'penalties' && (
          <section className="panel">
            <div className="section-heading">
              <Gavel />
              <div><h2>Penalty ledger</h2><p>Active point deductions and disqualifications affect standings.</p></div>
            </div>
            {penalties.isLoading && <LoadingState message="Loading penalties..." />}
            {penalties.data?.length === 0 && <EmptyState title="No penalties issued" />}
            <div className="governance-list">
              {penalties.data?.map((item) => (
                <article key={item.id}>
                  <div>
                    <div className="governance-title">
                      <h3>{item.teamName}</h3>
                      <span className={`badge ${item.status === 'ACTIVE' ? 'badge-warning' : ''}`}>
                        {item.status}
                      </span>
                    </div>
                    <p>{item.type.replaceAll('_', ' ')} · {item.pointsDeducted} points · {item.reason}</p>
                    <small>Issued by {item.issuedBy} · {formatDateTime(item.issuedAt)}</small>
                  </div>
                  {item.status === 'ACTIVE' && (
                    <button
                      className="button button-secondary"
                      onClick={() => revokePenalty.mutate(item.id)}
                    >
                      <RotateCcw /> Revoke
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'disputes' && (
          <section className="panel">
            <div className="panel-title-row">
              <div className="section-heading">
                <Scale />
                <div><h2>Dispute docket</h2><p>Visible to organizers and directly involved teams.</p></div>
              </div>
              <select
                className="select-control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as DisputeStatus | '')}
              >
                <option value="">All statuses</option>
                {disputeStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            {disputes.isLoading && <LoadingState message="Loading disputes..." />}
            {disputes.data?.content.length === 0 && <EmptyState title="No disputes found" />}
            <div className="dispute-list">
              {disputes.data?.content.map((item) => (
                <article key={item.id}>
                  <div className="panel-title-row">
                    <div>
                      <div className="governance-title">
                        <h3>{item.teamName} · {item.category}</h3>
                        <span className="status-pill">{item.status.replaceAll('_', ' ')}</span>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  </div>
                  <div className="comment-thread">
                    {item.comments.map((entry) => (
                      <div key={entry.id}>
                        <strong>{entry.author}</strong>
                        <span>{formatDateTime(entry.createdAt)}</span>
                        <p>{entry.message}</p>
                      </div>
                    ))}
                  </div>
                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      addComment.mutate(item.id);
                    }}
                  >
                    <input
                      value={comment[item.id] ?? ''}
                      onChange={(event) =>
                        setComment({ ...comment, [item.id]: event.target.value })
                      }
                      placeholder="Add a comment"
                      required
                    />
                    <button className="button button-secondary">
                      <MessageSquare /> Comment
                    </button>
                  </form>
                  <label className="field">
                    <span>Resolution</span>
                    <textarea
                      rows={2}
                      value={resolution[item.id] ?? item.resolution ?? ''}
                      onChange={(event) =>
                        setResolution({ ...resolution, [item.id]: event.target.value })
                      }
                    />
                  </label>
                  <div className="review-actions">
                    {(['UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as DisputeStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          className="button button-secondary"
                          onClick={() => reviewDispute.mutate({ disputeId: item.id, status })}
                        >
                          {status.replaceAll('_', ' ')}
                        </button>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal open={penaltyOpen} title="Issue penalty" onClose={() => setPenaltyOpen(false)}>
        <form className="form-stack" onSubmit={(event) => { event.preventDefault(); issuePenalty.mutate(); }}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field">
            <span>Team registration</span>
            <select value={penalty.registrationId} onChange={(event) => setPenalty({ ...penalty, registrationId: event.target.value })} required>
              <option value="">Select team</option>
              {registrations.data?.content.map((item) => <option key={item.id} value={item.id}>{item.teamName}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Stage for fixture reference</span>
            <select value={selectedStageId} onChange={(event) => setSelectedStageId(event.target.value)}>
              {stages.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Fixture (optional)</span>
            <select value={penalty.fixtureId ?? ''} onChange={(event) => setPenalty({ ...penalty, fixtureId: event.target.value || null })}>
              <option value="">Tournament-wide</option>
              {fixtures.data?.map((item) => <option key={item.id} value={item.id}>Round {item.roundNumber} · Match {item.matchNumber}</option>)}
            </select>
          </label>
          <div className="form-grid">
            <label className="field">
              <span>Penalty type</span>
              <select value={penalty.type} onChange={(event) => setPenalty({ ...penalty, type: event.target.value as PenaltyType })}>
                {penaltyTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="field"><span>Points deducted</span><input type="number" min={0} step="0.01" value={penalty.pointsDeducted} onChange={(event) => setPenalty({ ...penalty, pointsDeducted: Number(event.target.value) })} /></label>
          </div>
          <label className="field"><span>Reason</span><textarea rows={4} value={penalty.reason} onChange={(event) => setPenalty({ ...penalty, reason: event.target.value })} required /></label>
          <button className="button button-primary">Issue penalty</button>
        </form>
      </Modal>

      <Modal open={disputeOpen} title="Open fixture dispute" onClose={() => setDisputeOpen(false)}>
        <form className="form-stack" onSubmit={(event: FormEvent) => { event.preventDefault(); openDispute.mutate(); }}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field">
            <span>Stage</span>
            <select value={selectedStageId} onChange={(event) => setSelectedStageId(event.target.value)}>
              {stages.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Fixture</span>
            <select value={dispute.fixtureId} onChange={(event) => setDispute({ ...dispute, fixtureId: event.target.value })} required>
              <option value="">Select fixture</option>
              {fixtures.data?.map((item) => <option key={item.id} value={item.id}>Round {item.roundNumber} · Match {item.matchNumber}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Team registration</span>
            <select value={dispute.registrationId} onChange={(event) => setDispute({ ...dispute, registrationId: event.target.value })} required>
              <option value="">Select team</option>
              {registrations.data?.content.map((item) => <option key={item.id} value={item.id}>{item.teamName}</option>)}
            </select>
          </label>
          <label className="field"><span>Category</span><input value={dispute.category} onChange={(event) => setDispute({ ...dispute, category: event.target.value })} placeholder="Score, eligibility, conduct..." required /></label>
          <label className="field"><span>Description</span><textarea rows={5} value={dispute.description} onChange={(event) => setDispute({ ...dispute, description: event.target.value })} required /></label>
          <label className="field"><span>Result submission ID (optional)</span><input value={dispute.resultSubmissionId ?? ''} onChange={(event) => setDispute({ ...dispute, resultSubmissionId: event.target.value || null })} /></label>
          <button className="button button-primary">Open dispute</button>
        </form>
      </Modal>
    </div>
  );
}

const penaltyTypes: PenaltyType[] = [
  'WARNING',
  'POINT_DEDUCTION',
  'FORFEIT',
  'DISQUALIFICATION',
  'SUSPENSION',
];
const disputeStatuses: DisputeStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
