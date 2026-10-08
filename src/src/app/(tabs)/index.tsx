import { Platform, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
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
import { addToHistory, RESULT, TYPE } from "@/services/historyService";
import { useMessageStore } from "@/stores/useMessageStore";

export default function Index() {
  const router = useRouter();
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const showError = useMessageStore((state) => state.showError);

  const imageLoaded =
    imageAsset && typeof imageAsset === "object" && "uri" in imageAsset;
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const setCurrentDetection = useDetectionStore(
    (state) => state.setCurrentDetection,
  );

  const handlePickImage = async () => {
    showLoading("Loading image...");
    try {
      const asset = await pickImage();
      if (asset) {
        setImageAsset(asset);
      }
    } catch (error) {
      console.log(error);
      showError("Error while uploading image, please try again.");
    } finally {
      hideLoading();
    }
  };

  const handleTakePhoto = async () => {
    showLoading("Loading photo...");
    try {
      const asset = await takePhoto();
      if (asset) {
        setImageAsset(asset);
      }
    } catch (error) {
      console.log(error);
      showError("Error while uploading image, please try again.");
    } finally {
      hideLoading();
    }
  };

  const handleRemove = () => {
    setImageAsset(null);
  };

  const handleRunDetection = async () => {
    if (!imageAsset?.uri) return;

    showLoading("IA Identification...");
    try {
      const result = await classifyManga(imageAsset, DEF_CONFIDENCE, DEF_SIMILARITY);
      if (result) {
        setCurrentDetection(result);
        await addToHistory(result.universe, Number(result.tome), imageAsset.uri, result.confidence, result.similarity, RESULT.SUCCESS, TYPE.DETECTION)
        
        router.push({
          pathname: "/details",
          params: { title: result.universe, volume: result.tome},
        });
      
      } else {
        showError("This manga does not appear in the index, or the shot is too unclear.", "Not found");
      }
    } catch (error: any) {
      console.error(error);
      showError("Error while detecting your manga, please try again.");
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
});
