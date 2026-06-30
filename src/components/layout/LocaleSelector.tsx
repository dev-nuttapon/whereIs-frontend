import { Button } from '@/components/ui/button';
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
    <div className="grid grid-cols-2 gap-2">
      {(['en', 'th'] as const).map((value) => {
        const active = locale === value;
        return (
          <Button
            key={value}
            variant={active ? 'secondary' : 'outline'}
            size="sm"
            className="h-auto flex-col gap-1 px-3 py-3 text-xs"
            onClick={() => {
              setLocale(value);
              onSelect?.(value);
            }}
            aria-pressed={active}
          >
            <LanguageIcon className="h-4 w-4" />
            <span className="font-medium">{value === 'en' ? t('common.english') : t('common.thai')}</span>
          </Button>
        );
      })}
    </div>
  );
}
