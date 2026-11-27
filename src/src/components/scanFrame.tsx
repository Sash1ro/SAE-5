import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";
import { Rect } from "@/utils/cropToFrame";

type Props = {
  frame: Rect;
};

const CORNER_SIZE = 32;
const CORNER_THICKNESS = 5;

export default function ScanFrame({ frame }: Props) {
  const { x, y, width, height } = frame;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.dim, { top: 0, left: 0, right: 0, height: y }]} />
      <View style={[styles.dim, { top: y + height, left: 0, right: 0, bottom: 0 }]} />
      <View style={[styles.dim, { top: y, left: 0, width: x, height }]} />
      <View style={[styles.dim, { top: y, right: 0, width: x, height }]} />

      <View style={[styles.frame, { top: y, left: x, width, height }]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    backgroundColor: colors.scrim,
  },
  frame: {
    position: "absolute",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.onMain,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: radius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: radius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: radius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: radius.md,
  },
});