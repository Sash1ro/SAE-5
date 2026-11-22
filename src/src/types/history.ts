import { Box } from "./detection";

export enum RESULT {
  SUCCESS = "success",
  FAILED = "failed",
}

export enum TYPE {
  DETECTION = "detection",
  CONTRIBUTION = "contribution",
}

export type History = {
  id: string;
  universe_name: string;
  universe_volume: number;
  ia_similarity: number;
  ia_confidence: number;
  image_64: string;
  history_type: string;
  created_at?: string;
  box?: Box | null;
};
