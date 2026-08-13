import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductFormData } from '@/api/product.api';

test('buildProductFormData sends product fields and an optional image file', () => {
  const file = new File(['image'], 'product.png', { type: 'image/png' });
  const data = buildProductFormData({ name: 'Notebook', trackingType: 'Asset', image: file });

  assert.equal(data.get('name'), 'Notebook');
  assert.equal(data.get('trackingType'), 'Asset');
  assert.equal((data.get('image') as File).name, 'product.png');
});
