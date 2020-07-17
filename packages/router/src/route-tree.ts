/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  PLATFORM,
  ILogger,
} from '@aurelia/kernel';
import {
  CustomElementDefinition,
  CustomElement,
  Controller,
} from '@aurelia/runtime';

import {
  IRouteContext,
  RouteContext,
} from './route-context';
import {
  RoutingMode,
  ResolutionStrategy,
  LifecycleStrategy,
  SwapStrategy,
} from './router';
import {
  ViewportInstructionTree,
  ViewportInstruction,
  NavigationInstructionType,
  Params,
} from './instructions';
import {
  RecognizedRoute,
} from './route-recognizer';
import {
  RouteDefinition,
} from './route-definition';
import {
  ViewportRequest,
} from './viewport-agent';

export interface IRouteNode {
  context: IRouteContext;
  instruction: ViewportInstruction | null;
  params?: Params;
  queryParams?: Params;
  fragment?: string | null;
  data?: Params;
  viewport?: string | null;
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

  public getParent(): RouteNode | null {
    return this.tree.parent(this);
  }

  private constructor(
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    public readonly context: IRouteContext,
    public readonly instruction: ViewportInstruction | null,
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

  public static create(
    input: IRouteNode,
  ): RouteNode {
    return new RouteNode(
      /*     context */input.context,
      /* instruction */input.instruction,
      /*      params */input.params ?? {},
      /* queryParams */input.queryParams ?? {},
      /*    fragment */input.fragment ?? null,
      /*        data */input.data ?? {},
      /*    viewport */input.viewport ?? null,
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
          if (i + j < ii && nodeChildren[i + j].instruction?.equals(instructionChildren[j])) {
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
      this.instruction,
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

  public toString(): string {
    const props: string[] = [];

    const component = this.context?.definition.component.name ?? '';
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
  private readonly logger: ILogger;
  private readonly mode: RoutingMode;
  private readonly resolutionStrategy: ResolutionStrategy;
  private readonly lifecycleStrategy: LifecycleStrategy;
  private readonly swapStrategy: SwapStrategy;

  public constructor(
    private readonly routeTree: RouteTree,
    private readonly instructions: ViewportInstructionTree,
    private readonly ctx: IRouteContext,
  ) {
    this.mode = instructions.options.getRoutingMode(instructions);
    this.resolutionStrategy = instructions.options.resolutionStrategy;
    this.lifecycleStrategy = instructions.options.lifecycleStrategy;
    this.swapStrategy = instructions.options.swapStrategy;
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
    routeTree: RouteTree,
    instructions: ViewportInstructionTree,
    ctx: IRouteContext,
  ): void {
    const compiler = new RouteTreeCompiler(routeTree, instructions, ctx);
    compiler.compileRoot();
  }

  public static compileResidue(
    routeTree: RouteTree,
    instructions: ViewportInstructionTree,
    ctx: IRouteContext,
  ): void {
    const compiler = new RouteTreeCompiler(routeTree, instructions, ctx);
    compiler.compileResidue(ctx.node, ctx.depth);
  }

  private compileRoot(): void {
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

    this.updateOrCompile(rootCtx.node, instructions);
  }

  private compileResidue(
    parent: RouteNode,
    depth: number,
  ): void {
    if (depth >= this.ctx.path.length) {
      this.logger.trace(`compileResidue(parent:%s,depth:${depth}) - deferring because leaf context is reached: %s`, parent, this.ctx);
    } else {
      this.logger.trace(`compileResidue(parent:%s,depth:${depth})`, parent);

      while (parent.residue.length > 0) {
        const current = parent.residue.shift()!;
        this.compile(current, depth, parent.append);
      }
    }
  }

  private compile(
    instruction: ViewportInstruction,
    depth: number,
    append: boolean,
  ): void {
    this.logger.trace(`compile(instruction:%s,depth:${depth},append:${append})`, instruction);

    const ctx = this.ctx.path[depth];
    switch (instruction.component.type) {
      case NavigationInstructionType.string: {
        switch (instruction.component.value) {
          case '..':
            // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
            this.compileChildren(instruction, Math.max(depth - 1, 0), false);
            break;
          case '.':
            // Ignore '.'
            this.compileChildren(instruction, depth, false);
            break;
          case '~':
            // Go to root
            this.compileChildren(instruction, 0, false);
            break;
          default: {
            const childNode = this.resolve(instruction, depth, append);
            this.compileResidue(childNode, depth + 1);
            ctx.node.appendChild(childNode);
            childNode.context.vpa.scheduleUpdate(this.resolutionStrategy, this.lifecycleStrategy, this.swapStrategy, childNode);
          }
        }
        break;
      }
      case NavigationInstructionType.IRouteViewModel:
      case NavigationInstructionType.CustomElementDefinition: {
        const childNode = this.resolve(instruction, depth, append);
        this.compileResidue(childNode, depth + 1);
        ctx.node.appendChild(childNode);
        childNode.context.vpa.scheduleUpdate(this.resolutionStrategy, this.lifecycleStrategy, this.swapStrategy, childNode);
        break;
      }
    }
  }

  private compileChildren(
    parent: ViewportInstruction | ViewportInstructionTree,
    depth: number,
    append: boolean,
  ): void {
    for (const child of parent.children) {
      this.compile(child, depth, append || child.append);
    }
  }

  private updateOrCompile(
    node: RouteNode,
    instructions: ViewportInstructionTree,
  ): void {
    this.logger.trace(`updateOrCompile(node:%s)`, node);

    if (!node.context.isRoot) {
      node.context.vpa.scheduleUpdate(this.resolutionStrategy, this.lifecycleStrategy, this.swapStrategy, node);
    }
    node.queryParams = instructions.queryParams;
    node.fragment = instructions.fragment;

    if (node.context === this.ctx) {
      node.children.length = 0;
      this.compileChildren(instructions, node.context.depth, instructions.options.append);
    } else {
      for (const child of node.children) {
        this.updateOrCompile(child, instructions);
      }
    }
  }

  private resolve(
    instruction: ViewportInstruction,
    depth: number,
    append: boolean,
  ): RouteNode {
    this.logger.trace(`resolve(instruction:%s,depth:${depth},append:${append}) in '${this.mode}' mode at ${this.ctx.path[depth]}`, instruction);

    let node: RouteNode | null;
    switch (this.mode) {
      case 'configured-first':
        node = this.resolveConfigured(instruction, depth, append) ?? this.resolveDirect(instruction, depth, append);
        break;
      case 'configured-only':
        node = this.resolveConfigured(instruction, depth, append);
        break;
      case 'direct-first':
        node = this.resolveDirect(instruction, depth, append) ?? this.resolveConfigured(instruction, depth, append);
        break;
      case 'direct-only':
        node = this.resolveDirect(instruction, depth, append);
        break;
    }

    if (node === null) {
      throw new Error(`Could not resolve instruction ${instruction} in '${this.mode}' mode at ${this.ctx.path[depth]}`);
    }

    return node;
  }

  private resolveConfigured(
    instruction: ViewportInstruction,
    depth: number,
    append: boolean,
  ): RouteNode | null {
    const ctx = this.ctx.path[depth];
    let result: RecognizedRoute | null;
    switch (instruction.component.type) {
      case NavigationInstructionType.string: {
        result = ctx.recognize(instruction.component.value);
        break;
      }
      case NavigationInstructionType.CustomElementDefinition:
      case NavigationInstructionType.IRouteViewModel: {
        const routeDef = RouteDefinition.resolve(instruction.component.value, ctx);
        // TODO: serialize params and replace dynamic segment, if provided as object
        result = ctx.recognize(routeDef.path);
        break;
      }
    }

    if (result === null) {
      this.logger.trace(`resolveConfigured(instruction:%s,depth:${depth},append:${append}) -> null`, instruction);

      return null;
    }

    const endpoint = result.endpoint;
    const viewportAgent = ctx.resolveViewportAgent(ViewportRequest.create({
      viewportName: endpoint.route.viewport,
      componentName: endpoint.route.component.name,
      append,
      resolutionStrategy: this.resolutionStrategy,
    }));

    const childCtx = RouteContext.getOrCreate(
      viewportAgent,
      endpoint.route.component,
      viewportAgent.hostController.context,
    );

    childCtx.node = RouteNode.create({
      context: childCtx,
      instruction,
      params: result.params, // TODO: params inheritance
      queryParams: this.instructions.queryParams, // TODO: queryParamsStrategy
      fragment: this.instructions.fragment, // TODO: fragmentStrategy
      data: endpoint.route.data,
      viewport: endpoint.route.viewport,
      component: endpoint.route.component,
      append: append,
      residue: result.residue === null ? [] : [ViewportInstruction.create(result.residue)],
    });

    this.logger.trace(`resolveConfigured(instruction:%s,depth:${depth},append:${append}) -> %s`, instruction, childCtx.node);

    return childCtx.node;
  }

  private resolveDirect(
    instruction: ViewportInstruction,
    depth: number,
    append: boolean,
  ): RouteNode | null {
    const ctx = this.ctx.path[depth];
    let component: CustomElementDefinition;

    switch (instruction.component.type) {
      case NavigationInstructionType.string: {
        // TODO: use RouteExpression.parse and recursively build more instructions if needed
        const resource: CustomElementDefinition | null = ctx.findResource(CustomElement, instruction.component.value);
        if (resource === null) {
          this.logger.trace(`resolveDirect(instruction:%s,depth:${depth},append:${append}) - string -> null`, instruction);

          return null;
        }
        component = resource;
        break;
      }
      case NavigationInstructionType.CustomElementDefinition: {
        component = instruction.component.value;
        break;
      }
      case NavigationInstructionType.IRouteViewModel: {
        const controller = Controller.getCachedOrThrow(instruction.component.value);
        component = controller.context.definition;
        break;
      }
    }

    const viewportName = instruction.viewport ?? 'default';

    const viewportAgent = ctx.resolveViewportAgent(ViewportRequest.create({
      viewportName,
      componentName: component.name,
      append,
      resolutionStrategy: this.resolutionStrategy,
    }));

    const childCtx = RouteContext.getOrCreate(
      viewportAgent,
      component,
      viewportAgent.hostController.context,
    );

    // TODO: add ActionExpression state representation to RouteNode
    childCtx.node = RouteNode.create({
      context: childCtx,
      instruction,
      params: {}, // TODO: get params & do params inheritance
      queryParams: this.instructions.queryParams, // TODO: queryParamsStrategy
      fragment: this.instructions.fragment, // TODO: fragmentStrategy
      data: {}, // TODO: pass in data from instruction
      viewport: viewportName,
      component,
      append,
      residue: [...instruction.children], // Children must be cloned, because residue will be mutated by the compiler
    });

    return childCtx.node;
  }
}
