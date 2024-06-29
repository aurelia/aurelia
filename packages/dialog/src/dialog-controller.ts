import { isFunction, type Constructable, IContainer, InstanceProvider, onResolve, type IDisposable, resolve } from '@aurelia/kernel';
import { Controller, ICustomElementController, IEventTarget, INode, IPlatform, CustomElement, CustomElementDefinition, registerHostNode } from '@aurelia/runtime-html';
import {
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,
  DialogOpenResult,
  DialogCloseResult,
  DialogCancelError,
  DialogCloseError,
  IDialogEventManager,
} from './dialog-interfaces';
import { instanceRegistration } from './utilities-di';

import type {
  DialogDeactivationStatuses,
  IDialogComponent,
  IDialogLoadedSettings,
} from './dialog-interfaces';
import { ErrorNames, createMappedError } from './errors';

/**
 * A controller object for a Dialog instance.
 */
export class DialogController implements IDialogController {
  private readonly p = resolve(IPlatform);
  private readonly ctn = resolve(IContainer);

  /** @internal */
  private cmp!: IDialogComponent<object>;

  /** @internal */
  private _resolve!: (result: DialogCloseResult) => void;

  /** @internal */
  private _reject!: (reason: unknown) => void;

  /** @internal */
  private _disposeHandler: IDisposable | undefined = void 0;

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

  public constructor() {
    this.closed = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /** @internal */
  public activate(settings: IDialogLoadedSettings): Promise<DialogOpenResult> {
    const container = this.ctn.createChild();
    const {
      model,
      template,
      rejectOnCancel,
      renderer = container.get(IDialogDomRenderer),
    } = settings;
    const dialogTargetHost = settings.host ?? this.p.document.body;
    const dom = this.dom = renderer.render(dialogTargetHost, settings);
    const rootEventTarget = container.has(IEventTarget, true)
      ? container.get(IEventTarget) as Element
      : null;
    const contentHost = dom.contentHost;
    const eventManager = container.get(IDialogEventManager);

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

    container.register(instanceRegistration(IDialogDom, dom));
    registerHostNode(container, contentHost, this.p);

    return new Promise(r => {
        const cmp = Object.assign(this.cmp = this.getOrCreateVm(container, settings, contentHost), { $dialog: this });
        r(cmp.canActivate?.(model) ?? true);
      })
      .then(canActivate => {
        if (canActivate !== true) {
          dom.dispose();
          if (rejectOnCancel) {
            throw createDialogCancelError(null, ErrorNames.dialog_activation_rejected);
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
          return onResolve(ctrlr.activate(ctrlr, null), () => {
            this._disposeHandler = eventManager.add(this, dom);
            return onResolve(dom.show?.(),
              () => DialogOpenResult.create(false, this)
            );
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
    const { controller, dom, cmp, settings: { rejectOnCancel }} = this;
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
              throw createDialogCancelError(null, ErrorNames.dialog_cancellation_rejected);
            }
            return DialogCloseResult.create('abort' as T);
          }
          return onResolve(cmp.deactivate?.(dialogResult),
            () => onResolve(dom.hide?.(),
              () => onResolve(controller.deactivate(controller, null),
                () => {
                  dom.dispose();
                  this._disposeHandler?.dispose();
                  if (!rejectOnCancel && status !== 'error') {
                    this._resolve(dialogResult);
                  } else {
                    this._reject(createDialogCancelError(value, ErrorNames.dialog_cancelled_with_cancel_on_rejection_setting));
                  }
                  return dialogResult;
                }
              )
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
  public ok(value?: unknown): Promise<DialogCloseResult<'ok'>> {
    return this.deactivate('ok', value);
  }

  /**
   * Closes the dialog with a cancel output.
   *
   * @param value - The returned cancel output.
   */
  public cancel(value?: unknown): Promise<DialogCloseResult<'cancel'>> {
    return this.deactivate('cancel', value);
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
      this.cmp.deactivate?.(DialogCloseResult.create('error', closeError)),
      () => onResolve(
        this.controller.deactivate(this.controller, null),
        () => {
          this.dom.dispose();
          this._reject(closeError);
        }
      )
    )));
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

function createDialogCancelError<T>(output: T | undefined, code: ErrorNames/* , msg: string */): DialogCancelError<T> {
  const error = createMappedError(code) as DialogCancelError<T>;
  error.wasCancelled = true;
  error.value = output;
  return error;
}

function createDialogCloseError<T = unknown>(output: T): DialogCloseError<T> {
  const error = createMappedError(ErrorNames.dialog_custom_error) as DialogCloseError<T>;
  error.wasCancelled = false;
  error.value = output;
  return error;
}
