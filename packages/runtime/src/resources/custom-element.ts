import {
  Class,
  Constructable,
  DI,
  IContainer,
  IResourceKind,
  IResourceType,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';

import {
  buildTemplateDefinition,
  ITemplateDefinition,
  TemplateDefinition
} from '../definitions';
import {
  IDOM,
  INode,
  INodeSequence,
  IRenderLocation
} from '../dom';
import {
  IController,
  IViewModel,
} from '../lifecycle';

export interface ICustomElementType<C extends Constructable = Constructable> extends
  IResourceType<ITemplateDefinition, InstanceType<C> & IViewModel>,
  ICustomElementStaticProperties {
  description: TemplateDefinition;
}

export type CustomElementHost<T extends INode = INode> = IRenderLocation<T> & T & {
  $controller?: IController<T>;
};

export interface IElementProjector<T extends INode = INode> {
  readonly host: CustomElementHost<T>;
  readonly children: ArrayLike<CustomElementHost<T>>;

  provideEncapsulationSource(): T;
  project(nodes: INodeSequence<T>): void;
  take(nodes: INodeSequence<T>): void;

  subscribeToChildrenChange(callback: () => void): void;
}

export const IProjectorLocator = DI.createInterface<IProjectorLocator>('IProjectorLocator').noDefault();

export interface IProjectorLocator<T extends INode = INode> {
  getElementProjector(dom: IDOM<T>, $component: IController<T>, host: CustomElementHost<T>, def: TemplateDefinition): IElementProjector<T>;
}

export interface ICustomElementStaticProperties {
  containerless?: TemplateDefinition['containerless'];
  shadowOptions?: TemplateDefinition['shadowOptions'];
  bindables?: TemplateDefinition['bindables'];
  strategy?: TemplateDefinition['strategy'];
}

export interface ICustomElementResource<T extends INode = INode> extends
  IResourceKind<ITemplateDefinition, IViewModel, Class<IViewModel> & ICustomElementStaticProperties> {
  behaviorFor<N extends INode = T>(node: N): IController<N> | undefined;
}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(definition: ITemplateDefinition): ICustomElementDecorator;
export function customElement(name: string): ICustomElementDecorator;
export function customElement(nameOrDefinition: string | ITemplateDefinition): ICustomElementDecorator;
export function customElement(nameOrDefinition: string | ITemplateDefinition): ICustomElementDecorator {
  return (target => CustomElement.define(nameOrDefinition, target)) as ICustomElementDecorator;
}

export const CustomElement: Readonly<ICustomElementResource> = Object.freeze({
  name: 'custom-element',
  keyFrom(name: string): string {
    return `${CustomElement.name}:${name}`;
  },
  isType<T>(Type: T & Partial<ICustomElementType>): Type is T & ICustomElementType {
    return Type.kind === CustomElement;
  },
  behaviorFor<T extends INode = INode>(node: T): IController<T> | undefined {
    return (node as CustomElementHost<T>).$controller;
  },
  define<T extends Constructable = Constructable>(nameOrDefinition: string | ITemplateDefinition, ctor: T | null = null): T & ICustomElementType<T> {
    if (!nameOrDefinition) {
      throw Reporter.error(70);
    }
    const Type = (ctor == null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & ICustomElementType<T>;
    const WritableType = Type as Writable<ICustomElementType<T>>;
    const description = buildTemplateDefinition(Type, nameOrDefinition);

    WritableType.kind = CustomElement;
    Type.description = description;
    Type.register = function register(container: IContainer): void {
      const key = CustomElement.keyFrom(description.name);
      Registration.transient(key, Type).register(container);
      Registration.alias(key, Type).register(container);
    };

    return Type;
  },
});

// tslint:enable:align

// TODO
// ## DefaultSlotProjector
// An implementation of IElementProjector that can handle a subset of default
// slot projection scenarios without needing real Shadow DOM.
// ### Conditions
// We can do a one-time, static composition of the content and view,
// to emulate shadow DOM, if the following constraints are met:
// * There must be exactly one slot and it must be a default slot.
// * The default slot must not have any fallback content.
// * The default slot must not have a custom element as its immediate parent or
//   a slot attribute (re-projection).
// ### Projection
// The projector copies all content nodes to the slot's location.
// The copy process should inject a comment node before and after the slotted
// content, so that the bounds of the content can be clearly determined,
// even if the slotted content has template controllers or string interpolation.
// ### Encapsulation Source
// Uses the same strategy as HostProjector.
// ### Children
// The projector adds a mutation observer to the parent node of the
// slot comment. When direct children of that node change, the projector
// will gather up all nodes between the start and end slot comments.

export interface ICustomElementDecorator {
  // Using a type breaks syntax highlighting: https://github.com/Microsoft/TypeScript-TmLanguage/issues/481
  // tslint:disable-next-line:callable-types
  <T extends Constructable>(target: T): T & ICustomElementType<T>;
}

type HasShadowOptions = Pick<ITemplateDefinition, 'shadowOptions'>;

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM<T extends Constructable>(options?: HasShadowOptions['shadowOptions']): (target: T & HasShadowOptions) => T & Required<HasShadowOptions>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM<T extends Constructable>(target: T & HasShadowOptions): T & Required<HasShadowOptions>;
export function useShadowDOM<T extends Constructable>(targetOrOptions?: (T & HasShadowOptions) | HasShadowOptions['shadowOptions']): (T & Required<HasShadowOptions>) | ((target: T & HasShadowOptions) => (T & Required<HasShadowOptions>)) {
  const options = typeof targetOrOptions === 'function' || !targetOrOptions
    ? defaultShadowOptions
    : targetOrOptions as HasShadowOptions['shadowOptions'];

  function useShadowDOMDecorator(target: T & HasShadowOptions): T & Required<HasShadowOptions> {
    target.shadowOptions = options;
    return target as T & Required<HasShadowOptions>;
  }

  return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
}

type HasContainerless = Pick<ITemplateDefinition, 'containerless'>;

function containerlessDecorator<T extends Constructable>(target: T & HasContainerless): T & Required<HasContainerless> {
  target.containerless = true;
  return target as T & Required<HasContainerless>;
}

/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(): typeof containerlessDecorator;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless<T extends Constructable>(target: T & HasContainerless): T & Required<HasContainerless>;
export function containerless<T extends Constructable>(target?: T & HasContainerless): T & Required<HasContainerless> | typeof containerlessDecorator {
  return target === undefined ? containerlessDecorator : containerlessDecorator<T>(target);
}
