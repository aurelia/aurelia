import { Reporter } from '@aurelia/kernel';
import { LifecycleFlags, ICompiledRenderContext, ICustomElementController, CustomElement, ICustomElementViewModel } from '@aurelia/runtime';
import { ComponentAppellation, IRouteableComponent, ReentryBehavior, IRoute, RouteableComponentType, NavigationInstruction } from './interfaces';
import { IRouter } from './router';
import { arrayRemove } from './utils';
import { ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner, IScopeOwnerOptions, Scope } from './scope';
import { Navigation } from './navigation';
import { IRoutingController, IConnectionCustomElement } from './resources/viewport';

export interface IViewportOptions extends IScopeOwnerOptions {
  scope?: boolean;
  usedBy?: string | string[];
  default?: string;
  fallback?: string;
  noLink?: boolean;
  noTitle?: boolean;
  stateful?: boolean;
  forceDescription?: boolean;
}

export class Viewport implements IScopeOwner {
  public connectedScope: Scope;
  public content: ViewportContent;
  public nextContent: ViewportContent | null = null;

  public forceRemove: boolean = false;

  public path: string | null = null;

  private clear: boolean = false;
  private connectionResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;

  private previousViewportState: Viewport | null = null;

  private cache: ViewportContent[] = [];
  private historyCache: ViewportContent[] = [];

  public constructor(
    public readonly router: IRouter,
    public name: string,
    public connectionCE: IConnectionCustomElement | null,
    owningScope: Scope,
    scope: boolean,
    public options: IViewportOptions = {}
  ) {
    this.content = new ViewportContent();
    this.connectedScope = new Scope(router, scope, owningScope, this);
  }

  public get scope(): Scope {
    return this.connectedScope.scope;
  }
  public get owningScope(): Scope {
    return this.connectedScope.owningScope!;
  }

  public get enabled(): boolean {
    return this.connectedScope.enabled;
  }
  public set enabled(enabled: boolean) {
    this.connectedScope.enabled = enabled;
  }

  public get isViewport(): boolean {
    return true;
  }
  public get isViewportScope(): boolean {
    return false;
  }

  public get isEmpty(): boolean {
    return this.content.componentInstance === null;
  }

  public get doForceRemove(): boolean {
    let scope: Scope | null = this.connectedScope;
    while (scope !== null) {
      if (scope.viewport !== null && scope.viewport.forceRemove) {
        return true;
      }
      scope = scope.parent;
    }
    return false;
  }

  public setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: Navigation): boolean {
    let viewportInstruction: ViewportInstruction;
    if (content instanceof ViewportInstruction) {
      viewportInstruction = content;
    } else {
      if (typeof content === 'string') {
        viewportInstruction = this.router.instructionResolver.parseViewportInstruction(content);
      } else {
        viewportInstruction = this.router.createViewportInstruction(content);
      }
    }
    viewportInstruction.setViewport(this);
    this.clear = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction);

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(!this.clear ? viewportInstruction : void 0, instruction, this.connectionCE ?? null);

    this.nextContent.fromHistory = this.nextContent.componentInstance && instruction.navigation
      ? !!instruction.navigation.back || !!instruction.navigation.forward
      : false;

    if (this.options.stateful) {
      // TODO: Add a parameter here to decide required equality
      const cached = this.cache.find((item) => this.nextContent!.isCacheEqual(item));
      if (cached) {
        this.nextContent = cached;
        this.nextContent.fromCache = true;
      } else {
        this.cache.push(this.nextContent);
      }
    }

    // Children that will be replaced (unless added again) by next content. Will
    // be re-enabled on cancel
    this.connectedScope.clearReplacedChildren();

    // If we get the same _instance_, don't do anything (happens with cached and history)
    if (this.nextContent.componentInstance !== null && this.content.componentInstance === this.nextContent.componentInstance) {
      this.nextContent = null;
      return false;
    }

    // ReentryBehavior 'refresh' takes precedence
    if (!this.content.equalComponent(this.nextContent) ||
      instruction.navigation.refresh ||
      this.content.reentryBehavior() === ReentryBehavior.refresh
    ) {
      this.connectedScope.disableReplacedChildren();
      return true;
    }

    // Explicitly don't allow navigation back to the same component again
    if (this.content.reentryBehavior() === ReentryBehavior.disallow) {
      this.nextContent = null;
      return false;
    }

    // Explicitly re-enter same component again
    if (this.content.reentryBehavior() === ReentryBehavior.enter) {
      this.content.reentry = true;

      this.nextContent.content.setComponent(this.content.componentInstance!);
      this.nextContent.contentStatus = this.content.contentStatus;
      this.nextContent.reentry = this.content.reentry;
      return true;
    }

    // ReentryBehavior is now 'default'

    // Requires updated parameters if viewport stateful
    if (this.options.stateful &&
      this.content.equalParameters(this.nextContent)) {
      this.nextContent = null;
      return false;
    }

    // Default is to trigger a refresh (without a check of parameters)
    this.connectedScope.disableReplacedChildren();
    return true;
  }

  public setConnection(connectionCE: IConnectionCustomElement, options: IViewportOptions): void {
    options = options || {};
    if (this.connectionCE !== connectionCE) {
      // TODO: Restore this state on navigation cancel
      this.previousViewportState = { ...this };
      this.clearState();
      this.connectionCE = connectionCE;
      if (options.usedBy) {
        this.options.usedBy = options.usedBy;
      }
      if (options.default) {
        this.options.default = options.default;
      }
      if (options.fallback) {
        this.options.fallback = options.fallback;
      }
      if (options.noLink) {
        this.options.noLink = options.noLink;
      }
      if (options.noTitle) {
        this.options.noTitle = options.noTitle;
      }
      if (options.noHistory) {
        this.options.noHistory = options.noHistory;
      }
      if (options.stateful) {
        this.options.stateful = options.stateful;
      }
      if (this.connectionResolve) {
        this.connectionResolve();
      }
    }
    // TODO: Might not need this? Figure it out
    // if (container) {
    //   container['viewportName'] = this.name;
    // }

    if (!this.content.componentInstance && (!this.nextContent || !this.nextContent.componentInstance) && this.options.default) {
      const instructions = this.router.instructionResolver.parseViewportInstructions(this.options.default);
      for (const instruction of instructions) {
        // Set to name to be delayed one turn
        instruction.setViewport(this.name);
        instruction.scope = this.owningScope;
        instruction.default = true;
      }
      this.router.goto(instructions, { append: true }).catch(error => { throw error; });
    }
  }

  public async remove(connectionCE: IConnectionCustomElement | null): Promise<boolean> {
    if (this.connectionCE === connectionCE) {
      if (this.content.componentInstance) {
        await this.content.freeContent(
          this.connectionCE,
          (this.nextContent ? this.nextContent.instruction : null),
          this.historyCache,
          this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful
        ); // .catch(error => { throw error; });
      }
      if (this.doForceRemove) {
        await Promise.all(this.historyCache.map(content => content.freeContent(
          null,
          null,
          this.historyCache,
          false,
        )));
        this.historyCache = [];
      }
      return true;
    }
    return false;
  }

  public async canLeave(): Promise<boolean> {
    const canLeaveChildren: boolean = await this.connectedScope.canLeave();
    if (!canLeaveChildren) {
      return false;
    }
    return this.content.canLeave(this.nextContent ? this.nextContent.instruction : null);
  }

  public async canEnter(): Promise<boolean | ViewportInstruction[]> {
    if (this.clear) {
      return true;
    }

    if ((this.nextContent!.content ?? null) === null) {
      return false;
    }

    await this.waitForConnection();

    this.nextContent!.createComponent(this.connectionCE!, this.options.fallback);

    return this.nextContent!.canEnter(this, this.content.instruction);
  }

  public async enter(): Promise<boolean> {
    Reporter.write(10000, 'Viewport enter', this.name);

    if (this.clear) {
      return true;
    }

    if (!this.nextContent || !this.nextContent.componentInstance) {
      return false;
    }

    await this.nextContent.enter(this.content.instruction);
    await this.nextContent.activateComponent(null, this.connectionCE!.$controller as ICustomElementController<Element, ICustomElementViewModel<Element>>, LifecycleFlags.none, this.connectionCE!);
    return true;
  }

  public async loadContent(): Promise<boolean> {
    Reporter.write(10000, 'Viewport loadContent', this.name);

    // No need to wait for next component activation
    if (this.content.componentInstance && !this.nextContent!.componentInstance) {
      await this.content.leave(this.nextContent!.instruction);
      await this.content!.freeContent(
        this.connectionCE,
        this.nextContent!.instruction,
        this.historyCache,
        this.router.statefulHistory || this.options.stateful);
    }

    if (this.nextContent!.componentInstance) {
      if (this.content.componentInstance !== this.nextContent!.componentInstance) {
        await this.nextContent!.activateComponent(null, this.connectionCE!.$controller as IRoutingController, LifecycleFlags.none, this.connectionCE!);
      } else {
        this.connectedScope.reenableReplacedChildren();
      }
      // Only when next component activation is done
      if (this.content.componentInstance) {
        await this.content.leave(this.nextContent!.instruction);
        if (!this.content.reentry && this.content.componentInstance !== this.nextContent!.componentInstance) {
          await this.content!.freeContent(
            this.connectionCE,
            this.nextContent!.instruction,
            this.historyCache,
            this.router.statefulHistory || this.options.stateful);
        }
      }

      this.content = this.nextContent!;
      this.content.reentry = false;
    }

    if (this.clear) {
      this.content = new ViewportContent(void 0, this.nextContent!.instruction);
    }

    this.nextContent = null;

    return true;
  }

  public finalizeContentChange(): void {
    this.previousViewportState = null;
    this.connectedScope.clearReplacedChildren();
  }
  public async abortContentChange(): Promise<void> {
    this.connectedScope.reenableReplacedChildren();
    await this.nextContent!.freeContent(
      this.connectionCE,
      this.nextContent!.instruction,
      this.historyCache,
      this.router.statefulHistory || this.options.stateful);
    if (this.previousViewportState) {
      Object.assign(this, this.previousViewportState);
    }
  }

  // TODO: Deal with non-string components
  public wantComponent(component: ComponentAppellation): boolean {
    let usedBy = this.options.usedBy || [];
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    return usedBy.includes(component as string);
  }
  // TODO: Deal with non-string components
  public acceptComponent(component: ComponentAppellation): boolean {
    if (component === '-' || component === null) {
      return true;
    }
    let usedBy = this.options.usedBy;
    if (!usedBy || !usedBy.length) {
      return true;
    }
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    if (usedBy.includes(component as string)) {
      return true;
    }
    if (usedBy.filter((value) => value.includes('*')).length) {
      return true;
    }
    return false;
  }

  public async freeContent(component: IRouteableComponent) {
    const content = this.historyCache.find(cached => cached.componentInstance === component);
    if (content !== void 0) {
      this.forceRemove = true;
      await content.freeContent(
        null,
        null,
        this.historyCache,
        false,
      );
      this.forceRemove = false;
      arrayRemove(this.historyCache, (cached => cached === content));
    }
  }

  public getRoutes(): IRoute[] | null {
    const componentType = this.getComponentType();
    if (componentType === null) {
      return null;
    }
    const routes: IRoute[] = (componentType as RouteableComponentType & { routes: IRoute[] }).routes;
    return Array.isArray(routes) ? routes : null;
  }

  public getTitle(navigationInstruction: NavigationInstruction): string {
    if (this.options.noTitle) {
      return '';
    }
    const componentType = this.getComponentType();
    if (componentType === null) {
      return '';
    }
    let title = '';
    const typeTitle = componentType.title;
    if (typeTitle !== void 0) {
      if (typeof typeTitle === 'string') {
        title = typeTitle;
      } else {
        const component = this.getComponentInstance();
        title = typeTitle.call(component, component!, navigationInstruction);
      }
    } else if (this.router.options.title.useComponentNames) {
      let name = this.getContentInstruction()!.componentName ?? '';
      const prefix = this.router.options.title.componentPrefix ?? '';
      if (name.startsWith(prefix)) {
        name = name.slice(prefix.length);
      }
      name = name.replace('-', ' ');
      title = name.slice(0, 1).toLocaleUpperCase() + name.slice(1);
    }
    if (this.router.options.title.transformTitle !== void 0) {
      title = this.router.options.title.transformTitle.call(this, title, this.getContentInstruction()!);
    }
    return title;
  }

  private getComponentType(): RouteableComponentType | null {
    let componentType = this.getContentInstruction()!.componentType ?? null;
    // TODO: This is going away once Metadata is in!
    if (componentType === null) {
      const controller = CustomElement.for(this.connectionCE!.element);
      componentType = (controller!.context as
        ICompiledRenderContext<Element> & { componentType: RouteableComponentType })
        .componentType;
    }
    return componentType ?? null;
  }

  private getComponentInstance(): IRouteableComponent | null {
    return this.getContentInstruction()!.componentInstance ?? null;
  }

  private getContentInstruction(): ViewportInstruction | null {
    return this.nextContent?.content ?? this.content.content ?? null;
  }

  private clearState(): void {
    this.options = {};

    this.content = new ViewportContent();
    this.cache = [];
  }

  private async waitForConnection(): Promise<void> {
    if (this.connectionCE !== null) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.connectionResolve = resolve;
    });
  }
}
