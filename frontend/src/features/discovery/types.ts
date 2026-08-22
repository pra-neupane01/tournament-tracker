import type { Game } from "../games/types";
import type { Tournament } from "../tournaments/types";

export interface DiscoveryHome {
  games: Game[];
  tournaments: Tournament[];
}
