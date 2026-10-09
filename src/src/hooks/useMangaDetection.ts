import { useRouter } from "expo-router";
import { ImagePickerAsset } from "expo-image-picker";
import { classifyManga } from "@/services/mangaClassifier/classify";
import { DEF_CONFIDENCE, DEF_SIMILARITY } from "@/services/mangaClassifier/classifyCore";
import { addToHistory, RESULT, TYPE } from "@/services/historyService";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";

export function useMangaDetection() {
    const router = useRouter();
    const run = useAsyncAction();
    const showError = useMessageStore((s) => s.showError);

    return async (asset: ImagePickerAsset) => {
        const result = await run(() => classifyManga(asset, DEF_CONFIDENCE, DEF_SIMILARITY), {
            loadingText: "AI identification...",
            errorMessage: "Error while detecting your manga, please try again.",
        },
        );

        if (result === undefined) return;
        if (result === null) {
            showError(
                "This manga does not appear in the index, or the shot is too unclear.",
                "Not found",
            );
            return;
        }

        addToHistory(
            result.universe,
            Number(result.tome),
            asset.uri,
            result.confidence,
            result.similarity,
            RESULT.SUCCESS,
            TYPE.DETECTION,
        ).catch((e) => {
            console.error(e);
            showError("Failed to save detection to history.");
        });

        router.push({
            pathname: "/details",
            params: { title: result.universe, volume: String(result.tome) },
        });
    };
}