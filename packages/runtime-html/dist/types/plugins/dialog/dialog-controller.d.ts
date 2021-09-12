import { IContainer } from '@aurelia/kernel';
import { DialogDeactivationStatuses, IDialogController, DialogCloseResult } from './dialog-interfaces.js';
import { IPlatform } from '../../platform.js';
import type { IDialogLoadedSettings } from './dialog-interfaces.js';
/**
 * A controller object for a Dialog instance.
 */
export declare class DialogController implements IDialogController {
    private readonly p;
    private readonly ctn;
    /**
     * The settings used by this controller.
     */
    settings: IDialogLoadedSettings;
    readonly closed: Promise<DialogCloseResult>;
    /**
     * The dom structure created to support the dialog associated with this controller
     */
    private dom;
    protected static get inject(): (import("@aurelia/kernel").InterfaceSymbol<IPlatform> | import("@aurelia/kernel").InterfaceSymbol<IContainer>)[];
    constructor(p: IPlatform, container: IContainer);
    /**
     * Closes the dialog with a successful output.
     *
     * @param value - The returned success output.
     */
    ok(value?: unknown): Promise<DialogCloseResult<DialogDeactivationStatuses.Ok>>;
    /**
     * Closes the dialog with a cancel output.
     *
     * @param value - The returned cancel output.
     */
    cancel(value?: unknown): Promise<DialogCloseResult<DialogDeactivationStatuses.Cancel>>;
    /**
     * Closes the dialog with an error output.
     *
     * @param value - A reason for closing with an error.
     * @returns Promise An empty promise object.
     */
    error(value: unknown): Promise<void>;
    private getOrCreateVm;
    private getDefinition;
}
//# sourceMappingURL=dialog-controller.d.ts.map