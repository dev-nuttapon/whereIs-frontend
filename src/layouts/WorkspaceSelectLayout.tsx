import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export interface WorkspaceSelectLayoutProps {
  children?: ReactNode;
}

export function WorkspaceSelectLayout({ children }: WorkspaceSelectLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
        <Card>
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-sm font-medium">{t('app.name')}</p>
              <p className="text-sm text-muted-foreground">{t('app.selectWorkspace')}</p>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t('app.workspaceSelect')}</p>
          </CardContent>
        </Card>
        {children}
      </div>
    </div>
  );
}
