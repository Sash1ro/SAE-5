import { Box } from "@/services/historyService";
import { create } from "zustand";

export type DetectionResult = {
  label: string;
  universe: string;
  tome: string;
  similarity: number;
  confidence: number;
  box: Box | null;
  imageUri?: string;
}

interface DetectionState {
  currentDetection: DetectionResult | null;
  setCurrentDetection: (detection: DetectionResult | null) => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  currentDetection: null,
  setCurrentDetection: (detection) => set({ currentDetection: detection }),
}));
