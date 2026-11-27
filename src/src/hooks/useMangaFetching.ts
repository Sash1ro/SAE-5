import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { getCompleteVolumeData } from "@/services/mangaFetcher";
import { Manga } from "@/types";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";
import { getEasterFriend, isEaster } from "@/utils/easter";

export function useMangaFetching() {
  const { title, volume } = useLocalSearchParams<{
    title?: string;
    volume?: string;
  }>();
  const run = useAsyncAction();
  const showError = useMessageStore((s) => s.showError);
  const [mangaDetails, setMangaDetails] = useState<Manga | null>(null);

  if (isEaster(title!)) {
    const friend = getEasterFriend();

    router.push({
      pathname: "/(tabs)/altDetail",
      params: {
        friend: friend ? JSON.stringify(friend) : undefined,
      },
    });

    return {
      title: title ?? null,
      volume: volume ?? null,
      mangaDetails: mangaDetails ?? null,
    };

  }


  useEffect(() => {
    const volumeNumber = Number.parseInt(volume ?? "", 10);
    setMangaDetails(null);
    if (!title || Number.isNaN(volumeNumber)) return;
    let cancelled = false;

    const fetch = async () => {
      const data = await run(() => getCompleteVolumeData(title, volumeNumber), {
        loadingText: "Loading details",
        errorMessage: "Failed to fetch manga details.",
      });

      if (cancelled || data === undefined) return;
      if (data === null) {
        showError("No details found for this manga.", "Not found");
        return;
      }
      setMangaDetails(data);
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [title, volume, run, showError]);

  return {
    title,
    volume,
    mangaDetails,
  };
}
