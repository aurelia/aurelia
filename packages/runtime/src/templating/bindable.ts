import {
  Constructable,
  kebabCase,
  Reporter,
} from '@aurelia/kernel';
import {
  BindableSource,
  IBindableDescription,
} from '../definitions';
import {
  BindingMode,
} from '../flags';

/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param config - The overrides
 */
export function bindable(config?: BindableSource): BindableDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 * @param prop - The property name
 */
export function bindable(prop: string): ClassDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 * @param target - The class
 * @param prop - The property name
 */
export function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string): void;
export function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(configOrTarget?: BindableSource | T, prop?: string): void | BindableDecorator | ClassDecorator {
  let config: IBindableDescription;

  const decorator = function decorate($target: T, $prop: string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @bindable
      // Invocation with or w/o opts:
      // - @bindable()
      // - @bindable({...opts})
      config.property = $prop;
    }
    Bindable.for($target.constructor as Partial<WithBindables>).add(config);
  };
  if (arguments.length > 1) {
    // Non invocation:
    // - @bindable
    config = {};
    decorator(configOrTarget as T, prop!);
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

interface IFluentBindableBuilder {
  add(config: IBindableDescription): IFluentBindableBuilder;
  add(propertyName: string): IFluentBindableBuilder;
  get(): Record<string, IBindableDescription>;
}

export const Bindable = {
  for<T extends Partial<WithBindables>>(obj: T): IFluentBindableBuilder {
    const builder: IFluentBindableBuilder = {
      add(nameOrConfig: string | IBindableDescription): typeof builder {
        let description: IBindableDescription = (void 0)!;
        if (nameOrConfig instanceof Object) {
          description = nameOrConfig;
        } else if (typeof nameOrConfig === 'string') {
          description = {
            property: nameOrConfig
          };
        }
        const prop = description.property;
        if (!prop) {
          throw Reporter.error(0); // TODO: create error code (must provide a property name)
        }
        if (!description.attribute) {
          description.attribute = kebabCase(prop);
        }
        if (!description.callback) {
          description.callback = `${prop}Changed`;
        }
        if (description.mode === undefined) {
          description.mode = BindingMode.toView;
        }
        (obj.bindables as Record<string, IBindableDescription>)[prop] = description;
        return this;
      },
      get(): Record<string, IBindableDescription> {
        return obj.bindables as Record<string, IBindableDescription>;
      }
    };
    if (obj.bindables === undefined) {
      obj.bindables = {};
    } else if (Array.isArray(obj.bindables)) {
      const props = obj.bindables;
      obj.bindables = {};
      props.forEach(builder.add);
    }
    return builder;
  }
};

export type WithBindables = { bindables: Record<string, IBindableDescription> | string[] };
export type BindableDecorator = <T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string) => void;
