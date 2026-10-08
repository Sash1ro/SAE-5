import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, usePathname, useGlobalSearchParams } from "expo-router";
import { useAuthStore } from "../stores/useAuthStore";
import { useLoadingStore } from "../stores/useLoadingStore";
import GlobalLoader from "@/components/globalLoader";
import GlobalError from "@/components/globalMessage";
import { syncIndexWithServer } from "@/services/indexSync/indexManager";
import { me } from "@/services/userService";

let intendedRoute: string | null = null;

export default function RootLayout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);

  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    syncIndexWithServer();

    const verifyAuth = async () => {
      showLoading("Loading session");
      try {
        await me();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        hideLoading();
        setIsAuthChecking(false);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (isAuthChecking) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAlreadyOnLogin = pathname === "/login" || pathname === "/(auth)/login";

    if (!isLoggedIn && !inAuthGroup && !isAlreadyOnLogin) {
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
    } else if (isLoggedIn && (inAuthGroup || isAlreadyOnLogin)) {
      const redirectTo = intendedRoute || "/(tabs)";
      intendedRoute = null;
      router.replace(redirectTo as any);
    }
  }, [isLoggedIn, segments, pathname, params, isAuthChecking]);

  if (isAuthChecking) {
    return <GlobalLoader />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}> 
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" />
      </Stack>
      <GlobalLoader />
      <GlobalError />
    </>
  );
}
