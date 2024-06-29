import { createFixture } from '@aurelia/testing';

describe('3-runtime-html/collection-observer.spec.ts', function () {
  describe('map', function () {
    it('observes map.size', function () {
      const { assertText, component, flush } = createFixture('Size: ${map.size}', { map: new Map() });

      assertText('Size: 0');

      component.map.set('a', 1);
      flush();
      assertText('Size: 1');

      component.map.delete('a');
      flush();
      assertText('Size: 0');

      component.map.set('a', 1);
      flush();
      component.map.clear();
      flush();
      assertText('Size: 0');
    });
  });

  describe('set', function () {
    it('observes set.size', function () {
      const { assertText, component, flush } = createFixture('Size: ${set.size}', { set: new Set() });

      assertText('Size: 0');

      component.set.add('a');
      flush();
      assertText('Size: 1');

      component.set.delete('a');
      flush();
      assertText('Size: 0');

      component.set.add('a');
      flush();
      component.set.clear();
      flush();
      assertText('Size: 0');
    });

  });
});
