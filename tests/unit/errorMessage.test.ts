import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeErrorMessage } from '../../src/lib/error-message';

test('returns a safe message for Error instances', () => {
  assert.equal(getSafeErrorMessage(new Error('โหลดข้อมูลไม่สำเร็จ')), 'โหลดข้อมูลไม่สำเร็จ');
});

test('does not expose arbitrary non-error values', () => {
  assert.equal(getSafeErrorMessage({ secret: 'token' }), 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
});
