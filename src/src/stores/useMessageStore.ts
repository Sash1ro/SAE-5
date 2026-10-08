import { create } from 'zustand';

interface MessageState {
  isShowingMessage: boolean;
  isShowingError: boolean;
  title: string;
  message: string;
  showError: (msg?: string, title?:string) => void;
  showMessage: (msg?: string, title?:string) => void;
  hideError: () => void;
  hideMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isShowingMessage: false,
  isShowingError: false,
  message: '',
  title: '',
  showError: (msg = 'Error...', title = "Something went wrong") => set({ isShowingError: true, message: msg, title: title }),
  showMessage: (msg = '', title = "Success") => set({ isShowingMessage: true, message: msg, title: title }),
  hideError: () => set({ isShowingError: false, message: '' }),
  hideMessage: () => set({ isShowingMessage: false, message: '' }),
}));