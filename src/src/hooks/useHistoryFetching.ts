import { getAllHisotry, History, removeHistory } from "@/services/historyService";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";

export function useHistoryFetching() {
    const showLoading = useLoadingStore((state) => state.showLoading);
    const hideLoading = useLoadingStore((state) => state.hideLoading);
    const showConfirm = useMessageStore((state) => state.showConfirmation);
    const [history, setHistory] = useState<History[] | null>(null);
    const isFirstLoad = useRef(true);
    const router = useRouter();

    const fetchHistory = async () => {
        if (isFirstLoad.current) {
            showLoading("Loading history...");
        }
        try {
            const resp = await getAllHisotry();
            if (resp.data) setHistory(resp.data);
        } catch (e) {
            console.error(e);
        } finally {
            if (isFirstLoad.current) {
                hideLoading();
                isFirstLoad.current = false;
            }
        }
    };

    const handleFetch = (history: History) => {
        router.push({
            pathname: "/details",
            params: { title: history.universe_name, volume: history.universe_volume },
        });
    }

    const handleDelete = async (h: History) => showConfirm("Do you want to delete this history?", "History", 
        () => confDelete(h.id));

    const confDelete = async (id: string) => {
        showLoading("Deleting history");
        try {
            await removeHistory(id);
            setHistory((prev) => prev ? prev.filter(item => item.id !== id) : null);
        } catch (e) {
            console.error(e);
        } finally {
            hideLoading();
            fetchHistory();
        }
    }

    return {
        handleDelete,
        handleFetch,
        fetchHistory,
        history
    }
}