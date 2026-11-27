import { useRef, useState } from "react";
import { LayoutChangeEvent, useWindowDimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImagePickerAsset } from "expo-image-picker";
import { cropToFrame, Rect } from "@/utils/cropToFrame";
import { useAsyncAction } from "./useAsyncAction";

const FRAME_RATIO = 2 / 3;
const FRAME_WIDTH_PCT = 0.8;
const MAX_FRAME_HEIGHT_PCT = 0.7;

export function useScanCamera(onCapture: (asset: ImagePickerAsset) => void) {
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const run = useAsyncAction();

  const effectiveSize =
    size.width > 0 && size.height > 0
      ? size
      : { width: winWidth, height: winHeight };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize({ width, height });
    }
  };

  const maxHeight = effectiveSize.height * MAX_FRAME_HEIGHT_PCT;
  let frameHeight = (effectiveSize.width * FRAME_WIDTH_PCT) / FRAME_RATIO;
  let frameWidth = frameHeight * FRAME_RATIO;

  if (frameHeight > maxHeight) {
    frameHeight = maxHeight;
    frameWidth = frameHeight * FRAME_RATIO;
  }

  const frame: Rect = {
    x: (effectiveSize.width - frameWidth) / 2,
    y: (effectiveSize.height - frameHeight) / 2,
    width: frameWidth,
    height: frameHeight,
  };

  const capture = async () => {
    if (!effectiveSize.width || !effectiveSize.height) return;

    const asset = await run(
      async () => {
        const photo = await camRef.current?.takePictureAsync({ quality: 1 });
        return photo ? cropToFrame(photo, effectiveSize, frame) : null;
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
    isReady: effectiveSize.width > 0 && effectiveSize.height > 0,
    frame,
    onLayout,
    requestPermission,
    capture,
  };
}
