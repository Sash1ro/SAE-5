import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { layout, radius, shadow, spacing } from "@/theme/tokens";

type Props = { children: React.ReactNode; style?: StyleProp<ViewStyle> };

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: layout.cardWidth,
    maxWidth: layout.cardMaxWidth,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: 20,
    ...shadow.md,
  },
});