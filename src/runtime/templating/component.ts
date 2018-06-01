import { View, IViewOwner, IContentView } from './view';
import { ITaskQueue } from '../task-queue';
import { Observer } from '../binding/property-observation';
import { IEmulatedShadowSlot, ShadowDOMEmulation } from './shadow-dom';
import { PLATFORM } from '../platform';
import { IContainer, Registration, DI } from '../di';
import { BindingMode } from '../binding/binding-mode';
import { Constructable, ICallable } from '../interfaces';
import { IBindScope, IAccessor, ISubscribable } from '../binding/observation';
import { IScope, BindingContext } from '../binding/binding-context';
import { IRenderSlot } from './render-slot';
import { IBindSelf, IAttach, AttachLifecycle, DetachLifecycle } from './lifecycle';
import { ITemplateSource, IBindableInstruction } from './instructions';
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
  $hydrate(renderingEngine: IRenderingEngine, host: INode, replacements?: Record<string, ITemplateSource>, contentNodeOverride?: INode): void;
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
  source: IAttributeSource;
  register(container: IContainer);
};

export interface IElementType extends Constructable<IElementComponent> {
  source: ITemplateSource;
  register(container: IContainer);
}

export interface ValueConverterType extends Constructable {
  source: IValueConverterSource;
  register(container: IContainer);
}

export interface BindingBehaviorType extends Constructable {
  source: IBindingBehaviorSource;
  register(container: IContainer);
}

export const Component = {
  valueConverter<T extends Constructable>(nameOrSource: string | IValueConverterSource, ctor: T): T & ValueConverterType {
    const source = ensureSource<IValueConverterSource>(nameOrSource);
    const Type: T & ValueConverterType = ctor as any;

    Type.source = source;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(source.name, Type));
    };

    return Type;
  },
  bindingBehavior<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & BindingBehaviorType {
    const source = ensureSource<IBindingBehaviorSource>(nameOrSource);
    const Type: T & BindingBehaviorType = ctor as any;

    Type.source = source;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(source.name, Type));
    };

    return Type;
  },
  attribute<T extends Constructable>(nameOrSource: string | IAttributeSource, ctor: T): T & IAttributeType {
    const source = ensureSource<IAttributeSource>(nameOrSource);
    const Type: T & IAttributeType = ctor as any;
    const proto: IAttributeComponent = Type.prototype;
    const observables = (Type as any).observables || {};

    Type.source = source;
    Type.register = function register(container: IContainer){
      container.register(Registration.transient(source.name, Type));

      let aliases = source.aliases;

      if (aliases) {
        for(let i = 0, ii = aliases.length; i < ii; ++i) {
          container.register(Registration.alias(source.name, aliases[i]));
        }
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

    proto.$attach = function(this: IAttributeComponentImplementation, context: AttachLifecycle){
      if (this.$isAttached) {
        return;
      }

      if (this.$behavior.hasAttaching) {
        (this as any).attaching();
      }

      if (this.$slot !== null) {
        this.$slot.$attach(context);
      }
    
      if (this.$behavior.hasAttached) {
        context.queueAttachedCallback(this);
      }

      this.$isAttached = true;
    };

    proto.$detach = function(this: IAttributeComponentImplementation, context: DetachLifecycle) {
      if (this.$isAttached) {
        if (this.$behavior.hasDetaching) {
          (this as any).detaching();
        }

        if (this.$slot !== null) {
          this.$slot.$detach(context);
        }
  
        if (this.$behavior.hasDetached) {
          context.queueDetachedCallback(this);
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
  element<T extends Constructable>(source: ITemplateSource, ctor: T = null): T & IElementType {
    const Type: T & IElementType = ctor === null ? class HTMLOnlyElement { /* HTML Only */ } as any : ctor as any;
    const proto: IElementComponent = Type.prototype;
    const observables = Object.assign({}, (Type as any).observables, source.observables); //Merge any observables from view compilation with those from bindable props on the class.
    
    source.shadowOptions = source.shadowOptions || (Type as any).shadowOptions || null;
    source.containerless = source.containerless || (Type as any).containerless || false;

    Type.source = source;
    Type.register = function(container: IContainer){
      container.register(Registration.transient(source.name, Type));
    };

    proto.$hydrate = function(this: IElementComponentImplementation, renderingEngine: IRenderingEngine, host: INode, replacements: Record<string, ITemplateSource> = PLATFORM.emptyObject, contentOverride?: INode) { 
      let template = renderingEngine.getElementTemplate(source, Type);

      this.$bindable = [];
      this.$attachable = [];
      this.$changeCallbacks = [];
      this.$slots = source.hasSlots ? {} : null;
      this.$usingSlotEmulation = source.hasSlots || false;
      this.$slot = null;
      this.$isAttached = false;
      this.$isBound = false;
      this.$scope = {
        bindingContext: this,
        overrideContext: BindingContext.createOverride()
      };
      
      this.$context = template.context;
      this.$behavior = renderingEngine.applyRuntimeBehavior(Type, this, observables);
      this.$host = source.containerless ? DOM.convertToAnchor(host, true) : host;
      this.$shadowRoot = DOM.createElementViewHost(this.$host, source.shadowOptions);
      this.$usingSlotEmulation = DOM.isUsingSlotEmulation(this.$host);
      this.$contentView = View.fromCompiledContent(this.$host, contentOverride);
      this.$view = this.$behavior.hasCreateView
        ? (this as any).createView(host, replacements, template)
        : template.createFor(this, host, replacements);

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

    proto.$attach = function(this: IElementComponentImplementation, lifecycle?: AttachLifecycle) {
      if (this.$isAttached) {
        return;
      }

      lifecycle = AttachLifecycle.start(this, lifecycle);

      if (this.$behavior.hasAttaching) {
        (this as any).attaching();
      }

      const attachable = this.$attachable;

      for (let i = 0, ii = attachable.length; i < ii; ++i) {
        attachable[i].$attach(lifecycle);
      }

      if (this.$slot !== null) {
        this.$slot.$attach(lifecycle);
      }

      //Native ShadowDOM would be distributed as soon as we append the view below.
      //So, we emulate the distribution of nodes at the same time.
      if (this.$contentView !== null && this.$slots) {
        ShadowDOMEmulation.distributeContent(this.$contentView, this.$slots);
      }

      if (source.containerless) {
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

function ensureSource<T>(nameOrSource: any): T {
  let source: any;
    
  if (typeof nameOrSource === 'string') {
    source = { name: source };
  } else {
    source = nameOrSource;
  }

  return source;
}
