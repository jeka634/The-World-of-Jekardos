export enum HeroClass {
  WARRIOR = 'Воин',
  MAGE = 'Маг',
  HEALER = 'Целитель',
  HATER = 'Хейтер'
}

export enum StatType {
  STR = 'Сила',
  AGI = 'Ловкость',
  VIT = 'Живучесть',
  INT = 'Интеллект'
}

export enum ItemType {
  WEAPON = 'Оружие',
  ARMOR = 'Броня', // Chest
  PANTS = 'Штаны',
  BOOTS = 'Обувь',
  CONSUMABLE = 'Расходник',
  JUNK = 'Мусор'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  value: number;
  quantity: number;
  maxStack: number;
  stats?: {
    [key in StatType]?: number;
  };
  healAmount?: number; // For potions
  description: string;
  icon: string;
}

export interface EntityStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  [StatType.STR]: number;
  [StatType.AGI]: number;
  [StatType.VIT]: number;
  [StatType.INT]: number;
}

export interface Loan {
  amount: number;
  battlesRemaining: number;
}

export interface Player {
  name: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  stats: EntityStats;
  statPoints: number;
  inventory: Item[];
  pawnedItems: Item[]; // Items given to pawnbroker
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    pants: Item | null;
    boots: Item | null;
  };
  currentLocationId: string;
  loan: Loan | null;
  lastUltimateUsed: number; // Timestamp
  cheekExperience: number; // Опыт защеканства
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: EntityStats;
  rewardGold: number;
  rewardXp: number;
  description: string;
  isBoss?: boolean;
  isLegendary?: boolean;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  difficultyMod: number;
  biome: string; // e.g., 'forest', 'dungeon'
}

export interface GameLog {
  id: string;
  message: string;
  type: 'info' | 'combat' | 'loot' | 'gain';
  timestamp: number;
}