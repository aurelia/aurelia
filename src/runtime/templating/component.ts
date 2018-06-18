import { View, IViewOwner, IContentView } from './view';
import { ShadowDOMEmulation } from './shadow-dom';
import { PLATFORM } from '../platform';
import { IContainer, Registration, IRegistry } from '../di';
import { BindingMode } from '../binding/binding-mode';
import { Constructable, Immutable, Writable } from '../interfaces';
import { IBindScope } from '../binding/observation';
import { IScope, BindingContext } from '../binding/binding-context';
import { IRenderSlot } from './render-slot';
import { IBindSelf, IAttach, AttachLifecycle, DetachLifecycle } from './lifecycle';
import { ITemplateSource, TemplateDefinition, IHydrateElementInstruction, AttributeDefinition, ValueConverterDefinition, BindingBehaviorDefinition, IValueConverterSource, IBindingBehaviorSource, IAttributeSource } from './instructions';
import { INode, DOM } from '../dom';
import { IRenderingEngine } from './rendering-engine';
import { IRuntimeBehavior } from './runtime-behavior';

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts' | 'contentOverride'>>;

export interface IElementComponent extends IBindSelf, IAttach, Readonly<IViewOwner> {
  readonly $host: INode;
  readonly $contentView: IContentView;
  readonly $usingSlotEmulation: boolean;
  readonly $isAttached: boolean;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

interface IElementComponentImplementation extends Writable<IElementComponent> {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IRenderSlot;
  $shadowRoot: INode;
}

export interface IAttributeComponent extends IBindScope, IAttach { 
  readonly $isBound: boolean;
  readonly $isAttached: boolean;
  readonly $scope: IScope;
  $hydrate(renderingEngine: IRenderingEngine);
}

interface IAttributeComponentImplementation extends Writable<IAttributeComponent> {
  $changeCallbacks: (() => void)[];
  $behavior: IRuntimeBehavior;
  $slot: IRenderSlot;
}

export interface IAttributeType extends Constructable<IAttributeComponent>, IRegistry {
  readonly type: 'attribute';
  readonly definition: AttributeDefinition;
};

export interface IElementType extends Constructable<IElementComponent>, IRegistry {
  readonly type: 'element';
  readonly definition: TemplateDefinition;
}

export interface IValueConverterType extends Constructable, IRegistry {
  readonly type: 'value-converter';
  readonly definition: ValueConverterDefinition;
}

export interface IBindingBehaviorType extends Constructable, IRegistry {
  readonly type: 'binding-behavior';
  readonly definition: BindingBehaviorDefinition;
}

export type ComponentType =  IAttributeType | IElementType | IValueConverterType | IBindingBehaviorType;

export const Component = {
  valueConverter<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & IValueConverterType {
    const definition = createDefinition<IValueConverterSource>(nameOrSource);
    const Type: T & IValueConverterType = ctor as any;

    (Type as Writable<IValueConverterType>).type = 'value-converter';
    (Type as Writable<IValueConverterType>).definition = definition;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(definition.name, Type));
    };

    return Type;
  },
  bindingBehavior<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & IBindingBehaviorType {
    const definition = createDefinition<IBindingBehaviorSource>(nameOrSource);
    const Type: T & IBindingBehaviorType = ctor as any;

    (Type as Writable<IBindingBehaviorType>).type = 'binding-behavior';
    (Type as Writable<IBindingBehaviorType>).definition = definition;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(definition.name, Type));
    };

    return Type;
  },
  attribute<T extends Constructable>(nameOrSource: string | IAttributeSource, ctor: T): T & IAttributeType {
    const definition = createAttributeDefinition(nameOrSource);
    const Type: T & IAttributeType = ctor as any;
    const proto: IAttributeComponent = Type.prototype;
    const observables = (Type as any).observables || {};

    (Type as Writable<IAttributeType>).type = 'attribute';
    (Type as Writable<IAttributeType>).definition = definition;
    Type.register = function register(container: IContainer){
      container.register(Registration.transient(definition.name, Type));

      const aliases = definition.aliases;

      for(let i = 0, ii = aliases.length; i < ii; ++i) {
        container.register(Registration.alias(definition.name, aliases[i]));
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
    const definition = createTemplateDefinition(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
    const proto: IElementComponent = Type.prototype;

    (Type as Writable<IElementType>).type = 'element';
    (Type as Writable<IElementType>).definition = definition;
    Type.register = function(container: IContainer){
      container.register(Registration.transient(definition.name, Type));
    };

    proto.$hydrate = function(this: IElementComponentImplementation, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject) { 
      let template = renderingEngine.getElementTemplate(definition, Type);

      this.$bindable = [];
      this.$attachable = [];
      this.$changeCallbacks = [];
      this.$slots = definition.hasSlots ? {} : null;
      this.$usingSlotEmulation = definition.hasSlots || false;
      this.$slot = null;
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = {
        bindingContext: this,
        overrideContext: BindingContext.createOverride()
      };
      
      this.$context = template.renderContext;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, definition.observables);
      this.$host = definition.containerless ? DOM.convertToAnchor(host, true) : host;
      this.$shadowRoot = DOM.createElementViewHost(this.$host, definition.shadowOptions);
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

      if (definition.containerless) {
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

function createDefinition<T>(nameOrSource: string | T): Immutable<T> {
  if (typeof nameOrSource === 'string') {
    return { name: nameOrSource } as any;
  } else {
    return nameOrSource as any;
  }
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
  return {
    name: templateSource.name || 'unnamed',
    template: templateSource.template || null,
    observables: Object.assign({}, (Type as any).observables, templateSource.observables),
    instructions: templateSource.instructions ? Array.from(templateSource.instructions) : PLATFORM.emptyArray,
    dependencies: templateSource.dependencies ? Array.from(templateSource.dependencies) : PLATFORM.emptyArray,
    surrogates: templateSource.surrogates ? Array.from(templateSource.surrogates) : PLATFORM.emptyArray,
    containerless: templateSource.containerless || (Type as any).containerless || false,
    shadowOptions: templateSource.shadowOptions || (Type as any).shadowOptions || null,
    hasSlots: templateSource.hasSlots || false
  };
}
