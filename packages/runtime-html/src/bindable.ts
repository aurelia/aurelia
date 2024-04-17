import { kebabCase, getPrototypeChain, noop, Class } from '@aurelia/kernel';
import { ICoercionConfiguration } from '@aurelia/runtime';
import { toView, type BindingMode, twoWay } from './binding/interfaces-bindings';
import { defineMetadata, getAnnotationKeyFor, getMetadata } from './utilities-metadata';
import { createLookup, isString, objectFreeze, objectKeys } from './utilities';

import type { Constructable } from '@aurelia/kernel';
import type { InterceptorFunc } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from './errors';

type PropertyType = typeof Number | typeof String | typeof Boolean | typeof BigInt | { coercer: InterceptorFunc } | Class<unknown>;

export type PartialBindableDefinition = {
  mode?: BindingMode;
  callback?: string;
  attribute?: string;
  name?: string;
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

type PartialBindableDefinitionPropertyOmitted = Omit<PartialBindableDefinition, 'name'>;

/**
 * Decorator: Specifies custom behavior for a bindable property.
 * This can be either be a property decorator or a class decorator.
 *
 * @param config - The overrides
 */
export function bindable(config?: PartialBindableDefinitionPropertyOmitted): (target: unknown, context: ClassDecoratorContext | ClassFieldDecoratorContext | ClassGetterDecoratorContext) => void;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param prop - The property name
 */
export function bindable(prop: string): (target: Constructable, context: ClassDecoratorContext) => void;
// Note: there is a invisible separator character the precedes the `@` in the jsdoc example. Otherwise the eslint rule will complain.
// Refer:
// - https://stackoverflow.com/a/55214510/2270340
// - https://unicode-explorer.com/c/2063
/**
 * Decorator: Specifies a bindable property on a class property.
 *
 * @example
 * ```ts
 * class Foo {
 *   ⁣@bindable bar: string;
 * }
 * ```
 */
export function bindable(_: undefined, context: ClassFieldDecoratorContext): void;
// eslint-disable-next-line @typescript-eslint/ban-types
export function bindable(_: Function, context: ClassGetterDecoratorContext): void;
export function bindable(
  configOrPropOrTarget: PartialBindableDefinition | string | Constructable | undefined,
  context?: ClassDecoratorContext | ClassFieldDecoratorContext | ClassGetterDecoratorContext
):
  | void
  | ((target: Constructable, context: ClassDecoratorContext) => void)
  | ((target: undefined, context: ClassFieldDecoratorContext) => void)
  // eslint-disable-next-line @typescript-eslint/ban-types
  | ((target: Function, context: ClassGetterDecoratorContext) => void) {

  let configOrProp: PartialBindableDefinition | string | undefined = void 0;
  function decorator(_target: unknown, context: ClassDecoratorContext | ClassFieldDecoratorContext | ClassGetterDecoratorContext): void {
    let $prop: string;

    switch (context.kind) {
      case 'getter':
      case 'field': {
        const prop = context.name;
        // We are not supporting a bindable that uses a symbol for name.
        // Maybe we can later have a binding command like foo.sym="bar" that creates bindable instruction for `Symbol.for('sym')`, as target property.
        if (typeof prop !== 'string') throw createMappedError(ErrorNames.invalid_bindable_decorator_usage_symbol);
        $prop = prop;
        break;
      }
      case 'class':
        if (configOrProp == null) throw createMappedError(ErrorNames.invalid_bindable_decorator_usage_class_without_configuration);
        if (typeof configOrProp == 'string') {
          $prop = configOrProp;
        } else {
          const prop = configOrProp.name;
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!prop) throw createMappedError(ErrorNames.invalid_bindable_decorator_usage_class_without_property_name_configuration);
          if (typeof prop !== 'string') throw createMappedError(ErrorNames.invalid_bindable_decorator_usage_symbol);
          $prop = prop;
        }
        break;
    }

    const config = configOrProp == null || typeof configOrProp === 'string'
      ? { name: $prop }
      : configOrProp;

    const metadata = (context.metadata[baseName] ??= createLookup()) as Record<string, BindableDefinition>;
    metadata[$prop] = BindableDefinition.create($prop, config);
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @bindable
    configOrProp = {};
    decorator(configOrPropOrTarget as Constructable | undefined, context!);
    return;
  } else if (isString(configOrPropOrTarget)) {
    // ClassDecorator
    // - @bindable('bar')
    // Direct call:
    // - @bindable('bar')(Foo)
    configOrProp = configOrPropOrTarget;
    return decorator;
  }

  // Invocation with or w/o opts:
  // - @bindable()
  // - @bindable({...opts})
  configOrProp = configOrPropOrTarget === void 0 ? {} : configOrPropOrTarget as string | PartialBindableDefinition;
  return decorator;
}

const baseName = /*@__PURE__*/getAnnotationKeyFor('bindables');

export const Bindable = objectFreeze({
  name: baseName,
  keyFrom: (name: string): string => `${baseName}:${name}`,
  from(...bindableLists: readonly (BindableDefinition | Record<string, Exclude<PartialBindableDefinition, 'name'> | true> | readonly (string | PartialBindableDefinition & { name: string })[] | undefined)[]): Record<string, BindableDefinition> {
    const bindables: Record<string, BindableDefinition> = {};

    const isArray = Array.isArray as <T>(arg: unknown) => arg is readonly T[];

    function addName(name: string): void {
      bindables[name] = BindableDefinition.create(name);
    }

    function addDescription(name: string, def: Exclude<PartialBindableDefinition, 'name'> | true): void {
      bindables[name] = def instanceof BindableDefinition ? def : BindableDefinition.create(name, def === true ? { } : def);
    }

    function addList(maybeList: BindableDefinition | Record<string, Exclude<PartialBindableDefinition, 'name'> | true> | readonly (string | PartialBindableDefinition & { name: string })[] | undefined): void {
      if (isArray(maybeList)) {
        maybeList.forEach(nameOrDef => isString(nameOrDef) ? addName(nameOrDef) : addDescription(nameOrDef.name, nameOrDef));
      } else if (maybeList instanceof BindableDefinition) {
        bindables[maybeList.name] = maybeList;
      } else if (maybeList !== void 0) {
        objectKeys(maybeList).forEach(name => addDescription(name, maybeList[name]));
      }
    }

    bindableLists.forEach(addList);

    return bindables;
  },
  getAll(Type: Constructable): readonly BindableDefinition[] {
    const defs: BindableDefinition[] = [];
    const prototypeChain = getPrototypeChain(Type);

    let iProto = prototypeChain.length;
    let Class: Constructable;
    while (--iProto >= 0) {
      Class = prototypeChain[iProto];
      const bindableMetadata = getMetadata<Record<PropertyKey, BindableDefinition>>(baseName, Class);
      if (bindableMetadata == null) continue;
      defs.push(...Object.values<BindableDefinition>(bindableMetadata));
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
    public readonly name: string,
    public readonly set: InterceptorFunc,
  ) { }

  public static create(prop: string, def: PartialBindableDefinition = {}): BindableDefinition {
    return new BindableDefinition(
      def.attribute ?? kebabCase(prop),
      def.callback ?? `${prop}Changed`,
      def.mode ?? toView,
      def.primary ?? false,
      def.name ?? prop,
      def.set ?? getInterceptor(def),
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
    @bindable({ mode: twoWay })
    @bindable({ callback: 'propChanged' })
    @bindable({ attribute: 'prop' })
    @bindable({ primary: true })
    @bindable({ set: value => String(value) })
    @bindable({ set: value => Number(value) })
    @bindable({
      mode: twoWay,
      callback: 'propChanged',
      attribute: 'prop',
      primary: true,
      set: value => String(value)
    })
    public prop: unknown;
  }
}

type CoercerFunction<This extends Constructable> = (this: This, value: unknown) => InstanceType<This>;
export function coercer<
  This extends Constructable,
  TCoercer extends CoercerFunction<This>
>(
  target: TCoercer,
  context: ClassMethodDecoratorContext<This, TCoercer>
): void {
  context.addInitializer(function (this: This) {
    Coercer.define(this, context.name);
  });
}

const Coercer = {
  key: /*@__PURE__*/getAnnotationKeyFor('coercer'),
  define(target: Constructable<unknown>, property: string | symbol) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    defineMetadata(((target as any)[property] as InterceptorFunc).bind(target), target, Coercer.key);
  },
  for(target: Constructable<unknown>) {
    return getMetadata<InterceptorFunc>(Coercer.key, target);
  }
};

function getInterceptor(def: PartialBindableDefinition = {}) {
  // TS5.x does not emit design:type metadata any longer for the new TC39 decorator proposal implementation.
  // Hence, we needs to be solely reliant on the user-provided type in the bindable definition.
  const type: PropertyType | null = def.type ?? null;
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
  return function (value: TInput, coercionConfiguration?: ICoercionConfiguration): TOutput {
    if (!coercionConfiguration?.enableCoercion) return value as unknown as TOutput;
    return ((nullable ?? ((coercionConfiguration?.coerceNullish ?? false) ? false : true)) && value == null)
      ? value as unknown as TOutput
      : coercer(value, coercionConfiguration);
  };
}
