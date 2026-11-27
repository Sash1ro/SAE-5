import * as ImageManipulator from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

export type Rect = { x: number; y: number; width: number; height: number };
type Size = { width: number; height: number };
type Photo = Size & { uri: string };

export const cropToFrame = async (
  photo: Photo,
  view: Size,
  frame: Rect,
): Promise<ImagePickerAsset> => {
  const scale = Math.max(view.width / photo.width, view.height / photo.height);
  const offsetX = (photo.width * scale - view.width) / 2;
  const offsetY = (photo.height * scale - view.height) / 2;

  const originX = Math.max(0, Math.round((frame.x + offsetX) / scale));
  const originY = Math.max(0, Math.round((frame.y + offsetY) / scale));
  const width = Math.min(photo.width - originX, Math.round(frame.width / scale));
  const height = Math.min(photo.height - originY, Math.round(frame.height / scale));

  const cropped = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ crop: { originX, originY, width, height } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
  );

  return { uri: cropped.uri, width: cropped.width, height: cropped.height };
};