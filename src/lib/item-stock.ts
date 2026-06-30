import type { Item } from '@/types/domain.types';

export type StockState = 'not_applicable' | 'in_stock' | 'low_stock' | 'out_of_stock';

export function getItemStockState(item: Item): StockState {
  if (item.usageType !== 'consumable' || item.kind !== 'bulk') {
    return 'not_applicable';
  }

  const quantity = item.quantity ?? 0;
  const reorderPoint = item.reorderPoint ?? 0;

  if (quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= reorderPoint) {
    return 'low_stock';
  }

  return 'in_stock';
}

export function getItemStockQuantity(item: Item) {
  return item.kind === 'bulk' && item.usageType === 'consumable' ? item.quantity ?? 0 : null;
}
