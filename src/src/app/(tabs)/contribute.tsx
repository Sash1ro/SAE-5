import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ImagePickerAsset } from "expo-image-picker";
import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import ScreenScrollView from "@/components/screenscrollView";

import { pickImage } from "@/utils/pickImage";
import { takePhoto } from "@/utils/takePhoto";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { uploadMangaContribution } from "@/services/contributionService";
import { colors } from "@/stores/stylesStore";

export default function Contribute() {
  const [imageAsset, setImageAsset] = useState<ImagePickerAsset | null>(null);
  const [universe, setUniverse] = useState("");
  const [tome, setTome] = useState("");

  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const isMobile = Platform.OS === "ios" || Platform.OS === "android";
  const imageLoaded = Boolean(imageAsset?.uri);

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
    showLoading("Loading camera...");
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

  const handleRemoveImage = () => setImageAsset(null);

  const handleResetForm = () => {
    setImageAsset(null);
    setUniverse("");
    setTome("");
  };

  const handleSubmit = async () => {
    if (!imageAsset?.uri) {
      Alert.alert(
        "Image required",
        "Please select a cover photo.",
      );
      return;
    }

    if (!universe.trim()) {
      Alert.alert(
        "Missing fields",
        "Please fill in the series / universe name.",
      );
      return;
    }

    if (!tome.trim() || isNaN(Number(tome))) {
      Alert.alert(
        "Invalid field",
        "Please enter a valid volume number.",
      );
      return;
    }

    showLoading("Submitting contribution...");
    try {
      await uploadMangaContribution({
        universe,
        tome,
        imageUri: imageAsset.uri,
      });

      Alert.alert(
        "Success",
        "Your contribution has been submitted. It will be incorporated during the next training session.",
      );
      handleResetForm();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "An error occurred while submitting.",
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <ScreenScrollView
      withKeyboardAvoiding={true}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.viewerWrapper}>
        <ImageViewer imgSource={imageAsset?.uri ?? null} />
      </View>

      <View style={styles.buttonsRow}>
        {!imageLoaded && (
          <Button label="Gallery" fun={handlePickImage} icon="images" />
        )}
        {!imageLoaded && isMobile && (
          <Button label="Camera" fun={handleTakePhoto} icon="aperture" />
        )}
        {imageLoaded && (
          <Button
            label="Change"
            fun={handleRemoveImage}
            icon="trash-bin"
            danger={true}
          />
        )}
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title / Series</Text>
          <TextInput
            value={universe}
            onChangeText={setUniverse}
            placeholder="Ex: Chainsaw Man, Naruto..."
            placeholderTextColor={colors.placeHolder}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Volume number</Text>
          <TextInput
            value={tome}
            onChangeText={setTome}
            placeholder="Ex: 1"
            placeholderTextColor={colors.placeHolder}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.submitContainer}>
        <Button
          label="Submit the manga"
          fun={handleSubmit}
          icon="cloud-upload"
        />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    gap: 20,
  },
  viewerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onBg,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.onBg,
    backgroundColor: colors.background,
  },
  submitContainer: {
    width: "100%",
    maxWidth: 320,
    marginTop: 8,
  },
});
