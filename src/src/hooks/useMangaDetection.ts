import { useRouter } from "expo-router";
import { ImagePickerAsset } from "expo-image-picker";
import { classifyManga } from "@/services/mangaClassifier/classify";
import { DEF_CONFIDENCE, DEF_SIMILARITY } from "@/services/mangaClassifier/classifyCore";
import { addToHistory, RESULT, TYPE } from "@/services/historyService";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAsyncAction } from "./useAsyncAction";
import { useDetectionStore } from "@/stores/useDetectionStore";

export function useMangaDetection() {
    const router = useRouter();
    const run = useAsyncAction();
    const setDetect = useDetectionStore((s) => s.setCurrentDetection)
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

        const annotatedUri = `data:image/jpeg;base64,${historyResponse.data.image_64}`;

        setDetect({
            ...result,
            imageUri: annotatedUri,
        });

        router.push({
            pathname: "/details",
            params: { title: result.universe, volume: String(result.tome) },
        });
    };
}