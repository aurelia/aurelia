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
import { nextId, onResolve } from '@aurelia/kernel';
import { bindable } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { templateController } from '../custom-attribute';
let If = class If {
    constructor(ifFactory, location) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.id = nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
    }
    afterAttach(initiator, parent, flags) {
        const view = this.view = this.updateView(this.value, flags);
        if (view !== void 0) {
            const { $controller } = this;
            return view.activate(initiator, $controller, flags, $controller.scope, $controller.hostScope);
        }
    }
    afterUnbind(initiator, parent, flags) {
        if (this.view !== void 0) {
            return this.view.deactivate(initiator, this.$controller, flags);
        }
    }
    valueChanged(newValue, oldValue, flags) {
        var _a;
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        const ret = onResolve((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(this.view, $controller, flags), () => {
            const view = this.view = this.updateView(this.value, flags);
            if (view !== void 0) {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                return view.activate(view, $controller, flags, $controller.scope, $controller.hostScope);
            }
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    /** @internal */
    updateView(value, flags) {
        if (value) {
            return this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
        }
        if (this.elseFactory != void 0) {
            return this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
        }
        return void 0;
    }
    /** @internal */
    ensureView(view, factory, flags) {
        if (view === void 0) {
            view = factory.create(flags);
        }
        view.setLocation(this.location, 1 /* insertBefore */);
        return view;
    }
    onCancel(initiator, parent, flags) {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.cancel(initiator, this.$controller, flags);
    }
    dispose() {
        if (this.ifView !== void 0) {
            this.ifView.dispose();
            this.ifView = void 0;
        }
        if (this.elseView !== void 0) {
            this.elseView.dispose();
            this.elseView = void 0;
        }
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
    bindable,
    __metadata("design:type", Boolean)
], If.prototype, "value", void 0);
If = __decorate([
    templateController('if'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation),
    __metadata("design:paramtypes", [Object, Object])
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
    __param(0, IViewFactory),
    __metadata("design:paramtypes", [Object])
], Else);
export { Else };
//# sourceMappingURL=if.js.map