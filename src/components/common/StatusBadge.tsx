import type { ItemStatus } from '@/types/domain.types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { useI18n } from '@/hooks/useI18n';

export interface StatusBadgeProps {
  status: ItemStatus;
}

const statusMap: Record<ItemStatus, { label: string; className: string }> = {
  stored: { label: 'items.status.stored', className: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  taken_out: { label: 'items.status.taken_out', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  missing: { label: 'items.status.missing', className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  disposed: { label: 'items.status.disposed', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];
  const { t } = useI18n();
  return <Badge className={cn('border-transparent', item.className)}>{t(item.label)}</Badge>;
}
