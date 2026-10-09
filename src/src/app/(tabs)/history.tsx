import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import Card from "@/components/card";
import EmptyState from "@/components/emptyState";
import IconButton from "@/components/iconButton";
import VolumeBadge from "@/components/volumeBadge";
import { useHistoryFetching } from "@/hooks/useHistoryFetching";
import { History } from "@/services/historyService";
import { colors } from "@/theme/colors";
import { fontSize, radius, spacing } from "@/theme/tokens";
import { formatDate } from "@/utils/utils";
import ScreenScrollView from "@/components/screenscrollView";

export default function HistoryPage() {
  const { handleDelete, handleFetch, fetchHistory, history } = useHistoryFetching();

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const isEmpty = !history || history.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty && (
        <EmptyState text="Your history is empty" />
      )}

      {!isEmpty && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>History</Text>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          >
            {history.map((h: History, index) => {
              const isDetection = h.history_type.toLowerCase() === "detection";

              return (
                <View key={index} style={styles.item}>
                  <View style={styles.coverWrapper}>
                    {h.image_64 ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${h.image_64}` }}
                        style={styles.cover}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View style={[styles.cover, styles.coverPlaceholder]}>
                        <Ionicons name="book-outline" size={28} color={colors.placeHolder} />
                      </View>
                    )}
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
                      <Text style={styles.metaText}>
                        {isDetection ? "Detection" : "Contribution"}
                      </Text>
                      {h.created_at ? (
                        <>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.metaText}>{formatDate(h.created_at)}</Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <IconButton icon="trash" color={colors.error} fun={() => handleDelete(h)} />
                    <IconButton icon="search" color={colors.main} fun={() => handleFetch(h)} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg2,
    alignItems: "center",
    paddingVertical: 24,
  },
  card: { flex: 1 },
  cardHeader: {
    paddingBottom: spacing.lg,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtle,
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.onBg },
  list: { flex: 1, width: "100%" },
  listContent: { gap: spacing.md, paddingBottom: spacing.xl },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bg2,
    borderRadius: radius.md,
  },
  coverWrapper: { alignItems: "center", justifyContent: "center" },
  cover: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.subtle,
  },
  info: { flex: 1, justifyContent: "center", gap: spacing.xs },
  name: { color: colors.onBg, fontSize: fontSize.md, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: fontSize.xs, color: colors.altText, fontWeight: "500" },
  metaDot: { fontSize: fontSize.xs, color: colors.placeHolder, marginHorizontal: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
});