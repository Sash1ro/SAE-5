import IconButton from '@/components/iconButton';
import { getAllHisotry, History, removeHistory } from '@/services/historyService';
import { colors } from '@/stores/stylesStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useMessageStore } from '@/stores/useMessageStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';

export default function HistoryPage() {
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const showConfirm = useMessageStore((state) => state.showConfirmation);

  const [history, setHistory] = useState<History[] | null>(null);
  const isFirstLoad = useRef(true);

  const fetchHistory = async () => {
    if (isFirstLoad.current) {
      showLoading("Loading history");
    }
    try {
      const resp = await getAllHisotry();
      if (resp.data) setHistory(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      if (isFirstLoad.current) {
        hideLoading();
        isFirstLoad.current = false;
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const handleFetch = (history: History) => {
    router.push({
      pathname: "/details",
      params: { title: history.universe_name, volume: history.universe_volume },
    });
  }

  const handleDelete = async (h: History) => showConfirm("Do you want to delete this history?", "History", () => confDelete(h.id));

  const confDelete = async (id: string) => {
    showLoading("Deleting history");
    try {
      await removeHistory(id);
      setHistory((prev) => prev ? prev.filter(item => item.id !== id) : null);
    } catch (e) {
      console.error(e);
    } finally {
      hideLoading();
      fetchHistory();
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {(!history || history.length === 0) && (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={48} color={colors.placeHolder} />
          <Text style={styles.emptyText}>Your history is empty</Text>
        </View>
      )}

      {history && history.length > 0 && (
        <View style={styles.card}>

          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>History</Text>
          </View>

          <ScrollView
            style={styles.historyList}
            contentContainerStyle={styles.historyListContent}
            showsVerticalScrollIndicator={false}
          >
            {history.map((h: History, index) => {
              const isDetection = h.history_type.toLowerCase() === 'detection';

              return (
                <View key={index} style={styles.historyItem}>

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
                    <View style={styles.tomeBadge}>
                      <Text style={styles.tomeBadgeText}>V {h.universe_volume}</Text>
                    </View>
                  </View>

                  <View style={styles.infoWrapper}>
                    <Text style={styles.historyText} numberOfLines={1}>
                      {h.universe_name}
                    </Text>

                    <View style={styles.metaRow}>
                      <Ionicons name={isDetection ? "scan-outline" : "cloud-upload-outline"} size={12} color={colors.altText} />
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

                  <View style={styles.buttonsGroup}>
                    <IconButton icon='trash' color={colors.error} fun={() => handleDelete(h)} />
                    <IconButton icon='search' color={colors.main} fun={() => handleFetch(h)} />
                  </View>

                </View>
              );
            })}
          </ScrollView>
        </View>
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
  coverWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tomeBadge: {
    position: "absolute",
    bottom: -6,
    right: -8,
    backgroundColor: colors.main,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.bg2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  tomeBadgeText: {
    color: colors.onMain,
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: colors.altText,
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    flex: 1,
    width: "90%",
    maxWidth: 420,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    width: "100%",
    paddingBottom: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onBg,
  },
  historyList: {
    flex: 1,
    width: "100%",
  },
  historyListContent: {
    gap: 12,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    backgroundColor: colors.bg2,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  historyText: {
    color: colors.onBg,
    fontSize: 16,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.altText,
    fontWeight: "500",
  },
  metaDot: {
    fontSize: 12,
    color: colors.placeHolder,
    marginHorizontal: 2,
  },
  buttonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  }
});
