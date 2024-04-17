import { firstDefined, getResourceKeyFor, mergeArrays, resource, resourceBaseName, ResourceType } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { isFunction, isString, objectFreeze } from '../utilities';
import { aliasRegistration, singletonRegistration } from '../utilities-di';
import { defineMetadata, getAnnotationKeyFor, getMetadata, hasMetadata } from '../utilities-metadata';

import type { Constructable, IContainer, IServiceLocator, PartialResourceDefinition, ResourceDefinition, StaticResourceType } from '@aurelia/kernel';
import { createMappedError, ErrorNames } from '../errors';
import { getDefinitionFromStaticAu, type IResourceKind } from './resources-shared';
import { IBinding } from '../binding/interfaces-bindings';

export type PartialBindingBehaviorDefinition = PartialResourceDefinition;
export type BindingBehaviorStaticAuDefinition = PartialBindingBehaviorDefinition & {
  type: 'binding-behavior';
};

export type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;

export type BindingBehaviorInstance<T extends {} = {}> = {
  type?: 'instance' | 'factory';
  bind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
  unbind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
} & T;

export type BindingBehaviorKind = IResourceKind & {
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
  define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
  find(container: IContainer, name: string): BindingBehaviorDefinition | null;
  get(container: IServiceLocator, name: string): BindingBehaviorInstance;
};

export type BindingBehaviorDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => BindingBehaviorType<T>;

export function bindingBehavior(definition: PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(name: string): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator {
  return function <T extends Constructable>(target: T, context: ClassDecoratorContext): BindingBehaviorType<T>  {
    context.addInitializer(function (this) {
      BindingBehavior.define(nameOrDef, this as Constructable);
    });
    return target as BindingBehaviorType<T>;
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

/** @internal */ export const behaviorTypeName = 'binding-behavior';
const bbBaseName = /*@__PURE__*/getResourceKeyFor(behaviorTypeName);
const getBehaviorAnnotation = <K extends keyof PartialBindingBehaviorDefinition>(
  Type: Constructable,
  prop: K,
): PartialBindingBehaviorDefinition[K] | undefined => getMetadata(getAnnotationKeyFor(prop), Type);

const getBindingBehaviorKeyFrom = (name: string): string => `${bbBaseName}:${name}`;

export const BindingBehavior = objectFreeze<BindingBehaviorKind>({
  name: bbBaseName,
  keyFrom: getBindingBehaviorKeyFrom,
  isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never) {
    return isFunction(value) && (hasMetadata(bbBaseName, value) || (value as StaticResourceType).$au?.type === behaviorTypeName);
  },
  define<T extends Constructable<BindingBehaviorInstance>>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T> {
    const definition = BindingBehaviorDefinition.create(nameOrDef, Type as Constructable<BindingBehaviorInstance>);
    const $Type = definition.Type as BindingBehaviorType<T>;

    // registration of resource name is a requirement for the resource system in kernel (module-loader)
    defineMetadata(definition, $Type, bbBaseName, resourceBaseName);

    return $Type;
  },
  getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T> {
    const def: BindingBehaviorDefinition<T> = getMetadata<BindingBehaviorDefinition<T>>(bbBaseName, Type)
      ?? getDefinitionFromStaticAu(Type as BindingBehaviorType<T>, behaviorTypeName, BindingBehaviorDefinition.create);
    if (def === void 0) {
      throw createMappedError(ErrorNames.binding_behavior_def_not_found, Type);
    }

    return def;
  },
  find(container, name) {
    const Type = container.find<BindingBehaviorType>(behaviorTypeName, name);
    return Type == null
      ? null
      : getMetadata<BindingBehaviorDefinition>(bbBaseName, Type) ?? getDefinitionFromStaticAu<BindingBehaviorDefinition>(Type, behaviorTypeName, BindingBehaviorDefinition.create) ?? null;
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
