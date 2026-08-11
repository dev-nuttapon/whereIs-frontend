import assert from 'node:assert/strict';
import test from 'node:test';
import { isSessionExpired } from '../../src/lib/session';

const now = Date.parse('2026-08-11T12:00:00.000Z');

test('detects expired and current sessions', () => {
  assert.equal(isSessionExpired('2026-08-11T11:59:59.000Z', now), true);
  assert.equal(isSessionExpired('2026-08-11T12:00:01.000Z', now), false);
  assert.equal(isSessionExpired(null, now), false);
});

test('treats malformed expiry as non-expired so the API remains the source of truth', () => {
  assert.equal(isSessionExpired('not-a-date', now), false);
});
