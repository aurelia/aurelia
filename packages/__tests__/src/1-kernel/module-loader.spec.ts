import { AnalyzedModule, DI, IModuleLoader, aliasedKeysRegistry } from '@aurelia/kernel';

import * as ce_a_b_default from './modules/ce-a-b-default.js';
import * as ce_a_b_defaultb from './modules/ce-a-b-defaultb.js';
import * as ce_a_b from './modules/ce-a-b.js';
import * as ce_default from './modules/ce-default.js';
import * as ca_a_b from './modules/ca-a-b.js';
import * as bb_multi from './modules/bb-multi.js';
import * as vc_multi from './modules/vc-multi.js';
import * as cmd_multi from './modules/command-multi.js';
import * as kitchen_sink from './modules/kitchen-sink.js';
import { assert } from '@aurelia/testing';
import { CustomAttribute, CustomElement, BindingBehavior, ValueConverter, BindingCommand } from '@aurelia/runtime-html';

describe('1-kernel/module-loader.spec.ts', function () {
  function createFixture() {
    const container = DI.createContainer();
    return Object.assign(container.get(IModuleLoader), { container });
  }

  it('correctly analyzes ce_a_b_default', function () {
    const loader = createFixture();

    const res = loader.load(ce_a_b_default);

    assert.strictEqual(res.raw, ce_a_b_default, `res.raw === ce_a_b_default`);
    assert.strictEqual(res.items.length, 3, `res.items.length === 3`);

    const A = res.items.find(x => x.key === 'A');
    assert.strictEqual(A.isConstructable, true, `A.isConstructable === true`);
    assert.strictEqual(A.isRegistry, false, `A.isRegistry === false`);
    assert.strictEqual(A.key, 'A', `A.key === 'A'`);
    assert.strictEqual(A.value, ce_a_b_default.A, `A.value === ce_a_b_default.A`);
    assert.strictEqual(A.definition, CustomElement.getDefinition(ce_a_b_default.A), `A.definition === CustomElement.getDefinition(ce_a_b_default.A)`);

    const B = res.items.find(x => x.key === 'B');
    assert.strictEqual(B.isConstructable, true, `B.isConstructable === true`);
    assert.strictEqual(B.isRegistry, false, `B.isRegistry === false`);
    assert.strictEqual(B.key, 'B', `B.key === 'B'`);
    assert.strictEqual(B.value, ce_a_b_default.B, `B.value === ce_a_b_default.B`);
    assert.strictEqual(B.definition, CustomElement.getDefinition(ce_a_b_default.B), `B.definition === CustomElement.getDefinition(ce_a_b_default.B)`);

    const d = res.items.find(x => x.key === 'default');
    assert.strictEqual(d.isConstructable, true, `d.isConstructable === true`);
    assert.strictEqual(d.isRegistry, false, `d.isRegistry === false`);
    assert.strictEqual(d.key, 'default', `d.key === 'default'`);
    assert.strictEqual(d.value, ce_a_b_default.default, `d.value === ce_a_b_default.default`);
    assert.strictEqual(d.definition, CustomElement.getDefinition(ce_a_b_default.default), `d.definition === CustomElement.getDefinition(ce_a_b_default.default)`);
  });

  it('correctly analyzes ce_a_b_defaultb', function () {
    const loader = createFixture();

    const res = loader.load(ce_a_b_defaultb);

    assert.strictEqual(res.raw, ce_a_b_defaultb, `res.raw === ce_a_b_defaultb`);
    assert.strictEqual(res.items.length, 3, `res.items.length === 3`);

    const A = res.items.find(x => x.key === 'A');
    assert.strictEqual(A.isConstructable, true, `A.isConstructable === true`);
    assert.strictEqual(A.isRegistry, false, `A.isRegistry === false`);
    assert.strictEqual(A.key, 'A', `A.key === 'A'`);
    assert.strictEqual(A.value, ce_a_b_defaultb.A, `A.value === ce_a_b_defaultb.A`);
    assert.strictEqual(A.definition, CustomElement.getDefinition(ce_a_b_defaultb.A), `A.definition === CustomElement.getDefinition(ce_a_b_defaultb.A)`);

    const B = res.items.find(x => x.key === 'B');
    assert.strictEqual(B.isConstructable, true, `B.isConstructable === true`);
    assert.strictEqual(B.isRegistry, false, `B.isRegistry === false`);
    assert.strictEqual(B.key, 'B', `B.key === 'B'`);
    assert.strictEqual(B.value, ce_a_b_defaultb.B, `B.value === ce_a_b_defaultb.B`);
    assert.strictEqual(B.definition, CustomElement.getDefinition(ce_a_b_defaultb.B), `B.definition === CustomElement.getDefinition(ce_a_b_defaultb.B)`);

    const d = res.items.find(x => x.key === 'default');
    assert.strictEqual(d.isConstructable, true, `d.isConstructable === true`);
    assert.strictEqual(d.isRegistry, false, `d.isRegistry === false`);
    assert.strictEqual(d.key, 'default', `d.key === 'default'`);
    assert.strictEqual(d.value, ce_a_b_defaultb.default, `d.value === ce_a_b_defaultb.default`);
    assert.strictEqual(d.definition, CustomElement.getDefinition(ce_a_b_defaultb.default), `d.definition === CustomElement.getDefinition(ce_a_b_defaultb.default)`);
  });

  it('correctly analyzes ce_a_b', function () {
    const loader = createFixture();

    const res = loader.load(ce_a_b);

    assert.strictEqual(res.raw, ce_a_b, `res.raw === ce_a_b`);
    assert.strictEqual(res.items.length, 2, `res.items.length === 2`);

    const A = res.items.find(x => x.key === 'A');
    assert.strictEqual(A.isConstructable, true, `A.isConstructable === true`);
    assert.strictEqual(A.isRegistry, false, `A.isRegistry === false`);
    assert.strictEqual(A.key, 'A', `A.key === 'A'`);
    assert.strictEqual(A.value, ce_a_b.A, `A.value === ce_a_b.A`);
    assert.strictEqual(A.definition, CustomElement.getDefinition(ce_a_b.A), `A.definition === CustomElement.getDefinition(ce_a_b.A)`);

    const B = res.items.find(x => x.key === 'B');
    assert.strictEqual(B.isConstructable, true, `B.isConstructable === true`);
    assert.strictEqual(B.isRegistry, false, `B.isRegistry === false`);
    assert.strictEqual(B.key, 'B', `B.key === 'B'`);
    assert.strictEqual(B.value, ce_a_b.B, `B.value === ce_a_b.B`);
    assert.strictEqual(B.definition, CustomElement.getDefinition(ce_a_b.B), `B.definition === CustomElement.getDefinition(ce_a_b.B)`);
  });

  it('correctly analyzes ce_default', function () {
    const loader = createFixture();

    const res = loader.load(ce_default);

    assert.strictEqual(res.raw, ce_default, `res.raw === ce_default`);
    assert.strictEqual(res.items.length, 1, `res.items.length === 1`);

    const d = res.items.find(x => x.key === 'default');
    assert.strictEqual(d.isConstructable, true, `d.isConstructable === true`);
    assert.strictEqual(d.isRegistry, false, `d.isRegistry === false`);
    assert.strictEqual(d.key, 'default', `d.key === 'default'`);
    assert.strictEqual(d.value, ce_default.default, `d.value === ce_default.default`);
    assert.strictEqual(d.definition, CustomElement.getDefinition(ce_default.default), `d.definition === CustomElement.getDefinition(ce_default.default)`);
  });

  it('correctly analyzes kitchen_sink', function () {
    const loader = createFixture();

    const res = loader.load(kitchen_sink);

    assert.strictEqual(res.raw, kitchen_sink, `res.raw === kitchen_sink`);
    assert.strictEqual(res.items.length, 6, `res.items.length === 6`);

    const CE = res.items.find(x => x.key === 'CE');
    assert.strictEqual(CE.isConstructable, true, `CE.isConstructable === true`);
    assert.strictEqual(CE.isRegistry, false, `CE.isRegistry === false`);
    assert.strictEqual(CE.key, 'CE', `CE.key === 'CE'`);
    assert.strictEqual(CE.value, kitchen_sink.CE, `CE.value === kitchen_sink.CE`);
    assert.strictEqual(CE.definition, CustomElement.getDefinition(kitchen_sink.CE), `CE.definition === CustomElement.getDefinition(kitchen_sink.A)`);

    const CA = res.items.find(x => x.key === 'CA');
    assert.strictEqual(CA.isConstructable, true, `CA.isConstructable === true`);
    assert.strictEqual(CA.isRegistry, false, `CA.isRegistry === false`);
    assert.strictEqual(CA.key, 'CA', `CA.key === 'CA'`);
    assert.strictEqual(CA.value, kitchen_sink.CA, `CA.value === kitchen_sink.CA`);
    assert.strictEqual(CA.definition, CustomAttribute.getDefinition(kitchen_sink.CA), `CA.definition === CustomAttribute.getDefinition(kitchen_sink.A)`);

    const VC = res.items.find(x => x.key === 'VC');
    assert.strictEqual(VC.isConstructable, true, `VC.isConstructable === true`);
    assert.strictEqual(VC.isRegistry, false, `VC.isRegistry === false`);
    assert.strictEqual(VC.key, 'VC', `VC.key === 'VC'`);
    assert.strictEqual(VC.value, kitchen_sink.VC, `VC.value === kitchen_sink.VC`);
    assert.strictEqual(VC.definition, ValueConverter.getDefinition(kitchen_sink.VC), `VC.definition === ValueConverter.getDefinition(kitchen_sink.A)`);

    const BB = res.items.find(x => x.key === 'BB');
    assert.strictEqual(BB.isConstructable, true, `BB.isConstructable === true`);
    assert.strictEqual(BB.isRegistry, false, `BB.isRegistry === false`);
    assert.strictEqual(BB.key, 'BB', `BB.key === 'BB'`);
    assert.strictEqual(BB.value, kitchen_sink.BB, `BB.value === kitchen_sink.BB`);
    assert.strictEqual(BB.definition, BindingBehavior.getDefinition(kitchen_sink.BB), `BB.definition === BindingBehavior.getDefinition(kitchen_sink.A)`);

    const X = res.items.find(x => x.key === 'X');
    assert.strictEqual(X.isConstructable, true, `BB.isConstructable === true`);
    assert.strictEqual(X.isRegistry, false, `BB.isRegistry === false`);
    assert.strictEqual(X.key, 'X', `BB.key === 'X'`);
    assert.strictEqual(X.value, kitchen_sink.X, `BB.value === kitchen_sink.X`);
    assert.strictEqual(X.definition, null, `BB.definition === null`);

    const R = res.items.find(x => x.key === 'Registry');
    assert.strictEqual(R.isConstructable, false, `BB.isConstructable === false`);
    assert.strictEqual(R.isRegistry, true, `BB.isRegistry === true`);
    assert.strictEqual(R.key, 'Registry', `BB.key === 'Registry'`);
    assert.strictEqual(R.value, kitchen_sink.Registry, `BB.value === kitchen_sink.Registry`);
    assert.strictEqual(R.definition, null, `BB.definition === null`);
  });

  it('caches the transform result', function () {
    const loader = createFixture();
    const retVal = kitchen_sink.CE;
    let calls = 0;
    function transform(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls;
      return m.items.find(x => x.isConstructable && CustomElement.isType(x.definition?.Type))?.value;
    }

    const res1 = loader.load(kitchen_sink, transform);
    const res2 = loader.load(kitchen_sink, transform);

    assert.strictEqual(res1, retVal, `res1 === retVal`);
    assert.strictEqual(res2, retVal, `res2 === retVal`);
    assert.strictEqual(calls, 1, `calls === 1`);
  });

  it('returns the resolved result on subsequent calls', async function () {
    const loader = createFixture();
    const promise = Promise.resolve(kitchen_sink);

    const res1 = loader.load(promise);
    const res2 = loader.load(promise);

    assert.strictEqual(res1, res2, `res1 === res2`);
    assert.strictEqual(res1 instanceof Promise, true, `res1 instanceof Promise === true`);

    const $res1 = await res1;

    assert.strictEqual($res1.raw, kitchen_sink, `$res1.raw === kitchen_sink`);

    const res3 = loader.load(promise);

    assert.strictEqual(res3, $res1, `res3 === $res1`);
  });

  it('caches the transform result from a promise', async function () {
    const loader = createFixture();
    const promise = Promise.resolve(kitchen_sink);
    const retVal = kitchen_sink.CE;
    let calls = 0;
    function transform(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls;
      return m.items.find(x => x.isConstructable && CustomElement.isType(x.definition?.Type))?.value;
    }

    const res1 = loader.load(promise, transform);
    const res2 = loader.load(promise, transform);

    assert.strictEqual(res1, res2, `res1 === res2`);
    assert.strictEqual(res1 instanceof Promise, true, `res1 instanceof Promise === true`);

    const $res1 = await res1;

    assert.strictEqual($res1, retVal, `$res1 === retVal`);

    const res3 = loader.load(promise, transform);

    assert.strictEqual(res3, $res1, `res3 === $res1`);
    assert.strictEqual(calls, 1, `calls === 1`);
  });

  it('caches the promise transform result from a promise', async function () {
    const loader = createFixture();
    const promise = Promise.resolve(kitchen_sink);
    const retVal = kitchen_sink.CE;
    let calls = 0;
    function transform(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls;
      return Promise.resolve(m.items.find(x => x.isConstructable && CustomElement.isType(x.definition?.Type))?.value);
    }

    const res1 = loader.load(promise, transform);
    const res2 = loader.load(promise, transform);

    assert.strictEqual(res1, res2, `res1 === res2`);
    assert.strictEqual(res1 instanceof Promise, true, `res1 instanceof Promise === true`);

    const $res1 = await res1;

    assert.strictEqual($res1, retVal, `$res1 === retVal`);

    const res3 = loader.load(promise, transform);

    assert.strictEqual(res3, $res1, `res3 === $res1`);
    assert.strictEqual(calls, 1, `calls === 1`);
  });

  it('does not cache results across different transform functions', async function () {
    const loader = createFixture();
    const promise = Promise.resolve(kitchen_sink);
    const retVal = kitchen_sink.CE;
    let calls1 = 0;
    function transform1(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls1;
      return Promise.resolve(m.items.find(x => x.isConstructable && CustomElement.isType(x.definition?.Type))?.value);
    }

    let calls2 = 0;
    function transform2(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls2;
      return Promise.resolve(m.items.find(x => x.isConstructable && CustomElement.isType(x.definition?.Type))?.value);
    }

    const res1 = loader.load(promise, transform1);
    const res2 = loader.load(promise, transform2);

    assert.notStrictEqual(res1, res2, `res1 !== res2`);
    assert.strictEqual(res1 instanceof Promise, true, `res1 instanceof Promise === true`);
    assert.strictEqual(res2 instanceof Promise, true, `res2 instanceof Promise === true`);

    const $res1 = await res1;
    const $res2 = await res2;

    void loader.load(promise, transform1);
    void loader.load(promise, transform2);

    assert.strictEqual($res1, retVal, `$res1 === retVal`);
    assert.strictEqual($res2, retVal, `$res2 === retVal`);

    assert.strictEqual(calls1, 1, `calls1 === 1`);
    assert.strictEqual(calls2, 1, `calls2 === 1`);
  });

  describe('aliasedKeysRegistry', function () {
    let loader: ReturnType<typeof createFixture>;
    const assertElementRegistration = (name: string, registered: boolean) =>
      assert.strictEqual(loader.container.has(CustomElement.keyFrom(name), false), registered);
    const assertAttributeRegistration = (name: string, registered: boolean) =>
      assert.strictEqual(loader.container.has(CustomAttribute.keyFrom(name), false), registered);
    const assertBindingBehaviorRegistration = (name: string, registered: boolean) =>
      assert.strictEqual(loader.container.has(BindingBehavior.keyFrom(name), false), registered);
    const assertValueConverterRegistration = (name: string, registered: boolean) =>
      assert.strictEqual(loader.container.has(ValueConverter.keyFrom(name), false), registered);
    const assertBindingCommandRegistration = (name: string, registered: boolean) =>
      assert.strictEqual(loader.container.has(BindingCommand.keyFrom(name), false), registered);

    this.beforeEach(function () {
      loader = createFixture();
    });

    // note that Module may not have their key in order we write them
    // so cannot use kitchen sink, as sometimes the keys are sorted alphabetically
    it('registers aliased main (first resource basically) key', function () {
      loader.container.register(aliasedKeysRegistry(ce_a_b, 'abc'));

      assertElementRegistration('a', false);
      assertElementRegistration('abc', true);
      assertElementRegistration('b', true);
    });

    it('registers aliased non-main keys', function () {
      loader.container.register(aliasedKeysRegistry(ce_a_b, null, { b: 'def' }));

      assertElementRegistration('a', true);
      assertElementRegistration('b', false);
      assertElementRegistration('def', true);
    });

    it('registers both main and non-main keys when specified', function () {
      loader.container.register(aliasedKeysRegistry(ce_a_b, 'abc', { b: 'def' }));

      assertElementRegistration('a', false);
      assertElementRegistration('abc', true);
      assertElementRegistration('b', false);
      assertElementRegistration('def', true);
    });

    it('registers aliased key for custom attribute', function () {
      loader.container.register(aliasedKeysRegistry(ca_a_b, null, { a: 'def' }));

      assertAttributeRegistration('a', false);
      assertAttributeRegistration('def', true);
      assertAttributeRegistration('b', true);
    });

    it('registers aliased key for binding behavior', function () {
      loader.container.register(aliasedKeysRegistry(bb_multi, null, { bb: 'def' }));

      assertBindingBehaviorRegistration('bb', false);
      assertBindingBehaviorRegistration('def', true);
      assertBindingBehaviorRegistration('bb_b', true);
    });

    it('registers aliased key for value converter', function () {
      loader.container.register(aliasedKeysRegistry(vc_multi, null, { vc: 'def' }));

      assertValueConverterRegistration('vc', false);
      assertValueConverterRegistration('def', true);
      assertValueConverterRegistration('vc_c', true);
    });

    it('registers aliased key for binding command', function () {
      loader.container.register(aliasedKeysRegistry(cmd_multi, null, { cmd: 'def' }));

      assertBindingCommandRegistration('cmd', false);
      assertBindingCommandRegistration('def', true);
      assertBindingCommandRegistration('powershell', true);
    });
  });
});
