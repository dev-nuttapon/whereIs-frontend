import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

export interface ItemEditTriggerProps {
  onClick: () => void;
}

export function ItemEditTrigger({ onClick }: ItemEditTriggerProps) {
  const { t } = useI18n();

  return <Button variant="outline" onClick={onClick}>{t('items.detail.edit')}</Button>;
}
