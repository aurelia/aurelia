import { Binary, LiteralString, LiteralPrimitive } from '../../../../../src/framework/binding/ast';
import { createScopeForTest } from '../../../../../src/framework/binding/scope';

describe('Binary', () => {
  it('concats strings', () => {
    let expression = new Binary('+', new LiteralString('a'), new LiteralString('b'));
    let scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe('ab');

    expression = new Binary('+', new LiteralString('a'), new LiteralPrimitive(null));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe('a');

    expression = new Binary('+', new LiteralPrimitive(null), new LiteralString('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe('b');

    expression = new Binary('+', new LiteralString('a'), new LiteralPrimitive(undefined));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe('a');

    expression = new Binary('+', new LiteralPrimitive(undefined), new LiteralString('b'));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe('b');
  });

  it('adds numbers', () => {
    let expression = new Binary('+', new LiteralPrimitive(1), new LiteralPrimitive(2));
    let scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe(3);

    expression = new Binary('+', new LiteralPrimitive(1), new LiteralPrimitive(null));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe(1);

    expression = new Binary('+', new LiteralPrimitive(null), new LiteralPrimitive(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe(2);

    expression = new Binary('+', new LiteralPrimitive(1), new LiteralPrimitive(undefined));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe(1);

    expression = new Binary('+', new LiteralPrimitive(undefined), new LiteralPrimitive(2));
    scope = createScopeForTest({});
    expect(expression.evaluate(scope, null)).toBe(2);
  });
});
