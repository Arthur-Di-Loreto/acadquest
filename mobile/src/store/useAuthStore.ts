import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  clan?: string;
  semester: number;
  course: string;
  lastCheckIn?: string;
  checkInStreak: number;
}

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  isLoading: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setAppUser: (user: AppUser | null) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  appUser: null,
  isLoading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setAppUser: (user) => set({ appUser: user }),
  setLoading: (v) => set({ isLoading: v }),
  reset: () => set({ firebaseUser: null, appUser: null, isLoading: false }),
}));
