import { BindingIdentifier, ArrayBindingPattern, ObjectBindingPattern } from './../../../runtime/src/binding/ast';
import { AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, IsUnary, IsPrimary, BinaryOperator, UnaryOperator, BindingType, Interpolation, ForOfStatement } from '../../../runtime/src';
import { latin1IdentifierStartChars, latin1IdentifierPartChars, otherBMPIdentifierPartChars } from './unicode';
import { expect } from 'chai';
import { parseCore, parse,  ParserState, Access, Precedence } from '../../../jit/src'
import { verifyASTEqual, eachCartesianJoinFactory } from './util';
import { eachCartesianJoin } from '../../../../scripts/test-lib';
import { ExpressionKind } from '@aurelia/runtime';


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


const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
const $str = PrimitiveLiteral.$empty;
const $tpl = Template.$empty;
const $arr = ArrayLiteral.$empty;
const $obj = ObjectLiteral.$empty;
const $this = AccessThis.$this;
const $parent = AccessThis.$parent;

const $a = new AccessScope('a');
const $b = new AccessScope('b');
const $c = new AccessScope('c');
const $str1 = new PrimitiveLiteral('1');
const $num0 = new PrimitiveLiteral(0);
const $num1 = new PrimitiveLiteral(1);

const codes = {
  //SyntaxError
  InvalidExpressionStart: 'Code 100',
  UnconsumedToken: 'Code 101',
  DoubleDot: 'Code 102',
  InvalidMemberExpression: 'Code 103',
  UnexpectedEndOfExpression: 'Code 104',
  ExpectedIdentifier: 'Code 105',
  InvalidForDeclaration: 'Code 106',
  InvalidObjectLiteralPropertyDefinition: 'Code 107',
  UnterminatedQuote: 'Code 108',
  UnterminatedTemplate: 'Code 109',
  MissingExpectedToken: 'Code 110',
  UnexpectedCharacter: 'Code 111',

  //SemanticError
  NotAssignable: 'Code 150',
  UnexpectedForOf: 'Code 151'
};

function bindingTypeToString(bindingType: BindingType): string {
  switch (bindingType) {
    case BindingType.BindCommand:
      return 'BindCommand';
    case BindingType.OneTimeCommand:
      return 'OneTimeCommand';
    case BindingType.ToViewCommand:
      return 'ToViewCommand';
    case BindingType.FromViewCommand:
      return 'FromViewCommand';
    case BindingType.TwoWayCommand:
      return 'TwoWayCommand';
    case BindingType.CallCommand:
      return 'CallCommand';
    case BindingType.CaptureCommand:
      return 'CaptureCommand';
    case BindingType.DelegateCommand:
      return 'DelegateCommand';
    case BindingType.ForCommand:
      return 'ForCommand';
    case BindingType.Interpolation:
      return 'Interpolation';
    case undefined:
      return 'BindCommand';
    default:
      return 'fix your tests fred'
  }
}

function verifyResultOrError(expr: string, expected: any, expectedMsg?: string, bindingType?: BindingType): any {
  let error: Error = null;
  let actual: any = null;
  try {
    actual = parseCore(expr, <any>bindingType);
  } catch (e) {
    error = e;
  }
  if (bindingType === BindingType.Interpolation && !(expected instanceof Interpolation)) {
    if (error !== null) {
      throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} not to throw, but it threw "${error.message}"`);
    }
  } else if (expectedMsg === null || expectedMsg === undefined) {
    if (error === null) {
      verifyASTEqual(actual, expected);
    } else {
      throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} parse successfully, but it threw "${error.message}"`);
    }
  } else {
    if (error === null) {
      throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} to throw "${expectedMsg}", but no error was thrown`);
    } else {
      if (error.message !== expectedMsg) {
        throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} to throw "${expectedMsg}", but got "${error.message}" instead`);
      }
    }
  }
}


// Note: we could loop through all generated tests by picking SimpleIsBindingBehaviorList and ComplexIsBindingBehaviorList,
// but we're separating them out to make the test suites more granular for debugging and reporting purposes
describe('ExpressionParser', () => {

  // #region Simple lists

  // The goal here is to pre-create arrays of string+ast expression pairs that each represent a unique
  // path taken in the expression parser. We're creating them here at the module level simply to speed up
  // the tests. They're never modified, so it's safe to reuse the same expression for multiple tests.

  // They're called Simple..Lists because we're not creating any combinations / nested expressions yet.
  // Instead, these lists will be the inputs for combinations further down below.

  // Note: we're more or less following the same ordering here as the tc39 spec description comments;
  // those comments (https://tc39.github.io/... in expression-parser.ts) are partial extracts from the spec
  // with mostly just omissions; the only modification is the special parsing rules related to AccessThis


  // 1. parsePrimaryExpression.this
  const AccessThisList: [string, any][] = [
    [`$this`,             $this],
    [`$parent`,           $parent],
    [`$parent.$parent`,   new AccessThis(2)]
  ];
  // 2. parsePrimaryExpression.IdentifierName
  const AccessScopeList: [string, any][] = [
    ...AccessThisList.map(([input, expr]) => <[string, any]>[`${input}.a`, new AccessScope('a', expr.ancestor)]),
    [`$this.$parent`,     new AccessScope('$parent')],
    [`$parent.$this`,     new AccessScope('$this', 1)],
    [`a`,                 $a]
  ];
  // 3. parsePrimaryExpression.Literal
  const SimpleStringLiteralList: [string, any][] = [
    [`''`,                $str],
    [`""`,                $str]
  ];
  const SimpleNumberLiteralList: [string, any][] = [
    [`1`,                 $num1],
    [`1.1`,               new PrimitiveLiteral(1.1)],
    [`.1`,                new PrimitiveLiteral(.1)],
    [`0.1`,               new PrimitiveLiteral(.1)]
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
    [`\`\${a}\``,         new Template(['', ''], [$a])]
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
    [`(a[b])`,            new AccessKeyed($a, $b)],
    [`(a.b)`,             new AccessMember($a, 'b')],
    [`(a\`\`)`,           new TaggedTemplate([''], [''], $a, [])],
    [`($this())`,         new CallFunction($this, [])],
    [`(a())`,             new CallScope('a', [])],
    [`(!a)`,              new Unary('!', $a)],
    [`(a+b)`,             new Binary('+', $a, $b)],
    [`(a?b:c)`,           new Conditional($a, $b, new AccessScope('c'))],
    [`(a=b)`,             new Assign($a, $b)]
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
      .map(([input, expr]) => <[string, any]>[`${input}[b]`, new AccessKeyed(expr, $b)])
  ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList]
      .map(([input, expr]) => <[string, any]>[`${input}.b`, new AccessMember(expr, 'b')])
  ];
  // 4. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => <[string, any]>[`${input}\`\``, new TaggedTemplate([''], [''], expr, [])]),

    ...SimplePrimaryList
      .map(([input, expr]) => <[string, any]>[`${input}\`\${a}\``, new TaggedTemplate(['', ''], ['', ''], expr, [$a])])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, any][] = [
    ...[...AccessThisList, ...SimpleLiteralList]
      .map(([input, expr]) => <[string, any]>[`${input}()`, new CallFunction(expr, [])])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, any][] = [
    ...[...AccessScopeList]
      .map(([input, expr]) => <[string, any]>[`${input}()`, new CallScope(expr.name, [], expr.ancestor)])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList]
      .map(([input, expr]) => <[string, any]>[`${input}.b()`, new CallMember(expr, 'b', [])])
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
  // used only for testing complex Unary expressions
  const SimpleIsLeftHandSideList: [string, any][] = [
    ...SimplePrimaryList,
    ...SimpleLeftHandSideList
  ];

  // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
  const SimpleUnaryList: [string, any][] = [
    [`!$1`, new Unary('!', new AccessScope('$1'))],
    [`-$2`, new Unary('-', new AccessScope('$2'))],
    [`+$3`, new Unary('+', new AccessScope('$3'))],
    [`void $4`, new Unary('void', new AccessScope('$4'))],
    [`typeof $5`, new Unary('typeof', new AccessScope('$5'))]
  ];
  // concatenation of Unary + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
  const SimpleIsUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, any][] = [
    [`$6*$7`, new Binary('*', new AccessScope('$6'), new AccessScope('$7'))],
    [`$8%$9`, new Binary('%', new AccessScope('$8'), new AccessScope('$9'))],
    [`$10/$11`, new Binary('/', new AccessScope('$10'), new AccessScope('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, any][] = [
    ...SimpleIsUnaryList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, any][] = [
    [`$12+$13`, new Binary('+', new AccessScope('$12'), new AccessScope('$13'))],
    [`$14-$15`, new Binary('-', new AccessScope('$14'), new AccessScope('$15'))]
  ];
  const SimpleIsAdditiveList: [string, any][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, any][] = [
    [`$16<$17`, new Binary('<', new AccessScope('$16'), new AccessScope('$17'))],
    [`$18>$19`, new Binary('>', new AccessScope('$18'), new AccessScope('$19'))],
    [`$20<=$21`, new Binary('<=', new AccessScope('$20'), new AccessScope('$21'))],
    [`$22>=$23`, new Binary('>=', new AccessScope('$22'), new AccessScope('$23'))],
    [`$24 in $25`, new Binary('in', new AccessScope('$24'), new AccessScope('$25'))],
    [`$26 instanceof $27`, new Binary('instanceof', new AccessScope('$26'), new AccessScope('$27'))]
  ];
  const SimpleIsRelationalList: [string, any][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, any][] = [
    [`$28==$29`, new Binary('==', new AccessScope('$28'), new AccessScope('$29'))],
    [`$30!=$31`, new Binary('!=', new AccessScope('$30'), new AccessScope('$31'))],
    [`$32===$33`, new Binary('===', new AccessScope('$32'), new AccessScope('$33'))],
    [`$34!==$35`, new Binary('!==', new AccessScope('$34'), new AccessScope('$35'))]
  ];
  const SimpleIsEqualityList: [string, any][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, any][] = [
    [`$36&&$37`, new Binary('&&', new AccessScope('$36'), new AccessScope('$37'))]
  ];
  const SimpleIsLogicalANDList: [string, any][] = [
    ...SimpleIsEqualityList,
    ...SimpleLogicalANDList
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, any][] = [
    [`$38||$39`, new Binary('||', new AccessScope('$38'), new AccessScope('$39'))]
  ];
  const SimpleIsLogicalORList: [string, any][] = [
    ...SimpleIsLogicalANDList,
    ...SimpleLogicalORList
  ];

  // This forms the group Precedence.Conditional
  const SimpleConditionalList: [string, any][] = [
    [`a?b:c`, new Conditional($a, $b, new AccessScope('c'))]
  ];
  const SimpleIsConditionalList: [string, any][] = [
    ...SimpleIsLogicalORList,
    ...SimpleConditionalList
  ];

  // This forms the group Precedence.Assign
  const SimpleAssignList: [string, any][] = [
    [`a=b`, new Assign($a, $b)]
  ];
  const SimpleIsAssignList: [string, any][] = [
    ...SimpleIsConditionalList,
    ...SimpleAssignList
  ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, any][] = [
    [`a|b`, new ValueConverter($a, 'b', [])],
    [`a|b:c`, new ValueConverter($a, 'b', [new AccessScope('c')])],
    [`a|b:c:d`, new ValueConverter($a, 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];
  const SimpleIsValueConverterList: [string, any][] = [
    ...SimpleIsAssignList,
    ...SimpleValueConverterList
  ];

  const SimpleBindingBehaviorList: [string, any][] = [
    [`a&b`, new BindingBehavior($a, 'b', [])],
    [`a&b:c`, new BindingBehavior($a, 'b', [new AccessScope('c')])],
    [`a&b:c:d`, new BindingBehavior($a, 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];

  const SimpleIsBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList,
    ...SimpleBindingBehaviorList
  ];

  for (const bindingType of <any[]>[
    undefined,
    BindingType.BindCommand,
    BindingType.ToViewCommand,
    BindingType.FromViewCommand,
    BindingType.TwoWayCommand,
    BindingType.TriggerCommand,
    BindingType.DelegateCommand,
    BindingType.CaptureCommand,
    BindingType.CallCommand
  ]) {
    describe(bindingTypeToString(bindingType), () => {
      describe('parse AccessThisList', () => {
        for (const [input, expected] of AccessThisList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse AccessScopeList', () => {
        for (const [input, expected] of AccessScopeList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleStringLiteralList', () => {
        for (const [input, expected] of SimpleStringLiteralList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleNumberLiteralList', () => {
        for (const [input, expected] of SimpleNumberLiteralList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse KeywordPrimitiveLiteralList', () => {
        for (const [input, expected] of KeywordPrimitiveLiteralList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleArrayLiteralList', () => {
        for (const [input, expected] of SimpleArrayLiteralList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleObjectLiteralList', () => {
        for (const [input, expected] of SimpleObjectLiteralList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleTemplateLiteralList', () => {
        for (const [input, expected] of SimpleTemplateLiteralList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleParenthesizedList', () => {
        for (const [input, expected] of SimpleParenthesizedList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAccessKeyedList', () => {
        for (const [input, expected] of SimpleAccessKeyedList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAccessMemberList', () => {
        for (const [input, expected] of SimpleAccessMemberList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleTaggedTemplateList', () => {
        for (const [input, expected] of SimpleTaggedTemplateList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleCallFunctionList', () => {
        for (const [input, expected] of SimpleCallFunctionList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleCallScopeList', () => {
        for (const [input, expected] of SimpleCallScopeList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleCallMemberList', () => {
        for (const [input, expected] of SimpleCallMemberList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleUnaryList', () => {
        for (const [input, expected] of SimpleUnaryList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleMultiplicativeList', () => {
        for (const [input, expected] of SimpleMultiplicativeList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAdditiveList', () => {
        for (const [input, expected] of SimpleAdditiveList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleRelationalList', () => {
        for (const [input, expected] of SimpleRelationalList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleEqualityList', () => {
        for (const [input, expected] of SimpleEqualityList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleLogicalANDList', () => {
        for (const [input, expected] of SimpleLogicalANDList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleLogicalORList', () => {
        for (const [input, expected] of SimpleLogicalORList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleConditionalList', () => {
        for (const [input, expected] of SimpleConditionalList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAssignList', () => {
        for (const [input, expected] of SimpleAssignList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleValueConverterList', () => {
        for (const [input, expected] of SimpleValueConverterList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleBindingBehaviorList', () => {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, () => {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Unary', () => {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, () => {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Unary, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary) {
                verifyASTEqual(result, expected);
                expect(state.index).to.be.gte(state.length);
              } else {
                expect(state.index).to.be.lessThan(state.length);
                expect(result.$kind).not.to.equal(expected.$kind);
              }
            } else {
              throw new Error('Should not parse anything higher than Unary');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Binary', () => {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, () => {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Binary, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary) {
                verifyASTEqual(result, expected);
                expect(state.index).to.be.gte(state.length);
              } else {
                expect(state.index).to.be.lessThan(state.length);
                expect(result.$kind).not.to.equal(expected.$kind);
              }
            } else {
              throw new Error('Should not parse anything higher than Binary');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Conditional', () => {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, () => {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Conditional, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
              (result.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
                (expected.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional) {
                verifyASTEqual(result, expected);
                expect(state.index).to.be.gte(state.length);
              } else {
                expect(state.index).to.be.lessThan(state.length);
                expect(result.$kind).not.to.equal(expected.$kind);
              }
            } else {
              throw new Error('Should not parse anything higher than Conditional');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Assign', () => {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, () => {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Assign, bindingType);
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
                verifyASTEqual(result, expected);
                expect(state.index).to.be.gte(state.length);
              } else {
                expect(state.index).to.be.lessThan(state.length);
                expect(result.$kind).not.to.equal(expected.$kind);
              }
            } else {
              throw new Error('Should not parse anything higher than Assign');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Variadic', () => {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, () => {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Variadic, bindingType);
            verifyASTEqual(result, expected);
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
  // This array is used to verify parsing of string PrimitiveLiteral, and the strings in Template and TaggedTemplate
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
  ]
  .map(([raw, cooked]) => [
    [raw,         cooked],
    [`${raw}`,   `${cooked}`],
    [`x${raw}`,  `x${cooked}`],
    [`${raw}x`,  `${cooked}x`],
    [`x${raw}x`, `x${cooked}x`]
  ])
  .reduce((acc, cur) => acc.concat(cur));

  // Verify all string escapes, unicode characters, double and single quotes
  const ComplexStringLiteralList: [string, any][] = [
    ...<[string, any][]>[
      ['foo',                new PrimitiveLiteral('foo')],
      ['äöüÄÖÜß',            new PrimitiveLiteral('äöüÄÖÜß')],
      ['ಠ_ಠ',               new PrimitiveLiteral('ಠ_ಠ')],
      ...stringEscapables.map(([raw, cooked]) => [raw, new PrimitiveLiteral(cooked)])]
    .map(([input, expr]) => <[string, any][]>[
      [`'${input}'`, expr],
      [`"${input}"`, expr]
    ])
    .reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexStringLiteralList', () => {
    for (const [input, expected] of ComplexStringLiteralList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  // Verify different floating point notations and parsing numbers that are outside the "safe" integer range
  const ComplexNumberList: [string, any][] = [
    ['9007199254740992',                                                  new PrimitiveLiteral(9007199254740992)],
    ['0.9007199254740992',                                                new PrimitiveLiteral(.9007199254740992)],
    ['.9007199254740992',                                                 new PrimitiveLiteral(.9007199254740992)],
    ['.90071992547409929007199254740992',                                 new PrimitiveLiteral(.90071992547409929007199254740992)],
    ['9007199254740992.9007199254740992',                                 new PrimitiveLiteral(9007199254740992.9007199254740992)],
    ['9007199254740992.90071992547409929007199254740992',                 new PrimitiveLiteral(9007199254740992.90071992547409929007199254740992)],
    ['90071992547409929007199254740992',                                  new PrimitiveLiteral(90071992547409929007199254740992)],
    ['90071992547409929007199254740992.9007199254740992',                 new PrimitiveLiteral(90071992547409929007199254740992.9007199254740992)],
    ['90071992547409929007199254740992.90071992547409929007199254740992', new PrimitiveLiteral(90071992547409929007199254740992.90071992547409929007199254740992)]
  ];
  describe('parse ComplexNumberList', () => {
    for (const [input, expected] of ComplexNumberList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  // Verify various combinations of nested and chained parts/expressions, with/without escaped strings
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of arguments
  const ComplexTemplateLiteralList: [string, any][] = [
    [`\`a\``,                       new Template(['a'], [])],
    [`\`\\\${a}\``,                 new Template(['${a}'], [])],
    [`\`$a\``,                      new Template(['$a'], [])],
    [`\`\${a}\${b}\``,              new Template(['', '', ''],                       [$a, $b])],
    [`\`a\${a}\${b}\``,             new Template(['a', '', ''],                      [$a, $b])],
    [`\`\${a}a\${b}\``,             new Template(['', 'a', ''],                      [$a, $b])],
    [`\`a\${a}a\${b}\``,            new Template(['a', 'a', ''],                     [$a, $b])],
    [`\`\${a}\${b}a\``,             new Template(['', '', 'a'],                      [$a, $b])],
    [`\`\${a}a\${b}a\``,            new Template(['', 'a', 'a'],                     [$a, $b])],
    [`\`a\${a}a\${b}a\``,           new Template(['a', 'a', 'a'],                    [$a, $b])],
    [`\`\${\`\${a}\`}\``,           new Template(['', ''], [new Template(['', ''],   [$a])])],
    [`\`\${\`a\${a}\`}\``,          new Template(['', ''], [new Template(['a', ''],  [$a])])],
    [`\`\${\`\${a}a\`}\``,          new Template(['', ''], [new Template(['', 'a'],  [$a])])],
    [`\`\${\`a\${a}a\`}\``,         new Template(['', ''], [new Template(['a', 'a'], [$a])])],
    [`\`\${\`\${\`\${a}\`}\`}\``,   new Template(['', ''], [new Template(['', ''], [new Template(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]) => <[string, any][]>[
      [`\`${raw}\``,                new Template([cooked],              [])],
      [`\`\${a}${raw}\``,           new Template(['', cooked],        [$a])],
      [`\`${raw}\${a}\``,           new Template([cooked, ''],        [$a])],
      [`\`${raw}\${a}${raw}\``,     new Template([cooked, cooked],    [$a])],
      [`\`\${a}${raw}\${a}\``,      new Template(['', cooked, ''],    [$a, $a])],
    ])
    .reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`\`\${${input}}\``, new Template(['', ''], [expr])]),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`\`\${${input}}\${${input}}\``, new Template(['', '', ''], [expr, expr])])
  ];
  describe('parse ComplexTemplateLiteralList', () => {
    for (const [input, expected] of ComplexTemplateLiteralList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  // Verify various combinations of specified and unspecified (elision) array items
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of element expressions
  const ComplexArrayLiteralList: [string, any][] = [
    [`[,]`,                 new ArrayLiteral([$undefined, $undefined])],
    [`[,,]`,                new ArrayLiteral([$undefined, $undefined, $undefined])],
    [`[,,,]`,               new ArrayLiteral([$undefined, $undefined, $undefined, $undefined])],
    [`[a,]`,                new ArrayLiteral([$a, $undefined])],
    [`[a,,]`,               new ArrayLiteral([$a, $undefined, $undefined])],
    [`[a,a,]`,              new ArrayLiteral([$a, $a, $undefined])],
    [`[a,,,]`,              new ArrayLiteral([$a, $undefined, $undefined, $undefined])],
    [`[a,a,,]`,             new ArrayLiteral([$a, $a, $undefined, $undefined])],
    [`[,a]`,                new ArrayLiteral([$undefined, $a])],
    [`[,a,]`,               new ArrayLiteral([$undefined, $a, $undefined])],
    [`[,a,,]`,              new ArrayLiteral([$undefined, $a, $undefined, $undefined])],
    [`[,a,a,]`,             new ArrayLiteral([$undefined, $a, $a, $undefined])],
    [`[,,a]`,               new ArrayLiteral([$undefined, $undefined, $a])],
    [`[,a,a]`,              new ArrayLiteral([$undefined, $a, $a])],
    [`[,,a,]`,              new ArrayLiteral([$undefined, $undefined, $a, $undefined])],
    [`[,,,a]`,              new ArrayLiteral([$undefined, $undefined, $undefined, $a])],
    [`[,,a,a]`,             new ArrayLiteral([$undefined, $undefined, $a, $a])],
    ...SimpleIsAssignList.map(([input, expr]) => <[string, any][]>[
      [`[${input}]`,           new ArrayLiteral([expr])],
      [`[${input},${input}]`,  new ArrayLiteral([expr, expr])]
    ])
    .reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexArrayLiteralList', () => {
    for (const [input, expected] of ComplexArrayLiteralList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  // Verify various combinations of shorthand, full, string and number property definitions
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of value expressions
  const ComplexObjectLiteralList: [string, any][] = [
    [`{a}`,                 new ObjectLiteral(['a'], [$a])],
    [`{a:a}`,               new ObjectLiteral(['a'], [$a])],
    [`{'a':a}`,             new ObjectLiteral(['a'], [$a])],
    [`{"a":a}`,             new ObjectLiteral(['a'], [$a])],
    [`{1:a}`,               new ObjectLiteral([1], [$a])],
    [`{'1':a}`,             new ObjectLiteral(['1'], [$a])],
    [`{"1":a}`,             new ObjectLiteral(['1'], [$a])],
    [`{'a':a,b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{"a":a,b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{1:a,b}`,             new ObjectLiteral([1, 'b'], [$a, $b])],
    [`{'1':a,b}`,           new ObjectLiteral(['1', 'b'], [$a, $b])],
    [`{"1":a,b}`,           new ObjectLiteral(['1', 'b'], [$a, $b])],
    [`{a,'b':b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a,"b":b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a,1:b}`,             new ObjectLiteral(['a', 1], [$a, $b])],
    [`{a,'1':b}`,           new ObjectLiteral(['a', '1'], [$a, $b])],
    [`{a,"1":b}`,           new ObjectLiteral(['a', '1'], [$a, $b])],
    [`{a,b}`,               new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a:a,b}`,             new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a,b:b}`,             new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a:a,b,c}`,           new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c}`,           new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b,c:c}`,           new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b:b,c}`,         new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b,c:c}`,         new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c:c}`,         new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    ...SimpleIsAssignList.map(([input, expr]) => <[string, any][]>[
      [`{a:${input}}`,            new ObjectLiteral(['a'], [expr])],
      [`{a:${input},b:${input}}`, new ObjectLiteral(['a', 'b'], [expr, expr])]
    ])
    .reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexObjectLiteralList', () => {
    for (const [input, expected] of ComplexObjectLiteralList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexAccessKeyedList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a[${input}]`, new AccessKeyed($a, expr)])
  ];
  describe('parse ComplexAccessKeyedList', () => {
    for (const [input, expected] of ComplexAccessKeyedList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
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
      .map(([input]) => <[string, any]>[`a.${input}`, new AccessMember($a, input)])
  ];
  describe('parse ComplexAccessMemberList', () => {
    for (const [input, expected] of ComplexAccessMemberList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexTaggedTemplateList: [string, any][] = [
    [`a\`a\``,                       new TaggedTemplate(['a'],           ['a'],             $a, [])],
    [`a\`\\\${a}\``,                 new TaggedTemplate(['${a}'],        ['${a}'],          $a, [])],
    [`a\`$a\``,                      new TaggedTemplate(['$a'],          ['$a'],            $a, [])],
    [`a\`\${b}\${c}\``,              new TaggedTemplate(['', '', ''],    ['', '', ''],      $a, [$b, $c])],
    [`a\`a\${b}\${c}\``,             new TaggedTemplate(['a', '', ''],   ['a', '', ''],     $a, [$b, $c])],
    [`a\`\${b}a\${c}\``,             new TaggedTemplate(['', 'a', ''],   ['', 'a', ''],     $a, [$b, $c])],
    [`a\`a\${b}a\${c}\``,            new TaggedTemplate(['a', 'a', ''],  ['a', 'a', ''],    $a, [$b, $c])],
    [`a\`\${b}\${c}a\``,             new TaggedTemplate(['', '', 'a'],   ['', '', 'a'],     $a, [$b, $c])],
    [`a\`\${b}a\${c}a\``,            new TaggedTemplate(['', 'a', 'a'],  ['', 'a', 'a'],    $a, [$b, $c])],
    [`a\`a\${b}a\${c}a\``,           new TaggedTemplate(['a', 'a', 'a'], ['a', 'a', 'a'],   $a, [$b, $c])],
    [`a\`\${\`\${a}\`}\``,           new TaggedTemplate(['', ''],        ['', ''],          $a, [new Template(['', ''],   [$a])])],
    [`a\`\${\`a\${a}\`}\``,          new TaggedTemplate(['', ''],        ['', ''],          $a, [new Template(['a', ''],  [$a])])],
    [`a\`\${\`\${a}a\`}\``,          new TaggedTemplate(['', ''],        ['', ''],          $a, [new Template(['', 'a'],  [$a])])],
    [`a\`\${\`a\${a}a\`}\``,         new TaggedTemplate(['', ''],        ['', ''],          $a, [new Template(['a', 'a'], [$a])])],
    [`a\`\${\`\${\`\${a}\`}\`}\``,   new TaggedTemplate(['', ''],        ['', ''],          $a, [new Template(['', ''], [new Template(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]) => <[string, any][]>[
      [`a\`${raw}\``,                new TaggedTemplate([cooked],         [cooked],         $a,     [])],
      [`a\`\${a}${raw}\``,           new TaggedTemplate(['', cooked],     ['', cooked],     $a,   [$a])],
      [`a\`${raw}\${a}\``,           new TaggedTemplate([cooked, ''],     [cooked, ''],     $a,   [$a])],
      [`a\`${raw}\${a}${raw}\``,     new TaggedTemplate([cooked, cooked], [cooked, cooked], $a,   [$a])],
      [`a\`\${a}${raw}\${a}\``,      new TaggedTemplate(['', cooked, ''], ['', cooked, ''], $a,   [$a, $a])],
    ])
    .reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a\`\${${input}}\``, new TaggedTemplate(['', ''], ['', ''], $a, [expr])]),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a\`\${${input}}\${${input}}\``, new TaggedTemplate(['', '', ''], ['', '', ''], $a, [expr, expr])])
  ];
  describe('parse ComplexTaggedTemplateList', () => {
    for (const [input, expected] of ComplexTaggedTemplateList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexCallFunctionList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`$this(${input})`, new CallFunction($this, [expr])]),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`$this(${input},${input})`, new CallFunction($this, [expr, expr])])
  ];
  describe('parse ComplexCallFunctionList', () => {
    for (const [input, expected] of ComplexCallFunctionList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexCallScopeList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a(${input})`, new CallScope('a', [expr])]),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a(${input},${input})`, new CallScope('a', [expr, expr])])
  ];
  describe('parse ComplexCallScopeList', () => {
    for (const [input, expected] of ComplexCallScopeList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexCallMemberList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a.b(${input})`, new CallMember($a, 'b', [expr])]),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`a.b(${input},${input})`, new CallMember($a, 'b', [expr, expr])])
  ];
  describe('parse ComplexCallMemberList', () => {
    for (const [input, expected] of ComplexCallMemberList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => <[string, any]>[`!${input}`, new Unary('!', expr)]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => <[string, any]>[`+${input}`, new Unary('+', expr)]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => <[string, any]>[`-${input}`, new Unary('-', expr)]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => <[string, any]>[`void ${input}`, new Unary('void', expr)]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => <[string, any]>[`typeof ${input}`, new Unary('typeof', expr)])
  ];
  describe('parse ComplexUnaryList', () => {
    for (const [input, expected] of ComplexUnaryList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  // Combine a precedence group with all precedence groups below it, the precedence group on the same
  // level, and a precedence group above it, and verify that the precedence/associativity is correctly enforced
  const ComplexMultiplicativeList: [string, any][] = [
    ...binaryMultiplicative.map(op => <[string, any][]>[
      ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`${i1}${op}a`, new Binary(op, e1, $a)]),
      ...SimpleUnaryList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i2}${op}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexMultiplicativeList', () => {
    for (const [input, expected] of ComplexMultiplicativeList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexAdditiveList: [string, any][] = [
    ...binaryAdditive.map(op => <[string, any][]>[
      ...SimpleIsAdditiveList.map(([i1, e1]) => [`${i1}${op}a`, new Binary(op, e1, $a)]),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i2}${op}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexAdditiveList', () => {
    for (const [input, expected] of ComplexAdditiveList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexRelationalList: [string, any][] = [
    ...binaryRelational.map(([op, txt]) => <[string, any][]>[
      ...SimpleIsRelationalList.map(([i1, e1]) => [`${i1}${txt}a`, new Binary(op, e1, $a)]),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i2}${txt}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexRelationalList', () => {
    for (const [input, expected] of ComplexRelationalList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexEqualityList: [string, any][] = [
    ...binaryEquality.map(op => <[string, any][]>[
      ...SimpleIsEqualityList.map(([i1, e1]) => [`${i1}${op}a`, new Binary(op, e1, $a)]),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i2}${op}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleLogicalANDList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexEqualityList', () => {
    for (const [input, expected] of ComplexEqualityList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexLogicalANDList: [string, any][] = [
    ...SimpleIsLogicalANDList.map(([i1, e1]) => <[string, any]>[`${i1}&&a`, new Binary('&&', e1, $a)]),
    ...SimpleEqualityList
      .map(([i1, e1]) => <[string, any][]>SimpleLogicalANDList.map(([i2, e2]) => [`${i2}&&${i1}`, new Binary('&&', e2, e1)]))
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => <[string, any][]>SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new Binary(e2.operation, new Binary('&&', new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => <[string, any][]>SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary('&&', e1.right, e2.left), e2.right))]))
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalANDList', () => {
    for (const [input, expected] of ComplexLogicalANDList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexLogicalORList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => <[string, any]>[`${i1}||a`, new Binary('||', e1, $a)]),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => <[string, any][]>SimpleLogicalORList.map(([i2, e2]) => [`${i2}||${i1}`, new Binary('||', e2, e1)]))
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => <[string, any][]>SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new Binary(e2.operation, new Binary('||', new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
      .reduce((a, b) => a.concat(b)),
    ...SimpleConditionalList
      .map(([i1, e1]) => <[string, any][]>SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new Conditional(e1.condition, e1.yes, new Binary(e2.operation, new Binary('||', e1.no, e2.left), e2.right))]))
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalORList', () => {
    for (const [input, expected] of ComplexLogicalORList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexConditionalList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => <[string, any]>[`${i1}?0:1`, new Conditional(e1, $num0, $num1)]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`0?1:${i1}`, new Conditional($num0, $num1, e1)]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`0?${i1}:1`, new Conditional($num0, e1, $num1)]),
    ...SimpleConditionalList.map(([i1, e1]) => <[string, any]>[`${i1}?0:1`, new Conditional(e1.condition, e1.yes, new Conditional(e1.no, $num0, $num1))])
  ];
  describe('parse ComplexConditionalList', () => {
    for (const [input, expected] of ComplexConditionalList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });


  const ComplexAssignList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`a=${i1}`, new Assign($a, e1)]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`a=b=${i1}`, new Assign($a, new Assign($b, e1))]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}=a`, new Assign(e1, $a)]),
    ...SimpleAccessMemberList.map(([i1, e1]) => <[string, any]>[`${i1}=a`, new Assign(e1, $a)]),
    ...SimpleAccessKeyedList.map(([i1, e1]) => <[string, any]>[`${i1}=a`, new Assign(e1, $a)]),
    ...SimpleAssignList.map(([i1, e1]) => <[string, any]>[`${i1}=c`, new Assign(e1.target, new Assign(e1.value, $c))])
  ];
  describe('parse ComplexAssignList', () => {
    for (const [input, expected] of ComplexAssignList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });


  const ComplexValueConverterList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`${i1}|a`, new ValueConverter(e1, 'a', [])]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`${i1}|a:${i1}`, new ValueConverter(e1, 'a', [e1])]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`${i1}|a:${i1}:${i1}`, new ValueConverter(e1, 'a', [e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}|a|b`, new ValueConverter(new ValueConverter(e1, 'a', []), 'b', [])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}|a|b|c`, new ValueConverter(new ValueConverter(new ValueConverter(e1, 'a', []), 'b', []), 'c', [])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}|a:${i1}:${i1}`, new ValueConverter(e1, 'a', [e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}|a:${i1}:${i1}:${i1}`, new ValueConverter(e1, 'a', [e1, e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}|a:${i1}:${i1}:${i1}|b|c:${i1}:${i1}:${i1}`, new ValueConverter(new ValueConverter(new ValueConverter(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}|a:${i1}:${i1}:${i1}|b:${i1}:${i1}:${i1}|c`, new ValueConverter(new ValueConverter(new ValueConverter(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])])
  ];
  describe('parse ComplexValueConverterList', () => {
    for (const [input, expected] of ComplexValueConverterList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  const ComplexBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList.map(([i1, e1]) => <[string, any]>[`${i1}&a`, new BindingBehavior(e1, 'a', [])]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`${i1}&a:${i1}`, new BindingBehavior(e1, 'a', [e1])]),
    ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`${i1}&a:${i1}:${i1}`, new BindingBehavior(e1, 'a', [e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}&a&b`, new BindingBehavior(new BindingBehavior(e1, 'a', []), 'b', [])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}&a&b&c`, new BindingBehavior(new BindingBehavior(new BindingBehavior(e1, 'a', []), 'b', []), 'c', [])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}&a:${i1}:${i1}`, new BindingBehavior(e1, 'a', [e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}&a:${i1}:${i1}:${i1}`, new BindingBehavior(e1, 'a', [e1, e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}&a:${i1}:${i1}:${i1}&b&c:${i1}:${i1}:${i1}`, new BindingBehavior(new BindingBehavior(new BindingBehavior(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])]),
    ...AccessScopeList.map(([i1, e1]) => <[string, any]>[`${i1}&a:${i1}:${i1}:${i1}&b:${i1}:${i1}:${i1}&c`, new BindingBehavior(new BindingBehavior(new BindingBehavior(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])])
  ];
  describe('parse ComplexBindingBehaviorList', () => {
    for (const [input, expected] of ComplexBindingBehaviorList) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });

  // #endregion

  // https://tc39.github.io/ecma262/#sec-runtime-semantics-iteratordestructuringassignmentevaluation
  describe('parse ForOfStatement', () => {
    const SimpleForDeclarations: [string, any][] = [
      [`a`,           new BindingIdentifier('a')],
      [`{}`,          new ObjectBindingPattern([], [])],
      [`[]`,          new ArrayBindingPattern([])],
    ];

    const ForDeclarations: [string, any][] = [
      [`{a}`,         new ObjectBindingPattern(['a'], [$a])],
      [`{a:a}`,       new ObjectBindingPattern(['a'], [$a])],
      [`{a,b}`,       new ObjectBindingPattern(['a', 'b'], [$a, $b])],
      [`{a:a,b}`,     new ObjectBindingPattern(['a', 'b'], [$a, $b])],
      [`{a,b:b}`,     new ObjectBindingPattern(['a', 'b'], [$a, $b])],
      [`{a:a,b,c}`,   new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a,b:b,c}`,   new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a,b,c:c}`,   new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a:a,b:b,c}`, new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a:a,b,c:c}`, new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a,b:b,c:c}`, new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`[,]`,         new ArrayBindingPattern([$undefined, $undefined])],
      [`[,,]`,        new ArrayBindingPattern([$undefined, $undefined, $undefined])],
      [`[,,,]`,       new ArrayBindingPattern([$undefined, $undefined, $undefined, $undefined])],
      [`[a,]`,        new ArrayBindingPattern([$a, $undefined])],
      [`[a,,]`,       new ArrayBindingPattern([$a, $undefined, $undefined])],
      [`[a,a,]`,      new ArrayBindingPattern([$a, $a, $undefined])],
      [`[a,,,]`,      new ArrayBindingPattern([$a, $undefined, $undefined, $undefined])],
      [`[a,a,,]`,     new ArrayBindingPattern([$a, $a, $undefined, $undefined])],
      [`[,a]`,        new ArrayBindingPattern([$undefined, $a])],
      [`[,a,]`,       new ArrayBindingPattern([$undefined, $a, $undefined])],
      [`[,a,,]`,      new ArrayBindingPattern([$undefined, $a, $undefined, $undefined])],
      [`[,a,a,]`,     new ArrayBindingPattern([$undefined, $a, $a, $undefined])],
      [`[,,a]`,       new ArrayBindingPattern([$undefined, $undefined, $a])],
      [`[,a,a]`,      new ArrayBindingPattern([$undefined, $a, $a])],
      [`[,,a,]`,      new ArrayBindingPattern([$undefined, $undefined, $a, $undefined])],
      [`[,,,a]`,      new ArrayBindingPattern([$undefined, $undefined, $undefined, $a])],
      [`[,,a,a]`,     new ArrayBindingPattern([$undefined, $undefined, $a, $a])]
    ];

    const ForOfStatements: [string, any][] = [
      ...SimpleForDeclarations.map(([decInput, decExpr]) => <[string, any][]>[
        ...SimpleIsBindingBehaviorList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr)])
      ]).reduce((a, c) => a.concat(c)),
      ...ForDeclarations.map(([decInput, decExpr]) => <[string, any][]>[
        ...AccessScopeList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr)])
      ]).reduce((a, c) => a.concat(c))
    ];

    for (const [input, expected] of ForOfStatements) {
      it(input, () => {
        verifyASTEqual(parseCore(input, <any>BindingType.ForCommand), expected);
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
    [`\${\`\${a}\`}`,           new Interpolation(['', ''], [new Template(['', ''],   [$a])])],
    [`\${\`a\${a}\`}`,          new Interpolation(['', ''], [new Template(['a', ''],  [$a])])],
    [`\${\`\${a}a\`}`,          new Interpolation(['', ''], [new Template(['', 'a'],  [$a])])],
    [`\${\`a\${a}a\`}`,         new Interpolation(['', ''], [new Template(['a', 'a'], [$a])])],
    [`\${\`\${\`\${a}\`}\`}`,   new Interpolation(['', ''], [new Template(['', ''], [new Template(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]) => <[string, any][]>[
      [`${raw}`,                null],
      [`\${a}${raw}`,           new Interpolation(['', cooked],        [$a])],
      [`${raw}\${a}`,           new Interpolation([cooked, ''],        [$a])],
      [`${raw}\${a}${raw}`,     new Interpolation([cooked, cooked],    [$a])],
      [`\${a}${raw}\${a}`,      new Interpolation(['', cooked, ''],    [$a, $a])],
    ])
    .reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`\${${input}}`, new Interpolation(['', ''], [expr])]),
    ...SimpleIsAssignList
      .map(([input, expr]) => <[string, any]>[`\${${input}}\${${input}}`, new Interpolation(['', '', ''], [expr, expr])])
  ];
  describe('parse Interpolation', () => {
    for (const [input, expected] of InterpolationList) {
      it(input, () => {
        verifyASTEqual(parseCore(input, <any>BindingType.Interpolation), expected);
      });
    }
  });

  describe('parse unicode IdentifierStart', () => {
    for (const char of latin1IdentifierStartChars) {
      it(char, () => {
        verifyASTEqual(parseCore(char), new AccessScope(char, 0));
      });
    }
  });

  describe('parse unicode IdentifierPart', () => {
    for (const char of latin1IdentifierPartChars) {
      it(char, () => {
        const identifier = `$${char}`;
        verifyASTEqual(parseCore(identifier), new AccessScope(identifier, 0));
      });
    }
  });

  describe('Errors', () => {
    for (const input of [
      ')', '}', ']', '%', '*',
      ',', '/', ':', '>', '<',
      '=', '?', 'of','instanceof', 'in', ' '
    ]) {
      it(`throw Code 100 (InvalidExpressionStart) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 100');
      });
    }

    for (const input of ['..', '...']) {
      it(`throw Code 101 (UnconsumedToken) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 101');
      });
    }
    it(`throw Code 101 (UnconsumedToken) on "$this!"`, () => {
      verifyResultOrError(`$this!`, null, 'Code 101');
    });
    for (const [input] of SimpleIsAssignList) {
      for (const op of [')', ']', '}']) {
        it(`throw Code 110 (MissingExpectedToken) on "${input}${op}"`, () => {
          verifyResultOrError(`${input}${op}`, null, 'Code 101');
        });
      }
    }


    it(`throw Code 102 (DoubleDot) on "$parent..bar"`, () => {
      verifyResultOrError(`$parent..bar`, null, 'Code 102');
    });

    for (const nonTerminal of ['!', ' of', ' typeof', '=']) {
      it(`throw Code 103 (InvalidMemberExpression) on "$parent${nonTerminal}"`, () => {
        verifyResultOrError(`$parent${nonTerminal}`, null, 'Code 103');
      });
    }


    for (const op of ['!', '(', '+', '-', '.', '[', 'typeof']) {
      it(`throw Code 104 (UnexpectedEndOfExpression) on "${op}"`, () => {
        verifyResultOrError(op, null, 'Code 104');
      });
    }

    for (const [input, expr] of SimpleIsLeftHandSideList) {
      it(`throw Code 105 (ExpectedIdentifier) on "${input}."`, () => {
        if (typeof expr['value'] !== 'number' || input.includes('.')) { // only non-float numbers are allowed to end on a dot
          verifyResultOrError(`${input}.`, null, 'Code 105');
        } else {
          verifyResultOrError(`${input}.`, expr, null);
        }
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList) {
      it(`throw Code 106 (InvalidForDeclaration) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 106', BindingType.ForCommand);
      });
    }
    for (const [input] of <[string, any][]>[
      [`a`, new BindingIdentifier('a')]
    ]) {
      it(`throw Code 106 (InvalidForDeclaration) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 106', BindingType.ForCommand);
      });
    }

    for (const input of ['{', '{[]}', '{[}', '{[a]}', '{[a}', '{{', '{(']) {
      it(`throw Code 107 (InvalidObjectLiteralPropertyDefinition) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 107');
      });
    }

    for (const input of ['"', '\'']) {
      it(`throw Code 108 (UnterminatedQuote) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 108');
      });
    }

    for (const input of ['`', '` ', '`${a}']) {
      it(`throw Code 109 (UnterminatedTemplate) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 109');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      for (const op of ['(', '[']) {
        it(`throw Code 110 (MissingExpectedToken) on "${op}${input}"`, () => {
          verifyResultOrError(`${op}${input}`, null, 'Code 110');
        });
      }
    }
    for (const [input] of SimpleIsConditionalList) {
      it(`throw Code 110 (MissingExpectedToken) on "${input}?${input}"`, () => {
        verifyResultOrError(`${input}?${input}`, null, 'Code 110');
      });
    }
    for (const [input] of AccessScopeList) {
      it(`throw Code 110 (MissingExpectedToken) on "{${input}"`, () => {
        verifyResultOrError(`{${input}`, null, 'Code 110');
      });
    }
    for (const [input] of SimpleStringLiteralList) {
      it(`throw Code 110 (MissingExpectedToken) on "{${input}}"`, () => {
        verifyResultOrError(`{${input}}`, null, 'Code 110');
      });
    }
    for (const input of ['{24}', '{24, 24}', '{\'\'}', '{a.b}', '{a[b]}', '{a()}']) {
      it(`throw Code 110 (MissingExpectedToken) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 110');
      });
    }

    for (const input of ['#', ';', '@', '^', '~', '\\', 'foo;']) {
      it(`throw Code 111 (UnexpectedCharacter) on "${input}"`, () => {
        verifyResultOrError(input, null, 'Code 111');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw Code 112 (MissingValueConverter) on "${input}|"`, () => {
        verifyResultOrError(`${input}|`, null, 'Code 112');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw Code 113 (MissingBindingBehavior) on "${input}&"`, () => {
        verifyResultOrError(`${input}&`, null, 'Code 113');
      });
    }

    for (const [input] of [
      [`$this`, $this],
      ...SimpleLiteralList,
      ...SimpleUnaryList
    ]) {
      it(`throw Code 150 (NotAssignable) on "${input}=a"`, () => {
        verifyResultOrError(`${input}=a`, null, 'Code 150');
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList.filter(([i, e]) => !e.ancestor)) {
      it(`throw Code 151 (UnexpectedForOf) on "${input} of"`, () => {
        verifyResultOrError(`${input} of`, null, 'Code 151');
      });
    }
  });

  describe('unknown unicode IdentifierPart', () => {
    for (const char of otherBMPIdentifierPartChars) {
      it(char, () => {
        const identifier = `$${char}`;
        verifyResultOrError(identifier, null, codes.UnexpectedCharacter);
      });
    }
  });
});

function unicodeEscape(str: any): any {
    return str.replace(/[\s\S]/g, (c: any) => `\\u${('0000' + c.charCodeAt().toString(16)).slice(-4)}`);
}
