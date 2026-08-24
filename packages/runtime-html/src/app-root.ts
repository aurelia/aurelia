import { BrowserPlatform } from '@aurelia/platform-browser';
import { InstanceProvider, onResolve, isFunction, isPromise } from '@aurelia/kernel';
import { IAppTask } from './app-task';
import { CustomElementDefinition, generateElementName } from './resources/custom-element';
import { Controller, IControllerElementHydrationInstruction } from './templating/controller';
import { createInterface, instanceRegistration, registerResolver } from './utilities-di';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { TaskSlot } from './app-task';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import { IPlatform } from './platform';
import { IEventTarget, registerHostNode } from './dom';
import { ErrorNames, createMappedAggregateError, createMappedError } from './errors';

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

    this._hydratePromise = onResolve(this._runAppTasks('creating'), () => {
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
      const controller = (this._controller = Controller.$el<K>(
        childCtn,
        instance as K,
        host,
        hydrationInst,
        definition,
        /* location  */null,
        /* ssrScope  */config.ssrScope,
      )) as Controller<K>;

      controller._hydrateCustomElement(hydrationInst);
      return onResolve(this._runAppTasks('hydrating'), () => {
        controller._hydrate();
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
    // A synchronous failure stops task admission. Promises from earlier tasks
    // have already started, so the phase observes them before reporting its
    // errors. This keeps rejected sibling work from escaping as unhandled.
    const container = this.container;
    const appTasks = this._useOwnAppTasks && !container.has(IAppTask, false)
      ? []
      : container.getAll(IAppTask);
    let promises: { readonly order: number; readonly promise: Promise<void> }[] | undefined;
    let errors: AppTaskError[] | undefined;
    let order = 0;

    for (let i = 0; i < appTasks.length; ++i) {
      const task = appTasks[i];
      if (task.slot !== slot) {
        continue;
      }
      let result: void | Promise<void>;
      try {
        result = task.run();
      } catch (error) {
        (errors ??= []).push({ order, error });
        break;
      }
      if (isPromise(result)) {
        (promises ??= []).push({ order, promise: result });
      }
      ++order;
    }

    if (promises === void 0) {
      throwAppTaskErrors(errors, slot);
      return;
    }
    if (promises.length === 1 && errors === void 0) {
      return promises[0].promise;
    }
    const pending = promises;
    return Promise.allSettled(pending.map(x => x.promise)).then(results => {
      // Rejection timing must not choose the public error. Restore registration
      // order after all already accepted tasks have quiesced.
      for (let i = 0; i < results.length; ++i) {
        const result = results[i];
        if (result.status === 'rejected') {
          (errors ??= []).push({ order: pending[i].order, error: result.reason });
        }
      }
      throwAppTaskErrors(errors, slot);
    });
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

interface AppTaskError {
  readonly order: number;
  readonly error: unknown;
}

function throwAppTaskErrors(errors: AppTaskError[] | undefined, slot: TaskSlot): void {
  if (errors === void 0) {
    return;
  }
  errors.sort((a, b) => a.order - b.order);
  if (errors.length === 1) {
    throw errors[0].error;
  }
  throw createMappedAggregateError(ErrorNames.app_task_phase_failed, errors.map(x => x.error), slot);
}
