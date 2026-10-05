import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (val : boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false, 
  setIsLoggedIn: (val: boolean) => set({ isLoggedIn: val }),
}));