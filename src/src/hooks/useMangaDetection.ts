import { useRouter } from "expo-router";
import { ImagePickerAsset } from "expo-image-picker";
import { classifyManga } from "@/services/mangaClassifier/classify";
import { DEF_CONFIDENCE, DEF_SIMILARITY } from "@/services/mangaClassifier/classifyCore";
import { addToHistory } from "@/services/historyService";
import { RESULT, TYPE } from "@/types";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";
import { useDetectionStore } from "@/stores/useDetectionStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

export function useMangaDetection() {
    const router = useRouter();
    const run = useAsyncAction();
    const setDetect = useDetectionStore((s) => s.setCurrentDetection);
    const prependHistory = useHistoryStore((s) => s.prependHistory);
    const showError = useMessageStore((s) => s.showError);

    return async (asset: ImagePickerAsset) => {
        const result = await run(() => classifyManga(asset, DEF_CONFIDENCE, DEF_SIMILARITY), {
            loadingText: "AI identification...",
            errorMessage: "Error while detecting your manga, please try again.",
        });

        if (!result) {
            showError(
                "This manga does not appear in the index, or the shot is too unclear.",
                "Not found",
            );
            return;
        }

        let imageUri = result.imageUri ?? asset.uri;

        try {
            const historyResponse = await addToHistory(
                result.universe,
                Number(result.tome),
                asset.uri,
                result.confidence,
                result.similarity,
                RESULT.SUCCESS,
                TYPE.DETECTION,
                result.box,
            );

            if (historyResponse.data) {
                prependHistory(historyResponse.data);
                if (historyResponse.data.image_64) {
                    imageUri = `data:image/jpeg;base64,${historyResponse.data.image_64}`;
                }
            }
        } catch {
            // Keep offline detection working even if history sync fails
        }

        setDetect({
            ...result,
            imageUri,
        });

        router.push({
            pathname: "/details",
            params: { title: result.universe, volume: String(result.tome) },
        });
    };
}
