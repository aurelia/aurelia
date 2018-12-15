import { Constructable, Class, IContainer, Registration, Reporter, Writable } from '../../kernel';
import { buildTemplateDefinition, customElementBehavior, customElementKey, customElementName, ITemplateDefinition, TemplateDefinition } from '../definitions';
import { Hooks, IAttach, IBindSelf, ILifecycleHooks, ILifecycleUnbindAfterDetach, IMountable, IRenderable, IState, State } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { IResourceKind, IResourceType } from '../resource';
import { $attachElement, $cacheElement, $detachElement, $mountElement, $unmountElement } from './lifecycle-attach';
import { $bindElement, $unbindElement } from './lifecycle-bind';
import { $hydrateElement, defaultShadowOptions, ICustomElementHost, IElementHydrationOptions, IElementProjector, ILifecycleRender, IRenderingEngine } from './lifecycle-render';
// import { IFabricNode } from '../fabric-dom';
import { I3VNode } from 'runtime/three-vnode';

type CustomElementStaticProperties = Pick<TemplateDefinition, 'containerless' | 'shadowOptions' | 'bindables'>;

export type CustomElementConstructor = Constructable & CustomElementStaticProperties;

export interface ICustomElementType extends
  IResourceType<ITemplateDefinition, ICustomElement>,
  CustomElementStaticProperties { }

type PartialCustomElementType<T> = T & Partial<IResourceType<ITemplateDefinition, unknown, Constructable>>;

export interface ICustomElement extends
  Partial<IChangeTracker>,
  ILifecycleHooks,
  ILifecycleRender,
  IBindSelf,
  ILifecycleUnbindAfterDetach,
  IAttach,
  IMountable,
  IRenderable {

  readonly $projector: IElementProjector;
  readonly $host: ICustomElementHost;
  $hydrate(renderingEngine: IRenderingEngine, host: Node | I3VNode, options?: IElementHydrationOptions): void;
}

export interface ICustomElementResource extends
  IResourceKind<ITemplateDefinition, ICustomElement, Class<ICustomElement> & CustomElementStaticProperties> {

  behaviorFor(node: Node | I3VNode): ICustomElement | null;
}

type CustomElementDecorator = <T>(target: PartialCustomElementType<T>) => T & ICustomElementType;

/*@internal*/
export function registerElement(this: ICustomElementType, container: IContainer): void {
  const resourceKey = this.kind.keyFrom(this.description.name);
  container.register(Registration.transient(resourceKey, this));
}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(name: string): CustomElementDecorator;
export function customElement(definition: ITemplateDefinition): CustomElementDecorator;
export function customElement(nameOrDefinition: string | ITemplateDefinition): CustomElementDecorator {
  return target => CustomElementResource.define(nameOrDefinition, target);
}

type HasShadowOptions = Pick<ITemplateDefinition, 'shadowOptions'>;

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
    return <T & Required<HasShadowOptions>>target;
  }

  return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
}

type HasContainerless = Pick<ITemplateDefinition, 'containerless'>;

function containerlessDecorator<T extends Constructable>(target: T & HasContainerless): T & Required<HasContainerless> {
  target.containerless = true;
  return <T & Required<HasContainerless>>target;
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

function isType<T>(this: ICustomElementResource, Type: T & Partial<ICustomElementType>): Type is T & ICustomElementType {
  return Type.kind === this;
}

function define<T>(this: ICustomElementResource, name: string, ctor: PartialCustomElementType<T>): T & ICustomElementType;
function define<T>(this: ICustomElementResource, definition: ITemplateDefinition, ctor: PartialCustomElementType<T>): T & ICustomElementType;
function define<T>(this: ICustomElementResource, nameOrDefinition: string | ITemplateDefinition, ctor: PartialCustomElementType<T> = null): T & ICustomElementType {
  if (!nameOrDefinition) {
    throw Reporter.error(70);
  }
  const Type = (ctor === null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & Writable<ICustomElementType>;
  const description = buildTemplateDefinition(<ICustomElementType><unknown>Type, nameOrDefinition);
  const proto: Writable<ICustomElement> = Type.prototype;

  Type.kind = CustomElementResource;
  Type.description = description;
  Type.register = registerElement;

  proto.$hydrate = $hydrateElement;
  proto.$bind = $bindElement;
  proto.$attach = $attachElement;
  proto.$detach = $detachElement;
  proto.$unbind = $unbindElement;
  proto.$cache = $cacheElement;

  proto.$prevBind = null;
  proto.$nextBind = null;
  proto.$prevAttach = null;
  proto.$nextAttach = null;

  proto.$nextUnbindAfterDetach = null;

  proto.$scope = null;
  proto.$hooks = 0;
  proto.$state = State.needsMount;

  proto.$bindableHead = null;
  proto.$bindableTail = null;
  proto.$attachableHead = null;
  proto.$attachableTail = null;

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

  return <ICustomElementType & T>Type;
}

export const CustomElementResource: ICustomElementResource = {
  name: customElementName,
  keyFrom: customElementKey,
  isType,
  behaviorFor: <ICustomElementResource['behaviorFor']>customElementBehavior,
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
