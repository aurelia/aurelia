import { IServiceLocator, Writable, IIndexable } from '@aurelia/kernel';
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
  AccessKeyed,
  AccessMember,
  AccessScope,
  AccessThis,
  ArrayBindingPattern,
  ArrayLiteral,
  Assign,
  Binary,
  Binding,
  BindingBehavior,
  BindingIdentifier,
  CallFunction,
  CallMember,
  CallScope,
  callsFunction,
  Conditional,
  connects,
  ExpressionKind,
  ForOfStatement,
  hasAncestor,
  hasBind,
  hasUnbind,
  HtmlLiteral,
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
  ObjectLiteral,
  observes,
  OverrideContext,
  PrimitiveLiteral,
  Scope,
  TaggedTemplate,
  Template,
  Unary,
  ValueConverter,
  IOverrideContext
} from '@aurelia/runtime';

const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
const $str = PrimitiveLiteral.$empty;
const $arr = ArrayLiteral.$empty;
const $obj = ObjectLiteral.$empty;
const $tpl = Template.$empty;
const $this = AccessThis.$this;
const $parent = AccessThis.$parent;

function throwsOn<TExpr extends IsBindingBehavior>(expr: TExpr, method: keyof TExpr, msg: string, ...args: any[]): void {
  let err = null;
  try {
    (expr as any)[method](...args);
  } catch (e) {
    err = e;
  }
  assert.notStrictEqual(err, null, 'err');
  if (msg && msg.length) {
    assert.strictEqual(err.message.includes(msg), true, 'err.message.includes(msg)');
  }
}

const $num1 = new PrimitiveLiteral(1);
const $str1 = new PrimitiveLiteral('1');

describe('AST', function () {

  const AccessThisList: [string, AccessThis][] = [
    [`$this`,             $this],
    [`$parent`,           $parent],
    [`$parent.$parent`,   new AccessThis(2)]
  ];
  const AccessScopeList: [string, AccessScope][] = [
    ...AccessThisList.map(([input, expr]) => [`${input}.a`, new AccessScope('a', expr.ancestor)] as [string, any]),
    [`$this.$parent`,     new AccessScope('$parent')],
    [`$parent.$this`,     new AccessScope('$this', 1)],
    [`a`,                 new AccessScope('a')]
  ];
  const StringLiteralList: [string, PrimitiveLiteral][] = [
    [`''`,                PrimitiveLiteral.$empty]
  ];
  const NumberLiteralList: [string, PrimitiveLiteral][] = [
    [`1`,                 new PrimitiveLiteral(1)],
    [`1.1`,               new PrimitiveLiteral(1.1)],
    [`.1`,                new PrimitiveLiteral(0.1)],
    [`0.1`,               new PrimitiveLiteral(0.1)]
  ];
  const KeywordLiteralList: [string, PrimitiveLiteral][] = [
    [`undefined`,         $undefined],
    [`null`,              $null],
    [`true`,              $true],
    [`false`,             $false]
  ];
  const PrimitiveLiteralList: [string, PrimitiveLiteral][] = [
    ...StringLiteralList,
    ...NumberLiteralList,
    ...KeywordLiteralList
  ];

  const ArrayLiteralList: [string, ArrayLiteral][] = [
    [`[]`,                $arr]
  ];
  const ObjectLiteralList: [string, ObjectLiteral][] = [
    [`{}`,                $obj]
  ];
  const TemplateLiteralList: [string, Template][] = [
    [`\`\``,              $tpl]
  ];
  const LiteralList: [string, IsPrimary][] = [
    ...PrimitiveLiteralList,
    ...TemplateLiteralList,
    ...ArrayLiteralList,
    ...ObjectLiteralList
  ];
  const TemplateInterpolationList: [string, Template][] = [
    [`\`\${a}\``,         new Template(['', ''], [new AccessScope('a')])]
  ];
  const PrimaryList: [string, IsPrimary][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...LiteralList
  ];
  // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  const SimpleAccessKeyedList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}[b]`, new AccessKeyed(expr, new AccessScope('b'))] as [string, any])
  ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}.b`, new AccessMember(expr, 'b')] as [string, any])
  ];
  // 4. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}\`\``, new TaggedTemplate([''], [''], expr, [])] as [string, any]),

    ...AccessScopeList
      .map(([input, expr]) => [`${input}\`\${a}\``, new TaggedTemplate(['', ''], ['', ''], expr, [new AccessScope('a')])] as [string, any])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}()`, new CallFunction(expr, [])] as [string, any])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}()`, new CallScope((expr as any).name, [], expr.ancestor)] as [string, any])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, IsLeftHandSide][] = [
    ...AccessScopeList
      .map(([input, expr]) => [`${input}.b()`, new CallMember(expr, 'b', [])] as [string, any])
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
  // used only for testing complex Unary expressions
  const SimpleIsLeftHandSideList: [string, IsLeftHandSide][] = [
    ...PrimaryList,
    ...SimpleLeftHandSideList
  ];

  // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
  const SimpleUnaryList: [string, Unary][] = [
    [`!$1`, new Unary('!', new AccessScope('$1'))],
    [`-$2`, new Unary('-', new AccessScope('$2'))],
    [`+$3`, new Unary('+', new AccessScope('$3'))],
    [`void $4`, new Unary('void', new AccessScope('$4'))],
    [`typeof $5`, new Unary('typeof', new AccessScope('$5'))]
  ];
  // concatenation of Unary + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
  const SimpleIsUnaryList: [string, IsUnary][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, Binary][] = [
    [`$6*$7`, new Binary('*', new AccessScope('$6'), new AccessScope('$7'))],
    [`$8%$9`, new Binary('%', new AccessScope('$8'), new AccessScope('$9'))],
    [`$10/$11`, new Binary('/', new AccessScope('$10'), new AccessScope('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, IsBinary][] = [
    ...SimpleIsUnaryList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, Binary][] = [
    [`$12+$13`, new Binary('+', new AccessScope('$12'), new AccessScope('$13'))],
    [`$14-$15`, new Binary('-', new AccessScope('$14'), new AccessScope('$15'))]
  ];
  const SimpleIsAdditiveList: [string, IsBinary][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, Binary][] = [
    [`$16<$17`, new Binary('<', new AccessScope('$16'), new AccessScope('$17'))],
    [`$18>$19`, new Binary('>', new AccessScope('$18'), new AccessScope('$19'))],
    [`$20<=$21`, new Binary('<=', new AccessScope('$20'), new AccessScope('$21'))],
    [`$22>=$23`, new Binary('>=', new AccessScope('$22'), new AccessScope('$23'))],
    [`$24 in $25`, new Binary('in', new AccessScope('$24'), new AccessScope('$25'))],
    [`$26 instanceof $27`, new Binary('instanceof', new AccessScope('$26'), new AccessScope('$27'))]
  ];
  const SimpleIsRelationalList: [string, IsBinary][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, Binary][] = [
    [`$28==$29`, new Binary('==', new AccessScope('$28'), new AccessScope('$29'))],
    [`$30!=$31`, new Binary('!=', new AccessScope('$30'), new AccessScope('$31'))],
    [`$32===$33`, new Binary('===', new AccessScope('$32'), new AccessScope('$33'))],
    [`$34!==$35`, new Binary('!==', new AccessScope('$34'), new AccessScope('$35'))]
  ];
  const SimpleIsEqualityList: [string, IsBinary][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, Binary][] = [
    [`$36&&$37`, new Binary('&&', new AccessScope('$36'), new AccessScope('$37'))]
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, Binary][] = [
    [`$38||$39`, new Binary('||', new AccessScope('$38'), new AccessScope('$39'))]
  ];

  // This forms the group Precedence.Conditional
  const SimpleConditionalList: [string, Conditional][] = [
    [`a?b:c`, new Conditional(new AccessScope('a'), new AccessScope('b'), new AccessScope('c'))]
  ];

  // This forms the group Precedence.Assign
  const SimpleAssignList: [string, Assign][] = [
    [`a=b`, new Assign(new AccessScope('a'), new AccessScope('b'))]
  ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, ValueConverter][] = [
    [`a|b`, new ValueConverter(new AccessScope('a'), 'b', [])],
    [`a|b:c`, new ValueConverter(new AccessScope('a'), 'b', [new AccessScope('c')])],
    [`a|b:c:d`, new ValueConverter(new AccessScope('a'), 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];

  const SimpleBindingBehaviorList: [string, BindingBehavior][] = [
    [`a&b`, new BindingBehavior(new AccessScope('a'), 'b', [])],
    [`a&b:c`, new BindingBehavior(new AccessScope('a'), 'b', [new AccessScope('c')])],
    [`a&b:c:d`, new BindingBehavior(new AccessScope('a'), 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];

  describe('Literals', function () {
    describe('evaluate() works without any input', function () {
      for (const [text, expr] of [
        ...StringLiteralList,
        ...NumberLiteralList,
        ...KeywordLiteralList
      ]) {
        it(text, function () {
          assert.strictEqual(expr.evaluate(undefined, undefined, undefined), expr.value, `expr.evaluate(undefined, undefined, undefined)`);
        });
      }
      for (const [text, expr] of TemplateLiteralList) {
        it(text, function () {
          assert.strictEqual(expr.evaluate(undefined, undefined, undefined), '', `expr.evaluate(undefined, undefined, undefined)`);
        });
      }
      for (const [text, expr] of ArrayLiteralList) {
        it(text, function () {
          assert.instanceOf(expr.evaluate(undefined, undefined, undefined), Array, 'expr.evaluate(undefined, undefined, undefined)');
        });
      }
      for (const [text, expr] of ObjectLiteralList) {
        it(text, function () {
          assert.instanceOf(expr.evaluate(undefined, undefined, undefined), Object, 'expr.evaluate(undefined, undefined, undefined)');
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
          assert.strictEqual(expr.connect(null, undefined, null), undefined, `expr.connect(null, undefined, null)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null), undefined, `expr.connect(null, null, null)`);
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
          assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
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
          assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });

    describe('connect() does not throw / is a no-op', function () {
      for (const [text, expr] of AccessThisList) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.connect(null, undefined, null), undefined, `expr.connect(null, undefined, null)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null), undefined, `expr.connect(null, null, null)`);
        });
      }
    });
  });

  describe('Scope Accessors', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList,
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'evaluate', 'Code 250', null, null);
        });
      }
    });

    describe('assign() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList
      ]) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'assign', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'assign', 'Code 250', null, null);
        });
      }
    });

    describe('assign() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...AccessScopeList,
        ...SimpleAccessKeyedList,
        ...SimpleAccessMemberList,
        ...TemplateInterpolationList,
        ...SimpleTaggedTemplateList
      ]) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });
  });

  describe('CallExpression', function () {
    describe('evaluate() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
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
        ...SimpleCallFunctionList,
        ...SimpleCallScopeList,
        ...SimpleCallMemberList
      ]) {
          it(`${text}, undefined`, function () {
            assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
          });
          it(`${text}, null`, function () {
            assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
          });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of [
        ...SimpleCallMemberList,
        ...SimpleCallFunctionList
      ]) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });

    describe('connect() does not throw / is a no-op', function () {
      for (const [text, expr] of [
        ...SimpleCallScopeList
      ]) {
        it(`${text}, undefined`, function () {
          assert.strictEqual(expr.connect(null, undefined, null), undefined, `expr.connect(null, undefined, null)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null), undefined, `expr.connect(null, null, null)`);
        });
      }
    });
  });

  describe('Unary', function () {
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
            assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
          });
          it(`${text}, null`, function () {
            assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
          });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleUnaryList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });
  });

  describe('Binary', function () {
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
            assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
          });
          it(`${text}, null`, function () {
            assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
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
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });
  });

  describe('Conditional', function () {
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
            assert.strictEqual(expr.assign(null, undefined, null, undefined), undefined, `expr.assign(null, undefined, null, undefined)`);
          });
          it(`${text}, null`, function () {
            assert.strictEqual(expr.assign(null, null, null, undefined), undefined, `expr.assign(null, null, null, undefined)`);
          });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleConditionalList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });
  });

  describe('Assign', function () {
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
          assert.strictEqual(expr.connect(null, undefined, null), undefined, `expr.connect(null, undefined, null)`);
        });
        it(`${text}, null`, function () {
          assert.strictEqual(expr.connect(null, null, null), undefined, `expr.connect(null, null, null)`);
        });
      }
    });
  });

  describe('ValueConverter', function () {
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
          throwsOn(expr, 'evaluate', 'Code 205', null, null, locator);
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
          throwsOn(expr, 'assign', 'Code 205', null, null, locator);
        });
      }
    });

    describe('connect() throws when scope is nil', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, undefined);
        });
        it(`${text}, null`, function () {
          throwsOn(expr, 'connect', 'Code 250', null, null);
        });
      }
    });

    describe('connect() throws when binding is null', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 206', null, {}, null);
        });
      }
    });

    describe('connect() throws when locator is null', function () {
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 202', null, {}, {});
        });
      }
    });

    describe('connect() throws when returned converter is null', function () {
      const locator = { get() {
        return null;
      } };
      for (const [text, expr] of SimpleValueConverterList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'connect', 'Code 205', null, {}, { locator, observeProperty: () => { return; } });
        });
      }
    });
  });

  describe('BindingBehavior', function () {
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
          throwsOn(expr, 'bind', 'Code 202', null, {}, {});
        });
      }
    });

    describe('bind() throws when returned behavior is null', function () {
      const locator = { get() {
        return null;
      } };
      for (const [text, expr] of SimpleBindingBehaviorList) {
        it(`${text}, undefined`, function () {
          throwsOn(expr, 'bind', 'Code 203', null, {}, { locator, observeProperty: () => { return; } });
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

describe('AccessKeyed', function () {
  let expression: AccessKeyed;

  before(function () {
    expression = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral('bar'));
  });

  it('evaluates member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'baz', `expression.evaluate(LF.none, scope, null)`);
  });

  it('evaluates member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'baz', `expression.evaluate(LF.none, scope, null)`);
  });

  it('assigns member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(LF.none, scope, null, 'bang');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('assigns member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(LF.none, scope, null, 'bang');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);
  });

  it('evaluates null/undefined object', function () {
    let scope = createScopeForTest({ foo: null });
    assert.strictEqual(expression.evaluate(LF.none, scope, null), undefined, `expression.evaluate(LF.none, scope, null)`);
    scope = createScopeForTest({ foo: undefined });
    assert.strictEqual(expression.evaluate(LF.none, scope, null), undefined, `expression.evaluate(LF.none, scope, null)`);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), undefined, `expression.evaluate(LF.none, scope, null)`);
  });

  it('does not observes property in keyed object access when key is number', function () {
    const scope = createScopeForTest({ foo: { '0': 'hello world' } });
    const expression2 = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral(0));
    assert.strictEqual(expression2.evaluate(LF.none, scope, null), 'hello world', `expression2.evaluate(LF.none, scope, null)`);
    const binding = new MockBinding();
    expression2.connect(LF.none, scope, binding);
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'foo'], 'binding.calls[0]');
    assert.deepStrictEqual(binding.calls[1], ['observeProperty', LF.none, scope.bindingContext.foo, 0], 'binding.calls[1]');
    assert.strictEqual(binding.calls.length, 2, 'binding.calls.length');
  });

  it('does not observe property in keyed array access when key is number', function () {
    const scope = createScopeForTest({ foo: ['hello world'] });
    const expression3 = new AccessKeyed(new AccessScope('foo', 0), new PrimitiveLiteral(0));
    assert.strictEqual(expression3.evaluate(LF.none, scope, null), 'hello world', `expression3.evaluate(LF.none, scope, null)`);
    const binding = new MockBinding();
    expression3.connect(LF.none, scope, binding);
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'foo'], 'binding.calls[0]');
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
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
      [`[0]  `, new PrimitiveLiteral(0)],
      [`['a']`, new PrimitiveLiteral('a')]
    ];
    const inputs: [typeof objects, typeof keys] = [objects, keys];

    eachCartesianJoin(inputs, (([t1, obj], [t2, key]) => {
        it(`${t1}${t2}`, function () {
          const scope = createScopeForTest({ foo: obj });
          const sut = new AccessKeyed(new AccessScope('foo', 0), key);
          const binding = new MockBinding();
          sut.connect(LF.none, scope, binding);
          assert.strictEqual(binding.calls.length, 1);
          assert.strictEqual(binding.calls[0][0], 'observeProperty');
        });
      })
    )
  });
});

describe('AccessMember', function () {

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
  const inputs: [typeof objects, typeof props] = [objects, props];

  const expression: AccessMember = new AccessMember(new AccessScope('foo', 0), 'bar');

  eachCartesianJoinFactory.call(this, inputs, (([t1, obj, isFalsey, canHaveProperty], [t2, prop, value]) => {
      it(`${t1}.${t2}.evaluate() -> connect -> assign`, function () {
        const scope = createScopeForTest({ foo: obj });
        const sut = new AccessMember(new AccessScope('foo', 0), prop);
        const actual = sut.evaluate(LF.none, scope, null);
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
        sut.connect(LF.none, scope, binding);
        if (canHaveProperty) {
          assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 2, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
        } else {
          assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
        }

        if (!(obj instanceof Object)) {
          assert.notInstanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
          sut.assign(LF.none, scope, null, 42);
          assert.instanceOf(scope.bindingContext['foo'], Object, `scope.bindingContext['foo']`);
          assert.strictEqual((scope.bindingContext['foo'] as IIndexable)[prop], 42, `(scope.bindingContext['foo'] as IIndexable)[prop]`);
        }
      });
    })
  );

  it('evaluates member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'baz', `expression.evaluate(LF.none, scope, null)`);
  });

  it('evaluates member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'baz', `expression.evaluate(LF.none, scope, null)`);
  });

  it('assigns member on bindingContext', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    expression.assign(LF.none, scope, null, 'bang');
    assert.strictEqual((scope.bindingContext.foo as IIndexable).bar, 'bang', `(scope.bindingContext.foo as IIndexable).bar`);
  });

  it('assigns member on overrideContext', function () {
    const scope = createScopeForTest({});
    scope.overrideContext.foo = { bar: 'baz' };
    expression.assign(LF.none, scope, null, 'bang');
    assert.strictEqual((scope.overrideContext.foo as IIndexable).bar, 'bang', `(scope.overrideContext.foo as IIndexable).bar`);
  });

  it('returns the assigned value', function () {
    const scope = createScopeForTest({ foo: { bar: 'baz' } });
    assert.strictEqual(expression.assign(LF.none, scope, null, 'bang'), 'bang', `expression.assign(LF.none, scope, null, 'bang')`);
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
    const inputs2: [typeof objects2, typeof props2] = [objects2, props2];

    eachCartesianJoin(inputs2, (([t1, obj], [t2, prop]) => {
        it(`${t1}${t2}`, function () {
          const scope = createScopeForTest({ foo: obj });
          const sut = new AccessMember(new AccessScope('foo', 0), prop);
          const binding = new MockBinding();
          sut.connect(LF.none, scope, binding);
          assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
        });
      })
    );
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

    const inputs3: [typeof objects3, typeof props3] = [objects3, props3];

    eachCartesianJoin(inputs3, (([t1, obj], [t2, prop]) => {
        it(`${t1}${t2}`, function () {
          const scope = createScopeForTest({ foo: obj });
          const expression2 = new AccessMember(new AccessScope('foo', 0), prop);
          const binding = new MockBinding();
          expression2.connect(LF.none, scope, binding);
          assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 1, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
        });
      })
    );
  });
});

describe('AccessScope', function () {
  const foo: AccessScope = new AccessScope('foo', 0);
  const $parentfoo: AccessScope = new AccessScope('foo', 1);

  it('evaluates undefined bindingContext', function () {
    const scope = Scope.create(LF.none, undefined, null);
    assert.strictEqual(foo.evaluate(LF.none, scope, null), undefined, `foo.evaluate(LF.none, scope, null)`);
  });

  it('assigns undefined bindingContext', function () {
    const scope = Scope.create(LF.none, undefined, null);
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
  });

  it('connects undefined bindingContext', function () {
    const scope = Scope.create(LF.none, undefined, null);
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it('evaluates null bindingContext', function () {
    const scope = Scope.create(LF.none, null, null);
    assert.strictEqual(foo.evaluate(LF.none, scope, null), undefined, `foo.evaluate(LF.none, scope, null)`);
  });

  it('assigns null bindingContext', function () {
    const scope = Scope.create(LF.none, null, null);
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
  });

  it('connects null bindingContext', function () {
    const scope = Scope.create(LF.none, null, null);
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it('evaluates defined property on bindingContext', function () {
    const scope = createScopeForTest({ foo: 'bar' });
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
  });

  it('evaluates defined property on overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
  });

  it('assigns defined property on bindingContext', function () {
    const scope = createScopeForTest({ foo: 'bar' });
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.bindingContext.foo, 'baz', `scope.bindingContext.foo`);
  });

  it('assigns undefined property to bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.bindingContext.foo, 'baz', `scope.bindingContext.foo`);
  });

  it('assigns defined property on overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.foo, 'baz', `scope.overrideContext.foo`);
  });

  it('connects defined property on bindingContext', function () {
    const scope = createScopeForTest({ foo: 'bar' });
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'foo'], 'binding.calls[0]');
  });

  it('connects defined property on overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    scope.overrideContext.foo = 'bar';
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext, 'foo'], 'binding.calls[0]');
  });

  it('connects undefined property on bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'foo'], 'binding.calls[0]');
  });

  it('evaluates defined property on first ancestor bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual($parentfoo.evaluate(LF.none, scope, null), 'bar', `$parentfoo.evaluate(LF.none, scope, null)`);
  });

  it('evaluates defined property on first ancestor overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual($parentfoo.evaluate(LF.none, scope, null), 'bar', `$parentfoo.evaluate(LF.none, scope, null)`);
  });

  it('assigns defined property on first ancestor bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.parentOverrideContext.bindingContext.foo, 'baz', `scope.overrideContext.parentOverrideContext.bindingContext.foo`);
    $parentfoo.assign(LF.none, scope, null, 'beep');
    assert.strictEqual(scope.overrideContext.parentOverrideContext.bindingContext.foo, 'beep', `scope.overrideContext.parentOverrideContext.bindingContext.foo`);
  });

  it('assigns defined property on first ancestor overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    foo.assign(LF.none, scope, null, 'baz');
    assert.strictEqual(scope.overrideContext.parentOverrideContext.foo, 'baz', `scope.overrideContext.parentOverrideContext.foo`);
    $parentfoo.assign(LF.none, scope, null, 'beep');
    assert.strictEqual(scope.overrideContext.parentOverrideContext.foo, 'beep', `scope.overrideContext.parentOverrideContext.foo`);
  });

  it('connects defined property on first ancestor bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    let binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext.bindingContext, 'foo'], 'binding.calls[0]');
    binding = new MockBinding();
    $parentfoo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext.bindingContext, 'foo'], 'binding.calls[0]');
  });

  it('connects defined property on first ancestor overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = 'bar';
    let binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext, 'foo'], 'binding.calls[0]');
    binding = new MockBinding();
    $parentfoo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext, 'foo'], 'binding.calls[0]');
  });

  it('connects undefined property on first ancestor bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, {});
    (scope.overrideContext.parentOverrideContext as Writable<IOverrideContext>).parentOverrideContext = OverrideContext.create(LF.none, { foo: 'bar' }, null);
    const binding = new MockBinding();
    $parentfoo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext.bindingContext, 'foo'], 'binding.calls[0]');
  });
});

describe('AccessThis', function () {
  const $parent2 = new AccessThis(1);
  const $parent$parent = new AccessThis(2);
  const $parent$parent$parent = new AccessThis(3);

  it('evaluates undefined bindingContext', function () {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(LF.none, undefined, null) };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, undefined, coc(LF.none, undefined, null)) };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, undefined, coc(LF.none, undefined, coc(LF.none, undefined, null))) };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, undefined, coc(LF.none, undefined, coc(LF.none, undefined, coc(LF.none, undefined, null)))) };
    assert.strictEqual($parent2.evaluate(LF.none, scope as any, null), undefined, `$parent2.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);
  });

  it('evaluates null bindingContext', function () {
    const coc = OverrideContext.create;

    let scope = { overrideContext: coc(LF.none, null, null) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), undefined, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, null, coc(LF.none, null, null)) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), null, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, null, coc(LF.none, null, coc(LF.none, null, null))) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), null, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), null, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, null, coc(LF.none, null, coc(LF.none, null, coc(LF.none, null, null)))) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), null, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), null, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), null, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);
  });

  it('evaluates defined bindingContext', function () {
    const coc = OverrideContext.create;
    const a = { a: 'a' };
    const b = { b: 'b' };
    const c = { c: 'c' };
    const d = { d: 'd' };
    let scope = { overrideContext: coc(LF.none, a, null) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), undefined, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, a, coc(LF.none, b, null)) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), b, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, a, coc(LF.none, b, coc(LF.none, c, null))) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), b, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), c, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), undefined, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);

    scope = { overrideContext: coc(LF.none, a, coc(LF.none, b, coc(LF.none, c, coc(LF.none, d, null)))) };
    assert.strictEqual($parent.evaluate(LF.none, scope as any, null), b, `$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent.evaluate(LF.none, scope as any, null), c, `$parent$parent.evaluate(LF.none, scope as any, null)`);
    assert.strictEqual($parent$parent$parent.evaluate(LF.none, scope as any, null), d, `$parent$parent$parent.evaluate(LF.none, scope as any, null)`);
  });
});

describe('Assign', function () {
  it('can chain assignments', function () {
    const foo = new Assign(new AccessScope('foo', 0), new AccessScope('bar', 0));
    const scope = Scope.create(LF.none, undefined, null);
    foo.assign(LF.none, scope, null as any, 1 as any);
    assert.strictEqual(scope.overrideContext.foo, 1, `scope.overrideContext.foo`);
    assert.strictEqual(scope.overrideContext.bar, 1, `scope.overrideContext.bar`);
  });
});

describe('Conditional', function () {
  it('evaluates the "yes" branch', function () {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, yes as any, no as any);

    sut.evaluate(null, null, null);
    assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 0, `no.calls.length`);
  });

  it('evaluates the "no" branch', function () {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, yes as any, no as any);

    sut.evaluate(null, null, null);
    assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 1, `no.calls.length`);
  });

  it('connects the "yes" branch', function () {
    const condition = $true;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, yes as any, no as any);

    sut.connect(null, null, null);
    assert.strictEqual(yes.calls.length, 1, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 0, `no.calls.length`);
  });

  it('connects the "no" branch', function () {
    const condition = $false;
    const yes = new MockTracingExpression($obj);
    const no = new MockTracingExpression($obj);
    const sut = new Conditional(condition, yes as any, no as any);

    sut.connect(null, null, null);
    assert.strictEqual(yes.calls.length, 0, `yes.calls.length`);
    assert.strictEqual(no.calls.length, 1, `no.calls.length`);
  });
});

describe('Binary', function () {
  it('concats strings', function () {
    let expression = new Binary('+', new PrimitiveLiteral('a'), new PrimitiveLiteral('b'));
    let scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'ab', `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', new PrimitiveLiteral('a'), $null);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'anull', `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', $null, new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'nullb', `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', new PrimitiveLiteral('a'), $undefined);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'aundefined', `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', $undefined, new PrimitiveLiteral('b'));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'undefinedb', `expression.evaluate(LF.none, scope, null)`);
  });

  it('adds numbers', function () {
    let expression = new Binary('+', new PrimitiveLiteral(1), new PrimitiveLiteral(2));
    let scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 3, `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', new PrimitiveLiteral(1), $null);
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 1, `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', $null, new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 2, `expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', new PrimitiveLiteral(1), $undefined);
    scope = createScopeForTest({});
    assert.strictEqual(isNaN(expression.evaluate(LF.none, scope, null) as number), true, `isNaN(expression.evaluate(LF.none, scope, null)`);

    expression = new Binary('+', $undefined, new PrimitiveLiteral(2));
    scope = createScopeForTest({});
    assert.strictEqual(isNaN(expression.evaluate(LF.none, scope, null) as number), true, `isNaN(expression.evaluate(LF.none, scope, null)`);
  });

  describe('performs \'in\'', function () {
    const tests: { expr: Binary; expected: boolean }[] = [
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['foo'], [$null])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new ObjectLiteral(['bar'], [$null])), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral(1), new ObjectLiteral(['1'], [$null])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('1'), new ObjectLiteral(['1'], [$null])), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $null), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $undefined), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $true), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $this), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), $this), expected: true },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), $parent), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), $parent), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('foo'), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessScope('bar', 0)), expected: false },
      { expr: new Binary('in', new PrimitiveLiteral('bar'), new AccessScope('foo', 0)), expected: true }
    ];
    const scope = createScopeForTest({ foo: { bar: null }, bar: null });

    for (const { expr, expected } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(LF.none, scope, null), expected, `expr.evaluate(LF.none, scope, null)`);
      });
    }
  });

  describe('performs \'instanceof\'', function () {
    class Foo {}
    class Bar extends Foo {}
    const tests: { expr: Binary; expected: boolean }[] = [
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('foo', 0),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('foo', 0),
          new AccessMember(new AccessScope('bar', 0), 'constructor')
        ),
        expected: false
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('bar', 0),
          new AccessMember(new AccessScope('bar', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new AccessScope('bar', 0),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: true
      },
      {
        expr: new Binary(
          'instanceof',
          new PrimitiveLiteral('foo'),
          new AccessMember(new AccessScope('foo', 0), 'constructor')
        ),
        expected: false
      },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), $null), expected: false },
      { expr: new Binary('instanceof', new AccessScope('foo', 0), $undefined), expected: false },
      { expr: new Binary('instanceof', $null, new AccessScope('foo', 0)), expected: false },
      { expr: new Binary('instanceof', $undefined, new AccessScope('foo', 0)), expected: false }
    ];
    const scope: IScope = createScopeForTest({ foo: new Foo(), bar: new Bar() });

    for (const { expr, expected } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(LF.none, scope, null), expected, `expr.evaluate(LF.none, scope, null)`);
      });
    }
  });
});

describe('CallMember', function () {
  it('evaluates', function () {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
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
    assert.strictEqual(expression.evaluate(LF.none, scope, null), 'baz', `expression.evaluate(LF.none, scope, null)`);
    assert.strictEqual(callCount, 1, 'callCount');
  });

  it('evaluate handles null/undefined member', function () {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({ foo: {} }), null), undefined, `expression.evaluate(LF.none, createScopeForTest({ foo: {} }), null)`);
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({ foo: { bar: undefined } }), null), undefined, `expression.evaluate(LF.none, createScopeForTest({ foo: { bar: undefined } }), null)`);
    assert.strictEqual(expression.evaluate(LF.none, createScopeForTest({ foo: { bar: null } }), null), undefined, `expression.evaluate(LF.none, createScopeForTest({ foo: { bar: null } }), null)`);
  });

  it('evaluate throws when mustEvaluate and member is null or undefined', function () {
    const expression = new CallMember(new AccessScope('foo', 0), 'bar', []);
    const mustEvaluate = true;
    assert.throws(() => expression.evaluate(LF.mustEvaluate, createScopeForTest({}), null));
    assert.throws(() => expression.evaluate(LF.mustEvaluate, createScopeForTest({ foo: {} }), null));
    assert.throws(() => expression.evaluate(LF.mustEvaluate, createScopeForTest({ foo: { bar: undefined } }), null));
    assert.throws(() => expression.evaluate(LF.mustEvaluate, createScopeForTest({ foo: { bar: null } }), null));
  });
});

describe('CallScope', function () {
  const foo: CallScope = new CallScope('foo', [], 0);
  const hello: CallScope = new CallScope('hello', [new AccessScope('arg', 0)], 0);

  it('evaluates undefined bindingContext', function () {
    const scope = Scope.create(LF.none, undefined, null);
    assert.strictEqual(foo.evaluate(LF.none, scope, null), undefined, `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual(hello.evaluate(LF.none, scope, null), undefined, `hello.evaluate(LF.none, scope, null)`);
  });

  it('throws when mustEvaluate and evaluating undefined bindingContext', function () {
    const scope = Scope.create(LF.none, undefined, null);
    const mustEvaluate = true;
    assert.throws(() => foo.evaluate(LF.mustEvaluate, scope, null));
    assert.throws(() => hello.evaluate(LF.mustEvaluate, scope, null));
  });

  it('connects undefined bindingContext', function () {
    const scope = Scope.create(LF.none, undefined, null);
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext, 'arg'], 'binding.calls[0]');
  });

  it('evaluates null bindingContext', function () {
    const scope = Scope.create(LF.none, null, null);
    assert.strictEqual(foo.evaluate(LF.none, scope, null), undefined, `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual(hello.evaluate(LF.none, scope, null), undefined, `hello.evaluate(LF.none, scope, null)`);
  });

  it('throws when mustEvaluate and evaluating null bindingContext', function () {
    const scope = Scope.create(LF.none, null, null);
    const mustEvaluate = true;
    assert.throws(() => foo.evaluate(LF.mustEvaluate, scope, null));
    assert.throws(() => hello.evaluate(LF.mustEvaluate, scope, null));
  });

  it('connects null bindingContext', function () {
    const scope = Scope.create(LF.none, null, null);
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext, 'arg'], 'binding.calls[0]');
  });

  it('evaluates defined property on bindingContext', function () {
    const scope = createScopeForTest({ foo: () => 'bar', hello: arg => arg, arg: 'world' });
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual(hello.evaluate(LF.none, scope, null), 'world', `hello.evaluate(LF.none, scope, null)`);
  });

  it('evaluates defined property on overrideContext', function () {
    const scope = createScopeForTest({ abc: () => 'xyz' });
    scope.overrideContext.foo = () => 'bar';
    scope.overrideContext.hello = arg => arg;
    scope.overrideContext.arg = 'world';
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual(hello.evaluate(LF.none, scope, null), 'world', `hello.evaluate(LF.none, scope, null)`);
  });

  it('connects defined property on bindingContext', function () {
    const scope = createScopeForTest({ foo: 'bar' });
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'arg'], 'binding.calls[0]');
  });

  it('connects defined property on overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    const binding = new MockBinding();
    scope.overrideContext.foo = () => 'bar';
    scope.overrideContext.hello = arg => arg;
    scope.overrideContext.arg = 'world';
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext, 'arg'], 'binding.calls[0]');
  });

  it('connects undefined property on bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' });
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.bindingContext, 'arg'], 'binding.calls[0]');
  });

  it('evaluates defined property on first ancestor bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual(hello.evaluate(LF.none, scope, null), 'world', `hello.evaluate(LF.none, scope, null)`);
  });

  it('evaluates defined property on first ancestor overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    scope.overrideContext.parentOverrideContext.foo = () => 'bar';
    scope.overrideContext.parentOverrideContext.hello = arg => arg;
    scope.overrideContext.parentOverrideContext.arg = 'world';
    assert.strictEqual(foo.evaluate(LF.none, scope, null), 'bar', `foo.evaluate(LF.none, scope, null)`);
    assert.strictEqual(hello.evaluate(LF.none, scope, null), 'world', `hello.evaluate(LF.none, scope, null)`);
  });

  it('connects defined property on first ancestor bindingContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { foo: () => 'bar', hello: arg => arg, arg: 'world' });
    const binding = new MockBinding();
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext.bindingContext, 'arg'], 'binding.calls[0]');
  });

  it('connects defined property on first ancestor overrideContext', function () {
    const scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    const binding = new MockBinding();
    scope.overrideContext.parentOverrideContext.foo = () => 'bar';
    scope.overrideContext.parentOverrideContext.hello = arg => arg;
    scope.overrideContext.parentOverrideContext.arg = 'world';
    foo.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.filter(c => c[0] === 'observeProperty').length, 0, `binding.calls.filter(c => c[0] === 'observeProperty').length`);
    hello.connect(LF.none, scope, binding);
    assert.strictEqual(binding.calls.length, 1, 'binding.calls.length');
    assert.deepStrictEqual(binding.calls[0], ['observeProperty', LF.none, scope.overrideContext.parentOverrideContext, 'arg'], 'binding.calls[0]');
  });
});

class Test {
  public value: string;
  constructor() {
    this.value = 'foo';
  }

  public makeString = (cooked: string[], a: any, b: any): string => {
    return cooked[0] + a + cooked[1] + b + cooked[2] + this.value;
  }
}

describe('LiteralTemplate', function () {
  const tests: { expr: Template | TaggedTemplate; expected: string; ctx: any }[] = [
    { expr: $tpl, expected: '', ctx: {} },
    { expr: new Template(['foo']), expected: 'foo', ctx: {} },
    { expr: new Template(['foo', 'baz'], [new PrimitiveLiteral('bar')]), expected: 'foobarbaz', ctx: {} },
    {
      expr: new Template(
        ['a', 'c', 'e', 'g'],
        [new PrimitiveLiteral('b'), new PrimitiveLiteral('d'), new PrimitiveLiteral('f')]
      ),
      expected: 'abcdefg',
      ctx: {}
    },
    {
      expr: new Template(['a', 'c', 'e'], [new AccessScope('b', 0), new AccessScope('d', 0)]),
      expected: 'a1c2e',
      ctx: { b: 1, d: 2 }
    },
    { expr: new TaggedTemplate(
      [''], [],
      new AccessScope('foo', 0)),
      expected: 'foo',
      ctx: { foo: () => 'foo' } },
    {
      expr: new TaggedTemplate(
        ['foo'], ['bar'],
        new AccessScope('baz', 0)),
      expected: 'foobar',
      ctx: { baz: cooked => cooked[0] + cooked.raw[0] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2'], [],
        new AccessScope('makeString', 0),
        [new PrimitiveLiteral('foo')]),
      expected: '1foo2',
      ctx: { makeString: (cooked, foo) => cooked[0] + foo + cooked[1] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2'], [],
        new AccessScope('makeString', 0),
        [new AccessScope('foo', 0)]),
      expected: '1bar2',
      ctx: { foo: 'bar', makeString: (cooked, foo) => cooked[0] + foo + cooked[1] }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessScope('makeString', 0),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: 'bazqux',
      ctx: { foo: 'baz', bar: 'qux', makeString: (cooked, foo, bar) => foo + bar }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessMember(new AccessScope('test', 0), 'makeString'),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: '1baz2qux3foo',
      ctx: { foo: 'baz', bar: 'qux', test: new Test() }
    },
    {
      expr: new TaggedTemplate(
        ['1', '2', '3'], [],
        new AccessKeyed(new AccessScope('test', 0), new PrimitiveLiteral('makeString')),
        [new AccessScope('foo', 0), new AccessScope('bar', 0)]
      ),
      expected: '1baz2qux3foo',
      ctx: { foo: 'baz', bar: 'qux', test: new Test() }
    }
  ];

  for (const { expr, expected, ctx } of tests) {
    it(`evaluates ${expected}`, function () {
      const scope = createScopeForTest(ctx);
      assert.strictEqual(expr.evaluate(LF.none, scope, null), expected, `expr.evaluate(LF.none, scope, null)`);
    });
  }
});

describe('Unary', function () {
  describe('performs \'typeof\'', function () {
    const tests: { expr: Unary; expected: string }[] = [
      { expr: new Unary('typeof', new PrimitiveLiteral('foo')), expected: 'string' },
      { expr: new Unary('typeof', new PrimitiveLiteral(1)), expected: 'number' },
      { expr: new Unary('typeof', $null), expected: 'object' },
      { expr: new Unary('typeof', $undefined), expected: 'undefined' },
      { expr: new Unary('typeof', $true), expected: 'boolean' },
      { expr: new Unary('typeof', $false), expected: 'boolean' },
      { expr: new Unary('typeof', $arr), expected: 'object' },
      { expr: new Unary('typeof', $obj), expected: 'object' },
      { expr: new Unary('typeof', $this), expected: 'object' },
      { expr: new Unary('typeof', $parent), expected: 'undefined' },
      { expr: new Unary('typeof', new AccessScope('foo', 0)), expected: 'undefined' }
    ];
    const scope: IScope = createScopeForTest({});

    for (const { expr, expected } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(LF.none, scope, null), expected, `expr.evaluate(LF.none, scope, null)`);
      });
    }
  });

  describe('performs \'void\'', function () {
    const tests: { expr: Unary }[] = [
      { expr: new Unary('void', new PrimitiveLiteral('foo')) },
      { expr: new Unary('void', new PrimitiveLiteral(1)) },
      { expr: new Unary('void', $null) },
      { expr: new Unary('void', $undefined) },
      { expr: new Unary('void', $true) },
      { expr: new Unary('void', $false) },
      { expr: new Unary('void', $arr) },
      { expr: new Unary('void', $obj) },
      { expr: new Unary('void', $this) },
      { expr: new Unary('void', $parent) },
      { expr: new Unary('void', new AccessScope('foo', 0)) }
    ];
    let scope: IScope = createScopeForTest({});

    for (const { expr } of tests) {
      it(expr.toString(), function () {
        assert.strictEqual(expr.evaluate(LF.none, scope, null), undefined, `expr.evaluate(LF.none, scope, null)`);
      });
    }

    it('void foo()', function () {
      let fooCalled = false;
      const foo = () => (fooCalled = true);
      scope = createScopeForTest({ foo });
      const expr = new Unary('void', new CallScope('foo', [], 0));
      assert.strictEqual(expr.evaluate(LF.none, scope, null), undefined, `expr.evaluate(LF.none, scope, null)`);
      assert.strictEqual(fooCalled, true, `fooCalled`);
    });
  });
});

describe('BindingBehavior', function () {
  type $1 = [/*title*/string, /*flags*/LF];
  type $2 = [/*title*/string, /*$kind*/ExpressionKind];
  type $3 = [/*title*/string, /*scope*/IScope, /*sut*/BindingBehavior, /*mock*/MockBindingBehavior, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[]];

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

  const inputVariations: (($1: $1, $2: $2) => $3)[] = // [/*title*/string, /*scope*/IScope, /*sut*/BindingBehavior, /*mock*/MockBindingBehavior, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[]],
  [
    // test without arguments
    (_$1, [_t2, $kind]) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      expr.$kind = $kind;
      const args = [];
      const sut = new BindingBehavior(expr as any, 'mock', args);

      const mock = new MockBindingBehavior();
      const locator = new MockServiceLocator(new Map<any, any>([['binding-behavior:mock', mock]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value }, null);
      return [`foo&mock`, scope, sut, mock, locator, binding, value, []];
    },
    // test with 1 argument
    (_$1, [_t2, $kind]) => {
      const value = {};
      const arg1 = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      expr.$kind = $kind;
      const args = [new MockTracingExpression(new AccessScope('a', 0))];
      const sut = new BindingBehavior(expr as any, 'mock', args as any);

      const mock = new MockBindingBehavior();
      const locator = new MockServiceLocator(new Map<any, any>([['binding-behavior:mock', mock]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value, a: arg1 }, null);
      return [`foo&mock:a`, scope, sut, mock, locator, binding, value, [arg1]];
    },
    // test with 3 arguments
    (_$1, [_t2, $kind]) => {
      const value = {};
      const arg1 = {};
      const arg2 = {};
      const arg3 = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      expr.$kind = $kind;
      const args = [
        new MockTracingExpression(new AccessScope('a', 0)),
        new MockTracingExpression(new AccessScope('b', 0)),
        new MockTracingExpression(new AccessScope('c', 0))
      ];
      const sut = new BindingBehavior(expr as any, 'mock', args as any);

      const mock = new MockBindingBehavior();
      const locator = new MockServiceLocator(new Map<any, any>([['binding-behavior:mock', mock]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value, a: arg1, b: arg2, c: arg3 }, null);
      return [`foo&mock:a:b:c`, scope, sut, mock, locator, binding, value, [arg1, arg2, arg3]];
    }
  ];

  const bindVariations: (($1: $1, $2: $2, $3: $3) => /*bind*/() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
      assert.strictEqual(binding['binding-behavior:mock'], undefined, `binding['binding-behavior:mock']`);

      // act
      sut.bind(flags, scope, binding as any);

      // assert
      assert.strictEqual(binding['binding-behavior:mock'], mock, `binding['binding-behavior:mock']`);
      const expr = sut.expression as any as MockTracingExpression;
      const args = sut.args as any as MockTracingExpression[];

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);
      assert.strictEqual(mock.calls[0].length, 4 + args.length, `mock.calls[0].length`);
      assert.strictEqual(mock.calls[0][0], 'bind', `mock.calls[0][0]`);
      assert.strictEqual(mock.calls[0][1], flags, `mock.calls[0][1]`);
      assert.strictEqual(mock.calls[0][2], scope, `mock.calls[0][2]`);
      assert.strictEqual(mock.calls[0][3], binding, `mock.calls[0][3]`);
      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        // verify the ...rest argument values provided to the bind() call
        assert.strictEqual(mock.calls[0][4 + i], argValues[i], `mock.calls[0][4 + i]`);
        // verify the arguments that the bb's argument expressions were called with to obtain the values
        assert.strictEqual(arg.calls.length, 1, `arg.calls.length`);
        assert.strictEqual(arg.calls[0].length, 4, `arg.calls[0].length`);
        assert.strictEqual(arg.calls[0][0], 'evaluate', `arg.calls[0][0]`);
        assert.strictEqual(arg.calls[0][1], flags, `arg.calls[0][1]`);
        assert.strictEqual(arg.calls[0][2], scope, `arg.calls[0][2]`);
        assert.strictEqual(arg.calls[0][3], locator, `arg.calls[0][3]`);
      }

      if ($kind & ExpressionKind.HasBind) {
        assert.strictEqual(expr.calls.length, 1, `expr.calls.length`);
        assert.strictEqual(expr.calls[0].length, 4, `expr.calls[0].length`);
        assert.strictEqual(expr.calls[0][0], 'bind', `expr.calls[0][0]`);
        assert.strictEqual(expr.calls[0][1], flags, `expr.calls[0][1]`);
        assert.strictEqual(expr.calls[0][2], scope, `expr.calls[0][2]`);
        assert.strictEqual(expr.calls[0][3], binding, `expr.calls[0][3]`);
      } else {
        assert.strictEqual(expr.calls.length, 0, `expr.calls.length`);
      }
    }
  ];

  const evaluateVariations: (($1: $1, $2: $2, $3: $3) => /*evaluate*/() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
      // act
      const actual = sut.evaluate(flags, scope, binding.locator);

      // assert
      assert.strictEqual(actual, value, `actual`);

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 2 : 1;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 4, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'evaluate', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], binding.locator, `expr.calls[callCount - 1][3]`);
    }
  ];

  const connectVariations: (($1: $1, $2: $2, $3: $3) => /*connect*/() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
      assert.strictEqual(binding.observerSlots, undefined, `binding.observerSlots`);

      // act
      sut.connect(flags, scope, binding);

      // assert
      assert.strictEqual(binding.observerSlots, 1, `binding.observerSlots`);

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 3 : 2;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 4, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'connect', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], binding, `expr.calls[callCount - 1][3]`);
    }
  ];

  const assignVariations: (($1: $1, $2: $2, $3: $3) => /*assign*/() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
      const newValue = {};

      // act
      const actual = sut.assign(flags, scope, binding.locator, newValue);

      // assert
      assert.strictEqual(actual, newValue, `actual`);
      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 4 : 3;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 5, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'assign', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], binding.locator, `expr.calls[callCount - 1][3]`);
      assert.strictEqual(expr.calls[callCount - 1][4], newValue, `expr.calls[callCount - 1][4]`);

      return newValue;
    }
  ];

  const $2ndEvaluateVariations: (($1: $1, $2: $2, $3: $3) => /*evaluate*/(value: any) => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => (newValue) => {
      // act
      const actual = sut.evaluate(flags, scope, binding.locator);

      // assert
      assert.strictEqual(actual, newValue, `actual`);

      assert.strictEqual(mock.calls.length, 1, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 5 : 4;
      assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
      assert.strictEqual(expr.calls[callCount - 1].length, 4, `expr.calls[callCount - 1].length`);
      assert.strictEqual(expr.calls[callCount - 1][0], 'evaluate', `expr.calls[callCount - 1][0]`);
      assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
      assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
      assert.strictEqual(expr.calls[callCount - 1][3], binding.locator, `expr.calls[callCount - 1][3]`);
    }
  ];

  const unbindVariations: (($1: $1, $2: $2, $3: $3) => /*unbind*/() => void)[] = [
    ([t1, flags], [t2, $kind], [t3, scope, sut, mock, locator, binding, value, argValues]) => () => {
      assert.strictEqual(binding['binding-behavior:mock'], mock, `binding['binding-behavior:mock']`);

      // act
      sut.unbind(flags, scope, binding as any);

      // assert
      assert.strictEqual(binding['binding-behavior:mock'], void 0, `binding['binding-behavior:mock']`);

      assert.strictEqual(mock.calls.length, 2, `mock.calls.length`);
      assert.strictEqual(mock.calls[1].length, 4, `mock.calls[1].length`);
      assert.strictEqual(mock.calls[1][0], 'unbind', `mock.calls[1][0]`);
      assert.strictEqual(mock.calls[1][1], flags, `mock.calls[1][1]`);
      assert.strictEqual(mock.calls[1][2], scope, `mock.calls[1][2]`);
      assert.strictEqual(mock.calls[1][3], binding, `mock.calls[1][3]`);

      const expr = sut.expression as any as MockTracingExpression;

      const callCount = ($kind & ExpressionKind.HasBind) > 0 ? 6 : 5;
      if ($kind & ExpressionKind.HasUnbind) {
        assert.strictEqual(expr.calls.length, callCount, `expr.calls.length`);
        assert.strictEqual(expr.calls[callCount - 1].length, 4, `expr.calls[callCount - 1].length`);
        assert.strictEqual(expr.calls[callCount - 1][0], 'unbind', `expr.calls[callCount - 1][0]`);
        assert.strictEqual(expr.calls[callCount - 1][1], flags, `expr.calls[callCount - 1][1]`);
        assert.strictEqual(expr.calls[callCount - 1][2], scope, `expr.calls[callCount - 1][2]`);
        assert.strictEqual(expr.calls[callCount - 1][3], binding, `expr.calls[callCount - 1][3]`);
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

describe('ValueConverter', function () {
  type $1 = [/*title*/string, /*flags*/LF];
  type $2 = [/*title*/string, /*signals*/string[], /*signaler*/MockSignaler];
  type $3 = [/*title*/string, /*scope*/IScope, /*sut*/ValueConverter, /*mock*/MockValueConverter, /*locator*/IServiceLocator, /*binding*/IConnectableBinding, /*value*/any, /*argValues*/any[], /*methods*/string[]];

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

  const inputVariations: (($1: $1, $2: $2) => $3)[] = [
    // test without arguments, no toView, no fromView
    (_$1, [_t2, signals, signaler]) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      const args = [];
      const sut = new ValueConverter(expr as any, 'mock', args);

      const methods = [];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value }, null);
      return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
    },
    // test without arguments, no fromView
    (_$1, [_t2, signals, signaler]) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      const args = [];
      const sut = new ValueConverter(expr as any, 'mock', args);

      const methods = ['toView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value }, null);
      return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
    },
    // test without arguments, no toView
    (_$1, [_t2, signals, signaler]) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      const args = [];
      const sut = new ValueConverter(expr as any, 'mock', args);

      const methods = ['fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value }, null);
      return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
    },
    // test without arguments
    (_$1, [_t2, signals, signaler]) => {
      const value = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      const args = [];
      const sut = new ValueConverter(expr as any, 'mock', args);

      const methods = ['toView', 'fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value }, null);
      return [`foo|mock`, scope, sut, mock, locator, binding, value, [], methods];
    },
    // test with 1 argument
    (_$1, [_t2, signals, signaler]) => {
      const value = {};
      const arg1 = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      const args = [new MockTracingExpression(new AccessScope('a', 0))];
      const sut = new ValueConverter(expr as any, 'mock', args as any);

      const methods = ['toView', 'fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value, a: arg1 }, null);
      return [`foo|mock:a`, scope, sut, mock, locator, binding, value, [arg1], methods];
    },
    // test with 3 arguments
    (_$1, [_t2, signals, signaler]) => {
      const value = {};
      const arg1 = {};
      const arg2 = {};
      const arg3 = {};
      const expr = new MockTracingExpression(new AccessScope('foo', 0));
      const args = [
        new MockTracingExpression(new AccessScope('a', 0)),
        new MockTracingExpression(new AccessScope('b', 0)),
        new MockTracingExpression(new AccessScope('c', 0))
      ];
      const sut = new ValueConverter(expr as any, 'mock', args as any);

      const methods = ['toView', 'fromView'];
      const mock = new MockValueConverter(methods);
      mock['signals'] = signals;
      const locator = new MockServiceLocator(new Map<any, any>([['value-converter:mock', mock], [ISignaler, signaler]]));
      const observerLocator = createObserverLocator();
      const binding = new Binding(expr as any, null, null, null, observerLocator, locator);

      const scope = Scope.create(LF.none, { foo: value, a: arg1, b: arg2, c: arg3 }, null);
      return [`foo|mock:a:b:c`, scope, sut, mock, locator, binding, value, [arg1, arg2, arg3], methods];
    }
  ];

  const evaluateVariations: (($1: $1, $2: $2, $3: $3) => /*evaluate*/() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
      // act
      const actual = sut.evaluate(flags, scope, binding.locator);

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
      assert.strictEqual(expr.calls[0].length, 4, `expr.calls[0].length`);
      assert.strictEqual(expr.calls[0][0], 'evaluate', `expr.calls[0][0]`);
      assert.strictEqual(expr.calls[0][1], flags, `expr.calls[0][1]`);
      assert.strictEqual(expr.calls[0][2], scope, `expr.calls[0][2]`);
      assert.strictEqual(expr.calls[0][3], binding.locator, `expr.calls[0][3]`);

      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        if (methods.includes('toView')) {
          assert.strictEqual(arg.calls.length, 1, `arg.calls.length`);
          assert.strictEqual(arg.calls[0].length, 4, `arg.calls[0].length`);
          assert.strictEqual(arg.calls[0][0], 'evaluate', `arg.calls[0][0]`);
          assert.strictEqual(arg.calls[0][1], flags, `arg.calls[0][1]`);
          assert.strictEqual(arg.calls[0][2], scope, `arg.calls[0][2]`);
          assert.strictEqual(arg.calls[0][3], binding.locator, `arg.calls[0][3]`);
        } else {
          assert.strictEqual(arg.calls.length, 0, `arg.calls.length`);
        }
      }
    }
  ];

  const connectVariations: (($1: $1, $2: $2, $3: $3) => /*connect*/() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
      assert.strictEqual(binding.observerSlots, undefined, `binding.observerSlots`);

      // act
      sut.connect(flags, scope, binding);

      // assert
      assert.strictEqual(binding.observerSlots, 1 + argValues.length, `binding.observerSlots`);

      const hasToView = methods.includes('toView');
      assert.strictEqual(mock.calls.length, hasToView ? 1 : 0, `mock.calls.length`);

      const expr = sut.expression as any as MockTracingExpression;

      assert.strictEqual(expr.calls.length, 2, `expr.calls.length`);
      assert.strictEqual(expr.calls[1].length, 4, `expr.calls[1].length`);
      assert.strictEqual(expr.calls[1][0], 'connect', `expr.calls[1][0]`);
      assert.strictEqual(expr.calls[1][1], flags, `expr.calls[1][1]`);
      assert.strictEqual(expr.calls[1][2], scope, `expr.calls[1][2]`);
      assert.strictEqual(expr.calls[1][3], binding, `expr.calls[1][3]`);

      const args = sut.args as any as MockTracingExpression[];
      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        const offset = hasToView ? 1 : 0;
        assert.strictEqual(arg.calls.length, offset + 1, `arg.calls.length`);
        assert.strictEqual(arg.calls[offset].length, 4, `arg.calls[offset].length`);
        assert.strictEqual(arg.calls[offset][0], 'connect', `arg.calls[offset][0]`);
        assert.strictEqual(arg.calls[offset][1], flags, `arg.calls[offset][1]`);
        assert.strictEqual(arg.calls[offset][2], scope, `arg.calls[offset][2]`);
        assert.strictEqual(arg.calls[offset][3], binding, `arg.calls[offset][3]`);
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

  const assignVariations: (($1: $1, $2: $2, $3: $3) => /*assign*/() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
      const newValue = {};

      // act
      const actual = sut.assign(flags, scope, binding.locator, newValue);

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
      assert.strictEqual(expr.calls[2].length, 5, `expr.calls[2].length`);
      assert.strictEqual(expr.calls[2][0], 'assign', `expr.calls[2][0]`);
      assert.strictEqual(expr.calls[2][1], flags, `expr.calls[2][1]`);
      assert.strictEqual(expr.calls[2][2], scope, `expr.calls[2][2]`);
      assert.strictEqual(expr.calls[2][3], binding.locator, `expr.calls[2][3]`);
      assert.strictEqual(expr.calls[2][4], newValue, `expr.calls[2][4]`);

      for (let i = 0, ii = args.length; i < ii; ++i) {
        const arg = args[i];
        const callCount = hasToView ? hasFromView ? 3 : 2 : 1;
        assert.strictEqual(arg.calls.length, callCount, `arg.calls.length`);
        assert.strictEqual(arg.calls[callCount - 1].length, 4, `arg.calls[callCount - 1].length`);
        assert.strictEqual(arg.calls[callCount - 1][0], 'evaluate', `arg.calls[callCount - 1][0]`);
        assert.strictEqual(arg.calls[callCount - 1][1], flags, `arg.calls[callCount - 1][1]`);
        assert.strictEqual(arg.calls[callCount - 1][2], scope, `arg.calls[callCount - 1][2]`);
        assert.strictEqual(arg.calls[callCount - 1][3], binding.locator, `arg.calls[callCount - 1][3]`);
      }

      return newValue;
    }
  ];

  const $2ndEvaluateVariations: (($1: $1, $2: $2, $3: $3) => /*evaluate*/(value: any) => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => (newValue) => {
      // act
      const actual = sut.evaluate(flags, scope, binding.locator);

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
          assert.strictEqual(arg.calls[callCount - 1].length, 4, `arg.calls[callCount - 1].length`);
          assert.strictEqual(arg.calls[callCount - 1][0], 'evaluate', `arg.calls[callCount - 1][0]`);
          assert.strictEqual(arg.calls[callCount - 1][1], flags, `arg.calls[callCount - 1][1]`);
          assert.strictEqual(arg.calls[callCount - 1][2], scope, `arg.calls[callCount - 1][2]`);
          assert.strictEqual(arg.calls[callCount - 1][3], binding.locator, `arg.calls[callCount - 1][3]`);
        }
      }

      assert.strictEqual(expr.calls.length, 4, `expr.calls.length`);
      assert.strictEqual(expr.calls[3].length, 4, `expr.calls[3].length`);
      assert.strictEqual(expr.calls[3][0], 'evaluate', `expr.calls[3][0]`);
      assert.strictEqual(expr.calls[3][1], flags, `expr.calls[3][1]`);
      assert.strictEqual(expr.calls[3][2], scope, `expr.calls[3][2]`);
      assert.strictEqual(expr.calls[3][3], binding.locator, `expr.calls[3][3]`);
    }
  ];

  const unbindVariations: (($1: $1, $2: $2, $3: $3) => /*unbind*/() => void)[] = [
    ([t1, flags], [t2, signals, signaler], [t3, scope, sut, mock, locator, binding, value, argValues, methods]) => () => {
      // act
      sut.unbind(flags, scope, binding);

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

const e = new PrimitiveLiteral('') as any;
// tslint:disable:space-within-parens
describe('helper functions', function () {
  it('connects', function () {
    assert.strictEqual(connects(new AccessThis()                ), false, `connects(new AccessThis()                )`);
    assert.strictEqual(connects(new AccessScope('')             ), true, `connects(new AccessScope('')             )`);
    assert.strictEqual(connects(new ArrayLiteral([])            ), true, `connects(new ArrayLiteral([])            )`);
    assert.strictEqual(connects(new ObjectLiteral([], [])       ), true, `connects(new ObjectLiteral([], [])       )`);
    assert.strictEqual(connects(new PrimitiveLiteral('')        ), false, `connects(new PrimitiveLiteral('')        )`);
    assert.strictEqual(connects(new Template([])                ), true, `connects(new Template([])                )`);
    assert.strictEqual(connects(new Unary('!', e)               ), true, `connects(new Unary('!', e)               )`);
    assert.strictEqual(connects(new CallScope('!', [])          ), true, `connects(new CallScope('!', [])          )`);
    assert.strictEqual(connects(new CallMember(e, '', [])       ), false, `connects(new CallMember(e, '', [])       )`);
    assert.strictEqual(connects(new CallFunction(e, [])         ), false, `connects(new CallFunction(e, [])         )`);
    assert.strictEqual(connects(new AccessMember(e, '')         ), true, `connects(new AccessMember(e, '')         )`);
    assert.strictEqual(connects(new AccessKeyed(e, e)           ), true, `connects(new AccessKeyed(e, e)           )`);
    assert.strictEqual(connects(new TaggedTemplate([], [], e)   ), true, `connects(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(connects(new Binary('+', e, e)           ), true, `connects(new Binary('+', e, e)           )`);
    assert.strictEqual(connects(new Conditional(e, e, e)        ), true, `connects(new Conditional(e, e, e)        )`);
    assert.strictEqual(connects(new Assign(e, e)                ), false, `connects(new Assign(e, e)                )`);
    assert.strictEqual(connects(new ValueConverter(e, '', [])   ), true, `connects(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(connects(new BindingBehavior(e, '', [])  ), true, `connects(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(connects(new HtmlLiteral([])             ), true, `connects(new HtmlLiteral([])             )`);
    assert.strictEqual(connects(new ArrayBindingPattern([])     ), false, `connects(new ArrayBindingPattern([])     )`);
    assert.strictEqual(connects(new ObjectBindingPattern([], [])), false, `connects(new ObjectBindingPattern([], []))`);
    assert.strictEqual(connects(new BindingIdentifier('')       ), false, `connects(new BindingIdentifier('')       )`);
    assert.strictEqual(connects(new ForOfStatement(e, e)        ), true, `connects(new ForOfStatement(e, e)        )`);
    assert.strictEqual(connects(new Interpolation([])           ), false, `connects(new Interpolation([])           )`);
  });

  it('observes', function () {
    assert.strictEqual(observes(new AccessThis()                ), false, `observes(new AccessThis()                )`);
    assert.strictEqual(observes(new AccessScope('')             ), true, `observes(new AccessScope('')             )`);
    assert.strictEqual(observes(new ArrayLiteral([])            ), false, `observes(new ArrayLiteral([])            )`);
    assert.strictEqual(observes(new ObjectLiteral([], [])       ), false, `observes(new ObjectLiteral([], [])       )`);
    assert.strictEqual(observes(new PrimitiveLiteral('')        ), false, `observes(new PrimitiveLiteral('')        )`);
    assert.strictEqual(observes(new Template([])                ), false, `observes(new Template([])                )`);
    assert.strictEqual(observes(new Unary('!', e)               ), false, `observes(new Unary('!', e)               )`);
    assert.strictEqual(observes(new CallScope('!', [])          ), false, `observes(new CallScope('!', [])          )`);
    assert.strictEqual(observes(new CallMember(e, '', [])       ), false, `observes(new CallMember(e, '', [])       )`);
    assert.strictEqual(observes(new CallFunction(e, [])         ), false, `observes(new CallFunction(e, [])         )`);
    assert.strictEqual(observes(new AccessMember(e, '')         ), true, `observes(new AccessMember(e, '')         )`);
    assert.strictEqual(observes(new AccessKeyed(e, e)           ), true, `observes(new AccessKeyed(e, e)           )`);
    assert.strictEqual(observes(new TaggedTemplate([], [], e)   ), false, `observes(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(observes(new Binary('+', e, e)           ), false, `observes(new Binary('+', e, e)           )`);
    assert.strictEqual(observes(new Conditional(e, e, e)        ), false, `observes(new Conditional(e, e, e)        )`);
    assert.strictEqual(observes(new Assign(e, e)                ), false, `observes(new Assign(e, e)                )`);
    assert.strictEqual(observes(new ValueConverter(e, '', [])   ), false, `observes(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(observes(new BindingBehavior(e, '', [])  ), false, `observes(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(observes(new HtmlLiteral([])             ), false, `observes(new HtmlLiteral([])             )`);
    assert.strictEqual(observes(new ArrayBindingPattern([])     ), false, `observes(new ArrayBindingPattern([])     )`);
    assert.strictEqual(observes(new ObjectBindingPattern([], [])), false, `observes(new ObjectBindingPattern([], []))`);
    assert.strictEqual(observes(new BindingIdentifier('')       ), false, `observes(new BindingIdentifier('')       )`);
    assert.strictEqual(observes(new ForOfStatement(e, e)        ), false, `observes(new ForOfStatement(e, e)        )`);
    assert.strictEqual(observes(new Interpolation([])           ), false, `observes(new Interpolation([])           )`);
  });

  it('callsFunction', function () {
    assert.strictEqual(callsFunction(new AccessThis()                ), false, `callsFunction(new AccessThis()                )`);
    assert.strictEqual(callsFunction(new AccessScope('')             ), false, `callsFunction(new AccessScope('')             )`);
    assert.strictEqual(callsFunction(new ArrayLiteral([])            ), false, `callsFunction(new ArrayLiteral([])            )`);
    assert.strictEqual(callsFunction(new ObjectLiteral([], [])       ), false, `callsFunction(new ObjectLiteral([], [])       )`);
    assert.strictEqual(callsFunction(new PrimitiveLiteral('')        ), false, `callsFunction(new PrimitiveLiteral('')        )`);
    assert.strictEqual(callsFunction(new Template([])                ), false, `callsFunction(new Template([])                )`);
    assert.strictEqual(callsFunction(new Unary('!', e)               ), false, `callsFunction(new Unary('!', e)               )`);
    assert.strictEqual(callsFunction(new CallScope('!', [])          ), true, `callsFunction(new CallScope('!', [])          )`);
    assert.strictEqual(callsFunction(new CallMember(e, '', [])       ), true, `callsFunction(new CallMember(e, '', [])       )`);
    assert.strictEqual(callsFunction(new CallFunction(e, [])         ), true, `callsFunction(new CallFunction(e, [])         )`);
    assert.strictEqual(callsFunction(new AccessMember(e, '')         ), false, `callsFunction(new AccessMember(e, '')         )`);
    assert.strictEqual(callsFunction(new AccessKeyed(e, e)           ), false, `callsFunction(new AccessKeyed(e, e)           )`);
    assert.strictEqual(callsFunction(new TaggedTemplate([], [], e)   ), true, `callsFunction(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(callsFunction(new Binary('+', e, e)           ), false, `callsFunction(new Binary('+', e, e)           )`);
    assert.strictEqual(callsFunction(new Conditional(e, e, e)        ), false, `callsFunction(new Conditional(e, e, e)        )`);
    assert.strictEqual(callsFunction(new Assign(e, e)                ), false, `callsFunction(new Assign(e, e)                )`);
    assert.strictEqual(callsFunction(new ValueConverter(e, '', [])   ), false, `callsFunction(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(callsFunction(new BindingBehavior(e, '', [])  ), false, `callsFunction(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(callsFunction(new HtmlLiteral([])             ), false, `callsFunction(new HtmlLiteral([])             )`);
    assert.strictEqual(callsFunction(new ArrayBindingPattern([])     ), false, `callsFunction(new ArrayBindingPattern([])     )`);
    assert.strictEqual(callsFunction(new ObjectBindingPattern([], [])), false, `callsFunction(new ObjectBindingPattern([], []))`);
    assert.strictEqual(callsFunction(new BindingIdentifier('')       ), false, `callsFunction(new BindingIdentifier('')       )`);
    assert.strictEqual(callsFunction(new ForOfStatement(e, e)        ), false, `callsFunction(new ForOfStatement(e, e)        )`);
    assert.strictEqual(callsFunction(new Interpolation([])           ), false, `callsFunction(new Interpolation([])           )`);
  });

  it('hasAncestor', function () {
    assert.strictEqual(hasAncestor(new AccessThis()                ), true, `hasAncestor(new AccessThis()                )`);
    assert.strictEqual(hasAncestor(new AccessScope('')             ), true, `hasAncestor(new AccessScope('')             )`);
    assert.strictEqual(hasAncestor(new ArrayLiteral([])            ), false, `hasAncestor(new ArrayLiteral([])            )`);
    assert.strictEqual(hasAncestor(new ObjectLiteral([], [])       ), false, `hasAncestor(new ObjectLiteral([], [])       )`);
    assert.strictEqual(hasAncestor(new PrimitiveLiteral('')        ), false, `hasAncestor(new PrimitiveLiteral('')        )`);
    assert.strictEqual(hasAncestor(new Template([])                ), false, `hasAncestor(new Template([])                )`);
    assert.strictEqual(hasAncestor(new Unary('!', e)               ), false, `hasAncestor(new Unary('!', e)               )`);
    assert.strictEqual(hasAncestor(new CallScope('!', [])          ), true, `hasAncestor(new CallScope('!', [])          )`);
    assert.strictEqual(hasAncestor(new CallMember(e, '', [])       ), false, `hasAncestor(new CallMember(e, '', [])       )`);
    assert.strictEqual(hasAncestor(new CallFunction(e, [])         ), false, `hasAncestor(new CallFunction(e, [])         )`);
    assert.strictEqual(hasAncestor(new AccessMember(e, '')         ), false, `hasAncestor(new AccessMember(e, '')         )`);
    assert.strictEqual(hasAncestor(new AccessKeyed(e, e)           ), false, `hasAncestor(new AccessKeyed(e, e)           )`);
    assert.strictEqual(hasAncestor(new TaggedTemplate([], [], e)   ), false, `hasAncestor(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(hasAncestor(new Binary('+', e, e)           ), false, `hasAncestor(new Binary('+', e, e)           )`);
    assert.strictEqual(hasAncestor(new Conditional(e, e, e)        ), false, `hasAncestor(new Conditional(e, e, e)        )`);
    assert.strictEqual(hasAncestor(new Assign(e, e)                ), false, `hasAncestor(new Assign(e, e)                )`);
    assert.strictEqual(hasAncestor(new ValueConverter(e, '', [])   ), false, `hasAncestor(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(hasAncestor(new BindingBehavior(e, '', [])  ), false, `hasAncestor(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(hasAncestor(new HtmlLiteral([])             ), false, `hasAncestor(new HtmlLiteral([])             )`);
    assert.strictEqual(hasAncestor(new ArrayBindingPattern([])     ), false, `hasAncestor(new ArrayBindingPattern([])     )`);
    assert.strictEqual(hasAncestor(new ObjectBindingPattern([], [])), false, `hasAncestor(new ObjectBindingPattern([], []))`);
    assert.strictEqual(hasAncestor(new BindingIdentifier('')       ), false, `hasAncestor(new BindingIdentifier('')       )`);
    assert.strictEqual(hasAncestor(new ForOfStatement(e, e)        ), false, `hasAncestor(new ForOfStatement(e, e)        )`);
    assert.strictEqual(hasAncestor(new Interpolation([])           ), false, `hasAncestor(new Interpolation([])           )`);
  });

  it('isAssignable', function () {
    assert.strictEqual(isAssignable(new AccessThis()                ), false, `isAssignable(new AccessThis()                )`);
    assert.strictEqual(isAssignable(new AccessScope('')             ), true, `isAssignable(new AccessScope('')             )`);
    assert.strictEqual(isAssignable(new ArrayLiteral([])            ), false, `isAssignable(new ArrayLiteral([])            )`);
    assert.strictEqual(isAssignable(new ObjectLiteral([], [])       ), false, `isAssignable(new ObjectLiteral([], [])       )`);
    assert.strictEqual(isAssignable(new PrimitiveLiteral('')        ), false, `isAssignable(new PrimitiveLiteral('')        )`);
    assert.strictEqual(isAssignable(new Template([])                ), false, `isAssignable(new Template([])                )`);
    assert.strictEqual(isAssignable(new Unary('!', e)               ), false, `isAssignable(new Unary('!', e)               )`);
    assert.strictEqual(isAssignable(new CallScope('!', [])          ), false, `isAssignable(new CallScope('!', [])          )`);
    assert.strictEqual(isAssignable(new CallMember(e, '', [])       ), false, `isAssignable(new CallMember(e, '', [])       )`);
    assert.strictEqual(isAssignable(new CallFunction(e, [])         ), false, `isAssignable(new CallFunction(e, [])         )`);
    assert.strictEqual(isAssignable(new AccessMember(e, '')         ), true, `isAssignable(new AccessMember(e, '')         )`);
    assert.strictEqual(isAssignable(new AccessKeyed(e, e)           ), true, `isAssignable(new AccessKeyed(e, e)           )`);
    assert.strictEqual(isAssignable(new TaggedTemplate([], [], e)   ), false, `isAssignable(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(isAssignable(new Binary('+', e, e)           ), false, `isAssignable(new Binary('+', e, e)           )`);
    assert.strictEqual(isAssignable(new Conditional(e, e, e)        ), false, `isAssignable(new Conditional(e, e, e)        )`);
    assert.strictEqual(isAssignable(new Assign(e, e)                ), true, `isAssignable(new Assign(e, e)                )`);
    assert.strictEqual(isAssignable(new ValueConverter(e, '', [])   ), false, `isAssignable(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(isAssignable(new BindingBehavior(e, '', [])  ), false, `isAssignable(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(isAssignable(new HtmlLiteral([])             ), false, `isAssignable(new HtmlLiteral([])             )`);
    assert.strictEqual(isAssignable(new ArrayBindingPattern([])     ), false, `isAssignable(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isAssignable(new ObjectBindingPattern([], [])), false, `isAssignable(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isAssignable(new BindingIdentifier('')       ), false, `isAssignable(new BindingIdentifier('')       )`);
    assert.strictEqual(isAssignable(new ForOfStatement(e, e)        ), false, `isAssignable(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isAssignable(new Interpolation([])           ), false, `isAssignable(new Interpolation([])           )`);
  });

  it('isLeftHandSide', function () {
    assert.strictEqual(isLeftHandSide(new AccessThis()                ), true, `isLeftHandSide(new AccessThis()                )`);
    assert.strictEqual(isLeftHandSide(new AccessScope('')             ), true, `isLeftHandSide(new AccessScope('')             )`);
    assert.strictEqual(isLeftHandSide(new ArrayLiteral([])            ), true, `isLeftHandSide(new ArrayLiteral([])            )`);
    assert.strictEqual(isLeftHandSide(new ObjectLiteral([], [])       ), true, `isLeftHandSide(new ObjectLiteral([], [])       )`);
    assert.strictEqual(isLeftHandSide(new PrimitiveLiteral('')        ), true, `isLeftHandSide(new PrimitiveLiteral('')        )`);
    assert.strictEqual(isLeftHandSide(new Template([])                ), true, `isLeftHandSide(new Template([])                )`);
    assert.strictEqual(isLeftHandSide(new Unary('!', e)               ), false, `isLeftHandSide(new Unary('!', e)               )`);
    assert.strictEqual(isLeftHandSide(new CallScope('!', [])          ), true, `isLeftHandSide(new CallScope('!', [])          )`);
    assert.strictEqual(isLeftHandSide(new CallMember(e, '', [])       ), true, `isLeftHandSide(new CallMember(e, '', [])       )`);
    assert.strictEqual(isLeftHandSide(new CallFunction(e, [])         ), true, `isLeftHandSide(new CallFunction(e, [])         )`);
    assert.strictEqual(isLeftHandSide(new AccessMember(e, '')         ), true, `isLeftHandSide(new AccessMember(e, '')         )`);
    assert.strictEqual(isLeftHandSide(new AccessKeyed(e, e)           ), true, `isLeftHandSide(new AccessKeyed(e, e)           )`);
    assert.strictEqual(isLeftHandSide(new TaggedTemplate([], [], e)   ), true, `isLeftHandSide(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(isLeftHandSide(new Binary('+', e, e)           ), false, `isLeftHandSide(new Binary('+', e, e)           )`);
    assert.strictEqual(isLeftHandSide(new Conditional(e, e, e)        ), false, `isLeftHandSide(new Conditional(e, e, e)        )`);
    assert.strictEqual(isLeftHandSide(new Assign(e, e)                ), false, `isLeftHandSide(new Assign(e, e)                )`);
    assert.strictEqual(isLeftHandSide(new ValueConverter(e, '', [])   ), false, `isLeftHandSide(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(isLeftHandSide(new BindingBehavior(e, '', [])  ), false, `isLeftHandSide(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(isLeftHandSide(new HtmlLiteral([])             ), false, `isLeftHandSide(new HtmlLiteral([])             )`);
    assert.strictEqual(isLeftHandSide(new ArrayBindingPattern([])     ), false, `isLeftHandSide(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isLeftHandSide(new ObjectBindingPattern([], [])), false, `isLeftHandSide(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isLeftHandSide(new BindingIdentifier('')       ), false, `isLeftHandSide(new BindingIdentifier('')       )`);
    assert.strictEqual(isLeftHandSide(new ForOfStatement(e, e)        ), false, `isLeftHandSide(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isLeftHandSide(new Interpolation([])           ), false, `isLeftHandSide(new Interpolation([])           )`);
  });

  it('isPrimary', function () {
    assert.strictEqual(isPrimary(new AccessThis()                ), true, `isPrimary(new AccessThis()                )`);
    assert.strictEqual(isPrimary(new AccessScope('')             ), true, `isPrimary(new AccessScope('')             )`);
    assert.strictEqual(isPrimary(new ArrayLiteral([])            ), true, `isPrimary(new ArrayLiteral([])            )`);
    assert.strictEqual(isPrimary(new ObjectLiteral([], [])       ), true, `isPrimary(new ObjectLiteral([], [])       )`);
    assert.strictEqual(isPrimary(new PrimitiveLiteral('')        ), true, `isPrimary(new PrimitiveLiteral('')        )`);
    assert.strictEqual(isPrimary(new Template([])                ), true, `isPrimary(new Template([])                )`);
    assert.strictEqual(isPrimary(new Unary('!', e)               ), false, `isPrimary(new Unary('!', e)               )`);
    assert.strictEqual(isPrimary(new CallScope('!', [])          ), false, `isPrimary(new CallScope('!', [])          )`);
    assert.strictEqual(isPrimary(new CallMember(e, '', [])       ), false, `isPrimary(new CallMember(e, '', [])       )`);
    assert.strictEqual(isPrimary(new CallFunction(e, [])         ), false, `isPrimary(new CallFunction(e, [])         )`);
    assert.strictEqual(isPrimary(new AccessMember(e, '')         ), false, `isPrimary(new AccessMember(e, '')         )`);
    assert.strictEqual(isPrimary(new AccessKeyed(e, e)           ), false, `isPrimary(new AccessKeyed(e, e)           )`);
    assert.strictEqual(isPrimary(new TaggedTemplate([], [], e)   ), false, `isPrimary(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(isPrimary(new Binary('+', e, e)           ), false, `isPrimary(new Binary('+', e, e)           )`);
    assert.strictEqual(isPrimary(new Conditional(e, e, e)        ), false, `isPrimary(new Conditional(e, e, e)        )`);
    assert.strictEqual(isPrimary(new Assign(e, e)                ), false, `isPrimary(new Assign(e, e)                )`);
    assert.strictEqual(isPrimary(new ValueConverter(e, '', [])   ), false, `isPrimary(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(isPrimary(new BindingBehavior(e, '', [])  ), false, `isPrimary(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(isPrimary(new HtmlLiteral([])             ), false, `isPrimary(new HtmlLiteral([])             )`);
    assert.strictEqual(isPrimary(new ArrayBindingPattern([])     ), false, `isPrimary(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isPrimary(new ObjectBindingPattern([], [])), false, `isPrimary(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isPrimary(new BindingIdentifier('')       ), false, `isPrimary(new BindingIdentifier('')       )`);
    assert.strictEqual(isPrimary(new ForOfStatement(e, e)        ), false, `isPrimary(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isPrimary(new Interpolation([])           ), false, `isPrimary(new Interpolation([])           )`);
  });

  it('isResource', function () {
    assert.strictEqual(isResource(new AccessThis()                ), false, `isResource(new AccessThis()                )`);
    assert.strictEqual(isResource(new AccessScope('')             ), false, `isResource(new AccessScope('')             )`);
    assert.strictEqual(isResource(new ArrayLiteral([])            ), false, `isResource(new ArrayLiteral([])            )`);
    assert.strictEqual(isResource(new ObjectLiteral([], [])       ), false, `isResource(new ObjectLiteral([], [])       )`);
    assert.strictEqual(isResource(new PrimitiveLiteral('')        ), false, `isResource(new PrimitiveLiteral('')        )`);
    assert.strictEqual(isResource(new Template([])                ), false, `isResource(new Template([])                )`);
    assert.strictEqual(isResource(new Unary('!', e)               ), false, `isResource(new Unary('!', e)               )`);
    assert.strictEqual(isResource(new CallScope('!', [])          ), false, `isResource(new CallScope('!', [])          )`);
    assert.strictEqual(isResource(new CallMember(e, '', [])       ), false, `isResource(new CallMember(e, '', [])       )`);
    assert.strictEqual(isResource(new CallFunction(e, [])         ), false, `isResource(new CallFunction(e, [])         )`);
    assert.strictEqual(isResource(new AccessMember(e, '')         ), false, `isResource(new AccessMember(e, '')         )`);
    assert.strictEqual(isResource(new AccessKeyed(e, e)           ), false, `isResource(new AccessKeyed(e, e)           )`);
    assert.strictEqual(isResource(new TaggedTemplate([], [], e)   ), false, `isResource(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(isResource(new Binary('+', e, e)           ), false, `isResource(new Binary('+', e, e)           )`);
    assert.strictEqual(isResource(new Conditional(e, e, e)        ), false, `isResource(new Conditional(e, e, e)        )`);
    assert.strictEqual(isResource(new Assign(e, e)                ), false, `isResource(new Assign(e, e)                )`);
    assert.strictEqual(isResource(new ValueConverter(e, '', [])   ), true, `isResource(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(isResource(new BindingBehavior(e, '', [])  ), true, `isResource(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(isResource(new HtmlLiteral([])             ), false, `isResource(new HtmlLiteral([])             )`);
    assert.strictEqual(isResource(new ArrayBindingPattern([])     ), false, `isResource(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isResource(new ObjectBindingPattern([], [])), false, `isResource(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isResource(new BindingIdentifier('')       ), false, `isResource(new BindingIdentifier('')       )`);
    assert.strictEqual(isResource(new ForOfStatement(e, e)        ), false, `isResource(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isResource(new Interpolation([])           ), false, `isResource(new Interpolation([])           )`);
  });

  it('hasBind', function () {
    assert.strictEqual(hasBind(new AccessThis()                ), false, `hasBind(new AccessThis()                )`);
    assert.strictEqual(hasBind(new AccessScope('')             ), false, `hasBind(new AccessScope('')             )`);
    assert.strictEqual(hasBind(new ArrayLiteral([])            ), false, `hasBind(new ArrayLiteral([])            )`);
    assert.strictEqual(hasBind(new ObjectLiteral([], [])       ), false, `hasBind(new ObjectLiteral([], [])       )`);
    assert.strictEqual(hasBind(new PrimitiveLiteral('')        ), false, `hasBind(new PrimitiveLiteral('')        )`);
    assert.strictEqual(hasBind(new Template([])                ), false, `hasBind(new Template([])                )`);
    assert.strictEqual(hasBind(new Unary('!', e)               ), false, `hasBind(new Unary('!', e)               )`);
    assert.strictEqual(hasBind(new CallScope('!', [])          ), false, `hasBind(new CallScope('!', [])          )`);
    assert.strictEqual(hasBind(new CallMember(e, '', [])       ), false, `hasBind(new CallMember(e, '', [])       )`);
    assert.strictEqual(hasBind(new CallFunction(e, [])         ), false, `hasBind(new CallFunction(e, [])         )`);
    assert.strictEqual(hasBind(new AccessMember(e, '')         ), false, `hasBind(new AccessMember(e, '')         )`);
    assert.strictEqual(hasBind(new AccessKeyed(e, e)           ), false, `hasBind(new AccessKeyed(e, e)           )`);
    assert.strictEqual(hasBind(new TaggedTemplate([], [], e)   ), false, `hasBind(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(hasBind(new Binary('+', e, e)           ), false, `hasBind(new Binary('+', e, e)           )`);
    assert.strictEqual(hasBind(new Conditional(e, e, e)        ), false, `hasBind(new Conditional(e, e, e)        )`);
    assert.strictEqual(hasBind(new Assign(e, e)                ), false, `hasBind(new Assign(e, e)                )`);
    assert.strictEqual(hasBind(new ValueConverter(e, '', [])   ), false, `hasBind(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(hasBind(new BindingBehavior(e, '', [])  ), true, `hasBind(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(hasBind(new HtmlLiteral([])             ), false, `hasBind(new HtmlLiteral([])             )`);
    assert.strictEqual(hasBind(new ArrayBindingPattern([])     ), false, `hasBind(new ArrayBindingPattern([])     )`);
    assert.strictEqual(hasBind(new ObjectBindingPattern([], [])), false, `hasBind(new ObjectBindingPattern([], []))`);
    assert.strictEqual(hasBind(new BindingIdentifier('')       ), false, `hasBind(new BindingIdentifier('')       )`);
    assert.strictEqual(hasBind(new ForOfStatement(e, e)        ), true, `hasBind(new ForOfStatement(e, e)        )`);
    assert.strictEqual(hasBind(new Interpolation([])           ), false, `hasBind(new Interpolation([])           )`);
  });

  it('hasUnbind', function () {
    assert.strictEqual(hasUnbind(new AccessThis()                ), false, `hasUnbind(new AccessThis()                )`);
    assert.strictEqual(hasUnbind(new AccessScope('')             ), false, `hasUnbind(new AccessScope('')             )`);
    assert.strictEqual(hasUnbind(new ArrayLiteral([])            ), false, `hasUnbind(new ArrayLiteral([])            )`);
    assert.strictEqual(hasUnbind(new ObjectLiteral([], [])       ), false, `hasUnbind(new ObjectLiteral([], [])       )`);
    assert.strictEqual(hasUnbind(new PrimitiveLiteral('')        ), false, `hasUnbind(new PrimitiveLiteral('')        )`);
    assert.strictEqual(hasUnbind(new Template([])                ), false, `hasUnbind(new Template([])                )`);
    assert.strictEqual(hasUnbind(new Unary('!', e)               ), false, `hasUnbind(new Unary('!', e)               )`);
    assert.strictEqual(hasUnbind(new CallScope('!', [])          ), false, `hasUnbind(new CallScope('!', [])          )`);
    assert.strictEqual(hasUnbind(new CallMember(e, '', [])       ), false, `hasUnbind(new CallMember(e, '', [])       )`);
    assert.strictEqual(hasUnbind(new CallFunction(e, [])         ), false, `hasUnbind(new CallFunction(e, [])         )`);
    assert.strictEqual(hasUnbind(new AccessMember(e, '')         ), false, `hasUnbind(new AccessMember(e, '')         )`);
    assert.strictEqual(hasUnbind(new AccessKeyed(e, e)           ), false, `hasUnbind(new AccessKeyed(e, e)           )`);
    assert.strictEqual(hasUnbind(new TaggedTemplate([], [], e)   ), false, `hasUnbind(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(hasUnbind(new Binary('+', e, e)           ), false, `hasUnbind(new Binary('+', e, e)           )`);
    assert.strictEqual(hasUnbind(new Conditional(e, e, e)        ), false, `hasUnbind(new Conditional(e, e, e)        )`);
    assert.strictEqual(hasUnbind(new Assign(e, e)                ), false, `hasUnbind(new Assign(e, e)                )`);
    assert.strictEqual(hasUnbind(new ValueConverter(e, '', [])   ), true, `hasUnbind(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(hasUnbind(new BindingBehavior(e, '', [])  ), true, `hasUnbind(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(hasUnbind(new HtmlLiteral([])             ), false, `hasUnbind(new HtmlLiteral([])             )`);
    assert.strictEqual(hasUnbind(new ArrayBindingPattern([])     ), false, `hasUnbind(new ArrayBindingPattern([])     )`);
    assert.strictEqual(hasUnbind(new ObjectBindingPattern([], [])), false, `hasUnbind(new ObjectBindingPattern([], []))`);
    assert.strictEqual(hasUnbind(new BindingIdentifier('')       ), false, `hasUnbind(new BindingIdentifier('')       )`);
    assert.strictEqual(hasUnbind(new ForOfStatement(e, e)        ), true, `hasUnbind(new ForOfStatement(e, e)        )`);
    assert.strictEqual(hasUnbind(new Interpolation([])           ), false, `hasUnbind(new Interpolation([])           )`);
  });

  it('isLiteral', function () {
    assert.strictEqual(isLiteral(new AccessThis()                ), false, `isLiteral(new AccessThis()                )`);
    assert.strictEqual(isLiteral(new AccessScope('')             ), false, `isLiteral(new AccessScope('')             )`);
    assert.strictEqual(isLiteral(new ArrayLiteral([])            ), true, `isLiteral(new ArrayLiteral([])            )`);
    assert.strictEqual(isLiteral(new ObjectLiteral([], [])       ), true, `isLiteral(new ObjectLiteral([], [])       )`);
    assert.strictEqual(isLiteral(new PrimitiveLiteral('')        ), true, `isLiteral(new PrimitiveLiteral('')        )`);
    assert.strictEqual(isLiteral(new Template([])                ), true, `isLiteral(new Template([])                )`);
    assert.strictEqual(isLiteral(new Unary('!', e)               ), false, `isLiteral(new Unary('!', e)               )`);
    assert.strictEqual(isLiteral(new CallScope('!', [])          ), false, `isLiteral(new CallScope('!', [])          )`);
    assert.strictEqual(isLiteral(new CallMember(e, '', [])       ), false, `isLiteral(new CallMember(e, '', [])       )`);
    assert.strictEqual(isLiteral(new CallFunction(e, [])         ), false, `isLiteral(new CallFunction(e, [])         )`);
    assert.strictEqual(isLiteral(new AccessMember(e, '')         ), false, `isLiteral(new AccessMember(e, '')         )`);
    assert.strictEqual(isLiteral(new AccessKeyed(e, e)           ), false, `isLiteral(new AccessKeyed(e, e)           )`);
    assert.strictEqual(isLiteral(new TaggedTemplate([], [], e)   ), false, `isLiteral(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(isLiteral(new Binary('+', e, e)           ), false, `isLiteral(new Binary('+', e, e)           )`);
    assert.strictEqual(isLiteral(new Conditional(e, e, e)        ), false, `isLiteral(new Conditional(e, e, e)        )`);
    assert.strictEqual(isLiteral(new Assign(e, e)                ), false, `isLiteral(new Assign(e, e)                )`);
    assert.strictEqual(isLiteral(new ValueConverter(e, '', [])   ), false, `isLiteral(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(isLiteral(new BindingBehavior(e, '', [])  ), false, `isLiteral(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(isLiteral(new HtmlLiteral([])             ), false, `isLiteral(new HtmlLiteral([])             )`);
    assert.strictEqual(isLiteral(new ArrayBindingPattern([])     ), false, `isLiteral(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isLiteral(new ObjectBindingPattern([], [])), false, `isLiteral(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isLiteral(new BindingIdentifier('')       ), false, `isLiteral(new BindingIdentifier('')       )`);
    assert.strictEqual(isLiteral(new ForOfStatement(e, e)        ), false, `isLiteral(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isLiteral(new Interpolation([])           ), false, `isLiteral(new Interpolation([])           )`);
  });

  it('isPureLiteral', function () {
    assert.strictEqual(isPureLiteral(new AccessThis()                ), false, `isPureLiteral(new AccessThis()                )`);
    assert.strictEqual(isPureLiteral(new AccessScope('')             ), false, `isPureLiteral(new AccessScope('')             )`);
    assert.strictEqual(isPureLiteral(new ArrayLiteral([])            ), true, `isPureLiteral(new ArrayLiteral([])            )`);
    assert.strictEqual(isPureLiteral(new ObjectLiteral([], [])       ), true, `isPureLiteral(new ObjectLiteral([], [])       )`);
    assert.strictEqual(isPureLiteral(new PrimitiveLiteral('')        ), true, `isPureLiteral(new PrimitiveLiteral('')        )`);
    assert.strictEqual(isPureLiteral(new Template([])                ), true, `isPureLiteral(new Template([])                )`);
    assert.strictEqual(isPureLiteral(new Unary('!', e)               ), false, `isPureLiteral(new Unary('!', e)               )`);
    assert.strictEqual(isPureLiteral(new CallScope('!', [])          ), false, `isPureLiteral(new CallScope('!', [])          )`);
    assert.strictEqual(isPureLiteral(new CallMember(e, '', [])       ), false, `isPureLiteral(new CallMember(e, '', [])       )`);
    assert.strictEqual(isPureLiteral(new CallFunction(e, [])         ), false, `isPureLiteral(new CallFunction(e, [])         )`);
    assert.strictEqual(isPureLiteral(new AccessMember(e, '')         ), false, `isPureLiteral(new AccessMember(e, '')         )`);
    assert.strictEqual(isPureLiteral(new AccessKeyed(e, e)           ), false, `isPureLiteral(new AccessKeyed(e, e)           )`);
    assert.strictEqual(isPureLiteral(new TaggedTemplate([], [], e)   ), false, `isPureLiteral(new TaggedTemplate([], [], e)   )`);
    assert.strictEqual(isPureLiteral(new Binary('+', e, e)           ), false, `isPureLiteral(new Binary('+', e, e)           )`);
    assert.strictEqual(isPureLiteral(new Conditional(e, e, e)        ), false, `isPureLiteral(new Conditional(e, e, e)        )`);
    assert.strictEqual(isPureLiteral(new Assign(e, e)                ), false, `isPureLiteral(new Assign(e, e)                )`);
    assert.strictEqual(isPureLiteral(new ValueConverter(e, '', [])   ), false, `isPureLiteral(new ValueConverter(e, '', [])   )`);
    assert.strictEqual(isPureLiteral(new BindingBehavior(e, '', [])  ), false, `isPureLiteral(new BindingBehavior(e, '', [])  )`);
    assert.strictEqual(isPureLiteral(new HtmlLiteral([])             ), false, `isPureLiteral(new HtmlLiteral([])             )`);
    assert.strictEqual(isPureLiteral(new ArrayBindingPattern([])     ), false, `isPureLiteral(new ArrayBindingPattern([])     )`);
    assert.strictEqual(isPureLiteral(new ObjectBindingPattern([], [])), false, `isPureLiteral(new ObjectBindingPattern([], []))`);
    assert.strictEqual(isPureLiteral(new BindingIdentifier('')       ), false, `isPureLiteral(new BindingIdentifier('')       )`);
    assert.strictEqual(isPureLiteral(new ForOfStatement(e, e)        ), false, `isPureLiteral(new ForOfStatement(e, e)        )`);
    assert.strictEqual(isPureLiteral(new Interpolation([])           ), false, `isPureLiteral(new Interpolation([])           )`);

    assert.strictEqual(isPureLiteral(new ArrayLiteral([])), true, `isPureLiteral(new ArrayLiteral([]))`);
    assert.strictEqual(isPureLiteral(new ArrayLiteral([new PrimitiveLiteral('')])), true, `isPureLiteral(new ArrayLiteral([new PrimitiveLiteral('')]))`);
    assert.strictEqual(isPureLiteral(new ArrayLiteral([new AccessScope('a')])), false, `isPureLiteral(new ArrayLiteral([new AccessScope('a')]))`);

    assert.strictEqual(isPureLiteral(new ObjectLiteral([], [])), true, `isPureLiteral(new ObjectLiteral([], []))`);
    assert.strictEqual(isPureLiteral(new ObjectLiteral(['a'], [new PrimitiveLiteral('1')])), true, `isPureLiteral(new ObjectLiteral(['a'], [new PrimitiveLiteral('1')]))`);
    assert.strictEqual(isPureLiteral(new ObjectLiteral(['a'], [new AccessScope('a')])), false, `isPureLiteral(new ObjectLiteral(['a'], [new AccessScope('a')]))`);

    assert.strictEqual(isPureLiteral(new Template([])), true, `isPureLiteral(new Template([]))`);
    assert.strictEqual(isPureLiteral(new Template([''])), true, `isPureLiteral(new Template(['']))`);
    assert.strictEqual(isPureLiteral(new Template(['', ''], [new PrimitiveLiteral('1')])), true, `isPureLiteral(new Template(['', ''], [new PrimitiveLiteral('1')]))`);
    assert.strictEqual(isPureLiteral(new Template(['', ''], [new AccessScope('a')])), false, `isPureLiteral(new Template(['', ''], [new AccessScope('a')]))`);
  });
});
