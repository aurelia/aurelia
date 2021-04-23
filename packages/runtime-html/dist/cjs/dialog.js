"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDialogGlobalSettings = exports.DefaultDialogDomRenderer = exports.DefaultDialogDom = exports.DialogDefaultConfiguration = exports.DialogConfiguration = exports.DialogService = exports.DialogController = exports.IDialogGlobalSettings = exports.DialogOpenResult = exports.DialogCloseResult = exports.IDialogDom = exports.IDialogDomRenderer = exports.IDialogController = exports.IDialogService = exports.DialogDeactivationStatuses = void 0;
var dialog_interfaces_js_1 = require("./templating/dialog/dialog-interfaces.js");
Object.defineProperty(exports, "DialogDeactivationStatuses", { enumerable: true, get: function () { return dialog_interfaces_js_1.DialogDeactivationStatuses; } });
// main interfaces
Object.defineProperty(exports, "IDialogService", { enumerable: true, get: function () { return dialog_interfaces_js_1.IDialogService; } });
Object.defineProperty(exports, "IDialogController", { enumerable: true, get: function () { return dialog_interfaces_js_1.IDialogController; } });
Object.defineProperty(exports, "IDialogDomRenderer", { enumerable: true, get: function () { return dialog_interfaces_js_1.IDialogDomRenderer; } });
Object.defineProperty(exports, "IDialogDom", { enumerable: true, get: function () { return dialog_interfaces_js_1.IDialogDom; } });
// dialog results
Object.defineProperty(exports, "DialogCloseResult", { enumerable: true, get: function () { return dialog_interfaces_js_1.DialogCloseResult; } });
Object.defineProperty(exports, "DialogOpenResult", { enumerable: true, get: function () { return dialog_interfaces_js_1.DialogOpenResult; } });
Object.defineProperty(exports, "IDialogGlobalSettings", { enumerable: true, get: function () { return dialog_interfaces_js_1.IDialogGlobalSettings; } });
var dialog_controller_js_1 = require("./templating/dialog/dialog-controller.js");
Object.defineProperty(exports, "DialogController", { enumerable: true, get: function () { return dialog_controller_js_1.DialogController; } });
var dialog_service_js_1 = require("./templating/dialog/dialog-service.js");
Object.defineProperty(exports, "DialogService", { enumerable: true, get: function () { return dialog_service_js_1.DialogService; } });
var dialog_configuration_js_1 = require("./templating/dialog/dialog-configuration.js");
Object.defineProperty(exports, "DialogConfiguration", { enumerable: true, get: function () { return dialog_configuration_js_1.DialogConfiguration; } });
Object.defineProperty(exports, "DialogDefaultConfiguration", { enumerable: true, get: function () { return dialog_configuration_js_1.DialogDefaultConfiguration; } });
var dialog_default_impl_js_1 = require("./templating/dialog/dialog-default-impl.js");
Object.defineProperty(exports, "DefaultDialogDom", { enumerable: true, get: function () { return dialog_default_impl_js_1.DefaultDialogDom; } });
Object.defineProperty(exports, "DefaultDialogDomRenderer", { enumerable: true, get: function () { return dialog_default_impl_js_1.DefaultDialogDomRenderer; } });
Object.defineProperty(exports, "DefaultDialogGlobalSettings", { enumerable: true, get: function () { return dialog_default_impl_js_1.DefaultDialogGlobalSettings; } });
//# sourceMappingURL=dialog.js.map