import { IContainer } from '@aurelia/kernel';
import { IDialogService, IDialogController } from './dialog-interfaces';
import type { DialogOpenPromise, IDialogSettings } from './dialog-interfaces';
/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export declare class DialogService implements IDialogService {
    static register(container: IContainer): void;
    get controllers(): IDialogController[];
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
    open<TOptions, TModel, TVm extends object>(settings: IDialogSettings<TOptions, TModel, TVm>): DialogOpenPromise;
    /**
     * Closes all open dialogs at the time of invocation.
     *
     * @returns All controllers whose close operation was cancelled.
     */
    closeAll(): Promise<IDialogController[]>;
}
//# sourceMappingURL=dialog-service.d.ts.map