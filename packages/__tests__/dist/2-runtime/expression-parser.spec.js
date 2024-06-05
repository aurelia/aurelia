/* eslint-disable @typescript-eslint/no-loss-of-precision */
import { AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, ArrayLiteralExpression, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingIdentifier, CallFunctionExpression, CallMemberExpression, CallScopeExpression, ConditionalExpression, ForOfStatement, Interpolation, ObjectLiteralExpression, PrimitiveLiteralExpression, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverterExpression, parseExpression, DestructuringAssignmentExpression, DestructuringAssignmentSingleExpression, ArrowFunction, AccessBoundaryExpression, } from '@aurelia/expression-parser';
import { assert, } from '@aurelia/testing';
import { latin1IdentifierPartChars, latin1IdentifierStartChars, otherBMPIdentifierPartChars } from './unicode.js';
function createTaggedTemplate(cooked, func, expressions) {
    return new TaggedTemplateExpression(cooked, cooked, func, expressions);
}
const binaryMultiplicative = ['*', '%', '/'];
const binaryAdditive = ['+', '-'];
const binaryRelational = [
    ['<', '<'],
    ['<=', '<='],
    ['>', '>'],
    ['>=', '>='],
    ['in', ' in '],
    ['instanceof', ' instanceof '],
];
const binaryEquality = ['==', '!=', '===', '!=='];
const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $str = PrimitiveLiteralExpression.$empty;
const $tpl = TemplateExpression.$empty;
const $arr = ArrayLiteralExpression.$empty;
const $obj = ObjectLiteralExpression.$empty;
const $this = new AccessThisExpression(0);
const $parent = new AccessThisExpression(1);
const boundary = new AccessBoundaryExpression();
const $a = new AccessScopeExpression('a');
const $b = new AccessScopeExpression('b');
const $c = new AccessScopeExpression('c');
const $num0 = new PrimitiveLiteralExpression(0);
const $num1 = new PrimitiveLiteralExpression(1);
function verifyResultOrError(expr, expected, expectedMsg, exprType, name) {
    let error = null;
    let actual = null;
    try {
        actual = parseExpression(expr, exprType);
    }
    catch (e) {
        error = e;
    }
    if (expectedMsg == null) {
        if (error == null) {
            assert.deepStrictEqual(actual, expected, expr);
        }
        else {
            throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${exprType} parse successfully, but it threw "${error.message}"`);
        }
    }
    else {
        if (error == null) {
            throw new Error(`Expected expression "${expr}" with (${name}) ExpressionType.${exprType} to throw "${expectedMsg}", but no error was thrown`);
        }
        else {
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
    const AccessThisList = [
        [`$this`, $this],
        [`$parent`, $parent],
        [`$parent.$parent`, new AccessThisExpression(2)]
    ];
    const AccessBoundaryList = [
        [`this`, boundary],
    ];
    // 2. parsePrimaryExpression.IdentifierName
    const AccessScopeList = [
        ...AccessThisList.map(([input, expr]) => [`${input}.a`, new AccessScopeExpression('a', expr.ancestor)]),
        [`$this.$parent`, new AccessScopeExpression('$parent')],
        [`$parent.$this`, new AccessScopeExpression('$this', 1)],
        [`a`, $a]
    ];
    // 3. parsePrimaryExpression.Literal
    const SimpleStringLiteralList = [
        [`''`, $str],
        [`""`, $str]
    ];
    const SimpleNumberLiteralList = [
        [`1`, $num1],
        [`1.1`, new PrimitiveLiteralExpression(1.1)],
        [`.1`, new PrimitiveLiteralExpression(0.1)],
        [`0.1`, new PrimitiveLiteralExpression(0.1)]
    ];
    const KeywordPrimitiveLiteralList = [
        [`undefined`, $undefined],
        [`null`, $null],
        [`true`, $true],
        [`false`, $false]
    ];
    // concatenation of 3.
    const SimplePrimitiveLiteralList = [
        ...SimpleStringLiteralList,
        ...SimpleNumberLiteralList,
        ...KeywordPrimitiveLiteralList
    ];
    // 4. parsePrimaryExpression.ArrayLiteral
    const SimpleArrayLiteralList = [
        [`[]`, $arr]
    ];
    // 5. parsePrimaryExpression.ObjectLiteral
    const SimpleObjectLiteralList = [
        [`{}`, $obj]
    ];
    // 6. parsePrimaryExpression.TemplateLiteral
    const SimpleTemplateLiteralList = [
        [`\`\``, $tpl],
        [`\`\${a}\``, new TemplateExpression(['', ''], [$a])]
    ];
    // concatenation of 3., 4., 5., 6.
    const SimpleLiteralList = [
        ...SimplePrimitiveLiteralList,
        ...SimpleTemplateLiteralList,
        ...SimpleArrayLiteralList,
        ...SimpleObjectLiteralList
    ];
    // 7. parsePrimaryExpression.ParenthesizedExpression
    // Note: this is simply one of each precedence group, except for Primary because
    // parenthesized and primary are already from the same precedence group
    const SimpleParenthesizedList = [
        [`(a[b])`, new AccessKeyedExpression($a, $b)],
        [`(a?.[b])`, new AccessKeyedExpression($a, $b, true)],
        [`(a.b)`, new AccessMemberExpression($a, 'b')],
        [`(a?.b)`, new AccessMemberExpression($a, 'b', true)],
        [`(a\`\`)`, createTaggedTemplate([''], $a, [])],
        [`($this())`, new CallFunctionExpression($this, [])],
        [`(a())`, new CallScopeExpression('a', [])],
        [`(a?.())`, new CallScopeExpression('a', [], 0, true)],
        [`(!a)`, new UnaryExpression('!', $a)],
        [`(a+b)`, new BinaryExpression('+', $a, $b)],
        [`(a?b:c)`, new ConditionalExpression($a, $b, new AccessScopeExpression('c'))],
        [`(a=b)`, new AssignExpression($a, $b)],
        [`(a=>a)`, new ArrowFunction([new BindingIdentifier('a')], $a)],
        [`({})`, new ObjectLiteralExpression([], [])],
        [`({a})`, new ObjectLiteralExpression(['a'], [$a])],
    ];
    // concatenation of 1 through 7 (all Primary expressions)
    // This forms the group Precedence.Primary
    const SimplePrimaryList = [
        ...AccessThisList,
        ...AccessScopeList,
        ...SimpleLiteralList,
        ...SimpleParenthesizedList
    ];
    // 1. parseMemberExpression.MemberExpression [ AssignmentExpression ]
    const SimpleAccessKeyedList = [
        ...SimplePrimaryList
            .map(([input, expr]) => [`${input}[b]`, new AccessKeyedExpression(expr, $b)])
    ];
    // 2. parseMemberExpression.MemberExpression . IdentifierName
    const SimpleAccessMemberList = [
        ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
            .map(([input, expr]) => [`${input}.b`, new AccessMemberExpression(expr, 'b')])
    ];
    // 3. parseMemberExpression.MemberExpression TemplateLiteral
    const SimpleTaggedTemplateList = [
        ...SimplePrimaryList
            .map(([input, expr]) => [`${input}\`\``, createTaggedTemplate([''], expr, [])]),
        ...SimplePrimaryList
            .map(([input, expr]) => [`${input}\`\${a}\``, createTaggedTemplate(['', ''], expr, [$a])])
    ];
    // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
    const SimpleCallFunctionList = [
        ...[...AccessThisList, ...SimpleLiteralList]
            .map(([input, expr]) => [`${input}()`, new CallFunctionExpression(expr, [])])
    ];
    // 2. parseCallExpression.MemberExpression Arguments
    const SimpleCallScopeList = [
        ...[...AccessScopeList]
            .map(([input, expr]) => [`${input}()`, new CallScopeExpression(expr.name, [], expr.ancestor)])
    ];
    // 3. parseCallExpression.MemberExpression Arguments
    const SimpleCallMemberList = [
        ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
            .map(([input, expr]) => [`${input}.b()`, new CallMemberExpression(expr, 'b', [])])
    ];
    // 1. parseOptionalExpression.MemberExpression ?. [ AssignmentExpression ]
    const SimpleOptionalAccessKeyedList = [
        ...[...SimplePrimaryList, ...AccessBoundaryList]
            .map(([input, expr]) => [`${input}?.[b]`, new AccessKeyedExpression(expr, $b, true)])
    ];
    // 2. parseOptionalExpression.MemberExpression ?. IdentifierName
    const SimpleOptionalAccessMemberList = [
        ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
            .map(([input, expr]) => [`${input}?.b`, new AccessMemberExpression(expr, 'b', true)]),
        [`a?.b?.c?.d`, new AccessMemberExpression(new AccessMemberExpression(new AccessMemberExpression($a, 'b', true), 'c', true), 'd', true)]
    ];
    // 3. parseOptionalExpression.MemberExpression ?. Arguments
    const SimpleOptionalCallFunctionList = [
        ...[...AccessThisList, ...SimpleLiteralList]
            .map(([input, expr]) => [`${input}?.()`, new CallFunctionExpression(expr, [], true)])
    ];
    // 4. parseOptionalExpression.MemberExpression ?. Arguments
    const SimpleOptionalCallScopeList = [
        ...[...AccessScopeList]
            .map(([input, expr]) => [`${input}?.()`, new CallScopeExpression(expr.name, [], expr.ancestor, true)])
    ];
    // 5. parseOptionalExpression.MemberExpression IdentifierName ?. Arguments
    //                            MemberExpression ?. IdentifierName Arguments
    //                            MemberExpression ?. IdentifierName ?. Arguments
    const SimpleOptionalCallMemberList = [
        ...[...AccessScopeList, ...SimpleLiteralList, ...AccessBoundaryList]
            .map(([input, expr]) => [
            [`${input}.b?.()`, new CallMemberExpression(expr, 'b', [], false, true)],
            [`${input}?.b()`, new CallMemberExpression(expr, 'b', [], true, false)],
            [`${input}?.b?.()`, new CallMemberExpression(expr, 'b', [], true, true)],
        ]).reduce((acc, cur) => acc.concat(cur))
    ];
    // concatenation of 1-3 of MemberExpression,  1-3 of CallExpression and 1-5 of OptionalExpression
    const SimpleLeftHandSideList = [
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
    const SimpleIsLeftHandSideList = [
        ...SimplePrimaryList,
        ...AccessBoundaryList,
        ...SimpleLeftHandSideList
    ];
    // same as SimpleIsLeftHandSideList but without $parent and $this (ergo, LeftHandSide according to the actual spec)
    const SimpleIsNativeLeftHandSideList = [
        ...AccessScopeList,
        ...AccessBoundaryList,
        ...SimpleLiteralList,
        ...SimpleParenthesizedList,
        ...SimpleLeftHandSideList
    ];
    // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
    const SimpleUnaryList = [
        [`!$1`, new UnaryExpression('!', new AccessScopeExpression('$1'))],
        [`-$2`, new UnaryExpression('-', new AccessScopeExpression('$2'))],
        [`+$3`, new UnaryExpression('+', new AccessScopeExpression('$3'))],
        [`void $4`, new UnaryExpression('void', new AccessScopeExpression('$4'))],
        [`typeof $5`, new UnaryExpression('typeof', new AccessScopeExpression('$5'))]
    ];
    // concatenation of UnaryExpression + LeftHandSide
    // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
    const SimpleIsUnaryList = [
        ...SimpleIsLeftHandSideList,
        ...SimpleUnaryList
    ];
    // This forms the group Precedence.Multiplicative
    const SimpleMultiplicativeList = [
        [`$6*$7`, new BinaryExpression('*', new AccessScopeExpression('$6'), new AccessScopeExpression('$7'))],
        [`$8%$9`, new BinaryExpression('%', new AccessScopeExpression('$8'), new AccessScopeExpression('$9'))],
        [`$10/$11`, new BinaryExpression('/', new AccessScopeExpression('$10'), new AccessScopeExpression('$11'))]
    ];
    const SimpleIsMultiplicativeList = [
        ...SimpleIsUnaryList,
        ...SimpleMultiplicativeList
    ];
    // This forms the group Precedence.Additive
    const SimpleAdditiveList = [
        [`$12+$13`, new BinaryExpression('+', new AccessScopeExpression('$12'), new AccessScopeExpression('$13'))],
        [`$14-$15`, new BinaryExpression('-', new AccessScopeExpression('$14'), new AccessScopeExpression('$15'))]
    ];
    const SimpleIsAdditiveList = [
        ...SimpleIsMultiplicativeList,
        ...SimpleAdditiveList
    ];
    // This forms the group Precedence.Relational
    const SimpleRelationalList = [
        [`$16<$17`, new BinaryExpression('<', new AccessScopeExpression('$16'), new AccessScopeExpression('$17'))],
        [`$18>$19`, new BinaryExpression('>', new AccessScopeExpression('$18'), new AccessScopeExpression('$19'))],
        [`$20<=$21`, new BinaryExpression('<=', new AccessScopeExpression('$20'), new AccessScopeExpression('$21'))],
        [`$22>=$23`, new BinaryExpression('>=', new AccessScopeExpression('$22'), new AccessScopeExpression('$23'))],
        [`$24 in $25`, new BinaryExpression('in', new AccessScopeExpression('$24'), new AccessScopeExpression('$25'))],
        [`$26 instanceof $27`, new BinaryExpression('instanceof', new AccessScopeExpression('$26'), new AccessScopeExpression('$27'))]
    ];
    const SimpleIsRelationalList = [
        ...SimpleIsAdditiveList,
        ...SimpleRelationalList
    ];
    // This forms the group Precedence.Equality
    const SimpleEqualityList = [
        [`$28==$29`, new BinaryExpression('==', new AccessScopeExpression('$28'), new AccessScopeExpression('$29'))],
        [`$30!=$31`, new BinaryExpression('!=', new AccessScopeExpression('$30'), new AccessScopeExpression('$31'))],
        [`$32===$33`, new BinaryExpression('===', new AccessScopeExpression('$32'), new AccessScopeExpression('$33'))],
        [`$34!==$35`, new BinaryExpression('!==', new AccessScopeExpression('$34'), new AccessScopeExpression('$35'))]
    ];
    const SimpleIsEqualityList = [
        ...SimpleIsRelationalList,
        ...SimpleEqualityList
    ];
    // This forms the group Precedence.LogicalAND
    const SimpleLogicalANDList = [
        [`$36&&$37`, new BinaryExpression('&&', new AccessScopeExpression('$36'), new AccessScopeExpression('$37'))]
    ];
    const SimpleIsLogicalANDList = [
        ...SimpleIsEqualityList,
        ...SimpleLogicalANDList
    ];
    // This forms the group Precedence.LogicalOR
    const SimpleLogicalORList = [
        [`$38||$39`, new BinaryExpression('||', new AccessScopeExpression('$38'), new AccessScopeExpression('$39'))]
    ];
    const SimpleIsLogicalORList = [
        ...SimpleIsLogicalANDList,
        ...SimpleLogicalORList
    ];
    // This forms the group Precedence.NullishCoalescing
    const SimpleNullishCoalescingList = [
        [`$38??$39`, new BinaryExpression('??', new AccessScopeExpression('$38'), new AccessScopeExpression('$39'))]
    ];
    const SimpleIsNullishCoalescingList = [
        ...SimpleIsLogicalORList,
        ...SimpleNullishCoalescingList
    ];
    // This forms the group Precedence.Conditional
    const SimpleConditionalList = [
        [`a?b:c`, new ConditionalExpression($a, $b, new AccessScopeExpression('c'))]
    ];
    const SimpleIsConditionalList = [
        ...SimpleIsNullishCoalescingList,
        ...SimpleConditionalList
    ];
    // This forms the group Precedence.Assign
    const SimpleAssignList = [
        [`a=b`, new AssignExpression($a, $b)]
    ];
    const SimpleArrowList = [
        [`(a) => a`, new ArrowFunction([new BindingIdentifier('a')], $a)],
        [`(...a) => a`, new ArrowFunction([new BindingIdentifier('a')], $a, true)],
        [`(a, b) => a`, new ArrowFunction([new BindingIdentifier('a'), new BindingIdentifier('b')], $a)],
        [`(a, ...b) => a`, new ArrowFunction([new BindingIdentifier('a'), new BindingIdentifier('b')], $a, true)],
        [`a => a`, new ArrowFunction([new BindingIdentifier('a')], $a)],
        [`() => 0`, new ArrowFunction([], $num0)],
    ];
    const SimpleIsAssignList = [
        ...SimpleIsConditionalList,
        ...SimpleArrowList,
        ...SimpleAssignList,
    ];
    // This forms the group Precedence.Variadic
    const SimpleValueConverterList = [
        [`a|b`, new ValueConverterExpression($a, 'b', [])],
        [`a|b:c`, new ValueConverterExpression($a, 'b', [new AccessScopeExpression('c')])],
        [`a|b:c:d`, new ValueConverterExpression($a, 'b', [new AccessScopeExpression('c'), new AccessScopeExpression('d')])]
    ];
    const SimpleIsValueConverterList = [
        ...SimpleIsAssignList,
        ...SimpleValueConverterList
    ];
    const SimpleBindingBehaviorList = [
        [`a&b`, new BindingBehaviorExpression($a, 'b', [])],
        [`a&b:c`, new BindingBehaviorExpression($a, 'b', [new AccessScopeExpression('c')])],
        [`a&b:c:d`, new BindingBehaviorExpression($a, 'b', [new AccessScopeExpression('c'), new AccessScopeExpression('d')])]
    ];
    const SimpleIsBindingBehaviorList = [
        ...SimpleIsValueConverterList,
        ...SimpleBindingBehaviorList
    ];
    for (const [exprType, name] of [
        [undefined, 'undefined'],
        ['IsProperty', 'IsProperty'],
        ['IsFunction', 'call command'],
    ]) {
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
        [`\\'`, `'`],
        [`\\"`, `"`],
        [`\\f`, `\f`],
        [`\\n`, `\n`],
        [`\\r`, `\r`],
        [`\\t`, `\t`],
        [`\\b`, `\b`],
        [`\\v`, `\v`]
    ].map(([raw, cooked]) => [
        [raw, cooked],
        [`${raw}`, `${cooked}`],
        [`x${raw}`, `x${cooked}`],
        [`${raw}x`, `${cooked}x`],
        [`x${raw}x`, `x${cooked}x`]
    ]).reduce((acc, cur) => acc.concat(cur));
    // Verify all string escapes, unicode characters, double and single quotes
    const ComplexStringLiteralList = [
        ...[
            ['foo', new PrimitiveLiteralExpression('foo')],
            ['äöüÄÖÜß', new PrimitiveLiteralExpression('äöüÄÖÜß')],
            ['ಠ_ಠ', new PrimitiveLiteralExpression('ಠ_ಠ')],
            ...stringEscapables.map(([raw, cooked]) => [raw, new PrimitiveLiteralExpression(cooked)])
        ].map(([input, expr]) => [
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
    const ComplexNumberList = [
        ['9007199254740992', new PrimitiveLiteralExpression(9007199254740992)],
        ['0.9007199254740992', new PrimitiveLiteralExpression(0.9007199254740992)],
        ['.9007199254740992', new PrimitiveLiteralExpression(0.9007199254740992)],
        ['.90071992547409929007199254740992', new PrimitiveLiteralExpression(0.90071992547409929007199254740992)],
        ['9007199254740992.9007199254740992', new PrimitiveLiteralExpression(9007199254740992.9007199254740992)],
        ['9007199254740992.90071992547409929007199254740992', new PrimitiveLiteralExpression(9007199254740992.90071992547409929007199254740992)],
        ['90071992547409929007199254740992', new PrimitiveLiteralExpression(90071992547409929007199254740992)],
        ['90071992547409929007199254740992.9007199254740992', new PrimitiveLiteralExpression(90071992547409929007199254740992.9007199254740992)],
        ['90071992547409929007199254740992.90071992547409929007199254740992', new PrimitiveLiteralExpression(90071992547409929007199254740992.90071992547409929007199254740992)]
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
    const ComplexTemplateLiteralList = [
        [`\`a\``, new TemplateExpression(['a'], [])],
        [`\`\\\${a}\``, new TemplateExpression([`\${a}`], [])],
        [`\`$a\``, new TemplateExpression(['$a'], [])],
        [`\`\${a}\${b}\``, new TemplateExpression(['', '', ''], [$a, $b])],
        [`\`a\${a}\${b}\``, new TemplateExpression(['a', '', ''], [$a, $b])],
        [`\`\${a}a\${b}\``, new TemplateExpression(['', 'a', ''], [$a, $b])],
        [`\`a\${a}a\${b}\``, new TemplateExpression(['a', 'a', ''], [$a, $b])],
        [`\`\${a}\${b}a\``, new TemplateExpression(['', '', 'a'], [$a, $b])],
        [`\`\${a}a\${b}a\``, new TemplateExpression(['', 'a', 'a'], [$a, $b])],
        [`\`a\${a}a\${b}a\``, new TemplateExpression(['a', 'a', 'a'], [$a, $b])],
        [`\`\${\`\${a}\`}\``, new TemplateExpression(['', ''], [new TemplateExpression(['', ''], [$a])])],
        [`\`\${\`a\${a}\`}\``, new TemplateExpression(['', ''], [new TemplateExpression(['a', ''], [$a])])],
        [`\`\${\`\${a}a\`}\``, new TemplateExpression(['', ''], [new TemplateExpression(['', 'a'], [$a])])],
        [`\`\${\`a\${a}a\`}\``, new TemplateExpression(['', ''], [new TemplateExpression(['a', 'a'], [$a])])],
        [`\`\${\`\${\`\${a}\`}\`}\``, new TemplateExpression(['', ''], [new TemplateExpression(['', ''], [new TemplateExpression(['', ''], [$a])])])],
        ...stringEscapables.map(([raw, cooked]) => [
            [`\`${raw}\``, new TemplateExpression([cooked], [])],
            [`\`\${a}${raw}\``, new TemplateExpression(['', cooked], [$a])],
            [`\`${raw}\${a}\``, new TemplateExpression([cooked, ''], [$a])],
            [`\`${raw}\${a}${raw}\``, new TemplateExpression([cooked, cooked], [$a])],
            [`\`\${a}${raw}\${a}\``, new TemplateExpression(['', cooked, ''], [$a, $a])],
        ]).reduce((acc, cur) => acc.concat(cur)),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`\`\${${input}}\``, new TemplateExpression(['', ''], [expr])]),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`\`\${${input}}\${${input}}\``, new TemplateExpression(['', '', ''], [expr, expr])])
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
    const ComplexArrayLiteralList = [
        [`[,]`, new ArrayLiteralExpression([$undefined])],
        [`[,,]`, new ArrayLiteralExpression([$undefined, $undefined])],
        [`[,,,]`, new ArrayLiteralExpression([$undefined, $undefined, $undefined])],
        [`[a,]`, new ArrayLiteralExpression([$a])],
        [`[a,,]`, new ArrayLiteralExpression([$a, $undefined])],
        [`[a,a,]`, new ArrayLiteralExpression([$a, $a])],
        [`[a,,,]`, new ArrayLiteralExpression([$a, $undefined, $undefined])],
        [`[a,a,,]`, new ArrayLiteralExpression([$a, $a, $undefined])],
        [`[,a]`, new ArrayLiteralExpression([$undefined, $a])],
        [`[,a,]`, new ArrayLiteralExpression([$undefined, $a])],
        [`[,a,,]`, new ArrayLiteralExpression([$undefined, $a, $undefined])],
        [`[,a,a,]`, new ArrayLiteralExpression([$undefined, $a, $a])],
        [`[,,a]`, new ArrayLiteralExpression([$undefined, $undefined, $a])],
        [`[,a,a]`, new ArrayLiteralExpression([$undefined, $a, $a])],
        [`[,,a,]`, new ArrayLiteralExpression([$undefined, $undefined, $a])],
        [`[,,,a]`, new ArrayLiteralExpression([$undefined, $undefined, $undefined, $a])],
        [`[,,a,a]`, new ArrayLiteralExpression([$undefined, $undefined, $a, $a])],
        ...SimpleIsAssignList.map(([input, expr]) => [
            [`[${input}]`, new ArrayLiteralExpression([expr])],
            [`[${input},${input}]`, new ArrayLiteralExpression([expr, expr])]
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
    const ComplexObjectLiteralList = [
        [`{a}`, new ObjectLiteralExpression(['a'], [$a])],
        [`{a:a}`, new ObjectLiteralExpression(['a'], [$a])],
        [`{'a':a}`, new ObjectLiteralExpression(['a'], [$a])],
        [`{"a":a}`, new ObjectLiteralExpression(['a'], [$a])],
        [`{1:a}`, new ObjectLiteralExpression([1], [$a])],
        [`{'1':a}`, new ObjectLiteralExpression(['1'], [$a])],
        [`{"1":a}`, new ObjectLiteralExpression(['1'], [$a])],
        [`{'a':a,b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{"a":a,b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{1:a,b}`, new ObjectLiteralExpression([1, 'b'], [$a, $b])],
        [`{'1':a,b}`, new ObjectLiteralExpression(['1', 'b'], [$a, $b])],
        [`{"1":a,b}`, new ObjectLiteralExpression(['1', 'b'], [$a, $b])],
        [`{a,'b':b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{a,"b":b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{a,1:b}`, new ObjectLiteralExpression(['a', 1], [$a, $b])],
        [`{a,'1':b}`, new ObjectLiteralExpression(['a', '1'], [$a, $b])],
        [`{a,"1":b}`, new ObjectLiteralExpression(['a', '1'], [$a, $b])],
        [`{a,b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{a:a,b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{a,b:b}`, new ObjectLiteralExpression(['a', 'b'], [$a, $b])],
        [`{a:a,b,c}`, new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
        [`{a,b:b,c}`, new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
        [`{a,b,c:c}`, new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
        [`{a:a,b:b,c}`, new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
        [`{a:a,b,c:c}`, new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
        [`{a,b:b,c:c}`, new ObjectLiteralExpression(['a', 'b', 'c'], [$a, $b, $c])],
        ...SimpleIsAssignList.map(([input, expr]) => [
            [`{a:${input}}`, new ObjectLiteralExpression(['a'], [expr])],
            [`{a:${input},b:${input}}`, new ObjectLiteralExpression(['a', 'b'], [expr, expr])]
        ]).reduce((acc, cur) => acc.concat(cur))
    ];
    describe('parse ComplexObjectLiteralList', function () {
        for (const [input, expected] of ComplexObjectLiteralList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexAccessKeyedList = [
        ...SimpleIsAssignList.map(([input, expr]) => [
            [`a[${input}]`, new AccessKeyedExpression($a, expr)],
            [`a?.[${input}]`, new AccessKeyedExpression($a, expr, true)],
        ]).reduce((acc, cur) => acc.concat(cur))
    ];
    describe('parse ComplexAccessKeyedList', function () {
        for (const [input, expected] of ComplexAccessKeyedList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexAccessMemberList = [
        ...[
            ...KeywordPrimitiveLiteralList,
            [`typeof`],
            [`void`],
            [`$this`],
            [`$parent`],
            [`in`],
            [`instanceof`],
            [`of`]
        ]
            .map(([input]) => [
            [`a.${input}`, new AccessMemberExpression($a, input)],
            [`a?.${input}`, new AccessMemberExpression($a, input, true)],
        ]).reduce((acc, cur) => acc.concat(cur))
    ];
    describe('parse ComplexAccessMemberList', function () {
        for (const [input, expected] of ComplexAccessMemberList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexTaggedTemplateList = [
        [`a\`a\``, createTaggedTemplate(['a'], $a, [])],
        [`a\`\\\${a}\``, createTaggedTemplate([`\${a}`], $a, [])],
        [`a\`$a\``, createTaggedTemplate(['$a'], $a, [])],
        [`a\`\${b}\${c}\``, createTaggedTemplate(['', '', ''], $a, [$b, $c])],
        [`a\`a\${b}\${c}\``, createTaggedTemplate(['a', '', ''], $a, [$b, $c])],
        [`a\`\${b}a\${c}\``, createTaggedTemplate(['', 'a', ''], $a, [$b, $c])],
        [`a\`a\${b}a\${c}\``, createTaggedTemplate(['a', 'a', ''], $a, [$b, $c])],
        [`a\`\${b}\${c}a\``, createTaggedTemplate(['', '', 'a'], $a, [$b, $c])],
        [`a\`\${b}a\${c}a\``, createTaggedTemplate(['', 'a', 'a'], $a, [$b, $c])],
        [`a\`a\${b}a\${c}a\``, createTaggedTemplate(['a', 'a', 'a'], $a, [$b, $c])],
        [`a\`\${\`\${a}\`}\``, createTaggedTemplate(['', ''], $a, [new TemplateExpression(['', ''], [$a])])],
        [`a\`\${\`a\${a}\`}\``, createTaggedTemplate(['', ''], $a, [new TemplateExpression(['a', ''], [$a])])],
        [`a\`\${\`\${a}a\`}\``, createTaggedTemplate(['', ''], $a, [new TemplateExpression(['', 'a'], [$a])])],
        [`a\`\${\`a\${a}a\`}\``, createTaggedTemplate(['', ''], $a, [new TemplateExpression(['a', 'a'], [$a])])],
        [`a\`\${\`\${\`\${a}\`}\`}\``, createTaggedTemplate(['', ''], $a, [new TemplateExpression(['', ''], [new TemplateExpression(['', ''], [$a])])])],
        ...stringEscapables.map(([raw, cooked]) => [
            [`a\`${raw}\``, createTaggedTemplate([cooked], $a, [])],
            [`a\`\${a}${raw}\``, createTaggedTemplate(['', cooked], $a, [$a])],
            [`a\`${raw}\${a}\``, createTaggedTemplate([cooked, ''], $a, [$a])],
            [`a\`${raw}\${a}${raw}\``, createTaggedTemplate([cooked, cooked], $a, [$a])],
            [`a\`\${a}${raw}\${a}\``, createTaggedTemplate(['', cooked, ''], $a, [$a, $a])],
        ]).reduce((acc, cur) => acc.concat(cur)),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`a\`\${${input}}\``, createTaggedTemplate(['', ''], $a, [expr])]),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`a\`\${${input}}\${${input}}\``, createTaggedTemplate(['', '', ''], $a, [expr, expr])])
    ];
    describe('parse ComplexTaggedTemplateList', function () {
        for (const [input, expected] of ComplexTaggedTemplateList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexCallFunctionList = [
        ...SimpleIsAssignList
            .map(([input, expr]) => [
            [`$this(${input})`, new CallFunctionExpression($this, [expr])],
            [`$this?.(${input})`, new CallFunctionExpression($this, [expr], true)],
        ]).reduce((acc, cur) => acc.concat(cur)),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`$this(${input},${input})`, new CallFunctionExpression($this, [expr, expr])])
    ];
    describe('parse ComplexCallFunctionList', function () {
        for (const [input, expected] of ComplexCallFunctionList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexCallScopeList = [
        ...SimpleIsAssignList
            .map(([input, expr]) => [
            [`a(${input})`, new CallScopeExpression('a', [expr])],
            [`a?.(${input})`, new CallScopeExpression('a', [expr], 0, true)],
        ]).reduce((acc, cur) => acc.concat(cur)),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`a(${input},${input})`, new CallScopeExpression('a', [expr, expr])])
    ];
    describe('parse ComplexCallScopeList', function () {
        for (const [input, expected] of ComplexCallScopeList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexCallMemberList = [
        ...SimpleIsAssignList
            .map(([input, expr]) => [
            [`a.b(${input})`, new CallMemberExpression($a, 'b', [expr], false, false)],
            [`a?.b(${input})`, new CallMemberExpression($a, 'b', [expr], true, false)],
            [`a.b?.(${input})`, new CallMemberExpression($a, 'b', [expr], false, true)],
            [`a?.b?.(${input})`, new CallMemberExpression($a, 'b', [expr], true, true)],
        ]).reduce((acc, cur) => acc.concat(cur)),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`a.b(${input},${input})`, new CallMemberExpression($a, 'b', [expr, expr])]),
        [`a?.b?.c?.()`, new CallMemberExpression(new AccessMemberExpression($a, 'b', true), 'c', [], true, true)],
        [`a.b?.c?.()`, new CallMemberExpression(new AccessMemberExpression($a, 'b', false), 'c', [], true, true)],
        [`a?.b.c?.()`, new CallMemberExpression(new AccessMemberExpression($a, 'b', true), 'c', [], false, true)],
        [`a?.b?.c()`, new CallMemberExpression(new AccessMemberExpression($a, 'b', true), 'c', [], true, false)],
        [`a?.b?.()()`, new CallFunctionExpression(new CallMemberExpression($a, 'b', [], true, true), [], false)],
        [`a?.b?.().c()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, true), 'c', [], false, false)],
        [`a?.b?.()?.c()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, true), 'c', [], true, false)],
        [`a?.b?.().c?.()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, true), 'c', [], false, true)],
        [`a?.b?.()?.c?.()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, true), 'c', [], true, true)],
        [`a?.b?.()?.()`, new CallFunctionExpression(new CallMemberExpression($a, 'b', [], true, true), [], true)],
        [`a?.b()()`, new CallFunctionExpression(new CallMemberExpression($a, 'b', [], true, false), [], false)],
        [`a?.b().c()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, false), 'c', [], false, false)],
        [`a?.b()?.c()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, false), 'c', [], true, false)],
        [`a?.b().c?.()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, false), 'c', [], false, true)],
        [`a?.b()?.c?.()`, new CallMemberExpression(new CallMemberExpression($a, 'b', [], true, false), 'c', [], true, true)],
        [`a?.b()?.()`, new CallFunctionExpression(new CallMemberExpression($a, 'b', [], true, false), [], true)],
    ];
    describe('parse ComplexCallMemberList', function () {
        for (const [input, expected] of ComplexCallMemberList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexUnaryList = [
        ...SimpleIsLeftHandSideList
            .map(([input, expr]) => [`!${input}`, new UnaryExpression('!', expr)]),
        ...SimpleIsLeftHandSideList
            .map(([input, expr]) => [`+${input}`, new UnaryExpression('+', expr)]),
        ...SimpleIsLeftHandSideList
            .map(([input, expr]) => [`-${input}`, new UnaryExpression('-', expr)]),
        ...SimpleIsLeftHandSideList
            .map(([input, expr]) => [`void ${input}`, new UnaryExpression('void', expr)]),
        ...SimpleIsLeftHandSideList
            .map(([input, expr]) => [`typeof ${input}`, new UnaryExpression('typeof', expr)])
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
    const ComplexMultiplicativeList = [
        ...binaryMultiplicative.map(op => [
            ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`${i1}${op}a`, new BinaryExpression(op, e1, $a)]),
            ...SimpleIsUnaryList.map(([i1, e1]) => [`a${op}${i1}`, new BinaryExpression(op, $a, e1)]),
            ...SimpleUnaryList
                .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i2}${op}${i1}`, new BinaryExpression(op, e2, e1)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleMultiplicativeList
                .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleAdditiveList
                .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
                .reduce((a, b) => a.concat(b))
        ]).reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexMultiplicativeList', function () {
        for (const [input, expected] of ComplexMultiplicativeList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexAdditiveList = [
        ...binaryAdditive.map(op => [
            ...SimpleIsAdditiveList.map(([i1, e1]) => [`${i1}${op}a`, new BinaryExpression(op, e1, $a)]),
            ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`a${op}${i1}`, new BinaryExpression(op, $a, e1)]),
            ...SimpleMultiplicativeList
                .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i2}${op}${i1}`, new BinaryExpression(op, e2, e1)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleAdditiveList
                .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleRelationalList
                .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
                .reduce((a, b) => a.concat(b))
        ]).reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexAdditiveList', function () {
        for (const [input, expected] of ComplexAdditiveList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexRelationalList = [
        ...binaryRelational.map(([op, txt]) => [
            ...SimpleIsRelationalList.map(([i1, e1]) => [`${i1}${txt}a`, new BinaryExpression(op, e1, $a)]),
            ...SimpleIsAdditiveList.map(([i1, e1]) => [`a${txt}${i1}`, new BinaryExpression(op, $a, e1)]),
            ...SimpleAdditiveList
                .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i2}${txt}${i1}`, new BinaryExpression(op, e2, e1)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleRelationalList
                .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleEqualityList
                .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
                .reduce((a, b) => a.concat(b))
        ]).reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexRelationalList', function () {
        for (const [input, expected] of ComplexRelationalList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexEqualityList = [
        ...binaryEquality.map(op => [
            ...SimpleIsEqualityList.map(([i1, e1]) => [`${i1}${op}a`, new BinaryExpression(op, e1, $a)]),
            ...SimpleIsRelationalList.map(([i1, e1]) => [`a${op}${i1}`, new BinaryExpression(op, $a, e1)]),
            ...SimpleRelationalList
                .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i2}${op}${i1}`, new BinaryExpression(op, e2, e1)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleEqualityList
                .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e2.operation, new BinaryExpression(op, new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
                .reduce((a, b) => a.concat(b)),
            ...SimpleLogicalANDList
                .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression(op, e1.right, e2.left), e2.right))]))
                .reduce((a, b) => a.concat(b))
        ]).reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexEqualityList', function () {
        for (const [input, expected] of ComplexEqualityList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexLogicalANDList = [
        ...SimpleIsLogicalANDList.map(([i1, e1]) => [`${i1}&&a`, new BinaryExpression('&&', e1, $a)]),
        ...SimpleIsEqualityList.map(([i1, e1]) => [`a&&${i1}`, new BinaryExpression('&&', $a, e1)]),
        ...SimpleEqualityList
            .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i2}&&${i1}`, new BinaryExpression('&&', e2, e1)]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleLogicalANDList
            .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new BinaryExpression(e2.operation, new BinaryExpression('&&', new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleLogicalORList
            .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression('&&', e1.right, e2.left), e2.right))]))
            .reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexLogicalANDList', function () {
        for (const [input, expected] of ComplexLogicalANDList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexLogicalORList = [
        ...SimpleIsLogicalORList.map(([i1, e1]) => [`${i1}||a`, new BinaryExpression('||', e1, $a)]),
        ...SimpleIsLogicalANDList.map(([i1, e1]) => [`a||${i1}`, new BinaryExpression('||', $a, e1)]),
        ...SimpleLogicalANDList
            .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i2}||${i1}`, new BinaryExpression('||', e2, e1)]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleLogicalORList
            .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new BinaryExpression(e2.operation, new BinaryExpression('||', new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleNullishCoalescingList
            .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new BinaryExpression(e1.operation, e1.left, new BinaryExpression(e2.operation, new BinaryExpression('||', e1.right, e2.left), e2.right))]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleConditionalList
            .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new ConditionalExpression(e1.condition, e1.yes, new BinaryExpression(e2.operation, new BinaryExpression('||', e1.no, e2.left), e2.right))]))
            .reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexLogicalORList', function () {
        for (const [input, expected] of ComplexLogicalORList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexNullishCoalescingList = [
        ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`${i1}??a`, new BinaryExpression('??', e1, $a)]),
        ...SimpleIsLogicalORList.map(([i1, e1]) => [`a??${i1}`, new BinaryExpression('??', $a, e1)]),
        ...SimpleLogicalORList
            .map(([i1, e1]) => SimpleNullishCoalescingList.map(([i2, e2]) => [`${i2}??${i1}`, new BinaryExpression('??', e2, e1)]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleNullishCoalescingList
            .map(([i1, e1]) => SimpleNullishCoalescingList.map(([i2, e2]) => [`${i1}??${i2}`, new BinaryExpression(e2.operation, new BinaryExpression('??', new BinaryExpression(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
            .reduce((a, b) => a.concat(b)),
        ...SimpleConditionalList
            .map(([i1, e1]) => SimpleNullishCoalescingList.map(([i2, e2]) => [`${i1}??${i2}`, new ConditionalExpression(e1.condition, e1.yes, new BinaryExpression(e2.operation, new BinaryExpression('??', e1.no, e2.left), e2.right))]))
            .reduce((a, b) => a.concat(b))
    ];
    describe('parse ComplexNullishCoalescingList', function () {
        for (const [input, expected] of ComplexNullishCoalescingList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexConditionalList = [
        ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`${i1}?0:1`, new ConditionalExpression(e1, $num0, $num1)]),
        ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`0?${i1}:1`, new ConditionalExpression($num0, e1, $num1)]),
        ...SimpleIsNullishCoalescingList.map(([i1, e1]) => [`0?1:${i1}`, new ConditionalExpression($num0, $num1, e1)]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`0?1:${i1}`, new ConditionalExpression($num0, $num1, e1)]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`0?${i1}:1`, new ConditionalExpression($num0, e1, $num1)]),
        ...SimpleConditionalList.map(([i1, e1]) => [`${i1}?0:1`, new ConditionalExpression(e1.condition, e1.yes, new ConditionalExpression(e1.no, $num0, $num1))])
    ];
    describe('parse ComplexConditionalList', function () {
        for (const [input, expected] of ComplexConditionalList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexAssignList = [
        ...SimpleIsAssignList.map(([i1, e1]) => [`a=${i1}`, new AssignExpression($a, e1)]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`a=b=${i1}`, new AssignExpression($a, new AssignExpression($b, e1))]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}=a`, new AssignExpression(e1, $a)]),
        ...SimpleAccessMemberList.map(([i1, e1]) => [`${i1}=a`, new AssignExpression(e1, $a)]),
        ...SimpleAccessKeyedList.map(([i1, e1]) => [`${i1}=a`, new AssignExpression(e1, $a)]),
        ...SimpleAssignList.map(([i1, e1]) => [`${i1}=c`, new AssignExpression(e1.target, new AssignExpression(e1.value, $c))])
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
    const ComplexArrowFunctionList = [
        ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [1, `()=>${i1}`, new ArrowFunction([], e1)]),
        ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [1, `(a)=>${i1}`, new ArrowFunction([new BindingIdentifier('a')], e1)]),
        ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [1, `a=>${i1}`, new ArrowFunction([new BindingIdentifier('a')], e1)]),
        ...ConciseBodySimpleIsAssignList.map(([i1, e1]) => [2, `()=>()=>${i1}`, new ArrowFunction([], new ArrowFunction([], e1))]),
    ];
    function adjustAncestor(count, expr, input) {
        switch (expr.$kind) {
            case 'AccessThis':
                expr.ancestor += count;
                break;
            case 'AccessScope':
                // eslint-disable-next-line no-useless-escape
                if (expr.ancestor > 0 || input.search(new RegExp(`\\$this[?]?\\.[a-zA-Z\$\.]*${expr.name.replaceAll('$', '\\$')}`)) > -1) {
                    expr.ancestor += count;
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
                    expr.ancestor += count;
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
                }
                catch (e) {
                    throw e;
                }
                finally {
                    adjustAncestor(-depth, expected, input);
                }
            });
        }
    });
    const ComplexValueConverterList = [
        ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a`, new ValueConverterExpression(e1, 'a', [])]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}`, new ValueConverterExpression(e1, 'a', [e1])]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, new ValueConverterExpression(e1, 'a', [e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b`, new ValueConverterExpression(new ValueConverterExpression(e1, 'a', []), 'b', [])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b|c`, new ValueConverterExpression(new ValueConverterExpression(new ValueConverterExpression(e1, 'a', []), 'b', []), 'c', [])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, new ValueConverterExpression(e1, 'a', [e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}`, new ValueConverterExpression(e1, 'a', [e1, e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b|c:${i1}:${i1}:${i1}`, new ValueConverterExpression(new ValueConverterExpression(new ValueConverterExpression(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b:${i1}:${i1}:${i1}|c`, new ValueConverterExpression(new ValueConverterExpression(new ValueConverterExpression(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])])
    ];
    describe('parse ComplexValueConverterList', function () {
        for (const [input, expected] of ComplexValueConverterList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input), expected, input);
            });
        }
    });
    const ComplexBindingBehaviorList = [
        ...SimpleIsValueConverterList.map(([i1, e1]) => [`${i1}&a`, new BindingBehaviorExpression(e1, 'a', [])]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1])]),
        ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b`, new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', []), 'b', [])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b&c`, new BindingBehaviorExpression(new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', []), 'b', []), 'c', [])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}`, new BindingBehaviorExpression(e1, 'a', [e1, e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b&c:${i1}:${i1}:${i1}`, new BindingBehaviorExpression(new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])]),
        ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b:${i1}:${i1}:${i1}&c`, new BindingBehaviorExpression(new BindingBehaviorExpression(new BindingBehaviorExpression(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])])
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
        const DAE = DestructuringAssignmentExpression;
        const DASE = DestructuringAssignmentSingleExpression;
        const AME = AccessMemberExpression;
        const PLE = PrimitiveLiteralExpression;
        const AKE = AccessKeyedExpression;
        const aknd = 'ArrayDestructuring';
        const bi_a = new BindingIdentifier('a');
        const SimpleForDeclarations = [
            [`a`, bi_a],
            [`[]`, new DAE(aknd, [], void 0, void 0)],
        ];
        const ame = (name) => new AME($this, name);
        const ake = (key) => new AKE($this, new PLE(key));
        const dase = (s, t = null, init = void 0) => typeof s === 'number'
            ? new DASE(ame(t), ake(s), init)
            : new DASE(ame(t ?? s), ame(s), init);
        const ForDeclarations = [
            [`[,]`, new DAE(aknd, [], void 0, void 0)],
            [`[,,]`, new DAE(aknd, [], void 0, void 0)],
            [`[,,,]`, new DAE(aknd, [], void 0, void 0)],
            [`[a,]`, new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
            [`[a,,]`, new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
            [`[a,a,]`, new DAE(aknd, [dase(0, 'a'), dase(1, 'a')], void 0, void 0)],
            [`[a,,]`, new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
            [`[a,,,]`, new DAE(aknd, [dase(0, 'a')], void 0, void 0)],
            [`[a,a,,]`, new DAE(aknd, [dase(0, 'a'), dase(1, 'a')], void 0, void 0)],
            [`[,a]`, new DAE(aknd, [dase(1, 'a')], void 0, void 0)],
            [`[,a,]`, new DAE(aknd, [dase(1, 'a')], void 0, void 0)],
            [`[,a,,]`, new DAE(aknd, [dase(1, 'a')], void 0, void 0)],
            [`[,a,a,]`, new DAE(aknd, [dase(1, 'a'), dase(2, 'a')], void 0, void 0)],
            [`[,,a]`, new DAE(aknd, [dase(2, 'a')], void 0, void 0)],
            [`[,a,a]`, new DAE(aknd, [dase(1, 'a'), dase(2, 'a')], void 0, void 0)],
            [`[,,a,]`, new DAE(aknd, [dase(2, 'a')], void 0, void 0)],
            [`[,,,a]`, new DAE(aknd, [dase(3, 'a')], void 0, void 0)],
            [`[,,a,a]`, new DAE(aknd, [dase(2, 'a'), dase(3, 'a')], void 0, void 0)],
            [`[a,b]`, new DAE(aknd, [dase(0, 'a'), dase(1, 'b')], void 0, void 0)],
            [`[key,value]`, new DAE(aknd, [dase(0, 'key'), dase(1, 'value')], void 0, void 0)],
            [`[a,,b]`, new DAE(aknd, [dase(0, 'a'), dase(2, 'b')], void 0, void 0)],
        ];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ForOfStatements = [
            ...SimpleForDeclarations.map(([decInput, decExpr]) => [
                ...SimpleIsBindingBehaviorList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr, -1)])
            ]).reduce((a, c) => a.concat(c)),
            ...ForDeclarations.map(([decInput, decExpr]) => [
                ...AccessScopeList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr, -1)])
            ]).reduce((a, c) => a.concat(c))
        ];
        for (const [input, expected] of [
            ['a of a;key:id', new ForOfStatement(bi_a, $a, 6)],
            ['a of a;key: id', new ForOfStatement(bi_a, $a, 6)],
            ['a of a; key:id', new ForOfStatement(bi_a, $a, 6)],
            ['a of a; key: id', new ForOfStatement(bi_a, $a, 6)],
            // not valid but the expression parser doesn't care about the validity of what comes after the first semicolon
            ['a of a;;', new ForOfStatement(bi_a, $a, 6)],
            ['a of a;a', new ForOfStatement(bi_a, $a, 6)],
            ['a of a; a', new ForOfStatement(bi_a, $a, 6)],
            ['a of a;a;', new ForOfStatement(bi_a, $a, 6)],
            ['a of a; a;', new ForOfStatement(bi_a, $a, 6)],
            ['a of a ;a', new ForOfStatement(bi_a, $a, 7)],
            ['a of a ; a', new ForOfStatement(bi_a, $a, 7)],
            ['a of a ;a;', new ForOfStatement(bi_a, $a, 7)],
            ['a of a ; a;', new ForOfStatement(bi_a, $a, 7)],
        ]) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input, 'IsIterator'), expected);
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [input, expected] of SimpleForDeclarations.map(([decInput, decExpr]) => []).reduce((a, c) => a.concat(c))) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input, 'IsIterator'), expected);
            });
        }
    });
    const InterpolationList = [
        [`a`, null],
        [`\\\${a`, null],
        [`\\\${a}`, null],
        [`\\\${a}\\\${a}`, null],
        [`$a`, null],
        [`$a$a`, null],
        [`$\\{a`, null],
        [`\${a}}`, new Interpolation(['', '}'], [$a])],
        [`\${a}\${b}`, new Interpolation(['', '', ''], [$a, $b])],
        [`\${a}}\${b}`, new Interpolation(['', '}', ''], [$a, $b])],
        [`\${a}\${b}}`, new Interpolation(['', '', '}'], [$a, $b])],
        [`\${a}}\${b}}`, new Interpolation(['', '}', '}'], [$a, $b])],
        [`a\${a}\${b}`, new Interpolation(['a', '', ''], [$a, $b])],
        [`\${a}a\${b}`, new Interpolation(['', 'a', ''], [$a, $b])],
        [`a\${a}a\${b}`, new Interpolation(['a', 'a', ''], [$a, $b])],
        [`\${a}\${b}a`, new Interpolation(['', '', 'a'], [$a, $b])],
        [`\${a}a\${b}a`, new Interpolation(['', 'a', 'a'], [$a, $b])],
        [`a\${a}a\${b}a`, new Interpolation(['a', 'a', 'a'], [$a, $b])],
        [`\${\`\${a}\`}`, new Interpolation(['', ''], [new TemplateExpression(['', ''], [$a])])],
        [`\${\`a\${a}\`}`, new Interpolation(['', ''], [new TemplateExpression(['a', ''], [$a])])],
        [`\${\`\${a}a\`}`, new Interpolation(['', ''], [new TemplateExpression(['', 'a'], [$a])])],
        [`\${\`a\${a}a\`}`, new Interpolation(['', ''], [new TemplateExpression(['a', 'a'], [$a])])],
        [`\${\`\${\`\${a}\`}\`}`, new Interpolation(['', ''], [new TemplateExpression(['', ''], [new TemplateExpression(['', ''], [$a])])])],
        ...stringEscapables.map(([raw, cooked]) => [
            [`${raw}`, null],
            [`\${a}${raw}`, new Interpolation(['', cooked], [$a])],
            [`${raw}\${a}`, new Interpolation([cooked, ''], [$a])],
            [`${raw}\${a}${raw}`, new Interpolation([cooked, cooked], [$a])],
            [`\${a}${raw}\${a}`, new Interpolation(['', cooked, ''], [$a, $a])],
        ]).reduce((acc, cur) => acc.concat(cur)),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`\${${input}}`, new Interpolation(['', ''], [expr])]),
        ...SimpleIsAssignList
            .map(([input, expr]) => [`\${${input}}\${${input}}`, new Interpolation(['', '', ''], [expr, expr])])
    ];
    describe('parse Interpolation', function () {
        for (const [input, expected] of InterpolationList) {
            it(input, function () {
                assert.deepStrictEqual(parseExpression(input, 'Interpolation'), expected);
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
            '=', '?', ' instanceof', ' in',
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
        for (const op of ['!', '(', '+', '-', '.', '[', 'typeof']) {
            it(`throw 'Unexpected end of expression' on "${op}"`, function () {
                verifyResultOrError(op, null, 'AUR0155');
            });
        }
        for (const [input, expr] of SimpleIsLeftHandSideList) {
            it(`throw 'Expected identifier' on "${input}."`, function () {
                if (typeof expr['value'] !== 'number' || input.includes('.')) { // only non-float numbers are allowed to end on a dot
                    verifyResultOrError(`${input}.`, null, 'AUR0153');
                }
                else {
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
            [`a`, new BindingIdentifier('a')]
        ]) {
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
//# sourceMappingURL=expression-parser.spec.js.map