import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";

type Props = {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyState({
  text,
  icon = "albums-outline",
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={48} color={colors.placeHolder} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    flex: 1,
  },
  text: {
    color: colors.altText,
    fontSize: 15,
    textAlign: "center",
  },
});
