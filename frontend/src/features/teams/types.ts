export type RosterRole = 'CAPTAIN' | 'STARTER' | 'SUBSTITUTE' | 'COACH';

export interface Team {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  gameId: string;
  gameName: string;
  organizationId: string | null;
  organizationName: string | null;
  managerId: string;
  managerName: string;
}

export interface TeamInput {
  name: string;
  shortName: string;
  logoUrl: string;
  gameId: string;
  organizationId: string | null;
}

export interface RosterMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  playerUid: string;
  inGameName: string;
  role: RosterRole;
  active: boolean;
}

export interface RosterMemberInput {
  email: string;
  playerUid: string;
  inGameName: string;
  role: RosterRole;
  active: boolean;
}
