import { Constructable, Omit, PLATFORM } from '@aurelia/kernel';
import { BindingMode } from '../binding/binding-mode';

export type BindableSource = Omit<IBindableDescription, 'property'>;

export interface IBindableDescription {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  property?: string;
}

type WithBindables = { bindables: Record<string, IBindableDescription> };
type BindableDecorator = <T extends InstanceType<Constructable & Partial<WithBindables>>>
  (target: T, prop: string) => void;

/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param configOrTarget The overrides.
 */
export function bindable(config?: BindableSource): BindableDecorator;
export function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string): void;
export function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(configOrTarget?: BindableSource | T): void | BindableDecorator {
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
    if (!config.mode) {
      config.mode = BindingMode.toView;
    }
    config.property = $prop;
    bindables[$prop] = config;
  };
  if (arguments.length > 1) {
    config = {};
    return decorator.apply(null, arguments);
  }

  config = (configOrTarget || {}) as IBindableDescription;
  return decorator as BindableDecorator;
}
