import assert from 'node:assert/strict';
import test from 'node:test';
import { parseReceivingDraft } from '../../src/features/receiving/utils/receivingDraft';

const validLine = {
  id: 1,
  productId: 'product-1',
  productSearch: 'สบู่',
  name: 'สบู่',
  quantity: '2',
  unit: 'ชิ้น',
  trackingType: 'stock' as const,
  storage: 'container-1',
  expiryDate: '',
  alertLeadDays: '',
  lowStockAlert: '',
};

test('accepts a recent draft with the expected receiving shape', () => {
  const raw = JSON.stringify({ lines: [validLine], savedAt: '2026-08-12T00:00:00.000Z' });
  assert.deepEqual(parseReceivingDraft(raw, new Date('2026-08-12T00:30:00.000Z')), [validLine]);
});

test('rejects expired, malformed, and empty drafts', () => {
  assert.equal(parseReceivingDraft('{"lines":[],"savedAt":"2026-08-12T00:00:00.000Z"}', new Date('2026-08-12T00:30:00.000Z')), null);
  assert.equal(parseReceivingDraft('{"lines":[{}],"savedAt":"2026-08-10T00:00:00.000Z"}', new Date('2026-08-12T00:00:00.000Z')), null);
  assert.equal(parseReceivingDraft('not-json', new Date('2026-08-12T00:00:00.000Z')), null);
});
