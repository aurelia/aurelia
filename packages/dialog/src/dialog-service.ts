import { IContainer, Registration, onResolve, resolve, IResolver } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

import {
  DialogCloseResult,
  DialogOpenResult,
  IDialogService,
  IDialogController,
  IDialogGlobalSettings,
} from './dialog-interfaces';
import { DialogController } from './dialog-controller';
import { instanceRegistration, resolveDialogServiceChild, singletonRegistration } from './utilities-di';

import type {
  DialogOpenPromise,
  IDialogSettings,
} from './dialog-interfaces';
import { ErrorNames, createMappedError } from './errors';
import { DialogSettings } from './dialog-settings';

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export class DialogService implements IDialogService {
  public static register(container: IContainer) {
    container.register(
      singletonRegistration(this, this),
      Registration.aliasTo(this, IDialogService),
      AppTask.deactivating(IDialogService, dialogService => onResolve(
        dialogService.closeAll(),
        (openDialogControllers) => {
          if (openDialogControllers.length > 0) {
            // todo: what to do?
            throw createMappedError(ErrorNames.dialog_not_all_dialogs_closed, openDialogControllers.length);
          }
        }
      ))
    );
  }

  /**
   * Create a resolver for a child dialog service with the given key.
   */
  public static child(key: unknown): IResolver<DialogService> {
    return {
      $isResolver: true,
      resolve(handler, requestor) {
        return resolveDialogServiceChild(requestor, DialogService, key);
      },
    };
  }

  public get controllers() {
    return this.dlgs.slice(0);
  }
  /**
   * The current dialog controllers
   *
   * @internal
   */
  private readonly dlgs: IDialogController[] = [];

  /** @internal */ private readonly _ctn: IContainer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /** @internal */ private readonly _baseGlobalSettings: IDialogGlobalSettings<any>;
  /** @internal */ private readonly _baseSettings: IDialogSettings;

  public constructor(
    container = resolve(IContainer),
    baseGlobalSettings = resolve(IDialogGlobalSettings),
    baseSettings: IDialogSettings = {},
  ) {
    this._ctn = container;
    this._baseGlobalSettings = baseGlobalSettings;
    this._baseSettings = baseSettings;
  }

  /**
   * Opens a new dialog.
   *
   * @param settings - Dialog settings for this dialog instance.
   * @returns A promise that settles when the dialog is closed.
   *
   * Example usage:
   * ```ts
   * dialogService.open({ component: () => MyDialog, template: 'my-template' })
   * dialogService.open({ component: () => MyDialog, template: document.createElement('my-template') })
   *
   * // JSX to hyperscript
   * dialogService.open({ component: () => MyDialog, template: <my-template /> })
   *
   * dialogService.open({ component: () => import('...'), template: () => fetch('my.server/dialog-view.html') })
   * ```
   */
  public open<TOptions, TModel, TVm extends object>(settings: IDialogSettings<TOptions, TModel, TVm>): DialogOpenPromise {
    return asDialogOpenPromise(new Promise<DialogOpenResult>(resolve => {
      const $settings = DialogSettings.from<TOptions>(this._baseGlobalSettings, this._baseSettings, settings);

      const container = $settings.container ?? this._ctn.createChild();

      resolve(onResolve(
        $settings.load(),
        loadedSettings => {
          const dialogController = container.invoke(DialogController);
          container.register(
            instanceRegistration(IDialogController, dialogController),
            instanceRegistration(DialogController, dialogController)
          );

          return onResolve(
            dialogController.activate(loadedSettings),
            openResult => {
              if (!openResult.wasCancelled) {
                this.dlgs.push(dialogController);

                const $removeController = () => this.remove(dialogController);
                void dialogController.closed.finally($removeController);
              }
              return openResult;
            }
          );
        }
      ));
    }));
  }

  /**
   * Closes all open dialogs at the time of invocation.
   *
   * @returns All controllers whose close operation was cancelled.
   */
  public closeAll(): Promise<IDialogController[]> {
    return Promise
      .all(Array.from(this.dlgs)
        .map(controller => {
          if (controller.settings.rejectOnCancel) {
            // this will throw when calling cancel
            // so only leave return null as noop
            return controller.cancel().then(() => null);
          }
          return controller.cancel().then(result =>
            result.status === 'cancel'
              ? null
              : controller
          );
        })
      )
      .then(unclosedControllers =>
        // something wrong with TS
        // it's unable to recognize that the null values are filtered out already
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        unclosedControllers.filter(unclosed => !!unclosed) as IDialogController[]
      );
  }

  public createChild(baseSettings: IDialogSettings): DialogService {
    const childService = new DialogService(
      this._ctn,
      this._baseGlobalSettings,
      baseSettings
    );

    return childService;
  }

  /** @internal */
  private remove(controller: DialogController): void {
    const idx = this.dlgs.indexOf(controller);
    if (idx > -1) {
      this.dlgs.splice(idx, 1);
    }
  }
}

function whenClosed<TResult1 = unknown, TResult2 = unknown>(
  this: Promise<DialogOpenResult>,
  onfulfilled?: (r: DialogCloseResult) => TResult1 | Promise<TResult1>,
  onrejected?: (err: unknown) => TResult2 | Promise<TResult2>
): Promise<TResult1 | TResult2> {
  return this.then(openResult => openResult.dialog.closed.then(onfulfilled, onrejected), onrejected);
}

function asDialogOpenPromise(promise: Promise<unknown>): DialogOpenPromise {
  (promise as DialogOpenPromise).whenClosed = whenClosed;
  return promise as DialogOpenPromise;
}
