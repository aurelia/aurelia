import { hookSpecsMap } from './hook-spec.js';
export class HookSpecs {
    static get DEFAULT() {
        return HookSpecs.create({});
    }
    constructor(binding, bound, attaching, attached, detaching, unbinding, $dispose, canLoad, loading, canUnload, unloading) {
        this.binding = binding;
        this.bound = bound;
        this.attaching = attaching;
        this.attached = attached;
        this.detaching = detaching;
        this.unbinding = unbinding;
        this.$dispose = $dispose;
        this.canLoad = canLoad;
        this.loading = loading;
        this.canUnload = canUnload;
        this.unloading = unloading;
    }
    static create(input) {
        return new HookSpecs(input.binding || hookSpecsMap.binding.sync, input.bound || hookSpecsMap.bound.sync, input.attaching || hookSpecsMap.attaching.sync, input.attached || hookSpecsMap.attached.sync, input.detaching || hookSpecsMap.detaching.sync, input.unbinding || hookSpecsMap.unbinding.sync, hookSpecsMap.dispose, input.canLoad || hookSpecsMap.canLoad.sync, input.loading || hookSpecsMap.loading.sync, input.canUnload || hookSpecsMap.canUnload.sync, input.unloading || hookSpecsMap.unloading.sync);
    }
    dispose() {
        const $this = this;
        $this.binding = void 0;
        $this.bound = void 0;
        $this.attaching = void 0;
        $this.attached = void 0;
        $this.detaching = void 0;
        $this.unbinding = void 0;
        $this.$dispose = void 0;
        $this.canLoad = void 0;
        $this.loading = void 0;
        $this.canUnload = void 0;
        $this.unloading = void 0;
    }
    toString(exclude) {
        const strings = [];
        for (const k of hookNames) {
            const spec = this[k];
            if (spec.type !== exclude) {
                strings.push(`${spec.name}.${spec.type}`);
            }
        }
        return strings.length > 0 ? `Hooks(${strings.join(',')})` : '';
    }
}
const hookNames = [
    'binding',
    'bound',
    'attaching',
    'attached',
    'detaching',
    'unbinding',
    'canLoad',
    'loading',
    'canUnload',
    'unloading',
];
export class TestRouteViewModelBase {
    get name() {
        return this.$controller.definition.name;
    }
    constructor(hia, specs = HookSpecs.DEFAULT) {
        this.hia = hia;
        this.specs = specs;
    }
    binding(initiator, parent) {
        // this.hia.binding.notify(`${this.viewport?.name}:${this.name}`);
        // this.hia.binding.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.binding.invoke(this, () => {
            // this.hia.binding.notify(`${this.viewport?.name}.${this.name}`);
            return this.$binding(initiator, parent);
        }, this.hia.binding);
    }
    bound(initiator, parent) {
        // this.hia.bound.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.bound.invoke(this, () => {
            // this.hia.bound.notify(`${this.viewport?.name}.${this.name}`);
            return this.$bound(initiator, parent);
        }, this.hia.bound);
    }
    attaching(initiator, parent) {
        // this.hia.attaching.notify(`${this.viewport?.name}:${this.name}`);
        // this.hia.attaching.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.attaching.invoke(this, () => {
            // this.hia.attaching.notify(`${this.viewport?.name}.${this.name}`);
            return this.$attaching(initiator, parent);
        }, this.hia.attaching);
    }
    attached(initiator) {
        // this.hia.attached.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.attached.invoke(this, () => {
            // this.hia.attached.notify(`${this.viewport?.name}.${this.name}`);
            return this.$attached(initiator);
        }, this.hia.attached);
    }
    detaching(initiator, parent) {
        // this.hia.detaching.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.detaching.invoke(this, () => {
            // this.hia.detaching.notify(`${this.viewport?.name}.${this.name}`);
            return this.$detaching(initiator, parent);
        }, this.hia.detaching);
    }
    unbinding(initiator, parent) {
        // console.log(`unbinding ${this.name} ${this.$controller.host.outerHTML}`);
        // this.hia.unbinding.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.unbinding.invoke(this, () => {
            // this.hia.unbinding.notify(`${this.viewport?.name}.${this.name}`);
            return this.$unbinding(initiator, parent);
        }, this.hia.unbinding);
    }
    dispose() {
        // this.hia.$$dispose.notify(`${this.viewport?.name}.${this.name}`);
        this.specs.$dispose.invoke(this, () => {
            // this.hia.$$dispose.notify(`${this.viewport?.name}.${this.name}`);
            this.$dispose();
        }, this.hia.$$dispose);
    }
    canLoad(params, instruction, navigation) {
        this.viewport = instruction.viewport.instance;
        // console.log('TestViewModel canLoad', this.name);
        // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.canLoad.invoke(this, () => {
            // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'enter');
            // return onResolve(this.$canLoad(params, next, current), () => {
            // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'leave');
            // }) as any;
            return this.$canLoad(params, instruction, navigation);
            // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`);
            // const result = this.$canLoad(params, next, current);
            // if (result instanceof Promise) {
            //   return result.then(() => {
            //     this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'leave');
            //   });
            // }
            // this.hia.canLoad.notify(`${this.viewport?.name}.${this.name}`, 'leave');
            // return result;
        }, this.hia.canLoad);
    }
    loading(params, instruction, navigation) {
        this.viewport = instruction.viewport.instance;
        // console.log('TestViewModel loading', this.name);
        // this.hia.loading.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.loading.invoke(this, () => {
            // this.hia.loading.notify(`${this.viewport?.name}.${this.name}`);
            return this.$loading(params, instruction, navigation);
        }, this.hia.loading);
    }
    canUnload(instruction, navigation) {
        this.viewport = instruction.viewport.instance;
        // console.log('TestViewModel canUnload', this);
        // this.hia.canUnload.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.canUnload.invoke(this, () => {
            return this.$canUnload(instruction, navigation);
            // this.hia.canUnload.notify(`${this.viewport?.name}.${this.name}`, 'enter');
            // return onResolve(this.$canUnload(instruction, navigation), () => {
            //   this.hia.canUnload.notify(`${this.viewport?.name}.${this.name}`, 'leave');
            // }) as any;
        }, this.hia.canUnload);
    }
    unloading(instruction, navigation) {
        this.viewport = instruction.viewport.instance;
        // console.log('TestViewModel unloading', this.name);
        // this.hia.unloading.notify(`${this.viewport?.name}.${this.name}`);
        return this.specs.unloading.invoke(this, () => {
            // this.hia.unloading.notify(`${this.viewport?.name}.${this.name}`);
            return this.$unloading(instruction, navigation);
        }, this.hia.unloading);
    }
    $binding(_initiator, _parent) {
        // do nothing
    }
    $bound(_initiator, _parent) {
        // do nothing
    }
    $attaching(_initiator, _parent) {
        // do nothing
    }
    $attached(_initiator) {
        // do nothing
    }
    $detaching(_initiator, _parent) {
        // do nothing
    }
    $unbinding(_initiator, _parent) {
        // do nothing
    }
    $canLoad(_params, _instruction, _navigation) {
        return true;
    }
    $loading(_params, _instruction, _navigation) {
        // do nothing
    }
    $canUnload(_instruction, _navigation) {
        return true;
    }
    $unloading(_instruction, _navigation) {
        // do nothing
    }
    $dispose() {
        const $this = this;
        $this.hia = void 0;
        $this.specs = void 0;
    }
}
//# sourceMappingURL=view-models.js.map