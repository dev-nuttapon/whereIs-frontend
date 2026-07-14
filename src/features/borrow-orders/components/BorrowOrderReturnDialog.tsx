import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { useReturnBorrowOrder } from '@/features/borrow-orders/hooks/useBorrowOrders';
import type { BorrowOrder, BorrowOrderLine } from '@/types/domain.types';

function formatLineLabel(line: BorrowOrderLine) {
  if (line.assetId) {
    return `${line.assetSerialNumber ?? line.assetId}`;
  }
  return `${line.productName ?? line.productId ?? line.stockEntryId ?? '-'}${line.quantity ? ` x ${line.quantity}` : ''}`;
}

interface BorrowOrderReturnDialogProps {
  order: BorrowOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BorrowOrderReturnDialog({ order, open, onOpenChange }: BorrowOrderReturnDialogProps) {
  const { t } = useI18n();
  const orderId = order?.id ?? '';
  const mutation = useReturnBorrowOrder(order?.workspaceId ?? '', orderId);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const lines = useMemo(() => order?.lines ?? [], [order?.lines]);

  const resetAndClose = () => {
    setQuantities({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>{t('borrowOrders.returnTitle', 'Return items')}</DialogTitle>
          <DialogDescription>{t('borrowOrders.returnDescription', 'Record quantities that are being returned for this borrow order.')}</DialogDescription>
        </DialogHeader>

        <div className="component-stack px-5 pb-5 sm:px-6">
          {lines.map((line) => {
            const remaining = Math.max(0, (line.quantity ?? 1) - (line.returnedQuantity ?? 0));
            return (
              <div key={line.id} className="space-y-2 rounded-2xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{formatLineLabel(line)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('borrowOrders.remaining', 'Remaining')}: {remaining}
                    </p>
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={remaining}
                  value={quantities[line.id] ?? String(remaining)}
                  onChange={(event) => setQuantities((current) => ({ ...current, [line.id]: event.target.value }))}
                />
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={resetAndClose}>
            {t('common.cancel', 'ยกเลิก')}
          </Button>
          <Button
            onClick={async () => {
              if (!order) return;
              await mutation.mutateAsync({
                lines: order.lines
                  .map((line) => ({
                    lineId: line.id,
                    returnedQuantity: Number(quantities[line.id] ?? (line.quantity ?? 1)),
                    condition: null,
                  }))
                  .filter((line) => line.returnedQuantity > 0),
              });
              resetAndClose();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('common.saving', 'กำลังบันทึก...') : t('borrowOrders.confirmReturn', 'บันทึกการคืน')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
