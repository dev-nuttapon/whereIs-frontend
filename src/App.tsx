import { BrowserRouter } from 'react-router-dom';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import enUS from 'antd/locale/en_US';
import thTH from 'antd/locale/th_TH';
import { useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/routes';
import { queryClient } from '@/lib/queryClient';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useLocaleSync } from '@/hooks/useLocaleSync';
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap';
import { NotificationStack } from '@/components/feedback/NotificationStack';
import { uiStore } from '@/stores/ui.store';

export function App() {
  useThemeSync();
  useLocaleSync();
  const theme = uiStore((state) => state.theme);
  const locale = uiStore((state) => state.locale);
  const resolvedTheme = theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  const antdLocale = locale === 'th' ? thTH : enUS;
  const antdConfig = useMemo(
    () => ({
      algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        fontFamily: '"Noto Sans Thai", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        borderRadius: 10,
        colorPrimary: '#2563eb',
      },
      components: {
        Layout: {
          bodyBg: resolvedTheme === 'dark' ? '#090b14' : '#f5f7fb',
          headerBg: resolvedTheme === 'dark' ? '#0b1220' : '#ffffff',
          siderBg: resolvedTheme === 'dark' ? '#090b14' : '#ffffff',
        },
        Card: {
          borderRadiusLG: 16,
        },
        Button: {
          borderRadius: 999,
        },
      },
      getPopupContainer: (node: HTMLElement | null | undefined) => node?.parentNode ?? document.body,
    }),
    [resolvedTheme],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={antdLocale} theme={antdConfig}>
        <AntdApp>
          <BrowserRouter>
            <AuthBootstrap />
            <AppRoutes />
            <NotificationStack />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
