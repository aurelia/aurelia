"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogController = void 0;
const kernel_1 = require("@aurelia/kernel");
const controller_js_1 = require("../controller.js");
const dialog_interfaces_js_1 = require("./dialog-interfaces.js");
const dom_js_1 = require("../../dom.js");
const platform_js_1 = require("../../platform.js");
const custom_element_js_1 = require("../../resources/custom-element.js");
/**
 * A controller object for a Dialog instance.
 */
class DialogController {
    constructor(p, container) {
        this.p = p;
        this.ctn = container;
        this.closed = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    static get inject() { return [platform_js_1.IPlatform, kernel_1.IContainer]; }
    /** @internal */
    activate(settings) {
        var _a;
        const container = this.ctn.createChild();
        const { model, template, rejectOnCancel } = settings;
        const hostRenderer = container.get(dialog_interfaces_js_1.IDialogDomRenderer);
        const dialogTargetHost = (_a = settings.host) !== null && _a !== void 0 ? _a : this.p.document.body;
        const dom = this.dom = hostRenderer.render(dialogTargetHost, settings);
        const rootEventTarget = container.has(dom_js_1.IEventTarget, true)
            ? container.get(dom_js_1.IEventTarget)
            : null;
        const contentHost = dom.contentHost;
        this.settings = settings;
        // application root host may be a different element with the dialog root host
        // example:
        // <body>
        //   <my-app>
        //   <au-dialog-container>
        // when it's different, needs to ensure delegate bindings work
        if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
            container.register(kernel_1.Registration.instance(dom_js_1.IEventTarget, dialogTargetHost));
        }
        container.register(kernel_1.Registration.instance(dom_js_1.INode, contentHost), kernel_1.Registration.instance(dialog_interfaces_js_1.IDialogDom, dom));
        return new Promise(r => {
            var _a, _b;
            const cmp = Object.assign(this.cmp = this.getOrCreateVm(container, settings, contentHost), { $dialog: this });
            r((_b = (_a = cmp.canActivate) === null || _a === void 0 ? void 0 : _a.call(cmp, model)) !== null && _b !== void 0 ? _b : true);
        })
            .then(canActivate => {
            var _a;
            if (canActivate !== true) {
                dom.dispose();
                if (rejectOnCancel) {
                    throw createDialogCancelError(null, 'Dialog activation rejected');
                }
                return dialog_interfaces_js_1.DialogOpenResult.create(true, this);
            }
            const cmp = this.cmp;
            return kernel_1.onResolve((_a = cmp.activate) === null || _a === void 0 ? void 0 : _a.call(cmp, model), () => {
                var _a;
                const ctrlr = this.controller = controller_js_1.Controller.forCustomElement(null, container, container, cmp, contentHost, null, 0 /* none */, true, custom_element_js_1.CustomElementDefinition.create((_a = this.getDefinition(cmp)) !== null && _a !== void 0 ? _a : { name: custom_element_js_1.CustomElement.generateName(), template }));
                return kernel_1.onResolve(ctrlr.activate(ctrlr, null, 2 /* fromBind */), () => {
                    var _a;
                    dom.overlay.addEventListener((_a = settings.mouseEvent) !== null && _a !== void 0 ? _a : 'click', this);
                    return dialog_interfaces_js_1.DialogOpenResult.create(false, this);
                });
            });
        }, e => {
            dom.dispose();
            throw e;
        });
    }
    /** @internal */
    deactivate(status, value) {
        if (this.closingPromise) {
            return this.closingPromise;
        }
        let deactivating = true;
        const { controller, dom, cmp, settings: { mouseEvent, rejectOnCancel } } = this;
        const dialogResult = dialog_interfaces_js_1.DialogCloseResult.create(status, value);
        const promise = new Promise(r => {
            var _a, _b;
            r(kernel_1.onResolve((_b = (_a = cmp.canDeactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult)) !== null && _b !== void 0 ? _b : true, canDeactivate => {
                var _a;
                if (canDeactivate !== true) {
                    // we are done, do not block consecutive calls
                    deactivating = false;
                    this.closingPromise = void 0;
                    if (rejectOnCancel) {
                        throw createDialogCancelError(null, 'Dialog cancellation rejected');
                    }
                    return dialog_interfaces_js_1.DialogCloseResult.create("abort" /* Abort */);
                }
                return kernel_1.onResolve((_a = cmp.deactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult), () => kernel_1.onResolve(controller.deactivate(controller, null, 4 /* fromUnbind */), () => {
                    dom.dispose();
                    dom.overlay.removeEventListener(mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : 'click', this);
                    if (!rejectOnCancel && status !== "error" /* Error */) {
                        this.resolve(dialogResult);
                    }
                    else {
                        this.reject(createDialogCancelError(value, 'Dialog cancelled with a rejection on cancel'));
                    }
                    return dialogResult;
                }));
            }));
        }).catch(reason => {
            this.closingPromise = void 0;
            throw reason;
        });
        // when component canDeactivate is synchronous, and returns something other than true
        // then the below assignment will override
        // the assignment inside the callback without the deactivating variable check
        this.closingPromise = deactivating ? promise : void 0;
        return promise;
    }
    /**
     * Closes the dialog with a successful output.
     *
     * @param value - The returned success output.
     */
    ok(value) {
        return this.deactivate("ok" /* Ok */, value);
    }
    /**
     * Closes the dialog with a cancel output.
     *
     * @param value - The returned cancel output.
     */
    cancel(value) {
        return this.deactivate("cancel" /* Cancel */, value);
    }
    /**
     * Closes the dialog with an error output.
     *
     * @param value - A reason for closing with an error.
     * @returns Promise An empty promise object.
     */
    error(value) {
        const closeError = createDialogCloseError(value);
        return new Promise(r => {
            var _a, _b;
            return r(kernel_1.onResolve((_b = (_a = this.cmp).deactivate) === null || _b === void 0 ? void 0 : _b.call(_a, dialog_interfaces_js_1.DialogCloseResult.create("error" /* Error */, closeError)), () => kernel_1.onResolve(this.controller.deactivate(this.controller, null, 4 /* fromUnbind */), () => {
                this.dom.dispose();
                this.reject(closeError);
            })));
        });
    }
    /** @internal */
    handleEvent(event) {
        if ( /* user allows dismiss on overlay click */this.settings.overlayDismiss
            && /* did not click inside the host element */ !this.dom.contentHost.contains(event.target)) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.cancel();
        }
    }
    getOrCreateVm(container, settings, host) {
        const Component = settings.component;
        if (Component == null) {
            return new EmptyComponent();
        }
        if (typeof Component === 'object') {
            return Component;
        }
        const p = this.p;
        const ep = new kernel_1.InstanceProvider('ElementResolver');
        ep.prepare(host);
        container.registerResolver(dom_js_1.INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
        return container.invoke(Component);
    }
    getDefinition(component) {
        const Ctor = (typeof component === 'function'
            ? component
            : component === null || component === void 0 ? void 0 : component.constructor);
        return custom_element_js_1.CustomElement.isType(Ctor)
            ? custom_element_js_1.CustomElement.getDefinition(Ctor)
            : null;
    }
}
exports.DialogController = DialogController;
class EmptyComponent {
}
function createDialogCancelError(output, msg) {
    const error = new Error(msg);
    error.wasCancelled = true;
    error.value = output;
    return error;
}
function createDialogCloseError(output) {
    const error = new Error();
    error.wasCancelled = false;
    error.value = output;
    return error;
}
//# sourceMappingURL=dialog-controller.js.map