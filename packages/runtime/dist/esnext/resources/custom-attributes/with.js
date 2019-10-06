import { nextId, PLATFORM, Registration } from '@aurelia/kernel';
import { HooksDefinition } from '../../definitions';
import { IRenderLocation } from '../../dom';
import { BindingMode } from '../../flags';
import { IViewFactory } from '../../lifecycle';
import { Scope } from '../../observation/binding-context';
import { Bindable } from '../../templating/bindable';
import { CustomAttribute } from '../custom-attribute';
export class With {
    constructor(factory, location) {
        this.$observers = Object.freeze({
            value: this,
        });
        this.id = nextId('au$component');
        this.factory = factory;
        this.view = this.factory.create();
        this.view.hold(location);
        this._value = void 0;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        const oldValue = this._value;
        if (oldValue !== newValue) {
            this._value = newValue;
            this.valueChanged(newValue, oldValue, 0 /* none */);
        }
    }
    static register(container) {
        container.register(Registration.transient('custom-attribute:with', this));
        container.register(Registration.transient(this, this));
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
}
With.inject = [IViewFactory, IRenderLocation];
With.kind = CustomAttribute;
With.description = Object.freeze({
    name: 'with',
    aliases: PLATFORM.emptyArray,
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: Object.freeze(Bindable.for({ bindables: ['value'] }).get()),
    strategy: 1 /* getterSetter */,
    hooks: Object.freeze(new HooksDefinition(With.prototype)),
});
//# sourceMappingURL=with.js.map