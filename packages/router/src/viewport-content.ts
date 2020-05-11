/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { IContainer, Reporter } from '@aurelia/kernel';
import { Controller, INode, LifecycleFlags, ILifecycle, IHydratedController, ICustomElementController } from '@aurelia/runtime';
import { INavigatorInstruction, IRouteableComponent, RouteableComponentType, ReentryBehavior } from './interfaces';
import { parseQuery } from './parser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { IStateManager } from './state-manager';
import { createViewportInstruction } from './instruction-resolver';

export const enum ContentStatus {
  none = 0,
  created = 1,
  loaded = 2,
  activated = 3,
}

export class ViewportContent {
  public contentStatus: ContentStatus = ContentStatus.none;
  public entered: boolean = false;
  public fromCache: boolean = false;
  public fromHistory: boolean = false;
  public reentry: boolean = false;

  public constructor(
    public readonly stateManager: IStateManager,
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    public content: ViewportInstruction = new ViewportInstruction(''),
    public instruction: INavigatorInstruction = {
      instruction: '',
      fullStateInstruction: '',
    },
    container: IContainer | null = null
  ) {
    // If we've got a container, we're good to resolve type
    if (!this.content.isComponentType() && container !== null) {
      this.content.componentType = this.toComponentType(container);
    }
  }

  public get componentInstance(): IRouteableComponent | null {
    return this.content.componentInstance;
  }
  public get viewport(): Viewport | null {
    return this.content.viewport;
  }

  public equalComponent(other: ViewportContent): boolean {
    return this.content.sameComponent(other.content);
  }

  public equalParameters(other: ViewportContent): boolean {
    return this.content.sameComponent(other.content, true) &&
      // TODO: Review whether query is relevant
      this.instruction.query === other.instruction.query;
  }

  public reentryBehavior(): ReentryBehavior {
    return (this.content.componentInstance !== null &&
      'reentryBehavior' in this.content.componentInstance &&
      this.content.componentInstance.reentryBehavior !== void 0)
      ? this.content.componentInstance.reentryBehavior
      : ReentryBehavior.default;
  }

  public isCacheEqual(other: ViewportContent): boolean {
    return this.content.sameComponent(other.content, true);
  }

  public createComponent(container: IContainer, fallback?: string): void {
    if (this.contentStatus !== ContentStatus.none) {
      return;
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache && !this.fromHistory) {
      try {
        this.content.componentInstance = this.toComponentInstance(container);
      } catch (e) {
        if (fallback !== void 0) {
          this.content.setParameters({ id: this.content.componentName });
          this.content.setComponent(fallback);
          try {
            this.content.componentInstance = this.toComponentInstance(container);
          } catch (ee) {
            throw e;
          }
        } else {
          throw e;
        }
      }
    }
    this.contentStatus = ContentStatus.created;
  }
  public destroyComponent(): void {
    // TODO: We might want to do something here eventually, who knows?
    if (this.contentStatus !== ContentStatus.created) {
      return;
    }
    // Don't destroy components when stateful
    this.contentStatus = ContentStatus.none;
  }

  public async canEnter(
    viewport: Viewport,
    previousInstruction: INavigatorInstruction,
  ): Promise<boolean | ViewportInstruction[]> {
    if (!this.content.componentInstance) {
      return false;
    }

    if (!this.content.componentInstance.canEnter) {
      return true;
    }

    const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
    this.instruction.parameters = this.content.toSpecifiedParameters(typeParameters);
    const merged = { ...parseQuery(this.instruction.query), ...this.instruction.parameters };
    const result = this.content.componentInstance.canEnter(merged, this.instruction, previousInstruction);
    Reporter.write(10000, 'viewport canEnter', result);
    if (typeof result === 'boolean') {
      return result;
    }
    if (typeof result === 'string') {
      return [createViewportInstruction(result, viewport)];
    }
    return result as Promise<ViewportInstruction[]>;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async canLeave(nextInstruction: INavigatorInstruction | null): Promise<boolean> {
    if (!this.content.componentInstance || !this.content.componentInstance.canLeave) {
      return true;
    }

    const result = this.content.componentInstance.canLeave(nextInstruction, this.instruction);
    Reporter.write(10000, 'viewport canLeave', result);

    if (typeof result === 'boolean') {
      return result;
    }
    return result;
  }

  public async enter(previousInstruction: INavigatorInstruction): Promise<void> {
    // if (!this.reentry && (this.contentStatus !== ContentStatus.created || this.entered)) {
    if (!this.reentry && (this.contentStatus !== ContentStatus.loaded || this.entered)) {
      return;
    }
    if (this.content.componentInstance && this.content.componentInstance.enter) {
      const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
      this.instruction.parameters = this.content.toSpecifiedParameters(typeParameters);
      const merged = { ...parseQuery(this.instruction.query), ...this.instruction.parameters };
      await this.content.componentInstance.enter(merged, this.instruction, previousInstruction);
    }
    this.entered = true;
  }
  public async leave(nextInstruction: INavigatorInstruction | null): Promise<void> {
    if (this.contentStatus !== ContentStatus.activated || !this.entered) {
      return;
    }
    if (this.content.componentInstance && this.content.componentInstance.leave) {
      await this.content.componentInstance.leave(nextInstruction, this.instruction);
    }
    this.entered = false;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async loadComponent(viewportController: ICustomElementController, viewport: Viewport): Promise<void> {
    // if (this.contentStatus !== ContentStatus.created || !this.entered || !this.content.componentInstance) {
    if (this.contentStatus !== ContentStatus.created || this.entered || !this.content.componentInstance) {
      return;
    }
    // Don't load cached content or instantiated history content
    if (!this.fromCache || !this.fromHistory) {
      Controller.forCustomElement(
        this.content.componentInstance,
        viewportController.context.get(ILifecycle),
        viewportController.host as INode,
        viewportController.context,
        void 0,
        void 0,
      );
    }
    this.contentStatus = ContentStatus.loaded;
  }

  public unloadComponent(cache: ViewportContent[], stateful: boolean = false): void {
    // TODO: We might want to do something here eventually, who knows?
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }

    // Don't unload components when stateful
    if (!stateful) {
      this.contentStatus = ContentStatus.created;
    } else {
      cache.push(this);
    }
  }

  public async activateComponent(
    initiator: IHydratedController | null,
    viewportController: ICustomElementController | null,
    flags: LifecycleFlags,
  ): Promise<void> {
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }

    const controller = this.content.componentInstance!.$controller!;
    await controller.activate(initiator ?? controller, null, flags);
    if ((this.fromCache || this.fromHistory) && viewportController) {
      this.stateManager.restoreState(viewportController);
    }
    this.contentStatus = ContentStatus.activated;
  }

  public async deactivateComponent(
    initiator: IHydratedController | null,
    viewportController: ICustomElementController | null,
    flags: LifecycleFlags,
    stateful: boolean = false,
  ): Promise<void> {
    if (this.contentStatus !== ContentStatus.activated || this.entered) {
      return;
    }
    if (stateful && viewportController) {
      this.stateManager.saveState(viewportController);
    }

    const controller = this.content.componentInstance!.$controller!;
    await controller.deactivate(initiator ?? controller, null, flags);
    this.contentStatus = ContentStatus.loaded;
  }

  public async freeContent(
    viewportController: ICustomElementController | null,
    nextInstruction: INavigatorInstruction | null,
    cache: ViewportContent[],
    stateful: boolean = false,
  ): Promise<void> {
    switch (this.contentStatus) {
      case ContentStatus.activated:
        await this.leave(nextInstruction);
        await this.deactivateComponent(null, viewportController, LifecycleFlags.none);
      case ContentStatus.loaded:
        this.unloadComponent(cache, stateful);
      case ContentStatus.created:
        this.destroyComponent();
    }
  }

  public toComponentName(): string | null {
    return this.content.componentName;
  }
  public toComponentType(container: IContainer): RouteableComponentType | null {
    if (this.content.isEmpty()) {
      return null;
    }
    return this.content.toComponentType(container);
  }
  public toComponentInstance(container: IContainer): IRouteableComponent | null {
    if (this.content.isEmpty()) {
      return null;
    }
    return this.content.toComponentInstance(container);
  }
}
