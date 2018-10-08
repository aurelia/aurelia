import { BindingContext } from "../../../src/index";
import { expect } from 'chai';

describe('BindingContext', () => {
  describe('createScope', () => {
    it('undefined, undefined', () => {
      const actual = BindingContext.createScope(undefined, undefined);
      expect(actual.bindingContext).to.be.undefined;
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('undefined, null', () => {
      const actual = BindingContext.createScope(undefined, null);
      expect(actual.bindingContext).to.be.undefined;
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('undefined, {}', () => {
      const overrideContext = {} as any;
      const actual = BindingContext.createScope(undefined, overrideContext);
      expect(actual.bindingContext).to.be.undefined;
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('undefined, { bindingContext }', () => {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = BindingContext.createScope(null, overrideContext);
      expect(actual.bindingContext).to.be.null;
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('null, undefined', () => {
      const actual = BindingContext.createScope(null, undefined);
      expect(actual.bindingContext).to.be.null;
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.be.null;
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('null, null', () => {
      const actual = BindingContext.createScope(null, null);
      expect(actual.bindingContext).to.be.null;
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.be.null;
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('null, {}', () => {
      const overrideContext = {} as any;
      const actual = BindingContext.createScope(null, overrideContext);
      expect(actual.bindingContext).to.be.null;
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('null, { bindingContext }', () => {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = BindingContext.createScope(null, overrideContext);
      expect(actual.bindingContext).to.be.null;
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('{}, undefined', () => {
      const bindingContext = {} as any;
      const actual = BindingContext.createScope(bindingContext, undefined);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('{}, null', () => {
      const bindingContext = {} as any;
      const actual = BindingContext.createScope(bindingContext, null);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('{}, {}', () => {
      const bindingContext = {} as any;
      const overrideContext = {} as any;
      const actual = BindingContext.createScope(bindingContext, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('{}, { bindingContext }', () => {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = BindingContext.createScope(bindingContext, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('{}, { bindingContext2 }', () => {
      const bindingContext = {} as any;
      const bindingContext2 = {} as any;
      const overrideContext = { bindingContext: bindingContext2 } as any;
      const actual = BindingContext.createScope(bindingContext, overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext2);
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });
  });

  describe('createScopeFromOverride', () => {
    it('undefined', () => {
      expect(() => BindingContext.createScopeFromOverride(undefined)).to.throw('Code 252');
    });

    it('null', () => {
      expect(() => BindingContext.createScopeFromOverride(null)).to.throw('Code 252');
    });

    it('{}', () => {
      const overrideContext = {} as any;
      const actual = BindingContext.createScopeFromOverride(overrideContext);
      expect(actual.bindingContext).to.be.undefined;
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });

    it('{ bindingContext }', () => {
      const bindingContext = {} as any;
      const overrideContext = { bindingContext } as any;
      const actual = BindingContext.createScopeFromOverride(overrideContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.equal(overrideContext);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.undefined;
    });
  });

  describe('createScopeFromParent', () => {
    it('undefined', () => {
      expect(() => BindingContext.createScopeFromParent(undefined, {})).to.throw('Code 253');
    });

    it('null', () => {
      expect(() => BindingContext.createScopeFromParent(null, {})).to.throw('Code 253');
    });

    it('{}, undefined', () => {
      const parentScope = {} as any;
      const actual = BindingContext.createScopeFromParent(parentScope, undefined);
      expect(actual.bindingContext).to.be.undefined;
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.be.undefined;
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('{}, null', () => {
      const parentScope = {} as any;
      const actual = BindingContext.createScopeFromParent(parentScope, null);
      expect(actual.bindingContext).to.be.null;
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.be.null;
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('{}, {}', () => {
      const parentScope = {} as any;
      const bindingContext = {} as any;
      const actual = BindingContext.createScopeFromParent(parentScope, bindingContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.be.null;
    });

    it('{}, { overrideContext }', () => {
      const overrideContext = {} as any;
      const parentScope = { overrideContext } as any;
      const bindingContext = {} as any;
      const actual = BindingContext.createScopeFromParent(parentScope, bindingContext);
      expect(actual.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext).to.be.instanceof(Object);
      expect(actual.overrideContext.bindingContext).to.equal(bindingContext);
      expect(actual.overrideContext.parentOverrideContext).to.equal(overrideContext);
    });
  });

  describe('get', () => {
    it('undefined', () => {
      expect(() => BindingContext.get(undefined, undefined, undefined)).to.throw('Code 250');
    });

    it('null', () => {
      expect(() => BindingContext.get(null, undefined, undefined)).to.throw('Code 251');
    });

    it('{ bindingContext: undefined, overrideContext: undefined }', () => {
      const scope = { } as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.be.undefined;
    });

    it('{ bindingContext: undefined, overrideContext: null }', () => {
      const scope = { overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.be.null;
    });

    it('{ bindingContext: undefined, overrideContext: {} }', () => {
      const overrideContext = {} as any;
      const scope = { overrideContext } as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.equal(overrideContext);
    });

    it('{ bindingContext: null, overrideContext: undefined }', () => {
      const scope = { } as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.be.undefined;
    });

    it('{ bindingContext: null, overrideContext: null }', () => {
      const scope = { overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.be.null;
    });

    it('{ bindingContext: null, overrideContext: {} }', () => {
      const overrideContext = {} as any;
      const scope = { overrideContext } as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.equal(overrideContext);
    });

    it('{ bindingContext: {}, overrideContext: undefined }', () => {
      const bindingContext = {} as any;
      const scope = { bindingContext } as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.equal(bindingContext);
    });

    it('{ bindingContext: {}, overrideContext: null }', () => {
      const bindingContext = {} as any;
      const scope = { bindingContext, overrideContext: null} as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.equal(bindingContext);
    });

    it('{ bindingContext: {}, overrideContext: {} }', () => {
      const overrideContext = {} as any;
      const bindingContext = {} as any;
      const scope = { bindingContext, overrideContext } as any;
      const actual = BindingContext.get(scope, null, null);
      expect(actual).to.equal(bindingContext);
    });

    it('1 ancestor, null, null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const actual = BindingContext.get(scope2, null, null);
      expect(actual).to.equal(bindingContext2);
    });

    it('2 ancestors, null, null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const actual = BindingContext.get(scope3, null, null);
      expect(actual).to.equal(bindingContext3);
    });

    it('3 ancestors, null, null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, null, null);
      expect(actual).to.equal(bindingContext4);
    });

    it('1 ancestor, \'foo\', null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const actual = BindingContext.get(scope2, 'foo', null);
      expect(actual).to.equal(bindingContext2);
    });

    it('2 ancestors, \'foo\', null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const actual = BindingContext.get(scope3, 'foo', null);
      expect(actual).to.equal(bindingContext3);
    });

    it('3 ancestors, \'foo\', null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext4);
    });

    it('3 ancestors, \'foo\' (exist on bc #1), null', () => {
      const bindingContext1 = { foo: 'bar' } as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext1);
    });

    it('3 ancestors, \'foo\' (exist on bc #2), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext2);
    });

    it('3 ancestors, \'foo\' (exist on bc #3), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext3);
    });

    it('3 ancestors, \'foo\' (exist on bc #4), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext4);
    });

    it('3 ancestors, \'foo\' (exist on oc #1), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope1.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #2), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope2.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #3), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope3.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #4), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      scope4.overrideContext['foo'] = 'bar';
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope4.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #1), null', () => {
      const bindingContext1 = { foo: 'bar' } as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope1.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #2), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope2.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #3), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope3.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #4 and bc #4), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      scope4.overrideContext['foo'] = 'bar';
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(scope4.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext2);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext3);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), null', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', null);
      expect(actual).to.equal(bindingContext4);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 1', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 1);
      expect(actual).to.equal(scope3.bindingContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 1', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 1);
      expect(actual).to.equal(bindingContext3);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 1', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 1);
      expect(actual).to.equal(scope3.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 2', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 2);
      expect(actual).to.equal(bindingContext2);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 2', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 2);
      expect(actual).to.equal(scope2.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 2', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 2);
      expect(actual).to.equal(bindingContext2);
    });

    it('3 ancestors, \'foo\' (exist on oc #1 and bc #2), 3', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = { foo: 'bar' } as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      scope1.overrideContext['foo'] = 'bar';
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 3);
      expect(actual).to.equal(scope1.overrideContext);
    });

    it('3 ancestors, \'foo\' (exist on oc #2 and bc #3), 3', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = { foo: 'bar' } as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      scope2.overrideContext['foo'] = 'bar';
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 3);
      expect(actual).to.equal(bindingContext1);
    });

    it('3 ancestors, \'foo\' (exist on oc #3 and bc #4), 3', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = { foo: 'bar' } as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      scope3.overrideContext['foo'] = 'bar';
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 3);
      expect(actual).to.equal(bindingContext1);
    });

    it('3 ancestors, null, 4', () => {
      const bindingContext1 = {} as any;
      const bindingContext2 = {} as any;
      const bindingContext3 = {} as any;
      const bindingContext4 = {} as any;
      const scope1 = BindingContext.createScope(bindingContext1);
      const scope2 = BindingContext.createScopeFromParent(scope1, bindingContext2);
      const scope3 = BindingContext.createScopeFromParent(scope2, bindingContext3);
      const scope4 = BindingContext.createScopeFromParent(scope3, bindingContext4);
      const actual = BindingContext.get(scope4, 'foo', 4);
      expect(actual).to.be.undefined;
    });
  });
});
