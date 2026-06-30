import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useI18n } from '@/hooks/useI18n';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useI18n();

  return (
    <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/10">
      <AlertTitle className="text-base">{t('error.title')}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <span className="text-sm leading-6">{message}</span>
        {onRetry ? (
          <div>
            <Button variant="outline" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
