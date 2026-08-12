import assert from 'node:assert/strict';
import test from 'node:test';
import { formatErrorLog, getUserFacingErrorMessage } from '../../src/lib/error-log';

test('keeps production error logs generic', () => {
  assert.deepEqual(formatErrorLog(new Error('secret bearer token'), 'production'), {
    message: 'Application error',
  });
});

test('keeps useful details only in development', () => {
  assert.deepEqual(formatErrorLog(new Error('render failed'), 'development'), {
    message: 'render failed',
  });
});

test('does not expose raw API errors in user notifications', () => {
  assert.equal(getUserFacingErrorMessage(new Error('database connection string')), 'การทำงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
});
