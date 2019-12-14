import { Constructable, ConstructableClass, DI, IContainer, IResolver, Registration, Metadata, Protocol } from '@aurelia/kernel';
import { INode, INodeSequence } from '../dom';
import { LifecycleFlags, State } from '../flags';
import {
  IController,
  ILifecycle,
  IViewFactory,
  IViewModel,
} from '../lifecycle';
import { Scope } from '../observation/binding-context';
import { CustomElement, PartialCustomElementDefinition, CustomElementDefinition, IElementProjector } from '../resources/custom-element';
import { Controller } from './controller';
import { PartialCustomElementDefinitionParts, mergeParts } from '../definitions';
import { IRenderContext, getRenderContext } from './render-context';
import { MaybePromiseOrTask } from '../lifecycle-task';

export class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
  public static maxCacheSize: number = 0xFFFF;

  public isCaching: boolean = false;

  private cache: IController<T>[] = null!;
  private cacheSize: number = -1;

  public constructor(
    public name: string,
    private readonly context: IRenderContext,
    private readonly lifecycle: ILifecycle,
    public readonly parts: PartialCustomElementDefinitionParts | undefined,
  ) {}

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    if (size) {
      if (size === '*') {
        size = ViewFactory.maxCacheSize;
      } else if (typeof size === 'string') {
        size = parseInt(size, 10);
      }

      if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
        this.cacheSize = size;
      }
    }

    if (this.cacheSize > 0) {
      this.cache = [];
    } else {
      this.cache = null!;
    }

    this.isCaching = this.cacheSize > 0;
  }

  public canReturnToCache(controller: IController<T>): boolean {
    return this.cache != null && this.cache.length < this.cacheSize;
  }

  public tryReturnToCache(controller: IController<T>): boolean {
    if (this.canReturnToCache(controller)) {
      controller.cache(LifecycleFlags.none);
      this.cache.push(controller);
      return true;
    }

    return false;
  }

  public create(flags?: LifecycleFlags): IController<T> {
    const cache = this.cache;
    let controller: IController<T>;

    if (cache != null && cache.length > 0) {
      controller = cache.pop()!;
      controller.state = (controller.state | State.isCached) ^ State.isCached;
      return controller;
    }

    controller = Controller.forSyntheticView(this, this.lifecycle, this.context, flags);
    return controller;
  }

  public resolve(requestor: IContainer, parts?: PartialCustomElementDefinitionParts): IViewFactory<T> {
    parts = mergeParts(this.parts, parts);
    if (parts === void 0) {
      return this;
    }

    const part = parts[this.name];
    if (part === void 0) {
      return this;
    }

    return getRenderContext<T>(part, requestor, parts).getViewFactory(this.name);
  }
}

const seenViews = new WeakSet();
function notYetSeen($view: PartialCustomElementDefinition): boolean {
  return !seenViews.has($view);
}
function toCustomElementDefinition($view: PartialCustomElementDefinition): CustomElementDefinition {
  seenViews.add($view);
  return CustomElementDefinition.create($view);
}

export const Views = {
  name: Protocol.resource.keyFor('views'),
  has(value: object): boolean {
    return typeof value === 'function' && (Metadata.hasOwn(Views.name, value) || '$views' in value);
  },
  get(value: object | Constructable): readonly CustomElementDefinition[] {
    if (typeof value === 'function' && '$views' in value) {
      // TODO: a `get` operation with side effects is not a good thing. Should refactor this to a proper resource kind.
      const $views = (value as { $views: PartialCustomElementDefinition[] }).$views;
      const definitions = $views.filter(notYetSeen).map(toCustomElementDefinition);
      for (const def of definitions) {
        Views.add(value, def);
      }
    }
    let views = Metadata.getOwn(Views.name, value) as CustomElementDefinition[] | undefined;
    if (views === void 0) {
      Metadata.define(Views.name, views = [], value);
    }
    return views;
  },
  add<T extends Constructable>(Type: T, partialDefinition: PartialCustomElementDefinition): readonly CustomElementDefinition[] {
    const definition = CustomElementDefinition.create(partialDefinition);
    let views = Metadata.getOwn(Views.name, Type) as CustomElementDefinition[] | undefined;
    if (views === void 0) {
      Metadata.define(Views.name, views = [definition], Type);
    } else {
      views.push(definition);
    }
    return views;
  },
};

export function view(v: PartialCustomElementDefinition) {
  return function<T extends Constructable> (target: T) {
    Views.add(target, v);
  };
}

export const IViewLocator = DI.createInterface<IViewLocator>('IViewLocator')
  .noDefault();

export interface IViewLocator {
  getViewComponentForObject<T extends ClassInstance<ComposableObject>>(
    object: T | null | undefined,
    viewNameOrSelector?: string | ViewSelector,
  ): ComposableObjectComponentType<T> | null;
}

export type ClassInstance<T> = T & {
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly constructor: Function;
};

export type ComposableObject = Omit<IViewModel, '$controller'>;
export type ViewSelector = (object: ComposableObject, views: readonly PartialCustomElementDefinition[]) => string;
export type ComposableObjectComponentType<T extends ComposableObject>
  = ConstructableClass<{ viewModel: T } & ComposableObject>;

const lifecycleCallbacks = [
  'beforeCompile',
  'afterCompile',
  'afterCompileChildren',
  'beforeBind',
  'afterBind',
  'beforeAttach',
  'afterAttach',
  'beforeDetach',
  'caching',
  'afterDetach',
  'beforeUnbind',
  'afterUnbind'
] as const;

export class ViewLocator implements IViewLocator {
  private readonly modelInstanceToBoundComponent: WeakMap<object, Record<string, ComposableObjectComponentType<ComposableObject>>> = new WeakMap();
  private readonly modelTypeToUnboundComponent: Map<object, Record<string, ComposableObjectComponentType<ComposableObject>>> = new Map();

  public static register(container: IContainer): IResolver<IViewLocator> {
    return Registration.singleton(IViewLocator, this).register(container);
  }

  public getViewComponentForObject<T extends ClassInstance<ComposableObject>>(
    object: T | null | undefined,
    viewNameOrSelector?: string | ViewSelector
  ): ComposableObjectComponentType<T> | null {
    if (object) {
      const availableViews = Views.has(object.constructor) ? Views.get(object.constructor) : [];
      const resolvedViewName = typeof viewNameOrSelector === 'function'
        ? viewNameOrSelector(object, availableViews)
        : this.getViewName(availableViews, viewNameOrSelector);

      return this.getOrCreateBoundComponent<T>(
        object,
        availableViews,
        resolvedViewName
      );
    }

    return null;
  }

  private getOrCreateBoundComponent<T extends ClassInstance<ComposableObject>>(
    object: T,
    availableViews: readonly CustomElementDefinition[],
    resolvedViewName: string
  ): ComposableObjectComponentType<T> {
    let lookup = this.modelInstanceToBoundComponent.get(object);
    let BoundComponent: ComposableObjectComponentType<T> | undefined;

    if (lookup === void 0) {
      lookup = {};
      this.modelInstanceToBoundComponent.set(object, lookup);
    } else {
      BoundComponent = lookup[resolvedViewName] as ComposableObjectComponentType<T>;
    }

    if (BoundComponent === void 0) {
      const UnboundComponent = this.getOrCreateUnboundComponent<T>(
        object,
        availableViews,
        resolvedViewName
      );

      BoundComponent = CustomElement.define<ComposableObjectComponentType<T>>(
        CustomElement.getDefinition(UnboundComponent),
        class extends UnboundComponent {
          public constructor() {
            super(object);
          }
        }
      );

      lookup[resolvedViewName] = BoundComponent;
    }

    return BoundComponent;
  }

  private getOrCreateUnboundComponent<T extends ClassInstance<ComposableObject>>(
    object: T,
    availableViews: readonly CustomElementDefinition[],
    resolvedViewName: string
  ): ComposableObjectComponentType<T> {
    let lookup = this.modelTypeToUnboundComponent.get(object.constructor);
    let UnboundComponent: ComposableObjectComponentType<T> | undefined;

    if (lookup === void 0) {
      lookup = {};
      this.modelTypeToUnboundComponent.set(object.constructor, lookup);
    } else {
      UnboundComponent = lookup[resolvedViewName] as ComposableObjectComponentType<T>;
    }

    if (UnboundComponent === void 0) {
      UnboundComponent = CustomElement.define<ComposableObjectComponentType<T>>(
        this.getView(availableViews, resolvedViewName),
        class {
          public constructor(public viewModel: T) {}

          public create(
            controller: IController,
            definition: CustomElementDefinition,
            parentContainer: IContainer,
            parts: PartialCustomElementDefinitionParts,
            flags: LifecycleFlags,
          ) {
            const vm = this.viewModel;
            controller.scope = Scope.fromParent(
              flags,
              controller.scope!,
              vm,
            );

            if (vm.create !== void 0) {
              return vm.create(controller, definition, parentContainer, parts, flags);
            }
          }
        }
      );

      const proto = UnboundComponent.prototype;

      if ('beforeCompile' in object) {
        proto.beforeCompile = function beforeCompile(
          controller: IController,
          definition: CustomElementDefinition,
          container: IContainer,
          parts: PartialCustomElementDefinitionParts | undefined,
          flags: LifecycleFlags,
        ): void {
          this.viewModel.beforeCompile!(controller, definition, container, parts, flags);
        };
      }
      if ('afterCompile' in object) {
        proto.afterCompile = function afterCompile(
          controller: IController,
          compiledDefinition: CustomElementDefinition,
          projector: IElementProjector,
          nodes: INodeSequence | null,
          flags: LifecycleFlags,
        ): void {
          this.viewModel.afterCompile!(controller, compiledDefinition, projector, nodes, flags);
        };
      }
      if ('afterCompileChildren' in object) {
        proto.afterCompileChildren = function afterCompileChildren(
          children: readonly IController[] | undefined,
          flags: LifecycleFlags,
        ): void {
          this.viewModel.afterCompileChildren!(children, flags);
        };
      }
      if ('beforeBind' in object) {
        proto.beforeBind = function beforeBind(flags: LifecycleFlags): MaybePromiseOrTask {
          return this.viewModel.beforeBind!(flags);
        };
      }
      if ('afterBind' in object) {
        proto.afterBind = function afterBind(flags: LifecycleFlags): void {
          this.viewModel.afterBind!(flags);
        };
      }
      if ('beforeUnbind' in object) {
        proto.beforeUnbind = function beforeUnbind(flags: LifecycleFlags): MaybePromiseOrTask {
          return this.viewModel.beforeUnbind!(flags);
        };
      }
      if ('afterUnbind' in object) {
        proto.afterUnbind = function afterUnbind(flags: LifecycleFlags): void {
          this.viewModel.afterUnbind!(flags);
        };
      }
      if ('beforeAttach' in object) {
        proto.beforeAttach = function beforeAttach(flags: LifecycleFlags): void {
          this.viewModel.beforeAttach!(flags);
        };
      }
      if ('afterAttach' in object) {
        proto.afterAttach = function afterAttach(flags: LifecycleFlags): void {
          this.viewModel.afterAttach!(flags);
        };
      }
      if ('beforeDetach' in object) {
        proto.beforeDetach = function beforeDetach(flags: LifecycleFlags): void {
          this.viewModel.beforeDetach!(flags);
        };
      }
      if ('afterDetach' in object) {
        proto.afterDetach = function afterDetach(flags: LifecycleFlags): void {
          this.viewModel.afterDetach!(flags);
        };
      }
      if ('caching' in object) {
        proto.caching = function caching(flags: LifecycleFlags): void {
          this.viewModel.caching!(flags);
        };
      }

      lookup[resolvedViewName] = UnboundComponent;
    }

    return UnboundComponent;
  }

  private getViewName(views: readonly CustomElementDefinition[], requestedName?: string) {
    if (requestedName) {
      return requestedName;
    }

    if (views.length === 1) {
      return views[0].name;
    }

    return 'default-view';
  }

  private getView(views: readonly CustomElementDefinition[], name: string): CustomElementDefinition {
    const v = views.find(x => x.name === name);

    if (v === void 0) {
      // TODO: Use Reporter
      throw new Error(`Could not find view: ${name}`);
    }

    return v;
  }
}
