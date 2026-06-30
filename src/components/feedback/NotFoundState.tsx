import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';

export function NotFoundState() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 py-10 text-center">
          <CardTitle>{t('notFound.title')}</CardTitle>
          <CardDescription>{t('notFound.description')}</CardDescription>
          <Button asChild>
            <Link to={ROUTES.workspaces}>{t('notFound.back')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
