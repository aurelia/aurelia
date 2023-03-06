import {
  LogLevel,
  Constructable,
  kebabCase,
  ILogConfig,
} from '@aurelia/kernel';
import {
  assert,
} from '@aurelia/testing';
import {
  Router,
  IRouter,
  LoadInstruction,
  Parameters,
  RoutingInstruction,
  Navigation,
  IRouterOptions,
} from '@aurelia/router';
import {
  customElement,
  CustomElement,
} from '@aurelia/runtime-html';

import { createFixture, translateOptions } from './_shared/create-fixture.js';
import { IHIAConfig } from './_shared/hook-invocation-tracker.js';

function vp(count: number, name = ''): string {
  if (count === 1) {
    return `<au-viewport${name.length > 0 ? ` name="${name}"` : ''}></au-viewport>`;
  }
  let template = '';
  for (let i = 0; i < count; ++i) {
    template = `${template}<au-viewport name="${name}$${i}"></au-viewport>`;
  }
  return template;
}
function name(type: Constructable): string {
  return kebabCase(type.name);
}

function getDefaultHIAConfig(): IHIAConfig {
  return {
    resolveTimeoutMs: 100,
    resolveLabels: [],
  };
}

type C = Constructable;
type CSpec = (C | CSpec)[];
function getText(spec: CSpec): string {
  return spec.map(function (x) {
    if (x instanceof Array) {
      return getText(x);
    }
    return kebabCase(x.name);
  }).join('');
}
function assertComponentsVisible(host: HTMLElement, spec: CSpec, msg: string = ''): void {
  assert.strictEqual(host.textContent, getText(spec), msg);
}
function assertIsActive(
  router: IRouter,
  instruction: LoadInstruction,
  options: any,
  expected: boolean,
  assertId: number,
): void {
  if (options instanceof Router) {
    options = {};
  }
  const isActive = router.checkActive(instruction, options);
  assert.strictEqual(isActive, expected, `expected isActive to return ${expected} (assertId ${assertId})`);
}

describe('router/smoke-tests.spec.ts', function () {
  describe('without any configuration, deps registered globally', function () {
    @customElement({ name: name(A01), template: `${name(A01)}${vp(0)}` })
    class A01 { }
    @customElement({ name: name(A02), template: `${name(A02)}${vp(0)}` })
    class A02 { }
    const A0 = [A01, A02];

    @customElement({ name: name(Root1), template: `${name(Root1)}${vp(1)}` })
    class Root1 { }
    @customElement({ name: name(A11), template: `${name(A11)}${vp(1)}` })
    class A11 { }
    @customElement({ name: name(A12), template: `${name(A12)}${vp(1)}` })
    class A12 { }
    const A1 = [A11, A12];

    @customElement({ name: name(Root2), template: `${name(Root2)}${vp(2)}` })
    class Root2 { }
    @customElement({ name: name(A21), template: `${name(A21)}${vp(2)}` })
    class A21 { }
    @customElement({ name: name(A22), template: `${name(A22)}${vp(2)}` })
    class A22 { }
    const A2 = [A21, A22];

    const A = [...A0, ...A1, ...A2];

    @customElement({ name: 'b01', template: `b01${vp(0)}` })
    class B01 {
      public async canUnload(
        _params: Parameters,
        _instruction: RoutingInstruction,
        _navigation: Navigation,
      ): Promise<true> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return true;
      }
    }
    @customElement({ name: 'b02', template: `b02${vp(0)}` })
    class B02 {
      public async canUnload(
        _params: Parameters,
        _instruction: RoutingInstruction,
        _navigation: Navigation,
      ): Promise<false> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return false;
      }
    }
    const B0 = [B01, B02];

    @customElement({ name: 'b11', template: `b11${vp(1)}` })
    class B11 {
      public async canUnload(
        _params: Parameters,
        _instruction: RoutingInstruction,
        _navigation: Navigation,
      ): Promise<true> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return true;
      }
    }
    @customElement({ name: 'b12', template: `b12${vp(1)}` })
    class B12 {
      public async canUnload(
        _params: Parameters,
        _instruction: RoutingInstruction,
        _navigation: Navigation,
      ): Promise<false> {
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
        return false;
      }
    }
    const B1 = [B11, B12];

    const B = [...B0, ...B1];

    const Z = [...A, ...B];

    const getRouterOptions = (): IRouterOptions => translateOptions({});

    // Start with a broad sample of non-generated tests that are easy to debug and mess around with.
    it(`${name(Root1)} can load ${name(A01)} as a string and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load('a01');
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, A01, {}, true, 1);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A01)} as a type and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(A01);
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, A01, {}, true, 1);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A01)} as a RoutingInstruction and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load({ component: A01 });
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, { component: A01 }, {}, true, 1);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A01)} as a CustomElementDefinition and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(CustomElement.getDefinition(A01));
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, CustomElement.getDefinition(A01), {}, true, 1);

      await tearDown();
    });

    it(`${name(Root1)} can load ({ name: 'a31', template: \`A31\${vp(0)}\` } as an object and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      const def = { name: 'a31', template: `a31${vp(0)}` };
      await router.load(def);
      const A31 = CustomElement.define(def);
      assertComponentsVisible(host, [Root1, A31]);
      assertIsActive(router, CustomElement.getDefinition(A31), {}, true, 1);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A01)},${name(A02)} in order and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load('a01');
      assertComponentsVisible(host, [Root1, A01]);
      assertIsActive(router, A01, {}, true, 1);

      await router.load('a02');
      assertComponentsVisible(host, [Root1, A02]);
      assertIsActive(router, A02, {}, true, 2);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)},${name(A11)}/${name(A02)} in order with context and can determine if it's active`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(A11);
      assertComponentsVisible(host, [Root1, A11]);
      assertIsActive(router, A11, {}, true, 1);

      const loadOptions = { origin: router.allEndpoints('Viewport')[0].getContent().componentInstance }; // A11 view model

      await router.load(A02, loadOptions);
      assertComponentsVisible(host, [Root1, A11, A02]);
      assertIsActive(router, A02, loadOptions, true, 2);
      assertIsActive(router, A02, {}, false, 3);
      assertIsActive(router, A11, {}, true, 3);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)}/${name(A01)},${name(A11)}/${name(A02)} in order with context`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load({ component: A11, children: [A01] });
      assertComponentsVisible(host, [Root1, A11, A01]);

      const loadOptions = { origin: router.allEndpoints('Viewport')[0].getContent().componentInstance }; // A11 view model

      await router.load(A02, loadOptions);
      assertComponentsVisible(host, [Root1, A11, A02]);

      await tearDown();
    });

    it(`${name(Root1)} correctly handles canUnload with load ${name(B01)},${name(A01)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      let result = await router.load(B01);
      assertComponentsVisible(host, [Root1, B01]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(A01);
      assertComponentsVisible(host, [Root1, A01]);
      assert.strictEqual(result, true, '#2 result===true');

      await tearDown();
    });

    it(`${name(Root1)} correctly handles canUnload with load ${name(B02)},${name(A01)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      let result = await router.load(B02);
      assertComponentsVisible(host, [Root1, B02]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(A01);
      assertComponentsVisible(host, [Root1, B02]);
      assert.strictEqual(result, false, '#2 result===false');

      await tearDown();
    });

    it(`${name(Root1)} correctly handles canUnload with load ${name(B02)},${name(A01)},${name(A02)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      let result = await router.load(B02);
      assertComponentsVisible(host, [Root1, B02], '#1');
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(A01);
      assertComponentsVisible(host, [Root1, B02], '#2');
      assert.strictEqual(result, false, '#2 result===false');

      result = await router.load(A02);
      assertComponentsVisible(host, [Root1, B02], '#3');
      assert.strictEqual(result, false, '#3 result===false');

      await tearDown();
    });

    it(`${name(Root1)} correctly handles canUnload with load ${name(B11)}/${name(B02)},${name(B11)}/${name(A02)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      let result = await router.load(`b11/b02`);
      assertComponentsVisible(host, [Root1, B11, [B02]]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(`b11/a02`);
      assertComponentsVisible(host, [Root1, B11, [B02]]);
      assert.strictEqual(result, false, '#2 result===false');

      await tearDown();
    });

    it(`${name(Root1)} correctly handles canUnload with load ${name(B12)}/${name(B01)},${name(B11)}/${name(B01)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      let result = await router.load(`b12/b01`);
      assertComponentsVisible(host, [Root1, B12, [B01]]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(`b11/b01`);
      assertComponentsVisible(host, [Root1, B12, [B01]]);
      assert.strictEqual(result, false, '#2 result===false');

      await tearDown();
    });

    it(`${name(Root1)} correctly handles canUnload with load ${name(B12)}/${name(B01)},${name(B12)}/${name(A01)} in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      let result = await router.load(`b12/b01`);
      assertComponentsVisible(host, [Root1, B12, [B01]]);
      assert.strictEqual(result, true, '#1 result===true');

      result = await router.load(`b12/a01`);
      assertComponentsVisible(host, [Root1, B12, [A01]]);
      assert.strictEqual(result, true, '#2 result===true');

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)}/${name(A01)} as a string`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(`a11/a01`);
      assertComponentsVisible(host, [Root1, A11, A01]);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)}/${name(A01)} as a RoutingInstruction`, async function () {
      const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load({ component: A11, children: [A01] });
      assertComponentsVisible(host, [Root1, A11, A01]);

      await tearDown();
    });

    it(`${name(Root1)} can load ${name(A11)}/${name(A01)},${name(A11)}/${name(A02)} in order`, async function () {
      const { router, host, tearDown, startTracing, stopTracing } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(`a11/a01`);
      assertComponentsVisible(host, [Root1, A11, A01]);

      await router.load(`a11/a02`);
      assertComponentsVisible(host, [Root1, A11, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as a string`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(`${name(A01)}@$0+${name(A02)}@$1`);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as an array of strings`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load([`${name(A01)}@$0`, `${name(A02)}@$1`]);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as an array of types`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load([{ component: A01, viewport: '$0' }, { component: A02, viewport: '$1' }]);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as a mixed array type and string`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load([{ component: A01, viewport: '$0' }, `${name(A02)}@$1`]);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1,${name(A02)}@$0+${name(A01)}@$1 in order`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(`${name(A01)}@$0+${name(A02)}@$1`);
      assertComponentsVisible(host, [Root2, A01, A02]);

      await router.load(`${name(A02)}@$0+${name(A01)}@$1`);
      assertComponentsVisible(host, [Root2, A02, A01]);

      await tearDown();
    });

    it(`${name(Root2)} can load ${name(A11)}@$0/${name(A12)}/${name(A01)}+${name(A12)}@$1/${name(A01)},${name(A11)}@$0/${name(A12)}/${name(A01)}+${name(A12)}@$1/${name(A11)}/${name(A01)},${name(A11)}@$0/${name(A12)}/${name(A02)}+${name(A12)}@$1/${name(A11)}/${name(A01)} in order with context`, async function () {
      const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

      await router.load(`${name(A11)}@$0/${name(A12)}/${name(A01)}+${name(A12)}@$1/${name(A01)}`);
      assertComponentsVisible(host, [Root2, [A11, [A12, [A01]]], [A12, [A01]]], '#1');

      let loadOptions = { origin: router.allEndpoints('Viewport')[1].getContent().componentInstance }; // Top A12 view model

      await router.load(`${name(A11)}@$0/${name(A01)}`, loadOptions);
      assertComponentsVisible(host, [Root2, [A11, [A12, [A01]]], [A12, [A11, [A01]]]], '#2');

      loadOptions = { origin: router.allEndpoints('Viewport')[2].getContent().componentInstance }; // Second level A12 view model

      await router.load(`${name(A02)}`, loadOptions);
      assertComponentsVisible(host, [Root2, [A11, [A12, [A02]]], [A12, [A11, [A01]]]], '#3');

      await tearDown();
    });

    // Now generate stuff
    const $1vp: Record<string, CSpec> = {
      // [x]
      [`a01`]: [A01],
      [`a02`]: [A02],
      // [x/x]
      [`a11/a01`]: [A11, [A01]],
      [`a11/a02`]: [A11, [A02]],
      [`a12/a01`]: [A12, [A01]],
      [`a12/a02`]: [A12, [A02]],
      // [x/x/x]
      [`a11/a12/a01`]: [A11, [A12, [A01]]],
      [`a11/a12/a02`]: [A11, [A12, [A02]]],
      [`a12/a11/a01`]: [A12, [A11, [A01]]],
      [`a12/a11/a02`]: [A12, [A11, [A02]]],
    };

    const $2vps: Record<string, CSpec> = {
      // [x+x]
      [`${name(A01)}@$0+${name(A02)}@$1`]: [[A01], [A02]],
      [`${name(A02)}@$0+${name(A01)}@$1`]: [[A02], [A01]],
      // [x/x+x]
      [`${name(A11)}@$0/${name(A01)}+${name(A02)}@$1`]: [[A11, [A01]], [A02]],
      [`${name(A11)}@$0/${name(A02)}+${name(A01)}@$1`]: [[A11, [A02]], [A01]],
      [`${name(A12)}@$0/${name(A01)}+${name(A02)}@$1`]: [[A12, [A01]], [A02]],
      [`${name(A12)}@$0/${name(A02)}+${name(A01)}@$1`]: [[A12, [A02]], [A01]],
      // [x+x/x]
      [`${name(A01)}@$0+${name(A11)}@$1/${name(A02)}`]: [[A01], [A11, [A02]]],
      [`${name(A02)}@$0+${name(A11)}@$1/${name(A01)}`]: [[A02], [A11, [A01]]],
      [`${name(A01)}@$0+${name(A12)}@$1/${name(A02)}`]: [[A01], [A12, [A02]]],
      [`${name(A02)}@$0+${name(A12)}@$1/${name(A01)}`]: [[A02], [A12, [A01]]],
      // [x/x+x/x]
      [`${name(A11)}@$0/${name(A01)}+${name(A12)}@$1/${name(A02)}`]: [[A11, [A01]], [A12, [A02]]],
      [`${name(A11)}@$0/${name(A02)}+${name(A12)}@$1/${name(A01)}`]: [[A11, [A02]], [A12, [A01]]],
      [`${name(A12)}@$0/${name(A01)}+${name(A11)}@$1/${name(A02)}`]: [[A12, [A01]], [A11, [A02]]],
      [`${name(A12)}@$0/${name(A02)}+${name(A11)}@$1/${name(A01)}`]: [[A12, [A02]], [A11, [A01]]],
    };

    const $1vpKeys = Object.keys($1vp);
    for (let i = 0, ii = $1vpKeys.length; i < ii; ++i) {
      const key11 = $1vpKeys[i];
      const value11 = $1vp[key11];

      it(`${name(Root1)} can load ${key11}`, async function () {
        const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

        await router.load(key11);
        assertComponentsVisible(host, [Root1, value11]);

        await tearDown();
      });

      if (i >= 1) {
        const key11prev = $1vpKeys[i - 1];
        const value11prev = $1vp[key11prev];

        it(`${name(Root1)} can load ${key11prev},${key11} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

          await router.load(key11prev);
          assertComponentsVisible(host, [Root1, value11prev]);

          await router.load(key11);
          assertComponentsVisible(host, [Root1, value11]);

          await tearDown();
        });

        it(`${name(Root1)} can load ${key11},${key11prev} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);

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
        const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

        await router.load(key21);
        assertComponentsVisible(host, [Root2, value21]);

        await tearDown();
      });

      if (i >= 1) {
        const key21prev = $2vpsKeys[i - 1];
        const value21prev = $2vps[key21prev];

        it(`${name(Root2)} can load ${key21prev},${key21} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

          await router.load(key21prev);
          assertComponentsVisible(host, [Root2, value21prev]);

          await router.load(key21);
          assertComponentsVisible(host, [Root2, value21]);

          await tearDown();
        });

        it(`${name(Root2)} can load ${key21},${key21prev} in order`, async function () {
          const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);

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
