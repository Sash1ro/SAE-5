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
  setCurrentDetection: (detection: DetectionResult | null) => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  currentDetection: null,
  setCurrentDetection: (detection) => set({ currentDetection: detection }),
}));
