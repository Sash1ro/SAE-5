export type Box = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export interface IndexData {
  embeddings: number[][];
  labels: string[];
}

export type DetectionResult = {
  label: string;
  universe: string;
  tome: string;
  similarity: number;
  confidence: number;
  box?: Box | null;
  imageUri?: string;
};
