import { apiClient } from '../../services/api/apiClient';
import type { APIResponse } from '../../types/api';
import type {
  RegistrationFormField,
  RegistrationFormFieldInput,
} from './types';

export const registrationFormService = {
  list: async (tournamentId: string) => {
    const response = await apiClient.get<APIResponse<RegistrationFormField[]>>(
      `/tournaments/${tournamentId}/registration-form`,
    );
    return response.data.data;
  },
  create: async (tournamentId: string, input: RegistrationFormFieldInput) => {
    const response = await apiClient.post<APIResponse<RegistrationFormField>>(
      `/tournaments/${tournamentId}/registration-form`,
      input,
    );
    return response.data.data;
  },
  update: async (
    tournamentId: string,
    fieldId: string,
    input: RegistrationFormFieldInput,
  ) => {
    const response = await apiClient.put<APIResponse<RegistrationFormField>>(
      `/tournaments/${tournamentId}/registration-form/${fieldId}`,
      input,
    );
    return response.data.data;
  },
  remove: (tournamentId: string, fieldId: string) =>
    apiClient.delete(`/tournaments/${tournamentId}/registration-form/${fieldId}`),
};
