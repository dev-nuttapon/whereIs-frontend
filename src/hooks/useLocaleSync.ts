import { useEffect } from 'react';
import { uiStore } from '@/stores/ui.store';

export function useLocaleSync() {
  const locale = uiStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale === 'th' ? 'th' : 'en';
  }, [locale]);
}
