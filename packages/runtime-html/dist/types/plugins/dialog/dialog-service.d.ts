import { IContainer } from '@aurelia/kernel';
import { IDialogService, IDialogController, IDialogGlobalSettings } from './dialog-interfaces.js';
import { IPlatform } from '../../platform.js';
import type { DialogOpenPromise, IDialogSettings } from './dialog-interfaces.js';
/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
export declare class DialogService implements IDialogService {
    private readonly _ctn;
    private readonly p;
    private readonly _defaultSettings;
    get controllers(): IDialogController[];
    private get top();
    protected static get inject(): (import("@aurelia/kernel").InterfaceSymbol<IPlatform> | import("@aurelia/kernel").InterfaceSymbol<IContainer> | import("@aurelia/kernel").InterfaceSymbol<IDialogGlobalSettings>)[];
    constructor(_ctn: IContainer, p: IPlatform, _defaultSettings: IDialogGlobalSettings);
    static register(container: IContainer): void;
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
    open(settings: IDialogSettings): DialogOpenPromise;
    /**
     * Closes all open dialogs at the time of invocation.
     *
     * @returns All controllers whose close operation was cancelled.
     */
    closeAll(): Promise<IDialogController[]>;
}
//# sourceMappingURL=dialog-service.d.ts.map