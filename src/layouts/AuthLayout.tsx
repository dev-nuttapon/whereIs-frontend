import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-sm items-center">
        <Card className="w-full">
          <CardContent className="space-y-5 p-5 sm:space-y-6 sm:p-6">
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl">{t('app.name')}</CardTitle>
              <CardDescription>{t('app.subtitle')}</CardDescription>
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
