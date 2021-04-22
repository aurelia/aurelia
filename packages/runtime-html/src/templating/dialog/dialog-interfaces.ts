import { DI } from '@aurelia/kernel';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { ICustomElementViewModel } from '../controller.js';

/**
 * The dialog service for composing view & view model into a dialog
 */
export const IDialogService = DI.createInterface<IDialogService>('IDialogService');
export interface IDialogService {
  readonly controllers: IDialogController[];
  /**
   * Opens a new dialog.
   *
   * @param settings - Dialog settings for this dialog instance.
   * @returns Promise A promise that settles when the dialog is closed.
   */
  open(settings?: IDialogSettings): DialogOpenPromise;

  /**
   * Closes all open dialogs at the time of invocation.
   *
   * @returns Promise<DialogController[]> All controllers whose close operation was cancelled.
   */
  closeAll(): Promise<IDialogController[]>;
}

/**
 * The controller asscociated with every dialog view model
 */
export const IDialogController = DI.createInterface<IDialogController>('IDialogController');
export interface IDialogController {
  readonly settings: IDialogLoadedSettings;
  /**
   * A promise that will be fulfilled once this dialog has been closed
   */
  readonly closed: Promise<DialogCloseResult>;

  ok(value?: unknown): Promise<DialogCloseResult<DialogDeactivationStatuses.Ok>>;
  cancel(value?: unknown): Promise<DialogCloseResult<DialogDeactivationStatuses.Cancel>>;
  error(value?: unknown): Promise<void>;
}

/**
 * An interface describing the object responsible for creating the dom structure of a dialog
 */
export const IDialogDomRenderer = DI.createInterface<IDialogDomRenderer>('IDialogDomRenderer');
export interface IDialogDomRenderer {
  render(dialogHost: Element, settings: IDialogLoadedSettings): IDialogDom;
}

/**
 * An interface describing the DOM structure of a dialog
 */
export const IDialogDom = DI.createInterface<IDialogDom>('IDialogDom');
export interface IDialogDom extends IDisposable {
  readonly overlay: HTMLElement;
  readonly contentHost: HTMLElement;
}

// export type IDialogCancellableOpenResult = IDialogOpenResult | IDialogCancelResult;

/* tslint:disable:max-line-length */
/**
 * The promised returned from a dialog composition.
 */
export interface DialogOpenPromise extends Promise<DialogOpenResult> {
  /**
   * Add a callback that will be invoked when a dialog has been closed
   */
  whenClosed<TResult1, TResult2>(
    onfulfilled?: (value: DialogCloseResult) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2>;
}
/* tslint:enable:max-line-length */

export type DialogActionKey = 'Escape' | 'Enter';
export type DialogKeyEventType = 'keyup' | 'keydown';
export type DialogMouseEventType = 'click' | 'mouseup' | 'mousedown';

export interface IDialogSettings<
  TModel = unknown,
  TVm extends object = object,
  TAnimation extends object = object,
> {

  /**
   * The view model url, constructor or instance for the dialog.
   */
  component?: () => Constructable<TVm> | TVm | Promise<TVm | Constructable<TVm>>;

  /**
   * The view url or view strategy to override the default view location convention.
   */
  template?: string | Element | Promise<string | Element> | (() => string | Element | Promise<string | Element>);

  /**
   * Data to be passed to the "activate" hook on the view model.
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
   * When set to "false" allows the dialog to be closed with ESC key or clicking outside the dialog.
   * When set to "true" the dialog does not close on ESC key or clicking outside of it.
   */
  lock?: boolean;

  /**
   * Allows for closing the top most dialog via the keyboard.
   * When set to "false" no action will be taken.
   * If set to "true", "Escape" or an array containing "Escape"
   * the dialog will be "cancel" closed when the ESC key is pressed.
   * If set to "Enter" or and array containing "Enter"
   * the dialog will be "ok" closed  when the ENTER key is pressed.
   * Using the array format allows combining the ESC and ENTER keys.
   */
  keyboard?: boolean | DialogActionKey | DialogActionKey[];

  /**
   * Determines which type of key event should be used to listen for
   * ENTER and ESC keys
   *
   * Default: keyup
   */
  keyEvent?: DialogKeyEventType;

  /**
   * Determines which type of mouse event should be used for closing the dialog
   *
   * Default: click
   */
  mouseEvent?: DialogMouseEventType;

  /**
   * When set to "true" allows for the dismissal of the dialog by clicking outside of it.
   */
  overlayDismiss?: boolean;

  /**
   * The z-index of the dialog.
   * In the terms of the DialogRenderer it is applied to the dialog overlay and the dialog container.
   */
  startingZIndex?: number;

  /**
   * When set to true conveys a cancellation as a rejection.
   */
  rejectOnCancel?: boolean;

  /**
   * Animation configuration for the dialog. This will be passed as is to the renderer
   */
  animation?: TAnimation;

  /**
   * This function is called when a dialog closes to restore focus to the last
   * element that was focused when the dialog opened. It can be overridden in
   * general settings, or on a case by case basis by providing an override when
   * a particular dialog is opened.
   */
  restoreFocus?: (lastActiveElement: HTMLElement) => void;
}

export type IDialogLoadedSettings<T extends object = object> = Omit<IDialogSettings<T>, 'component' | 'template'> & {
  component?: Constructable<T> | T;
  template?: string | Element;
};

export type IDialogGlobalSettings = Pick<
  IDialogSettings,
  'lock' | 'startingZIndex' | 'rejectOnCancel'
>;
export const IDialogGlobalSettings = DI.createInterface<IDialogGlobalSettings>('IDialogGlobalSettings');

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

export const enum DialogDeactivationStatuses {
  Ok = 'ok',
  Error = 'error',
  Cancel = 'cancel',
  /**
   * If a view model refused to deactivate in canDeactivate,
   * then this status should be used to reflect that
   */
  Abort = 'abort',
}

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
  canActivate(model?: T): boolean | Promise<boolean> | PromiseLike<boolean>;
}

/**
 * An optional interface describing the dialog activate convention.
 */
export interface IDialogComponentActivate<T> {
  /**
   * Implement this hook if you want to perform custom logic just before the dialog is open.
   */
  activate(model?: T): void | Promise<void> | PromiseLike<void>;
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
  canDeactivate(result: DialogCloseResult): boolean | Promise<boolean> | PromiseLike<boolean>;
}

/**
 * An optional interface describing the dialog deactivate convention.
 */
export interface IDialogComponentDeactivate {
  /**
   * Implement this hook if you want to perform custom logic when the dialog is being closed.
   */
  deactivate(result: DialogCloseResult): void | Promise<void> | PromiseLike<void>;
}

// #endregion
