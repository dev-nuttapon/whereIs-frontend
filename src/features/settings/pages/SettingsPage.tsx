import { useEffect, useState } from 'react';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { LanguageIcon, SettingsIcon, SunIcon } from '@/components/ui/icons';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { LocaleSelector } from '@/components/layout/LocaleSelector';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface AlertPreferences {
  lowStockThreshold: string;
  expiryLeadDays: string;
  dueLeadDays: string;
  lowStock: boolean;
  expiring: boolean;
  dueSoon: boolean;
  overdue: boolean;
}

const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  lowStockThreshold: '10',
  expiryLeadDays: '30',
  dueLeadDays: '3',
  lowStock: true,
  expiring: true,
  dueSoon: true,
  overdue: true,
};

export function SettingsPage() {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('whereis.alert-preferences');
      if (stored) setAlerts({ ...DEFAULT_ALERT_PREFERENCES, ...JSON.parse(stored) });
    } catch {
      // Keep defaults when local preferences are unavailable.
    }
  }, []);

  const updateAlert = <K extends keyof AlertPreferences>(key: K, value: AlertPreferences[K]) => {
    setSaved(false);
    setAlerts((current) => ({ ...current, [key]: value }));
  };

  const saveAlerts = () => {
    window.localStorage.setItem('whereis.alert-preferences', JSON.stringify(alerts));
    setSaved(true);
  };

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
      <Card className="shadow-sm">
        <CardContent className="component-stack p-5 sm:p-6">
          <div className="space-y-1.5">
            <CardTitle className="text-lg">{t('settings.alerts.title', 'การแจ้งเตือน Inventory')}</CardTitle>
            <CardDescription>{t('settings.alerts.description', 'กำหนดค่าเริ่มต้นสำหรับ stock ต่ำ ของใกล้หมดอายุ และรายการใกล้ครบกำหนด')}</CardDescription>
          </div>
          <div className="grid gap-[18px] md:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">{t('settings.alerts.lowStockThreshold', 'แจ้งเตือนเมื่อ stock ต่ำกว่า')}</span>
              <Input type="number" min="0" value={alerts.lowStockThreshold} onChange={(event) => updateAlert('lowStockThreshold', event.target.value)} />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">{t('settings.alerts.expiryLeadDays', 'แจ้งเตือนก่อนหมดอายุ (วัน)')}</span>
              <Input type="number" min="0" value={alerts.expiryLeadDays} onChange={(event) => updateAlert('expiryLeadDays', event.target.value)} />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">{t('settings.alerts.dueLeadDays', 'แจ้งเตือนก่อนครบกำหนด (วัน)')}</span>
              <Input type="number" min="0" value={alerts.dueLeadDays} onChange={(event) => updateAlert('dueLeadDays', event.target.value)} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {([
              ['lowStock', 'แจ้งเตือน stock ต่ำ'],
              ['expiring', 'แจ้งเตือนของใกล้หมดอายุ'],
              ['dueSoon', 'แจ้งเตือนใกล้ครบกำหนด'],
              ['overdue', 'แจ้งเตือนเกินกำหนด'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
                <span>{t(`settings.alerts.${key}`, label)}</span>
                <Switch checked={alerts[key]} onChange={(checked) => updateAlert(key, checked)} />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={saveAlerts}>{t('common.save', 'บันทึก')}</Button>
            {saved ? <span className="text-sm text-emerald-600">{t('settings.alerts.saved', 'บันทึกการตั้งค่าแล้ว')}</span> : null}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
