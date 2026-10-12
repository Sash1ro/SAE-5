import { useEffect, useRef, useState } from "react";
import {
    Href,
    useGlobalSearchParams,
    usePathname,
    useRouter,
    useSegments,
} from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { syncIndexWithServer } from "@/services/indexSync/indexManager";
import { me } from "@/services/userService";
import { useAsyncAction } from "./useAsyncAction";

type Params = Record<string, string | string[] | undefined>;

function buildRoute(pathname: string, params: Params): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        const v = Array.isArray(value) ? value[0] : value;
        if (v) search.append(key, v);
    }
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
}

function useSessionCheck() {
    const run = useAsyncAction();
    const setIsLoggedIn = useAuthStore((s) => s.setIsLoggedIn);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        run(() => syncIndexWithServer(), { useLoading: false });

        const check = async () => {
            const ok = await run(
                async () => {
                    await me();
                    return true;
                },
                { loadingText: "Loading session" }
            );

            setIsLoggedIn(Boolean(ok));
            setIsChecking(false);
        }

        check();
    }, [run, setIsLoggedIn]);

    return isChecking;
}

function useAuthRedirect(enabled: boolean) {
    const router = useRouter();
    const segments = useSegments();
    const pathname = usePathname();
    const params = useGlobalSearchParams();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const intendedRoute = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!isLoggedIn && !inAuthGroup) {
            intendedRoute.current = buildRoute(pathname, params);
            router.replace("/(auth)/login");
        } else if (isLoggedIn && inAuthGroup) {
            const target = intendedRoute.current ?? "/(tabs)";
            intendedRoute.current = null;
            router.replace(target as Href);
        }
    }, [enabled, isLoggedIn, segments, pathname, params, router]);
}

export function useAppInit() {
    const isChecking = useSessionCheck();
    useAuthRedirect(!isChecking);
    return { isReady: !isChecking };
}