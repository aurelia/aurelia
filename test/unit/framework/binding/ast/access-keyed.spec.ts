import { AccessKeyed, AccessScope, LiteralString, LiteralPrimitive } from '../../../../../src/framework/binding/ast';
import { createScopeForTest } from '../../../../../src/framework/binding/scope';

describe('AccessKeyed', () => {
  let expression;

  beforeAll(() => {
    expression = new AccessKeyed(new AccessScope('foo', 0), new LiteralString('bar'));
  });

  it('evaluates member on bindingContext', () => {
    let scope = createScopeForTest({ foo: { bar: 'baz' } });
    expect(expression.evaluate(scope, null)).toBe('baz');
  });

  it('evaluates member on overrideContext', () => {
    let scope = createScopeForTest({});
    (scope.overrideContext as any).foo = { bar: 'baz' };
    expect(expression.evaluate(scope, null)).toBe('baz');
  });

  it('assigns member on bindingContext', () => {
    let scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(scope, 'bang');
    expect(scope.bindingContext.foo.bar).toBe('bang');
  });

  it('assigns member on overrideContext', () => {
    let scope = createScopeForTest({});
    (scope.overrideContext as any).foo = { bar: 'baz' };
    expression.assign(scope, 'bang');
    expect((scope.overrideContext as any).foo.bar).toBe('bang');
  });

  it('evaluates null/undefined object', () => {
    let scope = createScopeForTest({ foo: null });
    expect(expression.evaluate(scope, null)).toBe(undefined);
    scope = createScopeForTest({ foo: undefined });
    expect(expression.evaluate(scope, null)).toBe(undefined);
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe(undefined);
  });

  it('does not observes property in keyed object access when key is number', () => {
    let scope = createScopeForTest({ foo: { '0': 'hello world' } });
    let expression = new AccessKeyed(new AccessScope('foo', 0), new LiteralPrimitive(0));
    expect(expression.evaluate(scope, null)).toBe('hello world');
    let binding = { observeProperty: jasmine.createSpy('observeProperty') };
    expression.connect(binding as any, scope);
    expect(binding.observeProperty.calls.argsFor(0)).toEqual([scope.bindingContext, 'foo']);
    expect(binding.observeProperty.calls.argsFor(1)).toEqual([scope.bindingContext.foo, 0]);
    expect(binding.observeProperty.calls.count()).toBe(2);
  });

  it('does not observe property in keyed array access when key is number', () => {
    let scope = createScopeForTest({ foo: ['hello world'] });
    let expression = new AccessKeyed(new AccessScope('foo', 0), new LiteralPrimitive(0));
    expect(expression.evaluate(scope, null)).toBe('hello world');
    let binding = { observeProperty: jasmine.createSpy('observeProperty') };
    expression.connect(binding as any, scope);
    expect(binding.observeProperty.calls.argsFor(0)).toEqual([scope.bindingContext, 'foo']);
    expect(binding.observeProperty).not.toHaveBeenCalledWith(scope.bindingContext.foo, 0);
    expect(binding.observeProperty.calls.count()).toBe(1);
  });
});
