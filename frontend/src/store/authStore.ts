import { create } from 'zustand';
import type { User, Student, Teacher } from '@/types';

interface AuthState {
  user: User | null;
  profile: Student | Teacher | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Student | Teacher | null) => void;
  login: (user: User, profile: Student | Teacher | null, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setProfile: (profile) => set({ profile }),

  login: (user, profile, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, profile, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, profile: null, isAuthenticated: false });
  },
}));
