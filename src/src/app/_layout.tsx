import { useEffect } from "react";
import { Stack, useRouter, useSegments, usePathname, useGlobalSearchParams } from "expo-router";
import { useAuthStore } from "../stores/useAuthStore";
import GlobalLoader from "@/components/globalLoader";
import { syncIndexWithServer } from "@/services/indexSync/indexManager";

let intendedRoute: string | null = null;

export default function RootLayout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    syncIndexWithServer();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (!isLoggedIn && !inAuthGroup) {
      if (pathname && !pathname.includes("/login")) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            const stringValue = Array.isArray(value) ? value[0] : String(value);
            if (stringValue) {
              searchParams.append(key, stringValue);
            }
          }
        });
        const queryString = searchParams.toString();
        intendedRoute = queryString ? `${pathname}?${queryString}` : pathname;
      }
      router.replace("/(auth)/login");
    } else if (isLoggedIn && inAuthGroup) {
      const redirectTo = intendedRoute || "/(tabs)";
      intendedRoute = null;
      router.replace(redirectTo as any);
    }
    return
  }, [isLoggedIn, segments, pathname, params]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" />
      </Stack>
      <GlobalLoader />
    </>
  );
}
