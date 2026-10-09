import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import ScreenScrollView from "@/components/screenscrollView";
import { colors } from "@/theme/colors";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useContributionSubmitting } from "@/hooks/useContributionSubmitting";

const isMobile = Platform.OS !== "web"

export default function Contribute() {
  const { asset, hasImage, pickFromLibrary, takePicture, clear } = useImageSelection();
  const { submit, setTitle, setVolume, title, volume } = useContributionSubmitting();

  return (
    <ScreenScrollView
      backgroundColor={colors.bg2}
      withKeyboardAvoiding={true}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.viewerWrapper}>
        <ImageViewer imgSource={asset?.uri ?? null} />
      </View>

      <View style={styles.buttonsRow}>
        {!hasImage && (
          <Button label="Select Image" fun={pickFromLibrary} icon="images" />
        )}
        {!hasImage && isMobile && (
          <Button label="Take Photo" fun={takePicture} icon="aperture" />
        )}
        {hasImage && (
          <Button
            label="Remove"
            fun={clear}
            icon="trash-bin"
            danger={true}
          />
        )}
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title / Series</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Chainsaw Man, Naruto..."
            placeholderTextColor={colors.placeHolder}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Volume number</Text>
          <TextInput
            value={volume}
            onChangeText={setVolume}
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
          fun={() => submit(asset, clear)}
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
