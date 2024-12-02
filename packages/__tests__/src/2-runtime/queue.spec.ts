import { createFixture } from '@aurelia/testing';
import { nextTick } from '@aurelia/runtime';

describe('2-runtime/queue.spec.ts', function () {
  it('simple binding', async function () {
    const { component, assertText } = createFixture(
      '${a}',
      class { a = 0; }
    );

    assertText('0');

    component.a = 1;

    assertText('0');

    await nextTick();

    assertText('1');
  });
});
