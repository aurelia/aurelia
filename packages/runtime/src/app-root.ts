import {
  Constructable,
  DI,
  IContainer,
  Registration,
  InstanceProvider,
  IDisposable,
  onResolve,
  resolveAll
} from '@aurelia/kernel';
import {
  IDOM,
  INode
} from './dom';
import {
  BindingStrategy,
  LifecycleFlags,
} from './flags';
import {
  ICustomElementViewModel,
  ILifecycle,
  ICustomElementController,
} from './lifecycle';
import { IAppTask, TaskSlot } from './app-task';
import { CustomElement, CustomElementDefinition } from './resources/custom-element';
import { Controller } from './templating/controller';
import { HooksDefinition } from './definitions';

export interface ISinglePageApp<THost extends INode = INode> {
  strategy?: BindingStrategy;
  dom?: IDOM;
  host: THost;
  component: unknown;
}

export interface IAppRoot<T extends INode = INode> extends AppRoot<T> {}
export const IAppRoot = DI.createInterface<IAppRoot>('IAppRoot').noDefault();

export class AppRoot<T extends INode = INode> implements IDisposable {
  public readonly container: IContainer;
  public readonly host: T;
  public readonly dom: IDOM<T>;

  public controller: ICustomElementController<T> = (void 0)!;

  private hydratePromise: Promise<void> | void = void 0;
  private readonly enhanceDefinition: CustomElementDefinition | undefined;
  private readonly strategy: BindingStrategy;
  private readonly lifecycle: ILifecycle;

  public constructor(
    public readonly config: ISinglePageApp<T>,
    container: IContainer,
    rootProvider: InstanceProvider<IAppRoot<T>>,
    enhance: boolean = false,
  ) {
    rootProvider.prepare(this);
    if (config.host != void 0) {
      if (container.has(INode, false)) {
        this.container = container.createChild();
      } else {
        this.container = container;
      }
      Registration.instance(INode, config.host).register(this.container);
      this.host = config.host;
    } else if (container.has(INode, true)) {
      this.container = container;
      this.host = container.get(INode) as T;
    } else {
      throw new Error(`No host element found.`);
    }
    this.strategy = config.strategy ?? BindingStrategy.getterSetter;
    this.dom = this.container.get(IDOMInitializer).initialize(config) as IDOM<T>;
    this.lifecycle = this.container.get(ILifecycle);

    if (enhance) {
      const component = config.component as Constructable | ICustomElementViewModel<T>;
      this.enhanceDefinition = CustomElement.getDefinition(
        CustomElement.isType(component)
          ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
          : CustomElement.define({ name: (void 0)!, template: this.host, enhance: true, hooks: new HooksDefinition(component) })
      );
    }

    this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
      const instance = CustomElement.isType(config.component as Constructable)
        ? this.container.get(config.component as Constructable | {}) as ICustomElementViewModel<T>
        : config.component as ICustomElementViewModel<T>;

      const controller = (this.controller = Controller.forCustomElement(
        this,
        container,
        instance,
        this.lifecycle,
        this.host,
        null,
        this.strategy as number,
        false,
        this.enhanceDefinition,
      )) as Controller<T>;

      controller.hydrateCustomElement(container, null);
      return onResolve(this.runAppTasks('beforeCompile'), () => {
        controller.compile(null);
        return onResolve(this.runAppTasks('beforeCompileChildren'), () => {
          controller.compileChildren();
          this.hydratePromise = void 0;
        });
      });
    });
  }

  public activate(): void | Promise<void> {
    return onResolve(this.hydratePromise, () => {
      return onResolve(this.runAppTasks('beforeActivate'), () => {
        return onResolve(this.controller.activate(this.controller, null, this.strategy | LifecycleFlags.fromBind, void 0), () => {
          return this.runAppTasks('afterActivate');
        });
      });
    });
  }

  public deactivate(): void | Promise<void> {
    return onResolve(this.runAppTasks('beforeDeactivate'), () => {
      return onResolve(this.controller.deactivate(this.controller, null, this.strategy | LifecycleFlags.none), () => {
        return this.runAppTasks('afterDeactivate');
      });
    });
  }

  /** @internal */
  public runAppTasks(slot: TaskSlot): void | Promise<void> {
    return resolveAll(...this.container.getAll(IAppTask).reduce((results, task) => {
      if (task.slot === slot) {
        results.push(task.run());
      }
      return results;
    }, [] as (void | Promise<void>)[]));
  }

  public dispose(): void {
    this.controller?.dispose();
  }
}

export const IDOMInitializer = DI.createInterface<IDOMInitializer>('IDOMInitializer').noDefault();

export interface IDOMInitializer {
  initialize(config?: ISinglePageApp): IDOM;
}
