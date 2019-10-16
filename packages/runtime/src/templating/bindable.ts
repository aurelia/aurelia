/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Constructable,
  kebabCase,
  Metadata,
  Protocol,
} from '@aurelia/kernel';
import {
  BindableSource,
  IBindableDescription,
  firstDefined,
} from '../definitions';
import {
  BindingMode,
} from '../flags';

/**
 * Decorator: Specifies custom behavior for a bindable property.
 *
 * @param config - The overrides
 */
export function bindable(config?: BindableSource): BindableDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param prop - The property name
 */
export function bindable(prop: string): ClassDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 *
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

    Metadata.define(Bindable.name, BindableDefinition.create($prop, config), $target, $prop);
    Protocol.annotation.appendTo($target.constructor as Constructable, Bindable.keyFrom($prop));
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

function isBindableAnnotation(key: string): boolean {
  return key.startsWith(Bindable.name);
}

export const Bindable = {
  name: Protocol.annotation.keyFor('bindable'),
  keyFrom(name: string): string {
    return `${Bindable.name}:${name}`;
  },
  from(...bindableLists: readonly (BindableDefinition | Record<string, IBindableDescription> | readonly string[] | undefined)[]): Record<string, IBindableDescription> {
    const bindables: Record<string, IBindableDescription> = {};

    function addName(name: string): void {
      bindables[name] = {
        property: name,
        attribute: kebabCase(name),
        callback: `${name}Changed`,
        mode: BindingMode.toView,
        primary: false,
      };
    }

    function addDescription(name: string, def: IBindableDescription): void {
      bindables[name] = BindableDefinition.create(name, def);
    }

    function addList(maybeList: BindableDefinition | Record<string, IBindableDescription> | string[] | undefined): void {
      if (Array.isArray(maybeList)) {
        maybeList.forEach(addName);
      } else if (maybeList instanceof BindableDefinition) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
      } else if (maybeList !== void 0) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
      }
    }

    bindableLists.forEach(addList);

    return bindables;
  },
  getAll(Type: Constructable): readonly BindableDefinition[] {
    const propStart = Bindable.name.length + 1;
    const keys = Protocol.annotation.getKeys(Type).filter(isBindableAnnotation);
    const len = keys.length;
    const defs: BindableDefinition[] = Array(len);
    for (let i = 0; i < len; ++i) {
      defs[i] = Metadata.getOwn(Bindable.name, Type, keys[i].slice(propStart));
    }
    return defs;
  },
};

export type WithBindables = { bindables: Record<string, IBindableDescription> | string[] };
export type BindableDecorator = <T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string) => void;

export class BindableDefinition {
  private constructor(
    public readonly attribute: string,
    public readonly callback: string,
    public readonly mode: BindingMode,
    public readonly primary: boolean,
    public readonly property: string,
  ) {}

  public static create(prop: string, def: IBindableDescription = {}): BindableDefinition {
    return new BindableDefinition(
      firstDefined(def.attribute, kebabCase(prop)),
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.mode, BindingMode.toView),
      firstDefined(def.primary, false),
      firstDefined(def.property, prop),
    );
  }
}
