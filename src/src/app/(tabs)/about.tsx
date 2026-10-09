import { colors } from '@/stores/stylesStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { openLink } from '@/utils/utils';


export default function AboutScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      
      <View style={styles.hero}>
        <Text style={styles.appName}>Manganitor</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={24} color={colors.main} />
          <Text style={styles.sectionTitle}>About the App</Text>
        </View>
        <Text style={styles.paragraph}>
          This application uses Artificial Intelligence to instantly identify manga volumes from your photos. Simply snap a picture of a cover, and let the app fetch the details and add it to your collection history.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="hardware-chip" size={24} color={colors.main} />
          <Text style={styles.sectionTitle}>Built With</Text>
        </View>
        <Text style={styles.paragraph}>
          Proudly built using modern mobile technologies to ensure a fast, native, and seamless experience.
        </Text>
        <View style={styles.techRow}>
          <View style={styles.techBadge}><Text style={styles.techText}>React Native</Text></View>
          <View style={styles.techBadge}><Text style={styles.techText}>Expo</Text></View>
          <View style={styles.techBadge}><Text style={styles.techText}>Zustand</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart" size={24} color={colors.error} />
          <Text style={styles.sectionTitle}>Special Thanks</Text>
        </View>
        <Text style={styles.paragraph}>
          Manga metadata, volume information, and high-quality cover images are graciously provided by the MangaDex API.
        </Text>
        
        <Pressable 
          style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.7 }]} 
          onPress={() => openLink('https://mangadex.org')}
        >
          <Text style={styles.linkText}>Visit MangaDex.org</Text>
          <Ionicons name="open-outline" size={18} color={colors.main} />
        </Pressable>
      </View>

      <View style={{ height: 24 }} />
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg2,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 16,
  },
  hero: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.onBg,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: colors.altText,
    fontWeight: "500",
  },
  card: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onBg,
  },
  paragraph: {
    fontSize: 15,
    color: colors.onBg,
    lineHeight: 22,
    opacity: 0.8,
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  techBadge: {
    backgroundColor: colors.bg2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  techText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onBg,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.main,
  }
});
