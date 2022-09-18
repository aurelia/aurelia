import { DI, InstanceProvider, onResolve, resolveAll, ILogger } from '@aurelia/kernel';
import { INode } from './dom';
import { IAppTask } from './app-task';
import { isElementType } from './resources/custom-element';
import { LifecycleFlags, Controller, IControllerElementHydrationInstruction } from './templating/controller';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { TaskSlot } from './app-task';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import type { IPlatform } from './platform';

export interface ISinglePageApp {
  host: HTMLElement;
  component: unknown;
}

export interface IAppRoot extends AppRoot {}
export const IAppRoot = DI.createInterface<IAppRoot>('IAppRoot');

export interface IWorkTracker extends WorkTracker {}
export const IWorkTracker = DI.createInterface<IWorkTracker>('IWorkTracker', x => x.singleton(WorkTracker));
export class WorkTracker {
  /** @internal */ protected static inject = [ILogger];
  /** @internal */ private _stack: number = 0;
  /** @internal */ private _promise: Promise<void> | null = null;
  /** @internal */ private _resolve: (() => void) | null = null;
  /** @internal */ private readonly _logger: ILogger;

  public constructor(logger: ILogger) {
    this._logger = logger.scopeTo('WorkTracker');
  }

  public start(): void {
    this._logger.trace(`start(stack:${this._stack})`);
    ++this._stack;
  }

  public finish(): void {
    this._logger.trace(`finish(stack:${this._stack})`);
    if (--this._stack === 0) {
      const resolve = this._resolve;
      if (resolve !== null) {
        this._resolve  = this._promise = null;
        resolve();
      }
    }
  }

  public wait(): Promise<void> {
    this._logger.trace(`wait(stack:${this._stack})`);
    if (this._promise === null) {
      if (this._stack === 0) {
        return Promise.resolve();
      }
      this._promise = new Promise(resolve => {
        this._resolve = resolve;
      });
    }
    return this._promise;
  }
}

export class AppRoot implements IDisposable {
  public readonly host: HTMLElement;

  public controller: ICustomElementController = (void 0)!;
  public work: IWorkTracker;

  /** @internal */
  private _hydratePromise: Promise<void> | void = void 0;

  public constructor(
    public readonly config: ISinglePageApp,
    public readonly platform: IPlatform,
    public readonly container: IContainer,
    rootProvider: InstanceProvider<IAppRoot>,
  ) {
    this.host = config.host;
    this.work = container.get(IWorkTracker);
    rootProvider.prepare(this);

    container.registerResolver(
      platform.HTMLElement,
      container.registerResolver(
        platform.Element,
        container.registerResolver(INode, new InstanceProvider('ElementResolver', config.host))
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
