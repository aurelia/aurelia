var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "../../dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const dom_1 = require("../../dom");
    /**
     * Focus attribute for element focus binding
     */
    let Focus = class Focus {
        constructor(element, dom) {
            this.dom = dom;
            /**
             * Indicates whether `apply` should be called when `afterAttach` callback is invoked
             */
            this.needsApply = false;
            this.element = element;
        }
        beforeBind() {
            this.valueChanged();
        }
        /**
         * Invoked everytime the bound value changes.
         *
         * @param newValue - The new value.
         */
        valueChanged() {
            // In theory, we could/should react immediately
            // but focus state of an element cannot be achieved
            // while it's disconnected from the document
            // thus, there neesd to be a check if it's currently connected or not
            // before applying the value to the element
            if (this.$controller.state & 32 /* isAttached */) {
                this.apply();
            }
            else {
                // If the element is not currently connect
                // toggle the flag to add pending work for later
                // in afterAttach lifecycle
                this.needsApply = true;
            }
        }
        /**
         * Invoked when the attribute is afterAttach to the DOM.
         */
        afterAttach() {
            if (this.needsApply) {
                this.needsApply = false;
                this.apply();
            }
            const el = this.element;
            el.addEventListener('focus', this);
            el.addEventListener('blur', this);
        }
        /**
         * Invoked when the attribute is afterDetach from the DOM.
         */
        afterDetach() {
            const el = this.element;
            el.removeEventListener('focus', this);
            el.removeEventListener('blur', this);
        }
        /**
         * EventTarget interface handler for better memory usage
         */
        handleEvent(e) {
            // there are only two event listened to
            // if the even is focus, it menans the element is focused
            // only need to switch the value to true
            if (e.type === 'focus') {
                this.value = true;
            }
            else if (this.dom.document.activeElement !== this.element) {
                // else, it's blur event
                // when a blur event happens, there are two situations
                // 1. the element itself lost the focus
                // 2. window lost the focus
                // To handle both (1) and (2), only need to check if
                // current active element is still the same element of this focus custom attribute
                // If it's not, it's a blur event happened on Window because the browser tab lost focus
                this.value = false;
            }
        }
        /**
         * Focus/blur based on current value
         */
        apply() {
            const el = this.element;
            if (this.value) {
                el.focus();
            }
            else {
                el.blur();
            }
        }
    };
    __decorate([
        runtime_1.bindable({ mode: runtime_1.BindingMode.twoWay }),
        __metadata("design:type", Object)
    ], Focus.prototype, "value", void 0);
    Focus = __decorate([
        runtime_1.customAttribute('focus'),
        __param(0, runtime_1.INode), __param(1, runtime_1.IDOM),
        __metadata("design:paramtypes", [Object, dom_1.HTMLDOM])
    ], Focus);
    exports.Focus = Focus;
});
//# sourceMappingURL=focus.js.map