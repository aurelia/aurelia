"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blur = exports.BlurManager = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("../../dom.js");
const platform_js_1 = require("../../platform.js");
const custom_attribute_js_1 = require("../custom-attribute.js");
const bindable_js_1 = require("../../bindable.js");
const unset = Symbol();
// Using passive to help with performance
const defaultCaptureEventInit = {
    passive: true,
    capture: true
};
// Using passive to help with performance
const defaultBubbleEventInit = {
    passive: true
};
// weakly connect a document to a blur manager
// to avoid polluting the document properties
const blurDocMap = new WeakMap();
class BlurManager {
    constructor(platform) {
        this.platform = platform;
        this.blurs = [];
        blurDocMap.set(platform.document, this);
        this.handler = createHandler(this, this.blurs);
    }
    static createFor(platform) {
        return blurDocMap.get(platform.document) || new BlurManager(platform);
    }
    register(blur) {
        const blurs = this.blurs;
        if (!blurs.includes(blur) && blurs.push(blur) === 1) {
            this.addListeners();
        }
    }
    unregister(blur) {
        const blurs = this.blurs;
        const index = blurs.indexOf(blur);
        if (index > -1) {
            blurs.splice(index, 1);
        }
        if (blurs.length === 0) {
            this.removeListeners();
        }
    }
    addListeners() {
        const p = this.platform;
        const doc = p.document;
        const win = p.window;
        const handler = this.handler;
        if (win.navigator.pointerEnabled) {
            doc.addEventListener('pointerdown', handler, defaultCaptureEventInit);
        }
        doc.addEventListener('touchstart', handler, defaultCaptureEventInit);
        doc.addEventListener('mousedown', handler, defaultCaptureEventInit);
        doc.addEventListener('focus', handler, defaultCaptureEventInit);
        win.addEventListener('blur', handler, defaultBubbleEventInit);
    }
    removeListeners() {
        const p = this.platform;
        const doc = p.document;
        const win = p.window;
        const handler = this.handler;
        if (win.navigator.pointerEnabled) {
            doc.removeEventListener('pointerdown', handler, defaultCaptureEventInit);
        }
        doc.removeEventListener('touchstart', handler, defaultCaptureEventInit);
        doc.removeEventListener('mousedown', handler, defaultCaptureEventInit);
        doc.removeEventListener('focus', handler, defaultCaptureEventInit);
        win.removeEventListener('blur', handler, defaultBubbleEventInit);
    }
}
exports.BlurManager = BlurManager;
let Blur = class Blur {
    constructor(element, p) {
        this.element = element;
        this.p = p;
        /**
         * By default, the behavior should be least surprise possible, that:
         *
         * it searches for anything from root context,
         * and root context is document body
         */
        this.linkedMultiple = true;
        this.searchSubTree = true;
        this.linkingContext = null;
        this.value = unset;
        this.manager = BlurManager.createFor(p);
    }
    attached() {
        this.manager.register(this);
    }
    detaching() {
        this.manager.unregister(this);
    }
    handleEventTarget(target) {
        if (this.value === false) {
            return;
        }
        const p = this.p;
        if (target === p.window || target === p.document || !this.contains(target)) {
            this.triggerBlur();
        }
    }
    contains(target) {
        if (!this.value) {
            return false;
        }
        let els;
        let i;
        let j, jj;
        let link;
        const element = this.element;
        if (containsElementOrShadowRoot(element, target)) {
            return true;
        }
        if (!this.linkedWith) {
            return false;
        }
        const doc = this.p.document;
        const linkedWith = this.linkedWith;
        const linkingContext = this.linkingContext;
        const searchSubTree = this.searchSubTree;
        const linkedMultiple = this.linkedMultiple;
        const links = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
        const contextNode = (typeof linkingContext === 'string'
            ? doc.querySelector(linkingContext)
            : linkingContext)
            || doc.body;
        const ii = links.length;
        for (i = 0; ii > i; ++i) {
            link = links[i];
            // When user specify to link with something by a string, it acts as a CSS selector
            // We need to do some querying stuff to determine if target above is contained.
            if (typeof link === 'string') {
                // Default behavior, search the whole tree, from context that user specified, which default to document body
                if (searchSubTree) {
                    // todo: are there too many knobs?? Consider remove "linkedMultiple"??
                    if (!linkedMultiple) {
                        const el = contextNode.querySelector(link);
                        els = el !== null ? [el] : kernel_1.emptyArray;
                    }
                    else {
                        els = contextNode.querySelectorAll(link);
                    }
                    jj = els.length;
                    for (j = 0; jj > j; ++j) {
                        if (els[j].contains(target)) {
                            return true;
                        }
                    }
                }
                else {
                    // default to document body, if user didn't define a linking context, and wanted to ignore subtree.
                    // This is specifically performant and useful for dialogs, plugins
                    // that usually generate contents to document body
                    els = contextNode.children;
                    jj = els.length;
                    for (j = 0; jj > j; ++j) {
                        if (els[j].matches(link)) {
                            return true;
                        }
                    }
                }
            }
            else {
                // When user passed in something that is not a string,
                // simply check if has method `contains` (allow duck typing)
                // and call it against target.
                // This enables flexible usages
                if (link && link.contains(target)) {
                    return true;
                }
            }
        }
        return false;
    }
    triggerBlur() {
        this.value = false;
        if (typeof this.onBlur === 'function') {
            this.onBlur.call(null);
        }
    }
};
__decorate([
    bindable_js_1.bindable()
], Blur.prototype, "value", void 0);
__decorate([
    bindable_js_1.bindable()
], Blur.prototype, "onBlur", void 0);
__decorate([
    bindable_js_1.bindable()
], Blur.prototype, "linkedWith", void 0);
__decorate([
    bindable_js_1.bindable()
], Blur.prototype, "linkedMultiple", void 0);
__decorate([
    bindable_js_1.bindable()
], Blur.prototype, "searchSubTree", void 0);
__decorate([
    bindable_js_1.bindable()
], Blur.prototype, "linkingContext", void 0);
Blur = __decorate([
    custom_attribute_js_1.customAttribute('blur'),
    __param(0, dom_js_1.INode),
    __param(1, platform_js_1.IPlatform)
], Blur);
exports.Blur = Blur;
const containsElementOrShadowRoot = (container, target) => {
    if (container.contains(target)) {
        return true;
    }
    let parentNode = null;
    while (target != null) {
        if (target === container) {
            return true;
        }
        parentNode = target.parentNode;
        if (parentNode === null && target.nodeType === 11 /* DocumentFragment */) {
            target = target.host;
            continue;
        }
        target = parentNode;
    }
    return false;
};
const createHandler = (manager, checkTargets) => {
    // *******************************
    // EVENTS ORDER
    // -----------------------------
    // pointerdown
    // touchstart
    // pointerup
    // touchend
    // mousedown
    // --------------
    // BLUR
    // FOCUS
    // --------------
    // mouseup
    // click
    //
    // ******************************
    //
    // There are cases focus happens without mouse interaction (keyboard)
    // So it needs to capture both mouse / focus movement
    //
    // ******************************
    let hasChecked = false;
    const revertCheckage = () => {
        hasChecked = false;
    };
    const markChecked = () => {
        hasChecked = true;
        manager.platform.domWriteQueue.queueTask(revertCheckage, { preempt: true });
    };
    const handleMousedown = (e) => {
        if (!hasChecked) {
            handleEvent(e);
            markChecked();
        }
    };
    /**
     * Handle globally captured focus event
     * This can happen via a few way:
     * User clicks on a focusable element
     * User uses keyboard to navigate to a focusable element
     * User goes back to the window from another browser tab
     * User clicks on a non-focusable element
     * User clicks on the window, outside of the document
     */
    const handleFocus = (e) => {
        if (hasChecked) {
            return;
        }
        // there are two way a focus gets captured on window
        // when the windows itself got focus
        // and when an element in the document gets focus
        // when the window itself got focus, reacting to it is quite unnecessary
        // as it doesn't really affect element inside the document
        // Do a simple check and bail immediately
        const isWindow = e.target === manager.platform.window;
        if (isWindow) {
            for (let i = 0, ii = checkTargets.length; ii > i; ++i) {
                checkTargets[i].triggerBlur();
            }
        }
        else {
            handleEvent(e);
        }
        markChecked();
    };
    const handleWindowBlur = () => {
        hasChecked = false;
        for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
            checkTargets[i].triggerBlur();
        }
    };
    const handleEvent = (e) => {
        const target = e.composed ? e.composedPath()[0] : e.target;
        if (target === null) {
            return;
        }
        for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
            checkTargets[i].handleEventTarget(target);
        }
    };
    return {
        onpointerdown: handleMousedown,
        ontouchstart: handleMousedown,
        onmousedown: handleMousedown,
        onfocus: handleFocus,
        onblur: handleWindowBlur,
        handleEvent(e) {
            this[`on${e.type}`](e);
        }
    };
};
//# sourceMappingURL=blur.js.map