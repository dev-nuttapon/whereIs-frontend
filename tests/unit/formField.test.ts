import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatFieldLabel } from '../../src/components/forms/FormField';

test('formats required and optional field labels consistently', () => {
  assert.equal(formatFieldLabel('ชื่อสินค้า', 'required'), 'ชื่อสินค้า (จำเป็น)');
  assert.equal(formatFieldLabel('รายละเอียด', 'optional'), 'รายละเอียด (ไม่บังคับ)');
  assert.equal(formatFieldLabel('สถานะ', undefined), 'สถานะ');
});
