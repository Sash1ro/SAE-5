import { create } from "zustand";
import { DetectionResult } from "@/types";

export type { DetectionResult };

interface DetectionState {
  currentDetection: DetectionResult | null;
  setCurrentDetection: (detection: DetectionResult | null) => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  currentDetection: null,
  setCurrentDetection: (detection) => set({ currentDetection: detection }),
}));
