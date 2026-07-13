import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Item } from '@/types/domain.types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import {
  createDisposeSchema,
  createConsumeStockSchema,
  createMarkFoundSchema,
  createMoveItemSchema,
  createReturnSchema,
  createRestockStockSchema,
  createTakeOutSchema,
  type ConsumeStockActionValues,
  type MoveItemActionValues,
  type MarkFoundActionValues,
  type ReturnActionValues,
  type RestockStockActionValues,
  type TakeOutActionValues,
  type DisposeActionValues,
} from '@/features/items/validation/itemActionSchemas';
import {
  useConsumeStockMutation,
  useDisposeItemMutation,
  useMarkFoundItemMutation,
  useMarkMissingItemMutation,
  useMoveItem,
  useReturnItemMutation,
  useRestockStockMutation,
  useTakeOutItemMutation,
} from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_MEMBERS } from '@/mocks/mock-data';
import { authStore } from '@/stores/auth.store';

export interface ItemActionDialogsProps {
  wsId: string;
  item: Item;
  openAction: 'move' | 'takeout' | 'return' | 'missing' | 'found' | 'dispose' | 'consume' | 'restock' | null;
  onOpenActionChange: (action: ItemActionDialogsProps['openAction']) => void;
}

export function ItemActionDialogs({ wsId, item, openAction, onOpenActionChange }: ItemActionDialogsProps) {
  const { t } = useI18n();
  const currentUser = authStore((state) => state.user);
  const moveMutation = useMoveItem(wsId, item.id);
  const takeOutMutation = useTakeOutItemMutation(wsId, item.id);
  const returnMutation = useReturnItemMutation(wsId, item.id);
  const consumeStockMutation = useConsumeStockMutation(wsId, item.id);
  const restockStockMutation = useRestockStockMutation(wsId, item.id);
  const markMissingMutation = useMarkMissingItemMutation(wsId, item.id);
  const markFoundMutation = useMarkFoundItemMutation(wsId, item.id);
  const disposeMutation = useDisposeItemMutation(wsId, item.id);

  const moveItemSchema = createMoveItemSchema(t);
  const takeOutMaxQuantity = item.kind === 'stock' ? item.quantity ?? 1 : 1;
  const takeOutSchema = createTakeOutSchema(t, takeOutMaxQuantity);
  const returnSchema = createReturnSchema();
  const consumeStockSchema = createConsumeStockSchema(t, item.quantity ?? 0);
  const restockStockSchema = createRestockStockSchema(t);
  const markFoundSchema = createMarkFoundSchema(t);
  const disposeSchema = createDisposeSchema(t);

  const currentContainerId = item.containerId ?? MOCK_CONTAINERS[0]?.id ?? '';
  const currentHolderId = MOCK_MEMBERS.find((member) => member.user.id === currentUser?.id)?.id ?? '';
  const currentContainerLabel = MOCK_CONTAINERS.find((container) => container.id === currentContainerId)?.name ?? t('items.detail.noContainer');
  const currentHolderLabel = currentUser?.name ?? t('items.detail.noHolder');
  const canReturnItem = item.usageType === 'returnable';
  const isConsumableStockItem = item.kind === 'stock' && item.usageType === 'consumable';

  const moveForm = useForm<MoveItemActionValues>({
    resolver: zodResolver(moveItemSchema),
    defaultValues: { toContainerId: currentContainerId },
  });
  const takeOutForm = useForm<TakeOutActionValues>({
    resolver: zodResolver(takeOutSchema) as never,
    defaultValues: { holderId: currentHolderId, quantity: 1, note: '' },
  });
  const returnForm = useForm<ReturnActionValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: { note: '' },
  });
  const foundForm = useForm<MarkFoundActionValues>({
    resolver: zodResolver(markFoundSchema),
    defaultValues: { containerId: currentContainerId },
  });
  const disposeForm = useForm<DisposeActionValues>({
    resolver: zodResolver(disposeSchema),
    defaultValues: { confirm: false },
  });
  const consumeForm = useForm<ConsumeStockActionValues>({
    resolver: zodResolver(consumeStockSchema) as never,
    defaultValues: { quantity: 1, note: '' },
  });
  const restockForm = useForm<RestockStockActionValues>({
    resolver: zodResolver(restockStockSchema) as never,
    defaultValues: { quantity: 1, note: '' },
  });

  useEffect(() => {
    if (openAction === 'move') {
      moveForm.reset({ toContainerId: currentContainerId });
    }
    if (openAction === 'takeout') {
      takeOutForm.reset({ holderId: currentHolderId, quantity: 1, note: '' });
    }
    if (openAction === 'return') {
      returnForm.reset({ note: '' });
    }
    if (openAction === 'found') {
      foundForm.reset({ containerId: currentContainerId });
    }
    if (openAction === 'dispose') {
      disposeForm.reset({ confirm: false });
    }
    if (openAction === 'consume') {
      consumeForm.reset({ quantity: 1, note: '' });
    }
    if (openAction === 'restock') {
      restockForm.reset({ quantity: 1, note: '' });
    }
  }, [consumeForm, currentContainerId, currentHolderId, disposeForm, foundForm, moveForm, openAction, restockForm, returnForm, takeOutForm]);

  return (
    <>
      <Dialog open={openAction === 'move'} onOpenChange={(open) => onOpenActionChange(open ? 'move' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.action.moveTitle')}</DialogTitle>
            <DialogDescription>
              {t('items.action.moveDescription', undefined, { itemName: item.name })}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={moveForm.handleSubmit(async (values) => {
              await moveMutation.mutateAsync(values);
              onOpenActionChange(null);
            })}
          >
            <FormField
              label={t('items.action.targetContainer')}
              htmlFor="move-target"
              description={t('items.action.currentContainer', undefined, { container: currentContainerLabel })}
              error={moveForm.formState.errors.toContainerId?.message}
            >
              <Select id="move-target" {...moveForm.register('toContainerId')}>
                {MOCK_CONTAINERS.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormActions>
              <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                {t('items.form.cancel')}
              </Button>
              <Button type="submit" disabled={moveForm.formState.isSubmitting || moveMutation.isPending}>
                {moveForm.formState.isSubmitting || moveMutation.isPending ? t('items.action.moveSaving') : t('items.action.moveSubmit')}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openAction === 'takeout'} onOpenChange={(open) => onOpenActionChange(open ? 'takeout' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.action.takeOutTitle')}</DialogTitle>
            <DialogDescription>
              {t('items.action.takeOutDescription', undefined, { itemName: item.name })}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={takeOutForm.handleSubmit(async (values) => {
              await takeOutMutation.mutateAsync(values);
              onOpenActionChange(null);
            })}
          >
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('items.action.holder')}</p>
              <p className="mt-1 font-medium">{currentHolderLabel}</p>
              <p className="text-xs text-muted-foreground">{t('items.action.currentHolder', undefined, { holder: currentHolderLabel })}</p>
            </div>
            <input type="hidden" {...takeOutForm.register('holderId')} />
            {item.kind === 'stock' ? (
              <FormField
                label={t('items.action.takeOutQuantity')}
                htmlFor="takeout-quantity"
                description={t('items.action.takeOutAvailable', undefined, { quantity: item.quantity ?? 1 })}
                error={takeOutForm.formState.errors.quantity?.message}
              >
                <Input id="takeout-quantity" type="number" min={1} max={takeOutMaxQuantity} {...takeOutForm.register('quantity')} />
              </FormField>
            ) : null}
            <FormField label={t('items.action.note')} htmlFor="takeout-note" error={takeOutForm.formState.errors.note?.message}>
              <Textarea id="takeout-note" rows={3} {...takeOutForm.register('note')} />
            </FormField>
            <FormActions>
              <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                {t('items.form.cancel')}
              </Button>
              <Button type="submit" disabled={takeOutForm.formState.isSubmitting || takeOutMutation.isPending}>
                {takeOutForm.formState.isSubmitting || takeOutMutation.isPending ? t('items.action.takeOutSaving') : t('items.action.takeOutSubmit')}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>

      {canReturnItem ? (
        <Dialog open={openAction === 'return'} onOpenChange={(open) => onOpenActionChange(open ? 'return' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.action.returnTitle')}</DialogTitle>
            <DialogDescription>
              {t('items.action.returnDescription', undefined, { itemName: item.name })}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={returnForm.handleSubmit(async (values) => {
              await returnMutation.mutateAsync(values);
              onOpenActionChange(null);
            })}
          >
            <FormField label={t('items.action.note')} htmlFor="return-note" error={returnForm.formState.errors.note?.message}>
              <Textarea id="return-note" rows={3} {...returnForm.register('note')} />
            </FormField>
            <FormActions>
              <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                {t('items.form.cancel')}
              </Button>
              <Button type="submit" disabled={returnForm.formState.isSubmitting || returnMutation.isPending}>
                {returnForm.formState.isSubmitting || returnMutation.isPending ? t('items.action.returnSaving') : t('items.action.returnSubmit')}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
        </Dialog>
      ) : null}

      {isConsumableStockItem ? (
        <>
          <Dialog open={openAction === 'consume'} onOpenChange={(open) => onOpenActionChange(open ? 'consume' : null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('items.stock.consumeTitle')}</DialogTitle>
                <DialogDescription>{t('items.stock.consumeDescription', undefined, { itemName: item.name })}</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={consumeForm.handleSubmit(async (values) => {
                  await consumeStockMutation.mutateAsync({
                    quantity: values.quantity,
                    note: values.note,
                  });
                  onOpenActionChange(null);
                })}
              >
                <FormField
                  label={t('items.stock.consumeQuantity')}
                  htmlFor="consume-quantity"
                  description={t('items.stock.consumeAvailable', undefined, { quantity: item.quantity ?? 0 })}
                  error={consumeForm.formState.errors.quantity?.message}
                >
                  <Input id="consume-quantity" type="number" min={1} max={item.quantity ?? 0} {...consumeForm.register('quantity')} />
                </FormField>
                <FormField label={t('items.action.note')} htmlFor="consume-note" error={consumeForm.formState.errors.note?.message}>
                  <Textarea id="consume-note" rows={3} {...consumeForm.register('note')} />
                </FormField>
                <FormActions>
                  <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                    {t('items.form.cancel')}
                  </Button>
                  <Button type="submit" disabled={consumeForm.formState.isSubmitting || consumeStockMutation.isPending}>
                    {consumeForm.formState.isSubmitting || consumeStockMutation.isPending ? t('items.stock.consumeSaving') : t('items.stock.consumeSubmit')}
                  </Button>
                </FormActions>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={openAction === 'restock'} onOpenChange={(open) => onOpenActionChange(open ? 'restock' : null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('items.stock.restockTitle')}</DialogTitle>
                <DialogDescription>{t('items.stock.restockDescription', undefined, { itemName: item.name })}</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={restockForm.handleSubmit(async (values) => {
                  await restockStockMutation.mutateAsync({
                    quantity: values.quantity,
                    note: values.note,
                  });
                  onOpenActionChange(null);
                })}
              >
                <FormField
                  label={t('items.stock.restockQuantity')}
                  htmlFor="restock-quantity"
                  error={restockForm.formState.errors.quantity?.message}
                >
                  <Input id="restock-quantity" type="number" min={1} {...restockForm.register('quantity')} />
                </FormField>
                <FormField label={t('items.action.note')} htmlFor="restock-note" error={restockForm.formState.errors.note?.message}>
                  <Textarea id="restock-note" rows={3} {...restockForm.register('note')} />
                </FormField>
                <FormActions>
                  <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                    {t('items.form.cancel')}
                  </Button>
                  <Button type="submit" disabled={restockForm.formState.isSubmitting || restockStockMutation.isPending}>
                    {restockForm.formState.isSubmitting || restockStockMutation.isPending ? t('items.stock.restockSaving') : t('items.stock.restockSubmit')}
                  </Button>
                </FormActions>
              </form>
            </DialogContent>
          </Dialog>
        </>
      ) : null}

      <Dialog open={openAction === 'missing'} onOpenChange={(open) => onOpenActionChange(open ? 'missing' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.action.markMissingTitle')}</DialogTitle>
            <DialogDescription>{t('items.action.markMissingDescription', undefined, { itemName: item.name })}</DialogDescription>
          </DialogHeader>
          <FormActions>
            <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
              {t('items.form.cancel')}
            </Button>
            <Button
              type="button"
              disabled={markMissingMutation.isPending}
              onClick={async () => {
                await markMissingMutation.mutateAsync(undefined);
                onOpenActionChange(null);
              }}
            >
              {markMissingMutation.isPending ? t('items.action.markMissingSaving') : t('items.action.markMissingSubmit')}
            </Button>
          </FormActions>
        </DialogContent>
      </Dialog>

      <Dialog open={openAction === 'found'} onOpenChange={(open) => onOpenActionChange(open ? 'found' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.action.markFoundTitle')}</DialogTitle>
            <DialogDescription>
              {t('items.action.markFoundDescription', undefined, { itemName: item.name })}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={foundForm.handleSubmit(async (values) => {
              await markFoundMutation.mutateAsync(values);
              onOpenActionChange(null);
            })}
          >
            <FormField
              label={t('items.action.container')}
              htmlFor="found-container"
              description={t('items.action.suggestedContainer', undefined, { container: currentContainerLabel })}
              error={foundForm.formState.errors.containerId?.message}
            >
              <Select id="found-container" {...foundForm.register('containerId')}>
                {MOCK_CONTAINERS.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormActions>
              <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                {t('items.form.cancel')}
              </Button>
              <Button type="submit" disabled={foundForm.formState.isSubmitting || markFoundMutation.isPending}>
                {foundForm.formState.isSubmitting || markFoundMutation.isPending ? t('items.action.markFoundSaving') : t('items.action.markFoundSubmit')}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openAction === 'dispose'} onOpenChange={(open) => onOpenActionChange(open ? 'dispose' : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('items.action.disposeTitle')}</DialogTitle>
            <DialogDescription>
              {t('items.action.disposeDescription', undefined, { itemName: item.name })}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={disposeForm.handleSubmit(async () => {
              await disposeMutation.mutateAsync({ reason: 'Disposed from item detail' });
              onOpenActionChange(null);
            })}
          >
            <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <Checkbox {...disposeForm.register('confirm')} />
              {t('items.action.confirmPermanent')}
            </label>
            {disposeForm.formState.errors.confirm ? (
              <p className="text-sm text-destructive">{disposeForm.formState.errors.confirm.message}</p>
            ) : null}
            <FormActions>
              <Button type="button" variant="outline" onClick={() => onOpenActionChange(null)}>
                {t('items.form.cancel')}
              </Button>
              <Button type="submit" variant="destructive" disabled={disposeForm.formState.isSubmitting || disposeMutation.isPending}>
                {disposeForm.formState.isSubmitting || disposeMutation.isPending ? t('items.action.disposeSaving') : t('items.action.disposeSubmit')}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
