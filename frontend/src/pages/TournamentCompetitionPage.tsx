import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Brackets,
  CalendarDays,
  Edit3,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { TournamentNav } from '../components/tournament/TournamentNav';
import { competitionService } from '../features/competition/competitionService';
import type {
  FixtureInput,
  MetricScoringRule,
  PlacementScoringRule,
  ScoringConfig,
  StageInput,
  StageStatus,
  StageType,
} from '../features/competition/types';
import { registrationService } from '../features/registrations/registrationService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';

const emptyStage: StageInput = {
  name: '',
  type: 'GROUP_STAGE',
  status: 'DRAFT',
  sequenceNumber: 1,
  bestOf: 1,
  qualifiersPerGroup: 2,
};

const emptyFixture: FixtureInput = {
  groupId: null,
  roundNumber: 1,
  matchNumber: 1,
  status: 'DRAFT',
  participantRegistrationIds: [],
  winnerRegistrationId: null,
};

export function TournamentCompetitionPage() {
  const { tournamentId = '' } = useParams();
  const queryClient = useQueryClient();
  const [selectedStageId, setSelectedStageId] = useState('');
  const [tab, setTab] = useState<'structure' | 'scoring' | 'leaderboard'>('structure');
  const [stageOpen, setStageOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [fixtureOpen, setFixtureOpen] = useState(false);
  const [stage, setStage] = useState(emptyStage);
  const [fixture, setFixture] = useState(emptyFixture);
  const [groupCount, setGroupCount] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [notice, setNotice] = useState('');
  const [scoring, setScoring] = useState<ScoringConfig>({
    metricRules: [],
    placementRules: [],
  });
  const [qualification, setQualification] = useState({
    toStageId: '',
    qualifierCount: 1,
    perGroup: false,
  });
  const [manualQualificationIds, setManualQualificationIds] = useState<string[]>([]);

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const stages = useQuery({
    queryKey: ['stages', tournamentId],
    queryFn: () => competitionService.stages(tournamentId),
  });
  const groups = useQuery({
    queryKey: ['groups', selectedStageId],
    queryFn: () => competitionService.groups(selectedStageId),
    enabled: Boolean(selectedStageId),
  });
  const fixtures = useQuery({
    queryKey: ['fixtures', selectedStageId],
    queryFn: () => competitionService.fixtures(selectedStageId),
    enabled: Boolean(selectedStageId),
  });
  const approvedRegistrations = useQuery({
    queryKey: ['registrations', tournamentId, 'APPROVED'],
    queryFn: () => registrationService.list(tournamentId, 'APPROVED'),
    retry: false,
  });
  const scoringQuery = useQuery({
    queryKey: ['scoring', selectedStageId],
    queryFn: () => competitionService.scoring(selectedStageId),
    enabled: Boolean(selectedStageId),
    retry: false,
  });
  const leaderboard = useQuery({
    queryKey: ['leaderboard', selectedStageId],
    queryFn: () => competitionService.leaderboard(selectedStageId),
    enabled: Boolean(selectedStageId),
  });
  const qualifications = useQuery({
    queryKey: ['qualifications', selectedStageId],
    queryFn: () => competitionService.qualifications(selectedStageId),
    enabled: Boolean(selectedStageId),
  });

  useEffect(() => {
    if (!selectedStageId && stages.data?.length) {
      setSelectedStageId(stages.data[0].id);
    }
  }, [selectedStageId, stages.data]);

  useEffect(() => {
    if (scoringQuery.data) {
      setScoring(scoringQuery.data);
    }
  }, [scoringQuery.data]);

  const refreshStages = () => queryClient.invalidateQueries({ queryKey: ['stages', tournamentId] });
  const refreshStructure = async () => {
    await queryClient.invalidateQueries({ queryKey: ['groups', selectedStageId] });
    await queryClient.invalidateQueries({ queryKey: ['fixtures', selectedStageId] });
    await refreshStages();
  };

  const saveStage = useMutation({
    mutationFn: () =>
      editingStageId
        ? competitionService.updateStage(tournamentId, editingStageId, stage)
        : competitionService.createStage(tournamentId, stage),
    onSuccess: async (created) => {
      setStageOpen(false);
      setEditingStageId(null);
      setStage(emptyStage);
      setSelectedStageId(created.id);
      setNotice('');
      await refreshStages();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeStage = useMutation({
    mutationFn: (stageId: string) => competitionService.removeStage(tournamentId, stageId),
    onSuccess: async () => {
      setSelectedStageId('');
      await refreshStages();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const generate = useMutation({
    mutationFn: () => competitionService.generate(selectedStageId, groupCount),
    onSuccess: refreshStructure,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const createGroup = useMutation({
    mutationFn: () =>
      competitionService.createGroup(selectedStageId, {
        name: groupName,
        groupNumber: (groups.data?.length ?? 0) + 1,
      }),
    onSuccess: async () => {
      setGroupName('');
      await refreshStructure();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const updateGroup = useMutation({
    mutationFn: ({
      groupId,
      name,
      groupNumber,
    }: {
      groupId: string;
      name: string;
      groupNumber: number;
    }) => competitionService.updateGroup(selectedStageId, groupId, { name, groupNumber }),
    onSuccess: refreshStructure,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const createFixture = useMutation({
    mutationFn: () => competitionService.createFixture(selectedStageId, fixture),
    onSuccess: async () => {
      setFixtureOpen(false);
      setFixture(emptyFixture);
      await refreshStructure();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeFixture = useMutation({
    mutationFn: (fixtureId: string) =>
      competitionService.removeFixture(selectedStageId, fixtureId),
    onSuccess: refreshStructure,
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const saveScoring = useMutation({
    mutationFn: () => competitionService.saveScoring(selectedStageId, scoring),
    onSuccess: async () => {
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['scoring', selectedStageId] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard', selectedStageId] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const qualify = useMutation({
    mutationFn: () => competitionService.qualify(selectedStageId, qualification),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['qualifications', selectedStageId] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard', selectedStageId] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const qualifyManually = useMutation({
    mutationFn: () =>
      competitionService.qualifyManually(selectedStageId, {
        toStageId: qualification.toStageId,
        registrationIds: manualQualificationIds,
      }),
    onSuccess: async () => {
      setManualQualificationIds([]);
      await queryClient.invalidateQueries({ queryKey: ['qualifications', selectedStageId] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard', selectedStageId] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  if (tournament.isLoading) {
    return <LoadingState message="Loading competition structure..." />;
  }
  if (tournament.isError || !tournament.data) {
    return <ErrorState message={getErrorMessage(tournament.error)} />;
  }

  const selectedStage = stages.data?.find((item) => item.id === selectedStageId);

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={tournament.data} />
      <TournamentNav tournamentId={tournamentId} />
      <div className="tournament-page-body">
        <div className="builder-heading">
          <div>
            <h2>Competition structure</h2>
            <p>Build stages, generate fixtures, define scoring, and advance qualifiers.</p>
          </div>
          <button
            className="button button-primary"
            onClick={() => {
              setStage({
                ...emptyStage,
                sequenceNumber: (stages.data?.length ?? 0) + 1,
              });
              setEditingStageId(null);
              setStageOpen(true);
            }}
          >
            <Plus /> Add stage
          </button>
        </div>
        {notice && <div className="alert alert-error mb-5">{notice}</div>}
        {stages.isLoading && <LoadingState message="Loading stages..." />}
        {stages.data?.length === 0 && <EmptyState title="No competition stages" />}

        <div className="stage-pills">
          {stages.data?.map((item) => (
            <button
              key={item.id}
              className={selectedStageId === item.id ? 'active' : ''}
              onClick={() => setSelectedStageId(item.id)}
            >
              <span>{item.sequenceNumber}</span>
              {item.name}
            </button>
          ))}
        </div>

        {selectedStage && (
          <>
            <div className="stage-header panel">
              <div>
                <span className="eyebrow">{selectedStage.type.replaceAll('_', ' ')}</span>
                <h2>{selectedStage.name}</h2>
                <p>
                  Best of {selectedStage.bestOf} · {selectedStage.qualifiersPerGroup} qualifiers per
                  group · {selectedStage.status}
                </p>
              </div>
              <div className="review-actions">
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditingStageId(selectedStage.id);
                    setStage({
                      name: selectedStage.name,
                      type: selectedStage.type,
                      status: selectedStage.status,
                      sequenceNumber: selectedStage.sequenceNumber,
                      bestOf: selectedStage.bestOf,
                      qualifiersPerGroup: selectedStage.qualifiersPerGroup,
                    });
                    setStageOpen(true);
                  }}
                  aria-label="Edit stage"
                >
                  <Edit3 />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => removeStage.mutate(selectedStage.id)}
                  aria-label="Delete stage"
                >
                  <Trash2 />
                </button>
              </div>
            </div>

            <div className="operation-tabs">
              <button className={tab === 'structure' ? 'active' : ''} onClick={() => setTab('structure')}>
                <Brackets /> Structure
              </button>
              <button className={tab === 'scoring' ? 'active' : ''} onClick={() => setTab('scoring')}>
                <Settings2 /> Scoring
              </button>
              <button className={tab === 'leaderboard' ? 'active' : ''} onClick={() => setTab('leaderboard')}>
                <BarChart3 /> Leaderboard
              </button>
            </div>

            {tab === 'structure' && (
              <div className="structure-grid">
                <section className="panel">
                  <div className="panel-title-row">
                    <div className="section-heading">
                      <Users />
                      <div><h2>Groups</h2><p>Seeded participants assigned to this stage.</p></div>
                    </div>
                    <div className="generate-controls">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={groupCount}
                        onChange={(event) => setGroupCount(Number(event.target.value))}
                      />
                      <button className="button button-secondary" onClick={() => generate.mutate()}>
                        <Sparkles /> Generate
                      </button>
                    </div>
                  </div>
                  <form
                    className="inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      createGroup.mutate();
                    }}
                  >
                    <input
                      value={groupName}
                      onChange={(event) => setGroupName(event.target.value)}
                      placeholder="New group name"
                      required
                    />
                    <button className="button button-secondary">Add group</button>
                  </form>
                  <div className="group-grid">
                    {groups.data?.map((group) => (
                      <article key={group.id}>
                        <div className="panel-title-row">
                          <h3>{group.name}</h3>
                          <button
                            className="icon-button"
                            onClick={() => {
                              const name = window.prompt('Group name', group.name);
                              if (name?.trim()) {
                                updateGroup.mutate({
                                  groupId: group.id,
                                  name: name.trim(),
                                  groupNumber: group.groupNumber,
                                });
                              }
                            }}
                            aria-label={`Rename ${group.name}`}
                          >
                            <Edit3 />
                          </button>
                        </div>
                        {group.participants.map((participant) => (
                          <span key={participant.registrationId}>
                            <b>#{participant.seed}</b> {participant.teamName}
                          </span>
                        ))}
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-title-row">
                    <div className="section-heading">
                      <CalendarDays />
                      <div><h2>Fixtures</h2><p>Generated or manually assembled matches.</p></div>
                    </div>
                    <button className="button button-primary" onClick={() => setFixtureOpen(true)}>
                      <Plus /> Fixture
                    </button>
                  </div>
                  <div className="fixture-list">
                    {fixtures.data?.map((item) => (
                      <article key={item.id}>
                        <Link
                          to={`/tournaments/${tournamentId}/stages/${selectedStageId}/fixtures/${item.id}`}
                        >
                          <div>
                            <span className="badge">{item.status}</span>
                            <strong>Round {item.roundNumber} · Match {item.matchNumber}</strong>
                          </div>
                          <p>{item.participants.map((participant) => participant.teamName).join(' vs ') || 'TBD'}</p>
                          <small>{formatDateTime(item.scheduledAt)} · {item.groupName ?? 'No group'}</small>
                        </Link>
                        <button
                          className="icon-button danger"
                          onClick={() => removeFixture.mutate(item.id)}
                          aria-label="Delete fixture"
                        >
                          <Trash2 />
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {tab === 'scoring' && (
              <ScoringEditor
                scoring={scoring}
                onChange={setScoring}
                onSave={() => saveScoring.mutate()}
                saving={saveScoring.isPending}
              />
            )}

            {tab === 'leaderboard' && (
              <section className="panel">
                <div className="panel-title-row">
                  <div className="section-heading">
                    <Trophy />
                    <div><h2>Stage leaderboard</h2><p>Confirmed results minus active penalties.</p></div>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="data-table leaderboard-table">
                    <thead><tr><th>Select</th><th>Rank</th><th>Team</th><th>Played</th><th>Wins</th><th>Points</th><th>Penalty</th><th>Status</th></tr></thead>
                    <tbody>
                      {leaderboard.data?.map((entry) => (
                        <tr key={entry.registrationId}>
                          <td>
                            <input
                              type="checkbox"
                              checked={manualQualificationIds.includes(entry.registrationId)}
                              disabled={entry.disqualified}
                              onChange={(event) =>
                                setManualQualificationIds((current) =>
                                  event.target.checked
                                    ? [...current, entry.registrationId]
                                    : current.filter((id) => id !== entry.registrationId),
                                )
                              }
                            />
                          </td>
                          <td>#{entry.rank}</td>
                          <td><strong>{entry.teamName}</strong></td>
                          <td>{entry.matchesPlayed}</td>
                          <td>{entry.wins}</td>
                          <td>{entry.points}</td>
                          <td>{entry.penaltyPoints}</td>
                          <td>
                            {entry.disqualified
                              ? <span className="badge badge-warning">Disqualified</span>
                              : entry.qualified
                                ? <span className="badge badge-success">Qualified</span>
                                : 'Eligible'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="qualification-panel">
                  <h3>Advance teams</h3>
                  <select
                    value={qualification.toStageId}
                    onChange={(event) =>
                      setQualification({ ...qualification, toStageId: event.target.value })
                    }
                  >
                    <option value="">Destination stage</option>
                    {stages.data
                      ?.filter((item) => item.sequenceNumber > selectedStage.sequenceNumber)
                      .map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={qualification.qualifierCount}
                    onChange={(event) =>
                      setQualification({
                        ...qualification,
                        qualifierCount: Number(event.target.value),
                      })
                    }
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={qualification.perGroup}
                      onChange={(event) =>
                        setQualification({ ...qualification, perGroup: event.target.checked })
                      }
                    />
                    Per group
                  </label>
                  <button
                    className="button button-primary"
                    disabled={!qualification.toStageId || qualify.isPending}
                    onClick={() => qualify.mutate()}
                  >
                    Qualify
                  </button>
                  <button
                    className="button button-secondary"
                    disabled={
                      !qualification.toStageId ||
                      manualQualificationIds.length === 0 ||
                      qualifyManually.isPending
                    }
                    onClick={() => qualifyManually.mutate()}
                  >
                    Manual selection
                  </button>
                </div>
                {qualifications.data?.length ? (
                  <div className="qualification-list">
                    {qualifications.data.map((item) => (
                      <span key={item.id}>#{item.sourceRank} {item.teamName}</span>
                    ))}
                  </div>
                ) : null}
              </section>
            )}
          </>
        )}
      </div>

      <Modal
        open={stageOpen}
        title={editingStageId ? 'Edit competition stage' : 'Create competition stage'}
        onClose={() => setStageOpen(false)}
      >
        <form className="form-stack" onSubmit={(event) => { event.preventDefault(); saveStage.mutate(); }}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field"><span>Name</span><input value={stage.name} onChange={(event) => setStage({ ...stage, name: event.target.value })} required /></label>
          <div className="form-grid">
            <label className="field">
              <span>Type</span>
              <select value={stage.type} onChange={(event) => setStage({ ...stage, type: event.target.value as StageType })}>
                {stageTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select value={stage.status} onChange={(event) => setStage({ ...stage, status: event.target.value as StageStatus })}>
                {stageStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="field"><span>Sequence</span><input type="number" min={1} value={stage.sequenceNumber} onChange={(event) => setStage({ ...stage, sequenceNumber: Number(event.target.value) })} /></label>
            <label className="field"><span>Best of</span><input type="number" min={1} max={99} value={stage.bestOf} onChange={(event) => setStage({ ...stage, bestOf: Number(event.target.value) })} /></label>
          </div>
          <label className="field"><span>Qualifiers per group</span><input type="number" min={0} value={stage.qualifiersPerGroup} onChange={(event) => setStage({ ...stage, qualifiersPerGroup: Number(event.target.value) })} /></label>
          <button className="button button-primary" disabled={saveStage.isPending}>
            {saveStage.isPending ? 'Saving...' : editingStageId ? 'Save stage' : 'Create stage'}
          </button>
        </form>
      </Modal>

      <Modal open={fixtureOpen} title="Create fixture" onClose={() => setFixtureOpen(false)}>
        <form className="form-stack" onSubmit={(event) => { event.preventDefault(); createFixture.mutate(); }}>
          {notice && <div className="alert alert-error">{notice}</div>}
          <div className="form-grid">
            <label className="field"><span>Round</span><input type="number" min={1} value={fixture.roundNumber} onChange={(event) => setFixture({ ...fixture, roundNumber: Number(event.target.value) })} /></label>
            <label className="field"><span>Match number</span><input type="number" min={1} value={fixture.matchNumber} onChange={(event) => setFixture({ ...fixture, matchNumber: Number(event.target.value) })} /></label>
          </div>
          <label className="field">
            <span>Group</span>
            <select value={fixture.groupId ?? ''} onChange={(event) => setFixture({ ...fixture, groupId: event.target.value || null })}>
              <option value="">No group</option>
              {groups.data?.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
          </label>
          <fieldset className="selection-fieldset">
            <legend>Participants</legend>
            {approvedRegistrations.data?.content.map((registration) => (
              <label key={registration.id}>
                <input
                  type="checkbox"
                  checked={fixture.participantRegistrationIds.includes(registration.id)}
                  onChange={(event) =>
                    setFixture({
                      ...fixture,
                      participantRegistrationIds: event.target.checked
                        ? [...fixture.participantRegistrationIds, registration.id]
                        : fixture.participantRegistrationIds.filter((id) => id !== registration.id),
                    })
                  }
                />
                <span><strong>{registration.teamName}</strong>{registration.roster.length} players</span>
              </label>
            ))}
          </fieldset>
          <button className="button button-primary" disabled={createFixture.isPending}>Create fixture</button>
        </form>
      </Modal>
    </div>
  );
}

const stageTypes: StageType[] = [
  'GROUP_STAGE',
  'ROUND_ROBIN',
  'SINGLE_ELIMINATION',
  'DOUBLE_ELIMINATION',
  'SWISS',
  'BATTLE_ROYALE',
  'CUSTOM',
];
const stageStatuses: StageStatus[] = ['DRAFT', 'READY', 'ACTIVE', 'COMPLETED'];

function ScoringEditor({
  scoring,
  onChange,
  onSave,
  saving,
}: {
  scoring: ScoringConfig;
  onChange: (value: ScoringConfig) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const addMetric = () =>
    onChange({
      ...scoring,
      metricRules: [
        ...scoring.metricRules,
        { metricKey: '', label: '', pointsPerUnit: 1, sortOrder: scoring.metricRules.length },
      ],
    });
  const addPlacement = () =>
    onChange({
      ...scoring,
      placementRules: [
        ...scoring.placementRules,
        { placement: scoring.placementRules.length + 1, points: 0 },
      ],
    });

  return (
    <section className="panel scoring-editor">
      <div className="section-heading">
        <Settings2 />
        <div><h2>Scoring configuration</h2><p>Combine placement points with per-unit performance metrics.</p></div>
      </div>
      <div className="scoring-columns">
        <div>
          <div className="subheading-row"><h3>Metric rules</h3><button className="button button-secondary" onClick={addMetric}><Plus /> Metric</button></div>
          {scoring.metricRules.map((rule, index) => (
            <div className="scoring-rule" key={`${rule.metricKey}-${index}`}>
              <input placeholder="metric_key" value={rule.metricKey} onChange={(event) => updateMetric(scoring, onChange, index, { metricKey: event.target.value })} />
              <input placeholder="Label" value={rule.label} onChange={(event) => updateMetric(scoring, onChange, index, { label: event.target.value })} />
              <input type="number" step="0.01" value={rule.pointsPerUnit} onChange={(event) => updateMetric(scoring, onChange, index, { pointsPerUnit: Number(event.target.value) })} />
              <button className="icon-button danger" onClick={() => onChange({ ...scoring, metricRules: scoring.metricRules.filter((_, i) => i !== index) })}><Trash2 /></button>
            </div>
          ))}
        </div>
        <div>
          <div className="subheading-row"><h3>Placement points</h3><button className="button button-secondary" onClick={addPlacement}><Plus /> Placement</button></div>
          {scoring.placementRules.map((rule, index) => (
            <div className="scoring-rule placement-rule" key={`${rule.placement}-${index}`}>
              <input type="number" min={1} value={rule.placement} onChange={(event) => updatePlacement(scoring, onChange, index, { placement: Number(event.target.value) })} />
              <input type="number" step="0.01" value={rule.points} onChange={(event) => updatePlacement(scoring, onChange, index, { points: Number(event.target.value) })} />
              <button className="icon-button danger" onClick={() => onChange({ ...scoring, placementRules: scoring.placementRules.filter((_, i) => i !== index) })}><Trash2 /></button>
            </div>
          ))}
        </div>
      </div>
      <button className="button button-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save scoring rules'}</button>
    </section>
  );
}

function updateMetric(
  scoring: ScoringConfig,
  onChange: (value: ScoringConfig) => void,
  index: number,
  patch: Partial<MetricScoringRule>,
) {
  onChange({
    ...scoring,
    metricRules: scoring.metricRules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
  });
}

function updatePlacement(
  scoring: ScoringConfig,
  onChange: (value: ScoringConfig) => void,
  index: number,
  patch: Partial<PlacementScoringRule>,
) {
  onChange({
    ...scoring,
    placementRules: scoring.placementRules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
  });
}
