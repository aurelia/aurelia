import { IContainer, onResolve, resolveAll } from '@aurelia/kernel';
import { AppTask, IPlatform } from '@aurelia/runtime-html';

import {
  DialogActionKey,
  DialogCloseResult,
  DialogDeactivationStatuses,
  DialogOpenResult,
  IDialogService,
  IDialogController,
  IDialogGlobalSettings,
  IDialogLoadedSettings,
} from './dialog-interfaces';
import { DialogController } from './dialog-controller';
import { createError, isFunction, isPromise } from '../../utilities';
import { callbackRegistration, instanceRegistration, singletonRegistration } from '../../utilities-di';

import type {
  DialogOpenPromise,
  IDialogSettings,
} from './dialog-interfaces';

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export class DialogService implements IDialogService {
  public get controllers() {
    return this.dlgs.slice(0);
  }
  /**
   * The current dialog controllers
   *
   * @internal
   */
  private readonly dlgs: IDialogController[] = [];

  private get top(): IDialogController | null {
    const dlgs = this.dlgs;
    return dlgs.length > 0 ? dlgs[dlgs.length - 1] : null;
  }

  // tslint:disable-next-line:member-ordering
  protected static get inject() { return [IContainer, IPlatform, IDialogGlobalSettings]; }

  public constructor(
    private readonly _ctn: IContainer,
    private readonly p: IPlatform,
    private readonly _defaultSettings: IDialogGlobalSettings,
  ) {}

  public static register(container: IContainer) {
    container.register(
      singletonRegistration(IDialogService, this),
      AppTask.deactivating(IDialogService, dialogService => onResolve(
        dialogService.closeAll(),
        (openDialogController) => {
          if (openDialogController.length > 0) {
            // todo: what to do?
            if (__DEV__)
              throw createError(`AUR0901: There are still ${openDialogController.length} open dialog(s).`);
            else
              throw createError(`AUR0901:${openDialogController.length}`);
          }
        }
      ))
    );
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
  public open(settings: IDialogSettings): DialogOpenPromise {
    return asDialogOpenPromise(new Promise<DialogOpenResult>(resolve => {
      const $settings = DialogSettings.from(this._defaultSettings, settings);
      const container = $settings.container ?? this._ctn.createChild();

      resolve(onResolve(
        $settings.load(),
        loadedSettings => {
          const dialogController = container.invoke(DialogController);
          container.register(instanceRegistration(IDialogController, dialogController));
          container.register(callbackRegistration(DialogController, () => {
            if (__DEV__)
              throw createError(`AUR0902: Invalid injection of DialogController. Use IDialogController instead.`);
            else
              throw createError(`AUR0902`);
          }));

          return onResolve(
            dialogController.activate(loadedSettings),
            openResult => {
              if (!openResult.wasCancelled) {
                if (this.dlgs.push(dialogController) === 1) {
                  this.p.window.addEventListener('keydown', this);
                }

                const $removeController = () => this.remove(dialogController);
                dialogController.closed.then($removeController, $removeController);
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
            result.status === DialogDeactivationStatuses.Cancel
              ? null
              : controller
          );
        })
      )
      .then(unclosedControllers =>
        unclosedControllers.filter(unclosed => !!unclosed) as IDialogController[]
      );
  }

  /** @internal */
  private remove(controller: DialogController): void {
    const dlgs = this.dlgs;
    const idx = dlgs.indexOf(controller);
    if (idx > -1) {
      this.dlgs.splice(idx, 1);
    }
    if (dlgs.length === 0) {
      this.p.window.removeEventListener('keydown', this);
    }
  }

  /** @internal */
  public handleEvent(e: Event): void {
    const keyEvent = e as KeyboardEvent;
    const key = getActionKey(keyEvent);
    if (key == null) {
      return;
    }
    const top = this.top;
    if (top === null || top.settings.keyboard.length === 0) {
      return;
    }
    const keyboard = top.settings.keyboard;
    if (key === 'Escape' && keyboard.includes(key)) {
      void top.cancel();
    } else if (key === 'Enter' && keyboard.includes(key)) {
      void top.ok();
    }
  }
}

interface DialogSettings<T extends object = object> extends IDialogSettings<T> {}
class DialogSettings<T extends object = object> implements IDialogSettings<T> {

  public static from(...srcs: Partial<IDialogSettings>[]): DialogSettings {
    return (Object.assign(new DialogSettings(), ...srcs) as DialogSettings)
      ._validate()
      ._normalize();
  }

  public load(): IDialogLoadedSettings | Promise<IDialogLoadedSettings> {
    const loaded = this as IDialogLoadedSettings;
    const cmp = this.component;
    const template = this.template;
    const maybePromise = resolveAll(...[
      cmp == null
        ? void 0
        : onResolve(cmp(), loadedCmp => { loaded.component = loadedCmp; }),
      isFunction(template)
        ? onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
        : void 0
    ]);
    return isPromise(maybePromise)
      ? maybePromise.then(() => loaded)
      : loaded;
  }

  /** @internal */
  private _validate(): this {
    if (this.component == null && this.template == null) {
      if (__DEV__)
        throw createError(`AUR0903: Invalid Dialog Settings. You must provide "component", "template" or both.`);
      else
        throw createError(`AUR0903`);
    }
    return this;
  }

  /** @internal */
  private _normalize(): DialogSettings {
    if (this.keyboard == null) {
      this.keyboard = this.lock ? [] : ['Enter', 'Escape'];
    }
    if (typeof this.overlayDismiss !== 'boolean') {
      this.overlayDismiss = !this.lock;
    }
    return this;
  }
}

function whenClosed<TResult1 = unknown, TResult2 = unknown>(
  this: Promise<DialogOpenResult>,
  onfulfilled?: (r: DialogCloseResult) => TResult1 | PromiseLike<TResult1>,
  onrejected?: (err: unknown) => TResult2 | PromiseLike<TResult2>
): Promise<TResult1 | TResult2> {
  return this.then(openResult => openResult.dialog.closed.then(onfulfilled, onrejected), onrejected);
}

function asDialogOpenPromise(promise: Promise<unknown>): DialogOpenPromise {
  (promise as DialogOpenPromise).whenClosed = whenClosed;
  return promise as DialogOpenPromise;
}

function getActionKey(e: KeyboardEvent): DialogActionKey | undefined {
  if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
    return 'Escape';
  }
  if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
    return 'Enter';
  }
  return undefined;
}
