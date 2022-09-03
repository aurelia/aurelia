import { DI } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { CustomElementDefinition, defineElement, getElementDefinition } from '../resources/custom-element';
import { Controller } from './controller';
import { defineMetadata, getOwnMetadata, getResourceKeyFor, hasOwnMetadata } from '../utilities-metadata';
import { isFunction, isString } from '../utilities';

import type { Constructable, ConstructableClass, IContainer } from '@aurelia/kernel';
import type { LifecycleFlags } from '@aurelia/runtime';
import type {
  ICustomElementViewModel,
  ISyntheticView,
  IDryCustomElementController,
  IContextualCustomElementController,
  ICompiledCustomElementController,
  ICustomElementController,
  ICustomAttributeController,
  IHydratedController,
  IHydratedParentController,
  IHydrationContext,
} from './controller';
import type { PartialCustomElementDefinition } from '../resources/custom-element';

export interface IViewFactory extends ViewFactory {}
export const IViewFactory = DI.createInterface<IViewFactory>('IViewFactory');
export class ViewFactory implements IViewFactory {
  public static maxCacheSize: number = 0xFFFF;

  public name: string;
  public readonly container: IContainer;
  public def: PartialCustomElementDefinition;
  public isCaching: boolean = false;

  private cache: ISyntheticView[] = null!;
  private cacheSize: number = -1;

  public constructor(
    container: IContainer,
    def: CustomElementDefinition,
  ) {
    this.name = def.name;
    this.container = container;
    this.def = def;
  }

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (size) {
      if (size === '*') {
        size = ViewFactory.maxCacheSize;
      } else if (isString(size)) {
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

  public canReturnToCache(_controller: ISyntheticView): boolean {
    return this.cache != null && this.cache.length < this.cacheSize;
  }

  public tryReturnToCache(controller: ISyntheticView): boolean {
    if (this.canReturnToCache(controller)) {
      this.cache.push(controller);
      return true;
    }

    return false;
  }

  public create(
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined,
  ): ISyntheticView {
    const cache = this.cache;
    let controller: ISyntheticView;

    if (cache != null && cache.length > 0) {
      controller = cache.pop()!;
      return controller;
    }

    controller = Controller.$view(this, parentController);
    return controller;
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

const viewsBaseName = getResourceKeyFor('views');

export const Views = Object.freeze({
  name: viewsBaseName,
  has(value: object): boolean {
    return isFunction(value) && (hasOwnMetadata(viewsBaseName, value) || '$views' in value);
  },
  get(value: object | Constructable): readonly CustomElementDefinition[] {
    if (isFunction(value) && '$views' in value) {
      // TODO: a `get` operation with side effects is not a good thing. Should refactor this to a proper resource kind.
      const $views = (value as { $views: PartialCustomElementDefinition[] }).$views;
      const definitions = $views.filter(notYetSeen).map(toCustomElementDefinition);
      for (const def of definitions) {
        Views.add(value, def);
      }
    }
    let views = getOwnMetadata(viewsBaseName, value) as CustomElementDefinition[] | undefined;
    if (views === void 0) {
      defineMetadata(viewsBaseName, views = [], value);
    }
    return views;
  },
  add<T extends Constructable>(Type: T, partialDefinition: PartialCustomElementDefinition): readonly CustomElementDefinition[] {
    const definition = CustomElementDefinition.create(partialDefinition);
    let views = getOwnMetadata(viewsBaseName, Type) as CustomElementDefinition[] | undefined;
    if (views === void 0) {
      defineMetadata(viewsBaseName, views = [definition], Type);
    } else {
      views.push(definition);
    }
    return views;
  },
});

export function view(v: PartialCustomElementDefinition) {
  return function<T extends Constructable> (target: T) {
    Views.add(target, v);
  };
}

export type ClassInstance<T> = T & {
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly constructor: Function;
};

export type ViewSelector = (object: ICustomElementViewModel, views: readonly PartialCustomElementDefinition[]) => string;
export type ComposableObjectComponentType<T extends ICustomElementViewModel>
  = ConstructableClass<{ viewModel: T } & ICustomElementViewModel>;

export const IViewLocator = DI.createInterface<IViewLocator>('IViewLocator', x => x.singleton(ViewLocator));
export interface IViewLocator extends ViewLocator {}

export class ViewLocator {
  /** @internal */
  private readonly _modelInstanceToBoundComponent: WeakMap<object, Record<string, ComposableObjectComponentType<ICustomElementViewModel>>> = new WeakMap();
  /** @internal */
  private readonly _modelTypeToUnboundComponent: Map<object, Record<string, ComposableObjectComponentType<ICustomElementViewModel>>> = new Map();

  public getViewComponentForObject<T extends ClassInstance<ICustomElementViewModel>>(
    object: T | null | undefined,
    viewNameOrSelector?: string | ViewSelector
  ): ComposableObjectComponentType<T> | null {
    if (object) {
      const availableViews = Views.has(object.constructor) ? Views.get(object.constructor) : [];
      const resolvedViewName = isFunction(viewNameOrSelector)
        ? viewNameOrSelector(object, availableViews)
        : this._getViewName(availableViews, viewNameOrSelector);

      return this._getOrCreateBoundComponent(
        object,
        availableViews,
        resolvedViewName
      );
    }

    return null;
  }

  /** @internal */
  private _getOrCreateBoundComponent<T extends ClassInstance<ICustomElementViewModel>>(
    object: T,
    availableViews: readonly CustomElementDefinition[],
    resolvedViewName: string
  ): ComposableObjectComponentType<T> {
    let lookup = this._modelInstanceToBoundComponent.get(object);
    let BoundComponent: ComposableObjectComponentType<T> | undefined;

    if (lookup === void 0) {
      lookup = {};
      this._modelInstanceToBoundComponent.set(object, lookup);
    } else {
      BoundComponent = lookup[resolvedViewName] as ComposableObjectComponentType<T>;
    }

    if (BoundComponent === void 0) {
      const UnboundComponent = this._getOrCreateUnboundComponent(
        object,
        availableViews,
        resolvedViewName
      );

      BoundComponent = defineElement<ComposableObjectComponentType<T>>(
        getElementDefinition(UnboundComponent),
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

  /** @internal */
  private _getOrCreateUnboundComponent<T extends ClassInstance<ICustomElementViewModel>>(
    object: T,
    availableViews: readonly CustomElementDefinition[],
    resolvedViewName: string
  ): ComposableObjectComponentType<T> {
    let lookup = this._modelTypeToUnboundComponent.get(object.constructor);
    let UnboundComponent: ComposableObjectComponentType<T> | undefined;

    if (lookup === void 0) {
      lookup = {};
      this._modelTypeToUnboundComponent.set(object.constructor, lookup);
    } else {
      UnboundComponent = lookup[resolvedViewName] as ComposableObjectComponentType<T>;
    }

    if (UnboundComponent === void 0) {
      UnboundComponent = defineElement<ComposableObjectComponentType<T>>(
        this._getView(availableViews, resolvedViewName),
        class {
          public constructor(public viewModel: T) {}

          public define(
            controller: IDryCustomElementController<T>,
            hydrationContext: IHydrationContext,
            definition: CustomElementDefinition,
          ): PartialCustomElementDefinition | void {
            const vm = this.viewModel;
            controller.scope = Scope.fromParent(controller.scope, vm);

            if (vm.define !== void 0) {
              return vm.define(controller, hydrationContext, definition);
            }
          }
        }
      );

      const proto = UnboundComponent.prototype;

      if ('hydrating' in object) {
        proto.hydrating = function hydrating(
          controller: IContextualCustomElementController,
        ): void {
          this.viewModel.hydrating!(controller as IContextualCustomElementController<T>);
        };
      }
      if ('hydrated' in object) {
        proto.hydrated = function hydrated(
          controller: ICompiledCustomElementController,
        ): void {
          this.viewModel.hydrated!(controller as ICompiledCustomElementController<T>);
        };
      }
      if ('created' in object) {
        proto.created = function created(
          controller: ICustomElementController,
        ): void {
          this.viewModel.created!(controller as ICustomElementController<T>);
        };
      }

      if ('binding' in object) {
        proto.binding = function binding(
          initiator: IHydratedController,
          parent: IHydratedParentController | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.binding!(initiator, parent, flags);
        };
      }
      if ('bound' in object) {
        proto.bound = function bound(
          initiator: IHydratedController,
          parent: IHydratedParentController | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.bound!(initiator, parent, flags);
        };
      }
      if ('attaching' in object) {
        proto.attaching = function attaching(
          initiator: IHydratedController,
          parent: IHydratedParentController | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.attaching!(initiator, parent, flags);
        };
      }
      if ('attached' in object) {
        proto.attached = function attached(
          initiator: IHydratedController,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.attached!(initiator, flags);
        };
      }

      if ('detaching' in object) {
        proto.detaching = function detaching(
          initiator: IHydratedController,
          parent: IHydratedParentController | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.detaching!(initiator, parent, flags);
        };
      }
      if ('unbinding' in object) {
        proto.unbinding = function unbinding(
          initiator: IHydratedController,
          parent: IHydratedParentController | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.unbinding!(initiator, parent, flags);
        };
      }

      if ('dispose' in object) {
        proto.dispose = function dispose(): void {
          this.viewModel.dispose!();
        };
      }

      lookup[resolvedViewName] = UnboundComponent;
    }

    return UnboundComponent;
  }

  /** @internal */
  private _getViewName(views: readonly CustomElementDefinition[], requestedName?: string) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (requestedName) {
      return requestedName;
    }

    if (views.length === 1) {
      return views[0].name;
    }

    return 'default-view';
  }

  /** @internal */
  private _getView(views: readonly CustomElementDefinition[], name: string): CustomElementDefinition {
    const v = views.find(x => x.name === name);

    if (v === void 0) {
      throw new Error(`Could not find view: ${name}`);
    }

    return v;
  }
}
