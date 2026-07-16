export type FileCategory =
  | 'LOGO'
  | 'RULEBOOK'
  | 'EVIDENCE'
  | 'REGISTRATION'
  | 'CERTIFICATE'
  | 'OTHER';
export type ReportType = 'REGISTRATIONS' | 'FIXTURES' | 'LEADERBOARD';
export type CertificateType = 'PARTICIPATION' | 'WINNER' | 'RUNNER_UP' | 'ACHIEVEMENT';

export interface StoredFile {
  id: string;
  tournamentId: string | null;
  category: FileCategory;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  privateFile: boolean;
  createdAt: string;
}

export interface Certificate {
  id: string;
  tournamentId: string;
  tournamentName: string;
  recipientId: string;
  recipientName: string;
  type: CertificateType;
  title: string;
  serialNumber: string;
  verificationCode: string;
  issuedAt: string;
  revoked: boolean;
}
