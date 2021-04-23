import { DI } from '../../../../../kernel/dist/native-modules/index.js';
/**
 * The dialog service for composing view & view model into a dialog
 */
export const IDialogService = DI.createInterface('IDialogService');
/**
 * The controller asscociated with every dialog view model
 */
export const IDialogController = DI.createInterface('IDialogController');
/**
 * An interface describing the object responsible for creating the dom structure of a dialog
 */
export const IDialogDomRenderer = DI.createInterface('IDialogDomRenderer');
/**
 * An interface describing the DOM structure of a dialog
 */
export const IDialogDom = DI.createInterface('IDialogDom');
export const IDialogGlobalSettings = DI.createInterface('IDialogGlobalSettings');
export class DialogOpenResult {
    constructor(wasCancelled, dialog) {
        this.wasCancelled = wasCancelled;
        this.dialog = dialog;
    }
    static create(wasCancelled, dialog) {
        return new DialogOpenResult(wasCancelled, dialog);
    }
}
export class DialogCloseResult {
    constructor(status, value) {
        this.status = status;
        this.value = value;
    }
    static create(status, value) {
        return new DialogCloseResult(status, value);
    }
}
export var DialogDeactivationStatuses;
(function (DialogDeactivationStatuses) {
    DialogDeactivationStatuses["Ok"] = "ok";
    DialogDeactivationStatuses["Error"] = "error";
    DialogDeactivationStatuses["Cancel"] = "cancel";
    /**
     * If a view model refused to deactivate in canDeactivate,
     * then this status should be used to reflect that
     */
    DialogDeactivationStatuses["Abort"] = "abort";
})(DialogDeactivationStatuses || (DialogDeactivationStatuses = {}));
// #endregion
//# sourceMappingURL=dialog-interfaces.js.map