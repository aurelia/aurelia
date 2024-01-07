import {
  emptyObject,
  type ILogger,
  onResolve,
  onResolveAll,
  Writable,
} from '@aurelia/kernel';
import {
  ConfigurableRoute,
  Endpoint,
  RecognizedRoute,
  RESIDUE,
} from '@aurelia/route-recognizer';
import {
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
import { resolveCustomElementDefinition, resolveRouteConfiguration, RouteConfig, RouteType } from './route';
import { Events, getMessage } from './events';
import { pathUrlParser } from './url-parser';

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
  _viewport?: string | null;
  title?: string | ((node: RouteNode) => string | null) | null;
  component: CustomElementDefinition;
  children?: RouteNode[];
  residue?: ViewportInstruction[];
}

export class RouteNode implements IRouteNode {
  /** @internal */ public _tree!: RouteTree;
  /** @internal */ public _version: number = 1;

  public get root(): RouteNode {
    return this._tree.root;
  }

  /** @internal */
  private _isInstructionsFinalized: boolean = false;
  public get isInstructionsFinalized(): boolean { return this._isInstructionsFinalized; }
  public readonly children: RouteNode[] = [];

  private constructor(
    /**
     * The original configured path pattern that was matched.
     */
    public readonly path: string,
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    public readonly finalPath: string,
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    public readonly context: IRouteContext,
    /** @internal */
    public readonly _originalInstruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null,
    /** Can only be `null` for the composition root */
    public readonly instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null,
    public readonly params: Readonly<Params>,
    public readonly queryParams: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
    public readonly data: Readonly<Record<string, unknown>>,
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     *
     * This is used simply on metadata level. Hence hiding it from the public API.
     * If need be, we can expose it later.
     *
     * @internal
     */
    public readonly _viewport: string | null,
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    public readonly component: CustomElementDefinition,
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
    this._originalInstruction ??= instruction;
  }

  public static create(input: IRouteNode & { originalInstruction?: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null }): RouteNode {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [RESIDUE]: _, ...params } = input.params ?? {};
    return new RouteNode(
      /*        path */input.path,
      /*   finalPath */input.finalPath,
      /*     context */input.context,
      /* originalIns */input.originalInstruction ?? input.instruction,
      /* instruction */input.instruction,
      /*      params */Object.freeze(params),
      /* queryParams */input.queryParams ?? emptyQuery,
      /*    fragment */input.fragment ?? null,
      /*        data */Object.freeze(input.data ?? emptyObject),
      /*    viewport */input._viewport ?? null,
      /*       title */input.title ?? null,
      /*   component */input.component,
      /*     residue */input.residue ?? [],
    );
  }

  public contains(instructions: ViewportInstructionTree, matchEndpoint: boolean = false): boolean {
    if (this.context === instructions.options.context) {
      const nodeChildren = this.children;
      const instructionChildren = instructions.children;
      for (let i = 0, ii = nodeChildren.length; i < ii; ++i) {
        for (let j = 0, jj = instructionChildren.length; j < jj; ++j) {
          const instructionChild = instructionChildren[j];
          const instructionEndpoint = matchEndpoint ? instructionChild.recognizedRoute?.route.endpoint : null;
          const nodeChild = nodeChildren[i + j] ?? null;
          const instruction = nodeChild !== null
            ? nodeChild.isInstructionsFinalized ? nodeChild.instruction : nodeChild._originalInstruction
            : null;
          const childEndpoint = instruction?.recognizedRoute?.route.endpoint;
          if (i + j < ii
            && (
              (instructionEndpoint?.equalsOrResidual(childEndpoint) ?? false)
              || (instruction?.contains(instructionChild) ?? false)
            )
          ) {
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
      return x.contains(instructions, matchEndpoint);
    });
  }

  /** @internal */
  public _appendChild(child: RouteNode): void {
    this.children.push(child);
    child._setTree(this._tree);
  }

  /** @internal */
  public _clearChildren(): void {
    for (const c of this.children) {
      c._clearChildren();
      c.context.vpa._cancelUpdate();
    }
    this.children.length = 0;
  }

  public getTitle(separator: string): string | null {
    const titleParts = [
      ...this.children.map(x => x.getTitle(separator)),
      typeof this.title === 'function' ? this.title.call(void 0, this) : this.title,
    ].filter(x => x !== null);
    return titleParts.length === 0 ? null : titleParts.join(separator);
  }

  public computeAbsolutePath(): string {
    if (this.context.isRoot) {
      return '';
    }
    const parentPath = this.context.parent!.node.computeAbsolutePath();
    const thisPath = this.instruction!.toUrlComponent(false);
    return parentPath.length > 0
      ? thisPath.length > 0
        ? `${parentPath}/${thisPath}`
        : parentPath
      : thisPath;
  }

  /** @internal */
  public _setTree(tree: RouteTree): void {
    this._tree = tree;
    for (const child of this.children) {
      child._setTree(tree);
    }
  }

  /** @internal */
  public _finalizeInstruction(): ViewportInstruction {
    this._isInstructionsFinalized = true;
    const children = this.children.map(x => x._finalizeInstruction());
    const instruction = this.instruction!._clone();
    instruction.children.splice(0, instruction.children.length, ...children);
    return (this as Writable<this>).instruction = instruction;
  }

  /** @internal */
  public _clone(): RouteNode {
    const clone = new RouteNode(
      this.path,
      this.finalPath,
      this.context,
      this._originalInstruction,
      this.instruction,
      this.params,      // as this is frozen, it's safe to share
      this.queryParams, // as this is frozen, it's safe to share
      this.fragment,
      this.data,        // as this is frozen, it's safe to share
      this._viewport,
      this.title,
      this.component,
      [...this.residue],
    );
    const children = this.children;
    const len = children.length;
    for (let i = 0; i < len; ++i) {
      clone.children.push(children[i]._clone());
    }
    clone._version = this._version + 1;
    if (clone.context.node === this) {
      clone.context.node = clone;
    }
    return clone;
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    const props: string[] = [];

    const component = (this.context?.config.component as RouteType)?.name ?? '';
    if (component.length > 0) {
      props.push(`c:'${component}'`);
    }

    const path = this.context?.config.path ?? '';
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

    return `RN(ctx:'${this.context?._friendlyPath}',${props.join(',')})`;
  }
}

export class RouteTree {
  public constructor(
    public readonly options: NavigationOptions,
    public readonly queryParams: Readonly<URLSearchParams>,
    public readonly fragment: string | null,
    public root: RouteNode,
  ) { }

  public contains(instructions: ViewportInstructionTree, matchEndpoint: boolean = false): boolean {
    return this.root.contains(instructions, matchEndpoint);
  }

  /** @internal */
  public _clone(): RouteTree {
    const clone = new RouteTree(
      this.options._clone(),
      this.queryParams, // as this is frozen, it's safe to share
      this.fragment,
      this.root._clone(),
    );
    clone.root._setTree(this);
    return clone;
  }

  /** @internal */
  public _finalizeInstructions(): ViewportInstructionTree {
    return new ViewportInstructionTree(
      this.options,
      true,
      this.root.children.map(x => x._finalizeInstruction()),
      this.queryParams,
      this.fragment,
    );
  }

  /** @internal */
  public _mergeQuery(other: Params): void {
    (this as Writable<RouteTree>).queryParams = Object.freeze(mergeURLSearchParams(this.queryParams, other, true));
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
          node._clearChildren();
        // falls through
        case '.':
          return onResolveAll(...vi.children.map(childVI => {
            return createAndAppendNodes(log, node, childVI);
          }));
        default: {
          log.trace(`createAndAppendNodes invoking createNode`);
          const ctx = node.context;
          const originalInstruction = (vi as ViewportInstruction<ITypedNavigationInstruction_string>)._clone();
          let rr = vi.recognizedRoute;
          // early return; we already have a recognized route, don't bother with the rest.
          if (rr !== null) return appendNode(log, node, createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>, rr, originalInstruction));

          // if there are children, then then it might be the case that the parameters are put in the children, and that case it is best to go the default flow.
          // However, when that's not the case, then we perhaps try to lookup the route-id.
          // This is another early termination.
          if (vi.children.length === 0) {
            const result = ctx._generateViewportInstruction(vi);
            if (result !== null) {
              node._tree._mergeQuery(result.query);
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
            const eagerResult = ctx._generateViewportInstruction({
              component: vi.component.value,
              params: vi.params ?? emptyObject,
              open: vi.open,
              close: vi.close,
              viewport: vi.viewport,
              children: vi.children,
            });
            if (eagerResult !== null) {
              node._tree._mergeQuery(eagerResult.query);
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
            const fallback = vpa !== null
              ? vpa.viewport._getFallback(vi, node, ctx)
              : ctx.config._getFallback(vi, node, ctx);
            if (fallback === null) throw new UnknownRouteError(getMessage(Events.instrNoFallback, name, ctx._friendlyPath, vp, name, ctx.component.name));

            if (typeof fallback === 'string') {
              // fallback: id -> route -> CEDefn (Route configuration)
              // look for a route first
              log.trace(`Fallback is set to '${fallback}'. Looking for a recognized route.`);
              const rd = (ctx.childRoutes as RouteConfig[]).find(x => x.id === fallback);
              if (rd !== void 0) return appendNode(log, node, createFallbackNode(log, rd, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>));

              log.trace(`No route configuration for the fallback '${fallback}' is found; trying to recognize the route.`);
              const rr = ctx.recognize(fallback, true);
              if (rr !== null && rr.residue !== fallback) return appendNode(log, node, createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, rr, null));
            }

            // fallback is not recognized as a configured route; treat as CE and look for a route configuration.
            log.trace(`The fallback '${fallback}' is not recognized as a route; treating as custom element name.`);
            return onResolve(
              resolveRouteConfiguration(fallback, false, ctx.config, null, ctx),
              rc => appendNode(log, node, createFallbackNode(log, rc, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>))
            );
          }

          // readjust the children wrt. the residue
          (rr as Writable<$RecognizedRoute>).residue = null;
          (vi.component as Writable<ITypedNavigationInstruction_string>).value = noResidue
            ? path
            : path.slice(0, -(residue.length + 1));

          let addResidue = !noResidue;
          for (let i = 0; i < collapse; ++i) {
            const child = vi.children[0];
            if (residue?.startsWith(child.component.value as string) ?? false) {
              addResidue = false;
              break;
            }
            (vi as Writable<ViewportInstruction>).viewport = child.viewport;
            (vi as Writable<ViewportInstruction>).children = child.children;
          }
          if (addResidue) {
            vi.children.unshift(ViewportInstruction.create(residue!));
          }
          (vi as Writable<ViewportInstruction>).recognizedRoute = rr;
          log.trace('createNode after adjustment vi:%s', vi);
          return appendNode(log, node, createConfiguredNode(log, node, vi as ViewportInstruction<ITypedNavigationInstruction_string>, rr, originalInstruction));
        }
      }
    case NavigationInstructionType.Promise:
    case NavigationInstructionType.IRouteViewModel:
    case NavigationInstructionType.CustomElementDefinition: {
      const rc = node.context;
      return onResolve(
        resolveCustomElementDefinition(vi.component.value, rc)[1],
        ced => {
          const { vi: newVi, query } = rc._generateViewportInstruction({
            component: ced,
            params: vi.params ?? emptyObject,
            open: vi.open,
            close: vi.close,
            viewport: vi.viewport,
            children: vi.children,
          })!;
          node._tree._mergeQuery(query);
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
  route: ConfigurableRoute<RouteConfig | Promise<RouteConfig>> = rr.route.endpoint.route,
): RouteNode | Promise<RouteNode> {
  const ctx = node.context;
  const rt = node._tree;
  return onResolve(route.handler, $handler => {
    route.handler = $handler;

    log.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, $handler, vi);

    if ($handler.redirectTo === null) {
      const viWithVp = (vi.viewport?.length ?? 0) > 0;
      const vpName: string = (viWithVp ? vi.viewport : $handler.viewport)!;
      return onResolve(
        resolveCustomElementDefinition($handler.component, ctx)[1],
        ced => {

          const vpa = ctx._resolveViewportAgent(new ViewportRequest(
            vpName,
            ced.name,
          ));

          if(!viWithVp) {
            (vi as Writable<ViewportInstruction>).viewport = vpa.viewport.name;
          }
          const router = ctx.container.get(IRouter);
          return onResolve(
            router.getRouteContext(vpa, ced, null, vpa.hostController.container, ctx.config, ctx, $handler),
            childCtx => {

              log.trace('createConfiguredNode setting the context node');
              const $node = childCtx.node = RouteNode.create({
                path: rr.route.endpoint.route.path,
                finalPath: route.path,
                context: childCtx,
                instruction: vi,
                originalInstruction: originalVi,
                params: rr.route.params,
                queryParams: rt.queryParams,
                fragment: rt.fragment,
                data: $handler.data,
                _viewport: vpName,
                component: ced,
                title: $handler.title,
                // Note: at this point, the residue from the recognized route should be converted to VI children. Hence the residues are not added back to the RouteNode.
                residue: vi.children.slice(),
              });
              $node._setTree(node._tree);

              log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, $node);

              return $node;
            }
          );

        });
    }

    // Migrate parameters to the redirect
    const origPath = RouteExpression.parse(pathUrlParser.parse(route.path));
    const redirPath = RouteExpression.parse(pathUrlParser.parse($handler.redirectTo));
    let origCur: ScopedSegmentExpression | SegmentExpression;
    let redirCur: ScopedSegmentExpression | SegmentExpression;
    const newSegs: string[] = [];
    switch (origPath.root.kind) {
      case 'ScopedSegment':
      case 'Segment':
        origCur = origPath.root;
        break;
      default:
        throw new Error(getMessage(Events.exprUnexpectedKind, origPath.root.kind));
    }
    switch (redirPath.root.kind) {
      case 'ScopedSegment':
      case 'Segment':
        redirCur = redirPath.root;
        break;
      default:
        throw new Error(getMessage(Events.exprUnexpectedKind, redirPath.root.kind));
    }

    let origSeg: SegmentExpression | null;
    let redirSeg: SegmentExpression | null;
    let origDone: boolean = false;
    let redirDone: boolean = false;
    while (!(origDone && redirDone)) {
      if (origDone) {
        origSeg = null;
      } else if (origCur.kind === 'Segment') {
        origSeg = origCur;
        origDone = true;
      } else if (origCur.left.kind === 'Segment') {
        origSeg = origCur.left;
        switch (origCur.right.kind) {
          case 'ScopedSegment':
          case 'Segment':
            origCur = origCur.right;
            break;
          default:
            throw new Error(getMessage(Events.exprUnexpectedKind, origCur.right.kind));
        }
      } else {
        throw new Error(getMessage(Events.exprUnexpectedKind, origCur.left.kind));
      }
      if (redirDone) {
        redirSeg = null;
      } else if (redirCur.kind === 'Segment') {
        redirSeg = redirCur;
        redirDone = true;
      } else if (redirCur.left.kind === 'Segment') {
        redirSeg = redirCur.left;
        switch (redirCur.right.kind) {
          case 'ScopedSegment':
          case 'Segment':
            redirCur = redirCur.right;
            break;
          default:
            throw new Error(getMessage(Events.exprUnexpectedKind, redirCur.right.kind));
        }
      } else {
        throw new Error(getMessage(Events.exprUnexpectedKind, redirCur.left.kind));
      }

      if (redirSeg !== null) {
        if (redirSeg.component.isDynamic && (origSeg?.component.isDynamic ?? false)) {
          newSegs.push(rr.route.params[redirSeg.component.parameterName] as string);
        } else {
          newSegs.push(redirSeg.component.name);
        }
      }
    }

    const newPath = newSegs.filter(Boolean).join('/');

    const redirRR = ctx.recognize(newPath);
    if (redirRR === null) throw new UnknownRouteError(getMessage(Events.instrUnknownRedirect, newPath, ctx._friendlyPath, newPath, ctx.component.name));

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
    node._appendChild($childNode);
    return $childNode.context.vpa._scheduleUpdate(node._tree.options, $childNode);
  });
}

/**
 * Creates route node from the given RouteConfig `rc` for a unknown path (non-configured route).
 */
function createFallbackNode(
  log: ILogger,
  rc: RouteConfig,
  node: RouteNode,
  vi: ViewportInstruction<ITypedNavigationInstruction_string>,
): RouteNode | Promise<RouteNode> {
  // we aren't migrating the parameters for missing route
  const rr = new $RecognizedRoute(
    new RecognizedRoute(
      new Endpoint(
        new ConfigurableRoute(rc.path[0], rc.caseSensitive, rc),
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
