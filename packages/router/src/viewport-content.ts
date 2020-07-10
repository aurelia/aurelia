import { IContainer, Reporter } from '@aurelia/kernel';
import { Controller, IController, INode, LifecycleFlags, ILifecycle, CustomElement, IHydratedController } from '@aurelia/runtime';
import { IRouteableComponent, RouteableComponentType, ReentryBehavior } from './interfaces';
import { parseQuery } from './parser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { Navigation } from './navigation';

/**
 * @internal - Shouldn't be used directly
 */
export const enum ContentStatus {
  none = 0,
  created = 1,
  loaded = 2,
  initialized = 3,
  added = 4,
}

/**
 * @internal - Shouldn't be used directly
 */
export class ViewportContent {
  public contentStatus: ContentStatus = ContentStatus.none;
  public entered: boolean = false;
  public fromCache: boolean = false;
  public fromHistory: boolean = false;
  public reentry: boolean = false;

  public constructor(
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    public content: ViewportInstruction = new ViewportInstruction(''),
    public instruction = new Navigation({
      instruction: '',
      fullStateInstruction: '',
    }),
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

  public async canEnter(viewport: Viewport, previousInstruction: Navigation): Promise<boolean | ViewportInstruction[]> {
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
      return [viewport.router.createViewportInstruction(result, viewport)];
    }
    return result as Promise<ViewportInstruction[]>;
  }

  public async canLeave(nextInstruction: Navigation | null): Promise<boolean> {
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

  public async enter(previousInstruction: Navigation): Promise<void> {
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
  public async leave(nextInstruction: Navigation | null): Promise<void> {
    if (this.contentStatus !== ContentStatus.added || !this.entered) {
      return;
    }
    if (this.content.componentInstance && this.content.componentInstance.leave) {
      await this.content.componentInstance.leave(nextInstruction, this.instruction);
    }
    this.entered = false;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async loadComponent(container: IContainer, element: Element, viewport: Viewport): Promise<void> {
    // if (this.contentStatus !== ContentStatus.created || !this.entered || !this.content.componentInstance) {
    if (this.contentStatus !== ContentStatus.created || this.entered || !this.content.componentInstance) {
      return;
    }
    this.contentStatus = ContentStatus.loaded;
    // Don't load cached content or instantiated history content
    if (!this.fromCache || !this.fromHistory) {
      const host: INode = element as INode;
      const controller = Controller.forCustomElement(
        this.content.componentInstance,
        container.get(ILifecycle),
        host,
        container,
        void 0,
        void 0,
      );
      controller.parent = CustomElement.for(element)!;
    }
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

  public initializeComponent(parent: IController): void {
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }
    this.contentStatus = ContentStatus.initialized;
    // Don't initialize cached content or instantiated history content
    // if (!this.fromCache || !this.fromHistory) {
    // ((this.content.componentInstance as IRouteableComponent).$controller as IController).parent = parent;
    // New hooks - ((this.content.componentInstance as IRouteableComponent).$controller as IController).bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
    // }
  }

  public async terminateComponent(initiator: IHydratedController<Node> | null, flags: LifecycleFlags, stateful: boolean = false): Promise<void> {
    if (this.contentStatus !== ContentStatus.initialized && this.contentStatus !== ContentStatus.added) {
      return;
    }
    this.contentStatus = ContentStatus.loaded;
    // Don't terminate cached content
    // if (!stateful) {
    // New hooks - await ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind).wait();
    // ((this.content.componentInstance as IRouteableComponent).$controller as IController).parent = void 0;
    // }
    const controller = this.content.componentInstance!.$controller!;
    await controller.deactivate(initiator ?? controller, null, flags);
  }

  public async addComponent(initiator: IHydratedController<Node> | null, flags: LifecycleFlags, element: Element): Promise<void> {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    this.contentStatus = ContentStatus.added;
    // New hooks - ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).attach(LifecycleFlags.fromStartTask);
    const controller = this.content.componentInstance!.$controller!;
    await controller.activate(initiator ?? controller, null, flags);
    if (this.fromCache || this.fromHistory) {
      const elements = Array.from(element.getElementsByTagName('*'));
      for (const el of elements) {
        const attr = el.getAttribute('au-element-scroll');
        if (attr) {
          const [top, left] = attr.split(',');
          el.removeAttribute('au-element-scroll');
          el.scrollTo(+left, +top);
        }
      }
    }
  }
  public async removeComponent(initiator: IHydratedController<Node> | null, flags: LifecycleFlags, element: Element | null, stateful: boolean = false): Promise<void> {
    if (this.contentStatus !== ContentStatus.added || this.entered) {
      return;
    }
    this.contentStatus = ContentStatus.initialized;
    if (stateful && element !== null) {
      const elements = Array.from(element.getElementsByTagName('*'));
      for (const el of elements) {
        if (el.scrollTop > 0 || el.scrollLeft) {
          el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
        }
      }
    }
    // New hooks - ((this.content.componentInstance as IRouteableComponent).$controller as IController<Node>).detach(LifecycleFlags.fromStopTask);
    // const controller = this.content.componentInstance!.$controller!;
    // await controller.deactivate(initiator ?? controller, null, flags);
    await Promise.resolve();
  }

  public async freeContent(element: Element | null, nextInstruction: Navigation | null, cache: ViewportContent[], stateful: boolean = false): Promise<void> {
    switch (this.contentStatus) {
      case ContentStatus.added:
        await this.leave(nextInstruction);
        await this.removeComponent(null, LifecycleFlags.none, element, stateful);
      case ContentStatus.initialized:
        await this.terminateComponent(null, LifecycleFlags.none, stateful);
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
