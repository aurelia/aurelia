import { InstanceProvider, onResolve, resolveAll } from '@aurelia/kernel';
import { INode } from './dom';
import { IAppTask } from './app-task';
import { isElementType } from './resources/custom-element';
import { LifecycleFlags, Controller, IControllerElementHydrationInstruction } from './templating/controller';
import { createInterface, registerResolver } from './utilities-di';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { TaskSlot } from './app-task';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import type { IPlatform } from './platform';

export interface ISinglePageApp {
  host: HTMLElement;
  component: unknown;
}

export interface IAppRoot extends AppRoot {}
export const IAppRoot = createInterface<IAppRoot>('IAppRoot');

export class AppRoot implements IDisposable {
  public readonly host: HTMLElement;

  public controller: ICustomElementController = (void 0)!;

  /** @internal */
  private _hydratePromise: Promise<void> | void = void 0;

  public constructor(
    public readonly config: ISinglePageApp,
    public readonly platform: IPlatform,
    public readonly container: IContainer,
    rootProvider: InstanceProvider<IAppRoot>,
  ) {
    this.host = config.host;
    rootProvider.prepare(this);

    registerResolver(
      container,
      platform.HTMLElement,
      registerResolver(
        container,
        platform.Element,
        registerResolver(container, INode, new InstanceProvider('ElementResolver', config.host))
      )
    );

    this._hydratePromise = onResolve(this._runAppTasks('creating'), () => {
      const component = config.component as Constructable | ICustomElementViewModel;
      const childCtn = container.createChild();
      let instance: object;
      if (isElementType(component)) {
        instance = this.container.get(component);
      } else {
        instance = config.component as ICustomElementViewModel;
      }

      const hydrationInst: IControllerElementHydrationInstruction = { hydrate: false, projections: null };
      const controller = (this.controller = Controller.$el(
        childCtn,
        instance,
        this.host,
        hydrationInst,
      )) as Controller;

      controller._hydrateCustomElement(hydrationInst, /* root does not have hydration context */null);
      return onResolve(this._runAppTasks('hydrating'), () => {
        controller._hydrate(null);
        return onResolve(this._runAppTasks('hydrated'), () => {
          controller._hydrateChildren();
          this._hydratePromise = void 0;
        });
      });
    });
  }

  public activate(): void | Promise<void> {
    return onResolve(this._hydratePromise, () => {
      return onResolve(this._runAppTasks('activating'), () => {
        return onResolve(this.controller.activate(this.controller, null, LifecycleFlags.fromBind, void 0), () => {
          return this._runAppTasks('activated');
        });
      });
    });
  }

  public deactivate(): void | Promise<void> {
    return onResolve(this._runAppTasks('deactivating'), () => {
      return onResolve(this.controller.deactivate(this.controller, null, LifecycleFlags.none), () => {
        return this._runAppTasks('deactivated');
      });
    });
  }

  /** @internal */
  private _runAppTasks(slot: TaskSlot): void | Promise<void> {
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
