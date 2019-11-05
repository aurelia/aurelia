import { IIndexable, Constructable, ResourceType, IResourceKind, Protocol, Metadata, ResourceDefinition, mergeArrays, IContainer, Registration, PartialResourceDefinition } from '@aurelia/kernel';
import { IViewModel, registerAliases, CustomElement } from '@aurelia/runtime';

export interface IRouteConfig {
  readonly name?: string;
  readonly id?: string;
  readonly path?: string | readonly string[];
  readonly viewport?: string | null;
  readonly nav?: boolean;
  readonly meta?: IIndexable;
}

export type PartialRouteableComponentDefinition = Partial<PartialResourceDefinition<IRouteConfig & {
  readonly routes?: readonly IRouteConfig[];
}>>;

export type RouteableComponentType<T extends Constructable = Constructable> = ResourceType<T, IViewModel & (T extends Constructable<infer P> ? P : {}), PartialRouteableComponentDefinition>;
export type RouteableComponentKind = IResourceKind<RouteableComponentType, RouteableComponentDefinition> & {
  isType<T>(value: T): value is (T extends Constructable ? RouteableComponentType<T> : never);
  define<T extends Constructable>(def: PartialRouteableComponentDefinition, Type: T): RouteableComponentType<T>;
  getDefinition<T extends Constructable>(Type: T): RouteableComponentDefinition<T>;
  annotate<K extends keyof PartialRouteableComponentDefinition>(Type: Constructable, prop: K, value: PartialRouteableComponentDefinition[K]): void;
  getAnnotation<K extends keyof PartialRouteableComponentDefinition>(Type: Constructable, prop: K): PartialRouteableComponentDefinition[K];
};

export type RouteableComponentDecorator = <T extends Constructable>(Type: T) => RouteableComponentType<T>;

/**
 * Decorator: Indicates that the decorated class is a routeable component.
 *
 * It can be navigated *to*
 */
export function routeableComponent(def: PartialRouteableComponentDefinition): RouteableComponentDecorator {
  return function (target) {
    return RouteableComponent.define(def, target);
  };
}

/**
 * Decorator: Indicates that the decorated class is has the specified config(s) as child route(s).
 */
export function route(...configs: readonly IRouteConfig[]): (target: Constructable) => void {
  return function (target: Constructable) {
    const key = Protocol.annotation.keyFor('routes');
    const existing = Metadata.getOwn(key, target);
    if (existing === void 0) {
      Metadata.define(key, configs, target);
    } else {
      existing.push(...configs);
    }
  };
}

function ensureArray<T>(input: undefined | T | readonly T[]): readonly T[] {
  if (Array.isArray(input)) {
    return input.slice();
  } else if (input === void 0) {
    return [];
  } else {
    return [input as T];
  }
}

export class RouteableComponentDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, IViewModel, PartialRouteableComponentDefinition> {
  private constructor(
    public readonly Type: RouteableComponentType<T>,
    public readonly name: string,
    public readonly aliases: string[],
    public readonly key: string,
    public readonly id: string,
    public readonly path: readonly string[],
    public readonly viewport: string | null,
    public readonly nav: boolean,
    public readonly meta: IIndexable,
    public readonly routes: readonly RouteableComponentDefinition[],
  ) {}

  public static create<T extends Constructable = Constructable>(
    def: PartialRouteableComponentDefinition,
    Type: RouteableComponentType<T>,
  ): RouteableComponentDefinition<T> {
    // Shouldn't necessarily require this but that's a concern for later
    const customElementDef = CustomElement.getDefinition(Type);

    const name = def.name === void 0 ? customElementDef.name : def.name;
    const aliases = mergeArrays(RouteableComponent.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases);
    const path = mergeArrays(ensureArray(RouteableComponent.getAnnotation(Type, 'path')), ensureArray(def.path), ensureArray(Type.path));
    const key = RouteableComponent.keyFrom(name);
    const partialRoutes = mergeArrays(ensureArray(RouteableComponent.getAnnotation(Type, 'routes')), ensureArray(def.routes), ensureArray(Type.routes));
    let id: string;
    let viewport: string | null;
    let nav: boolean;
    let meta: IIndexable;

    if (def.id === void 0) {
      id = path[0];
    } else {
      id = def.id;
    }

    if (def.viewport === void 0) {
      viewport = null;
    } else {
      viewport = def.viewport;
    }

    nav = def.nav !== false;
    meta = { ...def.meta };

    const annotationRoutes = RouteableComponent.getAnnotation(Type, 'routes');
    if (annotationRoutes !== void 0) {
      partialRoutes.push(...annotationRoutes);
    }

    const dependencies = customElementDef.dependencies.filter(CustomElement.isType).map(CustomElement.getDefinition);
    const routes: RouteableComponentDefinition[] = [];
    for (const partialRoute of partialRoutes) {
      // Note: this filters child routes on only those whose name matches with any of the custom element's `dependencies` array.
      // We could create a placeholder type for indirectly registered types to signal to the container to resolve them later on,
      // but that's a problem we can solve later on.
      const dep = dependencies.find(x => x.name === partialRoute.name);
      if (dep !== void 0) {
        routes.push(RouteableComponentDefinition.create(partialRoute, dep.Type));
      }
    }

    return new RouteableComponentDefinition(Type, name, aliases, key, id, path, viewport, nav, meta, routes);
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.transient(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, RouteableComponent, key, container);
  }
}

export const RouteableComponent: RouteableComponentKind = {
  name: Protocol.resource.keyFor('routeable-component'),
  keyFrom(name: string): string {
    return `${RouteableComponent.name}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? RouteableComponentType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(RouteableComponent.name, value);
  },
  define<T extends Constructable>(def: PartialRouteableComponentDefinition, Type: T): RouteableComponentType<T> {
    const definition = RouteableComponentDefinition.create(def, Type as Constructable);
    Metadata.define(RouteableComponent.name, definition, definition.Type);
    Metadata.define(RouteableComponent.name, definition, definition);
    Protocol.resource.appendTo(definition.Type, RouteableComponent.name);

    return definition.Type as RouteableComponentType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): RouteableComponentDefinition<T> {
    const def = Metadata.getOwn(RouteableComponent.name, Type) as RouteableComponentDefinition<T>;
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialRouteableComponentDefinition>(Type: Constructable, prop: K, value: PartialRouteableComponentDefinition[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof PartialRouteableComponentDefinition>(Type: Constructable, prop: K): PartialRouteableComponentDefinition[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
  },
};

