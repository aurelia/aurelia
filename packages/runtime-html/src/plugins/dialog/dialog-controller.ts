import { Constructable, IContainer, InstanceProvider, onResolve } from '@aurelia/kernel';
import { LifecycleFlags, Controller, ICustomElementController } from '../../templating/controller';
import {
  DialogDeactivationStatuses,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,
  DialogOpenResult,
  DialogCloseResult,
  DialogCancelError,
  DialogCloseError,
} from './dialog-interfaces';
import { IEventTarget, INode } from '../../dom';
import { IPlatform } from '../../platform';
import { CustomElement, CustomElementDefinition } from '../../resources/custom-element';
import { isFunction } from '../../utilities';
import { instanceRegistration } from '../../utilities-di';

import type {
  IDialogComponent,
  IDialogLoadedSettings,
} from './dialog-interfaces';

/**
 * A controller object for a Dialog instance.
 */
export class DialogController implements IDialogController {
  private readonly p: IPlatform;
  private readonly ctn: IContainer;

  /** @internal */
  private cmp!: IDialogComponent<object>;

  /** @internal */
  private _resolve!: (result: DialogCloseResult) => void;

  /** @internal */
  private _reject!: (reason: unknown) => void;

  /**
   * @internal
   */
  private _closingPromise: Promise<DialogCloseResult> | undefined;

  /**
   * The settings used by this controller.
   */
  public settings!: IDialogLoadedSettings;

  public readonly closed: Promise<DialogCloseResult>;

  /**
   * The dom structure created to support the dialog associated with this controller
   */
  private dom!: IDialogDom;

  /**
   * The component controller associated with this dialog controller
   *
   * @internal
   */
  private controller!: ICustomElementController;

  protected static get inject() { return [IPlatform, IContainer]; }

  public constructor(
    p: IPlatform,
    container: IContainer,
  ) {
    this.p = p;
    this.ctn = container;
    this.closed = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /** @internal */
  public activate(settings: IDialogLoadedSettings): Promise<DialogOpenResult> {
    const container = this.ctn.createChild();
    const { model, template, rejectOnCancel } = settings;
    const hostRenderer: IDialogDomRenderer = container.get(IDialogDomRenderer);
    const dialogTargetHost = settings.host ?? this.p.document.body;
    const dom = this.dom = hostRenderer.render(dialogTargetHost, settings);
    const rootEventTarget = container.has(IEventTarget, true)
      ? container.get(IEventTarget) as Element
      : null;
    const contentHost = dom.contentHost;

    this.settings = settings;
    // application root host may be a different element with the dialog root host
    // example:
    // <body>
    //   <my-app>
    //   <au-dialog-container>
    // when it's different, needs to ensure delegate bindings work
    if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
      container.register(instanceRegistration(IEventTarget, dialogTargetHost));
    }

    container.register(
      instanceRegistration(INode, contentHost),
      instanceRegistration(IDialogDom, dom),
    );

    return new Promise(r => {
        const cmp = Object.assign(this.cmp = this.getOrCreateVm(container, settings, contentHost), { $dialog: this });
        r(cmp.canActivate?.(model) ?? true);
      })
      .then(canActivate => {
        if (canActivate !== true) {
          dom.dispose();
          if (rejectOnCancel) {
            throw createDialogCancelError(null, 'Dialog activation rejected');
          }
          return DialogOpenResult.create(true, this);
        }

        const cmp = this.cmp;

        return onResolve(cmp.activate?.(model), () => {
          const ctrlr = this.controller = Controller.$el(
            container,
            cmp,
            contentHost,
            null,
            CustomElementDefinition.create(
              this.getDefinition(cmp) ?? { name: CustomElement.generateName(), template }
            )
          ) as ICustomElementController;
          return onResolve(ctrlr.activate(ctrlr, null, LifecycleFlags.fromBind), () => {
            dom.overlay.addEventListener(settings.mouseEvent ?? 'click', this);
            return DialogOpenResult.create(false, this);
          });
        });
      }, e => {
        dom.dispose();
        throw e;
      });
  }

  /** @internal */
  public deactivate<T extends DialogDeactivationStatuses>(status: T, value?: unknown): Promise<DialogCloseResult<T>> {
    if (this._closingPromise) {
      return this._closingPromise as Promise<DialogCloseResult<T>>;
    }

    let deactivating = true;
    const { controller, dom, cmp, settings: { mouseEvent, rejectOnCancel }} = this;
    const dialogResult = DialogCloseResult.create(status, value);

    const promise: Promise<DialogCloseResult<T>> = new Promise<DialogCloseResult<T>>(r => {
      r(onResolve(
        cmp.canDeactivate?.(dialogResult) ?? true,
        canDeactivate => {
          if (canDeactivate !== true) {
            // we are done, do not block consecutive calls
            deactivating = false;
            this._closingPromise = void 0;
            if (rejectOnCancel) {
              throw createDialogCancelError(null, 'Dialog cancellation rejected');
            }
            return DialogCloseResult.create(DialogDeactivationStatuses.Abort as T);
          }
          return onResolve(cmp.deactivate?.(dialogResult),
            () => onResolve(controller.deactivate(controller, null, LifecycleFlags.fromUnbind),
              () => {
                dom.dispose();
                dom.overlay.removeEventListener(mouseEvent ?? 'click', this);
                if (!rejectOnCancel && status !== DialogDeactivationStatuses.Error) {
                  this._resolve(dialogResult);
                } else {
                  this._reject(createDialogCancelError(value, 'Dialog cancelled with a rejection on cancel'));
                }
                return dialogResult;
              }
            )
          );
        }
      ));
    }).catch(reason => {
      this._closingPromise = void 0;
      throw reason;
    });
    // when component canDeactivate is synchronous, and returns something other than true
    // then the below assignment will override
    // the assignment inside the callback without the deactivating variable check
    this._closingPromise = deactivating ? promise : void 0;
    return promise;
  }

  /**
   * Closes the dialog with a successful output.
   *
   * @param value - The returned success output.
   */
  public ok(value?: unknown): Promise<DialogCloseResult<DialogDeactivationStatuses.Ok>> {
    return this.deactivate(DialogDeactivationStatuses.Ok, value);
  }

  /**
   * Closes the dialog with a cancel output.
   *
   * @param value - The returned cancel output.
   */
  public cancel(value?: unknown): Promise<DialogCloseResult<DialogDeactivationStatuses.Cancel>> {
    return this.deactivate(DialogDeactivationStatuses.Cancel, value);
  }

  /**
   * Closes the dialog with an error output.
   *
   * @param value - A reason for closing with an error.
   * @returns Promise An empty promise object.
   */
  public error(value: unknown): Promise<void> {
    const closeError = createDialogCloseError(value);
    return new Promise(r => r(onResolve(
      this.cmp.deactivate?.(DialogCloseResult.create(DialogDeactivationStatuses.Error, closeError)),
      () => onResolve(
        this.controller.deactivate(this.controller, null, LifecycleFlags.fromUnbind),
        () => {
          this.dom.dispose();
          this._reject(closeError);
        }
      )
    )));
  }

  /** @internal */
  public handleEvent(event: MouseEvent): void {
    if (/* user allows dismiss on overlay click */this.settings.overlayDismiss
      && /* did not click inside the host element */!this.dom.contentHost.contains(event.target as Element)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.cancel();
    }
  }

  private getOrCreateVm(container: IContainer, settings: IDialogLoadedSettings, host: HTMLElement): IDialogComponent<object> {
    const Component = settings.component;
    if (Component == null) {
      return new EmptyComponent();
    }
    if (typeof Component === 'object') {
      return Component;
    }

    const p = this.p;

    container.registerResolver(
      p.HTMLElement,
      container.registerResolver(
        p.Element,
        container.registerResolver(INode, new InstanceProvider('ElementResolver', host))
      )
    );

    return container.invoke(Component);
  }

  private getDefinition(component?: object | Constructable) {
    const Ctor = (isFunction(component)
      ? component
      : component?.constructor) as Constructable;
    return CustomElement.isType(Ctor)
      ? CustomElement.getDefinition(Ctor)
      : null;
  }
}

class EmptyComponent {}

function createDialogCancelError<T>(output: T | undefined, msg: string): DialogCancelError<T> {
  const error = new Error(msg) as DialogCancelError<T>;
  error.wasCancelled = true;
  error.value = output;
  return error;
}

function createDialogCloseError<T = unknown>(output: T): DialogCloseError<T> {
  const error = new Error() as DialogCloseError<T>;
  error.wasCancelled = false;
  error.value = output;
  return error;
}
