import type { ReceivingFormLine } from './receivingForm';

const DEFAULT_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function isDraftLine(value: unknown): value is ReceivingFormLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  return Number.isInteger(line.id)
    && typeof line.productId === 'string'
    && typeof line.productSearch === 'string'
    && typeof line.name === 'string'
    && typeof line.quantity === 'string'
    && typeof line.unit === 'string'
    && (line.trackingType === '' || line.trackingType === 'stock' || line.trackingType === 'asset')
    && typeof line.storage === 'string'
    && typeof line.expiryDate === 'string'
    && typeof line.alertLeadDays === 'string'
    && typeof line.lowStockAlert === 'string';
}

export function parseReceivingDraft(
  raw: string,
  now = new Date(),
  maxAgeMs = DEFAULT_DRAFT_MAX_AGE_MS,
): ReceivingFormLine[] | null {
  try {
    const parsed = JSON.parse(raw) as { lines?: unknown; savedAt?: unknown };
    if (!Array.isArray(parsed.lines) || parsed.lines.length === 0 || !parsed.lines.every(isDraftLine)) return null;
    if (typeof parsed.savedAt !== 'string') return null;

    const savedAt = new Date(parsed.savedAt).getTime();
    const currentTime = now.getTime();
    if (!Number.isFinite(savedAt) || savedAt > currentTime || currentTime - savedAt > maxAgeMs) return null;

    return parsed.lines;
  } catch {
    return null;
  }
}
