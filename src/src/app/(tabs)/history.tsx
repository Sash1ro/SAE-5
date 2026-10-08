import ScreenScrollView from '@/components/screenscrollView';
import { getAllHisotry, History } from '@/services/historyService';
import { colors } from '@/stores/stylesStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function HistoryPage() {
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const [history, setHistory] = useState<History[] | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistory(null)
      showLoading("Loading history")
      try {
        const resp = await getAllHisotry()
        if (resp.data) setHistory(resp.data)
      } catch (e) {
        console.error(e)
      } finally {
        hideLoading()
      }
    }

    fetchHistory()
  }, [])

  return (
    <ScreenScrollView
      backgroundColor={colors.bg2}
      contentContainerStyle={styles.scrollContent}
    >

      {!history && (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={48} color={colors.placeHolder} />
          <Text style={styles.emptyText}>Your history is empty</Text>
        </View>
      )}

      {history && history.length > 0 && (
        <View style={styles.card}>
          {history.map((h : History, index) => (
            <Text key={index}>{h.universe_name}</Text>
          ))}
        </View>
      )}

    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    flexBasis: "auto",
    paddingVertical: 24,
    gap: 20,
  },
  emptyState: {
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
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  block: {
    width: "100%",
    gap: 12,
  },
});