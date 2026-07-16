export type CheckInStatus = 'CHECKED_IN' | 'LATE' | 'NO_SHOW';

export interface FixtureScheduleInput {
  scheduledAt: string;
  durationMinutes: number;
  checkInOpensAt: string | null;
  checkInClosesAt: string | null;
  venue: string;
  streamUrl: string;
}

export interface MatchRoomInput {
  roomCode: string;
  password: string;
  serverName: string;
  instructions: string;
}

export interface MatchRoom extends MatchRoomInput {
  fixtureId: string;
}

export interface CheckIn {
  id: string;
  registrationId: string;
  teamId: string;
  teamName: string;
  status: CheckInStatus;
  checkedInAt: string;
  checkedInBy: string;
}
