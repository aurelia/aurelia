import { IContainer } from '@aurelia/kernel';
import { CustomElementResource, ICustomElement, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { INavigationInstruction } from './history-browser';
import { IComponentViewportParameters } from './router';
import { IRouteableCustomElement } from './viewport';

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

  constructor(content: ICustomElementType | string = null, parameters: string = null, instruction: INavigationInstruction = null, context: IRenderContext = null) {
    // Can be a (resolved) type or a string (to be resolved later)
    this.content = content;
    this.parameters = parameters;
    this.instruction = instruction;
    this.component = null;
    this.contentStatus = ContentStatuses.none;

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

  public componentName(): string {
    if (this.content === null) {
      return null;
    } else if (typeof this.content === 'string') {
      return this.content;
    } else {
      return (this.content as ICustomElementType).description.name;
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
