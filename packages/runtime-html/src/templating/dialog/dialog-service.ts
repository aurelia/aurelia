import { IContainer, onResolve, Registration, resolveAll } from '@aurelia/kernel';

import { 
  IDialogService,
  DialogDeactivationStatuses,
  IDialogClosedResult,
  IDialogController,
  IDialogOpenResult,
  IGlobalDialogSettings,
  LoadedDialogSettings,
} from './dialog-interfaces.js';
import { DialogController } from './dialog-controller.js';

import type {
  IDialogOpenPromise,
  IDialogSettings,
} from './dialog-interfaces.js';
import { AppTask } from '../../app-task.js';

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export class DialogService implements IDialogService {
  /**
   * The current dialog controllers
   * @internal
   */
  private readonly controllers: Set<IDialogController> = new Set();

  /**
   * Is there an open dialog
   */
  public get hasOpenDialog(): boolean {
    return this.controllers.size > 0;
  }

  // tslint:disable-next-line:member-ordering
  protected static get inject() { return [IContainer, IGlobalDialogSettings]; }

  public constructor(
    private readonly container: IContainer,
    private readonly defaultSettings: IGlobalDialogSettings,
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
  public open(settings: IDialogSettings = {}): IDialogOpenPromise {
    const $settings = DialogSettings.from(this.defaultSettings, settings);
    const container = $settings.container ?? this.container;

    return asDialogOpenPromise(new Promise<IDialogOpenResult>(resolve => onResolve(
      $settings.load(),
      loadedSettings => {
        const dialogController = container.invoke(DialogController, [loadedSettings]);

        return onResolve(
          dialogController.activate(),
          openResult => {
            if (!openResult.wasCancelled) {
              this.controllers.add(dialogController);

              const $removeController = () => this.remove(dialogController);
              openResult.closeResult.then($removeController, $removeController);
            }
            return resolve(openResult);
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
      .all(Array.from(this.controllers)
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

  private remove(controller: DialogController): void {
    this.controllers.delete(controller);
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
    const loaded = this as LoadedDialogSettings;
    const cmp = this.component;
    const template = this.template;
    const maybePromise = resolveAll(...[
      typeof cmp === 'function'
        ? onResolve(cmp(), loadedCmp => { loaded.component = loadedCmp; })
        : void 0,
      typeof template === 'function'
        ? onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
        : void 0
    ]);
    return maybePromise instanceof Promise
      ? maybePromise.then(() => loaded)
      : loaded;
  }

  private validate(): this {
    if (!this.component && !this.template) {
      throw new Error('Invalid Dialog Settings. You must provide "component", "template" or both.');
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

function whenClosed<TResult1 = unknown, TResult2 = unknown>(
  this: Promise<IDialogOpenResult>,
  onfulfilled?: (r: IDialogClosedResult) => TResult1 | PromiseLike<TResult1>,
  onrejected?: (err: unknown) => TResult2 | PromiseLike<TResult2>
): Promise<TResult1 | TResult2> {
  return this
    .then(or => or.closeResult)
    .then(onfulfilled, onrejected);
}
function asDialogOpenPromise(promise: Promise<unknown>): IDialogOpenPromise {
  (promise as IDialogOpenPromise).whenClosed = whenClosed;
  return promise as IDialogOpenPromise;
}
