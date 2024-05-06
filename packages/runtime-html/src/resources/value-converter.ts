import {
  mergeArrays,
  firstDefined,
  resourceBaseName,
  getResourceKeyFor,
  resource,
} from '@aurelia/kernel';
import { aliasRegistration, singletonRegistration } from '../utilities-di';
import { isFunction, isString, objectFreeze } from '../utilities';
import { defineMetadata, getAnnotationKeyFor, getMetadata, hasMetadata } from '../utilities-metadata';

import type {
  Constructable,
  IContainer,
  ResourceDefinition,
  ResourceType,
  PartialResourceDefinition,
  IServiceLocator,
  StaticResourceType,
} from '@aurelia/kernel';
import { ErrorNames, createMappedError } from '../errors';
import { getDefinitionFromStaticAu, type IResourceKind } from './resources-shared';

export type PartialValueConverterDefinition = PartialResourceDefinition;
export type ValueConverterStaticAuDefinition = PartialValueConverterDefinition & {
  type: 'value-converter';
};

export type ValueConverterType<T extends Constructable = Constructable> = ResourceType<T, ValueConverterInstance>;
export type ValueConverterInstance<T extends {} = {}> = {
  signals?: string[];
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
} & T;

export type ValueConverterKind = IResourceKind & {
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never);
  define<T extends Constructable>(name: string, Type: T, decoratorContext?: DecoratorContext): ValueConverterType<T>;
  define<T extends Constructable>(def: PartialValueConverterDefinition, Type: T, decoratorContext?: DecoratorContext): ValueConverterType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialValueConverterDefinition, Type: T, decoratorContext?: DecoratorContext): ValueConverterType<T>;
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T>;
  annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void;
  getAnnotation<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, context: DecoratorContext | null): PartialValueConverterDefinition[K] | undefined;
  find(container: IContainer, name: string): ValueConverterDefinition | null;
  get(container: IServiceLocator, name: string): ValueConverterInstance;
};

export type ValueConverterDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => ValueConverterType<T>;

export function valueConverter(definition: PartialValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(nameOrDef: string | PartialValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDef: string | PartialValueConverterDefinition): ValueConverterDecorator {
  return function <T extends Constructable>(target: T, context: ClassDecoratorContext): ValueConverterType<T> {
    context.addInitializer(function (this) {
      ValueConverter.define(nameOrDef, this as Constructable);
    });
    return target as ValueConverterType<T>;
  };
}

export class ValueConverterDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ValueConverterInstance> {
  private constructor(
    public readonly Type: ValueConverterType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialValueConverterDefinition,
    Type: ValueConverterType<T>,
  ): ValueConverterDefinition<T> {

    let name: string;
    let def: PartialValueConverterDefinition;
    if (isString(nameOrDef)) {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new ValueConverterDefinition(
      Type,
      firstDefined(getConverterAnnotation(Type, 'name'), name),
      mergeArrays(getConverterAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      ValueConverter.keyFrom(name),
    );
  }

  public register(container: IContainer, aliasName?: string): void {
    const $Type = this.Type;
    const key = typeof aliasName === 'string' ? getValueConverterKeyFrom(aliasName) : this.key;
    const aliases = this.aliases;

    if (!container.has(key, false)) {
      container.register(
        container.has($Type, false) ? null : singletonRegistration($Type, $Type),
        aliasRegistration($Type, key),
        ...aliases.map(alias => aliasRegistration($Type, getValueConverterKeyFrom(alias)))
      );
    } /* istanbul ignore next */ else if(__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.value_converter_existed, this.name)}`);
    }
  }
}

/** @internal */ export const converterTypeName = 'value-converter';
const vcBaseName = /*@__PURE__*/getResourceKeyFor(converterTypeName);
const getConverterAnnotation = <K extends keyof PartialValueConverterDefinition>(
  Type: Constructable,
  prop: K,
): PartialValueConverterDefinition[K] | undefined => getMetadata(getAnnotationKeyFor(prop), Type);

const getValueConverterKeyFrom = (name: string): string => `${vcBaseName}:${name}`;

export const ValueConverter = objectFreeze<ValueConverterKind>({
  name: vcBaseName,
  keyFrom: getValueConverterKeyFrom,
  isType<T>(value: T): value is (T extends Constructable ? ValueConverterType<T> : never) {
    return isFunction(value)
      && (hasMetadata(vcBaseName, value) || (value as StaticResourceType).$au?.type === converterTypeName);
  },
  define<T extends Constructable<ValueConverterInstance>>(nameOrDef: string | PartialValueConverterDefinition, Type: T): ValueConverterType<T> {
    const definition = ValueConverterDefinition.create(nameOrDef, Type as Constructable<ValueConverterInstance>);
    const $Type = definition.Type as ValueConverterType<T>;

    // registration of resource name is a requirement for the resource system in kernel (module-loader)
    defineMetadata(definition, $Type, vcBaseName, resourceBaseName);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): ValueConverterDefinition<T> {
    const def = getMetadata<ValueConverterDefinition<T>>(vcBaseName, Type) ?? getDefinitionFromStaticAu<ValueConverterDefinition<T>, ValueConverterType<T>>(Type as ValueConverterType, converterTypeName, ValueConverterDefinition.create);
    if (def === void 0) {
      throw createMappedError(ErrorNames.value_converter_def_not_found, Type);
    }

    return def;
  },
  annotate<K extends keyof PartialValueConverterDefinition>(Type: Constructable, prop: K, value: PartialValueConverterDefinition[K]): void {
    defineMetadata(value, Type, getAnnotationKeyFor(prop));
  },
  getAnnotation: getConverterAnnotation,
  find(container, name) {
    const Type = container.find<ValueConverterType>(converterTypeName, name);
    return Type == null
      ? null
      : getMetadata<ValueConverterDefinition>(vcBaseName, Type) ?? getDefinitionFromStaticAu<ValueConverterDefinition, ValueConverterType>(Type, converterTypeName, ValueConverterDefinition.create) ?? null;
  },
  get(container, name) {
    if (__DEV__) {
      try {
        return container.get<ValueConverterInstance>(resource(getValueConverterKeyFrom(name)));
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error('[DEV:aurelia] Cannot retrieve value converter with name', name);
        throw ex;
      }
    }
    return container.get<ValueConverterInstance>(resource(getValueConverterKeyFrom(name)));
  },
});
