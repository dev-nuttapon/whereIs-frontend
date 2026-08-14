import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDetailDate, inventoryKindLabel, statusLabel } from '../../src/components/common/detailPresentation';

test('uses consistent Thai labels for inventory kinds', () => {
  assert.equal(inventoryKindLabel('asset'), 'ทรัพย์สิน');
  assert.equal(inventoryKindLabel('stock'), 'สต็อก');
  assert.equal(inventoryKindLabel('unknown'), 'รายการ');
});

test('uses consistent Thai labels for common statuses', () => {
  assert.equal(statusLabel('available'), 'พร้อมใช้งาน');
  assert.equal(statusLabel('borrowed'), 'ถูกยืม');
  assert.equal(statusLabel('out_of_stock'), 'หมดสต็อก');
  assert.equal(statusLabel('anything_else'), 'anything_else');
});

test('formats missing dates as a stable placeholder', () => {
  assert.equal(formatDetailDate(undefined), '-');
  assert.match(formatDetailDate('2026-08-14T00:00:00.000Z'), /2026|14/);
});
