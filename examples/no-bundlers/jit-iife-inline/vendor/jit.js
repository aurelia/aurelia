this.au = this.au || {};
this.au.jit = (function (exports,runtime,kernel) {
  'use strict';

  function register(container) {
      container.registerTransformer(runtime.IExpressionParser, parser => {
          return Object.assign(parser, {
              parseCore(expression, bindingType) {
                  return parse(new ParserState(expression), 0 /* Reset */, 61 /* Variadic */, bindingType);
              }
          });
      });
  }
  /*@internal*/
  class ParserState {
      get tokenRaw() {
          return this.input.slice(this.startIndex, this.index);
      }
      constructor(input) {
          this.index = 0;
          this.startIndex = 0;
          this.lastIndex = 0;
          this.input = input;
          this.length = input.length;
          this.currentToken = 1572864 /* EOF */;
          this.tokenValue = '';
          this.currentChar = input.charCodeAt(0);
          this.assignable = true;
      }
  }
  /*@internal*/
  function parse(state, access, minPrecedence, bindingType) {
      if (state.index === 0) {
          if (bindingType & 2048 /* Interpolation */) {
              return parseInterpolation(state);
          }
          nextToken(state);
          if (state.currentToken & 1048576 /* ExpressionTerminal */) {
              error(state, 'Invalid start of expression');
          }
      }
      let exprStart = state.index;
      state.assignable = 448 /* Binary */ > minPrecedence;
      let result = undefined;
      if (state.currentToken & 32768 /* UnaryOp */) {
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
          const op = TokenValues[state.currentToken & 63 /* Type */];
          nextToken(state);
          result = new runtime.Unary(op, parse(state, access, 449 /* Primary */, bindingType));
      }
      else {
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
              case 3077 /* ParentScope */: // $parent
                  state.assignable = false;
                  do {
                      nextToken(state);
                      access++; // ancestor
                      if (consumeOpt(state, 16392 /* Dot */)) {
                          if (state.currentToken === 16392 /* Dot */) {
                              error(state);
                          }
                          continue;
                      }
                      else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                          result = new runtime.AccessThis(access & 511 /* Ancestor */);
                          access = 512 /* This */;
                          break primary;
                      }
                      else {
                          error(state);
                      }
                  } while (state.currentToken === 3077 /* ParentScope */);
              // falls through
              case 1024 /* Identifier */: // identifier
                  if (bindingType & 512 /* IsIterator */) {
                      result = new runtime.BindingIdentifier(state.tokenValue);
                  }
                  else {
                      result = new runtime.AccessScope(state.tokenValue, access & 511 /* Ancestor */);
                      access = 1024 /* Scope */;
                  }
                  nextToken(state);
                  break;
              case 3076 /* ThisScope */: // $this
                  state.assignable = false;
                  nextToken(state);
                  result = new runtime.AccessThis(0);
                  access = 512 /* This */;
                  break;
              case 671750 /* OpenParen */: // parenthesized expression
                  nextToken(state);
                  result = parse(state, 0 /* Reset */, 63 /* Conditional */, bindingType);
                  consume(state, 1835018 /* CloseParen */);
                  break;
              case 671756 /* OpenBracket */:
                  result = parseArrayLiteralExpression(state, access, bindingType);
                  break;
              case 131079 /* OpenBrace */:
                  result = parseObjectLiteralExpression(state, bindingType);
                  break;
              case 16425 /* TemplateTail */:
                  result = new runtime.Template([state.tokenValue]);
                  state.assignable = false;
                  nextToken(state);
                  break;
              case 16426 /* TemplateContinuation */:
                  result = parseTemplate(state, access, bindingType, result, false);
                  break;
              case 4096 /* StringLiteral */:
              case 8192 /* NumericLiteral */:
                  result = new runtime.PrimitiveLiteral(state.tokenValue);
                  state.assignable = false;
                  nextToken(state);
                  break;
              case 2050 /* NullKeyword */:
              case 2051 /* UndefinedKeyword */:
              case 2049 /* TrueKeyword */:
              case 2048 /* FalseKeyword */:
                  result = TokenValues[state.currentToken & 63 /* Type */];
                  state.assignable = false;
                  nextToken(state);
                  break;
              default:
                  if (state.index >= state.length) {
                      error(state, 'Unexpected end of expression');
                  }
                  else {
                      error(state);
                  }
          }
          if (bindingType & 512 /* IsIterator */) {
              return parseForOfStatement(state, result);
          }
          if (448 /* LeftHandSide */ < minPrecedence)
              return result;
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
          while (state.currentToken & 16384 /* LeftHandSide */) {
              switch (state.currentToken) {
                  case 16392 /* Dot */:
                      state.assignable = true;
                      nextToken(state);
                      if (!(state.currentToken & 3072 /* IdentifierName */)) {
                          error(state);
                      }
                      name = state.tokenValue;
                      nextToken(state);
                      // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                      access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                      if (state.currentToken === 671750 /* OpenParen */) {
                          continue;
                      }
                      if (access & 1024 /* Scope */) {
                          result = new runtime.AccessScope(name, result.ancestor);
                      }
                      else { // if it's not $Scope, it's $Member
                          result = new runtime.AccessMember(result, name);
                      }
                      continue;
                  case 671756 /* OpenBracket */:
                      state.assignable = true;
                      nextToken(state);
                      access = 4096 /* Keyed */;
                      result = new runtime.AccessKeyed(result, parse(state, 0 /* Reset */, 63 /* Conditional */, bindingType));
                      consume(state, 1310733 /* CloseBracket */);
                      break;
                  case 671750 /* OpenParen */:
                      state.assignable = false;
                      nextToken(state);
                      const args = new Array();
                      while (state.currentToken !== 1835018 /* CloseParen */) {
                          args.push(parse(state, 0 /* Reset */, 63 /* Conditional */, bindingType));
                          if (!consumeOpt(state, 524299 /* Comma */)) {
                              break;
                          }
                      }
                      consume(state, 1835018 /* CloseParen */);
                      if (access & 1024 /* Scope */) {
                          result = new runtime.CallScope(name, args, result.ancestor);
                      }
                      else if (access & 2048 /* Member */) {
                          result = new runtime.CallMember(result, name, args);
                      }
                      else {
                          result = new runtime.CallFunction(result, args);
                      }
                      access = 0;
                      break;
                  case 16425 /* TemplateTail */:
                      state.assignable = false;
                      result = new runtime.TaggedTemplate([state.tokenValue], [state.tokenRaw], result);
                      nextToken(state);
                      break;
                  case 16426 /* TemplateContinuation */:
                      result = parseTemplate(state, access, bindingType, result, true);
                  default:
              }
          }
      }
      if (448 /* Binary */ < minPrecedence)
          return result;
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
      while (state.currentToken & 65536 /* BinaryOp */) {
          const opToken = state.currentToken;
          if ((opToken & 448 /* Precedence */) < minPrecedence) {
              break;
          }
          nextToken(state);
          result = new runtime.Binary(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
          state.assignable = false;
      }
      if (63 /* Conditional */ < minPrecedence)
          return result;
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
      if (consumeOpt(state, 15 /* Question */)) {
          const yes = parse(state, access, 62 /* Assign */, bindingType);
          consume(state, 524302 /* Colon */);
          result = new runtime.Conditional(result, yes, parse(state, access, 62 /* Assign */, bindingType));
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
      if (consumeOpt(state, 39 /* Equals */)) {
          if (!state.assignable) {
              error(state, `Expression ${state.input.slice(exprStart, state.startIndex)} is not assignable`);
          }
          exprStart = state.index;
          result = new runtime.Assign(result, parse(state, access, 62 /* Assign */, bindingType));
      }
      if (61 /* Variadic */ < minPrecedence)
          return result;
      /** parseValueConverter
       */
      while (consumeOpt(state, 524307 /* Bar */)) {
          const name = state.tokenValue;
          nextToken(state);
          const args = new Array();
          while (consumeOpt(state, 524302 /* Colon */)) {
              args.push(parse(state, access, 62 /* Assign */, bindingType));
          }
          result = new runtime.ValueConverter(result, name, args);
      }
      /** parseBindingBehavior
       */
      while (consumeOpt(state, 524304 /* Ampersand */)) {
          const name = state.tokenValue;
          nextToken(state);
          const args = new Array();
          while (consumeOpt(state, 524302 /* Colon */)) {
              args.push(parse(state, access, 62 /* Assign */, bindingType));
          }
          result = new runtime.BindingBehavior(result, name, args);
      }
      if (state.currentToken !== 1572864 /* EOF */) {
          if (bindingType & 2048 /* Interpolation */) {
              return result;
          }
          error(state, `Unconsumed token ${state.tokenRaw}`);
      }
      return result;
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
  function parseArrayLiteralExpression(state, access, bindingType) {
      nextToken(state);
      const elements = new Array();
      while (state.currentToken !== 1310733 /* CloseBracket */) {
          if (consumeOpt(state, 524299 /* Comma */)) {
              elements.push($undefined);
              if (state.currentToken === 1310733 /* CloseBracket */) {
                  elements.push($undefined);
                  break;
              }
          }
          else {
              elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
              if (!consumeOpt(state, 524299 /* Comma */)) {
                  break;
              }
          }
      }
      consume(state, 1310733 /* CloseBracket */);
      if (bindingType & 512 /* IsIterator */) {
          return new runtime.ArrayBindingPattern(elements);
      }
      else {
          state.assignable = false;
          return new runtime.ArrayLiteral(elements);
      }
  }
  function parseForOfStatement(state, result) {
      if (!(result.$kind & 4096 /* IsForDeclaration */)) {
          error(state, 'Invalid ForDeclaration');
      }
      consume(state, 2603 /* OfKeyword */);
      const declaration = result;
      const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
      return new runtime.ForOfStatement(declaration, statement);
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
  function parseObjectLiteralExpression(state, bindingType) {
      const keys = new Array();
      const values = new Array();
      nextToken(state);
      while (state.currentToken !== 1835017 /* CloseBrace */) {
          keys.push(state.tokenValue);
          // Literal = mandatory colon
          if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
              nextToken(state);
              consume(state, 524302 /* Colon */);
              values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
          }
          else if (state.currentToken & 3072 /* IdentifierName */) {
              // IdentifierName = optional colon
              const { currentChar, currentToken, index } = state;
              nextToken(state);
              if (consumeOpt(state, 524302 /* Colon */)) {
                  values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
              }
              else {
                  // Shorthand
                  state.currentChar = currentChar;
                  state.currentToken = currentToken;
                  state.index = index;
                  values.push(parse(state, 0 /* Reset */, 449 /* Primary */, bindingType & ~512 /* IsIterator */));
              }
          }
          else {
              error(state);
          }
          if (state.currentToken !== 1835017 /* CloseBrace */) {
              consume(state, 524299 /* Comma */);
          }
      }
      consume(state, 1835017 /* CloseBrace */);
      if (bindingType & 512 /* IsIterator */) {
          return new runtime.ObjectBindingPattern(keys, values);
      }
      else {
          state.assignable = false;
          return new runtime.ObjectLiteral(keys, values);
      }
  }
  function parseInterpolation(state) {
      const parts = [];
      const expressions = [];
      const length = state.length;
      let result = '';
      while (state.index < length) {
          switch (state.currentChar) {
              case 36 /* Dollar */:
                  if (state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                      parts.push(result);
                      result = '';
                      state.index += 2;
                      state.currentChar = state.input.charCodeAt(state.index);
                      nextToken(state);
                      const expression = parse(state, 0 /* Reset */, 61 /* Variadic */, 2048 /* Interpolation */);
                      expressions.push(expression);
                      continue;
                  }
                  else {
                      result += '$';
                  }
                  break;
              case 92 /* Backslash */:
                  result += String.fromCharCode(unescape(nextChar(state)));
                  break;
              default:
                  result += String.fromCharCode(state.currentChar);
          }
          if (state.index >= length) {
              break;
          }
          nextChar(state);
      }
      if (expressions.length) {
          parts.push(result);
          return new runtime.Interpolation(parts, expressions);
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
  function parseTemplate(state, access, bindingType, result, tagged) {
      const cooked = [state.tokenValue];
      const raw = [state.tokenRaw];
      consume(state, 16426 /* TemplateContinuation */);
      const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
      while ((state.currentToken = scanTemplateTail(state)) !== 16425 /* TemplateTail */) {
          cooked.push(state.tokenValue);
          if (tagged) {
              raw.push(state.tokenRaw);
          }
          consume(state, 16426 /* TemplateContinuation */);
          expressions.push(parse(state, access, 62 /* Assign */, bindingType));
      }
      cooked.push(state.tokenValue);
      state.assignable = false;
      if (tagged) {
          raw.push(state.tokenRaw);
          nextToken(state);
          return new runtime.TaggedTemplate(cooked, raw, result, expressions);
      }
      else {
          nextToken(state);
          return new runtime.Template(cooked, expressions);
      }
  }
  function nextToken(state) {
      while (state.index < state.length) {
          state.startIndex = state.index;
          if ((state.currentToken = CharScanners[state.currentChar](state)) !== null) { // a null token means the character must be skipped
              return;
          }
      }
      state.currentToken = 1572864 /* EOF */;
  }
  function nextChar(state) {
      return state.currentChar = state.input.charCodeAt(++state.index);
  }
  function scanIdentifier(state) {
      // run to the next non-idPart
      while (IdParts[nextChar(state)]) { }
      return KeywordLookup[state.tokenValue = state.tokenRaw] || 1024 /* Identifier */;
  }
  function scanNumber(state, isFloat) {
      if (isFloat) {
          state.tokenValue = 0;
      }
      else {
          state.tokenValue = state.currentChar - 48 /* Zero */;
          while (nextChar(state) <= 57 /* Nine */ && state.currentChar >= 48 /* Zero */) {
              state.tokenValue = state.tokenValue * 10 + state.currentChar - 48 /* Zero */;
          }
      }
      if (isFloat || state.currentChar === 46 /* Dot */) {
          // isFloat (coming from the period scanner) means the period was already skipped
          if (!isFloat) {
              nextChar(state);
          }
          const start = state.index;
          let value = state.currentChar - 48 /* Zero */;
          while (nextChar(state) <= 57 /* Nine */ && state.currentChar >= 48 /* Zero */) {
              value = value * 10 + state.currentChar - 48 /* Zero */;
          }
          state.tokenValue = state.tokenValue + value / 10 ** (state.index - start);
      }
      return 8192 /* NumericLiteral */;
  }
  function scanString(state) {
      const quote = state.currentChar;
      nextChar(state); // Skip initial quote.
      let unescaped = 0;
      const buffer = new Array();
      let marker = state.index;
      while (state.currentChar !== quote) {
          if (state.currentChar === 92 /* Backslash */) {
              buffer.push(state.input.slice(marker, state.index));
              nextChar(state);
              unescaped = unescape(state.currentChar);
              nextChar(state);
              buffer.push(String.fromCharCode(unescaped));
              marker = state.index;
          }
          else if (state.currentChar === /*EOF*/ 0) {
              error(state, 'Unterminated quote');
          }
          else {
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
      return 4096 /* StringLiteral */;
  }
  function scanTemplate(state) {
      let tail = true;
      let result = '';
      while (nextChar(state) !== 96 /* Backtick */) {
          if (state.currentChar === 36 /* Dollar */) {
              if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                  state.index++;
                  tail = false;
                  break;
              }
              else {
                  result += '$';
              }
          }
          else if (state.currentChar === 92 /* Backslash */) {
              result += String.fromCharCode(unescape(nextChar(state)));
          }
          else {
              result += String.fromCharCode(state.currentChar);
          }
      }
      nextChar(state);
      state.tokenValue = result;
      if (tail) {
          return 16425 /* TemplateTail */;
      }
      return 16426 /* TemplateContinuation */;
  }
  function scanTemplateTail(state) {
      if (state.index >= state.length) {
          error(state, 'Unterminated template');
      }
      state.index--;
      return scanTemplate(state);
  }
  function error(state, message = `Unexpected token ${state.tokenRaw}`, column = state.startIndex) {
      throw new Error(`Parser Error: ${message} at column ${column} in expression [${state.input}]`);
  }
  function consumeOpt(state, token) {
      if (state.currentToken === token) {
          nextToken(state);
          return true;
      }
      return false;
  }
  function consume(state, token) {
      if (state.currentToken === token) {
          nextToken(state);
      }
      else {
          error(state, `Missing expected token ${TokenValues[token & 63 /* Type */]}`, state.index);
      }
  }
  function unescape(code) {
      switch (code) {
          case 98 /* LowerB */: return 8 /* Backspace */;
          case 116 /* LowerT */: return 9 /* Tab */;
          case 110 /* LowerN */: return 10 /* LineFeed */;
          case 118 /* LowerV */: return 11 /* VerticalTab */;
          case 102 /* LowerF */: return 12 /* FormFeed */;
          case 114 /* LowerR */: return 13 /* CarriageReturn */;
          case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
          case 39 /* SingleQuote */: return 39 /* SingleQuote */;
          case 92 /* Backslash */: return 92 /* Backslash */;
          default: return code;
      }
  }
  const $false = new runtime.PrimitiveLiteral(false);
  const $true = new runtime.PrimitiveLiteral(true);
  const $null = new runtime.PrimitiveLiteral(null);
  const $undefined = new runtime.PrimitiveLiteral(undefined);
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
      16425 /* TemplateTail */, 16426 /* TemplateContinuation */,
      'of'
  ];
  const KeywordLookup = Object.create(null);
  KeywordLookup.true = 2049 /* TrueKeyword */;
  KeywordLookup.null = 2050 /* NullKeyword */;
  KeywordLookup.false = 2048 /* FalseKeyword */;
  KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
  KeywordLookup.$this = 3076 /* ThisScope */;
  KeywordLookup.$parent = 3077 /* ParentScope */;
  KeywordLookup.in = 67934 /* InKeyword */;
  KeywordLookup.instanceof = 67935 /* InstanceOfKeyword */;
  KeywordLookup.typeof = 34850 /* TypeofKeyword */;
  KeywordLookup.void = 34851 /* VoidKeyword */;
  KeywordLookup.of = 2603 /* OfKeyword */;
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
      IdStart: /*IdentifierStart*/ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
      Digit: /*DecimalNumber*/ [0x30, 0x3A],
      Skip: /*Skippable*/ [0, 0x21, 0x7F, 0xA1]
  };
  /**
   * Decompress the ranges into an array of numbers so that the char code
   * can be used as an index to the lookup
   */
  function decompress(lookup, set, compressed, value) {
      const rangeCount = compressed.length;
      for (let i = 0; i < rangeCount; i += 2) {
          const start = compressed[i];
          let end = compressed[i + 1];
          end = end > 0 ? end : start + 1;
          if (lookup) {
              lookup.fill(value, start, end);
          }
          if (set) {
              for (let ch = start; ch < end; ch++) {
                  set.add(ch);
              }
          }
      }
  }
  // CharFuncLookup functions
  function returnToken(token) {
      return s => {
          nextChar(s);
          return token;
      };
  }
  const unexpectedCharacter = s => {
      error(s, `Unexpected character [${String.fromCharCode(s.currentChar)}]`);
      return null;
  };
  unexpectedCharacter.notMapped = true;
  // ASCII IdentifierPart lookup
  const AsciiIdParts = new Set();
  decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
  // IdentifierPart lookup
  const IdParts = new Uint8Array(0xFFFF);
  decompress(IdParts, null, codes.IdStart, 1);
  decompress(IdParts, null, codes.Digit, 1);
  // Character scanning function lookup
  const CharScanners = new Array(0xFFFF);
  CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
  decompress(CharScanners, null, codes.Skip, s => {
      nextChar(s);
      return null;
  });
  decompress(CharScanners, null, codes.IdStart, scanIdentifier);
  decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));
  CharScanners[34 /* DoubleQuote */] =
      CharScanners[39 /* SingleQuote */] = s => {
          return scanString(s);
      };
  CharScanners[96 /* Backtick */] = s => {
      return scanTemplate(s);
  };
  // !, !=, !==
  CharScanners[33 /* Exclamation */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 32808 /* Exclamation */;
      }
      if (nextChar(s) !== 61 /* Equals */) {
          return 65815 /* ExclamationEquals */;
      }
      nextChar(s);
      return 65817 /* ExclamationEqualsEquals */;
  };
  // =, ==, ===
  CharScanners[61 /* Equals */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 39 /* Equals */;
      }
      if (nextChar(s) !== 61 /* Equals */) {
          return 65814 /* EqualsEquals */;
      }
      nextChar(s);
      return 65816 /* EqualsEqualsEquals */;
  };
  // &, &&
  CharScanners[38 /* Ampersand */] = s => {
      if (nextChar(s) !== 38 /* Ampersand */) {
          return 524304 /* Ampersand */;
      }
      nextChar(s);
      return 65749 /* AmpersandAmpersand */;
  };
  // |, ||
  CharScanners[124 /* Bar */] = s => {
      if (nextChar(s) !== 124 /* Bar */) {
          return 524307 /* Bar */;
      }
      nextChar(s);
      return 65684 /* BarBar */;
  };
  // .
  CharScanners[46 /* Dot */] = s => {
      if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
          return scanNumber(s, true);
      }
      return 16392 /* Dot */;
  };
  // <, <=
  CharScanners[60 /* LessThan */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 65882 /* LessThan */;
      }
      nextChar(s);
      return 65884 /* LessThanEquals */;
  };
  // >, >=
  CharScanners[62 /* GreaterThan */] = s => {
      if (nextChar(s) !== 61 /* Equals */) {
          return 65883 /* GreaterThan */;
      }
      nextChar(s);
      return 65885 /* GreaterThanEquals */;
  };
  CharScanners[37 /* Percent */] = returnToken(66021 /* Percent */);
  CharScanners[40 /* OpenParen */] = returnToken(671750 /* OpenParen */);
  CharScanners[41 /* CloseParen */] = returnToken(1835018 /* CloseParen */);
  CharScanners[42 /* Asterisk */] = returnToken(66020 /* Asterisk */);
  CharScanners[43 /* Plus */] = returnToken(98720 /* Plus */);
  CharScanners[44 /* Comma */] = returnToken(524299 /* Comma */);
  CharScanners[45 /* Minus */] = returnToken(98721 /* Minus */);
  CharScanners[47 /* Slash */] = returnToken(66022 /* Slash */);
  CharScanners[58 /* Colon */] = returnToken(524302 /* Colon */);
  CharScanners[63 /* Question */] = returnToken(15 /* Question */);
  CharScanners[91 /* OpenBracket */] = returnToken(671756 /* OpenBracket */);
  CharScanners[93 /* CloseBracket */] = returnToken(1310733 /* CloseBracket */);
  CharScanners[123 /* OpenBrace */] = returnToken(131079 /* OpenBrace */);
  CharScanners[125 /* CloseBrace */] = returnToken(1835017 /* CloseBrace */);

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  // tslint:disable:no-inner-html
  const domParser = runtime.DOM.createElement('div');
  const marker = runtime.DOM.createElement('au-marker');
  marker.classList.add('au');
  const createMarker = marker.cloneNode.bind(marker, false);
  /*@internal*/
  function resolveTarget(target, element, attribute) {
      // give custom attributes priority over custom element properties (is this correct? should we throw if there's a conflict?)
      if (attribute !== null) {
          // only consider semicolon-separated bindings for normal custom attributes, not template controllers
          if (attribute.isTemplateController === false) {
              // users must not have a semicolon-separated binding with the same name as the attribute; behavior would be unpredictable
              if (target !== attribute.name) {
                  const propertyName = kernel.PLATFORM.camelCase(target);
                  const bindable = attribute.bindables[propertyName];
                  if (bindable !== null) {
                      return bindable.property || propertyName;
                  }
                  return target;
              }
          }
          const bindableNames = Object.keys(attribute.bindables);
          if (bindableNames.length) {
              // return the first by convention (usually there should only be one)
              return bindableNames[0];
          }
          // if there are no bindables declared, default to 'value'
          return 'value';
      }
      if (element !== null) {
          const propertyName = kernel.PLATFORM.camelCase(target);
          const bindable = element.bindables[propertyName];
          if (bindable) {
              return bindable.property || propertyName;
          }
      }
      return target;
  }
  const attributeInspectionBuffer = Array(3);
  /*@internal*/
  function inspectAttribute(name, resources) {
      let targetName = name;
      let bindingCommand$$1 = null;
      for (let i = 0, ii = name.length; i < ii; ++i) {
          if (name.charCodeAt(i) === 46 /* Dot */) {
              // set the targetName to only the part that comes before the first dot
              if (name === targetName) {
                  targetName = name.slice(0, i);
              }
              const commandName = name.slice(i + 1);
              bindingCommand$$1 = resources.create(BindingCommandResource, commandName) || null;
              if (bindingCommand$$1 !== null) {
                  // keep looping until the part after any dot (doesn't have to be the first/last) is a bindingCommand
                  break;
              }
          }
      }
      const attributeDefinition = resources.find(runtime.CustomAttributeResource, targetName) || null;
      attributeInspectionBuffer[0] = targetName;
      attributeInspectionBuffer[1] = attributeDefinition;
      attributeInspectionBuffer[2] = bindingCommand$$1;
      return attributeInspectionBuffer;
  }
  exports.TemplateCompiler = class TemplateCompiler {
      constructor(parser) {
          this.parser = parser;
      }
      get name() {
          return 'default';
      }
      compile(definition, resources, flags) {
          let node = definition.templateOrNode;
          if (typeof node === 'string') {
              domParser.innerHTML = node;
              node = definition.templateOrNode = domParser.firstElementChild;
          }
          const rootNode = node;
          const isTemplate = node.nodeName === 'TEMPLATE';
          // Parent node is required for remove / replace operation incase node is the direct child of document fragment
          const parentNode = node = isTemplate ? node.content : node;
          while (node = this.compileNode(node, parentNode, definition, definition.instructions, resources)) { /* Do nothing */ }
          // ideally the flag should be passed correctly from rendering engine
          if (isTemplate && (flags & runtime.ViewCompileFlags.surrogate)) {
              this.compileSurrogate(rootNode, definition.surrogates, resources);
          }
          return definition;
      }
      /*@internal*/
      compileNode(node, parentNode, definition, instructions, resources) {
          const nextSibling = node.nextSibling;
          switch (node.nodeType) {
              case 1 /* Element */:
                  this.compileElementNode(node, parentNode, definition, instructions, resources);
                  return nextSibling;
              case 3 /* Text */:
                  if (!this.compileTextNode(node, instructions)) {
                      while ((node = node.nextSibling) && node.nodeType === 3 /* Text */) { /* Do nothing */ }
                      return node;
                  }
                  return nextSibling;
              case 8 /* Comment */:
                  return nextSibling;
              case 9 /* Document */:
                  return node.firstChild;
              case 10 /* DocumentType */:
                  return nextSibling;
              case 11 /* DocumentFragment */:
                  return node.firstChild;
          }
      }
      /*@internal*/
      compileSurrogate(node, surrogateInstructions, resources) {
          const attributes = node.attributes;
          for (let i = 0, ii = attributes.length; i < ii; ++i) {
              const attr = attributes.item(i);
              const { name, value } = attr;
              const [target, attribute, command] = inspectAttribute(name, resources);
              if (attribute && attribute.isTemplateController) {
                  throw new Error('Cannot have template controller on surrogate element.');
              }
              const instruction = this.compileAttribute(target, value, node, attribute, null, command);
              if (instruction !== null) {
                  surrogateInstructions.push(instruction);
              }
              else {
                  let attrInst;
                  // Doesn't make sense for these properties as they need to be unique
                  if (name !== 'id' && name !== 'part' && name !== 'replace-part') {
                      switch (name) {
                          // TODO: handle simple surrogate style attribute
                          case 'style':
                              attrInst = new SetAttributeInstruction(value, name);
                              break;
                          default:
                              attrInst = new SetAttributeInstruction(value, name);
                      }
                      surrogateInstructions.push(attrInst);
                  }
                  else {
                      throw new Error(`Invalid surrogate attribute: ${name}`);
                  }
              }
          }
      }
      /*@internal*/
      compileElementNode(node, parentNode, definition, instructions, resources) {
          const tagName = node.tagName;
          if (tagName === 'SLOT') {
              definition.hasSlots = true;
              return;
          }
          else if (tagName === 'LET') {
              const letElementInstruction = this.compileLetElement(node, resources);
              instructions.push([letElementInstruction]);
              // theoretically there's no need to replace, but to keep it consistent
              runtime.DOM.replaceNode(createMarker(), node);
              return;
          }
          // if there is a custom element or template controller, then the attribute instructions become children
          // of the hydrate instruction, otherwise they are added directly to instructions as a single array
          const attributeInstructions = [];
          const tagResourceKey = (node.getAttribute('as-element') || tagName).toLowerCase();
          const element = resources.find(runtime.CustomElementResource, tagResourceKey) || null;
          const attributes = node.attributes;
          for (let i = 0, ii = attributes.length; i < ii; ++i) {
              const attr = attributes.item(i);
              const { name, value } = attr;
              const [target, attribute, command] = inspectAttribute(name, resources);
              if (attribute !== null) {
                  if (attribute.isTemplateController) {
                      node.removeAttributeNode(attr);
                      let instruction = this.compileAttribute(target, value, node, attribute, element, command);
                      // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
                      if (instruction.type !== "k" /* hydrateTemplateController */) {
                          const src = {
                              name: attribute.name,
                              templateOrNode: node,
                              instructions: []
                          };
                          instruction = new HydrateTemplateController(src, target, [instruction], attribute.name === 'else');
                      }
                      (node.parentNode || parentNode).replaceChild(createMarker(), node);
                      const template = runtime.DOM.createTemplate();
                      template.content.appendChild(node);
                      instruction.src.templateOrNode = template;
                      instruction.instructions.push(...attributeInstructions);
                      this.compile(instruction.src, resources);
                      instructions.push([instruction]);
                      return;
                  }
                  else {
                      const childInstructions = [];
                      const bindings = value.split(';');
                      // TODO: improve this
                      if (bindings.length > 1) {
                          for (let i = 0, ii = bindings.length; i < ii; ++i) {
                              const binding = bindings[i];
                              const parts = binding.split(':');
                              const [childTarget, , childCommand] = inspectAttribute(parts[0].trim(), resources);
                              childInstructions.push(this.compileAttribute(childTarget, parts[1].trim(), node, attribute, element, childCommand));
                          }
                      }
                      else {
                          childInstructions.push(this.compileAttribute(target, value, node, attribute, element, command));
                      }
                      attributeInstructions.push(new HydrateAttributeInstruction(target, childInstructions));
                  }
              }
              else {
                  const instruction = this.compileAttribute(target, value, node, attribute, element, command);
                  if (instruction !== null) {
                      attributeInstructions.push(instruction);
                  }
              }
          }
          // no template controller; see if there's a custom element
          if (element) {
              // custom element takes the attributes as children
              instructions.push([new HydrateElementInstruction(tagResourceKey, attributeInstructions)]);
              node.classList.add('au');
          }
          else if (attributeInstructions.length) {
              // no custom element or template controller, add the attributes directly
              instructions.push(attributeInstructions);
              node.classList.add('au');
          }
          const current = node;
          let currentChild = node.firstChild;
          while (currentChild) {
              currentChild = this.compileNode(currentChild, current, definition, instructions, resources);
          }
      }
      compileLetElement(node, resources) {
          const letInstructions = [];
          const attributes = node.attributes;
          // ToViewModel flag needs to be determined in advance
          // before compiling any attribute
          const toViewModel = node.hasAttribute('to-view-model');
          node.removeAttribute('to-view-model');
          for (let i = 0, ii = attributes.length; ii > i; ++i) {
              const attr = attributes.item(i);
              const { name, value } = attr;
              let [target, , command] = inspectAttribute(name, resources);
              target = kernel.PLATFORM.camelCase(target);
              let letInstruction;
              if (!command) {
                  const expression = this.parser.parse(value, 2048 /* Interpolation */);
                  if (expression === null) {
                      // Should just be a warning, but throw for now
                      throw new Error(`Invalid let binding. String liternal given for attribute: ${target}`);
                  }
                  letInstruction = new LetBindingInstruction(expression, target);
              }
              else if (command === null) {
                  // TODO: this does work well with no built in command spirit
                  throw new Error('Only bind command supported for "let" element.');
              }
              else {
                  letInstruction = new LetBindingInstruction(value, target);
              }
              letInstructions.push(letInstruction);
          }
          return new LetElementInstruction(letInstructions, toViewModel);
      }
      /*@internal*/
      compileTextNode(node, instructions) {
          const expression = this.parser.parse(node.wholeText, 2048 /* Interpolation */);
          if (expression === null) {
              return false;
          }
          node.parentNode.insertBefore(createMarker(), node);
          node.textContent = ' ';
          while (node.nextSibling && node.nextSibling.nodeType === 3 /* Text */) {
              node.parentNode.removeChild(node.nextSibling);
          }
          instructions.push([new TextBindingInstruction(expression)]);
          return true;
      }
      /*@internal*/
      compileAttribute(target, value, node, attribute, element, command) {
          // binding commands get priority over all; they may override default behaviors
          // it is the responsibility of the implementor to ensure they filter out stuff they shouldn't override
          if (command !== null && command.handles(attribute)) {
              return command.compile(target, value, node, attribute, element);
          }
          // simple path for ref binding
          const parser = this.parser;
          if (target === 'ref') {
              return new RefBindingInstruction(parser.parse(value, 1280 /* IsRef */));
          }
          // simple path for style bindings (TODO: this doesnt work, but we need to use StylePropertyBindingInstruction right?)
          // if (target === 'style' || target === 'css') {
          //   const expression = parser.parse(value, BindingType.Interpolation);
          //   if (expression === null) {
          //     return null;
          //   }
          //   return new StylePropertyBindingInstruction(expression, target);
          // }
          // plain custom attribute on any kind of element
          if (attribute !== null) {
              target = resolveTarget(target, element, attribute);
              value = value && value.length ? value : '""';
              const expression = parser.parse(value, 2048 /* Interpolation */) || parser.parse(value, 50 /* ToViewCommand */);
              if (attribute.defaultBindingMode) {
                  switch (attribute.defaultBindingMode) {
                      case runtime.BindingMode.oneTime:
                          return new OneTimeBindingInstruction(expression, target);
                      case runtime.BindingMode.fromView:
                          return new FromViewBindingInstruction(expression, target);
                      case runtime.BindingMode.twoWay:
                          return new TwoWayBindingInstruction(expression, target);
                      case runtime.BindingMode.toView:
                      default:
                          return new ToViewBindingInstruction(expression, target);
                  }
              }
              return new ToViewBindingInstruction(expression, target);
          }
          // plain attribute on a custom element
          if (element !== null) {
              target = resolveTarget(target, element, attribute);
              const expression = parser.parse(value, 2048 /* Interpolation */);
              if (expression === null) {
                  // no interpolation -> make it a setProperty on the component
                  return new SetPropertyInstruction(value, target);
              }
              // interpolation -> behave like toView (e.g. foo="${someProp}")
              return new ToViewBindingInstruction(expression, target);
          }
          // plain attribute on a normal element
          const expression = parser.parse(value, 2048 /* Interpolation */);
          if (expression === null) {
              // no interpolation -> do not return an instruction
              return null;
          }
          // interpolation -> behave like toView (e.g. id="${someId}")
          return new ToViewBindingInstruction(expression, target);
      }
  };
  exports.TemplateCompiler = __decorate([
      kernel.inject(runtime.IExpressionParser)
  ], exports.TemplateCompiler);
  // tslint:disable:no-reserved-keywords
  // tslint:disable:no-any
  class TextBindingInstruction {
      constructor(srcOrExpr) {
          this.srcOrExpr = srcOrExpr;
      }
  }
  class OneTimeBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class ToViewBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class FromViewBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class TwoWayBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class TriggerBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class DelegateBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class CaptureBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class CallBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class RefBindingInstruction {
      constructor(srcOrExpr) {
          this.srcOrExpr = srcOrExpr;
      }
  }
  class StylePropertyBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  class SetPropertyInstruction {
      constructor(value, dest) {
          this.value = value;
          this.dest = dest;
      }
  }
  class SetAttributeInstruction {
      constructor(value, dest) {
          this.value = value;
          this.dest = dest;
      }
  }
  class HydrateElementInstruction {
      constructor(res, instructions, parts, contentOverride) {
          this.res = res;
          this.instructions = instructions;
          this.parts = parts;
          this.contentOverride = contentOverride;
      }
  }
  class HydrateAttributeInstruction {
      constructor(res, instructions) {
          this.res = res;
          this.instructions = instructions;
      }
  }
  class HydrateTemplateController {
      constructor(src, res, instructions, link) {
          this.src = src;
          this.res = res;
          this.instructions = instructions;
          this.link = link;
      }
  }
  class LetElementInstruction {
      constructor(instructions, toViewModel) {
          this.instructions = instructions;
          this.toViewModel = toViewModel;
      }
  }
  class LetBindingInstruction {
      constructor(srcOrExpr, dest) {
          this.srcOrExpr = srcOrExpr;
          this.dest = dest;
      }
  }
  // tslint:enable:no-reserved-keywords
  // See ast.ts (at the bottom) for an explanation of what/why
  TextBindingInstruction.prototype.type = "a" /* textBinding */;
  OneTimeBindingInstruction.prototype.type = "b" /* propertyBinding */;
  OneTimeBindingInstruction.prototype.mode = runtime.BindingMode.oneTime;
  OneTimeBindingInstruction.prototype.oneTime = true;
  ToViewBindingInstruction.prototype.type = "b" /* propertyBinding */;
  ToViewBindingInstruction.prototype.mode = runtime.BindingMode.toView;
  ToViewBindingInstruction.prototype.oneTime = false;
  FromViewBindingInstruction.prototype.type = "b" /* propertyBinding */;
  FromViewBindingInstruction.prototype.mode = runtime.BindingMode.fromView;
  FromViewBindingInstruction.prototype.oneTime = false;
  TwoWayBindingInstruction.prototype.type = "b" /* propertyBinding */;
  TwoWayBindingInstruction.prototype.mode = runtime.BindingMode.twoWay;
  TwoWayBindingInstruction.prototype.oneTime = false;
  TriggerBindingInstruction.prototype.type = "c" /* listenerBinding */;
  TriggerBindingInstruction.prototype.strategy = runtime.DelegationStrategy.none;
  TriggerBindingInstruction.prototype.preventDefault = true;
  CaptureBindingInstruction.prototype.type = "c" /* listenerBinding */;
  CaptureBindingInstruction.prototype.strategy = runtime.DelegationStrategy.capturing;
  CaptureBindingInstruction.prototype.preventDefault = false;
  DelegateBindingInstruction.prototype.type = "c" /* listenerBinding */;
  DelegateBindingInstruction.prototype.strategy = runtime.DelegationStrategy.bubbling;
  DelegateBindingInstruction.prototype.preventDefault = false;
  CallBindingInstruction.prototype.type = "d" /* callBinding */;
  RefBindingInstruction.prototype.type = "e" /* refBinding */;
  StylePropertyBindingInstruction.prototype.type = "f" /* stylePropertyBinding */;
  SetPropertyInstruction.prototype.type = "g" /* setProperty */;
  SetAttributeInstruction.prototype.type = "h" /* setAttribute */;
  HydrateElementInstruction.prototype.type = "i" /* hydrateElement */;
  HydrateAttributeInstruction.prototype.type = "j" /* hydrateAttribute */;
  HydrateTemplateController.prototype.type = "k" /* hydrateTemplateController */;
  LetElementInstruction.prototype.type = "l" /* letElement */;
  LetBindingInstruction.prototype.type = "m" /* letBinding */;
  // tslint:enable:no-reserved-keywords
  // tslint:enable:no-any

  function bindingCommand(nameOrSource) {
      return function (target) {
          return BindingCommandResource.define(nameOrSource, target);
      };
  }
  const BindingCommandResource = {
      name: 'binding-command',
      keyFrom(name) {
          return `${this.name}:${name}`;
      },
      isType(type) {
          return type.kind === this;
      },
      define(nameOrSource, ctor) {
          const description = typeof nameOrSource === 'string' ? { name: nameOrSource, target: null } : nameOrSource;
          const Type = ctor;
          Type.kind = BindingCommandResource;
          Type.description = description;
          Type.register = function (container) {
              container.register(kernel.Registration.singleton(Type.kind.keyFrom(description.name), Type));
          };
          const proto = Type.prototype;
          proto.handles = proto.handles || defaultHandles;
          return Type;
      }
  };
  function defaultHandles(attributeDefinition) {
      return !attributeDefinition || attributeDefinition.isTemplateController === false;
  }
  exports.DefaultBindingCommand = class DefaultBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          let mode = runtime.BindingMode.toView;
          if (element) {
              target = resolveTarget(target, element, attribute);
              const bindable = element.bindables[target];
              if (bindable && bindable.mode && bindable.mode !== runtime.BindingMode.default) {
                  mode = bindable.mode;
              }
          }
          switch (mode) {
              case runtime.BindingMode.oneTime:
                  return new OneTimeBindingInstruction(this.parser.parse(value, 49 /* OneTimeCommand */), target);
              case runtime.BindingMode.toView:
                  return new ToViewBindingInstruction(this.parser.parse(value, 50 /* ToViewCommand */), target);
              case runtime.BindingMode.fromView:
                  return new FromViewBindingInstruction(this.parser.parse(value, 51 /* FromViewCommand */), target);
              case runtime.BindingMode.twoWay:
                  return new TwoWayBindingInstruction(this.parser.parse(value, 52 /* TwoWayCommand */), target);
          }
      }
  };
  exports.DefaultBindingCommand.inject = [runtime.IExpressionParser];
  exports.DefaultBindingCommand = __decorate([
      bindingCommand('bind')
  ], exports.DefaultBindingCommand);
  exports.OneTimeBindingCommand = class OneTimeBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new OneTimeBindingInstruction(this.parser.parse(value, 49 /* OneTimeCommand */), resolveTarget(target, element, attribute));
      }
  };
  exports.OneTimeBindingCommand.inject = [runtime.IExpressionParser];
  exports.OneTimeBindingCommand = __decorate([
      bindingCommand('one-time')
  ], exports.OneTimeBindingCommand);
  exports.ToViewBindingCommand = class ToViewBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new ToViewBindingInstruction(this.parser.parse(value, 50 /* ToViewCommand */), resolveTarget(target, element, attribute));
      }
  };
  exports.ToViewBindingCommand.inject = [runtime.IExpressionParser];
  exports.ToViewBindingCommand = __decorate([
      bindingCommand('to-view')
  ], exports.ToViewBindingCommand);
  exports.FromViewBindingCommand = class FromViewBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new FromViewBindingInstruction(this.parser.parse(value, 51 /* FromViewCommand */), resolveTarget(target, element, attribute));
      }
  };
  exports.FromViewBindingCommand.inject = [runtime.IExpressionParser];
  exports.FromViewBindingCommand = __decorate([
      bindingCommand('from-view')
  ], exports.FromViewBindingCommand);
  exports.TwoWayBindingCommand = class TwoWayBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new TwoWayBindingInstruction(this.parser.parse(value, 52 /* TwoWayCommand */), resolveTarget(target, element, attribute));
      }
  };
  exports.TwoWayBindingCommand.inject = [runtime.IExpressionParser];
  exports.TwoWayBindingCommand = __decorate([
      bindingCommand('two-way')
  ], exports.TwoWayBindingCommand);
  exports.TriggerBindingCommand = class TriggerBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new TriggerBindingInstruction(this.parser.parse(value, 86 /* TriggerCommand */), target);
      }
  };
  exports.TriggerBindingCommand.inject = [runtime.IExpressionParser];
  exports.TriggerBindingCommand = __decorate([
      bindingCommand('trigger')
  ], exports.TriggerBindingCommand);
  exports.DelegateBindingCommand = class DelegateBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new DelegateBindingInstruction(this.parser.parse(value, 88 /* DelegateCommand */), target);
      }
  };
  exports.DelegateBindingCommand.inject = [runtime.IExpressionParser];
  exports.DelegateBindingCommand = __decorate([
      bindingCommand('delegate')
  ], exports.DelegateBindingCommand);
  exports.CaptureBindingCommand = class CaptureBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new CaptureBindingInstruction(this.parser.parse(value, 87 /* CaptureCommand */), target);
      }
  };
  exports.CaptureBindingCommand.inject = [runtime.IExpressionParser];
  exports.CaptureBindingCommand = __decorate([
      bindingCommand('capture')
  ], exports.CaptureBindingCommand);
  exports.CallBindingCommand = class CallBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          return new CallBindingInstruction(this.parser.parse(value, 153 /* CallCommand */), resolveTarget(target, element, attribute));
      }
  };
  exports.CallBindingCommand.inject = [runtime.IExpressionParser];
  exports.CallBindingCommand = __decorate([
      bindingCommand('call')
  ], exports.CallBindingCommand);
  exports.ForBindingCommand = class ForBindingCommand {
      constructor(parser) {
          this.parser = parser;
      }
      compile(target, value, node, attribute, element) {
          const src = {
              templateOrNode: node,
              instructions: []
          };
          return new HydrateTemplateController(src, 'repeat', [
              new ToViewBindingInstruction(this.parser.parse(value, 539 /* ForCommand */), 'items'),
              new SetPropertyInstruction('item', 'local')
          ]);
      }
      handles(attributeDefinition) {
          return !!attributeDefinition && attributeDefinition.name === 'repeat';
      }
  };
  exports.ForBindingCommand.inject = [runtime.IExpressionParser];
  exports.ForBindingCommand = __decorate([
      bindingCommand('for')
  ], exports.ForBindingCommand);

  const globalResources = [
      runtime.Compose,
      runtime.If,
      runtime.Else,
      runtime.Repeat,
      runtime.Replaceable,
      runtime.With,
      runtime.SanitizeValueConverter,
      runtime.AttrBindingBehavior,
      runtime.DebounceBindingBehavior,
      runtime.OneTimeBindingBehavior,
      runtime.ToViewBindingBehavior,
      runtime.FromViewBindingBehavior,
      runtime.SelfBindingBehavior,
      runtime.SignalBindingBehavior,
      runtime.ThrottleBindingBehavior,
      runtime.TwoWayBindingBehavior,
      runtime.UpdateTriggerBindingBehavior
  ];
  const defaultBindingLanguage = [
      exports.DefaultBindingCommand,
      exports.OneTimeBindingCommand,
      exports.ToViewBindingCommand,
      exports.FromViewBindingCommand,
      exports.TwoWayBindingCommand,
      exports.TriggerBindingCommand,
      exports.DelegateBindingCommand,
      exports.CaptureBindingCommand,
      exports.CallBindingCommand,
      exports.ForBindingCommand
  ];
  const BasicConfiguration = {
      register(container) {
          register(container);
          container.register(kernel.Registration.singleton(runtime.ITemplateCompiler, exports.TemplateCompiler), ...globalResources, ...defaultBindingLanguage);
      }
  };

  exports.register = register;
  exports.ParserState = ParserState;
  exports.parse = parse;
  exports.bindingCommand = bindingCommand;
  exports.BindingCommandResource = BindingCommandResource;
  exports.resolveTarget = resolveTarget;
  exports.inspectAttribute = inspectAttribute;
  exports.TextBindingInstruction = TextBindingInstruction;
  exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
  exports.ToViewBindingInstruction = ToViewBindingInstruction;
  exports.FromViewBindingInstruction = FromViewBindingInstruction;
  exports.TwoWayBindingInstruction = TwoWayBindingInstruction;
  exports.TriggerBindingInstruction = TriggerBindingInstruction;
  exports.DelegateBindingInstruction = DelegateBindingInstruction;
  exports.CaptureBindingInstruction = CaptureBindingInstruction;
  exports.CallBindingInstruction = CallBindingInstruction;
  exports.RefBindingInstruction = RefBindingInstruction;
  exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
  exports.SetPropertyInstruction = SetPropertyInstruction;
  exports.SetAttributeInstruction = SetAttributeInstruction;
  exports.HydrateElementInstruction = HydrateElementInstruction;
  exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
  exports.HydrateTemplateController = HydrateTemplateController;
  exports.LetElementInstruction = LetElementInstruction;
  exports.LetBindingInstruction = LetBindingInstruction;
  exports.BasicConfiguration = BasicConfiguration;

  return exports;

}({},au.runtime,au.kernel));
