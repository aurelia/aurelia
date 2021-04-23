import { IContainer, InstanceProvider, onResolve, Registration } from '@aurelia/kernel';
import { Controller } from '../controller.js';
import { IDialogDomRenderer, IDialogDom, DialogOpenResult, DialogCloseResult, } from './dialog-interfaces.js';
import { IEventTarget, INode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { CustomElement, CustomElementDefinition } from '../../resources/custom-element.js';
/**
 * A controller object for a Dialog instance.
 */
export class DialogController {
    constructor(p, container) {
        this.p = p;
        this.ctn = container;
        this.closed = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    static get inject() { return [IPlatform, IContainer]; }
    /** @internal */
    activate(settings) {
        var _a;
        const { ctn: container } = this;
        const { model, template, rejectOnCancel } = settings;
        const hostRenderer = container.get(IDialogDomRenderer);
        const dialogTargetHost = (_a = settings.host) !== null && _a !== void 0 ? _a : this.p.document.body;
        const dom = this.dom = hostRenderer.render(dialogTargetHost, settings);
        const rootEventTarget = container.has(IEventTarget, true)
            ? container.get(IEventTarget)
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
            container.register(Registration.instance(IEventTarget, dialogTargetHost));
        }
        container.register(Registration.instance(INode, contentHost), Registration.instance(IDialogDom, dom));
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
                return DialogOpenResult.create(true, this);
            }
            const cmp = this.cmp;
            return onResolve((_a = cmp.activate) === null || _a === void 0 ? void 0 : _a.call(cmp, model), () => {
                var _a;
                const ctrlr = this.controller = Controller.forCustomElement(null, container, cmp, contentHost, null, 0 /* none */, true, CustomElementDefinition.create((_a = this.getDefinition(cmp)) !== null && _a !== void 0 ? _a : { name: CustomElement.generateName(), template }));
                return onResolve(ctrlr.activate(ctrlr, null, 2 /* fromBind */), () => {
                    var _a;
                    dom.overlay.addEventListener((_a = settings.mouseEvent) !== null && _a !== void 0 ? _a : 'click', this);
                    return DialogOpenResult.create(false, this);
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
        const dialogResult = DialogCloseResult.create(status, value);
        const promise = new Promise(r => {
            var _a, _b;
            r(onResolve((_b = (_a = cmp.canDeactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult)) !== null && _b !== void 0 ? _b : true, canDeactivate => {
                var _a;
                if (canDeactivate !== true) {
                    // we are done, do not block consecutive calls
                    deactivating = false;
                    this.closingPromise = void 0;
                    if (rejectOnCancel) {
                        throw createDialogCancelError(null, 'Dialog cancellation rejected');
                    }
                    return DialogCloseResult.create("abort" /* Abort */);
                }
                return onResolve((_a = cmp.deactivate) === null || _a === void 0 ? void 0 : _a.call(cmp, dialogResult), () => onResolve(controller.deactivate(controller, null, 4 /* fromUnbind */), () => {
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
            return r(onResolve((_b = (_a = this.cmp).deactivate) === null || _b === void 0 ? void 0 : _b.call(_a, DialogCloseResult.create("error" /* Error */, closeError)), () => onResolve(this.controller.deactivate(this.controller, null, 4 /* fromUnbind */), () => {
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
        const ep = new InstanceProvider('ElementResolver');
        ep.prepare(host);
        container.registerResolver(INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
        return container.invoke(Component);
    }
    getDefinition(component) {
        const Ctor = (typeof component === 'function'
            ? component
            : component === null || component === void 0 ? void 0 : component.constructor);
        return CustomElement.isType(Ctor)
            ? CustomElement.getDefinition(Ctor)
            : null;
    }
}
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