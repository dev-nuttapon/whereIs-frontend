import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReceivingReceiptInput, getReceivingLineError } from '../../src/features/receiving/utils/receivingForm';

const validLine = {
  id: 1,
  productId: 'product-yogurt',
  productSearch: 'โยเกิร์ต',
  name: 'โยเกิร์ต',
  quantity: '4',
  unit: 'ถ้วย',
  trackingType: 'stock' as const,
  storage: 'container-fridge',
  expiryDate: '2026-08-20',
  alertLeadDays: '7',
  lowStockAlert: '2',
};

test('builds the backend receipt payload from receiving lines', () => {
  const payload = buildReceivingReceiptInput([validLine], new Date('2026-08-11T00:00:00.000Z'));

  assert.equal(payload.lines.length, 1);
  assert.deepEqual(payload.lines[0], {
    productId: 'product-yogurt',
    quantity: 4,
    unitCode: 'ถ้วย',
    locationId: null,
    containerId: 'container-fridge',
    lotCode: null,
    expiryDate: '2026-08-20T00:00:00.000Z',
    alertLeadDays: 7,
    lowStockThreshold: 2,
    serialNumber: null,
    barcode: null,
    notes: null,
  });
});

test('rejects a receiving line without a product or storage location', () => {
  assert.equal(getReceivingLineError({ ...validLine, productId: '' }), 'ต้องเลือกสินค้าที่มีอยู่ในระบบก่อนบันทึกเข้าคลัง');
  assert.equal(getReceivingLineError({ ...validLine, storage: '' }), 'เลือกจุดจัดเก็บ');
});

test('rejects fractional quantities for assets', () => {
  assert.equal(getReceivingLineError({ ...validLine, trackingType: 'asset', quantity: '1.5' }), 'ทรัพย์สินต้องมีจำนวนเป็นจำนวนเต็ม');
});
