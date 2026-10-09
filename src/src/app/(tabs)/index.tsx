import { Platform, StyleSheet, View } from "react-native";
import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import ButtonGroup from "@/components/buttonGroup";
import ScreenScrollView from "@/components/screenscrollView";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useMangaDetection } from "@/hooks/useMangaDetection";
import { layout } from "@/theme/tokens";

const IS_MOBILE = Platform.OS !== "web";

export default function Index() {
  const { asset, hasImage, pickFromLibrary, takePicture, clear } = useImageSelection();
  const detect = useMangaDetection();

  return (
    <ScreenScrollView>
      <View style={styles.flexSpacer} />
      <ImageViewer imgSource={asset?.uri ?? null} />

      <ButtonGroup maxWidth={layout.formMaxWidth}>
        {hasImage && <Button label="Remove Photo" fun={clear} icon="trash-bin" danger />}
        {hasImage && <Button label="Fetch data" fun={() => detect(asset!)} icon="search" />}
        {!hasImage && <Button label="Select Image" fun={pickFromLibrary} icon="images" />}
        {!hasImage && IS_MOBILE && <Button label="Take Photo" alt fun={takePicture} icon="aperture" />}
      </ButtonGroup>

      <View style={styles.flexSpacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  flexSpacer: { flex: 1, minHeight: 16 },
});