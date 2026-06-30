import { Button } from '@/components/ui/button';
import { uiStore, type Theme } from '@/stores/ui.store';
import { useI18n } from '@/hooks/useI18n';
import { MoonIcon, SunIcon, SystemIcon } from '@/components/ui/icons';

const OPTIONS: Array<{
  value: Theme;
  icon: typeof SunIcon;
  labelKey: string;
}> = [
  { value: 'light', icon: SunIcon, labelKey: 'common.light' },
  { value: 'dark', icon: MoonIcon, labelKey: 'common.dark' },
  { value: 'system', icon: SystemIcon, labelKey: 'common.system' },
];

export interface ThemeSelectorProps {
  onSelect?: (theme: Theme) => void;
}

export function ThemeSelector({ onSelect }: ThemeSelectorProps) {
  const theme = uiStore((state) => state.theme);
  const setTheme = uiStore((state) => state.setTheme);
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, icon: Icon, labelKey }) => {
        const active = theme === value;
        return (
          <Button
            key={value}
            variant={active ? 'secondary' : 'outline'}
            size="sm"
            className="h-auto flex-col gap-1.5 px-3 py-3 text-xs"
            onClick={() => {
              setTheme(value);
              onSelect?.(value);
            }}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" />
            <span>{t(labelKey)}</span>
          </Button>
        );
      })}
    </div>
  );
}
