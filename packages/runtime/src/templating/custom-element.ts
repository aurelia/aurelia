import { Constructable, IContainer, Immutable, PLATFORM, Registration, Writable, Reporter } from '@aurelia/kernel';
import { BindingContext } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { DOM, INode, IView } from '../dom';
import { IResourceKind, IResourceType } from '../resource';
import { IHydrateElementInstruction, ITemplateSource, TemplateDefinition } from './instructions';
import { AttachLifecycle, DetachLifecycle, IAttach, IBindSelf } from './lifecycle';
import { IRenderSlot } from './render-slot';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';
import { IViewOwner, View } from './view';

export interface ICustomElementType extends IResourceType<ITemplateSource, ICustomElement> { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts' | 'contentOverride'>>;

export interface ICustomElement extends IBindSelf, IAttach, Readonly<IViewOwner> {
  readonly $projector: IElementProjector;
  readonly $isAttached: boolean;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

/*@internal*/
export interface IInternalCustomElementImplementation extends Writable<ICustomElement> {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IRenderSlot;
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
  let options = typeof targetOrOptions === 'function' || !targetOrOptions
    ? defaultShadowOptions
    : targetOrOptions;

  let deco = function<T extends Constructable>(target: T) {
    (<any>target).shadowOptions = options;
    return target;
  }

  return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
}

/**
 * Decorator: Indicates that the custom element should be rendered without its
 * element container.
 */
export function containerless(target?): any {
  let deco = function<T extends Constructable>(target: T) {
    (<any>target).containerless = true;
    return target;
  }

  return target ? deco(target) : deco;
}

export const CustomElementResource : IResourceKind<ITemplateSource, ICustomElementType> = {
  name: 'custom-element',

  key(name: string) {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & ICustomElementType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | ITemplateSource, ctor: T = null): T & ICustomElementType {
    const Type: T & ICustomElementType = ctor === null ? class HTMLOnlyElement { /* HTML Only */ } as any : ctor as any;
    const description = createCustomElementDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
    const proto: ICustomElement = Type.prototype;

    (Type as Writable<ICustomElementType>).kind = CustomElementResource;
    (Type as Writable<ICustomElementType>).description = description;
    Type.register = function(container: IContainer){
      container.register(Registration.transient(Type.kind.key(description.name), Type));
    };

    proto.$hydrate = function(this: IInternalCustomElementImplementation, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject) {
      let template = renderingEngine.getElementTemplate(description, Type);

      this.$bindable = [];
      this.$attachable = [];
      this.$changeCallbacks = [];
      this.$slot = null;
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = {
        bindingContext: this,
        overrideContext: BindingContext.createOverride()
      };

      this.$context = template.renderContext;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, description.bindables);
      this.$projector = determineProjector(host, description);
      this.$view = this.$behavior.hasCreateView
        ? (this as any).createView(host, options.parts, template)
        : template.createFor(this, host, options.parts);

      if (this.$behavior.hasCreated) {
        (this as any).created();
      }
    };

    proto.$bind = function(this: IInternalCustomElementImplementation, flags: BindingFlags) {
      if (this.$isBound) {
        return;
      }

      const scope = this.$scope;
      const bindable = this.$bindable;

      for (let i = 0, ii = bindable.length; i < ii; ++i) {
        bindable[i].$bind(flags, scope);
      }

      this.$isBound = true;

      const changeCallbacks = this.$changeCallbacks;

      for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
        changeCallbacks[i]();
      }

      if (this.$behavior.hasBound) {
        (this as any).bound();
      }
    };

    proto.$attach = function(this: IInternalCustomElementImplementation, encapsulationSource: INode, lifecycle?: AttachLifecycle) {
      if (this.$isAttached) {
        return;
      }

      lifecycle = AttachLifecycle.start(this, lifecycle);
      encapsulationSource = this.$projector.provideEncapsulationSource(encapsulationSource);

      if (this.$behavior.hasAttaching) {
        (this as any).attaching(encapsulationSource);
      }

      const attachable = this.$attachable;

      for (let i = 0, ii = attachable.length; i < ii; ++i) {
        attachable[i].$attach(encapsulationSource, lifecycle);
      }

      if (this.$slot !== null) {
        this.$slot.$attach(encapsulationSource, lifecycle);
      }

      this.$projector.project(this.$view);

      if (this.$behavior.hasAttached) {
        lifecycle.queueAttachedCallback(this);
      }

      this.$isAttached = true;
      lifecycle.end(this);
    };

    proto.$detach = function(this: IInternalCustomElementImplementation, lifecycle?: DetachLifecycle) {
      if (this.$isAttached) {
        lifecycle = DetachLifecycle.start(this, lifecycle);

        if (this.$behavior.hasDetaching) {
          (this as any).detaching();
        }

        lifecycle.queueViewRemoval(this);

        const attachable = this.$attachable;
        let i = attachable.length;

        while (i--) {
          attachable[i].$detach();
        }

        if (this.$slot !== null) {
          this.$slot.$detach(lifecycle);
        }

        if (this.$behavior.hasDetached) {
          lifecycle.queueDetachedCallback(this);
        }

        this.$isAttached = false;
        lifecycle.end(this);
      }
    };

    proto.$unbind = function(this: IInternalCustomElementImplementation, flags: BindingFlags) {
      if (this.$isBound) {
        const bindable = this.$bindable;
        let i = bindable.length;

        while (i--) {
          bindable[i].$unbind(flags);
        }

        if (this.$behavior.hasUnbound) {
          (this as any).unbound();
        }

        this.$isBound = false;
      }
    };

    return Type;
  }
};

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
    bindables: Object.assign({}, (Type as any).bindables, templateSource.bindables),
    instructions: templateSource.instructions ? Array.from(templateSource.instructions) : PLATFORM.emptyArray,
    dependencies: templateSource.dependencies ? Array.from(templateSource.dependencies) : PLATFORM.emptyArray,
    surrogates: templateSource.surrogates ? Array.from(templateSource.surrogates) : PLATFORM.emptyArray,
    containerless: templateSource.containerless || (Type as any).containerless || false,
    shadowOptions: templateSource.shadowOptions || (Type as any).shadowOptions || null,
    hasSlots: templateSource.hasSlots || false
  };
}

export interface IElementProjector {
  readonly children: ArrayLike<INode>;
  onChildrenChanged(callback: () => void): void;
  provideEncapsulationSource(parentEncapsulationSource: INode): INode;
  project(view: IView): void;
}

function determineProjector(host: INode, definition: TemplateDefinition): IElementProjector {
  if (definition.shadowOptions || definition.hasSlots) {
    if (definition.containerless) {
      throw Reporter.error(21);
    }

    return new ShadowDOMProjector(host, definition);
  }

  if (definition.containerless) {
    return new ContainerlessProjector(host);
  }

  return new HostProjector(host);
}

class ShadowDOMProjector implements IElementProjector {
  private shadowRoot: INode;

  constructor(private host: INode, private definition: TemplateDefinition) {
    this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
  }

  get children(): ArrayLike<INode> {
    return this.host.childNodes;
  }

  public onChildrenChanged(callback: () => void): void {
    // TODO: use mutation observer on host
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return this.shadowRoot;
  }

  public project(view: IView): void {
    view.appendTo(this.shadowRoot);
  }
}

class ContainerlessProjector implements IElementProjector {
  private anchor: INode;

  constructor(private host: INode) {
    this.anchor = DOM.convertToAnchor(host, true);
  }

  get children(): ArrayLike<INode> {
    return PLATFORM.emptyArray;
  }

  public onChildrenChanged(callback: () => void): void {
    // TODO: throw error, cannot observe children
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    if (!parentEncapsulationSource) {
      throw Reporter.error(22);
    }

    return parentEncapsulationSource;
  }

  public project(view: IView): void {
    view.insertBefore(this.anchor);
  }
}

class HostProjector implements IElementProjector {
  constructor(private host: INode) {}

  get children(): ArrayLike<INode> {
    return PLATFORM.emptyArray;
  }

  public onChildrenChanged(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return parentEncapsulationSource || this.host;
  }

  public project(view: IView): void {
    view.appendTo(this.host);
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
