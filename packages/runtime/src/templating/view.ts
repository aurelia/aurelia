import { Constructable, DI, PLATFORM, Reporter } from '@aurelia/kernel';
import { ITemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { INode } from '../dom';
import { LifecycleFlags, State } from '../flags';
import {
  IController,
  ILifecycle,
  IViewFactory,
  IViewModel
} from '../lifecycle';
import { IScope } from '../observation';
import { Scope } from '../observation/binding-context';
import { ITemplate } from '../rendering-engine';
import { CustomElement } from '../resources/custom-element';
import { Controller } from './controller';

export class ViewFactory<T extends INode = INode> implements IViewFactory<T> {
  public static maxCacheSize: number = 0xFFFF;

  public isCaching: boolean;
  public name: string;
  public parts: TemplatePartDefinitions;

  private cache: IController<T>[];
  private cacheSize: number;
  private readonly lifecycle: ILifecycle;
  private readonly template: ITemplate<T>;

  constructor(name: string, template: ITemplate<T>, lifecycle: ILifecycle) {
    this.isCaching = false;

    this.cacheSize = -1;
    this.cache = null!;
    this.lifecycle = lifecycle;
    this.name = name;
    this.template = template;
    this.parts = PLATFORM.emptyObject;
  }

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

    controller = Controller.forSyntheticView(this, this.lifecycle, flags);
    this.template.render(controller, null!, this.parts, flags);
    if (!controller.nodes) {
      throw Reporter.error(90);
    }
    return controller;
  }

  public addParts(parts: Record<string, ITemplateDefinition>): void {
    if (this.parts === PLATFORM.emptyObject) {
      this.parts = { ...parts };
    } else {
      Object.assign(this.parts, parts);
    }
  }
}

type HasAssociatedViews = {
  $views: ITemplateDefinition[];
};

export function view(v: ITemplateDefinition) {
  return function<T extends Constructable>(target: T & Partial<HasAssociatedViews>) {
    const views = target.$views || (target.$views = []);
    views.push(v);
  };
}

function hasAssociatedViews<T>(object: T): object is T & HasAssociatedViews {
  return object && '$views' in object;
}

export const IViewLocator = DI.createInterface<IViewLocator>('IViewLocator')
  .withDefault(x => x.singleton(ViewLocator));

export interface IViewLocator {
  getViewComponentForModelInstance(model: ComposableObject | null | undefined, requestedViewName?: string): Constructable | null;
}

export type ComposableObject = Omit<IViewModel, '$controller'>;

const lifecycleCallbacks = [
  'binding',
  'bound',
  'attaching',
  'attached',
  'detaching',
  'caching',
  'detached',
  'unbinding',
  'unbound'
] as (keyof Omit<ComposableObject, 'created'>)[];

export class ViewLocator implements IViewLocator {
  private modelInstanceToBoundComponent: WeakMap<object, Record<string, Constructable>> = new WeakMap();
  private modelTypeToUnboundComponent: Map<object, Record<string, Constructable>> = new Map();

  public getViewComponentForModelInstance(object: ComposableObject | null | undefined, viewName?: string) {
    if (object && hasAssociatedViews(object.constructor)) {
      const availableViews = object.constructor.$views;
      const resolvedViewName = this.getViewName(availableViews, viewName);

      return this.getOrCreateBoundComponent(
        object,
        availableViews,
        resolvedViewName
      );
    }

    return null;
  }

  private getOrCreateBoundComponent(model: ComposableObject, availableViews: ITemplateDefinition[], resolvedViewName: string) {
    let lookup = this.modelInstanceToBoundComponent.get(model);
    let BoundComponent: Constructable | undefined;

    if (!lookup) {
      lookup = {};
      this.modelInstanceToBoundComponent.set(model, lookup);
    } else {
      BoundComponent = lookup[resolvedViewName];
    }

    if (!BoundComponent) {
      const UnboundComponent = this.getOrCreateUnboundComponent(
        model,
        availableViews,
        resolvedViewName
      );

      BoundComponent = class extends UnboundComponent {
        constructor() {
          super(model);
        }
      };

      lookup[resolvedViewName] = BoundComponent;
    }

    return BoundComponent;
  }

  private getOrCreateUnboundComponent(model: ComposableObject, availableViews: ITemplateDefinition[], resolvedViewName: string) {
    let lookup = this.modelTypeToUnboundComponent.get(model.constructor);
    let UnboundComponent: Constructable | undefined;

    if (!lookup) {
      lookup = {};
      this.modelTypeToUnboundComponent.set(model.constructor, lookup);
    } else {
      UnboundComponent = lookup[resolvedViewName];
    }

    if (!UnboundComponent) {
      UnboundComponent = CustomElement.define(
        this.getView(availableViews, resolvedViewName),
        class {
          protected $scope!: IScope;

          constructor(protected viewModel: ComposableObject) {}

          public created(flags: LifecycleFlags) {
            this.$scope = Scope.fromParent(flags, this.$scope, this.viewModel);

            if (this.viewModel.created) {
              this.viewModel.created(flags);
            }
          }
        }
      );

      const proto = UnboundComponent.prototype;

      lifecycleCallbacks.forEach(x => {
        if (x in model) {
          proto[x] = function() { return this.viewModel[x](); };
        }
      });

      lookup[resolvedViewName] = UnboundComponent;
    }

    return UnboundComponent;
  }

  private getViewName(views: ITemplateDefinition[], requestedName?: string) {
    if (requestedName) {
      return requestedName;
    }

    if (views.length === 1) {
      return views[0].name;
    }

    return 'default';
  }

  private getView(views: ITemplateDefinition[], name: string): ITemplateDefinition {
    const v = views.find(x => x.name === name);

    if (!v) {
      // TODO: user Reporter
      throw new Error(`Could not find view: ${name}`);
    }

    return v;
  }
}
