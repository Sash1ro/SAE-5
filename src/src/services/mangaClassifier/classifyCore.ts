import { formatToStub } from "@/utils/utils";
import { Box, IndexData } from "@/types";

export type { Box, IndexData };

export const DETECTION_CACHE_PREFIX = "@manga_detection_cache_";
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];
export const DEF_CONFIDENCE = 0.2;
export const DEF_SIMILARITY = 0.4;

const TOME_SEP = "_tome_";
const TOME_NUM_RE = /^(\d+)/;
const UNDERSCORE_RE = /_/g;
const WORD_START_RE = /\b\w/g;

function hashString(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function generateDetectionCacheKey(
  image: { uri: string; fileSize?: number; width?: number; height?: number },
  minConfidence: number,
  minSimilarity: number,
  indexVersion: number = 0,
): string {
  const uriHash = hashString(image.uri);
  const meta = `${image.width ?? 0}x${image.height ?? 0}_${image.fileSize ?? 0}`;
  return formatToStub(
    `${DETECTION_CACHE_PREFIX}v${indexVersion}_${uriHash}_${meta}_${minConfidence}_${minSimilarity}`,
  );
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

  const plane = targetW * targetH;
  const out = new Float32Array(3 * plane);

  const sR = normalizeImageNet ? 1 / (255 * IMAGENET_STD[0]) : 1 / 255;
  const sG = normalizeImageNet ? 1 / (255 * IMAGENET_STD[1]) : 1 / 255;
  const sB = normalizeImageNet ? 1 / (255 * IMAGENET_STD[2]) : 1 / 255;
  const bR = normalizeImageNet ? -IMAGENET_MEAN[0] / IMAGENET_STD[0] : 0;
  const bG = normalizeImageNet ? -IMAGENET_MEAN[1] / IMAGENET_STD[1] : 0;
  const bB = normalizeImageNet ? -IMAGENET_MEAN[2] / IMAGENET_STD[2] : 0;

  const xMap = new Int32Array(targetW);
  for (let x = 0; x < targetW; x++) {
    xMap[x] = (x1 + Math.floor((x / targetW) * cropW)) * 4;
  }

  let o = 0;
  for (let y = 0; y < targetH; y++) {
    const rowBase = (y1 + Math.floor((y / targetH) * cropH)) * srcW * 4;
    for (let x = 0; x < targetW; x++, o++) {
      const i = rowBase + xMap[x];
      out[o] = rawPixels[i] * sR + bR;
      out[plane + o] = rawPixels[i + 1] * sG + bG;
      out[2 * plane + o] = rawPixels[i + 2] * sB + bB;
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
  const k = rawLabel.indexOf(TOME_SEP);
  if (k !== -1) {
    universe = rawLabel
      .slice(0, k)
      .replace(UNDERSCORE_RE, " ")
      .replace(WORD_START_RE, (l) => l.toUpperCase());
    const rest = rawLabel.slice(k + TOME_SEP.length);
    const match = rest.match(TOME_NUM_RE);
    tome = match ? match[1] : rest;
  }
  return { universe, tome };
}

let scoreScratch = new Float32Array(0);

export function decodeYoloBestBox(
  yoloData: Float32Array,
  numBoxes: number,
  numChannels: number,
  minConfidence: number,
  imgWidth: number,
  imgHeight: number,
  yoloInputSize: number = 640,
): { bestBoxConf: number; bestBox: Box | null } {
  if (scoreScratch.length < numBoxes) scoreScratch = new Float32Array(numBoxes);
  const scores = scoreScratch;
  scores.fill(0, 0, numBoxes);

  for (let c = 4; c < numChannels; c++) {
    const off = c * numBoxes;
    for (let i = 0; i < numBoxes; i++) {
      const v = yoloData[off + i];
      if (v > scores[i]) scores[i] = v;
    }
  }

  let bestBoxConf = 0;
  let bestIdx = -1;
  for (let i = 0; i < numBoxes; i++) {
    const s = scores[i];
    if (s > minConfidence && s > bestBoxConf) {
      bestBoxConf = s;
      bestIdx = i;
    }
  }

  if (bestIdx === -1) return { bestBoxConf, bestBox: null };

  const sx = imgWidth / yoloInputSize;
  const sy = imgHeight / yoloInputSize;
  const xc = yoloData[bestIdx] * sx;
  const yc = yoloData[numBoxes + bestIdx] * sy;
  const w = yoloData[2 * numBoxes + bestIdx] * sx;
  const h = yoloData[3 * numBoxes + bestIdx] * sy;

  return {
    bestBoxConf,
    bestBox: {
      x1: Math.max(0, xc - w / 2),
      y1: Math.max(0, yc - h / 2),
      x2: Math.min(imgWidth, xc + w / 2),
      y2: Math.min(imgHeight, yc + h / 2),
    },
  };
}

export function l2Normalize(embData: Float32Array | number[]): number[] {
  const n = embData.length;
  let norm = 0;
  for (let i = 0; i < n; i++) norm += embData[i] * embData[i];
  const inv = 1 / (Math.sqrt(norm) || 1);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = embData[i] * inv;
  return out;
}

const universeCache = new WeakMap<IndexData, string[]>();
function getUniverses(indexData: IndexData): string[] {
  let u = universeCache.get(indexData);
  if (!u || u.length !== indexData.labels.length) {
    u = indexData.labels.map((l) => {
      const k = l.indexOf(TOME_SEP);
      return k === -1 ? l : l.slice(0, k);
    });
    universeCache.set(indexData, u);
  }
  return u;
}

export function findBestMatch(
  normEmb: number[],
  indexData: IndexData,
  embDim: number = 384,
  minMargin: number = 0.04,
): { bestSim: number; bestIdx: number } {
  const embs = indexData.embeddings;
  const n = embs.length;
  if (n === 0) return { bestSim: -1, bestIdx: -1 };

  const scores = new Float32Array(n);
  let bestSim = -Infinity;
  let bestIdx = 0;

  for (let i = 0; i < n; i++) {
    const ref = embs[i];
    let dot = 0;
    for (let j = 0; j < embDim; j++) dot += normEmb[j] * ref[j];
    scores[i] = dot;
    if (dot > bestSim) {
      bestSim = dot;
      bestIdx = i;
    }
  }

  if (bestSim >= 0.85) return { bestSim, bestIdx };

  const universes = getUniverses(indexData);
  const bestUniverse = universes[bestIdx];
  let secondSim = -1;
  for (let i = 0; i < n; i++) {
    if (universes[i] !== bestUniverse && scores[i] > secondSim) {
      secondSim = scores[i];
    }
  }

  if (secondSim > 0 && bestSim - secondSim < minMargin) {
    return { bestSim: -1, bestIdx: -1 };
  }
  return { bestSim, bestIdx };
}
