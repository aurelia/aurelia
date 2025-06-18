import { createInterface } from './utilities-di';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { CustomElementType, ICustomElementViewModel } from '@aurelia/runtime-html';

/**
 * The dialog service for composing template and component into a dialog
 */
export const IDialogService = /*@__PURE__*/createInterface<IDialogService>('IDialogService');
export interface IDialogService {
  readonly controllers: IDialogController[];
  /**
   * Opens a new dialog.
   *
   * @param settings - Dialog settings for this dialog instance.
   * @returns Promise A promise that settles when the dialog is closed.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  open<TOptions, TModel = any, TComponent extends object = any>(settings: IDialogSettings<TOptions, TModel, TComponent>): DialogOpenPromise;

  /**
   * Closes all open dialogs at the time of invocation.
   *
   * @returns Promise<DialogController[]> All controllers whose close operation was cancelled.
   */
  closeAll(): Promise<IDialogController[]>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testTypes(d: IDialogService) {
  return [
    d.open({
      model: { b: 2 },
      component: class Abc {},
      options: {
        z: 1,
      }
    }),
    d.open<{ a: 1 }>({
      options: {
        a: 1,
      }
    }),
    d.open<{ a: 1 }>({
      options: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        d: 1,
      }
    }),
  ];
}

/**
 * The controller associated with every dialog component
 */
export const IDialogController = /*@__PURE__*/createInterface<IDialogController>('IDialogController');
export interface IDialogController {
  readonly settings: IDialogLoadedSettings;
  /**
   * A promise that will be fulfilled once this dialog has been closed
   */
  readonly closed: Promise<DialogCloseResult>;

  ok(value?: unknown): Promise<DialogCloseResult<'ok'>>;
  cancel(value?: unknown): Promise<DialogCloseResult<'cancel'>>;
  error(value?: unknown): Promise<void>;
}

/**
 * An interface describing the object responsible for creating the dom structure of a dialog
 */
export const IDialogDomRenderer = /*@__PURE__*/createInterface<IDialogDomRenderer<unknown>>('IDialogDomRenderer');
export interface IDialogDomRenderer<TOptions> {
  render(dialogHost: Element, requestor: IDialogController, options?: TOptions): IDialogDom;
}

/**
 * An interface describing the DOM structure of a dialog
 */
export const IDialogDom = /*@__PURE__*/createInterface<IDialogDom>('IDialogDom');
export interface IDialogDom extends IDisposable {
  /**
   * Host element for the dialog content
   */
  readonly contentHost: HTMLElement;
  /**
   * Called when the dialog should be shown. Application can use this for animations
   */
  show?(): void | Promise<void>;
  /**
   * Called when the dialog should be hidden. Application can use this for animations
   */
  hide?(): void | Promise<void>;
}

/**
 * The promised returned from a dialog composition.
 */
export interface DialogOpenPromise extends Promise<DialogOpenResult> {
  /**
   * Add a callback that will be invoked when a dialog has been closed
   */
  whenClosed<TResult1, TResult2>(
    onfulfilled?: (value: DialogCloseResult) => TResult1 | Promise<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | Promise<TResult2>
  ): Promise<TResult1 | TResult2>;
}

export type IDialogSettings<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOptions = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TModel = any,
  TComponent extends object = object,
> = {
  /**
   * A custom renderer for the dialog.
   */
  renderer?: Constructable<IDialogDomRenderer<TOptions>> | IDialogDomRenderer<TOptions>;

  /**
   * The component url, constructor or instance for the dialog.
   */
  component?: CustomElementType<Constructable<TComponent>> | Constructable<TComponent> | (() => (Constructable<TComponent> | TComponent | Promise<TComponent | Constructable<TComponent>>));

  /**
   * The template url or template strategy to override the default template location convention.
   */
  template?: string | Element | Promise<string | Element> | (() => string | Element | Promise<string | Element>);

  /**
   * Data to be passed to the "activate" hook on the component.
   */
  model?: TModel;

  /**
   * The element that will parent the dialog.
   */
  host?: Element;

  /**
   * The container for the dialog creation.
   * One will be created from the root if not provided.
   */
  container?: IContainer;

  /**
   * The rendering configuration for the dialog. Different renderers may have different configuration options.
   */
  options?: TOptions;

  /**
   * When set to true conveys a cancellation as a rejection.
   */
  rejectOnCancel?: boolean;
};

export type IDialogLoadedSettings<TOptions extends object = object, TModel extends object = object> = Omit<IDialogSettings<TOptions, TModel>, 'component' | 'template' | 'renderer'> & {
  component?: Constructable<TModel> | TModel;
  template?: string | Element;
  renderer: Constructable<IDialogDomRenderer<TOptions>> | IDialogDomRenderer<TOptions>;
};

/**
 * Global configuration for the dialog plugin
 */
export const IDialogGlobalSettings = /*@__PURE__*/createInterface<IDialogGlobalSettings<any>>('IDialogGlobalSettings');
export type IDialogGlobalSettings<TOptions> = Pick<IDialogSettings<TOptions>, 'rejectOnCancel' | 'renderer'> & {
  options: TOptions;
};

/**
 * Base dialog error interface
 */
export interface DialogError<T> extends Error {
  wasCancelled: boolean;
  value?: T;
}

/**
 * The error thrown when a "cancel" occurs and DialogSettings.rejectOnCancel is set to "true".
 */
export type DialogCancelError<T> = DialogError<T> & { wasCancelled: true };

/**
 * The error thrown when the dialog is closed with the `DialogController.prototype.error` method.
 */
export type DialogCloseError<T> = DialogError<T> & { wasCancelled: false };

export class DialogOpenResult {
  private constructor(
    public readonly wasCancelled: boolean,
    public readonly dialog: IDialogController,
  ) {}

  public static create(
    wasCancelled: boolean,
    dialog: IDialogController,
  ) {
    return new DialogOpenResult(wasCancelled, dialog);
  }
}

export class DialogCloseResult<
  T extends DialogDeactivationStatuses = DialogDeactivationStatuses,
  TVal = unknown
> {
  private constructor(
    public readonly status: T,
    public readonly value?: TVal,
  ) {}

  public static create<T extends DialogDeactivationStatuses, TVal = unknown>(status: T, value?: TVal): DialogCloseResult<T, TVal> {
    return new DialogCloseResult(status, value);
  }
}

export interface IDialogCustomElementViewModel<T = unknown> extends ICustomElementViewModel, IDialogComponent<T> {
  readonly $dialog: IDialogController;
}

/**
 * - `ok`: The dialog is closed intentionally. This denotes the happy path.
 * - `cancel`: The dialog is closed with an intent to cancel.
 * - `abort`: The dialog model refused to deactivate in canDeactivate.
 * - `error`: The dialog is closed due to an error.
 */
export type DialogDeactivationStatuses = 'ok'  | 'error'  | 'cancel' | 'abort';
/**
 * The result received when a dialog opens.
 */
export interface DialogOpenResult {
  readonly wasCancelled: boolean;
  /**
   * The controller for the open dialog.
   */
  readonly dialog: IDialogController;
}

// #region Implementable

export interface IDialogComponent<T> {
  canActivate?: IDialogComponentCanActivate<T>['canActivate'];
  activate?: IDialogComponentActivate<T>['activate'];
  canDeactivate?: IDialogComponentCanDeactivate['canDeactivate'];
  deactivate?: IDialogComponentDeactivate['deactivate'];
}
/**
 * An optional interface describing the dialog canActivate convention.
 */
export interface IDialogComponentCanActivate<T> {
  /**
   * Implement this hook if you want to control whether or not the dialog can be open.
   * To cancel the opening of the dialog return false or a promise that resolves to false.
   * Any other returned value is coerced to true.
   */
  canActivate(model?: T): boolean | Promise<boolean>;
}

/**
 * An optional interface describing the dialog activate convention.
 */
export interface IDialogComponentActivate<T> {
  /**
   * Implement this hook if you want to perform custom logic just before the dialog is open.
   */
  activate(model?: T): void | Promise<void>;
}

/**
 * An optional interface describing the dialog canDeactivate convention.
 */
export interface IDialogComponentCanDeactivate {
  /**
   * Implement this hook if you want to control whether or not the dialog can be closed.
   * To cancel the closing of the dialog return false or a promise that resolves to false.
   * Any other returned value is coerced to true.
   */
  canDeactivate(result: DialogCloseResult): boolean | Promise<boolean>;
}

/**
 * An optional interface describing the dialog deactivate convention.
 */
export interface IDialogComponentDeactivate {
  /**
   * Implement this hook if you want to perform custom logic when the dialog is being closed.
   */
  deactivate(result: DialogCloseResult): void | Promise<void>;
}

// #endregion
