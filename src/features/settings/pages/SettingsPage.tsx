import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { LanguageIcon, SettingsIcon, SunIcon } from '@/components/ui/icons';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { LocaleSelector } from '@/components/layout/LocaleSelector';

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <PageShell title={t('settings.title')} description={t('settings.description')}>
      <Card>
        <CardContent className="space-y-3 p-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4" />
            <span>{t('settings.foundation')}</span>
          </CardTitle>
          <CardDescription>{t('settings.foundationDescription')}</CardDescription>
          <div className="grid gap-3 pt-2 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <SunIcon className="h-4 w-4" />
                <span>{t('settings.theme')}</span>
              </p>
              <p className="text-sm text-muted-foreground">{t('settings.themeHelp')}</p>
              <ThemeSelector />
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <LanguageIcon className="h-4 w-4" />
                <span>{t('settings.locale')}</span>
              </p>
              <p className="text-sm text-muted-foreground">{t('settings.localeHelp')}</p>
              <LocaleSelector />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
