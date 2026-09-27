import type * as OrtType from "onnxruntime-web";
import { Asset } from "expo-asset";
import { DetectionResult } from "@/stores/useDetectionStore";

import indexData from "../../assets/models/index_mangas.json";

let ort: typeof OrtType | null = null;
let yoloSession: OrtType.InferenceSession | null = null;
let dinov2Session: OrtType.InferenceSession | null = null;

async function getOrt(): Promise<typeof OrtType> {
  if (ort) return ort;
  if (typeof window !== "undefined" && (window as any).ort) {
    ort = (window as any).ort;
    return ort!;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src*="onnxruntime-web"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        ort = (window as any).ort;
        resolve(ort!);
      });
      existingScript.addEventListener("error", () => {
        reject(new Error("Erreur de chargement du script onnxruntime-web."));
      });
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort.min.js";
    script.async = true;
    script.onload = () => {
      ort = (window as any).ort;
      if (ort) {
        ort.env.wasm.wasmPaths =
          "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/";
        ort.env.wasm.numThreads = 1;
        resolve(ort);
      } else {
        reject(new Error("onnxruntime-web introuvable sur window.ort."));
      }
    };
    script.onerror = () => {
      reject(
        new Error("Impossible de telecharger onnxruntime-web depuis le CDN."),
      );
    };
    document.head.appendChild(script);
  });
}

async function loadModelWeb(assetRequire: any): Promise<string> {
  const asset = Asset.fromModule(assetRequire);
  await asset.downloadAsync();
  return asset.uri || asset.localUri || "";
}

export async function initModels(): Promise<void> {
  const ortInstance = await getOrt();

  if (!yoloSession) {
    const yoloUri = await loadModelWeb(
      require("../../assets/models/yolo.onnx"),
    );
    yoloSession = await ortInstance.InferenceSession.create(yoloUri, {
      executionProviders: ["wasm"],
    });
  }
  if (!dinov2Session) {
    const dinoUri = await loadModelWeb(
      require("../../assets/models/dinov2_int8.onnx"),
    );
    dinov2Session = await ortInstance.InferenceSession.create(dinoUri, {
      executionProviders: ["wasm"],
    });
  }
}

function getImagePixelsWeb(
  uri: string,
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible d'initialiser le contexte canvas 2D."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve({
        data: imgData.data,
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = () => {
      reject(new Error("Erreur lors du chargement de l'image sur le Web."));
    };
    img.src = uri;
  });
}

function resizeAndNormalize(
  rawPixels: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  normalizeImageNet: boolean = false,
  cropBox?: { x1: number; y1: number; x2: number; y2: number },
): Float32Array {
  const x1 = cropBox ? Math.max(0, Math.floor(cropBox.x1)) : 0;
  const y1 = cropBox ? Math.max(0, Math.floor(cropBox.y1)) : 0;
  const x2 = cropBox ? Math.min(srcW, Math.floor(cropBox.x2)) : srcW;
  const y2 = cropBox ? Math.min(srcH, Math.floor(cropBox.y2)) : srcH;

  const cropW = x2 - x1;
  const cropH = y2 - y1;

  const out = new Float32Array(3 * targetW * targetH);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = x1 + Math.floor((x / targetW) * cropW);
      const srcY = y1 + Math.floor((y / targetH) * cropH);
      const srcIdx = (srcY * srcW + srcX) * 4;

      let r = rawPixels[srcIdx] / 255.0;
      let g = rawPixels[srcIdx + 1] / 255.0;
      let b = rawPixels[srcIdx + 2] / 255.0;

      if (normalizeImageNet) {
        r = (r - mean[0]) / std[0];
        g = (g - mean[1]) / std[1];
        b = (b - mean[2]) / std[2];
      }

      out[y * targetW + x] = r;
      out[targetW * targetH + y * targetW + x] = g;
      out[2 * targetW * targetH + y * targetW + x] = b;
    }
  }

  return out;
}

function parseLabel(rawLabel: string): { universe: string; tome: string } {
  let universe = "Inconnu";
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

export async function classifyManga(
  imageUri: string,
  minConfidence: number = 0.25,
  minSimilarity: number = 0.4,
): Promise<DetectionResult | null> {
  const ortInstance = await getOrt();
  await initModels();

  const img = await getImagePixelsWeb(imageUri);

  const yoloTensorData = resizeAndNormalize(
    img.data,
    img.width,
    img.height,
    640,
    640,
    false,
  );
  const yoloInputTensor = new ortInstance.Tensor(
    "float32",
    yoloTensorData,
    [1, 3, 640, 640],
  );

  const yoloOutputs = await yoloSession!.run({ images: yoloInputTensor });
  const yoloResult = yoloOutputs[Object.keys(yoloOutputs)[0]];
  const yoloData = yoloResult.data as Float32Array;

  let bestBoxConf = 0;
  let bestBox: { x1: number; y1: number; x2: number; y2: number } | null = null;

  const numBoxes = 8400;
  const numChannels = 408;

  for (let i = 0; i < numBoxes; i++) {
    let maxScore = 0;
    for (let c = 4; c < numChannels; c++) {
      const score = yoloData[c * numBoxes + i];
      if (score > maxScore) maxScore = score;
    }

    if (maxScore > minConfidence && maxScore > bestBoxConf) {
      bestBoxConf = maxScore;
      const xc = (yoloData[0 * numBoxes + i] / 640) * img.width;
      const yc = (yoloData[1 * numBoxes + i] / 640) * img.height;
      const w = (yoloData[2 * numBoxes + i] / 640) * img.width;
      const h = (yoloData[3 * numBoxes + i] / 640) * img.height;

      bestBox = {
        x1: Math.max(0, xc - w / 2),
        y1: Math.max(0, yc - h / 2),
        x2: Math.min(img.width, xc + w / 2),
        y2: Math.min(img.height, yc + h / 2),
      };
    }
  }

  const dinoTensorData = resizeAndNormalize(
    img.data,
    img.width,
    img.height,
    518,
    518,
    true,
    bestBox ?? undefined,
  );
  const dinoInputTensor = new ortInstance.Tensor(
    "float32",
    dinoTensorData,
    [1, 3, 518, 518],
  );

  const dinoOutputs = await dinov2Session!.run({ input: dinoInputTensor });
  const dinoResult = dinoOutputs[Object.keys(dinoOutputs)[0]];
  const embData = Array.from(dinoResult.data as Float32Array);

  let norm = 0;
  for (let i = 0; i < embData.length; i++) norm += embData[i] * embData[i];
  norm = Math.sqrt(norm);
  const normEmb = embData.map((v) => v / (norm || 1.0));

  let bestSim = -1;
  let bestIdx = -1;

  for (let i = 0; i < indexData.embeddings.length; i++) {
    const refEmb = indexData.embeddings[i];
    let dot = 0;
    for (let j = 0; j < 384; j++) {
      dot += normEmb[j] * refEmb[j];
    }
    if (dot > bestSim) {
      bestSim = dot;
      bestIdx = i;
    }
  }

  if (bestSim < minSimilarity || bestIdx === -1) {
    return null;
  }

  const rawLabel = indexData.labels[bestIdx];
  const { universe, tome } = parseLabel(rawLabel);

  return {
    label: rawLabel,
    universe,
    tome,
    similarity: Math.round(bestSim * 1000) / 1000,
    confidence: Math.round(bestBoxConf * 1000) / 1000,
    box: bestBox ?? undefined,
  };
}
