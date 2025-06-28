'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kernel = require('@aurelia/kernel');
var runtimeHtml = require('@aurelia/runtime-html');

/** @internal */
const createInterface = kernel.DI.createInterface;
/** @internal */
const singletonRegistration = kernel.Registration.singleton;
/** @internal */
const instanceRegistration = kernel.Registration.instance;

/**
 * The dialog service for composing template and component into a dialog
 */
const IDialogService = /*@__PURE__*/ createInterface('IDialogService');
/**
 * The controller associated with every dialog component
 */
const IDialogController = /*@__PURE__*/ createInterface('IDialogController');
/**
 * An interface describing the object responsible for creating the dom structure of a dialog
 */
const IDialogDomRenderer = /*@__PURE__*/ createInterface('IDialogDomRenderer');
/**
 * An interface describing the DOM structure of a dialog
 */
const IDialogDom = /*@__PURE__*/ createInterface('IDialogDom');
/**
 * Global configuration for the dialog plugin
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IDialogGlobalSettings = /*@__PURE__*/ createInterface('IDialogGlobalSettings');
class DialogOpenResult {
    constructor(wasCancelled, dialog) {
        this.wasCancelled = wasCancelled;
        this.dialog = dialog;
    }
    static create(wasCancelled, dialog) {
        return new DialogOpenResult(wasCancelled, dialog);
    }
}
class DialogCloseResult {
    constructor(status, value) {
        this.status = status;
        this.value = value;
    }
    static create(status, value) {
        return new DialogCloseResult(status, value);
    }
}
// #endregion

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => {
        const paddedCode = String(code).padStart(4, '0');
        const message = getMessageByCode(code, ...details);
        const link = `https://docs.aurelia.io/developer-guides/error-messages/0901-to-0908/aur${paddedCode}`;
        return new Error(`AUR${paddedCode}: ${message}\n\nFor more information, see: ${link}`);
    }
    ;

const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [901 /* ErrorNames.dialog_not_all_dialogs_closed */]: `Failured to close all dialogs when deactivating the application, There are still {{0}} open dialog(s).`,
    [903 /* ErrorNames.dialog_settings_invalid */]: `Invalid Dialog Settings. You must provide either "component" or "template" or both.`,
    [904 /* ErrorNames.dialog_no_empty_default_configuration */]: `Invalid dialog configuration. ` +
        'Specify default renderer or use the DialogConfigurationStandard/DialogConfigurationClassic export.',
    [905 /* ErrorNames.dialog_activation_rejected */]: 'Dialog activation rejected',
    [906 /* ErrorNames.dialog_cancellation_rejected */]: 'Dialog cancellation rejected',
    [907 /* ErrorNames.dialog_cancelled_with_cancel_on_rejection_setting */]: 'Dialog cancelled with a rejection on cancel',
    [908 /* ErrorNames.dialog_custom_error */]: 'Dialog custom error',
    [909 /* ErrorNames.dialog_closed_before_deactivation */]: 'Dialog was closed before deactivation, did you call dialog.close()?',
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = String(value[method.slice(1)]);
                        }
                        else {
                            value = String(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};

/**
 * A controller object for a Dialog instance.
 */
class DialogController {
    constructor() {
        this.p = kernel.resolve(runtimeHtml.IPlatform);
        this.ctn = kernel.resolve(kernel.IContainer);
        this.closed = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    /** @internal */
    activate(settings) {
        const container = this.ctn.createChild();
        const { model, template, rejectOnCancel, renderer, } = settings;
        const resolvedRenderer = kernel.isFunction(renderer) ? container.invoke(renderer) : renderer;
        const dialogTargetHost = settings.host ?? this.p.document.body;
        const dom = this.dom = resolvedRenderer.render(dialogTargetHost, this, settings.options);
        const rootEventTarget = container.has(runtimeHtml.IEventTarget, true)
            ? container.get(runtimeHtml.IEventTarget)
            : null;
        const contentHost = dom.contentHost;
        this.settings = settings;
        // application root host may be a different element with the dialog root host
        // example:
        // <body>
        //   <my-app>
        //   <au-dialog-container>
        // when it's different, need to ensure delegate bindings work
        if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
            container.register(instanceRegistration(runtimeHtml.IEventTarget, dialogTargetHost));
        }
        container.register(instanceRegistration(IDialogDom, dom));
        runtimeHtml.registerHostNode(container, contentHost, this.p);
        return new Promise(r => {
            const cmp = Object.assign(this.cmp = this.getOrCreateVm(container, settings, contentHost), { $dialog: this });
            r(cmp.canActivate?.(model) ?? true);
        })
            .then(canActivate => {
            if (canActivate !== true) {
                dom.dispose();
                if (rejectOnCancel) {
                    throw createDialogCancelError(null, 905 /* ErrorNames.dialog_activation_rejected */);
                }
                return DialogOpenResult.create(true, this);
            }
            const cmp = this.cmp;
            return kernel.onResolve(cmp.activate?.(model), () => {
                const ctrlr = this.controller = runtimeHtml.Controller.$el(container, cmp, contentHost, null, runtimeHtml.CustomElementDefinition.create(this.getDefinition(cmp) ?? { name: runtimeHtml.CustomElement.generateName(), template }));
                return kernel.onResolve(ctrlr.activate(ctrlr, null), () => {
                    return kernel.onResolve(dom.show?.(), () => DialogOpenResult.create(false, this));
                });
            });
        }, e => {
            dom.dispose();
            throw e;
        });
    }
    /** @internal */
    deactivate(status, value) {
        if (this._closingPromise) {
            return this._closingPromise;
        }
        let deactivating = true;
        const { controller, dom, cmp, settings: { rejectOnCancel } } = this;
        const dialogResult = DialogCloseResult.create(status, value);
        const promise = new Promise(r => {
            r(kernel.onResolve(cmp.canDeactivate?.(dialogResult) ?? true, canDeactivate => {
                if (canDeactivate !== true) {
                    // we are done, do not block consecutive calls
                    deactivating = false;
                    this._closingPromise = void 0;
                    if (rejectOnCancel) {
                        throw createDialogCancelError(null, 906 /* ErrorNames.dialog_cancellation_rejected */);
                    }
                    return DialogCloseResult.create('abort');
                }
                return kernel.onResolve(cmp.deactivate?.(dialogResult), () => kernel.onResolve(dom.hide?.(), () => kernel.onResolve(controller.deactivate(controller, null), () => {
                    dom.dispose();
                    if (!rejectOnCancel && status !== 'error') {
                        this._resolve(dialogResult);
                    }
                    else {
                        this._reject(createDialogCancelError(value, 907 /* ErrorNames.dialog_cancelled_with_cancel_on_rejection_setting */));
                    }
                    return dialogResult;
                })));
            }));
        }).catch(reason => {
            this._closingPromise = void 0;
            throw reason;
        });
        // when component canDeactivate is synchronous, and returns something other than true
        // then the below assignment will override
        // the assignment inside the callback without the deactivating variable check
        this._closingPromise = deactivating ? promise : void 0;
        return promise;
    }
    /**
     * Closes the dialog with a successful output.
     *
     * @param value - The returned success output.
     */
    ok(value) {
        return this.deactivate('ok', value);
    }
    /**
     * Closes the dialog with a cancel output.
     *
     * @param value - The returned cancel output.
     */
    cancel(value) {
        return this.deactivate('cancel', value);
    }
    /**
     * Closes the dialog with an error output.
     *
     * @param value - A reason for closing with an error.
     * @returns Promise An empty promise object.
     */
    error(value) {
        const closeError = createDialogCloseError(value);
        return new Promise(r => r(kernel.onResolve(this.cmp.deactivate?.(DialogCloseResult.create('error', closeError)), () => kernel.onResolve(this.controller.deactivate(this.controller, null), () => {
            this.dom.dispose();
            this._reject(closeError);
        }))));
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
        container.registerResolver(p.HTMLElement, container.registerResolver(p.Element, container.registerResolver(runtimeHtml.INode, new kernel.InstanceProvider('ElementResolver', host))));
        return container.invoke(Component);
    }
    getDefinition(component) {
        const Ctor = (kernel.isFunction(component)
            ? component
            : component?.constructor);
        return runtimeHtml.CustomElement.isType(Ctor)
            ? runtimeHtml.CustomElement.getDefinition(Ctor)
            : null;
    }
}
class EmptyComponent {
}
function createDialogCancelError(output, code /* , msg: string */) {
    const error = createMappedError(code);
    error.wasCancelled = true;
    error.value = output;
    return error;
}
function createDialogCloseError(output) {
    const error = createMappedError(908 /* ErrorNames.dialog_custom_error */);
    error.wasCancelled = false;
    error.value = output;
    return error;
}

/**
 * A default implementation for the dialog service allowing for the creation of dialogs.
 */
class DialogService {
    constructor() {
        /**
         * The current dialog controllers
         *
         * @internal
         */
        this.dlgs = [];
        /** @internal */ this._ctn = kernel.resolve(kernel.IContainer);
        /** @internal */ this._defaultSettings = kernel.resolve(IDialogGlobalSettings);
    }
    static register(container) {
        container.register(singletonRegistration(this, this), kernel.Registration.aliasTo(this, IDialogService), runtimeHtml.AppTask.deactivating(IDialogService, dialogService => kernel.onResolve(dialogService.closeAll(), (openDialogControllers) => {
            if (openDialogControllers.length > 0) {
                // todo: what to do?
                throw createMappedError(901 /* ErrorNames.dialog_not_all_dialogs_closed */, openDialogControllers.length);
            }
        })));
    }
    get controllers() {
        return this.dlgs.slice(0);
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
            const $settings = DialogSettings.from(this._defaultSettings, settings);
            const container = $settings.container ?? this._ctn.createChild();
            resolve(kernel.onResolve($settings.load(), loadedSettings => {
                const dialogController = container.invoke(DialogController);
                container.register(instanceRegistration(IDialogController, dialogController), instanceRegistration(DialogController, dialogController));
                return kernel.onResolve(dialogController.activate(loadedSettings), openResult => {
                    if (!openResult.wasCancelled) {
                        this.dlgs.push(dialogController);
                        const $removeController = () => this.remove(dialogController);
                        void dialogController.closed.finally($removeController);
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
            return controller.cancel().then(result => result.status === 'cancel'
                ? null
                : controller);
        }))
            .then(unclosedControllers => 
        // something wrong with TS
        // it's unable to recognize that the null values are filtered out already
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        unclosedControllers.filter(unclosed => !!unclosed));
    }
    /** @internal */
    remove(controller) {
        const idx = this.dlgs.indexOf(controller);
        if (idx > -1) {
            this.dlgs.splice(idx, 1);
        }
    }
}
class DialogSettings {
    static from(baseSettings, settings) {
        const finalSettings = Object.assign(new DialogSettings(), baseSettings, settings, { options: { ...baseSettings.options ?? {}, ...settings.options ?? {} }
        });
        if (finalSettings.component == null && finalSettings.template == null) {
            throw createMappedError(903 /* ErrorNames.dialog_settings_invalid */);
        }
        return finalSettings;
    }
    load() {
        const loaded = this;
        const cmp = this.component;
        const template = this.template;
        const maybePromise = kernel.onResolveAll(cmp == null
            ? void 0
            : kernel.onResolve(runtimeHtml.CustomElement.isType(cmp)
                ? cmp
                : cmp(), 
            // (cmp as Exclude<typeof cmp, Constructable>)(),
            loadedCmp => { loaded.component = loadedCmp; }), kernel.isFunction(template)
            ? kernel.onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
            : void 0);
        return kernel.onResolve(maybePromise, () => loaded);
    }
}
function whenClosed(onfulfilled, onrejected) {
    return this.then(openResult => openResult.dialog.closed.then(onfulfilled, onrejected), onrejected);
}
function asDialogOpenPromise(promise) {
    promise.whenClosed = whenClosed;
    return promise;
}

class DialogDomRendererClassic {
    constructor() {
        this.p = kernel.resolve(runtimeHtml.IPlatform);
        /** @internal */
        this._eventManager = kernel.resolve(IDialogEventManager);
        this.overlayCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
        this.wrapperCss = `${this.overlayCss} display:flex;`;
        this.hostCss = 'position:relative;margin:auto;';
    }
    render(dialogHost, controller, options) {
        const doc = this.p.document;
        const h = (name, css) => {
            const el = doc.createElement(name);
            el.style.cssText = css;
            return el;
        };
        const { startingZIndex } = options ?? {};
        const wrapperCss = `${this.wrapperCss};${startingZIndex == null ? '' : `z-index:${startingZIndex}`}`;
        const wrapper = dialogHost.appendChild(h('au-dialog-container', wrapperCss));
        const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
        const host = wrapper.appendChild(h('div', this.hostCss));
        return new DialogDomClassic(wrapper, overlay, host, controller, this._eventManager, options ?? {});
    }
}
class DialogDomClassic {
    constructor(root, overlay, contentHost, controller, eventManager, options) {
        this.root = root;
        this.overlay = overlay;
        this.contentHost = contentHost;
        /** @internal */
        this._sub = null;
        this._controller = controller;
        this._eventManager = eventManager;
        this._options = options ?? {};
    }
    show() {
        return kernel.onResolve(this._options?.show?.(this), () => {
            this._sub = this._eventManager.add(this._controller, this);
        });
    }
    hide() {
        this._sub?.dispose();
        return this._options?.hide?.(this);
    }
    dispose() {
        this._sub?.dispose();
        this.root.remove();
    }
}
const IDialogEventManager = /*@__PURE__*/ createInterface('IDialogEventManager', x => x.singleton(DialogEventManagerClassic));
class DialogEventManagerClassic {
    constructor() {
        this.ctrls = [];
        this.w = kernel.resolve(runtimeHtml.IWindow);
    }
    add(controller, dom) {
        if (this.ctrls.push(controller) === 1) {
            this.w.addEventListener('keydown', this);
        }
        const options = controller.settings.options;
        const lock = options.lock;
        let overlayDismiss = options.overlayDismiss;
        overlayDismiss = typeof overlayDismiss === 'boolean' ? overlayDismiss : !lock;
        const mouseEvent = options.mouseEvent ?? 'click';
        const handleClick = (e) => {
            if ( /* user allows dismiss on overlay click */overlayDismiss
                && /* did not click inside the host element */ !dom.contentHost.contains(e.target)) {
                void controller.cancel();
            }
        };
        dom.overlay?.addEventListener(mouseEvent, handleClick);
        const handleSubmit = (e) => {
            const target = e.target;
            const noAction = !target.getAttribute('action');
            if (target.tagName === 'FORM' && noAction) {
                e.preventDefault();
            }
        };
        dom.contentHost.addEventListener('submit', handleSubmit);
        let disposed = false;
        return {
            dispose: () => {
                if (disposed) {
                    return;
                }
                disposed = true;
                this._remove(controller);
                dom.overlay?.removeEventListener(mouseEvent, handleClick);
                dom.contentHost.removeEventListener('submit', handleSubmit);
            }
        };
    }
    /** @internal */
    _remove(controller) {
        const ctrls = this.ctrls;
        const idx = ctrls.indexOf(controller);
        if (idx !== -1) {
            ctrls.splice(idx, 1);
        }
        if (ctrls.length === 0) {
            this.w.removeEventListener('keydown', this);
        }
    }
    /** @internal */
    _getKeyboardOptions(ctrl) {
        const options = ctrl.settings.options;
        return options.keyboard ?? (options.lock ? [] : ['Enter', 'Escape']);
    }
    /** @internal */
    handleEvent(e) {
        const keyEvent = e;
        const key = DialogEventManagerClassic._getActionKey(keyEvent);
        if (key == null) {
            return;
        }
        const top = this.ctrls.slice(-1)[0];
        if (top == null) {
            return;
        }
        const keyboard = this._getKeyboardOptions(top);
        if (key === 'Escape' && keyboard.includes(key)) {
            void top.cancel();
        }
        else if (key === 'Enter' && keyboard.includes(key)) {
            void top.ok();
        }
    }
    /** @internal */
    static _getActionKey(e) {
        if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
            return 'Escape';
        }
        if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
            return 'Enter';
        }
        return undefined;
    }
}

class DialogDomRendererStandard {
    constructor() {
        this.p = kernel.resolve(runtimeHtml.IPlatform);
    }
    render(dialogHost, controller, options = {}) {
        const h = (name) => this.p.document.createElement(name);
        const wrapper = h('dialog');
        const host = wrapper.appendChild(h('div'));
        if (options.closedby) {
            wrapper.setAttribute('closedby', options.closedby);
        }
        dialogHost.appendChild(wrapper);
        return new DialogDomStandard(wrapper, host, controller, options);
    }
}
class DialogDomStandard {
    constructor(root, contentHost, controller, options) {
        this.root = root;
        this.contentHost = contentHost;
        /** @internal */
        this._overlayStyleEl = null;
        this._controller = controller;
        this._options = options;
        this._styleParser = root.ownerDocument.createElement('div');
        if (options.overlayStyle != null) {
            this.setOverlayStyle(options.overlayStyle);
        }
    }
    setOverlayStyle(css) {
        const el = this._overlayStyleEl ??= this.root.insertAdjacentElement('afterbegin', this.root.ownerDocument.createElement('style'));
        const styleParser = this._styleParser;
        styleParser.style.cssText = '';
        if (kernel.isString(css)) {
            styleParser.style.cssText = css;
        }
        else {
            Object.assign(styleParser.style, css);
        }
        el.textContent = `:modal::backdrop{${styleParser.style.cssText}}`;
    }
    show() {
        if (this._options.modal) {
            this.root.showModal();
        }
        else {
            this.root.show();
        }
        return kernel.onResolve(this._options.show?.(this), () => {
            this.root.addEventListener('cancel', this);
        });
    }
    hide() {
        // istanbul ignore next
        if (!this.root.open) {
            {
                // eslint-disable-next-line no-console
                console.warn(createMappedError(909 /* ErrorNames.dialog_closed_before_deactivation */));
            }
        }
        return kernel.onResolve(this._options.hide?.(this), () => {
            this.root.removeEventListener('cancel', this);
            this.root.close();
        });
    }
    dispose() {
        this.root.remove();
    }
    /** @internal */
    handleEvent(event) {
        /**
         * The cancel event fires on a <dialog> element when the user instructs the browser that they wish to dismiss the
         * current open dialog. The browser fires this event when the user presses the Esc key.
         *
         * Prevent native dismiss and invoke controller cancel pipeline
         */
        event.preventDefault();
        void this._controller.cancel();
    }
}

function createDialogConfiguration(settingsProvider, defaults) {
    return {
        register: (ctn) => ctn.register(singletonRegistration(IDialogGlobalSettings, defaults), DialogService, runtimeHtml.AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalSettings)))),
        customize(cb) {
            return createDialogConfiguration(cb, defaults);
        },
    };
}
/**
 * A noop configuration for Dialog, should be used as:
 ```ts
 DialogConfiguration.customize(settings => {
   // provide at least default renderer
   settings.renderer = MyRenderer;
 })
 ```
 */
const DialogConfiguration = /*@__PURE__*/ createDialogConfiguration(() => {
    throw createMappedError(904 /* ErrorNames.dialog_no_empty_default_configuration */);
}, class {
    constructor() {
        this.options = {};
    }
});
/**
 * A configuration for Dialog that uses the `<dialog>` element.
 */
const DialogConfigurationStandard = /*@__PURE__*/ createDialogConfiguration(kernel.noop, class {
    constructor() {
        this.renderer = DialogDomRendererStandard;
        this.options = {
            modal: true
        };
    }
});
/**
 * A configuration for Dialog that uses the light DOM for rendering dialog and its overlay.
 */
const DialogConfigurationClassic = /*@__PURE__*/ createDialogConfiguration(kernel.noop, class {
    constructor() {
        this.renderer = DialogDomRendererClassic;
        this.options = {
            lock: true,
            startingZIndex: 1000,
        };
    }
});

exports.DialogCloseResult = DialogCloseResult;
exports.DialogConfiguration = DialogConfiguration;
exports.DialogConfigurationClassic = DialogConfigurationClassic;
exports.DialogConfigurationStandard = DialogConfigurationStandard;
exports.DialogController = DialogController;
exports.DialogDomClassic = DialogDomClassic;
exports.DialogDomRendererClassic = DialogDomRendererClassic;
exports.DialogDomRendererStandard = DialogDomRendererStandard;
exports.DialogDomStandard = DialogDomStandard;
exports.DialogOpenResult = DialogOpenResult;
exports.DialogService = DialogService;
exports.IDialogController = IDialogController;
exports.IDialogDom = IDialogDom;
exports.IDialogDomRenderer = IDialogDomRenderer;
exports.IDialogGlobalSettings = IDialogGlobalSettings;
exports.IDialogService = IDialogService;
exports.createDialogConfiguration = createDialogConfiguration;
//# sourceMappingURL=index.dev.cjs.map
