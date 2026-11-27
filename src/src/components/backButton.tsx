import { colors } from "@/theme/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function BackButton() {
  const router = useRouter();

  return (
    <Stack.Screen
      options={{
        headerTitleAlign: "left",
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            hitSlop={15}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.placeHolder} />
          </Pressable>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: 20,
    marginLeft: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
