import { BrowserPlatform } from '@aurelia/platform-browser';
import { InstanceProvider, onResolve, onResolveAll, isFunction, isPromise, noop } from '@aurelia/kernel';
import { IAppTask } from './app-task';
import { CustomElementDefinition, generateElementName } from './resources/custom-element';
import { Controller, IControllerElementHydrationInstruction } from './templating/controller';
import { notifyErrorHandler } from './templating/error-handling';
import { createInterface, instanceRegistration, registerResolver } from './utilities-di';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { TaskSlot } from './app-task';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import { IPlatform } from './platform';
import { IEventTarget, registerHostNode } from './dom';
import { ErrorNames, createMappedError } from './errors';

import type { ISSRScope } from './templating/ssr';

export interface IAppRootConfig<T extends object = object> {
  host: HTMLElement;
  component: T | Constructable<T>;
  /**
   * When a HTML form is submitted, the default behavior is to "redirect" the page to the action of the form
   * This is not desirable for SPA applications, so by default, this behavior is prevented.
   *
   * This option re-enables the default behavior of HTML forms.
   */
  allowActionlessForm?: boolean;
  /**
   * Indicates strictness of expression evaluation.
   *
   * When strictBinding is true, standard JS behavior applies, which means accessing a property of undefined will throw an error.
   * Use optional syntaxes (?./?.()/?.[]) to prevent errors.
   *
   * When strictBinding is false (default), the behavior is more lenient, which means accessing a property of undefined will return undefined.
   * In this mode, calling an undefined function will return undefined as well.
   */
  strictBinding?: boolean;
  /**
   * Tree-shaped SSR manifest scope for hydration.
   * Built by recordManifest() after SSR render, mirrors the controller tree.
   */
  ssrScope?: ISSRScope;
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

  /** @internal */
  private readonly _useOwnAppTasks: boolean;

  public readonly host: HTMLElement;
  public readonly platform: IPlatform;
  public get controller() {
    return this._controller;
  }

  public constructor(
    public readonly config: IAppRootConfig<K>,
    public readonly container: IContainer,
    rootProvider: InstanceProvider<IAppRoot>,
    enhance: boolean = false,
  ) {
    this._useOwnAppTasks = enhance;
    const host = this.host = config.host;
    rootProvider.prepare(this);

    registerResolver(container, IEventTarget, new InstanceProvider<IEventTarget>('IEventTarget', host));
    registerHostNode(container, host, this.platform = this._createPlatform(container, host));

    // Component construction and hydration failures reject start() (or throw
    // out of app() when nothing defers them); report them first. App task
    // failures are reported by _runAppTasks, so the tasks stay outside.
    const onHydrationFailed = (err: unknown): never => {
      notifyErrorHandler(container, err, this._controller ?? null, 'attaching', false);
      throw err;
    };
    this._hydratePromise = onResolve(this._runAppTasks('creating'), () => {
      let controller: Controller<K>;
      try {
        if (!config.allowActionlessForm !== false) {
          host.addEventListener('submit', (e: Event) => {
            const target = e.target as HTMLFormElement;
            const noAction = !target.getAttribute('action');

            if (target.tagName === 'FORM' && noAction) {
              e.preventDefault();
            }
          }, false);
        }

        const childCtn = enhance ? container : container.createChild();
        const component = config.component as Constructable | ICustomElementViewModel;
        let instance: object;
        if (isFunction(component)) {
          instance = childCtn.invoke(component);
          instanceRegistration(component, instance);
        } else {
          instance = config.component as ICustomElementViewModel;
        }

        const hydrationInst: IControllerElementHydrationInstruction = {
          hydrate: false,
          projections: null,
        };
        const definition = enhance
          ? CustomElementDefinition.create({ name: generateElementName(), template: this.host, enhance: true, strict: config.strictBinding })
          // leave the work of figuring out the definition to the controller
          // there's proper error messages in case of failure inside the $el() call
          : void 0;
        controller = (this._controller = Controller.$el<K>(
          childCtn,
          instance as K,
          host,
          hydrationInst,
          definition,
          /* location  */null,
          /* ssrScope  */config.ssrScope,
        )) as Controller<K>;

        controller._hydrateCustomElement(hydrationInst);
      } catch (err) {
        return onHydrationFailed(err);
      }
      return onResolve(this._runAppTasks('hydrating'), () => {
        try {
          controller._hydrate();
        } catch (err) {
          return onHydrationFailed(err);
        }
        return onResolve(this._runAppTasks('hydrated'), () => {
          try {
            controller._hydrateChildren();
          } catch (err) {
            return onHydrationFailed(err);
          }
          this._hydratePromise = void 0;
        });
      });
    });
  }

  public activate(): void | Promise<void> {
    return onResolve(this._hydratePromise, () => {
      return onResolve(this._runAppTasks('activating'), () => {
        const controller = this._controller;
        const onActivationFailed = (err: unknown): never => {
          notifyErrorHandler(this.container, err, controller, 'attaching', false);
          throw err;
        };
        let activation: void | Promise<void>;
        try {
          activation = controller.activate(controller, null, void 0);
        } catch (err) {
          return onActivationFailed(err);
        }
        if (isPromise(activation)) {
          return activation.then(() => this._runAppTasks('activated'), onActivationFailed);
        }
        return this._runAppTasks('activated');
      });
    });
  }

  public deactivate(): void | Promise<void> {
    return onResolve(this._runAppTasks('deactivating'), () => {
      const controller = this._controller;
      const onDeactivationFailed = (err: unknown): never => {
        notifyErrorHandler(this.container, err, controller, 'detaching', false);
        throw err;
      };
      let deactivation: void | Promise<void>;
      try {
        deactivation = controller.deactivate(controller, null);
      } catch (err) {
        return onDeactivationFailed(err);
      }
      if (isPromise(deactivation)) {
        return deactivation.then(() => this._runAppTasks('deactivated'), onDeactivationFailed);
      }
      return this._runAppTasks('deactivated');
    });
  }

  /** @internal */
  private _runAppTasks(slot: TaskSlot): void | Promise<void> {
    const container = this.container;
    const appTasks = this._useOwnAppTasks && !container.has(IAppTask, false)
      ? []
      : container.getAll(IAppTask);
    const results: (void | Promise<void>)[] = [];
    // App tasks belong to no controller; their failures still reject start()
    // or stop(), and are reported first like every other caught error.
    const report = (error: unknown): void => {
      notifyErrorHandler(container, error, null, 'task', false);
    };
    try {
      for (let i = 0; i < appTasks.length; ++i) {
        const task = appTasks[i];
        if (task.slot === slot) {
          results.push(task.run());
        }
      }
    } catch (error) {
      // A synchronous throw ends the phase immediately. Earlier task Promises
      // remain application-owned, but observing their rejection keeps a later
      // failure from escaping after the original error has been reported.
      const pending = onResolveAll(...results);
      if (isPromise(pending)) {
        void pending.catch(noop);
      }
      report(error);
      throw error;
    }
    const result = onResolveAll(...results);
    return isPromise(result)
      ? result.catch((error: unknown) => {
        report(error);
        throw error;
      })
      : result;
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
