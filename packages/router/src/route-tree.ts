/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ILogger, resolveAll, onResolve, emptyArray } from '@aurelia/kernel';
import { CustomElementDefinition, CustomElement } from '@aurelia/runtime-html';

import { IRouteContext, $RecognizedRoute } from './route-context.js';
import { RoutingMode, ResolutionMode, SwapStrategy, IRouter, QueryParamsStrategy } from './router.js';
import { ViewportInstructionTree, ViewportInstruction, NavigationInstructionType, Params, ITypedNavigationInstruction_ResolvedComponent } from './instructions.js';
import { RouteDefinition } from './route-definition.js';
import { ViewportRequest } from './viewport-agent.js';
import { ExpressionKind, RouteExpression, ScopedSegmentExpression, SegmentExpression } from './route-expression.js';
import { ConfigurableRoute } from '@aurelia/route-recognizer';

export interface IRouteNode {
  path: string;
  finalPath: string;
  context: IRouteContext;
  instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null;
  params?: Params;
  queryParams?: Params;
  fragment?: string | null;
  data?: Params;
  viewport?: string | null;
  title?: string | ((node: RouteNode) => string | null) | null;
  component: CustomElementDefinition;
  append: boolean;
  children?: RouteNode[];
  residue?: ViewportInstruction[];
}
export class RouteNode implements IRouteNode {
  /** @internal */
  public tree!: RouteTree;
  /** @internal */
  public version: number = 1;

  public get root(): RouteNode {
    return this.tree.root;
  }

  private constructor(
    /**
     * The original configured path pattern that was matched, or the component name if it was resolved via direct routing.
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
    public readonly instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent> | null,
    public params: Params,
    public queryParams: Params,
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
  ) {}

  public static create(input: IRouteNode): RouteNode {
    return new RouteNode(
      /*        path */input.path,
      /*   finalPath */input.finalPath,
      /*     context */input.context,
      /* instruction */input.instruction,
      /*      params */input.params ?? {},
      /* queryParams */input.queryParams ?? {},
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
          if (i + j < ii && (nodeChildren[i + j].instruction?.equals(instructionChildren[j]) ?? false)) {
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

  public appendChildren(...children: readonly RouteNode[]): void {
    for (const child of children) {
      this.appendChild(child);
    }
  }

  public clearChildren(): void {
    for (const c of this.children) {
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

  /** @internal */
  public setTree(tree: RouteTree): void {
    this.tree = tree;
    for (const child of this.children) {
      child.setTree(tree);
    }
  }

  public clone(): RouteNode {
    const clone = new RouteNode(
      this.path,
      this.finalPath,
      this.context,
      this.instruction,
      { ...this.params },
      { ...this.queryParams },
      this.fragment,
      { ...this.data },
      this.viewport,
      this.title,
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

    return `RN(ctx:'${this.context.friendlyPath}',${props.join(',')})`;
  }
}

export class RouteTree {
  public constructor(
    public instructions: ViewportInstructionTree,
    public root: RouteNode,
  ) { }

  public contains(instructions: ViewportInstructionTree): boolean {
    return this.root.contains(instructions);
  }

  public clone(): RouteTree {
    const clone = new RouteTree(
      this.instructions,
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
  private readonly router: IRouter;
  private readonly logger: ILogger;
  private readonly mode: RoutingMode;
  private readonly resolution: ResolutionMode;
  private readonly swapStrategy: SwapStrategy;

  public constructor(
    private readonly routeTree: RouteTree,
    private readonly instructions: ViewportInstructionTree,
    private ctx: IRouteContext,
  ) {
    this.mode = instructions.options.getRoutingMode(instructions);
    this.resolution = instructions.options.resolutionMode;
    this.swapStrategy = instructions.options.swapStrategy;
    this.logger = ctx.get(ILogger).scopeTo('RouteTreeBuilder');
    this.router = ctx.get(IRouter);
    if (routeTree.instructions.isAbsolute) {
      this.ctx = ctx.root;
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
  public static compileRoot(routeTree: RouteTree, instructions: ViewportInstructionTree, ctx: IRouteContext): Promise<void> | void {
    const compiler = new RouteTreeCompiler(routeTree, instructions, ctx);
    return onResolve(ctx.resolved, () => {
      return compiler.compileRoot();
    });
  }

  public static compileResidue(routeTree: RouteTree, instructions: ViewportInstructionTree, ctx: IRouteContext): Promise<readonly RouteNode[]> | readonly RouteNode[] {
    const compiler = new RouteTreeCompiler(routeTree, instructions, ctx);
    return onResolve(ctx.resolved, () => {
      return compiler.compileResidue(ctx.node, ctx.depth);
    });
  }

  private compileRoot(): Promise<void> | void {
    const instructions = this.instructions;
    const ctx = this.ctx;
    const rootCtx = ctx.root;
    const routeTree = this.routeTree;
    routeTree.root.setTree(routeTree);

    this.logger.trace(`compileRoot(rootCtx:%s,routeTree:%s,instructions:%s)`, rootCtx, routeTree, instructions);

    // The root of the routing tree is always the CompositionRoot of the Aurelia app.
    // From a routing perspective it's simply a "marker": it does not need to be loaded,
    // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
    // other than by reading (deps, optional route config, owned viewports) from it.

    // Update the node of the root context before doing anything else, to make it accessible to children
    // as they are compiled
    rootCtx.node.queryParams = instructions.queryParams;
    rootCtx.node.fragment = instructions.fragment;
    routeTree.instructions = instructions;

    return this.updateOrCompile(rootCtx.node, instructions);
  }

  private compileResidue(parent: RouteNode, depth: number): Promise<readonly RouteNode[]> | readonly RouteNode[] {
    if (depth >= this.ctx.path.length) {
      this.logger.trace(`compileResidue(parent:%s,depth:${depth}) - deferring because leaf context is reached: %s`, parent, this.ctx);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return emptyArray;
    } else {
      const existingChildren = parent.children.slice();
      this.logger.trace(`compileResidue(parent:%s,depth:${depth})`, parent);
      const results: (void | Promise<void>)[] = [];
      while (parent.residue.length > 0) {
        const current = parent.residue.shift()!;
        results.push(this.compile(current, depth, parent.append));
      }

      return onResolve(resolveAll(...results), () => {
        return parent.children.filter(x => !existingChildren.includes(x));
      });
    }
  }

  private compile(instruction: ViewportInstruction, depth: number, append: boolean): Promise<void> | void {
    this.logger.trace(`compile(instruction:%s,depth:${depth},append:${append})`, instruction);

    const ctx = this.ctx.path[depth];
    switch (instruction.component.type) {
      case NavigationInstructionType.string: {
        switch (instruction.component.value) {
          case '..':
            // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
            depth = Math.max(depth - 1, 0);
            this.ctx = this.ctx.path[depth];
            this.ctx.node.clearChildren();
            return this.compileChildren(instruction, depth, false);
          case '.':
            // Ignore '.'
            return this.compileChildren(instruction, depth, false);
          case '~':
            // Go to root
            depth = 0;
            this.ctx = this.ctx.path[depth];
            this.ctx.node.clearChildren();
            return this.compileChildren(instruction, depth, false);
          default: {
            let node: RouteNode | Promise<RouteNode>;

            let path = instruction.component.value;
            let cur = instruction;
            while (cur.children.length === 1) {
              cur = cur.children[0];
              if (cur.component.type === NavigationInstructionType.string) {
                path = `${path}/${cur.component.value}`;
              } else {
                break;
              }
            }
            const recognizedRoute = ctx.recognize(path);
            if (recognizedRoute !== null) {
              node = this.routeNodeFromRecognizedRoute(instruction as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, depth, append, recognizedRoute);
            } else {
              const name = instruction.component.value;
              const component: CustomElementDefinition | null = ctx.find(CustomElement, name);
              switch (this.mode) {
                case 'configured-only':
                  if (component === null) {
                    if (name === '') {
                      // TODO: maybe throw here instead? Do we want to force the empty route to always be configured?
                      return;
                    }
                    throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the children list of the route decorator of '${ctx.component.name}'?`);
                  }
                  throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
                case 'configured-first':
                  if (component === null) {
                    if (name === '') {
                      return;
                    }
                    throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                  }
                  node = this.routeNodeFromComponent(instruction as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, depth, append, component);
                  break;
              }
            }
            return onResolve(node, $node => {
              return onResolve(this.compileResidue($node, depth + 1), () => {
                ctx.node.appendChild($node);
                $node.context.vpa.scheduleUpdate(this.resolution, this.swapStrategy, $node);
              });
            });
          }
        }
      }
      case NavigationInstructionType.IRouteViewModel:
      case NavigationInstructionType.CustomElementDefinition: {
        const routeDef = RouteDefinition.resolve(instruction.component.value);
        const node = this.routeNodeFromComponent(instruction as ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>, depth, append, routeDef.component!);

        return onResolve(node, $node => {
          return onResolve(this.compileResidue($node, depth + 1), () => {
            ctx.node.appendChild($node);
            $node.context.vpa.scheduleUpdate(this.resolution, this.swapStrategy, $node);
          });
        });
      }
    }
  }

  private compileChildren(parent: ViewportInstruction | ViewportInstructionTree, depth: number, append: boolean): Promise<void> | void {
    return resolveAll(...parent.children.map(child => {
      return this.compile(child, depth, append || child.append);
    }));
  }

  private updateOrCompile(node: RouteNode, instructions: ViewportInstructionTree): Promise<void> | void {
    this.logger.trace(`updateOrCompile(node:%s)`, node);

    if (!node.context.isRoot) {
      node.context.vpa.scheduleUpdate(this.resolution, this.swapStrategy, node);
    }
    node.queryParams = instructions.queryParams;
    node.fragment = instructions.fragment;

    if (node.context === this.ctx) {
      node.clearChildren();
      return this.compileChildren(instructions, node.context.depth, instructions.options.append);
    } else {
      return resolveAll(...node.children.map(child => {
        return this.updateOrCompile(child, instructions);
      }));
    }
  }

  private routeNodeFromRecognizedRoute(
    instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
    depth: number,
    append: boolean,
    recognizedRoute: $RecognizedRoute,
  ): RouteNode | Promise<RouteNode> {
    const ctx = this.ctx.path[depth];

    function processPotentialLazyRoute(route: ConfigurableRoute<RouteDefinition | Promise<RouteDefinition>>): RouteNode | Promise<RouteNode> {
      if (route.handler instanceof Promise) {
        return route.handler.then(resolvedHandler => {
          route.handler = resolvedHandler;
          return processRoute(route as ConfigurableRoute<RouteDefinition>);
        });
      } else {
        return processRoute(route as ConfigurableRoute<RouteDefinition>);
      }
    }

    const processRoute = (route: ConfigurableRoute<RouteDefinition>): RouteNode | Promise<RouteNode> => {
      if (route.handler.redirectTo === null) {
        const viewportName = route.handler.viewport;
        const component = route.handler.component!;

        const viewportAgent = ctx.resolveViewportAgent(ViewportRequest.create({
          viewportName,
          componentName: component.name,
          append,
          resolution: this.resolution,
        }));

        const childCtx = this.router.getRouteContext(
          viewportAgent,
          component,
          viewportAgent.hostController.context,
        );

        childCtx.node = RouteNode.create({
          path: recognizedRoute.route.endpoint.route.path,
          finalPath: route.path,
          context: childCtx,
          instruction,
          params: {
            ...ctx.node.params,
            ...recognizedRoute.route.params
          },
          queryParams: this.instructions.queryParams, // TODO: queryParamsStrategy
          fragment: this.instructions.fragment, // TODO: fragmentStrategy
          data: route.handler.data,
          viewport: viewportName,
          component,
          append,
          residue: recognizedRoute.residue === null ? [] : [ViewportInstruction.create(recognizedRoute.residue)],
        });

        this.logger.trace(`routeNodeFromRecognizedRoute(instruction:%s,depth:${depth},append:${append}) -> %s`, instruction, childCtx.node);

        return childCtx.node;
      }

      // Migrate parameters to the redirect
      const originalPath = RouteExpression.parse(route.path, false);
      const redirectPath = RouteExpression.parse(route.handler.redirectTo, false);
      let originalCur: ScopedSegmentExpression | SegmentExpression;
      let redirectCur: ScopedSegmentExpression | SegmentExpression;
      const newSegments: string[] = [];
      switch (originalPath.root.kind) {
        case ExpressionKind.ScopedSegment:
        case ExpressionKind.Segment:
          originalCur = originalPath.root;
          break;
        default:
          throw new Error(`Unexpected expression kind ${originalPath.root.kind}`);
      }
      switch (redirectPath.root.kind) {
        case ExpressionKind.ScopedSegment:
        case ExpressionKind.Segment:
          redirectCur = redirectPath.root;
          break;
        default:
          throw new Error(`Unexpected expression kind ${redirectPath.root.kind}`);
      }

      let originalSeg: SegmentExpression | null;
      let redirectSeg: SegmentExpression | null;
      let originalDone: boolean = false;
      let redirectDone: boolean = false;
      while (!(originalDone && redirectDone)) {
        if (originalDone) {
          originalSeg = null;
        } else if (originalCur.kind === ExpressionKind.Segment) {
          originalSeg = originalCur;
          originalDone = true;
        } else if (originalCur.left.kind === ExpressionKind.Segment) {
          originalSeg = originalCur.left;
          switch (originalCur.right.kind) {
            case ExpressionKind.ScopedSegment:
            case ExpressionKind.Segment:
              originalCur = originalCur.right;
              break;
            default:
              throw new Error(`Unexpected expression kind ${originalCur.right.kind}`);
          }
        } else {
          throw new Error(`Unexpected expression kind ${originalCur.left.kind}`);
        }
        if (redirectDone) {
          redirectSeg = null;
        } else if (redirectCur.kind === ExpressionKind.Segment) {
          redirectSeg = redirectCur;
          redirectDone = true;
        } else if (redirectCur.left.kind === ExpressionKind.Segment) {
          redirectSeg = redirectCur.left;
          switch (redirectCur.right.kind) {
            case ExpressionKind.ScopedSegment:
            case ExpressionKind.Segment:
              redirectCur = redirectCur.right;
              break;
            default:
              throw new Error(`Unexpected expression kind ${redirectCur.right.kind}`);
          }
        } else {
          throw new Error(`Unexpected expression kind ${redirectCur.left.kind}`);
        }

        if (redirectSeg !== null) {
          if (redirectSeg.component.isDynamic && originalSeg?.component.isDynamic) {
            newSegments.push(recognizedRoute.route.params[originalSeg.component.name] as string);
          } else {
            newSegments.push(redirectSeg.raw);
          }
        }
      }

      const newPath = newSegments.join('/');

      const recognizedRedirectRoute = ctx.recognize(newPath);
      if (recognizedRedirectRoute === null) {
        const name = newPath;
        const comp: CustomElementDefinition | null = ctx.find(CustomElement, newPath);
        switch (this.mode) {
          case 'configured-only':
            if (comp === null) {
              throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the children list of the route decorator of '${ctx.component.name}'?`);
            }
            throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
          case 'configured-first':
            if (comp === null) {
              throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
            }
            return this.routeNodeFromComponent(instruction, depth, append, comp);
        }
      }

      return processPotentialLazyRoute(recognizedRedirectRoute.route.endpoint.route);
    };

    return processPotentialLazyRoute(recognizedRoute.route.endpoint.route);
  }

  private routeNodeFromComponent(
    instruction: ViewportInstruction<ITypedNavigationInstruction_ResolvedComponent>,
    depth: number,
    append: boolean,
    component: CustomElementDefinition,
  ): RouteNode {
    const ctx = this.ctx.path[depth];
    const viewportName = instruction.viewport ?? 'default';

    const viewportAgent = ctx.resolveViewportAgent(ViewportRequest.create({
      viewportName,
      componentName: component.name,
      append,
      resolution: this.resolution,
    }));

    const childCtx = this.router.getRouteContext(
      viewportAgent,
      component,
      viewportAgent.hostController.context,
    );

    // TODO(fkleuver): process redirects in direct routing (?)
    const routeDef = RouteDefinition.resolve(component);

    // TODO: add ActionExpression state representation to RouteNode
    childCtx.node = RouteNode.create({
      path: component.name,
      finalPath: component.name,
      context: childCtx,
      instruction,
      params: {
        ...ctx.node.params,
        ...instruction.params,
      },
      queryParams: this.instructions.queryParams, // TODO: queryParamsStrategy
      fragment: this.instructions.fragment, // TODO: fragmentStrategy
      data: routeDef.data,
      viewport: viewportName,
      component,
      append,
      residue: [...instruction.children], // Children must be cloned, because residue will be mutated by the compiler
    });
    this.logger.trace(`routeNodeFromComponent(instruction:%s,depth:${depth},append:${append}) -> %s`, instruction, childCtx.node);

    return childCtx.node;
  }
}
