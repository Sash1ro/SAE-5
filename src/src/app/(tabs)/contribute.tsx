import { Platform, StyleSheet, View } from "react-native";
import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import ButtonGroup from "@/components/buttonGroup";
import FormField from "@/components/formField";
import ScreenScrollView from "@/components/screenscrollView";
import { layout, spacing } from "@/theme/tokens";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useContributionSubmitting } from "@/hooks/useContributionSubmitting";

const IS_MOBILE = Platform.OS !== "web";

export default function Contribute() {
  const { asset, hasImage, pickFromLibrary, takePicture, clear } =
    useImageSelection();
  const { submit, setTitle, setVolume, title, volume } =
    useContributionSubmitting();

  return (
    <ScreenScrollView withKeyboardAvoiding>
      <View style={styles.flexSpacer} />
      <ImageViewer
        imgSource={asset?.uri ?? null}
        containerStyle={hasImage ? { height: 300 } : {}}
      />

      <ButtonGroup maxWidth={layout.formMaxWidth}>
        {!hasImage && (
          <Button label="Select Image" fun={pickFromLibrary} icon="images" />
        )}
        {!hasImage && (
          <Button label="Take Photo" alt fun={takePicture} icon="aperture" />
        )}
        {hasImage && (
          <Button label="Remove" fun={clear} icon="trash-bin" danger />
        )}
      </ButtonGroup>

      {hasImage && (
        <View style={[styles.narrow, styles.form]}>
          <FormField
            label="Title / Series"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Chainsaw Man, Naruto..."
          />
          <FormField
            label="Volume number"
            value={volume}
            onChangeText={setVolume}
            placeholder="Ex: 1"
            keyboardType="numeric"
          />
          <Button
            label="Submit the manga"
            fun={() => submit(asset, clear)}
            icon="cloud-upload"
          />
        </View>
      )}
      <View style={styles.flexSpacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  narrow: { width: "100%", maxWidth: layout.formMaxWidth },
  form: { gap: spacing.lg },
  submit: { marginTop: spacing.sm },
  flexSpacer: { flex: 1, minHeight: 16 },
});
