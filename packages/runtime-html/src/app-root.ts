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
import { BindingStrategy, LifecycleFlags } from '@aurelia/runtime';
import { INode } from './dom';
import { ICustomElementViewModel, ICustomElementController } from './lifecycle';
import { IAppTask, TaskSlot } from './app-task';
import { CustomElement, CustomElementDefinition } from './resources/custom-element';
import { Controller } from './templating/controller';
import { HooksDefinition } from './definitions';
import { IPlatform } from './platform';

export interface ISinglePageApp {
  strategy?: BindingStrategy;
  host: HTMLElement;
  component: unknown;
}

export interface IAppRoot extends AppRoot {}
export const IAppRoot = DI.createInterface<IAppRoot>('IAppRoot').noDefault();

export class AppRoot implements IDisposable {
  public readonly host: HTMLElement;

  public controller: ICustomElementController = (void 0)!;

  private hydratePromise: Promise<void> | void = void 0;
  private readonly enhanceDefinition: CustomElementDefinition | undefined;
  private readonly strategy: BindingStrategy;

  public constructor(
    public readonly config: ISinglePageApp,
    public readonly platform: IPlatform,
    public readonly container: IContainer,
    rootProvider: InstanceProvider<IAppRoot>,
    enhance: boolean = false,
  ) {
    this.host = config.host;
    rootProvider.prepare(this);
    if (container.has(INode, false) && container.get(INode) !== config.host) {
      this.container = container.createChild();
    }
    this.container.register(Registration.instance(INode, config.host));
    this.strategy = config.strategy ?? BindingStrategy.getterSetter;

    if (enhance) {
      const component = config.component as Constructable | ICustomElementViewModel;
      this.enhanceDefinition = CustomElement.getDefinition(
        CustomElement.isType(component)
          ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
          : CustomElement.define({ name: (void 0)!, template: this.host, enhance: true, hooks: new HooksDefinition(component) })
      );
    }

    this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
      const instance = CustomElement.isType(config.component as Constructable)
        ? this.container.get(config.component as Constructable | {}) as ICustomElementViewModel
        : config.component as ICustomElementViewModel;

      const controller = (this.controller = Controller.forCustomElement(
        this,
        container,
        instance,
        this.host,
        null,
        this.strategy as number,
        false,
        this.enhanceDefinition,
      )) as Controller;

      controller.hydrateCustomElement(container, null);
      return onResolve(this.runAppTasks('hydrating'), () => {
        controller.compile(null);
        return onResolve(this.runAppTasks('hydrated'), () => {
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
