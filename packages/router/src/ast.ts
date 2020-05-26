// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These symbols are basically the minimum necessary terminals.
// const viewportTerminal = ['?', '#', '/', '+', ')', '!'];
// const actionTerminal = [...componentTerminal, '@', '('];
// const componentTerminal = [...actionTerminal, '.'];
// const paramTerminal = ['=', ',', ')'];

// These are the currently used terminal symbols.
// We're deliberately having every "special" (including the not-in-use '&', ''', '~', ';') as a terminal symbol,
// so as to make the syntax maximally restrictive for consistency and to minimize the risk of us having to introduce breaking changes in the future.
const terminal = ['?', '#', '/', '+', '(', ')', '.', '@', '!', '=', ',', '&', '\'', '~', ';'] as const;

type ParseType<T> = T extends { parse(...args: unknown[]): infer R } ? R : never;

class ParserState {
  public get done() {
    return this.rest.length === 0;
  }

  private rest: string;
  private readonly buffers: string[] = [];
  private bufferIndex: number = 0;
  private index: number = 0;

  public constructor(
    private readonly input: string,
  ) {
    this.rest = input;
  }

  public startsWith(...values: readonly string[]): boolean {
    const rest = this.rest;
    return values.some(function (value) {
      return rest.startsWith(value);
    });
  }

  public consumeOptional(str: string): boolean {
    if (this.startsWith(str)) {
      this.rest = this.rest.slice(str.length);
      this.index += str.length;
      this.append(str);
      return true;
    }
    return false;
  }

  public consume(str: string): void {
    if (!this.consumeOptional(str)) {
      this.expect(`'${str}'`);
    }
  }

  public expect(msg: string): void {
    throw new Error(`Expected ${msg} at index ${this.index} of '${this.input}', but got: '${this.rest}' (rest='${this.rest}')`);
  }

  public ensureDone(): void {
    if (!this.done) {
      throw new Error(`Unexpected '${this.rest}' at index ${this.index} of '${this.input}'`);
    }
  }

  public advance(): void {
    const char = this.rest[0];
    this.rest = this.rest.slice(1);
    ++this.index;
    this.append(char);
  }

  public record(): void {
    this.buffers[this.bufferIndex++] = '';
  }

  public playback(): string {
    const bufferIndex = --this.bufferIndex;
    const buffers = this.buffers;
    const buffer = buffers[bufferIndex];
    buffers[bufferIndex] = '';
    return buffer;
  }

  public discard(): void {
    this.buffers[--this.bufferIndex] = '';
  }

  private append(str: string): void {
    const bufferIndex = this.bufferIndex;
    const buffers = this.buffers;
    for (let i = 0; i < bufferIndex; ++i) {
      buffers[i] += str;
    }
  }
}

export class RouteExpression {
  public constructor(
    public readonly raw: string,
    public readonly root: ParseType<typeof CompositeSegmentExpression>,
  ) {}

  public static parse(path: string): RouteExpression;
  public static parse(path: null): null;
  public static parse(path: string | null): RouteExpression | null;
  public static parse(path: string | null): RouteExpression | null {
    if (path === null) {
      return null;
    }

    /*
     * Notes:
     * A NT-Name as per DOM level 2: https://www.w3.org/TR/1998/REC-xml-19980210#NT-Name
     *  [4]  NameChar ::= Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
     *  [5]  Name     ::= (Letter | '_' | ':') (NameChar)*
     *
     * As per https://url.spec.whatwg.org/#url-code-points - URL code points (from the ASCII range) are:
     * a-zA-Z0-9!$&'()*+,-./:;=?@_~
     * The other valid option is a % followed by two ASCII hex digits
     * Anything else is invalid.
     */
    const state = new ParserState(path);
    state.record();
    state.consumeOptional('/');

    const root = CompositeSegmentExpression.parse(state);
    state.ensureDone();

    const raw = state.playback();
    return new RouteExpression(raw, root);
  }
}

class CompositeSegmentExpression {
  public constructor(
    public readonly raw: string,
    public readonly siblings: readonly ParseType<typeof ScopedSegmentExpression>[],
    public readonly additive: boolean,
  ) {}

  public static parse(
    state: ParserState,
  ): CompositeSegmentExpression | ParseType<typeof ScopedSegmentExpression> {
    state.record();

    // If a segment starts with '+', e.g. '/+a' / '/+a@vp' / '/a/+b' / '/+a+b' etc, then its siblings
    // are considered to be "additive"
    const additive = state.consumeOptional('+');
    const siblings = [];
    do {
      siblings.push(ScopedSegmentExpression.parse(state));
    } while (state.consumeOptional('+'));

    if (!additive && siblings.length === 1) {
      state.discard();
      return siblings[0];
    }

    const raw = state.playback();
    return new CompositeSegmentExpression(raw, siblings, additive);
  }
}

class ScopedSegmentExpression {
  public constructor(
    public readonly raw: string,
    public readonly left: ParseType<typeof SegmentGroupExpression>,
    public readonly right: ParseType<typeof ScopedSegmentExpression>,
  ) {}

  public static parse(
    state: ParserState,
  ): ScopedSegmentExpression | ParseType<typeof SegmentGroupExpression> {
    state.record();

    const left = SegmentGroupExpression.parse(state);

    if (state.consumeOptional('/')) {
      const right = ScopedSegmentExpression.parse(state);

      const raw = state.playback();
      return new ScopedSegmentExpression(raw, left, right);
    }

    state.discard();
    return left;
  }
}

class SegmentGroupExpression {
  public constructor(
    public readonly raw: string,
    public readonly expression: ParseType<typeof CompositeSegmentExpression>,
  ) {}

  public static parse(
    state: ParserState,
  ): SegmentGroupExpression | ParseType<typeof SegmentExpression> {
    state.record();

    if (state.consumeOptional('(')) {
      const expression = CompositeSegmentExpression.parse(state);
      state.consume(')');

      const raw = state.playback();
      return new SegmentGroupExpression(raw, expression);
    }

    state.discard();
    return SegmentExpression.parse(state);
  }
}

class SegmentExpression {
  public constructor(
    public readonly raw: string,
    public readonly component: ComponentExpression,
    public readonly action: ActionExpression,
    public readonly viewport: ViewportExpression,
    public readonly scoped: boolean,
  ) {}

  public static parse(
    state: ParserState,
  ): SegmentExpression {
    state.record();

    const component = ComponentExpression.parse(state);
    const action = ActionExpression.parse(state);
    const viewport = ViewportExpression.parse(state);
    const scoped = !state.consumeOptional('!');

    const raw = state.playback();
    return new SegmentExpression(raw, component, action, viewport, scoped);
  }
}

class ComponentExpression {
  public constructor(
    public readonly raw: string,
    public readonly name: string,
    public readonly parameterList: ParameterListExpression,
  ) {}

  public static parse(
    state: ParserState,
  ): ComponentExpression {
    state.record();
    state.record();
    while (!state.done && !state.startsWith(...terminal)) {
      state.advance();
    }

    const name = state.playback();
    if (name.length === 0) {
      state.expect('component name');
    }
    const parameterList = ParameterListExpression.parse(state);

    const raw = state.playback();
    return new ComponentExpression(raw, name, parameterList);
  }
}

class ActionExpression {
  public constructor(
    public readonly raw: string,
    public readonly name: string,
    public readonly parameterList: ParameterListExpression,
  ) {}

  public static parse(
    state: ParserState,
  ): ActionExpression {
    state.record();
    let name = '';

    if (state.consumeOptional('.')) {
      state.record();
      while (!state.done && !state.startsWith(...terminal)) {
        state.advance();
      }

      name = state.playback();
      if (name.length === 0) {
        state.expect('method name');
      }
    }

    const parameterList = ParameterListExpression.parse(state);

    const raw = state.playback();
    return new ActionExpression(raw, name, parameterList);
  }
}

class ViewportExpression {
  public constructor(
    public readonly raw: string,
    public readonly name: string,
  ) {}

  public static parse(
    state: ParserState,
  ): ViewportExpression {
    state.record();
    let name = '';

    if (state.consumeOptional('@')) {
      state.record();
      while (!state.done && !state.startsWith(...terminal)) {
        state.advance();
      }

      name = state.playback();
      if (name.length === 0) {
        state.expect('viewport name');
      }
    }

    const raw = state.playback();
    return new ViewportExpression(raw, name);
  }
}

class ParameterListExpression {
  public constructor(
    public readonly raw: string,
    public readonly expressions: readonly ParameterExpression[],
  ) {}

  public static parse(
    state: ParserState,
  ): ParameterListExpression {
    state.record();
    const expressions = [];
    if (state.consumeOptional('(')) {
      do {
        expressions.push(ParameterExpression.parse(state, expressions.length));
        if (!state.consumeOptional(',')) {
          break;
        }
      } while (!state.done && !state.startsWith(')'));
      state.consume(')');
    }

    const raw = state.playback();
    return new ParameterListExpression(raw, expressions);
  }
}

class ParameterExpression {
  public constructor(
    public readonly raw: string,
    public readonly key: string,
    public readonly value: string,
  ) {}

  public static parse(
    state: ParserState,
    index: number,
  ): ParameterExpression {
    state.record();
    state.record();
    while (!state.done && !state.startsWith(...terminal)) {
      state.advance();
    }

    let key = state.playback();
    if (key.length === 0) {
      state.expect('parameter key');
    }
    let value;
    if (state.consumeOptional('=')) {
      state.record();
      while (!state.done && !state.startsWith(...terminal)) {
        state.advance();
      }

      value = state.playback();
      if (value.length === 0) {
        state.expect('parameter value');
      }
    } else {
      value = key;
      key = index.toString();
    }

    const raw = state.playback();
    return new ParameterExpression(raw, key, value);
  }
}

export const AST = Object.freeze({
  RouteExpression,
  CompositeSegmentExpression,
  ScopedSegmentExpression,
  SegmentGroupExpression,
  SegmentExpression,
  ComponentExpression,
  ActionExpression,
  ViewportExpression,
  ParameterListExpression,
  ParameterExpression,
});
