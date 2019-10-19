import { __decorate, __param } from "tslib";
import { nextId } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { templateController } from '../custom-attribute';
let Replaceable = class Replaceable {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        this.view = this.factory.create();
        this.view.hold(location, 1 /* insertBefore */);
    }
    binding(flags) {
        this.view.parent = this.$controller;
        return this.view.bind(flags | 67108864 /* allowParentScopeTraversal */, this.$controller.scope, this.factory.name);
    }
    attaching(flags) {
        this.view.attach(flags);
    }
    detaching(flags) {
        this.view.detach(flags);
    }
    unbinding(flags) {
        const task = this.view.unbind(flags);
        this.view.parent = void 0;
        return task;
    }
};
Replaceable = __decorate([
    templateController('replaceable'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], Replaceable);
export { Replaceable };
//# sourceMappingURL=replaceable.js.map