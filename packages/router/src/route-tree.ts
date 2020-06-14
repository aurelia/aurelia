/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  PLATFORM,
  IIndexable,
  DI,
  ILogger,
} from '@aurelia/kernel';
import {
  CustomElementDefinition,
  CustomElement,
} from '@aurelia/runtime';

import {
  SegmentExpression,
  RouteExpression,
  CompositeSegmentExpressionOrHigher,
  ExpressionKind,
} from './route-expression';
import {
  Routeable,
  RouteableComponent,
} from './route';
import {
  IRouteContext,
  RouteContext,
} from './route-context';
import {
  shallowEquals,
} from './validation';
import {
  RoutingMode,
  Transition,
} from './router';

/**
 * Either a `RouteableComponent`, a string (name) that can be resolved to one or a ViewportInstruction:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IViewportInstruction`: a viewport instruction object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `Routeable` only in having `IViewportIntruction` instead of `IChildRouteConfig`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type NavigationInstruction = (
  string |
  IViewportInstruction |
  RouteableComponent
);

export const IViewportInstruction = DI.createInterface<IViewportInstruction>('IViewportInstruction').noDefault();
// All properties except `component` are optional.
export interface IViewportInstruction extends
  Omit<Partial<ViewportInstruction>, 'component'>,
  Pick<ViewportInstruction, 'component'> { }

export class ViewportInstruction {
  public constructor(
    /**
     * The component to load.
     *
     * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
     * - `RouteType`: a custom element class with optional static properties that specify routing-specific attributes.
     * - `PartialCustomElementDefinition`: either a complete `CustomElementDefinition` or a partial definition (e.g. an object literal with at least the `name` property)
     * - `IRouteViewModel`: an existing component instance.
     */
    public readonly component: string | RouteableComponent,
    /**
     * The name of the viewport this component should be loaded into.
     */
    public readonly viewport: string | null,
    /**
     * The parameters to pass into the component.
     */
    public readonly params: Readonly<IIndexable>,
    /**
     * The child routes to load underneath the context of this instruction's component.
     */
    public readonly children: readonly NavigationInstruction[],
  ) { }

  public static create(
    input: IViewportInstruction,
  ): ViewportInstruction {
    return new ViewportInstruction(
      input.component,
      input.viewport ?? null,
      input.params ?? {},
      input.children ?? [],
    );
  }

  public toString(): string {
    // TODO: write some shared serialization logic and use it in this toString() method
    return `ViewportInstruction(component:${this.component},viewport:${this.viewport},children.length:${this.children.length})`;
  }
}

export interface IRouteNode {
  context: IRouteContext;
  matchedSegments: readonly SegmentExpression[];
  params?: IIndexable;
  queryParams?: IIndexable;
  fragment?: string | null;
  data?: IIndexable;
  viewport?: string | null;
  component: Routeable | null;
  append: boolean;
  children?: RouteNode[];
  residue?: NavigationInstruction[];
}
export class RouteNode implements IRouteNode {
  /** @internal */
  public tree!: RouteTree;
  /** @internal */
  public version: number = 1;
  /** @internal */
  public snapshot: RouteNode | null = null;

  public get root(): RouteNode {
    return this.tree.root;
  }

  public getParent(): RouteNode | null {
    return this.tree.parent(this);
  }

  private constructor(
    /**
     * The `RouteContext` that this route is a child of..
     */
    public readonly context: IRouteContext,
    public readonly matchedSegments: readonly SegmentExpression[],
    public params: IIndexable,
    public queryParams: IIndexable,
    public fragment: string | null,
    public data: IIndexable,
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     */
    public viewport: string | null,
    public component: Routeable | null,
    public append: boolean,
    public readonly children: RouteNode[],
    /**
     * Not-yet-resolved navigation instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    public readonly residue: NavigationInstruction[],
  ) { }

  public static create(
    input: IRouteNode,
  ): RouteNode {
    return new RouteNode(
      /*         context */input.context,
      /* matchedSegments */input.matchedSegments,
      /*          params */input.params ?? {},
      /*     queryParams */input.queryParams ?? {},
      /*        fragment */input.fragment ?? null,
      /*            data */input.data ?? {},
      /*        viewport */input.viewport ?? null,
      /*       component */input.component,
      /*          append */input.append,
      /*        children */input.children ?? [],
      /*         residue */input.residue ?? [],
    );
  }

  public appendChild(child: RouteNode): void {
    this.children.push(child);
    child.setTree(this.tree);
  }

  public appendChildren(...children: readonly RouteNode[]): void {
    for (const child of children) {
      this.appendChild(child);
    }
  }

  /** @internal */
  public setTree(tree: RouteTree): void {
    this.tree = tree;
    for (const child of this.children) {
      child.setTree(tree);
    }
  }

  /** @internal */
  public findParent(value: RouteNode): RouteNode | null {
    if (value === this) {
      return null;
    }

    for (const child of this.children) {
      if (child === value) {
        return this;
      }

      const parent = child.findParent(value);
      if (parent !== null) {
        return parent;
      }
    }

    return null;
  }

  /** @internal */
  public findPath(value: RouteNode): RouteNode[] {
    if (value === this) {
      return [this];
    }

    for (const child of this.children) {
      const path = child.findPath(value);
      if (path.length > 0) {
        path.unshift(this);
        return path;
      }
    }

    return PLATFORM.emptyArray;
  }

  public clone(): RouteNode {
    const clone = new RouteNode(
      this.context,
      this.matchedSegments,
      { ...this.params },
      { ...this.queryParams },
      this.fragment,
      { ...this.data },
      this.viewport,
      this.component,
      this.append,
      this.children.map(function (childNode) {
        return childNode.clone();
      }),
      [...this.residue],
    );
    clone.version = this.version + 1;
    return clone;
  }

  public makeSnapshot(): void {
    this.snapshot = this.clone();
  }

  /**
   * Performs a shallow equality check on `params`, `queryParams` and `data`,
   * performs a value/reference equality on all other properties.
   *
   * Does not compare `children` or `rawInstructions`.
   */
  public shallowEquals(other: RouteNode): boolean {
    return (
      this.context === other.context &&
      this.matchedSegments === other.matchedSegments &&
      shallowEquals(this.params, other.params) &&
      shallowEquals(this.queryParams, other.queryParams) &&
      this.fragment === other.fragment &&
      shallowEquals(this.data, other.data) &&
      this.viewport === other.viewport &&
      this.component === other.component &&
      this.append === other.append
    );
  }

  public toString(): string {
    const route = this.matchedSegments.map(x => x.toString()).join('/');
    const path = this.context?.definition.config.path ?? '';
    const component = this.context?.definition.component.name ?? '';
    return `RouteNode(route:'${route}',path:'${path}',component:'${component}',viewport:'${this.viewport}',children.length:${this.children.length},residue.length:${this.residue.length})`;
  }
}

export class RouteTree {
  public constructor(
    public url: string,
    public root: RouteNode,
  ) { }

  public parent(value: RouteNode): RouteNode | null {
    if (value === this.root) {
      return null;
    }

    const path = this.root.findPath(value);
    return path[path.length - 2];
  }

  public siblings(value: RouteNode): RouteNode[] {
    return this.root.findParent(value)?.children ?? PLATFORM.emptyArray;
  }

  public pathFromRoot(value: RouteNode): RouteNode[] {
    return this.root.findPath(value);
  }

  public clone(): RouteTree {
    const clone = new RouteTree(
      this.url,
      this.root.clone(),
    );
    clone.root.setTree(this);
    return clone;
  }

  public toString(): string {
    return this.root.toString();
  }
}

export class RouteTreeCompiler {
  private readonly logger: ILogger;
  private readonly mode: RoutingMode;

  public constructor(
    private readonly route: RouteExpression,
    private readonly ctx: IRouteContext,
    private readonly transition: Transition,
  ) {
    this.mode = transition.options.getRoutingMode(route.raw);
    this.logger = ctx.get(ILogger).scopeTo('RouteTreeBuilder');
  }

  /**
   * Returns a stateful `RouteTree` based on the provided context and transition.
   *
   * This expression will always start from the root context and build a new complete tree, up until (and including)
   * the context that was passed-in.
   *
   * If there are any additional child navigations to be resolved lazily, those will be added to the leaf
   * `RouteNode`s `residue` property which is then resolved by the router after the leaf node is loaded.
   *
   * This means that a `RouteTree` can (and often will) be built incrementally during the loading process.
   */
  public static compileRoot(
    route: RouteExpression,
    ctx: IRouteContext,
    transition: Transition,
  ): RouteTree {
    const compiler = new RouteTreeCompiler(route, ctx, transition);
    return compiler.compileRoot();
  }

  public static compileResidue(
    route: RouteExpression,
    ctx: IRouteContext,
    transition: Transition,
  ): void {
    const compiler = new RouteTreeCompiler(route, ctx, transition);
    compiler.compileResidue();
  }

  private compileRoot(): RouteTree {
    this.logger.trace(`compileRoot()`);

    const route = this.route;
    const ctx = this.ctx.root;

    // The root of the routing tree is always the CompositionRoot of the Aurelia app.
    // From a routing perspective it's simply a "marker": it does not need to be loaded,
    // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
    // other than by reading (deps, optional route config, owned viewports) from it.

    // Update the node of the root context before doing anything else, to make it accessible to children
    // as they are compiled
    ctx.node = RouteNode.create({
      context: ctx,
      matchedSegments: route.segments,
      queryParams: { ...route.queryParams },
      fragment: route.fragment,
      component: ctx.definition,
      append: false,
    });

    this.compile(route.root, 0, this.transition.options.append);

    return new RouteTree(route.raw, ctx.node);
  }

  private compileResidue(): void {
    this.logger.trace(`compileResidue()`);

    const ctx = this.ctx;
    const depth = ctx.path.indexOf(ctx);
    const parent = ctx.node;
    while (parent.residue.length > 0) {
      const current = parent.residue.shift()!;
      if (typeof current === 'string') {
        const expr = RouteExpression.parse(current, false);
        this.compile(expr.root, depth, parent.append);
      } else {
        throw new Error(`Not yet implemented instruction type: ${current}`);
      }
    }
  }

  private compile(
    expr: CompositeSegmentExpressionOrHigher,
    depth: number,
    append: boolean,
  ): void {
    this.logger.trace(`compile(expr:'${expr}',depth:${depth},append:${append})`);

    switch (expr.kind) {
      case ExpressionKind.SegmentGroup: {
        // No special processing at the moment, just drill down. May need to look into this again if we want to do something with scoping with parens.
        this.compile(expr.expression, depth, append);
        break;
      }
      case ExpressionKind.CompositeSegment: {
        for (const sibling of expr.siblings) {
          // Append applies if either the parent says so or if this CompositeSegment says so,
          // meaning that '+(a+b)' (parent says so) and '(+a+b)' (CompositeSegment says so) would both result in append=true.
          // The only thing that resets it back to false is the right-hand side of a ScopedSegment,
          // meaning that '+a/(c+b)' would result in 'a' would get append=true but '(b+c)' would get append=false (since they're in a child scope).
          this.compile(sibling, depth, append || expr.append);
        }
        break;
      }
      case ExpressionKind.Segment: {
        const children = this.resolve(expr, depth, append);
        this.ctx.path[depth].node.appendChildren(...children);
        break;
      }
      case ExpressionKind.ScopedSegment: {
        loop: while (
          expr.kind === ExpressionKind.ScopedSegment &&
          // Note: it doesn't really make sense for `left` to be anything other than Segment at the moment.
          // We might just remove that possibility from the syntax at some point.
          expr.left.kind === ExpressionKind.Segment
        ) {
          switch (expr.left.component.name) {
            case '..':
              expr = expr.right;
              // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
              depth = Math.max(depth - 1, 0);
              break;
            case '.':
              // Ignore '.'
              expr = expr.right;
              break;
            case '~':
              // Go to root
              expr = expr.right;
              depth = 0;
              break;
            default:
              break loop;
          }
        }

        const children = this.resolve(expr, depth, append);
        this.ctx.path[depth].node.appendChildren(...children);
        break;
      }
    }
  }

  private resolve(
    expr: CompositeSegmentExpressionOrHigher,
    depth: number,
    append: boolean,
  ): RouteNode[] {
    this.logger.trace(`resolve(expr:'${expr}',depth:${depth},append:${append}) in '${this.mode}' mode at ${this.ctx.path[depth]}`);

    switch (this.mode) {
      case 'configured-first': {
        const configuredNode = this.resolveConfigured(expr, depth, append);
        if (configuredNode !== null) {
          return [configuredNode];
        }

        const directNodes = this.resolveDirect(expr, depth, append);
        if (directNodes !== null) {
          return directNodes;
        }
        break;
      }
      case 'configured-only': {
        const configuredNode = this.resolveConfigured(expr, depth, append);
        if (configuredNode !== null) {
          return [configuredNode];
        }
        break;
      }
      case 'direct-first': {
        const directNodes = this.resolveDirect(expr, depth, append);
        if (directNodes !== null) {
          return directNodes;
        }

        const configuredNode = this.resolveConfigured(expr, depth, append);
        if (configuredNode !== null) {
          return [configuredNode];
        }
        break;
      }
      case 'direct-only': {
        const directNodes = this.resolveDirect(expr, depth, append);
        if (directNodes !== null) {
          return directNodes;
        }
        break;
      }
    }

    throw new Error(`Could not resolve '${expr.raw}' in '${this.mode}' mode at ${this.ctx.path[depth]}`);
  }

  private resolveConfigured(
    expr: CompositeSegmentExpressionOrHigher,
    depth: number,
    append: boolean,
  ): RouteNode | null {
    const ctx = this.ctx.path[depth];

    const result = ctx.recognize(expr.raw);
    if (result === null) {
      this.logger.trace(`resolveConfigured(expr:'${expr}',depth:${depth},append:${append}) -> null`);

      return null;
    }

    const endpoint = result.endpoint;
    const viewportAgent = ctx.resolveViewportAgent(endpoint.route.viewport, append, this.transition);
    const childCtx = RouteContext.getOrCreate(
      viewportAgent,
      endpoint.route.component,
      viewportAgent.hostController.context,
    );

    childCtx.node = RouteNode.create({
      context: childCtx,
      matchedSegments: expr.segments,
      params: result.params, // TODO: params inheritance
      queryParams: expr.route.queryParams, // TODO: queryParamsStrategy
      fragment: expr.route.fragment, // TODO: fragmentStrategy
      data: endpoint.route.data,
      viewport: endpoint.route.viewport,
      component: endpoint.route.component,
      append: append,
      residue: result.residue === null ? [] : [result.residue],
    });

    this.logger.trace(`resolveConfigured(expr:'${expr}',depth:${depth},append:${append}) -> ${childCtx.node}`);

    return childCtx.node;
  }

  private resolveDirect(
    expr: CompositeSegmentExpressionOrHigher,
    depth: number,
    append: boolean,
  ): RouteNode[] | null {
    const ctx = this.ctx.path[depth];

    switch (expr.kind) {
      case ExpressionKind.SegmentGroup: {
        this.logger.trace(`resolveDirect(expr:'${expr}',depth:${depth},append:${append}) - SegmentGroup`);

        // No special processing at the moment, just drill down. May need to look into this again if we want to do something with scoping with parens.
        return this.resolveDirect(expr.expression, depth, append);
      }
      case ExpressionKind.CompositeSegment: {
        this.logger.trace(`resolveDirect(expr:'${expr}',depth:${depth},append:${append}) - CompositeSegment`);

        const siblings: RouteNode[] = [];
        for (const sibling of expr.siblings) {
          const nodes = this.resolve(sibling, depth, append || expr.append);
          siblings.push(...nodes);
        }
        return siblings;
      }
      case ExpressionKind.Segment: {
        const component: CustomElementDefinition | null = ctx.findResource(CustomElement, expr.component.name);
        if (component === null) {
          this.logger.trace(`resolveDirect(expr:'${expr}',depth:${depth},append:${append}) - Segment -> null`);

          return null;
        }

        const viewportAgent = ctx.resolveViewportAgent(expr.viewport.name, append, this.transition);
        const childCtx = RouteContext.getOrCreate(
          viewportAgent,
          component,
          viewportAgent.hostController.context,
        );

        // TODO: add ActionExpression state representation to RouteNode
        childCtx.node = RouteNode.create({
          context: childCtx,
          matchedSegments: expr.segments,
          params: {}, // TODO: get params & do params inheritance
          queryParams: expr.route.queryParams, // TODO: queryParamsStrategy
          fragment: expr.route.fragment, // TODO: fragmentStrategy
          data: {}, // TODO: pass in data from instruction
          viewport: expr.viewport.name,
          component: component,
          append: append,
        });

        this.logger.trace(`resolveDirect(expr:'${expr}',depth:${depth},append:${append}) - Segment -> ${childCtx.node}`);

        return [childCtx.node];
      }
      case ExpressionKind.ScopedSegment: {
        // Stay in "direct" resolution mode for a single segment
        const nodes = this.resolveDirect(expr.left, depth, append);
        if (nodes === null) {
          this.logger.trace(`resolveDirect(expr:'${expr}',depth:${depth},append:${append}) - ScopedSegment -> null`);

          return null;
        }

        if (nodes.length > 1) {
          // e.g. '(a+b)/c', which doesn't really make sense (at least as far as we know right now..)
          throw new Error(`Invalid left-hand side of scoped segment: ${expr.left}`);
        }

        const scope = nodes[0];

        this.logger.trace(`resolveDirect(expr:'${expr}',depth:${depth},append:${append}) - ScopedSegment -> ${scope}`);

        if (ctx === this.ctx) {
          // We've reached the leaf context and can't deterministically resolve any further, so add it to `residue` to let the router try again after loading `left`.
          scope.residue.push(expr.right.raw);
          return nodes;
        }

        // Go back into "mixed" resolution mode in the child scope (which will have different config)
        const children = this.resolve(expr.right, depth + 1, false);
        scope.appendChildren(...children);
        return nodes;
      }
    }
  }
}
