export type GamePlatform = 'MOBILE' | 'PC' | 'CONSOLE' | 'CROSS_PLATFORM';

export interface Game {
  id: string;
  name: string;
  slug: string;
  platform: GamePlatform;
  teamSize: number;
  substituteLimit: number;
  description: string | null;
  active: boolean;
}

export interface GameInput {
  name: string;
  slug: string;
  platform: GamePlatform;
  teamSize: number;
  substituteLimit: number;
  description: string;
  active: boolean;
}
