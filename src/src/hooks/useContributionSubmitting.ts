import { useState } from "react";
import { useAsyncAction } from "./useAsyncAction";
import { useMessageStore } from "@/stores/useMessageStore";
import { uploadToContribute } from "@/services/contributionService";
import { ImagePickerAsset } from "expo-image-picker";

export function useContributionSubmitting() {
    const [title, setTitle] = useState("");
    const [volume, setVolume] = useState("");
    const run = useAsyncAction();
    const showError = useMessageStore((state) => state.showError);
    const showMessage = useMessageStore((state) => state.showMessage);

    const submitContrib = async (asset: ImagePickerAsset | null, clearImage: () => void) => {
        const volumeNumber = Number(volume.trim());
        const trimmedTitle = title.trim();

        if (!asset?.uri) {
            showError("Image required", "Invalid field")
            return;
        }

        if (!trimmedTitle) {
            showError("Universe required", "Invalid field")
            return;
        }

        if (!volumeNumber || isNaN(volumeNumber)) {
            showError("Volume required", "Invalid field")
            return;
        }

        const ok = await run(async () => {
            await uploadToContribute(trimmedTitle, volumeNumber, asset.uri);
            showMessage("Your contribution has been submitted.", "Success")
            setTitle(""); setVolume(""); clearImage();
            return true;
        }, {
            loadingText: "Submitting contribution...",
            errorMessage: "Error while submitting, please retry later."
        })

        if (!ok) return;
    }

    return {
        title,
        volume,
        submit: submitContrib,
        setTitle,
        setVolume,
    }
}