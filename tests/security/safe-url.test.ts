import assert from 'node:assert/strict';
import test from 'node:test';
import { safeAssetUrl } from '../../src/lib/safe-url';

Object.defineProperty(globalThis, 'window', {
  value: { location: { origin: 'https://app.example.com' } },
});

test('allows same-origin and HTTPS asset URLs', () => {
  assert.equal(safeAssetUrl('/images/item.png'), 'https://app.example.com/images/item.png');
  assert.equal(safeAssetUrl('https://cdn.example.com/item.png'), 'https://cdn.example.com/item.png');
});

test('rejects executable and insecure asset URLs', () => {
  assert.equal(safeAssetUrl('javascript:alert(1)'), undefined);
  assert.equal(safeAssetUrl('data:text/html,<script>alert(1)</script>'), undefined);
  assert.equal(safeAssetUrl('http://cdn.example.com/item.png'), undefined);
  assert.equal(safeAssetUrl(undefined), undefined);
});
