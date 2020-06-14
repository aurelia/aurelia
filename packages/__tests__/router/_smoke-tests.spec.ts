/* eslint-disable @typescript-eslint/camelcase */
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
  level: LogLevel = LogLevel.info,
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

    @customElement({ name: name(A11), template: `${name(A11)}${vp(1)}` })
    class A11 {}
    @customElement({ name: name(A12), template: `${name(A12)}${vp(1)}` })
    class A12 {}
    const A1 = [A11, A12];

    @customElement({ name: name(A21), template: `${name(A21)}${vp(2)}` })
    class A21 {}
    @customElement({ name: name(A22), template: `${name(A22)}${vp(2)}` })
    class A22 {}
    const A2 = [A21, A22];

    const A = [...A0, ...A1, ...A2];

    // Start with a broad sample of non-generated tests that are easy to debug and mess around with.
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

    it(`${name(A11)} can load ${name(A11)}/${name(A01)}`, async function () {
      const { router, host, tearDown } = await createFixture(A11, A);

      await router.load(`${name(A11)}/${name(A01)}`);
      assertComponentsVisible(host, [A11, A11, A01]);

      await tearDown();
    });

    it(`${name(A11)} can load ${name(A11)}/${name(A01)},${name(A11)}/${name(A02)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(A11, A);

      await router.load(`${name(A11)}/${name(A01)}`);
      assertComponentsVisible(host, [A11, A11, A01]);

      await router.load(`${name(A11)}/${name(A02)}`);
      assertComponentsVisible(host, [A11, A11, A02]);

      await tearDown();
    });

    // Now generate stuff
    type C = Constructable;

    // [x]
    const x1: Record<string, [C]> = {
      [`${name(A01)}`]: [A01],
      [`${name(A02)}`]: [A02],
    };

    // [x/x]
    const x2: Record<string, [C, C]> = {};
    for (const key in x1) {
      const value = x1[key];

      x2[`${name(A11)}/${key}`] = [A11, ...value];
      x2[`${name(A12)}/${key}`] = [A12, ...value];
    }

    // [x/x/x]
    const x3: Record<string, [C, C, C]> = {};
    for (const key in x2) {
      const value = x2[key];

      x3[`${name(A11)}/${key}`] = [A11, ...value];
      x3[`${name(A12)}/${key}`] = [A12, ...value];
    }

    // [x+x]
    const x1_1: Record<string, [C, C]> = {};
    for (const key11 in x1) {
      const value11 = x1[key11];
      for (const key12 in x1) {
        const value12 = x1[key12];
        x1_1[`${key11}+${key12}`] = [...value11, ...value12];
      }
    }

    // [x/x+x]
    const x2_1: Record<string, [C, C, C]> = {};
    for (const key21 in x2) {
      const value21 = x2[key21];
      for (const key12 in x1) {
        const value12 = x1[key12];
        x2_1[`${key21}+${key12}`] = [...value21, ...value12];
      }
    }

    // [x+x/x]
    const x1_2: Record<string, [C, C, C]> = {};
    for (const key11 in x1) {
      const value11 = x1[key11];
      for (const key22 in x2) {
        const value22 = x2[key22];
        x1_2[`${key11}+${key22}`] = [...value11, ...value22];
      }
    }

    // [x/x+x/x]
    const x2_2: Record<string, [C, C, C, C]> = {};
    for (const key21 in x2) {
      const value21 = x2[key21];
      for (const key22 in x2) {
        const value22 = x2[key22];
        x2_2[`${key21}+${key22}`] = [...value21, ...value22];
      }
    }

    const vp1: Record<string, C[]> = {};
    for (const key in x1) {
      vp1[key] = x1[key];
    }
    for (const key in x2) {
      vp1[key] = x2[key];
    }
    for (const key in x3) {
      vp1[key] = x3[key];
    }

    const vp2: Record<string, C[]> = {};
    for (const key in x1_1) {
      vp2[key] = x1_1[key];
    }
    for (const key in x1_2) {
      vp2[key] = x1_2[key];
    }
    for (const key in x2_1) {
      vp2[key] = x2_1[key];
    }
    for (const key in x2_2) {
      vp2[key] = x2_2[key];
    }

    interface InstructionSpec {
      path: string;
      components: C[];
    }
    interface SequenceSpec {
      instructions: InstructionSpec[];
    }

    for (const key11 in vp1) {
      const value11 = vp1[key11];

      it(`${name(A11)} can load ${key11}`, async function () {
        const { router, host, tearDown } = await createFixture(A11, A);

        await router.load(key11);
        assertComponentsVisible(host, [A11, ...value11]);

        await tearDown();
      });
    }

    for (const key21 in vp2) {
      const value21 = vp2[key21];

      it(`${name(A21)} can load ${key21}`, async function () {
        const { router, host, tearDown } = await createFixture(A11, A);

        await router.load(key21);
        assertComponentsVisible(host, [A11, ...value21]);

        await tearDown();
      });
    }
  });
});
