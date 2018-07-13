import { Constructable, Immutable, Writable } from '../../kernel/interfaces';
import { ITemplateSource, IHydrateElementInstruction, TemplateDefinition } from './instructions';
import { IBindSelf, IAttach, AttachLifecycle, DetachLifecycle } from './lifecycle';
import { IViewOwner, IContentView, View } from './view';
import { INode, DOM } from '../dom';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';
import { IRenderSlot } from './render-slot';
import { IResourceType, IResourceKind } from '../resource';
import { IContainer, Registration } from '../../kernel/di';
import { BindingContext } from '../binding/binding-context';
import { ShadowDOMEmulation } from './shadow-dom';
import { PLATFORM } from '../../kernel/platform';

export interface ICustomElementType extends IResourceType<ITemplateSource, ICustomElement> { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts' | 'contentOverride'>>;

export interface ICustomElement extends IBindSelf, IAttach, Readonly<IViewOwner> {
  readonly $host: INode;
  readonly $contentView: IContentView;
  readonly $usingSlotEmulation: boolean;
  readonly $isAttached: boolean;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

interface IInternalCustomElementImplementation extends Writable<ICustomElement> {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IRenderSlot;
  $shadowRoot: INode;
}

/**
* Decorator: Indicates that the decorated class is a custom element.
*/
export function customElement(nameOrSource: string | ITemplateSource) {
  return function<T extends Constructable>(target: T) {
    return CustomElementResource.define(nameOrSource, target);
  }
}

const defaultShadowOptions = { mode: 'open' };

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
    const description = createDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
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
      this.$slots = description.hasSlots ? {} : null;
      this.$usingSlotEmulation = description.hasSlots || false;
      this.$slot = null;
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = {
        bindingContext: this,
        overrideContext: BindingContext.createOverride()
      };
      
      this.$context = template.renderContext;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, description.bindables);
      this.$host = description.containerless ? DOM.convertToAnchor(host, true) : host;
      this.$shadowRoot = DOM.createElementViewHost(this.$host, description.shadowOptions);
      this.$usingSlotEmulation = DOM.isUsingSlotEmulation(this.$host);
      this.$contentView = View.fromCompiledContent(this.$host, options);
      this.$view = this.$behavior.hasCreateView
        ? (this as any).createView(host, options.parts, template)
        : template.createFor(this, host, options.parts);
  
      (this.$host as any).$component = this;
  
      if (this.$behavior.hasCreated) {
        (this as any).created();
      }
    };
  
    proto.$bind = function(this: IInternalCustomElementImplementation) {
      if (this.$isBound) {
        return;
      }
  
      const scope = this.$scope;
      const bindable = this.$bindable;
  
      for (let i = 0, ii = bindable.length; i < ii; ++i) {
        bindable[i].$bind(scope);
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
      encapsulationSource = this.$usingSlotEmulation 
        ? encapsulationSource || this.$host
        : this.$shadowRoot;
  
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
  
      //Native ShadowDOM would be distributed as soon as we append the view below.
      //So, we emulate the distribution of nodes at the same time.
      if (this.$contentView !== null && this.$slots) {
        ShadowDOMEmulation.distributeContent(this.$contentView, this.$slots);
      }
  
      if (description.containerless) {
        this.$view.insertBefore(this.$host);
      } else {
        this.$view.appendTo(this.$shadowRoot);
      }
    
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
  
    proto.$unbind = function(this: IInternalCustomElementImplementation) {
      if (this.$isBound) {
        const bindable = this.$bindable;
        let i = bindable.length;
  
        while (i--) {
          bindable[i].$unbind();
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

function createDescription(templateSource: ITemplateSource, Type: ICustomElementType): TemplateDefinition {
  return {
    name: templateSource.name || 'unnamed',
    template: templateSource.template || null,
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
