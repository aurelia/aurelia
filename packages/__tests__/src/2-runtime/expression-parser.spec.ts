/* eslint-disable @typescript-eslint/no-loss-of-precision */
import {
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  AccessThisExpression,
  ArrayLiteralExpression,
  AssignExpression,
  BinaryExpression,
  BinaryOperator,
  AssignmentOperator,
  BindingBehaviorExpression,
  BindingIdentifier,
  type ExpressionType,
  CallFunctionExpression,
  CallMemberExpression,
  CallScopeExpression,
  ConditionalExpression,
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
  parseExpression,
  DestructuringAssignmentExpression,
  DestructuringAssignmentSingleExpression,
  IsBindingBehavior,
  ArrowFunction,
  AccessBoundaryExpression,
  NewExpression,
  PrimitiveLiteral,
  Template,
  ArrayLiteral,
  ObjectLiteral,
  createAccessScopeExpression,
  createAccessThisExpression,
  createAccessMemberExpression,
  createAccessKeyedExpression,
  createPrimitiveLiteral,
  createTemplateExpression,
  createTaggedTemplateExpression,
  createCallFunctionExpression,
  createCallScopeExpression,
  createCallMemberExpression,
  createUnaryExpression,
  createBinaryExpression,
  createConditionalExpression,
  createAssignExpression,
  createValueConverterExpression,
  createBindingBehaviorExpression,
  createInterpolation,
  createForOfStatement,
  createArrayLiteralExpression,
  createObjectLiteralExpression,
  createDestructuringAssignmentExpression,
  createDestructuringAssignmentSingleExpression,
  createDestructuringAssignmentRestExpression,
  createArrayBindingPattern,
  createObjectBindingPattern,
  createBindingIdentifier,
  createArrowFunction,
  createAccessBoundaryExpression,
  createNewExpression,
} from '@aurelia/expression-parser';
import {
  assert,
} from '@aurelia/testing';
import {
  latin1IdentifierPartChars,
  latin1IdentifierStartChars,
  otherBMPIdentifierPartChars
} from './unicode.js';

function createTaggedTemplate(cooked: string[], func: IsLeftHandSide, expressions?: readonly IsAssign[]): TaggedTemplateExpression {
  return createTaggedTemplateExpression(cooked, cooked, func, expressions);
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
const binaryAssignment: AssignmentOperator[] = ['/=', '*=', '+=', '-='];

const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
const $str = PrimitiveLiteral.$empty;
const $tpl = Template.$empty;
const $arr = ArrayLiteral.$empty;
const $obj = ObjectLiteral.$empty;
const $this = createAccessThisExpression(0);
const $parent = createAccessThisExpression(1);
const boundary = createAccessBoundaryExpression();

const $a = createAccessScopeExpression('a');
const $b = createAccessScopeExpression('b');
const $c = createAccessScopeExpression('c');
const $num0 = createPrimitiveLiteral(0);
const $num1 = createPrimitiveLiteral(1);

function verifyResultOrError(expr: string, expected: any, expectedMsg?: string, exprType?: ExpressionType, name?: string): any {
  let error: Error = null;
  let actual: any = null;
  try {
    actual = parseExpression(expr, exprType as any);
  } catch (e) {
    error = e;
  }
  if (expectedMsg == null) {
    if (error == null) {
      assert.deepStrictEqual(actual, expected, expr);
    } else {
      throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${exprType} parse successfully, but it threw "${error.message}"`);
    }
  } else {
    if (error == null) {
      throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${exprType} to throw "${expectedMsg}", but no error was thrown`);
    } else {
      if (!error.message.startsWith(expectedMsg)) {
        throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${exprType} to throw "${expectedMsg}", but got "${error.message}" instead`);
      }
    }
  }
}

// Note: we could loop through all generated tests by picking SimpleIsBindingBehaviorList and ComplexIsBindingBehaviorList,
// but we're separating them out to make the test suites more granular for debugging and reporting purposes
describe('2-runtime/expression-parser.spec.ts', function () {

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
    [`$parent.$parent`,   createAccessThisExpression(2)]
  ];
  const AccessBoundaryList: [string, any][] = [
    [`this`,             boundary],
  ];
  // 2. parsePrimaryExpression.IdentifierName
  const AccessScopeList: [string, any][] = [
    ...AccessThisList.map(([input, expr]) => [`${input}.a`, createAccessScopeExpression('a', expr.ancestor)] as [string, any]),
    [`$this.$parent`,     createAccessScopeExpression('$parent')],
    [`$parent.$this`,     createAccessScopeExpression('$this', 1)],
    [`a`,                 $a]
  ];
  // 3. parsePrimaryExpression.Literal
  const SimpleStringLiteralList: [string, any][] = [
    [`''`,                $str],
    [`""`,                $str]
  ];
  const SimpleNumberLiteralList: [string, any][] = [
    [`1`,                 $num1],
    [`1.1`,               createPrimitiveLiteral(1.1)],
    [`.1`,                createPrimitiveLiteral(0.1)],
    [`0.1`,               createPrimitiveLiteral(0.1)]
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
    [`\`\${a}\``,         createTemplateExpression(['', ''], [$a])]
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
    [`(a[b])`,            createAccessKeyedExpression($a, $b)],
    [`(a?.[b])`,          createAccessKeyedExpression($a, $b, true)],
    [`(a.b)`,             createAccessMemberExpression($a, 'b')],
    [`(a?.b)`,            createAccessMemberExpression($a, 'b', true)],
    [`(a\`\`)`,           createTaggedTemplate([''], $a, [])],
    [`($this())`,         createCallFunctionExpression($this, [])],
    [`(a())`,             createCallScopeExpression('a', [])],
    [`(a?.())`,           createCallScopeExpression('a', [], 0, true)],
    [`(!a)`,              createUnaryExpression('!', $a)],
    [`(a+b)`,             createBinaryExpression('+', $a, $b)],
    [`(a?b:c)`,           createConditionalExpression($a, $b, createAccessScopeExpression('c'))],
    [`(a=b)`,             createAssignExpression($a, $b)],
    [`(a=>a)`,            createArrowFunction([createBindingIdentifier('a')], $a)],
    [`({})`,              createObjectLiteralExpression([], [])],
    [`({a})`,             createObjectLiteralExpression(['a'], [$a])],
  ];
  // 8. parsePrimaryExpression.NewExpression
  const SimpleNewList: [string, any][] = [
    [`new a()`,           createNewExpression($a, [])],
    [`new a`,             createNewExpression($a, [])],
    [`new a(b)`,          createNewExpression($a, [$b])],
    [`new (a)()`,         createNewExpression($a, [])],
    [`new a.b()`,         createNewExpression(createAccessMemberExpression($a, 'b'), [])],
    [`new a.b`,           createNewExpression(createAccessMemberExpression($a, 'b'), [])],
    [`new new a()`,       createNewExpression(createNewExpression($a, []), [])],
    [`new a(new a())`,    createNewExpression($a, [createNewExpression($a, [])])],
  ];
  // concatenation of 1 through 8 (all Primary expressions)
  // This forms the group Precedence.Primary
  const SimplePrimaryList: [string, any][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...SimpleLiteralList,
    ...SimpleParenthesizedList,
    // todo: this line adds 3.904 tests, 1.278 of which fail due to specific early errors and restriction in complex variadic expressions, nested tagged templates, etc.
    // Most of the work in correcting this is to put the correct test cases from "passing" to "failing" and vice versa, that is, the parser itself works correctly but the tests are too generic.
    // We will need a fairly significant review of the tests to make all edge cases pass.
    // Examples include things like this: new new a()`${a}`&a:new new a()`${a}`:new new a()`${a}`
    // ...SimpleNewList
  ];
  // 1. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  const SimpleAccessKeyedList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}[b]`, createAccessKeyedExpression(expr, $b)] as [string, any])
  ];
  // 2. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
      .map(([input, expr]) => [`${input}.b`, createAccessMemberExpression(expr, 'b')] as [string, any])
  ];
  // 3. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}\`\``, createTaggedTemplate([''], expr, [])] as [string, any]),

    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}\`\${a}\``, createTaggedTemplate(['', ''], expr, [$a])] as [string, any])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, any][] = [
    ...[...AccessThisList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}()`, createCallFunctionExpression(expr, [])] as [string, any])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, any][] = [
    ...[...AccessScopeList]
      .map(([input, expr]) => [`${input}()`, createCallScopeExpression(expr.name, [], expr.ancestor)] as [string, any])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
      .map(([input, expr]) => [`${input}.b()`, createCallMemberExpression(expr, 'b', [])] as [string, any])
  ];
  // 1. parseOptionalExpression.MemberExpression ?. [ AssignmentExpression ]
  const SimpleOptionalAccessKeyedList: [string, any][] = [
    ...[...SimplePrimaryList, ...AccessBoundaryList]
      .map(([input, expr]) => [`${input}?.[b]`, createAccessKeyedExpression(expr, $b, true)] as [string, any])
  ];
  // 2. parseOptionalExpression.MemberExpression ?. IdentifierName
  const SimpleOptionalAccessMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
      .map(([input, expr]) => [`${input}?.b`, createAccessMemberExpression(expr, 'b', true)] as [string, any]),
    [`a?.b?.c?.d`, createAccessMemberExpression(createAccessMemberExpression(createAccessMemberExpression($a, 'b', true), 'c', true), 'd', true)] as [string, any]
  ];
  // 3. parseOptionalExpression.MemberExpression ?. Arguments
  const SimpleOptionalCallFunctionList: [string, any][] = [
    ...[...AccessThisList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}?.()`, createCallFunctionExpression(expr, [], true)] as [string, any])
  ];
  // 4. parseOptionalExpression.MemberExpression ?. Arguments
  const SimpleOptionalCallScopeList: [string, any][] = [
    ...[...AccessScopeList]
      .map(([input, expr]) => [`${input}?.()`, createCallScopeExpression(expr.name, [], expr.ancestor, true)] as [string, any])
  ];
  // 5. parseOptionalExpression.MemberExpression IdentifierName ?. Arguments
  //                            MemberExpression ?. IdentifierName Arguments
  //                            MemberExpression ?. IdentifierName ?. Arguments
  const SimpleOptionalCallMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
      .map(([input, expr]) => [
        [`${input}.b?.()`, createCallMemberExpression(expr, 'b', [], false, true)] as [string, any],
        [`${input}?.b()`, createCallMemberExpression(expr, 'b', [], true, false)] as [string, any],
        [`${input}?.b?.()`, createCallMemberExpression(expr, 'b', [], true, true)] as [string, any],
      ]).reduce((acc, cur) => acc.concat(cur))
  ];
  // concatenation of 1-3 of MemberExpression,  1-3 of CallExpression and 1-5 of OptionalExpression
  const SimpleLeftHandSideList: [string, any][] = [
    ...SimpleAccessKeyedList,
    ...SimpleAccessMemberList,
    ...SimpleTaggedTemplateList,
    ...SimpleCallFunctionList,
    ...SimpleCallScopeList,
    ...SimpleCallMemberList,
    ...SimpleOptionalAccessKeyedList,
    ...SimpleOptionalAccessMemberList,
    ...SimpleOptionalCallFunctionList,
    ...SimpleOptionalCallScopeList,
    ...SimpleOptionalCallMemberList,
  ];

  // concatenation of Primary and Member+CallExpression
  // This forms the group Precedence.LeftHandSide
  // used only for testing complex UnaryExpression expressions
  const SimpleIsLeftHandSideList: [string, any][] = [
    ...SimplePrimaryList,
    ...AccessBoundaryList,
    ...SimpleLeftHandSideList
  ];

  // same as SimpleIsLeftHandSideList but without $parent and $this (ergo, LeftHandSide according to the actual spec)
  const SimpleIsNativeLeftHandSideList: [string, any][] = [
    ...AccessScopeList,
    ...AccessBoundaryList,
    ...SimpleLiteralList,
    ...SimpleParenthesizedList,
    ...SimpleNewList,
    ...SimpleLeftHandSideList
  ];

  // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
  const SimpleUnaryList: [string, any][] = [
    [`!$1`, createUnaryExpression('!', createAccessScopeExpression('$1'))],
    [`(-$2)`, createUnaryExpression('-', createAccessScopeExpression('$2'))],
    [`(+$3)`, createUnaryExpression('+', createAccessScopeExpression('$3'))],
    [`(--$3)`, createUnaryExpression('--', createAccessScopeExpression('$3'))],
    [`(++$3)`, createUnaryExpression('++', createAccessScopeExpression('$3'))],
    [`($3--)`, createUnaryExpression('--', createAccessScopeExpression('$3'), 1)],
    [`($3++)`, createUnaryExpression('++', createAccessScopeExpression('$3'), 1)],
    [`void $4`, createUnaryExpression('void', createAccessScopeExpression('$4'))],
    [`typeof $5`, createUnaryExpression('typeof', createAccessScopeExpression('$5'))]
  ];
  // concatenation of UnaryExpression + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
  const SimpleIsUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleExponentiationList: [string, any][] = [
    [`$4**$5`, createBinaryExpression('**', createAccessScopeExpression('$4'), createAccessScopeExpression('$5'))]
  ];
  const SimpleIsExponentiationList: [string, any][] = [
    ...SimpleIsUnaryList,
    ...SimpleExponentiationList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, any][] = [
    [`$6*$7`, createBinaryExpression('*', createAccessScopeExpression('$6'), createAccessScopeExpression('$7'))],
    [`$8%$9`, createBinaryExpression('%', createAccessScopeExpression('$8'), createAccessScopeExpression('$9'))],
    [`$10/$11`, createBinaryExpression('/', createAccessScopeExpression('$10'), createAccessScopeExpression('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, any][] = [
    ...SimpleIsExponentiationList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, any][] = [
    [`$12+$13`, createBinaryExpression('+', createAccessScopeExpression('$12'), createAccessScopeExpression('$13'))],
    [`$14-$15`, createBinaryExpression('-', createAccessScopeExpression('$14'), createAccessScopeExpression('$15'))]
  ];
  const SimpleIsAdditiveList: [string, any][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, any][] = [
    [`$16<$17`, createBinaryExpression('<', createAccessScopeExpression('$16'), createAccessScopeExpression('$17'))],
    [`$18>$19`, createBinaryExpression('>', createAccessScopeExpression('$18'), createAccessScopeExpression('$19'))],
    [`$20<=$21`, createBinaryExpression('<=', createAccessScopeExpression('$20'), createAccessScopeExpression('$21'))],
    [`$22>=$23`, createBinaryExpression('>=', createAccessScopeExpression('$22'), createAccessScopeExpression('$23'))],
    [`$24 in $25`, createBinaryExpression('in', createAccessScopeExpression('$24'), createAccessScopeExpression('$25'))],
    [`$26 instanceof $27`, createBinaryExpression('instanceof', createAccessScopeExpression('$26'), createAccessScopeExpression('$27'))]
  ];
  const SimpleIsRelationalList: [string, any][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, any][] = [
    [`$28==$29`, createBinaryExpression('==', createAccessScopeExpression('$28'), createAccessScopeExpression('$29'))],
    [`$30!=$31`, createBinaryExpression('!=', createAccessScopeExpression('$30'), createAccessScopeExpression('$31'))],
    [`$32===$33`, createBinaryExpression('===', createAccessScopeExpression('$32'), createAccessScopeExpression('$33'))],
    [`$34!==$35`, createBinaryExpression('!==', createAccessScopeExpression('$34'), createAccessScopeExpression('$35'))]
  ];
  const SimpleIsEqualityList: [string, any][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, any][] = [
    [`$36&&$37`, createBinaryExpression('&&', createAccessScopeExpression('$36'), createAccessScopeExpression('$37'))]
  ];
  const SimpleIsLogicalANDList: [string, any][] = [
    ...SimpleIsEqualityList,
    ...SimpleLogicalANDList
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, any][] = [
    [`$38||$39`, createBinaryExpression('||', createAccessScopeExpression('$38'), createAccessScopeExpression('$39'))]
  ];
  const SimpleIsLogicalORList: [string, any][] = [
    ...SimpleIsLogicalANDList,
    ...SimpleLogicalORList
  ];

  // This forms the group Precedence.NullishCoalescing
  const SimpleNullishCoalescingList: [string, any][] = [
    [`$40??$41`, createBinaryExpression('??', createAccessScopeExpression('$40'), createAccessScopeExpression('$41'))]
  ];
  const SimpleIsNullishCoalescingList: [string, any][] = [
    ...SimpleIsLogicalORList,
    ...SimpleNullishCoalescingList
  ];

  // This forms the group Precedence.Conditional
  const SimpleConditionalList: [string, any][] = [
    [`a?b:c`, createConditionalExpression($a, $b, createAccessScopeExpression('c'))]
  ];
  const SimpleIsConditionalList: [string, any][] = [
    ...SimpleIsNullishCoalescingList,
    ...SimpleConditionalList
  ];

  // This forms the group Precedence.Assign
  const SimpleAssignList: [string, any][] = [
    [`a=b`, createAssignExpression($a, $b)],
    [`$42/=$43`, createAssignExpression(createAccessScopeExpression('$42'), createAccessScopeExpression('$43'), '/=')],
    [`$44*=$45`, createAssignExpression(createAccessScopeExpression('$44'), createAccessScopeExpression('$45'), '*=')],
    [`$46+=$47`, createAssignExpression(createAccessScopeExpression('$46'), createAccessScopeExpression('$47'), '+=')],
    [`$48-=$49`, createAssignExpression(createAccessScopeExpression('$48'), createAccessScopeExpression('$49'), '-=')]
  ];
  const SimpleArrowList: [string, any][] = [
    [`(a) => a`, createArrowFunction([createBindingIdentifier('a')], $a)],
    [`(...a) => a`, createArrowFunction([createBindingIdentifier('a')], $a, true)],
    [`(a, b) => a`, createArrowFunction([createBindingIdentifier('a'), createBindingIdentifier('b')], $a)],
    [`(a, ...b) => a`, createArrowFunction([createBindingIdentifier('a'), createBindingIdentifier('b')], $a, true)],
    [`a => a`, createArrowFunction([createBindingIdentifier('a')], $a)],
    [`() => 0`, createArrowFunction([], $num0)],
  ];
  const SimpleIsAssignList: [string, any][] = [
    ...SimpleIsConditionalList,
    ...SimpleArrowList,
    ...SimpleAssignList,
  ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, any][] = [
    [`a|b`, createValueConverterExpression($a, 'b', [])],
    [`a|b:c`, createValueConverterExpression($a, 'b', [createAccessScopeExpression('c')])],
    [`a|b:c:d`, createValueConverterExpression($a, 'b', [createAccessScopeExpression('c'), createAccessScopeExpression('d')])]
  ];
  const SimpleIsValueConverterList: [string, any][] = [
    ...SimpleIsAssignList,
    ...SimpleValueConverterList
  ];

  const SimpleBindingBehaviorList: [string, any][] = [
    [`a&b`, createBindingBehaviorExpression($a, 'b', [])],
    [`a&b:c`, createBindingBehaviorExpression($a, 'b', [createAccessScopeExpression('c')])],
    [`a&b:c:d`, createBindingBehaviorExpression($a, 'b', [createAccessScopeExpression('c'), createAccessScopeExpression('d')])]
  ];

  const SimpleIsBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList,
    ...SimpleBindingBehaviorList
  ];

  for (const [exprType, name] of [
    [undefined, 'undefined'],
    ['IsProperty', 'IsProperty'],
    ['IsFunction', 'call command'],
  ] as [ExpressionType, string][]) {
    describe(name, function () {
      describe('parse AccessBoundaryList', function () {
        for (const [input, expected] of AccessBoundaryList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, exprType, name);
          });
        }
      });

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

      describe('parse SimpleNewList', function () {
        for (const [input, expected] of SimpleNewList) {
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

      describe('parse SimpleExponentiationList', function () {
        for (const [input, expected] of SimpleExponentiationList) {
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
      ['foo',                createPrimitiveLiteral('foo')],
      ['äöüÄÖÜß',            createPrimitiveLiteral('äöüÄÖÜß')],
      ['ಠ_ಠ',               createPrimitiveLiteral('ಠ_ಠ')],
      ...stringEscapables.map(([raw, cooked]) => [raw, createPrimitiveLiteral(cooked)])
    ].map(([input, expr]): [string, any][] => [
      [`'${input}'`, expr],
      [`"${input}"`, expr]
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexStringLiteralList', function () {
    for (const [input, expected] of ComplexStringLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // Verify different floating point notations and parsing numbers that are outside the "safe" integer range
  const ComplexNumberList: [string, any][] = [
    ['9007199254740992',                                                  createPrimitiveLiteral(9007199254740992)],
    ['0.9007199254740992',                                                createPrimitiveLiteral(0.9007199254740992)],
    ['.9007199254740992',                                                 createPrimitiveLiteral(0.9007199254740992)],
    ['.90071992547409929007199254740992',                                 createPrimitiveLiteral(0.90071992547409929007199254740992)],
    ['9007199254740992.9007199254740992',                                 createPrimitiveLiteral(9007199254740992.9007199254740992)],
    ['9007199254740992.90071992547409929007199254740992',                 createPrimitiveLiteral(9007199254740992.90071992547409929007199254740992)],
    ['90071992547409929007199254740992',                                  createPrimitiveLiteral(90071992547409929007199254740992)],
    ['90071992547409929007199254740992.9007199254740992',                 createPrimitiveLiteral(90071992547409929007199254740992.9007199254740992)],
    ['90071992547409929007199254740992.90071992547409929007199254740992', createPrimitiveLiteral(90071992547409929007199254740992.90071992547409929007199254740992)]
  ];
  describe('parse ComplexNumberList', function () {
    for (const [input, expected] of ComplexNumberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // Verify various combinations of nested and chained parts/expressions, with/without escaped strings
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of arguments
  const ComplexTemplateLiteralList: [string, any][] = [
    [`\`a\``,                       createTemplateExpression(['a'], [])],
    [`\`\\\${a}\``,                 createTemplateExpression([`\${a}`], [])],
    [`\`$a\``,                      createTemplateExpression(['$a'], [])],
    [`\`\${a}\${b}\``,              createTemplateExpression(['', '', ''],                       [$a, $b])],
    [`\`a\${a}\${b}\``,             createTemplateExpression(['a', '', ''],                      [$a, $b])],
    [`\`\${a}a\${b}\``,             createTemplateExpression(['', 'a', ''],                      [$a, $b])],
    [`\`a\${a}a\${b}\``,            createTemplateExpression(['a', 'a', ''],                     [$a, $b])],
    [`\`\${a}\${b}a\``,             createTemplateExpression(['', '', 'a'],                      [$a, $b])],
    [`\`\${a}a\${b}a\``,            createTemplateExpression(['', 'a', 'a'],                     [$a, $b])],
    [`\`a\${a}a\${b}a\``,           createTemplateExpression(['a', 'a', 'a'],                    [$a, $b])],
    [`\`\${\`\${a}\`}\``,           createTemplateExpression(['', ''], [createTemplateExpression(['', ''],   [$a])])],
    [`\`\${\`a\${a}\`}\``,          createTemplateExpression(['', ''], [createTemplateExpression(['a', ''],  [$a])])],
    [`\`\${\`\${a}a\`}\``,          createTemplateExpression(['', ''], [createTemplateExpression(['', 'a'],  [$a])])],
    [`\`\${\`a\${a}a\`}\``,         createTemplateExpression(['', ''], [createTemplateExpression(['a', 'a'], [$a])])],
    [`\`\${\`\${\`\${a}\`}\`}\``,   createTemplateExpression(['', ''], [createTemplateExpression(['', ''], [createTemplateExpression(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]): [string, any][] => [
      [`\`${raw}\``,                createTemplateExpression([cooked],              [])],
      [`\`\${a}${raw}\``,           createTemplateExpression(['', cooked],        [$a])],
      [`\`${raw}\${a}\``,           createTemplateExpression([cooked, ''],        [$a])],
      [`\`${raw}\${a}${raw}\``,     createTemplateExpression([cooked, cooked],    [$a])],
      [`\`\${a}${raw}\${a}\``,      createTemplateExpression(['', cooked, ''],    [$a, $a])],
    ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\`\${${input}}\``, createTemplateExpression(['', ''], [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\`\${${input}}\${${input}}\``, createTemplateExpression(['', '', ''], [expr, expr])] as [string, any])
  ];
  describe('parse ComplexTemplateLiteralList', function () {
    for (const [input, expected] of ComplexTemplateLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // Verify various combinations of specified and unspecified (elision) array items
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of element expressions
  const ComplexArrayLiteralList: [string, any][] = [
    [`[,]`,                 createArrayLiteralExpression([$undefined])],
    [`[,,]`,                createArrayLiteralExpression([$undefined, $undefined])],
    [`[,,,]`,               createArrayLiteralExpression([$undefined, $undefined, $undefined])],
    [`[a,]`,                createArrayLiteralExpression([$a])],
    [`[a,,]`,               createArrayLiteralExpression([$a, $undefined])],
    [`[a,a,]`,              createArrayLiteralExpression([$a, $a])],
    [`[a,,,]`,              createArrayLiteralExpression([$a, $undefined, $undefined])],
    [`[a,a,,]`,             createArrayLiteralExpression([$a, $a, $undefined])],
    [`[,a]`,                createArrayLiteralExpression([$undefined, $a])],
    [`[,a,]`,               createArrayLiteralExpression([$undefined, $a])],
    [`[,a,,]`,              createArrayLiteralExpression([$undefined, $a, $undefined])],
    [`[,a,a,]`,             createArrayLiteralExpression([$undefined, $a, $a])],
    [`[,,a]`,               createArrayLiteralExpression([$undefined, $undefined, $a])],
    [`[,a,a]`,              createArrayLiteralExpression([$undefined, $a, $a])],
    [`[,,a,]`,              createArrayLiteralExpression([$undefined, $undefined, $a])],
    [`[,,,a]`,              createArrayLiteralExpression([$undefined, $undefined, $undefined, $a])],
    [`[,,a,a]`,             createArrayLiteralExpression([$undefined, $undefined, $a, $a])],
    ...SimpleIsAssignList.map(([input, expr]): [string, any][] => [
      [`[${input}]`,           createArrayLiteralExpression([expr])],
      [`[${input},${input}]`,  createArrayLiteralExpression([expr, expr])]
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexArrayLiteralList', function () {
    for (const [input, expected] of ComplexArrayLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // Verify various combinations of shorthand, full, string and number property definitions
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of value expressions
  const ComplexObjectLiteralList: [string, any][] = [
    [`{a}`,                 createObjectLiteralExpression(['a'], [$a])],
    [`{a:a}`,               createObjectLiteralExpression(['a'], [$a])],
    [`{'a':a}`,             createObjectLiteralExpression(['a'], [$a])],
    [`{"a":a}`,             createObjectLiteralExpression(['a'], [$a])],
    [`{1:a}`,               createObjectLiteralExpression([1], [$a])],
    [`{'1':a}`,             createObjectLiteralExpression(['1'], [$a])],
    [`{"1":a}`,             createObjectLiteralExpression(['1'], [$a])],
    [`{'a':a,b}`,           createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{"a":a,b}`,           createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{1:a,b}`,             createObjectLiteralExpression([1, 'b'], [$a, $b])],
    [`{'1':a,b}`,           createObjectLiteralExpression(['1', 'b'], [$a, $b])],
    [`{"1":a,b}`,           createObjectLiteralExpression(['1', 'b'], [$a, $b])],
    [`{a,'b':b}`,           createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a,"b":b}`,           createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a,1:b}`,             createObjectLiteralExpression(['a', 1], [$a, $b])],
    [`{a,'1':b}`,           createObjectLiteralExpression(['a', '1'], [$a, $b])],
    [`{a,"1":b}`,           createObjectLiteralExpression(['a', '1'], [$a, $b])],
    [`{a,b}`,               createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a:a,b}`,             createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a,b:b}`,             createObjectLiteralExpression(['a', 'b'], [$a, $b])],
    [`{a:a,b,c}`,           createObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c}`,           createObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b,c:c}`,           createObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b:b,c}`,         createObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b,c:c}`,         createObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c:c}`,         createObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
    ...SimpleIsAssignList.map(([input, expr]): [string, any][] => [
      [`{a:${input}}`,            createObjectLiteralExpression(['a'], [expr])],
      [`{a:${input},b:${input}}`, createObjectLiteralExpression(['a', 'b'], [expr, expr])]
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexObjectLiteralList', function () {
    for (const [input, expected] of ComplexObjectLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexAccessKeyedList: [string, any][] = [
    ...SimpleIsAssignList.map(([input, expr]) => [
      [`a[${input}]`, createAccessKeyedExpression($a, expr)] as [string, any],
      [`a?.[${input}]`, createAccessKeyedExpression($a, expr, true)] as [string, any],
    ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexAccessKeyedList', function () {
    for (const [input, expected] of ComplexAccessKeyedList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
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
      .map(([input]) => [
        [`a.${input}`, createAccessMemberExpression($a, input)] as [string, any],
        [`a?.${input}`, createAccessMemberExpression($a, input, true)] as [string, any],
      ]).reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexAccessMemberList', function () {
    for (const [input, expected] of ComplexAccessMemberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
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
    [`a\`\${\`\${a}\`}\``,           createTaggedTemplate(['', ''],        $a, [createTemplateExpression(['', ''],   [$a])])],
    [`a\`\${\`a\${a}\`}\``,          createTaggedTemplate(['', ''],        $a, [createTemplateExpression(['a', ''],  [$a])])],
    [`a\`\${\`\${a}a\`}\``,          createTaggedTemplate(['', ''],        $a, [createTemplateExpression(['', 'a'],  [$a])])],
    [`a\`\${\`a\${a}a\`}\``,         createTaggedTemplate(['', ''],        $a, [createTemplateExpression(['a', 'a'], [$a])])],
    [`a\`\${\`\${\`\${a}\`}\`}\``,   createTaggedTemplate(['', ''],        $a, [createTemplateExpression(['', ''], [createTemplateExpression(['', ''],   [$a])])])],
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
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexCallFunctionList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [
        [`$this(${input})`, createCallFunctionExpression($this, [expr])] as [string, any],
        [`$this?.(${input})`, createCallFunctionExpression($this, [expr], true)] as [string, any],
      ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`$this(${input},${input})`, createCallFunctionExpression($this, [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallFunctionList', function () {
    for (const [input, expected] of ComplexCallFunctionList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexCallScopeList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [
        [`a(${input})`, createCallScopeExpression('a', [expr])] as [string, any],
        [`a?.(${input})`, createCallScopeExpression('a', [expr], 0, true)] as [string, any],
      ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a(${input},${input})`, createCallScopeExpression('a', [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallScopeList', function () {
    for (const [input, expected] of ComplexCallScopeList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexCallMemberList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [
        [`a.b(${input})`, createCallMemberExpression($a, 'b', [expr], false, false)] as [string, any],
        [`a?.b(${input})`, createCallMemberExpression($a, 'b', [expr], true, false)] as [string, any],
        [`a.b?.(${input})`, createCallMemberExpression($a, 'b', [expr], false, true)] as [string, any],
        [`a?.b?.(${input})`, createCallMemberExpression($a, 'b', [expr], true, true)] as [string, any],
      ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a.b(${input},${input})`, createCallMemberExpression($a, 'b', [expr, expr])] as [string, any]),
    [`a?.b?.c?.()`, createCallMemberExpression(createAccessMemberExpression($a, 'b', true), 'c', [], true, true)] as [string, any],
    [`a.b?.c?.()`, createCallMemberExpression(createAccessMemberExpression($a, 'b', false), 'c', [], true, true)] as [string, any],
    [`a?.b.c?.()`, createCallMemberExpression(createAccessMemberExpression($a, 'b', true), 'c', [], false, true)] as [string, any],
    [`a?.b?.c()`, createCallMemberExpression(createAccessMemberExpression($a, 'b', true), 'c', [], true, false)] as [string, any],

    [`a?.b?.()()`, createCallFunctionExpression(createCallMemberExpression($a, 'b', [], true, true), [], false)] as [string, any],
    [`a?.b?.().c()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, true), 'c', [], false, false)] as [string, any],
    [`a?.b?.()?.c()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, true), 'c', [], true, false)] as [string, any],
    [`a?.b?.().c?.()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, true), 'c', [], false, true)] as [string, any],
    [`a?.b?.()?.c?.()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, true), 'c', [], true, true)] as [string, any],
    [`a?.b?.()?.()`, createCallFunctionExpression(createCallMemberExpression($a, 'b', [], true, true), [], true)] as [string, any],

    [`a?.b()()`, createCallFunctionExpression(createCallMemberExpression($a, 'b', [], true, false), [], false)] as [string, any],
    [`a?.b().c()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, false), 'c', [], false, false)] as [string, any],
    [`a?.b()?.c()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, false), 'c', [], true, false)] as [string, any],
    [`a?.b().c?.()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, false), 'c', [], false, true)] as [string, any],
    [`a?.b()?.c?.()`, createCallMemberExpression(createCallMemberExpression($a, 'b', [], true, false), 'c', [], true, true)] as [string, any],
    [`a?.b()?.()`, createCallFunctionExpression(createCallMemberExpression($a, 'b', [], true, false), [], true)] as [string, any],
  ];
  describe('parse ComplexCallMemberList', function () {
    for (const [input, expected] of ComplexCallMemberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`!${input}`, createUnaryExpression('!', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`+${input}`, createUnaryExpression('+', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`-${input}`, createUnaryExpression('-', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`++${input}`, createUnaryExpression('++', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`--${input}`, createUnaryExpression('--', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`void ${input}`, createUnaryExpression('void', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`typeof ${input}`, createUnaryExpression('typeof', expr)] as [string, any])
  ];
  describe('parse ComplexUnaryList', function () {
    for (const [input, expected] of ComplexUnaryList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // Combine a precedence group with all precedence groups below it, the precedence group on the same
  // level, and a precedence group above it, and verify that the precedence/associativity is correctly enforced
  const ComplexExponentiationList: [string, any][] = [
    ...SimpleIsExponentiationList.map(([i1, e1]) => [`${i1}**a`, createBinaryExpression('**', e1, $a)]),
    ...SimpleIsUnaryList.map(([i1, e1]) => [`a**${i1}`, createBinaryExpression('**', $a, e1)]),
    ...SimpleUnaryList
      .map(([i1, e1]) => SimpleExponentiationList.map(([i2, e2]) => [`${i2}**${i1}`, createBinaryExpression('**', e2, e1)]))
      .reduce((a, b) => a.concat(b)),
    ...SimpleExponentiationList
      .map(([i1, e1]) => SimpleExponentiationList.map(([i2, e2]) => [`${i1}**${i2}`, createBinaryExpression(e2.operation, createBinaryExpression('**', createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
      .reduce((a, b) => a.concat(b)),
    ...SimpleMultiplicativeList
      .map(([i1, e1]) => SimpleExponentiationList.map(([i2, e2]) => [`${i1}**${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression('**', e1.right, e2.left), e2.right))]))
      .reduce((a, b) => a.concat(b))
  ] as [string, any][];
  describe('parse ComplexExponentiationList', function () {
    for (const [input, expected] of ComplexExponentiationList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexMultiplicativeList: [string, any][] = [
    ...binaryMultiplicative.map(op => [
      ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`${i1}${op}a`, createBinaryExpression(op, e1, $a)]),
      ...SimpleIsExponentiationList.map(([i1, e1]) => [`a${op}${i1}`, createBinaryExpression(op, $a, e1)]),
      ...SimpleExponentiationList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i2}${op}${i1}`, createBinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, createBinaryExpression(e2.operation, createBinaryExpression(op, createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexMultiplicativeList', function () {
    for (const [input, expected] of ComplexMultiplicativeList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexAdditiveList: [string, any][] = [
    ...binaryAdditive.map(op => [
      ...SimpleIsAdditiveList.map(([i1, e1]) => [`${i1}${op}a`, createBinaryExpression(op, e1, $a)]),
      ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`a${op}${i1}`, createBinaryExpression(op, $a, e1)]),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i2}${op}${i1}`, createBinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, createBinaryExpression(e2.operation, createBinaryExpression(op, createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexAdditiveList', function () {
    for (const [input, expected] of ComplexAdditiveList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexRelationalList: [string, any][] = [
    ...binaryRelational.map(([op, txt]) => [
      ...SimpleIsRelationalList.map(([i1, e1]) => [`${i1}${txt}a`, createBinaryExpression(op, e1, $a)]),
      ...SimpleIsAdditiveList.map(([i1, e1]) => [`a${txt}${i1}`, createBinaryExpression(op, $a, e1)]),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i2}${txt}${i1}`, createBinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, createBinaryExpression(e2.operation, createBinaryExpression(op, createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexRelationalList', function () {
    for (const [input, expected] of ComplexRelationalList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexEqualityList: [string, any][] = [
    ...binaryEquality.map(op => [
      ...SimpleIsEqualityList.map(([i1, e1]) => [`${i1}${op}a`, createBinaryExpression(op, e1, $a)]),
      ...SimpleIsRelationalList.map(([i1, e1]) => [`a${op}${i1}`, createBinaryExpression(op, $a, e1)]),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i2}${op}${i1}`, createBinaryExpression(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, createBinaryExpression(e2.operation, createBinaryExpression(op, createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleLogicalANDList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexEqualityList', function () {
    for (const [input, expected] of ComplexEqualityList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexLogicalANDList: [string, any][] = [
    ...SimpleIsLogicalANDList.map(([i1, e1]) => [`${i1}&&a`, createBinaryExpression('&&', e1, $a)] as [string, any]),
    ...SimpleIsEqualityList.map(([i1, e1]) => [`a&&${i1}`, createBinaryExpression('&&', $a, e1)] as [string, any]),
    ...SimpleEqualityList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i2}&&${i1}`, createBinaryExpression('&&', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, createBinaryExpression(e2.operation, createBinaryExpression('&&', createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression('&&', e1.right, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalANDList', function () {
    for (const [input, expected] of ComplexLogicalANDList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexLogicalORList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => [`${i1}||a`, createBinaryExpression('||', e1, $a)] as [string, any]),
    ...SimpleIsLogicalANDList.map(([i1, e1]) => [`a||${i1}`, createBinaryExpression('||', $a, e1)] as [string, any]),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i2}||${i1}`, createBinaryExpression('||', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, createBinaryExpression(e2.operation, createBinaryExpression('||', createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleNullishCoalescingList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, createBinaryExpression(e1.operation, e1.left, createBinaryExpression(e2.operation, createBinaryExpression('||', e1.right, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleConditionalList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, createConditionalExpression(e1.condition, e1.yes, createBinaryExpression(e2.operation, createBinaryExpression('||', e1.no, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalORList', function () {
    for (const [input, expected] of ComplexLogicalORList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexNullishCoalescingList: [string, any][] = [
    ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`${i1}??a`, createBinaryExpression('??', e1, $a)] as [string, any]),
    ...SimpleIsLogicalORList.map(([i1, e1]) => [`a??${i1}`, createBinaryExpression('??', $a, e1)] as [string, any]),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleNullishCoalescingList.map(([i2, e2]) => [`${i2}??${i1}`, createBinaryExpression('??', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleNullishCoalescingList
      .map(([i1, e1]) => SimpleNullishCoalescingList.map(([i2, e2]) => [`${i1}??${i2}`, createBinaryExpression(e2.operation, createBinaryExpression('??', createBinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleConditionalList
      .map(([i1, e1]) => SimpleNullishCoalescingList.map(([i2, e2]) => [`${i1}??${i2}`, createConditionalExpression(e1.condition, e1.yes, createBinaryExpression(e2.operation, createBinaryExpression('??', e1.no, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexNullishCoalescingList', function () {
    for (const [input, expected] of ComplexNullishCoalescingList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexConditionalList: [string, any][] = [
    ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`${i1}?0:1`, createConditionalExpression(e1, $num0, $num1)] as [string, any]),
    ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`0?${i1}:1`, createConditionalExpression($num0, e1, $num1)] as [string, any]),
    ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`0?1:${i1}`, createConditionalExpression($num0, $num1, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`0?1:${i1}`, createConditionalExpression($num0, $num1, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`0?${i1}:1`, createConditionalExpression($num0, e1, $num1)] as [string, any]),
    ...SimpleConditionalList.map(([i1, e1]) => [`${i1}?0:1`, createConditionalExpression(e1.condition, e1.yes, createConditionalExpression(e1.no, $num0, $num1))] as [string, any])
  ];
  describe('parse ComplexConditionalList', function () {
    for (const [input, expected] of ComplexConditionalList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexAssignList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => [`a=${i1}`, createAssignExpression($a, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`a=b=${i1}`, createAssignExpression($a, createAssignExpression($b, e1))] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}=a`, createAssignExpression(e1, $a)] as [string, any]),
    ...SimpleAccessMemberList.map(([i1, e1]) => [`${i1}=a`, createAssignExpression(e1, $a)] as [string, any]),
    ...SimpleAccessKeyedList.map(([i1, e1]) => [`${i1}=a`, createAssignExpression(e1, $a)] as [string, any]),
    ...SimpleAssignList.map(([i1, e1]) => [`${i1}=c`, createAssignExpression(e1.target, createAssignExpression(e1.value, $c), e1.op)] as [string, any])
  ];
  describe('parse ComplexAssignList', function () {
    for (const [input, expected] of ComplexAssignList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // Anything starting with '{' will be rejected as an arrow fn body so filter those out
  const ConciseBodySimpleIsAssignList = SimpleIsAssignList.filter(([i1]) => !i1.startsWith('{'));
  const ComplexArrowFunctionList: [number, string, ArrowFunction][] = [
    ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [1, `()=>${i1}`, createArrowFunction([], e1)] as [number, string, any]),
    ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [1, `(a)=>${i1}`, createArrowFunction([createBindingIdentifier('a')], e1)] as [number, string, any]),
    ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [1, `a=>${i1}`, createArrowFunction([createBindingIdentifier('a')], e1)] as [number, string, any]),
    ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [2, `()=>()=>${i1}`, createArrowFunction([], createArrowFunction([], e1))] as [number, string, any]),
  ];
  function adjustAncestor(count: number, expr: IsAssign, input: string) {
    switch (expr.$kind) {
      case 'AccessThis':
        (expr as any).ancestor += count;
        break;
      case 'AccessScope':
        // eslint-disable-next-line no-useless-escape
        if (expr.ancestor > 0 || input.search(new RegExp(`\\$this[?]?\\.[a-zA-Z\$\.]*${expr.name.replaceAll('$', '\\$')}`)) > -1) {
          (expr as any).ancestor += count;
        }
        break;
      case 'ArrayLiteral':
        for (const el of expr.elements) {
          adjustAncestor(count, el, input);
        }
        break;
      case 'ObjectLiteral':
        for (const val of expr.values) {
          adjustAncestor(count, val, input);
        }
        break;
      case 'Template':
        for (const ex of expr.expressions) {
          adjustAncestor(count, ex, input);
        }
        break;
      case 'Unary':
        adjustAncestor(count, expr.expression, input);
        break;
      case 'CallScope':
        // eslint-disable-next-line no-useless-escape
        if (expr.ancestor > 0 || input.search(new RegExp(`\\$this[?]?\\.[a-zA-Z\$\.]*${expr.name.replaceAll('$', '\\$')}`)) > -1) {
          (expr as any).ancestor += count;
        }
        for (const arg of expr.args) {
          adjustAncestor(count, arg, input);
        }
        break;
      case 'CallMember':
        adjustAncestor(count, expr.object, input);
        for (const arg of expr.args) {
          adjustAncestor(count, arg, input);
        }
        break;
      case 'CallFunction':
        adjustAncestor(count, expr.func, input);
        for (const arg of expr.args) {
          adjustAncestor(count, arg, input);
        }
        break;
      case 'AccessMember':
        adjustAncestor(count, expr.object, input);
        break;
      case 'AccessKeyed':
        adjustAncestor(count, expr.object, input);
        adjustAncestor(count, expr.key, input);
        break;
      case 'TaggedTemplate':
        adjustAncestor(count, expr.func, input);
        // for (const ex of expr.expressions) {
        //   adjustAncestor(count, ex, input);
        // }
        break;
      case 'Binary':
        adjustAncestor(count, expr.left, input);
        adjustAncestor(count, expr.right, input);
        break;
      case 'Conditional':
        adjustAncestor(count, expr.yes, input);
        adjustAncestor(count, expr.no, input);
        adjustAncestor(count, expr.condition, input);
        break;
      case 'Assign':
        adjustAncestor(count, expr.target, input);
        adjustAncestor(count, expr.value, input);
        break;
      case 'ArrowFunction':
        adjustAncestor(count, expr.body, input);
        break;
    }
  }
  describe('parse ComplexArrowFunctionList', function () {
    for (const [depth, input, expected] of ComplexArrowFunctionList) {
      it(input, function () {
        try {
          // adjust and restore ancestor for reused expressions
          adjustAncestor(depth, expected, input);
          assert.deepStrictEqual(parseExpression(input), expected, input);
        } catch (e) {
          throw e;
        } finally {
          adjustAncestor(-depth, expected, input);
        }
      });
    }
  });

  const ComplexValueConverterList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a`, createValueConverterExpression(e1, 'a', [])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}`, createValueConverterExpression(e1, 'a', [e1])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, createValueConverterExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b`, createValueConverterExpression(createValueConverterExpression(e1, 'a', []), 'b', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b|c`, createValueConverterExpression(createValueConverterExpression(createValueConverterExpression(e1, 'a', []), 'b', []), 'c', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, createValueConverterExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}`, createValueConverterExpression(e1, 'a', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b|c:${i1}:${i1}:${i1}`, createValueConverterExpression(createValueConverterExpression(createValueConverterExpression(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b:${i1}:${i1}:${i1}|c`, createValueConverterExpression(createValueConverterExpression(createValueConverterExpression(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])] as [string, any])
  ];
  describe('parse ComplexValueConverterList', function () {
    for (const [input, expected] of ComplexValueConverterList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  const ComplexBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList.map(([i1, e1]) => [`${i1}&a`, createBindingBehaviorExpression(e1, 'a', [])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}`, createBindingBehaviorExpression(e1, 'a', [e1])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, createBindingBehaviorExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b`, createBindingBehaviorExpression(createBindingBehaviorExpression(e1, 'a', []), 'b', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b&c`, createBindingBehaviorExpression(createBindingBehaviorExpression(createBindingBehaviorExpression(e1, 'a', []), 'b', []), 'c', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, createBindingBehaviorExpression(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}`, createBindingBehaviorExpression(e1, 'a', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b&c:${i1}:${i1}:${i1}`, createBindingBehaviorExpression(createBindingBehaviorExpression(createBindingBehaviorExpression(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b:${i1}:${i1}:${i1}&c`, createBindingBehaviorExpression(createBindingBehaviorExpression(createBindingBehaviorExpression(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])] as [string, any])
  ];
  describe('parse ComplexBindingBehaviorList', function () {
    for (const [input, expected] of ComplexBindingBehaviorList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected, input);
      });
    }
  });

  // #endregion

  // https://tc39.github.io/ecma262/#sec-runtime-semantics-iteratordestructuringassignmentevaluation
  describe('parse ForOfStatement', function () {
    const bi_a = createBindingIdentifier('a');

    const SimpleForDeclarations: [string, any][] = [
      [`a`,           bi_a],
      [`[]`,          createDestructuringAssignmentExpression('ArrayDestructuring', [], void 0, void 0)],
    ];

    const ame = (name: string) => createAccessMemberExpression($this, name);
    const ake = (key: number) => createAccessKeyedExpression($this, createPrimitiveLiteral(key));
    const dase = (s: string | number, t: string | null = null, init: IsBindingBehavior | undefined = void 0) => typeof s === 'number'
      ? createDestructuringAssignmentSingleExpression(ame(t), ake(s), init)
      : createDestructuringAssignmentSingleExpression(ame(t ?? s), ame(s), init);
    const ForDeclarations: [string, any][] = [
      [`[,]`,                            createDestructuringAssignmentExpression('ArrayDestructuring', [], void 0, void 0)],
      [`[,,]`,                           createDestructuringAssignmentExpression('ArrayDestructuring', [], void 0, void 0)],
      [`[,,,]`,                          createDestructuringAssignmentExpression('ArrayDestructuring', [], void 0, void 0)],
      [`[a,]`,                           createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a')], void 0, void 0)],
      [`[a,,]`,                          createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a')], void 0, void 0)],
      [`[a,a,]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a'), dase(1, 'a')], void 0, void 0)],
      [`[a,,]`,                          createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a')], void 0, void 0)],
      [`[a,,,]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a')], void 0, void 0)],
      [`[a,a,,]`,                        createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a'), dase(1, 'a')], void 0, void 0)],
      [`[,a]`,                           createDestructuringAssignmentExpression('ArrayDestructuring', [dase(1, 'a')], void 0, void 0)],
      [`[,a,]`,                          createDestructuringAssignmentExpression('ArrayDestructuring', [dase(1, 'a')], void 0, void 0)],
      [`[,a,,]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(1, 'a')], void 0, void 0)],
      [`[,a,a,]`,                        createDestructuringAssignmentExpression('ArrayDestructuring', [dase(1, 'a'), dase(2, 'a')], void 0, void 0)],
      [`[,,a]`,                          createDestructuringAssignmentExpression('ArrayDestructuring', [dase(2, 'a')], void 0, void 0)],
      [`[,a,a]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(1, 'a'), dase(2, 'a')], void 0, void 0)],
      [`[,,a,]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(2, 'a')], void 0, void 0)],
      [`[,,,a]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(3, 'a')], void 0, void 0)],
      [`[,,a,a]`,                        createDestructuringAssignmentExpression('ArrayDestructuring', [dase(2, 'a'), dase(3, 'a')], void 0, void 0)],
      [`[a,b]`,                          createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a'), dase(1, 'b')], void 0, void 0)],
      [`[key,value]`,                    createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'key'), dase(1, 'value')], void 0, void 0)],
      [`[a,,b]`,                         createDestructuringAssignmentExpression('ArrayDestructuring', [dase(0, 'a'), dase(2, 'b')], void 0, void 0)],
    ];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ForOfStatements: [string, any][] = [
      ...SimpleForDeclarations.map(([decInput, decExpr]) => [
        ...SimpleIsBindingBehaviorList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, createForOfStatement(decExpr, forExpr, -1)])
      ] as [string, any][]).reduce((a, c) => a.concat(c)),
      ...ForDeclarations.map(([decInput, decExpr]) => [
        ...AccessScopeList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, createForOfStatement(decExpr, forExpr, -1)])
      ] as [string, any][]).reduce((a, c) => a.concat(c))
    ];

    for (const [input, expected] of [
      ['a of a;key:id',   createForOfStatement(bi_a, $a, 6)],
      ['a of a;key: id',  createForOfStatement(bi_a, $a, 6)],
      ['a of a; key:id',  createForOfStatement(bi_a, $a, 6)],
      ['a of a; key: id', createForOfStatement(bi_a, $a, 6)],
      // not valid but the expression parser doesn't care about the validity of what comes after the first semicolon
      ['a of a;;',        createForOfStatement(bi_a, $a, 6)],
      ['a of a;a',        createForOfStatement(bi_a, $a, 6)],
      ['a of a; a',       createForOfStatement(bi_a, $a, 6)],
      ['a of a;a;',       createForOfStatement(bi_a, $a, 6)],
      ['a of a; a;',      createForOfStatement(bi_a, $a, 6)],
      ['a of a ;a',       createForOfStatement(bi_a, $a, 7)],
      ['a of a ; a',      createForOfStatement(bi_a, $a, 7)],
      ['a of a ;a;',      createForOfStatement(bi_a, $a, 7)],
      ['a of a ; a;',     createForOfStatement(bi_a, $a, 7)],
    ] as [string, any][]) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, 'IsIterator'), expected);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [input, expected] of SimpleForDeclarations.map(([decInput, decExpr]) => [

    ] as [string, any][]).reduce((a, c) => a.concat(c))) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, 'IsIterator'), expected);
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
    [`\${a}}`,                  createInterpolation(['', '}'],                          [$a])],
    [`\${a}\${b}`,              createInterpolation(['', '', ''],                       [$a, $b])],
    [`\${a}}\${b}`,             createInterpolation(['', '}', ''],                      [$a, $b])],
    [`\${a}\${b}}`,             createInterpolation(['', '', '}'],                      [$a, $b])],
    [`\${a}}\${b}}`,            createInterpolation(['', '}', '}'],                     [$a, $b])],
    [`a\${a}\${b}`,             createInterpolation(['a', '', ''],                      [$a, $b])],
    [`\${a}a\${b}`,             createInterpolation(['', 'a', ''],                      [$a, $b])],
    [`a\${a}a\${b}`,            createInterpolation(['a', 'a', ''],                     [$a, $b])],
    [`\${a}\${b}a`,             createInterpolation(['', '', 'a'],                      [$a, $b])],
    [`\${a}a\${b}a`,            createInterpolation(['', 'a', 'a'],                     [$a, $b])],
    [`a\${a}a\${b}a`,           createInterpolation(['a', 'a', 'a'],                    [$a, $b])],
    [`\${\`\${a}\`}`,           createInterpolation(['', ''], [createTemplateExpression(['', ''],   [$a])])],
    [`\${\`a\${a}\`}`,          createInterpolation(['', ''], [createTemplateExpression(['a', ''],  [$a])])],
    [`\${\`\${a}a\`}`,          createInterpolation(['', ''], [createTemplateExpression(['', 'a'],  [$a])])],
    [`\${\`a\${a}a\`}`,         createInterpolation(['', ''], [createTemplateExpression(['a', 'a'], [$a])])],
    [`\${\`\${\`\${a}\`}\`}`,   createInterpolation(['', ''], [createTemplateExpression(['', ''], [createTemplateExpression(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]): [string, any][] => [
      [`${raw}`,                null],
      [`\${a}${raw}`,           createInterpolation(['', cooked],        [$a])],
      [`${raw}\${a}`,           createInterpolation([cooked, ''],        [$a])],
      [`${raw}\${a}${raw}`,     createInterpolation([cooked, cooked],    [$a])],
      [`\${a}${raw}\${a}`,      createInterpolation(['', cooked, ''],    [$a, $a])],
    ]).reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\${${input}}`, createInterpolation(['', ''], [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\${${input}}\${${input}}`, createInterpolation(['', '', ''], [expr, expr])] as [string, any])
  ];
  describe('parse Interpolation', function () {
    for (const [input, expected] of InterpolationList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, 'Interpolation' as any), expected);
      });
    }
  });

  describe('parse unicode IdentifierStart', function () {
    for (const char of latin1IdentifierStartChars) {
      it(char, function () {
        assert.deepStrictEqual(parseExpression(char), createAccessScopeExpression(char, 0));
      });
    }
  });

  describe('parse unicode IdentifierPart', function () {
    for (const char of latin1IdentifierPartChars) {
      it(char, function () {
        const identifier = `$${char}`;
        assert.deepStrictEqual(parseExpression(identifier), createAccessScopeExpression(identifier, 0));
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
      });
    }

    it(`throw 'Unconsumed token' on "$this!"`, function () {
      verifyResultOrError(`$this!`, null, 'AUR0156');
    });
    for (const [input] of SimpleIsAssignList) {
      for (const op of [')', ']', '}']) {
        it(`throw 'Unconsumed token' on "${input}${op}"`, function () {
          verifyResultOrError(`${input}${op}`, null, 'AUR0156');
        });
      }
    }

    for (const input of ['..', '..a', '..1']) {
      it(`throw unexpectedDoubleDot on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0179');
      });
    }
    for (const input of ['.a.', '.a..']) {
      it(`throw unconsumedToken on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0156');
      });
    }

    // https://github.com/aurelia/aurelia/issues/808
    for (const token of [
      ')', ':', ',', ']',
    ]) {
      const accessScope = `\${a${token}}`;
      it(`throw unconsumedToken on interpolation "${accessScope}"`, function () {
        verifyResultOrError(accessScope, null, 'AUR0156', 'Interpolation');
      });

      const accessMember = `\${a.b${token}}`;
      it(`throw unconsumedToken on interpolation "${accessMember}"`, function () {
        verifyResultOrError(accessMember, null, 'AUR0156', 'Interpolation');
      });
    }
    for (const token of [
      '%', '*', '/', '>', '<',
      '=', '+=', '-=', '*=', '/=', '?', ' instanceof', ' in',
    ]) {
      const accessScope = `\${a${token}}`;
      it(`throw unexpectedEndOfExpression on interpolation "${accessScope}"`, function () {
        verifyResultOrError(accessScope, null, 'AUR0155', 'Interpolation');
      });

      const accessMember = `\${a.b${token}}`;
      it(`throw unexpectedEndOfExpression on interpolation "${accessMember}"`, function () {
        verifyResultOrError(accessMember, null, 'AUR0155', 'Interpolation');
      });
    }
    for (const token of [
      ' of',
    ]) {
      const accessScope = `\${a${token}}`;
      it(`throw unexpectedOfKeyword on interpolation "${accessScope}"`, function () {
        verifyResultOrError(accessScope, null, 'AUR0161', 'Interpolation');
      });

      const accessMember = `\${a.b${token}}`;
      it(`throw unexpectedOfKeyword on interpolation "${accessMember}"`, function () {
        verifyResultOrError(accessMember, null, 'AUR0161', 'Interpolation');
      });
    }

    for (const input of ['...', '...a', '...1']) {
      it(`throw invalidSpreadOp on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0152');
      });
    }

    for (const start of ['$this', '$parent', '$parent.$parent', 'a', '.1']) {
      for (const end of ['', 'a', '$parent', '1']) {
        it(`throw expectedIdentifier on "${start}..${end}"`, function () {
          verifyResultOrError(`${start}..${end}`, null, 'AUR0153');
        });

        it(`throw expectedIdentifier on "${start}...${end}"`, function () {
          verifyResultOrError(`${start}...${end}`, null, 'AUR0153');
        });
      }
    }

    for (const [input] of SimpleIsNativeLeftHandSideList) {
      it(`throw expectedIdentifier on "${input}.."`, function () {
        verifyResultOrError(`${input}..`, null, 'AUR0153');
      });
      it(`throw expectedIdentifier on "${input}..."`, function () {
        verifyResultOrError(`${input}...`, null, 'AUR0153');
      });
    }

    for (const nonTerminal of ['!', ' of', ' typeof', '=']) {
      it(`throw 'Invalid member expression' on "$parent${nonTerminal}"`, function () {
        verifyResultOrError(`$parent${nonTerminal}`, null, 'AUR0154');
      });
    }

    for (const op of ['!', '(', '+', '-', '++', '--', '.', '[', 'typeof']) {
      it(`throw 'Unexpected end of expression' on "${op}"`, function () {
        verifyResultOrError(op, null, 'AUR0155');
      });
    }

    for (const [input, expr] of SimpleIsLeftHandSideList) {
      it(`throw 'Expected identifier' on "${input}."`, function () {
        if (typeof expr['value'] !== 'number' || input.includes('.')) { // only non-float numbers are allowed to end on a dot
          verifyResultOrError(`${input}.`, null, 'AUR0153');
        } else {
          verifyResultOrError(`${input}.`, expr, null);
        }
      });
    }

    for (const input of ['.1.', '.1..']) {
      it(`throw'Expected identifier' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0153');
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList) {
      it(`throw 'Invalid BindingIdentifier at left hand side of "of"' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0163', 'IsIterator');
      });
    }
    for (const [input] of [
      [`a`, createBindingIdentifier('a')]
    ] as [string, any][]) {
      it(`throw 'Invalid BindingIdentifier at left hand side of "of"' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0163', 'IsIterator');
      });
    }

    for (const input of ['{', '{[]}', '{[}', '{[a]}', '{[a}', '{{', '{(']) {
      it(`throw 'Invalid or unsupported property definition in object literal' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0164');
      });
    }

    for (const input of ['"', '\'']) {
      it(`throw 'Unterminated quote in string literal' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0165');
      });
    }

    for (const input of ['`', '` ', `\`\${a}`]) {
      it(`throw 'Unterminated template string' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0166');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      for (const op of ['(', '[']) {
        it(`throw 'Missing expected token' on "${op}${input}"`, function () {
          verifyResultOrError(`${op}${input}`, null, 'AUR0167');
        });
      }
    }
    for (const [input] of SimpleIsConditionalList) {
      it(`throw 'Missing expected token' on "${input}?${input}"`, function () {
        verifyResultOrError(`${input}?${input}`, null, 'AUR0167');
      });
    }
    for (const [input] of AccessScopeList) {
      it(`throw 'Missing expected token' on "{${input}"`, function () {
        verifyResultOrError(`{${input}`, null, 'AUR0167');
      });
    }
    for (const [input] of SimpleStringLiteralList) {
      it(`throw 'Missing expected token' on "{${input}}"`, function () {
        verifyResultOrError(`{${input}}`, null, `AUR0167`);
      });
    }
    for (const input of ['{24}', '{24, 24}', '{\'\'}', '{a.b}', '{a[b]}', '{a()}']) {
      it(`throw 'Missing expected token' on "${input}"`, function () {
        verifyResultOrError(input, null, `AUR0167:${input}`);
      });
    }

    for (const input of ['#', '@', '^', '~', '\\']) {
      it(`throw 'Unexpected character' on "${input}"`, function () {
        verifyResultOrError(input, null, 'AUR0168');
      });
    }

    it(`throw 'Unexpected character' on ";"`, function () {
      verifyResultOrError(';', null, 'AUR0151');
    });

    it(`throw 'Unconsumed token' on "foo;"`, function () {
      verifyResultOrError('foo;', null, 'AUR0156');
    });

    it(`throw 'Unconsumed token' on "a of a;"`, function () {
      verifyResultOrError('a of a;', null, 'AUR0156', 'IsIterator');
    });

    for (const [input] of SimpleIsAssignList) {
      it(`throw 'Expected identifier to come after ValueConverter operator' on "${input}|"`, function () {
        verifyResultOrError(`${input}|`, null, 'AUR0159');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw 'Expected identifier to come after BindingBehavior operator' on "${input}&"`, function () {
        verifyResultOrError(`${input}&`, null, 'AUR0160');
      });
    }

    for (const [input] of [
      [`$this`, $this],
      ...SimpleLiteralList,
      ...SimpleUnaryList
    ]) {
      it(`throw 'Left hand side of expression is not assignable' on "${input}=a"`, function () {
        verifyResultOrError(`${input}=a`, null, `AUR0158:${input}=a`);
      });
      for (const op of binaryAssignment) {
        it(`throw 'Left hand side of expression is not assignable' on "${input}${op}a"`, function () {
          verifyResultOrError(`${input}${op}a`, null, `AUR0158:${input}${op}a`);
        });
      }
    }

    for (const [input] of SimpleIsBindingBehaviorList.filter(([, e]) => !e.ancestor)) {
      it(`throw 'Unexpected keyword "of"' on "${input} of"`, function () {
        verifyResultOrError(`${input} of`, null, 'AUR0161');
      });
    }

    for (const input of [`import`, `import()`, `import('foo')`, `import(foo)`, `import.foo`, `import.meta.url`]) {
      it(`throw 'Unexpected keyword "import"' on "${input} of"`, function () {
        verifyResultOrError(input, null, 'AUR0162');
      });
    }

    // missing => (need to verify when __DEV__ is enabled in test env)
    it(`throw missingExpectedToken on "()"`, function () {
      verifyResultOrError(`()`, null, 'AUR0167');
    });

    for (const input of [
      `(a[b]) => a`,
      `(a?.[b]) => a`,
      `(a.b) => a`,
      `(a?.b) => a`,
      `(a\`\`) => a`,
      `($this()) => a`,
      `(a()) => a`,
      `(a?.()) => a`,
      `(!a) => a`,
      `(a+b) => a`,
      `(a?b:c) => a`,

      `(a,a[b]) => a`,
      `(a,a?.[b]) => a`,
      `(a,a.b) => a`,
      `(a,a?.b) => a`,
      `(a,a\`\`) => a`,
      `(a,$this()) => a`,
      `(a,a()) => a`,
      `(a,a?.()) => a`,
      `(a,!a) => a`,
      `(a,a+b) => a`,
      `(a,a?b:c) => a`,
      `(a,b?) => a`,

      `(,) => a`,
      `(a,,) => a`,
      `(,a) => a`,
    ])
    it(`throw invalidArrowParameterList on "${input}"`, function () {
      verifyResultOrError(input, null, 'AUR0173');
    });

    for (const input of [
      // TODO: identify this as optional param?
      `(a?) => a`,
    ])
    it(`throw unconsumedToken on "${input}"`, function () {
      verifyResultOrError(input, null, 'AUR0156');
    });

    for (const input of [
      `(a=b) => a`,
      `(a,a=b) => a`,
    ])
    it(`throw defaultParamsInArrowFn on "${input}"`, function () {
      verifyResultOrError(input, null, 'AUR0174');
    });

    for (const input of [
      `({a}) => a`,
      `(a,{a}) => a`,
      `([a]) => a`,
      `(a,[a]) => a`,
    ])
    it(`throw destructuringParamsInArrowFn on "${input}"`, function () {
      verifyResultOrError(input, null, 'AUR0175');
    });

    for (const input of [
      `(...a,) => a`,
      `(...a,b) => a`,
    ])
    it(`throw restParamsMustBeLastParam on "${input}"`, function () {
      verifyResultOrError(input, null, 'AUR0176');
    });

    for (const input of [
      `() => {}`,
      `a => {}`,
      `(a) => {}`,
      `(a,b) => {}`,

      `() => {a}`,
      `a => {a}`,
      `(a) => {a}`,
      `(a,b) => {a}`,
    ])
    it(`throw functionBodyInArrowFN on "${input}"`, function () {
      verifyResultOrError(input, null, 'AUR0178');
    });
  });

  describe('unknown unicode IdentifierPart', function () {
    for (const char of otherBMPIdentifierPartChars) {
      it(char, function () {
        const identifier = `$${char}`;
        verifyResultOrError(identifier, null, 'AUR0168');
      });
    }
  });
});
