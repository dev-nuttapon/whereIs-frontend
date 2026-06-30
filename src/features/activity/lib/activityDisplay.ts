import type { ItemEvent } from '@/types/domain.types';
import type { Container, Item, Member } from '@/types/domain.types';

type TFn = (key: string, fallback?: string, params?: Record<string, string | number>) => string;

type ActivityContext = {
  events: ItemEvent[];
  items: Item[];
  containers: Container[];
  members: Member[];
  locale: 'en' | 'th';
  t: TFn;
};

export type ActivityTone = 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

export interface ActivityDisplay {
  itemName: string;
  eventLabel: string;
  summary: string;
  detail?: string;
  currentStateLabel?: string;
  currentLocationLabel?: string;
  currentReturnLabel?: string;
  tone: ActivityTone;
  glyph: string;
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : null;
}

function formatDate(locale: 'en' | 'th', value: Date) {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
  }).format(value);
}

function getCurrentReturnLabel(locale: 'en' | 'th', t: TFn, item: Item, issuedAt?: string) {
  if (item.usageType !== 'returnable') {
    return undefined;
  }

  if (item.returnPolicy === 'indefinite') {
    return t('activity.current.returnIndefinite');
  }

  const dueAt = new Date(issuedAt ?? item.updatedAt);
  dueAt.setDate(dueAt.getDate() + (item.returnDays ?? 7));

  return new Date() > dueAt
    ? t('activity.current.returnOverdue', undefined, { date: formatDate(locale, dueAt) })
    : t('activity.current.returnDueOn', undefined, { date: formatDate(locale, dueAt) });
}

function getEventLabel(t: TFn, type: ItemEvent['type']) {
  const labels: Record<ItemEvent['type'], string> = {
    created: t('dashboard.event.created'),
    updated: t('dashboard.event.updated'),
    moved: t('dashboard.event.moved'),
    taken_out: t('dashboard.event.takenOut'),
    returned: t('dashboard.event.returned'),
    stock_used: t('dashboard.event.stockUsed'),
    stock_restocked: t('dashboard.event.stockRestocked'),
    marked_missing: t('dashboard.event.markedMissing'),
    marked_found: t('dashboard.event.markedFound'),
    disposed: t('dashboard.event.disposed'),
  };

  return labels[type] ?? type;
}

function getTone(type: ItemEvent['type']): { tone: ActivityTone; glyph: string } {
  switch (type) {
    case 'created':
    case 'updated':
      return { tone: 'blue', glyph: '✦' };
    case 'moved':
      return { tone: 'slate', glyph: '↔' };
    case 'taken_out':
      return { tone: 'amber', glyph: '↗' };
    case 'returned':
      return { tone: 'emerald', glyph: '↩' };
    case 'stock_used':
      return { tone: 'rose', glyph: '−' };
    case 'stock_restocked':
      return { tone: 'emerald', glyph: '+' };
    case 'marked_missing':
      return { tone: 'rose', glyph: '!' };
    case 'marked_found':
      return { tone: 'emerald', glyph: '✓' };
    case 'disposed':
      return { tone: 'slate', glyph: '×' };
    default:
      return { tone: 'blue', glyph: '•' };
  }
}

export function buildActivityDisplay(event: ItemEvent, context: ActivityContext): ActivityDisplay {
  const item = context.items.find((entry) => entry.id === event.itemId);
  const containerMap = new Map(context.containers.map((entry) => [entry.id, entry]));
  const memberMap = new Map(context.members.map((entry) => [entry.id, entry]));
  const itemName = item?.name ?? event.itemId;
  const eventLabel = getEventLabel(context.t, event.type);
  const payload = event.payload ?? {};
  const note = getString(payload.note);
  const { tone, glyph } = getTone(event.type);
  const currentContainer = item?.containerId ? containerMap.get(item.containerId) : null;
  const currentHolder = item?.currentHolderId ? memberMap.get(item.currentHolderId) : null;
  const latestTakeOutEvent = context.events.find((entry) => entry.itemId === event.itemId && entry.type === 'taken_out');

  let summary = '';
  let detail: string | undefined;

  switch (event.type) {
    case 'created':
    case 'updated':
      summary = context.t('activity.summary.basic', undefined, { event: eventLabel, item: itemName });
      break;
    case 'moved': {
      const targetContainer = containerMap.get(getString(payload.toContainerId));
      summary = context.t('activity.summary.moved', undefined, {
        item: itemName,
        container: targetContainer?.code ?? targetContainer?.name ?? context.t('items.detail.noContainer'),
      });
      detail = note || undefined;
      break;
    }
    case 'taken_out': {
      const holder = memberMap.get(getString(payload.holderId));
      summary = context.t('activity.summary.takenOut', undefined, {
        item: itemName,
        holder: holder?.user.name ?? context.t('items.detail.noHolder'),
      });
      if (item?.usageType === 'returnable') {
        detail = note || undefined;
      } else {
        detail = note || undefined;
      }
      break;
    }
    case 'returned':
      summary = context.t('activity.summary.returned', undefined, { item: itemName });
      detail = note || undefined;
      break;
    case 'stock_used':
    case 'stock_restocked': {
      const quantity = getNumber(payload.quantity) ?? 0;
      const quantityAfter = getNumber(payload.quantityAfter);
      summary = context.t(
        event.type === 'stock_used' ? 'activity.summary.stockUsed' : 'activity.summary.stockRestocked',
        undefined,
        {
          item: itemName,
          quantity,
          quantityAfter: quantityAfter ?? 0,
        },
      );
      detail = note || undefined;
      break;
    }
    case 'marked_missing':
      summary = context.t('activity.summary.markedMissing', undefined, { item: itemName });
      detail = note || undefined;
      break;
    case 'marked_found': {
      const targetContainer = containerMap.get(getString(payload.containerId));
      summary = context.t('activity.summary.markedFound', undefined, {
        item: itemName,
        container: targetContainer?.code ?? targetContainer?.name ?? context.t('items.detail.noContainer'),
      });
      break;
    }
    case 'disposed':
      summary = context.t('activity.summary.disposed', undefined, { item: itemName });
      detail = note || undefined;
      break;
    default:
      summary = context.t('activity.summary.basic', undefined, { event: eventLabel, item: itemName });
  }

  return {
    itemName,
    eventLabel,
    summary,
    detail,
    currentStateLabel: item ? context.t(`items.status.${item.status}`) : undefined,
    currentLocationLabel:
      item?.status === 'taken_out'
        ? currentHolder
          ? context.t('activity.current.withHolder', undefined, { holder: currentHolder.user.name })
          : context.t('activity.current.locationUnknown')
        : item?.status === 'stored'
          ? currentContainer
            ? context.t('activity.current.inContainer', undefined, {
                container: currentContainer.code ?? currentContainer.name ?? context.t('items.detail.noContainer'),
              })
            : context.t('activity.current.locationUnknown')
          : item?.status === 'missing'
            ? context.t('activity.current.locationUnknown')
            : undefined,
    currentReturnLabel: item?.status === 'taken_out' ? getCurrentReturnLabel(context.locale, context.t, item, latestTakeOutEvent?.createdAt) : undefined,
    tone,
    glyph,
  };
}
