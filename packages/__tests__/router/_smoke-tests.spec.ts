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

type C = Constructable;
type CSpec = (C | CSpec)[];
function getText(spec: CSpec): string {
  return spec.map(function (x) {
    if (x instanceof Array) {
      return getText(x);
    }
    return name(x);
  }).join('');
}
function assertComponentsVisible(host: HTMLElement, spec: CSpec): void {
  assert.strictEqual(host.textContent, getText(spec));
}

async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  level: LogLevel = LogLevel.warn,
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
    const A0 = [A01, A02];

    @customElement({ name: name(Root1), template: `${name(Root1)}${vp(1)}` })
    class Root1 {}
    @customElement({ name: name(A11), template: `${name(A11)}${vp(1)}` })
    class A11 {}
    @customElement({ name: name(A12), template: `${name(A12)}${vp(1)}` })
    class A12 {}
    const A1 = [A11, A12];

    @customElement({ name: name(Root2), template: `${name(Root2)}${vp(2)}` })
    class Root2 {}
    @customElement({ name: name(A21), template: `${name(A21)}${vp(2)}` })
    class A21 {}
    @customElement({ name: name(A22), template: `${name(A22)}${vp(2)}` })
    class A22 {}
    const A2 = [A21, A22];

    const A = [...A0, ...A1, ...A2];

    // Start with a broad sample of non-generated tests that are easy to debug and mess around with.
    it(`${name(Root1)} can load ${name(A01)}`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, A);

      await router.load(name(A01));
      assertComponentsVisible(host, [Root1, A01]);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A01)},${name(A02)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, A);

      await router.load(name(A01));
      assertComponentsVisible(host, [Root1, A01]);

      await router.load(name(A02));
      assertComponentsVisible(host, [Root1, A02]);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)}/${name(A01)}`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, A);

      await router.load(`${name(A11)}/${name(A01)}`);
      assertComponentsVisible(host, [Root1, A11, A01]);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)}/${name(A01)},${name(A11)}/${name(A02)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, A);

      await router.load(`${name(A11)}/${name(A01)}`);
      assertComponentsVisible(host, [Root1, A11, A01]);

      await router.load(`${name(A11)}/${name(A02)}`);
      assertComponentsVisible(host, [Root1, A11, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}+${name(A02)}`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, A);

      await router.load(`${name(A01)}+${name(A02)}`);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}+${name(A02)},${name(A02)}+${name(A01)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, A);

      await router.load(`${name(A01)}+${name(A02)}`);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await router.load(`${name(A02)}+${name(A01)}`);
      assertComponentsVisible(host, [Root2, A02, A01]);

      await tearDown();
    });

    // Now generate stuff
    const $1vp: Record<string, CSpec> = {
      // [x]
      [`${name(A01)}`]: [A01],
      [`${name(A02)}`]: [A02],
      // [x/x]
      [`${name(A11)}/${name(A01)}`]: [A11, [A01]],
      [`${name(A11)}/${name(A02)}`]: [A11, [A02]],
      [`${name(A12)}/${name(A01)}`]: [A12, [A01]],
      [`${name(A12)}/${name(A02)}`]: [A12, [A02]],
      // [x/x/x]
      [`${name(A11)}/${name(A12)}/${name(A01)}`]: [A11, [A12, [A01]]],
      [`${name(A11)}/${name(A12)}/${name(A02)}`]: [A11, [A12, [A02]]],
      [`${name(A12)}/${name(A11)}/${name(A01)}`]: [A12, [A11, [A01]]],
      [`${name(A12)}/${name(A11)}/${name(A02)}`]: [A12, [A11, [A02]]],
    };

    const $2vps: Record<string, CSpec> = {
      // [x+x]
      [`${name(A01)}+${name(A02)}`]: [[A01], [A02]],
      [`${name(A02)}+${name(A01)}`]: [[A02], [A01]],
      // [x/x+x]
      [`${name(A11)}/${name(A01)}+${name(A02)}`]: [[A11, [A01]], [A02]],
      [`${name(A11)}/${name(A02)}+${name(A01)}`]: [[A11, [A02]], [A01]],
      [`${name(A12)}/${name(A01)}+${name(A02)}`]: [[A12, [A01]], [A02]],
      [`${name(A12)}/${name(A02)}+${name(A01)}`]: [[A12, [A02]], [A01]],
      // [x+x/x]
      [`${name(A01)}+${name(A11)}/${name(A02)}`]: [[A01], [A11, [A02]]],
      [`${name(A02)}+${name(A11)}/${name(A01)}`]: [[A02], [A11, [A01]]],
      [`${name(A01)}+${name(A12)}/${name(A02)}`]: [[A01], [A12, [A02]]],
      [`${name(A02)}+${name(A12)}/${name(A01)}`]: [[A02], [A12, [A01]]],
      // [x/x+x/x]
      [`${name(A11)}/${name(A01)}+${name(A12)}/${name(A02)}`]: [[A11, [A01]], [A12, [A02]]],
      [`${name(A11)}/${name(A02)}+${name(A12)}/${name(A01)}`]: [[A11, [A02]], [A12, [A01]]],
      [`${name(A12)}/${name(A01)}+${name(A11)}/${name(A02)}`]: [[A12, [A01]], [A11, [A02]]],
      [`${name(A12)}/${name(A02)}+${name(A11)}/${name(A01)}`]: [[A12, [A02]], [A11, [A01]]],
    };

    const $1vpKeys = Object.keys($1vp);
    for (let i = 0, ii = $1vpKeys.length; i < ii; ++i) {
      const key11 = $1vpKeys[i];
      const value11 = $1vp[key11];

      it(`${name(Root1)} can load ${key11}`, async function () {
        const { router, host, tearDown } = await createFixture(Root1, A);

        await router.load(key11);
        assertComponentsVisible(host, [Root1, value11]);

        await tearDown();
      });

      if (i >= 1) {
        const key11prev = $1vpKeys[i - 1];
        const value11prev = $1vp[key11prev];

        it(`${name(Root1)} can load ${key11prev},${key11} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root1, A);

          await router.load(key11prev);
          assertComponentsVisible(host, [Root1, value11prev]);

          await router.load(key11);
          assertComponentsVisible(host, [Root1, value11]);

          await tearDown();
        });

        it(`${name(Root1)} can load ${key11},${key11prev} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root1, A);

          await router.load(key11);
          assertComponentsVisible(host, [Root1, value11]);

          await router.load(key11prev);
          assertComponentsVisible(host, [Root1, value11prev]);

          await tearDown();
        });
      }
    }

    const $2vpsKeys = Object.keys($2vps);
    for (let i = 0, ii = $2vpsKeys.length; i < ii; ++i) {
      const key21 = $2vpsKeys[i];
      const value21 = $2vps[key21];

      it(`${name(Root2)} can load ${key21}`, async function () {
        const { router, host, tearDown } = await createFixture(Root2, A);

        await router.load(key21);
        assertComponentsVisible(host, [Root2, value21]);

        await tearDown();
      });

      if (i >= 1) {
        const key21prev = $2vpsKeys[i - 1];
        const value21prev = $2vps[key21prev];

        it(`${name(Root2)} can load ${key21prev},${key21} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root2, A);

          await router.load(key21prev);
          assertComponentsVisible(host, [Root2, value21prev]);

          await router.load(key21);
          assertComponentsVisible(host, [Root2, value21]);

          await tearDown();
        });

        it(`${name(Root2)} can load ${key21},${key21prev} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root2, A);

          await router.load(key21);
          assertComponentsVisible(host, [Root2, value21]);

          await router.load(key21prev);
          assertComponentsVisible(host, [Root2, value21prev]);

          await tearDown();
        });
      }
    }
  });
});
