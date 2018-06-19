import { Component } from './templating/component';
import { BindingMode } from './binding/binding-mode';
import { Constructable, Omit } from '../kernel/interfaces';
import { ITemplateSource, IBindableInstruction, IAttributeSource, IValueConverterSource, IBindingBehaviorSource } from './templating/instructions';
import { IComputedOverrides } from './binding/computed-observer';

/**
* Decorator: Indicates that the decorated class is a custom element.
*/
export function customElement(nameOrSource: string | ITemplateSource) {
  return function<T extends Constructable>(target: T) {
    return Component.element(nameOrSource, target);
  }
}

/**
* Decorator: Indicates that the decorated class is a custom attribute.
*/
export function customAttribute(nameOrSource: string | IAttributeSource) {
  return function<T extends Constructable>(target: T) {
    return Component.attribute(nameOrSource, target);
  }
}
 
/**
* Decorator: Applied to custom attributes. Indicates that whatever element the
* attribute is placed on should be converted into a template and that this
* attribute controls the instantiation of the template.
*/
export function templateController(nameOrSource: string | Omit<IAttributeSource, 'isTemplateController'>) {
  return function<T extends Constructable>(target: T) {
    let source: IAttributeSource;

    if (typeof nameOrSource === 'string') {
      source = {
        name: nameOrSource,
        isTemplateController: true
      };
    } else {
      source = Object.assign({ isTemplateController: true }, nameOrSource);
    }

    return Component.attribute(source, target);
  }
}

export function valueConverter(nameOrSource: string | IValueConverterSource) {
  return function<T extends Constructable>(target: T) {
    return Component.valueConverter(nameOrSource, target);
  }
}

export function bindingBehavior(nameOrSource: string | IBindingBehaviorSource) {
  return function<T extends Constructable>(target: T) {
    return Component.bindingBehavior(nameOrSource, target);
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

export function computed(config: IComputedOverrides) {
  return function(target, key, descriptor) {
    let computed = target.computed || (target.computed = {});
    computed[key] = config;
  };
}
