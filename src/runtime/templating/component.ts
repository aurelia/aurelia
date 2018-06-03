import { View, IViewOwner, IContentView } from './view';
import { ITaskQueue } from '../task-queue';
import { Observer } from '../binding/property-observation';
import { IEmulatedShadowSlot, ShadowDOMEmulation } from './shadow-dom';
import { PLATFORM } from '../platform';
import { IContainer, Registration, DI } from '../di';
import { BindingMode } from '../binding/binding-mode';
import { Constructable, ICallable, Immutable } from '../interfaces';
import { IBindScope, IAccessor, ISubscribable } from '../binding/observation';
import { IScope, BindingContext } from '../binding/binding-context';
import { IRenderSlot } from './render-slot';
import { IBindSelf, IAttach, AttachLifecycle, DetachLifecycle } from './lifecycle';
import { ITemplateSource, IBindableInstruction, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { INode, DOM, IView, IChildObserver } from '../dom';
import { SubscriberCollection } from '../binding/subscriber-collection';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';
import { IRenderContext } from './render-context';

export interface IElementComponent extends IBindSelf, IAttach, IViewOwner {
  $host: INode;
  $contentView: IContentView;
  $usingSlotEmulation: boolean;
  $isAttached: boolean;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, parts?: TemplatePartDefinitions, contentNodeOverride?: INode): void; //TODO: options instead of contentNodeOverride
}

interface IElementComponentImplementation extends IElementComponent {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IEmulatedShadowSlot;
  $shadowRoot: INode;
}

export interface IAttributeComponent extends IBindScope, IAttach { 
  $isBound: boolean;
  $isAttached: boolean;
  $scope: IScope;
  $hydrate(renderingEngine: IRenderingEngine,);
}

interface IAttributeComponentImplementation extends IAttributeComponent {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IEmulatedShadowSlot;
}

export interface IAttributeSource {
  name: string;
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
}

export interface IValueConverterSource {
  name: string;
}

export interface IBindingBehaviorSource {
  name: string;
}

export interface IAttributeType extends Constructable<IAttributeComponent> {
  source: Immutable<Required<IAttributeSource>>;
  register(container: IContainer);
};

export interface IElementType extends Constructable<IElementComponent> {
  source: TemplateDefinition;
  register(container: IContainer);
}

export interface ValueConverterType extends Constructable {
  source: Immutable<IValueConverterSource>;
  register(container: IContainer);
}

export interface BindingBehaviorType extends Constructable {
  source: Immutable<IBindingBehaviorSource>;
  register(container: IContainer);
}

export const Component = {
  valueConverter<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & ValueConverterType {
    const validSource = createDefinition<IValueConverterSource>(nameOrSource);
    const Type: T & ValueConverterType = ctor as any;

    Type.source = validSource;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(validSource.name, Type));
    };

    return Type;
  },
  bindingBehavior<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & BindingBehaviorType {
    const validSource = createDefinition<IBindingBehaviorSource>(nameOrSource);
    const Type: T & BindingBehaviorType = ctor as any;

    Type.source = validSource;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(validSource.name, Type));
    };

    return Type;
  },
  attribute<T extends Constructable>(nameOrSource: string | IAttributeSource, ctor: T): T & IAttributeType {
    const validSource = createAttributeDefinition(nameOrSource);
    const Type: T & IAttributeType = ctor as any;
    const proto: IAttributeComponent = Type.prototype;
    const observables = (Type as any).observables || {};

    Type.source = validSource;
    Type.register = function register(container: IContainer){
      container.register(Registration.transient(validSource.name, Type));

      const aliases = validSource.aliases;

      for(let i = 0, ii = aliases.length; i < ii; ++i) {
        container.register(Registration.alias(validSource.name, aliases[i]));
      }
    };

    proto.$hydrate = function(this: IAttributeComponentImplementation, renderingEngine: IRenderingEngine) {
      this.$changeCallbacks = [];
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = null;
      this.$slot = null;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, observables);

      if (this.$behavior.hasCreated) {
        (this as any).created();
      }
    };

    proto.$bind = function(this: IAttributeComponentImplementation, scope: IScope) {
      if (this.$isBound) {
        if (this.$scope === scope) {
          return;
        }
  
        this.$unbind();
      }

      this.$scope = scope
      this.$isBound = true;

      const changeCallbacks = this.$changeCallbacks;

      for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
        changeCallbacks[i]();
      }

      if (this.$behavior.hasBound) {
        (this as any).bound(scope);
      }
    };

    proto.$attach = function(this: IAttributeComponentImplementation, encapsulationSource: INode, lifecycle: AttachLifecycle){
      if (this.$isAttached) {
        return;
      }

      if (this.$behavior.hasAttaching) {
        (this as any).attaching(encapsulationSource);
      }

      if (this.$slot !== null) {
        this.$slot.$attach(encapsulationSource, lifecycle);
      }
    
      if (this.$behavior.hasAttached) {
        lifecycle.queueAttachedCallback(this);
      }

      this.$isAttached = true;
    };

    proto.$detach = function(this: IAttributeComponentImplementation, lifecycle: DetachLifecycle) {
      if (this.$isAttached) {
        if (this.$behavior.hasDetaching) {
          (this as any).detaching();
        }

        if (this.$slot !== null) {
          this.$slot.$detach(lifecycle);
        }
  
        if (this.$behavior.hasDetached) {
          lifecycle.queueDetachedCallback(this);
        }

        this.$isAttached = false;
      }
    };

    proto.$unbind = function(this: IAttributeComponentImplementation) {
      if (this.$isBound) {
        if (this.$behavior.hasUnbound) {
          (this as any).unbound();
        }
  
        this.$isBound = false;
      }
    };
    
    return Type;
  },
  element<T extends Constructable>(nameOrSource: string | ITemplateSource, ctor: T = null): T & IElementType {
    const Type: T & IElementType = ctor === null ? class HTMLOnlyElement { /* HTML Only */ } as any : ctor as any;
    const source: ITemplateSource = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const validSource = createTemplateDefinition(source, Type);
    const proto: IElementComponent = Type.prototype;

    Type.source = validSource;
    Type.register = function(container: IContainer){
      container.register(Registration.transient(validSource.name, Type));
    };

    proto.$hydrate = function(this: IElementComponentImplementation, renderingEngine: IRenderingEngine, host: INode, parts: TemplatePartDefinitions = PLATFORM.emptyObject, contentOverride?: INode) { 
      let template = renderingEngine.getElementTemplate(validSource, Type);

      this.$bindable = [];
      this.$attachable = [];
      this.$changeCallbacks = [];
      this.$slots = validSource.hasSlots ? {} : null;
      this.$usingSlotEmulation = validSource.hasSlots || false;
      this.$slot = null;
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = {
        bindingContext: this,
        overrideContext: BindingContext.createOverride()
      };
      
      this.$context = template.renderContext;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, validSource.observables);
      this.$host = validSource.containerless ? DOM.convertToAnchor(host, true) : host;
      this.$shadowRoot = DOM.createElementViewHost(this.$host, validSource.shadowOptions);
      this.$usingSlotEmulation = DOM.isUsingSlotEmulation(this.$host);
      this.$contentView = View.fromCompiledContent(this.$host, contentOverride);
      this.$view = this.$behavior.hasCreateView
        ? (this as any).createView(host, parts, template)
        : template.createFor(this, host, parts);

      (this.$host as any).$component = this;

      if (this.$behavior.hasCreated) {
        (this as any).created();
      }
    };

    proto.$bind = function(this: IElementComponentImplementation) {
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

    proto.$attach = function(this: IElementComponentImplementation, encapsulationSource: INode, lifecycle?: AttachLifecycle) {
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

      if (validSource.containerless) {
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

    proto.$detach = function(this: IElementComponentImplementation, lifecycle?: DetachLifecycle) {
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

    proto.$unbind = function(this: IElementComponentImplementation) {
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

function createDefinition<T>(nameOrSource: any): Immutable<T> {
  let source: any;
    
  if (typeof nameOrSource === 'string') {
    source = { name: source };
  } else {
    source = nameOrSource;
  }

  return source;
}

function createAttributeDefinition(nameOrSource: string | IAttributeSource): Immutable<Required<IAttributeSource>> {
  if (typeof nameOrSource === 'string') {
    nameOrSource = {
      name: nameOrSource
    };
  }

  return {
    name: nameOrSource.name,
    aliases: nameOrSource.aliases || PLATFORM.emptyArray,
    defaultBindingMode: nameOrSource.defaultBindingMode || BindingMode.oneWay,
    isTemplateController: nameOrSource.isTemplateController || false
  };
}

function createTemplateDefinition(templateSource: ITemplateSource, Type: IElementType): TemplateDefinition {
  let definition = {
    name: templateSource.name || 'Unnamed Template',
    template: templateSource.template || null,
    observables: Object.assign({}, (Type as any).observables, templateSource.observables),
    instructions: templateSource.instructions ? Array.from(templateSource.instructions) : PLATFORM.emptyArray,
    dependencies: templateSource.dependencies ? Array.from(templateSource.dependencies) : PLATFORM.emptyArray,
    surrogates: templateSource.surrogates ? Array.from(templateSource.surrogates) : PLATFORM.emptyArray,
    containerless: templateSource.containerless || (Type as any).containerless || false,
    shadowOptions: templateSource.shadowOptions || (Type as any).shadowOptions || null,
    hasSlots: templateSource.hasSlots || false
  };

  // TODO: hook

  return definition;
}
