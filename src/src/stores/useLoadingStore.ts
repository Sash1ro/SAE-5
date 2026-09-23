import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message: string;
  showLoading: (msg?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: '',
  showLoading: (msg = 'Loading...') => set({ isLoading: true, message: msg }),
  hideLoading: () => set({ isLoading: false, message: '' }),
}));