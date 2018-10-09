import {
  Constructable,
  IContainer,
  Immutable,
  Omit,
  PLATFORM,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import { BindingContext, Scope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { DOM, ICustomElementHost, INode, INodeSequence, IRenderLocation } from '../dom';
import { IResourceKind, IResourceType } from '../resource';
import { IHydrateElementInstruction, ITemplateSource, TemplateDefinition } from './instructions';
import { IAttach, IAttachLifecycle, IDetachLifecycle, ILifecycleHooks } from './lifecycle';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';
import { ITemplate } from './template';

export interface ICustomElementType extends IResourceType<ITemplateSource, ICustomElement>, Immutable<Pick<Partial<ITemplateSource>, 'containerless' | 'shadowOptions' | 'bindables'>> { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;

export interface IBindSelf {
  readonly $isBound: boolean;
  $bind(flags: BindingFlags): void;
  $unbind(flags: BindingFlags): void;
}

export interface ICustomElement extends IBindSelf, IAttach, Omit<ILifecycleHooks, Exclude<keyof IRenderable, '$addNodes' | '$removeNodes'>>, Readonly<IRenderable> {
  readonly $projector: IElementProjector;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

export type ElementDefinition = Immutable<Required<ITemplateSource>> | null;

/*@internal*/
export interface IInternalCustomElementImplementation extends Writable<ICustomElement> {
  $behavior: IRuntimeBehavior;
}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
// tslint:disable-next-line:no-any
export function customElement(nameOrSource: string | ITemplateSource): any {
  return function<T extends Constructable>(target: T): T {
    return CustomElementResource.define(nameOrSource, target);
  };
}

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

/**
 * Decorator: Indicates that the custom element should render its view in Shadow
 * DOM.
 */
// tslint:disable-next-line:no-any
export function useShadowDOM(targetOrOptions?: any): any {
  const options = typeof targetOrOptions === 'function' || !targetOrOptions
    ? defaultShadowOptions
    : targetOrOptions;

  const deco = function<T extends Constructable>(target: T): T {
    (target as Writable<Partial<ICustomElementType>>).shadowOptions = options;
    return target;
  };

  return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
}

/**
 * Decorator: Indicates that the custom element should be rendered without its
 * element container.
 */
// tslint:disable-next-line:no-any
export function containerless(maybeTarget?: any): any {
  const deco = function<T extends Constructable>(target: T): T {
    (target as Writable<Partial<ICustomElementType>>).containerless = true;
    return target;
  };

  return maybeTarget ? deco(maybeTarget) : deco;
}

export interface ICustomElementResource extends IResourceKind<ITemplateSource, ICustomElementType> {
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

  define<T extends Constructable>(nameOrSource: string | ITemplateSource, ctor: T = null): T & ICustomElementType {
    const Type = (ctor === null ? class HTMLOnlyElement { /* HTML Only */ } : ctor) as T & ICustomElementType;
    const description = createCustomElementDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
    const proto: ICustomElement = Type.prototype;

    (Type as Writable<ICustomElementType>).kind = CustomElementResource;
    (Type as Writable<ICustomElementType>).description = description;
    Type.register = register;

    proto.$hydrate = hydrate;
    proto.$bind = bind;
    proto.$attach = attach;
    proto.$detach = detach;
    proto.$unbind = unbind;
    proto.$cache = cache;
    (proto as Writable<IRenderable>).$addNodes = addNodes;
    (proto as Writable<IRenderable>).$removeNodes = removeNodes;

    return Type;
  }
};

function register(this: ICustomElementType, container: IContainer): void {
  container.register(
    Registration.transient(
      CustomElementResource.keyFrom(this.description.name),
      this
    )
  );
}

function hydrate(this: IInternalCustomElementImplementation, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$bindables = [];
  this.$attachables = [];
  this.$isAttached = false;
  this.$isBound = false;
  this.$scope = Scope.create(this, null); // TODO: get the parent from somewhere?
  this.$projector = determineProjector(this, host, description);

  renderingEngine.applyRuntimeBehavior(Type, this);

  let template: ITemplate;

  if (this.$behavior.hasRender) {
    const result = this.render(host, options.parts);

    if ('getElementTemplate' in result) {
      template = result.getElementTemplate(renderingEngine, Type);
    } else {
      this.$nodes = result;
    }
  } else {
    template = renderingEngine.getElementTemplate(description, Type);
  }

  if (template) {
    this.$context = template.renderContext;
    this.$nodes = template.createFor(this, host, options.parts);
  }

  if (this.$behavior.hasCreated) {
    this.created();
  }
}

function bind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$isBound) {
    return;
  }

  const behavior = this.$behavior;

  if (behavior.hasBinding) {
    this.binding(flags | BindingFlags.fromBind);
  }

  const scope = this.$scope;
  const bindables = this.$bindables;

  for (let i = 0, ii = bindables.length; i < ii; ++i) {
    bindables[i].$bind(flags | BindingFlags.fromBind, scope);
  }

  this.$isBound = true;

  if (behavior.hasBound) {
    this.bound(flags | BindingFlags.fromBind);
  }
}

function unbind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$isBound) {
    const behavior = this.$behavior;

    if (behavior.hasUnbinding) {
      this.unbinding(flags | BindingFlags.fromUnbind);
    }

    const bindables = this.$bindables;
    let i = bindables.length;

    while (i--) {
      bindables[i].$unbind(flags | BindingFlags.fromUnbind);
    }

    this.$isBound = false;

    if (behavior.hasUnbound) {
      this.unbound(flags | BindingFlags.fromUnbind);
    }
  }
}

function attach(this: IInternalCustomElementImplementation, encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
  if (this.$isAttached) {
    return;
  }

  encapsulationSource = this.$projector.provideEncapsulationSource(encapsulationSource);

  if (this.$behavior.hasAttaching) {
    this.attaching(encapsulationSource, lifecycle);
  }

  const attachables = this.$attachables;

  for (let i = 0, ii = attachables.length; i < ii; ++i) {
    attachables[i].$attach(encapsulationSource, lifecycle);
  }

  lifecycle.queueAddNodes(this);
  this.$isAttached = true;

  if (this.$behavior.hasAttached) {
    lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
}

function detach(this: IInternalCustomElementImplementation, lifecycle: IDetachLifecycle): void {
  if (this.$isAttached) {
    if (this.$behavior.hasDetaching) {
      this.detaching(lifecycle);
    }

    lifecycle.queueRemoveNodes(this);

    const attachables = this.$attachables;
    let i = attachables.length;

    while (i--) {
      attachables[i].$detach(lifecycle);
    }

    this.$isAttached = false;

    if (this.$behavior.hasDetached) {
      lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
  }
}

function cache(this: IInternalCustomElementImplementation): void {
  if (this.$behavior.hasCaching) {
    this.caching();
  }

  const attachables = this.$attachables;
  let i = attachables.length;

  while (i--) {
    attachables[i].$cache();
  }
}

function addNodes(this: IInternalCustomElementImplementation): void {
  this.$projector.project(this.$nodes);
}

function removeNodes(this: IInternalCustomElementImplementation): void {
  this.$projector.onElementRemoved();
}

/*@internal*/
export function createCustomElementDescription(templateSource: ITemplateSource, Type: ICustomElementType): TemplateDefinition {
  return {
    name: templateSource.name || 'unnamed',
    templateOrNode: templateSource.templateOrNode || null,
    cache: 0,
    build: templateSource.build || {
      required: false,
      compiler: 'default'
    },
    bindables: {...Type.bindables, ...templateSource.bindables},
    instructions: templateSource.instructions ? PLATFORM.toArray(templateSource.instructions) : PLATFORM.emptyArray,
    dependencies: templateSource.dependencies ? PLATFORM.toArray(templateSource.dependencies) : PLATFORM.emptyArray,
    surrogates: templateSource.surrogates ? PLATFORM.toArray(templateSource.surrogates) : PLATFORM.emptyArray,
    containerless: templateSource.containerless || Type.containerless || false,
    shadowOptions: templateSource.shadowOptions || Type.shadowOptions || null,
    hasSlots: templateSource.hasSlots || false
  };
}

export interface IElementProjector {
  readonly host: ICustomElementHost;
  readonly children: ArrayLike<ICustomElementHost>;

  provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
  project(nodes: INodeSequence): void;

  subscribeToChildrenChange(callback: () => void): void;

  /*@internal*/
  onElementRemoved(): void;
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

  public onElementRemoved(): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are in
    // the ShadowDOM.
  }
}

export class ContainerlessProjector implements IElementProjector {
  public host: IRenderLocation;
  private childNodes: ArrayLike<INode>;
  private requiresMount: boolean = true;

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
    if (this.requiresMount) {
      this.requiresMount = false;
      nodes.insertBefore(this.host);
    }
  }

  public onElementRemoved(): void {
    this.requiresMount = true;
    this.$customElement.$nodes.remove();
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

  public onElementRemoved(): void {
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
