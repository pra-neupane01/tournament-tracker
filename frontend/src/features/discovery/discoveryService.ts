import { apiClient } from "../../services/api/apiClient";
import type { APIResponse } from "../../types/api";
import type { DiscoveryHome } from "./types";

export const discoveryService = {
  home: async () => {
    const response =
      await apiClient.get<APIResponse<DiscoveryHome>>("/discovery/home");
    return response.data.data;
  },
};
