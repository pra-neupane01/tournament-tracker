import { apiClient } from '../../services/api/apiClient';
import type { APIResponse } from '../../types/api';
import type {
  Fixture,
  FixtureInput,
  LeaderboardEntry,
  Qualification,
  ScoringConfig,
  Stage,
  StageGroup,
  StageInput,
} from './types';

export const competitionService = {
  stages: async (tournamentId: string) => {
    const response = await apiClient.get<APIResponse<Stage[]>>(
      `/tournaments/${tournamentId}/stages`,
    );
    return response.data.data;
  },
  createStage: async (tournamentId: string, input: StageInput) => {
    const response = await apiClient.post<APIResponse<Stage>>(
      `/tournaments/${tournamentId}/stages`,
      input,
    );
    return response.data.data;
  },
  updateStage: async (tournamentId: string, stageId: string, input: StageInput) => {
    const response = await apiClient.put<APIResponse<Stage>>(
      `/tournaments/${tournamentId}/stages/${stageId}`,
      input,
    );
    return response.data.data;
  },
  removeStage: (tournamentId: string, stageId: string) =>
    apiClient.delete(`/tournaments/${tournamentId}/stages/${stageId}`),
  generate: async (stageId: string, groupCount: number) => {
    const response = await apiClient.post<APIResponse<Stage>>(`/stages/${stageId}/generate`, {
      groupCount,
    });
    return response.data.data;
  },
  groups: async (stageId: string) => {
    const response = await apiClient.get<APIResponse<StageGroup[]>>(`/stages/${stageId}/groups`);
    return response.data.data;
  },
  createGroup: async (stageId: string, input: { name: string; groupNumber: number }) => {
    const response = await apiClient.post<APIResponse<StageGroup>>(
      `/stages/${stageId}/groups`,
      input,
    );
    return response.data.data;
  },
  updateGroup: async (
    stageId: string,
    groupId: string,
    input: { name: string; groupNumber: number },
  ) => {
    const response = await apiClient.put<APIResponse<StageGroup>>(
      `/stages/${stageId}/groups/${groupId}`,
      input,
    );
    return response.data.data;
  },
  fixtures: async (stageId: string) => {
    const response = await apiClient.get<APIResponse<Fixture[]>>(`/stages/${stageId}/fixtures`);
    return response.data.data;
  },
  createFixture: async (stageId: string, input: FixtureInput) => {
    const response = await apiClient.post<APIResponse<Fixture>>(
      `/stages/${stageId}/fixtures`,
      input,
    );
    return response.data.data;
  },
  removeFixture: (stageId: string, fixtureId: string) =>
    apiClient.delete(`/stages/${stageId}/fixtures/${fixtureId}`),
  scoring: async (stageId: string) => {
    const response = await apiClient.get<APIResponse<ScoringConfig>>(
      `/stages/${stageId}/scoring`,
    );
    return response.data.data;
  },
  saveScoring: async (stageId: string, input: ScoringConfig) => {
    const response = await apiClient.put<APIResponse<ScoringConfig>>(
      `/stages/${stageId}/scoring`,
      input,
    );
    return response.data.data;
  },
  leaderboard: async (stageId: string, groupId?: string) => {
    const response = await apiClient.get<APIResponse<LeaderboardEntry[]>>(
      `/stages/${stageId}/leaderboard`,
      { params: { groupId } },
    );
    return response.data.data;
  },
  qualifications: async (stageId: string) => {
    const response = await apiClient.get<APIResponse<Qualification[]>>(
      `/stages/${stageId}/qualifications`,
    );
    return response.data.data;
  },
  qualify: async (
    stageId: string,
    input: { toStageId: string; qualifierCount: number; perGroup: boolean },
  ) => {
    const response = await apiClient.post<APIResponse<Qualification[]>>(
      `/stages/${stageId}/qualifications`,
      input,
    );
    return response.data.data;
  },
  qualifyManually: async (
    stageId: string,
    input: { toStageId: string; registrationIds: string[] },
  ) => {
    const response = await apiClient.post<APIResponse<Qualification[]>>(
      `/stages/${stageId}/qualifications/manual`,
      input,
    );
    return response.data.data;
  },
};
