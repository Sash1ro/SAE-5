import { create } from 'zustand';

interface MessageState {
  isShowingMessage: boolean;
  isShowingError: boolean;
  isShowingConfirmation: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  
  showError: (msg?: string, title?: string) => void;
  showMessage: (msg?: string, title?: string) => void;
  showConfirmation: (msg: string, title: string, onConfirm: () => void) => void;
  
  hideError: () => void;
  hideMessage: () => void;
  hideConfirmation: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  isShowingMessage: false,
  isShowingError: false,
  isShowingConfirmation: false,
  message: '',
  title: '',
  onConfirm: undefined,

  showError: (msg = 'Error...', title = "Something went wrong") => 
    set({ isShowingError: true, message: msg, title: title }),
    
  showMessage: (msg = '', title = "Success") => 
    set({ isShowingMessage: true, message: msg, title: title }),
    
  showConfirmation: (msg, title, onConfirm) => 
    set({ isShowingConfirmation: true, message: msg, title: title, onConfirm: onConfirm }),

  hideError: () => 
    set({ isShowingError: false, message: '' }),
    
  hideMessage: () => 
    set({ isShowingMessage: false, message: '' }),
    
  hideConfirmation: () => 
    set({ isShowingConfirmation: false, message: '', onConfirm: undefined }),
}));
