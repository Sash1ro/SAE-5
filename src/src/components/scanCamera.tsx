import { Pressable, StyleSheet, View } from "react-native";
import { CameraView } from "expo-camera";
import { ImagePickerAsset } from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/button";
import EmptyState from "@/components/emptyState";
import ScanFrame from "@/components/scanFrame";
import { useScanCamera } from "@/hooks/useScanCamera";
import { colors } from "@/theme/colors";
import { layout, radius, spacing } from "@/theme/tokens";

type Props = {
  onCapture: (asset: ImagePickerAsset) => void;
};

const SHUTTER_SIZE = 76;
const SHUTTER_RING = 4;

export default function ScanCamera({ onCapture }: Props) {
  const insets = useSafeAreaInsets();
  const { camRef, isGranted, isReady, frame, onLayout, requestPermission, capture } =
    useScanCamera(onCapture);

  if (!isGranted) {
    return (
      <View style={styles.permission}>
        <EmptyState
          icon="camera-outline"
          text="Camera access is needed to scan a manga."
          style={styles.permissionText}
        />
        <View style={styles.permissionAction}>
          <Button label="Allow camera" fun={requestPermission} icon="camera" />
        </View>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing="back" />

      {isReady && <ScanFrame frame={frame} />}

      <Pressable
        onPress={capture}
        hitSlop={spacing.md}
        accessibilityRole="button"
        accessibilityLabel="Take photo"
        style={({ pressed }) => [
          styles.shutter,
          { bottom: insets.bottom + spacing.xxl * 2 },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.shutterCore} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  permission: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.bg2,
  },
  permissionText: {
    flex: 0,
  },
  permissionAction: {
    width: "100%",
    maxWidth: layout.formMaxWidth,
  },
  shutter: {
    position: "absolute",
    alignSelf: "center",
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    padding: SHUTTER_RING,
    borderRadius: radius.pill,
    borderWidth: SHUTTER_RING,
    borderColor: colors.onMain,
  },
  shutterCore: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.onMain,
  },
  pressed: {
    opacity: 0.8,
  },
});