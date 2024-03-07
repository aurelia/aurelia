import { IContainer } from './di';
import { Constructable } from './interfaces';
import { defineMetadata, getOwnMetadata, objectFreeze } from './utilities';

export type ResourceType<
  TUserType extends Constructable = Constructable,
  TResInstance extends {} = {},
  TResType extends {} = {},
  TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>,
> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]) => TResInstance & TUserInstance
) & {
  readonly aliases?: readonly string[];
} & TResType & TUserType;

export type ResourceDefinition<
  TUserType extends Constructable = Constructable,
  TResInstance extends {} = {},
  TDef extends {} = {},
  TResType extends {} = {},
  TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>,
> = {
  /**
   * Unique key to identify the resource.
   */
  readonly key: string;
  /**
   * A common name for the resource.
   */
  readonly name: string;
  readonly Type: ResourceType<TUserType, TResInstance, TResType, TUserInstance>;
  readonly aliases?: readonly string[];

  /**
   * @param aliasName - If provided, the resource will be registered with this alias key.
   */
  register(container: IContainer, aliasName?: string): void;
} & TDef;

export type PartialResourceDefinition<TDef extends {} = {}> = {
  readonly name: string;
  readonly aliases?: readonly string[];
} & TDef;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IResourceKind<TType extends ResourceType, TDef extends ResourceDefinition> {
  readonly name: string;
  keyFrom(name: string): string;
}

const annoBaseName = 'au:annotation';
/** @internal */
export const getAnnotationKeyFor = (name: string, context?: string): string => {
  if (context === void 0) {
    return `${annoBaseName}:${name}`;
  }

  return `${annoBaseName}:${name}:${context}`;
};
/** @internal */
export const appendAnnotation = (target: Constructable, key: string): void => {
  const keys = getOwnMetadata(annoBaseName, target) as string[];
  if (keys === void 0) {
    defineMetadata(annoBaseName, [key], target);
  } else {
    keys.push(key);
  }
};

const annotation = /*@__PURE__*/ objectFreeze({
  name: 'au:annotation',
  appendTo: appendAnnotation,
  set(target: Constructable, prop: string, value: unknown): void {
    defineMetadata(getAnnotationKeyFor(prop), value, target);
  },
  get: (target: Constructable, prop: string): unknown => getOwnMetadata(getAnnotationKeyFor(prop), target),
  getKeys(target: Constructable): readonly string[] {
    let keys = getOwnMetadata(annoBaseName, target) as string[];
    if (keys === void 0) {
      defineMetadata(annoBaseName, keys = [], target);
    }
    return keys;
  },
  isKey: (key: string): boolean  => key.startsWith(annoBaseName),
  keyFor: getAnnotationKeyFor,
});

export const resourceBaseName = 'au:resource';
/**
 * Builds a resource key from the provided parts.
 */
export const getResourceKeyFor = (type: string, name?: string, context?: string): string => {
  if (name == null) {
    return `${resourceBaseName}:${type}`;
  }
  if (context == null) {
    return `${resourceBaseName}:${type}:${name}`;
  }

  return `${resourceBaseName}:${type}:${name}:${context}`;
};

export const Protocol = {
  annotation,
};

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override the definition as well as static properties on the type.
 * 2. Definition properties (usually set by the customElement decorator object literal) come next. They override static properties on the type.
 * 3. Static properties on the type come last. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 4. The default property that is provided last. The function is only called if the default property is needed
 */
export function fromAnnotationOrDefinitionOrTypeOrDefault<
  TDef extends PartialResourceDefinition,
  K extends keyof TDef,
>(
  name: K,
  def: TDef,
  Type: Constructable,
  getDefault: () => Required<TDef>[K],
): Required<TDef>[K] {
  let value = getOwnMetadata(getAnnotationKeyFor(name as string), Type) as TDef[K] | undefined;
  if (value === void 0) {
    value = def[name];
    if (value === void 0) {
      value = (Type as Constructable & TDef)[name] as TDef[K] | undefined;
      if (value === void 0 || !hasOwn.call(Type, name)) { // First just check the value (common case is faster), but do make sure it doesn't come from the proto chain
        return getDefault();
      }
      return value;
    }
    return value;
  }
  return value;
}

/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override static properties on the type.
 * 2. Static properties on the typ. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 3. The default property that is provided last. The function is only called if the default property is needed
 */
export function fromAnnotationOrTypeOrDefault<T, K extends keyof T, V>(
  name: K,
  Type: T,
  getDefault: () => V,
): V {
  let value = getOwnMetadata(getAnnotationKeyFor(name as string), Type) as V;
  if (value === void 0) {
    value = Type[name] as unknown as V;
    if (value === void 0 || !hasOwn.call(Type, name)) { // First just check the value (common case is faster), but do make sure it doesn't come from the proto chain
      return getDefault();
    }
    return value;
  }
  return value;
}

/**
 * The order in which the values are checked:
 * 1. Definition properties.
 * 2. The default property that is provided last. The function is only called if the default property is needed
 */
export function fromDefinitionOrDefault<
  TDef extends PartialResourceDefinition,
  K extends keyof TDef,
>(
  name: K,
  def: TDef,
  getDefault: () => Required<TDef>[K],
): Required<TDef>[K] {
  const value = def[name];
  if (value === void 0) {
    return getDefault();
  }
  return value;
}
