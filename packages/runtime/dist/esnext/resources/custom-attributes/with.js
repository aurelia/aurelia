import { __decorate, __param } from "tslib";
import { nextId } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { templateController } from '../custom-attribute';
import { bindable } from '../../templating/bindable';
import { Scope } from '../../observation/binding-context';
let With = class With {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        this.id = nextId('au$component');
        this.factory = factory;
        this.view = this.factory.create();
        this.view.hold(location, 1 /* insertBefore */);
    }
    valueChanged(newValue, oldValue, flags) {
        if ((this.$controller.state & 5 /* isBoundOrBinding */) > 0) {
            this.bindChild(4096 /* fromBind */);
        }
    }
    binding(flags) {
        this.view.parent = this.$controller;
        this.bindChild(flags);
    }
    attaching(flags) {
        this.view.attach(flags);
    }
    detaching(flags) {
        this.view.detach(flags);
    }
    unbinding(flags) {
        this.view.unbind(flags);
        this.view.parent = void 0;
    }
    bindChild(flags) {
        const scope = Scope.fromParent(flags, this.$controller.scope, this.value === void 0 ? {} : this.value);
        this.view.bind(flags, scope, this.$controller.part);
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