"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogDeactivationStatuses = exports.DialogCloseResult = exports.DialogOpenResult = exports.IDialogGlobalSettings = exports.IDialogDom = exports.IDialogDomRenderer = exports.IDialogController = exports.IDialogService = void 0;
const kernel_1 = require("@aurelia/kernel");
/**
 * The dialog service for composing view & view model into a dialog
 */
exports.IDialogService = kernel_1.DI.createInterface('IDialogService');
/**
 * The controller asscociated with every dialog view model
 */
exports.IDialogController = kernel_1.DI.createInterface('IDialogController');
/**
 * An interface describing the object responsible for creating the dom structure of a dialog
 */
exports.IDialogDomRenderer = kernel_1.DI.createInterface('IDialogDomRenderer');
/**
 * An interface describing the DOM structure of a dialog
 */
exports.IDialogDom = kernel_1.DI.createInterface('IDialogDom');
exports.IDialogGlobalSettings = kernel_1.DI.createInterface('IDialogGlobalSettings');
class DialogOpenResult {
    constructor(wasCancelled, dialog) {
        this.wasCancelled = wasCancelled;
        this.dialog = dialog;
    }
    static create(wasCancelled, dialog) {
        return new DialogOpenResult(wasCancelled, dialog);
    }
}
exports.DialogOpenResult = DialogOpenResult;
class DialogCloseResult {
    constructor(status, value) {
        this.status = status;
        this.value = value;
    }
    static create(status, value) {
        return new DialogCloseResult(status, value);
    }
}
exports.DialogCloseResult = DialogCloseResult;
var DialogDeactivationStatuses;
(function (DialogDeactivationStatuses) {
    DialogDeactivationStatuses["Ok"] = "ok";
    DialogDeactivationStatuses["Error"] = "error";
    DialogDeactivationStatuses["Cancel"] = "cancel";
    /**
     * If a view model refused to deactivate in canDeactivate,
     * then this status should be used to reflect that
     */
    DialogDeactivationStatuses["Abort"] = "abort";
})(DialogDeactivationStatuses = exports.DialogDeactivationStatuses || (exports.DialogDeactivationStatuses = {}));
// #endregion
//# sourceMappingURL=dialog-interfaces.js.map