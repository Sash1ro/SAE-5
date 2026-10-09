import { create } from "zustand";

type Kind = "error" | "success" | "confirm";

interface MessageState {
  visible: boolean;
  kind: Kind;
  title: string;
  message: string;
  onConfirm?: () => void;

  showError: (msg?: string, title?: string) => void;
  showMessage: (msg?: string, title?: string) => void;
  showConfirmation: (msg: string, title: string, onConfirm: () => void) => void;
  hide: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  visible: false,
  kind: "success",
  title: "",
  message: "",
  onConfirm: undefined,

  showError: (message = "Error...", title = "Something went wrong") =>
    set({ visible: true, kind: "error", title, message, onConfirm: undefined }),

  showMessage: (message = "", title = "Success") =>
    set({ visible: true, kind: "success", title, message, onConfirm: undefined }),

  showConfirmation: (message, title, onConfirm) =>
    set({ visible: true, kind: "confirm", title, message, onConfirm }),

  hide: () => set({ visible: false, onConfirm: undefined }),
}));