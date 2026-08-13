import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductFormData } from '../../src/features/products/utils/productFormData';

test('buildProductFormData sends product fields and an optional image file', () => {
  const file = new File(['image'], 'product.png', { type: 'image/png' });
  const data = buildProductFormData({ name: 'Notebook', trackingType: 'Asset', image: file });

  assert.equal(data.get('name'), 'Notebook');
  assert.equal(data.get('trackingType'), 'Asset');
  assert.equal((data.get('image') as File).name, 'product.png');
});

test('buildProductFormData omits empty optional fields instead of sending empty strings', () => {
  const data = buildProductFormData({
    name: 'Notebook',
    trackingType: 'Asset',
    description: null,
    categoryId: null,
    unitCode: null,
    code: null,
    sku: null,
    minStockAlert: null,
    expiryLeadDaysDefault: null,
  });

  for (const field of ['description', 'categoryId', 'unitCode', 'code', 'sku', 'minStockAlert', 'expiryLeadDaysDefault']) {
    assert.equal(data.has(field), false, `${field} should be omitted when it is not provided`);
  }
});
