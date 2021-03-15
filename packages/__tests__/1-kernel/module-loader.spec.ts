import { AnalyzedModule, DI, IModuleLoader } from '@aurelia/kernel';

import * as ce_a_b_default from './modules/ce-a-b-default.js';
import * as ce_a_b_defaultb from './modules/ce-a-b-defaultb.js';
import * as ce_a_b from './modules/ce-a-b.js';
import * as ce_default from './modules/ce-default.js';
import * as kitchen_sink from './modules/kitchen-sink.js';
import { assert } from '@aurelia/testing';
import { BindingBehavior, CustomAttribute, CustomElement, ValueConverter } from '@aurelia/runtime-html';

describe('ModuleLoader', function () {
  function createFixture() {
    const container = DI.createContainer();
    return container.get(IModuleLoader);
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
    assert.strictEqual(A.definitions.length, 1, `A.definitions.length === 1`);
    assert.strictEqual(A.definitions[0], CustomElement.getDefinition(ce_a_b_default.A), `A.definitions[0] === CustomElement.getDefinition(ce_a_b_default.A)`);

    const B = res.items.find(x => x.key === 'B');
    assert.strictEqual(B.isConstructable, true, `B.isConstructable === true`);
    assert.strictEqual(B.isRegistry, false, `B.isRegistry === false`);
    assert.strictEqual(B.key, 'B', `B.key === 'B'`);
    assert.strictEqual(B.value, ce_a_b_default.B, `B.value === ce_a_b_default.B`);
    assert.strictEqual(B.definitions.length, 1, `B.definitions.length === 1`);
    assert.strictEqual(B.definitions[0], CustomElement.getDefinition(ce_a_b_default.B), `B.definitions[0] === CustomElement.getDefinition(ce_a_b_default.B)`);

    const d = res.items.find(x => x.key === 'default');
    assert.strictEqual(d.isConstructable, true, `d.isConstructable === true`);
    assert.strictEqual(d.isRegistry, false, `d.isRegistry === false`);
    assert.strictEqual(d.key, 'default', `d.key === 'default'`);
    assert.strictEqual(d.value, ce_a_b_default.default, `d.value === ce_a_b_default.default`);
    assert.strictEqual(d.definitions.length, 1, `d.definitions.length === 1`);
    assert.strictEqual(d.definitions[0], CustomElement.getDefinition(ce_a_b_default.default), `d.definitions[0] === CustomElement.getDefinition(ce_a_b_default.default)`);
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
    assert.strictEqual(A.definitions.length, 1, `A.definitions.length === 1`);
    assert.strictEqual(A.definitions[0], CustomElement.getDefinition(ce_a_b_defaultb.A), `A.definitions[0] === CustomElement.getDefinition(ce_a_b_defaultb.A)`);

    const B = res.items.find(x => x.key === 'B');
    assert.strictEqual(B.isConstructable, true, `B.isConstructable === true`);
    assert.strictEqual(B.isRegistry, false, `B.isRegistry === false`);
    assert.strictEqual(B.key, 'B', `B.key === 'B'`);
    assert.strictEqual(B.value, ce_a_b_defaultb.B, `B.value === ce_a_b_defaultb.B`);
    assert.strictEqual(B.definitions.length, 1, `B.definitions.length === 1`);
    assert.strictEqual(B.definitions[0], CustomElement.getDefinition(ce_a_b_defaultb.B), `B.definitions[0] === CustomElement.getDefinition(ce_a_b_defaultb.B)`);

    const d = res.items.find(x => x.key === 'default');
    assert.strictEqual(d.isConstructable, true, `d.isConstructable === true`);
    assert.strictEqual(d.isRegistry, false, `d.isRegistry === false`);
    assert.strictEqual(d.key, 'default', `d.key === 'default'`);
    assert.strictEqual(d.value, ce_a_b_defaultb.default, `d.value === ce_a_b_defaultb.default`);
    assert.strictEqual(d.definitions.length, 1, `d.definitions.length === 1`);
    assert.strictEqual(d.definitions[0], CustomElement.getDefinition(ce_a_b_defaultb.default), `d.definitions[0] === CustomElement.getDefinition(ce_a_b_defaultb.default)`);
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
    assert.strictEqual(A.definitions.length, 1, `A.definitions.length === 1`);
    assert.strictEqual(A.definitions[0], CustomElement.getDefinition(ce_a_b.A), `A.definitions[0] === CustomElement.getDefinition(ce_a_b.A)`);

    const B = res.items.find(x => x.key === 'B');
    assert.strictEqual(B.isConstructable, true, `B.isConstructable === true`);
    assert.strictEqual(B.isRegistry, false, `B.isRegistry === false`);
    assert.strictEqual(B.key, 'B', `B.key === 'B'`);
    assert.strictEqual(B.value, ce_a_b.B, `B.value === ce_a_b.B`);
    assert.strictEqual(B.definitions.length, 1, `B.definitions.length === 1`);
    assert.strictEqual(B.definitions[0], CustomElement.getDefinition(ce_a_b.B), `B.definitions[0] === CustomElement.getDefinition(ce_a_b.B)`);
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
    assert.strictEqual(d.definitions.length, 1, `d.definitions.length === 1`);
    assert.strictEqual(d.definitions[0], CustomElement.getDefinition(ce_default.default), `d.definitions[0] === CustomElement.getDefinition(ce_default.default)`);
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
    assert.strictEqual(CE.definitions.length, 1, `CE.definitions.length === 1`);
    assert.strictEqual(CE.definitions[0], CustomElement.getDefinition(kitchen_sink.CE), `CE.definitions[0] === CustomElement.getDefinition(kitchen_sink.A)`);

    const CA = res.items.find(x => x.key === 'CA');
    assert.strictEqual(CA.isConstructable, true, `CA.isConstructable === true`);
    assert.strictEqual(CA.isRegistry, false, `CA.isRegistry === false`);
    assert.strictEqual(CA.key, 'CA', `CA.key === 'CA'`);
    assert.strictEqual(CA.value, kitchen_sink.CA, `CA.value === kitchen_sink.CA`);
    assert.strictEqual(CA.definitions.length, 1, `CA.definitions.length === 1`);
    assert.strictEqual(CA.definitions[0], CustomAttribute.getDefinition(kitchen_sink.CA), `CA.definitions[0] === CustomAttribute.getDefinition(kitchen_sink.A)`);

    const VC = res.items.find(x => x.key === 'VC');
    assert.strictEqual(VC.isConstructable, true, `VC.isConstructable === true`);
    assert.strictEqual(VC.isRegistry, false, `VC.isRegistry === false`);
    assert.strictEqual(VC.key, 'VC', `VC.key === 'VC'`);
    assert.strictEqual(VC.value, kitchen_sink.VC, `VC.value === kitchen_sink.VC`);
    assert.strictEqual(VC.definitions.length, 1, `VC.definitions.length === 1`);
    assert.strictEqual(VC.definitions[0], ValueConverter.getDefinition(kitchen_sink.VC), `VC.definitions[0] === ValueConverter.getDefinition(kitchen_sink.A)`);

    const BB = res.items.find(x => x.key === 'BB');
    assert.strictEqual(BB.isConstructable, true, `BB.isConstructable === true`);
    assert.strictEqual(BB.isRegistry, false, `BB.isRegistry === false`);
    assert.strictEqual(BB.key, 'BB', `BB.key === 'BB'`);
    assert.strictEqual(BB.value, kitchen_sink.BB, `BB.value === kitchen_sink.BB`);
    assert.strictEqual(BB.definitions.length, 1, `BB.definitions.length === 1`);
    assert.strictEqual(BB.definitions[0], BindingBehavior.getDefinition(kitchen_sink.BB), `BB.definitions[0] === BindingBehavior.getDefinition(kitchen_sink.A)`);

    const X = res.items.find(x => x.key === 'X');
    assert.strictEqual(X.isConstructable, true, `BB.isConstructable === true`);
    assert.strictEqual(X.isRegistry, false, `BB.isRegistry === false`);
    assert.strictEqual(X.key, 'X', `BB.key === 'X'`);
    assert.strictEqual(X.value, kitchen_sink.X, `BB.value === kitchen_sink.X`);
    assert.strictEqual(X.definitions.length, 0, `BB.definitions.length === 0`);

    const R = res.items.find(x => x.key === 'Registry');
    assert.strictEqual(R.isConstructable, false, `BB.isConstructable === false`);
    assert.strictEqual(R.isRegistry, true, `BB.isRegistry === true`);
    assert.strictEqual(R.key, 'Registry', `BB.key === 'Registry'`);
    assert.strictEqual(R.value, kitchen_sink.Registry, `BB.value === kitchen_sink.Registry`);
    assert.strictEqual(R.definitions.length, 0, `BB.definitions.length === 0`);
  });

  it('caches the transform result', function () {
    const loader = createFixture();
    const retVal = kitchen_sink.CE;
    let calls = 0;
    function transform(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls;
      return m.items.find(x => x.isConstructable && CustomElement.isType(x.definitions[0].Type))!.value;
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
      return m.items.find(x => x.isConstructable && CustomElement.isType(x.definitions[0].Type))!.value;
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
      return Promise.resolve(m.items.find(x => x.isConstructable && CustomElement.isType(x.definitions[0].Type))!.value);
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
      return Promise.resolve(m.items.find(x => x.isConstructable && CustomElement.isType(x.definitions[0].Type))!.value);
    }

    let calls2 = 0;
    function transform2(m: AnalyzedModule<typeof kitchen_sink>): {} {
      ++calls2;
      return Promise.resolve(m.items.find(x => x.isConstructable && CustomElement.isType(x.definitions[0].Type))!.value);
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
});
