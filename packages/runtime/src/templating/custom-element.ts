import {
  Constructable,
  Decoratable,
  Decorated,
  IContainer,
  Immutable,
  PLATFORM,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import { Scope } from '../binding/binding-context';
import { IHydrateElementInstruction, ITemplateDefinition, TemplateDefinition } from '../definitions';
import { DOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { IAttach, IBindSelf, IHooks, IState, IMountable, Hooks, State, Lifecycle } from '../lifecycle';
import { BindingFlags } from '../observation';
import { IResourceKind, IResourceType } from '../resource';
import { buildTemplateDefinition } from './definition-builder';
import { ILifecycleRender, IRenderable, IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';

export interface ICustomElementType extends
  IResourceType<ITemplateDefinition, ICustomElement>,
  Immutable<Pick<Partial<ITemplateDefinition>, 'containerless' | 'shadowOptions' | 'bindables'>> { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;

export interface ICustomElement extends IHooks, ILifecycleRender, IBindSelf, IAttach, IMountable, IState, IRenderable {
  readonly $projector: IElementProjector;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

export interface ICustomElementHost extends IRenderLocation {
  $customElement?: ICustomElement;
}

export type ElementDefinition = Immutable<Required<ITemplateDefinition>> | null;

/*@internal*/
export interface IInternalCustomElementImplementation extends Writable<ICustomElement> {
  $behavior: IRuntimeBehavior;
}

type CustomElementDecorator = <T extends Constructable>(target: Decoratable<ICustomElement, T>) => Decorated<ICustomElement, T> & ICustomElementType;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(nameOrSource: string | ITemplateDefinition): CustomElementDecorator {
  return target => CustomElementResource.define(nameOrSource, target);
}

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

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

export interface ICustomElementResource extends IResourceKind<ITemplateDefinition, ICustomElementType> {
  behaviorFor(node: INode): ICustomElement | null;
}

export const CustomElementResource: ICustomElementResource = {
  name: 'custom-element',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable & Partial<ICustomElementType>>(Type: T): Type is T & ICustomElementType {
    return Type.kind === this;
  },

  behaviorFor(node: ICustomElementHost): ICustomElement | null {
    return node.$customElement || null;
  },

  define<T extends Constructable>(nameOrSource: string | ITemplateDefinition, ctor: T = null): T & ICustomElementType {
    if (!nameOrSource) {
      throw Reporter.error(70);
    }
    const Type = (ctor === null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & Writable<ICustomElementType>;
    const description = buildTemplateDefinition(<ICustomElementType><unknown>Type, nameOrSource);
    const proto: Writable<ICustomElement> = Type.prototype;

    Type.kind = CustomElementResource;
    Type.description = description;
    Type.register = register;

    proto.$hydrate = hydrate;
    proto.$bind = bind;
    proto.$attach = attach;
    proto.$detach = detach;
    proto.$unbind = unbind;
    proto.$cache = cache;
    proto.$mount = mount;
    proto.$unmount = unmount;

    return <ICustomElementType & T>Type;
  }
};

function register(this: ICustomElementType, container: IContainer): void {
  const resourceKey = CustomElementResource.keyFrom(this.description.name);
  container.register(Registration.transient(resourceKey, this));
}

function hydrate(this: IInternalCustomElementImplementation, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$bindableHead = this.$bindableTail = null;
  this.$prevBind = this.$nextBind = null;
  this.$attachableHead = this.$attachableTail = null;
  this.$prevAttach = this.$nextAttach = null;

  this.$state = State.needsMount;
  this.$scope = Scope.create(this, null);
  // Defining the property ensures the correct runtime behavior is applied - we can't actually get the projector here because the ContainerlessProjector
  // needs the element to be rendered first. It seems like a decent requirement for rendering to be done before either the ChildrenObserver or
  // ContainerlessProjector is used, but still this is necessarily a complete and utter hack that we should aim to solve in a cleaner way.
  this.$projector = undefined;

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$behavior.hooks & Hooks.hasRender) {
    const result = this.render(host, options.parts);

    if (result && 'getElementTemplate' in result) {
      const template = result.getElementTemplate(renderingEngine, Type);
      template.render(this, host, options.parts);
    }
  } else {
    const template = renderingEngine.getElementTemplate(description, Type);
    template.render(this, host, options.parts);
  }
  this.$projector = determineProjector(this, host, description);

  if (this.$behavior.hooks & Hooks.hasCreated) {
    this.created();
  }
}

function bind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    return;
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$behavior.hooks;
  flags |= BindingFlags.fromBind;

  if (hooks & Hooks.hasBound) {
    Lifecycle.queueBound(this, flags);
  }

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  const scope = this.$scope;
  let current = this.$bindableHead;
  while (current !== null) {
    current.$bind(flags, scope);
    current = current.$nextBind;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  if (hooks & Hooks.hasBound) {
    Lifecycle.unqueueBound();
  }
}

function unbind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$behavior.hooks;
    flags |= BindingFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.queueUnbound(this, flags);
    }

    if (hooks & Hooks.hasUnbinding) {
      this.unbinding(flags);
    }

    let current = this.$bindableTail;
    while (current !== null) {
      current.$unbind(flags);
      current = current.$prevBind;
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.unqueueUnbound();
    }
  }
}

function attach(this: IInternalCustomElementImplementation): void {
  if (this.$state & State.isAttached) {
    return;
  }
  // add isAttaching flag
  this.$state |= State.isAttaching;

  const hooks = this.$behavior.hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching();
  }

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach();
    current = current.$nextAttach;
  }

  Lifecycle.queueMount(this);
  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    Lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
}

function detach(this: IInternalCustomElementImplementation): void {
  if (this.$state & State.isAttached) {
    // add isDetaching flag
    this.$state |= State.isDetaching;

    const hooks = this.$behavior.hooks;
    if (hooks & Hooks.hasDetaching) {
      this.detaching();
    }

    Lifecycle.queueUnmount(this);

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach();
      current = current.$prevAttach;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      Lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
  }
}

function cache(this: IInternalCustomElementImplementation): void {
  if (this.$behavior.hooks & Hooks.hasCaching) {
    this.caching();
  }

  let current = this.$attachableTail;
  while (current !== null) {
    current.$cache();
    current = current.$prevAttach;
  }
}

function mount(this: IInternalCustomElementImplementation): void {
  this.$projector.project(this.$nodes);
}

function unmount(this: IInternalCustomElementImplementation): void {
  this.$projector.take(this.$nodes);
}

export interface IElementProjector {
  readonly host: ICustomElementHost;
  readonly children: ArrayLike<ICustomElementHost>;

  provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
  project(nodes: INodeSequence): void;
  take(nodes: INodeSequence): void;

  subscribeToChildrenChange(callback: () => void): void;
}

function determineProjector(
  $customElement: ICustomElement,
  host: ICustomElementHost,
  definition: TemplateDefinition
): IElementProjector {
  if (definition.shadowOptions || definition.hasSlots) {
    if (definition.containerless) {
      throw Reporter.error(21);
    }

    return new ShadowDOMProjector($customElement, host, definition);
  }

  if (definition.containerless) {
    return new ContainerlessProjector($customElement, host);
  }

  return new HostProjector($customElement, host);
}

const childObserverOptions = { childList: true };

export class ShadowDOMProjector implements IElementProjector {
  public shadowRoot: ICustomElementHost;

  constructor(
    $customElement: ICustomElement,
    public host: ICustomElementHost,
    definition: TemplateDefinition
  ) {
    this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
    host.$customElement = $customElement;
    this.shadowRoot.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    DOM.createNodeObserver(this.host, callback, childObserverOptions);
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return this.shadowRoot;
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host);
    this.project = PLATFORM.noop;
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are in
    // the ShadowDOM.
  }
}

export class ContainerlessProjector implements IElementProjector {
  public host: ICustomElementHost;
  private childNodes: ArrayLike<INode>;

  constructor(private $customElement: ICustomElement, host: ICustomElementHost) {
    if (host.childNodes.length) {
      this.childNodes = PLATFORM.toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = DOM.convertToRenderLocation(host);
    this.host.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    if (!parentEncapsulationSource) {
      throw Reporter.error(22);
    }

    return parentEncapsulationSource;
  }

  public project(nodes: INodeSequence): void {
    if (this.$customElement.$state & State.needsMount) {
      this.$customElement.$state &= ~State.needsMount;
      nodes.insertBefore(this.host);
    }
  }

  public take(nodes: INodeSequence): void {
    this.$customElement.$state |= State.needsMount;
    nodes.remove();
  }
}

export class HostProjector implements IElementProjector {
  private readonly isAppHost: boolean;
  constructor($customElement: ICustomElement, public host: ICustomElementHost) {
    host.$customElement = $customElement;
    this.isAppHost = host.hasOwnProperty('$au');
  }

  get children(): ArrayLike<INode> {
    return PLATFORM.emptyArray;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return parentEncapsulationSource || this.host;
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host);
    if (!this.isAppHost) {
      this.project = PLATFORM.noop;
    }
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are children.
    if (this.isAppHost) {
      // The only exception to that is the app host, which is not part of a removable node sequence
      nodes.remove();
    }
  }
}

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
