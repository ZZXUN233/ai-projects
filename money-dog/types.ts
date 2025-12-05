export enum Mood {
  HAPPY = 'HAPPY',
  EXCITED = 'EXCITED',
  LISTENING = 'LISTENING',
  WORRIED = 'WORRIED',
  SLEEPING = 'SLEEPING'
}

export interface Dream {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  coverImage: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO date string
  content: string;
  aiComment?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  mood?: Mood; // The mood of Money when responding
}

export enum AppView {
  CHAT = 'CHAT',
  DREAMS = 'DREAMS',
  DIARY = 'DIARY'
}
