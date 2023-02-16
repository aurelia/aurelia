// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These symbols are basically the minimum necessary terminals.
// const viewportTerminal = ['?', '#', '/', '+', ')', '!'];
// const actionTerminal = [...componentTerminal, '@', '('];
// const componentTerminal = [...actionTerminal, '.'];
// const paramTerminal = ['=', ',', ')'];

import { ViewportInstructionTree, ViewportInstruction, type Params } from './instructions';
import { type NavigationOptions } from './options';
import { emptyQuery } from './router';
import { mergeURLSearchParams } from './util';

// These are the currently used terminal symbols.
// We're deliberately having every "special" (including the not-in-use '&', ''', '~', ';') as a terminal symbol,
// so as to make the syntax maximally restrictive for consistency and to minimize the risk of us having to introduce breaking changes in the future.
const terminal = ['?', '#', '/', '+', '(', ')', '.', '@', '!', '=', ',', '&', '\'', '~', ';'] as const;

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

export const enum ExpressionKind {
  Route,
  CompositeSegment,
  ScopedSegment,
  SegmentGroup,
  Segment,
  Component,
  Action,
  Viewport,
  ParameterList,
  Parameter,
}

const fragmentRouteExpressionCache = new Map<string, RouteExpression>();
const routeExpressionCache = new Map<string, RouteExpression>();

export type RouteExpressionOrHigher = CompositeSegmentExpressionOrHigher | RouteExpression;
export class RouteExpression {
  public get kind(): ExpressionKind.Route { return ExpressionKind.Route; }

  public constructor(
    public readonly raw: string,
    public readonly isAbsolute: boolean,
    public readonly root: CompositeSegmentExpressionOrHigher,
    public readonly queryParams: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
    public readonly fragmentIsRoute: boolean,
  ) {}

  public static parse(path: string, fragmentIsRoute: boolean): RouteExpression {
    const cache = fragmentIsRoute ? fragmentRouteExpressionCache : routeExpressionCache;
    let result = cache.get(path);
    if (result === void 0) {
      cache.set(path, result = RouteExpression.$parse(path, fragmentIsRoute));
    }
    return result;
  }

  private static $parse(path: string, fragmentIsRoute: boolean): RouteExpression {
    // First strip off the fragment (and if fragment should be used as route, set it as the path)
    let fragment: string | null = null;
    const fragmentStart = path.indexOf('#');
    if (fragmentStart >= 0) {
      const rawFragment = path.slice(fragmentStart + 1);
      fragment = decodeURIComponent(rawFragment);
      if (fragmentIsRoute) {
        path = fragment;
      } else {
        path = path.slice(0, fragmentStart);
      }
    }

    // Strip off and parse the query string using built-in URLSearchParams.
    let queryParams: URLSearchParams | null = null;
    const queryStart = path.indexOf('?');
    if (queryStart >= 0) {
      const queryString = path.slice(queryStart + 1);
      path = path.slice(0, queryStart);
      queryParams = new URLSearchParams(queryString);
    }
    if (path === '') {
      return new RouteExpression(
        '',
        false,
        SegmentExpression.EMPTY,
        queryParams != null ? Object.freeze(queryParams) : emptyQuery,
        fragment,
        fragmentIsRoute,
      );
    }

    /*
     * Now parse the actual route
     *
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
    const isAbsolute = state.consumeOptional('/');

    const root = CompositeSegmentExpression.parse(state);
    state.ensureDone();

    const raw = state.playback();
    return new RouteExpression(raw, isAbsolute, root, queryParams !=null ? Object.freeze(queryParams) : emptyQuery, fragment, fragmentIsRoute);
  }

  public toInstructionTree(options: NavigationOptions): ViewportInstructionTree {
    return new ViewportInstructionTree(
      options,
      this.isAbsolute,
      this.root.toInstructions(0, 0),
      mergeURLSearchParams(this.queryParams, options.queryParams, true),
      this.fragment ?? options.fragment,
    );
  }

  public toString(): string {
    return this.raw;
  }
}

export type CompositeSegmentExpressionOrHigher = ScopedSegmentExpressionOrHigher | CompositeSegmentExpression;
export type CompositeSegmentExpressionOrLower = RouteExpression | CompositeSegmentExpression;
/**
 * A single 'traditional' (slash-separated) segment consisting of one or more sibling segments.
 *
 * ### Variations:
 *
 * 1: `a+b`
 * - siblings: [`a`, `b`]
 * - append: `false`
 *
 * 2: `+a`
 * - siblings: [`a`]
 * - append: `true`
 *
 * 3: `+a+a`
 * - siblings: [`a`, `b`]
 * - append: `true`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 * - b = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
export class CompositeSegmentExpression {
  public get kind(): ExpressionKind.CompositeSegment { return ExpressionKind.CompositeSegment; }

  public constructor(
    public readonly raw: string,
    public readonly siblings: readonly ScopedSegmentExpressionOrHigher[],
  ) {}

  public static parse(state: ParserState): CompositeSegmentExpressionOrHigher {
    state.record();

    // If a segment starts with '+', e.g. '/+a' / '/+a@vp' / '/a/+b' / '/+a+b' etc, then its siblings
    // are considered to be "append"
    const append = state.consumeOptional('+');
    const siblings = [];
    do {
      siblings.push(ScopedSegmentExpression.parse(state));
    } while (state.consumeOptional('+'));

    if (!append && siblings.length === 1) {
      state.discard();
      return siblings[0];
    }

    const raw = state.playback();
    return new CompositeSegmentExpression(raw, siblings);
  }

  public toInstructions(open: number, close: number): ViewportInstruction[] {
    switch (this.siblings.length) {
      case 0:
        return [];
      case 1:
        return this.siblings[0].toInstructions(open, close);
      case 2:
        return [
          ...this.siblings[0].toInstructions(open, 0),
          ...this.siblings[1].toInstructions(0, close),
        ];
      default:
        return [
          ...this.siblings[0].toInstructions(open, 0),
          ...this.siblings.slice(1, -1).flatMap(function (x) {
            return x.toInstructions(0, 0);
          }),
          ...this.siblings[this.siblings.length - 1].toInstructions(0, close),
        ];
    }
  }

  public toString(): string {
    return this.raw;
  }
}

export type ScopedSegmentExpressionOrHigher = SegmentGroupExpressionOrHigher | ScopedSegmentExpression;
export type ScopedSegmentExpressionOrLower = CompositeSegmentExpressionOrLower | ScopedSegmentExpression;
/**
 * The (single) left-hand side and the (one or more) right-hand side of a slash-separated segment.
 *
 * Variations:
 *
 * 1: `a/b`
 * - left: `a`
 * - right: `b`
 *
 * Where
 * - a = `SegmentGroupExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression`)
 * - b = `ScopedSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression`)
 */
export class ScopedSegmentExpression {
  public get kind(): ExpressionKind.ScopedSegment { return ExpressionKind.ScopedSegment; }

  public constructor(
    public readonly raw: string,
    public readonly left: SegmentGroupExpressionOrHigher,
    public readonly right: ScopedSegmentExpressionOrHigher,
  ) {}

  public static parse(state: ParserState): ScopedSegmentExpressionOrHigher {
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

  public toInstructions(open: number, close: number): ViewportInstruction[] {
    const leftInstructions = this.left.toInstructions(open, 0);
    const rightInstructions = this.right.toInstructions(0, close);
    let cur = leftInstructions[leftInstructions.length - 1];
    while (cur.children.length > 0) {
      cur = cur.children[cur.children.length - 1];
    }
    cur.children.push(...rightInstructions);
    return leftInstructions;
  }

  public toString(): string {
    return this.raw;
  }
}

export type SegmentGroupExpressionOrHigher = SegmentExpression | SegmentGroupExpression;
export type SegmentGroupExpressionOrLower = ScopedSegmentExpressionOrLower | SegmentGroupExpression;
/**
 * Any kind of segment wrapped in parentheses, increasing its precedence.
 * Specifically, the parentheses are needed to deeply specify scoped siblings.
 * The precedence is intentionally similar to the familiar mathematical `/` and `+` operators.
 *
 * For example, consider this viewport structure:
 * - viewport-a
 * - - viewport-a1
 * - - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * This can only be deeply specified by using the grouping operator: `a/(a1+a2)+b/b1`
 *
 * Because `a/a1+a2+b/b1` would be interpreted differently:
 * - viewport-a
 * - - viewport-a1
 * - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * ### Variations:
 *
 * 1: `(a)`
 * - expression: `a`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
export class SegmentGroupExpression {
  public get kind(): ExpressionKind.SegmentGroup { return ExpressionKind.SegmentGroup; }

  public constructor(
    public readonly raw: string,
    public readonly expression: CompositeSegmentExpressionOrHigher,
  ) {}

  public static parse(state: ParserState): SegmentGroupExpressionOrHigher {
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

  public toInstructions(open: number, close: number): ViewportInstruction[] {
    return this.expression.toInstructions(open + 1, close + 1);
  }

  public toString(): string {
    return this.raw;
  }
}

/**
 * A (non-composite) segment specifying a single component and (optional) viewport / action.
 */
export class SegmentExpression {
  public get kind(): ExpressionKind.Segment { return ExpressionKind.Segment; }

  public static get EMPTY(): SegmentExpression { return new SegmentExpression('', ComponentExpression.EMPTY, ActionExpression.EMPTY, ViewportExpression.EMPTY, true); }

  public constructor(
    public readonly raw: string,
    public readonly component: ComponentExpression,
    public readonly action: ActionExpression,
    public readonly viewport: ViewportExpression,
    public readonly scoped: boolean,
  ) {}

  public static parse(state: ParserState): SegmentExpression {
    state.record();

    const component = ComponentExpression.parse(state);
    const action = ActionExpression.parse(state);
    const viewport = ViewportExpression.parse(state);
    const scoped = !state.consumeOptional('!');

    const raw = state.playback();
    return new SegmentExpression(raw, component, action, viewport, scoped);
  }

  public toInstructions(open: number, close: number): ViewportInstruction[] {
    return [
      ViewportInstruction.create({
        component: this.component.name,
        params: this.component.parameterList.toObject(),
        viewport: this.viewport.name,
        open,
        close,
      }),
    ];
  }

  public toString(): string {
    return this.raw;
  }
}

export class ComponentExpression {
  public get kind(): ExpressionKind.Component { return ExpressionKind.Component; }

  public static get EMPTY(): ComponentExpression { return new ComponentExpression('', '', ParameterListExpression.EMPTY); }

  /**
   * A single segment matching parameter, e.g. `:foo` (will match `a` but not `a/b`)
   */
  public readonly isParameter: boolean;
  /**
   * A multi-segment matching parameter, e.g. `*foo` (will match `a` as well as `a/b`)
   */
  public readonly isStar: boolean;
  /**
   * Whether this is either a parameter or a star segment.
   */
  public readonly isDynamic: boolean;
  /**
   * If this is a dynamic segment (parameter or star), this is the name of the parameter (the name without the `:` or `*`)
   */
  public readonly parameterName: string;

  public constructor(
    public readonly raw: string,
    public readonly name: string,
    public readonly parameterList: ParameterListExpression,
  ) {
    switch (name.charAt(0)) {
      case ':':
        this.isParameter = true;
        this.isStar = false;
        this.isDynamic = true;
        this.parameterName = name.slice(1);
        break;
      case '*':
        this.isParameter = false;
        this.isStar = true;
        this.isDynamic = true;
        this.parameterName = name.slice(1);
        break;
      default:
        this.isParameter = false;
        this.isStar = false;
        this.isDynamic = false;
        this.parameterName = name;
        break;
    }
  }

  public static parse(state: ParserState): ComponentExpression {
    state.record();
    state.record();
    if (!state.done) {
      if (state.startsWith('./')) {
        state.advance();
      } else if (state.startsWith('../')) {
        state.advance();
        state.advance();
      } else {
        while (!state.done && !state.startsWith(...terminal)) {
          state.advance();
        }
      }
    }

    const name = decodeURIComponent(state.playback());
    if (name.length === 0) {
      state.expect('component name');
    }
    const parameterList = ParameterListExpression.parse(state);

    const raw = state.playback();
    return new ComponentExpression(raw, name, parameterList);
  }

  public toString(): string {
    return this.raw;
  }
}

export class ActionExpression {
  public get kind(): ExpressionKind.Action { return ExpressionKind.Action; }

  public static get EMPTY(): ActionExpression { return new ActionExpression('', '', ParameterListExpression.EMPTY); }

  public constructor(
    public readonly raw: string,
    public readonly name: string,
    public readonly parameterList: ParameterListExpression,
  ) {}

  public static parse(state: ParserState): ActionExpression {
    state.record();
    let name = '';

    if (state.consumeOptional('.')) {
      state.record();
      while (!state.done && !state.startsWith(...terminal)) {
        state.advance();
      }

      name = decodeURIComponent(state.playback());
      if (name.length === 0) {
        state.expect('method name');
      }
    }

    const parameterList = ParameterListExpression.parse(state);

    const raw = state.playback();
    return new ActionExpression(raw, name, parameterList);
  }

  public toString(): string {
    return this.raw;
  }
}

export class ViewportExpression {
  public get kind(): ExpressionKind.Viewport { return ExpressionKind.Viewport; }

  public static get EMPTY(): ViewportExpression { return new ViewportExpression('', ''); }

  public constructor(
    public readonly raw: string,
    public readonly name: string,
  ) {}

  public static parse(state: ParserState): ViewportExpression {
    state.record();
    let name = '';

    if (state.consumeOptional('@')) {
      state.record();
      while (!state.done && !state.startsWith(...terminal)) {
        state.advance();
      }

      name = decodeURIComponent(state.playback());
      if (name.length === 0) {
        state.expect('viewport name');
      }
    }

    const raw = state.playback();
    return new ViewportExpression(raw, name);
  }

  public toString(): string {
    return this.raw;
  }
}

export class ParameterListExpression {
  public get kind(): ExpressionKind.ParameterList { return ExpressionKind.ParameterList; }

  public static get EMPTY(): ParameterListExpression { return new ParameterListExpression('', []); }

  public constructor(
    public readonly raw: string,
    public readonly expressions: readonly ParameterExpression[],
  ) {}

  public static parse(state: ParserState): ParameterListExpression {
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

  public toObject(): Params {
    const params: Params = {};
    for (const expr of this.expressions) {
      params[expr.key] = expr.value;
    }
    return params;
  }

  public toString(): string {
    return this.raw;
  }
}

export class ParameterExpression {
  public get kind(): ExpressionKind.Parameter { return ExpressionKind.Parameter; }

  public static get EMPTY(): ParameterExpression { return new ParameterExpression('', '', ''); }

  public constructor(
    public readonly raw: string,
    public readonly key: string,
    public readonly value: string,
  ) {}

  public static parse(state: ParserState, index: number): ParameterExpression {
    state.record();
    state.record();
    while (!state.done && !state.startsWith(...terminal)) {
      state.advance();
    }

    let key = decodeURIComponent(state.playback());
    if (key.length === 0) {
      state.expect('parameter key');
    }
    let value;
    if (state.consumeOptional('=')) {
      state.record();
      while (!state.done && !state.startsWith(...terminal)) {
        state.advance();
      }

      value = decodeURIComponent(state.playback());
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

  public toString(): string {
    return this.raw;
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
