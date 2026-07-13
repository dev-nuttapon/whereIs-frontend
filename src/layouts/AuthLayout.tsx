import type { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { useI18n } from '@/hooks/useI18n';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <Card className="w-full shadow-[0_24px_65px_-44px_rgba(15,23,42,0.35)]" styles={{ body: { padding: 28 } }}>
          <div className="space-y-3">
            <div className="space-y-1.5 text-center">
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
