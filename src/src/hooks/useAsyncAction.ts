import { useCallback } from "react";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useMessageStore } from "@/stores/useMessageStore";

type AsyncOptions = {
    loadingText: string;
    errorMessage: string;
    errorTitle?: string;
};

export function useAsyncAction() {
    const showLoading = useLoadingStore((s) => s.showLoading);
    const hideLoading = useLoadingStore((s) => s.hideLoading);
    const showError = useMessageStore((s) => s.showError);

    return useCallback(
        async <T,>(action: () => Promise<T>, opts: AsyncOptions): Promise<T | undefined> => {
            showLoading(opts.loadingText);
            try {
                return await action();
            } catch (error) {
                console.error(error);
                showError(opts.errorMessage, opts.errorTitle);
            } finally {
                hideLoading();
            }
        },
        [showLoading, hideLoading, showError],
    );
}