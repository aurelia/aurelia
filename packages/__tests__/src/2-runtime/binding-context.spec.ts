import { Scope } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('2-runtime/binding-context.spec.ts', function () {
  describe('create', function () {
    it('throws on null/undefined context', function () {
      assert.throws(() => Scope.create(undefined, undefined));
      assert.throws(() => Scope.create(undefined, null));
      assert.throws(() => Scope.create(null, undefined));
    });

    it('{}, undefined', function () {
      const bindingContext = {};
      const actual = Scope.create(bindingContext, undefined);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.parent, null, `actual.parent`);
    });

    it('{}, null', function () {
      const bindingContext = {};
      const actual = Scope.create(bindingContext, null);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.parent, null, `actual.parent`);
    });

    it('{}, {}', function () {
      const bindingContext = {};
      const overrideContext = {};
      const actual = Scope.create(bindingContext, overrideContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.parent, null, `actual.parent`);
    });

    it('{}, { bindingContext }', function () {
      const bindingContext = {};
      const overrideContext = {};
      const actual = Scope.create(bindingContext, overrideContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.strictEqual(actual.overrideContext, overrideContext, `actual.overrideContext`);
      assert.strictEqual(actual.parent, null, `actual.parent`);
    });
  });

  describe('fromParent', function () {
    it('undefined', function () {
      assert.throws(() => Scope.fromParent(undefined, {}), 'ParentScope is undefined', `() => Scope.fromParent(undefined, {})`);
    });

    it('null', function () {
      assert.throws(() => Scope.fromParent(null, {}), 'ParentScope is null', `() => Scope.fromParent(null, {})`);
    });

    it('{}, {}', function () {
      const parentScope = {} as any;
      const bindingContext = {};
      const actual = Scope.fromParent(parentScope, bindingContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.parent.overrideContext, undefined, `actual.parent.overrideContext`);
    });

    it('{}, { overrideContext }', function () {
      const overrideContext = {};
      const parentScope = { overrideContext } as any;
      const bindingContext = {};
      const actual = Scope.fromParent(parentScope, bindingContext);
      assert.strictEqual(actual.bindingContext, bindingContext, `actual.bindingContext`);
      assert.instanceOf(actual.overrideContext, Object, `actual.overrideContext`);
      assert.strictEqual(actual.parent.overrideContext, overrideContext, `actual.parent.overrideContext`);
    });
  });

  describe('getContext', function () {
    it('undefined context', function () {
      assert.throws(() => Scope.getContext(
        { bindingContext: undefined, overrideContext: {} } as any,
        undefined,
        undefined
      ), 'Scope is undefined', `() => Scope.getContext(undefined, undefined, undefined)`);
    });

    it('undefined overrides', function () {
      assert.throws(() => Scope.getContext(
        { bindingContext: {}, overrideContext: undefined } as any,
        undefined,
        undefined
      ), 'Scope is null', `() => Scope.getContext(null, undefined, undefined)`);
    });

    it('null context', function () {
      assert.throws(() => Scope.getContext(
        { bindingContext: null, overrideContext: {} } as any,
        undefined,
        undefined
      ), 'Scope is null', `() => Scope.getContext(null, undefined, undefined)`);
    });

    it('null overrides', function () {
      assert.throws(() => Scope.getContext(
        { bindingContext: {}, overrideContext: null } as any,
        undefined,
        undefined
      ), 'Scope is null', `() => Scope.getContext(null, undefined, undefined)`);
    });

    it('{ bindingContext: {}, overrideContext: {} }', function () {
      const overrideContext = {};
      const bindingContext = {};
      const scope = { bindingContext, overrideContext } as any;
      const actual = Scope.getContext(scope, null, null);
      assert.strictEqual(actual, bindingContext, `actual`);
    });

    it('1 ancestor, null, null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const actual = Scope.getContext(scope2, null, null);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('2 ancestors, null, null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const actual = Scope.getContext(scope3, null, null);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, null, null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, null, null);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('1 ancestor, \'foo\', null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const actual = Scope.getContext(scope2, 'foo', null);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('2 ancestors, \'foo\', null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const actual = Scope.getContext(scope3, 'foo', null);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\', null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #1), null', function () {
      const bindingContext1 = { foo: 'bar' } as any;
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext1, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #2), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #3), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on bc #4), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope1.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope2.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope3.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #4), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      scope4.overrideContext['foo'] = 'bar';
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope4.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #1), null', function () {
      const bindingContext1 = { foo: 'bar' } as any;
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope1.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #2), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope2.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #3), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope3.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #4 and bc #4), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      scope4.overrideContext['foo'] = 'bar';
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, scope4.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), null', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', null);
      assert.strictEqual(actual, bindingContext4, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 1', function () {
      const bindingContext1 = {};
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 1);
      assert.strictEqual(actual, scope3.bindingContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 1', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 1);
      assert.strictEqual(actual, bindingContext3, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 1', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 1);
      assert.strictEqual(actual, scope3.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 2', function () {
      const bindingContext1 = {};
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 2);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 2', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 2);
      assert.strictEqual(actual, scope2.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 2', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 2);
      assert.strictEqual(actual, bindingContext2, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 3', function () {
      const bindingContext1 = {};
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 3);
      assert.strictEqual(actual, scope1.overrideContext, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 3', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 3);
      assert.strictEqual(actual, bindingContext1, `actual`);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 3', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 3);
      assert.strictEqual(actual, bindingContext1, `actual`);
    });

    it('3 ancestors, null, 4', function () {
      const bindingContext1 = {};
      const bindingContext2 = {};
      const bindingContext3 = {};
      const bindingContext4 = {};
      const scope1 = Scope.create(bindingContext1, null);
      const scope2 = Scope.fromParent(scope1, bindingContext2);
      const scope3 = Scope.fromParent(scope2, bindingContext3);
      const scope4 = Scope.fromParent(scope3, bindingContext4);
      const actual = Scope.getContext(scope4, 'foo', 4);
      assert.strictEqual(actual, undefined, `actual`);
    });
  });
});
