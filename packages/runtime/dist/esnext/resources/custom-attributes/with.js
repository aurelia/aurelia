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
import { nextId } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { templateController } from '../custom-attribute';
import { bindable } from '../../templating/bindable';
import { Scope } from '../../observation/binding-context';
let With = /** @class */ (() => {
    let With = class With {
        constructor(factory, location) {
            this.factory = factory;
            this.location = location;
            this.id = nextId('au$component');
            this.id = nextId('au$component');
            this.view = this.factory.create();
            this.view.setLocation(location, 1 /* insertBefore */);
        }
        valueChanged(newValue, oldValue, flags) {
            if (this.$controller.isActive) {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.activateView(this.view, 32 /* fromBind */);
            }
        }
        afterAttach(initiator, parent, flags) {
            return this.activateView(initiator, flags);
        }
        afterUnbind(initiator, parent, flags) {
            return this.view.deactivate(initiator, this.$controller, flags);
        }
        activateView(initiator, flags) {
            const { $controller, value } = this;
            const scope = Scope.fromParent(flags, $controller.scope, value === void 0 ? {} : value);
            return this.view.activate(initiator, $controller, flags, scope, $controller.hostScope);
        }
        onCancel(initiator, parent, flags) {
            var _a;
            (_a = this.view) === null || _a === void 0 ? void 0 : _a.cancel(initiator, this.$controller, flags);
        }
        dispose() {
            this.view.dispose();
            this.view = (void 0);
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
        __metadata("design:type", Object)
    ], With.prototype, "value", void 0);
    With = __decorate([
        templateController('with'),
        __param(0, IViewFactory),
        __param(1, IRenderLocation),
        __metadata("design:paramtypes", [Object, Object])
    ], With);
    return With;
})();
export { With };
//# sourceMappingURL=with.js.map