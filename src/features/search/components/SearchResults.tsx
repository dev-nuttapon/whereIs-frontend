import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ItemIcon, OpenIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import type { Item } from '@/types/domain.types';

interface SearchResultsProps {
  wsId: string;
  items: Item[];
  containerNameById: Map<string, string>;
}

export function SearchResults({ wsId, items, containerNameById }: SearchResultsProps) {
  const { t } = useI18n();

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('search.emptyTitle', 'No items found')}
        description={t('search.emptyDescription', 'Try a different keyword or clear the filters to refine the results.')}
        icon={<ItemIcon className="h-5 w-5" />}
      />
    );
  }

  return (
    <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>{item.code ?? item.id}</CardDescription>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>{t('search.kind', 'Item type')}: {item.kind === 'stock' ? t('items.kind.stock', 'Quantity Item') : t('items.kind.single', 'Individual Item')}</div>
              <div>{t('search.status', 'Status')}: {item.status}</div>
              <div>{t('search.container', 'Container')}: {item.containerId ? (containerNameById.get(item.containerId) ?? item.containerId) : '-'}</div>
              <div>{t('search.holder', 'Holder')}: {item.currentHolderId ?? '-'}</div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
              <Link to={ROUTES.workspaceItemDetail(wsId, item.id)}>
                <OpenIcon className="h-4 w-4" />
                {t('search.openDetail', 'Open detail')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
