import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center sm:min-h-[calc(100vh-5rem)]">
        <Card className="w-full shadow-[0_24px_65px_-44px_rgba(15,23,42,0.35)]" styles={{ body: { padding: 24 } }}>
          <div className="space-y-4">
            <div className="space-y-1.5 text-center">
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
