var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { DI, ILogConfig, LogLevel, Registration, onResolve, resolve } from '@aurelia/kernel';
import { CustomElement, customElement, IPlatform, Aurelia, } from '@aurelia/runtime-html';
import { IRouter, RouterConfiguration, route, } from '@aurelia/router';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';
import { isFirefox } from '../util.js';
function join(sep, ...parts) {
    return parts.filter(function (x) {
        return x?.split('@')[0];
    }).join(sep);
}
const hookNames = ['binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding', 'canLoad', 'loading', 'canUnload', 'unloading'];
class DelayedInvokerFactory {
    constructor(name, ticks) {
        this.name = name;
        this.ticks = ticks;
    }
    create(mgr, p) {
        return new DelayedInvoker(mgr, p, this.name, this.ticks);
    }
    toString() {
        return `${this.name}(${this.ticks})`;
    }
}
export class HookSpecs {
    constructor(binding, bound, attaching, attached, detaching, unbinding, dispose, canLoad, loading, canUnload, unloading, ticks) {
        this.binding = binding;
        this.bound = bound;
        this.attaching = attaching;
        this.attached = attached;
        this.detaching = detaching;
        this.unbinding = unbinding;
        this.dispose = dispose;
        this.canLoad = canLoad;
        this.loading = loading;
        this.canUnload = canUnload;
        this.unloading = unloading;
        this.ticks = ticks;
    }
    static create(ticks, input = {}) {
        return new HookSpecs(input.binding || DelayedInvoker.binding(ticks), input.bound || DelayedInvoker.bound(ticks), input.attaching || DelayedInvoker.attaching(ticks), input.attached || DelayedInvoker.attached(ticks), input.detaching || DelayedInvoker.detaching(ticks), input.unbinding || DelayedInvoker.unbinding(ticks), DelayedInvoker.dispose(), input.canLoad || DelayedInvoker.canLoad(ticks), input.loading || DelayedInvoker.loading(ticks), input.canUnload || DelayedInvoker.canUnload(ticks), input.unloading || DelayedInvoker.unloading(ticks), ticks);
    }
    $dispose() {
        const $this = this;
        $this.binding = void 0;
        $this.bound = void 0;
        $this.attaching = void 0;
        $this.attached = void 0;
        $this.detaching = void 0;
        $this.unbinding = void 0;
        $this.dispose = void 0;
        $this.canLoad = void 0;
        $this.loading = void 0;
        $this.canUnload = void 0;
        $this.unloading = void 0;
    }
    toString(exclude = this.ticks) {
        const strings = [];
        for (const k of hookNames) {
            const factory = this[k];
            if (factory.ticks !== exclude) {
                strings.push(factory.toString());
            }
        }
        return strings.length > 0 ? strings.join(',') : '';
    }
}
class TestVM {
    get name() { return this.$controller.definition.name; }
    constructor(mgr, p, specs) {
        this.bindingDI = specs.binding.create(mgr, p);
        this.boundDI = specs.bound.create(mgr, p);
        this.attachingDI = specs.attaching.create(mgr, p);
        this.attachedDI = specs.attached.create(mgr, p);
        this.detachingDI = specs.detaching.create(mgr, p);
        this.unbindingDI = specs.unbinding.create(mgr, p);
        this.canLoadDI = specs.canLoad.create(mgr, p);
        this.loadDI = specs.loading.create(mgr, p);
        this.canUnloadDI = specs.canUnload.create(mgr, p);
        this.unloadDI = specs.unloading.create(mgr, p);
        this.disposeDI = specs.dispose.create(mgr, p);
    }
    binding(i, p) { return this.bindingDI.invoke(this, () => { return this.$binding(i, p); }); }
    bound(i, p) { return this.boundDI.invoke(this, () => { return this.$bound(i, p); }); }
    attaching(i, p) { return this.attachingDI.invoke(this, () => { return this.$attaching(i, p); }); }
    attached(i) { return this.attachedDI.invoke(this, () => { return this.$attached(i); }); }
    detaching(i, p) { return this.detachingDI.invoke(this, () => { return this.$detaching(i, p); }); }
    unbinding(i, p) { return this.unbindingDI.invoke(this, () => { return this.$unbinding(i, p); }); }
    canLoad(p, n, c) { return this.canLoadDI.invoke(this, () => { return this.$canLoad(p, n, c); }); }
    loading(p, n, c) { return this.loadDI.invoke(this, () => { return this.$loading(p, n, c); }); }
    canUnload(n, c) { return this.canUnloadDI.invoke(this, () => { return this.$canUnload(n, c); }); }
    unloading(n, c) { return this.unloadDI.invoke(this, () => { return this.$unloading(n, c); }); }
    dispose() { void this.disposeDI.invoke(this, () => { this.$dispose(); }); }
    $binding(_i, _p) { }
    $bound(_i, _p) { }
    $attaching(_i, _p) { }
    $attached(_i) { }
    $detaching(_i, _p) { }
    $unbinding(_i, _p) { }
    $canLoad(_p, _n, _c) { return true; }
    $loading(_p, _n, _c) { }
    $canUnload(_n, _c) { return true; }
    $unloading(_n, _c) { }
    $dispose() {
        this.bindingDI = void 0;
        this.boundDI = void 0;
        this.attachingDI = void 0;
        this.attachedDI = void 0;
        this.detachingDI = void 0;
        this.unbindingDI = void 0;
        this.disposeDI = void 0;
    }
}
class Notifier {
    constructor(mgr, name) {
        this.mgr = mgr;
        this.name = name;
        this.entryHistory = [];
        this.fullHistory = [];
        this.p = mgr.p;
    }
    enter(vm) {
        this.entryHistory.push(vm.name);
        this.fullHistory.push(`${vm.name}.enter`);
        this.mgr.enter(vm, this);
    }
    leave(vm) {
        this.fullHistory.push(`${vm.name}.leave`);
        this.mgr.leave(vm, this);
    }
    tick(vm, i) {
        this.fullHistory.push(`${vm.name}.tick(${i})`);
        this.mgr.tick(vm, this, i);
    }
    dispose() {
        this.entryHistory = void 0;
        this.fullHistory = void 0;
        this.p = void 0;
        this.mgr = void 0;
    }
}
const INotifierConfig = DI.createInterface('INotifierConfig');
class NotifierConfig {
    constructor(resolveLabels, resolveTimeoutMs) {
        this.resolveLabels = resolveLabels;
        this.resolveTimeoutMs = resolveTimeoutMs;
    }
}
const INotifierManager = DI.createInterface('INotifierManager', x => x.singleton(NotifierManager));
class NotifierManager {
    constructor() {
        this.entryNotifyHistory = [];
        this.fullNotifyHistory = [];
        this.prefix = '';
        this.p = resolve(IPlatform);
        this.binding = new Notifier(this, 'binding');
        this.bound = new Notifier(this, 'bound');
        this.attaching = new Notifier(this, 'attaching');
        this.attached = new Notifier(this, 'attached');
        this.detaching = new Notifier(this, 'detaching');
        this.unbinding = new Notifier(this, 'unbinding');
        this.canLoad = new Notifier(this, 'canLoad');
        this.loading = new Notifier(this, 'loading');
        this.canUnload = new Notifier(this, 'canUnload');
        this.unloading = new Notifier(this, 'unloading');
        this.dispose = new Notifier(this, 'dispose');
    }
    enter(vm, tracker) {
        const label = `${this.prefix}.${vm.name}.${tracker.name}`;
        this.entryNotifyHistory.push(label);
        this.fullNotifyHistory.push(`${label}.enter`);
    }
    leave(vm, tracker) {
        const label = `${this.prefix}.${vm.name}.${tracker.name}`;
        this.fullNotifyHistory.push(`${label}.leave`);
    }
    tick(vm, tracker, i) {
        const label = `${this.prefix}.${vm.name}.${tracker.name}`;
        this.fullNotifyHistory.push(`${label}.tick(${i})`);
    }
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    $dispose() {
        this.binding.dispose();
        this.bound.dispose();
        this.attaching.dispose();
        this.attached.dispose();
        this.detaching.dispose();
        this.unbinding.dispose();
        this.canLoad.dispose();
        this.loading.dispose();
        this.canUnload.dispose();
        this.unloading.dispose();
        this.dispose.dispose();
        this.entryNotifyHistory = void 0;
        this.fullNotifyHistory = void 0;
        this.p = void 0;
        this.binding = void 0;
        this.bound = void 0;
        this.attaching = void 0;
        this.attached = void 0;
        this.detaching = void 0;
        this.unbinding = void 0;
        this.canLoad = void 0;
        this.loading = void 0;
        this.canUnload = void 0;
        this.unloading = void 0;
        this.$dispose = void 0;
    }
}
class DelayedInvoker {
    constructor(mgr, p, name, ticks) {
        this.mgr = mgr;
        this.p = p;
        this.name = name;
        this.ticks = ticks;
    }
    static binding(ticks = 0) { return new DelayedInvokerFactory('binding', ticks); }
    static bound(ticks = 0) { return new DelayedInvokerFactory('bound', ticks); }
    static attaching(ticks = 0) { return new DelayedInvokerFactory('attaching', ticks); }
    static attached(ticks = 0) { return new DelayedInvokerFactory('attached', ticks); }
    static detaching(ticks = 0) { return new DelayedInvokerFactory('detaching', ticks); }
    static unbinding(ticks = 0) { return new DelayedInvokerFactory('unbinding', ticks); }
    static canLoad(ticks = 0) { return new DelayedInvokerFactory('canLoad', ticks); }
    static loading(ticks = 0) { return new DelayedInvokerFactory('loading', ticks); }
    static canUnload(ticks = 0) { return new DelayedInvokerFactory('canUnload', ticks); }
    static unloading(ticks = 0) { return new DelayedInvokerFactory('unloading', ticks); }
    static dispose(ticks = 0) { return new DelayedInvokerFactory('dispose', ticks); }
    invoke(vm, cb) {
        if (this.ticks === 0) {
            this.mgr[this.name].enter(vm);
            const value = cb();
            this.mgr[this.name].leave(vm);
            return value;
        }
        else {
            let i = -1;
            let resolve;
            const p = new Promise(r => {
                resolve = r;
            });
            const next = () => {
                if (++i === 0) {
                    this.mgr[this.name].enter(vm);
                }
                else {
                    this.mgr[this.name].tick(vm, i);
                }
                if (i < this.ticks) {
                    void Promise.resolve().then(next);
                }
                else {
                    const value = cb();
                    this.mgr[this.name].leave(vm);
                    resolve(value);
                }
            };
            next();
            return p;
        }
    }
    toString() {
        let str = this.name;
        if (this.ticks !== 0) {
            str = `${str}.${this.ticks}t`;
        }
        return str;
    }
}
function verifyInvocationsEqual(actual, expected) {
    const groupNames = new Set();
    actual.forEach(x => groupNames.add(x.slice(0, x.indexOf('.'))));
    expected.forEach(x => groupNames.add(x.slice(0, x.indexOf('.'))));
    const expectedGroups = {};
    const actualGroups = {};
    for (const groupName of groupNames) {
        expectedGroups[groupName] = expected.filter(x => x.startsWith(`${groupName}.`));
        actualGroups[groupName] = actual.filter(x => x.startsWith(`${groupName}.`));
    }
    const errors = [];
    for (const prefix in expectedGroups) {
        expected = expectedGroups[prefix];
        actual = actualGroups[prefix];
        const len = Math.max(actual.length, expected.length);
        for (let i = 0; i < len; ++i) {
            const $actual = actual[i] ?? '';
            const $expected = (expected[i] ?? '').replace(/>$/, '');
            if ($actual === $expected) {
                errors.push(`    OK : ${$actual}`);
            }
            else {
                errors.push(`NOT OK : ${$actual}          (expected: ${$expected})`);
            }
        }
    }
    if (errors.some(e => e.startsWith('N'))) {
        throw new Error(`Failed assertion: invocation mismatch\n  - ${errors.join('\n  - ')})`);
    }
    else {
        // fallback just to make sure there's no bugs in this function causing false positives
        assert.deepStrictEqual(actual, expected);
    }
}
function vp(count) {
    if (count === 1) {
        return `<au-viewport></au-viewport>`;
    }
    let template = '';
    for (let i = 0; i < count; ++i) {
        template = `${template}<au-viewport name="$${i}"></au-viewport>`;
    }
    return template;
}
function* $(prefix, component, ticks, ...calls) {
    if (component instanceof Array) {
        for (const c of component) {
            yield* $(prefix, c, ticks, ...calls);
        }
    }
    else {
        for (const call of calls) {
            if (call === '') {
                if (component.length > 0) {
                    yield '';
                }
            }
            else if (typeof call === 'string') {
                if (component.length > 0) {
                    if (!call.includes('.')) {
                        yield `${prefix}.${component}.${call}.enter`;
                        if (call !== 'dispose') {
                            for (let i = 1; i <= ticks; ++i) {
                                if (i === ticks) {
                                    yield `${prefix}.${component}.${call}.tick(${i})>`;
                                }
                                else {
                                    yield `${prefix}.${component}.${call}.tick(${i})`;
                                }
                            }
                        }
                        yield `${prefix}.${component}.${call}.leave`;
                    }
                    else {
                        yield `${prefix}.${component}.${call}`;
                    }
                }
            }
            else {
                yield* call;
            }
        }
    }
}
function* interleave(...generators) {
    while (generators.length > 0) {
        for (let i = 0, ii = generators.length; i < ii; ++i) {
            const gen = generators[i];
            const next = gen.next();
            if (next.done) {
                generators.splice(i, 1);
                --i;
                --ii;
            }
            else {
                const value = next.value;
                if (value) {
                    if (value.endsWith('>')) {
                        yield value.slice(0, -1);
                        yield gen.next().value;
                    }
                    else if (value.endsWith('dispose.enter')) {
                        yield value;
                        yield gen.next().value;
                    }
                    else {
                        yield value;
                    }
                }
            }
        }
    }
}
async function createFixture(Component, deps = [], level = LogLevel.fatal, restorePreviousRouteTreeOnError = true) {
    const ctx = TestContext.create();
    const cfg = new NotifierConfig([], 100);
    const { container, platform } = ctx;
    container.register(TestRouterConfiguration.for(level));
    container.register(Registration.instance(INotifierConfig, cfg));
    container.register(RouterConfiguration.customize({ restorePreviousRouteTreeOnError }));
    container.register(...deps);
    const mgr = container.get(INotifierManager);
    const router = container.get(IRouter);
    const component = container.get(Component);
    const au = new Aurelia(container);
    const host = ctx.createElement('div');
    const logConfig = container.get(ILogConfig);
    au.app({ component, host });
    mgr.setPrefix('start');
    await au.start();
    return {
        ctx,
        container,
        au,
        host,
        mgr,
        component,
        platform,
        router,
        startTracing() {
            logConfig.level = LogLevel.trace;
        },
        stopTracing() {
            logConfig.level = level;
        },
        async tearDown() {
            mgr.setPrefix('stop');
            await au.stop(true);
        },
    };
}
describe('router/hook-tests.spec.ts', function () {
    describe('monomorphic timings', function () {
        for (const ticks of [
            0,
            1,
        ]) {
            const hookSpec = HookSpecs.create(ticks);
            let A01 = (() => {
                let _classDecorators = [customElement({ name: 'a01', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A01 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A01");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A01 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A01 = _classThis;
            })();
            let A02 = (() => {
                let _classDecorators = [customElement({ name: 'a02', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A02 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A02");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A02 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A02 = _classThis;
            })();
            let A03 = (() => {
                let _classDecorators = [customElement({ name: 'a03', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A03 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A03");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A03 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A03 = _classThis;
            })();
            let A04 = (() => {
                let _classDecorators = [customElement({ name: 'a04', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A04 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A04");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A04 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A04 = _classThis;
            })();
            const A0 = [A01, A02, A03, A04];
            let Root1 = (() => {
                let _classDecorators = [customElement({ name: 'root1', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root1 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root1 = _classThis;
            })();
            let A11 = (() => {
                let _classDecorators = [customElement({ name: 'a11', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A11 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A11");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A11 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A11 = _classThis;
            })();
            let A12 = (() => {
                let _classDecorators = [customElement({ name: 'a12', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A12 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A12");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A12 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A12 = _classThis;
            })();
            let A13 = (() => {
                let _classDecorators = [customElement({ name: 'a13', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A13 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A13");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A13 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A13 = _classThis;
            })();
            let A14 = (() => {
                let _classDecorators = [customElement({ name: 'a14', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A14 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A14");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A14 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A14 = _classThis;
            })();
            const A1 = [A11, A12, A13, A14];
            let Root2 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'a01', component: A01 },
                            { path: 'a02', component: A02 },
                            { path: 'a03', component: A03 },
                            { path: 'a04', component: A04 },
                        ]
                    }), customElement({ name: 'root2', template: vp(2) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root2 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root2 = _classThis;
            })();
            let A21 = (() => {
                let _classDecorators = [customElement({ name: 'a21', template: vp(2) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A21 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A21");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A21 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A21 = _classThis;
            })();
            let A22 = (() => {
                let _classDecorators = [customElement({ name: 'a22', template: vp(2) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var A22 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "A22");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A22 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A22 = _classThis;
            })();
            const A2 = [A21, A22];
            const A = [...A0, ...A1, ...A2];
            describe(`ticks: ${ticks}`, function () {
                describe('single', function () {
                    for (const spec of [
                        { t1: 'a01', t2: 'a02', t3: 'a01', t4: 'a02' },
                        { t1: 'a01', t2: 'a02', t3: 'a03', t4: 'a01' },
                        { t1: 'a01', t2: 'a02', t3: 'a01', t4: 'a04' },
                    ]) {
                        const { t1, t2, t3, t4 } = spec;
                        it(`'${t1}' -> '${t2}' -> '${t3}' -> '${t4}'`, async function () {
                            const { router, mgr, tearDown } = await createFixture(Root2, A);
                            const phase1 = `('' -> '${t1}')#1`;
                            const phase2 = `('${t1}' -> '${t2}')#2`;
                            const phase3 = `('${t2}' -> '${t3}')#3`;
                            const phase4 = `('${t3}' -> '${t4}')#4`;
                            mgr.setPrefix(phase1);
                            await router.load(t1);
                            mgr.setPrefix(phase2);
                            await router.load(t2);
                            mgr.setPrefix(phase3);
                            await router.load(t3);
                            mgr.setPrefix(phase4);
                            await router.load(t4);
                            await tearDown();
                            const expected = [...(function* () {
                                    switch (ticks) {
                                        case 0:
                                            yield* $('start', 'root2', ticks, 'binding', 'bound', 'attaching', 'attached');
                                            yield* $(phase1, t1, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                            for (const [phase, { $t1, $t2 }] of [
                                                [phase2, { $t1: t1, $t2: t2 }],
                                                [phase3, { $t1: t2, $t2: t3 }],
                                                [phase4, { $t1: t3, $t2: t4 }],
                                            ]) {
                                                yield* $(phase, $t1, ticks, 'canUnload');
                                                yield* $(phase, $t2, ticks, 'canLoad');
                                                yield* $(phase, $t1, ticks, 'unloading');
                                                yield* $(phase, $t2, ticks, 'loading');
                                                yield* $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose');
                                                yield* $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached');
                                            }
                                            yield* $('stop', [t4, 'root2'], ticks, 'detaching');
                                            yield* $('stop', [t4, 'root2'], ticks, 'unbinding');
                                            yield* $('stop', ['root2', t4], ticks, 'dispose');
                                            break;
                                        case 1:
                                            yield* $('start', 'root2', ticks, 'binding', 'bound', 'attaching', 'attached');
                                            yield* $(phase1, t1, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                            for (const [phase, { $t1, $t2 }] of [
                                                [phase2, { $t1: t1, $t2: t2 }],
                                                [phase3, { $t1: t2, $t2: t3 }],
                                                [phase4, { $t1: t3, $t2: t4 }],
                                            ]) {
                                                yield* $(phase, $t1, ticks, 'canUnload');
                                                yield* $(phase, $t2, ticks, 'canLoad');
                                                yield* $(phase, $t1, ticks, 'unloading');
                                                yield* $(phase, $t2, ticks, 'loading');
                                                yield* $(phase, $t1, ticks, 'detaching', 'unbinding', 'dispose');
                                                yield* $(phase, $t2, ticks, 'binding', 'bound', 'attaching', 'attached');
                                            }
                                            yield* interleave($('stop', t4, ticks, 'detaching', 'unbinding'), $('stop', 'root2', ticks, 'detaching', 'unbinding'));
                                            yield* $('stop', 'root2', ticks, 'dispose');
                                            yield* $('stop', t4, ticks, 'dispose');
                                            break;
                                    }
                                })()];
                            verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
                            mgr.$dispose();
                        });
                    }
                });
                // the siblings tests has been migrated to lifecycle-hooks.spec.ts
                describe('parent-child', function () {
                    let PcA01 = (() => {
                        let _classDecorators = [customElement({ name: 'a01', template: null })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcA01 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcA01");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcA01 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcA01 = _classThis;
                    })();
                    let PcA02 = (() => {
                        let _classDecorators = [customElement({ name: 'a02', template: null })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcA02 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcA02");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcA02 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcA02 = _classThis;
                    })();
                    let PcA12 = (() => {
                        let _classDecorators = [customElement({ name: 'a12', template: vp(1) })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcA12 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcA12");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcA12 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })();
                        // as this is a self referencing routing configuration, we cannot use the decorator as the class cannot be (statically) used in the decorator before it is fully defined.
                        _classThis.routes = [
                            { path: 'a02', component: PcA02 },
                            { path: 'a12', component: PcA12 },
                        ];
                        (() => {
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcA12 = _classThis;
                    })();
                    let PcA11 = (() => {
                        let _classDecorators = [customElement({ name: 'a11', template: vp(1) })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcA11 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcA11");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcA11 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })();
                        // as this is a self referencing routing configuration, we cannot use the decorator as the class cannot be (statically) used in the decorator before it is fully defined.
                        _classThis.routes = [
                            { path: 'a01', component: PcA01 },
                            { path: 'a02', component: PcA02 },
                            { path: 'a12', component: PcA12 },
                            { path: 'a11', component: PcA11 },
                        ];
                        (() => {
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcA11 = _classThis;
                    })();
                    let PcA14 = (() => {
                        let _classDecorators = [customElement({ name: 'a14', template: vp(1) })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcA14 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcA14");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcA14 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcA14 = _classThis;
                    })();
                    let PcA13 = (() => {
                        let _classDecorators = [route({
                                routes: [
                                    { path: 'a11', component: PcA11 },
                                    { path: 'a12', component: PcA12 },
                                    { path: 'a14', component: PcA14 },
                                ]
                            }), customElement({ name: 'a13', template: vp(1) })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcA13 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcA13");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcA13 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcA13 = _classThis;
                    })();
                    let PcRoot = (() => {
                        let _classDecorators = [route({
                                routes: [
                                    { path: 'a11', component: PcA11 },
                                    { path: 'a12', component: PcA12 },
                                    { path: 'a13', component: PcA13 },
                                ]
                            }), customElement({ name: 'root2', template: vp(2) })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var PcRoot = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "PcRoot");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            PcRoot = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return PcRoot = _classThis;
                    })();
                    const deps = [PcA01, PcA02, PcA11, PcA12, PcA13, PcA14];
                    for (const { t1, t2 } of [
                        // Only parent changes with every nav
                        { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a13', c: 'a12' } },
                        { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a12', c: 'a12' } },
                        { t1: { p: 'a12', c: 'a12' }, t2: { p: 'a11', c: 'a12' } },
                        // Only child changes with every nav
                        { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a11', c: 'a02' } },
                        { t1: { p: 'a11', c: '' }, t2: { p: 'a11', c: 'a02' } },
                        { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a11', c: '' } },
                        { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a11', c: 'a02' } },
                        { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a11', c: '' } },
                        { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a11', c: 'a11' } },
                        { t1: { p: 'a11', c: '' }, t2: { p: 'a11', c: 'a11' } },
                        // Both parent and child change with every nav
                        { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a12', c: 'a02' } },
                        { t1: { p: 'a11', c: '' }, t2: { p: 'a12', c: 'a02' } },
                        { t1: { p: 'a11', c: 'a01' }, t2: { p: 'a12', c: '' } },
                        { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a12', c: 'a02' } },
                        { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a12', c: 'a12' } },
                        { t1: { p: 'a11', c: 'a11' }, t2: { p: 'a12', c: '' } },
                        { t1: { p: 'a12', c: 'a02' }, t2: { p: 'a11', c: 'a11' } },
                        { t1: { p: 'a12', c: 'a12' }, t2: { p: 'a11', c: 'a11' } },
                        { t1: { p: 'a12', c: '' }, t2: { p: 'a11', c: 'a11' } },
                        { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a13', c: 'a14' } },
                        { t1: { p: 'a11', c: 'a12' }, t2: { p: 'a13', c: 'a11' } },
                        { t1: { p: 'a13', c: 'a14' }, t2: { p: 'a11', c: 'a12' } },
                        { t1: { p: 'a13', c: 'a11' }, t2: { p: 'a11', c: 'a12' } },
                    ]) {
                        const instr1 = join('/', t1.p, t1.c);
                        const instr2 = join('/', t2.p, t2.c);
                        it(`${instr1}' -> '${instr2}' -> '${instr1}' -> '${instr2}'`, async function () {
                            const { router, mgr, tearDown } = await createFixture(PcRoot, deps);
                            const phase1 = `('' -> '${instr1}')#1`;
                            const phase2 = `('${instr1}' -> '${instr2}')#2`;
                            const phase3 = `('${instr2}' -> '${instr1}')#3`;
                            const phase4 = `('${instr1}' -> '${instr2}')#4`;
                            mgr.setPrefix(phase1);
                            await router.load(instr1);
                            mgr.setPrefix(phase2);
                            await router.load(instr2);
                            mgr.setPrefix(phase3);
                            await router.load(instr1);
                            mgr.setPrefix(phase4);
                            await router.load(instr2);
                            await tearDown();
                            const expected = [...(function* () {
                                    switch (ticks) {
                                        case 0:
                                            yield* $('start', 'root2', ticks, 'binding', 'bound', 'attaching', 'attached');
                                            yield* $(phase1, [t1.p, t1.c], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                            for (const [phase, { $t1, $t2 }] of [
                                                [phase2, { $t1: t1, $t2: t2 }],
                                                [phase3, { $t1: t2, $t2: t1 }],
                                                [phase4, { $t1: t1, $t2: t2 }],
                                            ]) {
                                                // When parents are equal, this becomes like an ordinary single component transition
                                                if ($t1.p === $t2.p) {
                                                    yield* $(phase, $t1.c, ticks, 'canUnload');
                                                    yield* $(phase, $t2.c, ticks, 'canLoad');
                                                    yield* $(phase, $t1.c, ticks, 'unloading');
                                                    yield* $(phase, $t2.c, ticks, 'loading');
                                                    yield* $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose');
                                                    yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                                                }
                                                else {
                                                    yield* $(phase, [$t1.c, $t1.p], ticks, 'canUnload');
                                                    yield* $(phase, $t2.p, ticks, 'canLoad');
                                                    yield* $(phase, [$t1.c, $t1.p], ticks, 'unloading');
                                                    yield* $(phase, $t2.p, ticks, 'loading');
                                                    yield* $(phase, [$t1.c, $t1.p], ticks, 'detaching');
                                                    yield* $(phase, [$t1.c, $t1.p], ticks, 'unbinding');
                                                    yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');
                                                    yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching');
                                                    yield* $(phase, $t2.p, ticks, 'attached');
                                                    yield* $(phase, $t2.c, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                                }
                                            }
                                            yield* $('stop', [t2.c, t2.p, 'root2'], ticks, 'detaching');
                                            yield* $('stop', [t2.c, t2.p, 'root2'], ticks, 'unbinding');
                                            yield* $('stop', ['root2', t2.p, t2.c], ticks, 'dispose');
                                            break;
                                        case 1:
                                            yield* $('start', 'root2', ticks, 'binding', 'bound', 'attaching', 'attached');
                                            yield* $(phase1, [t1.p, t1.c], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                            for (const [phase, { $t1, $t2 }] of [
                                                [phase2, { $t1: t1, $t2: t2 }],
                                                [phase3, { $t1: t2, $t2: t1 }],
                                                [phase4, { $t1: t1, $t2: t2 }],
                                            ]) {
                                                // When parents are equal, this becomes like an ordinary single component transition
                                                if ($t1.p === $t2.p) {
                                                    yield* $(phase, $t1.c, ticks, 'canUnload');
                                                    yield* $(phase, $t2.c, ticks, 'canLoad');
                                                    yield* $(phase, $t1.c, ticks, 'unloading');
                                                    yield* $(phase, $t2.c, ticks, 'loading');
                                                    yield* $(phase, $t1.c, ticks, 'detaching', 'unbinding', 'dispose');
                                                    yield* $(phase, $t2.c, ticks, 'binding', 'bound', 'attaching', 'attached');
                                                }
                                                else {
                                                    yield* $(phase, [$t1.c, $t1.p], ticks, 'canUnload');
                                                    yield* $(phase, $t2.p, ticks, 'canLoad');
                                                    yield* $(phase, [$t1.c, $t1.p], ticks, 'unloading');
                                                    yield* $(phase, $t2.p, ticks, 'loading');
                                                    yield* interleave($(phase, $t1.c, ticks, 'detaching', 'unbinding'), $(phase, $t1.p, ticks, 'detaching', 'unbinding'));
                                                    yield* $(phase, [$t1.p, $t1.c], ticks, 'dispose');
                                                    yield* $(phase, $t2.p, ticks, 'binding', 'bound', 'attaching', 'attached');
                                                    yield* $(phase, $t2.c, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                                }
                                            }
                                            yield* interleave($('stop', t2.c, ticks, 'detaching', 'unbinding'), $('stop', t2.p, ticks, 'detaching', 'unbinding'), $('stop', 'root2', ticks, 'detaching', 'unbinding'));
                                            yield* $('stop', ['root2', t2.p, t2.c], ticks, 'dispose');
                                            break;
                                    }
                                })()];
                            verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
                            mgr.$dispose();
                        });
                    }
                });
            });
        }
    });
    describe('parent-child timings', function () {
        for (const hookSpec of [
            HookSpecs.create(0, {
                canUnload: DelayedInvoker.canUnload(1),
            }),
            HookSpecs.create(0, {
                unloading: DelayedInvoker.unloading(1),
            }),
            HookSpecs.create(0, {
                canLoad: DelayedInvoker.canLoad(1),
            }),
            HookSpecs.create(0, {
                loading: DelayedInvoker.loading(1),
            }),
            HookSpecs.create(0, {
                binding: DelayedInvoker.binding(1),
            }),
            HookSpecs.create(0, {
                bound: DelayedInvoker.bound(1),
            }),
            HookSpecs.create(0, {
                attaching: DelayedInvoker.attaching(1),
            }),
            HookSpecs.create(0, {
                attached: DelayedInvoker.attached(1),
            }),
            HookSpecs.create(0, {
                detaching: DelayedInvoker.detaching(1),
            }),
            HookSpecs.create(0, {
                unbinding: DelayedInvoker.unbinding(1),
            }),
        ]) {
            it(`'a/b/c/d' -> 'a' (c.hookSpec:${hookSpec})`, async function () {
                let D = (() => {
                    let _classDecorators = [customElement({ name: 'd', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var D = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "D");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        D = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return D = _classThis;
                })();
                let C = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'd', component: D }] }), customElement({ name: 'c', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "C");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C = _classThis;
                })();
                let B = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'c', component: C }] }), customElement({ name: 'b', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "B");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B = _classThis;
                })();
                let A = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'b', component: B }] }), customElement({ name: 'a', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "A");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'a', component: A }] }), customElement({ name: 'root', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [A, B, C, D]);
                const phase1 = `('' -> 'a/b/c/d')`;
                mgr.setPrefix(phase1);
                await router.load('a/b/c/d');
                const phase2 = `('a/b/c/d' -> 'a')`;
                mgr.setPrefix(phase2);
                await router.load('a');
                await tearDown();
                const expected = [...(function* () {
                        yield* $('start', 'root', 0, 'binding', 'bound', 'attaching', 'attached');
                        const hookName = hookSpec.toString().slice(0, -3);
                        yield* $(phase1, ['a', 'b'], 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                        switch (hookName) {
                            case 'canLoad':
                                yield* $(phase1, 'c', 1, 'canLoad');
                                yield* $(phase1, 'c', 0, 'loading', 'binding', 'bound', 'attaching', 'attached');
                                break;
                            case 'loading':
                                yield* $(phase1, 'c', 0, 'canLoad');
                                yield* $(phase1, 'c', 1, 'loading');
                                yield* $(phase1, 'c', 0, 'binding', 'bound', 'attaching', 'attached');
                                break;
                            case 'binding':
                                yield* $(phase1, 'c', 0, 'canLoad', 'loading');
                                yield* $(phase1, 'c', 1, 'binding');
                                yield* $(phase1, 'c', 0, 'bound', 'attaching', 'attached');
                                break;
                            case 'bound':
                                yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding');
                                yield* $(phase1, 'c', 1, 'bound');
                                yield* $(phase1, 'c', 0, 'attaching', 'attached');
                                break;
                            case 'attaching':
                                yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding', 'bound');
                                yield* $(phase1, 'c', 1, 'attaching');
                                yield* $(phase1, 'c', 0, 'attached');
                                break;
                            case 'attached':
                                yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching');
                                yield* $(phase1, 'c', 1, 'attached');
                                break;
                            default:
                                yield* $(phase1, 'c', 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                                break;
                        }
                        yield* $(phase1, 'd', 0, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached');
                        switch (hookName) {
                            case 'canUnload':
                                yield* $(phase2, 'd', 0, 'canUnload');
                                yield* $(phase2, 'c', 1, 'canUnload');
                                yield* $(phase2, 'b', 0, 'canUnload');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
                                break;
                            case 'unloading':
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
                                yield* $(phase2, 'd', 0, 'unloading');
                                yield* $(phase2, 'c', 1, 'unloading');
                                yield* $(phase2, 'b', 0, 'unloading');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
                                break;
                            case 'detaching':
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
                                yield* $(phase2, 'd', 0, 'detaching');
                                yield* $(phase2, 'c', 0, 'detaching.enter');
                                yield* $(phase2, 'b', 0, 'detaching');
                                yield* $(phase2, 'c', 0, 'detaching.tick(1)');
                                yield* $(phase2, 'c', 0, 'detaching.leave');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
                                break;
                            case 'unbinding':
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
                                yield* $(phase2, 'd', 0, 'unbinding');
                                yield* $(phase2, 'c', 0, 'unbinding.enter');
                                yield* $(phase2, 'b', 0, 'unbinding');
                                yield* $(phase2, 'c', 0, 'unbinding.tick(1)');
                                yield* $(phase2, 'c', 0, 'unbinding.leave');
                                break;
                            default:
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'canUnload');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unloading');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'detaching');
                                yield* $(phase2, ['d', 'c', 'b'], 0, 'unbinding');
                                break;
                        }
                        yield* $(phase2, ['b', 'c', 'd'], 0, 'dispose');
                        yield* $('stop', ['a', 'root'], 0, 'detaching');
                        yield* $('stop', ['a', 'root'], 0, 'unbinding');
                        yield* $('stop', ['root', 'a'], 0, 'dispose');
                    })()];
                verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
                mgr.$dispose();
            });
        }
    });
    describe('single incoming sibling transition', function () {
        for (const [aCanLoad, bCanLoad, aLoad, bLoad] of [
            [1, 1, 1, 2],
            [1, 1, 1, 3],
            [1, 1, 1, 4],
            [1, 1, 1, 5],
            [1, 1, 1, 6],
            [1, 1, 1, 7],
            [1, 1, 1, 8],
            [1, 1, 1, 9],
            [1, 1, 1, 10],
            [1, 1, 2, 1],
            [1, 1, 3, 1],
            [1, 1, 4, 1],
            [1, 1, 5, 1],
            [1, 1, 6, 1],
            [1, 1, 7, 1],
            [1, 1, 8, 1],
            [1, 1, 9, 1],
            [1, 1, 10, 1],
            [1, 5, 1, 2],
            [1, 5, 1, 10],
            [1, 5, 2, 1],
            [1, 5, 10, 1],
            [5, 1, 1, 2],
            [5, 1, 1, 10],
            [5, 1, 2, 1],
            [5, 1, 10, 1],
        ]) {
            const spec = {
                a: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(aCanLoad),
                    loading: DelayedInvoker.loading(aLoad),
                }),
                b: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(bCanLoad),
                    loading: DelayedInvoker.loading(bLoad),
                }),
            };
            const title = Object.keys(spec).map(key => `${key}:${spec[key]}`).filter(x => x.length > 2).join(',');
            it(title, async function () {
                const { a, b } = spec;
                let A = (() => {
                    let _classDecorators = [customElement({ name: 'a', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), a); }
                    };
                    __setFunctionName(_classThis, "A");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A = _classThis;
                })();
                let B = (() => {
                    let _classDecorators = [customElement({ name: 'b', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), b); }
                    };
                    __setFunctionName(_classThis, "B");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'a', component: A },
                                { path: 'b', component: B },
                            ]
                        }), customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [A, B]);
                const phase1 = `('' -> 'a$0+b$1')`;
                mgr.setPrefix(phase1);
                await router.load('a@$0+b@$1');
                await tearDown();
                const expected = [...(function* () {
                        yield* $(`start`, 'root', 0, 'binding', 'bound', 'attaching', 'attached');
                        yield* interleave($(phase1, 'a', aCanLoad, 'canLoad'), $(phase1, 'b', bCanLoad, 'canLoad'));
                        yield* interleave($(phase1, 'a', aLoad, 'loading'), $(phase1, 'b', bLoad, 'loading'));
                        yield* interleave($(phase1, 'a', 1, 'binding', 'bound', 'attaching', 'attached'), $(phase1, 'b', 1, 'binding', 'bound', 'attaching', 'attached'));
                        yield* interleave($('stop', 'a', 0, 'detaching.enter'), $('stop', 'b', 0, 'detaching.enter'), $('stop', 'root', 0, 'detaching'));
                        yield* $('stop', ['a', 'b'], 0, 'detaching.tick(1)', 'detaching.leave');
                        yield* interleave($('stop', 'a', 0, 'unbinding.enter'), $('stop', 'b', 0, 'unbinding.enter'), $('stop', 'root', 0, 'unbinding'));
                        yield* $('stop', ['a', 'b'], 0, 'unbinding.tick(1)', 'unbinding.leave');
                        yield* $('stop', ['root', 'a', 'b'], 0, 'dispose');
                    }())];
                verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
                mgr.$dispose();
            });
        }
    });
    describe('single incoming parent-child transition', function () {
        for (const [a1CanLoad, a2CanLoad, a1Load, a2Load] of [
            [1, 5, 1, 5],
            [1, 5, 5, 1],
            [5, 1, 1, 5],
            [5, 1, 5, 1],
        ]) {
            const spec = {
                a1: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(a1CanLoad),
                    loading: DelayedInvoker.loading(a1Load),
                }),
                a2: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(a2CanLoad),
                    loading: DelayedInvoker.loading(a2Load),
                }),
            };
            const title = Object.keys(spec).map(key => `${key}:${spec[key]}`).filter(x => x.length > 2).join(',');
            it(title, async function () {
                const { a1, a2 } = spec;
                let A2 = (() => {
                    let _classDecorators = [customElement({ name: 'a2', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), a2); }
                    };
                    __setFunctionName(_classThis, "A2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A2 = _classThis;
                })();
                let A1 = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'a2', component: A2 }] }), customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), a1); }
                    };
                    __setFunctionName(_classThis, "A1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A1 = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'a1', component: A1 }] }), customElement({ name: 'root', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [A1, A2]);
                const phase1 = `('' -> 'a1/a2')`;
                mgr.setPrefix(phase1);
                await router.load('a1/a2');
                await tearDown();
                const expected = [...(function* () {
                        yield* $(`start`, 'root', 0, 'binding', 'bound', 'attaching', 'attached');
                        yield* $(phase1, 'a1', a1CanLoad, 'canLoad');
                        yield* $(phase1, 'a1', a1Load, 'loading');
                        yield* $(phase1, 'a1', 1, 'binding', 'bound', 'attaching', 'attached');
                        yield* $(phase1, 'a2', a2CanLoad, 'canLoad');
                        yield* $(phase1, 'a2', a2Load, 'loading');
                        yield* $(phase1, 'a2', 1, 'binding', 'bound', 'attaching', 'attached');
                        yield* $('stop', ['a2', 'a1'], 0, 'detaching.enter');
                        yield* $('stop', 'root', 0, 'detaching');
                        yield* $('stop', ['a2', 'a1'], 0, 'detaching.tick(1)', 'detaching.leave');
                        yield* $('stop', ['a2', 'a1'], 0, 'unbinding.enter');
                        yield* $('stop', 'root', 0, 'unbinding');
                        yield* $('stop', ['a2', 'a1'], 0, 'unbinding.tick(1)', 'unbinding.leave');
                        yield* $('stop', ['root', 'a1', 'a2'], 0, 'dispose');
                    })()];
                verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
                mgr.$dispose();
            });
        }
    });
    describe('single incoming parentsiblings-childsiblings transition', function () {
        for (const [a1CanLoad, a2CanLoad, b1CanLoad, b2CanLoad, a1Load, a2Load, b1Load, b2Load,] of [
            // a1.canLoad
            [
                2, 1, 1, 1,
                1, 1, 1, 1,
            ],
            // more involved tests are moved to lifecycle-hooks.spec.ts in more simplified form.
            // b1.canLoad
            // tests are moved to lifecycle-hooks.spec.ts in more simplified form.
            // a1.loading
            [
                1, 1, 1, 1,
                2, 1, 1, 1,
            ],
            [
                1, 1, 1, 1,
                4, 1, 1, 1,
            ],
            [
                1, 1, 1, 1,
                8, 1, 1, 1,
            ],
            // b1.loading
            [
                1, 1, 1, 1,
                1, 1, 2, 1,
            ],
            [
                1, 1, 1, 1,
                1, 1, 4, 1,
            ],
            [
                1, 1, 1, 1,
                1, 1, 8, 1,
            ],
            // a2.canLoad
            [
                1, 2, 1, 1,
                1, 1, 1, 1,
            ],
            [
                1, 4, 1, 1,
                1, 1, 1, 1,
            ],
            [
                1, 8, 1, 1,
                1, 1, 1, 1,
            ],
            // b2.canLoad
            [
                1, 1, 1, 2,
                1, 1, 1, 1,
            ],
            [
                1, 1, 1, 4,
                1, 1, 1, 1,
            ],
            [
                1, 1, 1, 8,
                1, 1, 1, 1,
            ],
            // a2.loading
            [
                1, 1, 1, 1,
                1, 2, 1, 1,
            ],
            [
                1, 1, 1, 1,
                1, 4, 1, 1,
            ],
            [
                1, 1, 1, 1,
                1, 8, 1, 1,
            ],
            // b2.loading
            [
                1, 1, 1, 1,
                1, 1, 1, 2,
            ],
            [
                1, 1, 1, 1,
                1, 1, 1, 4,
            ],
            [
                1, 1, 1, 1,
                1, 1, 1, 8,
            ],
        ]) {
            const spec = {
                a1: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(a1CanLoad),
                    loading: DelayedInvoker.loading(a1Load),
                }),
                a2: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(a2CanLoad),
                    loading: DelayedInvoker.loading(a2Load),
                }),
                b1: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(b1CanLoad),
                    loading: DelayedInvoker.loading(b1Load),
                }),
                b2: HookSpecs.create(1, {
                    canLoad: DelayedInvoker.canLoad(b2CanLoad),
                    loading: DelayedInvoker.loading(b2Load),
                }),
            };
            const title = Object.keys(spec).map(key => `${key}:${spec[key]}`).filter(x => x.length > 2).join(',');
            it(title, async function () {
                const { a1, a2, b1, b2 } = spec;
                let A2 = (() => {
                    let _classDecorators = [customElement({ name: 'a2', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), a2); }
                    };
                    __setFunctionName(_classThis, "A2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A2 = _classThis;
                })();
                let A1 = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'a2', component: A2 }] }), customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), a1); }
                    };
                    __setFunctionName(_classThis, "A1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A1 = _classThis;
                })();
                let B2 = (() => {
                    let _classDecorators = [customElement({ name: 'b2', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), b2); }
                    };
                    __setFunctionName(_classThis, "B2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B2 = _classThis;
                })();
                let B1 = (() => {
                    let _classDecorators = [route({ routes: [{ path: 'b2', component: B2 }] }), customElement({ name: 'b1', template: '<au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), b1); }
                    };
                    __setFunctionName(_classThis, "B1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B1 = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'a1', component: A1 },
                                { path: 'b1', component: B1 },
                            ]
                        }), customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), HookSpecs.create(0)); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [A1, A2, B1, B2]);
                const phase1 = `('' -> 'a1@$0/a2+b1@$1/b2')`;
                mgr.setPrefix(phase1);
                await router.load('a1@$0/a2+b1@$1/b2');
                await tearDown();
                const expected = [...(function* () {
                        yield* $(`start`, 'root', 0, 'binding', 'bound', 'attaching', 'attached');
                        yield* interleave($(phase1, 'a1', a1CanLoad, 'canLoad'), $(phase1, 'b1', b1CanLoad, 'canLoad'));
                        yield* interleave($(phase1, 'a1', a1Load, 'loading'), $(phase1, 'b1', b1Load, 'loading'));
                        yield* interleave((function* () {
                            yield* $(phase1, 'a1', 1, 'binding', 'bound', 'attaching', 'attached');
                            yield* $(phase1, 'a2', a2CanLoad, 'canLoad');
                            yield* $(phase1, 'a2', a2Load, 'loading');
                            yield* $(phase1, 'a2', 1, 'binding', 'bound', 'attaching', 'attached');
                        })(), (function* () {
                            yield* $(phase1, 'b1', 1, 'binding', 'bound', 'attaching', 'attached');
                            yield* $(phase1, 'b2', b2CanLoad, 'canLoad');
                            yield* $(phase1, 'b2', b2Load, 'loading');
                            yield* $(phase1, 'b2', 1, 'binding', 'bound', 'attaching', 'attached');
                        })());
                        yield* interleave($('stop', ['a2', 'b2'], 0, 'detaching.enter'), $('stop', ['a1', 'b1'], 0, 'detaching.enter'));
                        yield* $('stop', 'root', 0, 'detaching');
                        yield* interleave($('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'detaching.tick(1)'), $('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'detaching.leave'));
                        yield* interleave($('stop', ['a2', 'b2'], 0, 'unbinding.enter'), $('stop', ['a1', 'b1'], 0, 'unbinding.enter'));
                        yield* $('stop', 'root', 0, 'unbinding');
                        yield* interleave($('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'unbinding.tick(1)'), $('stop', ['a2', 'a1', 'b2', 'b1'], 0, 'unbinding.leave'));
                        yield* $('stop', ['root', 'a1', 'a2', 'b1', 'b2'], 0, 'dispose');
                    })()];
                verifyInvocationsEqual(mgr.fullNotifyHistory, expected);
                mgr.$dispose();
            });
        }
    });
    // TODO: make these pass in firefox (firefox for some reason uses different type of stack trace - see https://app.circleci.com/pipelines/github/aurelia/aurelia/7569/workflows/60a7fb9f-e8b0-47e4-b753-eaa9b5da42c2/jobs/64147)
    if (!isFirefox()) {
        describe('error handling', function () {
            function runTest(spec) {
                it(`re-throws ${spec} - without recovery`, async function () {
                    const components = spec.createCes();
                    let Root = (() => {
                        let _classDecorators = [route({ routes: components.map(component => ({ path: CustomElement.getDefinition(component).name, component })) }), customElement({ name: 'root', template: '<au-viewport></au-viewport>' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var Root = _classThis = class {
                        };
                        __setFunctionName(_classThis, "Root");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Root = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Root = _classThis;
                    })();
                    const { router, tearDown } = await createFixture(Root, components, undefined, false);
                    let err = void 0;
                    try {
                        await spec.action(router);
                    }
                    catch ($err) {
                        err = $err;
                    }
                    if (err === void 0) {
                        assert.fail(`Expected an error, but no error was thrown`);
                    }
                    else {
                        assert.match(err.message, spec.messageMatcher, `Expected message to match (${err.message}) matches Regexp(${spec.messageMatcher})`);
                        assert.match(err.stack, spec.stackMatcher, `Expected stack to match (${err.stack}) matches Regex(${spec.stackMatcher})`);
                    }
                    try {
                        await tearDown();
                    }
                    catch ($err) {
                        if ($err.message.includes('error in')) {
                            // The router should by default "remember" the last error and propagate it once again from the first deactivated viewport
                            // on the next shutdown attempt.
                            // This is the error we expect, so ignore it
                        }
                        else {
                            // Re-throw anything else which would not be an expected error (e.g. "unexpected state" shouldn't happen if the router handled
                            // the last error)
                            throw $err;
                        }
                    }
                });
            }
            for (const hookName of [
                'binding',
                'bound',
                'attaching',
                'attached',
                'canLoad',
                'loading',
            ]) {
                runTest({
                    createCes() {
                        return [CustomElement.define({ name: 'a', template: null }, class Target {
                                async [hookName]() {
                                    throw new Error(`error in ${hookName}`);
                                }
                            })];
                    },
                    async action(router) {
                        await router.load('a');
                    },
                    messageMatcher: new RegExp(`error in ${hookName}`),
                    stackMatcher: new RegExp(`Target.${hookName}`),
                    toString() {
                        return String(this.messageMatcher);
                    },
                });
            }
            for (const hookName of [
                'detaching',
                'unbinding',
                'canUnload',
                'unloading',
            ]) {
                const throwsInTarget1 = ['canUnload'].includes(hookName);
                runTest({
                    createCes() {
                        const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
                            async [hookName]() {
                                throw new Error(`error in ${hookName}`);
                            }
                        });
                        const target2 = CustomElement.define({ name: 'b', template: null }, class Target2 {
                            async binding() { throw new Error(`error in binding`); }
                            async bound() { throw new Error(`error in bound`); }
                            async attaching() { throw new Error(`error in attaching`); }
                            async attached() { throw new Error(`error in attached`); }
                            async canLoad() { throw new Error(`error in canLoad`); }
                            async loading() { throw new Error(`error in loading`); }
                        });
                        return [target1, target2];
                    },
                    async action(router) {
                        await router.load('a');
                        await router.load('b');
                    },
                    messageMatcher: new RegExp(`error in ${throwsInTarget1 ? hookName : 'canLoad'}`),
                    stackMatcher: new RegExp(`${throwsInTarget1 ? 'Target1' : 'Target2'}.${throwsInTarget1 ? hookName : 'canLoad'}`),
                    toString() {
                        return `${String(this.messageMatcher)} with canLoad,loading,binding,bound,attaching`;
                    },
                });
            }
            for (const hookName of [
                'detaching',
                'unbinding',
                'canUnload',
                'unloading',
            ]) {
                const throwsInTarget1 = ['canUnload', 'unloading'].includes(hookName);
                runTest({
                    createCes() {
                        const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
                            async [hookName]() {
                                throw new Error(`error in ${hookName}`);
                            }
                        });
                        const target2 = CustomElement.define({ name: 'b', template: null }, class Target2 {
                            async binding() { throw new Error(`error in binding`); }
                            async bound() { throw new Error(`error in bound`); }
                            async attaching() { throw new Error(`error in attaching`); }
                            async attached() { throw new Error(`error in attached`); }
                            async loading() { throw new Error(`error in loading`); }
                        });
                        return [target1, target2];
                    },
                    async action(router) {
                        await router.load('a');
                        await router.load('b');
                    },
                    messageMatcher: new RegExp(`error in ${throwsInTarget1 ? hookName : 'loading'}`),
                    stackMatcher: new RegExp(`${throwsInTarget1 ? 'Target1' : 'Target2'}.${throwsInTarget1 ? hookName : 'loading'}`),
                    toString() {
                        return `${String(this.messageMatcher)} with loading,binding,bound,attaching`;
                    },
                });
            }
            for (const hookName of [
                'detaching',
                'unbinding',
            ]) {
                runTest({
                    createCes() {
                        const target1 = CustomElement.define({ name: 'a', template: null }, class Target1 {
                            async [hookName]() {
                                throw new Error(`error in ${hookName}`);
                            }
                        });
                        const target2 = CustomElement.define({ name: 'b', template: null }, class Target2 {
                            async binding() { throw new Error(`error in binding`); }
                            async bound() { throw new Error(`error in bound`); }
                            async attaching() { throw new Error(`error in attaching`); }
                            async attached() { throw new Error(`error in attached`); }
                        });
                        return [target1, target2];
                    },
                    async action(router) {
                        await router.load('a');
                        await router.load('b');
                    },
                    messageMatcher: new RegExp(`error in ${hookName}`),
                    stackMatcher: new RegExp(`Target1.${hookName}`),
                    toString() {
                        return `${String(this.messageMatcher)} with binding,bound,attaching`;
                    },
                });
            }
        });
    }
    describe('unconfigured route', function () {
        for (const { name, routes, withInitialLoad } of [
            {
                name: 'without empty route',
                routes(...[A, B]) {
                    return [
                        { path: 'a', component: A },
                        { path: 'b', component: B },
                    ];
                },
                withInitialLoad: false,
            },
            {
                name: 'with empty route',
                routes(...[A, B]) {
                    return [
                        { path: ['', 'a'], component: A },
                        { path: 'b', component: B },
                    ];
                },
                withInitialLoad: true,
            },
            {
                name: 'with empty route - explicit redirect',
                routes(...[A, B]) {
                    return [
                        { path: '', redirectTo: 'a' },
                        { path: 'a', component: A },
                        { path: 'b', component: B },
                    ];
                },
                withInitialLoad: true,
            },
        ]) {
            it(`without fallback - single viewport - ${name}`, async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let A = (() => {
                    let _classDecorators = [customElement({ name: 'a', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "A");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A = _classThis;
                })();
                let B = (() => {
                    let _classDecorators = [customElement({ name: 'b', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "B");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({ routes: routes(A, B) }), customElement({ name: 'root', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [A, B] /* , LogLevel.trace */);
                let phase = 'start';
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...(withInitialLoad ? $(phase, 'a', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached') : [])
                ]);
                // phase 1: load unconfigured
                phase = 'phase1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await assert.rejects(() => router.load('unconfigured'), /AUR3401.+unconfigured/);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                // phase 2: load configured
                mgr.fullNotifyHistory.length = 0;
                phase = 'phase2';
                mgr.setPrefix(phase);
                await router.load('b');
                verifyInvocationsEqual(mgr.fullNotifyHistory, withInitialLoad
                    ? [
                        ...$(phase, 'a', ticks, 'canUnload'),
                        ...$(phase, 'b', ticks, 'canLoad'),
                        ...$(phase, 'a', ticks, 'unloading'),
                        ...$(phase, 'b', ticks, 'loading'),
                        ...$(phase, 'a', ticks, 'detaching', 'unbinding', 'dispose'),
                        ...$(phase, 'b', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ]
                    : [...$(phase, 'b', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached')]);
                // phase 3: load unconfigured1/unconfigured2
                phase = 'phase3';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await assert.rejects(() => router.load('unconfigured1/unconfigured2'), /AUR3401.+unconfigured1/);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                // phase 4: load configured
                phase = 'phase4';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('a');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'b', ticks, 'canUnload'),
                    ...$(phase, 'a', ticks, 'canLoad'),
                    ...$(phase, 'b', ticks, 'unloading'),
                    ...$(phase, 'a', ticks, 'loading'),
                    ...$(phase, 'b', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'a', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // phase 5: load unconfigured/configured
                phase = 'phase5';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await assert.rejects(() => router.load('unconfigured/b'), /AUR3401.+unconfigured/);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                // phase 6: load configured
                phase = 'phase6';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('b');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'a', ticks, 'canUnload'),
                    ...$(phase, 'b', ticks, 'canLoad'),
                    ...$(phase, 'a', ticks, 'unloading'),
                    ...$(phase, 'b', ticks, 'loading'),
                    ...$(phase, 'a', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'b', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // stop
                mgr.fullNotifyHistory.length = 0;
                phase = 'stop';
                await tearDown();
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['b', 'root'], ticks, 'detaching'),
                    ...$(phase, ['b', 'root'], ticks, 'unbinding'),
                    ...$(phase, ['root', 'b'], ticks, 'dispose'),
                ]);
                mgr.$dispose();
            });
            it(`with fallback - single viewport - ${name}`, async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let A = (() => {
                    let _classDecorators = [customElement({ name: 'a', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "A");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A = _classThis;
                })();
                let B = (() => {
                    let _classDecorators = [customElement({ name: 'b', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "B");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B = _classThis;
                })();
                let C = (() => {
                    let _classDecorators = [customElement({ name: 'c', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "C");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({ routes: [...routes(A, B), { path: 'c', component: C }], fallback: 'c' }), customElement({ name: 'root', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [A, B, C] /* , LogLevel.trace */);
                let phase = 'start';
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...(withInitialLoad ? $(phase, 'a', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached') : [])
                ]);
                // phase 1: load unconfigured
                phase = 'phase1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('unconfigured');
                verifyInvocationsEqual(mgr.fullNotifyHistory, withInitialLoad
                    ? [
                        ...$(phase, 'a', ticks, 'canUnload'),
                        ...$(phase, 'c', ticks, 'canLoad'),
                        ...$(phase, 'a', ticks, 'unloading'),
                        ...$(phase, 'c', ticks, 'loading'),
                        ...$(phase, 'a', ticks, 'detaching', 'unbinding', 'dispose'),
                        ...$(phase, 'c', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ]
                    : [...$(phase, 'c', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached')]);
                // phase 2: load configured
                mgr.fullNotifyHistory.length = 0;
                phase = 'phase2';
                mgr.setPrefix(phase);
                await router.load('b');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'c', ticks, 'canUnload'),
                    ...$(phase, 'b', ticks, 'canLoad'),
                    ...$(phase, 'c', ticks, 'unloading'),
                    ...$(phase, 'b', ticks, 'loading'),
                    ...$(phase, 'c', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'b', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // phase 3: load unconfigured1/unconfigured2
                phase = 'phase3';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('unconfigured1/unconfigured2'); // unconfigured2 will be discarded.
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'b', ticks, 'canUnload'),
                    ...$(phase, 'c', ticks, 'canLoad'),
                    ...$(phase, 'b', ticks, 'unloading'),
                    ...$(phase, 'c', ticks, 'loading'),
                    ...$(phase, 'b', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'c', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // phase 4: load configured
                phase = 'phase4';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('a');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'c', ticks, 'canUnload'),
                    ...$(phase, 'a', ticks, 'canLoad'),
                    ...$(phase, 'c', ticks, 'unloading'),
                    ...$(phase, 'a', ticks, 'loading'),
                    ...$(phase, 'c', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'a', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // phase 5: load unconfigured/configured
                phase = 'phase5';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('unconfigured/b'); // the configured 'b' doesn't matter due to fail-fast strategy
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'a', ticks, 'canUnload'),
                    ...$(phase, 'c', ticks, 'canLoad'),
                    ...$(phase, 'a', ticks, 'unloading'),
                    ...$(phase, 'c', ticks, 'loading'),
                    ...$(phase, 'a', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'c', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // phase 6: load configured
                phase = 'phase6';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('b');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'c', ticks, 'canUnload'),
                    ...$(phase, 'b', ticks, 'canLoad'),
                    ...$(phase, 'c', ticks, 'unloading'),
                    ...$(phase, 'b', ticks, 'loading'),
                    ...$(phase, 'c', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'b', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // stop
                mgr.fullNotifyHistory.length = 0;
                phase = 'stop';
                try {
                    await tearDown();
                }
                catch (e) {
                    console.log('caught post stop', e);
                }
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['b', 'root'], ticks, 'detaching'),
                    ...$(phase, ['b', 'root'], ticks, 'unbinding'),
                    ...$(phase, ['root', 'b'], ticks, 'dispose'),
                ]);
                mgr.$dispose();
            });
        }
        it(`without fallback - sibling viewport`, async function () {
            const ticks = 0;
            const hookSpec = HookSpecs.create(ticks);
            let S1 = (() => {
                let _classDecorators = [customElement({ name: 's1', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var S1 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "S1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    S1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return S1 = _classThis;
            })();
            let S2 = (() => {
                let _classDecorators = [customElement({ name: 's2', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var S2 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "S2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    S2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return S2 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 's1', component: S1 },
                            { path: 's2', component: S2 },
                        ]
                    }), customElement({ name: 'root', template: vp(2) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { router, mgr, tearDown } = await createFixture(Root, [S1, S2] /* , LogLevel.trace */);
            let phase = 'start';
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
            // phase 1: load unconfigured
            phase = 'phase1';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await assert.rejects(() => router.load('s1@$1+unconfigured@$2'), /AUR3401.+unconfigured/);
            verifyInvocationsEqual(mgr.fullNotifyHistory, []);
            // phase 2: load configured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase2';
            mgr.setPrefix(phase);
            await assert.rejects(() => router.load('s1@$1+s2@$2'), /AUR3174/);
            verifyInvocationsEqual(mgr.fullNotifyHistory, []);
            // stop
            mgr.fullNotifyHistory.length = 0;
            phase = 'stop';
            await tearDown();
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['root'], ticks, 'detaching'),
                ...$(phase, ['root'], ticks, 'unbinding'),
                ...$(phase, ['root'], ticks, 'dispose'),
            ]);
            mgr.$dispose();
        });
        it(`with fallback - single-level parent/child viewport`, async function () {
            const ticks = 0;
            const hookSpec = HookSpecs.create(ticks);
            let C1 = (() => {
                let _classDecorators = [customElement({ name: 'c1', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var C1 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "C1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C1 = _classThis;
            })();
            let C2 = (() => {
                let _classDecorators = [customElement({ name: 'c2', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var C2 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "C2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C2 = _classThis;
            })();
            let P = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'c1', component: C1 },
                            { path: 'c2', component: C2 },
                        ],
                        fallback: 'c2'
                    }), customElement({ name: 'p', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var P = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "P");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    P = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return P = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            {
                                path: 'p',
                                component: P
                            }
                        ]
                    }), customElement({ name: 'root', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { router, mgr, tearDown } = await createFixture(Root, [C1, C2, P] /* , LogLevel.trace */);
            let phase = 'start';
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
            // phase 1: load unconfigured
            phase = 'phase1';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('p/unconfigured');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, ['p', 'c2'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached')]);
            // phase 2: load configured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase2';
            mgr.setPrefix(phase);
            await router.load('p/c1');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, 'c2', ticks, 'canUnload'),
                ...$(phase, 'c1', ticks, 'canLoad'),
                ...$(phase, 'c2', ticks, 'unloading'),
                ...$(phase, 'c1', ticks, 'loading'),
                ...$(phase, 'c2', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 'c1', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 3: load unconfigured1/unconfigured2
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase3';
            mgr.setPrefix(phase);
            await router.load('p/unconfigured1/unconfigured2');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, 'c1', ticks, 'canUnload'),
                ...$(phase, 'c2', ticks, 'canLoad'),
                ...$(phase, 'c1', ticks, 'unloading'),
                ...$(phase, 'c2', ticks, 'loading'),
                ...$(phase, 'c1', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 'c2', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 3: load configured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase2';
            mgr.setPrefix(phase);
            await router.load('p/c1');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, 'c2', ticks, 'canUnload'),
                ...$(phase, 'c1', ticks, 'canLoad'),
                ...$(phase, 'c2', ticks, 'unloading'),
                ...$(phase, 'c1', ticks, 'loading'),
                ...$(phase, 'c2', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 'c1', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // stop
            mgr.fullNotifyHistory.length = 0;
            phase = 'stop';
            await tearDown();
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['c1', 'p', 'root'], ticks, 'detaching'),
                ...$(phase, ['c1', 'p', 'root'], ticks, 'unbinding'),
                ...$(phase, ['root', 'p', 'c1'], ticks, 'dispose'),
            ]);
            mgr.$dispose();
        });
        it(`with fallback - multi-level parent/child viewport`, async function () {
            const ticks = 0;
            const hookSpec = HookSpecs.create(ticks);
            let GC11 = (() => {
                let _classDecorators = [customElement({ name: 'gc11', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC11 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC11");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC11 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC11 = _classThis;
            })();
            let GC12 = (() => {
                let _classDecorators = [customElement({ name: 'gc12', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC12 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC12");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC12 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC12 = _classThis;
            })();
            let GC21 = (() => {
                let _classDecorators = [customElement({ name: 'gc21', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC21 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC21");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC21 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC21 = _classThis;
            })();
            let GC22 = (() => {
                let _classDecorators = [customElement({ name: 'gc22', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC22 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC22");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC22 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC22 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'gc11', component: GC11 },
                            { path: 'gc12', component: GC12 },
                        ],
                        fallback: 'gc11'
                    }), customElement({ name: 'c1', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var C1 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "C1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C1 = _classThis;
            })();
            let C2 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'gc21', component: GC21 },
                            { path: 'gc22', component: GC22 },
                        ],
                        fallback: 'gc22'
                    }), customElement({ name: 'c2', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var C2 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "C2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C2 = _classThis;
            })();
            let P = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'c1', component: C1 },
                            { path: 'c2', component: C2 },
                        ],
                        fallback: 'c2'
                    }), customElement({ name: 'p', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var P = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "P");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    P = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return P = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            {
                                path: 'p',
                                component: P
                            }
                        ]
                    }), customElement({ name: 'root', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { router, mgr, tearDown } = await createFixture(Root, [GC11, GC12, GC21, GC22, C1, C2, P] /* , LogLevel.trace */);
            let phase = 'start';
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
            // phase 1: load unconfigured
            phase = 'phase1';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('p/unconfigured');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, ['p', 'c2'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached')]);
            // phase 2: load configured1/unconfigured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase2';
            mgr.setPrefix(phase);
            await router.load('p/c1/unconfigured');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, 'c2', ticks, 'canUnload'),
                ...$(phase, 'c1', ticks, 'canLoad'),
                ...$(phase, 'c2', ticks, 'unloading'),
                ...$(phase, 'c1', ticks, 'loading'),
                ...$(phase, 'c2', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 'c1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, 'gc11', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 3: load configured1/configured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase3';
            mgr.setPrefix(phase);
            await router.load('p/c1/gc12');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc11', 'c1'], ticks, 'canUnload'), // it is strange here that c1.unloading is being called. TODO(sayan): fix
                ...$(phase, 'gc12', ticks, 'canLoad'),
                ...$(phase, 'gc11', ticks, 'unloading'),
                ...$(phase, 'gc12', ticks, 'loading'),
                ...$(phase, 'gc11', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 'gc12', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 4: load configured2/unconfigured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase4';
            mgr.setPrefix(phase);
            await router.load('p/c2/unconfigured');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc12', 'c1'], ticks, 'canUnload'),
                ...$(phase, 'c2', ticks, 'canLoad'),
                ...$(phase, ['gc12', 'c1'], ticks, 'unloading'),
                ...$(phase, 'c2', ticks, 'loading'),
                ...$(phase, ['gc12', 'c1'], ticks, 'detaching'),
                ...$(phase, ['gc12', 'c1'], ticks, 'unbinding'),
                ...$(phase, ['c1', 'gc12'], ticks, 'dispose'),
                ...$(phase, 'c2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, 'gc22', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 5: load configured2/configured
            mgr.fullNotifyHistory.length = 0;
            phase = 'phase5';
            mgr.setPrefix(phase);
            await router.load('p/c2/gc21');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc22', 'c2'], ticks, 'canUnload'),
                ...$(phase, 'gc21', ticks, 'canLoad'),
                ...$(phase, 'gc22', ticks, 'unloading'),
                ...$(phase, 'gc21', ticks, 'loading'),
                ...$(phase, 'gc22', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 'gc21', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // stop
            mgr.fullNotifyHistory.length = 0;
            phase = 'stop';
            await tearDown();
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc21', 'c2', 'p', 'root'], ticks, 'detaching'),
                ...$(phase, ['gc21', 'c2', 'p', 'root'], ticks, 'unbinding'),
                ...$(phase, ['root', 'p', 'c2', 'gc21'], ticks, 'dispose'),
            ]);
            mgr.$dispose();
        });
        it(`with fallback - sibling viewport`, async function () {
            const ticks = 0;
            const hookSpec = HookSpecs.create(ticks);
            let S1 = (() => {
                let _classDecorators = [customElement({ name: 's1', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var S1 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "S1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    S1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return S1 = _classThis;
            })();
            let S2 = (() => {
                let _classDecorators = [customElement({ name: 's2', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var S2 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "S2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    S2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return S2 = _classThis;
            })();
            let S3 = (() => {
                let _classDecorators = [customElement({ name: 's3', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var S3 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "S3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    S3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return S3 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 's1', component: S1 },
                            { path: 's2', component: S2 },
                            { path: 's3', component: S3 },
                        ],
                        fallback: 's2',
                    }), customElement({ name: 'root', template: vp(2) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { router, mgr, tearDown } = await createFixture(Root, [S1, S2, S3] /* , LogLevel.trace */);
            let phase = 'start';
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
            // phase 1: load configured+unconfigured
            phase = 'phase1';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('s1@$0+unconfigured@$1');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['s1', 's2'], ticks, 'canLoad'),
                ...$(phase, ['s1', 's2'], ticks, 'loading'),
                ...$(phase, ['s1', 's2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 2: load unconfigured+configured
            phase = 'phase2';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('unconfigured@$0+s1@$1');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['s1', 's2'], ticks, 'canUnload'),
                ...$(phase, ['s2', 's1'], ticks, 'canLoad'),
                ...$(phase, ['s1', 's2'], ticks, 'unloading'),
                ...$(phase, ['s2', 's1'], ticks, 'loading'),
                ...$(phase, 's1', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 's2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, 's2', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 's1', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 3: load configured+configured
            phase = 'phase3';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('s3@$0+s2@$1');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['s2', 's1'], ticks, 'canUnload'),
                ...$(phase, ['s3', 's2'], ticks, 'canLoad'),
                ...$(phase, ['s2', 's1'], ticks, 'unloading'),
                ...$(phase, ['s3', 's2'], ticks, 'loading'),
                ...$(phase, 's2', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 's3', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, 's1', ticks, 'detaching', 'unbinding', 'dispose'),
                ...$(phase, 's2', ticks, 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // stop
            mgr.fullNotifyHistory.length = 0;
            phase = 'stop';
            await tearDown();
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['s3', 's2', 'root'], ticks, 'detaching'),
                ...$(phase, ['s3', 's2', 'root'], ticks, 'unbinding'),
                ...$(phase, ['root', 's3', 's2'], ticks, 'dispose'),
            ]);
            mgr.$dispose();
        });
        it(`with fallback - sibling + parent/child viewport`, async function () {
            const ticks = 0;
            const hookSpec = HookSpecs.create(ticks);
            let GC11 = (() => {
                let _classDecorators = [customElement({ name: 'gc11', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC11 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC11");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC11 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC11 = _classThis;
            })();
            let GC12 = (() => {
                let _classDecorators = [customElement({ name: 'gc12', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC12 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC12");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC12 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC12 = _classThis;
            })();
            let GC21 = (() => {
                let _classDecorators = [customElement({ name: 'gc21', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC21 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC21");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC21 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC21 = _classThis;
            })();
            let GC22 = (() => {
                let _classDecorators = [customElement({ name: 'gc22', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var GC22 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "GC22");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC22 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC22 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'gc11', component: GC11 },
                            { path: 'gc12', component: GC12 },
                        ],
                        fallback: 'gc11'
                    }), customElement({ name: 'c1', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var C1 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "C1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C1 = _classThis;
            })();
            let C2 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'gc21', component: GC21 },
                            { path: 'gc22', component: GC22 },
                        ],
                        fallback: 'gc22'
                    }), customElement({ name: 'c2', template: vp(1) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var C2 = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "C2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C2 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'c1', component: C1 },
                            { path: 'c2', component: C2 },
                        ],
                    }), customElement({ name: 'root', template: vp(2) })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = TestVM;
                var Root = _classThis = class extends _classSuper {
                    constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { router, mgr, tearDown } = await createFixture(Root, [C1, C2, GC11, GC12, GC21, GC22] /* , LogLevel.trace */);
            let phase = 'start';
            verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
            // phase 1
            phase = 'phase1';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('c1/gc12+c2/unconfigured');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['c1', 'c2'], ticks, 'canLoad'),
                ...$(phase, ['c1', 'c2'], ticks, 'loading'),
                ...$(phase, ['c1', 'c2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, ['gc12', 'gc22'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 2
            phase = 'phase2';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('c2/gc21+c1/unconfigured');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc12', 'gc22', 'c1', 'c2'], ticks, 'canUnload'),
                ...$(phase, ['c2', 'c1'], ticks, 'canLoad'),
                ...$(phase, ['gc12', 'c1', 'gc22', 'c2'], ticks, 'unloading'),
                ...$(phase, ['c2', 'c1'], ticks, 'loading'),
                ...$(phase, ['gc12', 'c1'], ticks, 'detaching'),
                ...$(phase, ['gc12', 'c1'], ticks, 'unbinding'),
                ...$(phase, ['c1', 'gc12'], ticks, 'dispose'),
                ...$(phase, 'c2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, ['gc22', 'c2'], ticks, 'detaching'),
                ...$(phase, ['gc22', 'c2'], ticks, 'unbinding'),
                ...$(phase, ['c2', 'gc22'], ticks, 'dispose'),
                ...$(phase, 'c1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, ['gc21', 'gc11'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // phase 3
            phase = 'phase3';
            mgr.fullNotifyHistory.length = 0;
            mgr.setPrefix(phase);
            await router.load('c1/gc12+c2/gc21');
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc21', 'gc11', 'c2', 'c1'], ticks, 'canUnload'),
                ...$(phase, ['c1', 'c2'], ticks, 'canLoad'),
                ...$(phase, ['gc21', 'c2', 'gc11', 'c1'], ticks, 'unloading'),
                ...$(phase, ['c1', 'c2'], ticks, 'loading'),
                ...$(phase, ['gc21', 'c2'], ticks, 'detaching'),
                ...$(phase, ['gc21', 'c2'], ticks, 'unbinding'),
                ...$(phase, ['c2', 'gc21'], ticks, 'dispose'),
                ...$(phase, 'c1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, ['gc11', 'c1'], ticks, 'detaching'),
                ...$(phase, ['gc11', 'c1'], ticks, 'unbinding'),
                ...$(phase, ['c1', 'gc11'], ticks, 'dispose'),
                ...$(phase, 'c2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ...$(phase, ['gc12', 'gc21'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
            ]);
            // stop
            mgr.fullNotifyHistory.length = 0;
            phase = 'stop';
            await tearDown();
            verifyInvocationsEqual(mgr.fullNotifyHistory, [
                ...$(phase, ['gc12', 'c1', 'gc21', 'c2', 'root'], ticks, 'detaching'),
                ...$(phase, ['gc12', 'c1', 'gc21', 'c2', 'root'], ticks, 'unbinding'),
                ...$(phase, ['root', 'c1', 'gc12', 'c2', 'gc21'], ticks, 'dispose'),
            ]);
            mgr.$dispose();
        });
        for (const [name, fallback] of [['fallback same as CE name', 'nf'], ['fallback different as CE name', 'not-found']]) {
            it(`fallback defined on root - single-level parent/child viewport - ${name}`, async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c1', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "C1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C1 = _classThis;
                })();
                let C2 = (() => {
                    let _classDecorators = [customElement({ name: 'c2', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "C2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C2 = _classThis;
                })();
                let P = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'c1', component: C1 },
                                { path: 'c2', component: C2 },
                            ],
                        }), customElement({ name: 'p', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var P = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "P");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        P = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return P = _classThis;
                })();
                let NF = (() => {
                    let _classDecorators = [customElement({ name: 'nf' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var NF = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "NF");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        NF = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return NF = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'p', component: P },
                                { path: fallback, component: NF },
                            ],
                            fallback,
                        }), customElement({ name: 'root', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [C1, C2, P, NF] /* , LogLevel.trace */);
                let phase = 'start';
                verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
                phase = 'phase1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p/unconfigured');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, ['p', 'nf'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached')]);
                // stop
                mgr.fullNotifyHistory.length = 0;
                phase = 'stop';
                await tearDown();
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['nf', 'p', 'root'], ticks, 'detaching'),
                    ...$(phase, ['nf', 'p', 'root'], ticks, 'unbinding'),
                    ...$(phase, ['root', 'p', 'nf'], ticks, 'dispose'),
                ]);
                mgr.$dispose();
            });
            it(`fallback defined on root but missing on some nodes on downstream - multi-level parent/child viewport - ${name}`, async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let GC1 = (() => {
                    let _classDecorators = [customElement({ name: 'gc1', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var GC1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "GC1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        GC1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return GC1 = _classThis;
                })();
                let GC21 = (() => {
                    let _classDecorators = [customElement({ name: 'gc21', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var GC21 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "GC21");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        GC21 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return GC21 = _classThis;
                })();
                let GC22 = (() => {
                    let _classDecorators = [customElement({ name: 'gc22', template: null })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var GC22 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "GC22");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        GC22 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return GC22 = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'gc1', component: GC1 },
                            ]
                        }), customElement({ name: 'c1', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "C1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C1 = _classThis;
                })();
                let C2 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'gc21', component: GC21 },
                                { path: 'gc22', component: GC22 },
                            ],
                            fallback: 'gc22'
                        }), customElement({ name: 'c2', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "C2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C2 = _classThis;
                })();
                let P = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'c1', component: C1 },
                                { path: 'c2', component: C2 },
                            ],
                        }), customElement({ name: 'p', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var P = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "P");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        P = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return P = _classThis;
                })();
                let NF = (() => {
                    let _classDecorators = [customElement({ name: 'nf' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var NF = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "NF");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        NF = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return NF = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'p', component: P },
                                { path: fallback, component: NF },
                            ],
                            fallback,
                        }), customElement({ name: 'root', template: vp(1) })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown } = await createFixture(Root, [GC1, GC21, GC22, C1, C2, P, NF] /* , LogLevel.trace */);
                let phase = 'start';
                verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, 'root', ticks, 'binding', 'bound', 'attaching', 'attached')]);
                phase = 'phase1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p/c1/unconfigured');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [...$(phase, ['p', 'c1', 'nf'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached')]);
                phase = 'phase2';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p/c2/unconfigured');
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['nf', 'c1'], ticks, 'canUnload'),
                    ...$(phase, 'c2', ticks, 'canLoad'),
                    ...$(phase, ['nf', 'c1'], ticks, 'unloading'),
                    ...$(phase, 'c2', ticks, 'loading'),
                    ...$(phase, ['nf', 'c1'], ticks, 'detaching'),
                    ...$(phase, ['nf', 'c1'], ticks, 'unbinding'),
                    ...$(phase, ['c1', 'nf'], ticks, 'dispose'),
                    ...$(phase, 'c2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, 'gc22', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // stop
                mgr.fullNotifyHistory.length = 0;
                phase = 'stop';
                await tearDown();
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc22', 'c2', 'p', 'root'], ticks, 'detaching'),
                    ...$(phase, ['gc22', 'c2', 'p', 'root'], ticks, 'unbinding'),
                    ...$(phase, ['root', 'p', 'c2', 'gc22'], ticks, 'dispose'),
                ]);
                mgr.$dispose();
            });
        }
    });
    describe('error recovery', function () {
        describe('from unconfigured route', function () {
            it('single level - single viewport', async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let A = (() => {
                    let _classDecorators = [customElement({ name: 'ce-a', template: 'a' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var A = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "A");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        A = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return A = _classThis;
                })();
                let B = (() => {
                    let _classDecorators = [customElement({ name: 'ce-b', template: 'b' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var B = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "B");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        B = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return B = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: ['', 'a'], component: A, title: 'A' },
                                { path: 'b', component: B, title: 'B' },
                            ]
                        }), customElement({
                            name: 'my-app',
                            template: `
        <a href="a"></a>
        <a href="b"></a>
        <a href="c"></a>
        <au-viewport></au-viewport>
        `
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown, host, platform } = await createFixture(Root, [A, B] /* , LogLevel.trace */);
                const queue = platform.domQueue;
                const [anchorA, anchorB, anchorC] = Array.from(host.querySelectorAll('a'));
                assert.html.textContent(host, 'a', 'load');
                let phase = 'round#1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                anchorC.click();
                await queue.yield();
                try {
                    await router['currentTr'].promise;
                    assert.fail('expected error');
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'a', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                phase = 'round#2';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                anchorB.click();
                await queue.yield();
                await router['currentTr'].promise; // actual wait is done here
                assert.html.textContent(host, 'b', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'ce-a', ticks, 'canUnload'),
                    ...$(phase, 'ce-b', ticks, 'canLoad'),
                    ...$(phase, 'ce-a', ticks, 'unloading'),
                    ...$(phase, 'ce-b', ticks, 'loading'),
                    ...$(phase, 'ce-a', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'ce-b', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                phase = 'round#3';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                anchorC.click();
                await queue.yield();
                try {
                    await router['currentTr'].promise;
                    assert.fail('expected error');
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'b', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                phase = 'round#4';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                anchorA.click();
                await queue.yield();
                await router['currentTr'].promise; // actual wait is done here
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'ce-b', ticks, 'canUnload'),
                    ...$(phase, 'ce-a', ticks, 'canLoad'),
                    ...$(phase, 'ce-b', ticks, 'unloading'),
                    ...$(phase, 'ce-a', ticks, 'loading'),
                    ...$(phase, 'ce-b', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'ce-a', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                phase = 'round#5';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('c');
                    assert.fail('expected error');
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'a', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                phase = 'round#6';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                anchorB.click();
                await router.load('b');
                assert.html.textContent(host, 'b', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'ce-a', ticks, 'canUnload'),
                    ...$(phase, 'ce-b', ticks, 'canLoad'),
                    ...$(phase, 'ce-a', ticks, 'unloading'),
                    ...$(phase, 'ce-b', ticks, 'loading'),
                    ...$(phase, 'ce-a', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'ce-b', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                await tearDown();
            });
            it('parent-child', async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let Gc11 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-11', template: 'gc-11' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc11 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc11");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc11 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc11 = _classThis;
                })();
                let Gc12 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-12', template: 'gc-12' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc12 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc12");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc12 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc12 = _classThis;
                })();
                let Gc21 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-21', template: 'gc-21' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc21 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc21");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc21 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc21 = _classThis;
                })();
                let Gc22 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-22', template: 'gc-22' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc22 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc22");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc22 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc22 = _classThis;
                })();
                let P1 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'gc-11', component: Gc11 },
                                { path: 'gc-12', component: Gc12 },
                            ]
                        }), customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var P1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "P1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        P1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return P1 = _classThis;
                })();
                let P2 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'gc-21', component: Gc21 },
                                { path: 'gc-22', component: Gc22 },
                            ]
                        }), customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var P2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "P2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        P2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return P2 = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'p1', component: P1 },
                                { path: 'p2', component: P2 },
                            ]
                        }), customElement({
                            name: 'my-app',
                            template: '<au-viewport></au-viewport>'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown, host, platform } = await createFixture(Root, [P1, Gc11] /* , LogLevel.trace */);
                const queue = platform.domQueue;
                // load p1/gc-11
                let phase = 'round#1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p1/gc-11');
                assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['p-1', 'gc-11'], ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load unconfigured
                phase = 'round#2';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('unconfigured');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                /**
                 * Justification:
                 * This is a single segment unrecognized path.
                 * After the failure with recognition, the previous instruction tree is queued again.
                 * As the previous path is a multi-segment path, in bottom up fashion, canUnload will be invoked,
                 * because at this point the knowledge about child node is not available, as it is the case for non-eager recognition.
                 * This explains the canUnload invocation.
                 * On the other hand, as this is a reentry without any mismatch of parameters, the reentry behavior is set to `none`,
                 * which avoids invoking further hooks.
                 */
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'gc-11', ticks, 'canUnload'),
                ]);
                // load p1/gc-12
                phase = 'round#3';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p1/gc-12');
                assert.html.textContent(host, 'p1 gc-12', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'gc-11', ticks, 'canUnload'),
                    ...$(phase, 'gc-12', ticks, 'canLoad'),
                    ...$(phase, 'gc-11', ticks, 'unloading'),
                    ...$(phase, 'gc-12', ticks, 'loading'),
                    ...$(phase, 'gc-11', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'gc-12', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load p1/unconfigured
                phase = 'round#4';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('p1/unconfigured');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'p1 gc-12', `${phase} - text`);
                /**
                 * Justification:
                 * This is a multi-segment path where the first segment is recognized (and the same one with the current route) but the next one is unrecognized.
                 * Thus, the after the first recognition, the `canUnload` hook is called on the previous child (gc-12).
                 * This explains the first `canUnload` invocation.
                 *
                 * Next, the error is thrown due to the unconfigured 2nd segment of the path.
                 * The rest is exactly same as the case explained for round#2, which explains the 2nd `canUnload` invocation as well as absence of other hook invocations.
                 */
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'gc-12', ticks, 'canUnload'),
                    ...$(phase, 'gc-12', ticks, 'canUnload'),
                ]);
                // load p1/gc-11
                phase = 'round#5';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p1/gc-11');
                assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 'gc-12', ticks, 'canUnload'),
                    ...$(phase, 'gc-11', ticks, 'canLoad'),
                    ...$(phase, 'gc-12', ticks, 'unloading'),
                    ...$(phase, 'gc-11', ticks, 'loading'),
                    ...$(phase, 'gc-12', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'gc-11', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load p2/unconfigured
                phase = 'round#6';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('p2/unconfigured');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                await queue.yield(); // wait a frame for the new transition as it is not the same promise
                assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'canUnload'),
                    ...$(phase, 'p-2', ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'unloading'),
                    ...$(phase, 'p-2', ticks, 'loading'),
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'detaching'),
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'unbinding'),
                    ...$(phase, ['p-1', 'gc-11'], ticks, 'dispose'),
                    ...$(phase, 'p-2', ticks, /* activation -> */ 'binding', 'bound', 'attaching', 'attached', /* deactivation -> */ 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 'p-1', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, 'gc-11', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load p2/gc-21
                phase = 'round#7';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('p2/gc-21');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'p2 gc-21', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'canUnload'),
                    ...$(phase, 'p-2', ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'unloading'),
                    ...$(phase, 'p-2', ticks, 'loading'),
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'detaching'),
                    ...$(phase, ['gc-11', 'p-1'], ticks, 'unbinding'),
                    ...$(phase, ['p-1', 'gc-11'], ticks, 'dispose'),
                    ...$(phase, 'p-2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, 'gc-21', ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                ]);
                await tearDown();
            });
            it('siblings', async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let S1 = (() => {
                    let _classDecorators = [customElement({ name: 's1', template: 's1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var S1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "S1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        S1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return S1 = _classThis;
                })();
                let S2 = (() => {
                    let _classDecorators = [customElement({ name: 's2', template: 's2' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var S2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "S2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        S2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return S2 = _classThis;
                })();
                let S3 = (() => {
                    let _classDecorators = [customElement({ name: 's3', template: 's3' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var S3 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "S3");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        S3 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return S3 = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 's1', component: S1 },
                                { path: 's2', component: S2 },
                                { path: 's3', component: S3 },
                            ]
                        }), customElement({ name: 'root', template: 'root <au-viewport name="$1"></au-viewport><au-viewport name="$2"></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, host, tearDown } = await createFixture(Root, [S1, S2, S3] /* , LogLevel.trace */);
                // load s1@$1+s2@$2
                let phase = 'round#1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('s1@$1+s2@$2');
                assert.html.textContent(host, 'root s1s2', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['s1', 's2'], ticks, 'canLoad'),
                    ...$(phase, ['s1', 's2'], ticks, 'loading'),
                    ...$(phase, ['s1', 's2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load s1@$1+unconfigured@$2
                phase = 'round#2';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('s1@$1+unconfigured@$2');
                    assert.fail('expected error');
                }
                catch (e) { /* noop */ }
                assert.html.textContent(host, 'root s1s2', `${phase} - text`);
                /**
                 * Justification: Because of the reentry behavior set to none (due to the fact the previous instruction tree is queued again), the hooks invocations are skipped.
                 */
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                // load s1@$1+s3@$2
                phase = 'round#3';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('s1@$1+s3@$2');
                assert.html.textContent(host, 'root s1s3', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, 's2', ticks, 'canUnload'),
                    ...$(phase, 's3', ticks, 'canLoad'),
                    ...$(phase, 's2', ticks, 'unloading'),
                    ...$(phase, 's3', ticks, 'loading'),
                    ...$(phase, 's2', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 's3', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load unconfigured@$1+s2@$2
                phase = 'round#4';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('unconfigured@$1+s2@$2');
                    assert.fail('expected error');
                }
                catch (e) { /* noop */ }
                assert.html.textContent(host, 'root s1s3', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                // load s3@$1+s2@$2
                phase = 'round#5';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('s3@$1+s2@$2');
                assert.html.textContent(host, 'root s3s2', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['s1', 's3'], ticks, 'canUnload'),
                    ...$(phase, ['s3', 's2'], ticks, 'canLoad'),
                    ...$(phase, ['s1', 's3'], ticks, 'unloading'),
                    ...$(phase, ['s3', 's2'], ticks, 'loading'),
                    ...$(phase, 's1', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 's3', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, 's3', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 's2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load unconfigured
                phase = 'round#6';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('unconfigured');
                    assert.fail('expected error');
                }
                catch (e) { /* noop */ }
                assert.html.textContent(host, 'root s3s2', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, []);
                // load s2@$1+s1@$2
                phase = 'round#7';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('s2@$1+s1@$2');
                assert.html.textContent(host, 'root s2s1', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['s3', 's2'], ticks, 'canUnload'),
                    ...$(phase, ['s2', 's1'], ticks, 'canLoad'),
                    ...$(phase, ['s3', 's2'], ticks, 'unloading'),
                    ...$(phase, ['s2', 's1'], ticks, 'loading'),
                    ...$(phase, 's3', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 's2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, 's2', ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, 's1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                await tearDown();
            });
            it('parentsiblings-childsiblings', async function () {
                const ticks = 0;
                const hookSpec = HookSpecs.create(ticks);
                let Gc11 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-11', template: 'gc-11' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc11 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc11");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc11 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc11 = _classThis;
                })();
                let Gc12 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-12', template: 'gc-12' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc12 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc12");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc12 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc12 = _classThis;
                })();
                let Gc13 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-13', template: 'gc-13' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc13 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc13");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc13 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc13 = _classThis;
                })();
                let Gc21 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-21', template: 'gc-21' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc21 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc21");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc21 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc21 = _classThis;
                })();
                let Gc22 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-22', template: 'gc-22' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc22 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc22");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc22 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc22 = _classThis;
                })();
                let Gc23 = (() => {
                    let _classDecorators = [customElement({ name: 'gc-23', template: 'gc-23' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Gc23 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Gc23");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Gc23 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Gc23 = _classThis;
                })();
                let P1 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'gc-11', component: Gc11 },
                                { path: 'gc-12', component: Gc12 },
                                { path: 'gc-13', component: Gc13 },
                            ]
                        }), customElement({ name: 'p-1', template: 'p1 <au-viewport name="$1"></au-viewport><au-viewport name="$2"></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var P1 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "P1");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        P1 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return P1 = _classThis;
                })();
                let P2 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'gc-21', component: Gc21 },
                                { path: 'gc-22', component: Gc22 },
                                { path: 'gc-23', component: Gc23 },
                            ]
                        }), customElement({ name: 'p-2', template: 'p2 <au-viewport name="$1"></au-viewport><au-viewport name="$2"></au-viewport>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var P2 = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "P2");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        P2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return P2 = _classThis;
                })();
                let Root = (() => {
                    let _classDecorators = [route({
                            routes: [
                                { path: 'p1', component: P1 },
                                { path: 'p2', component: P2 },
                            ]
                        }), customElement({
                            name: 'my-app',
                            template: '<au-viewport name="$1"></au-viewport> <au-viewport name="$2"></au-viewport>'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                    };
                    __setFunctionName(_classThis, "Root");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Root = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Root = _classThis;
                })();
                const { router, mgr, tearDown, host, platform } = await createFixture(Root, [P1, Gc11] /* , LogLevel.trace */);
                const queue = platform.domQueue;
                // load p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-22@$2)
                let phase = 'round#1';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-22@$2)');
                assert.html.textContent(host, 'p1 gc-11gc-12 p2 gc-21gc-22', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                    ...$(phase, ['p-1', 'p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load unconfigured
                phase = 'round#2';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('unconfigured');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                assert.html.textContent(host, 'p1 gc-11gc-12 p2 gc-21gc-22', `${phase} - text`);
                /**
                 * Justification:
                 * This is a single segment unrecognized path.
                 * After the failure with recognition, the previous instruction tree is queued again.
                 * As the previous path is a multi-segment path, in bottom up fashion, canUnload will be invoked,
                 * because at this point the knowledge about child node is not available, as it is the case for non-eager recognition.
                 * This explains the canUnload invocation.
                 * On the other hand, as this is a reentry without any mismatch of parameters, the reentry behavior is set to `none`,
                 * which avoids invoking further hooks.
                 */
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                ]);
                // load p2@$1/(gc-22@$1+gc-21@$2)+p1@$2/(gc-12@$1+gc-11@$2)
                phase = 'round#3';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p2@$1/(gc-22@$1+gc-21@$2)+p1@$2/(gc-12@$1+gc-11@$2)');
                assert.html.textContent(host, 'p2 gc-22gc-21 p1 gc-12gc-11', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22', 'p-1', 'p-2'], ticks, 'canUnload'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1', 'gc-21', 'gc-22', 'p-2'], ticks, 'unloading'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1'], ticks, 'detaching'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1'], ticks, 'unbinding'),
                    ...$(phase, ['p-1', 'gc-11', 'gc-12'], ticks, 'dispose'),
                    ...$(phase, 'p-2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching'),
                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'unbinding'),
                    ...$(phase, ['p-2', 'gc-21', 'gc-22'], ticks, 'dispose'),
                    ...$(phase, 'p-1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+unconfigured@$2)
                phase = 'round#4';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+unconfigured@$2)');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                await queue.yield(); // wait a frame for the new transition as it is not the same promise
                assert.html.textContent(host, 'p2 gc-22gc-21 p1 gc-12gc-11', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                    ...$(phase, 'p-1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                    ...$(phase, 'p-2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-22@$2)
                phase = 'round#5';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-22@$2)');
                assert.html.textContent(host, 'p1 gc-11gc-12 p2 gc-21gc-22', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                    ...$(phase, 'p-1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                    ...$(phase, 'p-2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                // load p2@$1/(gc-21@$1+gc-22@$2)+unconfigured@$2
                phase = 'round#6';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                try {
                    await router.load('p2@$1/(gc-21@$1+gc-22@$2)+unconfigured@$2');
                    assert.fail(`${phase} - expected error`);
                }
                catch { /* noop */ }
                await queue.yield(); // wait a frame for the new transition as it is not the same promise
                assert.html.textContent(host, 'p1 gc-11gc-12 p2 gc-21gc-22', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                ]);
                // load p2@$1/(gc-22@$1+gc-21@$2)+p1@$2/(gc-12@$1+gc-11@$2)
                phase = 'round#7';
                mgr.fullNotifyHistory.length = 0;
                mgr.setPrefix(phase);
                await router.load('p2@$1/(gc-22@$1+gc-21@$2)+p1@$2/(gc-12@$1+gc-11@$2)');
                assert.html.textContent(host, 'p2 gc-22gc-21 p1 gc-12gc-11', `${phase} - text`);
                verifyInvocationsEqual(mgr.fullNotifyHistory, [
                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22', 'p-1', 'p-2'], ticks, 'canUnload'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1', 'gc-21', 'gc-22', 'p-2'], ticks, 'unloading'),
                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1'], ticks, 'detaching'),
                    ...$(phase, ['gc-11', 'gc-12', 'p-1'], ticks, 'unbinding'),
                    ...$(phase, ['p-1', 'gc-11', 'gc-12'], ticks, 'dispose'),
                    ...$(phase, 'p-2', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching'),
                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'unbinding'),
                    ...$(phase, ['p-2', 'gc-21', 'gc-22'], ticks, 'dispose'),
                    ...$(phase, 'p-1', ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                ]);
                await tearDown();
            });
        });
        describe('from activation error thrown by routed VM hooks', function () {
            const ticks = 0;
            function click(anchor, queue) {
                anchor.click();
                return waitForQueuedTasks(queue);
            }
            function waitForQueuedTasks(queue) {
                queue.queueTask(() => Promise.resolve());
                return queue.yield();
            }
            describe('single level - single viewport', function () {
                function createCes(hook) {
                    const hookSpec = HookSpecs.create(ticks);
                    let A = (() => {
                        let _classDecorators = [route(['', 'a']), customElement({ name: 'ce-a', template: 'a' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var A = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "A");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            A = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return A = _classThis;
                    })();
                    let B = (() => {
                        let _classDecorators = [route('b'), customElement({ name: 'ce-b', template: 'b' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var B = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "B");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            B = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return B = _classThis;
                    })();
                    let C = (() => {
                        let _classDecorators = [route('c'), customElement({ name: 'ce-c', template: 'c' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var C = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            [hook](...args) {
                                return onResolve(super[hook](...args), () => {
                                    throw new Error(`Synthetic test error in ${hook}`);
                                });
                            }
                        };
                        __setFunctionName(_classThis, "C");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            C = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return C = _classThis;
                    })();
                    let Root = (() => {
                        let _classDecorators = [route({
                                routes: [A, B, C]
                            }), customElement({
                                name: 'my-app',
                                template: `
          <a href="a"></a>
          <a href="b"></a>
          <a href="c"></a>
          <au-viewport></au-viewport>
          `
                            })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Root = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Root");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Root = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Root = _classThis;
                    })();
                    return Root;
                }
                function* getTestData() {
                    yield [
                        'canLoad',
                        function getExpectedErrorLog(phase, current) {
                            return [
                                ...$(phase, current, ticks, 'canUnload'),
                                ...$(phase, 'ce-c', ticks, 'canLoad'),
                            ];
                        }
                    ];
                    yield [
                        'loading',
                        function getExpectedErrorLog(phase, current) {
                            return [
                                ...$(phase, current, ticks, 'canUnload'),
                                ...$(phase, 'ce-c', ticks, 'canLoad'),
                                ...$(phase, current, ticks, 'unloading'),
                                ...$(phase, 'ce-c', ticks, 'loading'),
                                ...$(phase, current, ticks, 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, 'ce-c', ticks, 'dispose'),
                                ...$(phase, current, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                            ];
                        }
                    ];
                    yield [
                        'binding',
                        function getExpectedErrorLog(phase, current) {
                            return [
                                ...$(phase, current, ticks, 'canUnload'),
                                ...$(phase, 'ce-c', ticks, 'canLoad'),
                                ...$(phase, current, ticks, 'unloading'),
                                ...$(phase, 'ce-c', ticks, 'loading'),
                                ...$(phase, current, ticks, 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, 'ce-c', ticks, 'binding', 'dispose'),
                                ...$(phase, current, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                            ];
                        }
                    ];
                    yield [
                        'bound',
                        function getExpectedErrorLog(phase, current) {
                            return [
                                ...$(phase, current, ticks, 'canUnload'),
                                ...$(phase, 'ce-c', ticks, 'canLoad'),
                                ...$(phase, current, ticks, 'unloading'),
                                ...$(phase, 'ce-c', ticks, 'loading'),
                                ...$(phase, current, ticks, 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, 'ce-c', ticks, 'binding', 'bound', 'unbinding', 'dispose'),
                                ...$(phase, current, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                            ];
                        }
                    ];
                    yield [
                        'attaching',
                        function getExpectedErrorLog(phase, current) {
                            return [
                                ...$(phase, current, ticks, 'canUnload'),
                                ...$(phase, 'ce-c', ticks, 'canLoad'),
                                ...$(phase, current, ticks, 'unloading'),
                                ...$(phase, 'ce-c', ticks, 'loading'),
                                ...$(phase, current, ticks, 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, 'ce-c', ticks, 'binding', 'bound', 'attaching', 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, current, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                            ];
                        }
                    ];
                    yield [
                        'attached',
                        function getExpectedErrorLog(phase, current) {
                            return [
                                ...$(phase, current, ticks, 'canUnload'),
                                ...$(phase, 'ce-c', ticks, 'canLoad'),
                                ...$(phase, current, ticks, 'unloading'),
                                ...$(phase, 'ce-c', ticks, 'loading'),
                                ...$(phase, current, ticks, 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, 'ce-c', ticks, 'binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding', 'dispose'),
                                ...$(phase, current, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                            ];
                        }
                    ];
                }
                for (const [hook, getExpectedErrorLog] of getTestData()) {
                    it(`error thrown from ${hook}`, async function () {
                        const { router, mgr, tearDown, host, platform } = await createFixture(createCes(hook));
                        const queue = platform.taskQueue;
                        const [anchorA, anchorB, anchorC] = Array.from(host.querySelectorAll('a'));
                        assert.html.textContent(host, 'a', 'load');
                        let phase = 'round#1';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(anchorC, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        assert.html.textContent(host, 'a', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'ce-a'));
                        phase = 'round#2';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(anchorB, queue);
                        await router['currentTr'].promise; // actual wait is done here
                        assert.html.textContent(host, 'b', `${phase} - text`);
                        phase = 'round#3';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(anchorC, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        assert.html.textContent(host, 'b', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'ce-b'));
                        phase = 'round#4';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(anchorA, queue);
                        await router['currentTr'].promise; // actual wait is done here
                        assert.html.textContent(host, 'a', `${phase} - text`);
                        phase = 'round#5';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        try {
                            await router.load('c');
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        assert.html.textContent(host, 'a', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'ce-a'));
                        phase = 'round#6';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await router.load('b');
                        assert.html.textContent(host, 'b', `${phase} - text`);
                        await tearDown();
                    });
                }
            });
            describe('parent-child', function () {
                function* getTestData() {
                    yield [
                        'canLoad',
                        function getExpectedErrorLog(phase, currentParent, currentChild, nextParent, nextChild) {
                            return currentParent === nextParent
                                ? [
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    // because the previous instruction is scheduled and the *unload hooks are called bottom-up
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                ]
                                : [
                                    ...$(phase, [currentChild, currentParent], ticks, 'canUnload'),
                                    ...$(phase, nextParent, ticks, 'canLoad'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unloading'),
                                    ...$(phase, nextParent, ticks, 'loading'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'detaching'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unbinding'),
                                    ...$(phase, [currentParent, currentChild], ticks, 'dispose'),
                                    ...$(phase, nextParent, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    ...$(phase, nextParent, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ];
                        }
                    ];
                    yield [
                        'loading',
                        function getExpectedErrorLog(phase, currentParent, currentChild, nextParent, nextChild) {
                            return currentParent === nextParent
                                ? [
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    ...$(phase, currentChild, ticks, 'unloading'),
                                    ...$(phase, nextChild, ticks, 'loading'),
                                    ...$(phase, currentChild, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextChild, ticks, 'dispose'),
                                    ...$(phase, currentParent, ticks, 'detaching', 'unbinding', 'dispose', 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ]
                                : [
                                    ...$(phase, [currentChild, currentParent], ticks, 'canUnload'),
                                    ...$(phase, nextParent, ticks, 'canLoad'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unloading'),
                                    ...$(phase, nextParent, ticks, 'loading'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'detaching'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unbinding'),
                                    ...$(phase, [currentParent, currentChild], ticks, 'dispose'),
                                    ...$(phase, nextParent, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, nextChild, ticks, 'canLoad', 'loading', 'dispose'),
                                    ...$(phase, nextParent, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ];
                        }
                    ];
                    yield [
                        'binding',
                        function getExpectedErrorLog(phase, currentParent, currentChild, nextParent, nextChild) {
                            return currentParent === nextParent
                                ? [
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    ...$(phase, currentChild, ticks, 'unloading'),
                                    ...$(phase, nextChild, ticks, 'loading'),
                                    ...$(phase, currentChild, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextChild, ticks, 'binding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'detaching', 'unbinding', 'dispose', 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ]
                                : [
                                    ...$(phase, [currentChild, currentParent], ticks, 'canUnload'),
                                    ...$(phase, nextParent, ticks, 'canLoad'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unloading'),
                                    ...$(phase, nextParent, ticks, 'loading'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'detaching'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unbinding'),
                                    ...$(phase, [currentParent, currentChild], ticks, 'dispose'),
                                    ...$(phase, nextParent, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, nextChild, ticks, 'canLoad', 'loading', 'binding', 'dispose'),
                                    ...$(phase, nextParent, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ];
                        }
                    ];
                    yield [
                        'bound',
                        function getExpectedErrorLog(phase, currentParent, currentChild, nextParent, nextChild) {
                            return currentParent === nextParent
                                ? [
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    ...$(phase, currentChild, ticks, 'unloading'),
                                    ...$(phase, nextChild, ticks, 'loading'),
                                    ...$(phase, currentChild, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextChild, ticks, 'binding', 'bound', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'detaching', 'unbinding', 'dispose', 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ]
                                : [
                                    ...$(phase, [currentChild, currentParent], ticks, 'canUnload'),
                                    ...$(phase, nextParent, ticks, 'canLoad'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unloading'),
                                    ...$(phase, nextParent, ticks, 'loading'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'detaching'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unbinding'),
                                    ...$(phase, [currentParent, currentChild], ticks, 'dispose'),
                                    ...$(phase, nextParent, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, nextChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'unbinding', 'dispose'),
                                    ...$(phase, nextParent, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ];
                        }
                    ];
                    yield [
                        'attaching',
                        function getExpectedErrorLog(phase, currentParent, currentChild, nextParent, nextChild) {
                            return currentParent === nextParent
                                ? [
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    ...$(phase, currentChild, ticks, 'unloading'),
                                    ...$(phase, nextChild, ticks, 'loading'),
                                    ...$(phase, currentChild, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextChild, ticks, 'binding', 'bound', 'attaching', 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'detaching', 'unbinding', 'dispose', 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ]
                                : [
                                    ...$(phase, [currentChild, currentParent], ticks, 'canUnload'),
                                    ...$(phase, nextParent, ticks, 'canLoad'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unloading'),
                                    ...$(phase, nextParent, ticks, 'loading'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'detaching'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unbinding'),
                                    ...$(phase, [currentParent, currentChild], ticks, 'dispose'),
                                    ...$(phase, nextParent, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, nextChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextParent, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ];
                        }
                    ];
                    yield [
                        'attached',
                        function getExpectedErrorLog(phase, currentParent, currentChild, nextParent, nextChild) {
                            return currentParent === nextParent
                                ? [
                                    ...$(phase, currentChild, ticks, 'canUnload'),
                                    ...$(phase, nextChild, ticks, 'canLoad'),
                                    ...$(phase, currentChild, ticks, 'unloading'),
                                    ...$(phase, nextChild, ticks, 'loading'),
                                    ...$(phase, currentChild, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextChild, ticks, 'binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'detaching', 'unbinding', 'dispose', 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ]
                                : [
                                    ...$(phase, [currentChild, currentParent], ticks, 'canUnload'),
                                    ...$(phase, nextParent, ticks, 'canLoad'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unloading'),
                                    ...$(phase, nextParent, ticks, 'loading'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'detaching'),
                                    ...$(phase, [currentChild, currentParent], ticks, 'unbinding'),
                                    ...$(phase, [currentParent, currentChild], ticks, 'dispose'),
                                    ...$(phase, nextParent, ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, nextChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, nextParent, ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, currentParent, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, currentChild, ticks, 'canLoad', 'loading', 'binding', 'bound', 'attaching', 'attached'),
                                ];
                        }
                    ];
                }
                for (const [hook, getExpectedErrorLog] of getTestData()) {
                    it(`error thrown from ${hook} - root`, async function () {
                        const hookSpec = HookSpecs.create(ticks);
                        let Gc11 = (() => {
                            let _classDecorators = [route(['', 'gc-11']), customElement({ name: 'gc-11', template: 'gc-11' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc11 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc11");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc11 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc11 = _classThis;
                        })();
                        let Gc12 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-12', template: 'gc-12' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc12 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc12");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc12 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc12 = _classThis;
                        })();
                        let Gc13 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-13', template: 'gc-13' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc13 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                                [hook](...args) {
                                    return onResolve(super[hook].apply(this, args), () => {
                                        throw new Error(`Synthetic test error in ${hook}`);
                                    });
                                }
                            };
                            __setFunctionName(_classThis, "Gc13");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc13 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc13 = _classThis;
                        })();
                        let Gc21 = (() => {
                            let _classDecorators = [route(['', 'gc-21']), customElement({ name: 'gc-21', template: 'gc-21' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc21 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc21");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc21 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc21 = _classThis;
                        })();
                        let Gc22 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-22', template: 'gc-22' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc22 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc22");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc22 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc22 = _classThis;
                        })();
                        let Gc23 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-23', template: 'gc-23' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc23 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                                [hook](...args) {
                                    return onResolve(super[hook].apply(this, args), () => {
                                        throw new Error(`Synthetic test error in ${hook}`);
                                    });
                                }
                            };
                            __setFunctionName(_classThis, "Gc23");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc23 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc23 = _classThis;
                        })();
                        let P1 = (() => {
                            let _classDecorators = [route({
                                    path: ['', 'p1'],
                                    routes: [Gc11, Gc12, Gc13]
                                }), customElement({ name: 'p-1', template: `p1 <au-viewport></au-viewport>` })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var P1 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "P1");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                P1 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return P1 = _classThis;
                        })();
                        let P2 = (() => {
                            let _classDecorators = [route({
                                    path: 'p2',
                                    routes: [Gc21, Gc22, Gc23]
                                }), customElement({ name: 'p-2', template: `p2 <au-viewport></au-viewport>` })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var P2 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "P2");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                P2 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return P2 = _classThis;
                        })();
                        let Root = (() => {
                            let _classDecorators = [route({
                                    routes: [P1, P2]
                                }), customElement({
                                    name: 'my-app',
                                    template: `
            <a href="p1/gc-11"></a>
            <a href="p1/gc-12"></a>
            <a href="p1/gc-13"></a>
            <a href="p2/gc-21"></a>
            <a href="p2/gc-22"></a>
            <a href="p2/gc-23"></a>
            <au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Root = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Root");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Root = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Root = _classThis;
                        })();
                        const { router, mgr, tearDown, host, platform } = await createFixture(Root);
                        const [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        const queue = platform.taskQueue;
                        assert.html.textContent(host, 'p1 gc-11', `start - text`);
                        // p1/gc-11 -> p1/gc-13 -> p1/gc-11 (restored)
                        let phase = 'round#1';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(p1gc13, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-1', 'gc-11', 'p-1', 'gc-13'));
                        // p1/gc-11 -> p1/gc-12
                        phase = 'round#2';
                        await click(p1gc12, queue);
                        assert.html.textContent(host, 'p1 gc-12', `${phase} - text`);
                        // p1/gc-12 -> p2/gc-22
                        phase = 'round#3';
                        await click(p2gc22, queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        // p2/gc-22 -> p2/gc-23 -> p2/gc-22 (restored)
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#4');
                        await click(p2gc23, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-2', 'gc-23'));
                        // p2/gc-22 -> p1/gc-13 -> p2/gc-22 (restored)
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#5');
                        await click(p1gc13, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-1', 'gc-13'));
                        // the router's load API yields the same result
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#6');
                        try {
                            await router.load('p1/gc-13');
                            assert.fail('expected error');
                        }
                        catch (ex) {
                            /* noop */
                        }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-1', 'gc-13'));
                        await tearDown();
                    });
                    it(`error thrown from ${hook} - child`, async function () {
                        const hookSpec = HookSpecs.create(ticks);
                        let Gc11 = (() => {
                            let _classDecorators = [route(['', 'gc-11']), customElement({ name: 'gc-11', template: 'gc-11' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc11 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc11");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc11 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc11 = _classThis;
                        })();
                        let Gc12 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-12', template: 'gc-12' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc12 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc12");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc12 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc12 = _classThis;
                        })();
                        let Gc13 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-13', template: 'gc-13' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc13 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                                [hook](...args) {
                                    return onResolve(super[hook].apply(this, args), () => {
                                        throw new Error(`Synthetic test error in ${hook}`);
                                    });
                                }
                            };
                            __setFunctionName(_classThis, "Gc13");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc13 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc13 = _classThis;
                        })();
                        let Gc21 = (() => {
                            let _classDecorators = [route(['', 'gc-21']), customElement({ name: 'gc-21', template: 'gc-21' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc21 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc21");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc21 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc21 = _classThis;
                        })();
                        let Gc22 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-22', template: 'gc-22' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc22 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc22");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc22 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc22 = _classThis;
                        })();
                        let Gc23 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-23', template: 'gc-23' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc23 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                                [hook](...args) {
                                    return onResolve(super[hook].apply(this, args), () => {
                                        throw new Error(`Synthetic test error in ${hook}`);
                                    });
                                }
                            };
                            __setFunctionName(_classThis, "Gc23");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc23 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc23 = _classThis;
                        })();
                        let P1 = (() => {
                            let _classDecorators = [route({
                                    path: ['', 'p1'],
                                    routes: [Gc11, Gc12, Gc13]
                                }), customElement({
                                    name: 'p-1', template: `
            <a href="gc-11"></a>
            <a href="gc-12"></a>
            <a href="gc-13"></a>
            <a href="../p2/gc-21"></a>
            <a href="../p2/gc-22"></a>
            <a href="../p2/gc-23"></a>
            p1
            <au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var P1 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "P1");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                P1 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return P1 = _classThis;
                        })();
                        let P2 = (() => {
                            let _classDecorators = [route({
                                    path: 'p2',
                                    routes: [Gc21, Gc22, Gc23]
                                }), customElement({
                                    name: 'p-2', template: `
            <a href="../p1/gc-11"></a>
            <a href="../p1/gc-12"></a>
            <a href="../p1/gc-13"></a>
            <a href="gc-21"></a>
            <a href="gc-22"></a>
            <a href="gc-23"></a>
            p2 <au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var P2 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "P2");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                P2 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return P2 = _classThis;
                        })();
                        let Root = (() => {
                            let _classDecorators = [route({
                                    routes: [P1, P2]
                                }), customElement({
                                    name: 'my-app',
                                    template: `<au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Root = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Root");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Root = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Root = _classThis;
                        })();
                        const { router, mgr, tearDown, host, platform } = await createFixture(Root);
                        let [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        const queue = platform.taskQueue;
                        assert.html.textContent(host, 'p1 gc-11', `start - text`);
                        // p1/gc-11 -> p1/gc-13 -> p1/gc-11 (restored)
                        let phase = 'round#1';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(p1gc13, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-1', 'gc-11', 'p-1', 'gc-13'));
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p1/gc-11 -> p1/gc-12
                        phase = 'round#2';
                        await click(p1gc12, queue);
                        assert.html.textContent(host, 'p1 gc-12', `${phase} - text`);
                        // p1/gc-12 -> p2/gc-22
                        phase = 'round#3';
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        await click(p2gc22, queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p2/gc-22 -> p2/gc-23 -> p2/gc-22 (restored)
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#4');
                        await click(p2gc23, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-2', 'gc-23'));
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p2/gc-22 -> p1/gc-13 -> p2/gc-22 (restored)
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#5');
                        await click(p1gc13, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-1', 'gc-13'));
                        await tearDown();
                    });
                    it(`error thrown from ${hook} - grand-child`, async function () {
                        const hookSpec = HookSpecs.create(ticks);
                        let Gc11 = (() => {
                            let _classDecorators = [route(['', 'gc-11']), customElement({
                                    name: 'gc-11', template: `
            <a href="../gc-11"></a>
            <a href="../gc-12"></a>
            <a href="../gc-13"></a>
            <a href="../../p2/gc-21"></a>
            <a href="../../p2/gc-22"></a>
            <a href="../../p2/gc-23"></a>
            gc-11`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc11 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc11");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc11 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc11 = _classThis;
                        })();
                        let Gc12 = (() => {
                            let _classDecorators = [customElement({
                                    name: 'gc-12', template: `
            <a href="../gc-11"></a>
            <a href="../gc-12"></a>
            <a href="../gc-13"></a>
            <a href="../../p2/gc-21"></a>
            <a href="../../p2/gc-22"></a>
            <a href="../../p2/gc-23"></a>
            gc-12`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc12 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc12");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc12 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc12 = _classThis;
                        })();
                        let Gc13 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-13', template: 'gc-13' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc13 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                                [hook](...args) {
                                    return onResolve(super[hook].apply(this, args), () => {
                                        throw new Error(`Synthetic test error in ${hook}`);
                                    });
                                }
                            };
                            __setFunctionName(_classThis, "Gc13");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc13 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc13 = _classThis;
                        })();
                        let Gc21 = (() => {
                            let _classDecorators = [route(['', 'gc-21']), customElement({
                                    name: 'gc-21', template: `
            <a href="../../p1/gc-11"></a>
            <a href="../../p1/gc-12"></a>
            <a href="../../p1/gc-13"></a>
            <a href="../gc-21"></a>
            <a href="../gc-22"></a>
            <a href="../gc-23"></a>
            gc-21`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc21 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc21");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc21 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc21 = _classThis;
                        })();
                        let Gc22 = (() => {
                            let _classDecorators = [customElement({
                                    name: 'gc-22', template: `
            <a href="../../p1/gc-11"></a>
            <a href="../../p1/gc-12"></a>
            <a href="../../p1/gc-13"></a>
            <a href="../gc-21"></a>
            <a href="../gc-22"></a>
            <a href="../gc-23"></a>
            gc-22`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc22 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Gc22");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc22 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc22 = _classThis;
                        })();
                        let Gc23 = (() => {
                            let _classDecorators = [customElement({ name: 'gc-23', template: 'gc-23' })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Gc23 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                                [hook](...args) {
                                    return onResolve(super[hook].apply(this, args), () => {
                                        throw new Error(`Synthetic test error in ${hook}`);
                                    });
                                }
                            };
                            __setFunctionName(_classThis, "Gc23");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Gc23 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Gc23 = _classThis;
                        })();
                        let P1 = (() => {
                            let _classDecorators = [route({
                                    path: ['', 'p1'],
                                    routes: [Gc11, Gc12, Gc13]
                                }), customElement({
                                    name: 'p-1', template: `
            p1
            <au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var P1 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "P1");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                P1 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return P1 = _classThis;
                        })();
                        let P2 = (() => {
                            let _classDecorators = [route({
                                    path: 'p2',
                                    routes: [Gc21, Gc22, Gc23]
                                }), customElement({
                                    name: 'p-2', template: `
            p2 <au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var P2 = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "P2");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                P2 = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return P2 = _classThis;
                        })();
                        let Root = (() => {
                            let _classDecorators = [route({
                                    routes: [P1, P2]
                                }), customElement({
                                    name: 'my-app',
                                    template: `<au-viewport></au-viewport>`
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            let _classSuper = TestVM;
                            var Root = _classThis = class extends _classSuper {
                                constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            };
                            __setFunctionName(_classThis, "Root");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Root = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Root = _classThis;
                        })();
                        const { router, mgr, tearDown, host, platform } = await createFixture(Root);
                        let [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        const queue = platform.taskQueue;
                        assert.html.textContent(host, 'p1 gc-11', `start - text`);
                        // p1/gc-11 -> p1/gc-13 -> p1/gc-11 (restored)
                        let phase = 'round#1';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(p1gc13, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p1 gc-11', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-1', 'gc-11', 'p-1', 'gc-13'));
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p1/gc-11 -> p1/gc-12
                        phase = 'round#2';
                        await click(p1gc12, queue);
                        assert.html.textContent(host, 'p1 gc-12', `${phase} - text`);
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p1/gc-12 -> p2/gc-22
                        phase = 'round#3';
                        await click(p2gc22, queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p2/gc-22 -> p2/gc-23 -> p2/gc-22 (restored)
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#4');
                        await click(p2gc23, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-2', 'gc-23'));
                        [_p1gc11, p1gc12, p1gc13, _p2gc21, p2gc22, p2gc23] = Array.from(host.querySelectorAll('a'));
                        // p2/gc-22 -> p1/gc-13 -> p2/gc-22 (restored)
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase = 'round#5');
                        await click(p1gc13, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase, 'p-2', 'gc-22', 'p-1', 'gc-13'));
                        await tearDown();
                    });
                }
            });
            describe('siblings', function () {
                function createCes(hook) {
                    const hookSpec = HookSpecs.create(ticks);
                    let A = (() => {
                        let _classDecorators = [route('a'), customElement({ name: 'ce-a', template: 'a' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var A = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "A");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            A = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return A = _classThis;
                    })();
                    let B = (() => {
                        let _classDecorators = [route('b'), customElement({ name: 'ce-b', template: 'b' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var B = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "B");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            B = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return B = _classThis;
                    })();
                    let C = (() => {
                        let _classDecorators = [route('c'), customElement({ name: 'ce-c', template: 'c' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var C = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            [hook](...args) {
                                return onResolve(super[hook](...args), () => {
                                    throw new Error(`Synthetic test error in ${hook}`);
                                });
                            }
                        };
                        __setFunctionName(_classThis, "C");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            C = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return C = _classThis;
                    })();
                    let Root = (() => {
                        let _classDecorators = [route({
                                routes: [A, B, C]
                            }), customElement({
                                name: 'my-app',
                                template: `
            <a href="a+b"></a>
            <a href="a+c"></a>
            <a href="b+a"></a>
            <a href="c+b"></a>
            <au-viewport name="$1"></au-viewport><au-viewport name="$2"></au-viewport>`
                            })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Root = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Root");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Root = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Root = _classThis;
                    })();
                    return Root;
                }
                function* getTestData() {
                    yield [
                        'canLoad',
                        function getExpectedErrorLog(phase) {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['ce-b'], ticks, 'canUnload'),
                                    ...$(phase, ['ce-c'], ticks, 'canLoad'),
                                ];
                                case 'round#4':
                                    return [
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canUnload'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'canLoad'),
                                    ];
                            }
                        }
                    ];
                    yield [
                        'loading',
                        function getExpectedErrorLog(phase) {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['ce-b'], ticks, 'canUnload'),
                                    ...$(phase, ['ce-c'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-b'], ticks, 'unloading'),
                                    ...$(phase, ['ce-c'], ticks, 'loading'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'dispose'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'loading'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4':
                                    return [
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canUnload'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'unloading'),
                                        ...$(phase, ['ce-c'], ticks, 'loading'),
                                        ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-c'], ticks, 'dispose'),
                                        ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'loading'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ];
                            }
                        }
                    ];
                    yield [
                        'binding',
                        function getExpectedErrorLog(phase) {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['ce-b'], ticks, 'canUnload'),
                                    ...$(phase, ['ce-c'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-b'], ticks, 'unloading'),
                                    ...$(phase, ['ce-c'], ticks, 'loading'),
                                    ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'binding'),
                                    ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'dispose'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'loading'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4':
                                    return [
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canUnload'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'unloading'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'loading'),
                                        ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-c'], ticks, 'binding', 'dispose'),
                                        ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-b'], ticks, 'dispose'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'loading'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ];
                            }
                        }
                    ];
                    yield [
                        'bound',
                        function getExpectedErrorLog(phase) {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['ce-b'], ticks, 'canUnload'),
                                    ...$(phase, ['ce-c'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-b'], ticks, 'unloading'),
                                    ...$(phase, ['ce-c'], ticks, 'loading'),
                                    ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'binding', 'bound'),
                                    ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'loading'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4':
                                    return [
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canUnload'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'unloading'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'loading'),
                                        ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-c'], ticks, 'binding', 'bound', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-b'], ticks, 'dispose'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'loading'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ];
                            }
                        }
                    ];
                    yield [
                        'attaching',
                        function getExpectedErrorLog(phase) {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['ce-b'], ticks, 'canUnload'),
                                    ...$(phase, ['ce-c'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-b'], ticks, 'unloading'),
                                    ...$(phase, ['ce-c'], ticks, 'loading'),
                                    ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'binding', 'bound', 'attaching'),
                                    ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'loading'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4':
                                    return [
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canUnload'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'unloading'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'loading'),
                                        ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-c'], ticks, 'binding', 'bound', 'attaching', 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-b'], ticks, 'dispose'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'loading'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ];
                            }
                        }
                    ];
                    yield [
                        'attached',
                        function getExpectedErrorLog(phase) {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['ce-b'], ticks, 'canUnload'),
                                    ...$(phase, ['ce-c'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-b'], ticks, 'unloading'),
                                    ...$(phase, ['ce-c'], ticks, 'loading'),
                                    ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-c'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'canLoad'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'loading'),
                                    ...$(phase, ['ce-a', 'ce-b'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4':
                                    return [
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canUnload'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'unloading'),
                                        ...$(phase, ['ce-c', 'ce-b'], ticks, 'loading'),
                                        ...$(phase, ['ce-b'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-c'], ticks, 'binding', 'bound', 'attaching', 'attached', 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-a'], ticks, 'detaching', 'unbinding', 'dispose'),
                                        ...$(phase, ['ce-b'], ticks, 'dispose'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'canLoad'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'loading'),
                                        ...$(phase, ['ce-b', 'ce-a'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ];
                            }
                        }
                    ];
                }
                for (const [hook, getExpectedErrorLog] of getTestData()) {
                    it(`error thrown from ${hook}`, async function () {
                        const { router, mgr, tearDown, host, platform } = await createFixture(createCes(hook));
                        const queue = platform.taskQueue;
                        const [ab, ac, ba, cb] = Array.from(host.querySelectorAll('a'));
                        let phase = 'round#1';
                        await click(ab, queue);
                        assert.html.textContent(host, 'ab', `${phase} - text`);
                        phase = 'round#2';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(ac, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        assert.html.textContent(host, 'ab', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase));
                        phase = 'round#3';
                        await click(ba, queue);
                        assert.html.textContent(host, 'ba', `${phase} - text`);
                        phase = 'round#4';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        await click(cb, queue);
                        try {
                            await router['currentTr'].promise;
                            assert.fail('expected error');
                        }
                        catch { /* noop */ }
                        assert.html.textContent(host, 'ba', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase));
                        await tearDown();
                    });
                }
            });
            describe('parentsiblings-childsiblings', function () {
                function createCes(hook) {
                    const hookSpec = HookSpecs.create(ticks);
                    let Gc11 = (() => {
                        let _classDecorators = [customElement({ name: 'gc-11', template: 'gc-11' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Gc11 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Gc11");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Gc11 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Gc11 = _classThis;
                    })();
                    let Gc12 = (() => {
                        let _classDecorators = [customElement({ name: 'gc-12', template: 'gc-12' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Gc12 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Gc12");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Gc12 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Gc12 = _classThis;
                    })();
                    let Gc13 = (() => {
                        let _classDecorators = [customElement({ name: 'gc-13', template: 'gc-13' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Gc13 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            [hook](...args) {
                                return onResolve(super[hook](...args), () => {
                                    throw new Error(`Synthetic test error in ${hook}`);
                                });
                            }
                        };
                        __setFunctionName(_classThis, "Gc13");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Gc13 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Gc13 = _classThis;
                    })();
                    let Gc21 = (() => {
                        let _classDecorators = [customElement({ name: 'gc-21', template: 'gc-21' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Gc21 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Gc21");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Gc21 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Gc21 = _classThis;
                    })();
                    let Gc22 = (() => {
                        let _classDecorators = [customElement({ name: 'gc-22', template: 'gc-22' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Gc22 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Gc22");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Gc22 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Gc22 = _classThis;
                    })();
                    let Gc23 = (() => {
                        let _classDecorators = [customElement({ name: 'gc-23', template: 'gc-23' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Gc23 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                            [hook](...args) {
                                return onResolve(super[hook](...args), () => {
                                    throw new Error(`Synthetic test error in ${hook}`);
                                });
                            }
                        };
                        __setFunctionName(_classThis, "Gc23");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Gc23 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Gc23 = _classThis;
                    })();
                    let P1 = (() => {
                        let _classDecorators = [route({
                                routes: [
                                    { path: 'gc-11', component: Gc11 },
                                    { path: 'gc-12', component: Gc12 },
                                    { path: 'gc-13', component: Gc13 },
                                ]
                            }), customElement({ name: 'p-1', template: 'p1 <au-viewport name="$1"></au-viewport><au-viewport name="$2"></au-viewport>' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var P1 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "P1");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            P1 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return P1 = _classThis;
                    })();
                    let P2 = (() => {
                        let _classDecorators = [route({
                                routes: [
                                    { path: 'gc-21', component: Gc21 },
                                    { path: 'gc-22', component: Gc22 },
                                    { path: 'gc-23', component: Gc23 },
                                ]
                            }), customElement({ name: 'p-2', template: 'p2 <au-viewport name="$1"></au-viewport><au-viewport name="$2"></au-viewport>' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var P2 = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "P2");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            P2 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return P2 = _classThis;
                    })();
                    let Root = (() => {
                        let _classDecorators = [route({
                                routes: [
                                    { path: 'p1', component: P1 },
                                    { path: 'p2', component: P2 },
                                ]
                            }), customElement({
                                name: 'my-app',
                                template: '<au-viewport name="$1"></au-viewport> <au-viewport name="$2"></au-viewport>'
                            })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _classSuper = TestVM;
                        var Root = _classThis = class extends _classSuper {
                            constructor() { super(resolve(INotifierManager), resolve(IPlatform), hookSpec); }
                        };
                        __setFunctionName(_classThis, "Root");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Root = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Root = _classThis;
                    })();
                    return Root;
                }
                function* getTestData() {
                    yield [
                        'canLoad',
                        (phase) => {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                                    ...$(phase, ['gc-13'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12'], ticks, 'canUnload'),
                                ];
                                case 'round#4': return [
                                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    // dispose the old stuffs
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    // start loading new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'canLoad'), // <-- this is the error
                                    // dispose the new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load the old stuffs
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                            }
                        }
                    ];
                    yield [
                        'loading',
                        (phase) => {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                                    ...$(phase, ['gc-13'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12'], ticks, 'unloading'),
                                    ...$(phase, ['gc-13'], ticks, 'loading'), // <-- this is the error
                                    // dispose old stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load old stuffs
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4': return [
                                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    // dispose the old stuffs
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    // start loading new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'loading'), // <-- this is the error
                                    // dispose the new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load the old stuffs
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                            }
                        }
                    ];
                    yield [
                        'binding',
                        (phase) => {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                                    ...$(phase, ['gc-13'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12'], ticks, 'unloading'),
                                    ...$(phase, ['gc-13'], ticks, 'loading'),
                                    ...$(phase, ['gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'binding'), // <-- this is the error
                                    // dispose old stuffs
                                    ...$(phase, ['gc-11'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load old stuffs
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4': return [
                                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    // dispose the old stuffs
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    // start loading new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'loading'),
                                    ...$(phase, ['gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-23'], ticks, 'binding'), // <- this is the error
                                    // dispose the new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-23'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load the old stuffs
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                            }
                        }
                    ];
                    yield [
                        'bound',
                        (phase) => {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                                    ...$(phase, ['gc-13'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12'], ticks, 'unloading'),
                                    ...$(phase, ['gc-13'], ticks, 'loading'),
                                    ...$(phase, ['gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'binding', 'bound'), // <-- this is the error
                                    // dispose old stuffs
                                    ...$(phase, ['gc-11'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'unbinding', 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load old stuffs
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4': return [
                                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    // dispose the old stuffs
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    // start loading new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'loading'),
                                    ...$(phase, ['gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-23'], ticks, 'binding', 'bound'), // <- this is the error
                                    // dispose the new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-23'], ticks, 'unbinding', 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load the old stuffs
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                            }
                        }
                    ];
                    yield [
                        'attaching',
                        (phase) => {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                                    ...$(phase, ['gc-13'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12'], ticks, 'unloading'),
                                    ...$(phase, ['gc-13'], ticks, 'loading'),
                                    ...$(phase, ['gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'binding', 'bound', 'attaching'), // <-- this is the error
                                    // dispose old stuffs
                                    ...$(phase, ['gc-11', 'gc-13', 'p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load old stuffs
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4': return [
                                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    // dispose the old stuffs
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    // start loading new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'loading'),
                                    ...$(phase, ['gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-23'], ticks, 'binding', 'bound', 'attaching'), // <- this is the error
                                    // dispose the new stuffs
                                    ...$(phase, ['gc-11', 'gc-12', 'p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-23', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load the old stuffs
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                            }
                        }
                    ];
                    yield [
                        'attached',
                        (phase) => {
                            switch (phase) {
                                case 'round#2': return [
                                    ...$(phase, ['gc-11', 'gc-12', 'gc-21', 'gc-22'], ticks, 'canUnload'),
                                    ...$(phase, ['gc-13'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12'], ticks, 'unloading'),
                                    ...$(phase, ['gc-13'], ticks, 'loading'),
                                    ...$(phase, ['gc-12'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-13'], ticks, 'binding', 'bound', 'attaching', 'attached'), // <-- this is the error
                                    // dispose old stuffs
                                    ...$(phase, ['gc-11', 'gc-13', 'p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-22', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load old stuffs
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'loading'),
                                    ...$(phase, ['gc-21', 'gc-22'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                                case 'round#4': return [
                                    ...$(phase, ['gc-22', 'gc-21', 'gc-12', 'gc-11', 'p-2', 'p-1'], ticks, 'canUnload'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2', 'gc-12', 'gc-11', 'p-1'], ticks, 'unloading'),
                                    ...$(phase, ['p-1', 'p-2'], ticks, 'loading'),
                                    // dispose the old stuffs
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'detaching'),
                                    ...$(phase, ['gc-22', 'gc-21', 'p-2'], ticks, 'unbinding'),
                                    ...$(phase, ['p-2', 'gc-22', 'gc-21'], ticks, 'dispose'),
                                    ...$(phase, ['p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'detaching'),
                                    ...$(phase, ['gc-12', 'gc-11', 'p-1'], ticks, 'unbinding'),
                                    ...$(phase, ['p-1', 'gc-12', 'gc-11'], ticks, 'dispose'),
                                    ...$(phase, ['p-2'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    // start loading new stuffs
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'loading'),
                                    ...$(phase, ['gc-11', 'gc-12'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'loading'),
                                    ...$(phase, ['gc-21', 'gc-23'], ticks, 'binding', 'bound', 'attaching', 'attached'), // <- this is the error
                                    // dispose the new stuffs
                                    ...$(phase, ['gc-11', 'gc-12', 'p-1'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    ...$(phase, ['gc-21', 'gc-23', 'p-2'], ticks, 'detaching', 'unbinding', 'dispose'),
                                    // load the old stuffs
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'canLoad'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'loading'),
                                    ...$(phase, ['p-2', 'p-1'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'loading'),
                                    ...$(phase, ['gc-22', 'gc-21'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'canLoad'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'loading'),
                                    ...$(phase, ['gc-12', 'gc-11'], ticks, 'binding', 'bound', 'attaching', 'attached'),
                                ];
                            }
                        }
                    ];
                }
                for (const [hook, getExpectedErrorLog] of getTestData()) {
                    it(`error thrown from ${hook}`, async function () {
                        const { router, mgr, tearDown, host, platform } = await createFixture(createCes(hook));
                        const queue = platform.taskQueue;
                        // load p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-22@$2)
                        let phase = 'round#1';
                        await router.load('p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-22@$2)');
                        assert.html.textContent(host, 'p1 gc-11gc-12 p2 gc-21gc-22', `${phase} - text`);
                        // load p1@$1/(gc-11@$1+gc-13@$2)+p2@$2/(gc-21@$1+gc-22@$2)
                        phase = 'round#2';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        try {
                            await router.load('p1@$1/(gc-11@$1+gc-13@$2)+p2@$2/(gc-21@$1+gc-22@$2)');
                            assert.fail(`${phase} - expected error`);
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p1 gc-11gc-12 p2 gc-21gc-22', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase));
                        // load p2@$1/(gc-22@$1+gc-21@$2)+p1@$2/(gc-12@$1+gc-11@$2)
                        phase = 'round#3';
                        await router.load('p2@$1/(gc-22@$1+gc-21@$2)+p1@$2/(gc-12@$1+gc-11@$2)');
                        assert.html.textContent(host, 'p2 gc-22gc-21 p1 gc-12gc-11', `${phase} - text`);
                        // load p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-23@$2)
                        phase = 'round#4';
                        mgr.fullNotifyHistory.length = 0;
                        mgr.setPrefix(phase);
                        try {
                            await router.load('p1@$1/(gc-11@$1+gc-12@$2)+p2@$2/(gc-21@$1+gc-23@$2)');
                            assert.fail(`${phase} - expected error`);
                        }
                        catch { /* noop */ }
                        await waitForQueuedTasks(queue);
                        assert.html.textContent(host, 'p2 gc-22gc-21 p1 gc-12gc-11', `${phase} - text`);
                        verifyInvocationsEqual(mgr.fullNotifyHistory, getExpectedErrorLog(phase));
                        await tearDown();
                    });
                }
            });
        });
    });
    it('canUnload returns null/undefined -> unloading works', async function () {
        let A = (() => {
            let _classDecorators = [customElement({ name: 'ce-a', template: 'a' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A = _classThis = class {
                canUnload(_next, _current) { return null; }
            };
            __setFunctionName(_classThis, "A");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A = _classThis;
        })();
        let B = (() => {
            let _classDecorators = [customElement({ name: 'ce-b', template: 'b' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B = _classThis = class {
                canUnload(_next, _current) { return undefined; }
            };
            __setFunctionName(_classThis, "B");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: ['', 'a'], component: A, title: 'A' },
                        { path: 'b', component: B, title: 'B' },
                    ]
                }), customElement({
                    name: 'my-app',
                    template: `<au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { router, tearDown, host } = await createFixture(Root, [A, B] /* , LogLevel.trace */);
        assert.html.textContent(host, 'a', 'round#0');
        await router.load('b');
        assert.html.textContent(host, 'b', 'round#1');
        await router.load('a');
        assert.html.textContent(host, 'a', 'round#2');
        await tearDown();
    });
    it('canLoad returns null/undefined -> loading works', async function () {
        let A = (() => {
            let _classDecorators = [customElement({ name: 'ce-a', template: 'a' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A = _classThis = class {
                canLoad(_params, _next, _current) { return null; }
            };
            __setFunctionName(_classThis, "A");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A = _classThis;
        })();
        let B = (() => {
            let _classDecorators = [customElement({ name: 'ce-b', template: 'b' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B = _classThis = class {
                canLoad(_params, _next, _current) { return undefined; }
            };
            __setFunctionName(_classThis, "B");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: ['', 'a'], component: A, title: 'A' },
                        { path: 'b', component: B, title: 'B' },
                    ]
                }), customElement({
                    name: 'my-app',
                    template: `<au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { router, tearDown, host } = await createFixture(Root, [A, B] /* , LogLevel.trace */);
        assert.html.textContent(host, 'a', 'round#0');
        await router.load('b');
        assert.html.textContent(host, 'b', 'round#1');
        await router.load('a');
        assert.html.textContent(host, 'a', 'round#2');
        await tearDown();
    });
    it('canLoad returns routing instruction -> redirects', async function () {
        let A = (() => {
            let _classDecorators = [customElement({ name: 'ce-a', template: 'a' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A = _classThis = class {
            };
            __setFunctionName(_classThis, "A");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A = _classThis;
        })();
        let B = (() => {
            let _classDecorators = [customElement({ name: 'ce-b', template: 'b' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B = _classThis = class {
            };
            __setFunctionName(_classThis, "B");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B = _classThis;
        })();
        let C = (() => {
            let _classDecorators = [customElement({ name: 'ce-c', template: 'c' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C = _classThis = class {
                canLoad(_params, _next, _current) { return 'b'; }
            };
            __setFunctionName(_classThis, "C");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: ['', 'a'], component: A, title: 'A' },
                        { path: 'b', component: B, title: 'B' },
                        { path: 'c', component: C, title: 'C' },
                    ]
                }), customElement({
                    name: 'my-app',
                    template: `<au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { router, tearDown, host } = await createFixture(Root, [A, B, C] /* , LogLevel.trace */);
        assert.html.textContent(host, 'a', 'round#0');
        await router.load('c');
        assert.html.textContent(host, 'b', 'round#1');
        await tearDown();
    });
});
//# sourceMappingURL=hook-tests.spec.js.map