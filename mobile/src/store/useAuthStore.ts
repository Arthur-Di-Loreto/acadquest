import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AppUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  xp: number;
  level: number;
  clan?: string;
  semester: number;
  course: string;
}

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  isLoading: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setAppUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  appUser: null,
  isLoading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setAppUser: (user) => set({ appUser: user }),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({ firebaseUser: null, appUser: null, isLoading: false }),
}));
