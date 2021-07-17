import { Constructable, IContainer, InstanceProvider, onResolve, Registration } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { Controller, ICustomElementController } from '../controller.js';
import {
  DialogDeactivationStatuses,
  IDialogController,
  IDialogDomRenderer,
  IDialogDom,
  DialogOpenResult,
  DialogCloseResult,
  DialogCancelError,
  DialogCloseError,
} from './dialog-interfaces.js';
import { IEventTarget, INode } from '../../dom.js';

import type {
  IDialogComponent,
  IDialogLoadedSettings,
} from './dialog-interfaces.js';
import { IPlatform } from '../../platform.js';
import { CustomElement, CustomElementDefinition } from '../../resources/custom-element.js';

/**
 * A controller object for a Dialog instance.
 */
export class DialogController implements IDialogController {
  private readonly p: IPlatform;
  private readonly ctn: IContainer;

  /** @internal */
  private cmp!: IDialogComponent<object>;

  /** @internal */
  private resolve!: (result: DialogCloseResult) => void;

  /** @internal */
  private reject!: (reason: unknown) => void;

  /**
   * @internal
   */
  private closingPromise: Promise<DialogCloseResult> | undefined;

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
      this.resolve = resolve;
      this.reject = reject;
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
      container.register(Registration.instance(IEventTarget, dialogTargetHost));
    }

    container.register(
      Registration.instance(INode, contentHost),
      Registration.instance(IDialogDom, dom),
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
          const ctrlr = this.controller = Controller.forCustomElement(
            container,
            cmp,
            contentHost,
            null,
            LifecycleFlags.none,
            true,
            CustomElementDefinition.create(
              this.getDefinition(cmp) ?? { name: CustomElement.generateName(), template }
            )
          ) as ICustomElementController;
          return onResolve(ctrlr.activate(ctrlr, null!, LifecycleFlags.fromBind), () => {
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
    if (this.closingPromise) {
      return this.closingPromise as Promise<DialogCloseResult<T>>;
    }

    let deactivating = true;
    const { controller, dom, cmp, settings: { mouseEvent, rejectOnCancel }} = this;
    const dialogResult = DialogCloseResult.create(status as T, value);

    const promise: Promise<DialogCloseResult<T>> = new Promise<DialogCloseResult<T>>(r => {
      r(onResolve(
        cmp.canDeactivate?.(dialogResult) ?? true,
        canDeactivate => {
          if (canDeactivate !== true) {
            // we are done, do not block consecutive calls
            deactivating = false;
            this.closingPromise = void 0;
            if (rejectOnCancel) {
              throw createDialogCancelError(null, 'Dialog cancellation rejected');
            }
            return DialogCloseResult.create(DialogDeactivationStatuses.Abort as T);
          }
          return onResolve(cmp.deactivate?.(dialogResult),
            () => onResolve(controller.deactivate(controller, null!, LifecycleFlags.fromUnbind),
              () => {
                dom.dispose();
                dom.overlay.removeEventListener(mouseEvent ?? 'click', this);
                if (!rejectOnCancel && status !== DialogDeactivationStatuses.Error) {
                  this.resolve(dialogResult);
                } else {
                  this.reject(createDialogCancelError(value, 'Dialog cancelled with a rejection on cancel'));
                }
                return dialogResult;
              }
            )
          );
        }
      ));
    }).catch(reason => {
      this.closingPromise = void 0;
      throw reason;
    });
    // when component canDeactivate is synchronous, and returns something other than true
    // then the below assignment will override
    // the assignment inside the callback without the deactivating variable check
    this.closingPromise = deactivating ? promise : void 0;
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
        this.controller.deactivate(this.controller, null!, LifecycleFlags.fromUnbind),
        () => {
          this.dom.dispose();
          this.reject(closeError);
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
    const ep = new InstanceProvider('ElementResolver', host);

    container.registerResolver(INode, ep);
    container.registerResolver(p.Node, ep);
    container.registerResolver(p.Element, ep);
    container.registerResolver(p.HTMLElement, ep);

    return container.invoke(Component!);
  }

  private getDefinition(component?: object | Constructable) {
    const Ctor = (typeof component === 'function'
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
