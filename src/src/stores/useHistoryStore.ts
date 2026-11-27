import { create } from "zustand";
import { History } from "@/types";

interface HistoryState {
  history: History[] | null;
  hasLoaded: boolean;
  isRefreshing: boolean;
  setHistory: (history: History[] | null) => void;
  prependHistory: (item: History) => void;
  removeHistoryItem: (id: string) => void;
  clearHistoryItems: () => void;
  setHasLoaded: (val: boolean) => void;
  setIsRefreshing: (val: boolean) => void;
  reset: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: null,
  hasLoaded: false,
  isRefreshing: false,
  setHistory: (history) => set({ history }),
  prependHistory: (item) =>
    set((state) => ({
      history: state.history ? [item, ...state.history] : [item],
    })),
  removeHistoryItem: (id) =>
    set((state) => ({
      history: state.history?.filter((item) => item.id !== id) ?? null,
    })),
  clearHistoryItems: () => set({ history: [] }),
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),
  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
  reset: () => set({ history: null, hasLoaded: false, isRefreshing: false }),
}));
