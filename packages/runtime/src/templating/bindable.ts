/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Constructable,
  kebabCase,
  Metadata,
  Protocol,
} from '@aurelia/kernel';
import {
  firstDefined,
} from '../definitions';
import {
  BindingMode,
} from '../flags';

export type PartialBindableDefinition = {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  property?: string;
  primary?: boolean;
};

/**
 * Decorator: Specifies custom behavior for a bindable property.
 *
 * @param config - The overrides
 */
export function bindable(config?: PartialBindableDefinition): (target: {}, prop: symbol | string) => PropertyDecorator | ClassDecorator;
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
export function bindable(target: {}, prop: string): void;
export function bindable(configOrTarget?: PartialBindableDefinition | {}, prop?: string): void | PropertyDecorator | ClassDecorator {
  let config: PartialBindableDefinition;

  function decorator($target: {}, $prop: symbol | string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @bindable
      // Invocation with or w/o opts:
      // - @bindable()
      // - @bindable({...opts})
      config.property = $prop as string;
    }

    Metadata.define(Bindable.name, BindableDefinition.create($prop as string, config), $target, $prop);
    Protocol.annotation.appendTo($target.constructor as Constructable, Bindable.keyFrom($prop as string));
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @bindable
    config = {};
    decorator(configOrTarget!, prop!);
    return;
  } else if (typeof configOrTarget === 'string') {
    // ClassDecorator
    // - @bindable('bar')
    // Direct call:
    // - @bindable('bar')(Foo)
    config = {};
    return decorator;
  }

  // Invocation with or w/o opts:
  // - @bindable()
  // - @bindable({...opts})
  config = configOrTarget === void 0 ? {} : configOrTarget;
  return decorator;
}

function isBindableAnnotation(key: string): boolean {
  return key.startsWith(Bindable.name);
}

export const Bindable = {
  name: Protocol.annotation.keyFor('bindable'),
  keyFrom(name: string): string {
    return `${Bindable.name}:${name}`;
  },
  from(...bindableLists: readonly (BindableDefinition | Record<string, PartialBindableDefinition> | readonly string[] | undefined)[]): Record<string, BindableDefinition> {
    const bindables: Record<string, BindableDefinition> = {};

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const isArray = Array.isArray as <T>(arg: unknown) => arg is readonly T[];

    function addName(name: string): void {
      bindables[name] = BindableDefinition.create(name);
    }

    function addDescription(name: string, def: PartialBindableDefinition): void {
      bindables[name] = BindableDefinition.create(name, def);
    }

    function addList(maybeList: BindableDefinition | Record<string, PartialBindableDefinition> | readonly string[] | undefined): void {
      if (isArray(maybeList)) {
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

export class BindableDefinition {
  private constructor(
    public readonly attribute: string,
    public readonly callback: string,
    public readonly mode: BindingMode,
    public readonly primary: boolean,
    public readonly property: string,
  ) {}

  public static create(prop: string, def: PartialBindableDefinition = {}): BindableDefinition {
    return new BindableDefinition(
      firstDefined(def.attribute, kebabCase(prop)),
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.mode, BindingMode.toView),
      firstDefined(def.primary, false),
      firstDefined(def.property, prop),
    );
  }
}
