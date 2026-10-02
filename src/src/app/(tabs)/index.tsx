import { Platform, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import ButtonGroup from "@/components/buttonGroup";
import ScreenScrollView from "@/components/screenscrollView";

import { pickImage } from "@/utils/pickImage";
import { takePhoto } from "@/utils/takePhoto";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useDetectionStore } from "@/stores/useDetectionStore";
import { classifyManga } from "@/services/mangaClassifier/classify";
import { colors } from "@/stores/stylesStore";
import { DEF_CONFIDENCE, DEF_SIMILARITY } from "@/services/mangaClassifier/classifyCore";

export default function Index() {
  const router = useRouter();
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const imageLoaded =
    imageAsset && typeof imageAsset === "object" && "uri" in imageAsset;
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const setCurrentDetection = useDetectionStore(
    (state) => state.setCurrentDetection,
  );
  const addToHistory = useDetectionStore((state) => state.addToHistory);

  const handlePickImage = async () => {
    setErrorMessage(null);
    showLoading("Loading image...");
    try {
      const asset = await pickImage();
      if (asset) {
        setImageAsset(asset);
      }
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
    }
  };

  const handleTakePhoto = async () => {
    setErrorMessage(null);
    showLoading("Loading photo...");
    try {
      const asset = await takePhoto();
      if (asset) {
        setImageAsset(asset);
      }
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
    }
  };

  const handleRemove = () => {
    setImageAsset(null);
    setErrorMessage(null);
  };

  const handleRunDetection = async () => {
    if (!imageAsset?.uri) return;

    setErrorMessage(null);
    showLoading("IA Identification...");
    try {
      const result = await classifyManga(imageAsset, DEF_CONFIDENCE, DEF_SIMILARITY);
      if (result) {
        setCurrentDetection(result);
        addToHistory(result);
        router.push({
          pathname: "/details",
          params: { title: `${result.universe}_${result.tome}` },
        });
      } else {
        setErrorMessage(
          "This manga does not appear in the index, or the shot is too unclear.",
        );
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error during parsing.");
    } finally {
      hideLoading();
    }
  };

  return (
    <ScreenScrollView
      backgroundColor={colors.bg2}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.flexSpacer} />
      <ImageViewer imgSource={imageAsset?.uri ?? null} />

      {errorMessage && (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color={colors.error}
          />
          <View style={styles.errorTextGroup}>
            <Text style={styles.errorTitle}>Unrecognized cover</Text>
            <Text style={styles.errorDescription}>{errorMessage}</Text>
          </View>
        </View>
      )}

      <ButtonGroup>
        {!imageLoaded && (
          <Button label="Select Image" fun={handlePickImage} icon={"images"} />
        )}
        {!imageLoaded && isMobile && (
          <Button label="Take Photo" fun={handleTakePhoto} icon={"aperture"} />
        )}
        {imageLoaded && (
          <Button
            label="Remove Photo"
            fun={handleRemove}
            icon={"trash-bin"}
            danger={true}
          />
        )}
        {imageLoaded && (
          <Button label="Fetch data" fun={handleRunDetection} icon={"search"} />
        )}
      </ButtonGroup>
      <View style={styles.flexSpacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    flexBasis: "auto",
    alignItems: "center",
    paddingVertical: 24,
    gap: 20,
  },
  flexSpacer: {
    flex: 1,
    minHeight: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.background,
    width: "90%",
    maxWidth: 360,
  },
  errorTextGroup: {
    flex: 1,
    gap: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onBg,
  },
  errorDescription: {
    fontSize: 13,
    color: colors.altText,
    lineHeight: 18,
  },
});
