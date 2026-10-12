import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getAllHisotry, History, removeHistory } from "@/services/historyService";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";

export function useHistoryFetching() {
    const router = useRouter();
    const run = useAsyncAction();
    const showConfirm = useMessageStore((s) => s.showConfirmation);

    const [history, setHistory] = useState<History[] | null>(null);
    const hasLoaded = useRef(false);

    const fetchHistory = useCallback(async () => {
        const resp = await run(() => getAllHisotry(), {
            useLoading: !hasLoaded.current,
            loadingText: "Loading history...",
            errorMessage: "Failed to load history.",
        });

        if (!resp) return;
        hasLoaded.current = true;
        if (resp.data) setHistory(resp.data);
    }, [run]);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory]),
    );

    const openDetails = (h: History) =>
        router.push({
            pathname: "/details",
            params: { title: h.universe_name, volume: String(h.universe_volume) },
        });

    const deleteEntry = async (id: string) => {
        const ok = await run(
            async () => {
                await removeHistory(id);
                return true;
            },
            {
                loadingText: "Deleting history...",
                errorMessage: "Failed to delete this entry.",
            },
        );

        if (ok) setHistory((prev) => prev?.filter((item) => item.id !== id) ?? null);
    };

    const confirmDelete = (h: History) =>
        showConfirm("Do you want to delete this history?", "History", () =>
            deleteEntry(h.id),
        );

    return {
        history,
        handleFetch: openDetails,
        handleDelete: confirmDelete,
    };
}