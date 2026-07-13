import type { ItemStatus } from '@/types/domain.types';
import { Tag } from 'antd';
import { useI18n } from '@/hooks/useI18n';

export interface StatusBadgeProps {
  status: ItemStatus;
}

const statusMap: Record<ItemStatus, { label: string; className: string }> = {
  stored: { label: 'items.status.stored', className: 'green' },
  taken_out: { label: 'items.status.taken_out', className: 'gold' },
  reserved: { label: 'items.status.reserved', className: 'blue' },
  missing: { label: 'items.status.missing', className: 'red' },
  repair: { label: 'items.status.repair', className: 'orange' },
  disposed: { label: 'items.status.disposed', className: 'default' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];
  const { t } = useI18n();
  return <Tag color={item.className === 'default' ? undefined : item.className}>{t(item.label)}</Tag>;
}
