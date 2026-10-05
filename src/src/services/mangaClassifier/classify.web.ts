import type * as OrtType from "onnxruntime-web";
import { Asset } from "expo-asset";
import { DetectionResult } from "@/stores/useDetectionStore";
import { getActiveIndex } from "@/services/indexSync/indexManager";
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
        reject(new Error("Error while loading onnxruntime-web script."));
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
        reject(new Error("unable to find onnxruntime-web on window.ort."));
      }
    };
    script.onerror = () => {
      reject(
        new Error("Impossible to download onnxruntime-web from CDN."),
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
      require("../../../assets/models/yolo.onnx"),
    );
    yoloSession = await ortInstance.InferenceSession.create(yoloUri, {
      executionProviders: ["wasm"],
    });
  }
  if (!dinov2Session) {
    const dinoUri = await loadModelWeb(
      require("../../../assets/models/dinov2_int8.onnx"),
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
        reject(new Error("Impossible to init 2D Canvas context"));
      } else {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve({
          data: imgData.data,
          width: canvas.width,
          height: canvas.height,
        });
      }
    };
    img.onerror = () => {
      reject(new Error("Error while loading image on the web"));
    };
    img.src = uri;
  });
}

export async function classifyManga(
  image: ImagePickerAsset,
  minConfidence: number = DEF_CONFIDENCE,
  minSimilarity: number = DEF_SIMILARITY,
): Promise<DetectionResult | null> {
  const imageUri = image.uri
  const imageName = image.fileName ?? "file"
  const cacheKey = generateDetectionCacheKey(imageName, minConfidence, minSimilarity);

  const cached = await getCache<DetectionResult | null>(cacheKey);
  if (cached.found) {
    return cached.data;
  }

  const ortInstance = await getOrt();
  await initModels();

  const [img, activeIndex] = await Promise.all([
    getImagePixelsWeb(imageUri),
    getActiveIndex(),
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
      box: bestBox ?? undefined,
    };
  }

  await setCache(cacheKey, result);
  return result;
}

