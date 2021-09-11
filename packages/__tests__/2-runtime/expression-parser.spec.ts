import {
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  AccessThisExpression,
  ArrayLiteralExpression,
  AssignExpression,
  BinaryExpression,
  BinaryOperator,
  BindingBehaviorExpression,
  BindingIdentifier,
  ExpressionType,
  CallFunctionExpression,
  CallMemberExpression,
  CallScopeExpression,
  ConditionalExpression,
  ExpressionKind,
  ForOfStatement,
  Interpolation,
  ObjectLiteralExpression,
  PrimitiveLiteralExpression,
  TaggedTemplateExpression,
  TemplateExpression,
  UnaryExpression,
  ValueConverterExpression,
  IsLeftHandSide,
  IsAssign,
  Access,
  Precedence,
  parseExpression,
  parse,
  ParserState,
  DestructuringAssignmentExpression,
  DestructuringAssignmentSingleExpression,
  DestructuringAssignmentRestExpression,
  IsBindingBehavior,
} from '@aurelia/runtime';
import {
  assert,
  generateCartesianProduct,
} from '@aurelia/testing';
import {
  latin1IdentifierPartChars,
  latin1IdentifierStartChars,
  otherBMPIdentifierPartChars
} from './unicode.js';

function createTaggedTemplate(cooked: string[], func: IsLeftHandSide, expressions?: readonly IsAssign[]): TaggedTemplateExpression {
  return new TaggedTemplateExpression(cooked, cooked, func, expressions);
}

const binaryMultiplicative: BinaryOperator[] = ['*', '%', '/'];
const binaryAdditive: BinaryOperator[] = ['+', '-'];
const binaryRelational: [BinaryOperator, string][] = [
  ['<', '<'],
  ['<=', '<='],
  ['>', '>'],
  ['>=', '>='],
  ['in', ' in '],
  ['instanceof', ' instanceof '],
];
const binaryEquality: BinaryOperator[] = ['==', '!=', '===', '!=='];

const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $str = PrimitiveLiteralExpression.$empty;
const $tpl = TemplateExpression.$empty;
const $arr = ArrayLiteralExpression.$empty;
const $obj = ObjectLiteralExpression.$empty;
const $this = AccessThisExpression.$this;
const $parent = AccessThisExpression.$parent;

const $a = new AccessScopeExpression('a');
const $b = new AccessScopeExpression('b');
const $c = new AccessScopeExpression('c');
const $num0 = new PrimitiveLiteralExpression(0);
const $num1 = new PrimitiveLiteralExpression(1);

function expressionTypeToString(expressionType: ExpressionType): string {
  let name = '';
  if (expressionType & ExpressionType.IsProperty) {
    name += ' | IsProperty';
  }
  if (expressionType & ExpressionType.IsFunction) {
    name += ' | IsFunction';
  }
  return name;
}

function verifyResultOrError(expr: string, expected: any, expectedMsg?: string, exprType?: ExpressionType, name?: string): any {
  let error: Error = null;
  let actual: any = null;
  try {
    actual = parseExpression(expr, exprType as any);
  } catch (e) {
    error = e;
  }
  if (exprType === ExpressionType.Interpolation && !(expected instanceof Interpolation)) {
    if (error != null) {
      throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${expressionTypeToString(exprType)} not to throw, but it threw "${error.message}"`);
    }
  } else if (expectedMsg == null) {
    if (error == null) {
      assert.deepStrictEqual(actual, expected);
    } else {
      throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${expressionTypeToString(exprType)} parse successfully, but it threw "${error.message}"`);
    }
  } else {
    if (error == null) {
      throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${expressionTypeToString(exprType)} to throw "${expectedMsg}", but no error was thrown`);
    } else {
      if (!error.message.startsWith(expectedMsg)) {
        throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${expressionTypeToString(exprType)} to throw "${expectedMsg}", but got "${error.message}" instead`);
      }
    }
  }
}

// Note: we could loop through all generated tests by picking SimpleIsBindingBehaviorList and ComplexIsBindingBehaviorList,
// but we're separating them out to make the test suites more granular for debugging and reporting purposes
describe('ExpressionParser', function () {

  // #region Simple lists

  // The goal here is to pre-create arrays of string+ast expression pairs that each represent a unique
  // path taken in the expression parser. We're creating them here at the module level simply to speed up
  // the tests. They're never modified, so it's safe to reuse the same expression for multiple tests.

  // They're called Simple..Lists because we're not creating any combinations / nested expressions yet.
  // Instead, these lists will be the inputs for combinations further down below.

  // Note: we're more or less following the same ordering here as the tc39 spec description comments;
  // those comments (https://tc39.github.io/... in expression-parser.ts) are partial extracts from the spec
  // with mostly just omissions; the only modification is the special parsing rules related to AccessThisExpression

  // 1. parsePrimaryExpression.this
  const AccessThisList: [string, any][] = [
    [`$this`,             $this],
    [`$parent`,           $parent],
    [`$parent.$parent`,   new AccessThisExpression(2)]
  ];
  // 2. parsePrimaryExpression.IdentifierName
  const AccessScopeList: [string, any][] = [
    ...AccessThisList.map(([input, expr]) => [`${input}.a`, new AccessScopeExpression('a', expr.ancestor)] as [string, any]),
    [`$this.$parent`,     new AccessScopeExpression('$parent')],
    [`$parent.$this`,     new AccessScopeExpression('$this', 1)],
    [`a`,                 $a]
  ];
  // 3. parsePrimaryExpression.Literal
  const SimpleStringLiteralList: [string, any][] = [
    [`''`,                $str],
    [`""`,                $str]
  ];
  const SimpleNumberLiteralList: [string, any][] = [
    [`1`,                 $num1],
    [`1.1`,               new PrimitiveLiteralExpression(1.1)],
    [`.1`,                new PrimitiveLiteralExpression(0.1)],
    [`0.1`,               new PrimitiveLiteralExpression(0.1)]
  ];
  const KeywordPrimitiveLiteralList: [string, any][] = [
    [`undefined`,         $undefined],
    [`null`,              $null],
    [`true`,              $true],
    [`false`,             $false]
  ];
  // concatenation of 3.
  const SimplePrimitiveLiteralList: [string, any][] = [
    ...SimpleStringLiteralList,
    ...SimpleNumberLiteralList,
    ...KeywordPrimitiveLiteralList
  ];

  // 4. parsePrimaryExpression.ArrayLiteral
  const SimpleArrayLiteralList: [string, any][] = [
    [`[]`,                $arr]
  ];
  // 5. parsePrimaryExpression.ObjectLiteral
  const SimpleObjectLiteralList: [string, any][] = [
    [`{}`,                $obj]
  ];
  // 6. parsePrimaryExpression.TemplateLiteral
  const SimpleTemplateLiteralList: [string, any][] = [
    [`\`\``,              $tpl],
    [`\`\${a}\``,         new TemplateExpression(['', ''], [$a])]
  ];
  // concatenation of 3., 4., 5., 6.
  const SimpleLiteralList: [string, any][] = [
    ...SimplePrimitiveLiteralList,
    ...SimpleTemplateLiteralList,
    ...SimpleArrayLiteralList,
    ...SimpleObjectLiteralList
  ];
  // 7. parsePrimaryExpression.ParenthesizedExpression
  // Note: this is simply one of each precedence group, except for Primary because
  // parenthesized and primary are already from the same precedence group
  const SimpleParenthesizedList: [string, any][] = [
    [`(a[b])`,            new AccessKeyedExpression($a, $b)],
    [`(a.b)`,             new AccessMemberExpression($a, 'b')],
    [`(a\`\`)`,           createTaggedTemplate([''], $a, [])],
    [`($this())`,         new CallFunctionExpression($this, [])],
    [`(a())`,             new CallScopeExpression('a', [])],
    [`(!a)`,              new UnaryExpression('!', $a)],
    [`(a+b)`,             new BinaryExpression('+', $a, $b)],
    [`(a?b:c)`,           new ConditionalExpression($a, $b, new AccessScopeExpression('c'))],
    [`(a=b)`,             new AssignExpression($a, $b)]
  ];
  // concatenation of 1 through 7 (all Primary expressions)
  // This forms the group Precedence.Primary
  const SimplePrimaryList: [string, any][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...SimpleLiteralList,
    ...SimpleParenthesizedList
  ];
  // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  const SimpleAccessKeyedList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}[b]`, new AccessKeyedExpression(expr, $b)] as [string, any])
  ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}.b`, new AccessMemberExpression(expr, 'b')] as [string, any])
  ];
  // 4. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}\`\``, createTaggedTemplate([''], expr, [])] as [string, any]),

    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}\`\${a}\``, createTaggedTemplate(['', ''], expr, [$a])] as [string, any])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, any][] = [
    ...[...AccessThisList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}()`, new CallFunctionExpression(expr, [])] as [string, any])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, any][] = [
    ...[...AccessScopeList]
      .map(([input, expr]) => [`${input}()`, new CallScopeExpression(expr.name, [], expr.ancestor)] as [string, any])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}.b()`, new CallMemberExpression(expr, 'b', [])] as [string, any])
  ];
  // concatenation of 1-3 of MemberExpression and 1-3 of CallExpression
  const SimpleLeftHandSideList: [string, any][] = [
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
  const SimpleIsLeftHandSideList: [string, any][] = [
    ...SimplePrimaryList,
    ...SimpleLeftHandSideList
  ];

  // same as SimpleIsLeftHandSideList but without $parent and $this (ergo, LeftHandSide according to the actual spec)
  const SimpleIsNativeLeftHandSideList: [string, any][] = [
    ...AccessScopeList,
    ...SimpleLiteralList,
    ...SimpleParenthesizedList,
    ...SimpleLeftHandSideList
  ];

  // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
  const SimpleUnaryList: [string, any][] = [
    [`!$1`, new UnaryExpression('!', new AccessScopeExpression('$1'))],
    [`-$2`, new UnaryExpression('-', new AccessScopeExpression('$2'))],
    [`+$3`, new UnaryExpression('+', new AccessScopeExpression('$3'))],
    [`void $4`, new UnaryExpression('void', new AccessScopeExpression('$4'))],
    [`typeof $5`, new UnaryExpression('typeof', new AccessScopeExpression('$5'))]
  ];
  // concatenation of UnaryExpression + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
  const SimpleIsUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, any][] = [
    [`$6*$7`, new BinaryExpression('*', new AccessScopeExpression('$6'), new AccessScopeExpression('$7'))],
    [`$8%$9`, new BinaryExpression('%', new AccessScopeExpression('$8'), new AccessScopeExpression('$9'))],
    [`$10/$11`, new BinaryExpression('/', new AccessScopeExpression('$10'), new AccessScopeExpression('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, any][] = [
    ...SimpleIsUnaryList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, any][] = [
    [`$12+$13`, new BinaryExpression('+', new AccessScopeExpression('$12'), new AccessScopeExpression('$13'))],
    [`$14-$15`, new BinaryExpression('-', new AccessScopeExpression('$14'), new AccessScopeExpression('$15'))]
  ];
  const SimpleIsAdditiveList: [string, any][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, any][] = [
    [`$16<$17`, new BinaryExpression('<', new AccessScopeExpression('$16'), new AccessScopeExpression('$17'))],
    [`$18>$19`, new BinaryExpression('>', new AccessScopeExpression('$18'), new AccessScopeExpression('$19'))],
    [`$20<=$21`, new BinaryExpression('<=', new AccessScopeExpression('$20'), new AccessScopeExpression('$21'))],
    [`$22>=$23`, new BinaryExpression('>=', new AccessScopeExpression('$22'), new AccessScopeExpression('$23'))],
    [`$24 in $25`, new BinaryExpression('in', new AccessScopeExpression('$24'), new AccessScopeExpression('$25'))],
    [`$26 instanceof $27`, new BinaryExpression('instanceof', new AccessScopeExpression('$26'), new AccessScopeExpression('$27'))]
  ];
  const SimpleIsRelationalList: [string, any][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, any][] = [
    [`$28==$29`, new BinaryExpression('==', new AccessScopeExpression('$28'), new AccessScopeExpression('$29'))],
    [`$30!=$31`, new BinaryExpression('!=', new AccessScopeExpression('$30'), new AccessScopeExpression('$31'))],
    [`$32===$33`, new BinaryExpression('===', new AccessScopeExpression('$32'), new AccessScopeExpression('$33'))],
    [`$34!==$35`, new BinaryExpression('!==', new AccessScopeExpression('$34'), new AccessScopeExpression('$35'))]
  ];
  const SimpleIsEqualityList: [string, any][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, any][] = [
    [`$36&&$37`, new BinaryExpression('&&', new AccessScopeExpression('$36'), new AccessScopeExpression('$37'))]
  ];
  const SimpleIsLogicalANDList: [string, any][] = [
    ...SimpleIsEqualityList,
    ...SimpleLogicalANDList
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, any][] = [
    [`$38||$39`, new BinaryExpression('||', new AccessScopeExpression('$38'), new AccessScopeExpression('$39'))]
  ];
  const SimpleIsLogicalORList: [string, any][] = [
    ...SimpleIsLogicalANDList,
    ...SimpleLogicalORList
  ];

  // This forms the group Precedence.Conditional
  const SimpleConditionalList: [string, any][] = [
    [`a?b:c`, new ConditionalExpression($a, $b, new AccessScopeExpression('c'))]
  ];
  const SimpleIsConditionalList: [string, any][] = [
    ...SimpleIsLogicalORList,
    ...SimpleConditionalList
  ];

  // This forms the group Precedence.Assign
  const SimpleAssignList: [string, any][] = [
    [`a=b`, new AssignExpression($a, $b)]
  ];
  const SimpleIsAssignList: [string, any][] = [
    ...SimpleIsConditionalList,
    ...SimpleAssignList
  ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, any][] = [
    [`a|b`, new ValueConverterExpression($a, 'b', [])],
    [`a|b:c`, new ValueConverterExpression($a, 'b', [new AccessScopeExpression('c')])],
    [`a|b:c:d`, new ValueConverterExpression($a, 'b', [new AccessScopeExpression('c'), new AccessScopeExpression('d')])]
  ];
  const SimpleIsValueConverterList: [string, any][] = [
    ...SimpleIsAssignList,
    ...SimpleValueConverterList
  ];

  const SimpleBindingBehaviorList: [string, any][] = [
    [`a&b`, new BindingBehaviorExpression($a, 'b', [])],
    [`a&b:c`, new BindingBehaviorExpression($a, 'b', [new AccessScopeExpression('c')])],
    [`a&b:c:d`, new BindingBehaviorExpression($a, 'b', [new AccessScopeExpression('c'), new AccessScopeExpression('d')])]
  ];

  const SimpleIsBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList,
    ...SimpleBindingBehaviorList
  ];

  for (const [exprType, name] of [
    [undefined, 'undefined'],
    [ExpressionType.IsProperty, 'IsProperty'],
    [ExpressionType.IsProperty | ExpressionType.IsFunction, 'call command'],
  ] as [ExpressionType, string][]) {
    describe(name, function () {
      describe('parse AccessThisList', function () {
        for (const [input, expected] of AccessThisList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse AccessScopeList', function () {
        for (const [input, expected] of AccessScopeList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleStringLiteralList', function () {
        for (const [input, expected] of SimpleStringLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleNumberLiteralList', function () {
        for (const [input, expected] of SimpleNumberLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse KeywordPrimitiveLiteralList', function () {
        for (const [input, expected] of KeywordPrimitiveLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleArrayLiteralList', function () {
        for (const [input, expected] of SimpleArrayLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleObjectLiteralList', function () {
        for (const [input, expected] of SimpleObjectLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleTemplateLiteralList', function () {
        for (const [input, expected] of SimpleTemplateLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleParenthesizedList', function () {
        for (const [input, expected] of SimpleParenthesizedList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleAccessKeyedList', function () {
        for (const [input, expected] of SimpleAccessKeyedList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleAccessMemberList', function () {
        for (const [input, expected] of SimpleAccessMemberList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleTaggedTemplateList', function () {
        for (const [input, expected] of SimpleTaggedTemplateList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleCallFunctionList', function () {
        for (const [input, expected] of SimpleCallFunctionList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleCallScopeList', function () {
        for (const [input, expected] of SimpleCallScopeList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleCallMemberList', function () {
        for (const [input, expected] of SimpleCallMemberList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleUnaryList', function () {
        for (const [input, expected] of SimpleUnaryList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleMultiplicativeList', function () {
        for (const [input, expected] of SimpleMultiplicativeList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleAdditiveList', function () {
        for (const [input, expected] of SimpleAdditiveList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleRelationalList', function () {
        for (const [input, expected] of SimpleRelationalList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleEqualityList', function () {
        for (const [input, expected] of SimpleEqualityList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleLogicalANDList', function () {
        for (const [input, expected] of SimpleLogicalANDList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleLogicalORList', function () {
        for (const [input, expected] of SimpleLogicalORList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleConditionalList', function () {
        for (const [input, expected] of SimpleConditionalList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleAssignList', function () {
        for (const [input, expected] of SimpleAssignList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleValueConverterList', function () {
        for (const [input, expected] of SimpleValueConverterList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleBindingBehaviorList', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Unary', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Unary, exprType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than UnaryExpression');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Binary', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Binary, exprType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than BinaryExpression');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Conditional', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Conditional, exprType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
              (result.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
                (expected.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than ConditionalExpression');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Assign', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Assign, exprType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
              (result.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional ||
              (result.$kind & ExpressionKind.Assign) === ExpressionKind.Assign) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
                (expected.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional ||
                (expected.$kind & ExpressionKind.Assign) === ExpressionKind.Assign) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than AssignExpression');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Variadic', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Variadic, exprType);
            assert.deepStrictEqual(result, expected);
          });
        }
      });
    });
  }

  // #endregion

  // #region Complex lists
  // This is where the fun begins :) We're now going to create large lists of combinations in order
  // to hit every possible (non-error) edge case. The fundamental edge cases are written by hand, which
  // we then supplement by mixing in the simple lists created above. This generates a fair amount of redundancy
  // in the tests, but that's a perfectly acceptable tradeoff as it will cause issues to surface that you would
  // otherwise never think of.

  // We're validating all (meaningful) strings that can be escaped and combining them
  // with normal leading and trailing strings to verify escaping works correctly in different situations
  // This array is used to verify parsing of string PrimitiveLiteralExpression, and the strings in TemplateExpression and TaggedTemplateExpression
  const stringEscapables = [
    [`\\\\`, `\\`],
    [`\\\``, `\``],
    [`\\'`,  `'`],
    [`\\"`,  `"`],
    [`\\f`,  `\f`],
    [`\\n`,  `\n`],
    [`\\r`,  `\r`],
    [`\\t`,  `\t`],
    [`\\b`,  `\b`],
    [`\\v`,  `\v`]
  ].map(([raw, cooked]) => [
    [raw,         cooked],
    [`${raw}`,   `${cooked}`],
    [`x${raw}`,  `x${cooked}`],
    [`${raw}x`,  `${cooked}x`],
    [`x${raw}x`, `x${cooked}x`]
  ]).reduce((acc, cur) => acc.concat(cur));

  // Verify all string escapes, unicode characters, double and single quotes
  const ComplexStringLiteralList: [string, any][] = [
    ...[
      ['foo',                new PrimitiveLiteralExpression('foo')],
      ['äöüÄÖÜß',            new PrimitiveLiteralExpression('äöüÄÖÜß')],
      ['ಠ_ಠ',               new PrimitiveLiteralExpression('ಠ_ಠ')],
      ...stringEscapables.map(([raw, cooked]) => [raw, new PrimitiveLiteralExpression(cooked)])
    ].map(([input, expr]): [string, any][] => [
      [`'${input}'`, expr],
      [`"${input}"`, expr]
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexStringLiteralList', function () {
    for (const [input, expected] of ComplexStringLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify different floating point notations and parsing numbers that are outside the "safe" integer range
  const ComplexNumberList: [string, any][] = [
    ['9007199254740992',                                                  new PrimitiveLiteralExpression(9007199254740992)],
    ['0.9007199254740992',                                                new PrimitiveLiteralExpression(0.9007199254740992)],
    ['.9007199254740992',                                                 new PrimitiveLiteralExpression(0.9007199254740992)],
    ['.90071992547409929007199254740992',                                 new PrimitiveLiteralExpression(0.90071992547409929007199254740992)],
    ['9007199254740992.9007199254740992',                                 new PrimitiveLiteralExpression(9007199254740992.9007199254740992)],
    ['9007199254740992.90071992547409929007199254740992',                 new PrimitiveLiteralExpression(9007199254740992.90071992547409929007199254740992)],
    ['90071992547409929007199254740992',                                  new PrimitiveLiteralExpression(90071992547409929007199254740992)],
    ['90071992547409929007199254740992.9007199254740992',                 new PrimitiveLiteralExpression(90071992547409929007199254740992.9007199254740992)],
    ['90071992547409929007199254740992.90071992547409929007199254740992', new PrimitiveLiteralExpression(90071992547409929007199254740992.90071992547409929007199254740992)]
  ];
  describe('parse ComplexNumberList', function () {
    for (const [input, expected] of ComplexNumberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify various combinations of nested and chained parts/expressions, with/without escaped strings
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of arguments
  const ComplexTemplateLiteralList: [string, any][] = [
    [`\`a\``,                       new TemplateExpression(['a'], [])],
    [`\`\\\${a}\``,                 new TemplateExpression([`\${a}`], [])],
    [`\`$a\``,                      new TemplateExpression(['$a'], [])],
    [`\`\${a}\${b}\``,              new TemplateExpression(['', '', ''],                       [$a, $b])],
    [`\`a\${a}\${b}\``,             new TemplateExpression(['a', '', ''],                      [$a, $b])],
    [`\`\${a}a\${b}\``,             new TemplateExpression(['', 'a', ''],                      [$a, $b])],
    [`\`a\${a}a\${b}\``,            new TemplateExpression(['a', 'a', ''],                     [$a, $b])],
    [`\`\${a}\${b}a\``,             new TemplateExpression(['', '', 'a'],                      [$a, $b])],
    [`\`\${a}a\${b}a\``,            new TemplateExpression(['', 'a', 'a'],                     [$a, $b])],
    [`\`a\${a}a\${b}a\``,           new TemplateExpression(['a', 'a', 'a'],                    [$a, $b])],
    [`\`\${\`\${a}\`}\``,           new TemplateExpression(['', ''], [new TemplateExpression(['', ''],   [$a])])],
    [`\`\${\`a\${a}\`}\``,          new TemplateExpression(['', ''], [new TemplateExpression(['a', ''],  [$a])])],
    [`\`\${\`\${a}a\`}\``,          new TemplateExpression(['', ''], [new TemplateExpression(['', 'a'],  [$a])])],
    [`\`\${\`a\${a}a\`}\``,         new TemplateExpression(['', ''], [new TemplateExpression(['a', 'a'], [$a])])],
    [`\`\${\`\${\`\${a}\`}\`}\``,   new TemplateExpression(['', ''], [new TemplateExpression(['', ''], [new TemplateExpression(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]): [string, any][] => [
      [`\`${raw}\``,                new TemplateExpression([cooked],              [])],
      [`\`\${a}${raw}\``,           new TemplateExpression(['', cooked],        [$a])],
      [`\`${raw}\${a}\``,           new TemplateExpression([cooked, ''],        [$a])],
      [`\`${raw}\${a}${raw}\``,     new TemplateExpression([cooked, cooked],    [$a])],
      [`\`\${a}${raw}\${a}\``,      new TemplateExpression(['', cooked, ''],    [$a, $a])],
    ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\`\${${input}}\``, new TemplateExpression(['', ''], [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\`\${${input}}\${${input}}\``, new TemplateExpression(['', '', ''], [expr, expr])] as [string, any])
  ];
  describe('parse ComplexTemplateLiteralList', function () {
    for (const [input, expected] of ComplexTemplateLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify various combinations of specified and unspecified (elision) array items
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of element expressions
  const ComplexArrayLiteralList: [string, any][] = [
    [`[,]`,                 new ArrayLiteralExpression([$undefined])],
    [`[,,]`,                new ArrayLiteralExpression([$undefined, $undefined])],
    [`[,,,]`,               new ArrayLiteralExpression([$undefined, $undefined, $undefined])],
    [`[a,]`,                new ArrayLiteralExpression([$a])],
    [`[a,,]`,               new ArrayLiteralExpression([$a, $undefined])],
    [`[a,a,]`,              new ArrayLiteralExpression([$a, $a])],
    [`[a,,,]`,              new ArrayLiteralExpression([$a, $undefined, $undefined])],
    [`[a,a,,]`,             new ArrayLiteralExpression([$a, $a, $undefined])],
    [`[,a]`,                new ArrayLiteralExpression([$undefined, $a])],
    [`[,a,]`,               new ArrayLiteralExpression([$undefined, $a])],
    [`[,a,,]`,              new ArrayLiteralExpression([$undefined, $a, $undefined])],
    [`[,a,a,]`,             new ArrayLiteralExpression([$undefined, $a, $a])],
    [`[,,a]`,               new ArrayLiteralExpression([$undefined, $undefined, $a])],
    [`[,a,a]`,              new ArrayLiteralExpression([$undefined, $a, $a])],
    [`[,,a,]`,              new ArrayLiteralExpression([$undefined, $undefined, $a])],
    [`[,,,a]`,              new ArrayLiteralExpression([$undefined, $undefined, $undefined, $a])],
    [`[,,a,a]`,             new ArrayLiteralExpression([$undefined, $undefined, $a, $a])],
    ...SimpleIsAssignList.map(([input, expr]): [string, any][] => [
      [`[${input}]`,           new ArrayLiteralExpression([expr])],
      [`[${input},${input}]`,  new ArrayLiteralExpression([expr, expr])]
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexArrayLiteralList', function () {
    for (const [input, expected] of ComplexArrayLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify various combinations of shorthand, full, string and number property definitions
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of value expressions
  const ComplexObjectLiteralList: [string, any][] = [
    [`{a}`,                 new ObjectLiteralExpression(['a'], [$a])],
    [`{a:a}`,               new ObjectLiteralExpression(['a'], [$a])],
    [`{'a':a}`,             new ObjectLiteralExpression(['a'], [$a])],
    [`{"a":a}`,             new ObjectLiteralExpression(['a'], [$a])],
    [`{1:a}`,               new ObjectLiteralExpression([1], [$a])],
    [`{'1':a}`,             new ObjectLiteralExpression(['1'], [$a])],
    [`{"1":a}`,             new ObjectLiteralExpression(['1'], [$a])],
    [`{'a':a,b}`,           new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{"a":a,b}`,           new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{1:a,b}`,             new ObjectLiteralExpression([1, 'b'], [$a, $b])],
    [`{'1':a,b}`,           new ObjectLiteralExpression(['1', 'b'], [$a, $b])],
    [`{"1":a,b}`,           new ObjectLiteralExpression(['1', 'b'], [$a, $b])],
    [`{a,'b':b}`,           new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a,"b":b}`,           new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a,1:b}`,             new ObjectLiteralExpression(['a', 1], [$a, $b])],
    [`{a,'1':b}`,           new ObjectLiteralExpression(['a', '1'], [$a, $b])],
    [`{a,"1":b}`,           new ObjectLiteralExpression(['a', '1'], [$a, $b])],
    [`{a,b}`,               new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a:a,b}`,             new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a,b:b}`,             new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a:a,b,c}`,           new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c}`,           new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b,c:c}`,           new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b:b,c}`,         new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b,c:c}`,         new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c:c}`,         new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    ...SimpleIsAssignList.map(([input, expr]): [string, any][] => [
      [`{a:${input}}`,            new ObjectLiteralExpression(['a'], [expr])],
      [`{a:${input},b:${input}}`, new ObjectLiteralExpression(['a', 'b'], [expr, expr])]
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexObjectLiteralList', function () {
    for (const [input, expected] of ComplexObjectLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAccessKeyedList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a[${input}]`, new AccessKeyedExpression($a, expr)] as [string, any])
  ];
  describe('parse ComplexAccessKeyedList', function () {
    for (const [input, expected] of ComplexAccessKeyedList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAccessMemberList: [string, any][] = [
    ...[
      ...KeywordPrimitiveLiteralList,
      [`typeof`],
      [`void`],
      [`$this`],
      [`$parent`],
      [`in`],
      [`instanceof`],
      [`of`]]
      .map(([input]) => [`a.${input}`, new AccessMemberExpression($a, input)] as [string, any])
  ];
  describe('parse ComplexAccessMemberList', function () {
    for (const [input, expected] of ComplexAccessMemberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexTaggedTemplateList: [string, any][] = [
    [`a\`a\``,                       createTaggedTemplate(['a'],           $a, [])],
    [`a\`\\\${a}\``,                 createTaggedTemplate([`\${a}`],       $a, [])],
    [`a\`$a\``,                      createTaggedTemplate(['$a'],          $a, [])],
    [`a\`\${b}\${c}\``,              createTaggedTemplate(['', '', ''],    $a, [$b, $c])],
    [`a\`a\${b}\${c}\``,             createTaggedTemplate(['a', '', ''],   $a, [$b, $c])],
    [`a\`\${b}a\${c}\``,             createTaggedTemplate(['', 'a', ''],   $a, [$b, $c])],
    [`a\`a\${b}a\${c}\``,            createTaggedTemplate(['a', 'a', ''],  $a, [$b, $c])],
    [`a\`\${b}\${c}a\``,             createTaggedTemplate(['', '', 'a'],   $a, [$b, $c])],
    [`a\`\${b}a\${c}a\``,            createTaggedTemplate(['', 'a', 'a'],  $a, [$b, $c])],
    [`a\`a\${b}a\${c}a\``,           createTaggedTemplate(['a', 'a', 'a'], $a, [$b, $c])],
    [`a\`\${\`\${a}\`}\``,           createTaggedTemplate(['', ''],        $a, [new TemplateExpression(['', ''],   [$a])])],
    [`a\`\${\`a\${a}\`}\``,          createTaggedTemplate(['', ''],        $a, [new TemplateExpression(['a', ''],  [$a])])],
    [`a\`\${\`\${a}a\`}\``,          createTaggedTemplate(['', ''],        $a, [new TemplateExpression(['', 'a'],  [$a])])],
    [`a\`\${\`a\${a}a\`}\``,         createTaggedTemplate(['', ''],        $a, [new TemplateExpression(['a', 'a'], [$a])])],
    [`a\`\${\`\${\`\${a}\`}\`}\``,   createTaggedTemplate(['', ''],        $a, [new TemplateExpression(['', ''], [new TemplateExpression(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]): [string, any][] => [
      [`a\`${raw}\``,                createTaggedTemplate([cooked],         $a,     [])],
      [`a\`\${a}${raw}\``,           createTaggedTemplate(['', cooked],     $a,   [$a])],
      [`a\`${raw}\${a}\``,           createTaggedTemplate([cooked, ''],     $a,   [$a])],
      [`a\`${raw}\${a}${raw}\``,     createTaggedTemplate([cooked, cooked], $a,   [$a])],
      [`a\`\${a}${raw}\${a}\``,      createTaggedTemplate(['', cooked, ''], $a,   [$a, $a])],
    ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a\`\${${input}}\``, createTaggedTemplate(['', ''], $a, [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a\`\${${input}}\${${input}}\``, createTaggedTemplate(['', '', ''], $a, [expr, expr])] as [string, any])
  ];
  describe('parse ComplexTaggedTemplateList', function () {
    for (const [input, expected] of ComplexTaggedTemplateList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexCallFunctionList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`$this(${input})`, new CallFunctionExpression($this, [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`$this(${input},${input})`, new CallFunctionExpression($this, [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallFunctionList', function () {
    for (const [input, expected] of ComplexCallFunctionList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexCallScopeList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a(${input})`, new CallScopeExpression('a', [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a(${input},${input})`, new CallScopeExpression('a', [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallScopeList', function () {
    for (const [input, expected] of ComplexCallScopeList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexCallMemberList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a.b(${input})`, new CallMemberExpression($a, 'b', [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a.b(${input},${input})`, new CallMemberExpression($a, 'b', [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallMemberList', function () {
    for (const [input, expected] of ComplexCallMemberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`!${input}`, new UnaryExpression('!', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`+${input}`, new UnaryExpression('+', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`-${input}`, new UnaryExpression('-', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`void ${input}`, new UnaryExpression('void', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`typeof ${input}`, new UnaryExpression('typeof', expr)] as [string, any])
  ];
  describe('parse ComplexUnaryList', function () {
    for (const [input, expected] of ComplexUnaryList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Combine a precedence group with all precedence groups below it, the precedence group on the same
  // level, and a precedence group above it, and verify that the precedence/associativity is correctly enforced
  const ComplexMultiplicativeList: [string, any][] = [
    ...binaryMultiplicative.map(op => [
      ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`${i1}${op}a`, new BinaryExpression(op, e1, $a)]),
      ...SimpleUnaryList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i2}${op}${i1}`, new BinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexMultiplicativeList', function () {
    for (const [input, expected] of ComplexMultiplicativeList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAdditiveList: [string, any][] = [
    ...binaryAdditive.map(op => [
      ...SimpleIsAdditiveList.map(([i1, e1]) => [`${i1}${op}a`, new BinaryExpression(op, e1, $a)]),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i2}${op}${i1}`, new BinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexAdditiveList', function () {
    for (const [input, expected] of ComplexAdditiveList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexRelationalList: [string, any][] = [
    ...binaryRelational.map(([op, txt]) => [
      ...SimpleIsRelationalList.map(([i1, e1]) => [`${i1}${txt}a`, new BinaryExpression(op, e1, $a)]),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i2}${txt}${i1}`, new BinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexRelationalList', function () {
    for (const [input, expected] of ComplexRelationalList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexEqualityList: [string, any][] = [
    ...binaryEquality.map(op => [
      ...SimpleIsEqualityList.map(([i1, e1]) => [`${i1}${op}a`, new BinaryExpression(op, e1, $a)]),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i2}${op}${i1}`, new BinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleLogicalANDList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexEqualityList', function () {
    for (const [input, expected] of ComplexEqualityList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexLogicalANDList: [string, any][] = [
    ...SimpleIsLogicalANDList.map(([i1, e1]) => [`${i1}&&a`, new BinaryExpression('&&', e1, $a)] as [string, any]),
    ...SimpleEqualityList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i2}&&${i1}`, new BinaryExpression('&&', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new BinaryExpression(e2.operation, new BinaryExpression('&&', new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression('&&', e1.right, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalANDList', function () {
    for (const [input, expected] of ComplexLogicalANDList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexLogicalORList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => [`${i1}||a`, new BinaryExpression('||', e1, $a)] as [string, any]),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i2}||${i1}`, new BinaryExpression('||', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new BinaryExpression(e2.operation, new BinaryExpression('||', new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleConditionalList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new ConditionalExpression(e1.condition, e1.yes, new BinaryExpression(e2.operation, new BinaryExpression('||', e1.no, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalORList', function () {
    for (const [input, expected] of ComplexLogicalORList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexConditionalList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => [`${i1}?0:1`, new ConditionalExpression(e1, $num0, $num1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`0?1:${i1}`, new ConditionalExpression($num0, $num1, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`0?${i1}:1`, new ConditionalExpression($num0, e1, $num1)] as [string, any]),
    ...SimpleConditionalList.map(([i1, e1]) => [`${i1}?0:1`, new ConditionalExpression(e1.condition, e1.yes, new ConditionalExpression(e1.no, $num0, $num1))] as [string, any])
  ];
  describe('parse ComplexConditionalList', function () {
    for (const [input, expected] of ComplexConditionalList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAssignList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => [`a=${i1}`, new AssignExpression($a, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`a=b=${i1}`, new AssignExpression($a, new AssignExpression($b, e1))] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}=a`, new AssignExpression(e1, $a)] as [string, any]),
    ...SimpleAccessMemberList.map(([i1, e1]) => [`${i1}=a`, new AssignExpression(e1, $a)] as [string, any]),
    ...SimpleAccessKeyedList.map(([i1, e1]) => [`${i1}=a`, new AssignExpression(e1, $a)] as [string, any]),
    ...SimpleAssignList.map(([i1, e1]) => [`${i1}=c`, new AssignExpression(e1.target, new AssignExpression(e1.value, $c))] as [string, any])
  ];
  describe('parse ComplexAssignList', function () {
    for (const [input, expected] of ComplexAssignList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexValueConverterList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a`, new ValueConverterExpression(e1, 'a', [])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}`, new ValueConverterExpression(e1, 'a', [e1])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, new ValueConverterExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b`, new ValueConverterExpression(new ValueConverterExpression(e1, 'a', []), 'b', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b|c`, new ValueConverterExpression(new ValueConverterExpression(new ValueConverterExpression(e1, 'a', []), 'b', []), 'c', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, new ValueConverterExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}`, new ValueConverterExpression(e1, 'a', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b|c:${i1}:${i1}:${i1}`, new ValueConverterExpression(new ValueConverterExpression(new ValueConverterExpression(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b:${i1}:${i1}:${i1}|c`, new ValueConverterExpression(new ValueConverterExpression(new ValueConverterExpression(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])] as [string, any])
  ];
  describe('parse ComplexValueConverterList', function () {
    for (const [input, expected] of ComplexValueConverterList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList.map(([i1, e1]) => [`${i1}&a`, new BindingBehaviorExpression(e1, 'a', [])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b`, new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', []), 'b', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b&c`, new BindingBehaviorExpression(new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', []), 'b', []), 'c', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b&c:${i1}:${i1}:${i1}`, new BindingBehaviorExpression(new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b:${i1}:${i1}:${i1}&c`, new BindingBehaviorExpression(new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])] as [string, any])
  ];
  describe('parse ComplexBindingBehaviorList', function () {
    for (const [input, expected] of ComplexBindingBehaviorList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // #endregion

  // https://tc39.github.io/ecma262/#sec-runtime-semantics-iteratordestructuringassignmentevaluation
  describe('parse ForOfStatement', function () {
    const DAE = DestructuringAssignmentExpression;
    const DASE = DestructuringAssignmentSingleExpression;
    const DARE = DestructuringAssignmentRestExpression;
    const ASE = AccessScopeExpression;
    const AME = AccessMemberExpression;
    const PLE = PrimitiveLiteralExpression;
    const AKE = AccessKeyedExpression;
    const CSE = CallScopeExpression;
    const CME = CallMemberExpression;
    const VCE = ValueConverterExpression;
    const BBE = BindingBehaviorExpression;
    const OLE = ObjectLiteralExpression;
    const ALE = ArrayLiteralExpression;
    const oknd = ExpressionKind.ObjectDestructuringAssignment;
    const aknd = ExpressionKind.ArrayDestructuringAssignment;

    const SimpleForDeclarations: [string, any][] = [
      [`a`,           new BindingIdentifier('a')],
      [`{}`,          new DAE(oknd, [], void 0, void 0)],
      [`[]`,          new DAE(aknd, [], void 0, void 0)],
    ];

    const ame = (name: string) => new AME($this, name);
    const ake = (key: number) => new AKE($this, new PLE(key));
    const dase = (s: string | number, t: string | null = null, init: IsBindingBehavior | undefined = void 0) => typeof s === 'number'
      ? new DASE(ame(t), ake(s), init)
      : new DASE(ame(t ?? s), ame(s), init);
    const ForDeclarations: [string, any][] = [
      [`{a}`,                            new DAE(oknd, [dase('a')], void 0, void 0)],
      [`{a:a}`,                          new DAE(oknd, [dase('a')], void 0, void 0)],
      [`{a:b}`,                          new DAE(oknd, [dase('a', 'b')], void 0, void 0)],
      [`{a,b}`,                          new DAE(oknd, [dase('a'), dase('b')], void 0, void 0)],
      [`{a:a,b}`,                        new DAE(oknd, [dase('a'), dase('b')], void 0, void 0)],
      [`{a,b:b}`,                        new DAE(oknd, [dase('a'), dase('b')], void 0, void 0)],
      [`{a:b,b:a}`,                      new DAE(oknd, [dase('a', 'b'), dase('b', 'a')], void 0, void 0)],
      [`{a:a,b,c}`,                      new DAE(oknd, [dase('a'), dase('b'), dase('c')], void 0, void 0)],
      [`{a,b:b,c}`,                      new DAE(oknd, [dase('a'), dase('b'), dase('c')], void 0, void 0)],
      [`{a,b,c:c}`,                      new DAE(oknd, [dase('a'), dase('b'), dase('c')], void 0, void 0)],
      [`{a:a,b:b,c}`,                    new DAE(oknd, [dase('a'), dase('b'), dase('c')], void 0, void 0)],
      [`{a:a,b,c:c}`,                    new DAE(oknd, [dase('a'), dase('b'), dase('c')], void 0, void 0)],
      [`{a,b:b,c:c}`,                    new DAE(oknd, [dase('a'), dase('b'), dase('c')], void 0, void 0)],
      [`{a,b:ba,c:ca}`,                  new DAE(oknd, [dase('a'), dase('b', 'ba'), dase('c', 'ca')], void 0, void 0)],
      [`{a,b:{c:d,e,f=42}}`,             new DAE(oknd, [dase('a'), new DAE(oknd, [dase('c','d'), dase('e'), dase('f', null, new PLE(42))],ame('b'), void 0)], void 0, void 0)],
      [`{a,b:{c:{d,e,f=42}}}`,           new DAE(oknd, [dase('a'), new DAE(oknd, [new DAE(oknd, [dase('d'), dase('e'), dase('f', null, new PLE(42))], ame('c'), void 0)],ame('b'), void 0)], void 0, void 0)],
      [`{b:{c:d,e,f=42},a}`,             new DAE(oknd, [new DAE(oknd, [dase('c','d'), dase('e'), dase('f', null, new PLE(42))],ame('b'), void 0), dase('a')], void 0, void 0)],
      [`{b:{c:{d,e,f=42}},a}`,           new DAE(oknd, [new DAE(oknd, [new DAE(oknd, [dase('d'), dase('e'), dase('f', null, new PLE(42))], ame('c'), void 0)],ame('b'), void 0), dase('a')], void 0, void 0)],
      [`{a,b=42}`,                       new DAE(oknd, [dase('a'), dase('b', null, new PLE(42))], void 0, void 0)],
      [`{b=42,a}`,                       new DAE(oknd, [dase('b', null, new PLE(42)), dase('a')], void 0, void 0)],
      [`{a,b=42,c}`,                     new DAE(oknd, [dase('a'), dase('b', null, new PLE(42)), dase('c')], void 0, void 0)],
      [`{a,b=42,c=24}`,                  new DAE(oknd, [dase('a'), dase('b', null, new PLE(42)), dase('c', null, new PLE(24))], void 0, void 0)],
      [`{a,b:c=42}`,                     new DAE(oknd, [dase('a'), dase('b', 'c', new PLE(42))], void 0, void 0)],
      [`{a,b=p}`,                        new DAE(oknd, [dase('a'), dase('b', null, new ASE('p',0))], void 0, void 0)],
      [`{a,b=$parent.p}`,                new DAE(oknd, [dase('a'), dase('b', null, new ASE('p',1))], void 0, void 0)],
      [`{a,b=$parent.$parent.p}`,        new DAE(oknd, [dase('a'), dase('b', null, new ASE('p',2))], void 0, void 0)],
      [`{a,b=p1.p2}`,                    new DAE(oknd, [dase('a'), dase('b', null, new AME(new ASE('p1', 0),'p2'))], void 0, void 0)],
      [`{a,b=p1[0]['p2']}`,              new DAE(oknd, [dase('a'), dase('b', null, new AKE(new AKE(new ASE('p1', 0), new PLE(0)), new PLE('p2')))], void 0, void 0)],
      [`{b=p1.p2,a}`,                    new DAE(oknd, [dase('b', null, new AME(new ASE('p1', 0),'p2')), dase('a')], void 0, void 0)],
      [`{b=p1[0]['p2'],a}`,              new DAE(oknd, [dase('b', null, new AKE(new AKE(new ASE('p1', 0), new PLE(0)), new PLE('p2'))), dase('a')], void 0, void 0)],
      [`{a,b=p1[0].p2,d,c=p3.p4[1]}`,    new DAE(oknd, [dase('a'), dase('b', null, new AME(new AKE(new ASE('p1', 0), new PLE(0)), 'p2')), dase('d'), dase('c', null, new AKE(new AME(new ASE('p3', 0), 'p4'), new PLE(1)))], void 0, void 0)],
      [`{a,b=fn(x)}`,                    new DAE(oknd, [dase('a'), dase('b', null, new CSE('fn',[new ASE('x')], 0))], void 0, void 0)],
      [`{a,b=p1.fn(x)}`,                 new DAE(oknd, [dase('a'), dase('b', null, new CME(new ASE('p1', 0), 'fn', [new ASE('x')]))], void 0, void 0)],
      [`{b=fn(x),a}`,                    new DAE(oknd, [dase('b', null, new CSE('fn',[new ASE('x')], 0)), dase('a')], void 0, void 0)],
      [`{b=p1.fn(x),a}`,                 new DAE(oknd, [dase('b', null, new CME(new ASE('p1', 0), 'fn', [new ASE('x')])), dase('a'),], void 0, void 0)],
      [`{a,b=x|vc:a1}`,                  new DAE(oknd, [dase('a'), dase('b', null, new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)]))], void 0, void 0)],
      [`{b=x|vc:a1,a}`,                  new DAE(oknd, [dase('b', null, new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)])),dase('a'),], void 0, void 0)],
      [`{a,b=x|vc:a1,c}`,                new DAE(oknd, [dase('a'), dase('b', null, new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)])), dase('c')], void 0, void 0)],
      [`{a,b=x|vc:a1:a2,c:d}`,           new DAE(oknd, [dase('a'), dase('b', null, new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0),new ASE('a2', 0)])), dase('c', 'd')], void 0, void 0)],
      [`{b=x|vc}`,                       new DAE(oknd, [dase('b', null, new VCE(new ASE('x', 0), 'vc', []))], void 0, void 0)],
      [`{b=x|vc:a1:a2}`,                 new DAE(oknd, [dase('b', null, new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0),new ASE('a2', 0)]))], void 0, void 0)],
      [`{a,b=x&bb:a1}`,                  new DAE(oknd, [dase('a'), dase('b', null, new BBE(new ASE('x', 0), 'bb', [new ASE('a1', 0)]))], void 0, void 0)],
      [`{a,b=x&bb:a1:a2,c:d}`,           new DAE(oknd, [dase('a'), dase('b', null, new BBE(new ASE('x', 0), 'bb', [new ASE('a1', 0), new ASE('a2', 0)])), dase('c', 'd')], void 0, void 0)],
      [`{b=x&bb}`,                       new DAE(oknd, [dase('b', null, new BBE(new ASE('x', 0), 'bb', []))], void 0, void 0)],
      [`{b=x&bb:a1:a2}`,                 new DAE(oknd, [dase('b', null, new BBE(new ASE('x', 0), 'bb', [new ASE('a1', 0), new ASE('a2', 0)]))], void 0, void 0)],
      [`{a,b=x|vc:a1&bb:a2}`,            new DAE(oknd, [dase('a'), dase('b', null, new BBE(new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)]), 'bb', [new ASE('a2', 0)]))], void 0, void 0)],
      [`{a,b={c:1}}`,                    new DAE(oknd, [dase('a'), dase('b', null, new OLE(['c'], [new PLE(1)]))], void 0, void 0)],
      [`{a,b={c:1, d:{e:2}}}`,           new DAE(oknd, [dase('a'), dase('b', null, new OLE(['c', 'd'], [new PLE(1), new OLE(['e'], [new PLE(2)])]))], void 0, void 0)],
      [`{a,b=[1,2]}`,                    new DAE(oknd, [dase('a'), dase('b', null, new ALE([new PLE(1), new PLE(2)]))], void 0, void 0)],
      [`{a,b=[[1,2],[3,4]]}`,            new DAE(oknd, [dase('a'), dase('b', null, new ALE([new ALE([new PLE(1), new PLE(2)]), new ALE([new PLE(3), new PLE(4)])]))], void 0, void 0)],
      [`{a,b={c:1},c}`,                  new DAE(oknd, [dase('a'), dase('b', null, new OLE(['c'], [new PLE(1)])), dase('c')], void 0, void 0)],
      [`{a,b={c:1, d:{e:2}},c}`,         new DAE(oknd, [dase('a'), dase('b', null, new OLE(['c', 'd'], [new PLE(1), new OLE(['e'], [new PLE(2)])])), dase('c')], void 0, void 0)],
      [`{a,b={c:1, d:{e:2,f:{g:3}}},c}`, new DAE(oknd, [dase('a'), dase('b', null, new OLE(['c', 'd'], [new PLE(1), new OLE(['e','f'], [new PLE(2),new OLE(['g'],[new PLE(3)])])])), dase('c')], void 0, void 0)],
      [`{a,b=[1,2],c}`,                  new DAE(oknd, [dase('a'), dase('b', null, new ALE([new PLE(1), new PLE(2)])), dase('c')], void 0, void 0)],
      [`{a,b=[[1,2],[3,4]],c}`,          new DAE(oknd, [dase('a'), dase('b', null, new ALE([new ALE([new PLE(1), new PLE(2)]), new ALE([new PLE(3), new PLE(4)])])), dase('c')], void 0, void 0)],
      [`{a,b=[1,[2,3],[[4,5],[6,7]]],c}`,new DAE(oknd, [dase('a'), dase('b', null, new ALE([new PLE(1), new ALE([new PLE(2), new PLE(3)]), new ALE([new ALE([new PLE(4), new PLE(5)]), new ALE([new PLE(6), new PLE(7)])])])), dase('c')], void 0, void 0)],
      [`{a,b={c:1,d:[2,3]}}`,            new DAE(oknd, [dase('a'), dase('b', null, new OLE(['c','d'], [new PLE(1), new ALE([new PLE(2), new PLE(3)])]))], void 0, void 0)],
      [`{a,b=[1,{c:1}]}`,                new DAE(oknd, [dase('a'), dase('b', null, new ALE([new PLE(1), new OLE(['c'],[new PLE(1)])]))], void 0, void 0)],
      [`{...r}`,                         new DAE(oknd, [new DARE(ame('r'), [])], void 0, void 0)],
      [`{a,...r}`,                       new DAE(oknd, [dase('a'), new DARE(ame('r'), ['a'])], void 0, void 0)],
      [`{a,b=42,...r}`,                  new DAE(oknd, [dase('a'), dase('b', null, new PLE(42)), new DARE(ame('r'), ['a', 'b'])], void 0, void 0)],
      [`{a,b:c={p:1}}`,                  new DAE(oknd, [dase('a'), dase('b', 'c', new OLE(['p'],[new PLE(1)]))], void 0, void 0)],
      [`{a,b:{c}={c:1}}`,                new DAE(oknd, [dase('a'), new DAE(oknd, [dase('c')], ame('b'), new OLE(['c'], [new PLE(1)]))], void 0, void 0)], // todo: need something to hold the default value
      [`[,]`,                            new DAE(aknd, [], void 0, void 0)],
      [`[,,]`,                           new DAE(aknd, [], void 0, void 0)],
      [`[,,,]`,                          new DAE(aknd, [], void 0, void 0)],
      [`[a,]`,                           new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
      [`[a,,]`,                          new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
      [`[a,a,]`,                         new DAE(aknd, [dase(0, 'a'), dase(1, 'a')], void 0, void 0)],
      [`[a,,]`,                          new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
      [`[a,,,]`,                         new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
      [`[a,a,,]`,                        new DAE(aknd, [dase(0, 'a'), dase(1, 'a')], void 0, void 0)],
      [`[,a]`,                           new DAE(aknd, [dase(1, 'a')], void 0, void 0)],
      [`[,a,]`,                          new DAE(aknd, [dase(1, 'a')], void 0, void 0)],
      [`[,a,,]`,                         new DAE(aknd, [dase(1, 'a')], void 0, void 0)],
      [`[,a,a,]`,                        new DAE(aknd, [dase(1, 'a'), dase(2, 'a')], void 0, void 0)],
      [`[,,a]`,                          new DAE(aknd, [dase(2, 'a')], void 0, void 0)],
      [`[,a,a]`,                         new DAE(aknd, [dase(1, 'a'), dase(2, 'a')], void 0, void 0)],
      [`[,,a,]`,                         new DAE(aknd, [dase(2, 'a')], void 0, void 0)],
      [`[,,,a]`,                         new DAE(aknd, [dase(3, 'a')], void 0, void 0)],
      [`[,,a,a]`,                        new DAE(aknd, [dase(2, 'a'), dase(3, 'a')], void 0, void 0)],
      [`[a,b]`,                          new DAE(aknd, [dase(0, 'a'), dase(1, 'b')], void 0, void 0)],
      [`[a,,b]`,                         new DAE(aknd, [dase(0, 'a'), dase(2, 'b')], void 0, void 0)],
      [`[a,[b,c]]`,                      new DAE(aknd, [dase(0, 'a'), new DAE(aknd, [dase(0, 'b'), dase(1, 'c')], ake(1), void 0)], void 0, void 0)],
      [`[a,[b,[c]]]`,                    new DAE(aknd, [dase(0, 'a'), new DAE(aknd, [dase(0, 'b'), new DAE(aknd, [dase(0, 'c')], ake(1), void 0)], ake(1), void 0)], void 0, void 0)],
      [`[a,b=42]`,                       new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new PLE(42))], void 0, void 0)],
      [`[a,b=42,c]`,                     new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new PLE(42)), dase(2, 'c')], void 0, void 0)],
      [`[b=42,a]`,                       new DAE(aknd, [dase(0, 'b', new PLE(42)), dase(1, 'a')], void 0, void 0)],
      [`[a,b=p]`,                        new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ASE('p', 0))], void 0, void 0)],
      [`[a,b=$parent.p]`,                new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ASE('p', 1))], void 0, void 0)],
      [`[a,b=$parent.$parent.p]`,        new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ASE('p', 2))], void 0, void 0)],
      [`[a,b=p1.p2]`,                    new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new AME(new ASE('p1', 0),'p2'))], void 0, void 0)],
      [`[b=p1[0]['p2']]`,                new DAE(aknd, [dase(0, 'b', new AKE(new AKE(new ASE('p1', 0), new PLE(0)), new PLE('p2')))], void 0, void 0)],
      [`[a,b=p1[0]['p2']]`,              new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new AKE(new AKE(new ASE('p1', 0), new PLE(0)), new PLE('p2')))], void 0, void 0)],
      [`[b=p1.p2,a]`,                    new DAE(aknd, [dase(0, 'b', new AME(new ASE('p1', 0),'p2')), dase(1, 'a')], void 0, void 0)],
      [`[b=p1[0]['p2'],a]`,              new DAE(aknd, [dase(0, 'b', new AKE(new AKE(new ASE('p1', 0), new PLE(0)), new PLE('p2'))), dase(1, 'a')], void 0, void 0)],
      [`[a,b=p1[0].p2,d,c=p3.p4[1]]`,    new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new AME(new AKE(new ASE('p1', 0), new PLE(0)), 'p2')), dase(2, 'd'), dase(3, 'c', new AKE(new AME(new ASE('p3', 0), 'p4'), new PLE(1)))], void 0, void 0)],
      [`[a,b=fn(x)]`,                    new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new CSE('fn',[new ASE('x')], 0))], void 0, void 0)],
      [`[a,b=p1.fn(x)]`,                 new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new CME(new ASE('p1', 0), 'fn', [new ASE('x')]))], void 0, void 0)],
      [`[b=fn(x),a]`,                    new DAE(aknd, [dase(0, 'b', new CSE('fn',[new ASE('x')], 0)), dase(1, 'a')], void 0, void 0)],
      [`[b=p1.fn(x),a]`,                 new DAE(aknd, [dase(0, 'b', new CME(new ASE('p1', 0), 'fn', [new ASE('x')])), dase(1, 'a'),], void 0, void 0)],
      [`[a,b=x|vc:a1]`,                  new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)]))], void 0, void 0)],
      [`[b=x|vc:a1,a]`,                  new DAE(aknd, [dase(0, 'b', new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)])),dase(1, 'a'),], void 0, void 0)],
      [`[a,b=x|vc:a1,c]`,                new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)])), dase(2, 'c')], void 0, void 0)],
      [`[a,b=x|vc:a1:a2,c]`,             new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0),new ASE('a2', 0)])), dase(2, 'c')], void 0, void 0)],
      [`[b=x|vc]`,                       new DAE(aknd, [dase(0, 'b', new VCE(new ASE('x', 0), 'vc', []))], void 0, void 0)],
      [`[b=x|vc:a1:a2]`,                 new DAE(aknd, [dase(0, 'b', new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0),new ASE('a2', 0)]))], void 0, void 0)],
      [`[a,b=x&bb:a1]`,                  new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new BBE(new ASE('x', 0), 'bb', [new ASE('a1', 0)]))], void 0, void 0)],
      [`[a,b=x&bb:a1:a2,c]`,             new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new BBE(new ASE('x', 0), 'bb', [new ASE('a1', 0), new ASE('a2', 0)])), dase(2, 'c')], void 0, void 0)],
      [`[b=x&bb]`,                       new DAE(aknd, [dase(0, 'b', new BBE(new ASE('x', 0), 'bb', []))], void 0, void 0)],
      [`[b=x&bb:a1:a2]`,                 new DAE(aknd, [dase(0, 'b', new BBE(new ASE('x', 0), 'bb', [new ASE('a1', 0), new ASE('a2', 0)]))], void 0, void 0)],
      [`[a,b=x|vc:a1&bb:a2]`,            new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new BBE(new VCE(new ASE('x', 0), 'vc', [new ASE('a1', 0)]), 'bb', [new ASE('a2', 0)]))], void 0, void 0)],
      [`[a,b={c:1}]`,                    new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new OLE(['c'], [new PLE(1)]))], void 0, void 0)],
      [`[a,b={c:1, d:{e:2}}]`,           new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new OLE(['c', 'd'], [new PLE(1), new OLE(['e'], [new PLE(2)])]))], void 0, void 0)],
      [`[a,b=[1,2]]`,                    new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ALE([new PLE(1), new PLE(2)]))], void 0, void 0)],
      [`[a,b=[[1,2],[3,4]]]`,            new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ALE([new ALE([new PLE(1), new PLE(2)]), new ALE([new PLE(3), new PLE(4)])]))], void 0, void 0)],
      [`[a,b={c:1},c]`,                  new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new OLE(['c'], [new PLE(1)])), dase(2, 'c')], void 0, void 0)],
      [`[a,b={c:1, d:{e:2}},c]`,         new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new OLE(['c', 'd'], [new PLE(1), new OLE(['e'], [new PLE(2)])])), dase(2, 'c')], void 0, void 0)],
      [`[a,b={c:1, d:{e:2,f:{g:3}}},c]`, new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new OLE(['c', 'd'], [new PLE(1), new OLE(['e','f'], [new PLE(2),new OLE(['g'],[new PLE(3)])])])), dase(2, 'c')], void 0, void 0)],
      [`[a,b=[1,2],c]`,                  new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ALE([new PLE(1), new PLE(2)])), dase(2, 'c')], void 0, void 0)],
      [`[a,b=[[1,2],[3,4]],c]`,          new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ALE([new ALE([new PLE(1), new PLE(2)]), new ALE([new PLE(3), new PLE(4)])])), dase(2, 'c')], void 0, void 0)],
      [`[a,b=[1,[2,3],[[4,5],[6,7]]],c]`,new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ALE([new PLE(1), new ALE([new PLE(2), new PLE(3)]), new ALE([new ALE([new PLE(4), new PLE(5)]), new ALE([new PLE(6), new PLE(7)])])])), dase(2, 'c')], void 0, void 0)],
      [`[a,b={c:1,d:[2,3]}]`,            new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new OLE(['c','d'], [new PLE(1), new ALE([new PLE(2), new PLE(3)])]))], void 0, void 0)],
      [`[a,b=[1,{c:1}]]`,                new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new ALE([new PLE(1), new OLE(['c'],[new PLE(1)])]))], void 0, void 0)],
      [`[...r]`,                         new DAE(aknd, [new DARE(ame('r'), 0)], void 0, void 0)],
      [`[a,...r]`,                       new DAE(aknd, [dase(0, 'a'), new DARE(ame('r'), 1)], void 0, void 0)],
      [`[a,b=42,...r]`,                  new DAE(aknd, [dase(0, 'a'), dase(1, 'b', new PLE(42)), new DARE(ame('r'), 2)], void 0, void 0)],
    ];

    const ForOfStatements: [string, any][] = [
      ...SimpleForDeclarations.map(([decInput, decExpr]) => [
        ...SimpleIsBindingBehaviorList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr)])
      ] as [string, any][]).reduce((a, c) => a.concat(c)),
      ...ForDeclarations.map(([decInput, decExpr]) => [
        ...AccessScopeList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr)])
      ] as [string, any][]).reduce((a, c) => a.concat(c))
    ];

    for (const [input, expected] of ForOfStatements) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, ExpressionType.IsIterator), expected);
      });
    }

    const InvalidForDeclarations: [string, number][] = [
      ['(',0],
      ['{',0],
      ['[',0],
      [')',0],
      ['}',0],
      [']',0],
      ['({a}',3],
      ['({a}',3],
      ['({a}',3],
      ['([a]',3],
      ['([a]',3],
      ['([a]',3],
      ['{a})',3],
      ['{a}}',3],
      ['{a}]',3],
      ['[a])',3],
      ['[a]}',3],
      ['[a]]',3],
      ['{...rest,}', 8],
      ['{...rest,b}', 8],
      ['{a,...rest,b}',9],
      ['[...rest,]',8],
      ['[...rest,b]',8],
      ['[a,...rest,b]',9],
      ['[a:b]',2],
      ['{a,,b}',3],
      ['{...rest={p:1}}={}',8],
      ['[...rest={p:1}]=[]',8],
      ['{a:b:c}={}', 4]
    ];
    for(const [[decInput, index],[forInput]] of generateCartesianProduct([InvalidForDeclarations, AccessScopeList])) {
      const input = `${decInput} of ${forInput}`;
      it(`invalid repeat.for expression cannot be parsed: ${input}`, function () {
        assert.throws(
          () => parseExpression(input, ExpressionType.IsIterator),
          `Unexpected '${input[index]}' at position ${index} for destructuring assignment in ${input}`
        );
      });
    }
  });

  const InterpolationList: [string, any][] = [
    [`a`,                       null],
    [`\\\${a`,                  null],
    [`\\\${a}`,                 null],
    [`\\\${a}\\\${a}`,          null],
    [`$a`,                      null],
    [`$a$a`,                    null],
    [`$\\{a`,                   null],
    [`\${a}\${b}`,              new Interpolation(['', '', ''],                       [$a, $b])],
    [`a\${a}\${b}`,             new Interpolation(['a', '', ''],                      [$a, $b])],
    [`\${a}a\${b}`,             new Interpolation(['', 'a', ''],                      [$a, $b])],
    [`a\${a}a\${b}`,            new Interpolation(['a', 'a', ''],                     [$a, $b])],
    [`\${a}\${b}a`,             new Interpolation(['', '', 'a'],                      [$a, $b])],
    [`\${a}a\${b}a`,            new Interpolation(['', 'a', 'a'],                     [$a, $b])],
    [`a\${a}a\${b}a`,           new Interpolation(['a', 'a', 'a'],                    [$a, $b])],
    [`\${\`\${a}\`}`,           new Interpolation(['', ''], [new TemplateExpression(['', ''],   [$a])])],
    [`\${\`a\${a}\`}`,          new Interpolation(['', ''], [new TemplateExpression(['a', ''],  [$a])])],
    [`\${\`\${a}a\`}`,          new Interpolation(['', ''], [new TemplateExpression(['', 'a'],  [$a])])],
    [`\${\`a\${a}a\`}`,         new Interpolation(['', ''], [new TemplateExpression(['a', 'a'], [$a])])],
    [`\${\`\${\`\${a}\`}\`}`,   new Interpolation(['', ''], [new TemplateExpression(['', ''], [new TemplateExpression(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]): [string, any][] => [
      [`${raw}`,                null],
      [`\${a}${raw}`,           new Interpolation(['', cooked],        [$a])],
      [`${raw}\${a}`,           new Interpolation([cooked, ''],        [$a])],
      [`${raw}\${a}${raw}`,     new Interpolation([cooked, cooked],    [$a])],
      [`\${a}${raw}\${a}`,      new Interpolation(['', cooked, ''],    [$a, $a])],
    ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\${${input}}`, new Interpolation(['', ''], [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\${${input}}\${${input}}`, new Interpolation(['', '', ''], [expr, expr])] as [string, any])
  ];
  describe('parse Interpolation', function () {
    for (const [input, expected] of InterpolationList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, ExpressionType.Interpolation as any), expected);
      });
    }
  });

  describe('parse unicode IdentifierStart', function () {
    for (const char of latin1IdentifierStartChars) {
      it(char, function () {
        assert.deepStrictEqual(parseExpression(char), new AccessScopeExpression(char, 0));
      });
    }
  });

  describe('parse unicode IdentifierPart', function () {
    for (const char of latin1IdentifierPartChars) {
      it(char, function () {
        const identifier = `$${char}`;
        assert.deepStrictEqual(parseExpression(identifier), new AccessScopeExpression(identifier, 0));
      });
    }
  });

  describe('Errors', function () {
    for (const input of [
      ')', '}', ']', '%', '*',
      ',', '/', ':', '>', '<',
      '=', '?', 'of', 'instanceof', 'in', ' '
    ]) {
      it(`throw 'Invalid start of expression' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0151');
        // verifyResultOrError(input, null, 'Invalid start of expression');
      });
    }

    for (const input of ['..', '...', '..a', '...a', '..1', '...1', '.a.', '.a..']) {
      it(`throw 'Unconsumed token' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0156');
        // verifyResultOrError(input, null, 'Unconsumed token');
      });
    }
    it(`throw 'Unconsumed token' on "$this!"`, function () {
      verifyResultOrError(`$this!`, null, 'AUR0162');
      // verifyResultOrError(`$this!`, null, 'Unconsumed token');
    });
    for (const [input] of SimpleIsAssignList) {
      for (const op of [')', ']', '}']) {
        it(`throw 'Unconsumed token' on "${input}${op}"`, function () {
          verifyResultOrError(`${input}${op}`, null, 'AUR0162');
          // verifyResultOrError(`${input}${op}`, null, 'Unconsumed token');
        });
      }
    }

    for (const start of ['$parent', '$parent.$parent']) {
      for (const middle of ['..', '...']) {
        for (const end of ['', 'bar', '$parent']) {
          const expr = `${start}${middle}${end}`;
          it(`throw 'Double dot and spread operators are not supported' on "${expr}"`, function () {
            verifyResultOrError(expr, null, 'AUR0152');
            // verifyResultOrError(expr, null, 'Double dot and spread operators are not supported');
          });
        }
      }
    }

    for (const nonTerminal of ['!', ' of', ' typeof', '=']) {
      it(`throw 'Invalid member expression' on "$parent${nonTerminal}"`, function () {
        verifyResultOrError(`$parent${nonTerminal}`, null, 'AUR0154');
        // verifyResultOrError(`$parent${nonTerminal}`, null, 'Invalid member expression');
      });
    }

    for (const op of ['!', '(', '+', '-', '.', '[', 'typeof']) {
      it(`throw 'Unexpected end of expression' on "${op}"`, function () {
        verifyResultOrError(op, null, 'AUR0155');
        // verifyResultOrError(op, null, 'Unexpected end of expression');
      });
    }

    for (const [input, expr] of SimpleIsLeftHandSideList) {
      it(`throw 'Expected identifier' on "${input}."`, function () {
        if (typeof expr['value'] !== 'number' || input.includes('.')) { // only non-float numbers are allowed to end on a dot
          verifyResultOrError(`${input}.`, null, 'AUR0153');
          // verifyResultOrError(`${input}.`, null, 'Expected identifier');
        } else {
          verifyResultOrError(`${input}.`, expr, null);
        }
      });
    }

    for (const [input] of SimpleIsNativeLeftHandSideList) {
      for (const dots of ['..', '...']) {
        it(`throw 'Expected identifier' on "${input}${dots}"`, function () {
          verifyResultOrError(`${input}${dots}`, null, 'AUR0153');
          // verifyResultOrError(`${input}${dots}`, null, 'Expected identifier');
        });
      }
    }
    for (const input of ['.1.', '.1..']) {
      it(`throw'Expected identifier' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0153');
        // verifyResultOrError(input, null, 'Expected identifier');
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList) {
      it(`throw 'Invalid BindingIdentifier at left hand side of "of"' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0163', ExpressionType.IsIterator);
        // verifyResultOrError(input, null, 'Invalid BindingIdentifier at left hand side of "of"', ExpressionType.IsIterator);
      });
    }
    for (const [input] of [
      [`a`, new BindingIdentifier('a')]
    ] as [string, any][]) {
      it(`throw 'Invalid BindingIdentifier at left hand side of "of"' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0163', ExpressionType.IsIterator);
        // verifyResultOrError(input, null, 'Invalid BindingIdentifier at left hand side of "of"', ExpressionType.IsIterator);
      });
    }

    for (const input of ['{', '{[]}', '{[}', '{[a]}', '{[a}', '{{', '{(']) {
      it(`throw 'Invalid or unsupported property definition in object literal' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0164');
        // verifyResultOrError(input, null, 'Invalid or unsupported property definition in object literal');
      });
    }

    for (const input of ['"', '\'']) {
      it(`throw 'Unterminated quote in string literal' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0165');
        // verifyResultOrError(input, null, 'Unterminated quote in string literal');
      });
    }

    for (const input of ['`', '` ', `\`\${a}`]) {
      it(`throw 'Unterminated template string' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0166');
        // verifyResultOrError(input, null, 'Unterminated template string');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      for (const op of ['(', '[']) {
        it(`throw 'Missing expected token' on "${op}${input}"`, function () {
          verifyResultOrError(`${op}${input}`, null, 'AUR0167');
          // verifyResultOrError(`${op}${input}`, null, 'Missing expected token');
        });
      }
    }
    for (const [input] of SimpleIsConditionalList) {
      it(`throw 'Missing expected token' on "${input}?${input}"`, function () {
        verifyResultOrError(`${input}?${input}`, null, 'AUR0167');
        // verifyResultOrError(`${input}?${input}`, null, 'Missing expected token');
      });
    }
    for (const [input] of AccessScopeList) {
      it(`throw 'Missing expected token' on "{${input}"`, function () {
        verifyResultOrError(`{${input}`, null, 'AUR0167');
        // verifyResultOrError(`{${input}`, null, 'Missing expected token');
      });
    }
    for (const [input] of SimpleStringLiteralList) {
      it(`throw 'Missing expected token' on "{${input}}"`, function () {
        verifyResultOrError(`{${input}}`, null, `AUR0167`);
        // verifyResultOrError(`{${input}}`, null, 'Missing expected token');
      });
    }
    for (const input of ['{24}', '{24, 24}', '{\'\'}', '{a.b}', '{a[b]}', '{a()}']) {
      it(`throw 'Missing expected token' on "${input}"`, function () {
        verifyResultOrError(input, null, `AUR0167:${input}`);
        // verifyResultOrError(input, null, 'Missing expected token');
      });
    }

    for (const input of ['#', ';', '@', '^', '~', '\\', 'foo;']) {
      it(`throw 'Unexpected character' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0168');
        // verifyResultOrError(input, null, 'Unexpected character');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw 'Expected identifier to come after ValueConverter operator' on "${input}|"`, function () {
        verifyResultOrError(`${input}|`, null, 'AUR0159');
        // verifyResultOrError(`${input}|`, null, 'Expected identifier to come after ValueConverter operator');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw 'Expected identifier to come after BindingBehavior operator' on "${input}&"`, function () {
        verifyResultOrError(`${input}&`, null, 'AUR0160');
        // verifyResultOrError(`${input}&`, null, 'Expected identifier to come after BindingBehavior operator');
      });
    }

    for (const [input] of [
      [`$this`, $this],
      ...SimpleLiteralList,
      ...SimpleUnaryList
    ]) {
      it(`throw 'Left hand side of expression is not assignable' on "${input}=a"`, function () {
        verifyResultOrError(`${input}=a`, null, `AUR0158:${input}=a`);
        // verifyResultOrError(`${input}=a`, null, 'Left hand side of expression is not assignable');
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList.filter(([, e]) => !e.ancestor)) {
      it(`throw 'Unexpected keyword "of"' on "${input} of"`, function () {
        verifyResultOrError(`${input} of`, null, 'AUR0161');
        // verifyResultOrError(`${input} of`, null, 'Unexpected keyword "of"');
      });
    }
  });

  describe('unknown unicode IdentifierPart', function () {
    for (const char of otherBMPIdentifierPartChars) {
      it(char, function () {
        const identifier = `$${char}`;
        verifyResultOrError(identifier, null, 'AUR0168');
        // verifyResultOrError(identifier, null, 'Unexpected character');
      });
    }
  });
});
