import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface UiState {
  toast: ToastState | null;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: () => void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>(set => ({
  toast: null,
  showToast: (message, type = 'info') => {
    toastSeq += 1;
    set({ toast: { id: toastSeq, message, type } });
  },
  dismissToast: () => set({ toast: null }),
}));
