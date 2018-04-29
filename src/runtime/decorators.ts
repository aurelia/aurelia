import { Component, IAttributeSource } from "./templating/component";
import { PLATFORM } from "./platform";
import { DI, IContainer, Registration } from "./di";
import { BindingMode } from "./binding/binding-mode";
import { Constructable, Injectable } from "./interfaces";
import { ICompiledViewSource, IBindableInstruction } from "./templating/instructions";

export function customElement(nameOrSource: string | ICompiledViewSource) {
  return function<T extends Constructable>(target: T) {
    if (typeof nameOrSource === 'string') {
      //TODO Patch in stub for jit components
    } else {
      return Component.elementFromCompiledSource(nameOrSource, target);
    }
  }
}

/**
* Decorator: Indicates that the decorated class is a custom attribute.
* @param name The name of the custom attribute.
* @param defaultBindingMode The default binding mode to use when the attribute is bound with .bind.
* @param aliases The array of aliases to associate to the custom attribute.
*/
export function customAttribute(name: string, defaultBindingMode: BindingMode = BindingMode.oneWay, aliases?: string[]) {
  return function<T extends Constructable>(target: T) {
    return Component.attribute({
      name,
      defaultBindingMode: defaultBindingMode || BindingMode.oneWay,
      aliases,
      isTemplateController: !!(<any>target).isTemplateController
    }, target);
  }
}

export function valueConverter(name: string) {
  return function<T extends Constructable>(target: T) {
    return Component.valueConverter({ name }, target);
  }
}

export function bindingBehavior(name: string) {
  return function<T extends Constructable>(target: T) {
    return Component.bindingBehavior({ name }, target);
  }
}

/**
* Decorator: Applied to custom attributes. Indicates that whatever element the
* attribute is placed on should be converted into a template and that this
* attribute controls the instantiation of the template.
*/
export function templateController(target?) {
  let deco = function<T extends Constructable>(target: T) {
    (<any>target).isTemplateController = true;
    return target;
  }

  return target ? deco(target) : deco;
}

const defaultShadowOptions = { mode: 'open' };

/**
* Decorator: Indicates that the custom element should render its view in Shadow
* DOM. This decorator may change slightly when Aurelia updates to Shadow DOM v1.
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

const capitalMatcher = /([A-Z])/g;

function addHyphenAndLower(char) {
  return '-' + char.toLowerCase();
}

function hyphenate(name) {
  return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
}

/**
* Decorator: Specifies custom behavior for a bindable property.
* @param configOrTarget The overrides.
*/
export function bindable(configOrTarget?: IBindableInstruction | Object, key?, descriptor?): any {
  let deco = function(target, key2, descriptor2) {
    target = target.constructor;
    
    let observables: Record<string, IBindableInstruction> = target.observables || (target.observables = {});
    let config: IBindableInstruction = configOrTarget || {};
    
    if (!config.attribute) {
      config.attribute = hyphenate(key2);
    }

    if (!config.callback) {
      config.callback = `${key2}Changed`;
    }

    if (!config.mode) {
      config.mode = BindingMode.oneWay;
    }

    observables[key2] = config;
  };

  if (key) { //placed on a property without parens
    var target = configOrTarget;
    configOrTarget = null; //ensure that the closure captures the fact that there's actually no config
    return deco(target, key, descriptor);
  }

  return deco;
}

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class.
*/
export function autoinject<T extends Injectable>(potentialTarget?: T): any {
  let deco = function<T extends Injectable>(target: T) {
    let previousInject = target.inject ? target.inject.slice() : null; //make a copy of target.inject to avoid changing parent inject
    let autoInject: any = DI.getDesignParamTypes(target);
    
    if (!previousInject) {
      target.inject = autoInject;
    } else {
      for (let i = 0; i < autoInject.length; i++) {
        //check if previously injected.
        if (previousInject[i] && previousInject[i] !== autoInject[i]) {
          const prevIndex = previousInject.indexOf(autoInject[i]);
          if (prevIndex > -1) {
            previousInject.splice(prevIndex, 1);
          }
          previousInject.splice((prevIndex > -1 && prevIndex < i) ? i - 1 : i, 0, autoInject[i]);
        } else if (!previousInject[i]) {//else add
          previousInject[i] = autoInject[i];
        }
      }

      target.inject = previousInject;
    }
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decoratored class/function.
*/
export function inject(...rest: any[]): any {
  return function<T extends Injectable>(target: T, key?, descriptor?) {
    // handle when used as a parameter
    if (typeof descriptor === 'number' && rest.length === 1) {
      let params = target.inject;

      if (!params) {
        params = DI.getDesignParamTypes(target).slice();
        target.inject = params;
      }

      params[descriptor] = rest[0];
      return;
    }

    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}
