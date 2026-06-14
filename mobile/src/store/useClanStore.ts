import { create } from 'zustand';

interface ClanMember {
  _id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
}

interface Clan {
  _id: string;
  name: string;
  description?: string;
  emblem?: string;
  hp: number;
  maxHp: number;
  xp: number;
  members: ClanMember[];
  semester: number;
  course: string;
}

interface ClanState {
  clan: Clan | null;
  setClan: (clan: Clan | null) => void;
}

export const useClanStore = create<ClanState>((set) => ({
  clan: null,
  setClan: (clan) => set({ clan }),
}));
