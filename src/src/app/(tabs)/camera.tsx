import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ImagePickerAsset } from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconButton from "@/components/iconButton";
import ScanCamera from "@/components/scanCamera";
import { resolveCapture } from "@/services/cameraBridge";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/tokens";

const CLOSE_SIZE = 40;

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const done = useRef(false);

  useEffect(() => {
    return () => {
      if (!done.current) resolveCapture(null);
    };
  }, []);

  const handleCapture = (asset: ImagePickerAsset) => {
    done.current = true;
    resolveCapture(asset);
    router.back();
  };

  return (
    <View style={styles.root}>
      <ScanCamera onCapture={handleCapture} />
      <IconButton
        icon="close"
        size={22}
        color={colors.onMain}
        fun={() => router.back()}
        style={[styles.close, { top: insets.top + spacing.md }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  close: {
    position: "absolute",
    left: spacing.xl,
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
  },
});