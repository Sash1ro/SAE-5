import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { globalStyles } from "@/theme/styles";
import ScreenScrollView from "@/components/screenscrollView";
import VolumeBadge from "@/components/volumeBadge";
import BackButton from "@/components/backButton";
import EmptyState from "@/components/emptyState";
import Badge from "@/components/badge";
import Card from "@/components/card";
import AppText from "@/components/appText";
import CoverImage from "@/components/coverImage";
import IconButton from "@/components/iconButton";

export type FriendProfile = {
  id: string;
  name: string;
  nickname?: string;
  role?: string;
  status?: string;
  level?: string | number;
  avatarUrl?: string;
  altPhotoUrl?: string;
  bio?: string;
  quote?: string;
};

type PhotoSource = "primary" | "alt";

function parseFriend(raw: unknown): FriendProfile | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (typeof str !== "string" || str.length === 0) return null;

  try {
    return JSON.parse(str) as FriendProfile;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(str)) as FriendProfile;
    } catch {
      return null;
    }
  }
}

export default function AltDetailPage() {
  const { friend: rawFriend } = useLocalSearchParams<{ friend?: string | string[] }>();
  const [photoSource, setPhotoSource] = useState<PhotoSource>("primary");

  const webParam =
    Platform.OS === "web" && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("friend")
      : null;

  const friend = parseFriend(rawFriend ?? webParam);

  const primaryUri = friend?.avatarUrl;
  const altUri = friend?.altPhotoUrl;
  const canSwitch = !!primaryUri && !!altUri;

  const photoUri =
    photoSource === "primary"
      ? (primaryUri ?? altUri)
      : (altUri ?? primaryUri);

  const togglePhoto = () =>
    setPhotoSource((prev) => (prev === "primary" ? "alt" : "primary"));

  return (
    <ScreenScrollView>
      <BackButton />

      {!friend && <EmptyState text="No friend unlocked yet." />}

      {friend && (
        <Card>
          <View style={styles.coverWrapper}>
            <View style={styles.coverBox}>
              <CoverImage uri={photoUri} width={180} height={260} />
              {canSwitch && (
                <IconButton
                  onPress={togglePhoto}
                  icon="swap-horizontal-outline"
                  size={18}
                  color={colors.onBg}
                  style={styles.switchBtn}
                />
              )}
            </View>
            {friend.level !== undefined && (
              <VolumeBadge label={`LVL ${friend.level}`} size="md" />
            )}
          </View>

          <View style={styles.headingBlock}>
            <Text style={styles.title} numberOfLines={3}>
              {friend.name}
            </Text>
            {friend.nickname && (
              <View style={styles.authorRow}>
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={colors.altText}
                />
                <Text style={styles.author} numberOfLines={1}>
                  {friend.nickname}
                </Text>
              </View>
            )}
            {friend.quote && (
              <View style={styles.authorRow}>
                <Text style={styles.author} numberOfLines={2}>
                  {`"${friend.quote}"`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            {friend.role && <Badge label={friend.role} />}
            {friend.status && (
              <Badge
                label={friend.status}
                color={colors.second}
                icon="heart-outline"
              />
            )}
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.resumeBlock}>
            <AppText label="Lore" />
            <Text style={styles.resumeText}>
              {friend.bio || "Secret friend dossier unlocked."}
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
  coverBox: {
    width: 180,
    height: 260,
  },
  switchBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
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
