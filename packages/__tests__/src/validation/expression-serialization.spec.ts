import {
  type ExpressionType,
  ExpressionParser,
  type TaggedTemplateExpression,
} from '@aurelia/expression-parser';
import { TestContext, assert } from '@aurelia/testing';
import { Scope, astEvaluate } from '@aurelia/runtime';
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
    { name: 'optional current scope', strExpr: '$this?.value', expressionType: 'None', expectedKind: 'AccessScope' },
    { name: 'optional parent scope', strExpr: '$parent?.value', expressionType: 'None', expectedKind: 'AccessScope' },
    { name: 'optional earlier ancestor', strExpr: '$parent?.$parent.value', expressionType: 'None', expectedKind: 'AccessScope' },
    { name: 'access member', strExpr: 'value.prop', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'optional member', strExpr: 'value?.prop', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'optional member continuation', strExpr: 'value?.prop.child', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'grouped optional member', strExpr: '(value?.prop).child', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'grouped optional scope', strExpr: '($parent?.value).child', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'access keyed (string)', strExpr: 'value.prop["a"]', expressionType: 'None', expectedKind: 'AccessKeyed' },
    { name: 'access keyed (number)', strExpr: 'value.prop[0]', expressionType: 'None', expectedKind: 'AccessKeyed' },
    { name: 'optional keyed member', strExpr: 'value?.[key]', expressionType: 'None', expectedKind: 'AccessKeyed' },
    { name: 'grouped optional keyed member', strExpr: '(value?.[key]).child', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'access this', strExpr: '$this', expressionType: 'None', expectedKind: 'AccessThis' },
    { name: 'access boundary', strExpr: 'this', expressionType: 'None', expectedKind: 'AccessBoundary' },
    { name: 'array literal', strExpr: '[0]', expressionType: 'None', expectedKind: 'ArrayLiteral' },
    { name: 'object literal', strExpr: '{}', expressionType: 'None', expectedKind: 'ObjectLiteral' },
    { name: 'call scope', strExpr: 'fn()', expressionType: 'None', expectedKind: 'CallScope' },
    { name: 'optional scope function', strExpr: 'fn?.()', expressionType: 'None', expectedKind: 'CallScope' },
    { name: 'optional parent receiver', strExpr: '$parent?.fn()', expressionType: 'None', expectedKind: 'CallScope' },
    { name: 'optional parent function', strExpr: '$parent.fn?.()', expressionType: 'None', expectedKind: 'CallScope' },
    { name: 'optional parent receiver and function', strExpr: '$parent?.fn?.()', expressionType: 'None', expectedKind: 'CallScope' },
    { name: 'call member', strExpr: 'obj.fn()', expressionType: 'None', expectedKind: 'CallMember' },
    { name: 'optional member receiver', strExpr: 'obj?.fn()', expressionType: 'None', expectedKind: 'CallMember' },
    { name: 'optional member function', strExpr: 'obj.fn?.()', expressionType: 'None', expectedKind: 'CallMember' },
    { name: 'optional member receiver and function', strExpr: 'obj?.fn?.()', expressionType: 'None', expectedKind: 'CallMember' },
    { name: 'grouped optional member call', strExpr: '(obj?.fn()).value', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'grouped optional scope call', strExpr: '(fn?.()).value', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'call function', strExpr: '$this()', expressionType: 'None', expectedKind: 'CallFunction' },
    { name: 'optional keyed function', strExpr: 'obj[key]?.()', expressionType: 'None', expectedKind: 'CallFunction' },
    { name: 'optional keyed receiver call', strExpr: 'obj?.[key]()', expressionType: 'None', expectedKind: 'CallFunction' },
    { name: 'grouped optional keyed call', strExpr: '(obj[key]?.()).value', expressionType: 'None', expectedKind: 'AccessMember' },
    { name: 'grouped optional keyed receiver call', strExpr: '(obj?.[key]()).value', expressionType: 'None', expectedKind: 'AccessMember' },
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
      assert.equal(expr.$kind, expectedKind);
      const serialized = Serializer.serialize(expr);
      const deserialized = Deserializer.deserialize(serialized);
      assert.equal(deserialized.$kind, expectedKind);
      assert.deepStrictEqual(deserialized, expr);
    });
  }

  it('keeps legacy scope payloads and optional receivers distinct', function () {
    const parser = createParser();
    const legacyAccess = '{"$TYPE":"AccessScopeExpression","name":"value","ancestor":1}';
    const legacyCall = '{"$TYPE":"CallScopeExpression","name":"fn","ancestor":1,"args":[]}';
    assert.deepStrictEqual(Deserializer.deserialize(legacyAccess), parser.parse('$parent.value', 'None'));
    assert.deepStrictEqual(Deserializer.deserialize(legacyCall), parser.parse('$parent.fn()', 'None'));
    assert.strictEqual(Serializer.serialize(Deserializer.deserialize(legacyAccess)), legacyAccess);
    assert.strictEqual(Serializer.serialize(Deserializer.deserialize(legacyCall)), legacyCall);

    const scope = Scope.create({});
    for (const text of ['$parent?.value', '$parent?.fn()', '$parent?.fn?.()']) {
      const expression = Deserializer.deserialize(Serializer.serialize(parser.parse(text, 'None')));
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), void 0);
    }
    const optionalFunction = Deserializer.deserialize(Serializer.serialize(parser.parse('$parent.fn?.()', 'None')));
    assert.throws(() => astEvaluate(optionalFunction, scope, { strict: true }, null), /AUR0114/);
    assert.strictEqual(astEvaluate(optionalFunction, Scope.fromParent(scope, {}), { strict: true }, null), void 0);
  });

  it('keeps legacy member and function payloads unchanged', function () {
    const parser = createParser();
    const object = '{"$TYPE":"AccessScopeExpression","name":"record","ancestor":0}';
    for (const [text, payload] of [
      ['record.label', `{"$TYPE":"AccessMemberExpression","name":"label","object":${object}}`],
      ['record[key]', `{"$TYPE":"AccessKeyedExpression","object":${object},"key":{"$TYPE":"AccessScopeExpression","name":"key","ancestor":0}}`],
      ['record.format()', `{"$TYPE":"CallMemberExpression","name":"format","object":${object},"args":[]}`],
      ['$this()', '{"$TYPE":"CallFunctionExpression","func":{"$TYPE":"AccessThisExpression","ancestor":0},"args":[]}'],
    ]) {
      const expression = Deserializer.deserialize(payload);
      assert.deepStrictEqual(expression, parser.parse(text, 'None'));
      assert.strictEqual(Serializer.serialize(expression), payload);
    }
  });

  // Validation rules may store their property expressions. Restoring one must retain
  // both the loading guard and the parentheses that deliberately end that guard.
  for (const text of ['record?.details.label', 'record?.[getKey()].label', 'record?.format(argument()).label']) {
    it(`preserves short-circuiting after serializing ${text}`, function () {
      let keyCalls = 0;
      let argumentCalls = 0;
      const scope = Scope.create({
        record: null as { details: { label: string }; format(value: string): { label: string } } | null,
        getKey() { ++keyCalls; return 'details'; },
        argument() { ++argumentCalls; return 'loaded'; },
      });
      const expression = Deserializer.deserialize(Serializer.serialize(createParser().parse(text, 'None')));
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), void 0);
      assert.strictEqual(keyCalls, 0);
      assert.strictEqual(argumentCalls, 0);

      scope.bindingContext.record = { details: { label: 'loaded' }, format(label: string) { return { label }; } };
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'loaded');
      assert.strictEqual(keyCalls, text.includes('getKey') ? 1 : 0);
      assert.strictEqual(argumentCalls, text.includes('argument') ? 1 : 0);
    });
  }

  for (const text of ['(record?.details).label', '(record?.format()).label', '(record?.[key]).label']) {
    it(`preserves the strict access after a grouped chain in ${text}`, function () {
      const expression = Deserializer.deserialize(Serializer.serialize(createParser().parse(text, 'None')));
      assert.throws(() => astEvaluate(expression, Scope.create({ record: null, key: 'details' }), { strict: true }, null), /AUR0114/);
    });
  }

  it(`works for for of with binding identifier expression`, function () {
    const parser = createParser();
    const expr = parser.parse('a`static${prop}`', 'None') as TaggedTemplateExpression;
    assert.equal(expr.$kind, 'TaggedTemplate');
    const serialized = Serializer.serialize(expr);
    const deserialized = Deserializer.deserialize(serialized);
    assert.equal(deserialized.$kind, 'TaggedTemplate');
    const desTagged = deserialized as TaggedTemplateExpression;
    assert.deepStrictEqual(JSON.parse(JSON.stringify(desTagged.cooked.raw)), JSON.parse(JSON.stringify(expr.cooked.raw)));
    assert.deepStrictEqual(desTagged.func, expr.func);
    assert.deepStrictEqual(desTagged.expressions, expr.expressions);
  });
});
