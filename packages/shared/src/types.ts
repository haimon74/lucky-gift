export interface LotteryGame {
  gameId: string;
  name: string;
  mainCount: number;
  mainMin: number;
  mainMax: number;
  bonusCount: number;
  bonusMin: number | null;
  bonusMax: number | null;
  bonusName: string | null;
}

export interface OccasionTemplate {
  occasionKey: string;
  displayName: string;
  emoji: string;
  defaultMessage: string;
  revealButtonText: string;
  gradientColors: string[];
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface WizardState {
  step: 1 | 2 | 3 | 4;
  gameId: string | null;
  occasionKey: string | null;
  message: string;
  senderName: string;
  senderEmail: string;
  recipients: Recipient[];
}

export interface GiftPayload {
  gameId: string;
  occasionKey: string;
  message: string;
  senderName: string;
  senderEmail: string;
  recipients: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
}

export interface RevealData {
  gift: {
    id: string;
    gameId: string;
    occasionKey: string;
    message: string;
    senderName: string;
    senderEmail: string;
    createdAt: number;
  };
  recipient: {
    name: string;
    email: string;
    seedHash: string;
    isRevealed: boolean;
  };
  game: LotteryGame;
  template: OccasionTemplate;
}

export interface SettingEntry {
  key: string;
  value: string;
  description?: string;
}
