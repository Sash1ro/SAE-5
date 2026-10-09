import { useState } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { pickImage } from "@/utils/pickImage";
import { takePhoto } from "@/utils/takePhoto";
import { useAsyncAction } from "./useAsyncAction";

export function useImageSelection() {
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const run = useAsyncAction();

  const select = async (source: "library" | "camera") => {
    const picked = await run(source === "library" ? pickImage : takePhoto, {
      loadingText: source === "library" ? "Loading image..." : "Loading photo...",
      errorMessage: "Error while uploading image, please try again.",
    });
    if (picked) setAsset(picked);
  };

  return {
    asset,
    hasImage: asset !== null,
    pickFromLibrary: () => select("library"),
    takePicture: () => select("camera"),
    clear: () => setAsset(null),
  };
}