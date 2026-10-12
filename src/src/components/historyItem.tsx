import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import CoverImage from "@/components/coverImage";
import IconButton from "@/components/iconButton";
import VolumeBadge from "@/components/volumeBadge";
import { History } from "@/services/historyService";
import { colors } from "@/theme/colors";
import { fontSize, radius, spacing } from "@/theme/tokens";
import { formatDate } from "@/utils/utils";

type Props = {
  item: History;
  onDelete: (h: History) => void;
  onOpen: (h: History) => void;
};

function HistoryItem({ item: h, onDelete, onOpen }: Props) {
  const isDetection = h.history_type.toLowerCase() === "detection";
  const coverUri = h.image_64 ? `data:image/jpeg;base64,${h.image_64}` : null;

  return (
    <View style={styles.item}>
      <View style={styles.coverWrapper}>
        <CoverImage uri={coverUri} />
        <VolumeBadge label={`Vol ${h.universe_volume}`} size="sm" />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {h.universe_name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons
            name={isDetection ? "scan-outline" : "cloud-upload-outline"}
            size={12}
            color={colors.altText}
          />
          <Text style={styles.metaText}>{isDetection ? "Detection" : "Contribution"}</Text>
          {h.created_at ? (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{formatDate(h.created_at)}</Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <IconButton icon="trash" color={colors.error} fun={() => onDelete(h)} />
        <IconButton icon="search" color={colors.main} fun={() => onOpen(h)} />
      </View>
    </View>
  );
}

export default memo(HistoryItem);

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
  },
  coverWrapper: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, justifyContent: "center", gap: spacing.xs },
  name: { color: colors.onBg, fontSize: fontSize.md, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: fontSize.xs, color: colors.altText, fontWeight: "500" },
  metaDot: { fontSize: fontSize.xs, color: colors.placeHolder, marginHorizontal: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
});