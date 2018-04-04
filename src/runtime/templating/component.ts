import { ViewEngine, CompiledViewSource, ITemplate } from "./view-engine";
import { IView, View, IViewOwner } from "./view";
import { IScope, IBindScope } from "../binding/binding-interfaces";
import { createOverrideContext } from "../binding/scope";
import { TaskQueue } from "../task-queue";
import { Observer } from "../binding/property-observation";
import { IShadowSlot, ShadowDOM } from "./shadow-dom";
import { FEATURE } from "../feature";
import { DOM } from "../dom";
import { IContainer, Registration } from "../di";
import { BindingMode } from "../binding/binding-mode";

export interface IBindSelf {
  bind(): void;
  unbind(): void;
}
export interface IAttach {
  attach(): void;
  detach(): void;
}

export interface IApplyToTarget {
  applyTo(target: Element): this;
}

export interface IElementComponent extends IBindSelf, IAttach, IApplyToTarget, IViewOwner {
  
}

export interface IAttributeComponent extends IBindScope, IAttach {
  
}

export interface CompiledElementSource extends CompiledViewSource {
  name: string;
  observers: any[];
  containerless?: boolean;
  shadowOptions?: ShadowRootInit;
}

export interface AttributeSource {
  name: string;
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
}

type Constructable = {
  new(...args: any[]): {};
}

type ConstructableAttributeComponent = Constructable & {
  new(...args: any[]): IAttributeComponent;
  source: AttributeSource;
};

type ConstructableElementComponent = Constructable & {
  new(...args: any[]): IElementComponent;
  template: ITemplate;
  source: CompiledElementSource;
}

export const Component = {
  attributeFromSource<T extends Constructable>(ctor: T, source: AttributeSource): T & ConstructableAttributeComponent {
    return class CustomAttribute extends ctor implements IAttributeComponent {
      static source: AttributeSource = source;

      static register(container: IContainer){
        container.register(Registration.transient(source.name, CustomAttribute));

        let aliases = source.aliases;

        if (aliases) {
          for(let i = 0, ii = aliases.length; i < ii; ++i) {
            container.register(Registration.transient(aliases[i], CustomAttribute));
          }
        }
      }

      private $changeCallbacks: (() => void)[] = [];
      $isBound = false;

      constructor(...args:any[]) {
        super(...args);
        setupObservers(this, source);

        if ('created' in this) {
          (<any>this).created();
        }
      }

      bind(scope: IScope) {
        this.$isBound = true;
  
        let changeCallbacks = this.$changeCallbacks;
  
        for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
          changeCallbacks[i]();
        }
  
        if ('bound' in this) {
          (<any>this).bound(scope);
        }
      }

      attach(){
        if ('attaching' in this) {
          (<any>this).attaching();
        }
      
        if ('attached' in this) {
          TaskQueue.instance.queueMicroTask(() => (<any>this).attached());
        }
      }

      detach() {
        if ('detaching' in this) {
          (<any>this).detaching();
        }
  
        if ('detached' in this) {
          TaskQueue.instance.queueMicroTask(() => (<any>this).detached());
        }
      }

      unbind() {
        if ('unbound' in this) {
          (<any>this).unbound();
        }
  
        this.$isBound = false;
      }
    };
  },
  elementFromCompiledSource<T extends Constructable>(ctor: T, source: CompiledElementSource): T & ConstructableElementComponent {
    const template = ViewEngine.templateFromCompiledSource(source);

    //TODO: Add CompiledComponent into template's container.
      
    return class CompiledComponent extends ctor implements IElementComponent {
      static template: ITemplate = template;
      static source: CompiledElementSource = source;

      static register(container: IContainer){
        container.register(Registration.transient(source.name, CompiledComponent));
      }
  
      $bindable: IBindScope[] = [];
      $attachable: IAttach[] = [];
      $slots: Record<string, IShadowSlot> = source.hasSlots ? {} : null;
      $useShadowDOM = source.shadowOptions && FEATURE.shadowDOM;
      $view: IView;
      $contentView: IView = null;
      $isBound = false;
      $scope: IScope = {
        bindingContext: this,
        overrideContext: createOverrideContext()
      };
      
      private $host: Element;
      private $shadowRoot: Element | ShadowRoot;
      private $changeCallbacks: (() => void)[] = [];
  
      constructor(...args:any[]) {
        super(...args);
        setupObservers(this, source);
      }
  
      applyTo(host: Element) { 
        this.$host = source.containerless 
          ? DOM.makeElementIntoAnchor(host, true)
          : host;

        this.$shadowRoot = this.$useShadowDOM 
          ? host.attachShadow(source.shadowOptions) 
          : this.$host;

        this.$view = this.createView(this.$host);
  
        if ('created' in this) {
          (<any>this).created();
        }
  
        return this;
      }
  
      createView(host: Element) {
        return template.createFor(this, host);
      }
  
      bind() {
        let scope = this.$scope;
        let bindable = this.$bindable;
  
        for (let i = 0, ii = bindable.length; i < ii; ++i) {
          bindable[i].bind(scope);
        }

        if (this.$contentView !== View.none) {
          ShadowDOM.distributeView(this.$contentView, this.$slots);
        }
  
        this.$isBound = true;
  
        let changeCallbacks = this.$changeCallbacks;
  
        for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
          changeCallbacks[i]();
        }
  
        if ('bound' in this) {
          (<any>this).bound();
        }
      }
  
      attach() {
        if ('attaching' in this) {
          (<any>this).attaching();
        }
  
        let attachable = this.$attachable;
  
        for (let i = 0, ii = attachable.length; i < ii; ++i) {
          attachable[i].attach();
        }
  
        if (source.containerless) {
          this.$view.insertBefore(this.$host);
        } else {
          this.$view.appendTo(this.$shadowRoot);
        }
      
        if ('attached' in this) {
          TaskQueue.instance.queueMicroTask(() => (<any>this).attached());
        }
      }
  
      detach() {
        if ('detaching' in this) {
          (<any>this).detaching();
        }
  
        this.$view.remove();
  
        let attachable = this.$attachable;
        let i = attachable.length;
  
        while (i--) {
          attachable[i].detach();
        }
  
        if ('detached' in this) {
          TaskQueue.instance.queueMicroTask(() => (<any>this).detached());
        }
      }
  
      unbind() {
        let bindable = this.$bindable;
        let i = bindable.length;
  
        while (i--) {
          bindable[i].unbind();
        }
  
        if ('unbound' in this) {
          (<any>this).unbound();
        }
  
        this.$isBound = false;
      }
    }
  }
};

function setupObservers(instance, config) {
  let observerConfigs = config.observers;

  if (!observerConfigs) {
    return;
  }

  let observers = {};

  for (let i = 0, ii = observerConfigs.length; i < ii; ++i) {
    let observerConfig = observerConfigs[i];
    let name = observerConfig.name;

    if ('changeHandler' in observerConfig) {
      let changeHandler = observerConfig.changeHandler;
      observers[name] = new Observer(instance[name], v => instance.$isBound ? instance[changeHandler](v) : void 0);
      instance.$changeCallbacks.push(() => instance[changeHandler](instance[name]));
    } else {
      observers[name] = new Observer(instance[name]);
    }

    createGetterSetter(instance, name);
  }

  Object.defineProperty(instance, '$observers', {
    enumerable: false,
    value: observers
  });
}

function createGetterSetter(instance, name) {
  Object.defineProperty(instance, name, {
    enumerable: true,
    get: function() { return this.$observers[name].getValue(); },
    set: function(value) { this.$observers[name].setValue(value); }
  });
}
