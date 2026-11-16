import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  label: string;
  size?: "sm" | "md";
};

export default function VolumeBadge({ label, size = "md" }: Props) {
  const small = size === "sm";

  return (
    <View style={[styles.badge, small ? styles.badgeSm : styles.badgeMd]}>
      <Text style={[styles.text, small && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    backgroundColor: colors.main,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeMd: {
    bottom: -12,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeSm: {
    bottom: -6,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.bg2,
  },
  text: {
    color: colors.onMain,
    fontSize: 13,
    fontWeight: "700",
  },
  textSm: {
    fontSize: 11,
    fontWeight: "800",
  },
});
