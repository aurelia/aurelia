var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { nextId, onResolve } from '../../../../../kernel/dist/native-modules/index.js';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
import { bindable } from '../../bindable.js';
import { IWorkTracker } from '../../app-root.js';
let If = class If {
    constructor(ifFactory, location, work) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.work = work;
        this.id = nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.pending = void 0;
        this.wantsDeactivate = false;
    }
    attaching(initiator, parent, flags) {
        return onResolve(this.pending, () => {
            var _a;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = (this.view = this.updateView(this.value, flags))) === null || _a === void 0 ? void 0 : _a.activate(initiator, this.$controller, flags, this.$controller.scope, this.$controller.hostScope));
        });
    }
    detaching(initiator, parent, flags) {
        this.wantsDeactivate = true;
        return onResolve(this.pending, () => {
            var _a;
            this.wantsDeactivate = false;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(initiator, this.$controller, flags));
        });
    }
    valueChanged(newValue, oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.pending = onResolve(this.pending, () => {
            return this.swap(flags);
        });
    }
    swap(flags) {
        var _a;
        if (this.view === this.updateView(this.value, flags)) {
            return;
        }
        this.work.start();
        const ctrl = this.$controller;
        return onResolve((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(this.view, ctrl, flags), () => {
            // return early if detaching was called during the swap
            if (this.wantsDeactivate) {
                return;
            }
            // value may have changed during deactivate
            const nextView = this.view = this.updateView(this.value, flags);
            return onResolve(nextView === null || nextView === void 0 ? void 0 : nextView.activate(nextView, ctrl, flags, ctrl.scope, ctrl.hostScope), () => {
                this.work.finish();
                // only null the pending promise if nothing changed since the activation start
                if (this.view === this.updateView(this.value, flags)) {
                    this.pending = void 0;
                }
            });
        });
    }
    /** @internal */
    updateView(value, flags) {
        if (value) {
            return this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
        }
        if (this.elseFactory !== void 0) {
            return this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
        }
        return void 0;
    }
    /** @internal */
    ensureView(view, factory, flags) {
        if (view === void 0) {
            view = factory.create(flags);
            view.setLocation(this.location);
        }
        return view;
    }
    dispose() {
        var _a, _b;
        (_a = this.ifView) === null || _a === void 0 ? void 0 : _a.dispose();
        this.ifView = void 0;
        (_b = this.elseView) === null || _b === void 0 ? void 0 : _b.dispose();
        this.elseView = void 0;
        this.view = void 0;
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate([
    bindable
], If.prototype, "value", void 0);
If = __decorate([
    templateController('if'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __param(2, IWorkTracker)
], If);
export { If };
let Else = class Else {
    constructor(factory) {
        this.factory = factory;
        this.id = nextId('au$component');
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const children = controller.children;
        const ifBehavior = children[children.length - 1];
        if (ifBehavior instanceof If) {
            ifBehavior.elseFactory = this.factory;
        }
        else if (ifBehavior.viewModel instanceof If) {
            ifBehavior.viewModel.elseFactory = this.factory;
        }
        else {
            throw new Error(`Unsupported IfBehavior`); // TODO: create error code
        }
    }
};
Else = __decorate([
    templateController({ name: 'else' }),
    __param(0, IViewFactory)
], Else);
export { Else };
//# sourceMappingURL=if.js.map