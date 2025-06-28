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
        return new HookSpecs(input.binding ?? hookSpecsMap.binding.sync, input.bound ?? hookSpecsMap.bound.sync, input.attaching ?? hookSpecsMap.attaching.sync, input.attached ?? hookSpecsMap.attached.sync, input.detaching ?? hookSpecsMap.detaching.sync, input.unbinding ?? hookSpecsMap.unbinding.sync, hookSpecsMap.dispose, input.canLoad ?? hookSpecsMap.canLoad.sync, input.loading ?? hookSpecsMap.loading.sync, input.canUnload ?? hookSpecsMap.canUnload.sync, input.unloading ?? hookSpecsMap.unloading.sync);
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
        return this.specs.binding.invoke(this, () => {
            this.hia.binding.notify(this.name);
            return this.$binding(initiator, parent);
        });
    }
    bound(initiator, parent) {
        return this.specs.bound.invoke(this, () => {
            this.hia.bound.notify(this.name);
            return this.$bound(initiator, parent);
        });
    }
    attaching(initiator, parent) {
        return this.specs.attaching.invoke(this, () => {
            this.hia.attaching.notify(this.name);
            return this.$attaching(initiator, parent);
        });
    }
    attached(initiator) {
        return this.specs.attached.invoke(this, () => {
            this.hia.attached.notify(this.name);
            return this.$attached(initiator);
        });
    }
    detaching(initiator, parent) {
        return this.specs.detaching.invoke(this, () => {
            this.hia.detaching.notify(this.name);
            return this.$detaching(initiator, parent);
        });
    }
    unbinding(initiator, parent) {
        return this.specs.unbinding.invoke(this, () => {
            this.hia.unbinding.notify(this.name);
            return this.$unbinding(initiator, parent);
        });
    }
    dispose() {
        this.specs.$dispose.invoke(this, () => {
            this.hia.$$dispose.notify(this.name);
            this.$dispose();
        });
    }
    canLoad(params, next, current) {
        return this.specs.canLoad.invoke(this, () => {
            this.hia.canLoad.notify(this.name);
            return this.$canLoad(params, next, current);
        });
    }
    loading(params, next, current) {
        return this.specs.loading.invoke(this, () => {
            this.hia.loading.notify(this.name);
            return this.$loading(params, next, current);
        });
    }
    canUnload(next, current) {
        return this.specs.canUnload.invoke(this, () => {
            this.hia.canUnload.notify(this.name);
            return this.$canUnload(next, current);
        });
    }
    unloading(next, current) {
        return this.specs.unloading.invoke(this, () => {
            this.hia.unloading.notify(this.name);
            return this.$unloading(next, current);
        });
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
    $canLoad(_params, _next, _current) {
        return true;
    }
    $loading(_params, _next, _current) {
        // do nothing
    }
    $canUnload(_next, _current) {
        return true;
    }
    $unloading(_next, _current) {
        // do nothing
    }
    $dispose() {
        const $this = this;
        $this.hia = void 0;
        $this.specs = void 0;
    }
}
//# sourceMappingURL=view-models.js.map