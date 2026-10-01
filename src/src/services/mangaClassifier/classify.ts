import { Buffer } from "buffer";
import { Platform } from "react-native";
import type * as OrtType from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import jpeg from "jpeg-js";
import { DetectionResult } from "@/stores/useDetectionStore";
import { getActiveIndex } from "@/services/indexSync/indexManager";

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

async function loadModel(assetRequire: any): Promise<string> {
  const asset = Asset.fromModule(assetRequire);
  await asset.downloadAsync();
  return asset.localUri || asset.uri;
}

export async function initModels(): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error(
      "L'inférence ONNX locale est réservée aux appareils mobiles (Android / iOS).",
    );
  }

  if (!ort) {
    ort = require("onnxruntime-react-native");
  }

  if (!yoloSession) {
    const yoloUri = await loadModel(
      require("../../../assets/models/yolo.onnx"),
    );
    yoloSession = await ort!.InferenceSession.create(yoloUri);
  }
  if (!dinov2Session) {
    const dinoUri = await loadModel(
      require("../../../assets/models/dinov2_int8.onnx"),
    );
    dinov2Session = await ort!.InferenceSession.create(dinoUri);
  }
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
  imageUri: string,
  minConfidence: number = 0.25,
  minSimilarity: number = 0.8,
): Promise<DetectionResult | null> {
  await initModels();

  const [img, activeIndex] = await Promise.all([
    getImagePixels(imageUri),
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

  if (bestSim < minSimilarity || bestIdx === -1) {
    return null;
  }

  const rawLabel = activeIndex.labels[bestIdx];
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
