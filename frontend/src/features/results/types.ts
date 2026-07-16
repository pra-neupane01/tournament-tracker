export type ResultSubmissionStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface ParticipantResultInput {
  registrationId: string;
  placement: number;
  metrics: Record<string, number>;
}

export interface ResultSubmissionInput {
  notes: string;
  evidenceUrl: string;
  results: ParticipantResultInput[];
}

export interface ResultMetric {
  metricKey: string;
  value: number;
  awardedPoints: number;
}

export interface ParticipantResult {
  registrationId: string;
  teamId: string;
  teamName: string;
  placement: number;
  totalPoints: number;
  metrics: ResultMetric[];
}

export interface ResultSubmission {
  id: string;
  fixtureId: string;
  status: ResultSubmissionStatus;
  submittedBy: string;
  submittedAt: string;
  notes: string | null;
  evidenceUrl: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  results: ParticipantResult[];
}
