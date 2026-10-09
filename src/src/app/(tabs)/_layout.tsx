import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ColorValue, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import Button from "@/components/button";
import { deleteToken } from "@/services/userTokenService";
import { useAuthStore } from "@/stores/useAuthStore";

const APP_NAME = "Manganitor";

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcon =
  (active: IconName, inactive: IconName) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color} size={24} />
  );

const TABS = [
  { name: "index", title: "Home", icon: tabIcon("home-sharp", "home-outline") },
  { name: "contribute", title: "Contribute", icon: tabIcon("cloud-upload", "cloud-upload-outline") },
  { name: "history", title: "History", icon: tabIcon("archive", "archive-outline") },
  { name: "about", title: "About", icon: tabIcon("information-circle", "information-circle-outline") },
];

const flatBar = {
  backgroundColor: colors.background,
  elevation: 0,
  shadowOpacity: 0,
} as const;

export default function TabLayout() {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);

  const logout = async () => {
    await deleteToken();
    setIsLoggedIn(false);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: colors.placeHolder,
        tabBarStyle: { ...flatBar, borderTopColor: colors.border, borderTopWidth: 1 },
        headerStyle: { ...flatBar, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTintColor: colors.onBg,
        headerRight: () => (
          <View style={styles.logout}>
            <Button label="Logout" fun={logout} small alt icon="log-out-outline" />
          </View>
        ),
      }}
    >
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, headerTitle: APP_NAME, tabBarIcon: icon }}
        />
      ))}

      {/* Hidden tabs */}
      <Tabs.Screen name="details" options={{ href: null, title: "Details" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logout: { marginRight: 15, width: 120 },
});