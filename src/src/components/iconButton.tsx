import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";

type Props = {
  fun?: () => void;
  onPress?: () => void;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function IconButton({
  fun,
  onPress,
  icon,
  color = colors.placeHolder,
  size = 24,
  style,
}: Props) {
  return (
    <Pressable
      onPress={fun ?? onPress}
      hitSlop={15}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      {icon && <Ionicons name={icon} size={size} color={color} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
