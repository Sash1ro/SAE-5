import type { ImagePickerAsset } from "expo-image-picker";

type Resolver = (asset: ImagePickerAsset | null) => void;
let pending: Resolver | null = null;

export function waitForCapture(): Promise<ImagePickerAsset | null> {
  return new Promise((resolve) => {
    pending?.(null);
    pending = resolve;
  });
}

export function resolveCapture(asset: ImagePickerAsset | null) {
  pending?.(asset);
  pending = null;
}