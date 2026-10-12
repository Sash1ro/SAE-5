import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

type Props = {
  uri?: string | null;
  width?: number;
  height?: number;
  borderRadius?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export default function CoverImage({
  uri,
  width = 56,
  height = 56,
  borderRadius = radius.md,
  iconSize = 28,
  style,
}: Props) {
  const size = { width, height, borderRadius };

  if (!uri) {
    return (
      <View style={[styles.base, styles.placeholder, size, style]}>
        <Ionicons name="book-outline" size={iconSize} color={colors.placeHolder} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.base, size, style as object]}
      contentFit="cover"
      transition={200}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.border, overflow: "hidden" },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.subtle,
  },
});