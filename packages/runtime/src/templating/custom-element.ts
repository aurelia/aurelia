import {
  Constructable,
  Decoratable,
  Decorated,
  IContainer,
  Immutable,
  Omit,
  PLATFORM,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import { IBindScope, Scope } from '../binding';
import { BindingFlags } from '../binding/binding-flags';
import { DOM, ICustomElementHost, INode, INodeSequence, IRenderLocation } from '../dom';
import { ILifecycleState, LifecycleState } from '../lifecycle-state';
import { IResourceKind, IResourceType } from '../resource';
import { buildTemplateDefinition } from './definition-builder';
import { IHydrateElementInstruction, ITemplateDefinition, TemplateDefinition } from './instructions';
import { IAttach, IAttachLifecycle, IDetachLifecycle, ILifecycleHooks, IMountable, LifecycleHooks } from './lifecycle';
import { IRenderable, IRenderingEngine, ITemplate } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';

export interface ICustomElementType extends
  IResourceType<ITemplateDefinition, ICustomElement>,
  Immutable<Pick<Partial<ITemplateDefinition>, 'containerless' | 'shadowOptions' | 'bindables'>> { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;

export interface IBindSelf extends ILifecycleState {
  readonly $nextBindable: IBindSelf | IBindScope;
  readonly $prevBindable: IBindSelf | IBindScope;
  $bind(flags: BindingFlags): void;
  $unbind(flags: BindingFlags): void;
}

type OptionalLifecycleHooks = Omit<ILifecycleHooks, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
type RequiredLifecycleProperties = Omit<IRenderable, '$state'> & ILifecycleState;

export interface ICustomElement extends IBindSelf, IAttach, IMountable, OptionalLifecycleHooks, RequiredLifecycleProperties {
  readonly $projector: IElementProjector;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
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
    const description = buildTemplateDefinition(<ICustomElementType><unknown>Type, nameOrSource)
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
  this.$prevBindable = this.$nextBindable = null;
  this.$attachableHead = this.$attachableTail = null;
  this.$prevAttachable = this.$nextAttachable = null;

  this.$state = LifecycleState.needsMount;
  this.$scope = Scope.create(this, null);
  this.$projector = determineProjector(this, host, description);

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$behavior.hooks & LifecycleHooks.hasRender) {
    const result = this.render(host, options.parts);

    if (result && 'getElementTemplate' in result) {
      result.getElementTemplate(renderingEngine, Type).render(this, host, options.parts);
    }
  } else {
    renderingEngine.getElementTemplate(description, Type).render(this, host, options.parts);
  }

  if (this.$behavior.hooks & LifecycleHooks.hasCreated) {
    this.created();
  }
}

function bind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$state & LifecycleState.isBound) {
    return;
  }
  // add isBinding flag
  this.$state |= LifecycleState.isBinding;

  const hooks = this.$behavior.hooks;
  flags |= BindingFlags.fromBind;

  if (hooks & LifecycleHooks.hasBinding) {
    this.binding(flags);
  }

  const scope = this.$scope;
  let current = this.$bindableHead;
  while (current !== null) {
    current.$bind(flags, scope);
    current = current.$nextBindable;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= LifecycleState.isBound;
  this.$state &= ~LifecycleState.isBinding;

  if (hooks & LifecycleHooks.hasBound) {
    this.bound(flags);
  }
}

function unbind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$state & LifecycleState.isBound) {
    // add isUnbinding flag
    this.$state |= LifecycleState.isUnbinding;

    const hooks = this.$behavior.hooks;
    flags |= BindingFlags.fromUnbind;

    if (hooks & LifecycleHooks.hasUnbinding) {
      this.unbinding(flags);
    }

    let current = this.$bindableTail;
    while (current !== null) {
      current.$unbind(flags);
      current = current.$prevBindable;
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(LifecycleState.isBound | LifecycleState.isUnbinding);

    if (hooks & LifecycleHooks.hasUnbound) {
      this.unbound(flags);
    }
  }
}

function attach(this: IInternalCustomElementImplementation, encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
  if (this.$state & LifecycleState.isAttached) {
    return;
  }
  // add isAttaching flag
  this.$state |= LifecycleState.isAttaching;

  const hooks = this.$behavior.hooks;
  encapsulationSource = this.$projector.provideEncapsulationSource(encapsulationSource);

  if (hooks & LifecycleHooks.hasAttaching) {
    this.attaching(encapsulationSource, lifecycle);
  }

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach(encapsulationSource, lifecycle);
    current = current.$nextAttachable;
  }

  lifecycle.queueMount(this);
  // add isAttached flag, remove isAttaching flag
  this.$state |= LifecycleState.isAttached;
  this.$state &= ~LifecycleState.isAttaching;

  if (hooks & LifecycleHooks.hasAttached) {
    lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
}

function detach(this: IInternalCustomElementImplementation, lifecycle: IDetachLifecycle): void {
  if (this.$state & LifecycleState.isAttached) {
    // add isDetaching flag
    this.$state |= LifecycleState.isDetaching;

    const hooks = this.$behavior.hooks;
    if (hooks & LifecycleHooks.hasDetaching) {
      this.detaching(lifecycle);
    }

    lifecycle.queueUnmount(this);

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach(lifecycle);
      current = current.$prevAttachable;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(LifecycleState.isAttached | LifecycleState.isDetaching);

    if (hooks & LifecycleHooks.hasDetached) {
      lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
  }
}

function cache(this: IInternalCustomElementImplementation): void {
  if (this.$behavior.hooks & LifecycleHooks.hasCaching) {
    this.caching();
  }

  let current = this.$attachableTail;
  while (current !== null) {
    current.$cache();
    current = current.$prevAttachable;
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
  public host: IRenderLocation;
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
    if (this.$customElement.$state & LifecycleState.needsMount) {
      this.$customElement.$state &= ~LifecycleState.needsMount;
      nodes.insertBefore(this.host);
    }
  }

  public take(nodes: INodeSequence): void {
    this.$customElement.$state |= LifecycleState.needsMount;
    nodes.remove();
  }
}

export class HostProjector implements IElementProjector {
  constructor($customElement: ICustomElement, public host: ICustomElementHost) {
    host.$customElement = $customElement;
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
    this.project = PLATFORM.noop;
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are children.
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
