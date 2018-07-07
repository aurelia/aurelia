import { BindingMode } from '../binding/binding-mode';
import { Omit } from '../../kernel/interfaces';
import { IBindableInstruction } from './instructions';

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
export function bindable(configOrTarget?: Omit<IBindableInstruction, 'property'> | Object, key?, descriptor?): any {
  let deco = function(target, key2, descriptor2) {
    target = target.constructor;
    
    let bindables: Record<string, IBindableInstruction> = target.bindables || (target.bindables = {});
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

    config.property = key2;
    bindables[key2] = config;
  };

  if (key) { //placed on a property without parens
    var target = configOrTarget;
    configOrTarget = null; //ensure that the closure captures the fact that there's actually no config
    return deco(target, key, descriptor);
  }

  return deco;
}
