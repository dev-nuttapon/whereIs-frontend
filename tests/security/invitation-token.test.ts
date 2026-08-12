import assert from 'node:assert/strict';
import test from 'node:test';
import { isUsableInvitationToken } from '../../src/lib/invitation-token';

test('accepts ordinary encoded invitation token values', () => {
  assert.equal(isUsableInvitationToken('invite_01HZX7QK9K-abc.DEF~xyz'), true);
});

test('rejects missing, control-character, and oversized route values', () => {
  assert.equal(isUsableInvitationToken(undefined), false);
  assert.equal(isUsableInvitationToken(''), false);
  assert.equal(isUsableInvitationToken('abc\n123'), false);
  assert.equal(isUsableInvitationToken('x'.repeat(2049)), false);
});
