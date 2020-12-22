var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { nextId } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
import { bindable } from '../../bindable.js';
let With = class With {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    valueChanged(newValue, oldValue, flags) {
        if (this.$controller.isActive) {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.activateView(this.view, 32 /* fromBind */);
        }
    }
    attaching(initiator, parent, flags) {
        return this.activateView(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    activateView(initiator, flags) {
        const { $controller, value } = this;
        const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
        return this.view.activate(initiator, $controller, flags, scope, $controller.hostScope);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        if (this.view?.accept(visitor) === true) {
            return true;
        }
    }
};
__decorate([
    bindable
], With.prototype, "value", void 0);
With = __decorate([
    templateController('with'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], With);
export { With };
//# sourceMappingURL=with.js.map