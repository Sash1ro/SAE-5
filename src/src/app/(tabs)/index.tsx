import { Platform, StyleSheet, View } from "react-native";
import ImageViewer from "@/components/imageViewer";
import Button from "@/components/button";
import ButtonGroup from "@/components/buttonGroup";
import ScreenScrollView from "@/components/screenscrollView";
import { colors } from "@/theme/colors";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useMangaDetection } from "@/hooks/useMangaDetection";

const IS_MOBILE = Platform.OS !== "web";

export default function Index() {
  const { asset, hasImage, pickFromLibrary, takePicture, clear } = useImageSelection();
  const detect = useMangaDetection();

  return (
    <ScreenScrollView backgroundColor={colors.bg2} contentContainerStyle={styles.scrollContent}>
      <View style={styles.flexSpacer} />
      <ImageViewer imgSource={asset?.uri ?? null} />

      <ButtonGroup>
        {hasImage && <Button label="Remove Photo" fun={clear} icon="trash-bin" danger />}
        {hasImage && <Button label="Fetch data" fun={() => detect(asset!)} icon="search" />}
        {!hasImage && <Button label="Select Image" fun={pickFromLibrary} icon="images" />}
        {!hasImage && IS_MOBILE && <Button label="Take Photo" alt={true} fun={takePicture} icon="aperture" />}
      </ButtonGroup>

      <View style={styles.flexSpacer} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, flexBasis: "auto", alignItems: "center", paddingVertical: 24, gap: 20 },
  flexSpacer: { flex: 1, minHeight: 16 },
});