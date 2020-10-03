import { Constructable, ConstructableClass, DI, IContainer, IResolver, Registration, Metadata, Protocol } from '@aurelia/kernel';
import { INode } from '../dom';
import { LifecycleFlags } from '../flags';
import {
  ILifecycle,
  IViewFactory,
  ICustomElementViewModel,
  ISyntheticView,
  IDryCustomElementController,
  IContextualCustomElementController,
  ICompiledCustomElementController,
  ICustomElementController,
  IHydratedController,
  IHydratedParentController,
} from '../lifecycle';
import { Scope } from '../observation/binding-context';
import { CustomElement, PartialCustomElementDefinition, CustomElementDefinition } from '../resources/custom-element';
import { Controller } from './controller';
import { IRenderContext } from './render-context';
import { AuSlotContentType } from '../resources/custom-elements/au-slot';
import { IScope } from '../observation';

export class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
  public static maxCacheSize: number = 0xFFFF;

  public isCaching: boolean = false;

  private cache: ISyntheticView<T>[] = null!;
  private cacheSize: number = -1;

  public constructor(
    public name: string,
    public readonly context: IRenderContext<T>,
    private readonly lifecycle: ILifecycle,
    public readonly contentType: AuSlotContentType | undefined,
    public readonly projectionScope: IScope | null = null,
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

  public canReturnToCache(controller: ISyntheticView<T>): boolean {
    return this.cache != null && this.cache.length < this.cacheSize;
  }

  public tryReturnToCache(controller: ISyntheticView<T>): boolean {
    if (this.canReturnToCache(controller)) {
      this.cache.push(controller);
      return true;
    }

    return false;
  }

  public create(flags?: LifecycleFlags): ISyntheticView<T> {
    const cache = this.cache;
    let controller: ISyntheticView<T>;

    if (cache != null && cache.length > 0) {
      controller = cache.pop()!;
      return controller;
    }

    controller = Controller.forSyntheticView(this, this.lifecycle, this.context, flags);
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
  getViewComponentForObject<T extends ClassInstance<ICustomElementViewModel>>(
    object: T | null | undefined,
    viewNameOrSelector?: string | ViewSelector,
  ): ComposableObjectComponentType<T> | null;
}

export type ClassInstance<T> = T & {
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly constructor: Function;
};

export type ViewSelector = (object: ICustomElementViewModel, views: readonly PartialCustomElementDefinition[]) => string;
export type ComposableObjectComponentType<T extends ICustomElementViewModel>
  = ConstructableClass<{ viewModel: T } & ICustomElementViewModel>;

export class ViewLocator implements IViewLocator {
  private readonly modelInstanceToBoundComponent: WeakMap<object, Record<string, ComposableObjectComponentType<ICustomElementViewModel>>> = new WeakMap();
  private readonly modelTypeToUnboundComponent: Map<object, Record<string, ComposableObjectComponentType<ICustomElementViewModel>>> = new Map();

  public static register(container: IContainer): IResolver<IViewLocator> {
    return Registration.singleton(IViewLocator, this).register(container);
  }

  public getViewComponentForObject<T extends ClassInstance<ICustomElementViewModel>>(
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

  private getOrCreateBoundComponent<T extends ClassInstance<ICustomElementViewModel>>(
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

      BoundComponent = CustomElement.define<INode, ComposableObjectComponentType<T>>(
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

  private getOrCreateUnboundComponent<T extends ClassInstance<ICustomElementViewModel>>(
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
      UnboundComponent = CustomElement.define<INode, ComposableObjectComponentType<T>>(
        this.getView(availableViews, resolvedViewName),
        class {
          public constructor(public viewModel: T) {}

          public create(
            controller: IDryCustomElementController<INode, T>,
            parentContainer: IContainer,
            definition: CustomElementDefinition,
          ): PartialCustomElementDefinition | void {
            const vm = this.viewModel;
            controller.scope = Scope.fromParent(
              controller.flags,
              controller.scope,
              vm,
            );

            if (vm.create !== void 0) {
              return vm.create(controller, parentContainer, definition);
            }
          }
        }
      );

      const proto = UnboundComponent.prototype;

      if ('beforeCompile' in object) {
        proto.beforeCompile = function beforeCompile(
          controller: IContextualCustomElementController,
        ): void {
          this.viewModel.beforeCompile!(controller as IContextualCustomElementController<INode, T>);
        };
      }
      if ('afterCompile' in object) {
        proto.afterCompile = function afterCompile(
          controller: ICompiledCustomElementController,
        ): void {
          this.viewModel.afterCompile!(controller as ICompiledCustomElementController<INode, T>);
        };
      }
      if ('afterCompileChildren' in object) {
        proto.afterCompileChildren = function afterCompileChildren(
          controller: ICustomElementController,
        ): void {
          this.viewModel.afterCompileChildren!(controller as ICustomElementController<INode, T>);
        };
      }

      if ('beforeBind' in object) {
        proto.beforeBind = function beforeBind(
          initiator: IHydratedController<T>,
          parent: IHydratedParentController<T> | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.beforeBind!(initiator, parent, flags);
        };
      }
      if ('afterBind' in object) {
        proto.afterBind = function afterBind(
          initiator: IHydratedController<T>,
          parent: IHydratedParentController<T> | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.afterBind!(initiator, parent, flags);
        };
      }
      if ('afterAttach' in object) {
        proto.afterAttach = function afterAttach(
          initiator: IHydratedController<T>,
          parent: IHydratedParentController<T> | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.afterAttach!(initiator, parent, flags);
        };
      }
      if ('afterAttachChildren' in object) {
        proto.afterAttachChildren = function afterAttachChildren(
          initiator: IHydratedController<T>,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.afterAttachChildren!(initiator, flags);
        };
      }

      if ('beforeDetach' in object) {
        proto.beforeDetach = function beforeDetach(
          initiator: IHydratedController<T>,
          parent: IHydratedParentController<T> | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.beforeDetach!(initiator, parent, flags);
        };
      }
      if ('beforeUnbind' in object) {
        proto.beforeUnbind = function beforeUnbind(
          initiator: IHydratedController<T>,
          parent: IHydratedParentController<T> | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.beforeUnbind!(initiator, parent, flags);
        };
      }
      if ('afterUnbind' in object) {
        proto.afterUnbind = function afterUnbind(
          initiator: IHydratedController<T>,
          parent: IHydratedParentController<T> | null,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.afterUnbind!(initiator, parent, flags);
        };
      }
      if ('afterUnbindChildren' in object) {
        proto.afterUnbindChildren = function afterUnbindChildren(
          initiator: IHydratedController<T>,
          flags: LifecycleFlags,
        ): void | Promise<void> {
          return this.viewModel.afterUnbindChildren!(initiator, flags);
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
