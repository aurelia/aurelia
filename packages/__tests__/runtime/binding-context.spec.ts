import {
  BindingContext,
  LifecycleFlags as LF,
  Scope
} from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('Scope', function () {
  describe('create', function () {
    it('undefined, undefined', function () {
      const actual = Scope.create(LF.none, undefined, undefined);
      assert.strictEqual(actual.bindingContext, undefined, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('undefined, null', function () {
      const actual = Scope.create(LF.none, undefined, null);
      assert.strictEqual(actual.bindingContext, undefined, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('undefined, {}', function () {
      const overrideContext = {} as any;
      const actual = Scope.create(LF.none, undefined, overrideContext);
      assert.strictEqual(actual.bindingContext, undefined, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('undefined, { bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.create(LF.none, null, overrideContext);
      assert.strictEqual(actual.bindingContext, null, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('null, undefined', function () {
      const actual = Scope.create(LF.none, null, undefined);
      assert.strictEqual(actual.bindingContext, null, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, null, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('null, null', function () {
      const actual = Scope.create(LF.none, null, null);
      assert.strictEqual(actual.bindingContext, null, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, null, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('null, {}', function () {
      const overrideContext = {} as any;
      const actual = Scope.create(LF.none, null, overrideContext);
      assert.strictEqual(actual.bindingContext, null, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('null, { bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.create(LF.none, null, overrideContext);
      assert.strictEqual(actual.bindingContext, null, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, undefined', function () {
      const bindingContext = {} as any;
      const actual = Scope.create(LF.none, bindingContext, undefined);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, null', function () {
      const bindingContext = {} as any;
      const actual = Scope.create(LF.none, bindingContext, null);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, {}', function () {
      const bindingContext = {} as any;
      const overrideContext = {} as any;
      const actual = Scope.create(LF.none, bindingContext, overrideContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, { bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.create(LF.none, bindingContext, overrideContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, { bindingContext2 }', function () {
      const bindingContext = {} as any;
      const bindingContext2 = {} as any;
      const overrideContext = { bindingContext: bindingContext2 } as any;
      const actual = Scope.create(LF.none, bindingContext, overrideContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext2, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });
  });

  describe('fromOverride', function () {
    it('undefined', function () {
      assert.throws(() => Scope.fromOverride(LF.none, undefined), 'Code 252', `() => Scope.fromOverride(LF.none, undefined)`);
    });

    it('null', function () {
      assert.throws(() => Scope.fromOverride(LF.none, null), 'Code 252', `() => Scope.fromOverride(LF.none, null)`);
    });

    it('{}', function () {
      const overrideContext = {} as any;
      const actual = Scope.fromOverride(LF.none, overrideContext);
      assert.strictEqual(actual.bindingContext, undefined, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });

    it('{ bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.fromOverride(LF.none, overrideContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, undefined, `actual.overrideContext.parentOverrideContext`);
    });
  });

  describe('fromParent', function () {
    it('undefined', function () {
      assert.throws(() => Scope.fromParent(LF.none, undefined, {}), 'Code 253', `() => Scope.fromParent(LF.none, undefined, {})`);
    });

    it('null', function () {
      assert.throws(() => Scope.fromParent(LF.none, null, {}), 'Code 253', `() => Scope.fromParent(LF.none, null, {})`);
    });

    it('{}, undefined', function () {
      const parentScope = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, undefined);
      assert.strictEqual(actual.bindingContext, undefined, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, undefined, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, null', function () {
      const parentScope = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, null);
      assert.strictEqual(actual.bindingContext, null, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, null, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, {}', function () {
      const parentScope = {} as any;
      const bindingContext = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, bindingContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, null, `actual.overrideContext.parentOverrideContext`);
    });

    it('{}, { overrideContext }', function () {
      const overrideContext = {} as any;
      const parentScope = { overrideContext } as any;
      const bindingContext = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, bindingContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.overrideContext.bindingContext, bindingContext, `actual.overrideContext.bindingContext`);
      assert.strictEqual(actual.overrideContext.parentOverrideContext, overrideContext, `actual.overrideContext.parentOverrideContext`);
    });
  });
});

describe('BindingContext', function () {
  describe('get', function () {
    it('undefined', function () {
      assert.throws(() => BindingContext.get(undefined, undefined, undefined, LF.none), 'Code 250', `() => BindingContext.get(undefined, undefined, undefined, LF.none)`);
    });

    it('null', function () {
      assert.throws(() => BindingContext.get(null, undefined, undefined, LF.none), 'Code 250', `() => BindingContext.get(null, undefined, undefined, LF.none)`);
    });

    it('{ bindingContext: undefined, overrideContext: undefined }', function () {
      const scope = { } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, undefined, `actual`);
    });

    it('{ bindingContext: undefined, overrideContext: null }', function () {
      const scope = { overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, null, `actual`);
    });

    it('{ bindingContext: undefined, overrideContext: {} }', function () {
      const overrideContext = {} as any;
      const scope = { overrideContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, overrideContext, `actual`);
    });

    it('{ bindingContext: null, overrideContext: undefined }', function () {
      const scope = { } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, undefined, `actual`);
    });

    it('{ bindingContext: null, overrideContext: null }', function () {
      const scope = { overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, null, `actual`);
    });

    it('{ bindingContext: null, overrideContext: {} }', function () {
      const overrideContext = {} as any;
      const scope = { overrideContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, overrideContext, `actual`);
    });

    it('{ bindingContext: {}, overrideContext: undefined }', function () {
      const bindingContext = {} as any;
      const scope = { bindingContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, bindingContext, `actual`);
    });

    it('{ bindingContext: {}, overrideContext: null }', function () {
      const bindingContext = {} as any;
      const scope = { bindingContext, overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, bindingContext, `actual`);
    });

    it('{ bindingContext: {}, overrideContext: {} }', function () {
      const overrideContext = {} as any;
      const bindingContext = {} as any;
      const scope = { bindingContext, overrideContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      assert.strictEqual(actual, bindingContext, `actual`);
    });

    it('1 ancestor, null, null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const actual = BindingContext.get(scope2, null, null, LF.none);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('2 ancestors, null, null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const actual = BindingContext.get(scope3, null, null, LF.none);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, null, null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, null, null, LF.none);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('1 ancestor, \'foo\', null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const actual = BindingContext.get(scope2, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('2 ancestors, \'foo\', null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const actual = BindingContext.get(scope3, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\', null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #1), null', function () {
      const bindingContext1 = { foo: 'bar' } as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext1, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #2), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #3), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #4), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope1.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope2.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope3.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #4), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      scope4.overrideContext['foo'] = 'bar';
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope4.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #1), null', function () {
      const bindingContext1 = { foo: 'bar' } as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope1.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #2), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope2.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #3), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope3.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #4 and bc #4), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      scope4.overrideContext['foo'] = 'bar';
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, scope4.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null, LF.none);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 1', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 1, LF.none);
      assert.strictEqual(actual, scope3.bindingContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 1', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 1, LF.none);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 1', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 1, LF.none);
      assert.strictEqual(actual, scope3.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 2', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 2, LF.none);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 2', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 2, LF.none);
      assert.strictEqual(actual, scope2.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 2', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 2, LF.none);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 3', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 3, LF.none);
      assert.strictEqual(actual, scope1.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 3', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 3, LF.none);
      assert.strictEqual(actual, bindingContext1, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 3', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 3, LF.none);
      assert.strictEqual(actual, bindingContext1, `actual`);
    });

    it('3 ancestors, null, 4', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const scope4 = Scope.fromParent(LF.none, scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 4, LF.none);
      assert.strictEqual(actual, undefined, `actual`);
    });
  });
});
