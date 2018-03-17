import * as ts from 'typescript';
import { Lexer, Token } from './lexer';
import {
  Expression,
  Chain, ValueConverter, Assign, Conditional,
  AccessThis, AccessScope, AccessMember, AccessKeyed,
  CallScope, CallFunction, CallMember,
  PrefixNot, BindingBehavior, Binary,
  LiteralPrimitive, LiteralArray, LiteralObject, LiteralString
} from './ast';
import * as AST from './ast';

let AstNames = Object.getOwnPropertyNames(AST).filter(ast => ast !== 'Expression');
let EOF = new Token(-1, '');

export interface AstRegistryRecord {
  id: number;
  ast: Expression;
}

export class Parser {

  static astId: number = 1;
  static astRegistry: Record<string, AstRegistryRecord> = {};

  static addAst(expression: string, ast: Expression) {
    return this.astRegistry[expression]
      || (this.astRegistry[expression] = {
        id: this.astId++,
        ast
      });
  }

  static emitAst(): ts.SourceFile {
    let file = ts.createSourceFile(
      'src/asts.js',
      [
        `/* Aurelia Compiler - auto generated file */`,
        `import {\n${AstNames.join(', \n')}\n} from './framework/binding/ast';`,
        `export var getAst = id => Asts[id];`
      ].join('\n'),
      ts.ScriptTarget.Latest, true
    );
    return ts.updateSourceFileNode(file, [
      ...file.statements,
      ts.createVariableStatement(
        /*modifiers*/ undefined,
        [
          ts.createVariableDeclaration(
            'Asts',
            /*type*/ undefined,
            ts.createObjectLiteral([
              ...Object.keys(this.astRegistry)
                .map(exp => {
                  let record = this.astRegistry[exp];
                  return ts.createPropertyAssignment(
                    ts.createLiteral(record.id),
                    record.ast.code
                  );
                })
            ], /*multiline*/ true)
          )
        ]
      )
    ]);
  }

  static generateAst() {
    return ts.createPrinter().printFile(this.emitAst());
  }

  private cache: Record<string, Expression>;
  private lexer: Lexer;

  constructor() {
    this.cache = {};
    this.lexer = new Lexer();
  }

  parse(input: string) {
    input = input || '';

    return this.cache[input]
      || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
  }

  getOrCreateAstRecord(input: string): AstRegistryRecord {
    return Parser.astRegistry[input] || (Parser.addAst(input, this.parse(input)));
  }
}

export class ParserImplementation {

  public index: number;
  public tokens: Token[];

  constructor(
    public readonly lexer: Lexer,
    public input: string
  ) {
    this.index = 0;
    this.input = input;
    this.tokens = lexer.lex(input);
  }

  get peek() {
    return (this.index < this.tokens.length) ? this.tokens[this.index] : EOF;
  }

  parseChain() {
    let isChain = false;
    let expressions = [];

    while (this.optional(';')) {
      isChain = true;
    }

    while (this.index < this.tokens.length) {
      if (this.peek.text === ')' || this.peek.text === '}' || this.peek.text === ']') {
        this.error(`Unconsumed token ${this.peek.text}`);
      }

      let expr = this.parseBindingBehavior();
      expressions.push(expr);

      while (this.optional(';')) {
        isChain = true;
      }

      if (isChain) {
        this.error('Multiple expressions are not allowed.');
      }
    }

    return (expressions.length === 1) ? expressions[0] : new Chain(expressions);
  }

  parseBindingBehavior() {
    let result = this.parseValueConverter();

    while (this.optional('&')) {
      let name = this.peek.text;
      let args = [];

      this.advance();

      while (this.optional(':')) {
        args.push(this.parseExpression());
      }

      result = new BindingBehavior(result, name, args);
    }

    return result;
  }

  parseValueConverter() {
    let result = this.parseExpression();

    while (this.optional('|')) {
      let name = this.peek.text; // TODO(kasperl): Restrict to identifier?
      let args = [];

      this.advance();

      while (this.optional(':')) {
        // TODO(kasperl): Is this really supposed to be expressions?
        args.push(this.parseExpression());
      }

      result = new ValueConverter(result, name, args);
    }

    return result;
  }

  parseExpression(): Expression {
    let start = this.peek.index;
    let result = this.parseConditional();

    while (this.peek.text === '=') {
      if (!result.isAssignable) {
        let end = (this.index < this.tokens.length) ? this.peek.index : this.input.length;
        let expression = this.input.substring(start, end);

        this.error(`Expression ${expression} is not assignable`);
      }

      this.expect('=');
      result = new Assign(result, this.parseConditional());
    }

    return result;
  }

  parseConditional() {
    let start = this.peek.index;
    let result = this.parseLogicalOr();

    if (this.optional('?')) {
      let yes = this.parseExpression();

      if (!this.optional(':')) {
        let end = (this.index < this.tokens.length) ? this.peek.index : this.input.length;
        let expression = this.input.substring(start, end);

        this.error(`Conditional expression ${expression} requires all 3 expressions`);
      }

      let no = this.parseExpression();
      result = new Conditional(result, yes, no);
    }

    return result;
  }

  parseLogicalOr() {
    let result = this.parseLogicalAnd();

    while (this.optional('||')) {
      result = new Binary('||', result, this.parseLogicalAnd());
    }

    return result;
  }

  parseLogicalAnd() {
    let result = this.parseEquality();

    while (this.optional('&&')) {
      result = new Binary('&&', result, this.parseEquality());
    }

    return result;
  }

  parseEquality() {
    let result = this.parseRelational();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('==')) {
        result = new Binary('==', result, this.parseRelational());
      } else if (this.optional('!=')) {
        result = new Binary('!=', result, this.parseRelational());
      } else if (this.optional('===')) {
        result = new Binary('===', result, this.parseRelational());
      } else if (this.optional('!==')) {
        result = new Binary('!==', result, this.parseRelational());
      } else {
        return result;
      }
    }
  }

  parseRelational() {
    let result = this.parseAdditive();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('<')) {
        result = new Binary('<', result, this.parseAdditive());
      } else if (this.optional('>')) {
        result = new Binary('>', result, this.parseAdditive());
      } else if (this.optional('<=')) {
        result = new Binary('<=', result, this.parseAdditive());
      } else if (this.optional('>=')) {
        result = new Binary('>=', result, this.parseAdditive());
      } else {
        return result;
      }
    }
  }

  parseAdditive() {
    let result = this.parseMultiplicative();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('+')) {
        result = new Binary('+', result, this.parseMultiplicative());
      } else if (this.optional('-')) {
        result = new Binary('-', result, this.parseMultiplicative());
      } else {
        return result;
      }
    }
  }

  parseMultiplicative() {
    let result = this.parsePrefix();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('*')) {
        result = new Binary('*', result, this.parsePrefix());
      } else if (this.optional('%')) {
        result = new Binary('%', result, this.parsePrefix());
      } else if (this.optional('/')) {
        result = new Binary('/', result, this.parsePrefix());
      } else {
        return result;
      }
    }
  }

  parsePrefix(): Expression {
    if (this.optional('+')) {
      return this.parsePrefix(); // TODO(kasperl): This is different than the original parser.
    } else if (this.optional('-')) {
      return new Binary('-', new LiteralPrimitive(0), this.parsePrefix());
    } else if (this.optional('!')) {
      return new PrefixNot(this.parsePrefix());
    }

    return this.parseAccessOrCallMember();
  }

  parseAccessOrCallMember() {
    let result = this.parsePrimary();

    while (true) { // eslint-disable-line no-constant-condition
      if (this.optional('.')) {
        let name = this.peek.text; // TODO(kasperl): Check that this is an identifier. Are keywords okay?

        this.advance();

        if (this.optional('(')) {
          let args = this.parseExpressionList(')');
          this.expect(')');
          if (result instanceof AccessThis) {
            result = new CallScope(name, args, result.ancestor);
          } else {
            result = new CallMember(result, name, args);
          }
        } else {
          if (result instanceof AccessThis) {
            result = new AccessScope(name, result.ancestor);
          } else {
            result = new AccessMember(result, name);
          }
        }
      } else if (this.optional('[')) {
        let key = this.parseExpression();
        this.expect(']');
        result = new AccessKeyed(result, key);
      } else if (this.optional('(')) {
        let args = this.parseExpressionList(')');
        this.expect(')');
        result = new CallFunction(result, args);
      } else {
        return result;
      }
    }
  }

  parsePrimary(): Expression {
    if (this.optional('(')) {
      let result = this.parseExpression();
      this.expect(')');
      return result;
    } else if (this.optional('null')) {
      return new LiteralPrimitive(null);
    } else if (this.optional('undefined')) {
      return new LiteralPrimitive(undefined);
    } else if (this.optional('true')) {
      return new LiteralPrimitive(true);
    } else if (this.optional('false')) {
      return new LiteralPrimitive(false);
    } else if (this.optional('[')) {
      let elements = this.parseExpressionList(']');
      this.expect(']');
      return new LiteralArray(elements);
    } else if (this.peek.text === '{') {
      return this.parseObject();
    } else if (this.peek.key !== null && this.peek.key !== undefined) {
      return this.parseAccessOrCallScope();
    } else if (this.peek.value !== null && this.peek.value !== undefined) {
      let value = this.peek.value;
      this.advance();
      return value instanceof String || typeof value === 'string' ? new LiteralString('' + value) : new LiteralPrimitive(value);
    } else if (this.index >= this.tokens.length) {
      throw new Error(`Unexpected end of expression: ${this.input}`);
    } else {
      return this.error(`Unexpected token ${this.peek.text}`);
    }
  }

  parseAccessOrCallScope() {
    let name = this.peek.key;

    this.advance();

    if (name === '$this') {
      return new AccessThis(0);
    }

    let ancestor = 0;
    while (name === '$parent') {
      ancestor++;
      if (this.optional('.')) {
        name = this.peek.key;
        this.advance();
      } else if (this.peek === EOF
        || this.peek.text === '('
        || this.peek.text === ')'
        || this.peek.text === '['
        || this.peek.text === '}'
        || this.peek.text === ','
        || this.peek.text === '|'
        || this.peek.text === '&'
      ) {
        return new AccessThis(ancestor);
      } else {
        this.error(`Unexpected token ${this.peek.text}`);
      }
    }

    if (this.optional('(')) {
      let args = this.parseExpressionList(')');
      this.expect(')');
      return new CallScope(name!, args, ancestor);
    }

    return new AccessScope(name!, ancestor);
  }

  parseObject() {
    let keys = [];
    let values = [];

    this.expect('{');

    if (this.peek.text !== '}') {
      do {
        // TODO(kasperl): Stricter checking. Only allow identifiers
        // and strings as keys. Maybe also keywords?
        let peek = this.peek;
        let value = peek.value;
        keys.push(typeof value === 'string' ? value : peek.text);

        this.advance();
        if (peek.key && (this.peek.text === ',' || this.peek.text === '}')) {
          --this.index;
          values.push(this.parseAccessOrCallScope());
        } else {
          this.expect(':');
          values.push(this.parseExpression());
        }
      } while (this.optional(','));
    }

    this.expect('}');

    return new LiteralObject(keys, values);
  }

  parseExpressionList(terminator: string) {
    let result = [];

    if (this.peek.text !== terminator) {
      do {
        result.push(this.parseExpression());
      } while (this.optional(','));
    }

    return result;
  }

  optional(text: string) {
    if (this.peek.text === text) {
      this.advance();
      return true;
    }

    return false;
  }

  expect(text: string) {
    if (this.peek.text === text) {
      this.advance();
    } else {
      this.error(`Missing expected ${text}`);
    }
  }

  advance() {
    this.index++;
  }

  error(message: string): never {
    let location = (this.index < this.tokens.length)
      ? `at column ${this.tokens[this.index].index + 1} in`
      : 'at the end of the expression';

    throw new Error(`Parser Error: ${message} ${location} [${this.input}]`);
  }
}
