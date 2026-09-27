import StyledText from "@/components/styledText";
import { colors } from "@/stores/stylesStore";
import { useDetectionStore } from "@/stores/useDetectionStore";
import { useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function DetailsPage() {
  const { id } = useLocalSearchParams();
  const detection = useDetectionStore((state) => state.currentDetection);

  return (
    <View style={styles.container}>
      <StyledText content={id ? String(id) : "Aucun manga sélectionné"} />
      {detection && (
        <View style={styles.card}>
          <Text style={styles.infoText}>Univers : {detection.universe}</Text>
          <Text style={styles.infoText}>Numéro : Tome {detection.tome}</Text>
          <Text style={styles.infoText}>
            Similarité DINOv2 : {(detection.similarity * 100).toFixed(1)}%
          </Text>
          <Text style={styles.infoText}>
            Confiance cadrage YOLO : {(detection.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg2,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.background,
    gap: 8,
    width: "85%",
    maxWidth: 340,
  },
  infoText: {
    color: colors.onBg,
    fontSize: 16,
  },
});
