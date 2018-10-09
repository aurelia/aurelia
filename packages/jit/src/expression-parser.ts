// tslint:disable:no-non-null-assertion
import { IContainer, IRegistry, Reporter } from '@aurelia/kernel';
import {
  AccessKeyed, AccessMember, AccessScope, AccessThis,
  ArrayBindingPattern, ArrayLiteral, Assign, Binary,
  BinaryOperator, BindingBehavior, BindingIdentifier,
  BindingIdentifierOrPattern, BindingType, CallFunction,
  CallMember, CallScope, Conditional, ExpressionKind, ForOfStatement,
  IExpression, IExpressionParser, Interpolation, IsAssign, IsAssignable,
  IsBinary, IsBindingBehavior, IsConditional,
  IsExpressionOrStatement, IsLeftHandSide, IsPrimary, IsUnary,
  IsValueConverter, ObjectBindingPattern, ObjectLiteral, PrimitiveLiteral, TaggedTemplate, Template, Unary, UnaryOperator, ValueConverter
} from '@aurelia/runtime';
import { Access, Char, Precedence, Token, unescapeCode } from './common';

export const ParserRegistration: IRegistry = {
  register(container: IContainer): void {
    container.registerTransformer(IExpressionParser, parser => {
      parser['parseCore'] = parseCore;
      return parser;
    });
  }
};

const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
const $this = AccessThis.$this;
const $parent = AccessThis.$parent;

/*@internal*/
export class ParserState {
  public index: number;
  public startIndex: number;
  public input: string;
  public lastIndex: number;
  public length: number;
  public currentToken: Token;
  public tokenValue: string | number;
  public currentChar: number;
  public assignable: boolean;
  public get tokenRaw(): string {
    return this.input.slice(this.startIndex, this.index);
  }

  constructor(input: string) {
    this.index = 0;
    this.startIndex = 0;
    this.lastIndex = 0;
    this.input = input;
    this.length = input.length;
    this.currentToken = Token.EOF;
    this.tokenValue = '';
    this.currentChar = input.charCodeAt(0);
    this.assignable = true;
  }
}

const $state = new ParserState('');

const enum SyntaxError {
  InvalidExpressionStart = 100,
  UnconsumedToken = 101,
  DoubleDot = 102,
  InvalidMemberExpression = 103,
  UnexpectedEndOfExpression = 104,
  ExpectedIdentifier = 105,
  InvalidForDeclaration = 106,
  InvalidObjectLiteralPropertyDefinition = 107,
  UnterminatedQuote = 108,
  UnterminatedTemplate = 109,
  MissingExpectedToken = 110,
  UnexpectedCharacter = 111,
  MissingValueConverter = 112,
  MissingBindingBehavior = 113
}

const enum SemanticError {
  NotAssignable = 150,
  UnexpectedForOf = 151
}

/*@internal*/
export function parseCore(input: string, bindingType?: BindingType): IExpression {
  $state.input = input;
  $state.length = input.length;
  $state.index = 0;
  $state.currentChar = input.charCodeAt(0);
  return parse($state, Access.Reset, Precedence.Variadic, bindingType === undefined ? BindingType.BindCommand : bindingType);
}

/*@internal*/
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
    TType extends BindingType.ForCommand ? ForOfStatement :
    never : never {

  if (state.index === 0) {
    if ((bindingType & BindingType.Interpolation) > 0) {
      // tslint:disable-next-line:no-any
      return parseInterpolation(state) as any;
    }
    nextToken(state);
    if ((state.currentToken & Token.ExpressionTerminal) > 0) {
      throw Reporter.error(SyntaxError.InvalidExpressionStart, { state });
    }
  }

  state.assignable = Precedence.Binary > minPrecedence;
  let result = undefined as IsExpressionOrStatement;

  if ((state.currentToken & Token.UnaryOp) > 0) {
    /** parseUnaryExpression
     * https://tc39.github.io/ecma262/#sec-unary-operators
     *
     * UnaryExpression :
     *   1. LeftHandSideExpression
     *   2. void UnaryExpression
     *   3. typeof UnaryExpression
     *   4. + UnaryExpression
     *   5. - UnaryExpression
     *   6. ! UnaryExpression
     *
     * IsValidAssignmentTarget
     *   2,3,4,5,6 = false
     *   1 = see parseLeftHandSideExpression
     *
     * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
     */
    const op = TokenValues[state.currentToken & Token.Type] as UnaryOperator;
    nextToken(state);
    result = new Unary(op, parse(state, access, Precedence.LeftHandSide, bindingType) as IsLeftHandSide);
    state.assignable = false;
  } else {
    /** parsePrimaryExpression
     * https://tc39.github.io/ecma262/#sec-primary-expression
     *
     * PrimaryExpression :
     *   1. this
     *   2. IdentifierName
     *   3. Literal
     *   4. ArrayLiteral
     *   5. ObjectLiteral
     *   6. TemplateLiteral
     *   7. ParenthesizedExpression
     *
     * Literal :
     *    NullLiteral
     *    BooleanLiteral
     *    NumericLiteral
     *    StringLiteral
     *
     * ParenthesizedExpression :
     *   ( AssignmentExpression )
     *
     * IsValidAssignmentTarget
     *   1,3,4,5,6,7 = false
     *   2 = true
     */
    primary: switch (state.currentToken) {
    case Token.ParentScope: // $parent
      state.assignable = false;
      do {
        nextToken(state);
        access++; // ancestor
        if (consumeOpt(state, Token.Dot)) {
          if (state!.currentToken === Token.Dot) {
            throw Reporter.error(SyntaxError.DoubleDot, { state });
          } else if (state!.currentToken === Token.EOF) {
            throw Reporter.error(SyntaxError.ExpectedIdentifier, { state });
          }
          continue;
        } else if ((state.currentToken & Token.AccessScopeTerminal) > 0) {
          const ancestor = access & Access.Ancestor;
          result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThis(ancestor);
          access = Access.This;
          break primary;
        } else {
          throw Reporter.error(SyntaxError.InvalidMemberExpression, { state });
        }
      } while (state.currentToken === Token.ParentScope);
    // falls through
    case Token.Identifier: // identifier
      if ((bindingType & BindingType.IsIterator) > 0) {
        result = new BindingIdentifier(<string>state.tokenValue);
      } else {
        result = new AccessScope(<string>state.tokenValue, access & Access.Ancestor);
        access = Access.Scope;
      }
      state.assignable = true;
      nextToken(state);
      break;
    case Token.ThisScope: // $this
      state.assignable = false;
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
      result = new Template([<string>state.tokenValue]);
      state.assignable = false;
      nextToken(state);
      access = Access.Reset;
      break;
    case Token.TemplateContinuation:
      result = parseTemplate(state, access, bindingType, result as IsLeftHandSide, false);
      access = Access.Reset;
      break;
    case Token.StringLiteral:
    case Token.NumericLiteral:
      result = new PrimitiveLiteral(state.tokenValue);
      state.assignable = false;
      nextToken(state);
      access = Access.Reset;
      break;
    case Token.NullKeyword:
    case Token.UndefinedKeyword:
    case Token.TrueKeyword:
    case Token.FalseKeyword:
      result = TokenValues[state.currentToken & Token.Type] as PrimitiveLiteral;
      state.assignable = false;
      nextToken(state);
      access = Access.Reset;
      break;
    default:
      if (state.index >= state.length) {
        throw Reporter.error(SyntaxError.UnexpectedEndOfExpression, { state });
      } else {
        throw Reporter.error(SyntaxError.UnconsumedToken, { state });
      }
    }

    if ((bindingType & BindingType.IsIterator) > 0) {
      // tslint:disable-next-line:no-any
      return parseForOfStatement(state, result as BindingIdentifierOrPattern) as any;
    }
    // tslint:disable-next-line:no-any
    if (Precedence.LeftHandSide < minPrecedence) return result as any;

    /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
     * MemberExpression :
     *   1. PrimaryExpression
     *   2. MemberExpression [ AssignmentExpression ]
     *   3. MemberExpression . IdentifierName
     *   4. MemberExpression TemplateLiteral
     *
     * IsValidAssignmentTarget
     *   1,4 = false
     *   2,3 = true
     *
     *
     * parseCallExpression (Token.OpenParen)
     * CallExpression :
     *   1. MemberExpression Arguments
     *   2. CallExpression Arguments
     *   3. CallExpression [ AssignmentExpression ]
     *   4. CallExpression . IdentifierName
     *   5. CallExpression TemplateLiteral
     *
     * IsValidAssignmentTarget
     *   1,2,5 = false
     *   3,4 = true
     */
    let name = state.tokenValue as string;
    while ((state.currentToken & Token.LeftHandSide) > 0) {
      switch (state!.currentToken) {
        case Token.Dot:
          state.assignable = true;
          nextToken(state);
          if ((state.currentToken & Token.IdentifierName) === 0) {
            throw Reporter.error(SyntaxError.ExpectedIdentifier, { state });
          }
          name = state.tokenValue as string;
          nextToken(state);
          // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
          access = ((access & (Access.This | Access.Scope)) << 1) | (access & Access.Member) | ((access & Access.Keyed) >> 1);
          if (state!.currentToken === Token.OpenParen) {
            if (access === Access.Reset) { // if the left hand side is a literal, make sure we parse a CallMember
              access = Access.Member;
            }
            continue;
          }
          if ((access & Access.Scope) > 0) {
            result = new AccessScope(name, (result as AccessScope | AccessThis).ancestor);
          } else { // if it's not $Scope, it's $Member
            result = new AccessMember(result as IsLeftHandSide, name);
          }
          continue;
        case Token.OpenBracket:
          state.assignable = true;
          nextToken(state);
          access = Access.Keyed;
          result = new AccessKeyed(result as IsLeftHandSide, parse(state, Access.Reset, Precedence.Assign, bindingType));
          consume(state, Token.CloseBracket);
          break;
        case Token.OpenParen:
          state.assignable = false;
          nextToken(state);
          const args = new Array<IsAssign>();
          while (state!.currentToken !== Token.CloseParen) {
            args.push(parse(state, Access.Reset, Precedence.Assign, bindingType));
            if (!consumeOpt(state, Token.Comma)) {
              break;
            }
          }
          consume(state, Token.CloseParen);
          if ((access & Access.Scope) > 0) {
            result = new CallScope(name, args, (result as AccessScope | AccessThis).ancestor);
          } else if ((access & Access.Member) > 0) {
            result = new CallMember(result as IsLeftHandSide, name, args);
          } else {
            result = new CallFunction(result as IsLeftHandSide, args);
          }
          access = 0;
          break;
        case Token.TemplateTail:
          state.assignable = false;
          const strings = [<string>state.tokenValue];
          result = new TaggedTemplate(strings, strings, result as IsLeftHandSide);
          nextToken(state);
          break;
        case Token.TemplateContinuation:
          result = parseTemplate(state, access, bindingType, result as IsLeftHandSide, true);
        default:
      }
    }
  }

  // tslint:disable-next-line:no-any
  if (Precedence.Binary < minPrecedence) return result as any;

  /** parseBinaryExpression
   * https://tc39.github.io/ecma262/#sec-multiplicative-operators
   *
   * MultiplicativeExpression : (local precedence 6)
   *   UnaryExpression
   *   MultiplicativeExpression * / % UnaryExpression
   *
   * AdditiveExpression : (local precedence 5)
   *   MultiplicativeExpression
   *   AdditiveExpression + - MultiplicativeExpression
   *
   * RelationalExpression : (local precedence 4)
   *   AdditiveExpression
   *   RelationalExpression < > <= >= instanceof in AdditiveExpression
   *
   * EqualityExpression : (local precedence 3)
   *   RelationalExpression
   *   EqualityExpression == != === !== RelationalExpression
   *
   * LogicalANDExpression : (local precedence 2)
   *   EqualityExpression
   *   LogicalANDExpression && EqualityExpression
   *
   * LogicalORExpression : (local precedence 1)
   *   LogicalANDExpression
   *   LogicalORExpression || LogicalANDExpression
   */
  while ((state.currentToken & Token.BinaryOp) > 0) {
    const opToken = state.currentToken;
    if ((opToken & Token.Precedence) <= minPrecedence) {
      break;
    }
    nextToken(state);
    result = new Binary(TokenValues[opToken & Token.Type] as BinaryOperator, result as IsBinary, parse(state, access, opToken & Token.Precedence, bindingType));
    state.assignable = false;
  }
  // tslint:disable-next-line:no-any
  if (Precedence.Conditional < minPrecedence) return result as any;

  /**
   * parseConditionalExpression
   * https://tc39.github.io/ecma262/#prod-ConditionalExpression
   *
   * ConditionalExpression :
   *   1. BinaryExpression
   *   2. BinaryExpression ? AssignmentExpression : AssignmentExpression
   *
   * IsValidAssignmentTarget
   *   1,2 = false
   */

  if (consumeOpt(state, Token.Question)) {
    const yes = parse(state, access, Precedence.Assign, bindingType);
    consume(state, Token.Colon);
    result = new Conditional(result as IsBinary, yes, parse(state, access, Precedence.Assign, bindingType));
    state.assignable = false;
  }
  // tslint:disable-next-line:no-any
  if (Precedence.Assign < minPrecedence) return result as any;

  /** parseAssignmentExpression
   * https://tc39.github.io/ecma262/#prod-AssignmentExpression
   * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
   *
   * AssignmentExpression :
   *   1. ConditionalExpression
   *   2. LeftHandSideExpression = AssignmentExpression
   *
   * IsValidAssignmentTarget
   *   1,2 = false
   */
  if (consumeOpt(state, Token.Equals)) {
    if (!state.assignable) {
      throw Reporter.error(SemanticError.NotAssignable, { state });
    }
    result = new Assign(result as IsAssignable, parse(state, access, Precedence.Assign, bindingType));
  }
  // tslint:disable-next-line:no-any
  if (Precedence.Variadic < minPrecedence) return result as any;

  /** parseValueConverter
   */
  while (consumeOpt(state, Token.Bar)) {
    if (state.currentToken === Token.EOF) {
      throw Reporter.error(112);
    }
    const name = state.tokenValue as string;
    nextToken(state);
    const args = new Array<IsAssign>();
    while (consumeOpt(state, Token.Colon)) {
      args.push(parse(state, access, Precedence.Assign, bindingType));
    }
    result = new ValueConverter(result as IsValueConverter, name, args);
  }

  /** parseBindingBehavior
   */
  while (consumeOpt(state, Token.Ampersand)) {
    if (state.currentToken === Token.EOF) {
      throw Reporter.error(113);
    }
    const name = state.tokenValue as string;
    nextToken(state);
    const args = new Array<IsAssign>();
    while (consumeOpt(state, Token.Colon)) {
      args.push(parse(state, access, Precedence.Assign, bindingType));
    }
    result = new BindingBehavior(result as IsBindingBehavior, name, args);
  }
  if (state.currentToken !== Token.EOF) {
    if ((bindingType & BindingType.Interpolation) > 0) {
      // tslint:disable-next-line:no-any
      return result as any;
    }
    if (state.tokenRaw === 'of') {
      throw Reporter.error(SemanticError.UnexpectedForOf, { state });
    }
    throw Reporter.error(SyntaxError.UnconsumedToken, { state });
  }
  // tslint:disable-next-line:no-any
  return result as any;
}

/**
 * parseArrayLiteralExpression
 * https://tc39.github.io/ecma262/#prod-ArrayLiteral
 *
 * ArrayLiteral :
 *   [ Elision(opt) ]
 *   [ ElementList ]
 *   [ ElementList, Elision(opt) ]
 *
 * ElementList :
 *   Elision(opt) AssignmentExpression
 *   ElementList, Elision(opt) AssignmentExpression
 *
 * Elision :
 *  ,
 *  Elision ,
 */
function parseArrayLiteralExpression(state: ParserState, access: Access, bindingType: BindingType): ArrayBindingPattern | ArrayLiteral {
  nextToken(state);
  const elements = new Array<IsAssign>();
  while (state.currentToken !== Token.CloseBracket) {
    if (consumeOpt(state, Token.Comma)) {
      elements.push($undefined);
      if (state!.currentToken === Token.CloseBracket) {
        elements.push($undefined);
        break;
      }
    } else {
      elements.push(parse(state, access, Precedence.Assign, bindingType & ~BindingType.IsIterator));
      if (consumeOpt(state, Token.Comma)) {
        if (state!.currentToken === Token.CloseBracket) {
          elements.push($undefined);
          break;
        }
      } else {
        break;
      }
    }
  }
  consume(state, Token.CloseBracket);
  if ((bindingType & BindingType.IsIterator) > 0) {
    return new ArrayBindingPattern(elements);
  } else {
    state.assignable = false;
    return new ArrayLiteral(elements);
  }
}

function parseForOfStatement(state: ParserState, result: BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern): ForOfStatement {
  if ((result.$kind & ExpressionKind.IsForDeclaration) === 0) {
    throw Reporter.error(SyntaxError.InvalidForDeclaration, { state });
  }
  if (state.currentToken !== Token.OfKeyword) {
    throw Reporter.error(SyntaxError.InvalidForDeclaration, { state });
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
 * ObjectLiteral :
 *   { }
 *   { PropertyDefinitionList }
 *
 * PropertyDefinitionList :
 *   PropertyDefinition
 *   PropertyDefinitionList, PropertyDefinition
 *
 * PropertyDefinition :
 *   IdentifierName
 *   PropertyName : AssignmentExpression
 *
 * PropertyName :
 *   IdentifierName
 *   StringLiteral
 *   NumericLiteral
 */
function parseObjectLiteralExpression(state: ParserState, bindingType: BindingType): ObjectBindingPattern | ObjectLiteral {
  const keys = new Array<string | number>();
  const values = new Array<IsAssign>();
  nextToken(state);
  while (state.currentToken !== Token.CloseBrace) {
    keys.push(state.tokenValue);
    // Literal = mandatory colon
    if ((state.currentToken & Token.StringOrNumericLiteral) > 0) {
      nextToken(state);
      consume(state, Token.Colon);
      values.push(parse(state, Access.Reset, Precedence.Assign, bindingType & ~BindingType.IsIterator));
    } else if ((state.currentToken & Token.IdentifierName) > 0) {
      // IdentifierName = optional colon
      const { currentChar, currentToken, index } = state;
      nextToken(state);
      if (consumeOpt(state, Token.Colon)) {
        values.push(parse(state, Access.Reset, Precedence.Assign, bindingType & ~BindingType.IsIterator));
      } else {
        // Shorthand
        state.currentChar = currentChar;
        state.currentToken = currentToken;
        state.index = index;
        values.push(parse(state, Access.Reset, Precedence.Primary, bindingType & ~BindingType.IsIterator));
      }
    } else {
      throw Reporter.error(SyntaxError.InvalidObjectLiteralPropertyDefinition, { state });
    }
    if (state!.currentToken !== Token.CloseBrace) {
      consume(state, Token.Comma);
    }
  }
  consume(state, Token.CloseBrace);
  if ((bindingType & BindingType.IsIterator) > 0) {
    return new ObjectBindingPattern(keys, values);
  } else {
    state.assignable = false;
    return new ObjectLiteral(keys, values);
  }
}

function parseInterpolation(state: ParserState): Interpolation {
  const parts = [];
  const expressions = [];
  const length = state.length;
  let result = '';
  while (state.index < length) {
    switch (state.currentChar) {
      case Char.Dollar:
        if (state.input.charCodeAt(state.index + 1) === Char.OpenBrace) {
          parts.push(result);
          result = '';

          state.index += 2;
          state.currentChar = state.input.charCodeAt(state.index);
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
        result += String.fromCharCode(state.currentChar);
    }
    nextChar(state);
  }
  if (expressions.length) {
    parts.push(result);
    return new Interpolation(parts, expressions);
  }
  return null;
}

/**
 * parseTemplateLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * Template :
 *   NoSubstitutionTemplate
 *   TemplateHead
 *
 * NoSubstitutionTemplate :
 *   ` TemplateCharacters(opt) `
 *
 * TemplateHead :
 *   ` TemplateCharacters(opt) ${
 *
 * TemplateSubstitutionTail :
 *   TemplateMiddle
 *   TemplateTail
 *
 * TemplateMiddle :
 *   } TemplateCharacters(opt) ${
 *
 * TemplateTail :
 *   } TemplateCharacters(opt) `
 *
 * TemplateCharacters :
 *   TemplateCharacter TemplateCharacters(opt)
 *
 * TemplateCharacter :
 *   $ [lookahead ≠ {]
 *   \ EscapeSequence
 *   SourceCharacter (but not one of ` or \ or $)
 */
function parseTemplate(state: ParserState, access: Access, bindingType: BindingType, result: IsLeftHandSide, tagged: boolean): TaggedTemplate | Template {
  const cooked = [state.tokenValue as string];
  //const raw = [state.tokenRaw];
  consume(state, Token.TemplateContinuation);
  const expressions = [parse(state, access, Precedence.Assign, bindingType)];
  while ((state.currentToken = scanTemplateTail(state)) !== Token.TemplateTail) {
    cooked.push(state.tokenValue as string);
    // if (tagged) {
    //   raw.push(state.tokenRaw);
    // }
    consume(state, Token.TemplateContinuation);
    expressions.push(parse(state, access, Precedence.Assign, bindingType));
  }
  cooked.push(state.tokenValue as string);
  state.assignable = false;
  if (tagged) {
    //raw.push(state.tokenRaw);
    nextToken(state);
    return new TaggedTemplate(cooked, cooked, result, expressions);
  } else {
    nextToken(state);
    return new Template(cooked, expressions);
  }
}

function nextToken(state: ParserState): void {
  while (state.index < state.length) {
    state.startIndex = state.index;
    if ((state.currentToken = CharScanners[state.currentChar](state)) !== null) { // a null token means the character must be skipped
      return;
    }
  }
  state.currentToken = Token.EOF;
}

function nextChar(state: ParserState): number {
  return state.currentChar = state.input.charCodeAt(++state.index);
}

function scanIdentifier(state: ParserState): Token {
  // run to the next non-idPart
  while (IdParts[nextChar(state)]);

  return KeywordLookup[state.tokenValue = state.tokenRaw] || Token.Identifier;
}

function scanNumber(state: ParserState, isFloat: boolean): Token {
  if (isFloat) {
    state.tokenValue = 0;
  } else {
    state.tokenValue = state.currentChar - Char.Zero;
    while (nextChar(state) <= Char.Nine && state.currentChar >= Char.Zero) {
      state.tokenValue = state.tokenValue * 10 + state.currentChar  - Char.Zero;
    }
  }

  if (isFloat || state.currentChar === Char.Dot) {
    // isFloat (coming from the period scanner) means the period was already skipped
    if (!isFloat) {
      isFloat = true;
      nextChar(state);
      if (state.index >= state.length) {
        // a trailing period is valid javascript, so return here to prevent creating a NaN down below
        return Token.NumericLiteral;
      }
    }
    // note: this essentially make member expressions on numeric literals valid;
    // this makes sense to allow since they're always stored in variables, and they can legally be evaluated
    // this would be consistent with declaring a literal as a normal variable and performing an operation on that
    const current = state.currentChar;
    if (current > Char.Nine || current < Char.Zero) {
      state.currentChar = state.input.charCodeAt(--state.index);
      return Token.NumericLiteral;
    }
    const start = state.index;
    let value = state.currentChar - Char.Zero;
    while (nextChar(state) <= Char.Nine && state.currentChar >= Char.Zero) {
      value = value * 10 + state.currentChar  - Char.Zero;
    }
    state.tokenValue = state.tokenValue + value / 10 ** (state.index - start);
  }

  // in the rare case that we go over this number, re-parse the number with the (slower) native number parsing,
  // to ensure consistency with the spec
  if (state.tokenValue > Number.MAX_SAFE_INTEGER) {
    if (isFloat) {
      state.tokenValue = parseFloat(state.tokenRaw);
    } else {
      state.tokenValue = parseInt(state.tokenRaw, 10);
    }
  }

  return Token.NumericLiteral;
}

function scanString(state: ParserState): Token {
  const quote = state.currentChar;
  nextChar(state); // Skip initial quote.

  let unescaped = 0;
  const buffer = new Array<string>();
  let marker = state.index;

  while (state.currentChar !== quote) {
    if (state.currentChar === Char.Backslash) {
      buffer.push(state.input.slice(marker, state.index));
      nextChar(state);
      unescaped = unescapeCode(state.currentChar);
      nextChar(state);
      buffer.push(String.fromCharCode(unescaped));
      marker = state.index;
    } else if (state.index >= state.length) {
      throw Reporter.error(SyntaxError.UnterminatedQuote, { state });
    } else {
      nextChar(state);
    }
  }

  const last = state.input.slice(marker, state.index);
  nextChar(state); // Skip terminating quote.

  // Compute the unescaped string value.
  buffer.push(last);
  const unescapedStr = buffer.join('');

  state.tokenValue = unescapedStr;
  return Token.StringLiteral;
}

function scanTemplate(state: ParserState): Token {
  let tail = true;
  let result = '';

  while (nextChar(state) !== Char.Backtick) {
    if (state.currentChar === Char.Dollar) {
      if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === Char.OpenBrace) {
        state.index++;
        tail = false;
        break;
      } else {
        result += '$';
      }
    } else if (state.currentChar === Char.Backslash) {
      result += String.fromCharCode(unescapeCode(nextChar(state)));
    } else {
      if (state.index >= state.length) {
        throw Reporter.error(SyntaxError.UnterminatedTemplate, { state });
      }
      result += String.fromCharCode(state.currentChar);
    }
  }

  nextChar(state);
  state.tokenValue = result;
  if (tail) {
    return Token.TemplateTail;
  }
  return Token.TemplateContinuation;
}

function scanTemplateTail(state: ParserState): Token {
  if (state.index >= state.length) {
    throw Reporter.error(SyntaxError.UnterminatedTemplate, { state });
  }
  state.index--;
  return scanTemplate(state);
}

function consumeOpt(state: ParserState, token: Token): boolean {
  // tslint:disable-next-line:possible-timing-attack
  if (state.currentToken === token) {
    nextToken(state);
    return true;
  }

  return false;
}

function consume(state: ParserState, token: Token): void {
  // tslint:disable-next-line:possible-timing-attack
  if (state.currentToken === token) {
    nextToken(state);
  } else {
    throw Reporter.error(SyntaxError.MissingExpectedToken, { state, expected: token });
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
  $false, $true, $null, $undefined, '$this', '$parent',

  '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',

  '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
  '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
  Token.TemplateTail, Token.TemplateContinuation,
  'of'
];

const KeywordLookup: {
  [key: string]: Token;
} = Object.create(null);
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
  IdStart: /*IdentifierStart*/[0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
  Digit: /*DecimalNumber*/[0x30, 0x3A],
  Skip: /*Skippable*/[0, 0x21, 0x7F, 0xA1]
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
      lookup.fill(<CharScanner | number>value, start, end);
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
  throw Reporter.error(SyntaxError.UnexpectedCharacter, { state: s });
};
unexpectedCharacter.notMapped = true;

// ASCII IdentifierPart lookup
const AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);

// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// tslint:disable-next-line:no-any
decompress(<any>IdParts, null, codes.IdStart, 1);
// tslint:disable-next-line:no-any
decompress(<any>IdParts, null, codes.Digit, 1);

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
  if (nextChar(s) <= Char.Nine && s.currentChar >= Char.Zero) {
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
