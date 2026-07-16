import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type {
  Dispute,
  DisputeStatus,
  Penalty,
  PenaltyType,
} from './types';

export const governanceService = {
  penalties: async (tournamentId: string) => {
    const response = await apiClient.get<APIResponse<Penalty[]>>(
      `/tournaments/${tournamentId}/penalties`,
    );
    return response.data.data;
  },
  issuePenalty: async (
    tournamentId: string,
    input: {
      registrationId: string;
      fixtureId: string | null;
      type: PenaltyType;
      pointsDeducted: number;
      reason: string;
    },
  ) => {
    const response = await apiClient.post<APIResponse<Penalty>>(
      `/tournaments/${tournamentId}/penalties`,
      input,
    );
    return response.data.data;
  },
  revokePenalty: async (penaltyId: string) => {
    const response = await apiClient.post<APIResponse<Penalty>>(
      `/penalties/${penaltyId}/revoke`,
    );
    return response.data.data;
  },
  disputes: async (tournamentId: string, status?: DisputeStatus) => {
    const response = await apiClient.get<APIResponse<PagedResponse<Dispute>>>(
      `/tournaments/${tournamentId}/disputes`,
      { params: { status, size: 100 } },
    );
    return response.data.data;
  },
  openDispute: async (
    fixtureId: string,
    input: {
      registrationId: string;
      resultSubmissionId: string | null;
      category: string;
      description: string;
    },
  ) => {
    const response = await apiClient.post<APIResponse<Dispute>>(
      `/fixtures/${fixtureId}/disputes`,
      input,
    );
    return response.data.data;
  },
  reviewDispute: async (
    disputeId: string,
    input: { status: DisputeStatus; resolution: string },
  ) => {
    const response = await apiClient.patch<APIResponse<Dispute>>(
      `/disputes/${disputeId}`,
      input,
    );
    return response.data.data;
  },
  comment: async (disputeId: string, message: string) => {
    const response = await apiClient.post<APIResponse<Dispute>>(
      `/disputes/${disputeId}/comments`,
      { message },
    );
    return response.data.data;
  },
};
