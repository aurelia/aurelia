import { IServiceLocator, Writable, IIndexable, PLATFORM } from '@aurelia/kernel';
import {
  eachCartesianJoin,
  eachCartesianJoinFactory,
  createScopeForTest,
  MockTracingExpression,
  MockBindingBehavior,
  MockServiceLocator,
  createObserverLocator,
  MockSignaler,
  MockValueConverter,
  MockBinding,
  assert
} from '@aurelia/testing';
import {
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  AccessThisExpression,
  ArrayBindingPattern,
  ArrayLiteralExpression,
  AssignExpression,
  BinaryExpression,
  PropertyBinding,
  BindingBehaviorExpression,
  BindingIdentifier,
  CallFunctionExpression,
  CallMemberExpression,
  CallScopeExpression,
  callsFunction,
  ConditionalExpression,
  connects,
  ExpressionKind,
  ForOfStatement,
  hasAncestor,
  hasBind,
  hasUnbind,
  HtmlLiteralExpression,
  IConnectableBinding,
  Interpolation,
  isAssignable,
  IsBinary,
  IsBindingBehavior,
  IScope,
  ISignaler,
  IsLeftHandSide,
  isLeftHandSide,
  isLiteral,
  IsPrimary,
  isPrimary,
  isPureLiteral,
  isResource,
  IsUnary,
  LifecycleFlags as LF,
  ObjectBindingPattern,
  ObjectLiteralExpression,
  observes,
  OverrideContext,
  PrimitiveLiteralExpression,
  Scope,
  TaggedTemplateExpression,
  TemplateExpression,
  UnaryExpression,
  ValueConverterExpression,
} from '@aurelia/runtime';
import { Unparser } from '@aurelia/debug';

const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $str = PrimitiveLiteralExpression.$empty;
const $arr = ArrayLiteralExpression.$empty;
const $obj = ObjectLiteralExpression.$empty;
const $tpl = TemplateExpression.$empty;
const $this = AccessThisExpression.$this;
const $host = AccessThisExpression.$host;
const $parent = AccessThisExpression.$parent;
const dummyBinding = { locator: null } as unknown as IConnectableBinding;

function throwsOn<TExpr extends IsBindingBehavior>(expr: TExpr, method: keyof TExpr, msg: string, ...args: any[]): void {
  let err = null;
  try {
    (expr as any)[method](...args);
  } catch (e) {
    err = e;
  }
  assert.notStrictEqual(err, null, 'err');
  if (msg && msg.length) {
    assert.includes(err.message, msg, 'err.message.includes(msg)');
  }
}

function makeHostScoped(
  expression: AccessKeyedExpression | AccessMemberExpression | AccessScopeExpression | CallScopeExpression,
  isHostScoped: boolean = false,
) {
  switch(expression.$kind){
    case ExpressionKind.AccessScope:
      (expression as Writable<AccessScopeExpression>).accessHostScope = isHostScoped;
      break;
    case ExpressionKind.CallScope:
      (expression as Writable<CallScopeExpression>).accessHostScope = isHostScoped;
      break;
    default:
      (expression.object as Writable<AccessScopeExpression>).accessHostScope = isHostScoped;
      break;
  }
}

const $num1 = new PrimitiveLiteralExpression(1);
const $str1 = new PrimitiveLiteralExpression('1');

describe('AST', function () {

  const AccessThisList: [string, AccessThisExpression][] = [
    [`$this`,             $this],
    [`$host`,             $host],
    [`$parent`,           $parent],
    [`$parent.$parent`,   new AccessThisExpression(2)]
  ];
  const AccessScopeList: [string, AccessScopeExpression][] = [
    ...AccessThisList.map(([input, expr]) => [`${input}.a`, new AccessScopeExpression('a', expr.ancestor, input === '$host')] as [string, any]),
    [`$this.$parent`,     new AccessScopeExpression('$parent')],
    [`$host.$parent`,     new AccessScopeExpression('$parent', undefined, true)],
    [`$parent.$this`,     new AccessScopeExpression('$this', 1)],
    [`a`,                 new AccessScopeExpression('a')]
  ];
  const StringLiteralList: [string, PrimitiveLiteralExpression][] = [
    [`''`,                PrimitiveLiteralExpression.$empty]
  ];
  const NumberLiteralList: [string, PrimitiveLiteralExpression][] = [
    [`1`,                 new PrimitiveLiteralExpression(1)],
    [`1.1`,               new PrimitiveLiteralExpression(1.1)],
    [`.1`,                new PrimitiveLiteralExpression(0.1)],
    [`0.1`,               new PrimitiveLiteralExpression(0.1)]
  ];
  const KeywordLiteralList: [string, PrimitiveLiteralExpression][] = [
    [`undefined`,         $undefined],
    [`null`,              $null],
    [`true`,              $true],
    [`false`,             $false]
  ];
  const PrimitiveLiteralList: [string, PrimitiveLiteralExpression][] = [
    ...StringLiteralList,
    ...NumberLiteralList,
    ...KeywordLiteralList
  ];

  const ArrayLiteralList: [string, ArrayLiteralExpression][] = [
    [`[]`,                $arr]
  ];
  const ObjectLiteralList: [string, ObjectLiteralExpression][] = [
    [`{}`,                $obj]
  ];
  const TemplateLiteralList: [string, TemplateExpression][] = [
    [`\`\``,              $tpl]
  ];
  const LiteralList: [string, IsPrimary][] = [
    ...PrimitiveLiteralList,
    ...TemplateLiteralList,
    ...ArrayLiteralList,
    ...ObjectLiteralList
  ];
  const TemplateInterpolationList: [string, TemplateExpression][] = [
    [`\`\${a}\``,         new TemplateExpression(['', ''], [new AccessScopeExpression('a')])]
  ];
  const PrimaryList: [string, IsPrimary][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...LiteralList
  ];
  // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  const SimpleAccessKeyedList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}[b]`, new AccessKeyedExpression(expr, new AccessScopeExpression('b'))] as [string, any])
  ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}.b`, new AccessMemberExpression(expr, 'b')] as [string, any])
  ];
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
      .map(([input, expr]) => [`${input}()`, new CallScopeExpression((expr as any).name, [], expr.ancestor, input.startsWith('$host'))] as [string, any])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}.b()`, new CallMemberExpression(expr, 'b', [])] as [string, any])
  ];
  // concatenation of 1-3 of MemberExpression and 1-3 of CallExpression
  const SimpleLeftHandSideList: [string, IsLeftHandSide][] = [
    ...SimpleAccessKeyedList,
    ...SimpleAccessMemberList,
    ...SimpleTaggedTemplateList,
    ...SimpleCallFunctionList,
    ...SimpleCallScopeList,
    ...SimpleCallMemberList
  ];

  // concatenation of Primary and Member+CallExpression
  // This forms the group Precedence.LeftHandSide
  // used only for testing complex UnaryExpression expressions
  const SimpleIsLeftHandSideList: [string, IsLeftHandSide][] = [
    ...PrimaryList,
    ...SimpleLeftHandSideList
  ];

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
  const SimpleIsUnaryList: [string, IsUnary][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, BinaryExpression][] = [
    [`$6*$7`, new BinaryExpression('*', new AccessScopeExpression('$6'), new AccessScopeExpression('$7'))],
    [`$8%$9`, new BinaryExpression('%', new AccessScopeExpression('$8'), new AccessScopeExpression('$9'))],
    [`$10/$11`, new BinaryExpression('/', new AccessScopeExpression('$10'), new AccessScopeExpression('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, IsBinary][] = [
    ...SimpleIsUnaryList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, BinaryExpression][] = [
    [`$12+$13`, new BinaryExpression('+', new AccessScopeExpression('$12'), new AccessScopeExpression('$13'))],
    [`$14-$15`, new BinaryExpression('-', new AccessScopeExpression('$14'), new AccessScopeExpression('$15'))]
  ];
  const SimpleIsAdditiveList: [string, IsBinary][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, BinaryExpression][] = [
    [`$16<$17`, new BinaryExpression('<', new AccessScopeExpression('$16'), new AccessScopeExpression('$17'))],
    [`$18>$19`, new BinaryExpression('>', new AccessScopeExpression('$18'), new AccessScopeExpression('$19'))],
    [`$20<=$21`, new BinaryExpression('<=', new AccessScopeExpression('$20'), new AccessScopeExpression('$21'))],
    [`$22>=$23`, new BinaryExpression('>=', new AccessScopeExpression('$22'), new AccessScopeExpression('$23'))],
    [`$24 in $25`, new BinaryExpression('in', new AccessScopeExpression('$24'), new AccessScopeExpression('$25'))],
    [`$26 instanceof $27`, new BinaryExpression('instanceof', new AccessScopeExpression('$26'), new AccessScopeExpression('$27'))]
  ];
  const SimpleIsRelationalList: [string, IsBinary][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, BinaryExpression][] = [
    [`$28==$29`, new BinaryExpression('==', new AccessScopeExpression('$28'), new AccessScopeExpression('$29'))],
    [`$30!=$31`, new BinaryExpression('!=', new AccessScopeExpression('$30'), new AccessScopeExpression('$31'))],
    [`$32===$33`, new BinaryExpression('===', new AccessScopeExpression('$32'), new AccessScopeExpression('$33'))],
    [`$34!==$35`, new BinaryExpression('!==', new AccessScopeExpression('$34'), new AccessScopeExpression('$35'))]
  ];
  const SimpleIsEqualityList: [string, IsBinary][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

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
  const SimpleAssignList: [string, AssignExpression][] = [
    [`a=b`, new AssignExpression(new AccessScopeExpression('a'), new AccessScopeExpression('b'))]
  ];

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
          assert.strictEqual(expr.evaluate(undefined, undefined, null, undefined), expr.value, `expr.evaluate(undefined, undefined, undefined)`);
        });
      }
      for (const [text, expr] of TemplateLiteralList) {
        it(text, function () {
          assert.strictEqual(expr.evaluate(undefined, undefined, null, undefined), '', `expr.evaluate(undefined, undefined, undefined)`);
        });
      }
      for (const [text, expr] of ArrayLiteralList) {
        it(text, function () {
          assert.instanceOf(expr.evaluate(undefined, undefined, null, undefined), Array, 'expr.evaluate(undefined, undefined, undefined)');
        });
      }
      for (const [text, expr] of ObjectLiteralList) {
        it(text, function () {
          assert.instanceOf(expr.evaluate(undefined, undefined, null, undefined), Object, 'expr.evaluate(undefined, undefined, undefined)');
        });
      }
    });

    describe('connect() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList,
        ...TemplateLiteralList,
        ...ArrayLiteralList,
        ...ObjectLiteralList
      ]) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.connect(null, undefined, null, dummyBinding), undefined, `expr.connect(null, undefined, dummyBinding)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null, dummyBinding), undefined, `expr.connect(null, null, dummyBinding)`);
        });
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList,
        ...TemplateLiteralList,
        ...ArrayLiteralList,
        ...ObjectLiteralList
      ]) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });
  });

  describe('Context Accessors', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });

    describe('connect() does not throw / is a no-op', function () {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.connect(null, undefined, null, dummyBinding), undefined, `expr.connect(null, undefined, dummyBinding)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null, dummyBinding), undefined, `expr.connect(null, null, dummyBinding)`);
        });
      }
    });
  });

  describe('Scope Accessors', function () {
    describe('evaluate() throws', function () {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList,
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        if (!text.startsWith('$host')) {
          describe('when scope is nil', function () {
            it(`${text}, undefined`, function () {
              throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
            });
            it(`${text}, null`, function () {
              throwsOn(expr, 'evaluate', 'Code 250', null, null);
            });
          });
        } else {
          describe('when hostScope is null for a hostScoped expression', function () {
            it(`${text}, null`, function () {
              throwsOn(expr, 'evaluate', 'Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?', null, Scope.create(LF.none, {}), null, null);
            });
          });
        }
      }
    });

    describe('assign() throws', function () {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList
      ]) {
        if (!text.startsWith('$host')) {
          describe('when scope is nil', function () {
            it(`${text}, undefined`, function () {
              throwsOn(expr, 'assign', 'Code 250', null, undefined);
            });
            it(`${text}, null`, function () {
              throwsOn(expr, 'assign', 'Code 250', null, null);
            });
          });
        } else {
          describe('when hostScope is null for a hostScoped-expression', function () {
            it(`${text}, null`, function () {
              throwsOn(expr, 'assign', 'Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?', null, Scope.create(LF.none, {}), null, null);
            });
          });
        }
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        if (!text.startsWith('$host')) {
          it(`${text}, undefined`, function () {
            assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
          });
          it(`${text}, null`, function () {
            assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
          });
        }
      }
    });

    describe('connect() throws', function () {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList,
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        if (!text.startsWith('$host')) {
          describe('when scope is nil', function () {
            it(`${text}, undefined`, function () {
              throwsOn(expr, 'connect', 'Code 250', null, undefined, undefined, dummyBinding);
            });
            it(`${text}, null`, function () {
              throwsOn(expr, 'connect', 'Code 250', null, null, undefined, dummyBinding);
            });
          });
        } else {
          describe('when hostScope is null for a hostScoped-expression', function () {
            it(`${text}, null`, function () {
              throwsOn(expr, 'connect', 'Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?', null, Scope.create(LF.none, {}), null, { observeProperty: PLATFORM.noop, locator: null });
            });
          });
        }
      }
    });
  });

  describe('CallExpression', function () {
    describe('evaluate() throws', function () {
      for (const [text, expr] of [
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
      ]) {
        if (!text.startsWith('$host')) {
          describe('when scope is nil', function () {
            it(`${text}, undefined`, function () {
              throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
            });
            it(`${text}, null`, function () {
              throwsOn(expr, 'evaluate', 'Code 250', null, null);
            });
          });
        } else {
          describe('when hostScope is null for a hostScoped-expression', function () {
            it(`${text}, null`, function () {
              throwsOn(expr, 'evaluate', 'Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?', null, Scope.create(LF.none, {}), null, null);
            });
          });
        }
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
      ]) {
        if (!text.startsWith('$host')) {
          it(`${text}, undefined`, function () {
            assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
          });
          it(`${text}, null`, function () {
            assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
          });
        }
      }
    });

    describe('connect() throws', function () {
      for (const [text, expr] of [
        ...SimpleCallMemberList,
        ...SimpleCallFunctionList
      ]) {
        if (!text.startsWith('$host')) {
          describe('when scope is nil', function () {
            it(`${text}, undefined`, function () {
              throwsOn(expr, 'connect', 'Code 250', null, undefined, undefined, dummyBinding);
            });
            it(`${text}, null`, function () {
              throwsOn(expr, 'connect', 'Code 250', null, null, undefined, dummyBinding);
            });
          });
        } else {
          describe('when hostScope is null for a hostScoped-expression', function () {
            it(`${text}, null`, function () {
              throwsOn(expr, 'connect', 'Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?', null, Scope.create(LF.none, {}), null, dummyBinding);
            });
          });
        }
      }
    });

    describe('connect() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...SimpleCallScopeList
      ]) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.connect(null, undefined, null, dummyBinding), undefined, `expr.connect(null, undefined, dummyBinding)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null, dummyBinding), undefined, `expr.connect(null, null, dummyBinding)`);
        });
      }
    });
  });

  describe('UnaryExpression', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of SimpleUnaryList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of SimpleUnaryList) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleUnaryList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined, undefined, dummyBinding);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null, undefined, dummyBinding);
        });
      }
    });
  });

  describe('BinaryExpression', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ]) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ]) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...SimpleMultiplicativeList,
        ...SimpleAdditiveList,
        ...SimpleRelationalList,
        ...SimpleEqualityList,
        ...SimpleLogicalANDList,
        ...SimpleLogicalORList
      ]) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined, undefined, dummyBinding);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null, undefined, dummyBinding);
        });
      }
    });
  });

  describe('ConditionalExpression', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of SimpleConditionalList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of SimpleConditionalList) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.assign(null, undefined, null, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleConditionalList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined, undefined, dummyBinding);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null, undefined, dummyBinding);
        });
      }
    });
  });

  describe('AssignExpression', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of SimpleAssignList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() throws when scope is nil', function () {
      for (const [text, expr] of SimpleAssignList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'assign', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'assign', 'Code 250', null, null);
        });
      }
    });

    describe('connect() does not throw / is a no-op', function () {
      for (const [text, expr] of SimpleAssignList) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.connect(null, undefined, null, dummyBinding), undefined, `expr.connect(null, undefined, dummyBinding)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null, dummyBinding), undefined, `expr.connect(null, null, dummyBinding)`);
        });
      }
    });
  });

  describe('ValueConverterExpression', function () {
    describe('evaluate() throws when locator is nil', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 202', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 202', null, null);
        });
      }
    });
    describe('evaluate() throws when returned converter is nil', function () {
      const locator = { get() {
        return null;
      } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 205', null, null, null, locator);
        });
      }
    });

    describe('assign() throws when locator is nil', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'assign', 'Code 202', null, null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'assign', 'Code 202', null, null, null);
        });
      }
    });
    describe('assign() throws when returned converter is null', function () {
      const locator = { get() {
        return null;
      } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, null`, function () {
          throwsOn(expr, 'assign', 'Code 205', null, null, null, locator);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined, undefined, dummyBinding);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null, undefined, dummyBinding);
        });
      }
    });

    describe('connect() throws when binding is null', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 206', null, {}, null, null);
        });
      }
    });

    describe('connect() throws when locator is null', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 202', null, {}, null, dummyBinding);
        });
      }
    });

    describe('connect() throws when returned converter is null', function () {
      const locator = { get() {
        return null;
      } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 205', null, {}, null, { locator, observeProperty: () => { return; } });
        });
      }
    });
  });

  describe('BindingBehaviorExpression', function () {
    describe('evaluate() throws when locator is nil', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() throws when locator is nil', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'assign', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'assign', 'Code 250', null, null);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });

    describe('bind() throws when scope is nil', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'bind', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'bind', 'Code 250', null, null);
        });
      }
    });

    describe('bind() throws when binding is null', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'bind', 'Code 206', null, {}, null);
        });
      }
    });

    describe('bind() throws when locator is null', function () {
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'bind', 'Code 202', null, {}, null, {});
        });
      }
    });

    describe('bind() throws when returned behavior is null', function () {
      const locator = { get() {
        return null;
      } };
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'bind', 'Code 203', null, {}, null, { locator, observeProperty: () => { return; } });
        });
      }
    });

    // TODO: this should throw (or at least verify warning), but leave it be for now due to friction with generated
    // tests (which need to be fixed of course)
    // describe('bind() throws when returned behavior is already present', function () {
    //   const behavior = {};
    //   const locator = { get() {
    //     return behavior;
    //   } };
    //   for (const [text, expr] of SimpleBindingBehaviorList) {
    //     it(`${text}, undefined`, function () {
    //       throwsOn(expr, 'bind', 'Code 204', null, {}, { [expr.behaviorKey]: behavior, locator, observeProperty: () => { return; } });
    //     });
    //   }
    // });
  });
});

describe('AccessKeyedExpression', function () {
  let expression: AccessKeyedExpression;

  // eslint-disable-next-line mocha/no-hooks
  before(function () {
    expression = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), new PrimitiveLiteralExpression('bar'));
  });

  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () { makeHostScoped(expression, false); });

  it('evaluates member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), 'baz', `expression.evaluate(LF.none, scope, null)`);

    makeHostScoped(expression, true);
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest(), scope, null), 'baz', `expression.evaluate(LF.none, scope, null, hs)`);
  });

  it('evaluates member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), 'baz', `expression.evaluate(LF.none, scope, null)`);

    makeHostScoped(expression, true);
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({}), scope, null), 'baz', `expression.evaluate(LF.none, scope, null, hs)`);
  });

  it('assigns member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(LF.none, scope, null, null, 'bang');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);

    makeHostScoped(expression, true);
    expression.assign(LF.none, createScopeForTest(), scope, null, 'baz');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'baz', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('assigns member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(LF.none, scope, null, null, 'bang');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);

    makeHostScoped(expression, true);
    expression.assign(LF.none, createScopeForTest(), scope, null, 'baz');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'baz', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('evaluates null/undefined object', function () {
    let scope = createScopeForTest({ foo: null });
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), undefined, `expression.evaluate(LF.none, scope, null, null)`);
    scope = createScopeForTest({ foo: undefined });
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), undefined, `expression.evaluate(LF.none, scope, null, null)`);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), undefined, `expression.evaluate(LF.none, scope, null, null)`);

    makeHostScoped(expression, true);
    scope = createScopeForTest({ foo: null });
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({}), scope, null), undefined, `expression.evaluate(LF.none, scope, hs, null)`);
    scope = createScopeForTest({ foo: undefined });
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({}), scope, null), undefined, `expression.evaluate(LF.none, scope, hs, null)`);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({}), scope, null), undefined, `expression.evaluate(LF.none, scope, hs, null)`);

  });

  it('does not observes property in keyed object access when key is number', function () {
    const scope = createScopeForTest({ foo: { '0': 'hello world' } });
    const expression2 = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), new PrimitiveLiteralExpression(0));
    assert.strictEqual(expression2.evaluate(LF.none, scope, null, null), 'hello world', `expression2.evaluate(LF.none, scope, null)`);
    const binding = new MockBinding();
    expression2.connect(LF.none, scope, null, binding);
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'foo'], 'binding.calls[0]');
    assert.deepStrictEqual(binding.calls[1], ['observeProperty', LF.none, scope.bindingContext.foo, 0], 'binding.calls[1]');
    assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');

    const hs = createScopeForTest({ foo: { '0': 'hello hostScope' } });
    makeHostScoped(expression2, true);
    assert.strictEqual(expression2.evaluate(LF.none, scope, hs, null), 'hello hostScope', `expression2.evaluate(LF.none, scope, null)`);
    const binding2 = new MockBinding();
    expression2.connect(LF.none, scope, hs, binding2);
    assert.deepStrictEqual(binding2.calls[0], ['observeProperty', LF.none, hs.bindingContext, 'foo'], 'binding.calls[0]');
    assert.deepStrictEqual(binding2.calls[1], ['observeProperty', LF.none, hs.bindingContext.foo, 0], 'binding.calls[1]');
    assert.strictEqual(binding2.calls.length, 2, 'binding.calls.length');
  });

  it('observes property in keyed array access when key is number', function () {
    const scope = createScopeForTest({ foo: ['hello world'] });
    const expression3 = new AccessKeyedExpression(new AccessScopeExpression('foo', 0), new PrimitiveLiteralExpression(0));
    assert.strictEqual(expression3.evaluate(LF.none, scope, null, null), 'hello world', `expression3.evaluate(LF.none, scope, null)`);
    const binding = new MockBinding();
    expression3.connect(LF.none, scope, null, binding);
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'foo'], 'binding.calls[0]');
    assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');

    const hs = createScopeForTest({ foo: ['hello hostScope'] });
    makeHostScoped(expression3, true);
    assert.strictEqual(expression3.evaluate(LF.none, scope, hs, null), 'hello hostScope', `expression3.evaluate(LF.none, scope, null)`);
    const binding2 = new MockBinding();
    expression3.connect(LF.none, scope, hs, binding2);
    assert.deepStrictEqual(binding2.calls[0], ['observeProperty', LF.none, hs.bindingContext, 'foo'], 'binding.calls[0]');
    assert.strictEqual(binding2.calls.length, 2, 'binding.calls.length');
  });

  describe('does not attempt to observe property when object is primitive', function () {
    const objects: [string, any][] = [
      [`     null`, null],
      [`undefined`, undefined],
      [`       ''`, ''],
      [        `1`, 1],
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
        sut.connect(LF.none, scope, null, binding);
        assert.strictEqual(binding.calls.length, 1);
        assert.strictEqual(binding.calls[0][0], 'observeProperty');

        makeHostScoped(sut, true);
        const binding2 = new MockBinding();
        sut.connect(LF.none, createScopeForTest({}), scope, binding2);
        assert.strictEqual(binding2.calls.length, 1);
        assert.strictEqual(binding2.calls[0][0], 'observeProperty');

      });
    }));
  });
});

describe('AccessMemberExpression', function () {

  const objects: (() => [string, any, boolean, boolean])[] = [
    () => [`     null`, null,      true,     false],
    () => [`undefined`, undefined, true,     false],
    () => [`       ''`, '',        true,     false],
    () => [`      'a'`, 'a',       false,    false],
    () => [`    false`, false,     true,     false],
    () => [`        1`, 1,         false,    false],
    () => [`     true`, true,      false,    false],
    () => [` Symbol()`, Symbol(),  false,    false],
    () => [`       {}`, {},        false,    true],
    () => [`       []`, [],        false,    true]
  ];

  const props: ((input: [string, any, boolean, boolean]) => [string, any, any])[] = [
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = null as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`null={}     `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = undefined as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`undefined={}`, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = '' as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`''={}       `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = 'a' as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`'a'={}      `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = false as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`false={}    `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = 1 as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`1={}        `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = true as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`true={}     `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = Symbol() as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`Symbol()={} `, prop, value];
    },
    ([$11, obj, isFalsey, canHaveProperty]) => {
      const prop = {} as any;
      const value = {};
      if (canHaveProperty) {
        obj[prop] = value;
      }
      return [`{}={}       `, prop, value];
    },
  ];
  const hostScopes = [()=> true, ()=> false];
  const inputs: [typeof objects, typeof props, typeof hostScopes] = [objects, props, hostScopes];

  const expression: AccessMemberExpression = new AccessMemberExpression(new AccessScopeExpression('foo', 0), 'bar');

  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () { makeHostScoped(expression, false); });

  eachCartesianJoinFactory.call(this, inputs, (([t1, obj, isFalsey, canHaveProperty], [t2, prop, value], isHostScoped) => {
    it(`STRICT - ${t1}.${t2}.evaluate() -> connect -> assign${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = isHostScoped ? createScopeForTest() : createScopeForTest({ foo: obj });
      const hs = isHostScoped ? createScopeForTest({ foo: obj }) : null;
      const sut = new AccessMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), prop);
      const actual = sut.evaluate(LF.isStrictBindingStrategy, scope, hs, null);
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
      sut.connect(LF.none, scope, hs, binding);
      if (canHaveProperty) {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 2, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      } else {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      }

      if (!(obj instanceof Object)) {
        assert.notInstanceOf((hs ?? scope).bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        sut.assign(LF.none, scope, hs, null, 42);
        assert.instanceOf((hs ?? scope).bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        assert.strictEqual(((hs ?? scope).bindingContext['foo'] as IIndexable)[prop], 42, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
      }
    });

    it(`${t1}.${t2}.evaluate() -> connect -> assign${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = isHostScoped ? createScopeForTest() : createScopeForTest({ foo: obj });
      const hs = isHostScoped ? createScopeForTest({ foo: obj }) : null;
      const sut = new AccessMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), prop);
      const actual = sut.evaluate(LF.none, scope, hs, null);
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
      sut.connect(LF.none, scope, hs, binding);
      if (canHaveProperty) {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 2, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      } else {
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      }

      if (!(obj instanceof Object)) {
        assert.notInstanceOf((hs ?? scope).bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        sut.assign(LF.none, scope, hs, null, 42);
        assert.instanceOf((hs ?? scope).bindingContext['foo'], Object, `scope.bindingContext['foo']`);
        assert.strictEqual(((hs ?? scope).bindingContext['foo'] as IIndexable)[prop], 42, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
      }
    });

  })
  );

  it('evaluates member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), 'baz', `expression.evaluate(LF.none, scope, null, null)`);

    makeHostScoped(expression, true);
    assert.strictEqual(expression.evaluate(LF.none, scope, createScopeForTest({ foo: { bar: 'bar' } }), null), 'bar', `expression.evaluate(LF.none, scope, hs, null)`);
  });

  it('evaluates member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    assert.strictEqual(expression.evaluate(LF.none, scope, null, null), 'baz', `expression.evaluate(LF.none, scope, null)`);

    makeHostScoped(expression, true);
    const hs = createScopeForTest({});
    hs.overrideContext.foo = { bar: 'bar' };
    assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'bar', `expression.evaluate(LF.none, scope, null)`);
  });

  it('assigns member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(LF.none, scope, null, null, 'bang');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);

    makeHostScoped(expression, true);
    expression.assign(LF.none, createScopeForTest({}), scope, null, 'foo');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'foo', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('assigns member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(LF.none, scope, null, null, 'bang');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);

    makeHostScoped(expression, true);
    expression.assign(LF.none, createScopeForTest({}), scope, null, 'foo');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'foo', `(scope.overrideContext.foo as IIndexable).bar`);
  });

  it('returns the assigned value', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.assign(LF.none, scope, null, null, 'bang'), 'bang', `expression.assign(LF.none, scope, null, 'bang')`);

    makeHostScoped(expression, true);
    assert.strictEqual(expression.assign(LF.none, createScopeForTest({}), scope, null, 'foo'), 'foo', `expression.assign(LF.none, scope, hs, 'bang')`);
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

    eachCartesianJoin(inputs2, (([t1, obj], [t2, prop], isHostScoped) => {
      it(`${t1}${t2}${isHostScoped ? ' - hostScoped' : ''}`, function () {
        const scope = isHostScoped ? createScopeForTest() : createScopeForTest({ foo: obj });
        const hs = isHostScoped ? createScopeForTest({ foo: obj }) : null;
        const sut = new AccessMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), prop);
        const binding = new MockBinding();
        sut.connect(LF.none, scope, hs, binding);
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
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

    eachCartesianJoin(inputs3, (([t1, obj], [t2, prop], isHostScoped) => {
      it(`${t1}${t2}${isHostScoped ? ' - hostScoped' : ''}`, function () {
        const scope = isHostScoped ? createScopeForTest() : createScopeForTest({ foo: obj });
        const hs = isHostScoped ? createScopeForTest({ foo: obj }) : null;
        const expression2 = new AccessMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), prop);
        const binding = new MockBinding();
        expression2.connect(LF.none, scope, hs, binding);
        assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      });
    }));
  });
});

describe('AccessScopeExpression', function () {
  const foo: AccessScopeExpression = new AccessScopeExpression('foo', 0);
  const $parentfoo: AccessScopeExpression = new AccessScopeExpression('foo', 1);

  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    makeHostScoped(foo, false);
    makeHostScoped($parentfoo, false);
  });

  for(const isHostScoped of [true, false]) {
    it(`evaluates undefined bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, undefined, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, undefined, null);
        makeHostScoped(foo, true);
      }
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), '', `foo.evaluate(LF.none, scope, hs, null)`);
    });

    it(`evaluates undefined bindingContext STRICT${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, undefined, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, undefined, null);
        makeHostScoped(foo, true);
      }
      assert.strictEqual(foo.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null), undefined, `foo.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);
    });

    it(`assigns undefined bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, undefined, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, undefined, null);
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).overrideContext.foo, 'baz', `(hs ?? scope).overrideContext.foo`);
    });

    it(`connects undefined bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, undefined, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, undefined, null);
        makeHostScoped(foo, true);
      }
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).overrideContext, 'foo'], 'binding.calls[0]');
    });

    it(`evaluates null bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, null, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, undefined, null);
        makeHostScoped(foo, true);
      }
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), '', `foo.evaluate(LF.none, scope, null)`);
    });

    it(`evaluates null bindingContext STRICT${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, null, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, null, null);
        makeHostScoped(foo, true);
      }
      assert.strictEqual(foo.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null), undefined, `foo.evaluate(LF.none | LF.isStrictBindingStrategy, scope, null)`);
    });

    it(`assigns null bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, null, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, null, null);
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).overrideContext.foo, 'baz', `scope.overrideContext.foo`);
    });

    it(`connects null bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = Scope.create(LF.none, null, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = Scope.create(LF.none, null, null);
        makeHostScoped(foo, true);
      }
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).overrideContext, 'foo'], 'binding.calls[0]');
    });

    it(`evaluates defined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope: IScope = createScopeForTest({ foo: 'bar' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo ,true);
      }
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    });

    it(`evaluates defined property on overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' });
      scope.overrideContext.foo = 'bar';
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, hs, null)`);
    });

    it(`assigns defined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ foo: 'bar' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).bindingContext.foo, 'baz', `(hs ?? scope).bindingContext.foo`);
    });

    it(`assigns undefined property to bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).bindingContext.foo, 'baz', `scope.bindingContext.foo`);
    });

    it(`assigns defined property on overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' });
      scope.overrideContext.foo = 'bar';
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).overrideContext.foo, 'baz', `(hs ?? scope).overrideContext.foo`);
    });

    it(`connects defined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ foo: 'bar' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).bindingContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects defined property on overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' });
      scope.overrideContext.foo = 'bar';
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).overrideContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects undefined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).bindingContext, 'foo'], 'binding.calls[0]');
    });

    it(`evaluates defined property on first ancestor bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual($parentfoo.evaluate(LF.none, hs ?? scope, hs, null), 'bar', `$parentfoo.evaluate(LF.none, scope, hs, null)`);
    });

    it(`evaluates defined property on first ancestor overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      scope.parentScope.overrideContext.foo = 'bar';
      assert.strictEqual(foo.evaluate(LF.none, scope, null, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
      assert.strictEqual($parentfoo.evaluate(LF.none, scope, null, null), 'bar', `$parentfoo.evaluate(LF.none, scope, null)`);
    });

    it(`assigns defined property on first ancestor bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).parentScope.overrideContext.bindingContext.foo, 'baz', `(hs ?? scope).parentScope.overrideContext.bindingContext.foo`);
      $parentfoo.assign(LF.none, hs ?? scope, hs, null, 'beep');
      assert.strictEqual((hs ?? scope).parentScope.overrideContext.bindingContext.foo, 'beep', `(hs ?? scope).parentScope.overrideContext.bindingContext.foo`);
    });

    it(`assigns defined property on first ancestor overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      scope.parentScope.overrideContext.foo = 'bar';
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      foo.assign(LF.none, scope, hs, null, 'baz');
      assert.strictEqual((hs ?? scope).parentScope.overrideContext.foo, 'baz', `scope.parentScope.overrideContext.foo`);
      $parentfoo.assign(LF.none, (hs ?? scope), hs, null, 'beep');
      assert.strictEqual((hs ?? scope).parentScope.overrideContext.foo, 'beep', `scope.parentScope.overrideContext.foo`);
    });

    it(`connects defined property on first ancestor bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      let binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext.bindingContext, 'foo'], 'binding.calls[0]');
      binding = new MockBinding();
      $parentfoo.connect(LF.none, hs ?? scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext.bindingContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects defined property on first ancestor overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      scope.parentScope.overrideContext.foo = 'bar';
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      let binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext, 'foo'], 'binding.calls[0]');
      binding = new MockBinding();
      $parentfoo.connect(LF.none, hs ?? scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext, 'foo'], 'binding.calls[0]');
    });

    it(`connects undefined property on first ancestor bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let scope = createScopeForTest({ abc: 'xyz' }, {});
      (scope.parentScope as Writable<IScope>).parentScope = Scope.create(LF.none, undefined, OverrideContext.create(LF.none, { foo: 'bar' }));
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
        makeHostScoped(foo, true);
      }
      const binding = new MockBinding();
      $parentfoo.connect(LF.none, hs ?? scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext.bindingContext, 'foo'], 'binding.calls[0]');
    });
  }
});

describe('AccessThisExpression', function () {
  const $parent2 = new AccessThisExpression(1);
  const $parent$parent = new AccessThisExpression(2);
  const $parent$parent$parent = new AccessThisExpression(3);

  it('evaluates undefined bindingContext', function () {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(LF.none, undefined), parentScope: null };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, undefined), parentScope: { overrideContext: coc(LF.none, undefined), parentScope: null } };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, undefined), parentScope: { overrideContext: coc(LF.none, undefined), parentScope: { overrideContext: coc(LF.none, undefined), parentScope: null } } };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, undefined), parentScope: {overrideContext: coc(LF.none, undefined), parentScope: { overrideContext: coc(LF.none, undefined), parentScope: { overrideContext: coc(LF.none, undefined), parentScope: null } } } };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);
  });

  it('evaluates null bindingContext', function () {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(LF.none, null), parentScope: null };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, null), parentScope: { overrideContext: coc(LF.none, null), parentScope: null } };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), null, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, null), parentScope: { overrideContext: coc(LF.none, null), parentScope: { overrideContext: coc(LF.none, null), parentScope: null } } };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), null, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), null, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, null), parentScope: { overrideContext: coc(LF.none, null), parentScope: { overrideContext: coc(LF.none, null), parentScope: { overrideContext: coc(LF.none, null), parentScope: null } } } };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), null, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), null, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), null, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);
  });

  it('evaluates defined bindingContext', function () {
    const coc = OverrideContext.create;
    const a = { a: 'a' };
    const b = { b: 'b' };
    const c = { c: 'c' };
    const d = { d: 'd' };
    let scope = { overrideContext: coc(LF.none, a), parentScope: null };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, a), parentScope: { overrideContext: coc(LF.none, b), parentScope: null } };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), b, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, a), parentScope: {overrideContext: coc(LF.none, b), parentScope: { overrideContext: coc(LF.none, c), parentScope: null } } };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), b, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), c, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, a), parentScope: { overrideContext: coc(LF.none, b), parentScope: { overrideContext: coc(LF.none, c), parentScope: { overrideContext:  coc(LF.none, d), parentScope: null } } } };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null, null), b, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null, null), c, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null, null), d, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);
  });
});

describe('AssignExpression', function () {
  it('can chain assignments', function () {
    const foo = new AssignExpression(new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0));
    const scope = Scope.create(LF.none, undefined, null);
    foo.assign(LF.none, scope, null, null as any, 1 as any);
    assert.strictEqual(scope.overrideContext.foo, 1, `scope.overrideContext.foo`);
    assert.strictEqual(scope.overrideContext.bar, 1, `scope.overrideContext.bar`);
  });
  it('can chain assignments - hostScoped', function () {
    const foo = new AssignExpression(new AccessScopeExpression('foo', 0, true), new AccessScopeExpression('bar', 0, true));
    const scope = Scope.create(LF.none, undefined, null);
    const hs = Scope.create(LF.none, undefined, null);
    foo.assign(LF.none, scope, hs, null as any, 1 as any);
    assert.strictEqual(hs.overrideContext.foo, 1, `scope.overrideContext.foo`);
    assert.strictEqual(hs.overrideContext.bar, 1, `scope.overrideContext.bar`);
  });
});

describe('ConditionalExpression', function () {
  it('evaluates the "yes" branch', function () {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.evaluate(null, null, null, null);
    assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 0, `no.calls.length`);
  });

  it('evaluates the "no" branch', function () {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.evaluate(null, null, null, null);
    assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 1, `no.calls.length`);
  });

  it('connects the "yes" branch', function () {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.connect(null, null, null, dummyBinding);
    assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 0, `no.calls.length`);
  });

  it('connects the "no" branch', function () {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new ConditionalExpression(condition, yes as any, no as any);

    sut.connect(null, null, null, dummyBinding);
    assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 1, `no.calls.length`);
  });
});

describe('BinaryExpression', function () {
  for(const isHostScoped of [true, false]) {
    it(`concats strings${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), new PrimitiveLiteralExpression('b'));
      let scope = createScopeForTest({});
      let hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'ab', `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $null);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'a', `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'b', `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $undefined);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'a', `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'b', `expression.evaluate(LF.none, scope, hs, null)`);
    });

    it(`adds numbers${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), new PrimitiveLiteralExpression(2));
      let scope = createScopeForTest({});
      let hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 3, `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $null);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 1, `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 2, `expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $undefined);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(isNaN(expression.evaluate(LF.none, scope, hs, null) as number), false, `isNaN(expression.evaluate(LF.none, scope, hs, null)`);

      expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(isNaN(expression.evaluate(LF.none, scope, hs, null) as number), false, `isNaN(expression.evaluate(LF.none, scope, hs, null)`);
    });

    const flags = LF.none | LF.isStrictBindingStrategy;
    it(`concats strings - STRICT${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), new PrimitiveLiteralExpression('b'));
      let scope = createScopeForTest({});
      let hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 'ab', `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $null);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 'anull', `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 'nullb', `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression('a'), $undefined);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 'aundefined', `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression('b'));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 'undefinedb', `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);
    });

    it(`adds numbers - STRICT${isHostScoped ? ' - hostScoped' : ''}`, function () {
      let expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), new PrimitiveLiteralExpression(2));
      let scope = createScopeForTest({});
      let hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 3, `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $null);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 1, `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', $null, new PrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(expression.evaluate(flags, scope, hs, null), 2, `expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', new PrimitiveLiteralExpression(1), $undefined);
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(isNaN(expression.evaluate(flags, scope, hs, null) as number), true, `isNaN(expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);

      expression = new BinaryExpression('+', $undefined, new PrimitiveLiteralExpression(2));
      scope = createScopeForTest({});
      hs = isHostScoped ? createScopeForTest({}) : null;
      assert.strictEqual(isNaN(expression.evaluate(flags, scope, hs, null) as number), true, `isNaN(expression.evaluate(LF.none | LF.isStrictBindingStrategy, scope, hs, null)`);
    });
  }

  class TestData {
    public constructor(
      public expr: BinaryExpression,
      public expected: boolean,
      public scope: IScope = createScopeForTest(),
      public hs: IScope | null = null,
    ) { }

    public toString() { return `${Unparser.unparse(this.expr)}${this.hs !== null ? ' - hostScoped' : ''}`; }
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

      const scope2 = createScopeForTest();
      const hs = createScopeForTest({ foo: { bar: null }, bar: null });
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), $host), true, scope2, hs);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), $host), true, scope2, hs);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('foo'), new AccessScopeExpression('foo', 0, true)), false, scope2, hs);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), new AccessScopeExpression('bar', 0, true)), false, scope2, hs);
      yield new TestData(new BinaryExpression('in', new PrimitiveLiteralExpression('bar'), new AccessScopeExpression('foo', 0, true)), true, scope2, hs);
    }

    for (const item of getTestData()) {
      it(item.toString(), function () {
        assert.strictEqual(item.expr.evaluate(LF.none, item.scope, item.hs, null), item.expected, `expr.evaluate(LF.none, scope, hs, null)`);
      });
    }
  });

  describe('performs \'instanceof\'', function () {
    class Foo {}
    class Bar extends Foo {}
    function* getTestData() {
      for (const [scope, hs] of [[createScopeForTest({ foo: new Foo(), bar: new Bar() }), null], [createScopeForTest(), createScopeForTest({ foo: new Foo(), bar: new Bar() })]]) {
        const isAccessScoped = hs !== null;
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('foo', 0),
            new AccessMemberExpression(new AccessScopeExpression('foo', 0, isAccessScoped), 'constructor')
          ),
          true,
          scope,
          hs,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('foo', 0),
            new AccessMemberExpression(new AccessScopeExpression('bar', 0, isAccessScoped), 'constructor')
          ),
          false,
          scope,
          hs,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('bar', 0),
            new AccessMemberExpression(new AccessScopeExpression('bar', 0, isAccessScoped), 'constructor')
          ),
          true,
          scope,
          hs,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new AccessScopeExpression('bar', 0),
            new AccessMemberExpression(new AccessScopeExpression('foo', 0, isAccessScoped), 'constructor')
          ),
          true,
          scope,
          hs,
        );
        yield new TestData(
          new BinaryExpression(
            'instanceof',
            new PrimitiveLiteralExpression('foo'),
            new AccessMemberExpression(new AccessScopeExpression('foo', 0, isAccessScoped), 'constructor')
          ),
          false,
          scope,
          hs
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
        assert.strictEqual(item.expr.evaluate(LF.none, item.scope, item.hs, null), item.expected, `expr.evaluate(LF.none, scope, hs, null)`);
      });
    }
  });
});

describe('CallMemberExpression', function () {
  for(const isHostScoped of [true, false]) {
    it(`evaluates${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const expression = new CallMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), 'bar', []);
      let callCount = 0;
      const bindingContext = {
        foo: {
          bar: () => {
            ++callCount;
            return 'baz';
          }
        }
      };
      let scope = createScopeForTest(bindingContext);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest({});
      }
      assert.strictEqual(expression.evaluate(LF.none, scope, hs, null), 'baz', `expression.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(callCount, 1, 'callCount');
    });

    it(`evaluate handles null/undefined member${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const expression = new CallMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), 'bar', []);
      let s1: IScope = createScopeForTest({ foo: {} });
      let s2: IScope = createScopeForTest({ foo: { bar: undefined } });
      let s3: IScope = createScopeForTest({ foo: { bar: null } });
      let hs1: IScope | null = null;
      let hs2: IScope | null = null;
      let hs3: IScope | null = null;
      if(isHostScoped) {
        hs1 = s1;
        s1 = createScopeForTest();
        hs2 = s2;
        s2 = createScopeForTest();
        hs3 = s3;
        s3 = createScopeForTest();
      }
      assert.strictEqual(expression.evaluate(LF.none, s1, hs1, null), undefined, `expression.evaluate(LF.none, createScopeForTest({ foo: {} }), hs, null)`);
      assert.strictEqual(expression.evaluate(LF.none, s2, hs2, null), undefined, `expression.evaluate(LF.none, createScopeForTest({ foo: { bar: undefined } }), hs, null)`);
      assert.strictEqual(expression.evaluate(LF.none, s3, hs3, null), undefined, `expression.evaluate(LF.none, createScopeForTest({ foo: { bar: null } }), hs, null)`);
    });

    it(`evaluate throws when mustEvaluate and member is null or undefined${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const expression = new CallMemberExpression(new AccessScopeExpression('foo', 0, isHostScoped), 'bar', []);
      const mustEvaluate = true;
      let s1 = createScopeForTest({});
      let s2 = createScopeForTest({ foo: {} });
      let s3 = createScopeForTest({ foo: { bar: undefined } });
      let s4 = createScopeForTest({ foo: { bar: null } });
      let hs1: IScope | null = null;
      let hs2: IScope | null = null;
      let hs3: IScope | null = null;
      let hs4: IScope | null = null;
      if(isHostScoped) {
        hs1 = s1;
        s1 = createScopeForTest();
        hs2 = s2;
        s2 = createScopeForTest();
        hs3 = s3;
        s3 = createScopeForTest();
        hs4 = s4;
        s4 = createScopeForTest();
      }
      assert.throws(() => expression.evaluate(LF.mustEvaluate, s1, hs1, null));
      assert.throws(() => expression.evaluate(LF.mustEvaluate, s2, hs2, null));
      assert.throws(() => expression.evaluate(LF.mustEvaluate, s3, hs3, null));
      assert.throws(() => expression.evaluate(LF.mustEvaluate, s4, hs4, null));
    });
  }
});

describe('CallScopeExpression', function () {
  const foo: CallScopeExpression = new CallScopeExpression('foo', [], 0);
  const hello: CallScopeExpression = new CallScopeExpression('hello', [new AccessScopeExpression('arg', 0)], 0);

  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    makeHostScoped(foo, false);
    makeHostScoped(hello, false);
    makeHostScoped(hello.args[0] as AccessScopeExpression, false);
  });

  function getScopes(initialScope: IScope, isHostScoped: boolean) {
    let scope = initialScope;
    let hs: IScope | null = null;
    if(isHostScoped) {
      hs = scope;
      scope = createScopeForTest();
      makeHostScoped(foo, true);
      makeHostScoped(hello, true);
      makeHostScoped(hello.args[0] as AccessScopeExpression, true);
    }
    return [scope, hs];
  }
  for(const isHostScoped of [true, false]) {
    it(`evaluates undefined bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(Scope.create(LF.none, undefined, null), isHostScoped);
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), undefined, `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(hello.evaluate(LF.none, scope, hs, null), undefined, `hello.evaluate(LF.none, scope, hs, null)`);
    });

    it(`throws when mustEvaluate and evaluating undefined bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(Scope.create(LF.none, undefined, null), isHostScoped);
      const mustEvaluate = true;
      assert.throws(() => foo.evaluate(LF.mustEvaluate, scope, hs, null));
      assert.throws(() => hello.evaluate(LF.mustEvaluate, scope, hs, null));
    });

    it(`connects undefined bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(Scope.create(LF.none, undefined, null), isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).overrideContext, 'arg'], 'binding.calls[0]');
    });

    it(`evaluates null bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(Scope.create(LF.none, null, null), isHostScoped);
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), undefined, `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(hello.evaluate(LF.none, scope, hs, null), undefined, `hello.evaluate(LF.none, scope, hs, null)`);
    });

    it(`throws when mustEvaluate and evaluating null bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(Scope.create(LF.none, null, null), isHostScoped);
      const mustEvaluate = true;
      assert.throws(() => foo.evaluate(LF.mustEvaluate, scope, hs, null));
      assert.throws(() => hello.evaluate(LF.mustEvaluate, scope, hs, null));
    });

    it(`connects null bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(Scope.create(LF.none, null, null), isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).overrideContext, 'arg'], 'binding.calls[0]');
    });

    it(`evaluates defined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(createScopeForTest({ foo: () => 'bar', hello: arg => arg, arg: 'world' }), isHostScoped);
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(hello.evaluate(LF.none, scope, hs, null), 'world', `hello.evaluate(LF.none, scope, hs, null)`);
    });

    it(`evaluates defined property on overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const s = createScopeForTest({ abc: () => 'xyz' });
      s.overrideContext.foo = () => 'bar';
      s.overrideContext.hello = arg => arg;
      s.overrideContext.arg = 'world';
      const [scope, hs] = getScopes(s, isHostScoped);
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(hello.evaluate(LF.none, scope, hs, null), 'world', `hello.evaluate(LF.none, scope, hs, null)`);
    });

    it(`connects defined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(createScopeForTest({ foo: 'bar' }), isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).bindingContext, 'arg'], 'binding.calls[0]');
    });

    it(`connects defined property on overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const s1 = createScopeForTest({ abc: 'xyz' });
      s1.overrideContext.foo = () => 'bar';
      s1.overrideContext.hello = arg => arg;
      s1.overrideContext.arg = 'world';
      const [scope, hs] = getScopes(s1, isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).overrideContext, 'arg'], 'binding.calls[0]');
    });

    it(`connects undefined property on bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(createScopeForTest({ abc: 'xyz' }), isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).bindingContext, 'arg'], 'binding.calls[0]');
    });

    it(`evaluates defined property on first ancestor bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' }), isHostScoped);
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(hello.evaluate(LF.none, scope, hs, null), 'world', `hello.evaluate(LF.none, scope, hs, null)`);
    });

    it(`evaluates defined property on first ancestor overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const s1 = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      s1.parentScope.overrideContext.foo = () => 'bar';
      s1.parentScope.overrideContext.hello = arg => arg;
      s1.parentScope.overrideContext.arg = 'world';
      const [scope, hs] = getScopes(s1, isHostScoped);
      assert.strictEqual(foo.evaluate(LF.none, scope, hs, null), 'bar', `foo.evaluate(LF.none, scope, hs, null)`);
      assert.strictEqual(hello.evaluate(LF.none, scope, hs, null), 'world', `hello.evaluate(LF.none, scope, hs, null)`);
    });

    it(`connects defined property on first ancestor bindingContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const [scope, hs] = getScopes(createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' }), isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext.bindingContext, 'arg'], 'binding.calls[0]');
    });

    it(`connects defined property on first ancestor overrideContext${isHostScoped ? ' - hostScoped' : ''}`, function () {
      const s1 = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
      s1.parentScope.overrideContext.foo = () => 'bar';
      s1.parentScope.overrideContext.hello = arg => arg;
      s1.parentScope.overrideContext.arg = 'world';
      const [scope, hs] = getScopes(s1, isHostScoped);
      const binding = new MockBinding();
      foo.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
      hello.connect(LF.none, scope, hs, binding);
      assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
      assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, (hs ?? scope).parentScope.overrideContext, 'arg'], 'binding.calls[0]');
    });
  }
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
    ) { }

    public get scope() { return createScopeForTest(this.ctx); }
    public get hostScope() { return this.hsCtx !== null ? createScopeForTest(this.hsCtx) : null; }
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
      new TemplateExpression(['a', 'c', 'e'], [new AccessScopeExpression('b', 0, true), new AccessScopeExpression('d', 0, true)]),
      'a1c2e',
      {},
      { b: 1, d: 2 }
    );
    yield new TestData(
      new TemplateExpression(['a', 'c', 'e'], [new AccessScopeExpression('b', 0), new AccessScopeExpression('d', 0, true)]),
      'a42c84e',
      { b: 42 },
      { d: 84 }
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
        [''],
        [],
        new AccessScopeExpression('foo', 0, true)
      ),
      'foo',
      {},
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
        ['foo'],
        ['bar'],
        new AccessScopeExpression('baz', 0, true)
      ),
      'foobar',
      {},
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
        new AccessScopeExpression('makeString', 0, true),
        [new PrimitiveLiteralExpression('foo')]
      ),
      '1foo2',
      {},
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
        ['1', '2'],
        [],
        new AccessScopeExpression('makeString', 0, true),
        [new AccessScopeExpression('foo', 0, true)]
      ),
      '1bar2',
      {},
      { foo: 'bar', makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2'],
        [],
        new AccessScopeExpression('makeString', 0, true),
        [new AccessScopeExpression('foo', 0)]
      ),
      '1baz2',
      { foo: 'baz' },
      { foo: 'bar', makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2'],
        [],
        new AccessScopeExpression('makeString', 0),
        [new AccessScopeExpression('foo', 0, true)]
      ),
      '1bar2',
      { foo: 'baz', makeString: (cooked, foo) => `${cooked[0]}${foo}${cooked[1]}` },
      { foo: 'bar' }
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
        new AccessScopeExpression('makeString', 0, true),
        [new AccessScopeExpression('foo', 0, true), new AccessScopeExpression('bar', 0, true)]
      ),
      'bazqux',
      {},
      { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => `${foo}${bar}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessScopeExpression('makeString', 0, true),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0)]
      ),
      'fizfuz',
      { foo: 'fiz', bar: 'fuz'},
      { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => `${foo}${bar}` }
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessScopeExpression('makeString', 0),
        [new AccessScopeExpression('foo', 0, true), new AccessScopeExpression('bar', 0, true)]
      ),
      'bazqux',
      { foo: 'fiz', bar: 'fuz', makeString: (cooked, foo, bar) => `${foo}${bar}` },
      { foo: 'baz', bar: 'qux'}
    );
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessScopeExpression('makeString', 0),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0, true)]
      ),
      'fizqux',
      { foo: 'fiz', bar: 'fuz', makeString: (cooked, foo, bar) => `${foo}${bar}` },
      { foo: 'baz', bar: 'qux'}
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
        new AccessMemberExpression(new AccessScopeExpression('test', 0, true), 'makeString'),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0)]
      ),
      '1baz2qux3foo',
      { foo: 'baz', bar: 'qux' },
      { test: new Test() }
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
    yield new TestData(
      new TaggedTemplateExpression(
        ['1', '2', '3'],
        [],
        new AccessKeyedExpression(new AccessScopeExpression('test', 0, true), new PrimitiveLiteralExpression('makeString')),
        [new AccessScopeExpression('foo', 0), new AccessScopeExpression('bar', 0)]
      ),
      '1baz2qux3foo',
      { foo: 'baz', bar: 'qux' },
      { test: new Test() }
    );
  }

  for (const item of getTestData()) {
    it(`${Unparser.unparse(item.expr)} evaluates ${item.expected}`, function () {
      assert.strictEqual(item.expr.evaluate(LF.none, item.scope, item.hostScope, null), item.expected, `expr.evaluate(LF.none, scope, hs, null)`);
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
      { expr: new UnaryExpression('typeof', new AccessScopeExpression('foo', 0)), expected: 'undefined' }
    ];
    const scope: IScope = createScopeForTest({});

    for (const { expr, expected } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(LF.none, scope, null, null), expected, `expr.evaluate(LF.none, scope, null)`);
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
    let scope: IScope = createScopeForTest({});

    for (const { expr } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(LF.none, scope, null, null), undefined, `expr.evaluate(LF.none, scope, null)`);
      });
    }

    it('void foo()', function () {
      let fooCalled = false;
      const foo = () => (fooCalled = true);
      scope = createScopeForTest({ foo });
      const expr = new UnaryExpression('void', new CallScopeExpression('foo', [], 0));
      assert.strictEqual(expr.evaluate(LF.none, scope, null, null), undefined, `expr.evaluate(LF.none, scope, null)`);
      assert.strictEqual(fooCalled, true, `fooCalled`);
    });
  });
});

describe('BindingBehaviorExpression', function () {
  type $1 = [/* title */string, /* flags */LF];
  type $2 = [/* title */string, /* $kind */ExpressionKind];
  type $3 = [/* title */string, /* scope */IScope, /* hostScope */IScope | null, /* sut */BindingBehaviorExpression, /* mock */MockBindingBehavior, /* locator */IServiceLocator, /* binding */IConnectableBinding, /* value */any, /* argValues */any[]];

  const flagVariations: (() => $1)[] = // [/*title*/string, /*flags*/LF],
  [
    () => [`fromBind  `, LF.fromBind],
    () => [`fromUnbind`, LF.fromUnbind]
  ];

  const kindVariations: (($1: $1) => $2)[] = // [/*title*/string, /*$kind*/ExpressionKind],
  [
    () => [`0                `, 0],
    () => [`hasBind          `, ExpressionKind.HasBind],
    () => [`hasUnbind        `, ExpressionKind.HasUnbind],
    () => [`hasBind|hasUnbind`, ExpressionKind.HasBind | ExpressionKind.HasUnbind]
  ];

  const inputVariations: (($1: $1, $2: $2) => $3)[] = // [/*title*/string, /*scope*/IScope, /*hostScope*/IScope|null, /*sut*/BindingBehaviorExpression, /*mock*/MockBindingBehavior, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[]],
  [true, false].flatMap((isHostScoped) =>  [
    // test without arguments
    (_$1: $1, [_t2, $kind]: $2) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      expr.$kind = $kind;
      const args = [];
      const sut = new BindingBehaviorExpression(expr as any, 'mock', args);

      const mock = new MockBindingBehavior();
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:binding-behavior:mock', mock]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo&mock`, scope, hs, sut, mock, locator, binding, value, []] as $3;
    },
    // test with 1 argument
    (_$1: $1, [_t2, $kind]: $2) => {
      const value = {};
      const arg1 = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      expr.$kind = $kind;
      const args = [new MockTracingExpression(new AccessScopeExpression('a', 0, isHostScoped))];
      const sut = new BindingBehaviorExpression(expr as any, 'mock', args as any);

      const mock = new MockBindingBehavior();
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:binding-behavior:mock', mock]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value, a: arg1 }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo&mock:a`, scope, hs, sut, mock, locator, binding, value, [arg1]] as $3;
    },
    // test with 3 arguments
    (_$1: $1, [_t2, $kind]: $2) => {
      const value = {};
      const arg1 = {};
      const arg2 = {};
      const arg3 = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      expr.$kind = $kind;
      const args = [
        new MockTracingExpression(new AccessScopeExpression('a', 0, isHostScoped)),
        new MockTracingExpression(new AccessScopeExpression('b', 0, isHostScoped)),
        new MockTracingExpression(new AccessScopeExpression('c', 0, isHostScoped))
      ];
      const sut = new BindingBehaviorExpression(expr as any, 'mock', args as any);

      const mock = new MockBindingBehavior();
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:binding-behavior:mock', mock]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value, a: arg1, b: arg2, c: arg3 }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo&mock:a:b:c`, scope, hs, sut, mock, locator, binding, value, [arg1, arg2, arg3]] as $3;
    }
  ]);

  const bindVariations: (($1: $1, $2: $2, $3: $3) => /* bind */() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, hs, sut, mock, locator, binding, value, argValues]) => () => {
      assert.strictEqual(binding['au:resource:binding-behavior:mock'], undefined, `binding['au:resource:binding-behavior:mock']`);

      // act
      sut.bind(flags, scope, hs, binding as any);

      // assert
      assert.strictEqual(binding['au:resource:binding-behavior:mock'], mock, `binding['au:resource:binding-behavior:mock']`);
      const expr = sut.expression as any as MockTracingExpression;
      const args = sut.args as any as MockTracingExpression[];

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);
      assert.strictEqual(mock.calls[0].length, 5 + args.length, `mock.calls[0].length`);
      assert.strictEqual(mock.calls[0][0], 'bind', `mock.calls[0][0]`);
      assert.strictEqual(mock.calls[0][1], flags, `mock.calls[0][1]`);
      assert.strictEqual(mock.calls[0][2], scope, `mock.calls[0][2]`);
      assert.strictEqual(mock.calls[0][3], hs, `mock.calls[0][3]`);
      assert.strictEqual(mock.calls[0][4], binding, `mock.calls[0][4]`);
      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        // verify the ...rest argument values provided to the bind() call
        assert.strictEqual(mock.calls[0][5 + i], argValues[i], `mock.calls[0][5 + i]`);
        // verify the arguments that the bb's argument expressions were called with to obtain the values
        assert.strictEqual(arg.calls.length, 1, `arg.calls.length`);
        assert.strictEqual(arg.calls[0].length, 5, `arg.calls[0].length`);
        assert.strictEqual(arg.calls[0][0], 'evaluate', `arg.calls[0][0]`);
        assert.strictEqual(arg.calls[0][1], flags, `arg.calls[0][1]`);
        assert.strictEqual(arg.calls[0][2], scope, `arg.calls[0][2]`);
        assert.strictEqual(arg.calls[0][3], hs, `arg.calls[0][3]`);
        assert.strictEqual(arg.calls[0][4], locator, `arg.calls[0][4]`);
      }

      if ($kind & ExpressionKind.HasBind) {
        assert.strictEqual(expr.calls.length, 1, `expr.calls.length`);
        assert.strictEqual(expr.calls[0].length, 5, `expr.calls[0].length`);
        assert.strictEqual(expr.calls[0][0], 'bind', `expr.calls[0][0]`);
        assert.strictEqual(expr.calls[0][1], flags, `expr.calls[0][1]`);
        assert.strictEqual(expr.calls[0][2], scope, `expr.calls[0][2]`);
        assert.strictEqual(expr.calls[0][3], hs, `expr.calls[0][3]`);
        assert.strictEqual(expr.calls[0][4], binding, `expr.calls[0][4]`);
      } else {
        assert.strictEqual(expr.calls.length, 0, `expr.calls.length`);
      }
    }
  ];

  const evaluateVariations: (($1: $1, $2: $2, $3: $3) => /* evaluate */() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, hs, sut, mock, locator, binding, value, argValues]) => () => {
      // act
      const actual = sut.evaluate(flags, scope, hs, binding.locator);

      // assert
      assert.strictEqual(actual, value, `actual`);

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 2 : 1;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 5, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'evaluate', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], hs, `expr.calls[callCount - 1][3]`);
      assert.strictEqual(expr.calls[callCount - 1][4], binding.locator, `expr.calls[callCount - 1][4]`);
    }
  ];

  const connectVariations: (($1: $1, $2: $2, $3: $3) => /* connect */() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, hs, sut, mock, locator, binding, value, argValues]) => () => {
      assert.strictEqual(binding.observerSlots, undefined, `binding.observerSlots`);

      // act
      sut.connect(flags, scope, hs, binding);

      // assert
      assert.strictEqual(binding.observerSlots, 1, `binding.observerSlots`);

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 3 : 2;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 5, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'connect', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], hs, `expr.calls[callCount - 1][3]`);
      assert.strictEqual(expr.calls[callCount - 1][4], binding, `expr.calls[callCount - 1][4]`);
    }
  ];

  const assignVariations: (($1: $1, $2: $2, $3: $3) => /* assign */() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, hs, sut, mock, locator, binding, value, argValues]) => () => {
      const newValue = {};

      // act
      const actual = sut.assign(flags, scope, hs, binding.locator, newValue);

      // assert
      assert.strictEqual(actual, newValue, `actual`);
      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 4 : 3;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 6, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'assign', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], hs, `expr.calls[callCount - 1][3]`);
      assert.strictEqual(expr.calls[callCount - 1][4], binding.locator, `expr.calls[callCount - 1][4]`);
      assert.strictEqual(expr.calls[callCount - 1][5], newValue, `expr.calls[callCount - 1][5]`);

      return newValue;
    }
  ];

  const $2ndEvaluateVariations: (($1: $1, $2: $2, $3: $3) => /* evaluate */(value: any) => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, hs, sut, mock, locator, binding, value, argValues]) => (newValue) => {
      // act
      const actual = sut.evaluate(flags, scope, hs, binding.locator);

      // assert
      assert.strictEqual(actual, newValue, `actual`);

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 5 : 4;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 5, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'evaluate', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], hs, `expr.calls[callCount - 1][3]`);
      assert.strictEqual(expr.calls[callCount - 1][4], binding.locator, `expr.calls[callCount - 1][4]`);
    }
  ];

  const unbindVariations: (($1: $1, $2: $2, $3: $3) => /* unbind */() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, hs, sut, mock, locator, binding, value, argValues]) => () => {
      assert.strictEqual(binding['au:resource:binding-behavior:mock'], mock, `binding['au:resource:binding-behavior:mock']`);

      // act
      sut.unbind(flags, scope, hs, binding as any);

      // assert
      assert.strictEqual(binding['au:resource:binding-behavior:mock'], void 0, `binding['au:resource:binding-behavior:mock']`);

      assert.strictEqual(mock.calls.length, 2, `mock.calls.length`);
      assert.strictEqual(mock.calls[1].length, 5, `mock.calls[1].length`);
      assert.strictEqual(mock.calls[1][0], 'unbind', `mock.calls[1][0]`);
      assert.strictEqual(mock.calls[1][1], flags, `mock.calls[1][1]`);
      assert.strictEqual(mock.calls[1][2], scope, `mock.calls[1][2]`);
      assert.strictEqual(mock.calls[1][3], hs, `mock.calls[1][3]`);
      assert.strictEqual(mock.calls[1][4], binding, `mock.calls[1][4]`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 6 : 5;
      if ($kind & ExpressionKind.HasUnbind) {
        assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
        assert.strictEqual(expr.calls[callCount - 1].length, 5, `expr.calls[callCount - 1].length`);
        assert.strictEqual(expr.calls[callCount - 1][0], 'unbind', `expr.calls[callCount - 1][0]`);
        assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
        assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
        assert.strictEqual(expr.calls[callCount - 1][3], hs, `expr.calls[callCount - 1][3]`);
        assert.strictEqual(expr.calls[callCount - 1][4], binding, `expr.calls[callCount - 1][4]`);
      } else {
        assert.strictEqual(expr.calls.length, callCount - 1, `expr.calls.length`);
      }
    }
  ];

  const inputs: [typeof flagVariations, typeof kindVariations, typeof inputVariations, typeof bindVariations, typeof evaluateVariations, typeof connectVariations, typeof assignVariations, typeof $2ndEvaluateVariations, typeof unbindVariations]
    = [flagVariations, kindVariations, inputVariations, bindVariations, evaluateVariations, connectVariations, assignVariations, $2ndEvaluateVariations, unbindVariations];

  eachCartesianJoinFactory.call(this, inputs, ([t1], [t2], [t3], bind, evaluate1, connect, assign, evaluate2, unbind) => {
    it(`flags=${t1}, kind=${t2}, expr=${t3} -> bind() -> evaluate() -> connect() -> assign() -> evaluate() -> unbind()`, function () {
      bind();
      evaluate1();
      connect();
      const newValue = assign();
      evaluate2(newValue);
      unbind();
    });
  }
  );
});

describe('ValueConverterExpression', function () {
  type $1 = [/* title */string, /* flags */LF];
  type $2 = [/* title */string, /* signals */string[], /* signaler */MockSignaler];
  type $3 = [/* title */string, /* scope */IScope, /* hostScope */IScope | null, /* sut */ValueConverterExpression, /* mock */MockValueConverter, /* locator */IServiceLocator, /* binding */IConnectableBinding, /* value */any, /* argValues */any[], /* methods */string[]];

  const flagVariations: (() => $1)[] = // [/*title*/string, /*flags*/LF],
  [
    () => [`fromBind  `, LF.fromBind],
    () => [`fromUnbind`, LF.fromUnbind]
  ];

  const kindVariations: (($1: $1) => $2)[] = // [/*title*/string, /*signals*/string[], /*signaler*/ISignaler],
  [
    () => [`undefined    `, undefined      , new MockSignaler()],
    () => [`[]           `, []             , new MockSignaler()],
    () => [`['a']        `, ['a']          , new MockSignaler()],
    () => [`['a','b','c']`, ['a', 'b', 'c'], new MockSignaler()]
  ];

  const inputVariations: (($1: $1, $2: $2) => $3)[] = [true, false].flatMap((isHostScoped) => [
    // test without arguments, no toView, no fromView
    (_$1: $1, [_t2, signals, signaler]: $2) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      const args = [];
      const sut = new ValueConverterExpression(expr as any, 'mock', args);

      const methods = [];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo|mock`, scope, hs, sut, mock, locator, binding, value, [], methods] as $3;
    },
    // test without arguments, no fromView
    (_$1: $1, [_t2, signals, signaler]: $2) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      const args = [];
      const sut = new ValueConverterExpression(expr as any, 'mock', args);

      const methods = ['toView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo|mock`, scope, hs, sut, mock, locator, binding, value, [], methods] as $3;
    },
    // test without arguments, no toView
    (_$1: $1, [_t2, signals, signaler]: $2) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      const args = [];
      const sut = new ValueConverterExpression(expr as any, 'mock', args);

      const methods = ['fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo|mock`, scope, hs, sut, mock, locator, binding, value, [], methods] as $3;
    },
    // test without arguments
    (_$1: $1, [_t2, signals, signaler]: $2) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      const args = [];
      const sut = new ValueConverterExpression(expr as any, 'mock', args);

      const methods = ['toView', 'fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo|mock`, scope, hs, sut, mock, locator, binding, value, [], methods] as $3;
    },
    // test with 1 argument
    (_$1: $1, [_t2, signals, signaler]: $2) => {
      const value = {};
      const arg1 = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      const args = [new MockTracingExpression(new AccessScopeExpression('a', 0, isHostScoped))];
      const sut = new ValueConverterExpression(expr as any, 'mock', args as any);

      const methods = ['toView', 'fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value, a: arg1 }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo|mock:a`, scope, hs, sut, mock, locator, binding, value, [arg1], methods] as $3;
    },
    // test with 3 arguments
    (_$1: $1, [_t2, signals, signaler]: $2) => {
      const value = {};
      const arg1 = {};
      const arg2 = {};
      const arg3 = {};
      const expr = new MockTracingExpression(new AccessScopeExpression('foo', 0, isHostScoped));
      const args = [
        new MockTracingExpression(new AccessScopeExpression('a', 0, isHostScoped)),
        new MockTracingExpression(new AccessScopeExpression('b', 0, isHostScoped)),
        new MockTracingExpression(new AccessScopeExpression('c', 0, isHostScoped))
      ];
      const sut = new ValueConverterExpression(expr as any, 'mock', args as any);

      const methods = ['toView', 'fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['au:resource:value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new PropertyBinding(expr as any, null, null, null, observerLocator, locator);

      let scope = Scope.create(LF.none, { foo: value, a: arg1, b: arg2, c: arg3 }, null);
      let hs: IScope | null = null;
      if(isHostScoped) {
        hs = scope;
        scope = createScopeForTest();
      }
      return [`foo|mock:a:b:c`, scope, hs, sut, mock, locator, binding, value, [arg1, arg2, arg3], methods] as $3;
    }
  ]);

  const evaluateVariations: (($1: $1, $2: $2, $3: $3) => /* evaluate */() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, hs, sut, mock, locator, binding, value, argValues, methods]) => () => {
      // act
      const actual = sut.evaluate(flags, scope, hs, binding.locator);

      // assert
      assert.strictEqual(actual, value, `actual`);

      const expr = sut.expression as any as MockTracingExpression;
      const args = sut.args as any as MockTracingExpression[];

      if (methods.includes('toView')) {
        assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);
        assert.strictEqual(mock.calls[0].length, 2 + args.length, `mock.calls[0].length`);
        assert.strictEqual(mock.calls[0][0], 'toView', `mock.calls[0][0]`);
        assert.strictEqual(mock.calls[0][1], value, `mock.calls[0][1]`);
        for (let i = 0, ii = argValues.length; i < ii; ++i) {
          assert.strictEqual(mock.calls[0][i + 2], argValues[i], `mock.calls[0][i + 2]`);
        }
      } else {
        assert.strictEqual(mock.calls.length, 0, `mock.calls.length`);
      }

      assert.strictEqual(expr.calls.length, 1, `expr.calls.length`);
      assert.strictEqual(expr.calls[0].length, 5, `expr.calls[0].length`);
      assert.strictEqual(expr.calls[0][0], 'evaluate', `expr.calls[0][0]`);
      assert.strictEqual(expr.calls[0][1], flags, `expr.calls[0][1]`);
      assert.strictEqual(expr.calls[0][2], scope, `expr.calls[0][2]`);
      assert.strictEqual(expr.calls[0][3], hs, `expr.calls[0][3]`);
      assert.strictEqual(expr.calls[0][4], binding.locator, `expr.calls[0][4]`);

      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        if (methods.includes('toView')) {
          assert.strictEqual(arg.calls.length, 1, `arg.calls.length`);
          assert.strictEqual(arg.calls[0].length, 5, `arg.calls[0].length`);
          assert.strictEqual(arg.calls[0][0], 'evaluate', `arg.calls[0][0]`);
          assert.strictEqual(arg.calls[0][1], flags, `arg.calls[0][1]`);
          assert.strictEqual(arg.calls[0][2], scope, `arg.calls[0][2]`);
          assert.strictEqual(arg.calls[0][3], hs, `arg.calls[0][3]`);
          assert.strictEqual(arg.calls[0][4], binding.locator, `arg.calls[0][4]`);
        } else {
          assert.strictEqual(arg.calls.length, 0, `arg.calls.length`);
        }
      }
    }
  ];

  const connectVariations: (($1: $1, $2: $2, $3: $3) => /* connect */() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, hs, sut, mock, locator, binding, value, argValues, methods]) => () => {
      assert.strictEqual(binding.observerSlots, undefined, `binding.observerSlots`);

      // act
      sut.connect(flags, scope, hs, binding);

      // assert
      assert.strictEqual(binding.observerSlots, 1 + argValues.length, `binding.observerSlots`);

      const hasToView = methods.includes('toView');
      assert.strictEqual(mock.calls.length, hasToView ? 1 : 0, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      assert.strictEqual(expr.calls.length, 2, `expr.calls.length`);
      assert.strictEqual(expr.calls[1].length, 5, `expr.calls[1].length`);
      assert.strictEqual(expr.calls[1][0], 'connect', `expr.calls[1][0]`);
      assert.strictEqual(expr.calls[1][1], flags, `expr.calls[1][1]`);
      assert.strictEqual(expr.calls[1][2], scope, `expr.calls[1][2]`);
      assert.strictEqual(expr.calls[1][3], hs, `expr.calls[1][3]`);
      assert.strictEqual(expr.calls[1][4], binding, `expr.calls[1][4]`);

      const args = sut.args as any as MockTracingExpression[];
      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        const offset = hasToView ? 1 : 0;
        assert.strictEqual(arg.calls.length, offset + 1, `arg.calls.length`);
        assert.strictEqual(arg.calls[offset].length, 5, `arg.calls[offset].length`);
        assert.strictEqual(arg.calls[offset][0], 'connect', `arg.calls[offset][0]`);
        assert.strictEqual(arg.calls[offset][1], flags, `arg.calls[offset][1]`);
        assert.strictEqual(arg.calls[offset][2], scope, `arg.calls[offset][2]`);
        assert.strictEqual(arg.calls[offset][3], hs, `arg.calls[offset][3]`);
        assert.strictEqual(arg.calls[offset][4], binding, `arg.calls[offset][4]`);
      }

      if (signals) {
        assert.strictEqual(signaler.calls.length, signals.length, `signaler.calls.length`);
        for (let i = 0, ii = signals.length; i < ii; ++i) {
          const signal = signals[i];
          assert.strictEqual(signaler.calls[i][0], 'addSignalListener', `signaler.calls[i][0]`);
          assert.strictEqual(signaler.calls[i][1], signal, `signaler.calls[i][1]`);
          assert.strictEqual(signaler.calls[i][2], binding, `signaler.calls[i][2]`);
        }
      } else {
        assert.strictEqual(signaler.calls.length, 0, `signaler.calls.length`);
      }
    }
  ];

  const assignVariations: (($1: $1, $2: $2, $3: $3) => /* assign */() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, hs, sut, mock, locator, binding, value, argValues, methods]) => () => {
      const newValue = {};

      // act
      const actual = sut.assign(flags, scope, hs, binding.locator, newValue);

      // assert
      assert.strictEqual(actual, newValue, `actual`);

      const expr = sut.expression as any as MockTracingExpression;
      const args = sut.args as any as MockTracingExpression[];

      const hasToView = methods.includes('toView');
      const hasFromView = methods.includes('fromView');
      assert.strictEqual(mock.calls.length, methods.length, `mock.calls.length`);
      if (hasFromView) {
        const offset = hasToView ? 1 : 0;
        assert.strictEqual(mock.calls[offset].length, 2 + args.length, `mock.calls[offset].length`);
        assert.strictEqual(mock.calls[offset][0], 'fromView', `mock.calls[offset][0]`);
        assert.strictEqual(mock.calls[offset][1], newValue, `mock.calls[offset][1]`);
        for (let i = 0, ii = argValues.length; i < ii; ++i) {
          assert.strictEqual(mock.calls[offset][i + 2], argValues[i], `mock.calls[offset][i + 2]`);
        }
      }

      assert.strictEqual(expr.calls.length, 3, `expr.calls.length`);
      assert.strictEqual(expr.calls[2].length, 6, `expr.calls[2].length`);
      assert.strictEqual(expr.calls[2][0], 'assign', `expr.calls[2][0]`);
      assert.strictEqual(expr.calls[2][1], flags, `expr.calls[2][1]`);
      assert.strictEqual(expr.calls[2][2], scope, `expr.calls[2][2]`);
      assert.strictEqual(expr.calls[2][3], hs, `expr.calls[2][3]`);
      assert.strictEqual(expr.calls[2][4], binding.locator, `expr.calls[2][4]`);
      assert.strictEqual(expr.calls[2][5], newValue, `expr.calls[2][5]`);

      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        const callCount = hasToView ? hasFromView ? 3 : 2 : 1;
        assert.strictEqual(arg.calls.length, callCount, `arg.calls.length`);
        assert.strictEqual(arg.calls[callCount - 1].length, 5, `arg.calls[callCount - 1].length`);
        assert.strictEqual(arg.calls[callCount - 1][0], 'evaluate', `arg.calls[callCount - 1][0]`);
        assert.strictEqual(arg.calls[callCount - 1][1], flags, `arg.calls[callCount - 1][1]`);
        assert.strictEqual(arg.calls[callCount - 1][2], scope, `arg.calls[callCount - 1][2]`);
        assert.strictEqual(arg.calls[callCount - 1][3], hs, `arg.calls[callCount - 1][3]`);
        assert.strictEqual(arg.calls[callCount - 1][4], binding.locator, `arg.calls[callCount - 1][4]`);
      }

      return newValue;
    }
  ];

  const $2ndEvaluateVariations: (($1: $1, $2: $2, $3: $3) => /* evaluate */(value: any) => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, hs, sut, mock, locator, binding, value, argValues, methods]) => (newValue) => {
      // act
      const actual = sut.evaluate(flags, scope, hs, binding.locator);

      // assert
      assert.strictEqual(actual, newValue, `actual`);

      const expr = sut.expression as any as MockTracingExpression;
      const args = sut.args as any as MockTracingExpression[];

      const hasToView = methods.includes('toView');
      const hasFromView = methods.includes('fromView');
      const callCount = hasToView ? (hasFromView ? 3 : 2) : (hasFromView ? 1 : 0);
      assert.strictEqual(mock.calls.length, callCount, `mock.calls.length`);
      if (hasToView) {
        assert.strictEqual(mock.calls[callCount - 1].length, 2 + args.length, `mock.calls[callCount - 1].length`);
        assert.strictEqual(mock.calls[callCount - 1][0], 'toView', `mock.calls[callCount - 1][0]`);
        assert.strictEqual(mock.calls[callCount - 1][1], actual, `mock.calls[callCount - 1][1]`);
        for (let i = 0, ii = argValues.length; i < ii; ++i) {
          assert.strictEqual(mock.calls[callCount - 1][i + 2], argValues[i], `mock.calls[callCount - 1][i + 2]`);
        }
      }

      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        assert.strictEqual(arg.calls.length, callCount + 1, `arg.calls.length`);
        if (hasToView) {
          assert.strictEqual(arg.calls[callCount - 1].length, 5, `arg.calls[callCount - 1].length`);
          assert.strictEqual(arg.calls[callCount - 1][0], 'evaluate', `arg.calls[callCount - 1][0]`);
          assert.strictEqual(arg.calls[callCount - 1][1], flags, `arg.calls[callCount - 1][1]`);
          assert.strictEqual(arg.calls[callCount - 1][2], scope, `arg.calls[callCount - 1][2]`);
          assert.strictEqual(arg.calls[callCount - 1][3], hs, `arg.calls[callCount - 1][3]`);
          assert.strictEqual(arg.calls[callCount - 1][4], binding.locator, `arg.calls[callCount - 1][4]`);
        }
      }

      assert.strictEqual(expr.calls.length, 4, `expr.calls.length`);
      assert.strictEqual(expr.calls[3].length, 5, `expr.calls[3].length`);
      assert.strictEqual(expr.calls[3][0], 'evaluate', `expr.calls[3][0]`);
      assert.strictEqual(expr.calls[3][1], flags, `expr.calls[3][1]`);
      assert.strictEqual(expr.calls[3][2], scope, `expr.calls[3][2]`);
      assert.strictEqual(expr.calls[3][3], hs, `expr.calls[3][3]`);
      assert.strictEqual(expr.calls[3][4], binding.locator, `expr.calls[3][4]`);
    }
  ];

  const unbindVariations: (($1: $1, $2: $2, $3: $3) => /* unbind */() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, hs, sut, mock, locator, binding, value, argValues, methods]) => () => {
      // act
      sut.unbind(flags, scope, hs, binding);

      // assert
      // const offset = methods.length;
      // assert.strictEqual(mock.calls.length, offset + 1, `mock.calls.length`);

      // const expr = sut.expression as any as MockTracingExpression;
      // assert.strictEqual(expr.calls.length, 4, `expr.calls.length`);

      if (signals) {
        assert.strictEqual(signaler.calls.length, signals.length * 2, `signaler.calls.length`);
        for (let i = 0, ii = signals.length; i < ii; ++i) {
          const signal = signals[i];
          assert.strictEqual(signaler.calls[signals.length + i][0], 'removeSignalListener', `signaler.calls[signals.length + i][0]`);
          assert.strictEqual(signaler.calls[signals.length + i][1], signal, `signaler.calls[signals.length + i][1]`);
          assert.strictEqual(signaler.calls[signals.length + i][2], binding, `signaler.calls[signals.length + i][2]`);
        }
      } else {
        assert.strictEqual(signaler.calls.length, 0, `signaler.calls.length`);
      }
    }
  ];

  const inputs: [typeof flagVariations, typeof kindVariations, typeof inputVariations, typeof evaluateVariations, typeof connectVariations, typeof assignVariations, typeof $2ndEvaluateVariations, typeof unbindVariations]
    = [flagVariations, kindVariations, inputVariations, evaluateVariations, connectVariations, assignVariations, $2ndEvaluateVariations, unbindVariations];

  eachCartesianJoinFactory.call(this, inputs, ([t1], [t2], [t3], evaluate1, connect, assign, evaluate2, unbind) => {
    it(`flags=${t1}, signalr=${t2} expr=${t3} -> evaluate() -> connect() -> assign() -> evaluate() -> unbind()`, function () {
      evaluate1();
      connect();
      const newValue = assign();
      evaluate2(newValue);
      unbind();
    });
  }
  );
});

const e = new PrimitiveLiteralExpression('') as any;
/* eslint-disable space-in-parens */
describe('helper functions', function () {
  it('connects', function () {
    assert.strictEqual(connects(new AccessThisExpression()                ), false, `connects(new AccessThisExpression()                )`);
    assert.strictEqual(connects(new AccessScopeExpression('')             ), true, `connects(new AccessScopeExpression('')             )`);
    assert.strictEqual(connects(new ArrayLiteralExpression([])            ), true, `connects(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(connects(new ObjectLiteralExpression([], [])       ), true, `connects(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(connects(new PrimitiveLiteralExpression('')        ), false, `connects(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(connects(new TemplateExpression([])                ), true, `connects(new TemplateExpression([])                )`);
    assert.strictEqual(connects(new UnaryExpression('!', e)               ), true, `connects(new UnaryExpression('!', e)               )`);
    assert.strictEqual(connects(new CallScopeExpression('!', [])          ), true, `connects(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(connects(new CallMemberExpression(e, '', [])       ), false, `connects(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(connects(new CallFunctionExpression(e, [])         ), false, `connects(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(connects(new AccessMemberExpression(e, '')         ), true, `connects(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(connects(new AccessKeyedExpression(e, e)           ), true, `connects(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(connects(new TaggedTemplateExpression([], [], e)   ), true, `connects(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(connects(new BinaryExpression('+', e, e)           ), true, `connects(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(connects(new ConditionalExpression(e, e, e)        ), true, `connects(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(connects(new AssignExpression(e, e)                ), false, `connects(new AssignExpression(e, e)                )`);
    assert.strictEqual(connects(new ValueConverterExpression(e, '', [])   ), true, `connects(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(connects(new BindingBehaviorExpression(e, '', [])  ), true, `connects(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(connects(new HtmlLiteralExpression([])             ), true, `connects(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(connects(new ArrayBindingPattern([])     ), false, `connects(new ArrayBindingPattern([])     )`);
    assert.strictEqual(connects(new ObjectBindingPattern([], [])), false, `connects(new ObjectBindingPattern([], []))`);
    assert.strictEqual(connects(new BindingIdentifier('')       ), false, `connects(new BindingIdentifier('')       )`);
    assert.strictEqual(connects(new ForOfStatement(e, e)        ), true, `connects(new ForOfStatement(e, e)        )`);
    assert.strictEqual(connects(new Interpolation([])           ), false, `connects(new Interpolation([])           )`);
  });

  it('observes', function () {
    assert.strictEqual(observes(new AccessThisExpression()                ), false, `observes(new AccessThisExpression()                )`);
    assert.strictEqual(observes(new AccessScopeExpression('')             ), true, `observes(new AccessScopeExpression('')             )`);
    assert.strictEqual(observes(new ArrayLiteralExpression([])            ), false, `observes(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(observes(new ObjectLiteralExpression([], [])       ), false, `observes(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(observes(new PrimitiveLiteralExpression('')        ), false, `observes(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(observes(new TemplateExpression([])                ), false, `observes(new TemplateExpression([])                )`);
    assert.strictEqual(observes(new UnaryExpression('!', e)               ), false, `observes(new UnaryExpression('!', e)               )`);
    assert.strictEqual(observes(new CallScopeExpression('!', [])          ), false, `observes(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(observes(new CallMemberExpression(e, '', [])       ), false, `observes(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(observes(new CallFunctionExpression(e, [])         ), false, `observes(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(observes(new AccessMemberExpression(e, '')         ), true, `observes(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(observes(new AccessKeyedExpression(e, e)           ), true, `observes(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(observes(new TaggedTemplateExpression([], [], e)   ), false, `observes(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(observes(new BinaryExpression('+', e, e)           ), false, `observes(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(observes(new ConditionalExpression(e, e, e)        ), false, `observes(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(observes(new AssignExpression(e, e)                ), false, `observes(new AssignExpression(e, e)                )`);
    assert.strictEqual(observes(new ValueConverterExpression(e, '', [])   ), false, `observes(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(observes(new BindingBehaviorExpression(e, '', [])  ), false, `observes(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(observes(new HtmlLiteralExpression([])             ), false, `observes(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(observes(new ArrayBindingPattern([])     ), false, `observes(new ArrayBindingPattern([])     )`);
    assert.strictEqual(observes(new ObjectBindingPattern([], [])), false, `observes(new ObjectBindingPattern([], []))`);
    assert.strictEqual(observes(new BindingIdentifier('')       ), false, `observes(new BindingIdentifier('')       )`);
    assert.strictEqual(observes(new ForOfStatement(e, e)        ), false, `observes(new ForOfStatement(e, e)        )`);
    assert.strictEqual(observes(new Interpolation([])           ), false, `observes(new Interpolation([])           )`);
  });

  it('callsFunction', function () {
    assert.strictEqual(callsFunction(new AccessThisExpression()                ), false, `callsFunction(new AccessThisExpression()                )`);
    assert.strictEqual(callsFunction(new AccessScopeExpression('')             ), false, `callsFunction(new AccessScopeExpression('')             )`);
    assert.strictEqual(callsFunction(new ArrayLiteralExpression([])            ), false, `callsFunction(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(callsFunction(new ObjectLiteralExpression([], [])       ), false, `callsFunction(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(callsFunction(new PrimitiveLiteralExpression('')        ), false, `callsFunction(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(callsFunction(new TemplateExpression([])                ), false, `callsFunction(new TemplateExpression([])                )`);
    assert.strictEqual(callsFunction(new UnaryExpression('!', e)               ), false, `callsFunction(new UnaryExpression('!', e)               )`);
    assert.strictEqual(callsFunction(new CallScopeExpression('!', [])          ), true, `callsFunction(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(callsFunction(new CallMemberExpression(e, '', [])       ), true, `callsFunction(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(callsFunction(new CallFunctionExpression(e, [])         ), true, `callsFunction(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(callsFunction(new AccessMemberExpression(e, '')         ), false, `callsFunction(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(callsFunction(new AccessKeyedExpression(e, e)           ), false, `callsFunction(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(callsFunction(new TaggedTemplateExpression([], [], e)   ), true, `callsFunction(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(callsFunction(new BinaryExpression('+', e, e)           ), false, `callsFunction(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(callsFunction(new ConditionalExpression(e, e, e)        ), false, `callsFunction(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(callsFunction(new AssignExpression(e, e)                ), false, `callsFunction(new AssignExpression(e, e)                )`);
    assert.strictEqual(callsFunction(new ValueConverterExpression(e, '', [])   ), false, `callsFunction(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(callsFunction(new BindingBehaviorExpression(e, '', [])  ), false, `callsFunction(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(callsFunction(new HtmlLiteralExpression([])             ), false, `callsFunction(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(callsFunction(new ArrayBindingPattern([])     ), false, `callsFunction(new ArrayBindingPattern([])     )`);
    assert.strictEqual(callsFunction(new ObjectBindingPattern([], [])), false, `callsFunction(new ObjectBindingPattern([], []))`);
    assert.strictEqual(callsFunction(new BindingIdentifier('')       ), false, `callsFunction(new BindingIdentifier('')       )`);
    assert.strictEqual(callsFunction(new ForOfStatement(e, e)        ), false, `callsFunction(new ForOfStatement(e, e)        )`);
    assert.strictEqual(callsFunction(new Interpolation([])           ), false, `callsFunction(new Interpolation([])           )`);
  });

  it('hasAncestor', function () {
    assert.strictEqual(hasAncestor(new AccessThisExpression()                ), true, `hasAncestor(new AccessThisExpression()                )`);
    assert.strictEqual(hasAncestor(new AccessScopeExpression('')             ), true, `hasAncestor(new AccessScopeExpression('')             )`);
    assert.strictEqual(hasAncestor(new ArrayLiteralExpression([])            ), false, `hasAncestor(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(hasAncestor(new ObjectLiteralExpression([], [])       ), false, `hasAncestor(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(hasAncestor(new PrimitiveLiteralExpression('')        ), false, `hasAncestor(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(hasAncestor(new TemplateExpression([])                ), false, `hasAncestor(new TemplateExpression([])                )`);
    assert.strictEqual(hasAncestor(new UnaryExpression('!', e)               ), false, `hasAncestor(new UnaryExpression('!', e)               )`);
    assert.strictEqual(hasAncestor(new CallScopeExpression('!', [])          ), true, `hasAncestor(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(hasAncestor(new CallMemberExpression(e, '', [])       ), false, `hasAncestor(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(hasAncestor(new CallFunctionExpression(e, [])         ), false, `hasAncestor(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(hasAncestor(new AccessMemberExpression(e, '')         ), false, `hasAncestor(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(hasAncestor(new AccessKeyedExpression(e, e)           ), false, `hasAncestor(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(hasAncestor(new TaggedTemplateExpression([], [], e)   ), false, `hasAncestor(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(hasAncestor(new BinaryExpression('+', e, e)           ), false, `hasAncestor(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(hasAncestor(new ConditionalExpression(e, e, e)        ), false, `hasAncestor(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(hasAncestor(new AssignExpression(e, e)                ), false, `hasAncestor(new AssignExpression(e, e)                )`);
    assert.strictEqual(hasAncestor(new ValueConverterExpression(e, '', [])   ), false, `hasAncestor(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(hasAncestor(new BindingBehaviorExpression(e, '', [])  ), false, `hasAncestor(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(hasAncestor(new HtmlLiteralExpression([])             ), false, `hasAncestor(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(hasAncestor(new ArrayBindingPattern([])     ), false, `hasAncestor(new ArrayBindingPattern([])     )`);
    assert.strictEqual(hasAncestor(new ObjectBindingPattern([], [])), false, `hasAncestor(new ObjectBindingPattern([], []))`);
    assert.strictEqual(hasAncestor(new BindingIdentifier('')       ), false, `hasAncestor(new BindingIdentifier('')       )`);
    assert.strictEqual(hasAncestor(new ForOfStatement(e, e)        ), false, `hasAncestor(new ForOfStatement(e, e)        )`);
    assert.strictEqual(hasAncestor(new Interpolation([])           ), false, `hasAncestor(new Interpolation([])           )`);
  });

  it('isAssignable', function () {
    assert.strictEqual(isAssignable(new AccessThisExpression()                ), false, `isAssignable(new AccessThisExpression()                )`);
    assert.strictEqual(isAssignable(new AccessScopeExpression('')             ), true, `isAssignable(new AccessScopeExpression('')             )`);
    assert.strictEqual(isAssignable(new ArrayLiteralExpression([])            ), false, `isAssignable(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(isAssignable(new ObjectLiteralExpression([], [])       ), false, `isAssignable(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(isAssignable(new PrimitiveLiteralExpression('')        ), false, `isAssignable(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(isAssignable(new TemplateExpression([])                ), false, `isAssignable(new TemplateExpression([])                )`);
    assert.strictEqual(isAssignable(new UnaryExpression('!', e)               ), false, `isAssignable(new UnaryExpression('!', e)               )`);
    assert.strictEqual(isAssignable(new CallScopeExpression('!', [])          ), false, `isAssignable(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(isAssignable(new CallMemberExpression(e, '', [])       ), false, `isAssignable(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(isAssignable(new CallFunctionExpression(e, [])         ), false, `isAssignable(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(isAssignable(new AccessMemberExpression(e, '')         ), true, `isAssignable(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(isAssignable(new AccessKeyedExpression(e, e)           ), true, `isAssignable(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(isAssignable(new TaggedTemplateExpression([], [], e)   ), false, `isAssignable(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(isAssignable(new BinaryExpression('+', e, e)           ), false, `isAssignable(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(isAssignable(new ConditionalExpression(e, e, e)        ), false, `isAssignable(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(isAssignable(new AssignExpression(e, e)                ), true, `isAssignable(new AssignExpression(e, e)                )`);
    assert.strictEqual(isAssignable(new ValueConverterExpression(e, '', [])   ), false, `isAssignable(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(isAssignable(new BindingBehaviorExpression(e, '', [])  ), false, `isAssignable(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(isAssignable(new HtmlLiteralExpression([])             ), false, `isAssignable(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(isAssignable(new ArrayBindingPattern([])     ), false, `isAssignable(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isAssignable(new ObjectBindingPattern([], [])), false, `isAssignable(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isAssignable(new BindingIdentifier('')       ), false, `isAssignable(new BindingIdentifier('')       )`);
    assert.strictEqual(isAssignable(new ForOfStatement(e, e)        ), false, `isAssignable(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isAssignable(new Interpolation([])           ), false, `isAssignable(new Interpolation([])           )`);
  });

  it('isLeftHandSide', function () {
    assert.strictEqual(isLeftHandSide(new AccessThisExpression()                ), true, `isLeftHandSide(new AccessThisExpression()                )`);
    assert.strictEqual(isLeftHandSide(new AccessScopeExpression('')             ), true, `isLeftHandSide(new AccessScopeExpression('')             )`);
    assert.strictEqual(isLeftHandSide(new ArrayLiteralExpression([])            ), true, `isLeftHandSide(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(isLeftHandSide(new ObjectLiteralExpression([], [])       ), true, `isLeftHandSide(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(isLeftHandSide(new PrimitiveLiteralExpression('')        ), true, `isLeftHandSide(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(isLeftHandSide(new TemplateExpression([])                ), true, `isLeftHandSide(new TemplateExpression([])                )`);
    assert.strictEqual(isLeftHandSide(new UnaryExpression('!', e)               ), false, `isLeftHandSide(new UnaryExpression('!', e)               )`);
    assert.strictEqual(isLeftHandSide(new CallScopeExpression('!', [])          ), true, `isLeftHandSide(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(isLeftHandSide(new CallMemberExpression(e, '', [])       ), true, `isLeftHandSide(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(isLeftHandSide(new CallFunctionExpression(e, [])         ), true, `isLeftHandSide(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(isLeftHandSide(new AccessMemberExpression(e, '')         ), true, `isLeftHandSide(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(isLeftHandSide(new AccessKeyedExpression(e, e)           ), true, `isLeftHandSide(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(isLeftHandSide(new TaggedTemplateExpression([], [], e)   ), true, `isLeftHandSide(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(isLeftHandSide(new BinaryExpression('+', e, e)           ), false, `isLeftHandSide(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(isLeftHandSide(new ConditionalExpression(e, e, e)        ), false, `isLeftHandSide(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(isLeftHandSide(new AssignExpression(e, e)                ), false, `isLeftHandSide(new AssignExpression(e, e)                )`);
    assert.strictEqual(isLeftHandSide(new ValueConverterExpression(e, '', [])   ), false, `isLeftHandSide(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(isLeftHandSide(new BindingBehaviorExpression(e, '', [])  ), false, `isLeftHandSide(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(isLeftHandSide(new HtmlLiteralExpression([])             ), false, `isLeftHandSide(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(isLeftHandSide(new ArrayBindingPattern([])     ), false, `isLeftHandSide(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isLeftHandSide(new ObjectBindingPattern([], [])), false, `isLeftHandSide(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isLeftHandSide(new BindingIdentifier('')       ), false, `isLeftHandSide(new BindingIdentifier('')       )`);
    assert.strictEqual(isLeftHandSide(new ForOfStatement(e, e)        ), false, `isLeftHandSide(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isLeftHandSide(new Interpolation([])           ), false, `isLeftHandSide(new Interpolation([])           )`);
  });

  it('isPrimary', function () {
    assert.strictEqual(isPrimary(new AccessThisExpression()                ), true, `isPrimary(new AccessThisExpression()                )`);
    assert.strictEqual(isPrimary(new AccessScopeExpression('')             ), true, `isPrimary(new AccessScopeExpression('')             )`);
    assert.strictEqual(isPrimary(new ArrayLiteralExpression([])            ), true, `isPrimary(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(isPrimary(new ObjectLiteralExpression([], [])       ), true, `isPrimary(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(isPrimary(new PrimitiveLiteralExpression('')        ), true, `isPrimary(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(isPrimary(new TemplateExpression([])                ), true, `isPrimary(new TemplateExpression([])                )`);
    assert.strictEqual(isPrimary(new UnaryExpression('!', e)               ), false, `isPrimary(new UnaryExpression('!', e)               )`);
    assert.strictEqual(isPrimary(new CallScopeExpression('!', [])          ), false, `isPrimary(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(isPrimary(new CallMemberExpression(e, '', [])       ), false, `isPrimary(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(isPrimary(new CallFunctionExpression(e, [])         ), false, `isPrimary(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(isPrimary(new AccessMemberExpression(e, '')         ), false, `isPrimary(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(isPrimary(new AccessKeyedExpression(e, e)           ), false, `isPrimary(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(isPrimary(new TaggedTemplateExpression([], [], e)   ), false, `isPrimary(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(isPrimary(new BinaryExpression('+', e, e)           ), false, `isPrimary(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(isPrimary(new ConditionalExpression(e, e, e)        ), false, `isPrimary(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(isPrimary(new AssignExpression(e, e)                ), false, `isPrimary(new AssignExpression(e, e)                )`);
    assert.strictEqual(isPrimary(new ValueConverterExpression(e, '', [])   ), false, `isPrimary(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(isPrimary(new BindingBehaviorExpression(e, '', [])  ), false, `isPrimary(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(isPrimary(new HtmlLiteralExpression([])             ), false, `isPrimary(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(isPrimary(new ArrayBindingPattern([])     ), false, `isPrimary(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isPrimary(new ObjectBindingPattern([], [])), false, `isPrimary(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isPrimary(new BindingIdentifier('')       ), false, `isPrimary(new BindingIdentifier('')       )`);
    assert.strictEqual(isPrimary(new ForOfStatement(e, e)        ), false, `isPrimary(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isPrimary(new Interpolation([])           ), false, `isPrimary(new Interpolation([])           )`);
  });

  it('isResource', function () {
    assert.strictEqual(isResource(new AccessThisExpression()                ), false, `isResource(new AccessThisExpression()                )`);
    assert.strictEqual(isResource(new AccessScopeExpression('')             ), false, `isResource(new AccessScopeExpression('')             )`);
    assert.strictEqual(isResource(new ArrayLiteralExpression([])            ), false, `isResource(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(isResource(new ObjectLiteralExpression([], [])       ), false, `isResource(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(isResource(new PrimitiveLiteralExpression('')        ), false, `isResource(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(isResource(new TemplateExpression([])                ), false, `isResource(new TemplateExpression([])                )`);
    assert.strictEqual(isResource(new UnaryExpression('!', e)               ), false, `isResource(new UnaryExpression('!', e)               )`);
    assert.strictEqual(isResource(new CallScopeExpression('!', [])          ), false, `isResource(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(isResource(new CallMemberExpression(e, '', [])       ), false, `isResource(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(isResource(new CallFunctionExpression(e, [])         ), false, `isResource(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(isResource(new AccessMemberExpression(e, '')         ), false, `isResource(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(isResource(new AccessKeyedExpression(e, e)           ), false, `isResource(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(isResource(new TaggedTemplateExpression([], [], e)   ), false, `isResource(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(isResource(new BinaryExpression('+', e, e)           ), false, `isResource(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(isResource(new ConditionalExpression(e, e, e)        ), false, `isResource(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(isResource(new AssignExpression(e, e)                ), false, `isResource(new AssignExpression(e, e)                )`);
    assert.strictEqual(isResource(new ValueConverterExpression(e, '', [])   ), true, `isResource(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(isResource(new BindingBehaviorExpression(e, '', [])  ), true, `isResource(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(isResource(new HtmlLiteralExpression([])             ), false, `isResource(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(isResource(new ArrayBindingPattern([])     ), false, `isResource(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isResource(new ObjectBindingPattern([], [])), false, `isResource(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isResource(new BindingIdentifier('')       ), false, `isResource(new BindingIdentifier('')       )`);
    assert.strictEqual(isResource(new ForOfStatement(e, e)        ), false, `isResource(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isResource(new Interpolation([])           ), false, `isResource(new Interpolation([])           )`);
  });

  it('hasBind', function () {
    assert.strictEqual(hasBind(new AccessThisExpression()                ), false, `hasBind(new AccessThisExpression()                )`);
    assert.strictEqual(hasBind(new AccessScopeExpression('')             ), false, `hasBind(new AccessScopeExpression('')             )`);
    assert.strictEqual(hasBind(new ArrayLiteralExpression([])            ), false, `hasBind(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(hasBind(new ObjectLiteralExpression([], [])       ), false, `hasBind(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(hasBind(new PrimitiveLiteralExpression('')        ), false, `hasBind(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(hasBind(new TemplateExpression([])                ), false, `hasBind(new TemplateExpression([])                )`);
    assert.strictEqual(hasBind(new UnaryExpression('!', e)               ), false, `hasBind(new UnaryExpression('!', e)               )`);
    assert.strictEqual(hasBind(new CallScopeExpression('!', [])          ), false, `hasBind(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(hasBind(new CallMemberExpression(e, '', [])       ), false, `hasBind(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(hasBind(new CallFunctionExpression(e, [])         ), false, `hasBind(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(hasBind(new AccessMemberExpression(e, '')         ), false, `hasBind(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(hasBind(new AccessKeyedExpression(e, e)           ), false, `hasBind(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(hasBind(new TaggedTemplateExpression([], [], e)   ), false, `hasBind(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(hasBind(new BinaryExpression('+', e, e)           ), false, `hasBind(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(hasBind(new ConditionalExpression(e, e, e)        ), false, `hasBind(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(hasBind(new AssignExpression(e, e)                ), false, `hasBind(new AssignExpression(e, e)                )`);
    assert.strictEqual(hasBind(new ValueConverterExpression(e, '', [])   ), false, `hasBind(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(hasBind(new BindingBehaviorExpression(e, '', [])  ), true, `hasBind(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(hasBind(new HtmlLiteralExpression([])             ), false, `hasBind(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(hasBind(new ArrayBindingPattern([])     ), false, `hasBind(new ArrayBindingPattern([])     )`);
    assert.strictEqual(hasBind(new ObjectBindingPattern([], [])), false, `hasBind(new ObjectBindingPattern([], []))`);
    assert.strictEqual(hasBind(new BindingIdentifier('')       ), false, `hasBind(new BindingIdentifier('')       )`);
    assert.strictEqual(hasBind(new ForOfStatement(e, e)        ), true, `hasBind(new ForOfStatement(e, e)        )`);
    assert.strictEqual(hasBind(new Interpolation([])           ), false, `hasBind(new Interpolation([])           )`);
  });

  it('hasUnbind', function () {
    assert.strictEqual(hasUnbind(new AccessThisExpression()                ), false, `hasUnbind(new AccessThisExpression()                )`);
    assert.strictEqual(hasUnbind(new AccessScopeExpression('')             ), false, `hasUnbind(new AccessScopeExpression('')             )`);
    assert.strictEqual(hasUnbind(new ArrayLiteralExpression([])            ), false, `hasUnbind(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(hasUnbind(new ObjectLiteralExpression([], [])       ), false, `hasUnbind(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(hasUnbind(new PrimitiveLiteralExpression('')        ), false, `hasUnbind(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(hasUnbind(new TemplateExpression([])                ), false, `hasUnbind(new TemplateExpression([])                )`);
    assert.strictEqual(hasUnbind(new UnaryExpression('!', e)               ), false, `hasUnbind(new UnaryExpression('!', e)               )`);
    assert.strictEqual(hasUnbind(new CallScopeExpression('!', [])          ), false, `hasUnbind(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(hasUnbind(new CallMemberExpression(e, '', [])       ), false, `hasUnbind(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(hasUnbind(new CallFunctionExpression(e, [])         ), false, `hasUnbind(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(hasUnbind(new AccessMemberExpression(e, '')         ), false, `hasUnbind(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(hasUnbind(new AccessKeyedExpression(e, e)           ), false, `hasUnbind(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(hasUnbind(new TaggedTemplateExpression([], [], e)   ), false, `hasUnbind(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(hasUnbind(new BinaryExpression('+', e, e)           ), false, `hasUnbind(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(hasUnbind(new ConditionalExpression(e, e, e)        ), false, `hasUnbind(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(hasUnbind(new AssignExpression(e, e)                ), false, `hasUnbind(new AssignExpression(e, e)                )`);
    assert.strictEqual(hasUnbind(new ValueConverterExpression(e, '', [])   ), true, `hasUnbind(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(hasUnbind(new BindingBehaviorExpression(e, '', [])  ), true, `hasUnbind(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(hasUnbind(new HtmlLiteralExpression([])             ), false, `hasUnbind(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(hasUnbind(new ArrayBindingPattern([])     ), false, `hasUnbind(new ArrayBindingPattern([])     )`);
    assert.strictEqual(hasUnbind(new ObjectBindingPattern([], [])), false, `hasUnbind(new ObjectBindingPattern([], []))`);
    assert.strictEqual(hasUnbind(new BindingIdentifier('')       ), false, `hasUnbind(new BindingIdentifier('')       )`);
    assert.strictEqual(hasUnbind(new ForOfStatement(e, e)        ), true, `hasUnbind(new ForOfStatement(e, e)        )`);
    assert.strictEqual(hasUnbind(new Interpolation([])           ), false, `hasUnbind(new Interpolation([])           )`);
  });

  it('isLiteral', function () {
    assert.strictEqual(isLiteral(new AccessThisExpression()                ), false, `isLiteral(new AccessThisExpression()                )`);
    assert.strictEqual(isLiteral(new AccessScopeExpression('')             ), false, `isLiteral(new AccessScopeExpression('')             )`);
    assert.strictEqual(isLiteral(new ArrayLiteralExpression([])            ), true, `isLiteral(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(isLiteral(new ObjectLiteralExpression([], [])       ), true, `isLiteral(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(isLiteral(new PrimitiveLiteralExpression('')        ), true, `isLiteral(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(isLiteral(new TemplateExpression([])                ), true, `isLiteral(new TemplateExpression([])                )`);
    assert.strictEqual(isLiteral(new UnaryExpression('!', e)               ), false, `isLiteral(new UnaryExpression('!', e)               )`);
    assert.strictEqual(isLiteral(new CallScopeExpression('!', [])          ), false, `isLiteral(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(isLiteral(new CallMemberExpression(e, '', [])       ), false, `isLiteral(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(isLiteral(new CallFunctionExpression(e, [])         ), false, `isLiteral(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(isLiteral(new AccessMemberExpression(e, '')         ), false, `isLiteral(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(isLiteral(new AccessKeyedExpression(e, e)           ), false, `isLiteral(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(isLiteral(new TaggedTemplateExpression([], [], e)   ), false, `isLiteral(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(isLiteral(new BinaryExpression('+', e, e)           ), false, `isLiteral(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(isLiteral(new ConditionalExpression(e, e, e)        ), false, `isLiteral(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(isLiteral(new AssignExpression(e, e)                ), false, `isLiteral(new AssignExpression(e, e)                )`);
    assert.strictEqual(isLiteral(new ValueConverterExpression(e, '', [])   ), false, `isLiteral(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(isLiteral(new BindingBehaviorExpression(e, '', [])  ), false, `isLiteral(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(isLiteral(new HtmlLiteralExpression([])             ), false, `isLiteral(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(isLiteral(new ArrayBindingPattern([])     ), false, `isLiteral(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isLiteral(new ObjectBindingPattern([], [])), false, `isLiteral(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isLiteral(new BindingIdentifier('')       ), false, `isLiteral(new BindingIdentifier('')       )`);
    assert.strictEqual(isLiteral(new ForOfStatement(e, e)        ), false, `isLiteral(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isLiteral(new Interpolation([])           ), false, `isLiteral(new Interpolation([])           )`);
  });

  it('isPureLiteral', function () {
    assert.strictEqual(isPureLiteral(new AccessThisExpression()                ), false, `isPureLiteral(new AccessThisExpression()                )`);
    assert.strictEqual(isPureLiteral(new AccessScopeExpression('')             ), false, `isPureLiteral(new AccessScopeExpression('')             )`);
    assert.strictEqual(isPureLiteral(new ArrayLiteralExpression([])            ), true, `isPureLiteral(new ArrayLiteralExpression([])            )`);
    assert.strictEqual(isPureLiteral(new ObjectLiteralExpression([], [])       ), true, `isPureLiteral(new ObjectLiteralExpression([], [])       )`);
    assert.strictEqual(isPureLiteral(new PrimitiveLiteralExpression('')        ), true, `isPureLiteral(new PrimitiveLiteralExpression('')        )`);
    assert.strictEqual(isPureLiteral(new TemplateExpression([])                ), true, `isPureLiteral(new TemplateExpression([])                )`);
    assert.strictEqual(isPureLiteral(new UnaryExpression('!', e)               ), false, `isPureLiteral(new UnaryExpression('!', e)               )`);
    assert.strictEqual(isPureLiteral(new CallScopeExpression('!', [])          ), false, `isPureLiteral(new CallScopeExpression('!', [])          )`);
    assert.strictEqual(isPureLiteral(new CallMemberExpression(e, '', [])       ), false, `isPureLiteral(new CallMemberExpression(e, '', [])       )`);
    assert.strictEqual(isPureLiteral(new CallFunctionExpression(e, [])         ), false, `isPureLiteral(new CallFunctionExpression(e, [])         )`);
    assert.strictEqual(isPureLiteral(new AccessMemberExpression(e, '')         ), false, `isPureLiteral(new AccessMemberExpression(e, '')         )`);
    assert.strictEqual(isPureLiteral(new AccessKeyedExpression(e, e)           ), false, `isPureLiteral(new AccessKeyedExpression(e, e)           )`);
    assert.strictEqual(isPureLiteral(new TaggedTemplateExpression([], [], e)   ), false, `isPureLiteral(new TaggedTemplateExpression([], [], e)   )`);
    assert.strictEqual(isPureLiteral(new BinaryExpression('+', e, e)           ), false, `isPureLiteral(new BinaryExpression('+', e, e)           )`);
    assert.strictEqual(isPureLiteral(new ConditionalExpression(e, e, e)        ), false, `isPureLiteral(new ConditionalExpression(e, e, e)        )`);
    assert.strictEqual(isPureLiteral(new AssignExpression(e, e)                ), false, `isPureLiteral(new AssignExpression(e, e)                )`);
    assert.strictEqual(isPureLiteral(new ValueConverterExpression(e, '', [])   ), false, `isPureLiteral(new ValueConverterExpression(e, '', [])   )`);
    assert.strictEqual(isPureLiteral(new BindingBehaviorExpression(e, '', [])  ), false, `isPureLiteral(new BindingBehaviorExpression(e, '', [])  )`);
    assert.strictEqual(isPureLiteral(new HtmlLiteralExpression([])             ), false, `isPureLiteral(new HtmlLiteralExpression([])             )`);
    assert.strictEqual(isPureLiteral(new ArrayBindingPattern([])     ), false, `isPureLiteral(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isPureLiteral(new ObjectBindingPattern([], [])), false, `isPureLiteral(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isPureLiteral(new BindingIdentifier('')       ), false, `isPureLiteral(new BindingIdentifier('')       )`);
    assert.strictEqual(isPureLiteral(new ForOfStatement(e, e)        ), false, `isPureLiteral(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isPureLiteral(new Interpolation([])           ), false, `isPureLiteral(new Interpolation([])           )`);

    assert.strictEqual(isPureLiteral(new ArrayLiteralExpression([])), true, `isPureLiteral(new ArrayLiteralExpression([]))`);
    assert.strictEqual(isPureLiteral(new ArrayLiteralExpression([new PrimitiveLiteralExpression('')])), true, `isPureLiteral(new ArrayLiteralExpression([new PrimitiveLiteralExpression('')]))`);
    assert.strictEqual(isPureLiteral(new ArrayLiteralExpression([new AccessScopeExpression('a')])), false, `isPureLiteral(new ArrayLiteralExpression([new AccessScopeExpression('a')]))`);

    assert.strictEqual(isPureLiteral(new ObjectLiteralExpression([], [])), true, `isPureLiteral(new ObjectLiteralExpression([], []))`);
    assert.strictEqual(isPureLiteral(new ObjectLiteralExpression(['a'], [new PrimitiveLiteralExpression('1')])), true, `isPureLiteral(new ObjectLiteralExpression(['a'], [new PrimitiveLiteralExpression('1')]))`);
    assert.strictEqual(isPureLiteral(new ObjectLiteralExpression(['a'], [new AccessScopeExpression('a')])), false, `isPureLiteral(new ObjectLiteralExpression(['a'], [new AccessScopeExpression('a')]))`);

    assert.strictEqual(isPureLiteral(new TemplateExpression([])), true, `isPureLiteral(new TemplateExpression([]))`);
    assert.strictEqual(isPureLiteral(new TemplateExpression([''])), true, `isPureLiteral(new TemplateExpression(['']))`);
    assert.strictEqual(isPureLiteral(new TemplateExpression(['', ''], [new PrimitiveLiteralExpression('1')])), true, `isPureLiteral(new TemplateExpression(['', ''], [new PrimitiveLiteralExpression('1')]))`);
    assert.strictEqual(isPureLiteral(new TemplateExpression(['', ''], [new AccessScopeExpression('a')])), false, `isPureLiteral(new TemplateExpression(['', ''], [new AccessScopeExpression('a')]))`);
  });
});
