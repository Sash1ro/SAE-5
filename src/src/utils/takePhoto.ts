import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { router } from "expo-router";
import { Alert } from "react-native";
import { waitForCapture } from "@/services/cameraBridge";

export const takePhoto =
  async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const permissionResult = await Camera.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the camera is required.",
      );
      return null;
    }

    const capture = waitForCapture();
    router.push("/camera");
    return capture;
  };