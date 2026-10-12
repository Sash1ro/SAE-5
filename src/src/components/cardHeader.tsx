import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { fontSize, spacing } from "@/theme/tokens";

type Props = {
  title: string;
  action?: ReactNode;
  children?: ReactNode; 
};

export default function CardHeader({ title, action, children }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: fontSize.xl, fontWeight: "700", color: colors.onBg },
});