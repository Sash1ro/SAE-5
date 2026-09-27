import { Alert, Platform, StyleSheet, View } from "react-native";
import { useState } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import { useRouter } from "expo-router";
import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import CustomSlider from "@/components/slider";

import { pickImage } from "@/utils/pickImage";
import { takePhoto } from "@/utils/takePhoto";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useDetectionStore } from "@/stores/useDetectionStore";
import { classifyManga } from "@/services/mangaClassifier";
import { colors, container } from "@/stores/stylesStore";

export default function Index() {
  const router = useRouter();
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [sliderValue, setSliderValue] = useState(0.2);
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

  const handleRemove = () => setImageAsset(null);

  const handleRunDetection = async () => {
    if (!imageAsset?.uri) return;

    showLoading("Identification IA en cours...");
    try {
      const result = await classifyManga(imageAsset.uri, sliderValue, 0.4);
      if (result) {
        setCurrentDetection(result);
        addToHistory(result);
        router.push({
          pathname: "/details",
          params: { id: `${result.universe} Tome ${result.tome}` },
        });
      } else {
        Alert.alert(
          "Introuvable",
          "Aucun manga reconnu avec une confiance suffisante.",
        );
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur IA", error.message || "Erreur lors de l'analyse.");
    } finally {
      hideLoading();
    }
  };

  return (
    <View style={styles.container}>
      <ImageViewer imgSource={imageAsset?.uri ?? null} />
      {imageLoaded && (
        <View style={styles.sliderContainer}>
          <CustomSlider
            label="Confidence level"
            value={sliderValue}
            step={0.05}
            onValueChange={setSliderValue}
          />
        </View>
      )}
      <View style={styles.bContainer}>
        {!imageLoaded && (
          <Button
            label="Select Images"
            fun={handlePickImage}
            icon={"images"}
          ></Button>
        )}
        {!imageLoaded && isMobile && (
          <Button
            label="Take Photo"
            fun={handleTakePhoto}
            icon={"aperture"}
          ></Button>
        )}
        {imageLoaded && (
          <Button
            label="Remove Photo"
            fun={handleRemove}
            icon={"trash-bin"}
            danger={true}
          ></Button>
        )}
        {imageLoaded && (
          <Button
            label="Fetch data"
            fun={handleRunDetection}
            icon={"search"}
          ></Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...container,
  bContainer: {
    gap: 10,
    flexDirection: "row",
  },
  sliderContainer: {
    width: "80%",
    maxWidth: 320,
    marginVertical: 0,
  },
});
