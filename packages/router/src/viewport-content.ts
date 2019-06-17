import { IContainer, Reporter, Constructable } from '@aurelia/kernel';
import { CustomElementResource, ICustomElementType, INode, IRenderContext, IViewModel, LifecycleFlags, IController, Controller } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { mergeParameters } from './parser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IRouteableCustomElementType extends Partial<ICustomElementType> {
  parameters?: string[];
}

export interface IRouteableCustomElement<T extends INode = INode> extends IViewModel<T> {
  reentryBehavior?: ReentryBehavior;
  canEnter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
  enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
  canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
  leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}

export const enum ContentStatus {
  none = 0,
  created = 1,
  loaded = 2,
  initialized = 3,
  added = 4,
}

export const enum ReentryBehavior {
  default = 'default',
  disallow = 'disallow',
  enter = 'enter',
  refresh = 'refresh',
}

export class ViewportContent {
  public content: IRouteableCustomElementType | string;
  public parameters: string;
  public instruction: INavigationInstruction;
  public component: IRouteableCustomElement;
  public contentStatus: ContentStatus;
  public entered: boolean;
  public fromCache: boolean;
  public reentry: boolean;

  constructor(content: Partial<ICustomElementType> | string = null, parameters: string = null, instruction: INavigationInstruction = null, context: IRenderContext | IContainer = null) {
    // Can be a (resolved) type or a string (to be resolved later)
    this.content = content;
    this.parameters = parameters;
    this.instruction = instruction;
    this.component = null;
    this.contentStatus = ContentStatus.none;
    this.entered = false;
    this.fromCache = false;
    this.reentry = false;

    // If we've got a container, we're good to resolve type
    if (this.content !== null && typeof this.content === 'string' && context !== null) {
      this.content = this.componentType(context);
    }
  }

  public equalComponent(other: ViewportContent): boolean {
    return (typeof other.content === 'string' && this.componentName() === other.content) ||
      (typeof other.content !== 'string' && this.content === other.content);
  }

  public equalParameters(other: ViewportContent): boolean {
    // TODO: Review this
    return this.parameters === other.parameters &&
      this.instruction.query === other.instruction.query;
  }

  public reentryBehavior(): ReentryBehavior {
    return 'reentryBehavior' in this.component ? this.component.reentryBehavior : ReentryBehavior.default;
  }

  public isCacheEqual(other: ViewportContent): boolean {
    return ((typeof other.content === 'string' && this.componentName() === other.content) ||
      (typeof other.content !== 'string' && this.content === other.content)) &&
      this.parameters === other.parameters;
  }

  public createComponent(context: IRenderContext | IContainer): void {
    if (this.contentStatus !== ContentStatus.none) {
      return;
    }
    // Don't load cached content
    if (!this.fromCache) {
      this.component = this.componentInstance(context);
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

  public canEnter(viewport: Viewport, previousInstruction: INavigationInstruction): Promise<boolean | ViewportInstruction[]> {
    if (!this.component) {
      return Promise.resolve(false);
    }

    if (!this.component.canEnter) {
      return Promise.resolve(true);
    }

    const merged = mergeParameters(this.parameters, this.instruction.query, (this.content as IRouteableCustomElementType).parameters);
    this.instruction.parameters = merged.namedParameters;
    this.instruction.parameterList = merged.parameterList;
    const result = this.component.canEnter(merged.merged, this.instruction, previousInstruction);
    Reporter.write(10000, 'viewport canEnter', result);
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    if (typeof result === 'string') {
      return Promise.resolve([new ViewportInstruction(result, viewport)]);
    }
    return result as Promise<ViewportInstruction[]>;
  }
  public canLeave(nextInstruction: INavigationInstruction): Promise<boolean> {
    if (!this.component || !this.component.canLeave) {
      return Promise.resolve(true);
    }

    const result = this.component.canLeave(this.instruction, nextInstruction);
    Reporter.write(10000, 'viewport canLeave', result);

    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }
    return result;
  }

  public async enter(previousInstruction: INavigationInstruction): Promise<void> {
    if (!this.reentry && (this.contentStatus !== ContentStatus.created || this.entered)) {
      return;
    }
    if (this.component.enter) {
      const merged = mergeParameters(this.parameters, this.instruction.query, (this.content as IRouteableCustomElementType).parameters);
      this.instruction.parameters = merged.namedParameters;
      this.instruction.parameterList = merged.parameterList;
      await this.component.enter(merged.merged, this.instruction, previousInstruction);
    }
    this.entered = true;
  }
  public async leave(nextInstruction: INavigationInstruction): Promise<void> {
    if (this.contentStatus !== ContentStatus.added || !this.entered) {
      return;
    }
    if (this.component.leave) {
      await this.component.leave(this.instruction, nextInstruction);
    }
    this.entered = false;
  }

  public loadComponent(context: IRenderContext | IContainer, element: Element): Promise<void> {
    if (this.contentStatus !== ContentStatus.created || !this.entered) {
      return;
    }
    // Don't load cached content
    if (!this.fromCache) {
      const host: INode = element as INode;
      const container = context;
      Controller.forCustomElement(this.component, container, host);
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
      this.component.$controller.bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
    }
    this.contentStatus = ContentStatus.initialized;
  }
  public terminateComponent(stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    // Don't terminate cached content
    if (!stateful) {
      this.component.$controller.unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
      this.contentStatus = ContentStatus.loaded;
    }
  }

  public addComponent(element: Element): void {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    this.component.$controller.attach(LifecycleFlags.fromStartTask);
    if (this.fromCache) {
      const elements = Array.from(element.getElementsByTagName('*'));
      for (const el of elements) {
        if (el.hasAttribute('au-element-scroll')) {
          const [top, left] = el.getAttribute('au-element-scroll').split(',');
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
    this.component.$controller.detach(LifecycleFlags.fromStopTask);
    this.contentStatus = ContentStatus.initialized;
  }

  public async freeContent(element: Element, nextInstruction: INavigationInstruction, stateful: boolean = false): Promise<void> {
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

  public componentName(): string {
    if (this.content === null) {
      return null;
    } else if (typeof this.content === 'string') {
      return this.content;
    } else {
      return (this.content).description.name;
    }
  }
  public componentType(context: IRenderContext | IContainer): IRouteableCustomElementType {
    if (this.content === null) {
      return null;
    } else if (typeof this.content !== 'string') {
      return this.content;
    } else {
      const container = context.get(IContainer);
      const resolver = container.getResolver<Constructable & IRouteableCustomElementType>(CustomElementResource.keyFrom(this.content));
      if (resolver !== null) {
        return resolver.getFactory(container).Type;
      }
      return null;
    }
  }
  public componentInstance(context: IRenderContext | IContainer): IRouteableCustomElement {
    if (this.content === null) {
      return null;
    }
    // TODO: Remove once "local registration is fixed"
    const component = this.componentName();
    const container = context.get(IContainer);
    if (typeof component !== 'string') {
      return container.get<IRouteableCustomElement>(component);
    } else {
      return container.get<IRouteableCustomElement>(CustomElementResource.keyFrom(component));
    }
  }
}
