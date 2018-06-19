import {
  IExpression, ValueConverter, Assign, Conditional,
  AccessThis, AccessScope, AccessMember, AccessKeyed,
  CallScope, CallFunction, CallMember,
  Unary, BindingBehavior, Binary,
  PrimitiveLiteral, ArrayLiteral, ObjectLiteral, Template, TaggedTemplate,
  IsLeftHandSide, IsAssign, IsBinary, IsBindingBehavior, IsConditional,
  IsPrimary
} from '../../runtime/binding/ast';
import { IContainer } from '../../kernel/di';
import { IExpressionParser } from '../../runtime/binding/expression-parser';

export function register(container: IContainer) {
  container.registerTransformer(IExpressionParser, parser => {
    return Object.assign(parser, {
      parseCore(expression: string): IExpression {
        return parse(new ParserState(expression), Access.Reset, Precedence.Variadic);
      }
    });
  });
}

class ParserState {
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
    nextToken(this);
    if (this.currentToken & Token.ExpressionTerminal) {
      error(this, 'Invalid start of expression');
    }
  }
}

function parse<T extends Precedence>(state: ParserState, access: Access, minPrecedence: T):
  T extends Precedence.Primary ? IsPrimary :
  T extends Precedence.LeftHandSide ? IsLeftHandSide :
  T extends Precedence.Binary ? IsBinary :
  T extends Precedence.Conditional ? IsConditional :
  T extends Precedence.Assign ? IsAssign :
  T extends Precedence.Variadic ? IsBindingBehavior : IsBinary {

  let exprStart = state.index;
  state.assignable = Precedence.Binary > minPrecedence;
  let result = <any>undefined;

  if (state.currentToken & Token.UnaryOp) {
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
    const op = TokenValues[state.currentToken & Token.Type];
    nextToken(state);
    result = new Unary(<any>op, parse(state, access, Precedence.Primary));
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
        if (optional(state, Token.Dot)) {
          if (state.currentToken === <any>Token.Dot) {
            error(state);
          }
          continue;
        } else if (state.currentToken & Token.AccessScopeTerminal) {
          result = new AccessThis(access & Access.Ancestor);
          access = Access.This;
          break primary;
        } else {
          error(state);
        }
      } while (state.currentToken === Token.ParentScope);
    // falls through
    case Token.Identifier: // identifier
      result = new AccessScope(<string>state.tokenValue, access & Access.Ancestor);
      nextToken(state);
      access = Access.Scope;
      break;
    case Token.ThisScope: // $this
      state.assignable = false;
      nextToken(state);
      result = new AccessThis(0);
      access = Access.This;
      break;
    case Token.OpenParen: // parenthesized expression
      nextToken(state);
      result = parse(state, Access.Reset, Precedence.Conditional);
      expect(state, Token.CloseParen);
      break;
    case Token.OpenBracket:
      /** parseArrayLiteralExpression
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
      nextToken(state);
      const elements = new Array<IsAssign>();
      while (state.currentToken !== <any>Token.CloseBracket) {
        if (optional(state, Token.Comma)) {
          elements.push($undefined);
          if (state.currentToken === <any>Token.CloseBracket) {
            elements.push($undefined);
            break;
          }
        } else {
          elements.push(parse(state, access, Precedence.Assign));
          if (!optional(state, Token.Comma)) {
            break;
          }
        }
      }
      expect(state, Token.CloseBracket);
      result = new ArrayLiteral(elements);
      state.assignable = false;
      break;
    case Token.OpenBrace:
      /** parseObjectLiteralExpression
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
      const keys = new Array<string | number>();
      const values = new Array<IsAssign>();
      nextToken(state);
      while (state.currentToken !== Token.CloseBrace) {
        keys.push(state.tokenValue);
        // Literal = mandatory colon
        if (state.currentToken & Token.StringOrNumericLiteral) {
          nextToken(state);
          expect(state, Token.Colon);
          values.push(parse(state, Access.Reset, Precedence.Assign));
        } else if (state.currentToken & Token.IdentifierName) {
          // IdentifierName = optional colon
          const { currentChar, currentToken, index } = <any>state;
          nextToken(state);
          if (optional(state, Token.Colon)) {
            values.push(parse(state, Access.Reset, Precedence.Assign));
          } else {
            // Shorthand
            state.currentChar = currentChar;
            state.currentToken = currentToken;
            state.index = index;
            values.push(parse(state, Access.Reset, Precedence.Primary));
          }
        } else {
          error(state);
        }
        if (state.currentToken !== <any>Token.CloseBrace) {
          expect(state, Token.Comma);
        }
      }
      expect(state, Token.CloseBrace);
      result = new ObjectLiteral(keys, values);
      state.assignable = false;
      break;
    case Token.TemplateTail:
      result = new Template([<string>state.tokenValue]);
      state.assignable = false;
      nextToken(state);
      break;
    case Token.TemplateContinuation:
      /** parseTemplateLiteralExpression
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
       *
       * TODO: de-duplicate template parsing logic
       */
      const cooked = [<string>state.tokenValue];
      expect(state, Token.TemplateContinuation);
      const expressions = [parse(state, access, Precedence.Assign)];

      while ((state.currentToken = scanTemplateTail(state)) !== Token.TemplateTail) {
        cooked.push(<string>state.tokenValue);
        expect(state, Token.TemplateContinuation);
        expressions.push(parse(state, access, Precedence.Assign));
      }

      cooked.push(<string>state.tokenValue);
      nextToken(state);
      result = new Template(cooked, expressions);
      state.assignable = false;
      break;
    case Token.StringLiteral:
    case Token.NumericLiteral:
      result = new PrimitiveLiteral(<any>state.tokenValue);
      state.assignable = false;
      nextToken(state);
      break;
    case Token.NullKeyword:
    case Token.UndefinedKeyword:
    case Token.TrueKeyword:
    case Token.FalseKeyword:
      result = TokenValues[state.currentToken & Token.Type];
      state.assignable = false;
      nextToken(state);
      break;
    default:
      if (state.index >= state.length) {
        error(state, 'Unexpected end of expression');
      } else {
        error(state);
      }
    }
    if (Precedence.LeftHandSide < minPrecedence) return result;

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
    let name = state.tokenValue;
    while (state.currentToken & Token.LeftHandSide) {
      switch (<any>state.currentToken) {
      case Token.Dot:
        state.assignable = true;
        nextToken(state);
        if (!(state.currentToken & Token.IdentifierName)) {
          error(state);
        }
        name = state.tokenValue;
        nextToken(state);
        // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
        access = ((access & (Access.This | Access.Scope)) << 1) | (access & Access.Member) | ((access & Access.Keyed) >> 1);
        if (state.currentToken === <any>Token.OpenParen) {
          continue;
        }
        if (access & Access.Scope) {
          result = new AccessScope(<string>name, (<any>result).ancestor);
        } else { // if it's not $Scope, it's $Member
          result = new AccessMember(result, <string>name);
        }
        continue;
      case Token.OpenBracket:
        state.assignable = true;
        nextToken(state);
        access = Access.Keyed;
        result = new AccessKeyed(result, parse(state, Access.Reset, Precedence.Conditional));
        expect(state, Token.CloseBracket);
        break;
      case Token.OpenParen:
        state.assignable = false;
        nextToken(state);
        const args = new Array<IsAssign>();
        while (state.currentToken !== <any>Token.CloseParen) {
          args.push(parse(state, Access.Reset, Precedence.Conditional));
          if (!optional(state, Token.Comma)) {
            break;
          }
        }
        expect(state, Token.CloseParen);
        if (access & Access.Scope) {
          result = new CallScope(<string>name, args, (<any>result).ancestor);
        } else if (access & Access.Member) {
          result = new CallMember(result, <string>name, args);
        } else {
          result = new CallFunction(result, args);
        }
        access = 0;
        break;
      case Token.TemplateTail:
        state.assignable = false;
        result = new TaggedTemplate([<string>state.tokenValue], [state.tokenRaw], result);
        nextToken(state);
        break;
      case Token.TemplateContinuation:
        /** parseTemplateLiteralExpression
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
         *
         * TODO: de-duplicate template parsing logic
         */
        state.assignable = false;
        const cooked = [<string>state.tokenValue];
        const raw = [state.tokenRaw];
        expect(state, Token.TemplateContinuation);
        const expressions = [parse(state, access, Precedence.Assign)];

        while ((state.currentToken = scanTemplateTail(state)) !== Token.TemplateTail) {
          cooked.push(<string>state.tokenValue);
          raw.push(state.tokenRaw);
          expect(state, Token.TemplateContinuation);
          expressions.push(parse(state, access, Precedence.Assign));
        }

        cooked.push(<string>state.tokenValue);
        raw.push(state.tokenRaw);
        nextToken(state);
        result = new TaggedTemplate(cooked, raw, result, expressions);
      default:
      }
    }
  }
  if (Precedence.Binary < minPrecedence) return result;

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
  while (state.currentToken & Token.BinaryOp) {
    const opToken = state.currentToken;
    if ((opToken & Token.Precedence) < minPrecedence) {
      break;
    }
    nextToken(state);
    result = new Binary(<string>TokenValues[opToken & Token.Type], result, parse(state, access, opToken & Token.Precedence));
    state.assignable = false;
  }
  if (Precedence.Conditional < minPrecedence) return result;

  /** parseConditionalExpression
   * https://tc39.github.io/ecma262/#prod-ConditionalExpression
   *
   * ConditionalExpression :
   *   1. BinaryExpression
   *   2. BinaryExpression ? AssignmentExpression : AssignmentExpression
   *
   * IsValidAssignmentTarget
   *   1,2 = false
   */
  if (optional(state, Token.Question)) {
    const yes = parse(state, access, Precedence.Assign);
    expect(state, Token.Colon);
    result = new Conditional(result, yes, parse(state, access, Precedence.Assign));
    state.assignable = false;
  }

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
  if (optional(state, Token.Equals)) {
    if (!state.assignable) {
      error(state, `Expression ${state.input.slice(exprStart, state.startIndex)} is not assignable`);
    }
    exprStart = state.index;
    result = new Assign(result, parse(state, access, Precedence.Assign));
  }
  if (Precedence.Variadic < minPrecedence) return result;

  /** parseValueConverter
   */
  while (optional(state, Token.Bar)) {
    const name = <string>state.tokenValue;
    nextToken(state);
    const args = new Array<IsAssign>();
    while (optional(state, Token.Colon)) {
      args.push(parse(state, access, Precedence.Assign));
    }
    result = new ValueConverter(result, name, args);
  }

  /** parseBindingBehavior
   */
  while (optional(state, Token.Ampersand)) {
    const name = <string>state.tokenValue;
    nextToken(state);
    const args = new Array<IsAssign>();
    while (optional(state, Token.Colon)) {
      args.push(parse(state, access, Precedence.Assign));
    }
    result = new BindingBehavior(result, name, args);
  }
  if (state.currentToken !== Token.EOF) {
    error(state, `Unconsumed token ${state.tokenRaw}`);
  }
  return result;
}

function nextToken(state: ParserState): void {
  while (state.index < state.length) {
    state.startIndex = state.index;
    if (((<any>state.currentToken) = CharScanners[state.currentChar](state)) !== null) { // a null token means the character must be skipped
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
  while (IdParts[nextChar(state)]) {}

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
      nextChar(state);
    }
    const start = state.index;
    let value = state.currentChar - Char.Zero;
    while (nextChar(state) <= Char.Nine && state.currentChar >= Char.Zero) {
      value = value * 10 + state.currentChar  - Char.Zero;
    }
    state.tokenValue = state.tokenValue + value / 10 ** (state.index - start);
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
      unescaped = unescape(state.currentChar);
      nextChar(state);
      buffer.push(String.fromCharCode(unescaped));
      marker = state.index;
    } else if (state.currentChar === /*EOF*/0) {
      error(state, 'Unterminated quote');
    } else {
      nextChar(state);
    }
  }

  const last = state.input.slice(marker, state.index);
  nextChar(state); // Skip terminating quote.

  // Compute the unescaped string value.
  let unescapedStr = last;

  if (buffer !== null && buffer !== undefined) {
    buffer.push(last);
    unescapedStr = buffer.join('');
  }

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
      result += String.fromCharCode(unescape(nextChar(state)));
    } else {
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
    error(state, 'Unterminated template');
  }
  state.index--;
  return scanTemplate(state);
}

function error(state: ParserState, message: string = `Unexpected token ${state.tokenRaw}`, column: number = state.startIndex): void {
  throw new Error(`Parser Error: ${message} at column ${column} in expression [${state.input}]`);
}

function optional(state: ParserState, token: Token): boolean {
  if (state.currentToken === token) {
    nextToken(state);
    return true;
  }

  return false;
}

function expect(state: ParserState, token: Token): void {
  if (state.currentToken === token) {
    nextToken(state);
  } else {
    error(state, `Missing expected token ${TokenValues[token & Token.Type]}`, state.index);
  }
}

function unescape(code: number): number {
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

const enum Access {
  Reset                   = 0b0000000000000,
  Ancestor                = 0b0000111111111,
  This                    = 0b0001000000000,
  Scope                   = 0b0010000000000,
  Member                  = 0b0100000000000,
  Keyed                   = 0b1000000000000
}
const enum Precedence {
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
  LeftHandSide            = 0b111000000,
  Primary                 = 0b111000001,
  Unary                   = 0b111000010,
}
const enum Token {
  EOF                     = 0b11000000000 << 9,
  ExpressionTerminal      = 0b10000000000 << 9,
  AccessScopeTerminal     = 0b01000000000 << 9,
  ClosingToken            = 0b00100000000 << 9,
  OpeningToken            = 0b00010000000 << 9,
  BinaryOp                = 0b00001000000 << 9,
  UnaryOp                 = 0b00000100000 << 9,
  LeftHandSide            = 0b00000010000 << 9,
  StringOrNumericLiteral  = 0b00000001100 << 9,
  NumericLiteral          = 0b00000001000 << 9,
  StringLiteral           = 0b00000000100 << 9,
  IdentifierName          = 0b00000000011 << 9,
  Keyword                 = 0b00000000010 << 9,
  Identifier              = 0b00000000001 << 9,
  Precedence              = 0b00000000000 << 9 | 0b111 << 6,
  Type                    = 0b00000000000 << 9 | 0b000 << 6 | 0b111111,
  FalseKeyword            = 0b00000000010 << 9 | 0b000 << 6 | 0b000000,
  TrueKeyword             = 0b00000000010 << 9 | 0b000 << 6 | 0b000001,
  NullKeyword             = 0b00000000010 << 9 | 0b000 << 6 | 0b000010,
  UndefinedKeyword        = 0b00000000010 << 9 | 0b000 << 6 | 0b000011,
  ThisScope               = 0b00000000011 << 9 | 0b000 << 6 | 0b000100,
  ParentScope             = 0b00000000011 << 9 | 0b000 << 6 | 0b000101,
  OpenParen               = 0b01010010000 << 9 | 0b000 << 6 | 0b000110,
  OpenBrace               = 0b00010000000 << 9 | 0b000 << 6 | 0b000111,
  Dot                     = 0b00000010000 << 9 | 0b000 << 6 | 0b001000,
  CloseBrace              = 0b11100000000 << 9 | 0b000 << 6 | 0b001001,
  CloseParen              = 0b11100000000 << 9 | 0b000 << 6 | 0b001010,
  Comma                   = 0b01000000000 << 9 | 0b000 << 6 | 0b001011,
  OpenBracket             = 0b01010010000 << 9 | 0b000 << 6 | 0b001100,
  CloseBracket            = 0b10100000000 << 9 | 0b000 << 6 | 0b001101,
  Colon                   = 0b01000000000 << 9 | 0b000 << 6 | 0b001110,
  Question                = 0b00000000000 << 9 | 0b000 << 6 | 0b001111,
  Ampersand               = 0b01000000000 << 9 | 0b000 << 6 | 0b010000,
  Bar                     = 0b01000000000 << 9 | 0b000 << 6 | 0b010011,
  BarBar                  = 0b00001000000 << 9 | 0b010 << 6 | 0b010100,
  AmpersandAmpersand      = 0b00001000000 << 9 | 0b011 << 6 | 0b010101,
  EqualsEquals            = 0b00001000000 << 9 | 0b100 << 6 | 0b010110,
  ExclamationEquals       = 0b00001000000 << 9 | 0b100 << 6 | 0b010111,
  EqualsEqualsEquals      = 0b00001000000 << 9 | 0b100 << 6 | 0b011000,
  ExclamationEqualsEquals = 0b00001000000 << 9 | 0b100 << 6 | 0b011001,
  LessThan                = 0b00001000000 << 9 | 0b101 << 6 | 0b011010,
  GreaterThan             = 0b00001000000 << 9 | 0b101 << 6 | 0b011011,
  LessThanEquals          = 0b00001000000 << 9 | 0b101 << 6 | 0b011100,
  GreaterThanEquals       = 0b00001000000 << 9 | 0b101 << 6 | 0b011101,
  InKeyword               = 0b00001000010 << 9 | 0b101 << 6 | 0b011110,
  InstanceOfKeyword       = 0b00001000010 << 9 | 0b101 << 6 | 0b011111,
  Plus                    = 0b00001100000 << 9 | 0b110 << 6 | 0b100000,
  Minus                   = 0b00001100000 << 9 | 0b110 << 6 | 0b100001,
  TypeofKeyword           = 0b00000100010 << 9 | 0b000 << 6 | 0b100010,
  VoidKeyword             = 0b00000100010 << 9 | 0b000 << 6 | 0b100011,
  Asterisk                = 0b00001000000 << 9 | 0b111 << 6 | 0b100100,
  Percent                 = 0b00001000000 << 9 | 0b111 << 6 | 0b100101,
  Slash                   = 0b00001000000 << 9 | 0b111 << 6 | 0b100110,
  Equals                  = 0b00000000000 << 9 | 0b000 << 6 | 0b100111,
  Exclamation             = 0b00000100000 << 9 | 0b000 << 6 | 0b101000,
  TemplateTail            = 0b00000010000 << 9 | 0b000 << 6 | 0b101001,
  TemplateContinuation    = 0b00000010000 << 9 | 0b000 << 6 | 0b101010,
}

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

const $false = new PrimitiveLiteral(false);
const $true = new PrimitiveLiteral(true);
const $null = new PrimitiveLiteral(null);
const $undefined = new PrimitiveLiteral(undefined);
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
  Token.TemplateTail, Token.TemplateContinuation
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
function decompress(lookup: Array<CharScanner | number> | null, set: Set<number> | null, compressed: number[], value: CharScanner | number | boolean): void {
  const rangeCount = compressed.length;
  for (let i = 0; i < rangeCount; i += 2) {
    const start = compressed[i];
    let end = compressed[i + 1];
    end = end > 0 ? end : start + 1;
    if (lookup) {
      lookup.fill(<CharScanner | number>value, start, end);
    }
    if (set) {
      for (let ch = start; ch < end; ch++) {
        set.add(ch);
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
  error(s, `Unexpected character [${String.fromCharCode(s.currentChar)}]`);
  return null;
};
unexpectedCharacter.notMapped = true;

// ASCII IdentifierPart lookup
const AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);

// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
decompress(<any>IdParts, null, codes.IdStart, 1);
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
