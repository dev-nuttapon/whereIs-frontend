import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
        <Card className="w-full shadow-[0_24px_65px_-44px_rgba(15,23,42,0.35)]" styles={{ body: { padding: 28 } }}>
          <div className="space-y-6 sm:space-y-7">
            <div className="space-y-3 text-center">
              <Typography.Title level={2} className="!mb-0 !mt-0">
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
