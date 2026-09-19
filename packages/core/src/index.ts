export type GameCategory = 'party' | 'strategy' | 'card' | 'casino' | 'arcade';
export type GameAvailability = 'available' | 'coming-soon';

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  availability: GameAvailability;
  players: { min: number; max: number };
  accent: string;
  icon: string;
}

export interface GameCatalog {
  list(filters?: { category?: GameCategory; availability?: GameAvailability }): GameDefinition[];
  getById(id: string): GameDefinition | undefined;
}

const gameDefinitions: GameDefinition[] = [
  {
    id: 'cozy-room',
    name: 'Cozy Room',
    description: 'みんなが集まる、CozyTのロビー。ここから遊びたいゲームへ。',
    category: 'party',
    availability: 'available',
    players: { min: 1, max: 12 },
    accent: '#f2a65a',
    icon: '✦'
  },
  {
    id: 'card-table',
    name: 'Card Table',
    description: '軽やかなカードゲーム体験を準備中です。',
    category: 'card',
    availability: 'coming-soon',
    players: { min: 2, max: 6 },
    accent: '#74b49b',
    icon: '♢'
  },
  {
    id: 'night-arcade',
    name: 'Night Arcade',
    description: '短時間で遊べるアーケードゲームを準備中です。',
    category: 'arcade',
    availability: 'coming-soon',
    players: { min: 1, max: 4 },
    accent: '#e57575',
    icon: '◈'
  },
  {
    id: 'table-strategy',
    name: 'Table Strategy',
    description: 'じっくり考えて遊べるテーブルゲームを準備中です。',
    category: 'strategy',
    availability: 'coming-soon',
    players: { min: 2, max: 8 },
    accent: '#7d8cc4',
    icon: '⌘'
  },
  {
    id: 'cozy-casino',
    name: 'Cozy Casino',
    description: 'カジノ系コンテンツのための拡張枠です。',
    category: 'casino',
    availability: 'coming-soon',
    players: { min: 1, max: 8 },
    accent: '#c882ad',
    icon: '♤'
  }
];

export function createGameCatalog(): GameCatalog {
  return {
    list(filters) {
      return gameDefinitions.filter((game) => {
        if (filters?.category && game.category !== filters.category) return false;
        if (filters?.availability && game.availability !== filters.availability) return false;
        return true;
      });
    },
    getById(id) {
      return gameDefinitions.find((game) => game.id === id);
    }
  };
}

export const gameCategories: Array<{ id: GameCategory; label: string }> = [
  { id: 'party', label: 'パーティー' },
  { id: 'strategy', label: 'ストラテジー' },
  { id: 'card', label: 'カード' },
  { id: 'arcade', label: 'アーケード' },
  { id: 'casino', label: 'カジノ' }
];
