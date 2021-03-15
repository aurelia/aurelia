import { DI } from '@aurelia/kernel';
import { ICustomElementViewModel } from '@aurelia/runtime-html';

import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';

export const IDialogService = DI.createInterface<IDialogService>('IDialogService');
/**
 * The dialog service for composing view & view model into a dialog
 */
export interface IDialogService {
  readonly hasOpenDialog: boolean;

  /**
   * Opens a new dialog.
   * @param settings Dialog settings for this dialog instance.
   * @return Promise A promise that settles when the dialog is closed.
   */
  open(settings: IDialogSettings & { rejectOnCancel: true }): IDialogOpenPromise<IDialogOpenResult>;
  open(settings?: IDialogSettings): IDialogOpenPromise<IDialogCancellableOpenResult>;

  /**
   * Closes all open dialogs at the time of invocation.
   * @return Promise<DialogController[]> All controllers whose close operation was cancelled.
   */
  closeAll(): Promise<IDialogController[]>;
}

export const IDialogController = DI.createInterface<IDialogController>('IDialogController');
/**
 * The controller asscociated with every dialog view model
 */
export interface IDialogController {
  readonly settings: LoadedDialogSettings;
  readonly animator: IDialogAnimator;

  ok(output?: unknown): Promise<IDialogCancelableOperationResult>;
  cancel(output?: unknown): Promise<IDialogCancelableOperationResult>;
  error(output?: unknown): Promise<void>;
}

export const IDialogDomRenderer = DI.createInterface<IDialogDomRenderer>('IDialogDomRenderer');
export interface IDialogDomRenderer {
  render(dialogHost: Element): IDialogDom;
}

export interface IDialogDom extends IDisposable {
  readonly overlay: HTMLElement;
  readonly host: HTMLElement;
  subscribe(subscriber: IDialogDomSubscriber): void;
  unsubscribe(subscriber: IDialogDomSubscriber): void;
}

export interface IDialogDomSubscriber {
  handleOverlayClick(event: MouseEvent): void;
}

export const IDialogAnimator = DI.createInterface<IDialogAnimator>('IDialogAnimator');
/**
 * The animator used by a dialog controller for preparing, manipulating DOM elements for a dialog composition.
 */
export interface IDialogAnimator<T extends object = object> {
  attaching(dialogDom: IDialogDom, animation?: T): void | Promise<unknown>;
  attached(dialogDom: IDialogDom, animation?: T): void | Promise<unknown>;

  detaching(dialogDom: IDialogDom, animation?: T): void | Promise<unknown>;
  detached(dialogDom: IDialogDom, animation?: T): void | Promise<unknown>;
}

export type IDialogCancellableOpenResult = IDialogOpenResult | IDialogCancelResult;

/* tslint:disable:max-line-length */
/**
 * The promised returned from a dialog composition.
 */
export interface IDialogOpenPromise<T extends IDialogCancellableOpenResult> extends Promise<T> {
  /**
   * Add a callback that will be invoked when a dialog has been closed
   */
  whenClosed<TResult1, TResult2>(
    onfulfilled?: (value: IDialogCloseResult) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2>;
}
/* tslint:enable:max-line-length */

export type ActionKey = 'Escape' | 'Enter';
export type KeyEventType = 'keyup' | 'keydown';
export type MouseEventType = 'click' | 'mouseup' | 'mousedown';

/**
 * All available dialog settings.
 */
export interface IDialogSettings<
  TModel extends object = object,
  TVm extends object = object,
  TAnimation extends Record<string, any> = Record<string, any>,
> {

  /**
   * The view model url, constructor or instance for the dialog.
   */
  viewModel?: () => Constructable<TVm> | TVm;

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
  keyboard?: boolean | ActionKey | ActionKey[];

  /**
   * Determines which type of key event should be used to listen for
   * ENTER and ESC keys
   *
   * Default: keyup
   */
  keyEvent?: KeyEventType;

  /**
   * Determines which type of mouse event should be used for closing the dialog
   *
   * Default: click
   */
  mouseEvent?: MouseEventType;

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
   * Centers the dialog only horizontally.
   */
  centerHorizontalOnly?: boolean;

  /**
   * When set to true conveys a cancellation as a rejection.
   */
  rejectOnCancel?: boolean;

  /**
   * When set to true transitions will not be awaited to end.
   */
  ignoreTransitions?: boolean;

  /**
   * Animation configuration for the dialog. This will be passed as is to the renderer
   */
  animation?: TAnimation;

  /**
   * Usde to provide custom positioning logic.
   * When invoked the function is passed the dialog container and the dialog overlay elements.
   */
  position?: (dialogContainer: Element, dialogOverlay?: Element) => void;

  /**
   * This function is called when a dialog closes to restore focus to the last
   * element that was focused when the dialog opened. It can be overridden in
   * general settings, or on a case by case basis by providing an override when
   * a particular dialog is opened.
   */
  restoreFocus?: (lastActiveElement: HTMLElement) => void;
}

export type LoadedDialogSettings<T extends object = object> = Omit<IDialogSettings<T>, 'viewModel' | 'template'> & {
  viewModel?: Constructable<T> | T;
  template?: string | Element;
}

export type IGlobalDefaultDialogSettings = Pick<
  IDialogSettings,
  'lock' | 'startingZIndex' | 'centerHorizontalOnly' | 'rejectOnCancel' | 'ignoreTransitions'
>;

/**
 * The error thrown when a "cancel" occurs and DialogSettings.rejectOnCancel is set to "true".
 */
export interface IDialogCancelError<T> extends Error {
  wasCancelled: true;
  output?: T;
}

/**
 * The error thrown when the dialog is closed with the `DialogController.prototype.error` method.
 */
export interface IDialogCloseError<T> extends Error {
  wasCancelled: false;
  output: T;
}

export interface IDialogCustomElementViewModel extends ICustomElementViewModel {
  controller: IDialogController;
}

/**
 * The result that a dialog cancelable operation resolves to.
 */
export interface IDialogCancelableOperationResult {
  wasCancelled: boolean;
}

/**
 * The result that a dialog operation resolves to when cancelled.
 */
export interface IDialogCancelResult {
  wasCancelled: true;
}

/**
 * The result received when a dialog closes.
 */
export interface IDialogCloseResult extends IDialogCancelableOperationResult {
  /**
   * The provided close value.
   */
  output?: unknown;
}

/**
 * The result received when a dialog opens.
 */
export interface IDialogOpenResult {
  wasCancelled: false;

  /**
   * The controller for the open dialog.
   */
  controller: IDialogController;

  /**
   * Promise that settles when the dialog is closed.
   */
  closeResult: Promise<IDialogCloseResult>;
}


//#region Implementable

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
  canDeactivate(result: IDialogCloseResult): boolean | Promise<boolean> | PromiseLike<boolean>;
}

/**
 * An optional interface describing the dialog deactivate convention.
 */
export interface IDialogComponentDeactivate {
  /**
   * Implement this hook if you want to perform custom logic when the dialog is being closed.
   */
  deactivate(result: IDialogCloseResult | IDialogCloseError<object>): void | Promise<void> | PromiseLike<void>;
}

//#endregion
