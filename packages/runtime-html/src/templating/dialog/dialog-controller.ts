import { IContainer, onResolve, Registration } from '@aurelia/kernel';
import { LifecycleFlags, Scope } from '@aurelia/runtime';
import { ISyntheticView } from '../controller.js';
import {
  DialogDeactivationStatuses,
  IDialogAnimator,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,
} from './dialog-interfaces.js';
import {
  createDialogCancelError,
  createDialogCloseError,
} from './dialog-utilities.js';
import { IComposer, ICompositionContext } from '../composer.js';
import { IEventTarget, INode } from '../../dom.js';

import type {
  IDialogComponent,
  LoadedDialogSettings,
  IDialogDomSubscriber,
  IDialogClosedResult,
} from './dialog-interfaces.js';
import { IPlatform } from '../../platform.js';

export const enum ActivationResult {
  normal = 0,
  error = 1,
  cancelled = 2,
}

/**
 * A controller object for a Dialog instance.
 */
export class DialogController implements IDialogController, IDialogDomSubscriber {
  private readonly p: IPlatform;
  private readonly ctn: IContainer;
  private cmp?: IDialogComponent<object>;
  private readonly composer: IComposer;
  private readonly resolve: (data?: unknown) => void;
  private readonly reject: (reason: unknown) => void;

  /**
   * @internal
   */
  public closePromise: Promise<IDialogClosedResult> | undefined;

  /**
   * The settings used by this controller.
   */
  public readonly settings: LoadedDialogSettings;

  /**
   * @internal
   */
  private animator!: IDialogAnimator;

  /**
   * The dom structure created to support the dialog associated with this controller
   * @internal
   */
  private dom!: IDialogDom;

  /**
   * The component controller associated with this dialog controller
   */
  private controller!: ISyntheticView;

  protected static inject = [IPlatform, IContainer, IComposer];

  public constructor(
    p: IPlatform,
    container: IContainer,
    composer: IComposer,
    settings: LoadedDialogSettings,
    resolve: (data?: any) => void,
    reject: (reason: any) => void
  ) {
    container = container.createChild();
    Registration.instance(IDialogController, this).register(container);
    this.p = p;
    this.ctn = container;
    this.composer = composer;
    this.settings = settings;
    this.resolve = resolve;
    this.reject = reject;
  }

  private static getOrCreateVm(container: IContainer, settings: LoadedDialogSettings): IDialogComponent<object> {
    const Component = settings.component;
    return typeof Component === 'object'
      ? Component
      : Component == null
        ? new EmptyComponent()
        : container.invoke(Component);
  }

  /**
   * @internal
   */
  public activate(): ActivationResult | Promise<ActivationResult> {
    const {
      ctn,
      settings,
      settings: { animation, model, template, rejectOnCancel }
    } = this;
    const hostRenderer: IDialogDomRenderer = ctn.get(IDialogDomRenderer);
    const dialogTargetHost = settings.host ?? this.p.document.body;
    const dom = this.dom = hostRenderer.render(dialogTargetHost, settings);
    const rootEventTarget = ctn.has(IEventTarget, true)
      ? ctn.get(IEventTarget) as Element
      : null;

    // there's a chance that application root host is a different element with the dialog root host
    // example:
    // <body>
    //   <my-app>
    //   <au-dialog-container>
    // when it's different, needs to ensure delegate bindings work
    if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
      // it's safe to register with this container because this dialog controller
      // ensures that it's always a new child container
      ctn.register(Registration.instance(IEventTarget, dialogTargetHost));
    }

    ctn.register(
      Registration.instance(INode, dom.host),
      Registration.instance(IDialogDom, dom),
    );
    const component = this.cmp = DialogController.getOrCreateVm(ctn, settings);

    return onResolve(
      'canActivate' in component ? component.canActivate?.(model) : true,
      (canActivate) => {
        if (canActivate !== true) {
          dom.dispose();
          if (!rejectOnCancel) {
            return ActivationResult.cancelled;
          }
          return ActivationResult.error;
        }

        const compositionContext: ICompositionContext<object> = { component, host: dom.host, template, container: ctn };
        const controller = this.controller = this.composer.compose(compositionContext);
        const animator: IDialogAnimator = this.animator = ctn.get(IDialogAnimator);

        return onResolve(
          onResolve(
            animator.attaching(dom, animation),
            () => component.activate?.(model),
          ),
          () => onResolve(
            controller.activate(controller, null!, LifecycleFlags.fromBind, controller.scope),
            () => {
              // TODO:
              // subscribing too early allowing cancelling early, possibly during in-animation
              // no support for aborting dialog before it's completely shown yet
              dom.subscribe(this);
              return ActivationResult.normal;
            },
          ),
        );
      },
    );
  }

  /**
   * @internal
   */
  public deactivate<T extends DialogDeactivationStatuses>(status: T, value?: unknown): Promise<IDialogClosedResult<T>> {
    if (this.closePromise) {
      return this.closePromise as Promise<IDialogClosedResult<T>>;
    }

    const { animator, controller, dom, cmp, settings: { rejectOnCancel, animation }} = this;
    const dialogResult: IDialogClosedResult = DialogClosedResult.create(status, value);

    const promise: Promise<IDialogClosedResult<T>> = new Promise(r => {
        r('canDeactivate' in cmp! ? cmp!.canDeactivate?.(dialogResult) : true);
      })
      .catch(reason => {
        this.closePromise = undefined;
        return Promise.reject(reason);
      })
      .then(canDeactivate => {
        if (canDeactivate !== true) {
          // we are done, do not block consecutive calls
          this.closePromise = undefined;
          if (!rejectOnCancel) {
            return DialogClosedResult.create(DialogDeactivationStatuses.Abort as T);
          }
          throw createDialogCancelError();
        }
        return Promise
          .resolve(animator.detaching(dom, animation))
          .then(() => cmp!.deactivate?.(dialogResult))
          .then(() => controller.deactivate(controller, null!, LifecycleFlags.fromUnbind))
          .then(() => {
            dom.dispose();
            if (!rejectOnCancel || status) {
              this.resolve(dialogResult);
            } else {
              this.reject(createDialogCancelError(value));
            }
            return DialogClosedResult.create(status);
          })
          .catch(reason => {
            this.closePromise = undefined;
            return Promise.reject(reason);
          });
      });

    this.closePromise = promise;
    return promise;
  }

  /**
   * Closes the dialog with a successful output.
   * @param value The returned success output.
   */
  public ok(value?: unknown): Promise<IDialogClosedResult<DialogDeactivationStatuses.Ok>> {
    return this.close(DialogDeactivationStatuses.Ok, value);
  }

  /**
   * Closes the dialog with a cancel output.
   * @param value The returned cancel output.
   */
  public cancel(value?: unknown): Promise<IDialogClosedResult<DialogDeactivationStatuses.Cancel>> {
    return this.close(DialogDeactivationStatuses.Cancel, value);
  }

  /**
   * Closes the dialog with an error output.
   * @param value A reason for closing with an error.
   * @returns Promise An empty promise object.
   */
  public error(value: unknown): Promise<void> {
    const closeError = createDialogCloseError(value);
    return new Promise(r =>
        r(this.cmp!.deactivate?.(DialogClosedResult.create(DialogDeactivationStatuses.Error, closeError)))
      )
      .then(() => this.controller.deactivate(this.controller, null!, LifecycleFlags.fromUnbind))
      .then(() => { this.reject(closeError); });
  }

  /**
   * Closes the dialog.
   * @param status Whether or not the user input signified success.
   * @param value The specified output.
   * @returns Promise An empty promise object.
   */
  public close<T extends DialogDeactivationStatuses>(status: T, value?: unknown): Promise<IDialogClosedResult<T>> {
    return this.deactivate(status, value);
  }

  /**
   * @internal
   */
  public handleOverlayClick(event: MouseEvent): void {
    if (/* user allows dismiss on overlay click */!this.settings.lock
      && /* did not click inside the host element */!this.dom.host.contains(event.target as Element)
    ) {
      this.cancel();
    }
  }
}

class EmptyComponent {}

class DialogClosedResult<T extends DialogDeactivationStatuses> implements IDialogClosedResult {
  protected constructor(
    readonly status: T,
    readonly value?: unknown,
  ) {}

  public static create<T extends DialogDeactivationStatuses>(status: T, value?: unknown): IDialogClosedResult<T> {
    return new DialogClosedResult(status, value);
  }
}
