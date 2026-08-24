import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
/* eslint-disable import/extensions -- Node ESM requires the extension; browser pages serve this module directly. */
import {
  createMixedRealisticRecords,
  createRealisticRecords,
  createRefreshedRealisticRecords,
} from './utils/realistic-data.js';
/* eslint-enable import/extensions */

void describe('realistic Repeat benchmark data', () => {
  void it('refreshes every record object while preserving ordered keys', () => {
    const initial = createRealisticRecords(1000);
    const refreshed = createRefreshedRealisticRecords(initial);

    assert.deepEqual(refreshed.map(record => record.id), initial.map(record => record.id));
    assert.equal(refreshed.every((record, index) => record !== initial[index]), true);
    assert.equal(refreshed.every(record => record.revision === 1), true);
  });

  void it('builds deterministic mixed blocks with exact reuse categories', () => {
    const initial = createRealisticRecords(1000);
    const mixed = createMixedRealisticRecords(initial);
    const initialById = new Map(initial.map(record => [record.id, record]));
    const mixedById = new Map(mixed.map(record => [record.id, record]));

    assert.equal(mixed.length, 1000);
    assert.equal(mixedById.size, 1000);
    assert.deepEqual(mixed.slice(0, 10).map(record => record.id), [2, 3, 4, 5, 6, 7, 8, 9, 1, 1000]);
    assert.equal([...initialById.keys()].filter(id => !mixedById.has(id)).length, 100);
    assert.equal([...mixedById.keys()].filter(id => !initialById.has(id)).length, 100);
    assert.equal([...mixedById].filter(([id, record]) => initialById.has(id) && record !== initialById.get(id)).length, 100);
    assert.equal([...mixedById].filter(([id, record]) => initialById.has(id) && record === initialById.get(id)).length, 800);
  });
});
