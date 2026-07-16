export type PenaltyType =
  | 'WARNING'
  | 'POINT_DEDUCTION'
  | 'FORFEIT'
  | 'DISQUALIFICATION'
  | 'SUSPENSION';
export type PenaltyStatus = 'ACTIVE' | 'REVOKED';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface Penalty {
  id: string;
  tournamentId: string;
  registrationId: string;
  teamId: string;
  teamName: string;
  fixtureId: string | null;
  type: PenaltyType;
  status: PenaltyStatus;
  pointsDeducted: number;
  reason: string;
  issuedBy: string;
  issuedAt: string;
}

export interface DisputeComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  fixtureId: string;
  registrationId: string;
  teamName: string;
  resultSubmissionId: string | null;
  category: string;
  description: string;
  status: DisputeStatus;
  openedBy: string;
  assignedTo: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  comments: DisputeComment[];
}
