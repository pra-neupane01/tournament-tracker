export type TournamentFormat =
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'ROUND_ROBIN'
  | 'SWISS'
  | 'BATTLE_ROYALE'
  | 'CUSTOM';

export type TournamentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Tournament {
  id: string;
  organizationId: string;
  organizationName: string;
  gameId: string;
  gameName: string;
  name: string;
  slug: string;
  description: string | null;
  format: TournamentFormat;
  status: TournamentStatus;
  timeZone: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  startsAt: string;
  endsAt: string | null;
  minimumTeams: number;
  maximumTeams: number;
  minimumRosterSize: number;
  maximumRosterSize: number;
  allowSubstitutes: boolean;
  publicVisible: boolean;
}

export interface TournamentInput {
  organizationId: string;
  gameId: string;
  name: string;
  slug: string;
  description: string;
  format: TournamentFormat;
  timeZone: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  startsAt: string;
  endsAt: string | null;
  minimumTeams: number;
  maximumTeams: number;
  minimumRosterSize: number;
  maximumRosterSize: number;
  allowSubstitutes: boolean;
  publicVisible: boolean;
}

export interface TournamentRule {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

export interface TournamentRuleInput {
  title: string;
  content: string;
  sortOrder: number;
}
