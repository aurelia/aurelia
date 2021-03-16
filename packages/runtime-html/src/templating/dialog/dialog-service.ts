import { IContainer, onResolve, resolveAll } from '@aurelia/kernel';

import { IDialogController, IDialogOpenResult, IGlobalDialogSettings, LoadedDialogSettings } from './dialog-interfaces.js';
import { createDialogCancelError } from './dialog-utilities.js';
import { ActivationResult, DialogController } from './dialog-controller.js';

import type {
  IDialogCancellableOpenResult,
  IDialogCloseResult,
  IDialogOpenPromise,
  IDialogService,
  IDialogSettings,
} from './dialog-interfaces.js';

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export class DialogService implements IDialogService {
  /**
   * The current dialog controllers
   */
  public controllers: IDialogController[] = [];

  /**
   * Is there an open dialog
   */
  public hasOpenDialog: boolean = false;

  // tslint:disable-next-line:member-ordering
  protected static get inject() { return [IContainer, IGlobalDialogSettings]; }

  public constructor(
    private readonly container: IContainer,
    private readonly defaultSettings: IGlobalDialogSettings,
  ) {}

  /**
   * Opens a new dialog.
   * @param settings Dialog settings for this dialog instance.
   * @return Promise A promise that settles when the dialog is closed.
   *
   * Example usage:
```ts
dialogService.open({ viewModel: () => MyDialog, view: 'my-template' })
dialogService.open({ viewModel: () => MyDialog, view: document.createElement('my-template') })

// JSX to hyperscript
dialogService.open({ viewModel: () => MyDialog, view: <my-template /> })

dialogService.open({ viewModel: () => import('...'), view: () => fetch('my.server/dialog-view.html') })
```
   */
  public open(settings: IDialogSettings & { rejectOnCancel: true }): IDialogOpenPromise<IDialogOpenResult>;
  public open(settings?: IDialogSettings): IDialogOpenPromise<IDialogCancellableOpenResult>;
  public open(settings: IDialogSettings = {}): IDialogOpenPromise<IDialogCancellableOpenResult> {
    let resolveCloseResult: any;
    let rejectCloseResult: any;

    const $settings = DialogSettings.from(this.defaultSettings, settings);
    const container = $settings.container ?? this.container;
    const closeResult: Promise<IDialogCloseResult> = new Promise((resolve, reject) => {
      resolveCloseResult = resolve;
      rejectCloseResult = reject;
    });

    return asDialogOpenPromise(new Promise((resolve, reject) => onResolve(
      $settings.load(),
      loadedSettings => {
        const dialogController = container.invoke(DialogController, [loadedSettings, resolveCloseResult, rejectCloseResult]);
        const $removeController = () => { removeController(this, dialogController); };

        closeResult.then($removeController, $removeController);

        return onResolve(
          dialogController.activate(),
          activationResult => {
            switch (activationResult) {
              case ActivationResult.cancelled:
                return resolve({ wasCancelled: true });
              case ActivationResult.error:
                return reject(createDialogCancelError());
            }
            return resolve({
              controller: dialogController,
              closeResult,
              wasCancelled: false,
            });
          }
        );
      }
    )));
  }

  /**
   * Closes all open dialogs at the time of invocation.
   * @return Promise<DialogController[]> All controllers whose close operation was cancelled.
   */
  public closeAll(): Promise<IDialogController[]> {
    return Promise
      .all(this
        .controllers
        .slice(0)
        .map(controller => {
          if (!controller.settings.rejectOnCancel) {
            return controller
              .cancel()
              .then(result => {
                if (result.wasCancelled) {
                  return controller;
                }
                return null;
              });
          }
          return controller
            .cancel()
            .then(
              () => null,
              (reason) => {
                if (reason.wasCancelled) {
                  return controller;
                }
                throw reason;
              }
            );
        })
      )
      .then(unclosedControllers =>
        unclosedControllers.filter(unclosed => !!unclosed) as IDialogController[]
      );
  }
}


interface DialogSettings<T extends object = object> extends IDialogSettings<T> {}
class DialogSettings<T extends object = object> implements IDialogSettings<T> {

  public static from(...srcs: Partial<IDialogSettings>[]): DialogSettings {
    return (Object.assign(new DialogSettings(), ...srcs) as DialogSettings)
      .validate()
      .normalize();
  }

  public load(): LoadedDialogSettings | Promise<LoadedDialogSettings> {
    const vm = this.viewModel;
    const template = this.template;
    let promises: Promise<void>[] | undefined;
    let maybePromise: Promise<void> | unknown;
    if (typeof vm === 'function') {
      maybePromise = onResolve(
        vm(),
        loadedVm => { (this as LoadedDialogSettings).viewModel = loadedVm; },
      );
      if (maybePromise instanceof Promise) {
        ((promises = []) as Promise<void>[]).push(maybePromise);
      }
    }
    if (typeof template === 'function') {
      maybePromise = onResolve(
        template(),
        loadedTemplate => { this.template = loadedTemplate; },
      )
      if (maybePromise instanceof Promise) {
        (promises ??= []).push(maybePromise);
      }
    }
    maybePromise = resolveAll(...promises!);
    if (maybePromise instanceof Promise) {
      return maybePromise.then(() => this as LoadedDialogSettings);
    }
    return this as LoadedDialogSettings;
  }

  private validate(): this {
    if (!this.viewModel && !this.template) {
      throw new Error('Invalid Dialog Settings. You must provide "viewModel", "view" or both.');
    }
    return this;
  }

  private normalize(): DialogSettings {
    if (typeof this.keyboard !== 'boolean' && !this.keyboard) {
      this.keyboard = !this.lock;
    }
    if (typeof this.overlayDismiss !== 'boolean') {
      this.overlayDismiss = !this.lock;
    }
    return this;
  }
}

function removeController(service: DialogService, dialogController: IDialogController): void {
  const i = service.controllers.indexOf(dialogController);
  if (i !== -1) {
    service.controllers.splice(i, 1);
    service.hasOpenDialog = !!service.controllers.length;
  }
}

function whenClosed<TResult1 = unknown, TResult2 = unknown>(
  this: Promise<IDialogCancellableOpenResult>,
  onfulfilled?: (r: IDialogCloseResult) => TResult1 | PromiseLike<TResult1>,
  onrejected?: (err: unknown) => TResult2 | PromiseLike<TResult2>
): Promise<TResult1 | TResult2> {
  return this
    .then(r => r.wasCancelled
      ? r
      // TODO: why is TS not able to infer the type
      : r.closeResult
    )
    .then(onfulfilled, onrejected);
}
function asDialogOpenPromise<T extends IDialogCancellableOpenResult>(promise: Promise<T>): IDialogOpenPromise<T> {
  (promise as IDialogOpenPromise<T>).whenClosed = whenClosed;
  return promise as IDialogOpenPromise<T>;
}
