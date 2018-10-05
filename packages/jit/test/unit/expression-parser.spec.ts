import { AccessKeyed, AccessMember, AccessScope, AccessThis,
  Assign, Binary, BindingBehavior, CallFunction,
  CallMember, CallScope, Conditional,
  ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template,
  Unary, ValueConverter, TaggedTemplate, IsUnary, IsPrimary, BinaryOperator, UnaryOperator, BindingType, Interpolation } from '../../../runtime/src';
import { latin1IdentifierStartChars, latin1IdentifierPartChars, otherBMPIdentifierPartChars } from './unicode';
import { expect } from 'chai';
import { parseCore, parse, Access, Precedence, ParserState } from '../../../jit/src'
import { verifyASTEqual, eachCartesianJoinFactory } from './util';
import { eachCartesianJoin } from '../../../../scripts/test-lib';


const binaryOps: BinaryOperator[] = [
  '&&', '||',
  '==', '!=', '===', '!==',
  '<', '>', '<=', '>=',
  '+', '-',
  '*', '%', '/',
  'in', 'instanceof'
];
const unaryOps: UnaryOperator[] = [
  '!',
  'typeof',
  'void'
];

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


const $this = new AccessThis(0);
const $parent = new AccessThis(1);
const $a = new AccessScope('a');
const $b = new AccessScope('b');
const $c = new AccessScope('c');
const $true = new PrimitiveLiteral(true);
const $false = new PrimitiveLiteral(false);
const $null = new PrimitiveLiteral(null);
const $undefined = new PrimitiveLiteral(undefined);
const $str = new PrimitiveLiteral('');
const $str1 = new PrimitiveLiteral('1');
const $num0 = new PrimitiveLiteral(0);
const $num1 = new PrimitiveLiteral(1);
const $arr = new ArrayLiteral([]);
const $obj = new ObjectLiteral([], []);

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

const AccessThisList: [string, any][] = [
  [`$this`,             $this],
  [`$parent`,           $parent],
  [`$parent.$parent`,   new AccessThis(2)]
];

const AccessScopeList: [string, any][] = [
  ...AccessThisList.map(([input, expr]) => <[string, any]>[`${input}.a`, new AccessScope('a', expr.ancestor)]),
  [`$this.$parent`,     new AccessScope('$parent')],
  [`$parent.$this`,     new AccessScope('$this', 1)],
  [`a`,                 $a]
];

const SimpleArrayLiteralList: [string, any][] = [
  [`[]`,                $arr]
];

const SimpleObjectLiteralList: [string, any][] = [
  [`{}`,                $obj]
];

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
  [`undefined`,         new PrimitiveLiteral(undefined)],
  [`null`,              new PrimitiveLiteral(null)],
  [`true`,              new PrimitiveLiteral(true)],
  [`false`,             new PrimitiveLiteral(false)]
];

const SimplePrimitiveLiteralList: [string, any][] = [
  ...SimpleStringLiteralList,
  ...SimpleNumberLiteralList,
  ...KeywordPrimitiveLiteralList
];

const SimpleTemplateLiteralList: [string, any][] = [
  [`\`\``,              new Template([''], [])],
  [`\`\${a}\``,         new Template(['', ''], [$a])]
];

const SimpleLiteralList: [string, any][] = [
  ...SimplePrimitiveLiteralList,
  ...SimpleTemplateLiteralList,
  ...SimpleArrayLiteralList,
  ...SimpleObjectLiteralList
];

const SimplePrimaryList: [string, any][] = [
  ...AccessThisList,
  ...AccessScopeList,
  ...SimpleLiteralList,
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

const SimpleAccessKeyedList: [string, any][] = [
  ...SimplePrimaryList
    .map(([input, expr]) => <[string, any]>[`${input}[b]`, new AccessKeyed(expr, $b)])
];

const SimpleAccessMemberList: [string, any][] = [
  ...[...AccessScopeList, ...SimpleLiteralList]
    .map(([input, expr]) => <[string, any]>[`${input}.b`, new AccessMember(expr, 'b')])
];

const SimpleTaggedTemplateList: [string, any][] = [
  ...SimplePrimaryList
    .map(([input, expr]) => <[string, any]>[`${input}\`\``, new TaggedTemplate([''], [''], expr, [])]),

  ...SimplePrimaryList
    .map(([input, expr]) => <[string, any]>[`${input}\`\${a}\``, new TaggedTemplate(['', ''], ['', ''], expr, [$a])])
];

const SimpleCallFunctionList: [string, any][] = [
  ...[...AccessThisList, ...SimpleLiteralList]
    .map(([input, expr]) => <[string, any]>[`${input}()`, new CallFunction(expr, [])])
];

const SimpleCallScopeList: [string, any][] = [
  ...[...AccessScopeList]
    .map(([input, expr]) => <[string, any]>[`${input}()`, new CallScope(expr.name, [], expr.ancestor)])
];

const SimpleCallMemberList: [string, any][] = [
  ...[...AccessScopeList, ...SimpleLiteralList]
    .map(([input, expr]) => <[string, any]>[`${input}.b()`, new CallMember(expr, 'b', [])])
];

const SimpleLeftHandSideList: [string, any][] = [
  ...SimpleAccessKeyedList,
  ...SimpleAccessMemberList,
  ...SimpleTaggedTemplateList,
  ...SimpleCallFunctionList,
  ...SimpleCallScopeList,
  ...SimpleCallMemberList
];

const SimpleIsLeftHandSideList: [string, any][] = [
  ...SimplePrimaryList,
  ...SimpleLeftHandSideList
];

const SimpleUnaryList: [string, any][] = [
  [`!$1`, new Unary('!', new AccessScope('$1'))],
  [`-$2`, new Unary('-', new AccessScope('$2'))],
  [`+$3`, new Unary('+', new AccessScope('$3'))],
  [`void $4`, new Unary('void', new AccessScope('$4'))],
  [`typeof $5`, new Unary('typeof', new AccessScope('$5'))]
];

const SimpleIsUnaryList: [string, any][] = [
  ...SimpleIsLeftHandSideList,
  ...SimpleUnaryList
];

const SimpleMultiplicativeList: [string, any][] = [
  [`$6*$7`, new Binary('*', new AccessScope('$6'), new AccessScope('$7'))],
  [`$8%$9`, new Binary('%', new AccessScope('$8'), new AccessScope('$9'))],
  [`$10/$11`, new Binary('/', new AccessScope('$10'), new AccessScope('$11'))]
];

const SimpleIsMultiplicativeList: [string, any][] = [
  ...SimpleIsUnaryList,
  ...SimpleMultiplicativeList
];

const SimpleAdditiveList: [string, any][] = [
  [`$12+$13`, new Binary('+', new AccessScope('$12'), new AccessScope('$13'))],
  [`$14-$15`, new Binary('-', new AccessScope('$14'), new AccessScope('$15'))]
];

const SimpleIsAdditiveList: [string, any][] = [
  ...SimpleIsMultiplicativeList,
  ...SimpleAdditiveList
];

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

const SimpleLogicalANDList: [string, any][] = [
  [`$36&&$37`, new Binary('&&', new AccessScope('$36'), new AccessScope('$37'))]
];

const SimpleIsLogicalANDList: [string, any][] = [
  ...SimpleIsEqualityList,
  ...SimpleLogicalANDList
];

const SimpleLogicalORList: [string, any][] = [
  [`$38||$39`, new Binary('||', new AccessScope('$38'), new AccessScope('$39'))]
];

const SimpleIsLogicalORList: [string, any][] = [
  ...SimpleIsLogicalANDList,
  ...SimpleLogicalORList
];

const SimpleConditionalList: [string, any][] = [
  [`a?b:c`, new Conditional($a, $b, new AccessScope('c'))]
];

const SimpleIsConditionalList: [string, any][] = [
  ...SimpleIsLogicalORList,
  ...SimpleConditionalList
];

const SimpleAssignList: [string, any][] = [
  [`a=b`, new Assign($a, $b)]
];

const SimpleIsAssignList: [string, any][] = [
  ...SimpleIsConditionalList,
  ...SimpleAssignList
];

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

const ComplexTemplateLiteralList: [string, any][] = [
  [`\`a\``,                       new Template(['a'], [])],
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

const ComplexPrimaryList: [string, any][] = [
  ...ComplexStringLiteralList,
  ...ComplexNumberList,
  ...ComplexTemplateLiteralList,
  ...ComplexArrayLiteralList,
  ...ComplexObjectLiteralList
];

const ComplexAccessKeyedList: [string, any][] = [
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`a[${input}]`, new AccessKeyed($a, expr)])
];

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

const ComplexTaggedTemplateList: [string, any][] = [
  [`a\`a\``,                       new TaggedTemplate(['a'],           ['a'],             $a, [])],
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

const ComplexCallFunctionList: [string, any][] = [
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`$this(${input})`, new CallFunction($this, [expr])]),
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`$this(${input},${input})`, new CallFunction($this, [expr, expr])])
];

const ComplexCallScopeList: [string, any][] = [
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`a(${input})`, new CallScope('a', [expr])]),
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`a(${input},${input})`, new CallScope('a', [expr, expr])])
];

const ComplexCallMemberList: [string, any][] = [
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`a.b(${input})`, new CallMember($a, 'b', [expr])]),
  ...SimpleIsAssignList
    .map(([input, expr]) => <[string, any]>[`a.b(${input},${input})`, new CallMember($a, 'b', [expr, expr])])
];

const ComplexLeftHandSideList: [string, any][] = [
  ...ComplexAccessKeyedList,
  ...ComplexAccessMemberList,
  ...ComplexTaggedTemplateList,
  ...ComplexCallFunctionList,
  ...ComplexCallScopeList,
  ...ComplexCallMemberList
];

const ComplexIsLeftHandSideList: [string, any][] = [
  ...ComplexPrimaryList,
  ...ComplexLeftHandSideList
];

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

const ComplexIsUnaryList: [string, any][] = [
  ...ComplexIsLeftHandSideList,
  ...ComplexUnaryList
];

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

const ComplexIsMultiplicativeList: [string, any][] = [
  ...ComplexIsUnaryList,
  ...ComplexMultiplicativeList
];

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

const ComplexIsAdditiveList: [string, any][] = [
  ...ComplexIsMultiplicativeList,
  ...ComplexAdditiveList
];

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

const ComplexIsRelationalList: [string, any][] = [
  ...ComplexIsAdditiveList,
  ...ComplexRelationalList
];

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

const ComplexIsEqualityList: [string, any][] = [
  ...ComplexIsRelationalList,
  ...ComplexEqualityList
];

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

const ComplexIsLogicalANDList: [string, any][] = [
  ...ComplexIsEqualityList,
  ...ComplexLogicalANDList
];

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

const ComplexIsLogicalORList: [string, any][] = [
  ...ComplexIsLogicalANDList,
  ...ComplexLogicalORList
];

const ComplexConditionalList: [string, any][] = [
  ...SimpleIsLogicalORList.map(([i1, e1]) => <[string, any]>[`${i1}?0:1`, new Conditional(e1, $num0, $num1)]),
  ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`0?1:${i1}`, new Conditional($num0, $num1, e1)]),
  ...SimpleIsAssignList.map(([i1, e1]) => <[string, any]>[`0?${i1}:1`, new Conditional($num0, e1, $num1)]),
  ...SimpleConditionalList.map(([i1, e1]) => <[string, any]>[`${i1}?0:1`, new Conditional(e1.condition, e1.yes, new Conditional(e1.no, $num0, $num1))])
];

const ComplexIsConditionalList: [string, any][] = [
  ...ComplexIsLogicalORList,
  ...ComplexConditionalList
];

const ComplexAssignList: [string, any][] = [

];

const ComplexIsAssignList: [string, any][] = [
  ...ComplexIsConditionalList,
  ...ComplexAssignList
];

const ComplexValueConverterList: [string, any][] = [

];

const ComplexIsValueConverterList: [string, any][] = [
  ...ComplexIsAssignList,
  ...ComplexValueConverterList
];

const ComplexBindingBehaviorList: [string, any][] = [

];

const ComplexIsBindingBehaviorList: [string, any][] = [
  ...ComplexIsValueConverterList,
  ...ComplexBindingBehaviorList
];

describe('ExpressionParser', () => {
  describe('should parse valid property binding expressions', () => {
    for (const [input, expected] of [
      ...SimpleIsBindingBehaviorList,
      ...ComplexIsBindingBehaviorList
    ]) {
      it(input, () => {
        verifyASTEqual(parseCore(input), expected);
      });
    }
  });


  //   const variadics = [
  //     { ctor: BindingBehavior, op: '&' },
  //     { ctor: ValueConverter, op: '|' }
  //   ];

  //   for (const { ctor: Variadic, op } of variadics) {
  //     const $this0 = $this;
  //     const $this1 = $parent;
  //     const $this2 = new AccessThis(2);

  //     describe(Variadic.name, () => {
  //       const tests = [
  //         { expr: `foo${op}bar:$this:$this`, expected: new (<any>Variadic)($foo, 'bar', [$this0, $this0]) },
  //         { expr: `foo${op}bar:$this:$parent`, expected: new (<any>Variadic)($foo, 'bar', [$this0, $this1]) },
  //         { expr: `foo${op}bar:$parent:$this`, expected: new (<any>Variadic)($foo, 'bar', [$this1, $this0]) },
  //         { expr: `foo${op}bar:$parent.$parent:$parent.$parent`, expected: new (<any>Variadic)($foo, 'bar', [$this2, $this2]) },
  //         { expr: `foo${op}bar:"1"?"":"1":true?foo:bar`, expected: new (<any>Variadic)($foo, 'bar', [new Conditional($str1, $str, $str1), new Conditional($true, $foo, $bar)]) },
  //         { expr: `foo${op}bar:[1<=0]:[[],[[]]]`, expected: new (<any>Variadic)($foo, 'bar', [new ArrayLiteral([new Binary('<=', $num1, $num0)]), new ArrayLiteral([$arr, new ArrayLiteral([$arr])])]) },
  //         { expr: `foo${op}bar:{foo:a?b:c}:{1:1}`, expected: new (<any>Variadic)($foo, 'bar', [new ObjectLiteral(['foo'], [new Conditional($a, $b, $c)]), new ObjectLiteral([1], [$num1])]) },
  //         { expr: `foo${op}bar:a(b({})[c()[d()]])`, expected: new (<any>Variadic)($foo, 'bar', [new CallScope('a', [new AccessKeyed(new CallScope('b', [$obj], 0), new AccessKeyed(new CallScope('c', [], 0), new CallScope('d', [], 0)))], 0)]) },
  //         { expr: `a(b({})[c()[d()]])${op}bar`, expected: new (<any>Variadic)(new CallScope('a', [new AccessKeyed(new CallScope('b', [$obj], 0), new AccessKeyed(new CallScope('c', [], 0), new CallScope('d', [], 0)))], 0), 'bar', []) },
  //         { expr: `true?foo:bar${op}bar`, expected: new (<any>Variadic)(new Conditional($true, $foo, $bar), 'bar', []) },
  //         { expr: `$parent.$parent${op}bar`, expected: new (<any>Variadic)($this2, 'bar', []) }
  //       ];

  //       for (const { expr, expected } of tests) {
  //         it(expr, () => {
  //           verifyASTEqual(parseCore(expr), expected);
  //         });
  //       }
  //     });
  //   }

  //   it('chained BindingBehaviors', () => {
  //     const expr = parseCore('foo & bar:x:y:z & baz:a:b:c');
  //     verifyASTEqual(expr, new BindingBehavior(new BindingBehavior($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
  //   });

  //   it('chained ValueConverters', () => {
  //     const expr = parseCore('foo | bar:x:y:z | baz:a:b:c');
  //     verifyASTEqual(expr, new ValueConverter(new ValueConverter($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
  //   });

  //   it('chained ValueConverters and BindingBehaviors', () => {
  //     const expr = parseCore('foo | bar:x:y:z & baz:a:b:c');
  //     verifyASTEqual(expr, new BindingBehavior(new ValueConverter($foo, 'bar', [$x, $y, $z]), 'baz', [$a, $b, $c]));
  //   });

  //   it('AccessScope', () => {
  //     const expr = parseCore('foo');
  //     verifyASTEqual(expr, $foo);
  //   });

  //   const parents = [
  //     { i: 1, name: '$parent' },
  //     { i: 2, name: '$parent.$parent' },
  //     { i: 3, name: '$parent.$parent.$parent' },
  //     { i: 4, name: '$parent.$parent.$parent.$parent' },
  //     { i: 5, name: '$parent.$parent.$parent.$parent.$parent' },
  //     { i: 6, name: '$parent.$parent.$parent.$parent.$parent.$parent' },
  //     { i: 7, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent' },
  //     { i: 8, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent' },
  //     { i: 9, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent' },
  //     { i: 10, name: '$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent'  }
  //   ];
  //   describe('$parent', () => {
  //     for (const { i, name } of parents) {
  //       it(name, () => {
  //         const expr = parseCore(name);
  //         verifyASTEqual(expr, new AccessThis(i));
  //       });

  //       it(`${name} before ValueConverter`, () => {
  //         const expr = parseCore(`${name} | foo`);
  //         verifyASTEqual(expr, new ValueConverter(new AccessThis(i), 'foo', []));
  //       });

  //       it(`${name}.bar before ValueConverter`, () => {
  //         const expr = parseCore(`${name}.bar | foo`);
  //         verifyASTEqual(expr, new ValueConverter(new AccessScope('bar', i), 'foo', []));
  //       });

  //       it(`${name} before binding behavior`, () => {
  //         const expr = parseCore(`${name} & foo`);
  //         verifyASTEqual(expr, new BindingBehavior(new AccessThis(i), 'foo', []));
  //       });

  //       it(`${name}.bar before binding behavior`, () => {
  //         const expr = parseCore(`${name}.bar & foo`);
  //         verifyASTEqual(expr, new BindingBehavior(new AccessScope('bar', i), 'foo', []));
  //       });

  //       it(`${name}.foo to AccessScope`, () => {
  //         const expr = parseCore(`${name}.foo`);
  //         verifyASTEqual(expr, new AccessScope(`foo`, i));
  //       });

  //       it(`${name}.foo() to CallScope`, () => {
  //         const expr = parseCore(`${name}.foo()`);
  //         verifyASTEqual(expr, new CallScope(`foo`, [], i));
  //       });

  //       it(`${name}() to CallFunction`, () => {
  //         const expr = parseCore(`${name}()`);
  //         verifyASTEqual(expr, new CallFunction(new AccessThis(i), []));
  //       });

  //       it(`${name}[0] to AccessKeyed`, () => {
  //         const expr = parseCore(`${name}[0]`);
  //         verifyASTEqual(expr, new AccessKeyed(new AccessThis(i), $num0));
  //       });
  //     }
  //   });

    describe('unicode IdentifierStart', () => {
      for (const char of latin1IdentifierStartChars) {
        it(char, () => {
          const expr = parseCore(char);
          verifyASTEqual(expr, new AccessScope(char, 0));
        });
      }
    });

    describe('unicode IdentifierPart', () => {
      for (const char of latin1IdentifierPartChars) {
        it(char, () => {
          const identifier = `$${char}`;
          const expr = parseCore(identifier);
          verifyASTEqual(expr, new AccessScope(identifier, 0));
        });
      }
    });
  // });

  describe('should not parse', () => {
    // it('Assign to Unary plus', () => {
    //   verifyResultOrError('+foo = bar', null, codes.NotAssignable);
    // });

    // describe('LiteralObject with computed property', () => {
    //   const expressions = [
    //     '{ []: "foo" }',
    //     '{ [42]: "foo" }',
    //     '{ ["foo"]: "bar" }',
    //     '{ [foo]: "bar" }'
    //   ];

    //   for (const expr of expressions) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.InvalidObjectLiteralPropertyDefinition);
    //     });
    //   }
    // });

    // describe('invalid shorthand properties', () => {
    //   const expressions = [
    //     '{ foo.bar }',
    //     '{ foo.bar, bar.baz }',
    //     '{ "foo" }',
    //     '{ "foo.bar" }',
    //     '{ 42 }',
    //     '{ 42, 42 }',
    //     '{ [foo] }',
    //     '{ ["foo"] }',
    //     '{ [42] }'
    //   ];

    //   for (const expr of expressions) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.InvalidObjectLiteralPropertyDefinition);
    //     });
    //   }
    // });

    // describe('semicolon', () => {
    //   const expressions = [
    //     ';',
    //     'foo;',
    //     ';foo',
    //     'foo&bar;baz|qux'
    //   ];

    //   for (const expr of expressions) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.UnexpectedCharacter);
    //     });
    //   }
    // });

    // describe('extra closing token', () => {
    //   const tests = [
    //     { expr: 'foo())', token: ')' },
    //     { expr: 'foo[x]]', token: ']' },
    //     { expr: '{foo}}', token: '}' }
    //   ];

    //   for (const { expr, token } of tests) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.UnconsumedToken);
    //     });
    //   }
    // });

    // describe('invalid start of expression', () => {
    //   const tests = [')', ']', '}', ''];

    //   for (const expr of tests) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.InvalidExpressionStart);
    //     });
    //   }
    // });

    // describe('missing expected token', () => {
    //   const tests = [
    //     { expr: '(foo', token: ')' },
    //     { expr: '[foo', token: ']' },
    //     { expr: '{foo', token: ',' },
    //     { expr: 'foo(bar', token: ')' },
    //     { expr: 'foo[bar', token: ']' },
    //     { expr: 'foo.bar(baz', token: ')' },
    //     { expr: 'foo.bar[baz', token: ']' }
    //   ];

    //   for (const { expr, token } of tests) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.MissingExpectedToken);
    //     });
    //   }
    // });

    // describe('assigning unassignable', () => {
    //   const expressions = [
    //     '(foo ? bar : baz) = qux',
    //     '$this = foo',
    //     'foo() = bar',
    //     'foo.bar() = baz',
    //     '!foo = bar',
    //     '-foo = bar',
    //     '\'foo\' = bar',
    //     '42 = foo',
    //     '[] = foo',
    //     '{} = foo'
    //   ].concat(binaryOps.map(op => `foo ${op} bar = baz`));

    //   for (const expr of expressions) {
    //     it(expr, () => {
    //       verifyResultOrError(expr, null, codes.NotAssignable);
    //     });
    //   }
    // });

    // it('incomplete conditional', () => {
    //   verifyResultOrError('foo ? bar', null, codes.MissingExpectedToken);
    // });

    // describe('invalid primary expression', () => {
    //   const expressions = ['.', ',', '&', '|', '=', '<', '>', '*', '%', '/'];
    //   expressions.push(...expressions.map(e => `${e} `));
    //   for (const expr of expressions) {
    //     it(expr, () => {
    //       if (expr.length === 1) {
    //         verifyResultOrError(expr, null, codes.UnexpectedEndOfExpression);
    //       } else {
    //         verifyResultOrError(expr, null, codes.UnconsumedToken);
    //       }
    //     });
    //   }
    // });

    // describe('unknown unicode IdentifierPart', () => {
    //   for (const char of otherBMPIdentifierPartChars) {
    //     it(char, () => {
    //       const identifier = `$${char}`;
    //       verifyResultOrError(identifier, null, codes.UnexpectedCharacter);
    //     });
    //   }
    // });

    // it('double dot (AccessScope)', () => {
    //   verifyResultOrError('foo..bar', null, codes.DoubleDot);
    // });

    // it('double dot (AccessMember)', () => {
    //   verifyResultOrError('foo.bar..baz', null, codes.DoubleDot);
    // });

    // it('double dot (AccessThis)', () => {
    //   verifyResultOrError('$parent..bar', null, codes.DoubleDot);
    // });
  });
});

function unicodeEscape(str: any): any {
    return str.replace(/[\s\S]/g, (c: any) => `\\u${('0000' + c.charCodeAt().toString(16)).slice(-4)}`);
}
