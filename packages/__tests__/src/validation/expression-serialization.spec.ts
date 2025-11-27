import {
  type ExpressionType,
  ExpressionParser,
} from '@aurelia/expression-parser';
import { TestContext, assert } from '@aurelia/testing';
import { Deserializer, Serializer } from '@aurelia/validation';

describe('validation/expression-serialization.spec.ts', function () {
  function createParser() {
    const ctx = TestContext.create();
    return ctx.container.get(ExpressionParser);
  }
  const list: { name: string; strExpr: string; expressionType: ExpressionType; expectedKind: string }[] = [
    { name: 'interpolation', strExpr: '${prop} static', expressionType: 'Interpolation', expectedKind: 'Interpolation' },
    { name: 'multi-interpolation', strExpr: '${prop1} static ${prop2}', expressionType: 'Interpolation', expectedKind: 'Interpolation' },
    { name: 'primitive literal (number)', strExpr: '1', expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'primitive literal (string-1)', strExpr: '"hello"', expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'primitive literal (string-2)', strExpr: '\'shouldn\\\'t fail\'', expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'primitive literal (string-3)', strExpr: "\"shouldn't fail\"", expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'primitive literal (boolean)', strExpr: 'true', expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'primitive literal (null)', strExpr: 'null', expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'primitive literal (undefined)', strExpr: 'undefined', expressionType: 'None', expectedKind: 'PrimitiveLiteral' },
    { name: 'unary (void)', strExpr: 'void 0', expressionType: 'None', expectedKind: 'Unary' },
    { name: 'unary (typeof)', strExpr: 'typeof 0', expressionType: 'None', expectedKind: 'Unary' },
    { name: 'unary (!)', strExpr: '!true', expressionType: 'None', expectedKind: 'Unary' },
    { name: 'unary (-)', strExpr: '-1', expressionType: 'None', expectedKind: 'Unary' },
    { name: 'unary (+)', strExpr: '+1', expressionType: 'None', expectedKind: 'Unary' },
    { name: 'binary (&&)', strExpr: 'true && true', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (||)', strExpr: 'true || true', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (==)', strExpr: 'true == true', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (===)', strExpr: 'true === true', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (!=)', strExpr: 'true != true', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (!==)', strExpr: 'true !== true', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (instanceof)', strExpr: 'instance instanceof Type', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (in)', strExpr: 'prop in obj', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (+)', strExpr: '1 + 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (-)', strExpr: '1 - 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (*)', strExpr: '1 * 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (/)', strExpr: '1 / 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (%)', strExpr: '1 % 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (<)', strExpr: '1 < 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (>)', strExpr: '1 > 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (%)', strExpr: '1 % 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (<=)', strExpr: '1 <= 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'binary (>=)', strExpr: '1 >= 1', expressionType: 'None', expectedKind: 'Binary' },
    { name: 'conditional', strExpr: 'condition ? yes : no', expressionType: 'None', expectedKind: 'Conditional' },
    { name: 'value converter', strExpr: 'value | vc', expressionType: 'None', expectedKind: 'ValueConverter' },
    { name: 'binding behavior', strExpr: 'value & bb', expressionType: 'None', expectedKind: 'BindingBehavior' },
    { name: 'binding behavior with value converter', strExpr: 'value | vc & bb', expressionType: 'None', expectedKind: 'BindingBehavior' },
    { name: 'access scope', strExpr: 'value', expressionType: 'None', expectedKind: 'AccessScope' },
    { name: 'access member', strExpr: 'value.prop', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'access keyed (string)', strExpr: 'value.prop["a"]', expressionType: 'None', expectedKind: 'AccessKeyed' },
    { name: 'access keyed (number)', strExpr: 'value.prop[0]', expressionType: 'None', expectedKind: 'AccessKeyed' },
    { name: 'access this', strExpr: '$this', expressionType: 'None', expectedKind: 'AccessThis' },
    { name: 'access boundary', strExpr: 'this', expressionType: 'None', expectedKind: 'AccessBoundary' },
    { name: 'array literal', strExpr: '[0]', expressionType: 'None', expectedKind: 'ArrayLiteral' },
    { name: 'object literal', strExpr: '{}', expressionType: 'None', expectedKind: 'ObjectLiteral' },
    { name: 'call scope', strExpr: 'fn()', expressionType: 'None', expectedKind: 'CallScope' },
    { name: 'call member', strExpr: 'obj.fn()', expressionType: 'None', expectedKind: 'CallMember' },
    { name: 'call function', strExpr: '$this()', expressionType: 'None', expectedKind: 'CallFunction' },
    { name: 'template', strExpr: '``', expressionType: 'None', expectedKind: 'Template' },
    { name: 'assign', strExpr: 'a=b', expressionType: 'None', expectedKind: 'Assign' },
    { name: '"for of" with simple binding identifier', strExpr: 'item of items', expressionType: 'IsIterator', expectedKind: 'ForOfStatement' },
    { name: '"for of" with vc', strExpr: 'item of items | vc', expressionType: 'IsIterator', expectedKind: 'ForOfStatement' },
    { name: '"for of" with bb', strExpr: 'item of items & bb', expressionType: 'IsIterator', expectedKind: 'ForOfStatement' },
    { name: '"for of" with object binding pattern (destructuring)', strExpr: '{a,b} of items & bb', expressionType: 'IsIterator', expectedKind: 'ForOfStatement' },
    { name: '"for of" with array binding pattern (destructuring)', strExpr: '[a,b] of items & bb', expressionType: 'IsIterator', expectedKind: 'ForOfStatement' },
  ];

  for (const { strExpr, expressionType, expectedKind, name } of list) {
    it(`works for ${name} expression`, function () {
      const parser = createParser();
      const expr = parser.parse(strExpr, expressionType);
      assert.equal((expr as any).$kind, expectedKind);
      const serialized = Serializer.serialize(expr);
      const deserialized = Deserializer.deserialize(serialized);
      assert.equal((deserialized as any).$kind, expectedKind);
      assert.deepStrictEqual(deserialized, expr);
    });
  }

  it(`works for for of with binding identifier expression`, function () {
    const parser = createParser();
    const expr = parser.parse('a`static${prop}`', 'None');
    assert.equal((expr as any).$kind, 'TaggedTemplate');
    const serialized = Serializer.serialize(expr);
    const deserialized = Deserializer.deserialize(serialized);
    assert.equal((deserialized as any).$kind, 'TaggedTemplate');
    assert.deepStrictEqual(JSON.parse(JSON.stringify((deserialized as any).cooked.raw)), JSON.parse(JSON.stringify((deserialized as any).cooked.raw)));
    assert.deepStrictEqual((deserialized as any).func, (expr as any).func);
    assert.deepStrictEqual((deserialized as any).expressions, (expr as any).expressions);
  });
});
