import { IServiceLocator, Writable, IIndexable } from '@aurelia/kernel';
import {
  eachCartesianJoin,
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
  ExpressionKind,
  IConnectableBinding,
  // IsBinary,
  IsBindingBehavior,
  Scope,
  IsLeftHandSide,
  // IsPrimary,
  // IsUnary,
  LifecycleFlags as LF,
  ObjectLiteralExpression,
  OverrideContext,
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
  IAstEvaluator,
} from '@aurelia/runtime';

const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
// const $str = PrimitiveLiteralExpression.$empty;
const $arr = ArrayLiteralExpression.$empty;
const $obj = ObjectLiteralExpression.$empty;
const $tpl = TemplateExpression.$empty;
const $this = AccessThisExpression.$this;
const $parent = AccessThisExpression.$parent;

const dummyLocator = { get: () => null } as unknown as IServiceLocator;
const dummyLocatorThatReturnsNull = {
  get() {
    return null;
  },
} as unknown as IServiceLocator;
const dummyBinding = {
  observe: () => { return; },
  locator: dummyLocator
} as unknown as IConnectableBinding;
const dummyBindingWithLocatorThatReturnsNull = {
  observe: () => { return; },
  locator: dummyLocatorThatReturnsNull,
} as unknown as IConnectableBinding;
const dummyScope = Scope.create({});

function assignDoesNotThrow(inputs: [string, IsBindingBehavior][]) {
  describe('assign() does not throw / is a no-op', function () {
    for (const [text, expr] of inputs) {
      it(`${text}, null`, function () {
        expr.assign(null, null, null);
      });
    }
  });
}

function throwsOn<
  TExpr extends IsBindingBehavior,
  TMethod extends keyof TExpr,
  >(expr: TExpr, method: TMethod, msg: string, ...args: TExpr[TMethod] extends ((...args: infer TArgs) => any) ? TArgs : never): void {
  let err = null;
  try {
    (expr as any)[method](...args);
  } catch (e) {
    err = e;
  }
  assert.notStrictEqual(err, null, 'err');
  if (msg?.length) {
    assert.includes(err.message, msg, 'err.message.includes(msg)');
  }
}

// const $num1 = new PrimitiveLiteralExpression(1);
// const $str1 = new PrimitiveLiteralExpression('1');

describe('AST', function () {

  const AccessThisList: [string, AccessThisExpression][] = [
    [`$this`, $this],
    [`$parent`, $parent],
    [`$parent.$parent`, new AccessThisExpression(2)]
  ];
  const AccessScopeList: [string, AccessScopeExpression][] = [
    ...AccessThisList.map(([input, expr]) => [`${input}.a`, new AccessScopeExpression('a', expr.ancestor)] as [string, any]),
    [`$this.$parent`, new AccessScopeExpression('$parent')],
    [`$host.$parent`, new AccessScopeExpression('$parent', undefined)],
    [`$parent.$this`, new AccessScopeExpression('$this', 1)],
    [`a`, new AccessScopeExpression('a')]
  ];
  const StringLiteralList: [string, PrimitiveLiteralExpression][] = [
    [`''`, PrimitiveLiteralExpression.$empty]
  ];
  const NumberLiteralList: [string, PrimitiveLiteralExpression][] = [
    [`1`, new PrimitiveLiteralExpression(1)],
    [`1.1`, new PrimitiveLiteralExpression(1.1)],
    [`.1`, new PrimitiveLiteralExpression(0.1)],
    [`0.1`, new PrimitiveLiteralExpression(0.1)]
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
    [`\`\${a}\``, new TemplateExpression(['', ''], [new AccessScopeExpression('a')])]
  ];
  // const PrimaryList: [string, IsPrimary][] = [
  //   ...AccessThisList,
  //   ...AccessScopeList,
  //   ...LiteralList
  // ];
  // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  // const SimpleAccessKeyedList: [string, IsLeftHandSide][] = [
  //   ...AccessScopeList
  //     .map(([input, expr]) => [`${input}[b]`, new AccessKeyedExpression(expr, new AccessScopeExpression('b'))] as [string, any])
  // ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  // const SimpleAccessMemberList: [string, IsLeftHandSide][] = [
  //   ...AccessScopeList
  //     .map(([input, expr]) => [`${input}.b`, new AccessMemberExpression(expr, 'b')] as [string, any])
  // ];
  // 4. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}\`\``, new TaggedTemplateExpression([''], [''], expr, [])] as [string, any]),

    ...AccessScopeList
      .map(([input, expr]) => [`${input}\`\${a}\``, new TaggedTemplateExpression(['', ''], ['', ''], expr, [new AccessScopeExpression('a')])] as [string, any])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}()`, new CallFunctionExpression(expr, [])] as [string, any])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}()`, new CallScopeExpression((expr as any).name, [], expr.ancestor)] as [string, any])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}.b()`, new CallMemberExpression(expr, 'b', [])] as [string, any])
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
    [`!$1`, new UnaryExpression('!', new AccessScopeExpression('$1'))],
    [`-$2`, new UnaryExpression('-', new AccessScopeExpression('$2'))],
    [`+$3`, new UnaryExpression('+', new AccessScopeExpression('$3'))],
    [`void $4`, new UnaryExpression('void', new AccessScopeExpression('$4'))],
    [`typeof $5`, new UnaryExpression('typeof', new AccessScopeExpression('$5'))]
  ];
  // concatenation of UnaryExpression + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.UnaryExpression
  // const SimpleIsUnaryList: [string, IsUnary][] = [
  //   ...SimpleIsLeftHandSideList,
  //   ...SimpleUnaryList
  // ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, BinaryExpression][] = [
    [`$6*$7`, new BinaryExpression('*', new AccessScopeExpression('$6'), new AccessScopeExpression('$7'))],
    [`$8%$9`, new BinaryExpression('%', new AccessScopeExpression('$8'), new AccessScopeExpression('$9'))],
    [`$10/$11`, new BinaryExpression('/', new AccessScopeExpression('$10'), new AccessScopeExpression('$11'))]
  ];
  // const SimpleIsMultiplicativeList: [string, IsBinary][] = [
  //   ...SimpleIsUnaryList,
  //   ...SimpleMultiplicativeList
  // ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, BinaryExpression][] = [
    [`$12+$13`, new BinaryExpression('+', new AccessScopeExpression('$12'), new AccessScopeExpression('$13'))],
    [`$14-$15`, new BinaryExpression('-', new AccessScopeExpression('$14'), new AccessScopeExpression('$15'))]
  ];
  // const SimpleIsAdditiveList: [string, IsBinary][] = [
  //   ...SimpleIsMultiplicativeList,
  //   ...SimpleAdditiveList
  // ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, BinaryExpression][] = [
    [`$16<$17`, new BinaryExpression('<', new AccessScopeExpression('$16'), new AccessScopeExpression('$17'))],
    [`$18>$19`, new BinaryExpression('>', new AccessScopeExpression('$18'), new AccessScopeExpression('$19'))],
    [`$20<=$21`, new BinaryExpression('<=', new AccessScopeExpression('$20'), new AccessScopeExpression('$21'))],
    [`$22>=$23`, new BinaryExpression('>=', new AccessScopeExpression('$22'), new AccessScopeExpression('$23'))],
    [`$24 in $25`, new BinaryExpression('in', new AccessScopeExpression('$24'), new AccessScopeExpression('$25'))],
    [`$26 instanceof $27`, new BinaryExpression('instanceof', new AccessScopeExpression('$26'), new AccessScopeExpression('$27'))]
  ];
  // const SimpleIsRelationalList: [string, IsBinary][] = [
  //   ...SimpleIsAdditiveList,
  //   ...SimpleRelationalList
  // ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, BinaryExpression][] = [
    [`$28==$29`, new BinaryExpression('==', new AccessScopeExpression('$28'), new AccessScopeExpression('$29'))],
    [`$30!=$31`, new BinaryExpression('!=', new AccessScopeExpression('$30'), new AccessScopeExpression('$31'))],
    [`$32===$33`, new BinaryExpression('===', new AccessScopeExpression('$32'), new AccessScopeExpression('$33'))],
    [`$34!==$35`, new BinaryExpression('!==', new AccessScopeExpression('$34'), new AccessScopeExpression('$35'))]
  ];
  // const SimpleIsEqualityList: [string, IsBinary][] = [
  //   ...SimpleIsRelationalList,
  //   ...SimpleEqualityList
  // ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, BinaryExpression][] = [
    [`$36&&$37`, new BinaryExpression('&&', new AccessScopeExpression('$36'), new AccessScopeExpression('$37'))]
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, BinaryExpression][] = [
    [`$38||$39`, new BinaryExpression('||', new AccessScopeExpression('$38'), new AccessScopeExpression('$39'))]
  ];

  // This forms the group Precedence.ConditionalExpression
  const SimpleConditionalList: [string, ConditionalExpression][] = [
    [`a?b:c`, new ConditionalExpression(new AccessScopeExpression('a'), new AccessScopeExpression('b'), new AccessScopeExpression('c'))]
  ];

  // This forms the group Precedence.AssignExpression
  // const SimpleAssignList: [string, AssignExpression][] = [
  //   [`a=b`, new AssignExpression(new AccessScopeExpression('a'), new AccessScopeExpression('b'))]
  // ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, ValueConverterExpression][] = [
    [`a|b`, new ValueConverterExpression(new AccessScopeExpression('a'), 'b', [])],
    [`a|b:c`, new ValueConverterExpression(new AccessScopeExpression('a'), 'b', [new AccessScopeExpression('c')])],
    [`a|b:c:d`, new ValueConverterExpression(new AccessScopeExpression('a'), 'b', [new AccessScopeExpression('c'), new AccessScopeExpression('d')])]
  ];

  const SimpleBindingBehaviorList: [string, BindingBehaviorExpression][] = [
    [`a&b`, new BindingBehaviorExpression(new AccessScopeExpression('a'), 'b', [])],
    [`a&b:c`, new BindingBehaviorExpression(new AccessScopeExpression('a'), 'b', [new AccessScopeExpression('c')])],
    [`a&b:c:d`, new BindingBehaviorExpression(new AccessScopeExpression('a'), 'b', [new AccessScopeExpression('c'), new AccessScopeExpression('d')])]
  ];

  describe('Literals', function () {
    describe('evaluate() works without any input', function () {
      for (const [text, expr] of [
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList
      ]) {
        it(text, function () {
          assert.strictEqual(expr.evaluate(undefined, undefined, null), expr.value, `expr.evaluate(undefined, undefined)`);
        });
      }
      for (const [text, expr] of TemplateLiteralList) {
        it(text, function () {
          assert.strictEqual(expr.evaluate(undefined, undefined, null), '', `expr.evaluate(undefined, undefined)`);
        });
      }
      for (const [text, expr] of ArrayLiteralList) {
        it(text, function () {
          assert.instanceOf(expr.evaluate(undefined, undefined, null), Array, 'expr.evaluate(undefined, undefined)');
        });
      }
      for (const [text, expr] of ObjectLiteralList) {
        it(text, function () {
          assert.instanceOf(expr.evaluate(undefined, undefined, null), Object, 'expr.evaluate(undefined, undefined)');
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
    describe('evaluate() throws when returned converter is nil', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', `AUR0103:b`, dummyScope, dummyLocatorThatReturnsNull, null);
          // throwsOn(expr, 'evaluate', `ValueConverter named 'b' could not be found. Did you forget to register it as a dependency?`, LF.none, dummyScope, dummyLocatorThatReturnsNull, null);
        });
      }
    });

    describe('assign() throws when returned converter is null', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, null`, function () {
          throwsOn(expr, 'assign', `AUR0103:b`, dummyScope, dummyLocatorThatReturnsNull, null);
          // throwsOn(expr, 'assign', `ValueConverter named 'b' could not be found. Did you forget to register it as a dependency?`, LF.none, dummyScope, dummyLocatorThatReturnsNull, null);
        });
      }
    });
  });

  describe('BindingBehaviorExpression', function () {
    describe('bind() throws when returned behavior is null', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'bind', `AUR0101:b`, LF.none, dummyScope, dummyBindingWithLocatorThatReturnsNull);
          // throwsOn(expr, 'bind', `BindingBehavior named 'b' could not be found. Did you forget to register it as a dependency?`, LF.none, dummyScope, dummyBindingWithLocatorThatReturnsNull);
        });
      }
    });
  });
});

describe('AccessKeyedExpression', function () {
  let expression: AccessKeyedExpression;

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    expression = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), new PrimitiveLiteralExpression('bar'));
  });

  it('evaluates member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.evaluate(scope, null, null), 'baz', `expression.evaluate(scope, null)`);
  });

  it('evaluates member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    assert.strictEqual(expression.evaluate(scope, null, null), 'baz', `expression.evaluate(scope, null)`);
  });

  it('assigns member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(scope, null, 'bang');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('assigns member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(scope, null, 'bang');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);
  });

  it('evaluates null/undefined object', function () {
    let scope = createScopeForTest({ foo: null });
    assert.strictEqual(expression.evaluate(scope, null, null), undefined, `expression.evaluate(scope, null, null)`);
    scope = createScopeForTest({ foo: undefined });
    assert.strictEqual(expression.evaluate(scope, null, null), undefined, `expression.evaluate(scope, null, null)`);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), undefined, `expression.evaluate(scope, null, null)`);
  });

  it('does not observes property in keyed object access when key is number', function () {
    const scope = createScopeForTest({ foo: { '0': 'hello world' } });
    const expression2 = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), new PrimitiveLiteralExpression(0));
    assert.strictEqual(expression2.evaluate(scope, null, null), 'hello world', `expression2.evaluate(scope, null)`);
    const binding = new MockBinding();
    expression2.evaluate(scope, dummyLocator, binding);
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
    assert.deepStrictEqual(binding.calls[1], ['observe', scope.bindingContext.foo, 0], 'binding.calls[1]');
    assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');
  });

  it('observes property in keyed array access when key is number', function () {
    const scope = createScopeForTest({ foo: ['hello world'] });
    const expression3 = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), new PrimitiveLiteralExpression(0));
    assert.strictEqual(expression3.evaluate(scope, null, null), 'hello world', `expression3.evaluate(scope, null)`);
    const binding = new MockBinding();
    expression3.evaluate(scope, dummyLocator, binding);
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
    assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');
  });

  describe('does not attempt to observe property when object is primitive', function () {
    const objects: [string, any][] = [
      [`     null`, null],
      [`undefined`, undefined],
      [`       ''`, ''],
      [`1`, 1],
      [`     true`, true],
      [`    false`, false],
      [` Symbol()`, Symbol()]
    ];
    const keys: [string, any][] = [
      [`[0]  `, new PrimitiveLiteralExpression(0)],
      [`['a']`, new PrimitiveLiteralExpression('a')]
    ];
    const inputs: [typeof objects, typeof keys] = [objects, keys];

    eachCartesianJoin(inputs, (([t1, obj], [t2, key]) => {
      it(`${t1}${t2}`, function () {
        const scope = createScopeForTest({ foo: obj });
        const sut = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), key);
        const binding = new MockBinding();
        sut.evaluate(scope, dummyLocator, binding);
        assert.strictEqual(binding.calls.length, 1);
        assert.strictEqual(binding.calls[0][0], 'observe');
      });
    }));
  });
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

  const expression: AccessMemberExpression = new AccessMemberExpression(new AccessScopeExpression('foo', 0), 'bar');

  eachCartesianJoinFactory.call(this, inputs, (([t1, obj, _isFalsey, canHaveProperty], [t2, prop, value]) => {
    it(`STRICT - ${t1}.${t2}.evaluate() -> connect -> assign`, function () {
      const scope = createScopeForTest({ foo: obj });
      const evaluator = { strict: true } as unknown as IAstEvaluator;
      const sut = new AccessMemberExpression(new AccessScopeExpression('foo', 0), prop);
      const actual = sut.evaluate(scope, evaluator , null);
      if (canHaveProperty) {
        assert.strictEqual(actual, value, `actual`);
      } else {
        if (obj === null) {
          assert.strictEqual(actual, null, `actual`);
        } else {
          assert.strictEqual(actual, undefined, `actual`);
        }
      }
      const binding = new MockBinding();
      sut.evaluate(scope, dummyLocator, binding);
      if (canHaveProperty) {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 2, `binding.calls.filter(c => c[0] === 'observe').length`);
      } else {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 1, `binding.calls.filter(c => c[0] === 'observe').length`);
      }

      if (!(obj instanceof Object)) {
        assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        sut.assign(scope, null, 42);
        assert.instanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        assert.strictEqual((scope.bindingContext['foo'] as IIndexable)[prop], 42, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
      }
    });

    it(`${t1}.${t2}.evaluate() -> connect -> assign`, function () {
      const scope = createScopeForTest({ foo: obj });
      const evaluator = { strict: false } as unknown as IAstEvaluator;
      const sut = new AccessMemberExpression(new AccessScopeExpression('foo', 0), prop);
      const actual = sut.evaluate(scope, evaluator, null);
      if (canHaveProperty) {
        if (obj == null) {
          assert.strictEqual(actual, '', `actual`);
        } else {
          assert.strictEqual(actual, value, `actual`);
        }
      } else {
        if (obj == null) {
          assert.strictEqual(actual, '', `actual`);
        }
      }
      const binding = new MockBinding();
      sut.evaluate(scope, dummyLocator, binding);
      if (canHaveProperty) {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 2, `binding.calls.filter(c => c[0] === 'observe').length`);
      } else {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 1, `binding.calls.filter(c => c[0] === 'observe').length`);
      }

      if (!(obj instanceof Object)) {
        assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        sut.assign(scope, null, 42);
        assert.instanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        assert.strictEqual((scope.bindingContext['foo'] as IIndexable)[prop], 42, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
      }
    });

  })
  );

  it('evaluates member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.evaluate(scope, null, null), 'baz', `expression.evaluate(scope, null, null)`);
  });

  it('evaluates member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    assert.strictEqual(expression.evaluate(scope, null, null), 'baz', `expression.evaluate(scope, null)`);
  });

  it('assigns member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(scope, null, 'bang');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('assigns member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(scope, null, 'bang');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);
  });

  it('returns the assigned value', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.assign(scope, null, 'bang'), 'bang', `expression.assign(scope, null, 'bang')`);
  });

  describe('does not attempt to observe property when object is falsey', function () {
    const objects2: [string, any][] = [
      [`     null`, null],
      [`undefined`, undefined],
      [`       ''`, ''],
      [`    false`, false]
    ];
    const props2: [string, any][] = [
      [`.0`, 0],
      [`.a`, 'a']
    ];
    const inputs2: [typeof objects2, typeof props2, boolean[]] = [objects2, props2, [true, false]];

    eachCartesianJoin(inputs2, (([t1, obj], [t2, prop]) => {
      it(`${t1}${t2}`, function () {
        const scope = createScopeForTest({ foo: obj });
        const sut = new AccessMemberExpression(new AccessScopeExpression('foo', 0), prop);
        const binding = new MockBinding();
        sut.evaluate(scope, dummyLocator, binding);
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 1, `binding.calls.filter(c => c[0] === 'observe').length`);
      });
    }));
  });

  describe('does not observe if object does not / cannot have the property', function () {
    const objects3: [string, any][] = [
      [`        1`, 1],
      [`     true`, true],
      [` Symbol()`, Symbol()]
    ];

    const props3: [string, any][] = [
      [`.0`, 0],
      [`.a`, 'a']
    ];

    const inputs3: [typeof objects3, typeof props3, boolean[]] = [objects3, props3, [true, false]];

    eachCartesianJoin(inputs3, (([t1, obj], [t2, prop]) => {
      it(`${t1}${t2}`, function () {
        const scope = createScopeForTest({ foo: obj });
        const expression2 = new AccessMemberExpression(new AccessScopeExpression('foo', 0), prop);
        const binding = new MockBinding();
        expression2.evaluate(scope, dummyLocator, binding);
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 1, `binding.calls.filter(c => c[0] === 'observe').length`);
      });
    }));
  });
});

describe('AccessScopeExpression', function () {
  const foo: AccessScopeExpression = new AccessScopeExpression('foo', 0);
  const $parentfoo: AccessScopeExpression = new AccessScopeExpression('foo', 1);

  it(`evaluates undefined bindingContext`, function () {
    const scope = Scope.create(undefined, null);
    assert.strictEqual(foo.evaluate(scope, null, null), '', `foo.evaluate(scope, null, null)`);
  });

  it(`evaluates undefined bindingContext STRICT`, function () {
    const scope = Scope.create(undefined, null);
    assert.strictEqual(foo.evaluate(scope, { strict: true }, null), undefined, `foo.evaluate(scope, null, null)`);
  });

  it(`assigns undefined bindingContext`, function () {
    const scope = Scope.create(undefined, null);
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
  });

  it(`connects undefined bindingContext`, function () {
    const scope = Scope.create(undefined, null);
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it(`evaluates null bindingContext`, function () {
    const scope = Scope.create(null, null);
    assert.strictEqual(foo.evaluate(scope, null, null), '', `foo.evaluate(scope, null, null)`);
  });

  it(`evaluates null bindingContext STRICT`, function () {
    const scope = Scope.create(null, null);
    assert.strictEqual(foo.evaluate(scope, { strict: true }, null), undefined, `foo.evaluate(scope, null, null)`);
  });

  it(`assigns null bindingContext`, function () {
    const scope = Scope.create(null, null);
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
  });

  it(`connects null bindingContext`, function () {
    const scope = Scope.create(null, null);
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it(`evaluates defined property on bindingContext`, function () {
    const scope: Scope = createScopeForTest({ foo: 'bar' });
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(scope, null, null)`);
  });

  it(`evaluates defined property on overrideContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(scope, null, null)`);
  });

  it(`assigns defined property on bindingContext`, function () {
    const scope = createScopeForTest({ foo: 'bar' });
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.bindingContext.foo, 'baz', `scope.bindingContext.foo`);
  });

  it(`assigns undefined property to bindingContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.bindingContext.foo, 'baz', `scope.bindingContext.foo`);
  });

  it(`assigns defined property on overrideContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
  });

  it(`connects defined property on bindingContext`, function () {
    const scope = createScopeForTest({ foo: 'bar' });
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
  });

  it(`connects defined property on overrideContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it(`connects undefined property on bindingContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'foo'], 'binding.calls[0]');
  });

  it(`evaluates defined property on first ancestor bindingContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(LF.none, scope, null, null)`);
    assert.strictEqual($parentfoo.evaluate(scope, null, null), 'bar', `$parentfoo.evaluate(LF.none, scope, null, null)`);
  });

  it(`evaluates defined property on first ancestor overrideContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.parentScope.overrideContext.foo = 'bar';
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual($parentfoo.evaluate(scope, null, null), 'bar', `$parentfoo.evaluate(LF.none, scope, null)`);
  });

  it(`assigns defined property on first ancestor bindingContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.parentScope.overrideContext.bindingContext.foo, 'baz', `scope.parentScope.overrideContext.bindingContext.foo`);
    $parentfoo.assign(scope, null, 'beep');
    assert.strictEqual(scope.parentScope.overrideContext.bindingContext.foo, 'beep', `scope.parentScope.overrideContext.bindingContext.foo`);
  });

  it(`assigns defined property on first ancestor overrideContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.parentScope.overrideContext.foo = 'bar';
    foo.assign(scope, null, 'baz');
    assert.strictEqual(scope.parentScope.overrideContext.foo, 'baz', `scope.parentScope.overrideContext.foo`);
    $parentfoo.assign(scope, null, 'beep');
    assert.strictEqual(scope.parentScope.overrideContext.foo, 'beep', `scope.parentScope.overrideContext.foo`);
  });

  it(`connects defined property on first ancestor bindingContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    let binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext.bindingContext, 'foo'], 'binding.calls[0]');
    binding = new MockBinding();
    $parentfoo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext.bindingContext, 'foo'], 'binding.calls[0]');
  });

  it(`connects defined property on first ancestor overrideContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.parentScope.overrideContext.foo = 'bar';
    let binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext, 'foo'], 'binding.calls[0]');
    binding = new MockBinding();
    $parentfoo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it(`connects undefined property on first ancestor bindingContext`, function () {
    const scope = createScopeForTest({ abc: 'xyz' }, {});
    (scope.parentScope as Writable<Scope>).parentScope = Scope.create(undefined, OverrideContext.create({ foo: 'bar' }));
    const binding = new MockBinding();
    $parentfoo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext.bindingContext, 'foo'], 'binding.calls[0]');
  });

});

describe('AccessThisExpression', function () {
  const $parent2 = new AccessThisExpression(1);
  const $parent$parent = new AccessThisExpression(2);
  const $parent$parent$parent = new AccessThisExpression(3);

  it('evaluates undefined bindingContext', function () {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(undefined), parentScope: null };
    assert.strictEqual($parent2.evaluate(scope as any, null, null), undefined, `$parent2.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(undefined), parentScope: { overrideContext: coc(undefined), parentScope: null } };
    assert.strictEqual($parent2.evaluate(scope as any, null, null), undefined, `$parent2.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(undefined), parentScope: { overrideContext: coc(undefined), parentScope: { overrideContext: coc(undefined), parentScope: null } } };
    assert.strictEqual($parent2.evaluate(scope as any, null, null), undefined, `$parent2.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(undefined), parentScope: { overrideContext: coc(undefined), parentScope: { overrideContext: coc(undefined), parentScope: { overrideContext: coc(undefined), parentScope: null } } } };
    assert.strictEqual($parent2.evaluate(scope as any, null, null), undefined, `$parent2.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);
  });

  it('evaluates null bindingContext', function () {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(null), parentScope: null };
    assert.strictEqual($parent.evaluate(scope as any, null, null), undefined, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(null), parentScope: { overrideContext: coc(null), parentScope: null } };
    assert.strictEqual($parent.evaluate(scope as any, null, null), null, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(null), parentScope: { overrideContext: coc(null), parentScope: { overrideContext: coc(null), parentScope: null } } };
    assert.strictEqual($parent.evaluate(scope as any, null, null), null, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), null, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(null), parentScope: { overrideContext: coc(null), parentScope: { overrideContext: coc(null), parentScope: { overrideContext: coc(null), parentScope: null } } } };
    assert.strictEqual($parent.evaluate(scope as any, null, null), null, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), null, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), null, `$parent$parent$parent.evaluate(scope as any, null)`);
  });

  it('evaluates defined bindingContext', function () {
    const coc = OverrideContext.create;
    const a = { a: 'a' };
    const b = { b: 'b' };
    const c = { c: 'c' };
    const d = { d: 'd' };
    let scope = { overrideContext: coc(a), parentScope: null };
    assert.strictEqual($parent.evaluate(scope as any, null, null), undefined, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(a), parentScope: { overrideContext: coc(b), parentScope: null } };
    assert.strictEqual($parent.evaluate(scope as any, null, null), b, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(a), parentScope: { overrideContext: coc(b), parentScope: { overrideContext: coc(c), parentScope: null } } };
    assert.strictEqual($parent.evaluate(scope as any, null, null), b, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), c, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), undefined, `$parent$parent$parent.evaluate(scope as any, null)`);

    scope = { overrideContext: coc(a), parentScope: { overrideContext: coc(b), parentScope: { overrideContext: coc(c), parentScope: { overrideContext: coc(d), parentScope: null } } } };
    assert.strictEqual($parent.evaluate(scope as any, null, null), b, `$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(scope as any, null, null), c, `$parent$parent.evaluate(scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(scope as any, null, null), d, `$parent$parent$parent.evaluate(scope as any, null)`);
  });
});

describe('AssignExpression', function () {
  it('can chain assignments', function () {
    const foo = new AssignExpression(new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0));
    const scope = Scope.create(undefined, null);
    foo.assign(scope, null as any, 1);
    assert.strictEqual(scope.overrideContext.foo, 1, `scope.overrideContext.foo`);
    assert.strictEqual(scope.overrideContext.bar, 1, `scope.overrideContext.bar`);
  });
});

describe('ConditionalExpression', function () {
  it('evaluates the "yes" branch', function () {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.evaluate(null, null, null);
    assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 0, `no.calls.length`);
  });

  it('evaluates the "no" branch', function () {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.evaluate(null, null, null);
    assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 1, `no.calls.length`);
  });

  it('connects the "yes" branch', function () {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.evaluate(null, dummyLocator, dummyBinding);
    assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 0, `no.calls.length`);
  });

  it('connects the "no" branch', function () {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.evaluate(null, dummyLocator, dummyBinding);
    assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 1, `no.calls.length`);
  });
});

describe('BinaryExpression', function () {
  it(`concats strings`, function () {
    let expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), new PrimitiveLiteralExpression('b'));
    let scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 'ab', `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $null);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 'a', `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression('b'));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 'b', `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $undefined);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 'a', `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression('b'));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 'b', `expression.evaluate(scope, null, null)`);
  });

  it(`adds numbers`, function () {
    let expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), new PrimitiveLiteralExpression(2));
    let scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 3, `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $null);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 1, `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression(2));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, null, null), 2, `expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $undefined);
    scope = createScopeForTest({});
    assert.strictEqual(isNaN(expression.evaluate(scope, null, null) as number), false, `isNaN(expression.evaluate(scope, null, null)`);

    expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression(2));
    scope = createScopeForTest({});
    assert.strictEqual(isNaN(expression.evaluate(scope, null, null) as number), false, `isNaN(expression.evaluate(scope, null, null)`);
  });

  it(`concats strings - STRICT`, function () {
    let expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), new PrimitiveLiteralExpression('b'));
    let scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 'ab', `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $null);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 'anull', `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression('b'));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 'nullb', `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $undefined);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 'aundefined', `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression('b'));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 'undefinedb', `expression.evaluate(scope, { strict: true }, null)`);
  });

  it(`adds numbers - STRICT`, function () {
    let expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), new PrimitiveLiteralExpression(2));
    let scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 3, `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $null);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 1, `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression(2));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(scope, { strict: true }, null), 2, `expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $undefined);
    scope = createScopeForTest({});
    assert.strictEqual(isNaN(expression.evaluate(scope, { strict: true }, null) as number), true, `isNaN(expression.evaluate(scope, { strict: true }, null)`);

    expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression(2));
    scope = createScopeForTest({});
    assert.strictEqual(isNaN(expression.evaluate(scope, { strict: true }, null) as number), true, `isNaN(expression.evaluate(scope, { strict: true }, null)`);
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
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), new ObjectLiteralExpression(['foo'], [$null])), true);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), new ObjectLiteralExpression(['bar'], [$null])), false);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression(1), new ObjectLiteralExpression(['1'], [$null])), true);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('1'), new ObjectLiteralExpression(['1'], [$null])), true);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), $null), false);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), $undefined), false);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), $true), false);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), $parent), false);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), $parent), false);

      const scope1 = createScopeForTest({ foo: { bar: null }, bar: null });
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), $this), true, scope1);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), $this), true, scope1);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), new AccessScopeExpression('foo', 0)), false, scope1);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), new AccessScopeExpression('bar', 0)), false, scope1);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), new AccessScopeExpression('foo', 0)), true, scope1);
    }

    for (const item of getTestData()) {
      it(item.toString(), function () {
        assert.strictEqual(item.expr.evaluate(item.scope, null, null), item.expected, `expr.evaluate(scope, null, null)`);
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
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('foo', 0),
            new AccessMemberExpression(new AccessScopeExpression('foo', 0), 'constructor')
          ),
          true,
          scope,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('foo', 0),
            new AccessMemberExpression(new AccessScopeExpression('bar', 0), 'constructor')
          ),
          false,
          scope,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('bar', 0),
            new AccessMemberExpression(new AccessScopeExpression('bar', 0), 'constructor')
          ),
          true,
          scope,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('bar', 0),
            new AccessMemberExpression(new AccessScopeExpression('foo', 0), 'constructor')
          ),
          true,
          scope,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new PrimitiveLiteralExpression('foo'),
            new AccessMemberExpression(new AccessScopeExpression('foo', 0), 'constructor')
          ),
          false,
          scope,
        );
      }

      yield new TestData(new BinaryExpression('instanceof', new AccessScopeExpression('foo', 0), new AccessScopeExpression('foo', 0)), false);
      yield new TestData(new BinaryExpression('instanceof', new AccessScopeExpression('foo', 0), $null), false);
      yield new TestData(new BinaryExpression('instanceof', new AccessScopeExpression('foo', 0), $undefined), false);
      yield new TestData(new BinaryExpression('instanceof', $null, new AccessScopeExpression('foo', 0)), false);
      yield new TestData(new BinaryExpression('instanceof', $undefined, new AccessScopeExpression('foo', 0)), false);
    }

    for (const item of getTestData()) {
      it(item.toString(), function () {
        assert.strictEqual(item.expr.evaluate(item.scope, null, null), item.expected, `expr.evaluate(scope, null, null)`);
      });
    }
  });
});

describe('CallMemberExpression', function () {
  it(`evaluates`, function () {
    const expression = new CallMemberExpression(new AccessScopeExpression('foo', 0), 'bar', []);
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
    assert.strictEqual(expression.evaluate(scope, null, null), 'baz', `expression.evaluate(scope, null, null)`);
    assert.strictEqual(callCount, 1, 'callCount');
  });

  it(`evaluate handles null/undefined member`, function () {
    const expression = new CallMemberExpression(new AccessScopeExpression('foo', 0), 'bar', []);
    const s1: Scope = createScopeForTest({ foo: {} });
    const s2: Scope = createScopeForTest({ foo: { bar: undefined } });
    const s3: Scope = createScopeForTest({ foo: { bar: null } });
    assert.strictEqual(expression.evaluate(s1, null, null), undefined, `expression.evaluate(createScopeForTest({ foo: {} }), null, null)`);
    assert.strictEqual(expression.evaluate(s2, null, null), undefined, `expression.evaluate(createScopeForTest({ foo: { bar: undefined } }), null, null)`);
    assert.strictEqual(expression.evaluate(s3, null, null), undefined, `expression.evaluate(createScopeForTest({ foo: { bar: null } }), null, null)`);
  });

  it(`evaluate throws when mustEvaluate and member is null or undefined`, function () {
    const expression = new CallMemberExpression(new AccessScopeExpression('foo', 0), 'bar', []);
    const s1 = createScopeForTest({});
    const s2 = createScopeForTest({ foo: {} });
    const s3 = createScopeForTest({ foo: { bar: undefined } });
    const s4 = createScopeForTest({ foo: { bar: null } });
    assert.throws(() => expression.evaluate(s1, { strictFnCall: true }, null));
    assert.throws(() => expression.evaluate(s2, { strictFnCall: true }, null));
    assert.throws(() => expression.evaluate(s3, { strictFnCall: true }, null));
    assert.throws(() => expression.evaluate(s4, { strictFnCall: true }, null));
  });
});

describe('CallScopeExpression', function () {
  const foo: CallScopeExpression = new CallScopeExpression('foo', [], 0);
  const hello: CallScopeExpression = new CallScopeExpression('hello', [new AccessScopeExpression('arg', 0)], 0);

  function getScopes(initialScope: Scope) {
    return [initialScope];
  }
  it(`evaluates undefined bindingContext`, function () {
    const [scope] = getScopes(Scope.create(undefined, null));
    assert.strictEqual(foo.evaluate(scope, null, null), undefined, `foo.evaluate(scope, null, null)`);
    assert.strictEqual(hello.evaluate(scope, null, null), undefined, `hello.evaluate(scope, null, null)`);
  });

  it(`throws when mustEvaluate and evaluating undefined bindingContext`, function () {
    const [scope] = getScopes(Scope.create(undefined, null));
    assert.throws(() => foo.evaluate(scope, { strictFnCall: true }, null));
    assert.throws(() => hello.evaluate(scope, { strictFnCall: true }, null));
  });

  it(`connects undefined bindingContext`, function () {
    const [scope] = getScopes(Scope.create(undefined, null));
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'arg'], 'binding.calls[0]');
  });

  it(`evaluates null bindingContext`, function () {
    const [scope] = getScopes(Scope.create(null, null));
    assert.strictEqual(foo.evaluate(scope, null, null), undefined, `foo.evaluate(scope, null, null)`);
    assert.strictEqual(hello.evaluate(scope, null, null), undefined, `hello.evaluate(scope, null, null)`);
  });

  it(`throws when mustEvaluate and evaluating null bindingContext`, function () {
    const [scope] = getScopes(Scope.create(null, null));
    assert.throws(() => foo.evaluate(scope, { strictFnCall: true }, null));
    assert.throws(() => hello.evaluate(scope, { strictFnCall: true }, null));
  });

  it(`connects null bindingContext`, function () {
    const [scope] = getScopes(Scope.create(null, null));
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'arg'], 'binding.calls[0]');
  });

  it(`evaluates defined property on bindingContext`, function () {
    const [scope] = getScopes(createScopeForTest({ foo: () => 'bar', hello: arg => arg, arg: 'world' }));
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(scope, null, null)`);
    assert.strictEqual(hello.evaluate(scope, null, null), 'world', `hello.evaluate(scope, null, null)`);
  });

  it(`evaluates defined property on overrideContext`, function () {
    const s = createScopeForTest({ abc: () => 'xyz' });
    s.overrideContext.foo = () => 'bar';
    s.overrideContext.hello = arg => arg;
    s.overrideContext.arg = 'world';
    const [scope] = getScopes(s);
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(scope, null, null)`);
    assert.strictEqual(hello.evaluate(scope, null, null), 'world', `hello.evaluate(scope, null, null)`);
  });

  it(`evaluate with connects defined property on bindingContext`, function () {
    const [scope] = getScopes(createScopeForTest({ foo: () => 'bar' }));
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'arg'], 'binding.calls[0]');
  });

  it(`connects defined property on overrideContext`, function () {
    const s1 = createScopeForTest({ abc: 'xyz' });
    s1.overrideContext.foo = () => 'bar';
    s1.overrideContext.hello = arg => arg;
    s1.overrideContext.arg = 'world';
    const [scope] = getScopes(s1);
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.overrideContext, 'arg'], 'binding.calls[0]');
  });

  it(`connects undefined property on bindingContext`, function () {
    const [scope] = getScopes(createScopeForTest({ abc: 'xyz' }));
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.bindingContext, 'arg'], 'binding.calls[0]');
  });

  it(`evaluates defined property on first ancestor bindingContext`, function () {
    const [scope] = getScopes(createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' }));
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(scope, null, null)`);
    assert.strictEqual(hello.evaluate(scope, null, null), 'world', `hello.evaluate(scope, null, null)`);
  });

  it(`evaluates defined property on first ancestor overrideContext`, function () {
    const s1 = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    s1.parentScope.overrideContext.foo = () => 'bar';
    s1.parentScope.overrideContext.hello = arg => arg;
    s1.parentScope.overrideContext.arg = 'world';
    const [scope] = getScopes(s1);
    assert.strictEqual(foo.evaluate(scope, null, null), 'bar', `foo.evaluate(scope, null, null)`);
    assert.strictEqual(hello.evaluate(scope, null, null), 'world', `hello.evaluate(scope, null, null)`);
  });

  it(`connects defined property on first ancestor bindingContext`, function () {
    const [scope] = getScopes(createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' }));
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext.bindingContext, 'arg'], 'binding.calls[0]');
  });

  it(`connects defined property on first ancestor overrideContext`, function () {
    const s1 = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    s1.parentScope.overrideContext.foo = () => 'bar';
    s1.parentScope.overrideContext.hello = arg => arg;
    s1.parentScope.overrideContext.arg = 'world';
    const [scope] = getScopes(s1);
    const binding = new MockBinding();
    foo.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observe').length, 0, `binding.calls.filter(c => c[0] === 'observe').length`);
    hello.evaluate(scope, dummyLocator, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observe', scope.parentScope.overrideContext, 'arg'], 'binding.calls[0]');
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
    yield new TestData(new TemplateExpression(['foo']), 'foo');
    yield new TestData(new TemplateExpression(['foo', 'baz'], [new PrimitiveLiteralExpression('bar')]), 'foobarbaz');
    yield new TestData(
      new TemplateExpression(
        ['a', 'c', 'e', 'g'],
        [new PrimitiveLiteralExpression('b'), new PrimitiveLiteralExpression('d'), new PrimitiveLiteralExpression('f')]
      ),
      'abcdefg',
    );
    yield new TestData(
      new TemplateExpression(['a', 'c', 'e'], [new AccessScopeExpression('b', 0), new AccessScopeExpression('d', 0)]),
      'a1c2e',
      { b: 1, d: 2 }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        [''],
        [],
        new AccessScopeExpression('foo', 0)
      ),
      'foo',
      { foo: () => 'foo' }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['foo'],
        ['bar'],
        new AccessScopeExpression('baz', 0)
      ),
      'foobar',
      { baz: cooked => `${cooked[0]}${cooked.raw[0]}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2'],
        [],
        new AccessScopeExpression('makeString', 0),
        [new PrimitiveLiteralExpression('foo')]
      ),
      '1foo2',
      { makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2'],
        [],
        new AccessScopeExpression('makeString', 0),
        [new AccessScopeExpression('foo', 0)]
      ),
      '1bar2',
      { foo: 'bar', makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessScopeExpression('makeString', 0),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0)]
      ),
      'bazqux',
      { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => `${foo}${bar}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessMemberExpression(new AccessScopeExpression('test', 0), 'makeString'),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0)]
      ),
      '1baz2qux3foo',
      { foo: 'baz', bar: 'qux', test: new Test() }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessKeyedExpression(new AccessScopeExpression('test', 0), new PrimitiveLiteralExpression('makeString')),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0)]
      ),
      '1baz2qux3foo',
      { foo: 'baz', bar: 'qux', test: new Test() }
    );
  }

  for (const item of getTestData()) {
    const $it = item.only ? it.only : it;
    $it(`${item.expr} evaluates ${item.expected}`, function () {
      assert.strictEqual(item.expr.evaluate(item.scope, null, null), item.expected, `expr.evaluate(scope, null, null)`);
    });
  }
});

describe('UnaryExpression', function () {
  describe('performs \'typeof\'', function () {
    const tests: { expr: UnaryExpression; expected: string }[] = [
      { expr: new UnaryExpression('typeof', new PrimitiveLiteralExpression('foo')), expected: 'string' },
      { expr: new UnaryExpression('typeof', new PrimitiveLiteralExpression(1)), expected: 'number' },
      { expr: new UnaryExpression('typeof', $null), expected: 'object' },
      { expr: new UnaryExpression('typeof', $undefined), expected: 'undefined' },
      { expr: new UnaryExpression('typeof', $true), expected: 'boolean' },
      { expr: new UnaryExpression('typeof', $false), expected: 'boolean' },
      { expr: new UnaryExpression('typeof', $arr), expected: 'object' },
      { expr: new UnaryExpression('typeof', $obj), expected: 'object' },
      { expr: new UnaryExpression('typeof', $this), expected: 'object' },
      { expr: new UnaryExpression('typeof', $parent), expected: 'undefined' },
      { expr: new UnaryExpression('typeof', new AccessScopeExpression('foo', 0)), expected: 'string' }
    ];
    const scope: Scope = createScopeForTest({});

    for (const { expr, expected } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(scope, null, null), expected, `expr.evaluate(scope, null)`);
      });
    }
  });

  describe('performs \'void\'', function () {
    const tests: { expr: UnaryExpression }[] = [
      { expr: new UnaryExpression('void', new PrimitiveLiteralExpression('foo')) },
      { expr: new UnaryExpression('void', new PrimitiveLiteralExpression(1)) },
      { expr: new UnaryExpression('void', $null) },
      { expr: new UnaryExpression('void', $undefined) },
      { expr: new UnaryExpression('void', $true) },
      { expr: new UnaryExpression('void', $false) },
      { expr: new UnaryExpression('void', $arr) },
      { expr: new UnaryExpression('void', $obj) },
      { expr: new UnaryExpression('void', $this) },
      { expr: new UnaryExpression('void', $parent) },
      { expr: new UnaryExpression('void', new AccessScopeExpression('foo', 0)) }
    ];
    let scope: Scope = createScopeForTest({});

    for (const { expr } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(scope, null, null), undefined, `expr.evaluate(scope, null)`);
      });
    }

    it('void foo()', function () {
      let fooCalled = false;
      const foo = () => (fooCalled = true);
      scope = createScopeForTest({ foo });
      const expr = new UnaryExpression('void', new CallScopeExpression('foo', [], 0));
      assert.strictEqual(expr.evaluate(scope, null, null), undefined, `expr.evaluate(scope, null)`);
      assert.strictEqual(fooCalled, true, `fooCalled`);
    });
  });
});

describe('DestructuringAssignmentExpression', function () {

  describe('DestructuringAssignmentSingleExpression', function () {

    it('{a} = {a:42}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'a'),
        void 0,
      ).assign(Scope.create(bc), null, { a: 42 });
      assert.strictEqual(bc.a, 42);
    });

    it('{1:a} = {1:"42"}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, '1'),
        void 0,
      ).assign(Scope.create(bc), null, { 1: '42' });
      assert.strictEqual(bc.a, '42');
    });

    it('{x:a} = {x:"42"}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'x'),
        void 0,
      ).assign(Scope.create(bc), null, { x: '42' });
      assert.strictEqual(bc.a, '42');
    });

    it('{a=42} = {b:404}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'a'),
        new PrimitiveLiteralExpression(42),
      ).assign(Scope.create(bc), null, { b: 404 });
      assert.strictEqual(bc.a, 42);
    });

    it('{1:a=42} = {2:"404"}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, '1'),
        new PrimitiveLiteralExpression(42),
      ).assign(Scope.create(bc), null, { 2: "404" });
      assert.strictEqual(bc.a, 42);
    });

    it('{x:a=42} = {b:404}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'x'),
        new PrimitiveLiteralExpression(42),
      ).assign(Scope.create(bc), null, { b: 404 });
      assert.strictEqual(bc.a, 42);
    });

    it('{a=404} = {a:42}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'a'),
        new PrimitiveLiteralExpression(404),
      ).assign(Scope.create(bc), null, { a: 42 });
      assert.strictEqual(bc.a, 42);
    });

    it('{1:a=404} = {1:"42"}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, '1'),
        new PrimitiveLiteralExpression(404),
      ).assign(Scope.create(bc), null, { 1: '42' });
      assert.strictEqual(bc.a, '42');
    });

    it('{x:a=404} = {x:"42"}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'x'),
        new PrimitiveLiteralExpression(404),
      ).assign(Scope.create(bc), null, { x: '42' });
      assert.strictEqual(bc.a, '42');
    });

    it('[a] = [42]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
        void 0,
      ).assign(Scope.create(bc), null, [42]);
      assert.strictEqual(bc.a, 42);
    });

    it('[a=42] = []', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
        new PrimitiveLiteralExpression(42),
      ).assign(Scope.create(bc), null, []);
      assert.strictEqual(bc.a, 42);
    });

    it('[,a=42] = [404]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
        new PrimitiveLiteralExpression(42),
      ).assign(Scope.create(bc), null, [404]);
      assert.strictEqual(bc.a, 42);
    });

    it('{a=vm_prop} = {x:404}', function () {
      const ps = Scope.create({ prop: 42 });
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'a'),
        new AccessScopeExpression('prop', 0),
      ).assign(Scope.fromParent(ps, bc), null, { x: 404 });
      assert.strictEqual(bc.a, 42);
    });

    it('[,a=vm_prop] = [404]', function () {
      const ps = Scope.create({ prop: 42 });
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
        new AccessScopeExpression('prop', 0),
      ).assign(Scope.fromParent(ps, bc), null, [404]);
      assert.strictEqual(bc.a, 42);
    });

    it('{a=$parent.vm_prop} = {x:404}', function () {
      const ps = Scope.create({ prop: 42 });
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessMemberExpression($this, 'a'),
        new AccessScopeExpression('prop', 2),
      ).assign(Scope.fromParent(Scope.fromParent(ps, Object.create(null)), bc), null, { x: 404 });
      assert.strictEqual(bc.a, 42);
    });

    it('[,a=$parent.vm_prop] = [404]', function () {
      const ps = Scope.create({ prop: 42 });
      const bc: Record<string, any> = {};
      new DestructuringAssignmentSingleExpression(
        new AccessMemberExpression($this, 'a'),
        new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
        new AccessScopeExpression('prop', 2),
      ).assign(Scope.fromParent(Scope.fromParent(ps, Object.create(null)), bc), null, [404]);
      assert.strictEqual(bc.a, 42);
    });
  });

  describe('DestructuringAssignmentRestExpression', function () {

    it('{...rest} = {a:1, b:2}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        [],
      ).assign(Scope.create(bc), null, { a: 1, b: 2 });
      assert.deepStrictEqual(bc, { rest: { a: 1, b: 2 } });
    });

    it('{a, ...rest} = {a:1, b:2}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        ['a'],
      ).assign(Scope.create(bc), null, { a: 1, b: 2 });
      assert.deepStrictEqual(bc, { rest: { b: 2 } });
    });

    it('{a, b, ...rest} = {a:1, b:2, c:3}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        ['a', 'b'],
      ).assign(Scope.create(bc), null, { a: 1, b: 2, c: 3 });
      assert.deepStrictEqual(bc, { rest: { c: 3 } });
    });

    it('{a, b, ...rest} = {a:1, b:2}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        ['a', 'b'],
      ).assign(Scope.create(bc), null, { a: 1, b: 2 });
      assert.deepStrictEqual(bc, { rest: {} });
    });

    it('[...rest] = [1, 2]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        0,
      ).assign(Scope.create(bc), null, [1, 2]);
      assert.deepStrictEqual(bc, { rest: [1, 2] });
    });

    it('[,...rest] = [1, 2]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        1,
      ).assign(Scope.create(bc), null, [1, 2]);
      assert.deepStrictEqual(bc, { rest: [2] });
    });

    it('[,,...rest] = [1, 2]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentRestExpression(
        new AccessMemberExpression($this, 'rest'),
        3,
      ).assign(Scope.create(bc), null, [1, 2]);
      assert.deepStrictEqual(bc, { rest: [] });
    });
  });

  describe('DestructuringAssignmentExpression', function () {

    it('{a} = {a: 1, b:2}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'a'),
            new AccessMemberExpression($this, 'a'),
            void 0
          )
        ],
        void 0,
        void 0
      ).assign(Scope.create(bc), null, { a: 1, b: 2 });
      assert.deepStrictEqual(bc, { a: 1 });
    });

    it('{a, b} = {a: 1, b:2}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'a'),
            new AccessMemberExpression($this, 'a'),
            void 0
          ),
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'b'),
            new AccessMemberExpression($this, 'b'),
            void 0
          ),
        ],
        void 0,
        void 0
      ).assign(Scope.create(bc), null, { a: 1, b: 2 });
      assert.deepStrictEqual(bc, { a: 1, b: 2 });
    });

    it('{...rest} = {a: 1, b:2}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentRestExpression(
            new AccessMemberExpression($this, 'rest'),
            []
          ),
        ],
        void 0,
        void 0
      ).assign(Scope.create(bc), null, { a: 1, b: 2 });
      assert.deepStrictEqual(bc.rest, { a: 1, b: 2 });
    });

    it('[a] = [1, 2]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'a'),
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
            void 0
          ),
        ],
        void 0,
        void 0
      ).assign(Scope.create(bc), null, [1, 2]);
      assert.deepStrictEqual(bc, { a: 1 });
    });

    it('[a, b] = [1, 2]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'a'),
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
            void 0
          ),
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'b'),
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
            void 0
          ),
        ],
        void 0,
        void 0
      ).assign(Scope.create(bc), null, [1, 2]);
      assert.deepStrictEqual(bc, { a: 1, b: 2 });
    });

    it('[...rest] = [1, 2]', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentRestExpression(
            new AccessMemberExpression($this, 'rest'),
            0,
          ),
        ],
        void 0,
        void 0
      ).assign(Scope.create(bc), null, [1, 2]);
      assert.deepStrictEqual(bc, { rest: [1, 2] });
    });

    it('{prop1, prop2:{prop21}} = {prop1: "foo", prop2: {prop21: 123}}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'prop1'),
            new AccessMemberExpression($this, 'prop1'),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ObjectDestructuring,
            [
              new DestructuringAssignmentSingleExpression(
                new AccessMemberExpression($this, 'prop21'),
                new AccessMemberExpression($this, 'prop21'),
                void 0
              ),
            ],
            new AccessMemberExpression($this, 'prop2'),
            void 0,
          ),
        ],
        void 0,
        void 0,
      ).assign(Scope.create(bc), null, { prop1: 'foo', prop2: { prop21: 123 } });
      assert.deepStrictEqual(bc, { prop1: 'foo', prop21: 123 });
    });

    it('{prop1, prop2:{prop21:{prop212:newProp212}, prop22}} = {prop1: "foo", prop2: {prop21: {prop211: 123, prop212: 456}, prop22: "bar" }}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'prop1'),
            new AccessMemberExpression($this, 'prop1'),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ObjectDestructuring,
            [
              new DestructuringAssignmentExpression(
                ExpressionKind.ObjectDestructuring,
                [
                  new DestructuringAssignmentSingleExpression(
                    new AccessMemberExpression($this, 'newProp212'),
                    new AccessMemberExpression($this, 'prop212'),
                    void 0
                  ),
                ],
                new AccessMemberExpression($this, 'prop21'),
                void 0,
              ),
              new DestructuringAssignmentSingleExpression(
                new AccessMemberExpression($this, 'prop22'),
                new AccessMemberExpression($this, 'prop22'),
                void 0
              ),
            ],
            new AccessMemberExpression($this, 'prop2'),
            void 0,
        ),
        ],
        void 0,
        void 0,
      ).assign(Scope.create(bc), null, { prop1: 'foo', prop2: { prop21: { prop211: 123, prop212: 456 }, prop22: 'bar' } });
      assert.deepStrictEqual(bc, { prop1: 'foo', newProp212: 456, prop22: 'bar' });
    });

    it('{prop1,coll:[,{p2:item2p2}]} = {prop1:"foo",coll:[{p1:1,p2:2},{p1:3,p2:4}]}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'prop1'),
            new AccessMemberExpression($this, 'prop1'),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ArrayDestructuring,
            [
              new DestructuringAssignmentExpression(
                ExpressionKind.ObjectDestructuring,
                [
                  new DestructuringAssignmentSingleExpression(
                    new AccessMemberExpression($this, 'item2p2'),
                    new AccessMemberExpression($this, 'p2'),
                    void 0,
                  )
                ],
                new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
                void 0,
              )
            ],
            new AccessMemberExpression($this, 'coll'),
        void 0,
        ),
        ],
        void 0,
        void 0,
        ).assign(Scope.create(bc), null, { prop1: 'foo', coll: [{ p1: 1, p2: 2 }, { p1: 3, p2: 4 }] });
      assert.deepStrictEqual(bc, { prop1: 'foo', item2p2: 4 });
    });

    it('{prop1,coll:[,{p:[item21]}]} = {prop1:"foo",coll:[{p:[1,2]},{p:[3,4]}]}', function () {
      const bc: Record<string, any> = {};
      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'prop1'),
            new AccessMemberExpression($this, 'prop1'),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ArrayDestructuring,
            [
              new DestructuringAssignmentExpression(
                ExpressionKind.ObjectDestructuring,
                [
                  new DestructuringAssignmentExpression(
                    ExpressionKind.ArrayDestructuring,
                    [
                      new DestructuringAssignmentSingleExpression(
                        new AccessMemberExpression($this, 'item21'),
                        new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
                        void 0
                      ),
                    ],
                    new AccessMemberExpression($this,'p'),
                    void 0,
                  ),
                ],
                new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
                void 0,
              )
            ],
            new AccessMemberExpression($this, 'coll'),
            void 0,
          ),
        ],
        void 0,
        void 0,
      ).assign(Scope.create(bc), null, { prop1: "foo", coll: [{ p: [1, 2] }, { p: [3, 4] }] });
      assert.deepStrictEqual(bc, { prop1: 'foo', item21: 3 });
    });

    it('[k, {prop1, prop2:{prop21}}] = ["key",{prop1: "foo", prop2: {prop21: 123}}]', function () {
      const bc: Record<string, any> = {};

      new DestructuringAssignmentExpression(
        ExpressionKind.ArrayDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'k'),
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ObjectDestructuring,
            [
              new DestructuringAssignmentSingleExpression(
                new AccessMemberExpression($this, 'prop1'),
                new AccessMemberExpression($this, 'prop1'),
                void 0
              ),
              new DestructuringAssignmentExpression(
                ExpressionKind.ObjectDestructuring,
                [
                  new DestructuringAssignmentSingleExpression(
                    new AccessMemberExpression($this, 'prop21'),
                    new AccessMemberExpression($this, 'prop21'),
                    void 0
                  ),
                ],
                new AccessMemberExpression($this, 'prop2'),
                void 0,
              ),
            ],
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
            void 0,
          )
        ],
        void 0,
        void 0,
        ).assign(Scope.create(bc), null, ['key', { prop1: 'foo', prop2: { prop21: 123 } }]);
      assert.deepStrictEqual(bc, { k: 'key', prop1: 'foo', prop21: 123 });
    });

    it('[k, [,item2]] = ["key",[1,2]]', function () {
      const bc: Record<string, any> = {};

      new DestructuringAssignmentExpression(
        ExpressionKind.ArrayDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'k'),
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(0)),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ArrayDestructuring,
            [
              new DestructuringAssignmentSingleExpression(
                new AccessMemberExpression($this, 'item2'),
                new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
                void 0
              )
            ],
            new AccessKeyedExpression($this, new PrimitiveLiteralExpression(1)),
            void 0,
          )
        ],
        void 0,
        void 0,
        ).assign(Scope.create(bc), null, ['key', [1,2]]);
      assert.deepStrictEqual(bc, { k: 'key', item2: 2 });
    });

    it('{a,b:{c}={c:42}} = {a:42}', function () {
      const bc: Record<string, any> = {};

      new DestructuringAssignmentExpression(
        ExpressionKind.ObjectDestructuring,
        [
          new DestructuringAssignmentSingleExpression(
            new AccessMemberExpression($this, 'a'),
            new AccessMemberExpression($this, 'a'),
            void 0
          ),
          new DestructuringAssignmentExpression(
            ExpressionKind.ObjectDestructuring,
            [
              new DestructuringAssignmentSingleExpression(
                new AccessMemberExpression($this, 'c'),
                new AccessMemberExpression($this, 'c'),
                void 0
                )
            ],
            new AccessMemberExpression($this, 'b'),
            new ObjectLiteralExpression(['c'], [new PrimitiveLiteralExpression(42)]),
          )
        ],
        void 0,
        void 0,
        ).assign(Scope.create(bc), null, {a:42});
      assert.deepStrictEqual(bc, { a:42, c:42});
    });
  });
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

describe('arrow function unparsing', function () {
  it('unparses arrow fn', function () {
    assert.strictEqual(
      new ArrowFunction([new BindingIdentifier('a')], new AccessScopeExpression('a')).toString(),
      '(a) => a'
    );
  });

  it('unparses arrow fn with single rest parameter', function () {
    assert.strictEqual(
      new ArrowFunction([new BindingIdentifier('a')], new AccessScopeExpression('a'), true).toString(),
      '(...a) => a'
    );
  });

  it('unparses arrow fn with 2 params', function () {
    assert.strictEqual(
      new ArrowFunction([new BindingIdentifier('a'), new BindingIdentifier('b')], new AccessScopeExpression('a')).toString(),
      '(a, b) => a'
    );
  });

  it('unparses arrow fn with 2 params with rest', function () {
    assert.strictEqual(
      new ArrowFunction([new BindingIdentifier('a'), new BindingIdentifier('b')], new AccessScopeExpression('a'), true).toString(),
      '(a, ...b) => a'
    );
  });
});
