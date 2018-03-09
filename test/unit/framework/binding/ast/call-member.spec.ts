import { CallMember, AccessScope } from '../../../../../src/framework/binding/ast';
import { createScopeForTest } from '../../../../../src/framework/binding/scope';

describe('CallMember', () => {
  it('evaluates', () => {
    let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    let bindingContext = { foo: { bar: () => 'baz' } };
    let scope = createScopeForTest(bindingContext);
    spyOn(bindingContext.foo, 'bar').and.callThrough();
    expect(expression.evaluate(scope, null, undefined)).toBe('baz');
    expect(bindingContext.foo.bar).toHaveBeenCalled();
  });

  it('evaluate handles null/undefined member', () => {
    let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    expect(expression.evaluate(createScopeForTest({ foo: {} }), null, undefined)).toEqual(undefined);
    expect(expression.evaluate(createScopeForTest({ foo: { bar: undefined } }), null, undefined)).toEqual(undefined);
    expect(expression.evaluate(createScopeForTest({ foo: { bar: null } }), null, undefined)).toEqual(undefined);
  });

  it('evaluate throws when mustEvaluate and member is null or undefined', () => {
    let expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    let mustEvaluate = true;
    expect(() => expression.evaluate(createScopeForTest({}), null, mustEvaluate)).toThrow();
    expect(() => expression.evaluate(createScopeForTest({ foo: {} }), null, mustEvaluate)).toThrow();
    expect(() => expression.evaluate(createScopeForTest({ foo: { bar: undefined } }), null, mustEvaluate)).toThrow();
    expect(() => expression.evaluate(createScopeForTest({ foo: { bar: null } }), null, mustEvaluate)).toThrow();
  });
});
