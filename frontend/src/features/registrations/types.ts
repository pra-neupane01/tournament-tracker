import type { RosterRole } from '../teams/types';

export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'WITHDRAWN';

export interface RegistrationPlayer {
  userId: string;
  fullName: string;
  playerUid: string;
  inGameName: string;
  rosterRole: RosterRole;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  status: RegistrationStatus;
  submittedAt: string;
  submittedBy: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  roster: RegistrationPlayer[];
  answers: Record<string, string[]>;
}

export interface RegistrationSubmitInput {
  teamId: string;
  rosterMemberIds: string[];
  answers: Record<string, string[]>;
}
