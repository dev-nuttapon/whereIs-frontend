import { Link } from 'react-router-dom';
import { Result } from 'antd';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';

export function ForbiddenState() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Result
        status="403"
        title={t('forbidden.title')}
        subTitle={t('forbidden.description')}
        extra={
          <Button asChild>
            <Link to={ROUTES.workspaces}>{t('notFound.back')}</Link>
          </Button>
        }
      />
    </div>
  );
}
