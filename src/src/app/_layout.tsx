// app/_layout.tsx
import { Stack } from "expo-router";
import GlobalLoader from "@/components/globalLoader";
import GlobalMessage from "@/components/globalMessage";
import { useAppInit } from "@/hooks/useAppInit";

export default function RootLayout() {
  const { isReady } = useAppInit();

  if (!isReady) return <GlobalLoader />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <GlobalLoader />
      <GlobalMessage />
    </>
  );
}