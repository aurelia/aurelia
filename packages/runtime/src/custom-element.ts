import { Constructable, Decoratable, Decorated, IContainer, Registration, Reporter, Writable } from '@aurelia/kernel';
import { buildTemplateDefinition, ITemplateDefinition, customElementName, customElementKey, customElementBehavior } from './definitions';
import { Hooks, State } from './lifecycle';
import { $attachElement, $cacheElement, $detachElement, $mountElement, $unmountElement } from './lifecycle-attach';
import { $bindElement, $unbindElement } from './lifecycle-bind';
import { $hydrateElement, defaultShadowOptions, ICustomElement, ICustomElementHost, ICustomElementResource, ICustomElementType } from './lifecycle-render';

type CustomElementDecorator = <T extends Constructable>(target: Decoratable<ICustomElement, T>) => Decorated<ICustomElement, T> & ICustomElementType;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(nameOrSource: string | ITemplateDefinition): CustomElementDecorator {
  return target => CustomElementResource.define(nameOrSource, target);
}

type HasShadowOptions = Pick<ITemplateDefinition, 'shadowOptions'>;

/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM<T extends Constructable>(options?: HasShadowOptions['shadowOptions']): (target: T & HasShadowOptions) => Decorated<HasShadowOptions, T>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM<T extends Constructable>(target: (T & HasShadowOptions)): Decorated<HasShadowOptions, T>;
export function useShadowDOM<T extends Constructable>(targetOrOptions?: (T & HasShadowOptions) | HasShadowOptions['shadowOptions']):  Decorated<HasShadowOptions, T> | ((target: T & HasShadowOptions) => Decorated<HasShadowOptions, T>) {
  const options = typeof targetOrOptions === 'function' || !targetOrOptions
    ? defaultShadowOptions
    : targetOrOptions as HasShadowOptions['shadowOptions'];

  function useShadowDOMDecorator(target: T & HasShadowOptions): Decorated<HasShadowOptions, T> {
    target.shadowOptions = options;
    return target;
  }

  return typeof targetOrOptions === 'function' ? useShadowDOMDecorator(targetOrOptions) : useShadowDOMDecorator;
}

type HasContainerless = Pick<ITemplateDefinition, 'containerless'>;

function containerlessDecorator<T extends Constructable>(target: T & HasContainerless): Decorated<HasContainerless, T> {
  target.containerless = true;
  return target;
}

/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(): typeof containerlessDecorator;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless<T extends Constructable>(target: T & HasContainerless): Decorated<HasContainerless, T>;
export function containerless<T extends Constructable>(target?: T & HasContainerless): Decorated<HasContainerless, T> | typeof containerlessDecorator {
  return target === undefined ? containerlessDecorator : containerlessDecorator<T>(target);
}

export const CustomElementResource: ICustomElementResource = {
  name: customElementName,

  keyFrom: customElementKey,

  isType<T extends Constructable & Partial<ICustomElementType>>(Type: T): Type is T & ICustomElementType {
    return Type.kind === this;
  },

  behaviorFor: <(node: ICustomElementHost) => ICustomElement | null>customElementBehavior,

  define<T extends Constructable>(nameOrSource: string | ITemplateDefinition, ctor: T = null): T & ICustomElementType {
    if (!nameOrSource) {
      throw Reporter.error(70);
    }
    const Type = (ctor === null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & Writable<ICustomElementType>;
    const description = buildTemplateDefinition(<ICustomElementType><unknown>Type, nameOrSource);
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
};

/*@internal*/
export function registerElement(this: ICustomElementType, container: IContainer): void {
  const resourceKey = CustomElementResource.keyFrom(this.description.name);
  container.register(Registration.transient(resourceKey, this));
}

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
