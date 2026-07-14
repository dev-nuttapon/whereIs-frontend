import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/forms/FormField';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { LanguageIcon, SettingsIcon, SunIcon } from '@/components/ui/icons';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { LocaleSelector } from '@/components/layout/LocaleSelector';
import { useLookups } from '@/features/lookups/hooks/useLookups';
import { useWorkspaceSettings, useUpdateWorkspaceSettings } from '@/features/settings/hooks/useWorkspaceSettings';

export function SettingsPage() {
  const { wsId } = useParams();
  const { t } = useI18n();
  const lookupsQuery = useLookups();
  const settingsQuery = useWorkspaceSettings(wsId ?? '');
  const updateSettings = useUpdateWorkspaceSettings(wsId ?? '');
  const [timezone, setTimezone] = useState('Asia/Bangkok');
  const [defaultUnit, setDefaultUnit] = useState('');
  const [borrowRequiresApproval, setBorrowRequiresApproval] = useState(true);

  useEffect(() => {
    if (settingsQuery.data) {
      setTimezone(settingsQuery.data.timezone ?? 'Asia/Bangkok');
      setDefaultUnit(settingsQuery.data.defaultUnit ?? '');
      setBorrowRequiresApproval(settingsQuery.data.borrowRequiresApproval);
    }
  }, [settingsQuery.data]);

  const unitOptions = useMemo(
    () => lookupsQuery.data?.unitTypes ?? [],
    [lookupsQuery.data?.unitTypes],
  );

  const saveWorkspaceSettings = async () => {
    if (!wsId) {
      return;
    }

    await updateSettings.mutateAsync({
      timezone,
      defaultUnit: defaultUnit || null,
      borrowRequiresApproval,
    });
  };

  return (
    <PageShell title={t('settings.title', 'Settings')} description={t('settings.description', 'Theme, language, and workspace preferences.')}>
      {wsId ? (
        <Card className="shadow-sm">
          <CardContent className="component-stack p-5 sm:p-6">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">{t('settings.workspaceTitle', 'Workspace settings')}</CardTitle>
              <CardDescription>
                {t('settings.workspaceDescription', 'Configure defaults used by inventory, borrow flows, and display.')}
              </CardDescription>
            </div>

            {settingsQuery.isLoading ? <LoadingState label={t('common.loading', 'Loading...')} /> : null}
            {settingsQuery.isError ? <ErrorState message={t('settings.loadError', 'Unable to load workspace settings.')} onRetry={() => settingsQuery.refetch()} /> : null}
            {lookupsQuery.isLoading ? <LoadingState label={t('common.loading', 'Loading...')} /> : null}

            {!settingsQuery.isLoading && !settingsQuery.isError ? (
              <div className="component-stack">
                <FormField label={t('settings.timezone', 'Timezone')} htmlFor="workspace-timezone">
                  <Input
                    id="workspace-timezone"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    placeholder="Asia/Bangkok"
                    autoComplete="off"
                  />
                </FormField>

                <FormField label={t('settings.defaultUnit', 'Default unit')} htmlFor="workspace-unit">
                  <Select
                    id="workspace-unit"
                    value={defaultUnit}
                    onChange={(event) => setDefaultUnit(event.target.value)}
                    className="w-full"
                    placeholder={t('settings.defaultUnitPlaceholder', 'เลือกได้')}
                  >
                    <option value="">{t('settings.defaultUnitPlaceholder', 'เลือกได้')}</option>
                    {unitOptions.map((unit) => (
                      <option key={unit.code} value={unit.code}>
                        {unit.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <Switch checked={borrowRequiresApproval} onChange={(checked) => setBorrowRequiresApproval(checked)} />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">
                      {t('settings.borrowRequiresApproval', 'Borrow requests require approval')}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {t('settings.borrowRequiresApprovalHelp', 'Turn this off to let users checkout immediately when policy allows.')}
                    </span>
                  </span>
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={saveWorkspaceSettings} disabled={updateSettings.isPending || settingsQuery.isLoading || lookupsQuery.isLoading}>
                    {updateSettings.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

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
