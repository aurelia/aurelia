import { InstanceProvider, onResolve, onResolveAll } from '@aurelia/kernel';
import { IAppTask } from './app-task';
import { isElementType } from './resources/custom-element';
import { Controller, IControllerElementHydrationInstruction } from './templating/controller';
import { createInterface } from './utilities-di';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { TaskSlot } from './app-task';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import type { IPlatform } from './platform';
import { registerHostNode } from './dom';

export interface ISinglePageApp {
  host: HTMLElement;
  component: unknown;
}

export interface IAppRoot extends AppRoot {}
export const IAppRoot = /*@__PURE__*/createInterface<IAppRoot>('IAppRoot');

export class AppRoot implements IDisposable {
  public readonly host: HTMLElement;

  public controller!: ICustomElementController;

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

    registerHostNode(container, platform, config.host);

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
        return onResolve(this.controller.activate(this.controller, null, void 0), () => {
          return this._runAppTasks('activated');
        });
      });
    });
  }

  public deactivate(): void | Promise<void> {
    return onResolve(this._runAppTasks('deactivating'), () => {
      return onResolve(this.controller.deactivate(this.controller, null), () => {
        return this._runAppTasks('deactivated');
      });
    });
  }

  /** @internal */
  private _runAppTasks(slot: TaskSlot): void | Promise<void> {
    return onResolveAll(...this.container.getAll(IAppTask).reduce((results, task) => {
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
