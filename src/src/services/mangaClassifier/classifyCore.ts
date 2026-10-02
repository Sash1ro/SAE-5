import { formatToStub } from "@/utils/utils";

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IndexData {
  embeddings: number[][];
  labels: string[];
}

const CACHE_PREFIX = '@manga_detection_cache_';
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];
export const DEF_CONFIDENCE = 0.2
export const DEF_SIMILARITY = 0.4

export function generateDetectionCacheKey(imageName: string, minConfidence: number, minSimilarity: number): string {
  return formatToStub(`${CACHE_PREFIX}${imageName}_${minConfidence}_${minSimilarity}`);
}

export function resizeAndNormalize(
  rawPixels: Uint8Array | Uint8ClampedArray,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  normalizeImageNet: boolean = false,
  cropBox?: Box,
): Float32Array {
  const x1 = cropBox ? Math.max(0, Math.floor(cropBox.x1)) : 0;
  const y1 = cropBox ? Math.max(0, Math.floor(cropBox.y1)) : 0;
  const x2 = cropBox ? Math.min(srcW, Math.floor(cropBox.x2)) : srcW;
  const y2 = cropBox ? Math.min(srcH, Math.floor(cropBox.y2)) : srcH;

  const cropW = x2 - x1;
  const cropH = y2 - y1;

  const out = new Float32Array(3 * targetW * targetH);

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = x1 + Math.floor((x / targetW) * cropW);
      const srcY = y1 + Math.floor((y / targetH) * cropH);
      const srcIdx = (srcY * srcW + srcX) * 4;

      let r = rawPixels[srcIdx] / 255.0;
      let g = rawPixels[srcIdx + 1] / 255.0;
      let b = rawPixels[srcIdx + 2] / 255.0;

      if (normalizeImageNet) {
        r = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
        g = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
        b = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
      }

      out[y * targetW + x] = r;
      out[targetW * targetH + y * targetW + x] = g;
      out[2 * targetW * targetH + y * targetW + x] = b;
    }
  }

  return out;
}

export function parseLabel(rawLabel: string): {
  universe: string;
  tome: string;
} {
  let universe = "Unknown";
  let tome = "?";
  if (rawLabel.includes("_tome_")) {
    const parts = rawLabel.split("_tome_");
    universe = parts[0]
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const match = parts[1].match(/^(\d+)/);
    tome = match ? match[1] : parts[1];
  }
  return { universe, tome };
}

export function decodeYoloBestBox(
  yoloData: Float32Array,
  numBoxes: number,
  numChannels: number,
  minConfidence: number,
  imgWidth: number,
  imgHeight: number,
  yoloInputSize: number = 640,
): { bestBoxConf: number; bestBox: Box | null } {
  let bestBoxConf = 0;
  let bestBox: Box | null = null;

  for (let i = 0; i < numBoxes; i++) {
    let maxScore = 0;
    for (let c = 4; c < numChannels; c++) {
      const score = yoloData[c * numBoxes + i];
      if (score > maxScore) maxScore = score;
    }

    if (maxScore > minConfidence && maxScore > bestBoxConf) {
      bestBoxConf = maxScore;
      const xc = (yoloData[0 * numBoxes + i] / yoloInputSize) * imgWidth;
      const yc = (yoloData[1 * numBoxes + i] / yoloInputSize) * imgHeight;
      const w = (yoloData[2 * numBoxes + i] / yoloInputSize) * imgWidth;
      const h = (yoloData[3 * numBoxes + i] / yoloInputSize) * imgHeight;

      bestBox = {
        x1: Math.max(0, xc - w / 2),
        y1: Math.max(0, yc - h / 2),
        x2: Math.min(imgWidth, xc + w / 2),
        y2: Math.min(imgHeight, yc + h / 2),
      };
    }
  }

  return { bestBoxConf, bestBox };
}

export function l2Normalize(embData: Float32Array | number[]): number[] {
  let norm = 0;
  for (let i = 0; i < embData.length; i++) norm += embData[i] * embData[i];
  norm = Math.sqrt(norm);
  const denom = norm || 1.0;
  return Array.from(embData, (v) => v / denom);
}

export function findBestMatch(
  normEmb: number[],
  indexData: IndexData,
  embDim: number = 384,
  minMargin: number = 0.04,
): { bestSim: number; bestIdx: number } {
  const scores = indexData.embeddings.map((refEmb, i) => {
    let dot = 0;
    for (let j = 0; j < embDim; j++) {
      dot += normEmb[j] * refEmb[j];
    }
    return { idx: i, label: indexData.labels[i], score: dot };
  });

  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  if (!best) {
    return { bestSim: -1, bestIdx: -1 };
  }

  const bestUniverse = best.label.split("_tome_")[0];
  const secondDifferentUniverse = scores.find((s) => {
    const univ = s.label.split("_tome_")[0];
    return univ !== bestUniverse;
  });

  const bestSim = best.score;
  const bestIdx = best.idx;
  const secondSim = secondDifferentUniverse
    ? secondDifferentUniverse.score
    : -1;

  if (bestSim < 0.85 && secondSim > 0 && bestSim - secondSim < minMargin) {
    return { bestSim: -1, bestIdx: -1 };
  }

  return { bestSim, bestIdx };
}
