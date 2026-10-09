import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Card from "@/components/card";
import ScreenScrollView from "@/components/screenscrollView";
import SectionHeader from "@/components/sectionHeader";
import { colors } from "@/theme/colors";
import { fontSize, radius, spacing } from "@/theme/tokens";
import { openLink } from "@/utils/utils";

const TECHS = ["React Native", "Expo", "Zustand"];

export default function AboutScreen() {
  return (
    <ScreenScrollView backgroundColor={colors.bg2}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Manganitor</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <Card>
        <SectionHeader icon="information-circle" title="About the App" />
        <Text style={styles.paragraph}>
          This application uses Artificial Intelligence to instantly identify manga volumes from
          your photos. Simply snap a picture of a cover, and let the app fetch the details and add
          it to your collection history.
        </Text>
      </Card>

      <Card>
        <SectionHeader icon="hardware-chip" title="Built With" />
        <Text style={styles.paragraph}>
          Proudly built using modern mobile technologies to ensure a fast, native, and seamless
          experience.
        </Text>
        <View style={styles.techRow}>
          {TECHS.map((tech) => (
            <View key={tech} style={styles.techBadge}>
              <Text style={styles.techText}>{tech}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionHeader icon="heart" title="Special Thanks" iconColor={colors.error} />
        <Text style={styles.paragraph}>
          Manga metadata, volume information, and high-quality cover images are graciously provided
          by the MangaDex API.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
          onPress={() => openLink("https://mangadex.org")}
        >
          <Text style={styles.linkText}>Visit MangaDex.org</Text>
          <Ionicons name="open-outline" size={18} color={colors.main} />
        </Pressable>
      </Card>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginTop: spacing.md },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.onBg,
    marginBottom: spacing.xs,
  },
  version: { fontSize: fontSize.sm, color: colors.altText, fontWeight: "500" },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onBg,
    opacity: 0.8,
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  techBadge: {
    backgroundColor: colors.bg2,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.subtle,
  },
  techText: { fontSize: 13, fontWeight: "600", color: colors.onBg },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.subtle,
  },
  pressed: { opacity: 0.7 },
  linkText: { fontSize: 15, fontWeight: "600", color: colors.main },
});