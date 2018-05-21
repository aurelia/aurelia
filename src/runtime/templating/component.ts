import { ViewEngine, ITemplate, } from './view-engine';
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
import { IBindSelf, IAttach, AttachContext, DetachContext } from './lifecycle';
import { ITemplateSource, IBindableInstruction } from './instructions';
import { INode, DOM, IView, IChildObserver } from '../dom';
import { SubscriberCollection } from '../binding/subscriber-collection';
import { ITemplateEngine, IRuntimeBehavior } from './template-engine';

export interface IElementComponent extends IBindSelf, IAttach, IViewOwner {
  $host: INode;
  $view: IView;
  $contentView: IContentView;
  $slots: Record<string, IEmulatedShadowSlot>;
  $usingSlotEmulation: boolean;

  $hydrate(templateEngine: ITemplateEngine, host: INode, replacements?: Record<string, ITemplateSource>, contentNodeOverride?: INode): void;
}

export interface IAttributeComponent extends IBindScope, IAttach { 
  $hydrate(templateEngine: ITemplateEngine,);
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
    const source = (<any>ctor).source = ensureSource<IValueConverterSource>(nameOrSource);

    (<any>ctor).register = function(container: IContainer) {
      container.register(Registration.singleton(source.name, ctor));
    }

    return <any>ctor;
  },
  bindingBehavior<T extends Constructable>(nameOrSource: string | IBindingBehaviorSource, ctor: T): T & BindingBehaviorType {
    const source = (<any>ctor).source = ensureSource<IBindingBehaviorSource>(nameOrSource);

    (<any>ctor).register = function(container: IContainer) {
      container.register(Registration.singleton(source.name, ctor));
    };

    return <any>ctor;
  },
  attribute<T extends Constructable>(nameOrSource: string | IAttributeSource, ctor: T): T & IAttributeType {
    const source = ensureSource<IAttributeSource>(nameOrSource);
    const observables = (<any>ctor).observables || {};
    
    return class CustomAttribute extends ctor implements IAttributeComponent {
      static source: IAttributeSource = source;

      static register(container: IContainer){
        container.register(Registration.transient(source.name, CustomAttribute));

        let aliases = source.aliases;

        if (aliases) {
          for(let i = 0, ii = aliases.length; i < ii; ++i) {
            container.register(Registration.alias(source.name, aliases[i]));
          }
        }
      }

      private $changeCallbacks: (() => void)[] = [];
      private $behavior: IRuntimeBehavior = null;

      $isAttached = false;
      $isBound = false;
      $scope: IScope = null;
      $slot: IRenderSlot = null;

      $hydrate(templateEngine: ITemplateEngine) {
        this.$behavior = templateEngine.applyRuntimeBehavior(CustomAttribute, this, observables);

        if (this.$behavior.hasCreated) {
          (<any>this).created();
        }
      }

      $bind(scope: IScope) {
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
          (<any>this).bound(scope);
        }
      }

      $attach(context: AttachContext){
        if (this.$isAttached) {
          return;
        }

        if (this.$behavior.hasAttaching) {
          (<any>this).attaching();
        }

        if (this.$slot !== null) {
          this.$slot.$attach(context);
        }
      
        if (this.$behavior.hasAttached) {
          context.queueForAttachedCallback(this);
        }

        this.$isAttached = true;
      }

      $detach(context: DetachContext) {
        if (this.$isAttached) {
          if (this.$behavior.hasDetaching) {
            (<any>this).detaching();
          }

          if (this.$slot !== null) {
            this.$slot.$detach(context);
          }
    
          if (this.$behavior.hasDetached) {
            context.queueForDetachedCallback(this);
          }

          this.$isAttached = false;
        }
      }

      $unbind() {
        if (this.$isBound) {
          if (this.$behavior.hasUnbound) {
            (<any>this).unbound();
          }
    
          this.$isBound = false;
        }
      }
    };
  },
  element<T extends Constructable>(source: ITemplateSource, ctor: T = null): T & IElementType {
    //Support HTML-Only Elements by providing a generated class.
    if (ctor === null) {
      ctor = <any>class HTMLOnlyElement { };
    }
    
    source.shadowOptions = source.shadowOptions || (<any>ctor).shadowOptions || null;
    source.containerless = source.containerless || (<any>ctor).containerless || false;

    //Merge any observables from view compilation with those from bindable props on the class.
    const observables = Object.assign({}, (<any>ctor).observables, source.observables);

    const CompiledComponent = class extends ctor implements IElementComponent {
      static source: ITemplateSource = source;

      static register(container: IContainer){
        container.register(Registration.transient(source.name, CompiledComponent));
      }
  
      $bindable: IBindScope[] = [];
      $attachable: IAttach[] = [];
      $slots: Record<string, IEmulatedShadowSlot> = source.hasSlots ? {} : null;
      $usingSlotEmulation = source.hasSlots || false;
      $view: IView = null;
      $contentView: IContentView = null;
      $slot: IRenderSlot = null;
      $isAttached = false;
      $isBound = false;
      $scope: IScope = {
        bindingContext: this,
        overrideContext: BindingContext.createOverride()
      };
      
      $host: INode = null;
      private $shadowRoot: INode = null;
      private $changeCallbacks: (() => void)[] = [];
      private $behavior: IRuntimeBehavior = null;
  
      $hydrate(templateEngine: ITemplateEngine, host: INode, replacements: Record<string, ITemplateSource> = PLATFORM.emptyObject, contentOverride?: INode) { 
        let template = templateEngine.getElementTemplate(source, CompiledComponent);
        
        this.$behavior = templateEngine.applyRuntimeBehavior(CompiledComponent, this, observables);
        this.$host = source.containerless ? DOM.convertToAnchor(host, true) : host;
        this.$shadowRoot = DOM.createElementViewHost(this.$host, source.shadowOptions);
        this.$usingSlotEmulation = DOM.isUsingSlotEmulation(this.$host);
        this.$contentView = View.fromCompiledContent(this.$host, contentOverride);
        this.$view = this.$behavior.hasCreateView
          ? (<any>this).createView(host, replacements, template)
          : template.createFor(this, host, replacements);

        (<any>this.$host).$component = this;
  
        if (this.$behavior.hasCreated) {
          (<any>this).created();
        }
      }
  
      $bind() {
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
          (<any>this).bound();
        }
      }
  
      $attach(context?: AttachContext) {
        if (this.$isAttached) {
          return;
        }

        if (!context) {
          context = AttachContext.open(this);
        }

        if (this.$behavior.hasAttaching) {
          (<any>this).attaching();
        }
  
        const attachable = this.$attachable;
  
        for (let i = 0, ii = attachable.length; i < ii; ++i) {
          attachable[i].$attach(context);
        }

        if (this.$slot !== null) {
          this.$slot.$attach(context);
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
          context.queueForAttachedCallback(this);
        }

        this.$isAttached = true;

        if (context.wasOpenedBy(this)) {
          context.close();
        }
      }
  
      $detach(context?: DetachContext) {
        if (this.$isAttached) {
          if (!context) {
            context = DetachContext.open(this);
          }

          if (this.$behavior.hasDetaching) {
            (<any>this).detaching();
          }

          context.queueForViewRemoval(this);
    
          const attachable = this.$attachable;
          let i = attachable.length;
    
          while (i--) {
            attachable[i].$detach();
          }

          if (this.$slot !== null) {
            this.$slot.$detach(context);
          }
    
          if (this.$behavior.hasDetached) {
            context.queueForDetachedCallback(this);
          }

          this.$isAttached = false;

          if (context.wasOpenedBy(this)) {
            context.close();
          }
        }
      }
  
      $unbind() {
        if (this.$isBound) {
          const bindable = this.$bindable;
          let i = bindable.length;
    
          while (i--) {
            bindable[i].$unbind();
          }
    
          if (this.$behavior.hasUnbound) {
            (<any>this).unbound();
          }
    
          this.$isBound = false;
        }
      }
    }

    return CompiledComponent;
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
