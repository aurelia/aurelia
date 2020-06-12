import {
  LogLevel,
  Constructable,
  kebabCase,
} from '@aurelia/kernel';
import {
  assert,
  TestContext,
} from '@aurelia/testing';
import {
  RouterConfiguration,
  IRouter,
} from '@aurelia/router';
import {
  Aurelia,
  customElement,
} from '@aurelia/runtime';

import {
  TestRouterConfiguration,
} from './configuration';

function vp(count: number): string {
  return '<au-viewport></au-viewport>'.repeat(count);
}
function name(type: Constructable): string {
  return kebabCase(type.name);
}

function assertComponentsVisible(host: HTMLElement, components: Constructable[]): void {
  assert.strictEqual(host.textContent, components.map(name).join(''));
}

async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  level: LogLevel = LogLevel.trace,
) {
  const ctx = TestContext.createHTMLTestContext();
  const { container, scheduler } = ctx;

  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration);
  container.register(...deps);

  const component = container.get(Component);
  const router = container.get(IRouter);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  au.app({ component, host });

  await au.start().wait();

  assertComponentsVisible(host, [Component]);

  return {
    ctx,
    au,
    host,
    component,
    scheduler,
    container,
    router,
    async tearDown() {
      assert.isSchedulerEmpty();

      await au.stop().wait();

      assert.isSchedulerEmpty();
    }
  };
}

describe('router (smoke tests)', function () {
  describe('without any configuration, deps registered globally', function () {
    @customElement({ name: name(A01), template: `${name(A01)}${vp(0)}` })
    class A01 {}
    @customElement({ name: name(A02), template: `${name(A02)}${vp(0)}` })
    class A02 {}
    @customElement({ name: name(A03), template: `${name(A03)}${vp(0)}` })
    class A03 {}
    const A0 = [A01, A02, A03];

    @customElement({ name: name(A11), template: `${name(A11)}${vp(1)}` })
    class A11 {}
    @customElement({ name: name(A12), template: `${name(A12)}${vp(1)}` })
    class A12 {}
    @customElement({ name: name(A13), template: `${name(A13)}${vp(1)}` })
    class A13 {}
    const A1 = [A11, A12, A13];

    @customElement({ name: name(A21), template: `${name(A21)}${vp(2)}` })
    class A21 {}
    @customElement({ name: name(A22), template: `${name(A22)}${vp(2)}` })
    class A22 {}
    @customElement({ name: name(A23), template: `${name(A23)}${vp(2)}` })
    class A23 {}
    const A2 = [A21, A22, A23];

    const A = [...A0, ...A1, ...A2];

    it(`${name(A11)} can load ${name(A01)}`, async function () {
      const { router, host, tearDown } = await createFixture(A11, A);

      await router.load(name(A01));
      assertComponentsVisible(host, [A11, A01]);

      await tearDown();
    });

    it(`${name(A11)} can load ${name(A01)},${name(A02)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(A11, A);

      await router.load(name(A01));
      assertComponentsVisible(host, [A11, A01]);

      await router.load(name(A02));
      assertComponentsVisible(host, [A11, A02]);

      await tearDown();
    });

    it(`${name(A11)} can load ${name(A01)},${name(A02)},${name(A03)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(A11, A);

      await router.load(name(A01));
      assertComponentsVisible(host, [A11, A01]);

      await router.load(name(A02));
      assertComponentsVisible(host, [A11, A02]);

      await router.load(name(A03));
      assertComponentsVisible(host, [A11, A03]);

      await tearDown();
    });

    it(`${name(A11)} can load ${name(A11)}`, async function () {
      const { router, host, tearDown } = await createFixture(A11, A);

      await router.load(name(A11));
      assertComponentsVisible(host, [A11, A11]);

      await tearDown();
    });
  });
});
