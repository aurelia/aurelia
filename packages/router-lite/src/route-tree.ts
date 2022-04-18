import {
  emptyObject,
  ILogger,
  onResolve,
  resolveAll,
  toArray,
  Writable,
} from '@aurelia/kernel';
import {
  ConfigurableRoute,
  Endpoint,
  RecognizedRoute,
} from '@aurelia/route-recognizer';
import {
  CustomElementDefinition,
} from '@aurelia/runtime-html';
import {
  ITypedNavigationInstruction_ResolvedComponent,
  ITypedNavigationInstruction_string,
  NavigationInstructionType,
  Params,
  ViewportInstruction,
  ViewportInstructionTree,
} from './instructions.js';
import {
  $RecognizedRoute,
  IRouteContext,
  RESIDUE,
} from './route-context.js';
import {
  defaultViewportName,
  RouteDefinition,
} from './route-definition.js';
import {
  ExpressionKind,
  RouteExpression,
  ScopedSegmentExpression,
  SegmentExpression,
} from './route-expression.js';
import {
  emptyQuery,
  IRouter,
  NavigationOptions,
} from './router.js';
import {
  ViewportRequest,
} from './viewport-agent.js';

export interface IRouteNode {
  path: string;
  finalPath: string;
  context: IRouteContext;
  /** Can only be `null` for the composition root */
  instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null;
  params?: Params;
  queryParams?: Readonly<URLSearchParams>;
  fragment?: string | null;
  data?: Params;
  viewport?: string | null;
  title?: string | ((node: RouteNode) => string | null) | null;
  component: CustomElementDefinition;
  append: boolean;
  children?: RouteNode[];
  residue?: ViewportInstruction[];
}

let nodeId: number = 0;

export class RouteNode implements IRouteNode {
  /** @internal */
  public tree!: RouteTree;
  /** @internal */
  public version: number = 1;

  public get root(): RouteNode {
    return this.tree.root;
  }

  private constructor(
    /** @internal */
    public id: number,
    /**
     * The original configured path pattern that was matched.
     */
    public path: string,
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    public finalPath: string,
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    public readonly context: IRouteContext,
    /** @internal */
    public readonly originalInstruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null,
    /** Can only be `null` for the composition root */
    public readonly instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null,
    public params: Params,
    public queryParams: Readonly<URLSearchParams>,
    public fragment: string | null,
    public data: Params,
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     */
    public viewport: string | null,
    public title: string | ((node: RouteNode) => string | null) | null,
    public component: CustomElementDefinition,
    public append: boolean,
    public readonly children: RouteNode[],
    /**
     * Not-yet-resolved viewport instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    public readonly residue: ViewportInstruction[],
  ) {
    this.originalInstruction = instruction;
  }

  public static create(input: IRouteNode): RouteNode {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [RESIDUE]: _, ...params } = input.params ?? {};
    return new RouteNode(
      /*          id */++nodeId,
      /*        path */input.path,
      /*   finalPath */input.finalPath,
      /*     context */input.context,
      /* originalIns */input.instruction,
      /* instruction */input.instruction,
      /*      params */params,
      /* queryParams */input.queryParams ?? emptyQuery,
      /*    fragment */input.fragment ?? null,
      /*        data */input.data ?? {},
      /*    viewport */input.viewport ?? null,
      /*       title */input.title ?? null,
      /*   component */input.component,
      /*      append */input.append,
      /*    children */input.children ?? [],
      /*     residue */input.residue ?? [],
    );
  }

  public contains(instructions: ViewportInstructionTree): boolean {
    if (this.context === instructions.options.context) {
      const nodeChildren = this.children;
      const instructionChildren = instructions.children;
      for (let i = 0, ii = nodeChildren.length; i < ii; ++i) {
        for (let j = 0, jj = instructionChildren.length; j < jj; ++j) {
          if (i + j < ii && (nodeChildren[i + j].instruction?.contains(instructionChildren[j]) ?? false)) {
            if (j + 1 === jj) {
              return true;
            }
          } else {
            break;
          }
        }
      }
    }

    return this.children.some(function (x) {
      return x.contains(instructions);
    });
  }

  public appendChild(child: RouteNode): void {
    this.children.push(child);
    child.setTree(this.tree);
  }

  public clearChildren(): void {
    for (const c of this.children) {
      c.clearChildren();
      c.context.vpa.cancelUpdate();
    }
    this.children.length = 0;
  }

  public getTitle(separator: string): string | null {
    const titleParts = [
      ...this.children.map(x => x.getTitle(separator)),
      this.getTitlePart(),
    ].filter(x => x !== null);
    if (titleParts.length === 0) {
      return null;
    }
    return titleParts.join(separator);
  }

  public getTitlePart(): string | null {
    if (typeof this.title === 'function') {
      return this.title.call(void 0, this);
    }
    return this.title;
  }

  public computeAbsolutePath(): string {
    if (this.context.isRoot) {
      return '';
    }
    const parentPath = this.context.parent!.node.computeAbsolutePath();
    const thisPath = this.instruction!.toUrlComponent(false);
    if (parentPath.length > 0) {
      if (thisPath.length > 0) {
        return [parentPath, thisPath].join('/');
      }
      return parentPath;
    }
    return thisPath;
  }

  /** @internal */
  public setTree(tree: RouteTree): void {
    this.tree = tree;
    for (const child of this.children) {
      child.setTree(tree);
    }
  }

  /** @internal */
  public finalizeInstruction(): ViewportInstruction {
    const children = this.children.map(x => x.finalizeInstruction());
    const instruction = this.instruction!.clone();
    instruction.children.splice(0, instruction.children.length, ...children);
    return (this as Writable<this>).instruction = instruction;
  }

  /** @internal */
  public clone(): RouteNode {
    const clone = new RouteNode(
      this.id,
      this.path,
      this.finalPath,
      this.context,
      this.originalInstruction,
      this.instruction,
      { ...this.params },
      { ...this.queryParams },
      this.fragment,
      { ...this.data },
      this.viewport,
      this.title,
      this.component,
      this.append,
      this.children.map(x => x.clone()),
      [...this.residue],
    );
    clone.version = this.version + 1;
    if (clone.context.node === this) {
      clone.context.node = clone;
    }
    return clone;
  }

  public toString(): string {
    const props: string[] = [];

    const component = this.context?.definition.component?.name ?? '';
    if (component.length > 0) {
      props.push(`c:'${component}'`);
    }

    const path = this.context?.definition.config.path ?? '';
    if (path.length > 0) {
      props.push(`path:'${path}'`);
    }

    if (this.children.length > 0) {
      props.push(`children:[${this.children.map(String).join(',')}]`);
    }

    if (this.residue.length > 0) {
      props.push(`residue:${this.residue.map(function (r) {
        if (typeof r === 'string') {
          return `'${r}'`;
        }
        return String(r);
      }).join(',')}`);
    }

    return `RN(ctx:'${this.context?.friendlyPath}',${props.join(',')})`;
  }
}

export class RouteTree {
  public constructor(
    public readonly options: NavigationOptions,
    public readonly queryParams: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
    public root: RouteNode,
  ) { }

  public contains(instructions: ViewportInstructionTree): boolean {
    return this.root.contains(instructions);
  }

  public clone(): RouteTree {
    const clone = new RouteTree(
      this.options.clone(),
      { ...this.queryParams },
      this.fragment,
      this.root.clone(),
    );
    clone.root.setTree(this);
    return clone;
  }

  public finalizeInstructions(): ViewportInstructionTree {
    return new ViewportInstructionTree(
      this.options,
      true,
      this.root.children.map(x => x.finalizeInstruction()),
      this.queryParams,
      this.fragment,
    );
  }

  public toString(): string {
    return this.root.toString();
  }
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
export function updateRouteTree(
  rt: RouteTree,
  vit: ViewportInstructionTree,
  ctx: IRouteContext,
): Promise<void> | void {
  const log = ctx.container.get(ILogger).scopeTo('RouteTree');

  // The root of the routing tree is always the CompositionRoot of the Aurelia app.
  // From a routing perspective it's simply a "marker": it does not need to be loaded,
  // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
  // other than by reading (deps, optional route config, owned viewports) from it.
  const rootCtx = ctx.root;

  (rt as Writable<RouteTree>).options = vit.options;
  (rt as Writable<RouteTree>).queryParams = vit.queryParams;
  (rt as Writable<RouteTree>).fragment = vit.fragment;

  if (vit.isAbsolute) {
    ctx = rootCtx;
  }
  if (ctx === rootCtx) {
    rt.root.setTree(rt);
    rootCtx.node = rt.root;
  }

  const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
  log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
  return onResolve(ctx.resolved, () => {
    return updateNode(log, vit, ctx, rootCtx.node);
  });
}

function updateNode(
  log: ILogger,
  vit: ViewportInstructionTree,
  ctx: IRouteContext,
  node: RouteNode,
): Promise<void> | void {
  log.trace(`updateNode(ctx:%s,node:%s)`, ctx, node);

  node.queryParams = vit.queryParams;
  node.fragment = vit.fragment;

  let maybePromise: void | Promise<void>;
  if (!node.context.isRoot) {
    // TODO(fkleuver): store `options` on every individual instruction instead of just on the tree, or split it up etc? this needs a bit of cleaning up
    maybePromise = node.context.vpa.scheduleUpdate(node.tree.options, node);
  } else {
    maybePromise = void 0;
  }

  return onResolve(maybePromise, () => {
    if (node.context === ctx) {
      // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
      node.clearChildren();
      return onResolve(resolveAll(...vit.children.map(vi => {
        return createAndAppendNodes(log, node, vi, node.tree.options.append || vi.append);
      })), () => {
        return resolveAll(...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
          const defaultInstruction = ViewportInstruction.create({
            component: vpa.viewport.default,
            viewport: vpa.viewport.name,
          });
          return createAndAppendNodes(log, node, defaultInstruction, node.append);
        }));
      });
    }

    // Drill down until we're at the node whose context matches the provided navigation context
    return resolveAll(...node.children.map(child => {
      return updateNode(log, vit, ctx, child);
    }));
  });
}

export function processResidue(node: RouteNode): Promise<void> | void {
  const ctx = node.context;
  const log = ctx.container.get(ILogger).scopeTo('RouteTree');

  const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
  log.trace(`processResidue(node:%s)${suffix}`, node);
  return onResolve(ctx.resolved, () => {
    return resolveAll(
      ...node.residue.splice(0).map(vi => {
        return createAndAppendNodes(log, node, vi, node.append);
      }),
      ...ctx.getAvailableViewportAgents('static').map(vpa => {
        const defaultInstruction = ViewportInstruction.create({
          component: vpa.viewport.default,
          viewport: vpa.viewport.name,
        });
        return createAndAppendNodes(log, node, defaultInstruction, node.append);
      }),
    );
  });
}

export function getDynamicChildren(node: RouteNode): Promise<readonly RouteNode[]> | readonly RouteNode[] {
  const ctx = node.context;
  const log = ctx.container.get(ILogger).scopeTo('RouteTree');

  const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
  log.trace(`getDynamicChildren(node:%s)${suffix}`, node);
  return onResolve(ctx.resolved, () => {
    const existingChildren = node.children.slice();
    return onResolve(
      resolveAll(
        ...node.residue.splice(0).map(vi => {
          return createAndAppendNodes(log, node, vi, node.append);
        }),
        ...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
          const defaultInstruction = ViewportInstruction.create({
            component: vpa.viewport.default,
            viewport: vpa.viewport.name,
          });
          return createAndAppendNodes(log, node, defaultInstruction, node.append);
        }),
      ),
      () => {
        return node.children.filter(x => !existingChildren.includes(x));
      },
    );
  });
}

export function createAndAppendNodes(
  log: ILogger,
  node: RouteNode,
  vi: ViewportInstruction,
  append: boolean,
): void | Promise<void> {
  log.trace(`createAndAppendNodes(node:%s,vi:%s,append:${append})`, node, vi);

  switch (vi.component.type) {
    case NavigationInstructionType.string:
      switch (vi.component.value) {
        case '..':
          // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
          node.clearChildren();
          node = node.context.parent?.node ?? node;
        // falls through
        case '.':
          return resolveAll(...vi.children.map(childVI => {
            return createAndAppendNodes(log, node, childVI, childVI.append);
          }));
        default: {
          log.trace(`createAndAppendNodes invoking createNode`);
          const childNode = createNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>, append);
          if (childNode === null) {
            return;
          }
          return appendNode(log, node, childNode);
        }
      }
    case NavigationInstructionType.IRouteViewModel:
    case NavigationInstructionType.CustomElementDefinition: {
      const rd = RouteDefinition.resolve(vi.component.value);
      const params = vi.params ?? emptyObject;
      const rr = new $RecognizedRoute(
        new RecognizedRoute(
          new Endpoint(
            // TODO(sayan): probably need to do parameter matching and select the "most-matched" path instead of picking the first
            new ConfigurableRoute(rd.path[0], rd.caseSensitive, rd),
            toArray(Object.values(params))
          ),
          params
        ),
        null);
      const childNode = createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, append, rr);
      return appendNode(log, node, childNode);
    }
  }
}

function createNode(
  log: ILogger,
  node: RouteNode,
  vi: ViewportInstruction<ITypedNavigationInstruction_string>,
  append: boolean,
): RouteNode | Promise<RouteNode> | null {
  const ctx = node.context;
  let collapse: number = 0;
  let path = vi.component.value;
  let cur = vi as ViewportInstruction;
  while (cur.children.length === 1) {
    cur = cur.children[0];
    if (cur.component.type === NavigationInstructionType.string) {
      ++collapse;
      path = `${path}/${cur.component.value}`;
    } else {
      break;
    }
  }

  const rr = ctx.recognize(path);
  const residue = rr?.residue ?? null;
  log.trace('createNode residue:', residue);
  const noResidue = residue === null;
  // If the residue matches the whole path it means that empty route is configured, but the path in itself is not configured.
  // Therefore the path matches the configured empty route and puts the whole path into residue.
  if (rr === null || residue === path) {
    const name = vi.component.value;
    if (name === '') {
      return null;
    }
    let vp = vi.viewport;
    if (vp === null || vp.length === 0) vp = defaultViewportName;
    const vpa = ctx.getFallbackViewportAgent('dynamic', vp);
    const fallback = vpa === null ? ctx.definition.fallback : vpa.viewport.fallback;
    if(fallback === null)
      throw new Error(`Neither the route '${name}' matched any configured route at '${ctx.friendlyPath}' nor a fallback is configured for the viewport '${vp}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);

    // fallback: id -> route -> CEDefn (Route definition)
    // look for a route first
    log.trace(`Fallback is set to '${fallback}'. Looking for a recognized route.`);
    const rd = (ctx.childRoutes as RouteDefinition[]).find(x => x.id === fallback);
    if(rd !== void 0) return createFallbackNode(log, rd, node, vi, append);

    log.trace(`No route definition for the fallback '${fallback}' is found; trying to recognize the route.`);
    const rr = ctx.recognize(fallback);
    if(rr !== null) return createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, append, rr);

    // fallback is not recognized as a configured route; treat as CE and look for a route definition.
    log.trace(`The fallback '${fallback}' is not recognized as a route; treating as custom element name.`);
    return createFallbackNode(log, RouteDefinition.resolve(fallback, ctx), node, vi, append);
  }

  // readjust the children wrt. the residue
  (rr as Writable<$RecognizedRoute>).residue = null;
  (vi.component as Writable<ITypedNavigationInstruction_string>).value = noResidue
    ? path
    : path.slice(0, -(residue.length + 1));

  for (let i = 0; i < collapse; ++i) {
    const child = vi.children[0];
    if (residue?.startsWith(child.component.value as string) ?? false) break;
    (vi as Writable<ViewportInstruction>).children = child.children;
  }
  log.trace('createNode after adjustment vi:%s', vi);
  return createConfiguredNode(log, node, vi, append, rr);
}

function createConfiguredNode(
  log: ILogger,
  node: RouteNode,
  vi: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
  append: boolean,
  rr: $RecognizedRoute,
  route: ConfigurableRoute<RouteDefinition | Promise<RouteDefinition>> = rr.route.endpoint.route,
): RouteNode | Promise<RouteNode> {
  const ctx = node.context;
  const rt = node.tree;
  return onResolve(route.handler, $handler => {
    route.handler = $handler;

    log.trace(`creatingConfiguredNode(rd:%s, vi:%s)`, $handler, vi);

    if ($handler.redirectTo === null) {
      const vpName: string = ((vi.viewport?.length ?? 0) > 0 ? vi.viewport : $handler.viewport)!;
      const ced = $handler.component!;

      const vpa = ctx.resolveViewportAgent(new ViewportRequest(
        vpName,
        ced.name,
        rt.options.resolutionMode,
        append,
      ));

      const router = ctx.container.get(IRouter);
      const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.container);

      log.trace('createConfiguredNode setting the context node');
      childCtx.node = RouteNode.create({
        path: rr.route.endpoint.route.path,
        finalPath: route.path,
        context: childCtx,
        instruction: vi,
        params: {
          ...node.params,
          ...rr.route.params
        },
        queryParams: rt.queryParams,
        fragment: rt.fragment,
        data: $handler.data,
        viewport: vpName,
        component: ced,
        append,
        title: $handler.config.title,
        residue: [
          // TODO(sayan): this can be removed; need to inspect more.
          ...(rr.residue === null ? [] : [ViewportInstruction.create(rr.residue)]),
          ...vi.children,
        ],
      });
      childCtx.node.setTree(node.tree);

      log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, childCtx.node);

      return childCtx.node;
    }

    // Migrate parameters to the redirect
    const origPath = RouteExpression.parse(route.path, false);
    const redirPath = RouteExpression.parse($handler.redirectTo, false);
    let origCur: ScopedSegmentExpression | SegmentExpression;
    let redirCur: ScopedSegmentExpression | SegmentExpression;
    const newSegs: string[] = [];
    switch (origPath.root.kind) {
      case ExpressionKind.ScopedSegment:
      case ExpressionKind.Segment:
        origCur = origPath.root;
        break;
      default:
        throw new Error(`Unexpected expression kind ${origPath.root.kind}`);
    }
    switch (redirPath.root.kind) {
      case ExpressionKind.ScopedSegment:
      case ExpressionKind.Segment:
        redirCur = redirPath.root;
        break;
      default:
        throw new Error(`Unexpected expression kind ${redirPath.root.kind}`);
    }

    let origSeg: SegmentExpression | null;
    let redirSeg: SegmentExpression | null;
    let origDone: boolean = false;
    let redirDone: boolean = false;
    while (!(origDone && redirDone)) {
      if (origDone) {
        origSeg = null;
      } else if (origCur.kind === ExpressionKind.Segment) {
        origSeg = origCur;
        origDone = true;
      } else if (origCur.left.kind === ExpressionKind.Segment) {
        origSeg = origCur.left;
        switch (origCur.right.kind) {
          case ExpressionKind.ScopedSegment:
          case ExpressionKind.Segment:
            origCur = origCur.right;
            break;
          default:
            throw new Error(`Unexpected expression kind ${origCur.right.kind}`);
        }
      } else {
        throw new Error(`Unexpected expression kind ${origCur.left.kind}`);
      }
      if (redirDone) {
        redirSeg = null;
      } else if (redirCur.kind === ExpressionKind.Segment) {
        redirSeg = redirCur;
        redirDone = true;
      } else if (redirCur.left.kind === ExpressionKind.Segment) {
        redirSeg = redirCur.left;
        switch (redirCur.right.kind) {
          case ExpressionKind.ScopedSegment:
          case ExpressionKind.Segment:
            redirCur = redirCur.right;
            break;
          default:
            throw new Error(`Unexpected expression kind ${redirCur.right.kind}`);
        }
      } else {
        throw new Error(`Unexpected expression kind ${redirCur.left.kind}`);
      }

      if (redirSeg !== null) {
        if (redirSeg.component.isDynamic && (origSeg?.component.isDynamic ?? false)) {
          newSegs.push(rr.route.params[origSeg!.component.name] as string);
        } else {
          newSegs.push(redirSeg.raw);
        }
      }
    }

    const newPath = newSegs.filter(Boolean).join('/');

    const redirRR = ctx.recognize(newPath);
    if (redirRR === null) throw new Error(`'${newPath}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${newPath}' to the routes list of the route decorator of '${ctx.component.name}'?`);

    return createConfiguredNode(log, node, vi, append, rr, redirRR.route.endpoint.route);
  });
}

function appendNode(
  log: ILogger,
  node: RouteNode,
  childNode: RouteNode | Promise<RouteNode>,
): void | Promise<void> {
  return onResolve(childNode, $childNode => {
    log.trace(`appendNode($childNode:%s)`, $childNode);
    node.appendChild($childNode);
    return $childNode.context.vpa.scheduleUpdate(node.tree.options, $childNode);
  });
}

/**
 * Creates route node from the given RouteDefinition `rd` for a unknown path (non-configured route).
 */
function createFallbackNode(
  log: ILogger,
  rd: RouteDefinition,
  node: RouteNode,
  vi: ViewportInstruction<ITypedNavigationInstruction_string>,
  append: boolean,
): RouteNode | Promise<RouteNode> {
  // we aren't migrating the parameters for missing route
  const rr = new $RecognizedRoute(
    new RecognizedRoute(
      new Endpoint(
        new ConfigurableRoute(rd.path[0], rd.caseSensitive, rd),
        []
      ),
      emptyObject
    ),
    null);
  return createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, append, rr);
}
