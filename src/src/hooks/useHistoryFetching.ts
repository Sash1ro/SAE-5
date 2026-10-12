import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  clearHistory,
  getAllHisotry,
  History,
  removeHistory,
} from "@/services/historyService";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";

function matchesQuery(h: History, query: string): boolean {
  return (
    h.universe_name.toLowerCase().includes(query) ||
    String(h.universe_volume).includes(query)
  );
}

export function useHistoryFetching() {
  const router = useRouter();
  const run = useAsyncAction();
  const showConfirm = useMessageStore((s) => s.showConfirmation);

  const [history, setHistory] = useState<History[] | null>(null);
  const [query, setQuery] = useState("");
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

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    const q = query.trim().toLowerCase();
    return q ? history.filter((h) => matchesQuery(h, q)) : history;
  }, [history, query]);

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

  const deleteAll = async () => {
    const ok = await run(
      async () => {
        await clearHistory();
        return true;
      },
      {
        loadingText: "Clearing history...",
        errorMessage: "Failed to clear history.",
      },
    );

    if (!ok) return; 
    setHistory([]);
    setQuery("");
  };

  const confirmClearAll = () =>
    showConfirm(
      "Delete your entire history? This cannot be undone.",
      "Clear all",
      deleteAll,
    );

  return {
    history: filteredHistory,
    hasHistory: (history?.length ?? 0) > 0,
    query,
    setQuery,
    handleFetch: openDetails,
    handleDelete: confirmDelete,
    handleClearAll: confirmClearAll,
  };
}