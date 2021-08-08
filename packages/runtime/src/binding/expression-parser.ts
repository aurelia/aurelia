import {
  DI,
} from '@aurelia/kernel';
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
  IsConditional,
  IsExpressionOrStatement,
  IsLeftHandSide,
  IsPrimary,
  IsUnary,
  IsValueConverter,
  UnaryOperator,
  ExpressionKind,
} from './ast.js';
import { createLookup } from '../utilities-objects.js';

export interface IExpressionParser extends ExpressionParser {}
export const IExpressionParser = DI.createInterface<IExpressionParser>('IExpressionParser', x => x.singleton(ExpressionParser));

export class ExpressionParser {
  /** @internal */ private readonly _expressionLookup: Record<string, IsBindingBehavior> = createLookup();
  /** @internal */ private readonly _forOfLookup: Record<string, ForOfStatement> = createLookup();
  /** @internal */ private readonly _interpolationLookup: Record<string, Interpolation> = createLookup();

  public parse(expression: string, bindingType: BindingType.IsIterator): ForOfStatement;
  public parse(expression: string, bindingType: BindingType.Interpolation): Interpolation;
  public parse(expression: string, bindingType: Exclude<BindingType, BindingType.IsIterator | BindingType.Interpolation>): IsBindingBehavior;
  public parse(expression: string, bindingType: BindingType): AnyBindingExpression;
  public parse(expression: string, bindingType: BindingType): AnyBindingExpression {
    let found: AnyBindingExpression;
    switch (bindingType) {
      case BindingType.IsCustom:
        return new CustomExpression(expression) as AnyBindingExpression;
      case BindingType.Interpolation:
        found = this._interpolationLookup[expression];
        if (found === void 0) {
          found = this._interpolationLookup[expression] = this.$parse(expression, bindingType);
        }
        return found;
      case BindingType.IsIterator:
        found = this._forOfLookup[expression];
        if (found === void 0) {
          found = this._forOfLookup[expression] = this.$parse(expression, bindingType);
        }
        return found;
      default: {
        if (expression.length === 0) {
          // only allow function to be empty
          if ((bindingType & (BindingType.IsFunction | BindingType.IsProperty)) > 0) {
            return PrimitiveLiteralExpression.$empty;
          }
          if (__DEV__)
            throw new Error('Invalid expression. Empty expression is only valid in event bindings (trigger, delegate, capture etc...)');
          else
            throw new Error('AUR0169');
        }
        found = this._expressionLookup[expression];
        if (found === void 0) {
          found = this._expressionLookup[expression] = this.$parse(expression, bindingType);
        }
        return found;
      }
    }
  }

  private $parse(expression: string, bindingType: BindingType.IsIterator): ForOfStatement;
  private $parse(expression: string, bindingType: BindingType.Interpolation): Interpolation;
  private $parse(expression: string, bindingType: Exclude<BindingType, BindingType.IsIterator | BindingType.Interpolation>): IsBindingBehavior;
  private $parse(expression: string, bindingType: BindingType): AnyBindingExpression {
    $state.ip = expression;
    $state.length = expression.length;
    $state.index = 0;
    $state._currentChar = expression.charCodeAt(0);
    return parse($state, Access.Reset, Precedence.Variadic, bindingType === void 0 ? BindingType.IsProperty : bindingType);
  }
}

export const enum Char {
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

export const enum Access {
  Reset                   = 0b0000000000000,
  Ancestor                = 0b0000111111111,
  This                    = 0b0001000000000,
  Scope                   = 0b0010000000000,
  Member                  = 0b0100000000000,
  Keyed                   = 0b1000000000000
}

export const enum Precedence {
  Variadic                = 0b000111101,
  Assign                  = 0b000111110,
  Conditional             = 0b000111111,
  LogicalOR               = 0b001000000,
  LogicalAND              = 0b010000000,
  Equality                = 0b011000000,
  Relational              = 0b100000000,
  Additive                = 0b101000000,
  Multiplicative          = 0b110000000,
  Binary                  = 0b111000000,
  LeftHandSide            = 0b111000001,
  Primary                 = 0b111000010,
  Unary                   = 0b111000011,
}
const enum Token {
  EOF                     = 0b110000000000_000_000000,
  ExpressionTerminal      = 0b100000000000_000_000000,
  AccessScopeTerminal     = 0b010000000000_000_000000,
  ClosingToken            = 0b001000000000_000_000000,
  OpeningToken            = 0b000100000000_000_000000,
  BinaryOp                = 0b000010000000_000_000000,
  UnaryOp                 = 0b000001000000_000_000000,
  LeftHandSide            = 0b000000100000_000_000000,
  StringOrNumericLiteral  = 0b000000011000_000_000000,
  NumericLiteral          = 0b000000010000_000_000000,
  StringLiteral           = 0b000000001000_000_000000,
  IdentifierName          = 0b000000000110_000_000000,
  Keyword                 = 0b000000000100_000_000000,
  Identifier              = 0b000000000010_000_000000,
  Contextual              = 0b000000000001_000_000000,
  Precedence              = 0b000000000000_111_000000,
  Type                    = 0b000000000000_000_111111,
  FalseKeyword            = 0b000000000100_000_000000,
  TrueKeyword             = 0b000000000100_000_000001,
  NullKeyword             = 0b000000000100_000_000010,
  UndefinedKeyword        = 0b000000000100_000_000011,
  ThisScope               = 0b000000000110_000_000100,
  // HostScope               = 0b000000000110_000_000101,
  ParentScope             = 0b000000000110_000_000110,
  OpenParen               = 0b010100100000_000_000111,
  OpenBrace               = 0b000100000000_000_001000,
  Dot                     = 0b000000100000_000_001001,
  CloseBrace              = 0b111000000000_000_001010,
  CloseParen              = 0b111000000000_000_001011,
  Comma                   = 0b110000000000_000_001100,
  OpenBracket             = 0b010100100000_000_001101,
  CloseBracket            = 0b111000000000_000_001110,
  Colon                   = 0b110000000000_000_001111,
  Question                = 0b110000000000_000_010000,
  Ampersand               = 0b110000000000_000_010011,
  Bar                     = 0b110000000000_000_010100,
  BarBar                  = 0b110010000000_010_010101,
  AmpersandAmpersand      = 0b110010000000_011_010110,
  EqualsEquals            = 0b110010000000_100_010111,
  ExclamationEquals       = 0b110010000000_100_011000,
  EqualsEqualsEquals      = 0b110010000000_100_011001,
  ExclamationEqualsEquals = 0b110010000000_100_011010,
  LessThan                = 0b110010000000_101_011011,
  GreaterThan             = 0b110010000000_101_011100,
  LessThanEquals          = 0b110010000000_101_011101,
  GreaterThanEquals       = 0b110010000000_101_011110,
  InKeyword               = 0b110010000100_101_011111,
  InstanceOfKeyword       = 0b110010000100_101_100000,
  Plus                    = 0b010011000000_110_100001,
  Minus                   = 0b010011000000_110_100010,
  TypeofKeyword           = 0b000001000100_000_100011,
  VoidKeyword             = 0b000001000100_000_100100,
  Asterisk                = 0b110010000000_111_100101,
  Percent                 = 0b110010000000_111_100110,
  Slash                   = 0b110010000000_111_100111,
  Equals                  = 0b100000000000_000_101000,
  Exclamation             = 0b000001000000_000_101001,
  TemplateTail            = 0b010000100000_000_101010,
  TemplateContinuation    = 0b010000100000_000_101011,
  OfKeyword               = 0b100000000101_000_101100
}

const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $this = AccessThisExpression.$this;
const $parent = AccessThisExpression.$parent;

export const enum BindingType {
                None = 0,
          // if a binding command is taking over the processing of an attribute
          // then it should add this flag to its binding type
          // which then tell the binder to proceed the attribute compilation as is,
          // instead of normal process: transformation -> compilation
          IgnoreAttr = 0b1000000,
       Interpolation = 0b0100000,
          IsIterator = 0b0001000,
          IsCustom   = 0b0000100,
          IsFunction = 0b0000010,
          IsProperty = 0b0000001,
}
/* eslint-enable @typescript-eslint/indent */

export class ParserState {
  public index: number = 0;
  public length: number;
  /** @internal */ public _startIndex: number = 0;
  /** @internal */ public _lastIndex: number = 0;
  /** @internal */ public _currentToken: Token = Token.EOF;
  /** @internal */ public _tokenValue: string | number = '';
  /** @internal */ public _currentChar: number;
  /** @internal */ public _assignable: boolean = true;
  /** @internal */ public get _tokenRaw(): string {
    return this.ip.slice(this._startIndex, this.index);
  }

  public constructor(
    public ip: string,
  ) {
    this.length = ip.length;
    this._currentChar = ip.charCodeAt(0);
  }
}

const $state = new ParserState('');

export function parseExpression<TType extends BindingType = BindingType.IsProperty>(input: string, bindingType?: TType):
TType extends BindingType.Interpolation ? Interpolation :
  TType extends BindingType.IsIterator ? ForOfStatement :
    IsBindingBehavior {

  $state.ip = input;
  $state.length = input.length;
  $state.index = 0;
  $state._currentChar = input.charCodeAt(0);
  return parse($state, Access.Reset, Precedence.Variadic, bindingType === void 0 ? BindingType.IsProperty : bindingType);
}

// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
export function parse<TPrec extends Precedence, TType extends BindingType>(state: ParserState, access: Access, minPrecedence: TPrec, bindingType: TType):
TPrec extends Precedence.Unary ? IsUnary :
  TPrec extends Precedence.Binary ? IsBinary :
    TPrec extends Precedence.LeftHandSide ? IsLeftHandSide :
      TPrec extends Precedence.Assign ? IsAssign :
        TPrec extends Precedence.Conditional ? IsConditional :
          TPrec extends Precedence.Primary ? IsPrimary :
            TPrec extends Precedence.Multiplicative ? IsBinary :
              TPrec extends Precedence.Additive ? IsBinary :
                TPrec extends Precedence.Relational ? IsBinary :
                  TPrec extends Precedence.Equality ? IsBinary :
                    TPrec extends Precedence.LogicalAND ? IsBinary :
                      TPrec extends Precedence.LogicalOR ? IsBinary :
                        TPrec extends Precedence.Variadic ?
                          TType extends BindingType.Interpolation ? Interpolation :
                            TType extends BindingType.IsIterator ? ForOfStatement :
                              never : never {

  if (bindingType === BindingType.IsCustom) {
    return new CustomExpression(state.ip) as any;
  }

  if (state.index === 0) {
    if (bindingType & BindingType.Interpolation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return parseInterpolation(state) as any;
    }
    nextToken(state);
    if (state._currentToken & Token.ExpressionTerminal) {
      if (__DEV__)
        throw new Error(`Invalid start of expression: '${state.ip}'`);
      else
        throw new Error(`AUR0151:${state.ip}`);
    }
  }

  state._assignable = Precedence.Binary > minPrecedence;
  let result = void 0 as unknown as IsExpressionOrStatement;

  if (state._currentToken & Token.UnaryOp) {
    /** parseUnaryExpression
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
    const op = TokenValues[state._currentToken & Token.Type] as UnaryOperator;
    nextToken(state);
    result = new UnaryExpression(op, parse(state, access, Precedence.LeftHandSide, bindingType));
    state._assignable = false;
  } else {
    /** parsePrimaryExpression
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
    primary: switch (state._currentToken) {
      case Token.ParentScope: // $parent
        state._assignable = false;
        do {
          nextToken(state);
          access++; // ancestor
          if (consumeOpt(state, Token.Dot)) {
            if ((state._currentToken as Token) === Token.Dot) {
              if (__DEV__)
                throw new Error(`Double dot and spread operators are not supported: '${state.ip}'`);
              else
                throw new Error(`AUR0152:${state.ip}`);
            } else if ((state._currentToken as Token) === Token.EOF) {
              if (__DEV__)
                throw new Error(`Expected identifier: '${state.ip}'`);
              else
                throw new Error(`AUR0153:${state.ip}`);
            }
          } else if (state._currentToken & Token.AccessScopeTerminal) {
            const ancestor = access & Access.Ancestor;
            result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
            access = Access.This;
            break primary;
          } else {
            if (__DEV__)
              throw new Error(`Invalid member expression: '${state.ip}'`);
            else
              throw new Error(`AUR0154:${state.ip}`);
          }
        } while (state._currentToken === Token.ParentScope);
        // falls through
      case Token.Identifier: // identifier
        if (bindingType & BindingType.IsIterator) {
          result = new BindingIdentifier(state._tokenValue as string);
        } else {
          result = new AccessScopeExpression(state._tokenValue as string, access & Access.Ancestor);
          access = Access.Scope;
        }
        state._assignable = true;
        nextToken(state);
        break;
      case Token.ThisScope: // $this
        state._assignable = false;
        nextToken(state);
        result = $this;
        access = Access.This;
        break;
      case Token.OpenParen: // parenthesized expression
        nextToken(state);
        result = parse(state, Access.Reset, Precedence.Assign, bindingType);
        consume(state, Token.CloseParen);
        access = Access.Reset;
        break;
      case Token.OpenBracket:
        result = parseArrayLiteralExpression(state, access, bindingType);
        access = Access.Reset;
        break;
      case Token.OpenBrace:
        result = parseObjectLiteralExpression(state, bindingType);
        access = Access.Reset;
        break;
      case Token.TemplateTail:
        result = new TemplateExpression([state._tokenValue as string]);
        state._assignable = false;
        nextToken(state);
        access = Access.Reset;
        break;
      case Token.TemplateContinuation:
        result = parseTemplate(state, access, bindingType, result as IsLeftHandSide, false);
        access = Access.Reset;
        break;
      case Token.StringLiteral:
      case Token.NumericLiteral:
        result = new PrimitiveLiteralExpression(state._tokenValue);
        state._assignable = false;
        nextToken(state);
        access = Access.Reset;
        break;
      case Token.NullKeyword:
      case Token.UndefinedKeyword:
      case Token.TrueKeyword:
      case Token.FalseKeyword:
        result = TokenValues[state._currentToken & Token.Type] as PrimitiveLiteralExpression;
        state._assignable = false;
        nextToken(state);
        access = Access.Reset;
        break;
      default:
        if (state.index >= state.length) {
          if (__DEV__)
            throw new Error(`Unexpected end of expression: '${state.ip}'`);
          else
            throw new Error(`AUR0155:${state.ip}`);
        } else {
          if (__DEV__)
            throw new Error(`Unconsumed token: '${state.ip}'`);
          else
            throw new Error(`AUR0156:${state.ip}`);
        }
    }

    if (bindingType & BindingType.IsIterator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return parseForOfStatement(state, result as BindingIdentifierOrPattern) as any;
    }
    if (Precedence.LeftHandSide < minPrecedence) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    }

    /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
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
    let name = state._tokenValue as string;
    while ((state._currentToken & Token.LeftHandSide) > 0) {
      const args: IsAssign[] = [];
      let strings: string[];
      switch ((state._currentToken as Token)) {
        case Token.Dot:
          state._assignable = true;
          nextToken(state);
          if ((state._currentToken & Token.IdentifierName) === 0) {
            if (__DEV__)
              throw new Error(`Expected identifier: '${state.ip}'`);
            else
              throw new Error(`AUR0153:${state.ip}`);
          }
          name = state._tokenValue as string;
          nextToken(state);
          // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
          access = ((access & (Access.This | Access.Scope)) << 1) | (access & Access.Member) | ((access & Access.Keyed) >> 1);
          if ((state._currentToken as Token) === Token.OpenParen) {
            if (access === Access.Reset) { // if the left hand side is a literal, make sure we parse a CallMemberExpression
              access = Access.Member;
            }
            continue;
          }
          if (access & Access.Scope) {
            result = new AccessScopeExpression(name, (result as AccessScopeExpression | AccessThisExpression).ancestor);
          } else { // if it's not $Scope, it's $Member
            result = new AccessMemberExpression(result as IsLeftHandSide, name);
          }
          continue;
        case Token.OpenBracket:
          state._assignable = true;
          nextToken(state);
          access = Access.Keyed;
          result = new AccessKeyedExpression(result as IsLeftHandSide, parse(state, Access.Reset, Precedence.Assign, bindingType));
          consume(state, Token.CloseBracket);
          break;
        case Token.OpenParen:
          state._assignable = false;
          nextToken(state);
          while ((state._currentToken as Token) !== Token.CloseParen) {
            args.push(parse(state, Access.Reset, Precedence.Assign, bindingType));
            if (!consumeOpt(state, Token.Comma)) {
              break;
            }
          }
          consume(state, Token.CloseParen);
          if (access & Access.Scope) {
            result = new CallScopeExpression(name, args, (result as AccessScopeExpression | AccessThisExpression).ancestor);
          } else if (access & Access.Member) {
            result = new CallMemberExpression(result as IsLeftHandSide, name, args);
          } else {
            result = new CallFunctionExpression(result as IsLeftHandSide, args);
          }
          access = 0;
          break;
        case Token.TemplateTail:
          state._assignable = false;
          strings = [state._tokenValue as string];
          result = new TaggedTemplateExpression(strings, strings, result as IsLeftHandSide);
          nextToken(state);
          break;
        case Token.TemplateContinuation:
          result = parseTemplate(state, access, bindingType, result as IsLeftHandSide, true);
        default:
      }
    }
  }

  if (Precedence.Binary < minPrecedence) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /** parseBinaryExpression
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
   */
  while ((state._currentToken & Token.BinaryOp) > 0) {
    const opToken = state._currentToken;
    if ((opToken & Token.Precedence) <= minPrecedence) {
      break;
    }
    nextToken(state);
    result = new BinaryExpression(TokenValues[opToken & Token.Type] as BinaryOperator, result as IsBinary, parse(state, access, opToken & Token.Precedence, bindingType));
    state._assignable = false;
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
   * 1. BinaryExpression
   * 2. BinaryExpression ? AssignmentExpression : AssignmentExpression
   *
   * IsValidAssignmentTarget
   * 1,2 = false
   */

  if (consumeOpt(state, Token.Question)) {
    const yes = parse(state, access, Precedence.Assign, bindingType);
    consume(state, Token.Colon);
    result = new ConditionalExpression(result as IsBinary, yes, parse(state, access, Precedence.Assign, bindingType));
    state._assignable = false;
  }
  if (Precedence.Assign < minPrecedence) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /** parseAssignmentExpression
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
  if (consumeOpt(state, Token.Equals)) {
    if (!state._assignable) {
      if (__DEV__)
        throw new Error(`Left hand side of expression is not assignable: '${state.ip}'`);
      else
        throw new Error(`AUR0158:${state.ip}`);
    }
    result = new AssignExpression(result as IsAssignable, parse(state, access, Precedence.Assign, bindingType));
  }
  if (Precedence.Variadic < minPrecedence) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }

  /** parseValueConverter
   */
  while (consumeOpt(state, Token.Bar)) {
    if (state._currentToken === Token.EOF) {
      if (__DEV__)
        throw new Error(`Expected identifier to come after ValueConverter operator: '${state.ip}'`);
      else
        throw new Error(`AUR0159:${state.ip}`);
    }
    const name = state._tokenValue as string;
    nextToken(state);
    const args = new Array<IsAssign>();
    while (consumeOpt(state, Token.Colon)) {
      args.push(parse(state, access, Precedence.Assign, bindingType));
    }
    result = new ValueConverterExpression(result as IsValueConverter, name, args);
  }

  /** parseBindingBehavior
   */
  while (consumeOpt(state, Token.Ampersand)) {
    if (state._currentToken === Token.EOF) {
      if (__DEV__)
        throw new Error(`Expected identifier to come after BindingBehavior operator: '${state.ip}'`);
      else
        throw new Error(`AUR0160:${state.ip}`);
    }
    const name = state._tokenValue as string;
    nextToken(state);
    const args = new Array<IsAssign>();
    while (consumeOpt(state, Token.Colon)) {
      args.push(parse(state, access, Precedence.Assign, bindingType));
    }
    result = new BindingBehaviorExpression(result as IsBindingBehavior, name, args);
  }
  if (state._currentToken !== Token.EOF) {
    if (bindingType & BindingType.Interpolation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    }
    if (state._tokenRaw === 'of') {
      if (__DEV__)
        throw new Error(`Unexpected keyword "of": '${state.ip}'`);
      else
        throw new Error(`AUR0161:${state.ip}`);
    }
    if (__DEV__)
      throw new Error(`Unconsumed token: '${state.ip}'`);
    else
      throw new Error(`AUR0162:${state.ip}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result as any;
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
function parseArrayLiteralExpression(state: ParserState, access: Access, bindingType: BindingType): ArrayBindingPattern | ArrayLiteralExpression {
  nextToken(state);
  const elements = new Array<IsAssign>();
  while (state._currentToken !== Token.CloseBracket) {
    if (consumeOpt(state, Token.Comma)) {
      elements.push($undefined);
      if ((state._currentToken as Token) === Token.CloseBracket) {
        break;
      }
    } else {
      elements.push(parse(state, access, Precedence.Assign, bindingType & ~BindingType.IsIterator));
      if (consumeOpt(state, Token.Comma)) {
        if ((state._currentToken as Token) === Token.CloseBracket) {
          break;
        }
      } else {
        break;
      }
    }
  }
  consume(state, Token.CloseBracket);
  if (bindingType & BindingType.IsIterator) {
    return new ArrayBindingPattern(elements);
  } else {
    state._assignable = false;
    return new ArrayLiteralExpression(elements);
  }
}

function parseForOfStatement(state: ParserState, result: BindingIdentifierOrPattern): ForOfStatement {
  if ((result.$kind & ExpressionKind.IsForDeclaration) === 0) {
    if (__DEV__)
      throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.ip}'`);
    else
      throw new Error(`AUR0163:${state.ip}`);
  }
  if (state._currentToken !== Token.OfKeyword) {
    if (__DEV__)
      throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.ip}'`);
    else
      throw new Error(`AUR0163:${state.ip}`);
  }
  nextToken(state);
  const declaration = result;
  const statement = parse(state, Access.Reset, Precedence.Variadic, BindingType.None);
  return new ForOfStatement(declaration, statement as IsBindingBehavior);
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
function parseObjectLiteralExpression(state: ParserState, bindingType: BindingType): ObjectBindingPattern | ObjectLiteralExpression {
  const keys = new Array<string | number>();
  const values = new Array<IsAssign>();
  nextToken(state);
  while (state._currentToken !== Token.CloseBrace) {
    keys.push(state._tokenValue);
    // Literal = mandatory colon
    if (state._currentToken & Token.StringOrNumericLiteral) {
      nextToken(state);
      consume(state, Token.Colon);
      values.push(parse(state, Access.Reset, Precedence.Assign, bindingType & ~BindingType.IsIterator));
    } else if (state._currentToken & Token.IdentifierName) {
      // IdentifierName = optional colon
      const { _currentChar: currentChar, _currentToken: currentToken, index: index } = state;
      nextToken(state);
      if (consumeOpt(state, Token.Colon)) {
        values.push(parse(state, Access.Reset, Precedence.Assign, bindingType & ~BindingType.IsIterator));
      } else {
        // Shorthand
        state._currentChar = currentChar;
        state._currentToken = currentToken;
        state.index = index;
        values.push(parse(state, Access.Reset, Precedence.Primary, bindingType & ~BindingType.IsIterator));
      }
    } else {
      if (__DEV__)
        throw new Error(`Invalid or unsupported property definition in object literal: '${state.ip}'`);
      else
        throw new Error(`AUR0164:${state.ip}`);
    }
    if ((state._currentToken as Token) !== Token.CloseBrace) {
      consume(state, Token.Comma);
    }
  }
  consume(state, Token.CloseBrace);
  if (bindingType & BindingType.IsIterator) {
    return new ObjectBindingPattern(keys, values);
  } else {
    state._assignable = false;
    return new ObjectLiteralExpression(keys, values);
  }
}

function parseInterpolation(state: ParserState): Interpolation {
  const parts = [];
  const expressions: (IsBindingBehavior | Interpolation)[] = [];
  const length = state.length;
  let result = '';
  while (state.index < length) {
    switch (state._currentChar) {
      case Char.Dollar:
        if (state.ip.charCodeAt(state.index + 1) === Char.OpenBrace) {
          parts.push(result);
          result = '';

          state.index += 2;
          state._currentChar = state.ip.charCodeAt(state.index);
          nextToken(state);
          const expression = parse(state, Access.Reset, Precedence.Variadic, BindingType.Interpolation);
          expressions.push(expression);
          continue;
        } else {
          result += '$';
        }
        break;
      case Char.Backslash:
        result += String.fromCharCode(unescapeCode(nextChar(state)));
        break;
      default:
        result += String.fromCharCode(state._currentChar);
    }
    nextChar(state);
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
function parseTemplate(state: ParserState, access: Access, bindingType: BindingType, result: IsLeftHandSide, tagged: boolean): TaggedTemplateExpression | TemplateExpression {
  const cooked = [state._tokenValue as string];
  // TODO: properly implement raw parts / decide whether we want this
  consume(state, Token.TemplateContinuation);
  const expressions = [parse(state, access, Precedence.Assign, bindingType)];
  while ((state._currentToken = scanTemplateTail(state)) !== Token.TemplateTail) {
    cooked.push(state._tokenValue as string);
    consume(state, Token.TemplateContinuation);
    expressions.push(parse(state, access, Precedence.Assign, bindingType));
  }
  cooked.push(state._tokenValue as string);
  state._assignable = false;
  if (tagged) {
    nextToken(state);
    return new TaggedTemplateExpression(cooked, cooked, result, expressions);
  } else {
    nextToken(state);
    return new TemplateExpression(cooked, expressions);
  }
}

function nextToken(state: ParserState): void {
  while (state.index < state.length) {
    state._startIndex = state.index;
    if ((state._currentToken = (CharScanners[state._currentChar](state)) as Token) != null) { // a null token means the character must be skipped
      return;
    }
  }
  state._currentToken = Token.EOF;
}

function nextChar(state: ParserState): number {
  return state._currentChar = state.ip.charCodeAt(++state.index);
}

function scanIdentifier(state: ParserState): Token {
  // run to the next non-idPart
  while (IdParts[nextChar(state)]);

  const token: Token|undefined = KeywordLookup[state._tokenValue = state._tokenRaw];
  return token === undefined ? Token.Identifier : token;
}

function scanNumber(state: ParserState, isFloat: boolean): Token {
  let char = state._currentChar;
  if (isFloat === false) {
    do {
      char = nextChar(state);
    } while (char <= Char.Nine && char >= Char.Zero);

    if (char !== Char.Dot) {
      state._tokenValue = parseInt(state._tokenRaw, 10);
      return Token.NumericLiteral;
    }
    // past this point it's always a float
    char = nextChar(state);
    if (state.index >= state.length) {
      // unless the number ends with a dot - that behaves a little different in native ES expressions
      // but in our AST that behavior has no effect because numbers are always stored in variables
      state._tokenValue = parseInt(state._tokenRaw.slice(0, -1), 10);
      return Token.NumericLiteral;
    }
  }

  if (char <= Char.Nine && char >= Char.Zero) {
    do {
      char = nextChar(state);
    } while (char <= Char.Nine && char >= Char.Zero);
  } else {
    state._currentChar = state.ip.charCodeAt(--state.index);
  }

  state._tokenValue = parseFloat(state._tokenRaw);
  return Token.NumericLiteral;
}

function scanString(state: ParserState): Token {
  const quote = state._currentChar;
  nextChar(state); // Skip initial quote.

  let unescaped = 0;
  const buffer = new Array<string>();
  let marker = state.index;

  while (state._currentChar !== quote) {
    if (state._currentChar === Char.Backslash) {
      buffer.push(state.ip.slice(marker, state.index));
      nextChar(state);
      unescaped = unescapeCode(state._currentChar);
      nextChar(state);
      buffer.push(String.fromCharCode(unescaped));
      marker = state.index;
    } else if (state.index >= state.length) {
      if (__DEV__)
        throw new Error(`Unterminated quote in string literal: '${state.ip}'`);
      else
        throw new Error(`AUR0165:${state.ip}`);
    } else {
      nextChar(state);
    }
  }

  const last = state.ip.slice(marker, state.index);
  nextChar(state); // Skip terminating quote.

  // Compute the unescaped string value.
  buffer.push(last);
  const unescapedStr = buffer.join('');

  state._tokenValue = unescapedStr;
  return Token.StringLiteral;
}

function scanTemplate(state: ParserState): Token {
  let tail = true;
  let result = '';

  while (nextChar(state) !== Char.Backtick) {
    if (state._currentChar === Char.Dollar) {
      if ((state.index + 1) < state.length && state.ip.charCodeAt(state.index + 1) === Char.OpenBrace) {
        state.index++;
        tail = false;
        break;
      } else {
        result += '$';
      }
    } else if (state._currentChar === Char.Backslash) {
      result += String.fromCharCode(unescapeCode(nextChar(state)));
    } else {
      if (state.index >= state.length) {
        if (__DEV__)
          throw new Error(`Unterminated template string: '${state.ip}'`);
        else
          throw new Error(`AUR0166:${state.ip}`);
      }
      result += String.fromCharCode(state._currentChar);
    }
  }

  nextChar(state);
  state._tokenValue = result;
  if (tail) {
    return Token.TemplateTail;
  }
  return Token.TemplateContinuation;
}

function scanTemplateTail(state: ParserState): Token {
  if (state.index >= state.length) {
    if (__DEV__)
      throw new Error(`Unterminated template string: '${state.ip}'`);
    else
      throw new Error(`AUR0166:${state.ip}`);
  }
  state.index--;
  return scanTemplate(state);
}

function consumeOpt(state: ParserState, token: Token): boolean {
  if (state._currentToken === token) {
    nextToken(state);
    return true;
  }

  return false;
}

function consume(state: ParserState, token: Token): void {
  if (state._currentToken === token) {
    nextToken(state);
  } else {
    if (__DEV__)
      throw new Error(`Missing expected token: '${state.ip}'`);
    else
      throw new Error(`AUR0167:${state.ip}<${token}`);
  }
}

/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
  $false, $true, $null, $undefined, '$this', null/* '$host' */, '$parent',

  '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',

  '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
  '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
  Token.TemplateTail, Token.TemplateContinuation,
  'of'
];

const KeywordLookup: Record<string, Token> = createLookup();
KeywordLookup.true = Token.TrueKeyword;
KeywordLookup.null = Token.NullKeyword;
KeywordLookup.false = Token.FalseKeyword;
KeywordLookup.undefined = Token.UndefinedKeyword;
KeywordLookup.$this = Token.ThisScope;
KeywordLookup.$parent = Token.ParentScope;
KeywordLookup.in = Token.InKeyword;
KeywordLookup.instanceof = Token.InstanceOfKeyword;
KeywordLookup.typeof = Token.TypeofKeyword;
KeywordLookup.void = Token.VoidKeyword;
KeywordLookup.of = Token.OfKeyword;

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
function decompress(lookup: (CharScanner | number)[] | null, $set: Set<number> | null, compressed: number[], value: CharScanner | number | boolean): void {
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
}

// CharFuncLookup functions
function returnToken(token: Token): (s: ParserState) => Token {
  return s => {
    nextChar(s);
    return token;
  };
}
const unexpectedCharacter: CharScanner = s => {
  if (__DEV__)
    throw new Error(`Unexpected character: '${s.ip}'`);
  else
    throw new Error(`AUR0168:${s.ip}`);
};
unexpectedCharacter.notMapped = true;

// ASCII IdentifierPart lookup
const AsciiIdParts = new Set<number>();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);

// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts as any, null, codes.IdStart, 1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts as any, null, codes.Digit, 1);

type CharScanner = ((p: ParserState) => Token | null) & { notMapped?: boolean };

// Character scanning function lookup
const CharScanners = new Array<CharScanner>(0xFFFF);
CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);

decompress(CharScanners, null, codes.Skip, s => {
  nextChar(s);
  return null;
});
decompress(CharScanners, null, codes.IdStart, scanIdentifier);
decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));

CharScanners[Char.DoubleQuote] =
CharScanners[Char.SingleQuote] = s => {
  return scanString(s);
};
CharScanners[Char.Backtick] = s => {
  return scanTemplate(s);
};

// !, !=, !==
CharScanners[Char.Exclamation] = s => {
  if (nextChar(s) !== Char.Equals) {
    return Token.Exclamation;
  }
  if (nextChar(s) !== Char.Equals) {
    return Token.ExclamationEquals;
  }
  nextChar(s);
  return Token.ExclamationEqualsEquals;
};

// =, ==, ===
CharScanners[Char.Equals] =  s => {
  if (nextChar(s) !== Char.Equals) {
    return Token.Equals;
  }
  if (nextChar(s) !== Char.Equals) {
    return Token.EqualsEquals;
  }
  nextChar(s);
  return Token.EqualsEqualsEquals;
};

// &, &&
CharScanners[Char.Ampersand] = s => {
  if (nextChar(s) !== Char.Ampersand) {
    return Token.Ampersand;
  }
  nextChar(s);
  return Token.AmpersandAmpersand;
};

// |, ||
CharScanners[Char.Bar] = s => {
  if (nextChar(s) !== Char.Bar) {
    return Token.Bar;
  }
  nextChar(s);
  return Token.BarBar;
};

// .
CharScanners[Char.Dot] = s => {
  if (nextChar(s) <= Char.Nine && s._currentChar >= Char.Zero) {
    return scanNumber(s, true);
  }
  return Token.Dot;
};

// <, <=
CharScanners[Char.LessThan] =  s => {
  if (nextChar(s) !== Char.Equals) {
    return Token.LessThan;
  }
  nextChar(s);
  return Token.LessThanEquals;
};

// >, >=
CharScanners[Char.GreaterThan] =  s => {
  if (nextChar(s) !== Char.Equals) {
    return Token.GreaterThan;
  }
  nextChar(s);
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
CharScanners[Char.Question]     = returnToken(Token.Question);
CharScanners[Char.OpenBracket]  = returnToken(Token.OpenBracket);
CharScanners[Char.CloseBracket] = returnToken(Token.CloseBracket);
CharScanners[Char.OpenBrace]    = returnToken(Token.OpenBrace);
CharScanners[Char.CloseBrace]   = returnToken(Token.CloseBrace);
