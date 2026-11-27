import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
  const [found, setFound] = useState(true);
  const [mangaDetails, setMangaDetails] = useState<Manga | null>(null);
  const [redirectFailed, setRedirectFailed] = useState(false);

  const isEasterTitle = !!title && isEaster(title);

  useFocusEffect(
    useCallback(() => {
      if (!isEasterTitle) return;

      const friend = getEasterFriend();
      if (!friend) {
        setRedirectFailed(true);
        return;
      }

      setRedirectFailed(false);
      router.setParams({ title: undefined, volume: undefined });

      router.push({
        pathname: "/altDetail",
        params: { friend: JSON.stringify(friend) },
      });
    }, [isEasterTitle])
  );

  useEffect(() => {
    const volumeNumber = Number.parseInt(volume ?? "", 10);
    setMangaDetails(null);
    setFound(true);
    if (!title || Number.isNaN(volumeNumber) || isEasterTitle) return;
    let cancelled = false;

    const load = async () => {
      const data = await run(() => getCompleteVolumeData(title, volumeNumber), {
        loadingText: "Loading details",
        errorMessage: "Failed to fetch manga details.",
      });

      if (cancelled || data === undefined) return;
      if (data === null) {
        showError("No details found for this manga.", "Not found");
        setFound(false);
        return;
      }
      setMangaDetails(data);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [title, volume, run, showError, isEasterTitle]);

  return {
    title,
    volume,
    mangaDetails,
    found,
    easter: isEasterTitle && !redirectFailed,
  };
}