import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

type Props = TextInputProps & { label?: string };

export default function FormField({ label, style, ...inputProps }: Props) {
  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.placeHolder}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: colors.onBg },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.onBg,
    backgroundColor: colors.background,
  },
});