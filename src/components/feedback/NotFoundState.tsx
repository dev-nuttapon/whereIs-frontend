import { Link } from 'react-router-dom';
import { Result } from 'antd';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';

export function NotFoundState() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Result
        status="404"
        title={t('notFound.title')}
        subTitle={t('notFound.description')}
        extra={
          <Button asChild>
            <Link to={ROUTES.workspaces}>{t('notFound.back')}</Link>
          </Button>
        }
      />
    </div>
  );
}
