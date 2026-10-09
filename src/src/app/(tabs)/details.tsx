import { colors } from "@/theme/colors";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import ScreenScrollView from "@/components/screenscrollView";
import { useMangaFetching } from "@/hooks/useMangaFetching";
import VolumeBadge from "@/components/volumeBadge";
import BackButton from "@/components/backButton";
import EmptyState from "@/components/emptyState";
import Badge from "@/components/badge";
import { globalStyles } from "@/theme/styles";
import Card from "@/components/card";
import AppText from "@/components/appText";

export default function DetailsPage() {
  const {title, volume, fetch, mangaDetails} = useMangaFetching()
  useEffect(() => {fetch()}, [title, volume]);

  return (
    <ScreenScrollView>
      <BackButton/>

      {(!title || !volume) && (
        <EmptyState text="No Manga detected yet."/>
      )}

      {mangaDetails && (
        <Card>
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

            <VolumeBadge label={`Volume ${volume}`}></VolumeBadge>
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
            <Badge label={mangaDetails.type}/>
            <Badge label={mangaDetails.status} color={colors.second} icon="bookmark-outline"/>
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.resumeBlock}>
            <AppText label="Synopsis"/>
            <Text style={styles.resumeText}>
              {mangaDetails.resume || "No synopsis available."}
            </Text>
          </View>

        </Card>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
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
  resumeBlock: {
    width: "100%",
    gap: 8,
  },
  resumeText: {
    color: colors.altText,
    fontSize: 14,
    lineHeight: 21,
  },
});
