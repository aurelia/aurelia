import {
  Class,
  Constructable,
  DI,
  IContainer,
  IResourceKind,
  IResourceType,
  IServiceLocator,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import {
  buildTemplateDefinition,
  customElementBehavior,
  customElementKey,
  customElementName,
  IElementHydrationOptions,
  ITemplateDefinition,
  TemplateDefinition
} from '../definitions';
import { IDOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { Hooks, LifecycleFlags } from '../flags';
import {
  ILifecycleHooks,
  IMountableComponent,
  IRenderable
} from '../lifecycle';
import { IChangeTracker } from '../observation';
import {
  $attachElement,
  $cacheElement,
  $detachElement,
  $mountElement,
  $unmountElement
} from '../templating/lifecycle-attach';
import {
  $bindElement,
  $patch,
  $unbindElement
} from '../templating/lifecycle-bind';
import {
  $hydrateElement,
  ILifecycleRender
} from '../templating/lifecycle-render';

export interface ICustomElementType<T extends INode = INode, C extends Constructable = Constructable> extends
  IResourceType<ITemplateDefinition, InstanceType<C> & ICustomElement<T>>,
  ICustomElementStaticProperties {
  description: TemplateDefinition;
}

export type CustomElementHost<T extends INode = INode> = IRenderLocation<T> & T & {
  $customElement?: ICustomElement<T>;
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
  getElementProjector(dom: IDOM<T>, $component: ICustomElement<T>, host: CustomElementHost<T>, def: TemplateDefinition): IElementProjector<T>;
}

export interface ICustomElementStaticProperties {
  containerless?: TemplateDefinition['containerless'];
  shadowOptions?: TemplateDefinition['shadowOptions'];
  bindables?: TemplateDefinition['bindables'];
  strategy?: TemplateDefinition['strategy'];
}

export interface ICustomElement<T extends INode = INode> extends
  Partial<IChangeTracker>,
  ILifecycleHooks,
  ILifecycleRender,
  IMountableComponent,
  IRenderable<T> {

  readonly $projector: IElementProjector<T>;
  readonly $host: CustomElementHost<T>;

  $hydrate(flags: LifecycleFlags, parentContext: IServiceLocator, host: INode, options?: IElementHydrationOptions): void;
}

export interface ICustomElementResource<T extends INode = INode> extends
  IResourceKind<ITemplateDefinition, ICustomElement<T>, Class<ICustomElement<T>> & ICustomElementStaticProperties> {
  behaviorFor(node: T): ICustomElement<T> | null;
}

/** @internal */
export function registerElement(this: ICustomElementType, container: IContainer): void {
  const resourceKey = this.kind.keyFrom(this.description.name);
  container.register(Registration.transient(resourceKey, this));
}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(definition: ITemplateDefinition): ICustomElementDecorator;
export function customElement(name: string): ICustomElementDecorator;
export function customElement(nameOrDefinition: string | ITemplateDefinition): ICustomElementDecorator;
export function customElement(nameOrDefinition: string | ITemplateDefinition): ICustomElementDecorator {
  return (target => CustomElementResource.define(nameOrDefinition, target)) as ICustomElementDecorator;
}

function isType<T>(this: ICustomElementResource, Type: T & Partial<ICustomElementType>): Type is T & ICustomElementType {
  return Type.kind === this;
}

function define<N extends INode = INode, T extends Constructable = Constructable>(this: ICustomElementResource, definition: ITemplateDefinition, ctor?: T | null): T & ICustomElementType<N, T>;
function define<N extends INode = INode, T extends Constructable = Constructable>(this: ICustomElementResource, name: string, ctor?: T | null): T & ICustomElementType<N, T>;
function define<N extends INode = INode, T extends Constructable = Constructable>(this: ICustomElementResource, nameOrDefinition: string | ITemplateDefinition, ctor: T | null): T & ICustomElementType<N, T>;
function define<N extends INode = INode, T extends Constructable = Constructable>(this: ICustomElementResource, nameOrDefinition: string | ITemplateDefinition, ctor: T | null = null): T & ICustomElementType<N, T> {
  if (!nameOrDefinition) {
    throw Reporter.error(70);
  }
  const Type = (ctor === null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & ICustomElementType<N, T>;
  const WritableType = Type as Writable<ICustomElementType<N, T>>;
  const description = buildTemplateDefinition(Type, nameOrDefinition);
  const proto: Writable<ICustomElement> = Type.prototype;

  WritableType.kind = CustomElementResource as ICustomElementResource;
  Type.description = description;
  Type.register = registerElement;

  proto.$hydrate = $hydrateElement;
  proto.$bind = $bindElement;
  proto.$patch = $patch;
  proto.$attach = $attachElement;
  proto.$detach = $detachElement;
  proto.$unbind = $unbindElement;
  proto.$cache = $cacheElement;

  proto.$prevComponent = null;
  proto.$nextComponent = null;
  proto.$nextPatch = null;

  proto.$nextUnbindAfterDetach = null;

  proto.$scope = null;
  proto.$hooks = 0;

  proto.$bindingHead = null;
  proto.$bindingTail = null;
  proto.$componentHead = null;
  proto.$componentTail = null;

  proto.$mount = $mountElement;
  proto.$unmount = $unmountElement;

  proto.$nextMount = null;
  proto.$nextUnmount = null;

  proto.$projector = null;

  if ('flush' in proto) {
    proto.$nextFlush = null;
  }

  if ('binding' in proto) proto.$hooks |= Hooks.hasBinding;
  if ('bound' in proto) {
    proto.$hooks |= Hooks.hasBound;
    proto.$nextBound = null;
  }

  if ('unbinding' in proto) proto.$hooks |= Hooks.hasUnbinding;
  if ('unbound' in proto) {
    proto.$hooks |= Hooks.hasUnbound;
    proto.$nextUnbound = null;
  }

  if ('render' in proto) proto.$hooks |= Hooks.hasRender;
  if ('created' in proto) proto.$hooks |= Hooks.hasCreated;
  if ('attaching' in proto) proto.$hooks |= Hooks.hasAttaching;
  if ('attached' in proto) {
    proto.$hooks |= Hooks.hasAttached;
    proto.$nextAttached = null;
  }
  if ('detaching' in proto) proto.$hooks |= Hooks.hasDetaching;
  if ('caching' in proto) proto.$hooks |= Hooks.hasCaching;
  if ('detached' in proto) {
    proto.$hooks |= Hooks.hasDetached;
    proto.$nextDetached = null;
  }

  return Type;
}

export const CustomElementResource = {
  name: customElementName,
  keyFrom: customElementKey,
  isType,
  behaviorFor: customElementBehavior as ICustomElementResource['behaviorFor'],
  define
};

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
