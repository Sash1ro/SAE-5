import { colors, container } from "@/stores/stylesStore";
import { useDetectionStore } from "@/stores/useDetectionStore";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getCompleteVolumeData, Manga } from "@/services/mangaFetcher";
import { useState, useEffect } from "react";
import { useLoadingStore } from "@/stores/useLoadingStore";
import ScreenScrollView from "@/components/screenscrollView";

export default function DetailsPage() {
  const detection = useDetectionStore((state) => state.currentDetection);
  const [mangaDetails, setMangaDetails] = useState<Manga | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  useEffect(() => {
    if (!detection?.universe || !detection?.tome) {
      return;
    }

    const fetchDetails = async () => {
      showLoading("Loading details...");
      setFetchFailed(false);
      try {
        const tomeNumber = parseInt(detection.tome, 10);
        const data = await getCompleteVolumeData(detection.universe, tomeNumber);
        if (data) {
          setMangaDetails(data);
        } else {
          setFetchFailed(true);
        }
      } catch (err) {
        console.error("Error while fetching:", err);
        setFetchFailed(true);
      } finally {
        hideLoading();
      }
    };

    fetchDetails();
  }, [detection?.universe, detection?.tome]);

  const isLoadingDetails = !!detection && !mangaDetails && !fetchFailed;

  return (
    <ScreenScrollView
      backgroundColor={colors.bg2}
      contentContainerStyle={styles.scrollContent}
    >
      {!detection && (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={48} color={colors.placeHolder} />
          <Text style={styles.emptyText}>No manga detected yet.</Text>
        </View>
      )}

      {isLoadingDetails && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.main} />
          <Text style={styles.loadingText}>Fetching manga details...</Text>
        </View>
      )}

      {detection && fetchFailed && !mangaDetails && (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.emptyText}>Couldn't load details for this manga.</Text>
        </View>
      )}

      {detection && mangaDetails && (
        <View style={styles.card}>
          <View style={styles.coverWrapper}>
            {mangaDetails.volumeCoverUrl ? (
              <Image
                source={mangaDetails.volumeCoverUrl}
                style={styles.cover}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Ionicons name="book-outline" size={48} color={colors.placeHolder} />
              </View>
            )}

            <View style={styles.tomeBadge}>
              <Text style={styles.tomeBadgeText}>Tome {detection.tome}</Text>
            </View>
          </View>

          <View style={styles.headingBlock}>
            <Text style={styles.title} numberOfLines={3}>
              {mangaDetails.title}
            </Text>
            <View style={styles.authorRow}>
              <Ionicons name="person-outline" size={16} color={colors.altText} />
              <Text style={styles.author} numberOfLines={1}>
                {mangaDetails.author ?? "Unknown Author"}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.main }]}>
              <Ionicons name="layers-outline" size={14} color={colors.onMain} />
              <Text style={[styles.badgeText, { color: colors.onMain }]}>
                {mangaDetails.type}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.second }]}>
              <Ionicons name="bookmark-outline" size={14} color={colors.onMain} />
              <Text style={[styles.badgeText, { color: colors.onMain }]}>
                {mangaDetails.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.resumeBlock}>
            <Text style={styles.sectionLabel}>Synopsis</Text>
            <Text style={styles.resumeText}>
              {mangaDetails.resume || "No synopsis available."}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.chaptersBlock}>
            <Text style={styles.sectionLabel}>Chapters</Text>
            
            {mangaDetails.chapters && mangaDetails.chapters.length > 0 ? (
              <View style={styles.chaptersList}>
                {mangaDetails.chapters.map((chapter) => (
                  <View key={chapter.chapterId} style={styles.chapterItem}>
                    <Ionicons name="document-text-outline" size={20} color={colors.main} />
                    <Text style={styles.chapterTitle} numberOfLines={2}>
                      {`${chapter.chapter} - ${chapter.title}`}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.chaptersPlaceholder}>
                <Ionicons name="information-circle-outline" size={20} color={colors.placeHolder} />
                <Text style={styles.chaptersPlaceholderText}>
                  No chapter found
                </Text>
              </View>
            )}
          </View>
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
  loadingState: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.altText,
    fontSize: 14,
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
  coverWrapper: {
    width: "100%",
    alignItems: "center",
  },
  cover: {
    width: 180,
    height: 260,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  tomeBadge: {
    position: "absolute",
    bottom: -12,
    alignSelf: "center",
    backgroundColor: colors.main,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tomeBadgeText: {
    color: colors.onMain,
    fontSize: 13,
    fontWeight: "700",
  },
  headingBlock: {
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  title: {
    color: colors.onBg,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  author: {
    color: colors.altText,
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  resumeBlock: {
    width: "100%",
    gap: 8,
  },
  sectionLabel: {
    color: colors.onBg,
    fontSize: 15,
    fontWeight: "700",
  },
  resumeText: {
    color: colors.altText,
    fontSize: 14,
    lineHeight: 21,
  },
  chaptersBlock: {
    width: "100%",
    gap: 12, 
  },
  chaptersList: {
    width: "100%",
    gap: 10,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg2, 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  chapterTitle: {
    color: colors.onBg,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  chaptersPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.bg2,
    borderRadius: 12,
    padding: 12,
  },
  chaptersPlaceholderText: {
    color: colors.placeHolder,
    fontSize: 13,
    flex: 1,
  },
});
