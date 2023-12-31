/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  AccessKeyedExpression,
  AccessMemberExpression,
  AccessScopeExpression,
  AccessThisExpression,
  ArrayBindingPattern,
  ArrayLiteralExpression,
  AssignExpression,
  BinaryExpression,
  BindingBehaviorExpression,
  BindingIdentifier,
  CallFunctionExpression,
  CallMemberExpression,
  CallScopeExpression,
  ConditionalExpression,
  CustomExpression,
  ForOfStatement,
  Interpolation,
  ObjectBindingPattern,
  ObjectLiteralExpression,
  PrimitiveLiteralExpression,
  TaggedTemplateExpression,
  TemplateExpression,
  UnaryExpression,
  ValueConverterExpression,
  AnyBindingExpression,
  BinaryOperator,
  BindingIdentifierOrPattern,
  IsAssign,
  IsAssignable,
  IsBinary,
  IsBindingBehavior,
  IsExpressionOrStatement,
  IsLeftHandSide,
  IsValueConverter,
  UnaryOperator,
  DestructuringAssignmentSingleExpression as DASE,
  DestructuringAssignmentExpression as DAE,
  ArrowFunction,
  AccessGlobalExpression,
  CallGlobalExpression,
  ExpressionKind,
} from './ast';
import { createInterface, createLookup, objectAssign } from '../utilities';
import { ErrorNames, createMappedError } from '../errors';

export interface IExpressionParser extends ExpressionParser {}
export const IExpressionParser = createInterface<IExpressionParser>('IExpressionParser', x => x.singleton(ExpressionParser));

export class ExpressionParser {
  /** @internal */ private readonly _expressionLookup: Record<string, IsBindingBehavior> = createLookup();
  /** @internal */ private readonly _forOfLookup: Record<string, ForOfStatement> = createLookup();
  /** @internal */ private readonly _interpolationLookup: Record<string, Interpolation> = createLookup();

  public parse(expression: string, expressionType: ExpressionType.IsIterator): ForOfStatement;
  public parse(expression: string, expressionType: ExpressionType.Interpolation): Interpolation;
  public parse(expression: string, expressionType: Exclude<ExpressionType, ExpressionType.IsIterator | ExpressionType.Interpolation>): IsBindingBehavior;
  public parse(expression: string, expressionType: ExpressionType): AnyBindingExpression;
  public parse(expression: string, expressionType: ExpressionType): AnyBindingExpression {
    let found: AnyBindingExpression;
    switch (expressionType) {
      case ExpressionType.IsCustom:
        return new CustomExpression(expression) as AnyBindingExpression;
      case ExpressionType.Interpolation:
        found = this._interpolationLookup[expression];
        if (found === void 0) {
          found = this._interpolationLookup[expression] = this.$parse(expression, expressionType);
        }
        return found;
      case ExpressionType.IsIterator:
        found = this._forOfLookup[expression];
        if (found === void 0) {
          found = this._forOfLookup[expression] = this.$parse(expression, expressionType);
        }
        return found;
      default: {
        if (expression.length === 0) {
          // this is an intermediate code before converting the ExpressionType enum to a string literal type as part of the issue #1736
          if (expressionType === ExpressionType.IsFunction || expressionType === ExpressionType.IsProperty) {
            return PrimitiveLiteralExpression.$empty;
          }
          throw invalidEmptyExpression();
        }
        found = this._expressionLookup[expression];
        if (found === void 0) {
          found = this._expressionLookup[expression] = this.$parse(expression, expressionType);
        }
        return found;
      }
    }
  }

  /** @internal */
  private $parse(expression: string, expressionType: ExpressionType.IsIterator): ForOfStatement;
  /** @internal */
  private $parse(expression: string, expressionType: ExpressionType.Interpolation): Interpolation;
  /** @internal */
  private $parse(expression: string, expressionType: Exclude<ExpressionType, ExpressionType.IsIterator | ExpressionType.Interpolation>): IsBindingBehavior;
  /** @internal */
  private $parse(expression: string, expressionType: ExpressionType): AnyBindingExpression {
    $input = expression;
    $index = 0;
    $length = expression.length;
    $scopeDepth = 0;
    $startIndex = 0;
    $currentToken = Token.EOF;
    $tokenValue = '';
    $currentChar = $charCodeAt(0);
    $assignable = true;
    $optional = false;
    $accessGlobal = true;
    $semicolonIndex = -1;
    return parse(Precedence.Variadic, expressionType === void 0 ? ExpressionType.IsProperty : expressionType);
  }
}

_START_CONST_ENUM();
const enum Char {
  Null           = 0x00,
  Backspace      = 0x08,
  Tab            = 0x09,
  LineFeed       = 0x0A,
  VerticalTab    = 0x0B,
  FormFeed       = 0x0C,
  CarriageReturn = 0x0D,
  Space          = 0x20,
  Exclamation    = 0x21,
  DoubleQuote    = 0x22,
  Dollar         = 0x24,
  Percent        = 0x25,
  Ampersand      = 0x26,
  SingleQuote    = 0x27,
  OpenParen      = 0x28,
  CloseParen     = 0x29,
  Asterisk       = 0x2A,
  Plus           = 0x2B,
  Comma          = 0x2C,
  Minus          = 0x2D,
  Dot            = 0x2E,
  Slash          = 0x2F,
  Semicolon      = 0x3B,
  Backtick       = 0x60,
  OpenBracket    = 0x5B,
  Backslash      = 0x5C,
  CloseBracket   = 0x5D,
  Caret          = 0x5E,
  Underscore     = 0x5F,
  OpenBrace      = 0x7B,
  Bar            = 0x7C,
  CloseBrace     = 0x7D,
  Colon          = 0x3A,
  LessThan       = 0x3C,
  Equals         = 0x3D,
  GreaterThan    = 0x3E,
  Question       = 0x3F,

  Zero   = 0x30,
  One    = 0x31,
  Two    = 0x32,
  Three  = 0x33,
  Four   = 0x34,
  Five   = 0x35,
  Six    = 0x36,
  Seven  = 0x37,
  Eight  = 0x38,
  Nine   = 0x39,

  UpperA = 0x41,
  UpperB = 0x42,
  UpperC = 0x43,
  UpperD = 0x44,
  UpperE = 0x45,
  UpperF = 0x46,
  UpperG = 0x47,
  UpperH = 0x48,
  UpperI = 0x49,
  UpperJ = 0x4A,
  UpperK = 0x4B,
  UpperL = 0x4C,
  UpperM = 0x4D,
  UpperN = 0x4E,
  UpperO = 0x4F,
  UpperP = 0x50,
  UpperQ = 0x51,
  UpperR = 0x52,
  UpperS = 0x53,
  UpperT = 0x54,
  UpperU = 0x55,
  UpperV = 0x56,
  UpperW = 0x57,
  UpperX = 0x58,
  UpperY = 0x59,
  UpperZ = 0x5A,

  LowerA  = 0x61,
  LowerB  = 0x62,
  LowerC  = 0x63,
  LowerD  = 0x64,
  LowerE  = 0x65,
  LowerF  = 0x66,
  LowerG  = 0x67,
  LowerH  = 0x68,
  LowerI  = 0x69,
  LowerJ  = 0x6A,
  LowerK  = 0x6B,
  LowerL  = 0x6C,
  LowerM  = 0x6D,
  LowerN  = 0x6E,
  LowerO  = 0x6F,
  LowerP  = 0x70,
  LowerQ  = 0x71,
  LowerR  = 0x72,
  LowerS  = 0x73,
  LowerT  = 0x74,
  LowerU  = 0x75,
  LowerV  = 0x76,
  LowerW  = 0x77,
  LowerX  = 0x78,
  LowerY  = 0x79,
  LowerZ  = 0x7A
}
_END_CONST_ENUM();

function unescapeCode(code: number): number {
  switch (code) {
    case Char.LowerB: return Char.Backspace;
    case Char.LowerT: return Char.Tab;
    case Char.LowerN: return Char.LineFeed;
    case Char.LowerV: return Char.VerticalTab;
    case Char.LowerF: return Char.FormFeed;
    case Char.LowerR: return Char.CarriageReturn;
    case Char.DoubleQuote: return Char.DoubleQuote;
    case Char.SingleQuote: return Char.SingleQuote;
    case Char.Backslash: return Char.Backslash;
    default: return code;
  }
}

_START_CONST_ENUM();
const enum Precedence {
  Variadic                = 0b0000_111101,
  Assign                  = 0b0000_111110,
  Conditional             = 0b0000_111111,
  NullishCoalescing       = 0b0010_000000,
  LogicalOR               = 0b0011_000000,
  LogicalAND              = 0b0100_000000,
  Equality                = 0b0101_000000,
  Relational              = 0b0110_000000,
  Additive                = 0b0111_000000,
  Multiplicative          = 0b1000_000000,
  Binary                  = 0b1000_000001,
  LeftHandSide            = 0b1000_000010,
  Primary                 = 0b1000_000011,
  Unary                   = 0b1000_000100,
}
_END_CONST_ENUM();

_START_CONST_ENUM();
const enum Token {
  EOF                     = 0b1100000000000_0000_000000,
  ExpressionTerminal      = 0b1000000000000_0000_000000,
  AccessScopeTerminal     = 0b0100000000000_0000_000000,
  ClosingToken            = 0b0010000000000_0000_000000,
  OpeningToken            = 0b0001000000000_0000_000000,
  BinaryOp                = 0b0000100000000_0000_000000,
  UnaryOp                 = 0b0000010000000_0000_000000,
  LeftHandSide            = 0b0000001000000_0000_000000,
  StringOrNumericLiteral  = 0b0000000110000_0000_000000,
  NumericLiteral          = 0b0000000100000_0000_000000,
  StringLiteral           = 0b0000000010000_0000_000000,
  IdentifierName          = 0b0000000001100_0000_000000,
  // Keyword                 = 0b0000000001000_0000_000000,
  Identifier              = 0b0000000000100_0000_000000,
  Contextual              = 0b0000000000010_0000_000000,
  OptionalSuffix          = 0b0000000001101_0000_000000,
  Precedence              = 0b0000000000000_1111_000000,
  Type                    = 0b0000000000000_0000_111111,
  FalseKeyword            = 0b0000000001000_0000_000000,
  TrueKeyword             = 0b0000000001000_0000_000001,
  NullKeyword             = 0b0000000001000_0000_000010,
  UndefinedKeyword        = 0b0000000001000_0000_000011,
  ThisScope               = 0b0000000001100_0000_000100,
  // HostScope            = 0b0000000001100_0000_000101,
  ParentScope             = 0b0000000001100_0000_000110,
  OpenParen               = 0b0101001000001_0000_000111,
  OpenBrace               = 0b0001000000000_0000_001000,
  Dot                     = 0b0000001000000_0000_001001,
  DotDot                  = 0b0000000000000_0000_001010,
  DotDotDot               = 0b0000000000000_0000_001011,
  QuestionDot             = 0b0100001000000_0000_001100,
  CloseBrace              = 0b1110000000000_0000_001101,
  CloseParen              = 0b1110000000000_0000_001110,
  Comma                   = 0b1100000000000_0000_001111,
  OpenBracket             = 0b0101001000001_0000_010000,
  CloseBracket            = 0b1110000000000_0000_010011,
  Colon                   = 0b1100000000000_0000_010100,
  Semicolon               = 0b1100000000000_0000_010101,
  Question                = 0b1100000000000_0000_010110,
  Ampersand               = 0b1100000000000_0000_010111,
  Bar                     = 0b1100000000000_0000_011000,
  QuestionQuestion        = 0b1100100000000_0010_011001,
  BarBar                  = 0b1100100000000_0011_011010,
  AmpersandAmpersand      = 0b1100100000000_0100_011011,
  EqualsEquals            = 0b1100100000000_0101_011100,
  ExclamationEquals       = 0b1100100000000_0101_011101,
  EqualsEqualsEquals      = 0b1100100000000_0101_011110,
  ExclamationEqualsEquals = 0b1100100000000_0101_011111,
  LessThan                = 0b1100100000000_0110_100000,
  GreaterThan             = 0b1100100000000_0110_100001,
  LessThanEquals          = 0b1100100000000_0110_100010,
  GreaterThanEquals       = 0b1100100000000_0110_100011,
  InKeyword               = 0b1100100001000_0110_100100,
  InstanceOfKeyword       = 0b1100100001000_0110_100101,
  Plus                    = 0b0100110000000_0111_100110,
  Minus                   = 0b0100110000000_0111_100111,
  TypeofKeyword           = 0b0000010001000_0000_101000,
  VoidKeyword             = 0b0000010001000_0000_101001,
  Asterisk                = 0b1100100000000_1000_101010,
  Percent                 = 0b1100100000000_1000_101011,
  Slash                   = 0b1100100000000_1000_101100,
  Equals                  = 0b1000000000000_0000_101101,
  Exclamation             = 0b0000010000000_0000_101110,
  TemplateTail            = 0b0100001000001_0000_101111,
  TemplateContinuation    = 0b0100001000001_0000_110000,
  OfKeyword               = 0b1000000001010_0000_110001,
  Arrow                   = 0b0000000000000_0000_110010,
}
_END_CONST_ENUM();

const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $this = new AccessThisExpression(0);
const $parent = new AccessThisExpression(1);

export const enum ExpressionType {
          None = 0,
 Interpolation = 0b0_000001,
    IsIterator = 0b0_000010,
   IsChainable = 0b0_000100,
    IsFunction = 0b0_001000,
    IsProperty = 0b0_010000,
    IsCustom   = 0b0_100000,
}

let $input: string = '';
let $index: number = 0;
let $length: number = 0;
let $scopeDepth: number = 0;
let $startIndex: number = 0;
let $currentToken: Token = Token.EOF;
let $tokenValue: string | number = '';
let $currentChar: number;
let $assignable: boolean = true;
let $optional: boolean = false;
let $accessGlobal: boolean = true;
let $semicolonIndex: number = -1;

const stringFromCharCode = String.fromCharCode;
const $charCodeAt = (index: number) => $input.charCodeAt(index);

const $tokenRaw = (): string => $input.slice($startIndex, $index);

const globalNames =
  ('Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent' +
  ' Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl').split(' ');

export function parseExpression(input: string, expressionType?: ExpressionType): AnyBindingExpression {
  $input = input;
  $index = 0;
  $length = input.length;
  $scopeDepth = 0;
  $startIndex = 0;
  $currentToken = Token.EOF;
  $tokenValue = '';
  $currentChar = $charCodeAt(0);
  $assignable = true;
  $optional = false;
  $accessGlobal = true;
  $semicolonIndex = -1;
  return parse(Precedence.Variadic, expressionType === void 0 ? ExpressionType.IsProperty : expressionType);
}

// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
export function parse(minPrecedence: Precedence, expressionType: ExpressionType): AnyBindingExpression {
  if (expressionType === ExpressionType.IsCustom) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new CustomExpression($input) as any;
  }

  if ($index === 0) {
    if (expressionType & ExpressionType.Interpolation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return parseInterpolation() as any;
    }
    nextToken();
    if ($currentToken & Token.ExpressionTerminal) {
      throw invalidStartOfExpression();
    }
  }

  $assignable = Precedence.Binary > minPrecedence;
  $optional = false;
  $accessGlobal = Precedence.LeftHandSide > minPrecedence;
  let optionalThisTail = false;
  let result = void 0 as unknown as IsExpressionOrStatement;
  let ancestor = 0;

  if ($currentToken & Token.UnaryOp) {
    /**
     * parseUnaryExpression
     *
     * https://tc39.github.io/ecma262/#sec-unary-operators
     *
     * UnaryExpression :
     * 1. LeftHandSideExpression
     * 2. void UnaryExpression
     * 3. typeof UnaryExpression
     * 4. + UnaryExpression
     * 5. - UnaryExpression
     * 6. ! UnaryExpression
     *
     * IsValidAssignmentTarget
     * 2,3,4,5,6 = false
     * 1 = see parseLeftHandSideExpression
     *
     * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
     */
    const op = TokenValues[$currentToken & Token.Type] as UnaryOperator;
    nextToken();
    result = new UnaryExpression(op, parse(Precedence.LeftHandSide, expressionType) as IsLeftHandSide);
    $assignable = false;
  } else {
    /**
     * parsePrimaryExpression
     *
     * https://tc39.github.io/ecma262/#sec-primary-expression
     *
     * PrimaryExpression :
     * 1. this
     * 2. IdentifierName
     * 3. Literal
     * 4. ArrayLiteralExpression
     * 5. ObjectLiteralExpression
     * 6. TemplateLiteral
     * 7. ParenthesizedExpression
     *
     * Literal :
     * NullLiteral
     * BooleanLiteral
     * NumericLiteral
     * StringLiteral
     *
     * ParenthesizedExpression :
     * ( AssignmentExpression )
     *
     * IsValidAssignmentTarget
     * 1,3,4,5,6,7 = false
     * 2 = true
     */
    primary: switch ($currentToken) {
      case Token.ParentScope: // $parent
        ancestor = $scopeDepth;
        $assignable = false;
        $accessGlobal = false;
        do {
          nextToken();
          ++ancestor;
          switch (($currentToken as Token)) {
            case Token.Dot:
              nextToken();
              if (($currentToken & Token.IdentifierName) === 0) {
                throw expectedIdentifier();
              }
              break;
            case Token.DotDot:
            case Token.DotDotDot:
              throw expectedIdentifier();
            case Token.QuestionDot:
              $optional = true;
              nextToken();
              if (($currentToken & Token.IdentifierName) === 0) {
                result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                optionalThisTail = true;
                break primary;
              }
              break;
            default:
              if ($currentToken & Token.AccessScopeTerminal) {
                result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                break primary;
              }
              throw invalidMemberExpression();
          }
        } while ($currentToken === Token.ParentScope);
        // falls through
      case Token.Identifier: { // identifier
        const id = $tokenValue as string;
        if (expressionType & ExpressionType.IsIterator) {
          result = new BindingIdentifier(id);
        } else if ($accessGlobal && globalNames.includes(id as (typeof globalNames)[number])) {
          result = new AccessGlobalExpression(id);
        } else if ($accessGlobal && id === 'import') {
          throw unexpectedImportKeyword();
        } else {
          result = new AccessScopeExpression(id, ancestor);
        }
        $assignable = !$optional;
        nextToken();
        if (consumeOpt(Token.Arrow)) {
          if (($currentToken as Token) === Token.OpenBrace) {
            throw functionBodyInArrowFn();
          }
          const _optional = $optional;
          const _scopeDepth = $scopeDepth;
          ++$scopeDepth;
          const body = parse(Precedence.Assign, ExpressionType.None) as IsAssign;
          $optional = _optional;
          $scopeDepth = _scopeDepth;
          $assignable = false;
          result = new ArrowFunction([new BindingIdentifier(id)], body);
        }
        break;
      }
      case Token.DotDot:
        throw unexpectedDoubleDot();
      case Token.DotDotDot:
        throw invalidSpreadOp();
      case Token.ThisScope: // $this
        $assignable = false;
        nextToken();
        switch ($scopeDepth) {
          case 0:
            result = $this;
            break;
          case 1:
            result = $parent;
            break;
          default:
            result = new AccessThisExpression($scopeDepth);
            break;
        }
        break;
      case Token.OpenParen:
        result = parseCoverParenthesizedExpressionAndArrowParameterList(expressionType);
        break;
      case Token.OpenBracket:
        result = $input.search(/\s+of\s+/) > $index ? parseArrayDestructuring() : parseArrayLiteralExpression(expressionType);
        break;
      case Token.OpenBrace:
        result = parseObjectLiteralExpression(expressionType);
        break;
      case Token.TemplateTail:
        result = new TemplateExpression([$tokenValue as string]);
        $assignable = false;
        nextToken();
        break;
      case Token.TemplateContinuation:
        result = parseTemplate(expressionType, result as IsLeftHandSide, false);
        break;
      case Token.StringLiteral:
      case Token.NumericLiteral:
        result = new PrimitiveLiteralExpression($tokenValue);
        $assignable = false;
        nextToken();
        break;
      case Token.NullKeyword:
      case Token.UndefinedKeyword:
      case Token.TrueKeyword:
      case Token.FalseKeyword:
        result = TokenValues[$currentToken & Token.Type] as PrimitiveLiteralExpression;
        $assignable = false;
        nextToken();
        break;
      default:
        if ($index >= $length) {
          throw unexpectedEndOfExpression();
        } else {
          throw unconsumedToken();
        }
    }

    if (expressionType & ExpressionType.IsIterator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return parseForOfStatement(result as BindingIdentifierOrPattern) as any;
    }
    if (Precedence.LeftHandSide < minPrecedence) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    }

    if (($currentToken as Token) === Token.DotDot || ($currentToken as Token) === Token.DotDotDot) {
      throw expectedIdentifier();
    }

    if (result.$kind === 'AccessThis') {
      switch ($currentToken as Token) {
        case Token.QuestionDot:
          $optional = true;
          $assignable = false;
          nextToken();
          if (($currentToken & Token.OptionalSuffix) === 0) {
            throw unexpectedTokenInOptionalChain();
          }

          if ($currentToken & Token.IdentifierName) {
            result = new AccessScopeExpression($tokenValue as string, result.ancestor);
            nextToken();
          } else if (($currentToken as Token) === Token.OpenParen) {
            result = new CallFunctionExpression(result as IsLeftHandSide, parseArguments(), true);
          } else if (($currentToken as Token) === Token.OpenBracket) {
            result = parseKeyedExpression(result, true);
          } else {
            throw invalidTaggedTemplateOnOptionalChain();
          }
          break;
        case Token.Dot:
          $assignable = !$optional;
          nextToken();
          if (($currentToken & Token.IdentifierName) === 0) {
            throw expectedIdentifier();
          }
          result = new AccessScopeExpression($tokenValue as string, result.ancestor);
          nextToken();
          break;
        case Token.DotDot:
        case Token.DotDotDot:
          throw expectedIdentifier();
        case Token.OpenParen:
          result = new CallFunctionExpression(result as IsLeftHandSide, parseArguments(), optionalThisTail);
          break;
        case Token.OpenBracket:
          result = parseKeyedExpression(result, optionalThisTail);
          break;
        case Token.TemplateTail:
          result = createTemplateTail(result as IsLeftHandSide);
          break;
        case Token.TemplateContinuation:
          result = parseTemplate(expressionType, result as IsLeftHandSide, true);
          break;
      }
    }

    /**
     * parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
     *
     * MemberExpression :
     * 1. PrimaryExpression
     * 2. MemberExpression [ AssignmentExpression ]
     * 3. MemberExpression . IdentifierName
     * 4. MemberExpression TemplateLiteral
     *
     * IsValidAssignmentTarget
     * 1,4 = false
     * 2,3 = true
     *
     *
     * parseCallExpression (Token.OpenParen)
     * CallExpression :
     * 1. MemberExpression Arguments
     * 2. CallExpression Arguments
     * 3. CallExpression [ AssignmentExpression ]
     * 4. CallExpression . IdentifierName
     * 5. CallExpression TemplateLiteral
     *
     * IsValidAssignmentTarget
     * 1,2,5 = false
     * 3,4 = true
     */
    while (($currentToken & Token.LeftHandSide) > 0) {
      switch (($currentToken as Token)) {
        case Token.QuestionDot:
          result = parseOptionalChainLHS(result as IsLeftHandSide);
          break;
        case Token.Dot:
          nextToken();
          if (($currentToken & Token.IdentifierName) === 0) {
            throw expectedIdentifier();
          }
          result = parseMemberExpressionLHS(result as IsLeftHandSide, false);
          break;
        case Token.DotDot:
        case Token.DotDotDot:
          throw expectedIdentifier();
        case Token.OpenParen:
          if (result.$kind === 'AccessScope') {
            result = new CallScopeExpression(result.name, parseArguments(), result.ancestor, false);
          } else if (result.$kind === 'AccessMember') {
            result = new CallMemberExpression(result.object, result.name, parseArguments(), result.optional, false);
          } else if (result.$kind === 'AccessGlobal') {
            result = new CallGlobalExpression(result.name, parseArguments());
          } else {
            result = new CallFunctionExpression(result as IsLeftHandSide, parseArguments(), false);
          }
          break;
        case Token.OpenBracket:
          result = parseKeyedExpression(result as IsLeftHandSide, false);
          break;
        case Token.TemplateTail:
          if ($optional) {
            throw invalidTaggedTemplateOnOptionalChain();
          }
          result = createTemplateTail(result as IsLeftHandSide);
          break;
        case Token.TemplateContinuation:
          if ($optional) {
            throw invalidTaggedTemplateOnOptionalChain();
          }
          result = parseTemplate(expressionType, result as IsLeftHandSide, true);
          break;
      }
    }
  }

  if (($currentToken as Token) === Token.DotDot || ($currentToken as Token) === Token.DotDotDot) {
    throw expectedIdentifier();
  }

  if (Precedence.Binary < minPrecedence) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /**
   * parseBinaryExpression
   *
   * https://tc39.github.io/ecma262/#sec-multiplicative-operators
   *
   * MultiplicativeExpression : (local precedence 6)
   * UnaryExpression
   * MultiplicativeExpression * / % UnaryExpression
   *
   * AdditiveExpression : (local precedence 5)
   * MultiplicativeExpression
   * AdditiveExpression + - MultiplicativeExpression
   *
   * RelationalExpression : (local precedence 4)
   * AdditiveExpression
   * RelationalExpression < > <= >= instanceof in AdditiveExpression
   *
   * EqualityExpression : (local precedence 3)
   * RelationalExpression
   * EqualityExpression == != === !== RelationalExpression
   *
   * LogicalANDExpression : (local precedence 2)
   * EqualityExpression
   * LogicalANDExpression && EqualityExpression
   *
   * LogicalORExpression : (local precedence 1)
   * LogicalANDExpression
   * LogicalORExpression || LogicalANDExpression
   *
   * CoalesceExpression :
   * CoalesceExpressionHead ?? BitwiseORExpression
   *
   * CoalesceExpressionHead :
   * CoelesceExpression
   * BitwiseORExpression
   *
   * ShortCircuitExpression :
   * LogicalORExpression
   * CoalesceExpression
   */
  while (($currentToken & Token.BinaryOp) > 0) {
    const opToken = $currentToken;
    if ((opToken & Token.Precedence) <= minPrecedence) {
      break;
    }
    nextToken();
    result = new BinaryExpression(TokenValues[opToken & Token.Type] as BinaryOperator, result as IsBinary, parse(opToken & Token.Precedence, expressionType) as IsBinary);
    $assignable = false;
  }
  if (Precedence.Conditional < minPrecedence) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /**
   * parseConditionalExpression
   * https://tc39.github.io/ecma262/#prod-ConditionalExpression
   *
   * ConditionalExpression :
   * 1. ShortCircuitExpression
   * 2. ShortCircuitExpression ? AssignmentExpression : AssignmentExpression
   *
   * IsValidAssignmentTarget
   * 1,2 = false
   */

  if (consumeOpt(Token.Question)) {
    const yes = parse(Precedence.Assign, expressionType) as IsAssign;
    consume(Token.Colon);
    result = new ConditionalExpression(result as IsBinary, yes, parse(Precedence.Assign, expressionType) as IsAssign);
    $assignable = false;
  }
  if (Precedence.Assign < minPrecedence) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /**
   * parseAssignmentExpression
   *
   * https://tc39.github.io/ecma262/#prod-AssignmentExpression
   * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
   *
   * AssignmentExpression :
   * 1. ConditionalExpression
   * 2. LeftHandSideExpression = AssignmentExpression
   *
   * IsValidAssignmentTarget
   * 1,2 = false
   */
  if (consumeOpt(Token.Equals)) {
    if (!$assignable) {
      throw lhsNotAssignable();
    }
    result = new AssignExpression(result as IsAssignable, parse(Precedence.Assign, expressionType) as IsAssign);
  }
  if (Precedence.Variadic < minPrecedence) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /**
   * parseValueConverter
   */
  while (consumeOpt(Token.Bar)) {
    if ($currentToken === Token.EOF) {
      throw expectedValueConverterIdentifier();
    }
    const name = $tokenValue as string;
    nextToken();
    const args = new Array<IsAssign>();
    while (consumeOpt(Token.Colon)) {
      args.push(parse(Precedence.Assign, expressionType) as IsAssign);
    }
    result = new ValueConverterExpression(result as IsValueConverter, name, args);
  }

  /**
   * parseBindingBehavior
   */
  while (consumeOpt(Token.Ampersand)) {
    if ($currentToken === Token.EOF) {
      throw expectedBindingBehaviorIdentifier();
    }
    const name = $tokenValue as string;
    nextToken();
    const args = new Array<IsAssign>();
    while (consumeOpt(Token.Colon)) {
      args.push(parse(Precedence.Assign, expressionType) as IsAssign);
    }
    result = new BindingBehaviorExpression(result as IsBindingBehavior, name, args);
  }

  if ($currentToken !== Token.EOF) {
    if ((expressionType & ExpressionType.Interpolation) > 0 && $currentToken === Token.CloseBrace) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    }
    if ((expressionType & ExpressionType.IsChainable) > 0 && $currentToken === Token.Semicolon) {
      if ($index === $length) {
        throw unconsumedToken();
      }
      $semicolonIndex = $index - 1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    }
    if ($tokenRaw() === 'of') {
      throw unexpectedOfKeyword();
    }
    throw unconsumedToken();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result as any;
}

/**
 * [key,]
 * [key]
 * [,value]
 * [key,value]
 */
function parseArrayDestructuring(): DAE {
  const items: DASE[] = [];
  const dae = new DAE('ArrayDestructuring', items, void 0, void 0);
  let target: string = '';
  let $continue = true;
  let index = 0;
  while ($continue) {
    nextToken();
    switch ($currentToken) {
      case Token.CloseBracket:
        $continue = false;
        addItem();
        break;
      case Token.Comma:
        addItem();
        break;
      case Token.Identifier:
        target = $tokenRaw();
        break;
      default:
        throw unexpectedTokenInDestructuring();
    }
  }
  consume(Token.CloseBracket);
  return dae;

  function addItem() {
    if (target !== '') {
      items.push(new DASE(new AccessMemberExpression($this, target), new AccessKeyedExpression($this, new PrimitiveLiteralExpression(index++)), void 0));
      target = '';
    } else {
      index++;
    }
  }
}

function parseArguments() {
  const _optional = $optional;

  nextToken();
  const args: IsAssign[] = [];
  while (($currentToken as Token) !== Token.CloseParen) {
    args.push(parse(Precedence.Assign, ExpressionType.None) as IsAssign);
    if (!consumeOpt(Token.Comma)) {
      break;
    }
  }
  consume(Token.CloseParen);

  $assignable = false;
  $optional = _optional;

  return args;
}

function parseKeyedExpression(result: IsLeftHandSide, optional: boolean) {
  const _optional = $optional;

  nextToken();
  result = new AccessKeyedExpression(result, parse(Precedence.Assign, ExpressionType.None) as IsAssign, optional);
  consume(Token.CloseBracket);

  $assignable = !_optional;
  $optional = _optional;

  return result;
}

function parseOptionalChainLHS(lhs: IsLeftHandSide) {
  $optional = true;
  $assignable = false;
  nextToken();
  if (($currentToken & Token.OptionalSuffix) === 0) {
    throw unexpectedTokenInOptionalChain();
  }

  if ($currentToken & Token.IdentifierName) {
    return parseMemberExpressionLHS(lhs, true);
  }

  if (($currentToken as Token) === Token.OpenParen) {
    if (lhs.$kind === 'AccessScope') {
      return new CallScopeExpression(lhs.name, parseArguments(), lhs.ancestor, true);
    } else if (lhs.$kind === 'AccessMember') {
      return new CallMemberExpression(lhs.object, lhs.name, parseArguments(), lhs.optional, true);
    } else {
      return new CallFunctionExpression(lhs, parseArguments(), true);
    }
  }

  if (($currentToken as Token) === Token.OpenBracket) {
    return parseKeyedExpression(lhs, true);
  }

  throw invalidTaggedTemplateOnOptionalChain();
}

function parseMemberExpressionLHS(lhs: IsLeftHandSide, optional: boolean) {
  const rhs = $tokenValue as string;
  switch (($currentToken as Token)) {
    case Token.QuestionDot: {
      $optional = true;
      $assignable = false;

      const indexSave = $index;
      const startIndexSave = $startIndex;
      const currentTokenSave = $currentToken;
      const currentCharSave = $currentChar;
      const tokenValueSave = $tokenValue;
      const assignableSave = $assignable;
      const optionalSave = $optional;

      nextToken();
      if (($currentToken & Token.OptionalSuffix) === 0) {
        throw unexpectedTokenInOptionalChain();
      }

      if (($currentToken as Token) === Token.OpenParen) {
        return new CallMemberExpression(lhs, rhs, parseArguments(), optional, true);
      }

      $index = indexSave;
      $startIndex = startIndexSave;
      $currentToken = currentTokenSave;
      $currentChar = currentCharSave;
      $tokenValue = tokenValueSave;
      $assignable = assignableSave;
      $optional = optionalSave;

      return new AccessMemberExpression(lhs, rhs, optional);
    }
    case Token.OpenParen: {
      $assignable = false;
      return new CallMemberExpression(lhs, rhs, parseArguments(), optional, false);
    }
    default: {
      $assignable = !$optional;
      nextToken();
      return new AccessMemberExpression(lhs, rhs, optional);
    }
  }
}

_START_CONST_ENUM();
const enum ArrowFnParams {
  Valid         = 1,
  Invalid       = 2,
  Default       = 3,
  Destructuring = 4,
}
_END_CONST_ENUM();

/**
 * https://tc39.es/ecma262/#prod-CoverParenthesizedExpressionAndArrowParameterList
 * CoverParenthesizedExpressionAndArrowParameterList :
 * ( Expression )
 * ( )
 * ( BindingIdentifier )
 * ( Expression , BindingIdentifier )
 */
function parseCoverParenthesizedExpressionAndArrowParameterList(expressionType: ExpressionType): IsAssign {
  nextToken();

  const indexSave = $index;
  const startIndexSave = $startIndex;
  const currentTokenSave = $currentToken;
  const currentCharSave = $currentChar;
  const tokenValueSave = $tokenValue;
  const assignableSave = $assignable;
  const optionalSave = $optional;

  const arrowParams: BindingIdentifier[] = [];
  let paramsState = ArrowFnParams.Valid;
  let isParamList = false;

  // eslint-disable-next-line no-constant-condition
  loop: while (true) {
    if (($currentToken as Token) === Token.DotDotDot) {
      nextToken();
      if (($currentToken as Token) !== Token.Identifier) {
        throw expectedIdentifier();
      }
      arrowParams.push(new BindingIdentifier($tokenValue as string));

      nextToken();
      if (($currentToken as Token) === Token.Comma) {
        throw restParamsMustBeLastParam();
      }

      if (($currentToken as Token) !== Token.CloseParen) {
        throw invalidSpreadOp();
      }

      nextToken();
      if (($currentToken as Token) !== Token.Arrow) {
        throw invalidSpreadOp();
      }

      nextToken();
      const _optional = $optional;
      const _scopeDepth = $scopeDepth;
      ++$scopeDepth;
      const body = parse(Precedence.Assign, ExpressionType.None) as IsAssign;
      $optional = _optional;
      $scopeDepth = _scopeDepth;
      $assignable = false;
      return new ArrowFunction(arrowParams, body, true);
    }

    switch ($currentToken as Token) {
      case Token.Identifier:
        arrowParams.push(new BindingIdentifier($tokenValue as string));
        nextToken();
        break;
      case Token.CloseParen:
        // ()     - only valid if followed directly by an arrow
        nextToken();
        break loop;
      /* eslint-disable */
      case Token.OpenBrace:
        // ({     - may be a valid parenthesized expression
      case Token.OpenBracket:
        // ([     - may be a valid parenthesized expression
        nextToken();
        paramsState = ArrowFnParams.Destructuring;
        break;
      /* eslint-enable */
      case Token.Comma:
        // (,     - never valid
        // (a,,   - never valid
        paramsState = ArrowFnParams.Invalid;
        isParamList = true;
        break loop;
      case Token.OpenParen:
        // ((     - may be a valid nested parenthesized expression or arrow fn
        // (a,(   - never valid
        paramsState = ArrowFnParams.Invalid;
        break loop;
      default:
        nextToken();
        paramsState = ArrowFnParams.Invalid;
        break;
    }

    switch ($currentToken) {
      case Token.Comma:
        nextToken();
        isParamList = true;
        if (paramsState === ArrowFnParams.Valid) {
          break;
        }
        // ([something invalid],   - treat as arrow fn / invalid arrow params
        break loop;
      case Token.CloseParen:
        nextToken();
        break loop;
      case Token.Equals:
        // (a=a     - may be a valid parenthesized expression
        if (paramsState === ArrowFnParams.Valid) {
          paramsState = ArrowFnParams.Default;
        }
        break loop;
      case Token.Arrow:
        // (a,a=>  - never valid
        if (isParamList) {
          throw invalidArrowParameterList();
        }
        // (a=>    - may be a valid parenthesized expression with nested arrow fn
        nextToken();
        paramsState = ArrowFnParams.Invalid;
        break loop;
      default:
        if (paramsState === ArrowFnParams.Valid) {
          paramsState = ArrowFnParams.Invalid;
        }
        break loop;
    }
  }

  if ($currentToken === Token.Arrow) {
    if (paramsState === ArrowFnParams.Valid) {
      nextToken();
      if (($currentToken as Token) === Token.OpenBrace) {
        throw functionBodyInArrowFn();
      }
      const _optional = $optional;
      const _scopeDepth = $scopeDepth;
      ++$scopeDepth;
      const body = parse(Precedence.Assign, ExpressionType.None) as IsAssign;
      $optional = _optional;
      $scopeDepth = _scopeDepth;
      $assignable = false;
      return new ArrowFunction(arrowParams, body);
    }
    throw invalidArrowParameterList();
  } else if (paramsState === ArrowFnParams.Valid && arrowParams.length === 0) {
    // ()    - never valid as a standalone expression
    throw missingExpectedToken(Token.Arrow);
  }

  if (isParamList) {
    // ([something invalid],   - treat as arrow fn / invalid arrow params
    switch (paramsState) {
      case ArrowFnParams.Invalid:
        throw invalidArrowParameterList();
      case ArrowFnParams.Default:
        throw defaultParamsInArrowFn();
      case ArrowFnParams.Destructuring:
        throw destructuringParamsInArrowFn();
    }
  }

  $index = indexSave;
  $startIndex = startIndexSave;
  $currentToken = currentTokenSave;
  $currentChar = currentCharSave;
  $tokenValue = tokenValueSave;
  $assignable = assignableSave;
  $optional = optionalSave;

  const _optional = $optional;
  const expr = parse(Precedence.Assign, expressionType) as IsAssign;
  $optional = _optional;
  consume(Token.CloseParen);

  if ($currentToken === Token.Arrow) {
    // we only get here if there was a valid parenthesized expression which was not valid as arrow fn params
    switch (paramsState) {
      case ArrowFnParams.Invalid:
        throw invalidArrowParameterList();
      case ArrowFnParams.Default:
        throw defaultParamsInArrowFn();
      case ArrowFnParams.Destructuring:
        throw destructuringParamsInArrowFn();
    }
  }

  return expr;
}

/**
 * parseArrayLiteralExpression
 * https://tc39.github.io/ecma262/#prod-ArrayLiteralExpression
 *
 * ArrayLiteralExpression :
 * [ Elision(opt) ]
 * [ ElementList ]
 * [ ElementList, Elision(opt) ]
 *
 * ElementList :
 * Elision(opt) AssignmentExpression
 * ElementList, Elision(opt) AssignmentExpression
 *
 * Elision :
 * ,
 * Elision ,
 */
function parseArrayLiteralExpression(expressionType: ExpressionType): ArrayBindingPattern | ArrayLiteralExpression {
  const _optional = $optional;

  nextToken();
  const elements = new Array<IsAssign>();
  while ($currentToken !== Token.CloseBracket) {
    if (consumeOpt(Token.Comma)) {
      elements.push($undefined);
      if (($currentToken as Token) === Token.CloseBracket) {
        break;
      }
    } else {
      elements.push(parse(Precedence.Assign, expressionType & ~ExpressionType.IsIterator) as IsAssign);
      if (consumeOpt(Token.Comma)) {
        if (($currentToken as Token) === Token.CloseBracket) {
          break;
        }
      } else {
        break;
      }
    }
  }

  $optional = _optional;

  consume(Token.CloseBracket);
  if (expressionType & ExpressionType.IsIterator) {
    return new ArrayBindingPattern(elements);
  } else {
    $assignable = false;
    return new ArrayLiteralExpression(elements);
  }
}

const allowedForExprKinds: ExpressionKind[] = ['ArrayBindingPattern', 'ObjectBindingPattern', 'BindingIdentifier', 'ArrayDestructuring', 'ObjectDestructuring'];
function parseForOfStatement(result: BindingIdentifierOrPattern): ForOfStatement {
  if (!allowedForExprKinds.includes(result.$kind)) {
    throw invalidLHSBindingIdentifierInForOf(result.$kind);
  }
  if ($currentToken !== Token.OfKeyword) {
    throw invalidLHSBindingIdentifierInForOf(result.$kind);
  }
  nextToken();
  const declaration = result;
  const statement = parse(Precedence.Variadic, ExpressionType.IsChainable);
  return new ForOfStatement(declaration, statement as IsBindingBehavior, $semicolonIndex);
}

/**
 * parseObjectLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * ObjectLiteralExpression :
 * { }
 * { PropertyDefinitionList }
 *
 * PropertyDefinitionList :
 * PropertyDefinition
 * PropertyDefinitionList, PropertyDefinition
 *
 * PropertyDefinition :
 * IdentifierName
 * PropertyName : AssignmentExpression
 *
 * PropertyName :
 * IdentifierName
 * StringLiteral
 * NumericLiteral
 */
function parseObjectLiteralExpression(expressionType: ExpressionType): ObjectBindingPattern | ObjectLiteralExpression {
  const _optional = $optional;

  const keys = new Array<string | number>();
  const values = new Array<IsAssign>();
  nextToken();
  while ($currentToken !== Token.CloseBrace) {
    keys.push($tokenValue);
    // Literal = mandatory colon
    if ($currentToken & Token.StringOrNumericLiteral) {
      nextToken();
      consume(Token.Colon);
      values.push(parse(Precedence.Assign, expressionType & ~ExpressionType.IsIterator) as IsAssign);
    } else if ($currentToken & Token.IdentifierName) {
      // IdentifierName = optional colon
      const currentChar = $currentChar;
      const currentToken = $currentToken;
      const index = $index;
      nextToken();
      if (consumeOpt(Token.Colon)) {
        values.push(parse(Precedence.Assign, expressionType & ~ExpressionType.IsIterator) as IsAssign);
      } else {
        // Shorthand
        $currentChar = currentChar;
        $currentToken = currentToken;
        $index = index;
        values.push(parse(Precedence.Primary, expressionType & ~ExpressionType.IsIterator) as IsAssign);
      }
    } else {
      throw invalidPropDefInObjLiteral();
    }
    if (($currentToken as Token) !== Token.CloseBrace) {
      consume(Token.Comma);
    }
  }

  $optional = _optional;

  consume(Token.CloseBrace);
  if (expressionType & ExpressionType.IsIterator) {
    return new ObjectBindingPattern(keys, values);
  } else {
    $assignable = false;
    return new ObjectLiteralExpression(keys, values);
  }
}

function parseInterpolation(): Interpolation {
  const parts = [];
  const expressions: (IsBindingBehavior | Interpolation)[] = [];
  const length = $length;
  let result = '';
  while ($index < length) {
    switch ($currentChar) {
      case Char.Dollar:
        if ($charCodeAt($index + 1) === Char.OpenBrace) {
          parts.push(result);
          result = '';

          $index += 2;
          $currentChar = $charCodeAt($index);
          nextToken();
          const expression = parse(Precedence.Variadic, ExpressionType.Interpolation) as IsBindingBehavior | Interpolation;
          expressions.push(expression);
          continue;
        } else {
          result += '$';
        }
        break;
      case Char.Backslash:
        result += stringFromCharCode(unescapeCode(nextChar()));
        break;
      default:
        result += stringFromCharCode($currentChar);
    }
    nextChar();
  }
  if (expressions.length) {
    parts.push(result);
    return new Interpolation(parts, expressions as IsBindingBehavior[]);
  }
  return null!;
}

/**
 * parseTemplateLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * TemplateExpression :
 * NoSubstitutionTemplate
 * TemplateHead
 *
 * NoSubstitutionTemplate :
 * ` TemplateCharacters(opt) `
 *
 * TemplateHead :
 * ` TemplateCharacters(opt) ${
 *
 * TemplateSubstitutionTail :
 * TemplateMiddle
 * TemplateTail
 *
 * TemplateMiddle :
 * } TemplateCharacters(opt) ${
 *
 * TemplateTail :
 * } TemplateCharacters(opt) `
 *
 * TemplateCharacters :
 * TemplateCharacter TemplateCharacters(opt)
 *
 * TemplateCharacter :
 * $ [lookahead ≠ {]
 * \ EscapeSequence
 * SourceCharacter (but not one of ` or \ or $)
 */
function parseTemplate(expressionType: ExpressionType, result: IsLeftHandSide, tagged: boolean): TaggedTemplateExpression | TemplateExpression {
  const _optional = $optional;

  const cooked = [$tokenValue as string];
  // TODO: properly implement raw parts / decide whether we want this
  consume(Token.TemplateContinuation);
  const expressions = [parse(Precedence.Assign, expressionType) as IsAssign];
  while (($currentToken = scanTemplateTail()) !== Token.TemplateTail) {
    cooked.push($tokenValue as string);
    consume(Token.TemplateContinuation);
    expressions.push(parse(Precedence.Assign, expressionType) as IsAssign);
  }
  cooked.push($tokenValue as string);

  $assignable = false;
  $optional = _optional;
  if (tagged) {
    nextToken();
    return new TaggedTemplateExpression(cooked, cooked, result, expressions);
  } else {
    nextToken();
    return new TemplateExpression(cooked, expressions);
  }
}

function createTemplateTail(result: IsLeftHandSide) {
  $assignable = false;
  const strings = [$tokenValue as string];
  nextToken();
  return new TaggedTemplateExpression(strings, strings, result);
}

function nextToken(): void {
  while ($index < $length) {
    $startIndex = $index;
    if (($currentToken = (CharScanners[$currentChar]()) as Token) != null) { // a null token means the character must be skipped
      return;
    }
  }
  $currentToken = Token.EOF;
}

function nextChar(): number {
  return $currentChar = $charCodeAt(++$index);
}

function scanIdentifier(): Token {
  // run to the next non-idPart
  while (IdParts[nextChar()]);

  const token: Token|undefined = KeywordLookup[$tokenValue = $tokenRaw()];
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return token === undefined ? Token.Identifier : token;
}

function scanNumber(isFloat: boolean): Token {
  let char = $currentChar;
  if (isFloat === false) {
    do {
      char = nextChar();
    } while (char <= Char.Nine && char >= Char.Zero);

    if (char !== Char.Dot) {
      $tokenValue = parseInt($tokenRaw(), 10);
      return Token.NumericLiteral;
    }
    // past this point it's always a float
    char = nextChar();
    if ($index >= $length) {
      // unless the number ends with a dot - that behaves a little different in native ES expressions
      // but in our AST that behavior has no effect because numbers are always stored in variables
      $tokenValue = parseInt($tokenRaw().slice(0, -1), 10);
      return Token.NumericLiteral;
    }
  }

  if (char <= Char.Nine && char >= Char.Zero) {
    do {
      char = nextChar();
    } while (char <= Char.Nine && char >= Char.Zero);
  } else {
    $currentChar = $charCodeAt(--$index);
  }

  $tokenValue = parseFloat($tokenRaw());
  return Token.NumericLiteral;
}

function scanString(): Token {
  const quote = $currentChar;
  nextChar(); // Skip initial quote.

  let unescaped = 0;
  const buffer = new Array<string>();
  let marker = $index;

  while ($currentChar !== quote) {
    if ($currentChar === Char.Backslash) {
      buffer.push($input.slice(marker, $index));
      nextChar();
      unescaped = unescapeCode($currentChar);
      nextChar();
      buffer.push(stringFromCharCode(unescaped));
      marker = $index;
    } else if ($index >= $length) {
      throw unterminatedStringLiteral();
    } else {
      nextChar();
    }
  }

  const last = $input.slice(marker, $index);
  nextChar(); // Skip terminating quote.

  // Compute the unescaped string value.
  buffer.push(last);
  const unescapedStr = buffer.join('');

  $tokenValue = unescapedStr;
  return Token.StringLiteral;
}

function scanTemplate(): Token {
  let tail = true;
  let result = '';

  while (nextChar() !== Char.Backtick) {
    if ($currentChar === Char.Dollar) {
      if (($index + 1) < $length && $charCodeAt($index + 1) === Char.OpenBrace) {
        $index++;
        tail = false;
        break;
      } else {
        result += '$';
      }
    } else if ($currentChar === Char.Backslash) {
      result += stringFromCharCode(unescapeCode(nextChar()));
    } else {
      if ($index >= $length) {
        throw unterminatedTemplateLiteral();
      }
      result += stringFromCharCode($currentChar);
    }
  }

  nextChar();
  $tokenValue = result;
  if (tail) {
    return Token.TemplateTail;
  }
  return Token.TemplateContinuation;
}

const scanTemplateTail = (): Token => {
  if ($index >= $length) {
    throw unterminatedTemplateLiteral();
  }
  $index--;
  return scanTemplate();
};

const consumeOpt = (token: Token): boolean => {
  if ($currentToken === token) {
    nextToken();
    return true;
  }

  return false;
};

const consume = (token: Token): void => {
  if ($currentToken === token) {
    nextToken();
  } else {
    throw missingExpectedToken(token);
  }
};

// #region errors

const invalidStartOfExpression = () => createMappedError(ErrorNames.parse_invalid_start, $input);

const invalidSpreadOp = () => createMappedError(ErrorNames.parse_no_spread, $input);

const expectedIdentifier = () => createMappedError(ErrorNames.parse_expected_identifier, $input);

const invalidMemberExpression = () => createMappedError(ErrorNames.parse_invalid_member_expr, $input);

const unexpectedEndOfExpression = () => createMappedError(ErrorNames.parse_unexpected_end, $input);

const unconsumedToken = () => createMappedError(ErrorNames.parse_unconsumed_token, $tokenRaw(), $index, $input);

const invalidEmptyExpression = () => createMappedError(ErrorNames.parse_invalid_empty);

const lhsNotAssignable = () => createMappedError(ErrorNames.parse_left_hand_side_not_assignable, $input);

const expectedValueConverterIdentifier = () => createMappedError(ErrorNames.parse_expected_converter_identifier, $input);

const expectedBindingBehaviorIdentifier = () => createMappedError(ErrorNames.parse_expected_behavior_identifier, $input);

const unexpectedOfKeyword = () => createMappedError(ErrorNames.parse_unexpected_keyword_of, $input);

const unexpectedImportKeyword = () => createMappedError(ErrorNames.parse_unexpected_keyword_import, $input);

const invalidLHSBindingIdentifierInForOf = (kind: any) => createMappedError(ErrorNames.parse_invalid_identifier_in_forof, $input, kind);

const invalidPropDefInObjLiteral = () => createMappedError(ErrorNames.parse_invalid_identifier_object_literal_key, $input);

const unterminatedStringLiteral = () => createMappedError(ErrorNames.parse_unterminated_string, $input);

const unterminatedTemplateLiteral = () => createMappedError(ErrorNames.parse_unterminated_template_string, $input);

const missingExpectedToken = (token: Token) =>
  __DEV__
    ? createMappedError(ErrorNames.parse_missing_expected_token, TokenValues[token & Token.Type], $input)
    : createMappedError(ErrorNames.parse_missing_expected_token, $input);

const unexpectedCharacter: CharScanner = () => {
  throw createMappedError(ErrorNames.parse_unexpected_character, $input);
};
unexpectedCharacter.notMapped = true;

const unexpectedTokenInDestructuring = () =>
  __DEV__
    ? createMappedError(ErrorNames.parse_unexpected_token_destructuring, $tokenRaw(), $index, $input)
    : createMappedError(ErrorNames.parse_unexpected_token_destructuring, $input);

const unexpectedTokenInOptionalChain = () =>
  __DEV__
    ? createMappedError(ErrorNames.parse_unexpected_token_optional_chain, $tokenRaw(), $index - 1, $input)
    : createMappedError(ErrorNames.parse_unexpected_token_optional_chain, $input);

const invalidTaggedTemplateOnOptionalChain = () => createMappedError(ErrorNames.parse_invalid_tag_in_optional_chain, $input);

const invalidArrowParameterList = () => createMappedError(ErrorNames.parse_invalid_arrow_params, $input);

const defaultParamsInArrowFn = () => createMappedError(ErrorNames.parse_no_arrow_param_default_value, $input);

const destructuringParamsInArrowFn = () => createMappedError(ErrorNames.parse_no_arrow_param_destructuring, $input);

const restParamsMustBeLastParam = () => createMappedError(ErrorNames.parse_rest_must_be_last, $input);

const functionBodyInArrowFn = () => createMappedError(ErrorNames.parse_no_arrow_fn_body, $input);

const unexpectedDoubleDot = () =>
  __DEV__
    ? createMappedError(ErrorNames.parse_unexpected_double_dot, $index - 1, $input)
    : createMappedError(ErrorNames.parse_unexpected_double_dot, $input);

// #endregion

/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
  $false, $true, $null, $undefined, '$this', null/* '$host' */, '$parent',

  '(', '{', '.', '..', '...', '?.', '}', ')', ',', '[', ']', ':', ';', '?', '\'', '"',

  '&', '|', '??', '||', '&&', '==', '!=', '===', '!==', '<', '>',
  '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
  Token.TemplateTail, Token.TemplateContinuation,
  'of', '=>'
];

const KeywordLookup: Record<string, Token> = objectAssign(Object.create(null), {
  true: Token.TrueKeyword,
  null: Token.NullKeyword,
  false: Token.FalseKeyword,
  undefined: Token.UndefinedKeyword,
  $this: Token.ThisScope,
  $parent: Token.ParentScope,
  in: Token.InKeyword,
  instanceof: Token.InstanceOfKeyword,
  typeof: Token.TypeofKeyword,
  void: Token.VoidKeyword,
  of: Token.OfKeyword,
});

/**
 * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
 * Single values are denoted by the second value being a 0
 *
 * Copied from output generated with "node build/generate-unicode.js"
 *
 * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
 */
const codes = {
  /* [$0-9A-Za_a-z] */
  AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
  IdStart: /* IdentifierStart */[0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
  Digit: /* DecimalNumber */[0x30, 0x3A],
  Skip: /* Skippable */[0, 0x21, 0x7F, 0xA1]
};

/**
 * Decompress the ranges into an array of numbers so that the char code
 * can be used as an index to the lookup
 */
const decompress = (lookup: (CharScanner | number)[] | null, $set: Set<number> | null, compressed: number[], value: CharScanner | number | boolean): void => {
  const rangeCount = compressed.length;
  for (let i = 0; i < rangeCount; i += 2) {
    const start = compressed[i];
    let end = compressed[i + 1];
    end = end > 0 ? end : start + 1;
    if (lookup) {
      lookup.fill(value as CharScanner | number, start, end);
    }
    if ($set) {
      for (let ch = start; ch < end; ch++) {
        $set.add(ch);
      }
    }
  }
};

// CharFuncLookup functions
const returnToken = (token: Token): () => Token =>
  () => {
    nextChar();
    return token;
  };

// ASCII IdentifierPart lookup
const AsciiIdParts = new Set<number>();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);

// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts as any, null, codes.IdStart, 1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts as any, null, codes.Digit, 1);

type CharScanner = (() => Token | null) & { notMapped?: boolean };

// Character scanning function lookup
const CharScanners = new Array<CharScanner>(0xFFFF);
CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);

decompress(CharScanners, null, codes.Skip, () => {
  nextChar();
  return null;
});
decompress(CharScanners, null, codes.IdStart, scanIdentifier);
decompress(CharScanners, null, codes.Digit, () => scanNumber(false));

CharScanners[Char.DoubleQuote] =
CharScanners[Char.SingleQuote] = () => {
  return scanString();
};
CharScanners[Char.Backtick] = () => {
  return scanTemplate();
};

// !, !=, !==
CharScanners[Char.Exclamation] = () => {
  if (nextChar() !== Char.Equals) {
    return Token.Exclamation;
  }
  if (nextChar() !== Char.Equals) {
    return Token.ExclamationEquals;
  }
  nextChar();
  return Token.ExclamationEqualsEquals;
};

// =, ==, ===, =>
CharScanners[Char.Equals] =  () => {
  if (nextChar() === Char.GreaterThan) {
    nextChar();
    return Token.Arrow;
  }
  if ($currentChar !== Char.Equals) {
    return Token.Equals;
  }
  if (nextChar() !== Char.Equals) {
    return Token.EqualsEquals;
  }
  nextChar();
  return Token.EqualsEqualsEquals;
};

// &, &&
CharScanners[Char.Ampersand] = () => {
  if (nextChar() !== Char.Ampersand) {
    return Token.Ampersand;
  }
  nextChar();
  return Token.AmpersandAmpersand;
};

// |, ||
CharScanners[Char.Bar] = () => {
  if (nextChar() !== Char.Bar) {
    return Token.Bar;
  }
  nextChar();
  return Token.BarBar;
};

// ?, ??, ?.
CharScanners[Char.Question] = () => {
  if (nextChar() === Char.Dot) {
    const peek = $charCodeAt($index + 1);
    if (peek <= Char.Zero || peek >= Char.Nine) {
      nextChar();
      return Token.QuestionDot;
    }
    return Token.Question;
  }
  if ($currentChar !== Char.Question) {
    return Token.Question;
  }
  nextChar();
  return Token.QuestionQuestion;
};

// ., ...
CharScanners[Char.Dot] = () => {
  if (nextChar() <= Char.Nine && $currentChar >= Char.Zero) {
    return scanNumber(true);
  }
  if ($currentChar === Char.Dot) {
    if (nextChar() !== Char.Dot) {
      return Token.DotDot;
    }
    nextChar();
    return Token.DotDotDot;
  }
  return Token.Dot;
};

// <, <=
CharScanners[Char.LessThan] =  () => {
  if (nextChar() !== Char.Equals) {
    return Token.LessThan;
  }
  nextChar();
  return Token.LessThanEquals;
};

// >, >=
CharScanners[Char.GreaterThan] =  () => {
  if (nextChar() !== Char.Equals) {
    return Token.GreaterThan;
  }
  nextChar();
  return Token.GreaterThanEquals;
};

CharScanners[Char.Percent]      = returnToken(Token.Percent);
CharScanners[Char.OpenParen]    = returnToken(Token.OpenParen);
CharScanners[Char.CloseParen]   = returnToken(Token.CloseParen);
CharScanners[Char.Asterisk]     = returnToken(Token.Asterisk);
CharScanners[Char.Plus]         = returnToken(Token.Plus);
CharScanners[Char.Comma]        = returnToken(Token.Comma);
CharScanners[Char.Minus]        = returnToken(Token.Minus);
CharScanners[Char.Slash]        = returnToken(Token.Slash);
CharScanners[Char.Colon]        = returnToken(Token.Colon);
CharScanners[Char.Semicolon]    = returnToken(Token.Semicolon);
CharScanners[Char.OpenBracket]  = returnToken(Token.OpenBracket);
CharScanners[Char.CloseBracket] = returnToken(Token.CloseBracket);
CharScanners[Char.OpenBrace]    = returnToken(Token.OpenBrace);
CharScanners[Char.CloseBrace]   = returnToken(Token.CloseBrace);
