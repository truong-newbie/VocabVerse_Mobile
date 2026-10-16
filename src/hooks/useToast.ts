import { useUiStore } from '@/stores/uiStore';

type ToastType = 'success' | 'error' | 'info';

export function useToast() {
  const showToast = useUiStore(s => s.showToast);

  return {
    show: (message: string, type: ToastType = 'info') => showToast(message, type),
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
}
