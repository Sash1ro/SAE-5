import { View, StyleSheet, Text, Modal } from "react-native";
import { useShallow } from "zustand/react/shallow";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { useMessageStore } from "@/stores/useMessageStore";
import Button from "./button";

type Kind = "error" | "success" | "confirm";

const THEMES: Record<Kind, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap}> = {
  error: {
    color: colors.error,
    bg: "rgba(255, 59, 48, 0.1)",
    icon: "alert-outline",
  },
  success: {
    color: "rgb(61, 213, 135)",
    bg: "rgba(48, 255, 148, 0.1)",
    icon: "checkmark-outline",
  },
  confirm: {
    color: colors.main,
    bg: "rgba(150, 150, 150, 0.1)",
    icon: "help-outline",
  },
};

export default function GlobalMessage() {
  const { visible, kind, title, message, onConfirm, hide } = useMessageStore(
    useShallow((s) => ({
      visible: s.visible,
      kind: s.kind,
      title: s.title,
      message: s.message,
      onConfirm: s.onConfirm,
      hide: s.hide,
    })),
  );

  const theme = THEMES[kind];

  const handleConfirm = () => {
    hide();
    onConfirm?.();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={visible}
      onRequestClose={hide}
    >
      <View style={styles.overlay}>
        <View
          style={styles.box}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.icon} size={32} color={theme.color} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.color }]}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.buttonWrapper}>
            {kind === "confirm" ? (
              <View style={styles.buttonRow}>
                <View style={styles.buttonHalf}>
                  <Button label="Cancel" fun={hide} alt />
                </View>
                <View style={styles.buttonHalf}>
                  <Button label="Confirm" fun={handleConfirm} danger />
                </View>
              </View>
            ) : (
              <Button label="I understand" fun={hide} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: colors.bg2,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    marginHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: colors.onBg,
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  buttonWrapper: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  buttonHalf: {
    flex: 1,
  },
});