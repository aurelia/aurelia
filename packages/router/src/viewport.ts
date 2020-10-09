import { LifecycleFlags, ICompiledRenderContext, ICustomElementController, CustomElement, ICustomElementViewModel, IHydratedController, IHydratedParentController } from '@aurelia/runtime';
import { ComponentAppellation, IRouteableComponent, ReentryBehavior, IRoute, RouteableComponentType, NavigationInstruction } from './interfaces';
import { IRouter } from './router';
import { arrayRemove } from './utils';
import { ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner, IScopeOwnerOptions, NextContentAction, Scope } from './scope';
import { Navigation } from './navigation';
import { IRoutingController, IConnectedCustomElement } from './resources/viewport';
import { NavigationCoordinator } from './navigation-coordinator';
import { Runner } from './runner';

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
  public nextContentAction: NextContentAction = '';

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
    public connectedCE: IConnectedCustomElement | null,
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

  public get connectedController(): IRoutingController | null {
    return this.connectedCE?.$controller ?? null;
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

  public get activeContent(): ViewportContent {
    return this.nextContent ?? this.content;
  }

  public get nextContentActivated(): boolean {
    return this.nextContent?.contentStates.has('activated') ?? false;
  }

  public get parentNextContentActivated(): boolean {
    return this.scope.parent?.owner?.nextContentActivated ?? false;
  }

  public get performLoad(): boolean {
    return true;
    // return this.nextContentAction !== 'skip' && this.connectedScope.parentNextContentAction !== 'swap';
    // // return this.nextContentAction !== 'skip' && ((this.nextContent?.content.topInstruction ?? false) || this.clear);
  }

  public get performSwap(): boolean {
    return true;
    // return this.nextContentAction !== 'skip' && this.connectedScope.parentNextContentAction !== 'swap';
    // // return this.nextContentAction !== 'skip' && ((this.nextContent?.content.topInstruction ?? false) || this.clear);
  }

  public toString(): string {
    const contentName = this.content?.content.componentName ?? '';
    const nextContentName = this.nextContent?.content.componentName ?? '';
    return `v:${this.name}[${contentName}->${nextContentName}]`;
  }

  public setNextContent(viewportInstruction: ViewportInstruction, navigation: Navigation): NextContentAction {
    viewportInstruction.setViewport(this);
    this.clear = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction);

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(!this.clear ? viewportInstruction : void 0, navigation, this.connectedCE ?? null);

    this.nextContent.fromHistory = this.nextContent.componentInstance && navigation.navigation
      ? !!navigation.navigation.back || !!navigation.navigation.forward
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
      return this.nextContentAction = 'skip'; // false;
    }

    if (!this.content.equalComponent(this.nextContent) ||
      this.connectedScope.parentNextContentAction === 'swap' || // Some parent has been swapped, need to be new component
      navigation.navigation.refresh || // Navigation 'refresh' performed
      this.content.reentryBehavior() === ReentryBehavior.refresh // ReentryBehavior 'refresh' takes precedence
    ) {
      this.connectedScope.disableReplacedChildren();
      return this.nextContentAction = 'swap'; // true;
    }

    // Component is the same name/type

    // Explicitly don't allow navigation back to the same component again
    if (this.content.reentryBehavior() === ReentryBehavior.disallow) {
      this.nextContent = null;
      return this.nextContentAction = 'skip'; // false;
    }

    // Explicitly re-load same component again
    if (this.content.reentryBehavior() === ReentryBehavior.load) {
      this.content.reentry = true;

      this.nextContent.content.setComponent(this.content.componentInstance!);
      // this.nextContent.contentStatus = this.content.contentStatus;
      this.nextContent.contentStates = this.content.contentStates.clone();
      // this.nextContent.contentStates = new Map(this.content.contentStates);
      this.nextContent.reentry = this.content.reentry;
      return this.nextContentAction = 'reload'; // true;
    }

    // ReentryBehavior is now 'default'

    // Requires updated parameters if viewport stateful
    if (this.options.stateful &&
      this.content.equalParameters(this.nextContent)) {
      this.nextContent = null;
      return this.nextContentAction = 'skip'; // false;
    }

    if (!this.content.equalParameters(this.nextContent)) {
      // TODO: Fix a config option for this
      // eslint-disable-next-line no-constant-condition
      if (false) { // Re-use component, only reload with new parameters
        this.content.reentry = true;
        this.nextContent!.content.setComponent(this.content.componentInstance!);
        this.nextContent!.contentStates = this.content.contentStates.clone();
        this.nextContent!.reentry = this.content.reentry;
        return this.nextContentAction = 'reload';
      } else { // Perform a full swap
        this.connectedScope.disableReplacedChildren();
        return this.nextContentAction = 'swap';
      }
    }

    // Default is to do nothing
    return 'skip';

    // // Default is to trigger a refresh (without a check of parameters)
    // this.connectedScope.disableReplacedChildren();
    // return this.nextContentAction = 'reload'; // true;
  }

  public setConnectedCE(connectedCE: IConnectedCustomElement, options: IViewportOptions): void {
    options = options || {};
    if (this.connectedCE !== connectedCE) {
      // TODO: Restore this state on navigation cancel
      this.previousViewportState = { ...this };
      this.clearState();
      this.connectedCE = connectedCE;
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
      this.router.load(instructions, { append: true }).catch(error => { throw error; });
    }
  }

  public remove(connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean> {
    if (this.connectedCE === connectedCE) {
      return Runner.run(
        () => {
          if (this.content.componentInstance) {
            return this.content.freeContent(
              this.connectedCE,
              (this.nextContent ? this.nextContent.instruction : null),
              this.historyCache,
              this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful
            ); // .catch(error => { throw error; });
          }
        },
        () => {
          if (this.doForceRemove) {
            const removes = [];
            for (const content of this.historyCache) {
              removes.push(() => content.freeContent(
                null,
                null,
                this.historyCache,
                false,
              ));
            }
            removes.push(() => { this.historyCache = []; });
            return Runner.run(
              ...removes,
            );
            // return Promise.all(this.historyCache.map(content => content.freeContent(
            //   null,
            //   null,
            //   this.historyCache,
            //   false,
            // )));
            // this.historyCache = [];
          }
          return true;
        }
      );
    }
    return false;
  }

  public transition(coordinator: NavigationCoordinator): void {
    // console.log('Viewport transition', this.toString());

    // let run: unknown;

    const guarded = coordinator.checkingSyncState('guarded');

    const performLoad = this.performLoad || !guarded;
    const performSwap = this.performSwap || !guarded;
    // const performSwap = this.performSwap || !this.router.isRestrictedNavigation || this.clear;

    const guardSteps = [
      () => performLoad ? this.canUnload() : true,
      (canUnloadResult: boolean) => {
        if (!canUnloadResult) {
          Runner.cancel(void 0);
          coordinator.cancel();
          return;
        }

        if (this.router.isRestrictedNavigation) {
          this.nextContent!.createComponent(this.connectedCE!, this.options.fallback);
        }

        coordinator.addEntityState(this, 'guardedUnload');
      },
      () => coordinator.syncState('guardedUnload', this),

      () => performLoad ? this.canLoad(guarded) as boolean | NavigationInstruction | NavigationInstruction[] : true,
      (canLoadResult: boolean | NavigationInstruction | NavigationInstruction[]) => {
        if (typeof canLoadResult === 'boolean') {
          if (!canLoadResult) {
            Runner.cancel(void 0);
            coordinator.cancel();
            return;
          }
          coordinator.addEntityState(this, 'guardedLoad');
          coordinator.addEntityState(this, 'guarded');
        } else { // Denied and (probably) redirected
          Runner.run(
            () => this.router.load(canLoadResult, { append: true }),
            () => this.abortContentChange(),
            // TODO: Abort content change in the viewports
          );
        }
      },
    ];

    const routingSteps = [
      // () => { console.log("I'm waiting for guarded", this.toString()); },
      () => coordinator.syncState('guarded', this),
      // () => { console.log("I'm guarded", this.toString()); },
      // TODO: For consistency it should probably be this option with 'routed'
      // () => performSwap ? this.unload(coordinator.checkingSyncState('routed')) : true,
      () => performLoad ? this.unload(true) : true,
      () => coordinator.addEntityState(this, 'unloaded'),

      // () => { console.log("I'm waiting for unloaded", this.toString()); },
      () => coordinator.syncState('unloaded', this),
      // () => { console.log("I'm done waiting for unloaded", this.toString()); },
      () => performLoad ? this.load(coordinator.checkingSyncState('routed')) : true,
      () => coordinator.addEntityState(this, 'loaded'),
      () => coordinator.addEntityState(this, 'routed'),
    ];

    const lifecycleSteps = [
      () => coordinator.syncState('routed', this),
      // () => coordinator.addEntityState(this, 'bound'),
    ];
    if (performSwap) {
      if (this.router.options.swapStrategy.includes('parallel')) {
        lifecycleSteps.push(() => {
          if (this.router.options.swapStrategy.includes('add')) {
            return Runner.run(
              this.addContent(),
              this.removeContent()
            );
          } else {
            return Runner.run(
              this.removeContent(),
              this.addContent()
            );
          }
        });
      } else {
        lifecycleSteps.push(
          () => performSwap ? (this.router.options.swapStrategy.includes('add') ? this.addContent() : this.removeContent()) : void 0,
          () => performSwap ? (this.router.options.swapStrategy.includes('add') ? this.removeContent() : this.addContent()) : void 0,
        );
      }
    }
    lifecycleSteps.push(() => coordinator.addEntityState(this, 'swapped'));

    // const lifecycleSteps = [
    //   () => coordinator.syncState('routed'),
    //   // () => coordinator.addEntityState(this, 'bound'),
    //   () => performSwap ? (this.router.options.swapStrategy.includes('add') ? this.addContent() : this.removeContent()) : true,
    //   () => performSwap ? (this.router.options.swapStrategy.includes('add') ? this.removeContent() : this.addContent()) : true,
    //   () => coordinator.addEntityState(this, 'swapped'),
    // ];

    // run =
    Runner.run(
      ...guardSteps,
      ...routingSteps,
      ...lifecycleSteps,
      () => coordinator.addEntityState(this, 'completed')
    );
  }

  public canUnload(): boolean | Promise<boolean> {
    return Runner.run(
      () => {
        // console.log('viewport canUnload run', this.name, 'before');
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const result = this.connectedScope.canUnload();
        // console.log('viewport canUnload run', this.name, 'after');
        return result;
      },
      (canUnloadChildren: boolean) => {
        // console.log('viewport canUnload result', this.name, canUnloadChildren);
        if (!canUnloadChildren) {
          return false;
        }

        // This shouldn't happen
        // // Don't stop it because we're not going to actually do anything
        // if (this.content.componentInstance === this.nextContent?.componentInstance) {
        //   return true;
        // }

        return this.content.canUnload(this.nextContent?.instruction ?? null);
      }
    );
  }

  public canLoad(recurse: boolean): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
    // console.log(this.connectedScope.toString(), 'viewport content canLoad', this.nextContent?.content?.componentName);
    if (this.clear) {
      return true;
    }

    if ((this.nextContent?.content ?? null) === null) {
      return true;
    }

    return Runner.run(
      () => this.waitForConnected(),
      () => {
        this.nextContent!.createComponent(this.connectedCE!, this.options.fallback);

        // This shouldn't happen
        // // Don't stop it because we're not going to actually do anything
        // if (this.content.componentInstance === this.nextContent!.componentInstance) {
        //   return true;
        // }

        return this.nextContent!.canLoad(this, this.content.instruction);
      },
      // () => recurse ? this.connectedScope.canLoad(recurse) : true,
    );
  }

  public load(recurse: boolean): void | Promise<void> {
    // console.log(this.connectedScope.toString(), 'viewport content load', this.nextContent?.content?.componentName);
    if (this.clear || (this.nextContent?.componentInstance ?? null) === null) {
      return;
    }

    // This shouldn't happen
    // // TODO: Verify this
    // if (this.nextContent === this.content) {
    //   return;
    // }

    return Runner.run(
      () => this.nextContent?.load(this.content.instruction),
      // () => recurse ? this.connectedScope.load(recurse) : true,
    );
    // return this.nextContent?.load(this.content.instruction);
    // await this.nextContent.activateComponent(null, this.connectedCE!.$controller as ICustomElementController<Element, ICustomElementViewModel<Element>>, LifecycleFlags.none, this.connectedCE!);
    // return true;
  }

  public addContent(): void | Promise<void> {
    // console.log('addContent', this.toString());

    return Runner.run(
      () => this.activate(null, this.connectedController, LifecycleFlags.none, this.parentNextContentActivated)
    );
  }

  public removeContent(): void | Promise<void> {
    if (this.isEmpty) {
      return;
    }
    // console.log('removeContent', this.toString());

    return Runner.run(
      () => this.connectedScope.removeContent(),
      () => this.deactivate(null, null /* TODO: verify this.connectedController */, LifecycleFlags.none),
      () => this.dispose(),
    );
  }

  public removeChildrenContent(): void | Promise<void> {
    // console.log(this.name, 'removeContent', this.content.content);
    return Runner.run(
      () => !this.isEmpty ? this.connectedScope.removeContent() : void 0,
    );
  }

  public activate(initiator: IHydratedController<Element> | null, parent: IHydratedParentController<Element> | null, flags: LifecycleFlags, fromParent: boolean): void | Promise<void> {
    // console.log('activate' /* , { ...this } */);
    if (this.activeContent.componentInstance !== null) {
      this.connectedScope.reenableReplacedChildren();
      return Runner.run(
        () => this.activeContent.load(this.activeContent.instruction), // Only acts if not already loaded
        () => this.activeContent.activateComponent(
          initiator,
          parent as IRoutingController,
          flags,
          this.connectedCE!,
          fromParent),
      );
    }
  }

  public deactivate(initiator: IHydratedController<Element> | null, parent: IHydratedParentController<Element> | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.content.componentInstance &&
      !this.content.reentry &&
      this.content.componentInstance !== this.nextContent?.componentInstance) {
      return Runner.run(
        () => this.content?.unload(this.content.instruction), // Only acts if not already unloaded
        () => this.content?.deactivateComponent(
          initiator,
          parent as IRoutingController,
          flags,
          this.connectedCE!,
          this.router.statefulHistory || this.options.stateful
        )
      );
    }
  }

  public unload(recurse: boolean): void | Promise<void> {
    return Runner.run(
      () => recurse ? this.connectedScope.unload(recurse) : true,
      () => {
        // console.log(this.connectedScope.toString(), 'viewport content unload', this.content.content.componentName);
        // This shouldn't happen
        // // TODO: Verify this
        // if (this.nextContent === this.content) {
        //   return;
        // }

        if (this.content.componentInstance) {
          return this.content.unload(this.nextContent?.instruction ?? null);
        }
      }
    );
  }

  public dispose(): void | Promise<void> {
    if (this.content.componentInstance &&
      !this.content.reentry &&
      this.content.componentInstance !== this.nextContent?.componentInstance) {
      return Runner.run(
        // () => this.content!.unloadComponent(
        //   this.historyCache,
        //   this.router.statefulHistory || this.options.stateful),
        // () => this.content!.destroyComponent(),
        () => this.content!.disposeComponent(
          this.connectedCE!,
          this.historyCache,
          this.router.statefulHistory || this.options.stateful
        ),
      );
      // await this.content!.freeContent(
      //   this.connectedCE,
      //   this.nextContent!.instruction,
      //   this.historyCache,
      //   this.router.statefulHistory || this.options.stateful);
    }
  }

  public finalizeContentChange(): void {
    // console.log('finalizeContent', this.nextContent!.content?.componentName);
    if (this.nextContent!.componentInstance) {
      this.content = this.nextContent!;
      this.content.reentry = false;
    }

    if (this.clear) {
      this.content = new ViewportContent(void 0, this.nextContent!.instruction);
    }
    this.nextContent = null;
    this.nextContentAction = '';

    this.previousViewportState = null;
    this.connectedScope.clearReplacedChildren();
  }
  public abortContentChange(): void | Promise<void> {
    this.connectedScope.reenableReplacedChildren();
    return Runner.run(
      () => this.nextContent!.freeContent(
        this.connectedCE,
        this.nextContent!.instruction,
        this.historyCache,
        this.router.statefulHistory || this.options.stateful),
      () => {
        if (this.previousViewportState) {
          Object.assign(this, this.previousViewportState);
        }
        this.nextContentAction = '';
      });
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

  public freeContent(component: IRouteableComponent): void | Promise<void> {
    const content = this.historyCache.find(cached => cached.componentInstance === component);
    if (content !== void 0) {
      return Runner.run(
        () => {
          this.forceRemove = true;
          return content.freeContent(
            null,
            null,
            this.historyCache,
            false,
          );
        },
        () => {
          this.forceRemove = false;
          arrayRemove(this.historyCache, (cached => cached === content));
        },
      );
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
      const controller = CustomElement.for(this.connectedCE!.element);
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

  private waitForConnected(): void | Promise<void> {
    if (this.connectedCE === null) {
      return new Promise((resolve) => {
        this.connectionResolve = resolve;
      });
    }
  }
}
