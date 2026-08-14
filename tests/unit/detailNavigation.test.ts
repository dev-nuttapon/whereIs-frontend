import assert from 'node:assert/strict';
import test from 'node:test';
import { detailTabIds } from '../../src/components/common/detailNavigation';

test('detail pages expose the same primary navigation sections', () => {
  assert.deepEqual(detailTabIds, ['overview', 'details', 'activity']);
});
