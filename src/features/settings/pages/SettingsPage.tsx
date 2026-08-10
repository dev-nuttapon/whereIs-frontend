import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { LanguageIcon, SettingsIcon, SunIcon } from '@/components/ui/icons';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { LocaleSelector } from '@/components/layout/LocaleSelector';

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <PageShell title={t('settings.title', 'Settings')} description={t('settings.description', 'Theme and language settings for this app shell.')}>
      <Card className="shadow-sm">
        <CardContent className="component-stack p-5 sm:p-6">
          <div className="space-y-1.5">
            <CardTitle className="text-lg flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>{t('settings.foundation', 'App preferences')}</span>
            </CardTitle>
            <CardDescription>{t('settings.foundationDescription', 'Theme and language settings for this app shell.')}</CardDescription>
          </div>
          <div className="grid gap-[18px] md:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-border p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <SunIcon className="h-4 w-4" />
                <span>{t('settings.theme', 'Theme')}</span>
              </p>
              <p className="text-sm text-muted-foreground">{t('settings.themeHelp', 'Choose light, dark, or system appearance.')}</p>
              <ThemeSelector />
            </div>
            <div className="space-y-2 rounded-2xl border border-border p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <LanguageIcon className="h-4 w-4" />
                <span>{t('settings.locale', 'Language')}</span>
              </p>
              <p className="text-sm text-muted-foreground">{t('settings.localeHelp', 'Switch between en and th.')}</p>
              <LocaleSelector />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
