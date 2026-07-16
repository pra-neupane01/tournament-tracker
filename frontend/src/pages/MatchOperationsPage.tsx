import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  KeyRound,
  Save,
  Send,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { competitionService } from '../features/competition/competitionService';
import { matchService } from '../features/matches/matchService';
import type {
  CheckInStatus,
  FixtureScheduleInput,
  MatchRoomInput,
} from '../features/matches/types';
import { resultService } from '../features/results/resultService';
import type {
  ParticipantResultInput,
  ResultSubmissionInput,
  ResultSubmissionStatus,
} from '../features/results/types';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime, toLocalDateTimeInput } from '../utils/date';

const emptySchedule: FixtureScheduleInput = {
  scheduledAt: '',
  durationMinutes: 60,
  checkInOpensAt: null,
  checkInClosesAt: null,
  venue: '',
  streamUrl: '',
};
const emptyRoom: MatchRoomInput = {
  roomCode: '',
  password: '',
  serverName: '',
  instructions: '',
};

export function MatchOperationsPage() {
  const { tournamentId = '', stageId = '', fixtureId = '' } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'schedule' | 'room' | 'checkin' | 'results'>('schedule');
  const [schedule, setSchedule] = useState(emptySchedule);
  const [room, setRoom] = useState(emptyRoom);
  const [result, setResult] = useState<ResultSubmissionInput>({
    notes: '',
    evidenceUrl: '',
    results: [],
  });
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const fixtures = useQuery({
    queryKey: ['fixtures', stageId],
    queryFn: () => competitionService.fixtures(stageId),
  });
  const scoring = useQuery({
    queryKey: ['scoring', stageId],
    queryFn: () => competitionService.scoring(stageId),
    retry: false,
  });
  const roomQuery = useQuery({
    queryKey: ['match-room', fixtureId],
    queryFn: () => matchService.room(fixtureId),
    retry: false,
  });
  const checkIns = useQuery({
    queryKey: ['check-ins', fixtureId],
    queryFn: () => matchService.checkIns(fixtureId),
    retry: false,
  });
  const submissions = useQuery({
    queryKey: ['results', fixtureId],
    queryFn: () => resultService.list(fixtureId),
    retry: false,
  });

  const fixture = fixtures.data?.find((item) => item.id === fixtureId);

  useEffect(() => {
    if (fixture) {
      setSchedule({
        scheduledAt: toLocalDateTimeInput(fixture.scheduledAt),
        durationMinutes: fixture.durationMinutes,
        checkInOpensAt: fixture.checkInOpensAt
          ? toLocalDateTimeInput(fixture.checkInOpensAt)
          : null,
        checkInClosesAt: fixture.checkInClosesAt
          ? toLocalDateTimeInput(fixture.checkInClosesAt)
          : null,
        venue: fixture.venue ?? '',
        streamUrl: fixture.streamUrl ?? '',
      });
    }
  }, [fixture]);

  useEffect(() => {
    if (roomQuery.data) {
      setRoom({
        roomCode: roomQuery.data.roomCode,
        password: roomQuery.data.password ?? '',
        serverName: roomQuery.data.serverName ?? '',
        instructions: roomQuery.data.instructions ?? '',
      });
    }
  }, [roomQuery.data]);

  const initialResults = useMemo<ParticipantResultInput[]>(
    () =>
      fixture?.participants.map((participant, index) => ({
        registrationId: participant.registrationId,
        placement: index + 1,
        metrics: Object.fromEntries(
          (scoring.data?.metricRules ?? []).map((metric) => [metric.metricKey, 0]),
        ),
      })) ?? [],
    [fixture, scoring.data],
  );

  useEffect(() => {
    setResult((current) => ({
      ...current,
      results: initialResults,
    }));
  }, [initialResults]);

  const refreshFixture = () =>
    queryClient.invalidateQueries({ queryKey: ['fixtures', stageId] });
  const scheduleMutation = useMutation({
    mutationFn: () => matchService.schedule(fixtureId, schedule),
    onSuccess: async () => {
      setNotice('');
      await refreshFixture();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const saveRoom = useMutation({
    mutationFn: () => matchService.saveRoom(fixtureId, room),
    onSuccess: async () => {
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['match-room', fixtureId] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const checkIn = useMutation({
    mutationFn: (registrationId: string) => matchService.checkIn(fixtureId, registrationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['check-ins', fixtureId] }),
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const setCheckInStatus = useMutation({
    mutationFn: ({
      registrationId,
      status,
    }: {
      registrationId: string;
      status: CheckInStatus;
    }) => matchService.setCheckInStatus(fixtureId, registrationId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['check-ins', fixtureId] }),
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const submitResult = useMutation({
    mutationFn: () => resultService.submit(fixtureId, result),
    onSuccess: async () => {
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['results', fixtureId] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const reviewResult = useMutation({
    mutationFn: ({
      submissionId,
      status,
    }: {
      submissionId: string;
      status: ResultSubmissionStatus;
    }) =>
      resultService.review(submissionId, {
        status,
        reviewNotes: reviewNotes[submissionId] ?? '',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['results', fixtureId] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard', stageId] });
      await refreshFixture();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  if (tournament.isLoading || fixtures.isLoading) {
    return <LoadingState message="Loading match operations..." />;
  }
  if (tournament.isError || !tournament.data || !fixture) {
    return <ErrorState message={getErrorMessage(tournament.error, 'Fixture not found')} />;
  }

  const checkInByRegistration = new Map(
    checkIns.data?.map((item) => [item.registrationId, item]) ?? [],
  );

  return (
    <div className="match-page">
      <div className="match-hero">
        <Link to={`/tournaments/${tournamentId}/competition`} className="back-link">
          <ArrowLeft /> Competition structure
        </Link>
        <span className="eyebrow">{tournament.data.name} · {fixture.groupName ?? 'Open bracket'}</span>
        <h1>
          {fixture.participants.map((participant) => participant.teamName).join(' vs ') ||
            `Match ${fixture.matchNumber}`}
        </h1>
        <div className="tournament-meta">
          <span><Trophy /> Round {fixture.roundNumber} · Match {fixture.matchNumber}</span>
          <span><CalendarClock /> {formatDateTime(fixture.scheduledAt)}</span>
          <span className="status-pill">{fixture.status}</span>
        </div>
      </div>
      <div className="match-body">
        {notice && <div className="alert alert-error mb-5">{notice}</div>}
        <div className="operation-tabs">
          <button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}><CalendarClock /> Schedule</button>
          <button className={tab === 'room' ? 'active' : ''} onClick={() => setTab('room')}><KeyRound /> Room</button>
          <button className={tab === 'checkin' ? 'active' : ''} onClick={() => setTab('checkin')}><UserCheck /> Check-in</button>
          <button className={tab === 'results' ? 'active' : ''} onClick={() => setTab('results')}><Trophy /> Results</button>
        </div>

        {tab === 'schedule' && (
          <section className="panel match-section">
            <div className="section-heading"><CalendarClock /><div><h2>Match schedule</h2><p>Overlapping participant fixtures are rejected by the backend.</p></div></div>
            <form className="form-stack" onSubmit={(event) => { event.preventDefault(); scheduleMutation.mutate(); }}>
              <div className="form-grid">
                <DateInput label="Scheduled at" value={schedule.scheduledAt} required onChange={(value) => setSchedule({ ...schedule, scheduledAt: value ?? '' })} />
                <label className="field"><span>Duration (minutes)</span><input type="number" min={1} value={schedule.durationMinutes} onChange={(event) => setSchedule({ ...schedule, durationMinutes: Number(event.target.value) })} /></label>
                <DateInput label="Check-in opens" value={schedule.checkInOpensAt} onChange={(value) => setSchedule({ ...schedule, checkInOpensAt: value })} />
                <DateInput label="Check-in closes" value={schedule.checkInClosesAt} onChange={(value) => setSchedule({ ...schedule, checkInClosesAt: value })} />
                <label className="field"><span>Venue</span><input value={schedule.venue} onChange={(event) => setSchedule({ ...schedule, venue: event.target.value })} /></label>
                <label className="field"><span>Stream URL</span><input value={schedule.streamUrl} onChange={(event) => setSchedule({ ...schedule, streamUrl: event.target.value })} /></label>
              </div>
              <button className="button button-primary" disabled={scheduleMutation.isPending}><Save /> Save schedule</button>
            </form>
          </section>
        )}

        {tab === 'room' && (
          <section className="panel match-section">
            <div className="section-heading"><Gamepad2 /><div><h2>Protected match room</h2><p>Passwords are encrypted at rest and only exposed to authorized participants and officials.</p></div></div>
            <form className="form-stack" onSubmit={(event) => { event.preventDefault(); saveRoom.mutate(); }}>
              <div className="form-grid">
                <label className="field"><span>Room code</span><input value={room.roomCode} onChange={(event) => setRoom({ ...room, roomCode: event.target.value })} required /></label>
                <label className="field"><span>Password</span><input value={room.password} onChange={(event) => setRoom({ ...room, password: event.target.value })} /></label>
                <label className="field"><span>Server / region</span><input value={room.serverName} onChange={(event) => setRoom({ ...room, serverName: event.target.value })} /></label>
              </div>
              <label className="field"><span>Instructions</span><textarea rows={4} value={room.instructions} onChange={(event) => setRoom({ ...room, instructions: event.target.value })} /></label>
              <button className="button button-primary" disabled={saveRoom.isPending}><KeyRound /> Save room</button>
            </form>
          </section>
        )}

        {tab === 'checkin' && (
          <section className="panel match-section">
            <div className="section-heading"><UserCheck /><div><h2>Participant check-in</h2><p>Teams can check themselves in; officials can mark late arrivals or no-shows.</p></div></div>
            <div className="checkin-list">
              {fixture.participants.map((participant) => {
                const current = checkInByRegistration.get(participant.registrationId);
                return (
                  <article key={participant.registrationId}>
                    <div>
                      <strong>{participant.teamName}</strong>
                      <span>{current ? `${current.status} by ${current.checkedInBy}` : 'Not checked in'}</span>
                    </div>
                    <button className="button button-secondary" onClick={() => checkIn.mutate(participant.registrationId)}>
                      <CheckCircle2 /> Check in
                    </button>
                    <select
                      value={current?.status ?? ''}
                      onChange={(event) =>
                        setCheckInStatus.mutate({
                          registrationId: participant.registrationId,
                          status: event.target.value as CheckInStatus,
                        })
                      }
                    >
                      <option value="">Official status</option>
                      <option value="CHECKED_IN">Checked in</option>
                      <option value="LATE">Late</option>
                      <option value="NO_SHOW">No show</option>
                    </select>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {tab === 'results' && (
          <div className="results-grid">
            <section className="panel match-section">
              <div className="section-heading"><Send /><div><h2>Submit result</h2><p>Placement and configured metrics are converted into points on confirmation.</p></div></div>
              <form className="form-stack" onSubmit={(event) => { event.preventDefault(); submitResult.mutate(); }}>
                {fixture.participants.map((participant, index) => {
                  const participantResult = result.results[index];
                  if (!participantResult) return null;
                  return (
                    <div className="participant-result" key={participant.registrationId}>
                      <h3>{participant.teamName}</h3>
                      <label className="field"><span>Placement</span><input type="number" min={1} value={participantResult.placement} onChange={(event) => updateParticipantResult(result, setResult, index, { placement: Number(event.target.value) })} /></label>
                      {scoring.data?.metricRules.map((metric) => (
                        <label className="field" key={metric.metricKey}>
                          <span>{metric.label}</span>
                          <input type="number" step="0.01" value={participantResult.metrics[metric.metricKey] ?? 0} onChange={(event) => updateParticipantMetric(result, setResult, index, metric.metricKey, Number(event.target.value))} />
                        </label>
                      ))}
                    </div>
                  );
                })}
                <label className="field"><span>Evidence URL</span><input value={result.evidenceUrl} onChange={(event) => setResult({ ...result, evidenceUrl: event.target.value })} /></label>
                <label className="field"><span>Notes</span><textarea rows={3} value={result.notes} onChange={(event) => setResult({ ...result, notes: event.target.value })} /></label>
                <button className="button button-primary" disabled={submitResult.isPending}><Send /> Submit result</button>
              </form>
            </section>
            <section className="panel match-section">
              <div className="section-heading"><Trophy /><div><h2>Review submissions</h2><p>Confirming one submission rejects any competing active submission.</p></div></div>
              <div className="submission-list">
                {submissions.data?.map((submission) => (
                  <article key={submission.id}>
                    <div className="panel-title-row">
                      <div><strong>{submission.submittedBy}</strong><span>{formatDateTime(submission.submittedAt)}</span></div>
                      <span className="status-pill">{submission.status}</span>
                    </div>
                    {submission.evidenceUrl && <a href={submission.evidenceUrl} target="_blank" rel="noreferrer"><ExternalLink /> Evidence</a>}
                    <div className="submission-results">
                      {submission.results.map((item) => <span key={item.registrationId}>#{item.placement} {item.teamName} · {item.totalPoints} pts</span>)}
                    </div>
                    <label className="field"><span>Review notes</span><textarea rows={2} value={reviewNotes[submission.id] ?? submission.reviewNotes ?? ''} onChange={(event) => setReviewNotes({ ...reviewNotes, [submission.id]: event.target.value })} /></label>
                    <div className="review-actions">
                      {(['CONFIRMED', 'REJECTED'] as ResultSubmissionStatus[]).map((status) => (
                        <button key={status} className="button button-secondary" onClick={() => reviewResult.mutate({ submissionId: submission.id, status })}>{status}</button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function DateInput({
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
  return <label className="field"><span>{label}</span><input type="datetime-local" value={value ?? ''} required={required} onChange={(event) => onChange(event.target.value || null)} /></label>;
}

function updateParticipantResult(
  result: ResultSubmissionInput,
  setResult: (value: ResultSubmissionInput) => void,
  index: number,
  patch: Partial<ParticipantResultInput>,
) {
  setResult({
    ...result,
    results: result.results.map((item, i) => (i === index ? { ...item, ...patch } : item)),
  });
}

function updateParticipantMetric(
  result: ResultSubmissionInput,
  setResult: (value: ResultSubmissionInput) => void,
  index: number,
  metricKey: string,
  value: number,
) {
  const current = result.results[index];
  if (!current) return;
  updateParticipantResult(result, setResult, index, {
    metrics: { ...current.metrics, [metricKey]: value },
  });
}
