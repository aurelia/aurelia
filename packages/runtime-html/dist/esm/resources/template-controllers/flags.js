import { nextId } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { templateController } from '../custom-attribute.js';
class FlagsTemplateController {
    constructor(factory, location, flags) {
        this.factory = factory;
        this.flags = flags;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    attaching(initiator, parent, flags) {
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope, $controller.hostScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
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
}
export class FrequentMutations extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 2048 /* persistentTargetObserverQueue */);
    }
}
/**
 * @internal
 */
FrequentMutations.inject = [IViewFactory, IRenderLocation];
export class ObserveShallow extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 512 /* observeLeafPropertiesOnly */);
    }
}
/**
 * @internal
 */
ObserveShallow.inject = [IViewFactory, IRenderLocation];
templateController('frequent-mutations')(FrequentMutations);
templateController('observe-shallow')(ObserveShallow);
//# sourceMappingURL=flags.js.map