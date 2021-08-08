/* eslint-disable mocha/no-hooks,mocha/no-sibling-hooks */
import {
  IExpressionParser,
  ExpressionType,
  Interpolation,
  PrimitiveLiteralExpression,
  UnaryExpression,
  BinaryExpression,
  ConditionalExpression,
  ValueConverterExpression,
  BindingBehaviorExpression,
  AccessScopeExpression,
  AccessMemberExpression,
  AccessKeyedExpression,
  AccessThisExpression,
  ForOfStatement,
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  CallFunctionExpression,
  CallScopeExpression,
  CallMemberExpression,
  TemplateExpression,
  TaggedTemplateExpression,
  AssignExpression,
  AnyBindingExpression,
} from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { Deserializer, Serializer } from '@aurelia/validation';

describe('validation/expression-serialization.spec.ts/expression-de/serialization', function () {
  function setup() {
    const ctx = TestContext.create();
    return ctx.container.get(IExpressionParser);
  }
  const list: { name: string, strExpr: string; expressionType: ExpressionType; exprType: any }[] = [
    { name: 'interpolation', strExpr: '${prop} static', expressionType: ExpressionType.Interpolation, exprType: Interpolation },
    { name: 'multi-interpolation', strExpr: '${prop1} static ${prop2}', expressionType: ExpressionType.Interpolation, exprType: Interpolation },
    { name: 'primitive literal (number)', strExpr: '1', expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (string-1)', strExpr: '"hello"', expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (string-2)', strExpr: '\'shouldn\\\'t fail\'', expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (string-3)', strExpr: "\"shouldn't fail\"", expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (boolean)', strExpr: 'true', expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (null)', strExpr: 'null', expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (undefined)', strExpr: 'undefined', expressionType: ExpressionType.None, exprType: PrimitiveLiteralExpression },
    { name: 'unary (void)', strExpr: 'void 0', expressionType: ExpressionType.None, exprType: UnaryExpression },
    { name: 'unary (typeof)', strExpr: 'typeof 0', expressionType: ExpressionType.None, exprType: UnaryExpression },
    { name: 'unary (!)', strExpr: '!true', expressionType: ExpressionType.None, exprType: UnaryExpression },
    { name: 'unary (-)', strExpr: '-1', expressionType: ExpressionType.None, exprType: UnaryExpression },
    { name: 'unary (+)', strExpr: '+1', expressionType: ExpressionType.None, exprType: UnaryExpression },
    { name: 'binary (&&)', strExpr: 'true && true', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (||)', strExpr: 'true || true', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (==)', strExpr: 'true == true', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (===)', strExpr: 'true === true', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (!=)', strExpr: 'true != true', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (!==)', strExpr: 'true !== true', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (instanceof)', strExpr: 'instance instanceof Type', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (in)', strExpr: 'prop in obj', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (+)', strExpr: '1 + 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (-)', strExpr: '1 - 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (*)', strExpr: '1 * 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (/)', strExpr: '1 / 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (%)', strExpr: '1 % 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (<)', strExpr: '1 < 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (>)', strExpr: '1 > 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (%)', strExpr: '1 % 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (<=)', strExpr: '1 <= 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'binary (>=)', strExpr: '1 >= 1', expressionType: ExpressionType.None, exprType: BinaryExpression },
    { name: 'conditional', strExpr: 'condition ? yes : no', expressionType: ExpressionType.None, exprType: ConditionalExpression },
    { name: 'value converter', strExpr: 'value | vc', expressionType: ExpressionType.None, exprType: ValueConverterExpression },
    { name: 'binding behavior', strExpr: 'value & bb', expressionType: ExpressionType.None, exprType: BindingBehaviorExpression },
    { name: 'binding behavior with value converter', strExpr: 'value | vc & bb', expressionType: ExpressionType.None, exprType: BindingBehaviorExpression },
    { name: 'access scope', strExpr: 'value', expressionType: ExpressionType.None, exprType: AccessScopeExpression },
    { name: 'access member', strExpr: 'value.prop', expressionType: ExpressionType.None, exprType: AccessMemberExpression },
    { name: 'access keyed (string)', strExpr: 'value.prop["a"]', expressionType: ExpressionType.None, exprType: AccessKeyedExpression },
    { name: 'access keyed (number)', strExpr: 'value.prop[0]', expressionType: ExpressionType.None, exprType: AccessKeyedExpression },
    { name: 'access this', strExpr: '$this', expressionType: ExpressionType.None, exprType: AccessThisExpression },
    { name: 'array literal', strExpr: '[0]', expressionType: ExpressionType.None, exprType: ArrayLiteralExpression },
    { name: 'object literal', strExpr: '{}', expressionType: ExpressionType.None, exprType: ObjectLiteralExpression },
    { name: 'call scope', strExpr: 'fn()', expressionType: ExpressionType.None, exprType: CallScopeExpression },
    { name: 'call member', strExpr: 'obj.fn()', expressionType: ExpressionType.None, exprType: CallMemberExpression },
    { name: 'call function', strExpr: '$this()', expressionType: ExpressionType.None, exprType: CallFunctionExpression },
    { name: 'template', strExpr: '``', expressionType: ExpressionType.None, exprType: TemplateExpression },
    { name: 'assign', strExpr: 'a=b', expressionType: ExpressionType.None, exprType: AssignExpression },
    { name: '"for of" with simple binding identifier', strExpr: 'item of items', expressionType: ExpressionType.IsIterator, exprType: ForOfStatement },
    { name: '"for of" with vc', strExpr: 'item of items | vc', expressionType: ExpressionType.IsIterator, exprType: ForOfStatement },
    { name: '"for of" with bb', strExpr: 'item of items & bb', expressionType: ExpressionType.IsIterator, exprType: ForOfStatement },
    { name: '"for of" with object binding pattern (destructuring)', strExpr: '{a,b} of items & bb', expressionType: ExpressionType.IsIterator, exprType: ForOfStatement },
    { name: '"for of" with array binding pattern (destructuring)', strExpr: '[a,b] of items & bb', expressionType: ExpressionType.IsIterator, exprType: ForOfStatement },
  ];

  for (const { strExpr, expressionType, exprType, name } of list) {
    it(`works for ${name} expression`, function () {
      const parser = setup();
      const expr = parser.parse(strExpr, expressionType);
      assert.instanceOf(expr, exprType);
      const serialized = Serializer.serialize(expr);
      // console.log(`serialized: ${serialized}`);
      const deserialized = Deserializer.deserialize(serialized);
      assert.instanceOf(deserialized, exprType);
      assert.deepStrictEqual(deserialized, expr);
    });
  }

  it(`works for for of with binding identifier expression`, function () {
    const exprType = TaggedTemplateExpression;
    const parser = setup();
    const expr: TaggedTemplateExpression = parser.parse('a`static${prop}`', ExpressionType.None) as TaggedTemplateExpression;
    assert.instanceOf(expr, exprType);
    const serialized = Serializer.serialize(expr);
    const deserialized: TaggedTemplateExpression = Deserializer.deserialize(serialized) as TaggedTemplateExpression;
    assert.instanceOf(deserialized, exprType);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(deserialized.cooked.raw)), JSON.parse(JSON.stringify(deserialized.cooked.raw)));
    assert.deepStrictEqual(deserialized.func, expr.func);
    assert.deepStrictEqual(deserialized.expressions, expr.expressions);
  });
});
