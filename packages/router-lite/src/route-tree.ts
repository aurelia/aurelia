import {
  emptyObject,
  type ILogger,
  onResolve,
  resolveAll,
  Writable,
} from '@aurelia/kernel';
import {
  ConfigurableRoute,
  Endpoint,
  RecognizedRoute,
  RESIDUE,
} from '@aurelia/route-recognizer';
import type {
  CustomElementDefinition,
} from '@aurelia/runtime-html';
import {
  ITypedNavigationInstruction_ResolvedComponent,
  ITypedNavigationInstruction_string,
  NavigationInstruction,
  NavigationInstructionType,
  Params,
  ViewportInstruction,
  ViewportInstructionTree,
  defaultViewportName,
} from './instructions';
import {
  $RecognizedRoute,
  type IRouteContext,
} from './route-context';
import {
  RouteDefinition,
} from './route-definition';
import {
  ExpressionKind,
  RouteExpression,
  type ScopedSegmentExpression,
  type SegmentExpression,
} from './route-expression';
import {
  emptyQuery,
  IRouter,
  UnknownRouteError,
} from './router';
import {
  type NavigationOptions,
} from './options';
import { mergeURLSearchParams } from './util';
import {
  ViewportRequest,
} from './viewport-agent';

export interface IRouteNode {
  path: string;
  finalPath: string;
  context: IRouteContext;
  /** Can only be `null` for the composition root */
  instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null;
  params?: Params;
  queryParams?: Readonly<URLSearchParams>;
  fragment?: string | null;
  data?: Record<string, unknown>;
  viewport?: string | null;
  title?: string | ((node: RouteNode) => string | null) | null;
  component: CustomElementDefinition;
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
    public data: Record<string, unknown>,
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
    this.originalInstruction ??= instruction;
  }

  public static create(input: IRouteNode & { originalInstruction?: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null }): RouteNode {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [RESIDUE]: _, ...params } = input.params ?? {};
    return new RouteNode(
      /*          id */++nodeId,
      /*        path */input.path,
      /*   finalPath */input.finalPath,
      /*     context */input.context,
      /* originalIns */input.originalInstruction ?? input.instruction,
      /* instruction */input.instruction,
      /*      params */params,
      /* queryParams */input.queryParams ?? emptyQuery,
      /*    fragment */input.fragment ?? null,
      /*        data */input.data ?? {},
      /*    viewport */input.viewport ?? null,
      /*       title */input.title ?? null,
      /*   component */input.component,
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
          if (i + j < ii && (nodeChildren[i + j].originalInstruction?.contains(instructionChildren[j]) ?? false)) {
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
      new URLSearchParams(this.queryParams),
      this.fragment,
      { ...this.data },
      this.viewport,
      this.title,
      this.component,
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
      new URLSearchParams(this.queryParams),
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

export function createAndAppendNodes(
  log: ILogger,
  node: RouteNode,
  vi: ViewportInstruction,
): void | Promise<void> {
  log.trace(`createAndAppendNodes(node:%s,vi:%s`, node, vi);

  switch (vi.component.type) {
    case NavigationInstructionType.string:
      switch (vi.component.value) {
        case '..':
          // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
          node = node.context.parent?.node ?? node;
          node.clearChildren();
        // falls through
        case '.':
          return resolveAll(...vi.children.map(childVI => {
            return createAndAppendNodes(log, node, childVI);
          }));
        default: {
          log.trace(`createAndAppendNodes invoking createNode`);
          const ctx = node.context;
          const originalInstruction = (vi as ViewportInstruction<ITypedNavigationInstruction_string>).clone();
          let rr = vi.recognizedRoute;
          // early return; we already have a recognized route, don't bother with the rest.
          if (rr !== null) return appendNode(log, node, createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>, rr, originalInstruction));

          // if there are children, then then it might be the case that the parameters are put in the children, and that case it is best to go the default flow.
          // However, when that's not the case, then we perhaps try to lookup the route-id.
          // This is another early termination.
          if (vi.children.length === 0) {
            const result = ctx.generateViewportInstruction(vi);
            if (result !== null) {
              (node.tree as Writable<RouteTree>).queryParams = mergeURLSearchParams(node.tree.queryParams, result.query, true);
              const newVi = result.vi;
              (newVi.children as NavigationInstruction[]).push(...vi.children);
              return appendNode(
                log,
                node,
                createConfiguredNode(
                  log,
                  node,
                  newVi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
                  newVi.recognizedRoute!,
                  vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>
                )
              );
            }
          }

          let collapse: number = 0;
          let path = vi.component.value;
          let cur = vi;
          while (cur.children.length === 1) {
            cur = cur.children[0];
            if (cur.component.type === NavigationInstructionType.string) {
              ++collapse;
              path = `${path}/${cur.component.value}`;
            } else {
              break;
            }
          }

          rr = ctx.recognize(path);
          log.trace('createNode recognized route: %s', rr);
          const residue = rr?.residue ?? null;
          log.trace('createNode residue:', residue);
          const noResidue = residue === null;
          // If the residue matches the whole path it means that empty route is configured, but the path in itself is not configured.
          // Therefore the path matches the configured empty route and puts the whole path into residue.
          if (rr === null || residue === path) {
            // check if a route-id is used
            const eagerResult = ctx.generateViewportInstruction({
              component: vi.component.value,
              params: vi.params ?? emptyObject,
              open: vi.open,
              close: vi.close,
              viewport: vi.viewport,
              children: vi.children.slice(),
            });
            if (eagerResult !== null) {
              (node.tree as Writable<RouteTree>).queryParams = mergeURLSearchParams(node.tree.queryParams, eagerResult.query, true);
              return appendNode(log, node, createConfiguredNode(
                log,
                node,
                eagerResult.vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
                eagerResult.vi.recognizedRoute!,
                vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>));
            }

            // fallback
            const name = vi.component.value;
            if (name === '') return;
            let vp = vi.viewport;
            if (vp === null || vp.length === 0) vp = defaultViewportName;
            const vpa = ctx.getFallbackViewportAgent(vp);
            const fallback = vpa !== null ? vpa.viewport.fallback : ctx.definition.fallback;
            if (fallback === null) throw new UnknownRouteError(`Neither the route '${name}' matched any configured route at '${ctx.friendlyPath}' nor a fallback is configured for the viewport '${vp}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);

            // fallback: id -> route -> CEDefn (Route definition)
            // look for a route first
            log.trace(`Fallback is set to '${fallback}'. Looking for a recognized route.`);
            const rd = (ctx.childRoutes as RouteDefinition[]).find(x => x.id === fallback);
            if (rd !== void 0) return appendNode(log, node, createFallbackNode(log, rd, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>));

            log.trace(`No route definition for the fallback '${fallback}' is found; trying to recognize the route.`);
            const rr = ctx.recognize(fallback, true);
            if (rr !== null && rr.residue !== fallback) return appendNode(log, node, createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, rr, null));

            // fallback is not recognized as a configured route; treat as CE and look for a route definition.
            log.trace(`The fallback '${fallback}' is not recognized as a route; treating as custom element name.`);
            return appendNode(log, node, createFallbackNode(log, RouteDefinition.resolve(fallback, ctx.definition, null, ctx), node, vi as ViewportInstruction<ITypedNavigationInstruction_string>));
          }

          // readjust the children wrt. the residue
          (rr as Writable<$RecognizedRoute>).residue = null;
          (vi.component as Writable<ITypedNavigationInstruction_string>).value = noResidue
            ? path
            : path.slice(0, -(residue.length + 1));

          for (let i = 0; i < collapse; ++i) {
            const child = vi.children[0];
            if (residue?.startsWith(child.component.value as string) ?? false) break;
            (vi as Writable<ViewportInstruction>).viewport = child.viewport;
            (vi as Writable<ViewportInstruction>).children = child.children;
          }
          log.trace('createNode after adjustment vi:%s', vi);
          return appendNode(log, node, createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>, rr, originalInstruction));
        }
      }
    case NavigationInstructionType.Promise:
    case NavigationInstructionType.IRouteViewModel:
    case NavigationInstructionType.CustomElementDefinition: {
      const rc = node.context;
      return onResolve(
        RouteDefinition.resolve(vi.component.value, rc.definition, null, rc),
        rd => {
          const { vi: newVi, query } = rc.generateViewportInstruction({
            component: rd,
            params: vi.params ?? emptyObject,
            open: vi.open,
            close: vi.close,
            viewport: vi.viewport,
            children: vi.children.slice(),
          })!;
          (node.tree as Writable<RouteTree>).queryParams = mergeURLSearchParams(node.tree.queryParams, query, true);
          return appendNode(log, node, createConfiguredNode(
            log,
            node,
            newVi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
            newVi.recognizedRoute!,
            vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>));
        });
    }
  }
}

function createConfiguredNode(
  log: ILogger,
  node: RouteNode,
  vi: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
  rr: $RecognizedRoute,
  originalVi: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null,
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
      ));

      const router = ctx.container.get(IRouter);
      const childCtx = router.getRouteContext(vpa, ced, null, vpa.hostController.container, ctx.definition);

      log.trace('createConfiguredNode setting the context node');
      const $node = childCtx.node = RouteNode.create({
        path: rr.route.endpoint.route.path,
        finalPath: route.path,
        context: childCtx,
        instruction: vi,
        originalInstruction: originalVi,
        params: {
          ...rr.route.params,
        },
        queryParams: rt.queryParams,
        fragment: rt.fragment,
        data: $handler.data,
        viewport: vpName,
        component: ced,
        title: $handler.config.title,
        residue: [
          // TODO(sayan): this can be removed; need to inspect more.
          ...(rr.residue === null ? [] : [ViewportInstruction.create(rr.residue)]),
          ...vi.children,
        ],
      });
      $node.setTree(node.tree);

      log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, $node);

      return $node;
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
          newSegs.push(rr.route.params[redirSeg.component.parameterName] as string);
        } else {
          newSegs.push(redirSeg.raw);
        }
      }
    }

    const newPath = newSegs.filter(Boolean).join('/');

    const redirRR = ctx.recognize(newPath);
    if (redirRR === null) throw new UnknownRouteError(`'${newPath}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${newPath}' to the routes list of the route decorator of '${ctx.component.name}'?`);

    return createConfiguredNode(
      log,
      node,
      ViewportInstruction.create({
        recognizedRoute: redirRR,
        component: newPath,
        children: vi.children,
        viewport: vi.viewport,
        open: vi.open,
        close: vi.close,
      }) as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
      redirRR,
      originalVi,
    );
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
  // Do not pass on any residue. That is if the current path is unconfigured/what/ever ignore the rest after we hit an unconfigured route.
  // If need be later a special parameter can be created for this.
  vi.children.length = 0;
  return createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, rr, null);
}
