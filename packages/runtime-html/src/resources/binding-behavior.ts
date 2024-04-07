import { firstDefined, getResourceKeyFor, mergeArrays, resource, resourceBaseName, ResourceType } from '@aurelia/kernel';
import { BindingBehaviorInstance } from '@aurelia/runtime';
import { isFunction, isString, objectFreeze } from '../utilities';
import { aliasRegistration, singletonRegistration } from '../utilities-di';
import { defineMetadata, getAnnotationKeyFor, getOwnMetadata, hasOwnMetadata } from '../utilities-metadata';

import type { Constructable, IContainer, IServiceLocator, PartialResourceDefinition, ResourceDefinition } from '@aurelia/kernel';
import { createMappedError, ErrorNames } from '../errors';
import { type IResourceKind } from './resources-shared';

export type PartialBindingBehaviorDefinition = PartialResourceDefinition;

export type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export type BindingBehaviorKind = IResourceKind & {
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
  find(container: IContainer, name: string): BindingBehaviorDefinition | null;
  get(container: IServiceLocator, name: string): BindingBehaviorInstance;
};

export type BindingBehaviorDecorator = <T extends Constructable>(Type: T) => BindingBehaviorType<T>;

export function bindingBehavior(definition: PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator {
  return function (target) {
    return BindingBehavior.define(nameOrDef, target);
  };
}

export class BindingBehaviorDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingBehaviorInstance> {
  private constructor(
    public readonly Type: BindingBehaviorType<T>,
    public readonly name: string,
    public readonly aliases: readonly string[],
    public readonly key: string,
  ) {}

  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialBindingBehaviorDefinition,
    Type: BindingBehaviorType<T>,
  ): BindingBehaviorDefinition<T> {

    let name: string;
    let def: PartialBindingBehaviorDefinition;
    if (isString(nameOrDef)) {
      name = nameOrDef;
      def = { name };
    } else {
      name = nameOrDef.name;
      def = nameOrDef;
    }

    return new BindingBehaviorDefinition(
      Type,
      firstDefined(getBehaviorAnnotation(Type, 'name'), name),
      mergeArrays(getBehaviorAnnotation(Type, 'aliases'), def.aliases, Type.aliases),
      BindingBehavior.keyFrom(name),
    );
  }

  public register(container: IContainer, aliasName?: string | undefined): void {
    const $Type = this.Type;
    const key = typeof aliasName === 'string' ? getBindingBehaviorKeyFrom(aliasName) : this.key;
    const aliases = this.aliases;

    if (!container.has(key, false)) {
      container.register(
        container.has($Type, false) ? null : singletonRegistration($Type, $Type),
        aliasRegistration($Type, key),
        ...aliases.map(alias => aliasRegistration($Type, getBindingBehaviorKeyFrom(alias))),
      );
    } /* istanbul ignore next */ else if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.binding_behavior_existed, this.name)}`);
    }
  }
}

const bbBaseName = /*@__PURE__*/getResourceKeyFor('binding-behavior');
const getBehaviorAnnotation = <K extends keyof PartialBindingBehaviorDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingBehaviorDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type) as PartialBindingBehaviorDefinition[K];

const getBindingBehaviorKeyFrom = (name: string): string => `${bbBaseName}:${name}`;
export const BindingBehavior = objectFreeze<BindingBehaviorKind>({
  name: bbBaseName,
  keyFrom: getBindingBehaviorKeyFrom,
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never) {
    return isFunction(value) && hasOwnMetadata(bbBaseName, value);
  },
  define<T extends Constructable<BindingBehaviorInstance>>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T> {
    const definition = BindingBehaviorDefinition.create(nameOrDef, Type as Constructable<BindingBehaviorInstance>);
    const $Type = definition.Type as BindingBehaviorType<T>;

    defineMetadata(bbBaseName, definition, $Type);
  // a requirement for the resource system in kernel
    defineMetadata(resourceBaseName, definition, $Type);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T> {
    const def = getOwnMetadata(bbBaseName, Type) as BindingBehaviorDefinition<T>;
    if (def === void 0) {
      throw createMappedError(ErrorNames.binding_behavior_def_not_found, Type);
    }

    return def;
  },
  find(container, name) {
    // const key = getBindingBehaviorKeyFrom(name);
    const Type = container.find('binding-behavior', name);
    return Type == null ? null : getOwnMetadata(bbBaseName, Type) ?? null;
  },
  get(container, name) {
    if (__DEV__) {
      try {
        return container.get<BindingBehaviorInstance>(resource(getBindingBehaviorKeyFrom(name)));
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error('[DEV:aurelia] Cannot retrieve binding behavior with name', name);
        throw ex;
      }
    }
    return container.get<BindingBehaviorInstance>(resource(getBindingBehaviorKeyFrom(name)));
  },
});
