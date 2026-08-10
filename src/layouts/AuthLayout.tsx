import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';
import { ThemeSelector } from '@/components/layout/ThemeSelector';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="app-background relative min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeSelector compact />
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center sm:min-h-[calc(100vh-5rem)]">
        <Card className="w-full shadow-[0_24px_65px_-44px_rgba(15,23,42,0.35)]" styles={{ body: { padding: 24 } }}>
          <div className="space-y-4">
            <div className="space-y-1.5 text-center">
              <div className="mb-3 flex justify-center" aria-label="WhereIs logo">
                <svg
                  className="h-12 w-12 text-teal-600"
                  viewBox="0 0 48 48"
                  fill="none"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    d="M24 42s13-12.1 13-23A13 13 0 1 0 11 19c0 10.9 13 23 13 23Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="24" cy="19" r="4" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <Typography.Title level={2} className="!mb-0 !mt-0 text-2xl sm:text-3xl">
                {t('app.name')}
              </Typography.Title>
              <Typography.Paragraph className="!mb-0 text-muted-foreground">
                {t('app.subtitle')}
              </Typography.Paragraph>
            </div>
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}
