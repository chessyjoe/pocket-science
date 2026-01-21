
export interface ScienceDiscovery {
  id: string;
  name: string;
  description: string;
  category: 'plant' | 'animal' | 'rock' | 'other';
  timestamp: number;
  imageUrl?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  points: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SNAP = 'SNAP',
  WHY = 'WHY',
  STORIES = 'STORIES',
  LAB = 'LAB',
  NATURE_LAB = 'NATURE_LAB',
  LIVE_CHAT = 'LIVE_CHAT'
}
