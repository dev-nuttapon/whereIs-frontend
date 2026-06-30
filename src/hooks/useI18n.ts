import { uiStore } from '@/stores/ui.store';
import { t } from '@/lib/i18n';

export function useI18n() {
  const locale = uiStore((state) => state.locale);
  const setLocale = uiStore((state) => state.setLocale);
  const toggleLocale = uiStore((state) => state.toggleLocale);

  return {
    locale,
    setLocale,
    toggleLocale,
    t: (key: string, fallback?: string, params?: Record<string, string | number>) => t(locale, key, fallback, params),
  };
}
