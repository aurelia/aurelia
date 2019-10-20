import { IContainer, IResolver } from './di';
import { Constructable } from './interfaces';
import { Metadata } from './metadata';
import { PLATFORM } from './platform';

export type ResourceType<
  TUserType extends Constructable = Constructable,
  TResInstance extends {} = {},
  TResType extends {} = {},
  TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>,
> = (
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
  readonly name: string;
  readonly Type: ResourceType<TUserType, TResInstance, TResType, TUserInstance>;
  readonly aliases?: readonly string[];

  register(container: IContainer): void;
} & TDef;

export type PartialResourceDefinition<TDef extends {} = {}> = {
  readonly name: string;
  readonly aliases?: readonly string[];
} & TDef;

export interface IResourceKind<TType extends ResourceType, TDef extends ResourceDefinition> {
  readonly name: string;
  keyFrom(name: string): string;
}

export interface IResourceDescriptions {
  find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null;
  create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null;
}

export class RuntimeCompilationResources implements IResourceDescriptions {
  private readonly context: IContainer;

  public constructor(context: IContainer) {
    this.context = context;
  }

  public find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    const key = kind.keyFrom(name);
    let resourceResolvers = (this.context as unknown as { resourceResolvers: Record<string, IResolver | undefined | null> }).resourceResolvers;
    let resolver = resourceResolvers[key];
    if (resolver === void 0) {
      resourceResolvers = (this.context as unknown as { root: { resourceResolvers: Record<string, IResolver | undefined | null> }}).root.resourceResolvers;
      resolver = resourceResolvers[key];
    }

    if (resolver != null && resolver.getFactory) {
      const factory = resolver.getFactory(this.context);

      if (factory != null) {
        // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
        // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
        const definition = Metadata.getOwn(kind.name, factory.Type);
        return definition === void 0 ? null : definition;
      }
    }

    return null;
  }

  public create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
    const key = kind.keyFrom(name);
    let resourceResolvers = (this.context as unknown as { resourceResolvers: Record<string, IResolver | undefined | null> }).resourceResolvers;
    let resolver = resourceResolvers[key];
    if (resolver === undefined) {
      resourceResolvers = (this.context as unknown as { root: { resourceResolvers: Record<string, IResolver | undefined | null> }}).root.resourceResolvers;
      resolver = resourceResolvers[key];
    }

    if (resolver != null) {
      const instance = resolver.resolve(this.context, this.context);
      return instance === undefined ? null : instance;
    }

    return null;
  }
}

const annotation = {
  name: 'au:annotation',
  appendTo(target: Constructable, key: string): void {
    const keys = Metadata.getOwn(annotation.name, target) as string[];
    if (keys === void 0) {
      Metadata.define(annotation.name, [key], target);
    } else {
      keys.push(key);
    }
  },
  set(target: Constructable, prop: string, value: unknown): void {
    Metadata.define(annotation.keyFor(prop), value, target);
  },
  get(target: Constructable, prop: string): unknown {
    return Metadata.getOwn(annotation.keyFor(prop), target);
  },
  getKeys(target: Constructable): readonly string[] {
    let keys = Metadata.getOwn(annotation.name, target) as string[];
    if (keys === void 0) {
      Metadata.define(annotation.name, keys = [], target);
    }
    return keys;
  },
  isKey(key: string): boolean {
    return key.startsWith(annotation.name);
  },
  keyFor(name: string, context?: string): string {
    if (context === void 0) {
      return `${annotation.name}:${name}`;
    }

    return `${annotation.name}:${name}:${context}`;
  },
};

const resource = {
  name: 'au:resource',
  appendTo(target: Constructable, key: string): void {
    const keys = Metadata.getOwn(resource.name, target) as string[];
    if (keys === void 0) {
      Metadata.define(resource.name, [key], target);
    } else {
      keys.push(key);
    }
  },
  has(target: unknown): target is Constructable {
    return Metadata.hasOwn(resource.name, target);
  },
  getAll(target: Constructable): readonly ResourceDefinition[] {
    const keys = Metadata.getOwn(resource.name, target) as string[];
    if (keys === void 0) {
      return PLATFORM.emptyArray;
    } else {
      return keys.map(k => Metadata.getOwn(k, target));
    }
  },
  getKeys(target: Constructable): readonly string[] {
    let keys = Metadata.getOwn(resource.name, target) as string[];
    if (keys === void 0) {
      Metadata.define(resource.name, keys = [], target);
    }
    return keys;
  },
  isKey(key: string): boolean {
    return key.startsWith(resource.name);
  },
  keyFor(name: string, context?: string): string {
    if (context === void 0) {
      return `${resource.name}:${name}`;
    }

    return `${resource.name}:${name}:${context}`;
  },
};

export const Protocol = {
  annotation,
  resource,
};

// eslint-disable-next-line @typescript-eslint/unbound-method
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
  let value = Metadata.getOwn(Protocol.annotation.keyFor(name as string), Type) as TDef[K] | undefined;
  if (value === void 0) {
    value = def[name];
    if (value === void 0) {
      value = (Type as Constructable & TDef)[name] as TDef[K] | undefined;
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
  let value = Metadata.getOwn(Protocol.annotation.keyFor(name as string), Type) as V;
  if (value === void 0) {
    value = Type[name] as unknown as V;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
