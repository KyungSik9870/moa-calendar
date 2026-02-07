import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserResponse } from '../types/api';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: UserResponse) => Promise<void>;
  setUser: (user: UserResponse) => void;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: async (token, user) => {
    await AsyncStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  loadToken: async () => {
    const token = await AsyncStorage.getItem('token');
    set({ token, isAuthenticated: !!token, isLoading: false });
  },
}));
