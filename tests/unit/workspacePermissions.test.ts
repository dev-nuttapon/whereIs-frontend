import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWorkspaceRole } from '@/lib/workspace-role';

test('normalizes workspace roles from the API for permission checks', () => {
  assert.equal(normalizeWorkspaceRole('Owner'), 'owner');
  assert.equal(normalizeWorkspaceRole('OWNER'), 'owner');
  assert.equal(normalizeWorkspaceRole('admin'), 'admin');
});
