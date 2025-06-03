import { createFixture } from '@aurelia/testing';
import { runTasks } from '@aurelia/runtime';

describe('3-runtime-html/collection-observer.spec.ts', function () {
  describe('map', function () {
    it('observes map.size', function () {
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
    it('observes set.size', function () {
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
