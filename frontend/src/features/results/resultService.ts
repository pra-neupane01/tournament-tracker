import { apiClient } from '../../services/api/apiClient';
import type { APIResponse } from '../../types/api';
import type {
  ResultSubmission,
  ResultSubmissionInput,
  ResultSubmissionStatus,
} from './types';

export const resultService = {
  list: async (fixtureId: string) => {
    const response = await apiClient.get<APIResponse<ResultSubmission[]>>(
      `/fixtures/${fixtureId}/results`,
    );
    return response.data.data;
  },
  submit: async (fixtureId: string, input: ResultSubmissionInput) => {
    const response = await apiClient.post<APIResponse<ResultSubmission>>(
      `/fixtures/${fixtureId}/results`,
      input,
    );
    return response.data.data;
  },
  review: async (
    submissionId: string,
    input: { status: ResultSubmissionStatus; reviewNotes: string },
  ) => {
    const response = await apiClient.patch<APIResponse<ResultSubmission>>(
      `/results/${submissionId}/review`,
      input,
    );
    return response.data.data;
  },
};
