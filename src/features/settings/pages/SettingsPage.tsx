import { PageShell } from '@/components/common/PageShell';
import { useI18n } from '@/hooks/useI18n';
import { LanguageIcon, SettingsIcon, SunIcon } from '@/components/ui/icons';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { LocaleSelector } from '@/components/layout/LocaleSelector';
import { Card, Space, Typography } from 'antd';

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <PageShell title={t('settings.title')} description={t('settings.description')}>
      <Card className="responsive-card-body" styles={{ body: { padding: 20 } }}>
        <Space direction="vertical" size={12} className="w-full">
          <Typography.Title level={4} className="!mb-0 !mt-0 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>{t('settings.foundation')}</span>
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-muted-foreground">
            {t('settings.foundationDescription')}
          </Typography.Paragraph>
          <div className="grid gap-3 pt-2 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border p-3.5 sm:p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <SunIcon className="h-4 w-4" />
                <span>{t('settings.theme')}</span>
              </p>
              <p className="text-sm text-muted-foreground">{t('settings.themeHelp')}</p>
              <ThemeSelector />
            </div>
            <div className="space-y-2 rounded-lg border border-border p-3.5 sm:p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <LanguageIcon className="h-4 w-4" />
                <span>{t('settings.locale')}</span>
              </p>
              <p className="text-sm text-muted-foreground">{t('settings.localeHelp')}</p>
              <LocaleSelector />
            </div>
          </div>
        </Space>
      </Card>
    </PageShell>
  );
}
