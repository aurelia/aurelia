import { AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, IsPrimary, IExpression, IScope, IBinding, ExpressionKind } from '@aurelia/runtime';
import { expect } from 'chai';
import { spy, SinonSpy } from 'sinon';
import { createScopeForTest } from './shared';
import { BindingContext } from '@aurelia/runtime';
import { BindingFlags } from '@aurelia/runtime';
import { createPrimitiveLiteralArr, createAccessThisArr, createAccessScopeArr, createAccessMemberArr, createCallFunctionArr, createArrayLiteralArr, createObjectLiteralArr, createTemplateArr, createUnaryArr, getSimpleExpressionFactories, createAccessKeyedArr, createFooAccessKeyedArr, getSimplePrimaryExpressionFactories, createSingleAccessScopeArr, createSingleAccessThisArr, createEmptyArrayLiteralArr, createEmptyObjectLiteralArr, createLiteralNullArr } from './builders/ast-builder';
import { IServiceLocator } from '@aurelia/kernel';
import { padRight } from '../util';

const toString = Object.prototype.toString;
const nullScope = <IScope><any>null;
const nullLocator = <IServiceLocator><any>null;
const nullBinding = <IBinding><any>null;
const noFlags = BindingFlags.none;

const emptyScope = <IScope><any>null;

// General note for these tests: we're intentially duplicating some loops for better readability of the test output
// However, this does need to be cleaned up and moved into generic loopable fixture factories

// This is also a work in progress and needs to be generalized and cleaned up further
// so we can test more edge cases with less work


describe(`AccessThis`, () => {
  function createFixture(expr: AccessThis, availableAncestors: number = 1) {
    const bindingContext = {};
    const parentBindingContext = {};
    let scope: IScope;
    switch (availableAncestors) {
      case -1:
        scope = <any>{ bindingContext };
        break;
      case 0:
        scope = <any>createScopeForTest(bindingContext);
        break;
      case 1:
        scope = <any>createScopeForTest(bindingContext, parentBindingContext);
        break;
    }
    let expected: IScope;
    let throws: boolean = false;
    switch (availableAncestors) {
      case -2: // null scope
        throws = true
        break;
      case -1: // null bindingContext
        expected = <any>undefined;
        throws = expr.ancestor > 0;
        break;
      case 0: // null ancestor
        expected = <any>(expr.ancestor === 0 ? bindingContext : undefined);
        break;
      case 1:
        expected = <any>(expr.ancestor === 0 ? bindingContext : parentBindingContext);
        break;
    }
    return {
      flags: BindingFlags.none,
      scope: scope,
      locator: <IServiceLocator><any>null,
      binding: <IBinding><any>null,
      expected,
      throws
    };
  }

  for (const availableAncestors of [-2, -1, 0, 1]) {
    describe(`with an available ancestor level ${availableAncestors}`, () => {
      for (const { expr, text } of createAccessThisArr(1)) {
        const { flags, scope, locator, expected, throws } = createFixture(expr, availableAncestors);
        if (throws) {
          it(`${text}.evaluate() throws when the requested context (or scope) is undefined`, () => {
            expect(() => expr.evaluate(flags, scope, locator)).to.throw;
          });
        } else {
          it(`${text}.evaluate() returns the correct scope if it exists, otherwise undefined`, () => {
            const actual = expr.evaluate(flags, scope, locator);
            expect(actual).to.equal(expected);
          });
        }
      }
    });
  }

  for (const { expr, text } of createAccessThisArr(1)) {
    it(`${text}.connect() does not throw`, () => {
      const { flags, scope, binding } = createFixture(expr);
      expr.connect(flags, scope, binding);
    });
  }

  let $parent: AccessThis, $parent$parent: AccessThis, $parent$parent$parent: AccessThis;

  before(() => {
    $parent = new AccessThis(1);
    $parent$parent = new AccessThis(2);
    $parent$parent$parent = new AccessThis(3);
  });

  it('evaluates undefined bindingContext', () => {
    const coc = BindingContext.createOverride;

    let scope = { overrideContext: coc(undefined) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined)) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined))) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined, coc(undefined)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
  });

  it('evaluates null bindingContext', () => {
    const coc = BindingContext.createOverride;

    let scope = { overrideContext: coc(null) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null)) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, coc(null))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(null, coc(null, coc(null, coc(null)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.equal(null);
  });

  it('evaluates defined bindingContext', () => {
    const coc = BindingContext.createOverride;
    const a = { a: 'a' };
    const b = { b: 'b' };
    const c = { c: 'c' };
    const d = { d: 'd' };
    let scope = { overrideContext: coc(a) };
    expect($parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b)) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, coc(c))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(c);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.be.undefined;

    scope = { overrideContext: coc(a, coc(b, coc(c, coc(d)))) };
    expect($parent.evaluate(0, <any>scope, null)).to.equal(b);
    expect($parent$parent.evaluate(0, <any>scope, null)).to.equal(c);
    expect($parent$parent$parent.evaluate(0, <any>scope, null)).to.equal(d);
  });
});

describe(`AccessScope`, () => {
  function createFixture(expr: AccessScope, availableAncestors: number = 1, assign: boolean = false, hasOverride: boolean = true) {
    const foo = {};
    const parentFoo = {};
    const bindingContext = <any>{};
    const parentBindingContext = <any>{};
    const context = expr.ancestor > 0 ? parentBindingContext : bindingContext;
    if (!assign) {
      bindingContext.foo = foo;
      parentBindingContext.foo = parentFoo;
    }
    let scope: IScope;
    switch (availableAncestors) {
      case -1:
        scope = <any>{ bindingContext };
        break;
      case 0:
        scope = <any>(hasOverride ? createScopeForTest(bindingContext) : { bindingContext });
        break;
      case 1:
        scope = <any>(hasOverride ? createScopeForTest(bindingContext, parentBindingContext) : { bindingContext });
        break;
    }
    let expected: any;
    let value: any;
    let throws: boolean = false;
    switch (availableAncestors) {
      case -2: // null scope
        throws = true
        break;
      case -1: // null bindingContext
        throws = true;
        break;
      case 0: // null ancestor
        expected = expr.ancestor === 0 ? foo : undefined;
        value = expr.ancestor === 0 ? foo : parentFoo;
        throws = expr.ancestor > 0;
        break;
      case 1:
        expected = expr.ancestor === 0 ? foo : parentFoo;
        value = expr.ancestor === 0 ? foo : parentFoo;
        break;
    }
    const binding = <IBinding><any> {
      observeProperty: spy()
    };
    return {
      flags: BindingFlags.none,
      scope: scope,
      locator: <IServiceLocator><any>null,
      binding,
      expected,
      value,
      context,
      throws
    };
  }

  for (const availableAncestors of [-2, -1, 0, 1]) {
    describe(`with an available ancestor level ${availableAncestors}`, () => {
      for (const { expr, text } of createAccessScopeArr(1)) {
        const { flags, scope, locator, expected, throws } = createFixture(expr, availableAncestors);
        if (throws) {
          it(`${text}.evaluate() throws when the requested context (or scope) is undefined`, () => {
            expect(() => expr.evaluate(flags, scope, locator)).to.throw;
          });
        } else {
          it(`${text}.evaluate() returns the correct scope if it exists, otherwise undefined`, () => {
            const actual = expr.evaluate(flags, scope, locator);
            expect(actual).to.equal(expected);
          });
        }
      }

      for (const { expr, text } of createAccessScopeArr(1)) {
        const { flags, scope, locator, expected, value, throws } = createFixture(expr, availableAncestors, true);
        if (throws) {
          it(`${text}.assign() throws when the requested context (or scope) is undefined`, () => {
            expect(() => expr.assign(flags, scope, locator, value)).to.throw;
          });
        } else {
          it(`${text}.assign() returns the assigned value`, () => {
            const actual = expr.assign(flags, scope, locator, value);
            expect(actual).to.equal(expected);
            expect(actual).not.to.be.undefined;
          });
          it(`${text}.evaluate() after assign returns the assigned value`, () => {
            const actual = expr.evaluate(flags, scope, locator);
            expect(actual).to.equal(expected);
            expect(actual).not.to.be.undefined;
          });
        }
      }

      for (const { expr, text } of createAccessScopeArr(1)) {
        const { flags, scope, locator, expected, value, throws } = createFixture(expr, availableAncestors, true, false);
        if (!throws) {
          it(`${text}.assign() returns undefined when the overrideContext is undefined`, () => {
            const actual = expr.assign(flags, scope, locator, value);
            if (expr.ancestor > 0) {
              expect(actual).to.be.undefined;
            } else {
              expect(actual).to.equal(expected);
              expect(actual).not.to.be.undefined;
            }
          });
        }
      }

      for (const { expr, text } of createAccessScopeArr(1)) {
        const { flags, scope, binding, context, throws } = createFixture(expr, availableAncestors);
        if (throws) {
          it(`${text}.connect() throws when the requested context (or scope) is undefined`, () => {
            expect(() => expr.connect(flags, scope, binding)).to.throw;
          });
        } else {
          it(`${text}.connect() calls binding.observeProperty()`, () => {
            expr.connect(flags, scope, binding);
            expect(binding.observeProperty).to.have.been.calledOnce;
            expect(binding.observeProperty).to.have.been.calledWith(flags, context, 'foo');
          });
        }
      }
    });
  }

  let foo: AccessScope, $parentfoo: AccessScope, binding;

  before(() => {
    foo = new AccessScope('foo', 0);
    $parentfoo = new AccessScope('foo', 1);
    binding = { observeProperty: spy() };
  });

  it('evaluates undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
  });

  it('assigns undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext, 'foo');
  });

  it('evaluates null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
  });

  it('assigns null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext, 'foo');
  });

  it('evaluates defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('evaluates defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('assigns defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    foo.assign(0, scope, null, 'baz');
    expect(scope.bindingContext.foo).to.equal('baz');
  });

  it('assigns undefined property to bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    foo.assign(0, scope, null, 'baz');
    expect(scope.bindingContext.foo).to.equal('baz');
  });

  it('assigns defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.foo).to.equal('baz');
  });

  it('connects defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.bindingContext, 'foo');
  });

  it('connects defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext, 'foo');
  });

  it('connects undefined property on bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.bindingContext, 'foo');
  });

  it('evaluates defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect($parentfoo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('evaluates defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect($parentfoo.evaluate(0, scope, null)).to.equal('bar');
  });

  it('assigns defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.parentOverrideContext.bindingContext.foo).to.equal('baz');
    $parentfoo.assign(0, scope, null, 'beep');
    expect(scope.overrideContext.parentOverrideContext.bindingContext.foo).to.equal('beep');
  });

  it('assigns defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    foo.assign(0, scope, null, 'baz');
    expect(scope.overrideContext.parentOverrideContext.foo).to.equal('baz');
    $parentfoo.assign(0, scope, null, 'beep');
    expect(scope.overrideContext.parentOverrideContext.foo).to.equal('beep');
  });

  it('connects defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext.bindingContext, 'foo');
    (<any>binding.observeProperty).resetHistory();
    $parentfoo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext.bindingContext, 'foo');
  });

  it('connects defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext, 'foo');
    (<any>binding.observeProperty).resetHistory();
    $parentfoo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext, 'foo');
  });

  it('connects undefined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, {});
    scope.overrideContext.parentOverrideContext.parentOverrideContext = BindingContext.createOverride({ foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    $parentfoo.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext.bindingContext, 'foo');
  });
});

describe(`AccessMember`, () => {
  function createFixture(expr: AccessMember, assign: boolean = false, noObject: boolean = false) {
    const binding = <IBinding><any> {
      observeProperty: spy()
    };
    const value = {};
    let expected = value;
    let scope: IScope;
    let hasObject: boolean = true;
    let hasProperty: boolean = true;
    let barWrapper = noObject ? null : { bar: !assign && value || undefined };
    let observePropertyCalls: number = 0;
    switch (expr.object.$kind) {
      case ExpressionKind.AccessThis:
        observePropertyCalls = 1;
        scope = createScopeForTest(barWrapper);
        break;
      case ExpressionKind.AccessScope:
        observePropertyCalls = 2;
        scope = createScopeForTest({ foo: barWrapper });
        break;
      case ExpressionKind.ArrayLiteral:
      case ExpressionKind.ObjectLiteral:
      case ExpressionKind.Template:
        expected = assign ? value : undefined;
        hasProperty = false;
        break;
      case ExpressionKind.PrimitiveLiteral:
        hasProperty = false;
        expected = undefined;
        switch (expr.object['value']) {
          case null:
          case undefined:
            hasObject = false;
            break;
        }
        break;
      case ExpressionKind.CallScope:
        observePropertyCalls = 1;
        scope = createScopeForTest({ foo: function(){ return barWrapper } });
        break;
      case ExpressionKind.CallMember:
        observePropertyCalls = 2;
        scope = createScopeForTest({ foo: { foo: function(){ return barWrapper } } });
        break;
      case ExpressionKind.CallFunction:
        observePropertyCalls = 2;
        scope = createScopeForTest({ foo: function(){ return barWrapper } });
        break;
      case ExpressionKind.AccessMember:
        observePropertyCalls = 3;
        scope = createScopeForTest({ foo: { bar: barWrapper } });
        break;
      case ExpressionKind.AccessKeyed:
        observePropertyCalls = 4;
        scope = createScopeForTest({ foo: { ['[object Object]']: barWrapper } });
        break;
    }
    return {
      flags: BindingFlags.none,
      scope: scope,
      locator: <IServiceLocator><any>null,
      binding,
      expected,
      value,
      context: barWrapper,
      hasObject,
      hasProperty,
      observePropertyCalls
    };
  }

  for (const { expr, text } of createAccessMemberArr(getSimpleExpressionFactories())) {
    const { flags, scope, locator, expected } = createFixture(expr);
    it(`${text}.evaluate() returns ${expected}`, () => {
      const actual = expr.evaluate(flags, scope, locator);
      expect(actual).to.equal(expected);
    });
  }

  for (const { expr, text } of createAccessMemberArr(getSimpleExpressionFactories())) {
    const { flags, scope, locator, value, expected, hasProperty } = createFixture(expr, true);
    if (hasProperty) {
      it(`${text}.assign(${value}) returns ${expected}`, () => {
        const actual = expr.assign(flags, scope, locator, value);
        expect(actual).to.equal(expected);
      });
    } else {
      it(`${text}.assign(${value}) throws`, () => {
        expect(() => expr.assign(flags, scope, locator, value)).to.throw;
      });
    }
  }

  for (const { expr, text } of createAccessMemberArr(getSimpleExpressionFactories())) {
    const { flags, scope, locator, value } = createFixture(expr, true, true);
    it(`${text}.assign(${value}) where bar is null, throws`, () => {
      expect(() => expr.assign(flags, scope, locator, value)).to.throw;
    });
  }

  for (const { expr, text } of createAccessMemberArr(getSimpleExpressionFactories())) {
    const { flags, scope, hasProperty, binding, observePropertyCalls } = createFixture(expr);
    if (hasProperty) {
      it(`${text}.connect() calls binding.observerProperty() ${observePropertyCalls} times`, () => {
        expr.connect(flags, scope, binding);
        expect((<SinonSpy>binding.observeProperty).getCalls().length).to.equal(observePropertyCalls);
      });
    } else {
      it(`${text}.connect() throws`, () => {
        expect(() => expr.connect(flags, scope, binding)).to.throw;
      });
    }
  }

  let expression: AccessMember;

  before(() => {
    expression = new AccessMember(new AccessScope('foo', 0), 'bar');
  });

  it('evaluates member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('evaluates member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('assigns member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(0, scope, null, 'bang');
    expect(scope.bindingContext.foo.bar).to.equal('bang');
  });

  it('assigns member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(0, scope, null, 'bang');
    expect(scope.overrideContext.foo.bar).to.equal('bang');
  });

  it('returns the assigned value', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.assign(0, scope, null, 'bang')).to.equal('bang');
  });
});

describe(`AccessKeyed`, () => {
  const keys = [
    createPrimitiveLiteralArr,
    createSingleAccessScopeArr,
    createSingleAccessThisArr,
    createEmptyArrayLiteralArr,
    createEmptyObjectLiteralArr
  ];
  const objects = [
    createEmptyArrayLiteralArr,
    createEmptyObjectLiteralArr,
    createSingleAccessScopeArr,
    createLiteralNullArr
  ];
  function createFixture(expr: AccessKeyed, assign: boolean = false, noObject: boolean = false) {
    const binding = <IBinding><any> {
      observeProperty: spy()
    };
    const value = {};
    const foo = {};
    if (!assign) {
      foo['true'] = value;
      foo['false'] = value;
      foo['null'] = value;
      foo['undefined'] = value;
      foo['0'] = value;
      foo[''] = value;
      foo['foo'] = value;
      foo['[object Object]'] = value;
    }
    let expected = value;
    let scope: IScope = createScopeForTest({ foo });
    let hasObject: boolean = true;
    let hasProperty: boolean = true;
    let barWrapper = noObject ? null : { bar: !assign && value || undefined };
    let observePropertyCalls: number = 0;
    switch (expr.key.$kind) {
      case ExpressionKind.AccessScope:
        observePropertyCalls = 3;
      case ExpressionKind.AccessThis:
      case ExpressionKind.ArrayLiteral:
      case ExpressionKind.ObjectLiteral:
      case ExpressionKind.PrimitiveLiteral:
        observePropertyCalls = 2;
        break;
    }
    switch (expr.object.$kind) {
      case ExpressionKind.ArrayLiteral:
        expected = !assign ? undefined : value;
        if (expr.key.$kind !== ExpressionKind.AccessScope) {
          observePropertyCalls -= 1;
        }
        if (expr.key['value'] === 0) {
          observePropertyCalls = 0;
        }
        break;
      case ExpressionKind.ObjectLiteral:
        expected = !assign ? undefined : value;
        if (expr.key.$kind !== ExpressionKind.AccessScope) {
          observePropertyCalls -= 1;
        }
        break;
      case ExpressionKind.AccessScope:
        if (expr.key.$kind === ExpressionKind.AccessScope) {
          observePropertyCalls += 1;
        }
        break;
      case ExpressionKind.PrimitiveLiteral:
        if (expr.object['value'] === null || expr.object['value'] === undefined) {
          observePropertyCalls = 0;
          hasObject = false;
          expected = undefined;
        }
        break;
    }
    return {
      flags: BindingFlags.none,
      scope: scope,
      locator: <IServiceLocator><any>null,
      binding,
      expected,
      value,
      context: barWrapper,
      hasObject,
      hasProperty,
      observePropertyCalls
    };
  }

  for (const { expr, text } of createAccessKeyedArr(objects, keys)) {
    const { flags, scope, locator, expected } = createFixture(expr);
    it(`${text}.evaluate() returns ${expected}`, () => {
      const actual = expr.evaluate(flags, scope, locator);
      expect(actual).to.equal(expected);
    });
  }

  for (const { expr, text } of createAccessKeyedArr(objects, keys)) {
    const { flags, scope, locator, value, expected, hasObject } = createFixture(expr, true);
    if (hasObject) {
      it(`${text}.assign(${value}) returns ${expected}`, () => {
        const actual = expr.assign(flags, scope, locator, value);
        expect(actual).to.equal(expected);
      });
    } else {
      it(`${text}.assign(${value}) throws`, () => {
        expect(() => expr.assign(flags, scope, locator, value)).to.throw;
      });
    }
  }

  for (const { expr, text } of createAccessKeyedArr(objects, keys)) {
    const { flags, scope, hasProperty, binding, observePropertyCalls } = createFixture(expr);
    if (hasProperty) {
      it(`${text}.connect() calls binding.observerProperty() ${observePropertyCalls} times`, () => {
        expr.connect(flags, scope, binding);
        expect((<SinonSpy>binding.observeProperty).getCalls().length).to.equal(observePropertyCalls);
      });
    } else {
      it(`${text}.connect() throws`, () => {
        expect(() => expr.connect(flags, scope, binding)).to.throw;
      });
    }
  }

  let expression: AccessKeyed;

  before(() => {
    expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral('bar'));
  });

  it('evaluates member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('evaluates member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
  });

  it('assigns member on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(0, scope, null, 'bang');
    expect(scope.bindingContext.foo.bar).to.equal('bang');
  });

  it('assigns member on overrideContext', () => {
    const scope: any = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(0, scope, null, 'bang');
    expect(scope.overrideContext.foo.bar).to.equal('bang');
  });

  it('evaluates null/undefined object', () => {
    let scope: any = createScopeForTest({ foo: null });
    expect(expression.evaluate(0, scope, null)).to.be.undefined;
    scope = createScopeForTest({ foo: undefined });
    expect(expression.evaluate(0, scope, null)).to.be.undefined;
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.undefined;
  });

  it('does not observes property in keyed object access when key is number', () => {
    const scope: any = createScopeForTest({ foo: { '0': 'hello world' } });
    const expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral(0));
    expect(expression.evaluate(0, scope, null)).to.equal('hello world');
    const binding = { observeProperty: spy() };
    expression.connect(0, scope, <any>binding);
    expect(binding.observeProperty.getCalls()[0]).to.have.been.calledWith(0, scope.bindingContext, 'foo');
    expect(binding.observeProperty.getCalls()[1]).to.have.been.calledWith(0, scope.bindingContext.foo, 0);
    expect(binding.observeProperty.callCount).to.equal(2);
  });

  it('does not observe property in keyed array access when key is number', () => {
    const scope: any = createScopeForTest({ foo: ['hello world'] });
    const expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral(0));
    expect(expression.evaluate(0, scope, null)).to.equal('hello world');
    const binding = { observeProperty: spy() };
    expression.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.bindingContext, 'foo');
    expect(binding.observeProperty).not.to.have.been.calledWith(0, scope.bindingContext.foo, 0);
    expect(binding.observeProperty.callCount).to.equal(1);
  });
});



describe('CallScope', () => {
  let foo: CallScope;
  let hello: CallScope;
  let binding: { observeProperty: SinonSpy };

  before(() => {
    foo = new CallScope('foo', [], 0);
    hello = new CallScope('hello', [new AccessScope('arg', 0)], 0);
    binding = { observeProperty: spy() };
  });

  it('evaluates undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
    expect(hello.evaluate(0, scope, null)).to.be.undefined;
  });

  it('throws when mustEvaluate and evaluating undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    const mustEvaluate = true;
    expect(() => foo.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
    expect(() => hello.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
  });

  it('connects undefined bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext, 'arg');
  });

  it('evaluates null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    expect(foo.evaluate(0, scope, null)).to.be.undefined;
    expect(hello.evaluate(0, scope, null)).to.be.undefined;
  });

  it('throws when mustEvaluate and evaluating null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    const mustEvaluate = true;
    expect(() => foo.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
    expect(() => hello.evaluate(BindingFlags.mustEvaluate, scope, null)).to.throw();
  });

  it('connects null bindingContext', () => {
    const scope: any = { overrideContext: BindingContext.createOverride(null), bindingContext: null };
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext, 'arg');
  });

  it('evaluates defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: () => 'bar', hello: arg => arg, arg: 'world' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('evaluates defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: () => 'xyz' });
    scope.overrideContext.foo = () => 'bar';
    scope.overrideContext.hello = arg => arg;
    scope.overrideContext.arg = 'world';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('connects defined property on bindingContext', () => {
    const scope: any = createScopeForTest({ foo: 'bar' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.bindingContext, 'arg');
  });

  it('connects defined property on overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = () => 'bar';
    scope.overrideContext.hello = arg => arg;
    scope.overrideContext.arg = 'world';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext, 'arg');
  });

  it('connects undefined property on bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.bindingContext, 'arg');
  });

  it('evaluates defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('evaluates defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = () => 'bar';
    scope.overrideContext.parentOverrideContext.hello = arg => arg;
    scope.overrideContext.parentOverrideContext.arg = 'world';
    expect(foo.evaluate(0, scope, null)).to.equal('bar');
    expect(hello.evaluate(0, scope, null)).to.equal('world');
  });

  it('connects defined property on first ancestor bindingContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext.bindingContext, 'arg');
  });

  it('connects defined property on first ancestor overrideContext', () => {
    const scope: any = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = () => 'bar';
    scope.overrideContext.parentOverrideContext.hello = arg => arg;
    scope.overrideContext.parentOverrideContext.arg = 'world';
    (<any>binding.observeProperty).resetHistory();
    foo.connect(0, scope, <any>binding);
    expect(binding.observeProperty.callCount).to.equal(0);
    hello.connect(0, scope, <any>binding);
    expect(binding.observeProperty).to.have.been.calledWith(0, scope.overrideContext.parentOverrideContext, 'arg');
  });
});

describe('CallMember', () => {
  it('evaluates', () => {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    const bindingContext = { foo: { bar: () => 'baz' } };
    const scope: any = createScopeForTest(bindingContext);
    spy(bindingContext.foo, 'bar');
    expect(expression.evaluate(0, scope, null)).to.equal('baz');
    expect((<any>bindingContext.foo.bar).callCount).to.equal(1);
  });

  it('evaluate handles null/undefined member', () => {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    expect(expression.evaluate(0, createScopeForTest({ foo: {} }), null)).to.be.undefined;
    expect(expression.evaluate(0, createScopeForTest({ foo: { bar: undefined } }), null)).to.be.undefined;
    expect(expression.evaluate(0, createScopeForTest({ foo: { bar: null } }), null)).to.be.undefined;
  });

  it('evaluate throws when mustEvaluate and member is null or undefined', () => {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    const mustEvaluate = true;
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({}), null)).to.throw();
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({ foo: {} }), null)).to.throw();
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({ foo: { bar: undefined } }), null)).to.throw();
    expect(() => expression.evaluate(BindingFlags.mustEvaluate, createScopeForTest({ foo: { bar: null } }), null)).to.throw();
  });
});

describe('Assign', () => {
  it('can chain assignments', () => {
    const foo = new Assign(new AccessScope('foo', 0), new AccessScope('bar', 0));
    const scope: any = { overrideContext: BindingContext.createOverride(undefined) };
    foo.assign(0, scope, <any>null, <any>1);
    expect(scope.overrideContext.foo).to.equal(1);
    expect(scope.overrideContext.bar).to.equal(1);
  });
});

describe('Binary', () => {
  // Yes, this is a weird test with a fair bit of redundancy, but it does catch several potential issues and does this with little effort
  // It also allows us to see in the test logs exactly how everything turns out to behave, and apply corrections if need be
  function createFixture(op: any, left: any, right: any) {
    const expr = new Binary(op, left, right);
    const scope = createScopeForTest({ foo: { foo: {} } });
    const flags = BindingFlags.none;
    const locator = <IServiceLocator><any>null;
    const binding = <IBinding><any> {
      observeProperty: spy()
    };
    let willThrow = false;
    let expectedVal;
    let leftCalls = 1;
    let rightCalls = 1;
    const leftVal = left.evaluate(flags, scope, locator);
    const rightVal = right.evaluate(flags, scope, locator);
    switch(op) {
      case '&&':
        expectedVal = leftVal && rightVal;
        if (!leftVal) {
          rightCalls = 0;
        }
        break;
      case '||':
        expectedVal = leftVal || rightVal;
        if (!!leftVal) {
          rightCalls = 0;
        }
        break;
      case '+':
        expectedVal = leftVal + rightVal;
        break;
      case '-':
        expectedVal = leftVal - rightVal;
        break;
      case '*':
        expectedVal = leftVal * rightVal;
        break;
      case '/':
        expectedVal = leftVal / rightVal;
        break;
      case '%':
        expectedVal = leftVal % rightVal;
        break;
      case '==':
        expectedVal = leftVal == rightVal;
        break;
      case '===':
        expectedVal = leftVal === rightVal;
        break;
      case '!=':
        expectedVal = leftVal != rightVal;
        break;
      case '!==':
        expectedVal = leftVal !== rightVal;
        break;
      case '<':
        expectedVal = leftVal < rightVal;
        break;
      case '>':
        expectedVal = leftVal > rightVal;
        break;
      case '<=':
        expectedVal = leftVal <= rightVal;
        break;
      case '>=':
        expectedVal = leftVal >= rightVal;
        break;
      case 'in':
        if (rightVal === null || typeof rightVal !== 'object') {
          expectedVal = false;
          leftCalls = 0;
        } else {
          expectedVal = leftVal in rightVal;
        }
        break;
      case 'instanceof':
        expectedVal = false;
        leftCalls = 0;
        break;
    }
    return {
      flags,
      scope,
      locator,
      binding,
      expectedVal,
      leftCalls,
      rightCalls,
      willThrow,
      expr
    };
  }

  const ops = [
    '&&',
    '||',
    '==',
    '===',
    '!=',
    '!==',
    '+',
    '-',
    '*',
    '/',
    '%',
    '<',
    '>',
    '<=',
    '>=',
    'in',
    'instanceof'
  ];

  for (const op of ops) {
    describe(op, () => {
      const factories = [
        createPrimitiveLiteralArr,
        createSingleAccessScopeArr,
        createEmptyObjectLiteralArr
      ];
      // this is a bit hacky, but what we're doing here is ensuring that we have unique instances of left + right for each pair
      // in order to prevent certain issues that would arise from reusing the same "left" for all "right"s per pair
      const count = factories.reduce((acc, cur) => acc += cur().length, 0);
      const leftArrs = [];
      const rightArrAll = [];
      const pairs = [];
      for (let i = 0; i < count; ++i) {
        const leftArr = [];
        for (const factory of factories) {
          for (const obj of factory()) {
            leftArr.push(obj);
          }
          for (const obj of factory()) {
            rightArrAll.push(obj);
          }
        }
        leftArrs.push(leftArr);
      }
      const leftArrAll = [];
      for (let i = 0; i < count; ++i) {
        for (const leftArr of leftArrs) {
          leftArrAll.push(leftArr.pop());
        }
      }
      const allCount = count * count;
      for (let i = 0; i < allCount; ++i) {
        pairs.push({left: leftArrAll.pop(), right: rightArrAll.pop()});
      }

      for (const {
        left: { expr: lExpr, text: lText },
        right: { expr: rExpr, text: rText }
      } of pairs) {
        const { expr, flags, scope, locator, expectedVal, leftCalls, rightCalls } = createFixture(op, lExpr, rExpr);
        const callsMsg = rightCalls === 0 ?
          'calls left only     ' : leftCalls === 0 ?
          'calls right only    ' :
          'calls left AND right';
        it(`${padRight(lText.trim(), 9)} ${padRight(op, 10)} ${padRight(rText.trim(), 9)} ${callsMsg};  returns ${JSON.stringify(expectedVal)}`, () => {
          const leftSpy = spy(lExpr, 'evaluate');
          const rightSpy = spy(rExpr, 'evaluate');

          const actual = expr.evaluate(flags, scope, locator);
          if (typeof expectedVal === 'number' && isNaN(expectedVal)) {
            expect(actual).to.be.NaN;
          } else {
            expect(actual).to.equal(expectedVal);
          }
          expect(leftSpy.getCalls().length).to.equal(leftCalls);
          expect(rightSpy.getCalls().length).to.equal(rightCalls);
        });
      }
    });
  }


  it('concats strings', () => {
    let expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral('b'));
    let scope: any = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('ab');

    expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral(null));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('anull');

    expression = new Binary('+', new PrimitiveLiteral(null), new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('nullb');

    expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral(undefined));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('aundefined');

    expression = new Binary('+', new PrimitiveLiteral(undefined), new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal('undefinedb');
  });

  it('adds numbers', () => {
    let expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(2));
    let scope: any = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(3);

    expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(null));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(1);

    expression = new Binary('+', new PrimitiveLiteral(null), new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.equal(2);

    expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(undefined));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.NaN;

    expression = new Binary('+', new PrimitiveLiteral(undefined), new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(0, scope, null)).to.be.NaN;
  });

  describe('performs \'in\'', () => {
    const tests = [
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['foo'], [new PrimitiveLiteral(null)])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['bar'], [new PrimitiveLiteral(null)])), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral(1), new ObjectLiteral(['1'], [new PrimitiveLiteral(null)])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('1'), new ObjectLiteral(['1'], [new PrimitiveLiteral(null)])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new PrimitiveLiteral(null)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new PrimitiveLiteral(undefined)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new PrimitiveLiteral(true)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessThis(0)), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessThis(0)), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessThis(1)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessThis(1)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessScope('bar', 0)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessScope('foo', 0)), expected: true }
    ];
    const scope: any = createScopeForTest({ foo: { bar: null }, bar: null });

    for (const { expr, expected } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.equal(expected);
      });
    }
  });

  describe('performs \'instanceof\'', () => {
    class Foo {}
    class Bar extends Foo {}
    const tests = [
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('foo', 0),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('foo', 0),
          new AccessMember(new AccessScope('bar', 0), 'constructor')
        ),
        expected: false
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('bar', 0),
          new AccessMember(new AccessScope('bar', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('bar', 0),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new PrimitiveLiteral('foo'),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: false
      },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new PrimitiveLiteral(null)), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new PrimitiveLiteral(undefined)), expected: false },
      { expr: new Binary('instanceof', new PrimitiveLiteral(null), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', new PrimitiveLiteral(undefined), new AccessScope('foo', 0)), expected: false }
    ];
    const scope: any = createScopeForTest({ foo: new Foo(), bar: new Bar() });

    for (const { expr, expected } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.equal(expected);
      });
    }
  });
});

class Test {
  public value: string;
  constructor() {
    this.value = 'foo';
  }

  public makeString = (cooked: string[], a: any, b: any): string => {
    return cooked[0] + a + cooked[1] + b + cooked[2] + this.value;
  };
}

describe('LiteralTemplate', () => {
  const tests = [
    { expr: new Template(['']), expected: '', ctx: {} },
    { expr: new Template(['foo']), expected: 'foo', ctx: {} },
    { expr: new Template(['foo', 'baz'], [new PrimitiveLiteral('bar')]), expected: 'foobarbaz', ctx: {} },
    {
      expr: new Template(
        ['a', 'c', 'e', 'g'],
        [new PrimitiveLiteral('b'), new PrimitiveLiteral('d'), new PrimitiveLiteral('f')]
      ),
      expected: 'abcdefg',
      ctx: {}
    },
    {
      expr: new Template(['a', 'c', 'e'], [new AccessScope('b', 0), new AccessScope('d', 0)]),
      expected: 'a1c2e',
      ctx: { b: 1, d: 2 }
    },
    { expr: new TaggedTemplate(
      [''], [],
      new AccessScope('foo', 0)),
      expected: 'foo',
      ctx: { foo: () => 'foo' } },
    {
      expr: new TaggedTemplate(
        ['foo'], ['bar'],
        new AccessScope('baz', 0)),
      expected: 'foobar',
      ctx: { baz: cooked => cooked[0] + cooked.raw[0] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2'], [],
        new AccessScope('makeString', 0),
        [new PrimitiveLiteral('foo')]),
      expected: '1foo2',
      ctx: { makeString: (cooked, foo) => cooked[0] + foo + cooked[1] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2'], [],
        new AccessScope('makeString', 0),
        [new AccessScope('foo', 0)]),
      expected: '1bar2',
      ctx: { foo: 'bar', makeString: (cooked, foo) => cooked[0] + foo + cooked[1] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessScope('makeString', 0),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: 'bazqux',
      ctx: { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => foo + bar }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessMember(new AccessScope('test', 0), 'makeString'),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: '1baz2qux3foo',
      ctx: { foo: 'baz', bar: 'qux', test: new Test() }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessKeyed(new AccessScope('test', 0), new PrimitiveLiteral('makeString')),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: '1baz2qux3foo',
      ctx: { foo: 'baz', bar: 'qux', test: new Test() }
    }
  ];
  for (const { expr, expected, ctx } of tests) {
    it(`evaluates ${expected}`, () => {
      const scope: any = createScopeForTest(ctx);
      expect(expr.evaluate(0, scope, null)).to.equal(expected);
    });
  }
});

describe('Unary', () => {
  describe('performs \'typeof\'', () => {
    const tests = [
      { expr: new Unary('typeof', new PrimitiveLiteral('foo')), expected: 'string' },
      { expr: new Unary('typeof', new PrimitiveLiteral(1)), expected: 'number' },
      { expr: new Unary('typeof', new PrimitiveLiteral(null)), expected: 'object' },
      { expr: new Unary('typeof', new PrimitiveLiteral(undefined)), expected: 'undefined' },
      { expr: new Unary('typeof', new PrimitiveLiteral(true)), expected: 'boolean' },
      { expr: new Unary('typeof', new PrimitiveLiteral(false)), expected: 'boolean' },
      { expr: new Unary('typeof', new ArrayLiteral([])), expected: 'object' },
      { expr: new Unary('typeof', new ObjectLiteral([], [])), expected: 'object' },
      { expr: new Unary('typeof', new AccessThis(0)), expected: 'object' },
      { expr: new Unary('typeof', new AccessThis(1)), expected: 'undefined' },
      { expr: new Unary('typeof', new AccessScope('foo', 0)), expected: 'undefined' }
    ];
    const scope: any = createScopeForTest({});

    for (const { expr, expected } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.equal(expected);
      });
    }
  });

  describe('performs \'void\'', () => {
    const tests = [
      { expr: new Unary('void', new PrimitiveLiteral('foo')) },
      { expr: new Unary('void', new PrimitiveLiteral(1)) },
      { expr: new Unary('void', new PrimitiveLiteral(null)) },
      { expr: new Unary('void', new PrimitiveLiteral(undefined)) },
      { expr: new Unary('void', new PrimitiveLiteral(true)) },
      { expr: new Unary('void', new PrimitiveLiteral(false)) },
      { expr: new Unary('void', new ArrayLiteral([])) },
      { expr: new Unary('void', new ObjectLiteral([], [])) },
      { expr: new Unary('void', new AccessThis(0)) },
      { expr: new Unary('void', new AccessThis(1)) },
      { expr: new Unary('void', new AccessScope('foo', 0)) }
    ];
    let scope: any = createScopeForTest({});

    for (const { expr } of tests) {
      it(expr.toString(), () => {
        expect(expr.evaluate(0, scope, null)).to.be.undefined;
      });
    }

    it('void foo()', () => {
      let fooCalled = false;
      const foo = () => (fooCalled = true);
      scope = createScopeForTest({ foo });
      const expr = new Unary('void', new CallScope('foo', [], 0));
      expect(expr.evaluate(0, scope, null)).to.be.undefined;
      expect(fooCalled).to.equal(true);
    });
  });
});


describe(`PrimitiveLiteral`, () => {
  function createFixture(expr: PrimitiveLiteral) {
    return {
      flags: BindingFlags.none,
      scope: <IScope><any>null,
      locator: <IServiceLocator><any>null,
      binding: <IBinding><any>null,
      expected: expr.value
    };
  }

  for (const { expr, text } of createPrimitiveLiteralArr()) {
    it(`${text}.evaluate() returns ${text.trim()}`, () => {
      const { flags, scope, locator, expected } = createFixture(expr);
      const actual = expr.evaluate(flags, scope, locator);
      expect(actual).to.equal(expected);
    });
  }

  for (const { expr, text } of createPrimitiveLiteralArr()) {
    it(`${text}.connect() does not throw`, () => {
      const { flags, scope, binding } = createFixture(expr);
      expr.connect(flags, scope, binding);
    });
  }
});
