// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These symbols are basically the minimum necessary terminals.
// const viewportTerminal = ['?', '#', '/', '+', ')', '!'];
// const actionTerminal = [...componentTerminal, '@', '('];
// const componentTerminal = [...actionTerminal, '.'];
// const paramTerminal = ['=', ',', ')'];

import { IIndexable, Writable } from '@aurelia/kernel';
import { CustomElement, CustomElementDefinition } from '@aurelia/runtime';

import { IRouteContext, RouteContext } from './route-context';
import { RouteTree, RouteNode } from './route-tree';
import { Transition } from './router';

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

export type RouteExpressionOrHigher = CompositeSegmentExpressionOrHigher | RouteExpression;
export class RouteExpression {
  public get kind(): ExpressionKind.Route { return ExpressionKind.Route; }

  public readonly route: RouteExpression;
  public readonly segments: readonly SegmentExpression[];

  public constructor(
    public readonly raw: string,
    public readonly root: CompositeSegmentExpressionOrHigher,
    public readonly queryParams: IIndexable,
    public readonly fragment: string | null,
    public readonly fragmentIsRoute: boolean,
  ) {
    this.segments = root.segments;
    this.route = this;
    root.setParent(this);
  }

  public static parse(path: string, fragmentIsRoute: boolean): RouteExpression;
  public static parse(path: null, fragmentIsRoute: boolean): null;
  public static parse(path: string | null, fragmentIsRoute: boolean): RouteExpression | null;
  public static parse(path: string | null, fragmentIsRoute: boolean): RouteExpression | null {
    if (path === null) {
      return null;
    }

    // First strip off the fragment (and if fragment should be used as route, set it as the path)
    let fragment: string | null;
    const fragmentStart = path.indexOf('#');
    if (fragmentStart >= 0) {
      const rawFragment = path.slice(fragmentStart + 1);
      fragment = decodeURIComponent(rawFragment);
      if (fragmentIsRoute) {
        path = fragment;
      } else {
        path = path.slice(0, fragmentStart);
      }
    } else {
      if (fragmentIsRoute) {
        path = '';
      }
      fragment = null;
    }

    // Strip off and parse the query string using built-in URLSearchParams.
    const queryParams: IIndexable = {};
    const queryStart = path.indexOf('?');
    if (queryStart >= 0) {
      const queryString = path.slice(queryStart + 1);
      path = path.slice(0, queryStart);
      // eslint-disable-next-line compat/compat,no-undef
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach(function (value, key) {
        queryParams[key] = value;
      });
    }
    Object.freeze(queryParams);

    if (path === '') {
      return new RouteExpression(
        '',
        SegmentExpression.EMPTY,
        queryParams,
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
    state.consumeOptional('/');

    const root = CompositeSegmentExpression.parse(state);
    state.ensureDone();

    const raw = state.playback();
    return new RouteExpression(raw, root, queryParams, fragment, fragmentIsRoute);
  }

  public equals(other: RouteExpression): boolean {
    return this.root.equals(other.root);
  }

  public contains(other: RouteExpression): boolean {
    // TODO
    return false;
  }

  public evaluate(
    ctx: IRouteContext,
    transition: Transition,
  ): RouteTree {
    // The root of the routing tree is always the CompositionRoot of the Aurelia app.
    // From a routing perspective it's simply a "marker": it does not need to be loaded,
    // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
    // other than by reading (deps, optional route config, owned viewports) from it.
    const root = new RouteNode(
      /*         context */ctx.root,
      /* matchedSegments */this.segments,
      /*          params */{},
      /*     queryParams */{ ...this.queryParams },
      /*        fragment */this.fragment,
      /*            data */{},
      /*        viewport */'', // The root does not live in a viewport
      /*       component */ctx.root.definition,
      /*          append */false,
      /*        children */[],
      /*    instructions */[],
    );

    this.root.evaluate(ctx, transition, root, 0, false, true);

    return new RouteTree(this.raw, root);
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

  public readonly route!: RouteExpression;
  public readonly parent!: RouteExpression | SegmentGroupExpression;

  public readonly segments: readonly SegmentExpression[];

  public constructor(
    public readonly raw: string,
    public readonly siblings: readonly ScopedSegmentExpressionOrHigher[],
    public readonly append: boolean,
  ) {
    this.segments = siblings.flatMap(function (x) {
      return x.segments;
    });
  }

  public static parse(
    state: ParserState,
  ): CompositeSegmentExpressionOrHigher {
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
    return new CompositeSegmentExpression(raw, siblings, append);
  }

  public setParent(parent: RouteExpression | SegmentGroupExpression): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    for (const sibling of this.siblings) {
      sibling.setParent(this);
    }
  }

  public equals(other: CompositeSegmentExpressionOrHigher): boolean {
    return (
      other.kind === ExpressionKind.CompositeSegment &&
      this.append === other.append &&
      this.siblings.length === other.siblings.length &&
      this.siblings.every(function (x, i) {
        return x.equals(other.siblings[i]);
      })
    );
  }

  public evaluate(
    ctx: IRouteContext,
    transition: Transition,
    parent: RouteNode,
    index: number,
    _append: boolean,
    resolve: boolean,
  ): RouteNode {
    for (const sibling of this.siblings) {
      sibling.evaluate(ctx, transition, parent, index, this.append, resolve);
    }
    // No new scope needs to be passed up to the owner, so just return parent
    return parent;
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

  public readonly route!: RouteExpression;
  public readonly parent!: SegmentGroupExpressionOrLower;

  public readonly segments: readonly SegmentExpression[];

  public constructor(
    public readonly raw: string,
    public readonly left: SegmentGroupExpressionOrHigher,
    public readonly right: ScopedSegmentExpressionOrHigher,
  ) {
    this.segments = [...left.segments, ...right.segments];
  }

  public static parse(
    state: ParserState,
  ): ScopedSegmentExpressionOrHigher {
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

  public setParent(parent: SegmentGroupExpressionOrLower): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    this.left.setParent(this);
    this.right.setParent(this);
  }

  public equals(other: CompositeSegmentExpressionOrHigher): boolean {
    return (
      other.kind === ExpressionKind.ScopedSegment &&
      this.left.equals(other.left) &&
      this.right.equals(other.right)
    );
  }

  public evaluate(
    ctx: IRouteContext,
    transition: Transition,
    parent: RouteNode,
    index: number,
    append: boolean,
    resolve: boolean,
  ): RouteNode {
    const current = ctx.path[index];
    if (resolve) {
      return current.resolveNode(this, ctx, transition, parent, index, append);
    }

    // Scope goes one level deeper after a ScopedSegment so retrieve it and pass it down
    let child = this.left.evaluate(ctx, transition, parent, index, append, false);
    if (child.component === '..') {
      // Unless it's a double dot, in which case we reverse it and go one level up instead
      const grandParent = parent.getParent();
      if (grandParent === null) {
        throw new Error(`Invalid path ${this.toString()}, cannot go up further in scope`);
      }
      child = grandParent;
    } else {
      parent.appendChild(child);
    }

    if (ctx.path.length === index + 1) {
      // We've reached the leaf context and can't resolve any further.
      // Add the rest as a residue and let the router deal with it after loading `left` (which should create the context
      // that `right` can use)
      child.residue.push(this.right.raw);
      return child;
    }

    const grandChild = this.right.evaluate(ctx, transition, child, index + 1, false, false);
    child.appendChild(grandChild);

    return grandChild;
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

  public readonly route!: RouteExpression;
  public readonly parent!: SegmentGroupExpressionOrLower;

  public readonly segments: readonly SegmentExpression[];

  public constructor(
    public readonly raw: string,
    public readonly expression: CompositeSegmentExpressionOrHigher,
  ) {
    this.segments = expression.segments;
  }

  public static parse(
    state: ParserState,
  ): SegmentGroupExpressionOrHigher {
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

  public setParent(parent: SegmentGroupExpressionOrLower): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    this.expression.setParent(this);
  }

  public equals(other: CompositeSegmentExpressionOrHigher): boolean {
    return (
      other.kind === ExpressionKind.SegmentGroup &&
      this.expression.equals(other.expression)
    );
  }

  public evaluate(
    ctx: IRouteContext,
    transition: Transition,
    parent: RouteNode,
    index: number,
    append: boolean,
    resolve: boolean,
  ): RouteNode {
    return this.expression.evaluate(ctx, transition, parent, index, append, resolve);
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

  public readonly route!: RouteExpression;
  public readonly parent!: SegmentGroupExpressionOrLower;

  public readonly segments: readonly SegmentExpression[];

  public constructor(
    public readonly raw: string,
    public readonly component: ComponentExpression,
    public readonly action: ActionExpression,
    public readonly viewport: ViewportExpression,
    public readonly scoped: boolean,
  ) {
    this.segments = [this];
  }

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

  public setParent(parent: SegmentGroupExpressionOrLower): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    this.component.setParent(this);
    this.action.setParent(this);
    this.viewport.setParent(this);
  }

  public equals(other: CompositeSegmentExpressionOrHigher): boolean {
    return (
      other.kind === ExpressionKind.Segment &&
      this.scoped === other.scoped &&
      this.component.equals(other.component) &&
      this.action.equals(other.action) &&
      this.viewport.equals(other.viewport)
    );
  }

  public evaluate(
    ctx: IRouteContext,
    transition: Transition,
    parent: RouteNode,
    index: number,
    append: boolean,
    resolve: boolean,
  ): RouteNode {
    const current = ctx.path[index];
    if (resolve) {
      // If the context decides to use direct routing, it will call `evaluate` again with resolve=false
      return current.resolveNode(this, ctx, transition, parent, index, append);
    }

    const component: CustomElementDefinition | null = current.findResource(CustomElement, this.component.name);

    if (component === null) {
      // TODO: maybe return some null node thing with an empty viewport, to allow the viewport
      // to load a fallback?
      throw new Error(`No component named '${this.component.name}' could be found`);
    }

    // TODO: add ActionExpression state representation to RouteNode
    const node = new RouteNode(
      null, // temp
      this.segments,
      {}, // TODO: get params & do params inheritance
      this.route.queryParams, // TODO: queryParamsStrategy
      this.route.fragment, // TODO: fragmentStrategy
      {}, // TODO: pass in data from instruction
      this.viewport.name,
      component,
      append,
      [],
      [],
    );

    const viewportAgent = current.resolveViewportAgent(node);
    const newContext = RouteContext.getOrCreate(
      node,
      viewportAgent,
      component,
      viewportAgent.hostController.context,
    );
    node.context = newContext;

    parent.appendChild(node);
    return node;
  }

  public toString(): string {
    return this.raw;
  }
}

export class ComponentExpression {
  public get kind(): ExpressionKind.Component { return ExpressionKind.Component; }

  public static get EMPTY(): ComponentExpression { return new ComponentExpression('', '', ParameterListExpression.EMPTY); }

  public readonly route!: RouteExpression;
  public readonly parent!: SegmentExpression;

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

  public static parse(
    state: ParserState,
  ): ComponentExpression {
    state.record();
    state.record();
    while (!state.done && !state.startsWith(...terminal)) {
      state.advance();
    }

    const name = decodeURIComponent(state.playback());
    if (name.length === 0) {
      state.expect('component name');
    }
    const parameterList = ParameterListExpression.parse(state);

    const raw = state.playback();
    return new ComponentExpression(raw, name, parameterList);
  }

  public setParent(parent: SegmentExpression): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    this.parameterList.setParent(this);
  }

  public equals(other: ComponentExpression): boolean {
    return (
      this.name === other.name &&
      this.parameterList.equals(other.parameterList)
    );
  }

  public toString(): string {
    return this.raw;
  }
}

export class ActionExpression {
  public get kind(): ExpressionKind.Action { return ExpressionKind.Action; }

  public static get EMPTY(): ActionExpression { return new ActionExpression('', '', ParameterListExpression.EMPTY); }

  public readonly route!: RouteExpression;
  public readonly parent!: SegmentExpression;

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

      name = decodeURIComponent(state.playback());
      if (name.length === 0) {
        state.expect('method name');
      }
    }

    const parameterList = ParameterListExpression.parse(state);

    const raw = state.playback();
    return new ActionExpression(raw, name, parameterList);
  }

  public setParent(parent: SegmentExpression): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    this.parameterList.setParent(this);
  }

  public equals(other: ActionExpression): boolean {
    return (
      this.name === other.name &&
      this.parameterList.equals(other.parameterList)
    );
  }

  public toString(): string {
    return this.raw;
  }
}

export class ViewportExpression {
  public get kind(): ExpressionKind.Viewport { return ExpressionKind.Viewport; }

  public static get EMPTY(): ViewportExpression { return new ViewportExpression('', ''); }

  public readonly route!: RouteExpression;
  public readonly parent!: SegmentExpression;

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

      name = decodeURIComponent(state.playback());
      if (name.length === 0) {
        state.expect('viewport name');
      }
    }

    const raw = state.playback();
    return new ViewportExpression(raw, name);
  }

  public setParent(parent: SegmentExpression): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;
  }

  public equals(other: ViewportExpression): boolean {
    return this.name === other.name;
  }

  public toString(): string {
    return this.raw;
  }
}

export class ParameterListExpression {
  public get kind(): ExpressionKind.ParameterList { return ExpressionKind.ParameterList; }

  public static get EMPTY(): ParameterListExpression { return new ParameterListExpression('', []); }

  public readonly route!: RouteExpression;
  public readonly parent!: ComponentExpression | ActionExpression;

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

  public setParent(parent: ComponentExpression | ActionExpression): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;

    for (const expr of this.expressions) {
      expr.setParent(this);
    }
  }

  public equals(other: ParameterListExpression): boolean {
    return (
      this.expressions.length === other.expressions.length &&
      this.expressions.every(function (x, i) {
        return x.equals(other.expressions[i]);
      })
    );
  }

  public toString(): string {
    return this.raw;
  }
}

export class ParameterExpression {
  public get kind(): ExpressionKind.Parameter { return ExpressionKind.Parameter; }

  public static get EMPTY(): ParameterExpression { return new ParameterExpression('', '', ''); }

  public readonly route!: RouteExpression;
  public readonly parent!: ParameterListExpression;

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

  public setParent(parent: ParameterListExpression): void {
    (this as Writable<this>).parent = parent;
    (this as Writable<this>).route = parent.route;
  }

  public equals(other: ParameterExpression): boolean {
    return (
      this.key === other.key &&
      this.value === other.value
    );
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
