import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElement, ICustomElementType, INode, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { ViewportInstruction } from './viewport-instruction';

export interface IRouteableCustomElementType extends Partial<ICustomElementType> {
  parameters?: string[];
}

export interface IRouteableCustomElement extends ICustomElement {
  canEnter?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | string | ViewportInstruction[] | Promise<boolean | string | ViewportInstruction[]>;
  enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
  canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
  leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}

export const enum ContentStatus {
  none = 0,
  loaded = 1,
  initialized = 2,
  entered = 3,
  added = 4,
}

export class ViewportContent {
  public content: IRouteableCustomElementType | string;
  public parameters: string;
  public instruction: INavigationInstruction;
  public component: IRouteableCustomElement;
  public contentStatus: ContentStatus;
  public fromCache: boolean;

  constructor(content: Partial<ICustomElementType> | string = null, parameters: string = null, instruction: INavigationInstruction = null, context: IRenderContext = null) {
    // Can be a (resolved) type or a string (to be resolved later)
    this.content = content;
    this.parameters = parameters;
    this.instruction = instruction;
    this.component = null;
    this.contentStatus = ContentStatus.none;
    this.fromCache = false;

    // If we've got a container, we're good to resolve type
    if (this.content !== null && typeof this.content === 'string' && context !== null) {
      this.content = this.componentType(context);
    }
  }

  public isChange(other: ViewportContent): boolean {
    return ((typeof other.content === 'string' && this.componentName() !== other.content) ||
      (typeof other.content !== 'string' && this.content !== other.content) ||
      this.parameters !== other.parameters ||
      !this.instruction || this.instruction.query !== other.instruction.query);
  }

  public isCacheEqual(other: ViewportContent): boolean {
    return ((typeof other.content === 'string' && this.componentName() === other.content) ||
      (typeof other.content !== 'string' && this.content === other.content)) &&
      this.parameters === other.parameters;
  }

  public loadComponent(context: IRenderContext, element: Element): Promise<void> {
    // Don't load cached content
    if (!this.fromCache) {
      this.component = this.componentInstance(context);
      const host: INode = element as INode;
      const container = context;
      this.component.$hydrate(LifecycleFlags.none, container, host);
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
    this.contentStatus = ContentStatus.none;
  }

  public initializeComponent(): void {
    // Don't initialize cached content
    if (!this.fromCache) {
      this.component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
    }
    this.contentStatus = ContentStatus.initialized;
  }
  public terminateComponent(stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatus.initialized) {
      return;
    }
    // Don't terminate cached content
    if (!stateful) {
      this.component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
      this.contentStatus = ContentStatus.loaded;
    }
  }

  public addComponent(element: Element): void {
    this.component.$attach(LifecycleFlags.fromStartTask);
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
    if (this.contentStatus !== ContentStatus.added) {
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
    this.component.$detach(LifecycleFlags.fromStopTask);
    this.contentStatus = ContentStatus.added;
  }

  public async freeContent(element: Element, stateful: boolean = false): Promise<void> {
    switch (this.contentStatus) {
      case ContentStatus.added:
        this.removeComponent(element, stateful);
      case ContentStatus.entered:
        if (this.component.leave) {
          await this.component.leave();
        }
        this.contentStatus = ContentStatus.initialized;
      case ContentStatus.initialized:
        this.terminateComponent(stateful);
      case ContentStatus.loaded:
        this.unloadComponent();
    }
    this.contentStatus = ContentStatus.none;
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
  public componentType(context: IRenderContext): IRouteableCustomElementType {
    if (this.content === null) {
      return null;
    } else if (typeof this.content !== 'string') {
      return this.content;
    } else {
      const container = context.get(IContainer);
      const resolver = container.getResolver(CustomElementResource.keyFrom(this.content));
      if (resolver !== null) {
        return resolver.getFactory(container).Type as IRouteableCustomElementType;
      }
      return null;
    }
  }
  public componentInstance(context: IRenderContext): IRouteableCustomElement {
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
