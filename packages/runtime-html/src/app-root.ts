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

const controllerDeactivationStage = 1;
const deactivatedTasksStage = 2;
const deactivationCompleteStage = 3;
type DeactivationStage =
  | typeof controllerDeactivationStage
  | typeof deactivatedTasksStage
  | typeof deactivationCompleteStage;

export class AppRoot<
  T extends object,
  K extends ICustomElementViewModel = ICustomElementViewModel & (T extends Constructable<infer R> ? R : T),
> implements IAppRoot<K> {

  /** @internal */
  private _hydratePromise: Promise<void> | void = void 0;
  /** @internal */
  private _hydrateFailed: boolean = false;
  /** @internal */
  public get _isRecoverable(): boolean { return !this._hydrateFailed; }

  /** @internal */
  private _controller!: ICustomElementController<K>;

  /** @internal */
  private readonly _useOwnAppTasks: boolean;
  // AppRoot.deactivate can report only success or an error. Aurelia additionally
  // needs to know whether that error was a pre-stop AppTask veto (the root is
  // untouched) or whether mandatory teardown had begun. This one-shot handshake
  // keeps that distinction private to the AppRoot/Aurelia transition pair.
  /** @internal */
  private _lastDeactivationVeto: boolean = false;

  /** @internal */
  public _consumeDeactivationVeto(): boolean {
    const veto = this._lastDeactivationVeto;
    this._lastDeactivationVeto = false;
    return veto;
  }

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

    const hydration = onResolve(this._runAppTasks('creating'), () => {
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
    if (isPromise(hydration)) {
      // A rejected hydration Promise is replayed by every later activate().
      // Mark this root for quarantine instead of presenting it as retryable.
      const tracked = hydration.catch(error => {
        this._hydrateFailed = true;
        throw error;
      });
      this._hydratePromise = tracked;
    }
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
    return this._deactivate(true);
  }

  /** @internal */
  public _deactivateForRollback(): void | Promise<void> {
    return this._deactivate(false);
  }

  /** @internal */
  private _deactivate(allowVeto: boolean): void | Promise<void> {
    this._lastDeactivationVeto = false;
    let result: void | Promise<void>;
    try {
      // Deactivating tasks are a pre-stop veto for a running app (Dialog relies
      // on this). During failed-start rollback there is no successful app to
      // preserve, so their errors are retained while cleanup continues.
      result = this._runAppTasks('deactivating', true);
    } catch (error) {
      if (allowVeto) {
        this._lastDeactivationVeto = true;
        throw error;
      }
      return this._continueDeactivation(controllerDeactivationStage, [error]);
    }
    if (isPromise(result)) {
      return result.then(
        () => this._continueDeactivation(controllerDeactivationStage),
        error => {
          if (allowVeto) {
            this._lastDeactivationVeto = true;
            throw error;
          }
          return this._continueDeactivation(controllerDeactivationStage, [error]);
        },
      );
    }
    return this._continueDeactivation(controllerDeactivationStage);
  }

  /** @internal */
  private _continueDeactivation(stage: DeactivationStage, errors?: unknown[]): void | Promise<void> {
    // Deactivating AppTasks are handled above because they alone may veto an
    // ordinary stop. Controller teardown and then deactivated AppTasks are
    // mandatory best-effort stages, in that order.
    while (stage !== deactivationCompleteStage) {
      const nextStage = stage === controllerDeactivationStage
        ? deactivatedTasksStage
        : deactivationCompleteStage;
      let result: void | Promise<void>;
      try {
        switch (stage) {
          case controllerDeactivationStage:
            result = this._controller?.deactivate(this._controller, null);
            break;
          case deactivatedTasksStage:
            result = this._runAppTasks('deactivated', true);
            break;
        }
      } catch (error) {
        (errors ??= []).push(error);
        stage = nextStage;
        continue;
      }

      if (isPromise(result)) {
        return result.then(
          () => this._continueDeactivation(nextStage, errors),
          error => {
            (errors ??= []).push(error);
            return this._continueDeactivation(nextStage, errors);
          },
        );
      }
      stage = nextStage;
    }

    if (errors?.length === 1) {
      throw errors[0];
    }
    if (errors != null && errors.length > 1) {
      throw createMappedAggregateError(ErrorNames.app_root_deactivation_cleanup_failed, errors);
    }
  }

  /** @internal */
  private _runAppTasks(slot: TaskSlot, bestEffort: boolean = false): void | Promise<void> {
    // `bestEffort` controls admission after a synchronous throw; it does not make
    // accepted async tasks fail-fast. Every accepted task quiesces before an error
    // is reported so activation rollback and teardown cannot race task-owned work.
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
        if (!bestEffort) {
          break;
        }
        ++order;
        continue;
      }
      if (isPromise(result)) {
        (promises ??= []).push({ order, promise: result });
      }
      ++order;
    }

    if (promises === void 0) {
      throwAppTaskErrors(errors);
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
      throwAppTaskErrors(errors);
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

function throwAppTaskErrors(errors: AppTaskError[] | undefined): void {
  if (errors === void 0) {
    return;
  }
  errors.sort((a, b) => a.order - b.order);
  if (errors.length === 1) {
    throw errors[0].error;
  }
  throw createMappedAggregateError(ErrorNames.app_task_phase_failed, errors.map(x => x.error));
}
