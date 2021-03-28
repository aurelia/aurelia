import { IContainer, onResolve, Registration } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { ISyntheticView } from '../controller.js';
import {
  DialogDeactivationStatuses,
  IDialogAnimator,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,
  IDialogOpenResult,
  IDialogCancelError,
  IDialogCloseError,
} from './dialog-interfaces.js';
import { IComposer, ICompositionContext } from '../composer.js';
import { IEventTarget, INode } from '../../dom.js';

import type {
  IDialogComponent,
  ILoadedDialogSettings,
  IDialogDomSubscriber,
  IDialogCloseResult,
} from './dialog-interfaces.js';
import { IPlatform } from '../../platform.js';

/**
 * A controller object for a Dialog instance.
 */
export class DialogController implements IDialogController, IDialogDomSubscriber {
  private readonly p: IPlatform;
  private readonly ctn: IContainer;
  private readonly composer: IComposer;

  /** @internal */
  private cmp!: IDialogComponent<object>;

  /** @internal */
  private resolve!: (result: IDialogCloseResult) => void;

  /** @internal */
  private reject!: (reason: unknown) => void;

  /**
   * @internal
   */
  private closingPromise: Promise<IDialogCloseResult> | undefined;

  /**
   * The settings used by this controller.
   */
  public settings!: ILoadedDialogSettings;

  /** @internal */
  private animator!: IDialogAnimator;

  /**
   * The dom structure created to support the dialog associated with this controller
   *
   * @internal
   */
  private dom!: IDialogDom;

  /**
   * The component controller associated with this dialog controller
   *
   * @internal
   */
  private controller!: ISyntheticView;

  protected static inject = [IPlatform, IContainer, IComposer];

  public constructor(
    p: IPlatform,
    container: IContainer,
    composer: IComposer,
  ) {
    this.p = p;
    this.ctn = container;
    this.composer = composer;
  }

  private getOrCreateVm(container: IContainer, settings: ILoadedDialogSettings): IDialogComponent<object> {
    const Component = settings.component;
    return typeof Component === 'object'
      ? Component
      : Component == null
        ? new EmptyComponent()
        : container.invoke(Component);
  }

  /** @internal */
  public activate(settings: ILoadedDialogSettings): IDialogOpenResult | Promise<IDialogOpenResult> {
    const { ctn } = this;
    const { animation, model, template, rejectOnCancel } = settings;
    const hostRenderer: IDialogDomRenderer = ctn.get(IDialogDomRenderer);
    const dialogTargetHost = settings.host ?? this.p.document.body;
    const dom = this.dom = hostRenderer.render(dialogTargetHost, settings);
    const rootEventTarget = ctn.has(IEventTarget, true)
      ? ctn.get(IEventTarget) as Element
      : null;

    this.settings = settings;
    // application root host may be a different element with the dialog root host
    // example:
    // <body>
    //   <my-app>
    //   <au-dialog-container>
    // when it's different, needs to ensure delegate bindings work
    if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
      ctn.register(Registration.instance(IEventTarget, dialogTargetHost));
    }

    ctn.register(
      Registration.instance(INode, dom.host),
      Registration.instance(IDialogDom, dom),
    );
    const component = this.cmp = this.getOrCreateVm(ctn, settings);
    const closePromise: Promise<IDialogCloseResult> = new Promise((rs, rj) => {
      this.resolve = rs;
      this.reject = rj;
    });

    return onResolve(
      'canActivate' in component ? component.canActivate?.(model) : true,
      (canActivate) => {
        if (canActivate !== true) {
          dom.dispose();
          if (rejectOnCancel) {
            throw createDialogCancelError(null, 'Dialog activation rejected');
          }
          return DialogOpenResult.create(true, this, closePromise);
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
              dom.subscribe(this);
              return DialogOpenResult.create(false, this, closePromise);
            },
          ),
        );
      },
    );
  }

  /** @internal */
  public deactivate<T extends DialogDeactivationStatuses>(status: T, value?: unknown): Promise<IDialogCloseResult<T>> {
    if (this.closingPromise) {
      return this.closingPromise as Promise<IDialogCloseResult<T>>;
    }

    const { animator, controller, dom, cmp, settings: { rejectOnCancel, animation }} = this;
    const dialogResult: IDialogCloseResult = DialogClosedResult.create(status, value);

    const promise: Promise<IDialogCloseResult<T>> = new Promise(r => {
        r('canDeactivate' in cmp ? cmp.canDeactivate?.(dialogResult) : true);
      })
      .catch(reason => {
        this.closingPromise = undefined;
        return Promise.reject(reason);
      })
      .then(canDeactivate => {
        if (canDeactivate !== true) {
          // we are done, do not block consecutive calls
          this.closingPromise = undefined;
          if (!rejectOnCancel) {
            return DialogClosedResult.create(DialogDeactivationStatuses.Abort as T);
          }
          throw createDialogCancelError(null, 'Dialog cancellation rejected');
        }
        return Promise
          .resolve(animator.detaching(dom, animation))
          .then(() => cmp.deactivate?.(dialogResult))
          .then(() => controller.deactivate(controller, null!, LifecycleFlags.fromUnbind))
          .then(() => {
            dom.unsubscribe(this);
            dom.dispose();
            if (!rejectOnCancel && status !== DialogDeactivationStatuses.Error) {
              this.resolve(dialogResult);
            } else {
              this.reject(createDialogCancelError(value, 'Dialog cancelled with a rejection on cancel'));
            }
            return DialogClosedResult.create(status);
          })
          .catch(reason => {
            this.closingPromise = undefined;
            return Promise.reject(reason);
          });
      });

    this.closingPromise = promise;
    return promise;
  }

  /**
   * Closes the dialog with a successful output.
   *
   * @param value - The returned success output.
   */
  public ok(value?: unknown): Promise<IDialogCloseResult<DialogDeactivationStatuses.Ok>> {
    return this.close(DialogDeactivationStatuses.Ok, value);
  }

  /**
   * Closes the dialog with a cancel output.
   *
   * @param value - The returned cancel output.
   */
  public cancel(value?: unknown): Promise<IDialogCloseResult<DialogDeactivationStatuses.Cancel>> {
    return this.close(DialogDeactivationStatuses.Cancel, value);
  }

  /**
   * Closes the dialog with an error output.
   *
   * @param value - A reason for closing with an error.
   * @returns Promise An empty promise object.
   */
  public error(value: unknown): Promise<void> {
    const closeError = createDialogCloseError(value);
    return new Promise(r =>
        r(this.cmp.deactivate?.(DialogClosedResult.create(DialogDeactivationStatuses.Error, closeError)))
      )
      .then(() => this.controller.deactivate(this.controller, null!, LifecycleFlags.fromUnbind))
      .then(() => { this.reject(closeError); });
  }

  /**
   * Closes the dialog.
   *
   * @param status - Whether or not the user input signified success.
   * @param value - The specified output.
   * @returns Promise An empty promise object.
   */
  public close<T extends DialogDeactivationStatuses>(status: T, value?: unknown): Promise<IDialogCloseResult<T>> {
    return this.deactivate(status, value);
  }

  /** @internal */
  public handleOverlayClick(event: MouseEvent): void {
    if (/* user allows dismiss on overlay click */!this.settings.lock
      && /* did not click inside the host element */!this.dom.host.contains(event.target as Element)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.cancel();
    }
  }
}

class EmptyComponent {}

class DialogOpenResult implements IDialogOpenResult {
  protected constructor(
    public readonly wasCancelled: boolean,
    public readonly controller: IDialogController,
    public readonly closePromise: Promise<IDialogCloseResult>,
  ) {}

  public static create(
    wasCancelled: boolean,
    controller: IDialogController,
    closePromise: Promise<IDialogCloseResult>,
  ) {
    return new DialogOpenResult(wasCancelled, controller, closePromise);
  }
}

class DialogClosedResult<T extends DialogDeactivationStatuses> implements IDialogCloseResult {
  protected constructor(
    public readonly status: T,
    public readonly value?: unknown,
  ) {}

  public static create<T extends DialogDeactivationStatuses>(status: T, value?: unknown): IDialogCloseResult<T> {
    return new DialogClosedResult(status, value);
  }
}

function createDialogCancelError<T>(output: T | undefined, msg: string): IDialogCancelError<T> {
  const error = new Error(msg) as IDialogCancelError<T>;
  error.wasCancelled = true;
  error.value = output;
  return error;
}

function createDialogCloseError<T = unknown>(output: T): IDialogCloseError<T> {
  const error = new Error() as IDialogCloseError<T>;
  error.wasCancelled = false;
  error.value = output;
  return error;
}
