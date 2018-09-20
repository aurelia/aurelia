import { Omit, PLATFORM, Reporter } from '@aurelia/kernel';
import { BindingMode } from '../binding/binding-mode';

export type BindableSource = Omit<IBindableDescription, 'property'>;

export interface IBindableDescription {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  property?: string;
}

/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param configOrTarget The overrides.
 */
export function bindable(configOrTarget?: BindableSource | Object, key?, descriptor?): any {
  let deco = function(target, key2, descriptor2) {
    target = target.constructor;

    let bindables: Record<string, IBindableDescription> = target.bindables || (target.bindables = {});
    let config: IBindableDescription = configOrTarget || {};

    if (!config.attribute) {
      config.attribute = PLATFORM.kebabCase(key2);
    }

    if (!config.callback) {
      config.callback = `${key2}Changed`;
    }

    if (!config.mode) {
      config.mode = BindingMode.toView;
    }

    config.property = key2;
    config.attribute = validateAttributeName(config.attribute);
    bindables[config.attribute] = config;
  };

  if (key) { //placed on a property without parens
    var target = configOrTarget;
    configOrTarget = null; //ensure that the closure captures the fact that there's actually no config
    return deco(target, key, descriptor);
  }

  return deco;
}

function validateAttributeName(attrName: string): string {
  if (/[A-Z]/.test(attrName)) {
    Reporter.error(100, attrName);
    attrName = PLATFORM.kebabCase(attrName);
  }
  return attrName;
}
