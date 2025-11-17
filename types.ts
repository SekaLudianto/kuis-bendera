
export interface Country {
  name: string;
  code: string;
}

export interface ChatMessage {
  id: string;
  nickname: string;
  comment: string;
  profilePictureUrl?: string;
  isWinner?: boolean;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  profilePictureUrl?: string;
}

export interface RoundWinner extends LeaderboardEntry {
  time: number;
}

export enum GameState {
    Setup = 'setup',
    Connecting = 'connecting',
    Playing = 'playing',
    Champion = 'champion',
    Finished = 'finished',
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
