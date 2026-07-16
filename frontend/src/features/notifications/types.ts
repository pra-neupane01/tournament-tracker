export type NotificationType =
  | 'SYSTEM'
  | 'ANNOUNCEMENT'
  | 'REGISTRATION'
  | 'FIXTURE'
  | 'RESULT'
  | 'DISPUTE'
  | 'PENALTY'
  | 'QUALIFICATION';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}
