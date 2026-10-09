import { useState } from "react";
import { useAsyncAction } from "./useAsyncAction";
import { useLocalSearchParams } from "expo-router";
import { getCompleteVolumeData, Manga } from "@/services/mangaFetcher";
import { useMessageStore } from "@/stores/useMessageStore";

export function useMangaFetching() {
    const { title, volume } = useLocalSearchParams<{ title?: string; volume?: string }>();
    const run = useAsyncAction();
    const showError = useMessageStore((state) => state.showError)
    const [mangaDetails, setMangaDetails] = useState<Manga | null>(null)

    const fetchManga = async () => {
        if (!title || !volume) return;
        const res = await run(async () => {
            const volumeNumber = parseInt(volume, 10);
            const data = await getCompleteVolumeData(title, volumeNumber);
            if (data) { setMangaDetails(data); return data };
        }, {
            loadingText: "Loading details",
            errorMessage: "Failed to fetch manga details."
        })

        if (res === undefined) return;
        if (res === null) {
            showError("No details found for this manga.", "Not found");
            return;
        }
    }

    return {
        title,
        volume,
        mangaDetails,
        fetch: () => fetchManga(),
    }
}