import { ViewEngine, ICompiledViewSource, ITemplate } from "./view-engine";
import { IView, View, IViewOwner } from "./view";
import { TaskQueue } from "../task-queue";
import { Observer } from "../binding/property-observation";
import { IShadowSlot, ShadowDOM } from "./shadow-dom";
import { FEATURE, DOM } from "../pal";
import { IContainer, Registration } from "../di";
import { BindingMode } from "../binding/binding-mode";
import { Constructable } from "../interfaces";
import { IBindScope } from "../binding/observation";
import { IScope, BindingContext } from "../binding/binding-context";

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

export interface ICompiledElementSource extends ICompiledViewSource {
  name: string;
  containerless?: boolean;
  shadowOptions?: ShadowRootInit;
}

export interface IAttributeSource {
  name: string;
  defaultBindingMode?: BindingMode;
  aliases?: string[];
  isTemplateController?: boolean;
}

type ConstructableAttributeComponent = Constructable & {
  new(...args: any[]): IAttributeComponent;
  source: IAttributeSource;
};

type ConstructableElementComponent = Constructable & {
  new(...args: any[]): IElementComponent;
  template: ITemplate;
  source: ICompiledElementSource;
}

interface IObservableDescription {
  name: string;
  changeHandler: string;
}

class RuntimeCharacteristics {
  private constructor() {}

  observables: IObservableDescription[] = [];
  hasCreated = false;
  hasBound = false;
  hasAttaching = false;
  hasAttached = false;
  hasDetaching = false;
  hasDetached = false;
  hasUnbound = false;

  static for(instance, Component: ConstructableElementComponent | ConstructableAttributeComponent) {
    let characteristics = new RuntimeCharacteristics();
    let configuredObservables = (<any>Component).observables;
    let observables: IObservableDescription[] = [];

    for (let key in instance) {
      if (configuredObservables) {
        let found = configuredObservables[key];

        if (found) {
          if (found.changeHandler in instance) {
            observables.push(found);
          }

          continue;
        }
      }

      if (`${key}Changed` in instance) {
        observables.push({
          name: key,
          changeHandler: `${key}Changed`
        });
      }
    }

    characteristics.observables = observables;
    characteristics.hasCreated = 'created' in instance;
    characteristics.hasBound = 'bound' in instance;
    characteristics.hasAttaching = 'attaching' in instance;
    characteristics.hasAttached = 'attached' in instance;
    characteristics.hasDetaching = 'detaching' in instance;
    characteristics.hasDetached = 'detached' in instance;
    characteristics.hasUnbound = 'unbound' in instance;

    return characteristics;
  }
}

export const Component = {
  attributeFromSource<T extends Constructable>(ctor: T, source: IAttributeSource): T & ConstructableAttributeComponent {
    return class CustomAttribute extends ctor implements IAttributeComponent {
      static source: IAttributeSource = source;

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
      private $characteristics: RuntimeCharacteristics = null;
      $isBound = false;
      $scope: IScope = null;

      constructor(...args:any[]) {
        super(...args);
        discoverAndApplyCharacteristics(this, CustomAttribute);

        if (this.$characteristics.hasCreated) {
          (<any>this).created();
        }
      }

      bind(scope: IScope) {
        this.$scope = scope;
        this.$isBound = true;
  
        let changeCallbacks = this.$changeCallbacks;
  
        for (let i = 0, ii = changeCallbacks.length; i < ii; ++i) {
          changeCallbacks[i]();
        }
  
        if (this.$characteristics.hasBound) {
          (<any>this).bound(scope);
        }
      }

      attach(){
        if (this.$characteristics.hasAttaching) {
          (<any>this).attaching();
        }
      
        if (this.$characteristics.hasAttached) {
          TaskQueue.queueMicroTask(() => (<any>this).attached());
        }
      }

      detach() {
        if (this.$characteristics.hasDetaching) {
          (<any>this).detaching();
        }
  
        if (this.$characteristics.hasDetached) {
          TaskQueue.queueMicroTask(() => (<any>this).detached());
        }
      }

      unbind() {
        if (this.$characteristics.hasUnbound) {
          (<any>this).unbound();
        }
  
        this.$isBound = false;
      }
    };
  },
  elementFromCompiledSource<T extends Constructable>(ctor: T, source: ICompiledElementSource): T & ConstructableElementComponent {
    source.shadowOptions = source.shadowOptions || (<any>ctor).shadowOptions || null;
    source.containerless = source.containerless || (<any>ctor).containerless || false;
    
    const template = ViewEngine.templateFromCompiledSource(source);
      
    let CompiledComponent = class extends ctor implements IElementComponent {
      static template: ITemplate = template;
      static source: ICompiledElementSource = source;

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
        overrideContext: BindingContext.createOverride()
      };
      
      private $host: Element;
      private $shadowRoot: Element | ShadowRoot;
      private $changeCallbacks: (() => void)[] = [];
      private $characteristics: RuntimeCharacteristics = null;
  
      constructor(...args:any[]) {
        super(...args);
        discoverAndApplyCharacteristics(this, CompiledComponent);
      }
  
      applyTo(host: Element) { 
        this.$host = source.containerless 
          ? DOM.makeElementIntoAnchor(host, true)
          : host;

        this.$shadowRoot = this.$useShadowDOM 
          ? host.attachShadow(source.shadowOptions) 
          : this.$host;

        this.$view = this.createView(this.$host);
  
        if (this.$characteristics.hasCreated) {
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
  
        if (this.$characteristics.hasBound) {
          (<any>this).bound();
        }
      }
  
      attach() {
        if (this.$characteristics.hasAttaching) {
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
      
        if (this.$characteristics.hasAttached) {
          TaskQueue.queueMicroTask(() => (<any>this).attached());
        }
      }
  
      detach() {
        if (this.$characteristics.hasDetaching) {
          (<any>this).detaching();
        }
  
        this.$view.remove();
  
        let attachable = this.$attachable;
        let i = attachable.length;
  
        while (i--) {
          attachable[i].detach();
        }
  
        if (this.$characteristics.hasDetached) {
          TaskQueue.queueMicroTask(() => (<any>this).detached());
        }
      }
  
      unbind() {
        let bindable = this.$bindable;
        let i = bindable.length;
  
        while (i--) {
          bindable[i].unbind();
        }
  
        if (this.$characteristics.hasUnbound) {
          (<any>this).unbound();
        }
  
        this.$isBound = false;
      }
    }

    //Support Recursive Components by adding self to own view template container.
    CompiledComponent.register(template.container);

    return CompiledComponent;
  }
};

function discoverAndApplyCharacteristics(instance, Component: ConstructableElementComponent | ConstructableAttributeComponent) {
  let characteristics: RuntimeCharacteristics = (<any>Component).characteristics;

  if (characteristics === undefined) {
    characteristics = (<any>Component).characteristics = RuntimeCharacteristics.for(instance, Component);
  }

  let observables = characteristics.observables;
  let observers = {};

  for (let i = 0, ii = observables.length; i < ii; ++i) {
    let observerConfig = observables[i];
    let name = observerConfig.name;
    let changeHandler = observerConfig.changeHandler;

    observers[name] = new Observer(instance[name], v => instance.$isBound ? instance[changeHandler](v) : void 0);
    instance.$changeCallbacks.push(() => instance[changeHandler](instance[name]));

    createGetterSetter(instance, name);
  }

  instance.$characteristics = characteristics;

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
