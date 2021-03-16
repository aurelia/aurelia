import { IContainer, newInstanceOf, onResolve, Registration } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { ISyntheticView } from '../controller.js';
import {
  IDialogComponent,
  IDialogController,
  IDialogAnimator,
  LoadedDialogSettings,
  IDialogDomRenderer,
  IDialogDom,
  IDialogDomSubscriber,
} from './dialog-interfaces.js';
import {
  createDialogCancelError,
  createDialogCloseError,
} from './dialog-utilities.js';
import { IComposer, ICompositionContext } from '../composer.js';
import { IEventTarget, INode } from '../../dom.js';

import type {
  IDialogCancelableOperationResult,
  IDialogCloseResult,
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
  private readonly container: IContainer;
  private viewModel?: IDialogComponent<object>;
  private readonly composer: IComposer;
  private readonly resolve: (data?: unknown) => void;
  private readonly reject: (reason: unknown) => void;

  /**
   * @internal
   */
  public closePromise: Promise<IDialogCancelableOperationResult> | undefined;

  /**
   * The settings used by this controller.
   */
  public readonly settings: LoadedDialogSettings;

  /**
   * @internal
   */
  public animator!: IDialogAnimator;

  /**
   * The dom structure created to support the dialog associated with this controller
   * @internal
   */
  private dialogDom!: IDialogDom;

  /**
   * The component controller associated with this dialog controller
   */
  public controller!: ISyntheticView;

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
    this.container = container;
    this.composer = composer;
    this.settings = settings;
    this.resolve = resolve;
    this.reject = reject;
  }

  private static getOrCreateVm(container: IContainer, settings: LoadedDialogSettings): IDialogComponent<object> {
    const ViewModel = settings.viewModel;
    return typeof ViewModel === 'object'
      ? ViewModel
      : ViewModel == null
        ? new EmptyViewModel()
        : container.invoke(ViewModel);
  }

  /**
   * @internal
   */
  public activate(): ActivationResult | Promise<ActivationResult> {
    const {
      container,
      settings,
      settings: { animation, model, template, rejectOnCancel }
    } = this;
    const hostRenderer: IDialogDomRenderer = container.get(newInstanceOf(IDialogDomRenderer));
    const dialogTargetHost = settings.host ?? this.p.document.body;
    const dom = this.dialogDom = hostRenderer.render(dialogTargetHost, settings);
    const rootEventTarget = container.has(IEventTarget, true)
      ? container.get(IEventTarget) as Element
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
      container.register(Registration.instance(IEventTarget, dialogTargetHost));
    }

    container.register(
      Registration.instance(INode, dom.host),
      Registration.instance(IDialogDom, dom.host),
    );
    const viewModel = this.viewModel = DialogController.getOrCreateVm(container, settings);

    return onResolve(
      viewModel.canActivate?.(model),
      (canActivate) => {
        if (!canActivate) {
          dom.dispose();
          if (!rejectOnCancel) {
            return ActivationResult.cancelled;
          }
          return ActivationResult.error;
        }

        const compositionContext: ICompositionContext<object> = { viewModel, host: dom.host, template, container };
        const controller = this.controller = this.composer.compose(compositionContext);
        const animator: IDialogAnimator = this.animator = container.get(newInstanceOf(IDialogAnimator));

        return onResolve(
          onResolve(
            animator.attaching(dom, animation),
            () => viewModel.activate?.(model),
          ),
          () => onResolve(
            onResolve(
              controller.activate(controller, null!, LifecycleFlags.fromBind, null!),
              () => animator.attached(dom, animation),
            ),
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
  public deactivate(ok: boolean, output?: any): Promise<IDialogCancelableOperationResult> {
    if (this.closePromise) {
      return this.closePromise;
    }

    const { viewModel, settings: { rejectOnCancel }} = this;
    const dialogResult: IDialogCloseResult = { wasCancelled: !ok, output };

    return this.closePromise = new Promise(r => r(viewModel!.canDeactivate?.(dialogResult)))
      .catch(reason => {
        this.closePromise = undefined;
        return Promise.reject(reason);
      })
      .then(canDeactivate => {
        if (!canDeactivate) {
          // we are done, do not block consecutive calls
          this.closePromise = undefined;
          if (!rejectOnCancel) {
            return { wasCancelled: true };
          }
          throw createDialogCancelError();
        }
        return Promise
          .resolve(viewModel!.deactivate?.(dialogResult))
          .then(() => this.controller.deactivate(this.controller, null!, LifecycleFlags.fromUnbind))
          .then(() => {
            this.dialogDom.dispose();
            if (!rejectOnCancel || ok) {
              this.resolve(dialogResult);
            } else {
              this.reject(createDialogCancelError(output));
            }
            return { wasCancelled: false };
          })
          .catch(reason => {
            this.closePromise = undefined;
            return Promise.reject(reason);
          });
      });
  }

  /**
   * Closes the dialog with a successful output.
   * @param output The returned success output.
   */
  public ok(output?: unknown): Promise<IDialogCancelableOperationResult> {
    return this.close(true, output);
  }

  /**
   * Closes the dialog with a cancel output.
   * @param output The returned cancel output.
   */
  public cancel(output?: unknown): Promise<IDialogCancelableOperationResult> {
    return this.close(false, output);
  }

  /**
   * Closes the dialog with an error output.
   * @param output A reason for closing with an error.
   * @returns Promise An empty promise object.
   */
  public error(output: unknown): Promise<void> {
    const closeError = createDialogCloseError(output);
    return new Promise(r => r(this.viewModel!.deactivate?.(closeError)))
      .then(() => this.controller.deactivate(this.controller, null!, LifecycleFlags.fromUnbind))
      .then(() => { this.reject(closeError); });
  }

  /**
   * Closes the dialog.
   * @param ok Whether or not the user input signified success.
   * @param output The specified output.
   * @returns Promise An empty promise object.
   */
  public close(ok: boolean, output?: unknown): Promise<IDialogCancelableOperationResult> {
    return this.deactivate(ok, output);
  }

  /**
   * @internal
   */
  public handleOverlayClick(event: MouseEvent): void {
    if (/* user allows dismiss on overlay click */!this.settings.lock
      && /* did not click inside the host element */!this.dialogDom.host.contains(event.target as Element)
    ) {
      this.cancel();
    }
  }
}

class EmptyViewModel {}
