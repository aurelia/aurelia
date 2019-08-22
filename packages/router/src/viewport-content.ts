import { Constructable, IContainer, Reporter } from '@aurelia/kernel';
import { Controller, CustomElement, IController, ICustomElementType, INode, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { ComponentAppellation, INavigatorInstruction, IRouteableComponent, IRouteableComponentType, ReentryBehavior } from './interfaces';
import { mergeParameters } from './parser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export const enum ContentStatus {
  none = 0,
  created = 1,
  loaded = 2,
  initialized = 3,
  added = 4,
}

export class ViewportContent {
  public componentInstance: IRouteableComponent | null = null;
  public contentStatus: ContentStatus = ContentStatus.none;
  public entered: boolean = false;
  public fromCache: boolean = false;
  public reentry: boolean = false;

  constructor(
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    public content: ComponentAppellation | null = null,
    public parameters: string = '',
    public instruction: INavigatorInstruction = {
      instruction: '',
      fullStateInstruction: '',
    },
    context: IRenderContext | IContainer | null = null
  ) {
    // If we've got a container, we're good to resolve type
    if (this.content !== null && typeof this.content === 'string' && context !== null) {
      this.content = this.toComponentType(context);
    }
  }

  public equalComponent(other: ViewportContent): boolean {
    return (typeof other.content === 'string' && this.toComponentName() === other.content) ||
      (typeof other.content !== 'string' && this.content === other.content);
  }

  public equalParameters(other: ViewportContent): boolean {
    // TODO: Review this
    return this.parameters === other.parameters &&
      this.instruction.query === other.instruction.query;
  }

  public reentryBehavior(): ReentryBehavior {
    return (this.componentInstance &&
      'reentryBehavior' in this.componentInstance &&
      this.componentInstance.reentryBehavior)
      ? this.componentInstance.reentryBehavior
      : ReentryBehavior.default;
  }

  public isCacheEqual(other: ViewportContent): boolean {
    return ((typeof other.content === 'string' && this.toComponentName() === other.content) ||
      (typeof other.content !== 'string' && this.content === other.content)) &&
      this.parameters === other.parameters;
  }

  public createComponent(context: IRenderContext | IContainer): void {
    if (this.contentStatus !== ContentStatus.none) {
      return;
    }
    // Don't load cached content
    if (!this.fromCache) {
      this.componentInstance = this.toComponentInstance(context);
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

  public canEnter(viewport: Viewport, previousInstruction: INavigatorInstruction): Promise<boolean | ViewportInstruction[]> {
    if (!this.componentInstance) {
      return Promise.resolve(false);
    }

    if (!this.componentInstance.canEnter) {
      return Promise.resolve(true);
    }

    const contentType: IRouteableComponentType = this.componentInstance !== null ? this.componentInstance.constructor as IRouteableComponentType : this.content as IRouteableComponentType;
    const merged = mergeParameters(this.parameters, this.instruction.query, contentType.parameters);
    this.instruction.parameters = merged.namedParameters;
    this.instruction.parameterList = merged.parameterList;
    const result = this.componentInstance.canEnter(merged.merged, this.instruction, previousInstruction);
    Reporter.write(10000, 'viewport canEnter', result);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    if (typeof result === 'string') {
      return Promise.resolve([new ViewportInstruction(result, viewport)]);
    }
    return result as Promise<ViewportInstruction[]>;
  }
  public canLeave(nextInstruction: INavigatorInstruction | null): Promise<boolean> {
    if (!this.componentInstance || !this.componentInstance.canLeave) {
      return Promise.resolve(true);
    }

    const result = this.componentInstance.canLeave(nextInstruction, this.instruction);
    Reporter.write(10000, 'viewport canLeave', result);

    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public async enter(previousInstruction: INavigatorInstruction): Promise<void> {
    if (!this.reentry && (this.contentStatus !== ContentStatus.created || this.entered)) {
      return;
    }
    if (this.componentInstance && this.componentInstance.enter) {
      const contentType: IRouteableComponentType = this.componentInstance !== null ? this.componentInstance.constructor as IRouteableComponentType : this.content as IRouteableComponentType;
      const merged = mergeParameters(this.parameters, this.instruction.query, contentType.parameters);
      this.instruction.parameters = merged.namedParameters;
      this.instruction.parameterList = merged.parameterList;
      await this.componentInstance.enter(merged.merged, this.instruction, previousInstruction);
    }
    this.entered = true;
  }
  public async leave(nextInstruction: INavigatorInstruction | null): Promise<void> {
    if (this.contentStatus !== ContentStatus.added || !this.entered) {
      return;
    }
    if (this.componentInstance && this.componentInstance.leave) {
      await this.componentInstance.leave(nextInstruction, this.instruction);
    }
    this.entered = false;
  }

  public loadComponent(context: IRenderContext | IContainer, element: Element): Promise<void> {
    if (this.contentStatus !== ContentStatus.created || !this.entered || !this.componentInstance) {
      return Promise.resolve();
    }
    // Don't load cached content
    if (!this.fromCache) {
      const host: INode = element as INode;
      const container = context;
      Controller.forCustomElement(this.componentInstance, container, host);
    }
    this.contentStatus = ContentStatus.loaded;
    return Promise.resolve();
  }
  public unloadComponent(): void {
    // TODO: We might want to do something here eventually, who knows?
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }
    // Don't unload components when stateful
    this.contentStatus = ContentStatus.created;
  }

  public initializeComponent(): void {
    if (this.contentStatus !== ContentStatus.loaded) {
      return;
    }
    // Don't initialize cached content
    if (!this.fromCache) {
      ((this.componentInstance as IRouteableComponent).$controller as IController<Node>).bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
    }
    this.contentStatus = ContentStatus.initialized;
  }
  public terminateComponent(stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    // Don't terminate cached content
    if (!stateful) {
      ((this.componentInstance as IRouteableComponent).$controller as IController<Node>).unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
      this.contentStatus = ContentStatus.loaded;
    }
  }

  public addComponent(element: Element): void {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    ((this.componentInstance as IRouteableComponent).$controller as IController<Node>).attach(LifecycleFlags.fromStartTask);
    if (this.fromCache) {
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
    this.contentStatus = ContentStatus.added;
  }
  public removeComponent(element: Element, stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatus.added || this.entered) {
      return;
    }
    if (stateful) {
      const elements = Array.from(element.getElementsByTagName('*'));
      for (const el of elements) {
        if (el.scrollTop > 0 || el.scrollLeft) {
          el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
        }
      }
    }
    ((this.componentInstance as IRouteableComponent).$controller as IController<Node>).detach(LifecycleFlags.fromStopTask);
    this.contentStatus = ContentStatus.initialized;
  }

  public async freeContent(element: Element, nextInstruction: INavigatorInstruction | null, stateful: boolean = false): Promise<void> {
    switch (this.contentStatus) {
      case ContentStatus.added:
        await this.leave(nextInstruction);
        this.removeComponent(element, stateful);
      case ContentStatus.initialized:
        this.terminateComponent(stateful);
      case ContentStatus.loaded:
        this.unloadComponent();
      case ContentStatus.created:
        this.destroyComponent();
    }
  }

  public toComponentName(): string | null {
    if (this.content === null) {
      return null;
    } else if (typeof this.content === 'string') {
      return this.content;
    } else {
      return (this.content as ICustomElementType<Constructable>).description.name;
    }
  }
  public toComponentType(context: IRenderContext | IContainer): IRouteableComponentType | null {
    if (this.content === null) {
      return null;
    } else if (typeof this.content !== 'string') {
      return this.content as IRouteableComponentType;
    } else {
      const container = context.get(IContainer);
      if (container) {
        const resolver = container.getResolver<IRouteableComponentType>(CustomElement.keyFrom(this.content));
        if (resolver && resolver.getFactory) {
          const factory = resolver.getFactory(container);
          if (factory) {
            return factory.Type;
          }
        }
      }
      return null;
    }
  }
  public toComponentInstance(context: IRenderContext | IContainer): IRouteableComponent | null {
    if (this.content === null) {
      return null;
    }
    // TODO: Remove once "local registration is fixed"
    const component = this.toComponentName();
    if (component) {
      const container = context.get(IContainer);
      if (container) {
        if (typeof component !== 'string') {
          return container.get<IRouteableComponent>(component);
        } else {
          return container.get<IRouteableComponent>(CustomElement.keyFrom(component));
        }
      }
    }
    return null;
  }
}
