import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElement, ICustomElementType, INode, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { IComponentViewportParameters } from './router';

export interface IRouteableCustomElementType extends ICustomElementType {
  parameters?: string[];
}

export interface IRouteableCustomElement extends ICustomElement {
  canEnter?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | string | IComponentViewportParameters[] | Promise<boolean | string | IComponentViewportParameters[]>;
  enter?(parameters?: string[] | Record<string, string>, nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
  canLeave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): boolean | Promise<boolean>;
  leave?(nextInstruction?: INavigationInstruction, instruction?: INavigationInstruction): void | Promise<void>;
}

export const enum ContentStatuses {
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
  public contentStatus: ContentStatuses;
  public fromCache: boolean;

  constructor(content: ICustomElementType | string = null, parameters: string = null, instruction: INavigationInstruction = null, context: IRenderContext = null) {
    // Can be a (resolved) type or a string (to be resolved later)
    this.content = content;
    this.parameters = parameters;
    this.instruction = instruction;
    this.component = null;
    this.contentStatus = ContentStatuses.none;
    this.fromCache = false;

    // If we've got a container, we're good to resolve type
    if (this.content !== null && typeof this.content === 'string' && context !== null) {
      this.content = this.componentType(context);
    }
  }

  public isChange(content: ViewportContent): boolean {
    return ((typeof content.content === 'string' && this.componentName() !== content.content) ||
      (typeof content.content !== 'string' && this.content !== content.content) ||
      this.parameters !== content.parameters ||
      !this.instruction || this.instruction.query !== content.instruction.query);
  }

  public isCacheEqual(content: ViewportContent): boolean {
    return ((typeof content.content === 'string' && this.componentName() === content.content) ||
      (typeof content.content !== 'string' && this.content === content.content)) &&
      this.parameters === content.parameters;
  }

  public loadComponent(context: IRenderContext, element: Element): Promise<void> {
    // Don't load cached content
    if (!this.fromCache) {
      this.component = this.componentInstance(context);

      const host: INode = element as INode;
      const container = context;

      // TODO: get useProxies settings from the template definition
      this.component.$hydrate(LifecycleFlags.none, container, host);
    }
    this.contentStatus = ContentStatuses.loaded;
    return Promise.resolve();
  }
  public unloadComponent(): void {
    // TODO: We might want to do something here eventually, who knows?
    if (this.contentStatus !== ContentStatuses.loaded) {
      return;
    }
    // Don't unload components when stateful
    this.contentStatus = ContentStatuses.none;
  }

  public initializeComponent(): void {
    // Don't initialize cached content
    if (!this.fromCache) {
      this.component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
    }
    this.contentStatus = ContentStatuses.initialized;
  }
  public terminateComponent(stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatuses.initialized) {
      return;
    }
    // Don't terminate cached content
    if (!stateful) {
      this.component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
    }
    this.contentStatus = ContentStatuses.loaded;
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
    this.contentStatus = ContentStatuses.added;
  }
  public removeComponent(element: Element, stateful: boolean = false): void {
    if (this.contentStatus !== ContentStatuses.added) {
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
    this.contentStatus = ContentStatuses.added;
  }

  public async freeContent(element: Element, stateful: boolean = false): Promise<void> {
    switch (this.contentStatus) {
      case ContentStatuses.added:
        this.removeComponent(element, stateful);
      case ContentStatuses.entered:
        if (this.component.leave) {
          await this.component.leave();
        }
        this.contentStatus = ContentStatuses.initialized;
      case ContentStatuses.initialized:
        this.terminateComponent(stateful);
      case ContentStatuses.loaded:
        this.unloadComponent();
    }
    this.contentStatus = ContentStatuses.none;
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
