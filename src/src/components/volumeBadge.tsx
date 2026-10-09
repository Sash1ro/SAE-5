import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius, shadow } from "@/theme/tokens";

type Props = { label: string; size?: "sm" | "md" };

export default function VolumeBadge({ label, size = "md" }: Props) {
  const small = size === "sm";
  return (
    <View style={[styles.badge, small ? styles.badgeSm : styles.badgeMd]}>
      <Text style={[styles.text, small && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: "absolute", backgroundColor: colors.main, ...shadow.sm },
  badgeMd: {
    bottom: -12,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  badgeSm: {
    bottom: -6,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.bg2,
  },
  text: { color: colors.onMain, fontSize: 13, fontWeight: "700" },
  textSm: { fontSize: 11, fontWeight: "800" },
});