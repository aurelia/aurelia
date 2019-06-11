import { expect } from 'chai';
import {
  BindingContext,
  LifecycleFlags as LF,
  Scope
} from '../../src/index';

describe('Scope', function () {
  describe('create', function () {
    it('undefined, undefined', function () {
      const actual = Scope.create(LF.none, undefined, undefined);
      expect(actual.bindingContext).to.equal(undefined);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('undefined, null', function () {
      const actual = Scope.create(LF.none, undefined, null);
      expect(actual.bindingContext).to.equal(undefined);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('undefined, {}', function () {
      const overrideContext = {} as any;
      const actual = Scope.create(LF.none, undefined, overrideContext);
      expect(actual.bindingContext).to.equal(undefined);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('undefined, { bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.create(LF.none, null, overrideContext);
      expect(actual.bindingContext).to.equal(null);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('null, undefined', function () {
      const actual = Scope.create(LF.none, null, undefined);
      expect(actual.bindingContext).to.equal(null);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(null);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('null, null', function () {
      const actual = Scope.create(LF.none, null, null);
      expect(actual.bindingContext).to.equal(null);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(null);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('null, {}', function () {
      const overrideContext = {} as any;
      const actual = Scope.create(LF.none, null, overrideContext);
      expect(actual.bindingContext).to.equal(null);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('null, { bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.create(LF.none, null, overrideContext);
      expect(actual.bindingContext).to.equal(null);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('{}, undefined', function () {
      const bindingContext = {} as any;
      const actual = Scope.create(LF.none, bindingContext, undefined);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('{}, null', function () {
      const bindingContext = {} as any;
      const actual = Scope.create(LF.none, bindingContext, null);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('{}, {}', function () {
      const bindingContext = {} as any;
      const overrideContext = {} as any;
      const actual = Scope.create(LF.none, bindingContext, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('{}, { bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.create(LF.none, bindingContext, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('{}, { bindingContext2 }', function () {
      const bindingContext = {} as any;
      const bindingContext2 = {} as any;
      const overrideContext = { bindingContext: bindingContext2 } as any;
      const actual = Scope.create(LF.none, bindingContext, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext2);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });
  });

  describe('fromOverride', function () {
    it('undefined', function () {
      expect(() => Scope.fromOverride(LF.none, undefined)).to.throw('Code 252');
    });

    it('null', function () {
      expect(() => Scope.fromOverride(LF.none, null)).to.throw('Code 252');
    });

    it('{}', function () {
      const overrideContext = {} as any;
      const actual = Scope.fromOverride(LF.none, overrideContext);
      expect(actual.bindingContext).to.equal(undefined);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });

    it('{ bindingContext }', function () {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = Scope.fromOverride(LF.none, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(undefined);
    });
  });

  describe('fromParent', function () {
    it('undefined', function () {
      expect(() => Scope.fromParent(LF.none, undefined, {})).to.throw('Code 253');
    });

    it('null', function () {
      expect(() => Scope.fromParent(LF.none, null, {})).to.throw('Code 253');
    });

    it('{}, undefined', function () {
      const parentScope = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, undefined);
      expect(actual.bindingContext).to.equal(undefined);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(undefined);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('{}, null', function () {
      const parentScope = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, null);
      expect(actual.bindingContext).to.equal(null);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(null);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('{}, {}', function () {
      const parentScope = {} as any;
      const bindingContext = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, bindingContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(null);
    });

    it('{}, { overrideContext }', function () {
      const overrideContext = {} as any;
      const parentScope = { overrideContext } as any;
      const bindingContext = {} as any;
      const actual = Scope.fromParent(LF.none, parentScope, bindingContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(overrideContext);
    });
  });
});

describe('BindingContext', function () {
  describe('get', function () {
    it('undefined', function () {
      expect(() => BindingContext.get(undefined, undefined, undefined, LF.none)).to.throw('Code 250');
    });

    it('null', function () {
      expect(() => BindingContext.get(null, undefined, undefined, LF.none)).to.throw('Code 251');
    });

    it('{ bindingContext: undefined, overrideContext: undefined }', function () {
      const scope = { } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(undefined);
    });

    it('{ bindingContext: undefined, overrideContext: null }', function () {
      const scope = { overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(null);
    });

    it('{ bindingContext: undefined, overrideContext: {} }', function () {
      const overrideContext = {} as any;
      const scope = { overrideContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(overrideContext);
    });

    it('{ bindingContext: null, overrideContext: undefined }', function () {
      const scope = { } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(undefined);
    });

    it('{ bindingContext: null, overrideContext: null }', function () {
      const scope = { overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(null);
    });

    it('{ bindingContext: null, overrideContext: {} }', function () {
      const overrideContext = {} as any;
      const scope = { overrideContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(overrideContext);
    });

    it('{ bindingContext: {}, overrideContext: undefined }', function () {
      const bindingContext = {} as any;
      const scope = { bindingContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(bindingContext);
    });

    it('{ bindingContext: {}, overrideContext: null }', function () {
      const bindingContext = {} as any;
      const scope = { bindingContext, overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(bindingContext);
    });

    it('{ bindingContext: {}, overrideContext: {} }', function () {
      const overrideContext = {} as any;
      const bindingContext = {} as any;
      const scope = { bindingContext, overrideContext } as any;
      const actual = BindingContext.get(scope, null, null, LF.none);
      expect(actual).to.equal(bindingContext);
    });

    it('1 ancestor, null, null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const actual = BindingContext.get(scope2, null, null, LF.none);
      expect(actual).to.equal(bindingContext2);
    });

    it('2 ancestors, null, null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const actual = BindingContext.get(scope3, null, null, LF.none);
      expect(actual).to.equal(bindingContext3);
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
      expect(actual).to.equal(bindingContext4);
    });

    it('1 ancestor, \'foo\', null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const actual = BindingContext.get(scope2, 'foo', null, LF.none);
      expect(actual).to.equal(bindingContext2);
    });

    it('2 ancestors, \'foo\', null', function () {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const scope1 = Scope.create(LF.none, bindingContext1, null);
      const scope2 = Scope.fromParent(LF.none, scope1, bindingContext2);
      const scope3 = Scope.fromParent(LF.none, scope2, bindingContext3);
      const actual = BindingContext.get(scope3, 'foo', null, LF.none);
      expect(actual).to.equal(bindingContext3);
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
      expect(actual).to.equal(bindingContext4);
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
      expect(actual).to.equal(bindingContext1);
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
      expect(actual).to.equal(bindingContext2);
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
      expect(actual).to.equal(bindingContext3);
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
      expect(actual).to.equal(bindingContext4);
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
      expect(actual).to.equal(scope1.overrideContext);
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
      expect(actual).to.equal(scope2.overrideContext);
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
      expect(actual).to.equal(scope3.overrideContext);
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
      expect(actual).to.equal(scope4.overrideContext);
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
      expect(actual).to.equal(scope1.overrideContext);
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
      expect(actual).to.equal(scope2.overrideContext);
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
      expect(actual).to.equal(scope3.overrideContext);
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
      expect(actual).to.equal(scope4.overrideContext);
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
      expect(actual).to.equal(bindingContext2);
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
      expect(actual).to.equal(bindingContext3);
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
      expect(actual).to.equal(bindingContext4);
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
      expect(actual).to.equal(scope3.bindingContext);
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
      expect(actual).to.equal(bindingContext3);
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
      expect(actual).to.equal(scope3.overrideContext);
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
      expect(actual).to.equal(bindingContext2);
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
      expect(actual).to.equal(scope2.overrideContext);
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
      expect(actual).to.equal(bindingContext2);
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
      expect(actual).to.equal(scope1.overrideContext);
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
      expect(actual).to.equal(bindingContext1);
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
      expect(actual).to.equal(bindingContext1);
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
      expect(actual).to.equal(undefined);
    });
  });
});
