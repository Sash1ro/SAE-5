import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

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
    gap: 12,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onBg,
  },
});
