"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogService = void 0;
const kernel_1 = require("@aurelia/kernel");
const dialog_interfaces_js_1 = require("./dialog-interfaces.js");
const dialog_controller_js_1 = require("./dialog-controller.js");
const app_task_js_1 = require("../../app-task.js");
const platform_js_1 = require("../../platform.js");
/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
class DialogService {
    constructor(container, p, defaultSettings) {
        this.container = container;
        this.p = p;
        this.defaultSettings = defaultSettings;
        /**
         * The current dialog controllers
         *
         * @internal
         */
        this.dlgs = [];
    }
    get controllers() {
        return this.dlgs.slice(0);
    }
    get top() {
        const dlgs = this.dlgs;
        return dlgs.length > 0 ? dlgs[dlgs.length - 1] : null;
    }
    // tslint:disable-next-line:member-ordering
    static get inject() { return [kernel_1.IContainer, platform_js_1.IPlatform, dialog_interfaces_js_1.IDialogGlobalSettings]; }
    static register(container) {
        container.register(kernel_1.Registration.singleton(dialog_interfaces_js_1.IDialogService, this), app_task_js_1.AppTask.beforeDeactivate(dialog_interfaces_js_1.IDialogService, dialogService => kernel_1.onResolve(dialogService.closeAll(), (openDialogController) => {
            if (openDialogController.length > 0) {
                // todo: what to do?
                throw new Error(`There are still ${openDialogController.length} open dialog(s).`);
            }
        })));
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
    open(settings) {
        return asDialogOpenPromise(new Promise(resolve => {
            var _a;
            const $settings = DialogSettings.from(this.defaultSettings, settings);
            const container = (_a = $settings.container) !== null && _a !== void 0 ? _a : this.container.createChild();
            resolve(kernel_1.onResolve($settings.load(), loadedSettings => {
                const dialogController = container.invoke(dialog_controller_js_1.DialogController);
                container.register(kernel_1.Registration.instance(dialog_interfaces_js_1.IDialogController, dialogController));
                container.register(kernel_1.Registration.callback(dialog_controller_js_1.DialogController, () => {
                    throw new Error('Invalid injection of DialogController. Use IDialogController instead.');
                }));
                return kernel_1.onResolve(dialogController.activate(loadedSettings), openResult => {
                    if (!openResult.wasCancelled) {
                        if (this.dlgs.push(dialogController) === 1) {
                            this.p.window.addEventListener('keydown', this);
                        }
                        const $removeController = () => this.remove(dialogController);
                        dialogController.closed.then($removeController, $removeController);
                    }
                    return openResult;
                });
            }));
        }));
    }
    /**
     * Closes all open dialogs at the time of invocation.
     *
     * @returns All controllers whose close operation was cancelled.
     */
    closeAll() {
        return Promise
            .all(Array.from(this.dlgs)
            .map(controller => {
            if (controller.settings.rejectOnCancel) {
                // this will throw when calling cancel
                // so only leave return null as noop
                return controller.cancel().then(() => null);
            }
            return controller.cancel().then(result => result.status === "cancel" /* Cancel */
                ? null
                : controller);
        }))
            .then(unclosedControllers => unclosedControllers.filter(unclosed => !!unclosed));
    }
    /** @internal */
    remove(controller) {
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
    handleEvent(e) {
        const keyEvent = e;
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
        }
        else if (key === 'Enter' && keyboard.includes(key)) {
            void top.ok();
        }
    }
}
exports.DialogService = DialogService;
class DialogSettings {
    static from(...srcs) {
        return Object.assign(new DialogSettings(), ...srcs)
            .validate()
            .normalize();
    }
    load() {
        const loaded = this;
        const cmp = this.component;
        const template = this.template;
        const maybePromise = kernel_1.resolveAll(...[
            cmp == null
                ? void 0
                : kernel_1.onResolve(cmp(), loadedCmp => { loaded.component = loadedCmp; }),
            typeof template === 'function'
                ? kernel_1.onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
                : void 0
        ]);
        return maybePromise instanceof Promise
            ? maybePromise.then(() => loaded)
            : loaded;
    }
    validate() {
        if (this.component == null && this.template == null) {
            throw new Error('Invalid Dialog Settings. You must provide "component", "template" or both.');
        }
        return this;
    }
    normalize() {
        if (this.keyboard == null) {
            this.keyboard = this.lock ? [] : ['Enter', 'Escape'];
        }
        if (typeof this.overlayDismiss !== 'boolean') {
            this.overlayDismiss = !this.lock;
        }
        return this;
    }
}
function whenClosed(onfulfilled, onrejected) {
    return this.then(openResult => openResult.dialog.closed.then(onfulfilled, onrejected), onrejected);
}
function asDialogOpenPromise(promise) {
    promise.whenClosed = whenClosed;
    return promise;
}
function getActionKey(e) {
    if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
        return 'Escape';
    }
    if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
        return 'Enter';
    }
    return undefined;
}
//# sourceMappingURL=dialog-service.js.map