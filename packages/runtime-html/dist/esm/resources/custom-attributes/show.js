var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { alias } from '@aurelia/runtime';
import { INode } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { customAttribute } from '../custom-attribute.js';
import { bindable } from '../../bindable.js';
import { IInstruction } from '../../renderer.js';
let Show = class Show {
    constructor(el, p, instr) {
        this.el = el;
        this.p = p;
        this.isActive = false;
        this.task = null;
        this.$val = '';
        this.$prio = '';
        this.update = () => {
            this.task = null;
            // Only compare at the synchronous moment when we're about to update, because the value might have changed since the update was queued.
            if (Boolean(this.value) !== this.isToggled) {
                if (this.isToggled === this.base) {
                    this.isToggled = !this.base;
                    // Note: in v1 we used the 'au-hide' class, but in v2 it's so trivial to conditionally apply classes (e.g. 'hide.class="someCondition"'),
                    // that it's probably better to avoid the CSS inject infra involvement and keep this CA as simple as possible.
                    // Instead, just store and restore the property values (with each mutation, to account for in-between updates), to cover the common cases, until there is convincing feedback to do otherwise.
                    this.$val = this.el.style.getPropertyValue('display');
                    this.$prio = this.el.style.getPropertyPriority('display');
                    this.el.style.setProperty('display', 'none', 'important');
                }
                else {
                    this.isToggled = this.base;
                    this.el.style.setProperty('display', this.$val, this.$prio);
                    // If the style attribute is now empty, remove it.
                    if (this.el.getAttribute('style') === '') {
                        this.el.removeAttribute('style');
                    }
                }
            }
        };
        // if this is declared as a 'hide' attribute, then this.base will be false, inverting everything.
        this.isToggled = this.base = instr.alias !== 'hide';
    }
    binding() {
        this.isActive = true;
        this.update();
    }
    detaching() {
        var _a;
        this.isActive = false;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
    valueChanged() {
        if (this.isActive && this.task === null) {
            this.task = this.p.domWriteQueue.queueTask(this.update);
        }
    }
};
__decorate([
    bindable
], Show.prototype, "value", void 0);
Show = __decorate([
    customAttribute('show'),
    alias('hide'),
    __param(0, INode),
    __param(1, IPlatform),
    __param(2, IInstruction)
], Show);
export { Show };
//# sourceMappingURL=show.js.map