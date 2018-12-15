import { Constructable, PLATFORM } from '../../kernel';
import { BindingMode } from '../binding/binding-mode';
import { BindableSource, IBindableDescription } from '../definitions';

type WithBindables = { bindables: Record<string, IBindableDescription> };
type BindableDecorator = <T extends InstanceType<Constructable & Partial<WithBindables>>>
  (target: T, prop: string) => void;

/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param config The overrides
 */
export function bindable(config?: BindableSource): BindableDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 * @param prop The property name
 */
export function bindable(prop: string): ClassDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 * @param target The class
 * @param prop The property name
 */
export function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string): void;
export function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(configOrTarget?: BindableSource | T, prop?: string): void | BindableDecorator | ClassDecorator {
  let config: IBindableDescription;

  const decorator = function decorate($target: T, $prop: string): void {
    const Type = $target.constructor as Constructable & Partial<WithBindables>;
    let bindables = Type.bindables;
    if (bindables === undefined) {
      bindables = Type.bindables = {};
    }
    if (!config.attribute) {
      config.attribute = PLATFORM.kebabCase($prop);
    }
    if (!config.callback) {
      config.callback = `${$prop}Changed`;
    }
    if (config.mode === undefined) {
      config.mode = BindingMode.toView;
    }
    if (arguments.length > 1) {
      // Non invocation:
      // - @bindable
      // Invocation with or w/o opts:
      // - @bindable()
      // - @bindable({...opts})
      config.property = $prop;
    }
    bindables[config.property] = config;
  };
  if (arguments.length > 1) {
    // Non invocation:
    // - @bindable
    config = {};
    decorator(configOrTarget as T, prop);
    return;
  } else if (typeof configOrTarget === 'string') {
    // ClassDecorator
    // - @bindable('bar')
    // Direct call:
    // - @bindable('bar')(Foo)
    config = {};
    return decorator as BindableDecorator;
  }

  // Invocation with or w/o opts:
  // - @bindable()
  // - @bindable({...opts})
  config = (configOrTarget || {}) as IBindableDescription;
  return decorator as BindableDecorator;
}
