import { BrowserPlatform } from '@aurelia/platform-browser';
import { InstanceProvider, onResolve, onResolveAll } from '@aurelia/kernel';
import { IAppTask } from './app-task';
import { CustomElementDefinition, generateElementName } from './resources/custom-element';
import { Controller, IControllerElementHydrationInstruction } from './templating/controller';
import { createInterface, instanceRegistration } from './utilities-di';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { TaskSlot } from './app-task';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import { IPlatform } from './platform';
import { registerHostNode } from './dom';
import { isFunction } from './utilities';
import { ErrorNames, createMappedError } from './errors';

export interface IAppRootConfig<T extends object = object> {
  host: HTMLElement;
  component: T | Constructable<T>;
}

export interface IAppRoot<C extends object = object> extends IDisposable {
  readonly config: IAppRootConfig<C>;
  /**
   * The host element of an application
   */
  readonly host: HTMLElement;
  /**
   * The root container of an application
   */
  readonly container: IContainer;
  /**
   * The controller of the root custom element of an application
   */
  readonly controller: ICustomElementController<C>;
  /**
   * The platform of an application for providing globals & DOM APIs
   */
  readonly platform: IPlatform;

  activate(): void | Promise<void>;
  deactivate(): void | Promise<void>;
}
export const IAppRoot = /*@__PURE__*/createInterface<IAppRoot>('IAppRoot');

export class AppRoot<
  T extends object,
  K extends ICustomElementViewModel = ICustomElementViewModel & (T extends Constructable<infer R> ? R : T),
> implements IAppRoot<K> {

  /** @internal */
  private _hydratePromise: Promise<void> | void = void 0;

  /** @internal */
  private _controller!: ICustomElementController<K>;

  public readonly host: HTMLElement;
  public readonly platform: IPlatform;
  public get controller() {
    return this._controller;
  }

  public constructor(
    public readonly config: IAppRootConfig<K>,
    public readonly container: IContainer,
    rootProvider: InstanceProvider<IAppRoot>,
    enhance?: boolean
  ) {
    const host = this.host = config.host;
    rootProvider.prepare(this);

    registerHostNode(container, this.platform = this._createPlatform(container, host), host);

    this._hydratePromise = onResolve(this._runAppTasks('creating'), () => {
      const childCtn = enhance ? container : container.createChild();
      const component = config.component as Constructable | ICustomElementViewModel;
      let instance: object;
      if (isFunction(component)) {
        instance = childCtn.invoke(component);
        instanceRegistration(component, instance);
      } else {
        instance = config.component as ICustomElementViewModel;
      }

      const hydrationInst: IControllerElementHydrationInstruction = { hydrate: false, projections: null };
      const definition = enhance
        ? CustomElementDefinition.create({ name: generateElementName(), template: this.host, enhance: true })
        // leave the work of figuring out the definition to the controller
        // there's proper error messages in case of failure inside the $el() call
        : void 0;
      const controller = (this._controller = Controller.$el<K>(
        childCtn,
        instance as K,
        host,
        hydrationInst,
        definition
      )) as Controller<K>;

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
        return onResolve(this._controller.activate(this._controller, null, void 0), () => {
          return this._runAppTasks('activated');
        });
      });
    });
  }

  public deactivate(): void | Promise<void> {
    return onResolve(this._runAppTasks('deactivating'), () => {
      return onResolve(this._controller.deactivate(this._controller, null), () => {
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

  /** @internal */
  private _createPlatform(container: IContainer, host: HTMLElement): IPlatform {
    let p: IPlatform;
    if (!container.has(IPlatform, false)) {
      if (host.ownerDocument.defaultView === null) {
        throw createMappedError(ErrorNames.invalid_platform_impl);
      }
      p = new BrowserPlatform(host.ownerDocument.defaultView);
      container.register(instanceRegistration(IPlatform, p));
    } else {
      p = container.get(IPlatform);
    }
    return p;
  }

  public dispose(): void {
    this._controller?.dispose();
  }
}
