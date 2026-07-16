import { apiClient } from '../../services/api/apiClient';
import type { APIResponse } from '../../types/api';
import type { Fixture } from '../competition/types';
import type {
  CheckIn,
  CheckInStatus,
  FixtureScheduleInput,
  MatchRoom,
  MatchRoomInput,
} from './types';

export const matchService = {
  schedule: async (fixtureId: string, input: FixtureScheduleInput) => {
    const response = await apiClient.put<APIResponse<Fixture>>(
      `/fixtures/${fixtureId}/schedule`,
      input,
    );
    return response.data.data;
  },
  room: async (fixtureId: string) => {
    const response = await apiClient.get<APIResponse<MatchRoom>>(`/fixtures/${fixtureId}/room`);
    return response.data.data;
  },
  saveRoom: async (fixtureId: string, input: MatchRoomInput) => {
    const response = await apiClient.put<APIResponse<MatchRoom>>(
      `/fixtures/${fixtureId}/room`,
      input,
    );
    return response.data.data;
  },
  checkIns: async (fixtureId: string) => {
    const response = await apiClient.get<APIResponse<CheckIn[]>>(
      `/fixtures/${fixtureId}/check-ins`,
    );
    return response.data.data;
  },
  checkIn: async (fixtureId: string, registrationId: string) => {
    const response = await apiClient.post<APIResponse<CheckIn>>(
      `/fixtures/${fixtureId}/check-ins`,
      { registrationId },
    );
    return response.data.data;
  },
  setCheckInStatus: async (
    fixtureId: string,
    registrationId: string,
    status: CheckInStatus,
  ) => {
    const response = await apiClient.put<APIResponse<CheckIn>>(
      `/fixtures/${fixtureId}/check-ins/status`,
      { registrationId, status },
    );
    return response.data.data;
  },
};
