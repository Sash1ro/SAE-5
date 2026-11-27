import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor?: string;
};

export default function SectionHeader({
  icon,
  title,
  iconColor = colors.main,
}: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onBg,
  },
});
