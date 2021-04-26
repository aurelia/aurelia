"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogDefaultConfiguration = exports.DialogConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const dialog_interfaces_js_1 = require("./dialog-interfaces.js");
const dialog_default_impl_js_1 = require("./dialog-default-impl.js");
const app_task_js_1 = require("../../app-task.js");
const dialog_service_js_1 = require("./dialog-service.js");
function createDialogConfiguration(settingsProvider, registrations) {
    return {
        settingsProvider: settingsProvider,
        register: (ctn) => ctn.register(...registrations, app_task_js_1.AppTask.beforeCreate(() => settingsProvider(ctn.get(dialog_interfaces_js_1.IDialogGlobalSettings)))),
        customize(cb, regs) {
            return createDialogConfiguration(cb, regs !== null && regs !== void 0 ? regs : registrations);
        },
    };
}
/**
 * A noop configuration for Dialog, should be used as:
```ts
DialogConfiguration.customize(settings => {
  // adjust default value of the settings
}, [all_implementations_here])
```
 */
exports.DialogConfiguration = createDialogConfiguration(() => {
    throw new Error('Invalid dialog configuration. ' +
        'Specify the implementations for ' +
        '<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
        'or use the DialogDefaultConfiguration export.');
}, [class NoopDialogGlobalSettings {
        static register(container) {
            container.register(kernel_1.Registration.singleton(dialog_interfaces_js_1.IDialogGlobalSettings, this));
        }
    }]);
exports.DialogDefaultConfiguration = createDialogConfiguration(kernel_1.noop, [
    dialog_service_js_1.DialogService,
    dialog_default_impl_js_1.DefaultDialogGlobalSettings,
    dialog_default_impl_js_1.DefaultDialogDomRenderer,
]);
//# sourceMappingURL=dialog-configuration.js.map