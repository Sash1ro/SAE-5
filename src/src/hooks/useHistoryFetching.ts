import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  clearHistory,
  getAllHisotry,
  removeHistory,
} from "@/services/historyService";
import { History } from "@/types";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";
import { useDetectionStore } from "@/stores/useDetectionStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

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
  const setDetect = useDetectionStore((s) => s.setCurrentDetection);

  const history = useHistoryStore((s) => s.history);
  const hasLoaded = useHistoryStore((s) => s.hasLoaded);
  const isRefreshing = useHistoryStore((s) => s.isRefreshing);
  const setHistory = useHistoryStore((s) => s.setHistory);
  const removeHistoryItem = useHistoryStore((s) => s.removeHistoryItem);
  const clearHistoryItems = useHistoryStore((s) => s.clearHistoryItems);
  const setHasLoaded = useHistoryStore((s) => s.setHasLoaded);
  const setIsRefreshing = useHistoryStore((s) => s.setIsRefreshing);

  const [query, setQuery] = useState("");

  const fetchHistory = useCallback(
    async (isRefresh: boolean = false) => {
      if (isRefresh) setIsRefreshing(true);
      try {
        const resp = await run(() => getAllHisotry(), {
          useLoading: !isRefresh && !hasLoaded,
          loadingText: "Loading history...",
          errorMessage: "Failed to load history.",
        });

        if (!resp) return;
        setHasLoaded(true);
        if (resp.data) setHistory(resp.data);
      } finally {
        if (isRefresh) setIsRefreshing(false);
      }
    },
    [run, hasLoaded, setHasLoaded, setHistory, setIsRefreshing],
  );

  useFocusEffect(
    useCallback(() => {
      if (!hasLoaded) {
        fetchHistory(false);
      }
    }, [hasLoaded, fetchHistory]),
  );

  const refreshHistory = useCallback(() => fetchHistory(true), [fetchHistory]);

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    const q = query.trim().toLowerCase();
    return q ? history.filter((h) => matchesQuery(h, q)) : history;
  }, [history, query]);

  const openDetails = (h: History) => {
    setDetect({
      label: h.universe_name + "-" + h.universe_volume,
      universe: h.universe_name,
      tome: String(h.universe_volume),
      confidence: h.ia_confidence,
      similarity: h.ia_similarity,
      imageUri: `data:image/jpeg;base64,${h.image_64}`,
      box: null,
    });

    router.push({
      pathname: "/details",
      params: { title: h.universe_name, volume: String(h.universe_volume) },
    });
  };

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

    if (ok) removeHistoryItem(id);
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
    clearHistoryItems();
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
    isRefreshing,
    refreshHistory,
    query,
    setQuery,
    handleFetch: openDetails,
    handleDelete: confirmDelete,
    handleClearAll: confirmClearAll,
  };
}
