import { kebabCase, firstDefined, getPrototypeChain, noop, Class } from '@aurelia/kernel';
import { BindingMode, ICoercionConfiguration } from '@aurelia/runtime';
import { appendAnnotationKey, defineMetadata, getAllAnnotations, getAnnotationKeyFor, getOwnMetadata, hasOwnMetadata } from './shared.js';
import { isString } from './utilities.js';

import type { Constructable, Writable } from '@aurelia/kernel';
import type { InterceptorFunc } from '@aurelia/runtime';

type PropertyType = typeof Number | typeof String | typeof Boolean | typeof BigInt | { coercer: InterceptorFunc } | Class<unknown>;

export type PartialBindableDefinition = {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  property?: string;
  primary?: boolean;
  set?: InterceptorFunc;
  type?: PropertyType;

  /**
   * When set to `false` and automatic type-coercion is enabled, `null` and `undefined` will be coerced into target type.
   *
   * @default true
   */
  nullable?: boolean;
};

type PartialBindableDefinitionPropertyRequired = PartialBindableDefinition & {
  property: string;
};

type PartialBindableDefinitionPropertyOmitted = Omit<PartialBindableDefinition, 'property'>;

/**
 * Decorator: Specifies custom behavior for a bindable property.
 *
 * @param config - The overrides
 */
export function bindable(config?: PartialBindableDefinitionPropertyOmitted): (target: {}, property: string) => void;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param prop - The property name
 */
export function bindable(prop: string): (target: Constructable) => void;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param target - The class
 * @param prop - The property name
 */
export function bindable(target: {}, prop: string): void;
export function bindable(configOrTarget?: PartialBindableDefinition | {}, prop?: string): void | ((target: {}, property: string) => void) | ((target: Constructable) => void) {
  let config: PartialBindableDefinition;

  function decorator($target: {}, $prop: string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @bindable
      // Invocation with or w/o opts:
      // - @bindable()
      // - @bindable({...opts})
      config.property = $prop;
    }

    defineMetadata(baseName, BindableDefinition.create($prop, $target as Constructable, config), $target.constructor, $prop);
    appendAnnotationKey($target.constructor as Constructable, Bindable.keyFrom($prop));
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @bindable
    config = {};
    decorator(configOrTarget!, prop!);
    return;
  } else if (isString(configOrTarget)) {
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
  return key.startsWith(baseName);
}

type BFluent = {
  add(config: PartialBindableDefinitionPropertyRequired): BFluent;
  add(property: string): BFluent & B12345;
};

type B1<T = {}> = {
  mode(mode: BindingMode): BFluent & T;
};

type B2<T = {}> = {
  callback(callback: string): BFluent & T;
};

type B3<T = {}> = {
  attribute(attribute: string): BFluent & T;
};

type B4<T = {}> = {
  primary(): BFluent & T;
};

type B5<T = {}> = {
  set(setterFn: InterceptorFunc): BFluent & T;
};

// An important self-imposed limitation for this to be viable (e.g. avoid exponential combination growth),
// is to keep the fluent API invocation order in a single direction.
type B45 = B5 & B4<B5>;
type B345 = B45 & B3<B45>;
type B2345 = B345 & B2<B345>;
type B12345 = B2345 & B1<B2345>;

const baseName = getAnnotationKeyFor('bindable');

export const Bindable = Object.freeze({
  name: baseName,
  keyFrom: (name: string): string => `${baseName}:${name}`,
  from(type: Constructable, ...bindableLists: readonly (BindableDefinition | Record<string, PartialBindableDefinition> | readonly string[] | undefined)[]): Record<string, BindableDefinition> {
    const bindables: Record<string, BindableDefinition> = {};

    const isArray = Array.isArray as <T>(arg: unknown) => arg is readonly T[];

    function addName(name: string): void {
      bindables[name] = BindableDefinition.create(name, type);
    }

    function addDescription(name: string, def: PartialBindableDefinition): void {
      bindables[name] = def instanceof BindableDefinition ? def : BindableDefinition.create(name, type, def);
    }

    function addList(maybeList: BindableDefinition | Record<string, PartialBindableDefinition> | readonly string[] | undefined): void {
      if (isArray(maybeList)) {
        maybeList.forEach(addName);
      } else if (maybeList instanceof BindableDefinition) {
        bindables[maybeList.property] = maybeList;
      } else if (maybeList !== void 0) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList[name]));
      }
    }

    bindableLists.forEach(addList);

    return bindables;
  },
  for(Type: Constructable): BFluent {
    let def: Writable<BindableDefinition>;

    const builder: BFluent & B12345 = {
      add(configOrProp: string | PartialBindableDefinitionPropertyRequired): BFluent & B12345 {
        let prop: string;
        let config: PartialBindableDefinitionPropertyRequired;
        if (isString(configOrProp)) {
          prop = configOrProp;
          config = { property: prop };
        } else {
          prop = configOrProp.property;
          config = configOrProp;
        }

        def = BindableDefinition.create(prop, Type, config) as Writable<BindableDefinition>;
        if (!hasOwnMetadata(baseName, Type, prop)) {
          appendAnnotationKey(Type, Bindable.keyFrom(prop));
        }
        defineMetadata(baseName, def, Type, prop);

        return builder;
      },
      mode(mode: BindingMode): BFluent & B12345 {
        def.mode = mode;

        return builder;
      },
      callback(callback: string): BFluent & B12345 {
        def.callback = callback;

        return builder;
      },
      attribute(attribute: string): BFluent & B12345 {
        def.attribute = attribute;

        return builder;
      },
      primary(): BFluent & B12345 {
        def.primary = true;

        return builder;
      },
      set(setInterpreter: InterceptorFunc): BFluent & B12345 {
        def.set = setInterpreter;

        return builder;
      }
    };

    return builder;
  },
  getAll(Type: Constructable): readonly BindableDefinition[] {
    const propStart = baseName.length + 1;
    const defs: BindableDefinition[] = [];
    const prototypeChain = getPrototypeChain(Type);

    let iProto = prototypeChain.length;
    let iDefs = 0;
    let keys: string[];
    let keysLen: number;
    let Class: Constructable;
    let i: number;
    while (--iProto >= 0) {
      Class = prototypeChain[iProto];
      keys = getAllAnnotations(Class).filter(isBindableAnnotation);
      keysLen = keys.length;
      for (i = 0; i < keysLen; ++i) {
        defs[iDefs++] = getOwnMetadata(baseName, Class, keys[i].slice(propStart)) as BindableDefinition;
      }
    }
    return defs;
  },
});

export class BindableDefinition {
  private constructor(
    public readonly attribute: string,
    public readonly callback: string,
    public readonly mode: BindingMode,
    public readonly primary: boolean,
    public readonly property: string,
    public readonly set: InterceptorFunc,
  ) { }

  public static create(prop: string, target: Constructable<unknown>, def: PartialBindableDefinition = {}): BindableDefinition {
    return new BindableDefinition(
      firstDefined(def.attribute, kebabCase(prop)),
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.mode, BindingMode.toView),
      firstDefined(def.primary, false),
      firstDefined(def.property, prop),
      firstDefined(def.set, getInterceptor(prop, target, def)),
    );
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars,spaced-comment */
/**
 * This function serves two purposes:
 * - A playground for contributors to try their changes to the APIs.
 * - Cause the API surface to be properly type-checked and protected against accidental type regressions.
 *
 * It will be automatically removed by dead code elimination.
 */
function apiTypeCheck() {

  @bindable('prop')
  // > expected error - class decorator only accepts a string
  //@bindable({})
  class Foo {
    @bindable
    @bindable()
    @bindable({})
    // > expected error - 'property' does not exist on decorator input object
    //@bindable({ property: 'prop' })
    @bindable({ mode: BindingMode.twoWay })
    @bindable({ callback: 'propChanged' })
    @bindable({ attribute: 'prop' })
    @bindable({ primary: true })
    @bindable({ set: value => String(value) })
    @bindable({ set: value => Number(value) })
    @bindable({
      mode: BindingMode.twoWay,
      callback: 'propChanged',
      attribute: 'prop',
      primary: true,
      set: value => String(value)
    })
    public prop: unknown;
  }

  Bindable.for(Foo)
    // > expected error - there is no add() function with only optional params on the fluent api
    //.add()
    // > expected error - 'property' is a required property on the fluent api
    //.add({})
    .add({ property: 'prop' })
    .add({ property: 'prop', mode: BindingMode.twoWay })
    .add({ property: 'prop', callback: 'propChanged' })
    .add({ property: 'prop', attribute: 'prop' })
    .add({ property: 'prop', primary: true })
    .add({ property: 'prop', mode: BindingMode.twoWay, callback: 'propChanged', attribute: 'prop', primary: true })
    .add('prop')
    // > expected error - the add() method that accepts an object literal does not return a fluent api
    //.add({ property: 'prop' }).mode(BindingMode.twoWay)
    //.add({ property: 'prop' }).callback('propChanged')
    //.add({ property: 'prop' }).attribute('prop')
    //.add({ property: 'prop' }).primary()
    // > expected error - fluent api methods can only be invoked once per bindable
    //.add('prop').mode(BindingMode.twoWay).mode(BindingMode.twoWay)
    //.add('prop').mode(BindingMode.twoWay).callback('propChanged').mode(BindingMode.twoWay)
    //.add('prop').mode(BindingMode.twoWay).callback('propChanged').callback('propChanged') // etc
    // > expected error - wrong invocation order
    //.add('prop').callback('propChanged').mode(BindingMode.twoWay)
    //.add('prop').primary().mode(BindingMode.twoWay)  // etc
    .add('prop').mode(BindingMode.twoWay)
    .add('prop').mode(BindingMode.twoWay).callback('propChanged')
    .add('prop').mode(BindingMode.twoWay).callback('propChanged').attribute('prop')
    .add('prop').mode(BindingMode.twoWay).callback('propChanged').attribute('prop').primary()
    .add('prop').mode(BindingMode.twoWay).set((value: unknown) => Number(value))
    .add('prop').mode(BindingMode.twoWay).callback('propChanged').set(value => Number(value))
    .add('prop').callback('propChanged')
    .add('prop').callback('propChanged').attribute('prop')
    .add('prop').callback('propChanged').attribute('prop').primary()
    .add('prop').attribute('prop')
    .add('prop').attribute('prop').primary()
    .add('prop').primary();
}
/* eslint-enable @typescript-eslint/no-unused-vars,spaced-comment */

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Reflect {
  function getMetadata(metadataKey: any, target: any, propertyKey?: string | symbol): any;
}

export function coercer(target: Constructable<unknown>, property: string, _descriptor: PropertyDescriptor): void {
  Coercer.define(target, property);
}

const Coercer = {
  key: getAnnotationKeyFor('coercer'),
  define(target: Constructable<unknown>, property: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    defineMetadata(Coercer.key, ((target as any)[property] as InterceptorFunc).bind(target), target);
  },
  for(target: Constructable<unknown>) {
    return getOwnMetadata(Coercer.key, target) as InterceptorFunc;
  }
};

function getInterceptor(prop: string, target: Constructable<unknown>, def: PartialBindableDefinition = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const type: PropertyType | null = def.type ?? Reflect.getMetadata('design:type', target, prop) ?? null;
  if (type == null) { return noop; }
  let coercer: InterceptorFunc;
  switch (type) {
    case Number:
    case Boolean:
    case String:
    case BigInt:
      coercer = type as InterceptorFunc;
      break;
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const $coercer: InterceptorFunc = (type as any).coerce as InterceptorFunc;
      coercer = typeof $coercer === 'function'
        ? $coercer.bind(type)
        : (Coercer.for(type as Constructable) ?? noop);
      break;
    }
  }
  return coercer === noop
    ? coercer
    : createCoercer(coercer, def.nullable);
}

function createCoercer<TInput, TOutput>(coercer: InterceptorFunc<TInput, TOutput>, nullable: boolean | undefined): InterceptorFunc<TInput, TOutput> {
  return function (value: TInput, coercionConfiguration: ICoercionConfiguration | null): TOutput {
    if (!coercionConfiguration?.enableCoercion) return value as unknown as TOutput;
    return ((nullable ?? ((coercionConfiguration?.coerceNullish ?? false) ? false : true)) && value == null)
      ? value as unknown as TOutput
      : coercer(value, coercionConfiguration);
  };
}
