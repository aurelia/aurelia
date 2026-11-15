import { createFixture } from '@aurelia/testing';
import { batch, runTasks } from '@aurelia/runtime';

describe('3-runtime-html/collection-observer.spec.ts', function () {
  const reloadCases = [
    {
      name: 'array length', count: 'items.length', row: 'item of items',
      create() {
        const items = [1];
        return { items, clear: () => items.splice(0), add: (value: number) => items.push(value) };
      },
    },
    {
      name: 'map size', count: 'items.size', row: '[key, item] of items',
      create() {
        const items = new Map([[1, 1]]);
        return { items, clear: () => items.clear(), add: (value: number) => items.set(value, value) };
      },
    },
    {
      name: 'set size', count: 'items.size', row: 'item of items',
      create() {
        const items = new Set([1]);
        return { items, clear: () => items.clear(), add: (value: number) => items.add(value) };
      },
    },
  ];

  for (const { name, count, row, create } of reloadCases) {
    it(`keeps a guarded ${name} message and repeat in sync across batched reloads`, function () {
      const { items, clear, add } = create();
      const { component, assertText } = createFixture(
        `<b>\${!loading && ${count} === 0}</b><span repeat.for="${row}">\${item}</span>`,
        { items, loading: false },
      );
      assertText('false1');

      component.loading = true;
      runTasks();
      // The guard releases the count observer, but repeat keeps observing the
      // same collection. Reloading must work with both subscriber lifetimes.
      batch(() => {
        clear();
        component.loading = false;
      });
      runTasks();
      assertText('true');

      // Returning to the previous count exposed the stale cache.
      batch(() => add(2));
      runTasks();
      assertText('false2');

      // An inner flush followed by more outer edits must keep repeat and the
      // count binding coherent without replaying the earlier collection edits.
      batch(() => {
        batch(clear);
        add(3);
        add(4);
      });
      runTasks();
      assertText('false34');

      clear();
      runTasks();
      assertText('true');
      add(5);
      runTasks();
      assertText('false5');
    });
  }

  describe('map', function () {
    it('observes map.size', async function () {
      const { assertText, component } = createFixture('Size: ${map.size}', { map: new Map() });

      assertText('Size: 0');

      component.map.set('a', 1);
      runTasks();
      assertText('Size: 1');

      component.map.delete('a');
      runTasks();
      assertText('Size: 0');

      component.map.set('a', 1);
      runTasks();
      component.map.clear();
      runTasks();
      assertText('Size: 0');
    });
  });

  describe('set', function () {
    it('observes set.size', async function () {
      const { assertText, component } = createFixture('Size: ${set.size}', { set: new Set() });

      assertText('Size: 0');

      component.set.add('a');
      runTasks();
      assertText('Size: 1');

      component.set.delete('a');
      runTasks();
      assertText('Size: 0');

      component.set.add('a');
      runTasks();
      component.set.clear();
      runTasks();
      assertText('Size: 0');
    });

  });
});
