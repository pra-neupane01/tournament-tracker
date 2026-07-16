export type StageType =
  | 'GROUP_STAGE'
  | 'ROUND_ROBIN'
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'SWISS'
  | 'BATTLE_ROYALE'
  | 'CUSTOM';

export type StageStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'COMPLETED';
export type FixtureStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'BYE';

export interface Stage {
  id: string;
  tournamentId: string;
  name: string;
  type: StageType;
  status: StageStatus;
  sequenceNumber: number;
  bestOf: number;
  qualifiersPerGroup: number;
}

export interface StageInput {
  name: string;
  type: StageType;
  status: StageStatus;
  sequenceNumber: number;
  bestOf: number;
  qualifiersPerGroup: number;
}

export interface GroupParticipant {
  registrationId: string;
  teamId: string;
  teamName: string;
  seed: number;
}

export interface StageGroup {
  id: string;
  name: string;
  groupNumber: number;
  participants: GroupParticipant[];
}

export interface FixtureParticipant extends GroupParticipant {
  slotNumber: number;
}

export interface Fixture {
  id: string;
  stageId: string;
  groupId: string | null;
  groupName: string | null;
  roundNumber: number;
  matchNumber: number;
  status: FixtureStatus;
  winnerRegistrationId: string | null;
  scheduledAt: string | null;
  durationMinutes: number;
  checkInOpensAt: string | null;
  checkInClosesAt: string | null;
  venue: string | null;
  streamUrl: string | null;
  participants: FixtureParticipant[];
}

export interface FixtureInput {
  groupId: string | null;
  roundNumber: number;
  matchNumber: number;
  status: FixtureStatus;
  participantRegistrationIds: string[];
  winnerRegistrationId: string | null;
}

export interface MetricScoringRule {
  metricKey: string;
  label: string;
  pointsPerUnit: number;
  sortOrder: number;
}

export interface PlacementScoringRule {
  placement: number;
  points: number;
}

export interface ScoringConfig {
  metricRules: MetricScoringRule[];
  placementRules: PlacementScoringRule[];
}

export interface LeaderboardEntry {
  rank: number;
  registrationId: string;
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  placementTotal: number;
  points: number;
  penaltyPoints: number;
  disqualified: boolean;
  qualified: boolean;
}

export interface Qualification {
  id: string;
  fromStageId: string;
  toStageId: string;
  sourceGroupId: string | null;
  registrationId: string;
  teamId: string;
  teamName: string;
  sourceRank: number;
  manual: boolean;
}
