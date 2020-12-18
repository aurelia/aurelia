/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { LifecycleFlags, ICompiledRenderContext, CustomElement, IHydratedController, IHydratedParentController } from '@aurelia/runtime-html';
import { ComponentAppellation, IRouteableComponent, ReentryBehavior, RouteableComponentType, LoadInstruction } from './interfaces.js';
import { IRouter } from './router.js';
import { arrayRemove } from './utils.js';
import { ViewportContent } from './viewport-content.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { IScopeOwnerOptions, NextContentAction, Scope } from './scope.js';
import { Navigation } from './navigation.js';
import { NavigationCoordinator } from './navigation-coordinator.js';
import { Runner, Step } from './runner.js';
import { Routes } from './decorators/routes.js';
import { Route } from './route.js';
import { Endpoint, IRoutingController, IConnectedCustomElement } from './endpoints/endpoint.js';

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

export class Viewport extends Endpoint {
  public content: ViewportContent;
  public nextContent: ViewportContent | null = null;

  public forceRemove: boolean = false;

  public activeResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;
  private connectionResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;
  private clear: boolean = false;

  private previousViewportState: Viewport | null = null;

  private cache: ViewportContent[] = [];
  private historyCache: ViewportContent[] = [];

  public constructor(
    router: IRouter,
    name: string,
    connectedCE: IConnectedCustomElement | null,
    owningScope: Scope,
    scope: boolean,
    public options: IViewportOptions = {}
  ) {
    super(router, name, connectedCE, owningScope, scope);
    this.connectedScope.viewport = this;
    this.content = new ViewportContent();
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

  public get pathname(): string {
    return this.connectedScope.pathname;
  }

  public toString(): string {
    const contentName = this.content?.content.component.name ?? '';
    const nextContentName = this.nextContent?.content.component.name ?? '';
    return `v:${this.name}[${contentName}->${nextContentName}]`;
  }

  public setNextContent(routingInstruction: RoutingInstruction, navigation: Navigation): NextContentAction {
    routingInstruction.viewport.set(this);
    this.clear = this.router.instructionResolver.isClearRoutingInstruction(routingInstruction);

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(!this.clear ? routingInstruction : void 0, navigation, this.connectedCE ?? null);

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

      this.nextContent.content.component.set(this.content.componentInstance!);
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
        this.nextContent!.content.component.set(this.content.componentInstance!);
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
      const instructions = this.router.instructionResolver.parseRoutingInstructions(this.options.default);
      for (const instruction of instructions) {
        // Set to name to be delayed one turn
        instruction.viewport.set(this.name);
        instruction.scope = this.owningScope;
        instruction.default = true;
      }
      this.router.load(instructions, { append: true }).catch(error => { throw error; });
    }
  }

  public remove(step: Step | null, connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean> {
    // TODO: Review this: should it go from promise to value somewhere?
    if (this.connectedCE === connectedCE) {
      // console.log('>>> Runner.run', 'remove');
      return Runner.run(step,
        (step: Step<void>) => {
          if (this.content.componentInstance) {
            return this.content.freeContent(
              step,
              this.connectedCE,
              (this.nextContent ? this.nextContent.instruction : null),
              this.historyCache,
              this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful
            ); // .catch(error => { throw error; });
          }
        },
        (step: Step<void>) => {
          if (this.doForceRemove) {
            const removes = [];
            for (const content of this.historyCache) {
              removes.push((step: Step<void>) => content.freeContent(
                step,
                null,
                null,
                this.historyCache,
                false,
              ));
            }
            removes.push(() => { this.historyCache = []; });
            // console.log('>>> Runner.run', 'removes');
            return Runner.run(step,
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
      ) as boolean | Promise<boolean>;
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
      (step: Step<boolean>) => performLoad ? this.canUnload(step) : true,
      (step: Step<boolean>) => {
        // console.log('canUnload step', step.previousValue);
        if (!step.previousValue) { // canUnloadResult: boolean
          step.cancel();
          coordinator.cancel();
          return;
        }

        if (this.router.isRestrictedNavigation) {
          this.nextContent!.createComponent(this.connectedCE!, this.options.fallback);
        }

        coordinator.addEntityState(this, 'guardedUnload');
      },
      () => coordinator.waitForSyncState('guardedUnload', this),

      (step: Step<boolean>) => performLoad ? this.canLoad(step, guarded) as boolean | LoadInstruction | LoadInstruction[] : true,
      (step: Step) => {
        const canLoadResult = step.previousValue as boolean | LoadInstruction | LoadInstruction[];
        if (typeof canLoadResult === 'boolean') { // canLoadResult: boolean | LoadInstruction | LoadInstruction[],
          if (!step.previousValue) {
            step.cancel();
            coordinator.cancel();
            return;
          }
          coordinator.addEntityState(this, 'guardedLoad');
          coordinator.addEntityState(this, 'guarded');
        } else { // Denied and (probably) redirected
          // console.log('>>> Runner.run', 'transition.load');
          return Runner.run(step,
            () => this.router.load(canLoadResult, { append: true }),
            (step: Step<void>) => this.abortContentChange(step),
            // TODO: Abort content change in the viewports
          );
        }
      },
    ];

    const routingSteps = [
      // () => { console.log("I'm waiting for guarded", this.toString()); },
      () => coordinator.waitForSyncState('guarded', this),
      // () => { console.log("I'm guarded", this.toString()); },
      // TODO: For consistency it should probably be this option with 'routed'
      // () => performSwap ? this.unload(coordinator.checkingSyncState('routed')) : true,
      (step: Step<void>) => performLoad ? this.unload(step, true) : true,
      () => coordinator.addEntityState(this, 'unloaded'),

      // () => { console.log("I'm waiting for unloaded", this.toString()); },
      () => coordinator.waitForSyncState('unloaded', this),
      // () => { console.log("I'm done waiting for unloaded", this.toString()); },
      (step: Step<void>) => performLoad ? this.load(step, coordinator.checkingSyncState('routed')) : true,
      () => coordinator.addEntityState(this, 'loaded'),
      () => coordinator.addEntityState(this, 'routed'),
    ];

    const lifecycleSteps: ((step: Step<void | void[]>) => Step<void> | Promise<void> | void)[] = [
      () => coordinator.waitForSyncState('routed', this),
      // () => coordinator.addEntityState(this, 'bound'),
    ];
    if (performSwap) {
      if (this.router.options.swapStrategy.includes('parallel')) {
        lifecycleSteps.push((step: Step<void | void[]>): Step<void> => {
          if (this.router.options.swapStrategy.includes('add')) {
            // console.log('>>> Runner.run', 'transition.parallel-add');
            return Runner.runParallel<void>(step as Step<void>,
              (step: Step<void | void[]>): void | Step<void> => this.addContent(step as Step<void>),
              (step: Step<void | void[]>): void | Step<void> => this.removeContent(step as Step<void>),
            ) as Step<void>;
          } else {
            // console.log('AM HERE');
            // const $Controller = Controller;
            // const $CustomElement = CustomElement;
            // return LoggedPromise.all([
            // console.log('AM HERE');
            // this.content?.deactivateComponent(
            //   CustomElement.for(this.connectedCE!.element),
            //   null,
            //   LifecycleFlags.none,
            //   this.connectedCE!,
            //   this.router.statefulHistory || this.options.stateful
            // ),
            // this.activeContent.activateComponent(
            //   CustomElement.for(this.connectedCE!.element),
            //   null,
            //   LifecycleFlags.none,
            //   this.connectedCE!,
            //   this.parentNextContentActivated)
            // console.log('>>> Runner.run', 'transition.parallel-remove-inside');
            return Runner.runParallel(step as Step<void>,
              (step: Step<void>) => this.removeContent(step),
              (step: Step<void>) => this.addContent(step),
            ) as Step<void>;
            // ]).then(() => { console.log('DONE HERE'); }) as unknown as Promise<void>;
          }
        });
      } else {
        lifecycleSteps.push(
          (step: Step<void | void[]>) => performSwap
            ? (this.router.options.swapStrategy.includes('add') ? this.addContent(step as Step<void>) : this.removeContent(step as Step<void>))
            : void 0,
          (step: Step<void | void[]>) => performSwap
            ? (this.router.options.swapStrategy.includes('add') ? this.removeContent(step as Step<void>) : this.addContent(step as Step<void>))
            : void 0,
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
    // console.log('>>> Runner.run', 'transition');
    Runner.run(null,
      ...guardSteps,
      ...routingSteps,
      ...lifecycleSteps,
      () => coordinator.addEntityState(this, 'completed')
    );
  }

  public canUnload(step: Step<boolean> | null): boolean | Promise<boolean> {
    // console.log('>>> Runner.run', 'canUnload');
    return Runner.run(step,
      (step: Step<boolean>) => {
        // console.log('viewport canUnload run', this.name, 'before');
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const result = this.connectedScope.canUnload(step);
        // console.log('viewport canUnload run', this.name, 'after');
        return result;
      },
      (step: Step<boolean>) => {
        // console.log('viewport canUnload result', this.connectedScope.toString(), step.previousValue);
        if (!step.previousValue) { // canUnloadChildren
          return false;
        }

        // This shouldn't happen
        // // Don't stop it because we're not going to actually do anything
        // if (this.content.componentInstance === this.nextContent?.componentInstance) {
        //   return true;
        // }

        return this.content.canUnload(this.nextContent?.instruction ?? null);
      }
    ) as boolean | Promise<boolean>;
  }

  public canLoad(step: Step<boolean>, recurse: boolean): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    // console.log(this.connectedScope.toString(), 'viewport content canLoad', this.nextContent?.content?.component.name);
    if (this.clear) {
      return true;
    }

    if ((this.nextContent?.content ?? null) === null) {
      return true;
    }

    // console.log('>>> Runner.run', 'canLoad');
    return Runner.run(step,
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
    ) as boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
  }

  public load(step: Step<void>, recurse: boolean): Step<void> | void {
    // console.log(this.connectedScope.toString(), 'viewport content load', this.nextContent?.content?.component.name);
    if (this.clear || (this.nextContent?.componentInstance ?? null) === null) {
      return;
    }

    // This shouldn't happen
    // // TODO: Verify this
    // if (this.nextContent === this.content) {
    //   return;
    // }

    // console.log('>>> Runner.run', 'load');
    // return Runner.run(null,
    //   () => this.nextContent?.load(this.content.instruction),
    //   // () => recurse ? this.connectedScope.load(recurse) : true,
    // );
    return this.nextContent?.load(step, this.content.instruction);
    // return this.nextContent?.load(this.content.instruction);
    // await this.nextContent.activateComponent(null, this.connectedCE!.$controller as ICustomElementController<ICustomElementViewModel>, LifecycleFlags.none, this.connectedCE!);
    // return true;
  }

  public addContent(step: Step<void>): void | Step<void> {
    // console.log('addContent', this.toString());
    return this.activate(step, null, this.connectedController, LifecycleFlags.none, this.parentNextContentActivated);
  }

  public removeContent(step: Step<void> | null): void | Step<void> {
    if (this.isEmpty) {
      return;
    }
    // console.log('removeContent', this.toString());

    // console.log('>>> Runner.run', 'removeContent');
    return Runner.run(step,
      // () => { const promise = this.connectedScope.removeContent(); return !this.router.options.swapStrategy.includes('parallel') ? promise : void 0; },
      // () => this.connectedScope.removeContent(),
      // () => !this.router.options.swapStrategy.includes('parallel') ? this.connectedScope.removeContent() : void 0,
      () => this.deactivate(null, this.connectedController, LifecycleFlags.none),
      // () => {
      //   const result = this.deactivate(null, this.connectedController, LifecycleFlags.none);
      //   if (result instanceof Promise) {
      //     return result.then(() => this.dispose());
      //   } else {
      //     this.dispose() as void;
      //   }
      // },
      () => this.dispose(),
      // () => this.router.options.swapStrategy.includes('parallel') ? this.connectedScope.removeContent() : void 0,
    ) as Step<void>;
  }

  // public removeChildrenContent(): void | Promise<void> {
  //   // console.log(this.name, 'removeContent', this.content.content);
  //   if (!this.isEmpty) {
  //     return this.connectedScope.removeContent();
  //   }
  // }

  public activate(step: Step<void> | null, initiator: IHydratedController | null, parent: IHydratedParentController | null, flags: LifecycleFlags, fromParent: boolean): void | Step<void> {
    // console.log('activate' /* , { ...this } */);
    if (this.activeContent.componentInstance !== null) {
      this.connectedScope.reenableReplacedChildren();
      // console.log('>>> Runner.run', 'activate');
      return Runner.run(step,
        (step: Step<void>) => this.activeContent.load(step, this.activeContent.instruction), // Only acts if not already loaded
        (step: Step<void>) => this.activeContent.activateComponent(
          step,
          this,
          initiator,
          parent as IRoutingController,
          flags,
          this.connectedCE!,
          fromParent),
      ) as Step<void>;
    }
  }

  public deactivate(initiator: IHydratedController | null, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.content.componentInstance &&
      !this.content.reentry &&
      this.content.componentInstance !== this.nextContent?.componentInstance) {
      // // console.log('>>> Runner.run', 'deactivate');
      // return Runner.run(null,
      //   /*        () => this.content?.unload(this.content.instruction), // Only acts if not already unloaded */
      //   () => this.content?.deactivateComponent(
      //     initiator,
      //     parent as IRoutingController,
      //     flags,
      //     this.connectedCE!,
      //     this.router.statefulHistory || this.options.stateful
      //   )
      // );
      return this.content?.deactivateComponent(
        initiator,
        parent as IRoutingController,
        flags,
        this.connectedCE!,
        this.router.statefulHistory || this.options.stateful
      );
    }
  }

  public unload(step: Step<void> | null, recurse: boolean): void | Step<void> {
    // console.log('>>> Runner.run', 'unload');
    return Runner.run(step,
      () => recurse ? this.connectedScope.unload(step, recurse) : true,
      () => {
        // console.log(this.connectedScope.toString(), 'viewport content unload', this.content.content.component.name);
        // This shouldn't happen
        // // TODO: Verify this
        // if (this.nextContent === this.content) {
        //   return;
        // }

        if (this.content.componentInstance) {
          return this.content.unload(this.nextContent?.instruction ?? null);
        }
      }
    ) as Step<void>;
  }

  public dispose(): void {
    if (this.content.componentInstance &&
      !this.content.reentry &&
      this.content.componentInstance !== this.nextContent?.componentInstance) {
      this.content!.disposeComponent(
        this.connectedCE!,
        this.historyCache,
        this.router.statefulHistory || this.options.stateful
      );
    }
  }

  public finalizeContentChange(): void {
    // console.log('finalizeContent', this.nextContent!.content?.component.name);
    if (this.nextContent?.componentInstance != null) {
      this.content = this.nextContent!;
      this.content.reentry = false;
    }

    if (this.clear) {
      this.content = new ViewportContent(void 0, this.nextContent!.instruction);
    }
    this.nextContent = null;
    this.nextContentAction = '';

    this.content.contentStates.delete('checkedUnload');
    this.content.contentStates.delete('checkedLoad');

    this.previousViewportState = null;
    this.connectedScope.clearReplacedChildren();
  }
  public abortContentChange(step: Step<void>): void | Step<void> {
    this.connectedScope.reenableReplacedChildren();
    // console.log('>>> Runner.run', 'abortContentChange');
    return Runner.run(step,
      (step: Step<void>) => {
        if (this.nextContent != null) {
          return this.nextContent!.freeContent(
            step,
            this.connectedCE,
            this.nextContent!.instruction,
            this.historyCache,
            this.router.statefulHistory || this.options.stateful);
        }
      },
      () => {
        if (this.previousViewportState) {
          Object.assign(this, this.previousViewportState);
        }
        this.nextContent = null;
        this.nextContentAction = '';

        this.content.contentStates.delete('checkedUnload');
        this.content.contentStates.delete('checkedLoad');
      }) as Step<void>;
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

  public freeContent(step: Step<void> | null, component: IRouteableComponent): void | Promise<void> | Step<void> {
    const content = this.historyCache.find(cached => cached.componentInstance === component);
    if (content !== void 0) {
      // console.log('>>> Runner.run', 'freeContent');
      return Runner.run(step,
        (step: Step<void>) => {
          this.forceRemove = true;
          return content.freeContent(
            step,
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

  public getRoutes(): Route[] | null {
    let componentType = this.getComponentType();
    if (componentType === null) {
      return null;
    }
    componentType = componentType.constructor === componentType.constructor.constructor
      ? componentType
      : componentType.constructor as RouteableComponentType;

    const routes: Route[] = Routes.getConfiguration(componentType);
    // console.log('Routes.getConfiguration', routes);
    return Array.isArray(routes) ? routes : null;
  }

  public getTitle(navigationInstruction: Navigation): string {
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
      let name = this.getContentInstruction()!.component.name ?? '';
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
    let componentType = this.getContentInstruction()!.component.type ?? null;
    // TODO: This is going away once Metadata is in!
    if (componentType === null) {
      const controller = CustomElement.for(this.connectedCE!.element);
      componentType = (controller!.context as
        ICompiledRenderContext & { componentType: RouteableComponentType })
        .componentType;
    }
    return componentType ?? null;
  }

  private getComponentInstance(): IRouteableComponent | null {
    return this.getContentInstruction()!.component.instance ?? null;
  }

  private getContentInstruction(): RoutingInstruction | null {
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
