import { nextId, PLATFORM, Registration, } from '@aurelia/kernel';
import { HooksDefinition, } from '../../definitions';
import { IRenderLocation, } from '../../dom';
import { BindingMode, } from '../../flags';
import { IViewFactory, } from '../../lifecycle';
import { BindingContext, } from '../../observation/binding-context';
import { CustomAttributeResource, } from '../custom-attribute';
export class Replaceable {
    constructor(factory, location) {
        this.id = nextId('au$component');
        this.factory = factory;
        this.view = this.factory.create();
        this.view.hold(location);
    }
    static register(container) {
        container.register(Registration.transient('custom-attribute:replaceable', this));
        container.register(Registration.transient(this, this));
    }
    binding(flags) {
        const prevName = BindingContext.partName;
        BindingContext.partName = this.factory.name;
        const task = this.view.bind(flags | 536870912 /* allowParentScopeTraversal */, this.$controller.scope);
        if (task.done) {
            BindingContext.partName = prevName;
        }
        else {
            task.wait().then(() => {
                BindingContext.partName = prevName;
            });
        }
        return task;
    }
    attaching(flags) {
        this.view.attach(flags);
    }
    detaching(flags) {
        this.view.detach(flags);
    }
    unbinding(flags) {
        return this.view.unbind(flags);
    }
}
Replaceable.inject = [IViewFactory, IRenderLocation];
Replaceable.kind = CustomAttributeResource;
Replaceable.description = Object.freeze({
    name: 'replaceable',
    aliases: PLATFORM.emptyArray,
    defaultBindingMode: BindingMode.toView,
    hasDynamicOptions: false,
    isTemplateController: true,
    bindables: PLATFORM.emptyObject,
    strategy: 1 /* getterSetter */,
    hooks: Object.freeze(new HooksDefinition(Replaceable.prototype)),
});
//# sourceMappingURL=replaceable.js.map