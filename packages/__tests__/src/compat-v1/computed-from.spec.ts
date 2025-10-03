import { computedFrom } from '@aurelia/compat-v1';
import { createFixture } from '@aurelia/testing';

describe('compat-v1/computed-from.spec.ts', function () {
  it('works with @computedFrom', async function () {
    const { assertText, component, stop } = createFixture(
      `<div>\${sum}</div>`,
      class App {
        public a = 1;
        public b = 2;

        @computedFrom('a', 'b')
        public get sum() {
          return this.a + this.b;
        }
      }
    );

    assertText('3');

    component.a = 2;
    await Promise.resolve();
    assertText('4');

    component.b = 3;
    await Promise.resolve();
    assertText('5');

    await stop();
    assertText('');

    component.a = 2;
    await Promise.resolve();
    assertText('');

  });
});
