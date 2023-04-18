import { IContainer } from './di';
import { Constructable } from './interfaces';
import { emptyArray } from './platform';
import { defineMetadata, hasOwnMetadata, getOwnMetadata } from './utilities';

export type ResourceType<
  TUserType extends Constructable = Constructable,
  TResInstance extends {} = {},
  TResType extends {} = {},
  TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>,
> = (
  new (...args: unknown[]) => TResInstance & TUserInstance
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
  readonly name: string;
  readonly Type: ResourceType<TUserType, TResInstance, TResType, TUserInstance>;
  readonly aliases?: readonly string[];

  register(container: IContainer): void;
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
const annotation = Object.freeze({
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

const resBaseName = 'au:resource';
export const hasResources = (target: unknown): target is Constructable => hasOwnMetadata(resBaseName, target);
/** @internal */
export const getAllResources = (target: Constructable): readonly ResourceDefinition[] => {
  const keys = getOwnMetadata(resBaseName, target) as string[];
  if (keys === void 0) {
    return emptyArray;
  } else {
    return keys.map(k => getOwnMetadata(k, target));
  }
};

const resource = Object.freeze({
  name: resBaseName,
  appendTo(target: Constructable, key: string): void {
    const keys = getOwnMetadata(resBaseName, target) as string[];
    if (keys === void 0) {
      defineMetadata(resBaseName, [key], target);
    } else {
      keys.push(key);
    }
  },
  has: hasResources,
  getAll: getAllResources,
  getKeys(target: Constructable): readonly string[] {
    let keys = getOwnMetadata(resBaseName, target) as string[];
    if (keys === void 0) {
      defineMetadata(resBaseName, keys = [], target);
    }
    return keys;
  },
  isKey: (key: string): boolean => key.startsWith(resBaseName),
  keyFor(name: string, context?: string): string {
    if (context === void 0) {
      return `${resBaseName}:${name}`;
    }

    return `${resBaseName}:${name}:${context}`;
  },
});

export const Protocol = {
  annotation,
  resource,
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
