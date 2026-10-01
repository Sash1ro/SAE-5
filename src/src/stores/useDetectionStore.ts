import { create } from "zustand";

export interface DetectionResult {
  label: string;
  universe: string;
  tome: string;
  similarity: number;
  confidence: number;
  box?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface DetectionState {
  currentDetection: DetectionResult | null;
  history: DetectionResult[];
  setCurrentDetection: (detection: DetectionResult | null) => void;
  addToHistory: (detection: DetectionResult) => void;
  clearHistory: () => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  currentDetection: null,
  history: [],

  setCurrentDetection: (detection) => set({ currentDetection: detection }),

  addToHistory: (detection) =>
    set((state) => ({
      history: [detection, ...state.history],
    })),

  clearHistory: () => set({ history: [] }),
}));
