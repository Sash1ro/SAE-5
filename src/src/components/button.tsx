import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { useLoadingStore } from "@/stores/useLoadingStore";

type Props = {
  label?: string;
  fun?: () => void;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  alt?: boolean;
  small?: boolean;
  danger?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  fun,
  onPress,
  icon,
  alt,
  small,
  danger,
  disabled,
  style,
}: Props) {
  const loading = useLoadingStore((state) => state.isLoading);
  const isDisabled = disabled || loading;

  const bg = danger ? colors.error : alt ? colors.second : colors.main;
  const isIconOnly = !label && !!icon;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={fun ?? onPress}
      hitSlop={small ? 8 : 4}
      style={({ pressed }) => [
        styles.button,
        small ? styles.buttonSm : styles.buttonMd,
        { backgroundColor: bg },
        isIconOnly && styles.iconOnly,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={small ? 18 : 20} color={colors.onMain} />
      )}
      {label && (
        <Text style={[styles.label, small && styles.labelSm]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 8,
  },
  buttonMd: {
    height: 48,
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonSm: {
    height: 36,
    paddingHorizontal: 14,
  },
  iconOnly: {
    paddingHorizontal: 0,
    aspectRatio: 1,
    width: undefined,
  },
  label: {
    color: colors.onMain,
    fontSize: 16,
    fontWeight: "600",
  },
  labelSm: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
