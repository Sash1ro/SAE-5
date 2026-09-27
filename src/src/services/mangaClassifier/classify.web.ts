import type * as OrtType from "onnxruntime-web";
import { Asset } from "expo-asset";
import { DetectionResult } from "@/stores/useDetectionStore";

import indexData from "../../../assets/models/index_mangas.json";
import {
  resizeAndNormalize,
  parseLabel,
  decodeYoloBestBox,
  l2Normalize,
  findBestMatch,
} from "./classifyCore";

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

  const { bestSim, bestIdx } = findBestMatch(normEmb, indexData);

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