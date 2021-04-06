import { IContainer, onResolve, Registration, resolveAll } from '@aurelia/kernel';

import {
  IDialogService,
  DialogDeactivationStatuses,
  IDialogCloseResult,
  IDialogController,
  IDialogOpenResult,
  IDialogGlobalSettings,
  IDialogLoadedSettings,
  DialogActionKey,
} from './dialog-interfaces.js';
import { DialogController } from './dialog-controller.js';

import type {
  IDialogOpenPromise,
  IDialogSettings,
} from './dialog-interfaces.js';
import { AppTask } from '../../app-task.js';
import { IPlatform } from '../../platform.js';

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export class DialogService implements IDialogService {
  /**
   * The current dialog controllers
   *
   * @internal
   */
  private readonly dlgs: IDialogController[] = [];

  public get count(): number {
    return this.dlgs.length;
  }

  /**
   * Is there an open dialog
   */
  public get hasOpenDialog(): boolean {
    return this.dlgs.length > 0;
  }

  private get top(): IDialogController | null {
    const dlgs = this.dlgs;
    return dlgs.length > 0 ? dlgs[dlgs.length - 1] : null;
  }

  // tslint:disable-next-line:member-ordering
  protected static get inject() { return [IContainer, IPlatform, IDialogGlobalSettings]; }

  public constructor(
    private readonly container: IContainer,
    private readonly p: IPlatform,
    private readonly defaultSettings: IDialogGlobalSettings,
  ) {}

  public static register(container: IContainer) {
    container.register(
      Registration.singleton(IDialogService, this),
      AppTask.with(IDialogService).beforeDeactivate().call(dialogService => onResolve(
        dialogService.closeAll(),
        (openDialogController) => {
          if (openDialogController.length > 0) {
            // todo: what to do?
            throw new Error(`There are still ${openDialogController.length} open dialogs.`);
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
   * dialogService.open({ viewModel: () => MyDialog, view: 'my-template' })
   * dialogService.open({ viewModel: () => MyDialog, view: document.createElement('my-template') })
   *
   * // JSX to hyperscript
   * dialogService.open({ viewModel: () => MyDialog, view: <my-template /> })
   *
   * dialogService.open({ viewModel: () => import('...'), view: () => fetch('my.server/dialog-view.html') })
   * ```
   */
  public open(settings: IDialogSettings = {}): IDialogOpenPromise {
    return asDialogOpenPromise(new Promise<IDialogOpenResult>(resolve => {
      const $settings = DialogSettings.from(this.defaultSettings, settings);
      const container = $settings.container ?? this.container.createChild();

      resolve(onResolve(
        $settings.load(),
        loadedSettings => {
          const dialogController = container.getFactory(DialogController).construct(container);

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
    if (top == null || !top.settings.keyboard) {
      return;
    }
    const keyboard = top.settings.keyboard;
    if (matchKey('Escape', key, keyboard)) {
      void top.cancel();
    } else if (matchKey('Enter', key, keyboard)) {
      void top.ok();
    }
  }
}

interface DialogSettings<T extends object = object> extends IDialogSettings<T> {}
class DialogSettings<T extends object = object> implements IDialogSettings<T> {

  public static from(...srcs: Partial<IDialogSettings>[]): DialogSettings {
    return (Object.assign(new DialogSettings(), ...srcs) as DialogSettings)
      .validate()
      .normalize();
  }

  public load(): IDialogLoadedSettings | Promise<IDialogLoadedSettings> {
    const loaded = this as IDialogLoadedSettings;
    const cmp = this.component;
    const template = this.template;
    const maybePromise = resolveAll(...[
      cmp == null
        ? void 0
        : onResolve(cmp(), loadedCmp => { loaded.component = loadedCmp; }),
      typeof template === 'function'
        ? onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
        : void 0
    ]);
    return maybePromise instanceof Promise
      ? maybePromise.then(() => loaded)
      : loaded;
  }

  private validate(): this {
    if (this.component == null && this.template == null) {
      throw new Error('Invalid Dialog Settings. You must provide "component", "template" or both.');
    }
    return this;
  }

  private normalize(): DialogSettings {
    if (typeof this.keyboard !== 'boolean' && this.keyboard == null) {
      this.keyboard = !this.lock;
    }
    if (typeof this.overlayDismiss !== 'boolean') {
      this.overlayDismiss = !this.lock;
    }
    return this;
  }
}

function whenClosed<TResult1 = unknown, TResult2 = unknown>(
  this: Promise<IDialogOpenResult>,
  onfulfilled?: (r: IDialogCloseResult) => TResult1 | PromiseLike<TResult1>,
  onrejected?: (err: unknown) => TResult2 | PromiseLike<TResult2>
): Promise<TResult1 | TResult2> {
  return this.then(openResult => openResult.controller.closed.then(onfulfilled, onrejected));
}

function asDialogOpenPromise(promise: Promise<unknown>): IDialogOpenPromise {
  (promise as IDialogOpenPromise).whenClosed = whenClosed;
  return promise as IDialogOpenPromise;
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

function matchKey(keyToMatch: DialogActionKey, key: string, keyboard: string | boolean | DialogActionKey[]) {
  return key === keyToMatch
    && (keyboard === true || keyboard === key || (Array.isArray(keyboard) && keyboard.includes(key)));
}
