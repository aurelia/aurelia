/* eslint-disable mocha/no-hooks,mocha/no-sibling-hooks */
import {
  IExpressionParser,
  BindingType,
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
  AssignExpression
} from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { Deserializer, Serializer } from '@aurelia/validation';

describe('validation/expression-serialization.spec.ts/expression-de/serialization', function () {
  function setup() {
    const ctx = TestContext.create();
    return ctx.container.get(IExpressionParser);
  }
  const list = [
    { name: 'interpolation', strExpr: '${prop} static', bindingType: BindingType.Interpolation, exprType: Interpolation },
    { name: 'multi-interpolation', strExpr: '${prop1} static ${prop2}', bindingType: BindingType.Interpolation, exprType: Interpolation },
    { name: 'primitive literal (number)', strExpr: '1', bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (string-1)', strExpr: '"hello"', bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (string-2)', strExpr: '\'shouldn\\\'t fail\'', bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (string-3)', strExpr: "\"shouldn't fail\"", bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (boolean)', strExpr: 'true', bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (null)', strExpr: 'null', bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'primitive literal (undefined)', strExpr: 'undefined', bindingType: BindingType.None, exprType: PrimitiveLiteralExpression },
    { name: 'unary (void)', strExpr: 'void 0', bindingType: BindingType.None, exprType: UnaryExpression },
    { name: 'unary (typeof)', strExpr: 'typeof 0', bindingType: BindingType.None, exprType: UnaryExpression },
    { name: 'unary (!)', strExpr: '!true', bindingType: BindingType.None, exprType: UnaryExpression },
    { name: 'unary (-)', strExpr: '-1', bindingType: BindingType.None, exprType: UnaryExpression },
    { name: 'unary (+)', strExpr: '+1', bindingType: BindingType.None, exprType: UnaryExpression },
    { name: 'binary (&&)', strExpr: 'true && true', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (||)', strExpr: 'true || true', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (==)', strExpr: 'true == true', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (===)', strExpr: 'true === true', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (!=)', strExpr: 'true != true', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (!==)', strExpr: 'true !== true', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (instanceof)', strExpr: 'instance instanceof Type', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (in)', strExpr: 'prop in obj', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (+)', strExpr: '1 + 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (-)', strExpr: '1 - 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (*)', strExpr: '1 * 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (/)', strExpr: '1 / 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (%)', strExpr: '1 % 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (<)', strExpr: '1 < 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (>)', strExpr: '1 > 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (%)', strExpr: '1 % 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (<=)', strExpr: '1 <= 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'binary (>=)', strExpr: '1 >= 1', bindingType: BindingType.None, exprType: BinaryExpression },
    { name: 'conditional', strExpr: 'condition ? yes : no', bindingType: BindingType.None, exprType: ConditionalExpression },
    { name: 'value converter', strExpr: 'value | vc', bindingType: BindingType.None, exprType: ValueConverterExpression },
    { name: 'binding behavior', strExpr: 'value & bb', bindingType: BindingType.None, exprType: BindingBehaviorExpression },
    { name: 'binding behavior with value converter', strExpr: 'value | vc & bb', bindingType: BindingType.None, exprType: BindingBehaviorExpression },
    { name: 'access scope', strExpr: 'value', bindingType: BindingType.None, exprType: AccessScopeExpression },
    { name: 'access member', strExpr: 'value.prop', bindingType: BindingType.None, exprType: AccessMemberExpression },
    { name: 'access keyed (string)', strExpr: 'value.prop["a"]', bindingType: BindingType.None, exprType: AccessKeyedExpression },
    { name: 'access keyed (number)', strExpr: 'value.prop[0]', bindingType: BindingType.None, exprType: AccessKeyedExpression },
    { name: 'access this', strExpr: '$this', bindingType: BindingType.None, exprType: AccessThisExpression },
    { name: 'array literal', strExpr: '[0]', bindingType: BindingType.None, exprType: ArrayLiteralExpression },
    { name: 'object literal', strExpr: '{}', bindingType: BindingType.None, exprType: ObjectLiteralExpression },
    { name: 'call scope', strExpr: 'fn()', bindingType: BindingType.None, exprType: CallScopeExpression },
    { name: 'call member', strExpr: 'obj.fn()', bindingType: BindingType.None, exprType: CallMemberExpression },
    { name: 'call function', strExpr: '$this()', bindingType: BindingType.None, exprType: CallFunctionExpression },
    { name: 'template', strExpr: '``', bindingType: BindingType.None, exprType: TemplateExpression },
    { name: 'assign', strExpr: 'a=b', bindingType: BindingType.None, exprType: AssignExpression },
    { name: '"for of" with simple binding identifier', strExpr: 'item of items', bindingType: BindingType.ForCommand, exprType: ForOfStatement },
    { name: '"for of" with vc', strExpr: 'item of items | vc', bindingType: BindingType.ForCommand, exprType: ForOfStatement },
    { name: '"for of" with bb', strExpr: 'item of items & bb', bindingType: BindingType.ForCommand, exprType: ForOfStatement },
    { name: '"for of" with object binding pattern (destructuring)', strExpr: '{a,b} of items & bb', bindingType: BindingType.ForCommand, exprType: ForOfStatement },
    { name: '"for of" with array binding pattern (destructuring)', strExpr: '[a,b] of items & bb', bindingType: BindingType.ForCommand, exprType: ForOfStatement },
  ];

  for (const { strExpr, bindingType, exprType, name } of list) {
    it(`works for ${name} expression`, function () {
      const parser = setup();
      const expr = parser.parse(strExpr, bindingType);
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
    const expr: TaggedTemplateExpression = parser.parse('a`static${prop}`', BindingType.None) as TaggedTemplateExpression;
    assert.instanceOf(expr, exprType);
    const serialized = Serializer.serialize(expr);
    const deserialized: TaggedTemplateExpression = Deserializer.deserialize(serialized) as TaggedTemplateExpression;
    assert.instanceOf(deserialized, exprType);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(deserialized.cooked.raw)), JSON.parse(JSON.stringify(deserialized.cooked.raw)));
    assert.deepStrictEqual(deserialized.func, expr.func);
    assert.deepStrictEqual(deserialized.expressions, expr.expressions);
  });
});
