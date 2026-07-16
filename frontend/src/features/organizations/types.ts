import type { UserRole } from '../auth/types';

export type OrganizationType =
  | 'EDUCATIONAL_INSTITUTION'
  | 'ESPORTS_ORGANIZATION'
  | 'INDEPENDENT_ORGANIZER';

export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  verified: boolean;
  createdAt: string;
}

export interface OrganizationInput {
  name: string;
  type: OrganizationType;
  description: string;
  website: string;
  country: string;
  city: string;
}

export interface Membership {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  platformRole: UserRole;
  organizationRole: MembershipRole;
}
