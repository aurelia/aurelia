import {
  Constructable,
  IContainer,
  Immutable,
  PLATFORM,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import { BindingContext } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { DOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { IResourceKind, IResourceType } from '../resource';
import { IHydrateElementInstruction, ITemplateSource, TemplateDefinition } from './instructions';
import { AttachLifecycle, DetachLifecycle, IAttach, IBindSelf } from './lifecycle';
import { addRenderableChild, IRenderable, removeRenderableChild } from './renderable';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';
import { ITemplate } from './template';

export interface ICustomElementType extends IResourceType<ITemplateSource, ICustomElement> { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;

export interface ICustomElement extends IBindSelf, IAttach, Readonly<IRenderable> {
  readonly $projector: IElementProjector;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

export type ElementDefinition = Immutable<Required<ITemplateSource>> | null;

/*@internal*/
export interface IInternalCustomElementImplementation extends Writable<ICustomElement> {
  $behavior: IRuntimeBehavior;
  $encapsulationSource: INode;
}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(nameOrSource: string | ITemplateSource) {
  return function<T extends Constructable>(target: T) {
    return CustomElementResource.define(nameOrSource, target);
  }
}

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

/**
 * Decorator: Indicates that the custom element should render its view in Shadow
 * DOM.
 */
export function useShadowDOM(targetOrOptions?): any {
  const options = typeof targetOrOptions === 'function' || !targetOrOptions
    ? defaultShadowOptions
    : targetOrOptions;

  const deco = function<T extends Constructable>(target: T): T {
    (target as any).shadowOptions = options;
    return target;
  };

  return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
}

/**
 * Decorator: Indicates that the custom element should be rendered without its
 * element container.
 */
export function containerless(target?): any {
  const deco = function<T extends Constructable>(target: T): T {
    (target as any).containerless = true;
    return target;
  };

  return target ? deco(target) : deco;
}

export interface ICustomElementResource extends IResourceKind<ITemplateSource, ICustomElementType> {
  behaviorFor(node: INode): ICustomElement | null;
}

export const CustomElementResource: ICustomElementResource = {
  name: 'custom-element',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & ICustomElementType {
    return (type as any).kind === this;
  },

  behaviorFor(node: INode): ICustomElement | null {
    return (node as any).$customElement || null;
  },

  define<T extends Constructable>(nameOrSource: string | ITemplateSource, ctor: T = null): T & ICustomElementType {
    const Type: T & ICustomElementType = ctor === null ? class HTMLOnlyElement { /* HTML Only */ } as any : ctor as any;
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
    (proto.$removeNodes as any) = removeNodes;
    (proto.$addChild as any) = addRenderableChild;
    (proto.$removeChild as any) = removeRenderableChild;

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
  this.$scope = BindingContext.createScope(this);
  this.$projector = determineProjector(this, host, description);

  renderingEngine.applyRuntimeBehavior(Type, this);

  let template: ITemplate;

  if (this.$behavior.hasRender) {
    const result = (this as any).render(host, options.parts);

    if (result.getElementTemplate) {
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
    (this as any).created();
  }
}

function bind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$isBound) {
    return;
  }

  const scope = this.$scope;
  const bindables = this.$bindables;

  for (let i = 0, ii = bindables.length; i < ii; ++i) {
    bindables[i].$bind(flags | BindingFlags.fromBind, scope);
  }

  this.$isBound = true;

  if (this.$behavior.hasBound) {
    (this as any).bound(flags | BindingFlags.fromBind);
  }
}

function unbind(this: IInternalCustomElementImplementation, flags: BindingFlags): void {
  if (this.$isBound) {
    const bindables = this.$bindables;
    let i = bindables.length;

    while (i--) {
      bindables[i].$unbind(flags | BindingFlags.fromUnbind);
    }

    this.$isBound = false;

    if (this.$behavior.hasUnbound) {
      (this as any).unbound(flags | BindingFlags.fromUnbind);
    }
  }
}

function attach(this: IInternalCustomElementImplementation, encapsulationSource: INode, lifecycle?: AttachLifecycle): void {
  if (this.$isAttached) {
    return;
  }

  lifecycle = AttachLifecycle.start(this, lifecycle);

  this.$encapsulationSource = encapsulationSource
    = this.$projector.provideEncapsulationSource(encapsulationSource);

  if (this.$behavior.hasAttaching) {
    (this as any).attaching(encapsulationSource);
  }

  const attachables = this.$attachables;

  for (let i = 0, ii = attachables.length; i < ii; ++i) {
    attachables[i].$attach(encapsulationSource, lifecycle);
  }

  this.$projector.project(this.$nodes);
  this.$isAttached = true;

  if (this.$behavior.hasAttached) {
    lifecycle.queueAttachedCallback(this);
  }

  lifecycle.end(this);
}

function detach(this: IInternalCustomElementImplementation, lifecycle?: DetachLifecycle): void {
  if (this.$isAttached) {
    lifecycle = DetachLifecycle.start(this, lifecycle);

    if (this.$behavior.hasDetaching) {
      (this as any).detaching();
    }

    lifecycle.queueNodeRemoval(this);

    const attachables = this.$attachables;
    let i = attachables.length;

    while (i--) {
      attachables[i].$detach();
    }

    this.$isAttached = false;

    if (this.$behavior.hasDetached) {
      lifecycle.queueDetachedCallback(this);
    }

    lifecycle.end(this);
  }
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
    bindables: {...(Type as any).bindables, ...templateSource.bindables},
    instructions: templateSource.instructions ? PLATFORM.toArray(templateSource.instructions) : PLATFORM.emptyArray,
    dependencies: templateSource.dependencies ? PLATFORM.toArray(templateSource.dependencies) : PLATFORM.emptyArray,
    surrogates: templateSource.surrogates ? PLATFORM.toArray(templateSource.surrogates) : PLATFORM.emptyArray,
    containerless: templateSource.containerless || (Type as any).containerless || false,
    shadowOptions: templateSource.shadowOptions || (Type as any).shadowOptions || null,
    hasSlots: templateSource.hasSlots || false
  };
}

export interface IElementProjector {
  readonly host: INode;
  readonly children: ArrayLike<INode>;

  provideEncapsulationSource(parentEncapsulationSource: INode): INode;
  project(nodes: INodeSequence): void;

  subscribeToChildrenChange(callback: () => void): void;

  /*@internal*/
  onElementRemoved(): void;
}

function determineProjector(
  customElement: ICustomElement,
  host: INode,
  definition: TemplateDefinition
): IElementProjector {
  if (definition.shadowOptions || definition.hasSlots) {
    if (definition.containerless) {
      throw Reporter.error(21);
    }

    return new ShadowDOMProjector(customElement, host, definition);
  }

  if (definition.containerless) {
    return new ContainerlessProjector(customElement, host);
  }

  return new HostProjector(customElement, host);
}

const childObserverOptions = { childList: true };

export class ShadowDOMProjector implements IElementProjector {
  public shadowRoot: INode;

  constructor(
    customElement: ICustomElement,
    public host: INode,
    definition: TemplateDefinition
  ) {
    this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
    (host as any).$customElement = customElement;
    (this.shadowRoot as any).$customElement = customElement;
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

  constructor(private customElement: ICustomElement, host: INode) {
    if (host.childNodes.length) {
      this.childNodes = Array.from(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = DOM.convertToRenderLocation(host);
    (this.host as any).$customElement = customElement;
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
    this.customElement.$nodes.remove();
  }
}

export class HostProjector implements IElementProjector {
  constructor(customElement: ICustomElement, public host: INode) {
    (host as any).$customElement = customElement;
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
