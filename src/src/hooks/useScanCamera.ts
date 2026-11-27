import { useRef, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImagePickerAsset } from "expo-image-picker";
import { cropToFrame, Rect } from "@/utils/cropToFrame";
import { useAsyncAction } from "./useAsyncAction";

const FRAME_RATIO = 2 / 3;
const FRAME_WIDTH_PCT = 0.8;

export function useScanCamera(onCapture: (asset: ImagePickerAsset) => void) {
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const run = useAsyncAction();

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const frameWidth = size.width * FRAME_WIDTH_PCT;
  const frameHeight = frameWidth / FRAME_RATIO;
  const frame: Rect = {
    x: (size.width - frameWidth) / 2,
    y: (size.height - frameHeight) / 2,
    width: frameWidth,
    height: frameHeight,
  };

  const capture = async () => {
    if (!size.width) return;

    const asset = await run(
      async () => {
        const photo = await camRef.current?.takePictureAsync({ quality: 1 });
        return photo ? cropToFrame(photo, size, frame) : null;
      },
      {
        loadingText: "Processing photo...",
        errorMessage: "Error while taking the photo, please try again.",
      },
    );

    if (asset) onCapture(asset);
  };

  return {
    camRef,
    isGranted: !!permission?.granted,
    isReady: size.width > 0,
    frame,
    onLayout,
    requestPermission,
    capture,
  };
}
