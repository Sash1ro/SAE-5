import type * as OrtType from "onnxruntime-web";
import { Asset } from "expo-asset";
import { DetectionResult } from "@/types";
import { getActiveIndex } from "@/services/indexSync/indexManager";
import { getLocalVersion } from "@/services/indexSync/indexStorage";
import { getCache, setCache } from "../cacheService";

import {
  resizeAndNormalize,
  parseLabel,
  decodeYoloBestBox,
  l2Normalize,
  findBestMatch,
  generateDetectionCacheKey,
  DEF_CONFIDENCE,
  DEF_SIMILARITY
} from "./classifyCore";
import { ImagePickerAsset } from "expo-image-picker";

const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/";
const MAX_IMAGE_DIMENSION = 640;

let yoloSession: OrtType.InferenceSession | null = null;
let dinov2Session: OrtType.InferenceSession | null = null;
let ortPromise: Promise<typeof OrtType> | null = null;
let initPromise: Promise<void> | null = null;

function configureOrt(o: typeof OrtType): typeof OrtType {
  o.env.wasm.wasmPaths = ORT_BASE;
  o.env.wasm.numThreads = (window as any).crossOriginIsolated
    ? Math.min(4, navigator.hardwareConcurrency || 1)
    : 1;
  return o;
}

function loadOrt(): Promise<typeof OrtType> {
  const w = window as any;
  if (w.ort) return Promise.resolve(configureOrt(w.ort));

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = ORT_BASE + "ort.min.js";
    script.async = true;
    script.onload = () => {
      if (w.ort) {
        resolve(configureOrt(w.ort));
      } else {
        reject(new Error("unable to find onnxruntime-web on window.ort."));
      }
    };
    script.onerror = () => {
      reject(new Error("Impossible to download onnxruntime-web from CDN."));
    };
    document.head.appendChild(script);
  });
}

function getOrt(): Promise<typeof OrtType> {
  return (ortPromise ??= loadOrt().catch((e) => {
    ortPromise = null;
    throw e;
  }));
}

async function loadModelWeb(assetRequire: any): Promise<string> {
  const asset = Asset.fromModule(assetRequire);
  await asset.downloadAsync();
  return asset.uri || asset.localUri || "";
}

export function initModels(): Promise<void> {
  return (initPromise ??= (async () => {
    const ortInstance = await getOrt();
    const create = async (assetRequire: any) =>
      ortInstance.InferenceSession.create(await loadModelWeb(assetRequire), {
        executionProviders: ["wasm"],
      });

    [yoloSession, dinov2Session] = await Promise.all([
      yoloSession ?? create(require("../../../assets/models/yolo.onnx")),
      dinov2Session ?? create(require("../../../assets/models/dinov2_int8.onnx")),
    ]);
  })().catch((e) => {
    initPromise = null;
    throw e;
  }));
}

async function getImagePixelsWeb(
  uri: string,
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const blob = await (await fetch(uri)).blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas: any =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    throw new Error("Impossible to init 2D Canvas context");
  }

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const imgData = ctx.getImageData(0, 0, width, height);
  return { data: imgData.data, width, height };
}

export async function classifyManga(
  image: ImagePickerAsset,
  minConfidence: number = DEF_CONFIDENCE,
  minSimilarity: number = DEF_SIMILARITY,
): Promise<DetectionResult | null> {
  const imageUri = image.uri;
  const indexVersion = await getLocalVersion();
  const cacheKey = generateDetectionCacheKey(image, minConfidence, minSimilarity, indexVersion);

  const cached = await getCache<DetectionResult | null>(cacheKey);
  if (cached.found) {
    return cached.data;
  }

  const [ortInstance, img, activeIndex] = await Promise.all([
    getOrt(),
    getImagePixelsWeb(imageUri),
    getActiveIndex(),
    initModels(),
  ]);

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

  const { bestBoxConf, bestBox } = decodeYoloBestBox(
    yoloData,
    8400,
    408,
    minConfidence,
    img.width,
    img.height,
  );

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
  const normEmb = l2Normalize(dinoResult.data as Float32Array);

  const { bestSim, bestIdx } = findBestMatch(normEmb, activeIndex);

  let result: DetectionResult | null = null;

  if (bestSim >= minSimilarity && bestIdx !== -1) {
    const rawLabel = activeIndex.labels[bestIdx];
    const { universe, tome } = parseLabel(rawLabel);

    result = {
      label: rawLabel,
      universe,
      tome,
      similarity: Math.round(bestSim * 1000) / 1000,
      confidence: Math.round(bestBoxConf * 1000) / 1000,
      box: bestBox ?? null,
    };
  }

  await setCache(cacheKey, result);
  return result;
}