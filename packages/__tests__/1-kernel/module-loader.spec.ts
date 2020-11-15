import { AnalyzedModule, DI, IModuleLoader } from '@aurelia/kernel';

import * as ce_a_b_default from './modules/ce-a-b-default';
import * as ce_a_b_defaultb from './modules/ce-a-b-defaultb';
import * as ce_a_b from './modules/ce-a-b';
import * as ce_default from './modules/ce-default';
import * as kitchen_sink from './modules/kitchen-sink';
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

    assert.strictEqual(res.items[0].isConstructable, true, `res.items[0].isConstructable === true`);
    assert.strictEqual(res.items[0].isRegistry, false, `res.items[0].isRegistry === false`);
    assert.strictEqual(res.items[0].key, 'A', `res.items[0].key === 'A'`);
    assert.strictEqual(res.items[0].value, ce_a_b_default.A, `res.items[0].value === ce_a_b_default.A`);
    assert.strictEqual(res.items[0].definitions.length, 1, `res.items[0].definitions.length === 1`);
    assert.strictEqual(res.items[0].definitions[0], CustomElement.getDefinition(ce_a_b_default.A), `res.items[0].definitions[0] === CustomElement.getDefinition(ce_a_b_default.A)`);

    assert.strictEqual(res.items[1].isConstructable, true, `res.items[1].isConstructable === true`);
    assert.strictEqual(res.items[1].isRegistry, false, `res.items[1].isRegistry === false`);
    assert.strictEqual(res.items[1].key, 'B', `res.items[1].key === 'B'`);
    assert.strictEqual(res.items[1].value, ce_a_b_default.B, `res.items[1].value === ce_a_b_default.B`);
    assert.strictEqual(res.items[1].definitions.length, 1, `res.items[1].definitions.length === 1`);
    assert.strictEqual(res.items[1].definitions[0], CustomElement.getDefinition(ce_a_b_default.B), `res.items[1].definitions[0] === CustomElement.getDefinition(ce_a_b_default.B)`);

    assert.strictEqual(res.items[2].isConstructable, true, `res.items[2].isConstructable === true`);
    assert.strictEqual(res.items[2].isRegistry, false, `res.items[2].isRegistry === false`);
    assert.strictEqual(res.items[2].key, 'default', `res.items[2].key === 'default'`);
    assert.strictEqual(res.items[2].value, ce_a_b_default.default, `res.items[2].value === ce_a_b_default.default`);
    assert.strictEqual(res.items[2].definitions.length, 1, `res.items[2].definitions.length === 1`);
    assert.strictEqual(res.items[2].definitions[0], CustomElement.getDefinition(ce_a_b_default.default), `res.items[2].definitions[0] === CustomElement.getDefinition(ce_a_b_default.default)`);
  });

  it('correctly analyzes ce_a_b_defaultb', function () {
    const loader = createFixture();

    const res = loader.load(ce_a_b_defaultb);

    assert.strictEqual(res.raw, ce_a_b_defaultb, `res.raw === ce_a_b_defaultb`);
    assert.strictEqual(res.items.length, 3, `res.items.length === 3`);

    assert.strictEqual(res.items[0].isConstructable, true, `res.items[0].isConstructable === true`);
    assert.strictEqual(res.items[0].isRegistry, false, `res.items[0].isRegistry === false`);
    assert.strictEqual(res.items[0].key, 'A', `res.items[0].key === 'A'`);
    assert.strictEqual(res.items[0].value, ce_a_b_defaultb.A, `res.items[0].value === ce_a_b_defaultb.A`);
    assert.strictEqual(res.items[0].definitions.length, 1, `res.items[0].definitions.length === 1`);
    assert.strictEqual(res.items[0].definitions[0], CustomElement.getDefinition(ce_a_b_defaultb.A), `res.items[0].definitions[0] === CustomElement.getDefinition(ce_a_b_defaultb.A)`);

    assert.strictEqual(res.items[1].isConstructable, true, `res.items[1].isConstructable === true`);
    assert.strictEqual(res.items[1].isRegistry, false, `res.items[1].isRegistry === false`);
    assert.strictEqual(res.items[1].key, 'B', `res.items[1].key === 'B'`);
    assert.strictEqual(res.items[1].value, ce_a_b_defaultb.B, `res.items[1].value === ce_a_b_defaultb.B`);
    assert.strictEqual(res.items[1].definitions.length, 1, `res.items[1].definitions.length === 1`);
    assert.strictEqual(res.items[1].definitions[0], CustomElement.getDefinition(ce_a_b_defaultb.B), `res.items[1].definitions[0] === CustomElement.getDefinition(ce_a_b_defaultb.B)`);

    assert.strictEqual(res.items[2].isConstructable, true, `res.items[2].isConstructable === true`);
    assert.strictEqual(res.items[2].isRegistry, false, `res.items[2].isRegistry === false`);
    assert.strictEqual(res.items[2].key, 'default', `res.items[2].key === 'default'`);
    assert.strictEqual(res.items[2].value, ce_a_b_defaultb.default, `res.items[2].value === ce_a_b_defaultb.default`);
    assert.strictEqual(res.items[2].definitions.length, 1, `res.items[2].definitions.length === 1`);
    assert.strictEqual(res.items[2].definitions[0], CustomElement.getDefinition(ce_a_b_defaultb.default), `res.items[2].definitions[0] === CustomElement.getDefinition(ce_a_b_defaultb.default)`);
  });

  it('correctly analyzes ce_a_b', function () {
    const loader = createFixture();

    const res = loader.load(ce_a_b);

    assert.strictEqual(res.raw, ce_a_b, `res.raw === ce_a_b`);
    assert.strictEqual(res.items.length, 2, `res.items.length === 2`);

    assert.strictEqual(res.items[0].isConstructable, true, `res.items[0].isConstructable === true`);
    assert.strictEqual(res.items[0].isRegistry, false, `res.items[0].isRegistry === false`);
    assert.strictEqual(res.items[0].key, 'A', `res.items[0].key === 'A'`);
    assert.strictEqual(res.items[0].value, ce_a_b.A, `res.items[0].value === ce_a_b.A`);
    assert.strictEqual(res.items[0].definitions.length, 1, `res.items[0].definitions.length === 1`);
    assert.strictEqual(res.items[0].definitions[0], CustomElement.getDefinition(ce_a_b.A), `res.items[0].definitions[0] === CustomElement.getDefinition(ce_a_b.A)`);

    assert.strictEqual(res.items[1].isConstructable, true, `res.items[1].isConstructable === true`);
    assert.strictEqual(res.items[1].isRegistry, false, `res.items[1].isRegistry === false`);
    assert.strictEqual(res.items[1].key, 'B', `res.items[1].key === 'B'`);
    assert.strictEqual(res.items[1].value, ce_a_b.B, `res.items[1].value === ce_a_b.B`);
    assert.strictEqual(res.items[1].definitions.length, 1, `res.items[1].definitions.length === 1`);
    assert.strictEqual(res.items[1].definitions[0], CustomElement.getDefinition(ce_a_b.B), `res.items[1].definitions[0] === CustomElement.getDefinition(ce_a_b.B)`);
  });

  it('correctly analyzes ce_default', function () {
    const loader = createFixture();

    const res = loader.load(ce_default);

    assert.strictEqual(res.raw, ce_default, `res.raw === ce_default`);
    assert.strictEqual(res.items.length, 1, `res.items.length === 1`);

    assert.strictEqual(res.items[0].isConstructable, true, `res.items[0].isConstructable === true`);
    assert.strictEqual(res.items[0].isRegistry, false, `res.items[0].isRegistry === false`);
    assert.strictEqual(res.items[0].key, 'default', `res.items[0].key === 'default'`);
    assert.strictEqual(res.items[0].value, ce_default.default, `res.items[0].value === ce_default.default`);
    assert.strictEqual(res.items[0].definitions.length, 1, `res.items[0].definitions.length === 1`);
    assert.strictEqual(res.items[0].definitions[0], CustomElement.getDefinition(ce_default.default), `res.items[0].definitions[0] === CustomElement.getDefinition(ce_default.default)`);
  });

  it('correctly analyzes kitchen_sink', function () {
    const loader = createFixture();

    const res = loader.load(kitchen_sink);

    assert.strictEqual(res.raw, kitchen_sink, `res.raw === kitchen_sink`);
    assert.strictEqual(res.items.length, 6, `res.items.length === 6`);

    assert.strictEqual(res.items[0].isConstructable, true, `res.items[0].isConstructable === true`);
    assert.strictEqual(res.items[0].isRegistry, false, `res.items[0].isRegistry === false`);
    assert.strictEqual(res.items[0].key, 'CE', `res.items[0].key === 'CE'`);
    assert.strictEqual(res.items[0].value, kitchen_sink.CE, `res.items[0].value === kitchen_sink.CE`);
    assert.strictEqual(res.items[0].definitions.length, 1, `res.items[0].definitions.length === 1`);
    assert.strictEqual(res.items[0].definitions[0], CustomElement.getDefinition(kitchen_sink.CE), `res.items[0].definitions[0] === CustomElement.getDefinition(kitchen_sink.A)`);

    assert.strictEqual(res.items[1].isConstructable, true, `res.items[1].isConstructable === true`);
    assert.strictEqual(res.items[1].isRegistry, false, `res.items[1].isRegistry === false`);
    assert.strictEqual(res.items[1].key, 'CA', `res.items[1].key === 'CA'`);
    assert.strictEqual(res.items[1].value, kitchen_sink.CA, `res.items[1].value === kitchen_sink.CA`);
    assert.strictEqual(res.items[1].definitions.length, 1, `res.items[1].definitions.length === 1`);
    assert.strictEqual(res.items[1].definitions[0], CustomAttribute.getDefinition(kitchen_sink.CA), `res.items[1].definitions[0] === CustomAttribute.getDefinition(kitchen_sink.A)`);

    assert.strictEqual(res.items[2].isConstructable, true, `res.items[2].isConstructable === true`);
    assert.strictEqual(res.items[2].isRegistry, false, `res.items[2].isRegistry === false`);
    assert.strictEqual(res.items[2].key, 'VC', `res.items[2].key === 'VC'`);
    assert.strictEqual(res.items[2].value, kitchen_sink.VC, `res.items[2].value === kitchen_sink.VC`);
    assert.strictEqual(res.items[2].definitions.length, 1, `res.items[2].definitions.length === 1`);
    assert.strictEqual(res.items[2].definitions[0], ValueConverter.getDefinition(kitchen_sink.VC), `res.items[2].definitions[0] === ValueConverter.getDefinition(kitchen_sink.A)`);

    assert.strictEqual(res.items[3].isConstructable, true, `res.items[3].isConstructable === true`);
    assert.strictEqual(res.items[3].isRegistry, false, `res.items[3].isRegistry === false`);
    assert.strictEqual(res.items[3].key, 'BB', `res.items[3].key === 'BB'`);
    assert.strictEqual(res.items[3].value, kitchen_sink.BB, `res.items[3].value === kitchen_sink.BB`);
    assert.strictEqual(res.items[3].definitions.length, 1, `res.items[3].definitions.length === 1`);
    assert.strictEqual(res.items[3].definitions[0], BindingBehavior.getDefinition(kitchen_sink.BB), `res.items[3].definitions[0] === BindingBehavior.getDefinition(kitchen_sink.A)`);

    assert.strictEqual(res.items[4].isConstructable, true, `res.items[3].isConstructable === true`);
    assert.strictEqual(res.items[4].isRegistry, false, `res.items[3].isRegistry === false`);
    assert.strictEqual(res.items[4].key, 'X', `res.items[3].key === 'X'`);
    assert.strictEqual(res.items[4].value, kitchen_sink.X, `res.items[3].value === kitchen_sink.X`);
    assert.strictEqual(res.items[4].definitions.length, 0, `res.items[3].definitions.length === 0`);

    assert.strictEqual(res.items[5].isConstructable, false, `res.items[3].isConstructable === false`);
    assert.strictEqual(res.items[5].isRegistry, true, `res.items[3].isRegistry === true`);
    assert.strictEqual(res.items[5].key, 'Registry', `res.items[3].key === 'Registry'`);
    assert.strictEqual(res.items[5].value, kitchen_sink.Registry, `res.items[3].value === kitchen_sink.Registry`);
    assert.strictEqual(res.items[5].definitions.length, 0, `res.items[3].definitions.length === 0`);
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

    const res3 = loader.load(promise);

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

    const res3 = loader.load(promise);

    assert.strictEqual(res3, $res1, `res3 === $res1`);
    assert.strictEqual(calls, 1, `calls === 1`);
  });
});
