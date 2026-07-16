import { apiClient } from '../../services/api/apiClient';
import type { APIResponse, PagedResponse } from '../../types/api';
import type {
  RegistrationStatus,
  RegistrationSubmitInput,
  TournamentRegistration,
} from './types';

export const registrationService = {
  list: async (tournamentId: string, status?: RegistrationStatus) => {
    const response = await apiClient.get<APIResponse<PagedResponse<TournamentRegistration>>>(
      `/tournaments/${tournamentId}/registrations`,
      { params: { status, size: 100 } },
    );
    return response.data.data;
  },
  submit: async (tournamentId: string, input: RegistrationSubmitInput) => {
    const response = await apiClient.post<APIResponse<TournamentRegistration>>(
      `/tournaments/${tournamentId}/registrations`,
      input,
    );
    return response.data.data;
  },
  review: async (
    registrationId: string,
    input: { status: RegistrationStatus; reviewNotes: string },
  ) => {
    const response = await apiClient.patch<APIResponse<TournamentRegistration>>(
      `/registrations/${registrationId}/review`,
      input,
    );
    return response.data.data;
  },
  withdraw: async (registrationId: string) => {
    const response = await apiClient.post<APIResponse<TournamentRegistration>>(
      `/registrations/${registrationId}/withdraw`,
    );
    return response.data.data;
  },
};
