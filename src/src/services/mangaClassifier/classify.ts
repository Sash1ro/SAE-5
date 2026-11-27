import { Buffer } from "buffer";
import { Platform } from "react-native";
import type * as OrtType from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import jpeg from "jpeg-js";
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


const MAX_IMAGE_DIMENSION = 640;

let ort: typeof OrtType | null = null;
let yoloSession: OrtType.InferenceSession | null = null;
let dinov2Session: OrtType.InferenceSession | null = null;
let initPromise: Promise<void> | null = null;

async function loadModel(assetRequire: any): Promise<string> {
  const asset = Asset.fromModule(assetRequire);
  await asset.downloadAsync();
  return asset.localUri || asset.uri;
}

async function loadSession(assetRequire: any): Promise<OrtType.InferenceSession> {
  const uri = await loadModel(assetRequire);
  return ort!.InferenceSession.create(uri, {
    graphOptimizationLevel: "all",
    intraOpNumThreads: 4,
  });
}

export async function initModels(): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error(
      "ONNX local Interference is only available on mobile device",
    );
  }

  if (yoloSession && dinov2Session) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    ort ??= require("onnxruntime-react-native");
    [yoloSession, dinov2Session] = await Promise.all([
      yoloSession ?? loadSession(require("../../../assets/models/yolo.onnx")),
      dinov2Session ??
        loadSession(require("../../../assets/models/dinov2_int8.onnx")),
    ]);
  })().catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

async function normalizeImage(image: ImagePickerAsset): Promise<string> {
  const actions: ImageManipulator.Action[] = [];
  if (image.width > MAX_IMAGE_DIMENSION || image.height > MAX_IMAGE_DIMENSION) {
    actions.push(
      image.width >= image.height
        ? { resize: { width: MAX_IMAGE_DIMENSION } }
        : { resize: { height: MAX_IMAGE_DIMENSION } },
    );
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    image.uri,
    actions,
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );
  return manipulated.uri;
}

async function getImagePixels(
  uri: string,
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imgBuffer = Buffer.from(base64, "base64");
  const rawData = jpeg.decode(imgBuffer, { useTArray: true });
  return {
    data: rawData.data,
    width: rawData.width,
    height: rawData.height,
  };
}

export async function classifyManga(
  image: ImagePickerAsset,
  minConfidence: number = DEF_CONFIDENCE,
  minSimilarity: number = DEF_SIMILARITY,
): Promise<DetectionResult | null> {
  const indexVersion = await getLocalVersion();
  const cacheKey = generateDetectionCacheKey(image, minConfidence, minSimilarity, indexVersion);

  const cached = await getCache<DetectionResult | null>(cacheKey);
  if (cached.found) {
    return cached.data;
  }

  const [{ img, normalizedUri }, activeIndex] = await Promise.all([
    (async () => {
      const normalizedUri = await normalizeImage(image);
      const img = await getImagePixels(normalizedUri);
      return { img, normalizedUri };
    })(),
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
  const yoloInputTensor = new ort!.Tensor(
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
  const dinoInputTensor = new ort!.Tensor(
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
      imageUri: normalizedUri,
      box: bestBox ?? null,
    };
  }

  await setCache(cacheKey, result);
  return result;
}