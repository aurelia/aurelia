import { Observer } from "../binding/property-observation";
import { Template, ITemplate, CompiledElementSource } from "./template";
import { IBinding } from "../binding/binding";
import { IAttach } from "./component";
import { IView } from "./view";
import { Scope } from "../binding/binding-interfaces";
import { createOverrideContext } from "../binding/scope";
import { TaskQueue } from "../task-queue";

function setupObservers(instance, config) {
  let observerConfigs = config.observers;
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

function createCustomElement<T extends {new(...args:any[]):{}}>(ctor: T, source: CompiledElementSource) {
  let template = Template.fromCompiledSource(source);
    
  return class extends ctor {
    static template: ITemplate = template;
    static source: CompiledElementSource = source;

    $bindable: IBinding[] = [];
    $attachable: IAttach[] = [];
    private $isBound = false;

    private $view: IView;
    private $host: Element;

    private $changeCallbacks: (() => void)[] = [];
    
    private $scope: Scope = {
      bindingContext: this,
      overrideContext: createOverrideContext()
    };

    constructor(...args:any[]) {
      super(...args);
      setupObservers(this, source);
    }

    applyTo(host: Element) { 
      this.$host = host;
      this.$view = this.createView(host);

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

      this.$view.appendTo(this.$host);
    
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

export function compiledElement(source: CompiledElementSource) {
  return function<T extends {new(...args:any[]):{}}>(target: T) {
    return createCustomElement(target, source);
  }
}
