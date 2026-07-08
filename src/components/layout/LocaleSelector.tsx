import { Segmented } from 'antd';
import { uiStore } from '@/stores/ui.store';
import { useI18n } from '@/hooks/useI18n';
import { LanguageIcon } from '@/components/ui/icons';

export interface LocaleSelectorProps {
  onSelect?: (locale: 'en' | 'th') => void;
}

export function LocaleSelector({ onSelect }: LocaleSelectorProps) {
  const locale = uiStore((state) => state.locale);
  const setLocale = uiStore((state) => state.setLocale);
  const { t } = useI18n();

  return (
    <Segmented
      className="w-full"
      value={locale}
      options={[
        { label: <span className="inline-flex items-center gap-2"><LanguageIcon className="h-4 w-4" />{t('common.english')}</span>, value: 'en' },
        { label: <span className="inline-flex items-center gap-2"><LanguageIcon className="h-4 w-4" />{t('common.thai')}</span>, value: 'th' },
      ]}
      onChange={(value) => {
        const nextLocale = value as 'en' | 'th';
        setLocale(nextLocale);
        onSelect?.(nextLocale);
      }}
    />
  );
}
