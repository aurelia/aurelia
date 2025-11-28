import { IServiceLocator, Writable, IIndexable } from '@aurelia/kernel';
import {
  eachCartesianJoinFactory,
  createScopeForTest,
  MockTracingExpression,
  MockBinding,
  assert
} from '@aurelia/testing';
import {
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  AccessThisExpression,
  ArrayLiteralExpression,
  AssignExpression,
  BinaryExpression,
  BindingBehaviorExpression,
  CallFunctionExpression,
  CallMemberExpression,
  CallScopeExpression,
  ConditionalExpression,
  // IsBinary,
  IsBindingBehavior,
  IsLeftHandSide,
  // IsPrimary,
  // IsUnary,
  ObjectLiteralExpression,
  PrimitiveLiteralExpression,
  TaggedTemplateExpression,
  TemplateExpression,
  UnaryExpression,
  ValueConverterExpression,
  DestructuringAssignmentSingleExpression,
  DestructuringAssignmentRestExpression,
  DestructuringAssignmentExpression,
  ArrowFunction,
  BindingIdentifier,
  Unparser,
  AccessBoundaryExpression,
  PrimitiveLiteral,
  Template,
  ArrayLiteral,
  ObjectLiteral,
  createAccessScopeExpression,
  createAccessThisExpression,
  createAccessBoundaryExpression,
  createAccessMemberExpression,
  createAccessKeyedExpression,
  createPrimitiveLiteralExpression,
  createArrayLiteralExpression,
  createObjectLiteralExpression,
  createTaggedTemplateExpression,
  createTemplateExpression,
  createCallFunctionExpression,
  createCallScopeExpression,
  createCallMemberExpression,
  createUnaryExpression,
  createBinaryExpression,
  createConditionalExpression,
  createAssignExpression,
  createValueConverterExpression,
  createBindingBehaviorExpression,
  createDestructuringAssignmentExpression,
  createDestructuringAssignmentSingleExpression,
  createDestructuringAssignmentRestExpression,
  createBindingIdentifier,
  createArrowFunction,
  createInterpolation,
  createForOfStatement,
  createArrayBindingPattern,
  createObjectBindingPattern,
} from '@aurelia/expression-parser';
import {
  IObserverLocatorBasedConnectable,
  type IAstEvaluator,
  astAssign,
  astEvaluate,
  astBind,
  Scope
} from '@aurelia/runtime';
import { IBinding } from '@aurelia/runtime-html';

const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
// const $str = PrimitiveLiteral.$empty;
const $arr = ArrayLiteral.$empty;
const $obj = ObjectLiteral.$empty;
const $tpl = Template.$empty;
const $this = createAccessThisExpression(0);
const $parent = createAccessThisExpression(1);
const boundary = createAccessBoundaryExpression();

const dummyLocator = { get: () => null } as unknown as IServiceLocator & IAstEvaluator;
const dummyLocatorThatReturnsNull = {
  get() {
    return null;
  },
} as unknown as IServiceLocator & IAstEvaluator;
const dummyBinding = {
  observe: () => { return; },
  locator: dummyLocator
} as unknown as IBinding & IObserverLocatorBasedConnectable & IAstEvaluator;
const dummyBindingWithLocatorThatReturnsNull = {
  observe: () => { return; },
  locator: dummyLocatorThatReturnsNull,
} as unknown as IBinding & IObserverLocatorBasedConnectable & IAstEvaluator;
const dummyScope = Scope.create({});

function assignDoesNotThrow(inputs: [string, IsBindingBehavior][]) {
  describe('assign() does not throw / is a no-op', function () {
    for (const [text, expr] of inputs) {
      it(`${text}, null`, function () {
        astAssign(expr, null, null, null, null);
      });
    }
  });
}

describe('2-runtime/ast.spec.ts', function () {
  // const $num1 = createPrimitiveLiteralExpression(1);
  // const $str1 = createPrimitiveLiteralExpression('1');

  describe('[UNIT] AST', function () {

    const AccessThisList: [string, AccessThisExpression][] = [
      [`$this`, $this],
      [`$parent`, $parent],
      [`$parent.$parent`, createAccessThisExpression(2)]
    ];
    const AccessBoundaryList: [string, AccessBoundaryExpression][] = [
      [`this`, boundary],
    ];
    const AccessScopeList: [string, AccessScopeExpression][] = [
      ...AccessBoundaryList,
      ...AccessThisList.map(([input, expr]) => [`${input}.a`, createAccessScopeExpression('a', expr.ancestor)] as [string, any]),
      [`$this.$parent`, createAccessScopeExpression('$parent')],
      [`$host.$parent`, createAccessScopeExpression('$parent', undefined)],
      [`$parent.$this`, createAccessScopeExpression('$this', 1)],
      [`a`, createAccessScopeExpression('a')]
    ];
    const StringLiteralList: [string, PrimitiveLiteralExpression][] = [
      [`''`, PrimitiveLiteral.$empty]
    ];
    const NumberLiteralList: [string, PrimitiveLiteralExpression][] = [
      [`1`, createPrimitiveLiteralExpression(1)],
      [`1.1`, createPrimitiveLiteralExpression(1.1)],
      [`.1`, createPrimitiveLiteralExpression(0.1)],
      [`0.1`, createPrimitiveLiteralExpression(0.1)]
    ];
    const KeywordLiteralList: [string, PrimitiveLiteralExpression][] = [
      [`undefined`, $undefined],
      [`null`, $null],
      [`true`, $true],
      [`false`, $false]
    ];
    // const PrimitiveLiteralList: [string, PrimitiveLiteralExpression][] = [
    //   ...StringLiteralList,
    //   ...NumberLiteralList,
    //   ...KeywordLiteralList
    // ];

    const ArrayLiteralList: [string, ArrayLiteralExpression][] = [
      [`[]`, $arr]
    ];
    const ObjectLiteralList: [string, ObjectLiteralExpression][] = [
      [`{}`, $obj]
    ];
    const TemplateLiteralList: [string, TemplateExpression][] = [
      [`\`\``, $tpl]
    ];
    // const LiteralList: [string, IsPrimary][] = [
    //   ...PrimitiveLiteralList,
    //   ...TemplateLiteralList,
    //   ...ArrayLiteralList,
    //   ...ObjectLiteralList
    // ];
    const TemplateInterpolationList: [string, TemplateExpression][] = [
      [`\`\${a}\``, createTemplateExpression(['', ''], [createAccessScopeExpression('a')])]
    ];
    // const PrimaryList: [string, IsPrimary][] = [
    //   ...AccessThisList,
    //   ...AccessScopeList,
    //   ...LiteralList
    // ];
    // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
    // const SimpleAccessKeyedList: [string, IsLeftHandSide][] = [
    //   ...AccessScopeList
    //     .map(([input, expr]) => [`${input}[b]`, createAccessKeyedExpression(expr, createAccessScopeExpression('b'))] as [string, any])
    // ];
    // 3. parseMemberExpression.MemberExpression . IdentifierName
    // const SimpleAccessMemberList: [string, IsLeftHandSide][] = [
    //   ...AccessScopeList
    //     .map(([input, expr]) => [`${input}.b`, createAccessMemberExpression(expr, 'b')] as [string, any])
    // ];
    // 4. parseMemberExpression.MemberExpression TemplateLiteral
    const SimpleTaggedTemplateList: [string, IsLeftHandSide][] = [
      ...AccessScopeList
        .map(([input, expr]) => [`${input}\`\``, createTaggedTemplateExpression([''], [''], expr, [])] as [string, any]),

      ...AccessScopeList
        .map(([input, expr]) => [`${input}\`\${a}\``, createTaggedTemplateExpression(['', ''], ['', ''], expr, [createAccessScopeExpression('a')])] as [string, any])
    ];
    // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
    const SimpleCallFunctionList: [string, IsLeftHandSide][] = [
      ...AccessScopeList
        .map(([input, expr]) => [`${input}()`, createCallFunctionExpression(expr, [])] as [string, any])
    ];
    // 2. parseCallExpression.MemberExpression Arguments
    const SimpleCallScopeList: [string, IsLeftHandSide][] = [
      ...AccessScopeList
        .map(([input, expr]) => [`${input}()`, createCallScopeExpression((expr as any).name, [], expr.ancestor)] as [string, any])
    ];
    // 3. parseCallExpression.MemberExpression Arguments
    const SimpleCallMemberList: [string, IsLeftHandSide][] = [
      ...AccessScopeList
        .map(([input, expr]) => [`${input}.b()`, createCallMemberExpression(expr, 'b', [])] as [string, any])
    ];
    // concatenation of 1-3 of MemberExpression and 1-3 of CallExpression
    // const SimpleLeftHandSideList: [string, IsLeftHandSide][] = [
    //   ...SimpleAccessKeyedList,
    //   ...SimpleAccessMemberList,
    //   ...SimpleTaggedTemplateList,
    //   ...SimpleCallFunctionList,
    //   ...SimpleCallScopeList,
    //   ...SimpleCallMemberList
    // ];

    // concatenation of Primary and Member+CallExpression
    // This forms the group Precedence.LeftHandSide
    // used only for testing complex UnaryExpression expressions
    // const SimpleIsLeftHandSideList: [string, IsLeftHandSide][] = [
    //   ...PrimaryList,
    //   ...SimpleLeftHandSideList
    // ];

    // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
    const SimpleUnaryList: [string, UnaryExpression][] = [
      [`!$1`, createUnaryExpression('!', createAccessScopeExpression('$1'))],
      [`-$2`, createUnaryExpression('-', createAccessScopeExpression('$2'))],
      [`+$3`, createUnaryExpression('+', createAccessScopeExpression('$3'))],
      [`--$4`, createUnaryExpression('--', createAccessScopeExpression('$4'))],
      [`++$5`, createUnaryExpression('++', createAccessScopeExpression('$5'))],
      [`$6--`, createUnaryExpression('--', createAccessScopeExpression('$6'), 1)],
      [`$7++`, createUnaryExpression('++', createAccessScopeExpression('$7'), 1)],
      [`void $8`, createUnaryExpression('void', createAccessScopeExpression('$8'))],
      [`typeof $9`, createUnaryExpression('typeof', createAccessScopeExpression('$9'))]
    ];
    // concatenation of UnaryExpression + LeftHandSide
    // This forms the group Precedence.LeftHandSide and includes Precedence.UnaryExpression
    // const SimpleIsUnaryList: [string, IsUnary][] = [
    //   ...SimpleIsLeftHandSideList,
    //   ...SimpleUnaryList
    // ];

    // This forms the group Precedence.Exponentiation
    const SimpleExponentiationList: [string, BinaryExpression][] = [
      [`$4**$5`, createBinaryExpression('**', createAccessScopeExpression('$4'), createAccessScopeExpression('$5'))]
    ];

    // This forms the group Precedence.Multiplicative
    const SimpleMultiplicativeList: [string, BinaryExpression][] = [
      [`$6*$7`, createBinaryExpression('*', createAccessScopeExpression('$6'), createAccessScopeExpression('$7'))],
      [`$8%$9`, createBinaryExpression('%', createAccessScopeExpression('$8'), createAccessScopeExpression('$9'))],
      [`$10/$11`, createBinaryExpression('/', createAccessScopeExpression('$10'), createAccessScopeExpression('$11'))]
    ];
    // const SimpleIsMultiplicativeList: [string, IsBinary][] = [
    //   ...SimpleIsUnaryList,
    //   ...SimpleMultiplicativeList
    // ];

    // This forms the group Precedence.Additive
    const SimpleAdditiveList: [string, BinaryExpression][] = [
      [`$12+$13`, createBinaryExpression('+', createAccessScopeExpression('$12'), createAccessScopeExpression('$13'))],
      [`$14-$15`, createBinaryExpression('-', createAccessScopeExpression('$14'), createAccessScopeExpression('$15'))]
    ];
    // const SimpleIsAdditiveList: [string, IsBinary][] = [
    //   ...SimpleIsMultiplicativeList,
    //   ...SimpleAdditiveList
    // ];

    // This forms the group Precedence.Relational
    const SimpleRelationalList: [string, BinaryExpression][] = [
      [`$16<$17`, createBinaryExpression('<', createAccessScopeExpression('$16'), createAccessScopeExpression('$17'))],
      [`$18>$19`, createBinaryExpression('>', createAccessScopeExpression('$18'), createAccessScopeExpression('$19'))],
      [`$20<=$21`, createBinaryExpression('<=', createAccessScopeExpression('$20'), createAccessScopeExpression('$21'))],
      [`$22>=$23`, createBinaryExpression('>=', createAccessScopeExpression('$22'), createAccessScopeExpression('$23'))],
      [`$24 in $25`, createBinaryExpression('in', createAccessScopeExpression('$24'), createAccessScopeExpression('$25'))],
      [`$26 instanceof $27`, createBinaryExpression('instanceof', createAccessScopeExpression('$26'), createAccessScopeExpression('$27'))]
    ];
    // const SimpleIsRelationalList: [string, IsBinary][] = [
    //   ...SimpleIsAdditiveList,
    //   ...SimpleRelationalList
    // ];

    // This forms the group Precedence.Equality
    const SimpleEqualityList: [string, BinaryExpression][] = [
      [`$28==$29`, createBinaryExpression('==', createAccessScopeExpression('$28'), createAccessScopeExpression('$29'))],
      [`$30!=$31`, createBinaryExpression('!=', createAccessScopeExpression('$30'), createAccessScopeExpression('$31'))],
      [`$32===$33`, createBinaryExpression('===', createAccessScopeExpression('$32'), createAccessScopeExpression('$33'))],
      [`$34!==$35`, createBinaryExpression('!==', createAccessScopeExpression('$34'), createAccessScopeExpression('$35'))]
    ];
    // const SimpleIsEqualityList: [string, IsBinary][] = [
    //   ...SimpleIsRelationalList,
    //   ...SimpleEqualityList
    // ];

    // This forms the group Precedence.LogicalAND
    const SimpleLogicalANDList: [string, BinaryExpression][] = [
      [`$36&&$37`, createBinaryExpression('&&', createAccessScopeExpression('$36'), createAccessScopeExpression('$37'))]
    ];

    // This forms the group Precedence.LogicalOR
    const SimpleLogicalORList: [string, BinaryExpression][] = [
      [`$38||$39`, createBinaryExpression('||', createAccessScopeExpression('$38'), createAccessScopeExpression('$39'))]
    ];

    // This forms the group Precedence.ConditionalExpression
    const SimpleConditionalList: [string, ConditionalExpression][] = [
      [`a?b:c`, createConditionalExpression(createAccessScopeExpression('a'), createAccessScopeExpression('b'), createAccessScopeExpression('c'))]
    ];

    // This forms the group Precedence.AssignExpression
    // const SimpleAssignList: [string, AssignExpression][] = [
    //   [`a=b`, createAssignExpression(createAccessScopeExpression('a'), createAccessScopeExpression('b'))]
    // ];

    // This forms the group Precedence.Variadic
    const SimpleValueConverterList: [string, ValueConverterExpression][] = [
      [`a|b`, createValueConverterExpression(createAccessScopeExpression('a'), 'b', [])],
      [`a|b:c`, createValueConverterExpression(createAccessScopeExpression('a'), 'b', [createAccessScopeExpression('c')])],
      [`a|b:c:d`, createValueConverterExpression(createAccessScopeExpression('a'), 'b', [createAccessScopeExpression('c'), createAccessScopeExpression('d')])]
    ];

    const SimpleBindingBehaviorList: [string, BindingBehaviorExpression][] = [
      [`a&b`, createBindingBehaviorExpression(createAccessScopeExpression('a'), 'b', [])],
      [`a&b:c`, createBindingBehaviorExpression(createAccessScopeExpression('a'), 'b', [createAccessScopeExpression('c')])],
      [`a&b:c:d`, createBindingBehaviorExpression(createAccessScopeExpression('a'), 'b', [createAccessScopeExpression('c'), createAccessScopeExpression('d')])]
    ];

    describe('Literals', function () {
      describe('evaluate() works without any input', function () {
        for (const [text, expr] of [
          ...StringLiteralList,
          ...NumberLiteralList,
          ...KeywordLiteralList
        ]) {
          it(text, function () {
            assert.strictEqual(astEvaluate(expr, undefined, undefined, null), expr.value, `astEvaluate(expr, undefined, undefined)`);
          });
        }
        for (const [text, expr] of TemplateLiteralList) {
          it(text, function () {
            assert.strictEqual(astEvaluate(expr, undefined, undefined, null), '', `astEvaluate(expr, undefined, undefined)`);
          });
        }
        for (const [text, expr] of ArrayLiteralList) {
          it(text, function () {
            assert.instanceOf(astEvaluate(expr, undefined, undefined, null), Array, 'astEvaluate(expr, undefined, undefined)');
          });
        }
        for (const [text, expr] of ObjectLiteralList) {
          it(text, function () {
            assert.instanceOf(astEvaluate(expr, undefined, undefined, null), Object, 'astEvaluate(expr, undefined, undefined)');
          });
        }
      });

      assignDoesNotThrow([
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList,
        ...TemplateLiteralList,
        ...ArrayLiteralList,
        ...ObjectLiteralList
      ]);
    });

    describe('Context Accessors', function () {
      assignDoesNotThrow(AccessThisList);
    });

    describe('Scope Accessors', function () {
      assignDoesNotThrow([
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]);
    });

    describe('CallExpression', function () {
      assignDoesNotThrow([
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
      ]);
    });

    describe('UnaryExpression', function () {
      assignDoesNotThrow(SimpleUnaryList);
    });

    describe('BinaryExpression', function () {
      const SimplyBinaryList = [
        ...SimpleExponentiationList,
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ];
      assignDoesNotThrow(SimplyBinaryList);
    });

    describe('ConditionalExpression', function () {
      assignDoesNotThrow(SimpleConditionalList);
    });

    // describe('AssignExpression', function () {
    // });

    describe('ValueConverterExpression', function () {
      describe('evaluate() does not throw when returned converter is null', function () {
        for (const [text, expr] of SimpleValueConverterList) {
          it(`${text}, undefined`, function () {
            assert.doesNotThrow(() => astEvaluate(expr, dummyScope, dummyLocatorThatReturnsNull, null));
            // throwsOn(expr, 'evaluate', `ValueConverter named 'b' could not be found. Did you forget to register it as a dependency?`, LF.none, dummyScope, dummyLocatorThatReturnsNull, null);
          });
        }
      });

      describe('assign() does not throw when returned converter is null', function () {
        for (const [text, expr] of SimpleValueConverterList) {
          it(`${text}, null`, function () {
            assert.doesNotThrow(() => astAssign(expr, dummyScope, dummyLocatorThatReturnsNull, null, null));
            // throwsOn(expr, 'assign', `ValueConverter named 'b' could not be found. Did you forget to register it as a dependency?`, LF.none, dummyScope, dummyLocatorThatReturnsNull, null);
          });
        }
      });
    });

    describe('BindingBehaviorExpression', function () {
      describe('bind() does not throws when evaluator does not implement bindBehavior', function () {
        for (const [text, expr] of SimpleBindingBehaviorList) {
          it(`${text}, undefined`, function () {
            assert.doesNotThrow(() => astBind(expr, dummyScope, dummyBindingWithLocatorThatReturnsNull));
            // throwsOn(expr, 'bind', `BindingBehavior named 'b' could not be found. Did you forget to register it as a dependency?`, LF.none, dummyScope, dummyBindingWithLocatorThatReturnsNull);
          });
        }
      });
    });
  });

  describe('AccessKeyedExpression', function () {
    let expression: AccessKeyedExpression;

    before(function () {
      expression = createAccessKeyedExpression(createAccessScopeExpression('foo', 0), createPrimitiveLiteralExpression('bar'));
    });

    it('evaluates member on bindingContext', function () {
      const scope = createScopeForTest({ foo: { bar: 'baz' } });
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'baz', `astEvaluate(expression, scope, null)`);
    });

    it('evaluates member on overrideContext', function () {
      const scope = createScopeForTest({});
      scope.overrideContext.foo = { bar: 'baz' };
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'baz', `astEvaluate(expression, scope, null)`);
    });

    it('assigns member on bindingContext', function () {
      const scope = createScopeForTest({ foo: { bar: 'baz' } });
      astAssign(expression, scope, null, null, 'bang');
      assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);
    });

    it('assigns member on overrideContext', function () {
      const scope = createScopeForTest({});
      scope.overrideContext.foo = { bar: 'baz' };
      astAssign(expression, scope, null, null, 'bang');
      assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);
    });

    it('evaluates null/undefined object', function () {
      let scope = createScopeForTest({ foo: null });
      assert.strictEqual(astEvaluate(expression, scope, null, null), undefined, `astEvaluate(expression, scope, null, null)`);
      scope = createScopeForTest({ foo: undefined });
      assert.strictEqual(astEvaluate(expression, scope, null, null), undefined, `astEvaluate(expression, scope, null, null)`);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), undefined, `astEvaluate(expression, scope, null, null)`);
    });

    it('does not observes property in keyed object access when key is number', function () {
      const scope = createScopeForTest({ foo: { '0': 'hello world' } });
      const expression2 = createAccessKeyedExpression(createAccessScopeExpression('foo', 0), createPrimitiveLiteralExpression(0));
      assert.strictEqual(astEvaluate(expression2, scope, null, null), 'hello world', `astEvaluate(expression2, scope, null)`);
      const binding = new MockBinding();
      astEvaluate(expression2, scope, dummyLocator, binding);
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
      assert.deepStrictEqual(binding.calls[1], ['observe', scope.bindingContext.foo, 0], 'binding.calls[1]');
      assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');
    });

    it('observes property in keyed array access when key is number', function () {
      const scope = createScopeForTest({ foo: ['hello world'] });
      const expression3 = createAccessKeyedExpression(createAccessScopeExpression('foo', 0), createPrimitiveLiteralExpression(0));
      assert.strictEqual(astEvaluate(expression3,scope, null, null), 'hello world', `astEvaluate(expression3,scope, null)`);
      const binding = new MockBinding();
      astEvaluate(expression3,scope, dummyLocator, binding);
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
      assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');
    });

    describe('returns the right value when accessing keyed on primitive', function () {

      it('returns string when accessing string character', function () {
        const value = astEvaluate(
          createAccessKeyedExpression(createPrimitiveLiteralExpression('a'), createPrimitiveLiteralExpression(0)),
          null,
          null,
          null
        );
        assert.strictEqual(value, 'a');
      });

      it('returns undefined when accessing keyed on null/undefined', function () {
        const value = astEvaluate(
          createAccessKeyedExpression(PrimitiveLiteral.$null, createPrimitiveLiteralExpression(0)),
          null,
          null,
          null
        );
        assert.strictEqual(value, undefined);
      });

      it('returns prototype method when accessing keyed on primitive', function () {
        const value = astEvaluate(
          createAccessKeyedExpression(createPrimitiveLiteralExpression(0), createPrimitiveLiteralExpression('toFixed')),
          null,
          null,
          null
        );
        assert.strictEqual(value, Number.prototype.toFixed);
      });
    });

    // describe('does not attempt to observe property when object is primitive', function () {
    //   const objects: [string, any][] = [
    //     [`     null`, null],
    //     [`undefined`, undefined],
    //     [`       ''`, ''],
    //     [`1`, 1],
    //     [`     true`, true],
    //     [`    false`, false],
    //     [` Symbol()`, Symbol()]
    //   ];
    //   const keys: [string, any][] = [
    //     [`[0]  `, createPrimitiveLiteralExpression(0)],
    //     [`['a']`, createPrimitiveLiteralExpression('a')]
    //   ];
    //   const inputs: [typeof objects, typeof keys] = [objects, keys];

    //   eachCartesianJoin(inputs, (([t1, obj], [t2, key]) => {
    //     it(`${t1}${t2}`, function () {
    //       const scope = createScopeForTest({ foo: obj });
    //       const sut = createAccessKeyedExpression(createAccessScopeExpression('foo', 0), key);
    //       const binding = new MockBinding();
    //       astEvaluate(sut, scope, dummyLocator, binding);
    //       assert.strictEqual(binding.calls.length, 1);
    //       assert.strictEqual(binding.calls[0][0], 'observe');
    //     });
    //   }));
    // });
  });

  describe('AccessMemberExpression', function () {

    const objects: (() => [string, any, boolean, boolean])[] = [
      () => [`     null`, null, true, false],
      () => [`undefined`, undefined, true, false],
      () => [`       ''`, '', true, false],
      () => [`      'a'`, 'a', false, false],
      () => [`    false`, false, true, false],
      () => [`        1`, 1, false, false],
      () => [`     true`, true, false, false],
      () => [` Symbol()`, Symbol(), false, false],
      () => [`       {}`, {}, false, true],
      () => [`       []`, [], false, true]
    ];

    const props: ((input: [string, any, boolean, boolean]) => [string, any, any])[] = [
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = null as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`null={}     `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = undefined as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`undefined={}`, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = '' as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`''={}       `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = 'a' as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`'a'={}      `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = false as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`false={}    `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = 1 as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`1={}        `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = true as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`true={}     `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = Symbol() as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`Symbol()={} `, prop, value];
      },
      ([_$11, obj, _isFalsey, canHaveProperty]) => {
        const prop = {} as any;
        const value = {};
        if (canHaveProperty) {
          obj[prop] = value;
        }
        return [`{}={}       `, prop, value];
      },
    ];
    const inputs: [typeof objects, typeof props] = [objects, props];

    const expression: AccessMemberExpression = createAccessMemberExpression(createAccessScopeExpression('foo', 0), 'bar');

    eachCartesianJoinFactory.call(this, inputs, (([t1, obj, _isFalsey, canHaveProperty], [t2, prop, value]) => {
      it(`STRICT - ${t1}.${t2} evaluate() -> eval + connect -> assign`, function () {
        const scope = createScopeForTest({ foo: obj });
        const evaluator = { strict: true } as unknown as IAstEvaluator;
        const sut = createAccessMemberExpression(createAccessScopeExpression('foo', 0), prop);
        let thrown = false;
        const actual = (() => {
          try {
            return astEvaluate(sut, scope, evaluator , null);
          } catch {
            thrown = true;
            return undefined;
          }
        })();
        if (obj == null) {
          assert.strictEqual(thrown, true, `thrown`);
          return;
        }
        if (canHaveProperty) {
          assert.strictEqual(actual, value, `actual`);
        } else {
          assert.strictEqual(actual, undefined, `actual`);
        }
        const binding = new MockBinding();
        astEvaluate(sut, scope, dummyLocator, binding);
        assert.strictEqual(
          binding.calls.filter(c => c[0] === 'observe').length,
          2,
          `binding.calls.filter(c => c[0] === 'observe').length`
        );

        if (!(obj instanceof Object)) {
          assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
          astAssign(sut, scope, null, null, 42);// }
          assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
          assert.strictEqual((scope.bindingContext['foo'] as IIndexable), obj, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
        }
      });

      it(`${t1}.${t2} evaluate() + connect() -> assign`, function () {
        const scope = createScopeForTest({ foo: obj });
        const evaluator = { strict: false } as unknown as IAstEvaluator;
        const sut = createAccessMemberExpression(createAccessScopeExpression('foo', 0), prop);
        const actual = astEvaluate(sut, scope, evaluator, null);
        if (obj == null) {
          assert.strictEqual(actual, undefined, `actual`);
        } else if (canHaveProperty) {
          assert.strictEqual(actual, value, `actual`);
        }
        const binding = new MockBinding();
        astEvaluate(sut, scope, dummyLocator, binding);
        assert.strictEqual(
          binding.calls.filter(c => c[0] === 'observe').length,
          obj == null ? 1 : 2,
          `binding.calls.filter(c => c[0] === 'observe').length`
        );

        if (!(obj instanceof Object)) {
          assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
          astAssign(sut, scope, null, null, 42);
          if (obj == null) {
            assert.instanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
            assert.strictEqual((scope.bindingContext['foo'] as IIndexable)[prop], 42, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
          } else {
            assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
            assert.strictEqual((scope.bindingContext['foo'] as IIndexable), obj, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
          }
        }
      });
    }));

    it('evaluates member on bindingContext', function () {
      const scope = createScopeForTest({ foo: { bar: 'baz' } });
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'baz', `astEvaluate(expression, scope, null, null)`);
    });

    it('evaluates member on overrideContext', function () {
      const scope = createScopeForTest({});
      scope.overrideContext.foo = { bar: 'baz' };
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'baz', `astEvaluate(expression, scope, null)`);
    });

    it('assigns member on bindingContext', function () {
      const scope = createScopeForTest({ foo: { bar: 'baz' } });
      astAssign(expression, scope, null, null, 'bang');
      assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);
    });

    it('assigns member on overrideContext', function () {
      const scope = createScopeForTest({});
      scope.overrideContext.foo = { bar: 'baz' };
      astAssign(expression, scope, null, null, 'bang');
      assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);
    });

    it('returns the assigned value', function () {
      const scope = createScopeForTest({ foo: { bar: 'baz' } });
      assert.strictEqual(astAssign(expression, scope, null, null, 'bang'), 'bang', `astAssign(expression, scope, null, 'bang')`);
    });

    // describe('does not attempt to observe property when object is falsey', function () {
    //   const objects2: [string, any][] = [
    //     [`     null`, null],
    //     [`undefined`, undefined],
    //     [`       ''`, ''],
    //     [`    false`, false]
    //   ];
    //   const props2: [string, any][] = [
    //     [`.0`, 0],
    //     [`.a`, 'a']
    //   ];
    //   const inputs2: [typeof objects2, typeof props2, boolean[]] = [objects2, props2, [true, false]];

    //   eachCartesianJoin(inputs2, (([t1, obj], [t2, prop]) => {
    //     it(`${t1}${t2}`, function () {
    //       const scope = createScopeForTest({ foo: obj });
    //       const sut = createAccessMemberExpression(createAccessScopeExpression('foo', 0), prop);
    //       const binding = new MockBinding();
    //       astEvaluate(sut, scope, dummyLocator, binding);
    //       assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 1, `binding.calls.filter(c => c[0] === 'observe').length`);
    //     });
    //   }));
    // });

    // describe('does not observe if object does not / cannot have the property', function () {
    //   const objects3: [string, any][] = [
    //     [`        1`, 1],
    //     [`     true`, true],
    //     [` Symbol()`, Symbol()]
    //   ];

    //   const props3: [string, any][] = [
    //     [`.0`, 0],
    //     [`.a`, 'a']
    //   ];

    //   const inputs3: [typeof objects3, typeof props3, boolean[]] = [objects3, props3, [true, false]];

    //   eachCartesianJoin(inputs3, (([t1, obj], [t2, prop]) => {
    //     it(`${t1}${t2}`, function () {
    //       const scope = createScopeForTest({ foo: obj });
    //       const expression2 = createAccessMemberExpression(createAccessScopeExpression('foo', 0), prop);
    //       const binding = new MockBinding();
    //       astEvaluate(expression2, scope, dummyLocator, binding);
    //       assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 1, `binding.calls.filter(c => c[0] === 'observe').length`);
    //     });
    //   }));
    // });
  });

  describe('AccessScopeExpression', function () {
    const foo: AccessScopeExpression = createAccessScopeExpression('foo', 0);
    const $parentfoo: AccessScopeExpression = createAccessScopeExpression('foo', 1);

    it(`evaluates defined property on bindingContext`, function () {
      const scope: Scope = createScopeForTest({ foo: 'bar' });
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
    });

    it(`evaluates defined property on overrideContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' });
      scope.overrideContext.foo = 'bar';
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
    });

    it(`assigns defined property on bindingContext`, function () {
      const scope = createScopeForTest({ foo: 'bar' });
      astAssign(foo, scope, null, null, 'baz');
      assert.strictEqual(scope.bindingContext.foo, 'baz', `scope.bindingContext.foo`);
    });

    it(`assigns undefined property to bindingContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' });
      astAssign(foo, scope, null, null, 'baz');
      assert.strictEqual(scope.bindingContext.foo, 'baz', `scope.bindingContext.foo`);
    });

    it(`assigns defined property on overrideContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' });
      scope.overrideContext.foo = 'bar';
      astAssign(foo, scope, null, null, 'baz');
      assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
    });

    it(`connects defined property on bindingContext`, function () {
      const scope = createScopeForTest({ foo: 'bar' });
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects defined property on overrideContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' });
      scope.overrideContext.foo = 'bar';
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects undefined property on bindingContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' });
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
    });

    it(`evaluates defined property on first ancestor bindingContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
      assert.strictEqual(astEvaluate($parentfoo, scope, null, null), 'bar', `astEvaluate($parentfoo, scope, null, null)`);
    });

    it(`evaluates defined property on first ancestor overrideContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      scope.parent.overrideContext.foo = 'bar';
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null)`);
      assert.strictEqual(astEvaluate($parentfoo, scope, null, null), 'bar', `astEvaluate($parentfoo, scope, null)`);
    });

    it(`assigns defined property on first ancestor bindingContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
      astAssign(foo, scope, null, null, 'baz');
      assert.strictEqual(scope.parent.bindingContext.foo, 'baz', `scope.parent.bindingContext.foo`);
      astAssign($parentfoo, scope, null, null, 'beep');
      assert.strictEqual(scope.parent.bindingContext.foo, 'beep', `scope.parent.bindingContext.foo`);
    });

    it(`assigns defined property on first ancestor overrideContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      scope.parent.overrideContext.foo = 'bar';
      astAssign(foo, scope, null, null, 'baz');
      assert.strictEqual(scope.parent.overrideContext.foo, 'baz', `scope.parent.overrideContext.foo`);
      astAssign($parentfoo, scope, null, null, 'beep');
      assert.strictEqual(scope.parent.overrideContext.foo, 'beep', `scope.parent.overrideContext.foo`);
    });

    it(`connects defined property on first ancestor bindingContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
      let binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.bindingContext, 'foo'], 'binding.calls[0]');
      binding = new MockBinding();
      astEvaluate($parentfoo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.bindingContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects defined property on first ancestor overrideContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      scope.parent.overrideContext.foo = 'bar';
      let binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.overrideContext, 'foo'], 'binding.calls[0]');
      binding = new MockBinding();
      astEvaluate($parentfoo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.overrideContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects undefined property on first ancestor bindingContext`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, {});
      (scope.parent as Writable<Scope>).parent = Scope.create({}, { foo: 'bar' });
      const binding = new MockBinding();
      astEvaluate($parentfoo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.bindingContext, 'foo'], 'binding.calls[0]');
    });

  });

  describe('AccessBoundaryExpression', function () {

    it('evaluates scope boundary', function () {
      const a = { a: 'a' };
      const b = { b: 'b' };
      const c = { c: 'c' };
      const d = { d: 'd' };
      let scope: Scope = Scope.create(a, null, true);
      assert.strictEqual(astEvaluate(boundary, scope, null, null), a, `astEvaluate(boundary, scope, null)`);

      scope = Scope.fromParent(Scope.create(b, null, true), a);
      assert.strictEqual(astEvaluate(boundary, scope, null, null), b, `astEvaluate(boundary, scope, null)`);

      scope = Scope.fromParent(Scope.fromParent(Scope.create(c, null, true), b), a);
      assert.strictEqual(astEvaluate(boundary, scope, null, null), c, `astEvaluate(boundary, scope, null)`);

      scope = Scope.fromParent(Scope.fromParent(Scope.fromParent(Scope.create(d, null, true), c), b), a);
      assert.strictEqual(astEvaluate(boundary, scope, null, null), d, `astEvaluate(boundary, scope, null)`);
    });
  });

  describe('AccessThisExpression', function () {
    const $parent$parent = createAccessThisExpression(2);
    const $parent$parent$parent = createAccessThisExpression(3);

    it('evaluates defined bindingContext', function () {
      const a = { a: 'a' };
      const b = { b: 'b' };
      const c = { c: 'c' };
      const d = { d: 'd' };
      let scope: Scope = Scope.create(a);
      assert.strictEqual(astEvaluate($parent, scope, null, null), undefined, `astEvaluate($parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent, scope, null, null), undefined, `astEvaluate($parent$parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent$parent, scope, null, null), undefined, `astEvaluate($parent$parent$parent, scope, null)`);

      scope = Scope.fromParent(Scope.create(b), a);
      assert.strictEqual(astEvaluate($parent, scope, null, null), b, `astEvaluate($parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent, scope, null, null), undefined, `astEvaluate($parent$parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent$parent, scope, null, null), undefined, `astEvaluate($parent$parent$parent, scope, null)`);

      scope = Scope.fromParent(Scope.fromParent(Scope.create(c), b), a);
      assert.strictEqual(astEvaluate($parent, scope, null, null), b, `astEvaluate($parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent, scope, null, null), c, `astEvaluate($parent$parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent$parent, scope, null, null), undefined, `astEvaluate($parent$parent$parent, scope, null)`);

      scope = Scope.fromParent(Scope.fromParent(Scope.fromParent(Scope.create(d), c), b), a);
      assert.strictEqual(astEvaluate($parent, scope, null, null), b, `astEvaluate($parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent, scope, null, null), c, `astEvaluate($parent$parent, scope, null)`);
      assert.strictEqual(astEvaluate($parent$parent$parent, scope, null, null), d, `astEvaluate($parent$parent$parent, scope, null)`);
    });
  });

  describe('AssignExpression', function () {
    it('can chain assignments', function () {
      const foo = createAssignExpression(createAccessScopeExpression('foo', 0), createAccessScopeExpression('bar', 0));
      const scope = Scope.create({});
      astAssign(foo, scope, null, null, 1);
      assert.strictEqual(scope.bindingContext.foo, 1, `scope.overrideContext.foo`);
      assert.strictEqual(scope.bindingContext.bar, 1, `scope.overrideContext.bar`);
    });
  });

  describe('ConditionalExpression', function () {
    it('evaluates the "yes" branch', function () {
      const condition = $true;
      const yes = new MockTracingExpression($obj);
      const no = new MockTracingExpression($obj);
      const sut = createConditionalExpression(condition, yes as any, no as any);

      astEvaluate(sut, null, null, null);
      assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
      assert.strictEqual(no.calls.length, 0, `no.calls.length`);
    });

    it('evaluates the "no" branch', function () {
      const condition = $false;
      const yes = new MockTracingExpression($obj);
      const no = new MockTracingExpression($obj);
      const sut = createConditionalExpression(condition, yes as any, no as any);

      astEvaluate(sut, null, null, null);
      assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
      assert.strictEqual(no.calls.length, 1, `no.calls.length`);
    });

    it('connects the "yes" branch', function () {
      const condition = $true;
      const yes = new MockTracingExpression($obj);
      const no = new MockTracingExpression($obj);
      const sut = createConditionalExpression(condition, yes as any, no as any);

      astEvaluate(sut, null, dummyLocator, dummyBinding);
      assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
      assert.strictEqual(no.calls.length, 0, `no.calls.length`);
    });

    it('connects the "no" branch', function () {
      const condition = $false;
      const yes = new MockTracingExpression($obj);
      const no = new MockTracingExpression($obj);
      const sut = createConditionalExpression(condition, yes as any, no as any);

      astEvaluate(sut, null, dummyLocator, dummyBinding);
      assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
      assert.strictEqual(no.calls.length, 1, `no.calls.length`);
    });
  });

  describe('BinaryExpression', function () {
    it(`concats strings`, function () {
      let expression = createBinaryExpression('+', createPrimitiveLiteralExpression('a'), createPrimitiveLiteralExpression('b'));
      let scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'ab', `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression('a'), $null);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'anull', `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', $null, createPrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'nullb', `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression('a'), $undefined);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'aundefined', `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', $undefined, createPrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'undefinedb', `astEvaluate(expression, scope, null, null)`);
    });

    it(`adds numbers`, function () {
      let expression = createBinaryExpression('+', createPrimitiveLiteralExpression(1), createPrimitiveLiteralExpression(2));
      let scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 3, `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression(1), $null);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 1, `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', $null, createPrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, null, null), 2, `astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression(1), $undefined);
      scope = createScopeForTest({});
      assert.strictEqual(isNaN(astEvaluate(expression, scope, null, null) as number), true, `isNaN(astEvaluate(expression, scope, null, null)`);

      expression = createBinaryExpression('+', $undefined, createPrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      assert.strictEqual(isNaN(astEvaluate(expression, scope, null, null) as number), true, `isNaN(astEvaluate(expression, scope, null, null)`);
    });

    it(`concats strings - STRICT`, function () {
      let expression = createBinaryExpression('+', createPrimitiveLiteralExpression('a'), createPrimitiveLiteralExpression('b'));
      let scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'ab', `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression('a'), $null);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'anull', `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', $null, createPrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'nullb', `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression('a'), $undefined);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'aundefined', `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', $undefined, createPrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 'undefinedb', `astEvaluate(expression, scope, { strict: true }, null)`);
    });

    it(`adds numbers - STRICT`, function () {
      let expression = createBinaryExpression('+', createPrimitiveLiteralExpression(1), createPrimitiveLiteralExpression(2));
      let scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 3, `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression(1), $null);
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 1, `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', $null, createPrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      assert.strictEqual(astEvaluate(expression, scope, { strict: true }, null), 2, `astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', createPrimitiveLiteralExpression(1), $undefined);
      scope = createScopeForTest({});
      assert.strictEqual(isNaN(astEvaluate(expression, scope, { strict: true }, null) as number), true, `isNaN(astEvaluate(expression, scope, { strict: true }, null)`);

      expression = createBinaryExpression('+', $undefined, createPrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      assert.strictEqual(isNaN(astEvaluate(expression, scope, { strict: true }, null) as number), true, `isNaN(astEvaluate(expression, scope, { strict: true }, null)`);
    });

    it('handles 10 ** 2', function () {
      const expression = createBinaryExpression('**', createPrimitiveLiteralExpression(10), createPrimitiveLiteralExpression(2));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), 100);
    });

    it('handles 1 >= 1', function () {
      const expression = createBinaryExpression('>=', createPrimitiveLiteralExpression(1), createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), true);
    });

    it('handles 2 >= 1', function () {
      const expression = createBinaryExpression('>=', createPrimitiveLiteralExpression(2), createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), true);
    });

    it('handles 1 >= 2', function () {
      const expression = createBinaryExpression('>=', createPrimitiveLiteralExpression(1), createPrimitiveLiteralExpression(2));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), false);
    });

    it('handles 1 <= 1', function () {
      const expression = createBinaryExpression('<=', createPrimitiveLiteralExpression(1), createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), true);
    });

    it('handles 2 <= 1', function () {
      const expression = createBinaryExpression('<=', createPrimitiveLiteralExpression(2), createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), false);
    });

    it('handles 1 <= 2', function () {
      const expression = createBinaryExpression('<=', createPrimitiveLiteralExpression(1), createPrimitiveLiteralExpression(2));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), true);
    });

    it('handles undefined ?? 1', function () {
      const expression = createBinaryExpression('??', PrimitiveLiteral.$undefined, createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), 1);
    });

    it('handles null ?? 1', function () {
      const expression = createBinaryExpression('??', PrimitiveLiteral.$null, createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), 1);
    });

    it('handles false ?? 1', function () {
      const expression = createBinaryExpression('??', PrimitiveLiteral.$false, createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), false);
    });

    it('handles 0 ?? 1', function () {
      const expression = createBinaryExpression('??', createPrimitiveLiteralExpression(0), createPrimitiveLiteralExpression(1));
      const scope = createScopeForTest({ });
      assert.strictEqual(astEvaluate(expression, scope, null, null), 0);
    });

    class TestData {
      public constructor(
        public expr: BinaryExpression,
        public expected: boolean,
        public scope: Scope = createScopeForTest(),
      ) { }

      public toString() { return `${this.expr}`; }
    }

    describe('performs \'in\'', function () {
      function* getTestData() {
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), createObjectLiteralExpression(['foo'], [$null])), true);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), createObjectLiteralExpression(['bar'], [$null])), false);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression(1), createObjectLiteralExpression(['1'], [$null])), true);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('1'), createObjectLiteralExpression(['1'], [$null])), true);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), $null), false);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), $undefined), false);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), $true), false);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), $parent), false);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('bar'), $parent), false);

        const scope1 = createScopeForTest({ foo: { bar: null }, bar: null });
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), $this), true, scope1);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('bar'), $this), true, scope1);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('foo'), createAccessScopeExpression('foo', 0)), false, scope1);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('bar'), createAccessScopeExpression('bar', 0)), false, scope1);
        yield new TestData(createBinaryExpression('in', createPrimitiveLiteralExpression('bar'), createAccessScopeExpression('foo', 0)), true, scope1);
      }

      for (const item of getTestData()) {
        it(item.toString(), function () {
          assert.strictEqual(astEvaluate(item.expr, item.scope, null, null), item.expected, `astEvaluate(expr, scope, null, null)`);
        });
      }
    });

    describe('performs \'instanceof\'', function () {
      class Foo { }
      class Bar extends Foo { }
      function* getTestData() {
        for (const scope of [
          createScopeForTest({ foo: new Foo(), bar: new Bar() }),
        ]) {
          yield new TestData(
            createBinaryExpression(
              'instanceof',
              createAccessScopeExpression('foo', 0),
              createAccessMemberExpression(createAccessScopeExpression('foo', 0), 'constructor')
            ),
            true,
            scope,
          );
          yield new TestData(
            createBinaryExpression(
              'instanceof',
              createAccessScopeExpression('foo', 0),
              createAccessMemberExpression(createAccessScopeExpression('bar', 0), 'constructor')
            ),
            false,
            scope,
          );
          yield new TestData(
            createBinaryExpression(
              'instanceof',
              createAccessScopeExpression('bar', 0),
              createAccessMemberExpression(createAccessScopeExpression('bar', 0), 'constructor')
            ),
            true,
            scope,
          );
          yield new TestData(
            createBinaryExpression(
              'instanceof',
              createAccessScopeExpression('bar', 0),
              createAccessMemberExpression(createAccessScopeExpression('foo', 0), 'constructor')
            ),
            true,
            scope,
          );
          yield new TestData(
            createBinaryExpression(
              'instanceof',
              createPrimitiveLiteralExpression('foo'),
              createAccessMemberExpression(createAccessScopeExpression('foo', 0), 'constructor')
            ),
            false,
            scope,
          );
        }

        yield new TestData(createBinaryExpression('instanceof', createAccessScopeExpression('foo', 0), createAccessScopeExpression('foo', 0)), false);
        yield new TestData(createBinaryExpression('instanceof', createAccessScopeExpression('foo', 0), $null), false);
        yield new TestData(createBinaryExpression('instanceof', createAccessScopeExpression('foo', 0), $undefined), false);
        yield new TestData(createBinaryExpression('instanceof', $null, createAccessScopeExpression('foo', 0)), false);
        yield new TestData(createBinaryExpression('instanceof', $undefined, createAccessScopeExpression('foo', 0)), false);
      }

      for (const item of getTestData()) {
        it(item.toString(), function () {
          assert.strictEqual(astEvaluate(item.expr, item.scope, null, null), item.expected, `astEvaluate(expr, scope, null, null)`);
        });
      }
    });
  });

  describe('CallMemberExpression', function () {
    it(`evaluates`, function () {
      const expression = createCallMemberExpression(createAccessScopeExpression('foo', 0), 'bar', []);
      let callCount = 0;
      const bindingContext = {
        foo: {
          bar: () => {
            ++callCount;
            return 'baz';
          }
        }
      };
      const scope = createScopeForTest(bindingContext);
      assert.strictEqual(astEvaluate(expression, scope, null, null), 'baz', `astEvaluate(expression, scope, null, null)`);
      assert.strictEqual(callCount, 1, 'callCount');
    });

    it(`evaluate handles null/undefined member`, function () {
      const expression = createCallMemberExpression(createAccessScopeExpression('foo', 0), 'bar', []);
      const s1: Scope = createScopeForTest({ foo: {} });
      const s2: Scope = createScopeForTest({ foo: { bar: undefined } });
      const s3: Scope = createScopeForTest({ foo: { bar: null } });
      assert.strictEqual(astEvaluate(expression, s1, null, null), undefined, `astEvaluate(expression, createScopeForTest({ foo: {} }), null, null)`);
      assert.strictEqual(astEvaluate(expression, s2, null, null), undefined, `astEvaluate(expression, createScopeForTest({ foo: { bar: undefined } }), null, null)`);
      assert.strictEqual(astEvaluate(expression, s3, null, null), undefined, `astEvaluate(expression, createScopeForTest({ foo: { bar: null } }), null, null)`);
    });

    it(`evaluate throws when mustEvaluate and member is null or undefined`, function () {
      const expression = createCallMemberExpression(createAccessScopeExpression('foo', 0), 'bar', []);
      const s1 = createScopeForTest({});
      const s2 = createScopeForTest({ foo: {} });
      const s3 = createScopeForTest({ foo: { bar: undefined } });
      const s4 = createScopeForTest({ foo: { bar: null } });
      assert.throws(() => astEvaluate(expression, s1, { strict: true }, null));
      assert.throws(() => astEvaluate(expression, s2, { strict: true }, null));
      assert.throws(() => astEvaluate(expression, s3, { strict: true }, null));
      assert.throws(() => astEvaluate(expression, s4, { strict: true }, null));
    });
  });

  describe('CallScopeExpression', function () {
    const foo: CallScopeExpression = createCallScopeExpression('foo', [], 0);
    const hello: CallScopeExpression = createCallScopeExpression('hello', [createAccessScopeExpression('arg', 0)], 0);

    function getScopes(initialScope: Scope) {
      return [initialScope];
    }

    it(`evaluates defined property on bindingContext`, function () {
      const [scope] = getScopes(createScopeForTest({ foo: () => 'bar', hello: arg => arg, arg: 'world' }));
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
      assert.strictEqual(astEvaluate(hello, scope, null, null), 'world', `astEvaluate(hello, scope, null, null)`);
    });

    it(`evaluates defined property on overrideContext`, function () {
      const s = createScopeForTest({ abc: () => 'xyz' });
      s.overrideContext.foo = () => 'bar';
      s.overrideContext.hello = arg => arg;
      s.overrideContext.arg = 'world';
      const [scope] = getScopes(s);
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
      assert.strictEqual(astEvaluate(hello, scope, null, null), 'world', `astEvaluate(hello, scope, null, null)`);
    });

    it(`evaluate with connects defined property on bindingContext`, function () {
      const [scope] = getScopes(createScopeForTest({ foo: () => 'bar' }));
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
      astEvaluate(hello, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 0, 'binding.calls.length');
    });

    it(`connects defined property on overrideContext`, function () {
      const s1 = createScopeForTest({ abc: 'xyz' });
      s1.overrideContext.foo = () => 'bar';
      s1.overrideContext.hello = arg => arg;
      s1.overrideContext.arg = 'world';
      const [scope] = getScopes(s1);
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
      astEvaluate(hello, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'arg'], 'binding.calls[0]');
    });

    it(`connects undefined property on bindingContext`, function () {
      const [scope] = getScopes(createScopeForTest({ abc: 'xyz' }));
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
      astEvaluate(hello, scope, dummyLocator, binding);
      // no args length = 0
      assert.strictEqual(binding.calls.length, 0, 'binding.calls.length');
    });

    it(`evaluates defined property on first ancestor bindingContext`, function () {
      const [scope] = getScopes(createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' }));
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
      assert.strictEqual(astEvaluate(hello, scope, null, null), 'world', `astEvaluate(hello, scope, null, null)`);
    });

    it(`evaluates defined property on first ancestor overrideContext`, function () {
      const s1 = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      s1.parent.overrideContext.foo = () => 'bar';
      s1.parent.overrideContext.hello = arg => arg;
      s1.parent.overrideContext.arg = 'world';
      const [scope] = getScopes(s1);
      assert.strictEqual(astEvaluate(foo, scope, null, null), 'bar', `astEvaluate(foo, scope, null, null)`);
      assert.strictEqual(astEvaluate(hello, scope, null, null), 'world', `astEvaluate(hello, scope, null, null)`);
    });

    it(`connects defined property on first ancestor bindingContext`, function () {
      const [scope] = getScopes(createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' }));
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
      astEvaluate(hello, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.bindingContext, 'arg'], 'binding.calls[0]');
    });

    it(`connects defined property on first ancestor overrideContext`, function () {
      const s1 = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      s1.parent.overrideContext.foo = () => 'bar';
      s1.parent.overrideContext.hello = arg => arg;
      s1.parent.overrideContext.arg = 'world';
      const [scope] = getScopes(s1);
      const binding = new MockBinding();
      astEvaluate(foo, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
      astEvaluate(hello, scope, dummyLocator, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observe', scope.parent.overrideContext, 'arg'], 'binding.calls[0]');
    });
  });

  class Test {
    public value: string;
    public constructor() {
      this.value = 'foo';
    }

    public makeString = (cooked: string[], a: any, b: any): string => {
      return `${cooked[0]}${a}${cooked[1]}${b}${cooked[2]}${this.value}`;
    };
  }

  describe('LiteralTemplate', function () {
    class TestData {
      public constructor(
        public readonly expr: TemplateExpression | TaggedTemplateExpression,
        public readonly expected: string,
        public readonly ctx: any = {},
        public readonly hsCtx: any = null,
        public readonly only: boolean = false
      ) { }

      public get scope() { return createScopeForTest(this.ctx); }
    }
    function* getTestData() {
      yield new TestData($tpl, '');
      yield new TestData(createTemplateExpression(['foo']), 'foo');
      yield new TestData(createTemplateExpression(['foo', 'baz'], [createPrimitiveLiteralExpression('bar')]), 'foobarbaz');
      yield new TestData(
        createTemplateExpression(
          ['a', 'c', 'e', 'g'],
          [createPrimitiveLiteralExpression('b'), createPrimitiveLiteralExpression('d'), createPrimitiveLiteralExpression('f')]
        ),
        'abcdefg',
      );
      yield new TestData(
        createTemplateExpression(['a', 'c', 'e'], [createAccessScopeExpression('b', 0), createAccessScopeExpression('d', 0)]),
        'a1c2e',
        { b: 1, d: 2 }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          [''],
          [],
          createAccessScopeExpression('foo', 0)
        ),
        'foo',
        { foo: () => 'foo' }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          ['foo'],
          ['bar'],
          createAccessScopeExpression('baz', 0)
        ),
        'foobar',
        { baz: cooked => `${cooked[0]}${cooked.raw[0]}` }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          ['1', '2'],
          [],
          createAccessScopeExpression('makeString', 0),
          [createPrimitiveLiteralExpression('foo')]
        ),
        '1foo2',
        { makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          ['1', '2'],
          [],
          createAccessScopeExpression('makeString', 0),
          [createAccessScopeExpression('foo', 0)]
        ),
        '1bar2',
        { foo: 'bar', makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          ['1', '2', '3'],
          [],
          createAccessScopeExpression('makeString', 0),
          [createAccessScopeExpression('foo', 0), createAccessScopeExpression('bar', 0)]
        ),
        'bazqux',
        { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => `${foo}${bar}` }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          ['1', '2', '3'],
          [],
          createAccessMemberExpression(createAccessScopeExpression('test', 0), 'makeString'),
          [createAccessScopeExpression('foo', 0), createAccessScopeExpression('bar', 0)]
        ),
        '1baz2qux3foo',
        { foo: 'baz', bar: 'qux', test: new Test() }
      );
      yield new TestData(
        createTaggedTemplateExpression(
          ['1', '2', '3'],
          [],
          createAccessKeyedExpression(createAccessScopeExpression('test', 0), createPrimitiveLiteralExpression('makeString')),
          [createAccessScopeExpression('foo', 0), createAccessScopeExpression('bar', 0)]
        ),
        '1baz2qux3foo',
        { foo: 'baz', bar: 'qux', test: new Test() }
      );
    }

    for (const item of getTestData()) {
      const $it = item.only ? it.only : it;
      $it(`${item.expr} evaluates ${item.expected}`, function () {
        assert.strictEqual(astEvaluate(item.expr, item.scope, null, null), item.expected, `astEvaluate(item.expr, scope, null, null)`);
      });
    }
  });

  describe('UnaryExpression', function () {
    describe('performs \'typeof\'', function () {
      const tests: { expr: UnaryExpression; expected: string }[] = [
        { expr: createUnaryExpression('typeof', createPrimitiveLiteralExpression('foo')), expected: 'string' },
        { expr: createUnaryExpression('typeof', createPrimitiveLiteralExpression(1)), expected: 'number' },
        { expr: createUnaryExpression('typeof', $null), expected: 'object' },
        { expr: createUnaryExpression('typeof', $undefined), expected: 'undefined' },
        { expr: createUnaryExpression('typeof', $true), expected: 'boolean' },
        { expr: createUnaryExpression('typeof', $false), expected: 'boolean' },
        { expr: createUnaryExpression('typeof', $arr), expected: 'object' },
        { expr: createUnaryExpression('typeof', $obj), expected: 'object' },
        { expr: createUnaryExpression('typeof', $this), expected: 'object' },
        { expr: createUnaryExpression('typeof', $parent), expected: 'undefined' },
        { expr: createUnaryExpression('typeof', createAccessScopeExpression('foo', 0)), expected: 'undefined' }
      ];
      const scope: Scope = createScopeForTest({});

      for (const { expr, expected } of tests) {
        it(expr.toString(), function () {
          assert.strictEqual(astEvaluate(expr, scope, null, null), expected, `astEvaluate(expr, scope, null)`);
        });
      }
    });

    describe('performs \'void\'', function () {
      const tests: { expr: UnaryExpression }[] = [
        { expr: createUnaryExpression('void', createPrimitiveLiteralExpression('foo')) },
        { expr: createUnaryExpression('void', createPrimitiveLiteralExpression(1)) },
        { expr: createUnaryExpression('void', $null) },
        { expr: createUnaryExpression('void', $undefined) },
        { expr: createUnaryExpression('void', $true) },
        { expr: createUnaryExpression('void', $false) },
        { expr: createUnaryExpression('void', $arr) },
        { expr: createUnaryExpression('void', $obj) },
        { expr: createUnaryExpression('void', $this) },
        { expr: createUnaryExpression('void', $parent) },
        { expr: createUnaryExpression('void', createAccessScopeExpression('foo', 0)) }
      ];
      let scope: Scope = createScopeForTest({});

      for (const { expr } of tests) {
        it(expr.toString(), function () {
          assert.strictEqual(astEvaluate(expr, scope, null, null), undefined, `astEvaluate(expr, scope, null)`);
        });
      }

      it('void foo()', function () {
        let fooCalled = false;
        const foo = () => (fooCalled = true);
        scope = createScopeForTest({ foo });
        const expr = createUnaryExpression('void', createCallScopeExpression('foo', [], 0));
        assert.strictEqual(astEvaluate(expr, scope, null, null), undefined, `astEvaluate(expr, scope, null)`);
        assert.strictEqual(fooCalled, true, `fooCalled`);
      });
    });
  });

  describe('DestructuringAssignmentExpression', function () {

    describe('DestructuringAssignmentSingleExpression', function () {

      it('{a} = {a:42}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'a'),
          void 0,
        ), Scope.create(bc), null, null, { a: 42 });
        assert.strictEqual(bc.a, 42);
      });

      it('{1:a} = {1:"42"}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, '1'),
          void 0,
        ), Scope.create(bc), null, null, { 1: '42' });
        assert.strictEqual(bc.a, '42');
      });

      it('{x:a} = {x:"42"}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'x'),
          void 0,
        ), Scope.create(bc), null, null, { x: '42' });
        assert.strictEqual(bc.a, '42');
      });

      it('{a=42} = {b:404}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'a'),
          createPrimitiveLiteralExpression(42),
        ), Scope.create(bc), null, null, { b: 404 });
        assert.strictEqual(bc.a, 42);
      });

      it('{1:a=42} = {2:"404"}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, '1'),
          createPrimitiveLiteralExpression(42),
        ), Scope.create(bc), null, null, { 2: "404" });
        assert.strictEqual(bc.a, 42);
      });

      it('{x:a=42} = {b:404}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'x'),
          createPrimitiveLiteralExpression(42),
        ), Scope.create(bc), null, null, { b: 404 });
        assert.strictEqual(bc.a, 42);
      });

      it('{a=404} = {a:42}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'a'),
          createPrimitiveLiteralExpression(404),
        ), Scope.create(bc), null, null, { a: 42 });
        assert.strictEqual(bc.a, 42);
      });

      it('{1:a=404} = {1:"42"}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, '1'),
          createPrimitiveLiteralExpression(404),
        ), Scope.create(bc), null, null, { 1: '42' });
        assert.strictEqual(bc.a, '42');
      });

      it('{x:a=404} = {x:"42"}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'x'),
          createPrimitiveLiteralExpression(404),
        ), Scope.create(bc), null, null, { x: '42' });
        assert.strictEqual(bc.a, '42');
      });

      it('[a] = [42]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
          void 0,
        ), Scope.create(bc), null, null, [42]);
        assert.strictEqual(bc.a, 42);
      });

      it('[a=42] = []', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
          createPrimitiveLiteralExpression(42),
        ), Scope.create(bc), null, null, []);
        assert.strictEqual(bc.a, 42);
      });

      it('[,a=42] = [404]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
          createPrimitiveLiteralExpression(42),
        ), Scope.create(bc), null, null, [404]);
        assert.strictEqual(bc.a, 42);
      });

      it('{a=vm_prop} = {x:404}', function () {
        const ps = Scope.create({ prop: 42 });
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'a'),
          createAccessScopeExpression('prop', 0),
        ), Scope.fromParent(ps, bc), null, null, { x: 404 });
        assert.strictEqual(bc.a, 42);
      });

      it('[,a=vm_prop] = [404]', function () {
        const ps = Scope.create({ prop: 42 });
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
          createAccessScopeExpression('prop', 0),
        ), Scope.fromParent(ps, bc), null, null, [404]);
        assert.strictEqual(bc.a, 42);
      });

      it('{a=$parent.vm_prop} = {x:404}', function () {
        const ps = Scope.create({ prop: 42 });
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessMemberExpression($this, 'a'),
          createAccessScopeExpression('prop', 2),
        ), Scope.fromParent(Scope.fromParent(ps, Object.create(null)), bc), null, null, { x: 404 });
        assert.strictEqual(bc.a, 42);
      });

      it('[,a=$parent.vm_prop] = [404]', function () {
        const ps = Scope.create({ prop: 42 });
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentSingleExpression(
          createAccessMemberExpression($this, 'a'),
          createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
          createAccessScopeExpression('prop', 2),
        ), Scope.fromParent(Scope.fromParent(ps, Object.create(null)), bc), null, null, [404]);
        assert.strictEqual(bc.a, 42);
      });
    });

    describe('DestructuringAssignmentRestExpression', function () {

      it('{...rest} = {a:1, b:2}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          [],
        ), Scope.create(bc), null, null, { a: 1, b: 2 });
        assert.deepStrictEqual(bc, { rest: { a: 1, b: 2 } });
      });

      it('{a, ...rest} = {a:1, b:2}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          ['a'],
        ), Scope.create(bc), null, null, { a: 1, b: 2 });
        assert.deepStrictEqual(bc, { rest: { b: 2 } });
      });

      it('{a, b, ...rest} = {a:1, b:2, c:3}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          ['a', 'b'],
        ), Scope.create(bc), null, null, { a: 1, b: 2, c: 3 });
        assert.deepStrictEqual(bc, { rest: { c: 3 } });
      });

      it('{a, b, ...rest} = {a:1, b:2}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          ['a', 'b'],
        ), Scope.create(bc), null, null, { a: 1, b: 2 });
        assert.deepStrictEqual(bc, { rest: {} });
      });

      it('[...rest] = [1, 2]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          0,
        ), Scope.create(bc), null, null, [1, 2]);
        assert.deepStrictEqual(bc, { rest: [1, 2] });
      });

      it('[,...rest] = [1, 2]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          1,
        ), Scope.create(bc), null, null, [1, 2]);
        assert.deepStrictEqual(bc, { rest: [2] });
      });

      it('[,,...rest] = [1, 2]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentRestExpression(
          createAccessMemberExpression($this, 'rest'),
          3,
        ), Scope.create(bc), null, null, [1, 2]);
        assert.deepStrictEqual(bc, { rest: [] });
      });
    });

    describe('DestructuringAssignmentExpression', function () {

      it('{a} = {a: 1, b:2}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'a'),
              createAccessMemberExpression($this, 'a'),
              void 0
            )
          ],
          void 0,
          void 0
        ), Scope.create(bc), null, null, { a: 1, b: 2 });
        assert.deepStrictEqual(bc, { a: 1 });
      });

      it('{a, b} = {a: 1, b:2}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'a'),
              createAccessMemberExpression($this, 'a'),
              void 0
            ),
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'b'),
              createAccessMemberExpression($this, 'b'),
              void 0
            ),
          ],
          void 0,
          void 0
        ), Scope.create(bc), null, null, { a: 1, b: 2 });
        assert.deepStrictEqual(bc, { a: 1, b: 2 });
      });

      it('{...rest} = {a: 1, b:2}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentRestExpression(
              createAccessMemberExpression($this, 'rest'),
              []
            ),
          ],
          void 0,
          void 0
        ), Scope.create(bc), null, null, { a: 1, b: 2 });
        assert.deepStrictEqual(bc.rest, { a: 1, b: 2 });
      });

      it('[a] = [1, 2]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'a'),
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
              void 0
            ),
          ],
          void 0,
          void 0
        ), Scope.create(bc), null, null, [1, 2]);
        assert.deepStrictEqual(bc, { a: 1 });
      });

      it('[a, b] = [1, 2]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'a'),
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
              void 0
            ),
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'b'),
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
              void 0
            ),
          ],
          void 0,
          void 0
        ), Scope.create(bc), null, null, [1, 2]);
        assert.deepStrictEqual(bc, { a: 1, b: 2 });
      });

      it('[...rest] = [1, 2]', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentRestExpression(
              createAccessMemberExpression($this, 'rest'),
              0,
            ),
          ],
          void 0,
          void 0
        ), Scope.create(bc), null, null, [1, 2]);
        assert.deepStrictEqual(bc, { rest: [1, 2] });
      });

      it('{prop1, prop2:{prop21}} = {prop1: "foo", prop2: {prop21: 123}}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'prop1'),
              createAccessMemberExpression($this, 'prop1'),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ObjectDestructuring',
              [
                createDestructuringAssignmentSingleExpression(
                  createAccessMemberExpression($this, 'prop21'),
                  createAccessMemberExpression($this, 'prop21'),
                  void 0
                ),
              ],
              createAccessMemberExpression($this, 'prop2'),
              void 0,
            ),
          ],
          void 0,
          void 0,
        ), Scope.create(bc), null, null, { prop1: 'foo', prop2: { prop21: 123 } });
        assert.deepStrictEqual(bc, { prop1: 'foo', prop21: 123 });
      });

      it('{prop1, prop2:{prop21:{prop212:newProp212}, prop22}} = {prop1: "foo", prop2: {prop21: {prop211: 123, prop212: 456}, prop22: "bar" }}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'prop1'),
              createAccessMemberExpression($this, 'prop1'),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ObjectDestructuring',
              [
                createDestructuringAssignmentExpression(
                  'ObjectDestructuring',
                  [
                    createDestructuringAssignmentSingleExpression(
                      createAccessMemberExpression($this, 'newProp212'),
                      createAccessMemberExpression($this, 'prop212'),
                      void 0
                    ),
                  ],
                  createAccessMemberExpression($this, 'prop21'),
                  void 0,
                ),
                createDestructuringAssignmentSingleExpression(
                  createAccessMemberExpression($this, 'prop22'),
                  createAccessMemberExpression($this, 'prop22'),
                  void 0
                ),
              ],
              createAccessMemberExpression($this, 'prop2'),
              void 0,
          ),
          ],
          void 0,
          void 0,
        ), Scope.create(bc), null, null, { prop1: 'foo', prop2: { prop21: { prop211: 123, prop212: 456 }, prop22: 'bar' } });
        assert.deepStrictEqual(bc, { prop1: 'foo', newProp212: 456, prop22: 'bar' });
      });

      it('{prop1,coll:[,{p2:item2p2}]} = {prop1:"foo",coll:[{p1:1,p2:2},{p1:3,p2:4}]}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'prop1'),
              createAccessMemberExpression($this, 'prop1'),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ArrayDestructuring',
              [
                createDestructuringAssignmentExpression(
                  'ObjectDestructuring',
                  [
                    createDestructuringAssignmentSingleExpression(
                      createAccessMemberExpression($this, 'item2p2'),
                      createAccessMemberExpression($this, 'p2'),
                      void 0,
                    )
                  ],
                  createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
                  void 0,
                )
              ],
              createAccessMemberExpression($this, 'coll'),
          void 0,
          ),
          ],
          void 0,
          void 0,
          ), Scope.create(bc), null, null, { prop1: 'foo', coll: [{ p1: 1, p2: 2 }, { p1: 3, p2: 4 }] });
        assert.deepStrictEqual(bc, { prop1: 'foo', item2p2: 4 });
      });

      it('{prop1,coll:[,{p:[item21]}]} = {prop1:"foo",coll:[{p:[1,2]},{p:[3,4]}]}', function () {
        const bc: Record<string, any> = {};
        astAssign(createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'prop1'),
              createAccessMemberExpression($this, 'prop1'),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ArrayDestructuring',
              [
                createDestructuringAssignmentExpression(
                  'ObjectDestructuring',
                  [
                    createDestructuringAssignmentExpression(
                      'ArrayDestructuring',
                      [
                        createDestructuringAssignmentSingleExpression(
                          createAccessMemberExpression($this, 'item21'),
                          createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
                          void 0
                        ),
                      ],
                      createAccessMemberExpression($this,'p'),
                      void 0,
                    ),
                  ],
                  createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
                  void 0,
                )
              ],
              createAccessMemberExpression($this, 'coll'),
              void 0,
            ),
          ],
          void 0,
          void 0,
        ), Scope.create(bc), null, null, { prop1: "foo", coll: [{ p: [1, 2] }, { p: [3, 4] }] });
        assert.deepStrictEqual(bc, { prop1: 'foo', item21: 3 });
      });

      it('[k, {prop1, prop2:{prop21}}] = ["key",{prop1: "foo", prop2: {prop21: 123}}]', function () {
        const bc: Record<string, any> = {};

        astAssign(createDestructuringAssignmentExpression(
          'ArrayDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'k'),
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ObjectDestructuring',
              [
                createDestructuringAssignmentSingleExpression(
                  createAccessMemberExpression($this, 'prop1'),
                  createAccessMemberExpression($this, 'prop1'),
                  void 0
                ),
                createDestructuringAssignmentExpression(
                  'ObjectDestructuring',
                  [
                    createDestructuringAssignmentSingleExpression(
                      createAccessMemberExpression($this, 'prop21'),
                      createAccessMemberExpression($this, 'prop21'),
                      void 0
                    ),
                  ],
                  createAccessMemberExpression($this, 'prop2'),
                  void 0,
                ),
              ],
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
              void 0,
            )
          ],
          void 0,
          void 0,
          ), Scope.create(bc), null, null, ['key', { prop1: 'foo', prop2: { prop21: 123 } }]);
        assert.deepStrictEqual(bc, { k: 'key', prop1: 'foo', prop21: 123 });
      });

      it('[k, [,item2]] = ["key",[1,2]]', function () {
        const bc: Record<string, any> = {};

        astAssign(createDestructuringAssignmentExpression(
          'ArrayDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'k'),
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(0)),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ArrayDestructuring',
              [
                createDestructuringAssignmentSingleExpression(
                  createAccessMemberExpression($this, 'item2'),
                  createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
                  void 0
                )
              ],
              createAccessKeyedExpression($this, createPrimitiveLiteralExpression(1)),
              void 0,
            )
          ],
          void 0,
          void 0,
          ), Scope.create(bc), null, null, ['key', [1,2]]);
        assert.deepStrictEqual(bc, { k: 'key', item2: 2 });
      });

      it('{a,b:{c}={c:42}} = {a:42}', function () {
        const bc: Record<string, any> = {};

        const expr = createDestructuringAssignmentExpression(
          'ObjectDestructuring',
          [
            createDestructuringAssignmentSingleExpression(
              createAccessMemberExpression($this, 'a'),
              createAccessMemberExpression($this, 'a'),
              void 0
            ),
            createDestructuringAssignmentExpression(
              'ObjectDestructuring',
              [
                createDestructuringAssignmentSingleExpression(
                  createAccessMemberExpression($this, 'c'),
                  createAccessMemberExpression($this, 'c'),
                  void 0
                )
              ],
              createAccessMemberExpression($this, 'b'),
              createObjectLiteralExpression(['c'], [createPrimitiveLiteralExpression(42)])
            )
          ],
          void 0,
          void 0
        );
        astAssign(expr, Scope.create(bc), null, null, {a:42});
        assert.deepStrictEqual(bc, { a:42, c:42});
      });
    });
  });

  describe('arrow function unparsing', function () {
    it('unparses arrow fn', function () {
      assert.strictEqual(
        Unparser.unparse(createArrowFunction([createBindingIdentifier('a')], createAccessScopeExpression('a'))),
        '(a) => a'
      );
    });

    it('unparses arrow fn with single rest parameter', function () {
      assert.strictEqual(
        Unparser.unparse(createArrowFunction([createBindingIdentifier('a')], createAccessScopeExpression('a'), true)),
        '(...a) => a'
      );
    });

    it('unparses arrow fn with 2 params', function () {
      assert.strictEqual(
        Unparser.unparse(createArrowFunction([createBindingIdentifier('a'), createBindingIdentifier('b')], createAccessScopeExpression('a'))),
        '(a, b) => a'
      );
    });

    it('unparses arrow fn with 2 params with rest', function () {
      assert.strictEqual(
        Unparser.unparse(createArrowFunction([createBindingIdentifier('a'), createBindingIdentifier('b')], createAccessScopeExpression('a'), true)),
        '(a, ...b) => a'
      );
    });
  });
});
