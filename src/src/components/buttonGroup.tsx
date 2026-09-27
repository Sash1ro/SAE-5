import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  minButtonWidth?: number;
  maxWidth?: number;
  style?: ViewStyle;
};

export default function ButtonGroup({
  children,
  minButtonWidth = 140,
  maxWidth = 420,
  style,
}: Props) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.container, { maxWidth }, style]}>
      {items.map((child, index) => (
        <View
          key={index}
          style={[styles.slot, { minWidth: minButtonWidth }]}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  slot: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "center",
  },
});