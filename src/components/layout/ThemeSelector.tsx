import { Segmented } from 'antd';
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
  compact?: boolean;
}

export function ThemeSelector({ onSelect, compact = false }: ThemeSelectorProps) {
  const theme = uiStore((state) => state.theme);
  const setTheme = uiStore((state) => state.setTheme);
  const { t } = useI18n();

  return (
    <Segmented
      className={compact ? 'shrink-0' : 'w-full'}
      value={theme}
      options={OPTIONS.map(({ value, icon: Icon, labelKey }) => ({
        label: compact ? (
          <span className="inline-flex items-center" title={t(labelKey)} aria-label={t(labelKey)}>
            <Icon className="h-4 w-4" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" />{t(labelKey)}</span>
        ),
        value,
      }))}
      onChange={(value) => {
        const nextTheme = value as Theme;
        setTheme(nextTheme);
        onSelect?.(nextTheme);
      }}
    />
  );
}
