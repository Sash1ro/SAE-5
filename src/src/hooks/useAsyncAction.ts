import { useCallback } from "react";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useMessageStore } from "@/stores/useMessageStore";

type AsyncOptions = {
    useLoading?: boolean;
    loadingText?: string;
    errorMessage?: string;
    errorTitle?: string;
    onError?: (error: unknown) => void;
};

export function useAsyncAction() {
    const showLoading = useLoadingStore((s) => s.showLoading);
    const hideLoading = useLoadingStore((s) => s.hideLoading);
    const showError = useMessageStore((s) => s.showError);

    return useCallback(
        async <T,>(
            action: () => Promise<T>,
            { useLoading = true, loadingText, errorMessage, errorTitle, onError }: AsyncOptions,
        ): Promise<T | undefined> => {
            if (useLoading) showLoading(loadingText);
            try {
                return await action();
            } catch (error) {
                console.error(error);
                if (onError) onError(error);
                if (errorMessage) showError(errorMessage, errorTitle);
            } finally {
                if (useLoading) hideLoading();
            }
        },
        [showLoading, hideLoading, showError],
    );
}