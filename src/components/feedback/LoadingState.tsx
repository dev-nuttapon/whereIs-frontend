import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? t('common.loading');

  return (
    <div className="flex min-h-[30vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center sm:gap-4 sm:py-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{resolvedLabel}</p>
        </CardContent>
      </Card>
    </div>
  );
}
