import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export function LocationExplorerPage() {
  const { siteId } = useParams();
  const { t } = useI18n();

  return (
    <PageShell title={t('location.explorer.title')} description={t('location.explorer.description')}>
      <Card>
        <CardContent className="space-y-2 p-6">
          <CardTitle className="text-base">
            {t('location.explorer.site')} {siteId}
          </CardTitle>
          <CardDescription>{t('location.explorer.note')}</CardDescription>
        </CardContent>
      </Card>
    </PageShell>
  );
}
