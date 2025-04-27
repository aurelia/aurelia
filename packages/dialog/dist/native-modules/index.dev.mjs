import { DI, Registration, resolve, IContainer, onResolve, InstanceProvider, isFunction, onResolveAll, isPromise, optional, noop } from '../../../kernel/dist/native-modules/index.mjs';
import { IPlatform, IEventTarget, registerHostNode, Controller, CustomElementDefinition, CustomElement, INode, AppTask, IWindow } from '../../../runtime-html/dist/native-modules/index.mjs';

/** @internal */
const createInterface = DI.createInterface;
/** @internal */
const singletonRegistration = Registration.singleton;
/** @internal */
const instanceRegistration = Registration.instance;

/**
 * The dialog service for composing view & view model into a dialog
 */
const IDialogService = /*@__PURE__*/ createInterface('IDialogService');
/**
 * The controller asscociated with every dialog view model
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
 * An interface for managing the animations of dialog doms.
 * This is only used by the default dialog renderer.
 */
const IDialogDomAnimator = /*@__PURE__*/ createInterface('IDialogDomAnimator');
const IDialogEventManager = /*@__PURE__*/ createInterface('IDialogKeyboardService');
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
        'Specify the implementations for <IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, ' +
        'or use the DialogDefaultConfiguration export.',
    [905 /* ErrorNames.dialog_activation_rejected */]: 'Dialog activation rejected',
    [906 /* ErrorNames.dialog_cancellation_rejected */]: 'Dialog cancellation rejected',
    [907 /* ErrorNames.dialog_cancelled_with_cancel_on_rejection_setting */]: 'Dialog cancelled with a rejection on cancel',
    [908 /* ErrorNames.dialog_custom_error */]: 'Dialog custom error',
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
        this.p = resolve(IPlatform);
        this.ctn = resolve(IContainer);
        /** @internal */
        this._disposeHandler = void 0;
        this.closed = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    /** @internal */
    activate(settings) {
        const container = this.ctn.createChild();
        const { model, template, rejectOnCancel, renderer = container.get(IDialogDomRenderer), } = settings;
        const dialogTargetHost = settings.host ?? this.p.document.body;
        const dom = this.dom = renderer.render(dialogTargetHost, settings);
        const rootEventTarget = container.has(IEventTarget, true)
            ? container.get(IEventTarget)
            : null;
        const contentHost = dom.contentHost;
        const eventManager = container.get(IDialogEventManager);
        this.settings = settings;
        // application root host may be a different element with the dialog root host
        // example:
        // <body>
        //   <my-app>
        //   <au-dialog-container>
        // when it's different, needs to ensure delegate bindings work
        if (rootEventTarget == null || !rootEventTarget.contains(dialogTargetHost)) {
            container.register(instanceRegistration(IEventTarget, dialogTargetHost));
        }
        container.register(instanceRegistration(IDialogDom, dom));
        registerHostNode(container, contentHost, this.p);
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
            return onResolve(cmp.activate?.(model), () => {
                const ctrlr = this.controller = Controller.$el(container, cmp, contentHost, null, CustomElementDefinition.create(this.getDefinition(cmp) ?? { name: CustomElement.generateName(), template }));
                return onResolve(ctrlr.activate(ctrlr, null), () => {
                    this._disposeHandler = eventManager.add(this, dom);
                    return onResolve(dom.show?.(), () => DialogOpenResult.create(false, this));
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
            r(onResolve(cmp.canDeactivate?.(dialogResult) ?? true, canDeactivate => {
                if (canDeactivate !== true) {
                    // we are done, do not block consecutive calls
                    deactivating = false;
                    this._closingPromise = void 0;
                    if (rejectOnCancel) {
                        throw createDialogCancelError(null, 906 /* ErrorNames.dialog_cancellation_rejected */);
                    }
                    return DialogCloseResult.create('abort');
                }
                return onResolve(cmp.deactivate?.(dialogResult), () => onResolve(dom.hide?.(), () => onResolve(controller.deactivate(controller, null), () => {
                    dom.dispose();
                    this._disposeHandler?.dispose();
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
        return new Promise(r => r(onResolve(this.cmp.deactivate?.(DialogCloseResult.create('error', closeError)), () => onResolve(this.controller.deactivate(this.controller, null), () => {
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
        container.registerResolver(p.HTMLElement, container.registerResolver(p.Element, container.registerResolver(INode, new InstanceProvider('ElementResolver', host))));
        return container.invoke(Component);
    }
    getDefinition(component) {
        const Ctor = (isFunction(component)
            ? component
            : component?.constructor);
        return CustomElement.isType(Ctor)
            ? CustomElement.getDefinition(Ctor)
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
        /** @internal */ this._ctn = resolve(IContainer);
        /** @internal */ this._defaultSettings = resolve(IDialogGlobalSettings);
    }
    static register(container) {
        container.register(singletonRegistration(this, this), Registration.aliasTo(this, IDialogService), AppTask.deactivating(IDialogService, dialogService => onResolve(dialogService.closeAll(), (openDialogControllers) => {
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
            resolve(onResolve($settings.load(), loadedSettings => {
                const dialogController = container.invoke(DialogController);
                container.register(instanceRegistration(IDialogController, dialogController), instanceRegistration(DialogController, dialogController));
                return onResolve(dialogController.activate(loadedSettings), openResult => {
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
            .then(unclosedControllers => unclosedControllers.filter(unclosed => !!unclosed));
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
    static from(...srcs) {
        return Object.assign(new DialogSettings(), ...srcs)
            ._validate()
            ._normalize();
    }
    load() {
        const loaded = this;
        const cmp = this.component;
        const template = this.template;
        const maybePromise = onResolveAll(...[
            cmp == null
                ? void 0
                : onResolve(cmp(), loadedCmp => { loaded.component = loadedCmp; }),
            isFunction(template)
                ? onResolve(template(), loadedTpl => { loaded.template = loadedTpl; })
                : void 0
        ]);
        return isPromise(maybePromise)
            ? maybePromise.then(() => loaded)
            : loaded;
    }
    /** @internal */
    _validate() {
        if (this.component == null && this.template == null) {
            throw createMappedError(903 /* ErrorNames.dialog_settings_invalid */);
        }
        return this;
    }
    /** @internal */
    _normalize() {
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

class DefaultDialogGlobalSettings {
    constructor() {
        this.lock = true;
        this.startingZIndex = 1000;
        this.rejectOnCancel = false;
    }
    static register(container) {
        singletonRegistration(IDialogGlobalSettings, this).register(container);
    }
}
class DefaultDialogDomRenderer {
    constructor() {
        this.p = resolve(IPlatform);
        /** @internal */
        this._animator = resolve(optional(IDialogDomAnimator));
        this.overlayCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
        this.wrapperCss = `${this.overlayCss} display:flex;`;
        this.hostCss = 'position:relative;margin:auto;';
    }
    static register(container) {
        container.register(singletonRegistration(IDialogDomRenderer, this));
    }
    render(dialogHost, settings) {
        const doc = this.p.document;
        const h = (name, css) => {
            const el = doc.createElement(name);
            el.style.cssText = css;
            return el;
        };
        const { startingZIndex } = settings;
        const wrapperCss = `${this.wrapperCss};${startingZIndex == null ? '' : `z-index:${startingZIndex}`}`;
        const wrapper = dialogHost.appendChild(h('au-dialog-container', wrapperCss));
        const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
        const host = wrapper.appendChild(h('div', this.hostCss));
        return new DefaultDialogDom(wrapper, overlay, host, this._animator);
    }
}
class DefaultDialogDom {
    constructor(wrapper, overlay, contentHost, animator) {
        this.wrapper = wrapper;
        this.overlay = overlay;
        this.contentHost = contentHost;
        this._animator = animator;
    }
    show() {
        return this._animator?.show(this);
    }
    hide() {
        return this._animator?.hide(this);
    }
    dispose() {
        this.wrapper.remove();
    }
}

class DefaultDialogEventManager {
    constructor() {
        this.ctrls = [];
        this.w = resolve(IWindow);
    }
    static register(container) {
        singletonRegistration(IDialogEventManager, this).register(container);
    }
    add(controller, dom) {
        if (this.ctrls.push(controller) === 1) {
            this.w.addEventListener('keydown', this);
        }
        const mouseEvent = controller.settings.mouseEvent ?? 'click';
        const handleClick = (e) => {
            if ( /* user allows dismiss on overlay click */controller.settings.overlayDismiss
                && /* did not click inside the host element */ !dom.contentHost.contains(e.target)) {
                void controller.cancel();
            }
        };
        dom.overlay.addEventListener(mouseEvent, handleClick);
        const handleSubmit = (e) => {
            const target = e.target;
            const noAction = !target.getAttribute('action');
            if (target.tagName === 'FORM' && noAction) {
                e.preventDefault();
            }
        };
        dom.contentHost.addEventListener('submit', handleSubmit);
        return {
            dispose: () => {
                this._remove(controller);
                dom.overlay.removeEventListener(mouseEvent, handleClick);
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
    handleEvent(e) {
        const keyEvent = e;
        const key = getActionKey(keyEvent);
        if (key == null) {
            return;
        }
        const top = this.ctrls.slice(-1)[0];
        if (top == null || top.settings.keyboard.length === 0) {
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
function getActionKey(e) {
    if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
        return 'Escape';
    }
    if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
        return 'Enter';
    }
    return undefined;
}

function createDialogConfiguration(settingsProvider, registrations) {
    return {
        settingsProvider: settingsProvider,
        register: (ctn) => ctn.register(...registrations, AppTask.creating(() => settingsProvider(ctn.get(IDialogGlobalSettings)))),
        customize(cb, regs) {
            return createDialogConfiguration(cb, regs ?? registrations);
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
const DialogConfiguration = /*@__PURE__*/ createDialogConfiguration(() => {
    throw createMappedError(904 /* ErrorNames.dialog_no_empty_default_configuration */);
}, [class NoopDialogGlobalSettings {
        static register(container) {
            container.register(singletonRegistration(IDialogGlobalSettings, this));
        }
    }]);
const DialogDefaultConfiguration = /*@__PURE__*/ createDialogConfiguration(noop, [
    DialogService,
    DefaultDialogGlobalSettings,
    DefaultDialogDomRenderer,
    DefaultDialogEventManager,
]);

export { DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogEventManager, DefaultDialogGlobalSettings, DialogCloseResult, DialogConfiguration, DialogController, DialogDefaultConfiguration, DialogOpenResult, DialogService, IDialogController, IDialogDom, IDialogDomAnimator, IDialogDomRenderer, IDialogEventManager, IDialogGlobalSettings, IDialogService };
//# sourceMappingURL=index.dev.mjs.map
