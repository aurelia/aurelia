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
import { DI, onResolve, resolve, } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { Aurelia, CustomAttribute, CustomElement, customElement, lifecycleHooks, } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext, } from '@aurelia/testing';
describe('3-runtime-html/controller.deactivation.partially-activated.spec.ts', function () {
    it('should invoke lifecycles in the correct order', async function () {
        // Note: this is not an important test, it's just a debugging playground
        const CE = CustomElement.define({
            name: 'c-e',
            template: 'ce',
        }, class CE {
            detaching() {
                console.log('c-e.detaching');
            }
        });
        const AppRoot = CustomElement.define({
            name: 'app-root',
            template: '<c-e></c-e>',
            dependencies: [CE]
        }, class AppRoot {
            detaching() {
                console.log('app-root.detaching');
            }
        });
        const ctx = TestContext.create();
        const { container } = ctx;
        const au = new Aurelia(container);
        const host = ctx.createElement('div');
        au.app({
            component: AppRoot,
            host,
        });
        await au.start();
        await au.stop();
    });
    const INotifierManager = DI.createInterface('INotifierManager', x => x.singleton(NotifierManager));
    class NotifierManager {
        constructor() {
            this.prefix = 'start';
            this.log = [];
        }
        createInvoker(vm, hookName, hook) {
            const ceName = CustomElement.getDefinition(vm.constructor).name;
            hook = hook.bind(vm);
            const mgr = vm.mgr;
            return function $hook(initiator, parent) {
                const prefix = `${mgr.prefix}.${ceName}.${hookName}.`;
                mgr.log.push(`${prefix}enter`);
                return onResolve(hook(initiator, parent), () => { mgr.log.push(`${prefix}leave`); });
            };
        }
        createLifecycleHookInvoker(hookInstance, hookName, hook) {
            const name = hookInstance.hookName;
            hook = hook.bind(hookInstance);
            const mgr = hookInstance.mgr;
            return function $hook(vm, initiator, parent) {
                const ctor = vm?.constructor;
                const ceName = CustomElement.isType(ctor)
                    ? CustomElement.getDefinition(ctor).name
                    : CustomAttribute.isType(ctor)
                        ? CustomAttribute.getDefinition(ctor).name
                        : ctor?.name;
                const prefix = `${mgr.prefix}.${name}.${ceName}.${hookName}.`;
                mgr.log.push(`${prefix}enter`);
                return onResolve(hook(vm, initiator, parent), () => { mgr.log.push(`${prefix}leave`); });
            };
        }
        assertLog(expected, message) {
            const log = this.log;
            const len = Math.max(log.length, expected.length);
            for (let i = 0; i < len; i++) {
                assert.strictEqual(log[i], expected[i], `${message} - unexpected log at index${i}: ${log[i]}; actual log: ${JSON.stringify(log, undefined, 2)}`);
            }
        }
        setPrefix(prefix) {
            this.prefix = prefix;
            this.log.length = 0;
        }
    }
    const IPromiseManager = DI.createInterface('IPromiseManager', x => x.singleton(PromiseManager));
    class PromiseManager {
        constructor() {
            this._mode = 'pending';
            this._resolve = null;
            this._reject = null;
            this._currentPromise = null;
        }
        get currentPromise() { return this._currentPromise; }
        createPromise() {
            switch (this._mode) {
                case 'pending': return this._currentPromise = new Promise((res, rej) => { this._resolve = res; this._reject = rej; });
                case 'resolved': return this._currentPromise = Promise.resolve();
                case 'rejected': return this._currentPromise = Promise.reject();
            }
        }
        resolve() {
            this._resolve?.();
        }
        reject(err) {
            this._reject?.(err);
        }
        setMode(value) {
            this._mode = value;
            this._resolve = null;
            this._reject = null;
        }
    }
    class TestVM {
        constructor() {
            this.mgr = resolve(INotifierManager);
            const mgr = this.mgr;
            this.binding = mgr.createInvoker(this, 'binding', this.$binding);
            this.bound = mgr.createInvoker(this, 'bound', this.$bound);
            this.attaching = mgr.createInvoker(this, 'attaching', this.$attaching);
            this.attached = mgr.createInvoker(this, 'attached', this.$attached);
            this.detaching = mgr.createInvoker(this, 'detaching', this.$detaching);
            this.unbinding = mgr.createInvoker(this, 'unbinding', this.$unbinding);
            this.dispose = mgr.createInvoker(this, 'dispose', this.$dispose);
        }
        $binding(_initiator, _parent) { }
        $bound(_initiator, _parent) { }
        $attaching(_initiator, _parent) { }
        $attached(_initiator) { }
        $detaching(_initiator, _parent) { }
        $unbinding(_initiator, _parent) { }
        $dispose() { }
    }
    class TestHook {
        constructor() {
            this.mgr = resolve(INotifierManager);
            const mgr = this.mgr;
            this.binding = mgr.createLifecycleHookInvoker(this, 'binding', this.$binding);
            this.bound = mgr.createLifecycleHookInvoker(this, 'bound', this.$bound);
            this.attaching = mgr.createLifecycleHookInvoker(this, 'attaching', this.$attaching);
            this.attached = mgr.createLifecycleHookInvoker(this, 'attached', this.$attached);
            this.detaching = mgr.createLifecycleHookInvoker(this, 'detaching', this.$detaching);
            this.unbinding = mgr.createLifecycleHookInvoker(this, 'unbinding', this.$unbinding);
        }
        binding(_vm, _initiator, _parent) { }
        bound(_vm, _initiator, _parent) { }
        attaching(_vm, _initiator, _parent) { }
        attached(_vm, _initiator) { }
        detaching(_vm, _initiator, _parent) { }
        unbinding(_vm, _initiator, _parent) { }
        $binding(_vm, _initiator, _parent) { }
        $bound(_vm, _initiator, _parent) { }
        $attaching(_vm, _initiator, _parent) { }
        $attached(_vm, _initiator) { }
        $detaching(_vm, _initiator, _parent) { }
        $unbinding(_vm, _initiator, _parent) { }
    }
    for (const hook of ['binding', 'bound', 'attaching', 'attached']) {
        describe(`activation aborted by error from ${hook}`, function () {
            it(`Aurelia instance can be deactivated  - root`, async function () {
                class Root extends TestVM {
                    [`$${hook}`](_initiator, _parent) {
                        throw new Error('Synthetic test error');
                    }
                }
                const { container, start, stop } = createFixture('', Root, [INotifierManager], false);
                const mgr = container.get(INotifierManager);
                try {
                    await start();
                    assert.fail('expected error on start up');
                }
                catch (err) {
                    assert.instanceOf(err, Error);
                }
                const logs = [];
                /* eslint-disable no-fallthrough */
                switch (hook) {
                    case 'attached': logs.push('start.app.attached.enter', 'start.app.attaching.leave');
                    case 'attaching': logs.push('start.app.attaching.enter', 'start.app.bound.leave');
                    case 'bound': logs.push('start.app.bound.enter', 'start.app.binding.leave');
                    case 'binding': logs.push('start.app.binding.enter');
                }
                /* eslint-enable no-fallthrough */
                logs.reverse();
                mgr.assertLog(logs, 'start');
                mgr.setPrefix('stop');
                let stopError = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    stopError = e;
                }
                assert.strictEqual(stopError, null);
                // Because aurelia could not be started
                mgr.assertLog([], 'stop');
            });
            it(`Aurelia instance can be deactivated - children CE`, async function () {
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: '' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
                        [`$${hook}`](_initiator, _parent) {
                            throw new Error('Synthetic test error');
                        }
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
                class Root extends TestVM {
                }
                const { container, start, stop } = createFixture('<c-1></c-1>', Root, [C1, INotifierManager], false);
                const mgr = container.get(INotifierManager);
                try {
                    await start();
                    assert.fail('expected error on start up');
                }
                catch (err) {
                    assert.instanceOf(err, Error);
                }
                const logs = [];
                /* eslint-disable no-fallthrough */
                switch (hook) {
                    case 'attached': logs.push('start.c-1.attached.enter', 'start.c-1.attaching.leave');
                    case 'attaching': logs.push('start.c-1.attaching.enter', 'start.c-1.bound.leave');
                    case 'bound': logs.push('start.c-1.bound.enter', 'start.c-1.binding.leave');
                    case 'binding': logs.push('start.c-1.binding.enter');
                }
                /* eslint-enable no-fallthrough */
                logs.reverse();
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    ...logs
                ], 'start');
                mgr.setPrefix('stop');
                let stopError = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    stopError = e;
                }
                assert.strictEqual(stopError, null);
                // Because aurelia could not be started
                mgr.assertLog([], 'stop');
            });
            it(`Aurelia instance can be deactivated - individual CE deactivation via template controller (if.bind)`, async function () {
                function getErredActivationLog() {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push('phase#1.c-2.attached.enter', 'phase#1.c-2.attaching.leave');
                        case 'attaching': logs.push('phase#1.c-2.attaching.enter', 'phase#1.c-2.bound.leave');
                        case 'bound': logs.push('phase#1.c-2.bound.enter', 'phase#1.c-2.binding.leave');
                        case 'binding': logs.push('phase#1.c-2.binding.enter');
                    }
                    /* eslint-enable no-fallthrough */
                    logs.reverse();
                    logs.unshift('phase#1.c-1.detaching.enter', 'phase#1.c-1.detaching.leave', 'phase#1.c-1.unbinding.enter', 'phase#1.c-1.unbinding.leave');
                    return logs;
                }
                function getErredDeactivationLog() {
                    return [
                        ...(hook === 'attached' || hook === 'attaching'
                            ? [
                                'phase#2.c-2.detaching.enter',
                                'phase#2.c-2.detaching.leave',
                                'phase#2.c-2.unbinding.enter',
                                'phase#2.c-2.unbinding.leave',
                            ]
                            : hook === 'bound'
                                ? [
                                    'phase#2.c-2.unbinding.enter',
                                    'phase#2.c-2.unbinding.leave',
                                ]
                                : []),
                        'phase#2.c-1.binding.enter',
                        'phase#2.c-1.binding.leave',
                        'phase#2.c-1.bound.enter',
                        'phase#2.c-1.bound.leave',
                        'phase#2.c-1.attaching.enter',
                        'phase#2.c-1.attaching.leave',
                        'phase#2.c-1.attached.enter',
                        'phase#2.c-1.attached.leave',
                    ];
                }
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
                        [`$${hook}`](_initiator, _parent) {
                            throw new Error('Synthetic test error');
                        }
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager]);
                const rootVm = au.root.controller.viewModel;
                assert.html.textContent(appHost, 'c1', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                mgr.setPrefix('phase#1');
                try {
                    rootVm.showC1 = false;
                    assert.fail('expected error');
                }
                catch (e) {
                    assert.instanceOf(e, Error, 'swap');
                }
                mgr.assertLog(getErredActivationLog(), 'phase#1');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
                mgr.assertLog(getErredDeactivationLog(), 'phase#2');
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.c-1.detaching.enter',
                    'stop.c-1.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    'stop.c-1.unbinding.enter',
                    'stop.c-1.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                ], 'stop');
            });
            it(`Aurelia instance can be deactivated - with lifecycle hooks - hook throws error`, async function () {
                function getErredActivationLog() {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push('phase#1.Local.c-2.attached.enter', 'phase#1.Global.c-2.attached.leave', 'phase#1.Global.c-2.attached.enter', 'phase#1.c-2.attaching.leave', 'phase#1.c-2.attaching.enter', 'phase#1.Local.c-2.attaching.leave');
                        case 'attaching':
                            logs.push('phase#1.Local.c-2.attaching.enter', 'phase#1.Global.c-2.attaching.leave', 'phase#1.Global.c-2.attaching.enter', 'phase#1.c-2.bound.leave', 'phase#1.c-2.bound.enter', 'phase#1.Local.c-2.bound.leave');
                        case 'bound':
                            logs.push('phase#1.Local.c-2.bound.enter', 'phase#1.Global.c-2.bound.leave', 'phase#1.Global.c-2.bound.enter', 'phase#1.c-2.binding.leave', 'phase#1.c-2.binding.enter', 'phase#1.Local.c-2.binding.leave');
                        case 'binding':
                            logs.push('phase#1.Local.c-2.binding.enter', 'phase#1.Global.c-2.binding.leave', 'phase#1.Global.c-2.binding.enter');
                    }
                    /* eslint-enable no-fallthrough */
                    logs.reverse();
                    logs.unshift('phase#1.Global.c-1.detaching.enter', 'phase#1.Global.c-1.detaching.leave', 'phase#1.c-1.detaching.enter', 'phase#1.c-1.detaching.leave', 'phase#1.Global.c-1.unbinding.enter', 'phase#1.Global.c-1.unbinding.leave', 'phase#1.c-1.unbinding.enter', 'phase#1.c-1.unbinding.leave');
                    return logs;
                }
                function getErredDeactivationLog() {
                    return [
                        ...(hook === 'attached' || hook === 'attaching'
                            ? [
                                'phase#2.Global.c-2.detaching.enter',
                                'phase#2.Global.c-2.detaching.leave',
                                'phase#2.Local.c-2.detaching.enter',
                                'phase#2.Local.c-2.detaching.leave',
                                'phase#2.c-2.detaching.enter',
                                'phase#2.c-2.detaching.leave',
                                'phase#2.Global.c-2.unbinding.enter',
                                'phase#2.Global.c-2.unbinding.leave',
                                'phase#2.Local.c-2.unbinding.enter',
                                'phase#2.Local.c-2.unbinding.leave',
                                'phase#2.c-2.unbinding.enter',
                                'phase#2.c-2.unbinding.leave'
                            ]
                            : hook === 'bound'
                                ? [
                                    'phase#2.Global.c-2.unbinding.enter',
                                    'phase#2.Global.c-2.unbinding.leave',
                                    'phase#2.Local.c-2.unbinding.enter',
                                    'phase#2.Local.c-2.unbinding.leave',
                                    'phase#2.c-2.unbinding.enter',
                                    'phase#2.c-2.unbinding.leave'
                                ]
                                : []),
                        'phase#2.Global.c-1.binding.enter',
                        'phase#2.Global.c-1.binding.leave',
                        'phase#2.c-1.binding.enter',
                        'phase#2.c-1.binding.leave',
                        'phase#2.Global.c-1.bound.enter',
                        'phase#2.Global.c-1.bound.leave',
                        'phase#2.c-1.bound.enter',
                        'phase#2.c-1.bound.leave',
                        'phase#2.Global.c-1.attaching.enter',
                        'phase#2.Global.c-1.attaching.leave',
                        'phase#2.c-1.attaching.enter',
                        'phase#2.c-1.attaching.leave',
                        'phase#2.Global.c-1.attached.enter',
                        'phase#2.Global.c-1.attached.leave',
                        'phase#2.c-1.attached.enter',
                        'phase#2.c-1.attached.leave',
                    ];
                }
                let Global = (() => {
                    let _classDecorators = [lifecycleHooks()];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestHook;
                    var Global = _classThis = class extends _classSuper {
                        get hookName() {
                            return 'Global';
                        }
                    };
                    __setFunctionName(_classThis, "Global");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Global = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Global = _classThis;
                })();
                let Local = (() => {
                    let _classDecorators = [lifecycleHooks()];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestHook;
                    var Local = _classThis = class extends _classSuper {
                        get hookName() {
                            return 'Local';
                        }
                        [`$${hook}`](_vm, _initiator, _parent) {
                            throw new Error('Synthetic test error');
                        }
                    };
                    __setFunctionName(_classThis, "Local");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Local = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Local = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: 'c2', dependencies: [Local] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, Global]);
                const rootVm = au.root.controller.viewModel;
                assert.html.textContent(appHost, 'c1', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.Global.app.binding.enter',
                    'start.Global.app.binding.leave',
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.Global.app.bound.enter',
                    'start.Global.app.bound.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.Global.app.attaching.enter',
                    'start.Global.app.attaching.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.Global.if.binding.enter',
                    'start.Global.if.binding.leave',
                    'start.Global.if.bound.enter',
                    'start.Global.if.bound.leave',
                    'start.Global.if.attaching.enter',
                    'start.Global.if.attaching.leave',
                    'start.Global.c-1.binding.enter',
                    'start.Global.c-1.binding.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.Global.c-1.bound.enter',
                    'start.Global.c-1.bound.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.Global.c-1.attaching.enter',
                    'start.Global.c-1.attaching.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.Global.c-1.attached.enter',
                    'start.Global.c-1.attached.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.Global.if.attached.enter',
                    'start.Global.if.attached.leave',
                    'start.Global.else.binding.enter',
                    'start.Global.else.binding.leave',
                    'start.Global.else.bound.enter',
                    'start.Global.else.bound.leave',
                    'start.Global.else.attaching.enter',
                    'start.Global.else.attaching.leave',
                    'start.Global.else.attached.enter',
                    'start.Global.else.attached.leave',
                    'start.Global.app.attached.enter',
                    'start.Global.app.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                mgr.setPrefix('phase#1');
                try {
                    rootVm.showC1 = false;
                    assert.fail('expected error');
                }
                catch (e) {
                    assert.instanceOf(e, Error, 'swap');
                    assert.match(e.message, /synthetic test error/i);
                }
                mgr.assertLog(getErredActivationLog(), 'phase#1');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
                mgr.assertLog(getErredDeactivationLog(), 'phase#2');
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.Global.if.detaching.enter',
                    'stop.Global.if.detaching.leave',
                    'stop.Global.c-1.detaching.enter',
                    'stop.Global.c-1.detaching.leave',
                    'stop.c-1.detaching.enter',
                    'stop.c-1.detaching.leave',
                    'stop.Global.else.detaching.enter',
                    'stop.Global.else.detaching.leave',
                    'stop.Global.app.detaching.enter',
                    'stop.Global.app.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    'stop.Global.c-1.unbinding.enter',
                    'stop.Global.c-1.unbinding.leave',
                    'stop.c-1.unbinding.enter',
                    'stop.c-1.unbinding.leave',
                    'stop.Global.if.unbinding.enter',
                    'stop.Global.if.unbinding.leave',
                    'stop.Global.else.unbinding.enter',
                    'stop.Global.else.unbinding.leave',
                    'stop.Global.app.unbinding.enter',
                    'stop.Global.app.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                ], 'stop');
            });
        });
        describe(`long running activation promise on ${hook} - promise is resolved`, function () {
            it(`Individual CE deactivation via template controller (if.bind)`, async function () {
                function getPendingActivationLog(isSettled) {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push('phase#1.c-2.attached.enter', 'phase#1.c-2.attaching.leave');
                        case 'attaching': logs.push('phase#1.c-2.attaching.enter', 'phase#1.c-2.bound.leave');
                        case 'bound': logs.push('phase#1.c-2.bound.enter', 'phase#1.c-2.binding.leave');
                        case 'binding': logs.push('phase#1.c-2.binding.enter');
                    }
                    logs.reverse();
                    logs.unshift('phase#1.c-1.detaching.enter', 'phase#1.c-1.detaching.leave', 'phase#1.c-1.unbinding.enter', 'phase#1.c-1.unbinding.leave');
                    if (!isSettled)
                        return logs;
                    logs.push(`phase#1.c-2.${hook}.leave`);
                    switch (hook) {
                        case 'bound':
                        case 'attaching':
                        case 'attached':
                            logs.push('phase#1.c-2.detaching.enter', 'phase#1.c-2.detaching.leave');
                        case 'binding':
                            logs.push('phase#1.c-2.unbinding.enter', 'phase#1.c-2.unbinding.leave');
                    }
                    /* eslint-enable no-fallthrough */
                    return logs;
                }
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.promiseManager = resolve(IPromiseManager);
                        }
                        [`$${hook}`](_initiator, _parent) {
                            return this.promiseManager.createPromise();
                        }
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, IPromiseManager]);
                const rootVm = au.root.controller.viewModel;
                const promiseManager = container.get(IPromiseManager);
                assert.html.textContent(appHost, 'c1', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                const ifCtrl = rootVm.$controller.children[0];
                const ifVm = ifCtrl.viewModel;
                // phase#1: try to activate c-2 with long-running promise
                mgr.setPrefix('phase#1');
                rootVm.showC1 = false;
                const expectedLog = getPendingActivationLog(false);
                mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');
                // trigger deactivation then resolve the promise and wait for everything
                /**
                 * Note on manual deactivation instead of setting the value of the if.bind to false:
                 * The `if`-TC is not preemptive.
                 * That is it waits always for the previous change.
                 * Thus, setting the value of the if.bind to false would only queue the deactivation rather than a pre-emptive action.
                 * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
                 */
                const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
                promiseManager.resolve();
                await Promise.all([promiseManager.currentPromise, deactivationPromise, ifVm['pending']]);
                mgr.assertLog(getPendingActivationLog(true), 'phase#1 - post-resolve');
                // phase#2: try to activate c-1 - should work
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
                mgr.assertLog([
                    'phase#2.c-1.binding.enter',
                    'phase#2.c-1.binding.leave',
                    'phase#2.c-1.bound.enter',
                    'phase#2.c-1.bound.leave',
                    'phase#2.c-1.attaching.enter',
                    'phase#2.c-1.attaching.leave',
                    'phase#2.c-1.attached.enter',
                    'phase#2.c-1.attached.leave',
                ], 'phase#2');
                // phase#3: try to activate c-2 with resolved promise - should work
                promiseManager.setMode('resolved');
                mgr.setPrefix('phase#3');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                assert.html.textContent(appHost, 'c2', 'phase#3.textContent');
                mgr.assertLog([
                    'phase#3.c-1.detaching.enter',
                    'phase#3.c-1.detaching.leave',
                    'phase#3.c-1.unbinding.enter',
                    'phase#3.c-1.unbinding.leave',
                    'phase#3.c-2.binding.enter',
                    'phase#3.c-2.binding.leave',
                    'phase#3.c-2.bound.enter',
                    'phase#3.c-2.bound.leave',
                    'phase#3.c-2.attaching.enter',
                    'phase#3.c-2.attaching.leave',
                    'phase#3.c-2.attached.enter',
                    'phase#3.c-2.attached.leave',
                ], 'phase#3');
                // phase#4: try to activate c-1 - should work - JFF
                mgr.setPrefix('phase#4');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#4.textContent');
                mgr.assertLog([
                    'phase#4.c-2.detaching.enter',
                    'phase#4.c-2.detaching.leave',
                    'phase#4.c-2.unbinding.enter',
                    'phase#4.c-2.unbinding.leave',
                    'phase#4.c-1.binding.enter',
                    'phase#4.c-1.binding.leave',
                    'phase#4.c-1.bound.enter',
                    'phase#4.c-1.bound.leave',
                    'phase#4.c-1.attaching.enter',
                    'phase#4.c-1.attaching.leave',
                    'phase#4.c-1.attached.enter',
                    'phase#4.c-1.attached.leave',
                ], 'phase#4');
                // phase#5: try to activate c-2 with resolved promise - should work
                mgr.setPrefix('phase#5');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                await Promise.resolve();
                assert.html.textContent(appHost, 'c2', 'phase#5.textContent');
                mgr.assertLog([
                    'phase#5.c-1.detaching.enter',
                    'phase#5.c-1.detaching.leave',
                    'phase#5.c-1.unbinding.enter',
                    'phase#5.c-1.unbinding.leave',
                    'phase#5.c-2.binding.enter',
                    'phase#5.c-2.binding.leave',
                    'phase#5.c-2.bound.enter',
                    'phase#5.c-2.bound.leave',
                    'phase#5.c-2.attaching.enter',
                    'phase#5.c-2.attaching.leave',
                    'phase#5.c-2.attached.enter',
                    'phase#5.c-2.attached.leave',
                ], 'phase#5');
                // stop
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.c-2.detaching.enter',
                    'stop.c-2.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    'stop.c-2.unbinding.enter',
                    'stop.c-2.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                ], 'stop');
            });
            it(`Aurelia instance can be deactivated - with lifecycle hooks`, async function () {
                function getPendingActivationLog(prefix, isDeactivated) {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push(
                        // because the hooks are invoked in parallel
                        `${prefix}.c-2.attached.leave`, `${prefix}.c-2.attached.enter`, `${prefix}.Local.c-2.attached.enter`, `${prefix}.Global.c-2.attached.leave`, `${prefix}.Global.c-2.attached.enter`);
                        case 'attaching':
                            logs.push(
                            // because the hooks are invoked in parallel
                            `${prefix}.c-2.attaching.leave`, `${prefix}.c-2.attaching.enter`, ...(hook === 'attaching' ? [] : [`${prefix}.Local.c-2.attaching.leave`]), `${prefix}.Local.c-2.attaching.enter`, `${prefix}.Global.c-2.attaching.leave`, `${prefix}.Global.c-2.attaching.enter`);
                        case 'bound':
                            logs.push(
                            // because the hooks are invoked in parallel
                            `${prefix}.c-2.bound.leave`, `${prefix}.c-2.bound.enter`, ...(hook === 'bound' ? [] : [`${prefix}.Local.c-2.bound.leave`]), `${prefix}.Local.c-2.bound.enter`, `${prefix}.Global.c-2.bound.leave`, `${prefix}.Global.c-2.bound.enter`);
                        case 'binding':
                            logs.push(
                            // because the hooks are invoked in parallel
                            `${prefix}.c-2.binding.leave`, `${prefix}.c-2.binding.enter`, ...(hook === 'binding' ? [] : [`${prefix}.Local.c-2.binding.leave`]), `${prefix}.Local.c-2.binding.enter`, `${prefix}.Global.c-2.binding.leave`, `${prefix}.Global.c-2.binding.enter`);
                    }
                    logs.reverse();
                    logs.unshift(`${prefix}.Global.c-1.detaching.enter`, `${prefix}.Global.c-1.detaching.leave`, `${prefix}.c-1.detaching.enter`, `${prefix}.c-1.detaching.leave`, `${prefix}.Global.c-1.unbinding.enter`, `${prefix}.Global.c-1.unbinding.leave`, `${prefix}.c-1.unbinding.enter`, `${prefix}.c-1.unbinding.leave`);
                    if (!isDeactivated)
                        return logs;
                    logs.push(`${prefix}.Local.c-2.${hook}.leave`);
                    switch (hook) {
                        case 'bound':
                        case 'attaching':
                        case 'attached':
                            logs.push(`${prefix}.Global.c-2.detaching.enter`, `${prefix}.Global.c-2.detaching.leave`, `${prefix}.Local.c-2.detaching.enter`, `${prefix}.Local.c-2.detaching.leave`, `${prefix}.c-2.detaching.enter`, `${prefix}.c-2.detaching.leave`);
                        case 'binding':
                            logs.push(`${prefix}.Global.c-2.unbinding.enter`, `${prefix}.Global.c-2.unbinding.leave`, `${prefix}.Local.c-2.unbinding.enter`, `${prefix}.Local.c-2.unbinding.leave`, `${prefix}.c-2.unbinding.enter`, `${prefix}.c-2.unbinding.leave`);
                    }
                    /* eslint-enable no-fallthrough */
                    return logs;
                }
                let Global = (() => {
                    let _classDecorators = [lifecycleHooks()];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestHook;
                    var Global = _classThis = class extends _classSuper {
                        get hookName() {
                            return 'Global';
                        }
                    };
                    __setFunctionName(_classThis, "Global");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Global = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Global = _classThis;
                })();
                let Local = (() => {
                    let _classDecorators = [lifecycleHooks()];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestHook;
                    var Local = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.promiseManager = resolve(IPromiseManager);
                        }
                        get hookName() {
                            return 'Local';
                        }
                        [`$${hook}`](_vm, _initiator, _parent) {
                            return this.promiseManager.createPromise();
                        }
                    };
                    __setFunctionName(_classThis, "Local");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Local = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Local = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: 'c2', dependencies: [Local] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, Global]);
                const rootVm = au.root.controller.viewModel;
                const promiseManager = container.get(IPromiseManager);
                assert.html.textContent(appHost, 'c1', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.Global.app.binding.enter',
                    'start.Global.app.binding.leave',
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.Global.app.bound.enter',
                    'start.Global.app.bound.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.Global.app.attaching.enter',
                    'start.Global.app.attaching.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.Global.if.binding.enter',
                    'start.Global.if.binding.leave',
                    'start.Global.if.bound.enter',
                    'start.Global.if.bound.leave',
                    'start.Global.if.attaching.enter',
                    'start.Global.if.attaching.leave',
                    'start.Global.c-1.binding.enter',
                    'start.Global.c-1.binding.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.Global.c-1.bound.enter',
                    'start.Global.c-1.bound.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.Global.c-1.attaching.enter',
                    'start.Global.c-1.attaching.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.Global.c-1.attached.enter',
                    'start.Global.c-1.attached.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.Global.if.attached.enter',
                    'start.Global.if.attached.leave',
                    'start.Global.else.binding.enter',
                    'start.Global.else.binding.leave',
                    'start.Global.else.bound.enter',
                    'start.Global.else.bound.leave',
                    'start.Global.else.attaching.enter',
                    'start.Global.else.attaching.leave',
                    'start.Global.else.attached.enter',
                    'start.Global.else.attached.leave',
                    'start.Global.app.attached.enter',
                    'start.Global.app.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                const ifCtrl = rootVm.$controller.children[0];
                const ifVm = ifCtrl.viewModel;
                // phase#1: try to activate c-2 with long-running promise
                mgr.setPrefix('phase#1');
                rootVm.showC1 = false;
                const expectedLog = getPendingActivationLog('phase#1', false);
                mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');
                // trigger deactivation then resolve the promise and wait for everything
                /**
                 * Note on manual deactivation instead of setting the value of the if.bind to false:
                 * The `if`-TC is not preemptive.
                 * That is it waits always for the previous change.
                 * Thus, setting the value of the if.bind to false would only queue the deactivation rather than a pre-emptive action.
                 * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
                 */
                const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
                promiseManager.resolve();
                await Promise.all([promiseManager.currentPromise, deactivationPromise, ifVm['pending']]);
                mgr.assertLog(getPendingActivationLog('phase#1', true), 'phase#1 - post-resolve');
                // phase#2: try to activate c-1 - should work
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
                mgr.assertLog([
                    'phase#2.Global.c-1.binding.enter',
                    'phase#2.Global.c-1.binding.leave',
                    'phase#2.c-1.binding.enter',
                    'phase#2.c-1.binding.leave',
                    'phase#2.Global.c-1.bound.enter',
                    'phase#2.Global.c-1.bound.leave',
                    'phase#2.c-1.bound.enter',
                    'phase#2.c-1.bound.leave',
                    'phase#2.Global.c-1.attaching.enter',
                    'phase#2.Global.c-1.attaching.leave',
                    'phase#2.c-1.attaching.enter',
                    'phase#2.c-1.attaching.leave',
                    'phase#2.Global.c-1.attached.enter',
                    'phase#2.Global.c-1.attached.leave',
                    'phase#2.c-1.attached.enter',
                    'phase#2.c-1.attached.leave',
                ], 'phase#2');
                // phase#3: try to activate c-2 with resolved promise - should work
                promiseManager.setMode('resolved');
                mgr.setPrefix('phase#3');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                assert.html.textContent(appHost, 'c2', 'phase#3.textContent');
                mgr.assertLog([
                    'phase#3.Global.c-1.detaching.enter',
                    'phase#3.Global.c-1.detaching.leave',
                    'phase#3.c-1.detaching.enter',
                    'phase#3.c-1.detaching.leave',
                    'phase#3.Global.c-1.unbinding.enter',
                    'phase#3.Global.c-1.unbinding.leave',
                    'phase#3.c-1.unbinding.enter',
                    'phase#3.c-1.unbinding.leave',
                    'phase#3.Global.c-2.binding.enter',
                    'phase#3.Global.c-2.binding.leave',
                    'phase#3.Local.c-2.binding.enter',
                    ...(hook === 'binding' ? [] : ['phase#3.Local.c-2.binding.leave']),
                    'phase#3.c-2.binding.enter',
                    'phase#3.c-2.binding.leave',
                    ...(hook === 'binding' ? ['phase#3.Local.c-2.binding.leave'] : []),
                    'phase#3.Global.c-2.bound.enter',
                    'phase#3.Global.c-2.bound.leave',
                    'phase#3.Local.c-2.bound.enter',
                    ...(hook === 'bound' ? [] : ['phase#3.Local.c-2.bound.leave']),
                    'phase#3.c-2.bound.enter',
                    'phase#3.c-2.bound.leave',
                    ...(hook === 'bound' ? ['phase#3.Local.c-2.bound.leave'] : []),
                    'phase#3.Global.c-2.attaching.enter',
                    'phase#3.Global.c-2.attaching.leave',
                    'phase#3.Local.c-2.attaching.enter',
                    ...(hook === 'attaching' ? [] : ['phase#3.Local.c-2.attaching.leave']),
                    'phase#3.c-2.attaching.enter',
                    'phase#3.c-2.attaching.leave',
                    ...(hook === 'attaching' ? ['phase#3.Local.c-2.attaching.leave'] : []),
                    'phase#3.Global.c-2.attached.enter',
                    'phase#3.Global.c-2.attached.leave',
                    'phase#3.Local.c-2.attached.enter',
                    ...(hook === 'attached' ? [] : ['phase#3.Local.c-2.attached.leave']),
                    'phase#3.c-2.attached.enter',
                    'phase#3.c-2.attached.leave',
                    ...(hook === 'attached' ? ['phase#3.Local.c-2.attached.leave'] : []),
                ], 'phase#3');
                // phase#4: try to activate c-1 - should work - JFF
                mgr.setPrefix('phase#4');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#4.textContent');
                mgr.assertLog([
                    'phase#4.Global.c-2.detaching.enter',
                    'phase#4.Global.c-2.detaching.leave',
                    'phase#4.Local.c-2.detaching.enter',
                    'phase#4.Local.c-2.detaching.leave',
                    'phase#4.c-2.detaching.enter',
                    'phase#4.c-2.detaching.leave',
                    'phase#4.Global.c-2.unbinding.enter',
                    'phase#4.Global.c-2.unbinding.leave',
                    'phase#4.Local.c-2.unbinding.enter',
                    'phase#4.Local.c-2.unbinding.leave',
                    'phase#4.c-2.unbinding.enter',
                    'phase#4.c-2.unbinding.leave',
                    'phase#4.Global.c-1.binding.enter',
                    'phase#4.Global.c-1.binding.leave',
                    'phase#4.c-1.binding.enter',
                    'phase#4.c-1.binding.leave',
                    'phase#4.Global.c-1.bound.enter',
                    'phase#4.Global.c-1.bound.leave',
                    'phase#4.c-1.bound.enter',
                    'phase#4.c-1.bound.leave',
                    'phase#4.Global.c-1.attaching.enter',
                    'phase#4.Global.c-1.attaching.leave',
                    'phase#4.c-1.attaching.enter',
                    'phase#4.c-1.attaching.leave',
                    'phase#4.Global.c-1.attached.enter',
                    'phase#4.Global.c-1.attached.leave',
                    'phase#4.c-1.attached.enter',
                    'phase#4.c-1.attached.leave',
                ], 'phase#4');
                // phase#5: try to activate c-2 with resolved promise - should work
                mgr.setPrefix('phase#5');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                await Promise.resolve();
                assert.html.textContent(appHost, 'c2', 'phase#5.textContent');
                mgr.assertLog([
                    'phase#5.Global.c-1.detaching.enter',
                    'phase#5.Global.c-1.detaching.leave',
                    'phase#5.c-1.detaching.enter',
                    'phase#5.c-1.detaching.leave',
                    'phase#5.Global.c-1.unbinding.enter',
                    'phase#5.Global.c-1.unbinding.leave',
                    'phase#5.c-1.unbinding.enter',
                    'phase#5.c-1.unbinding.leave',
                    'phase#5.Global.c-2.binding.enter',
                    'phase#5.Global.c-2.binding.leave',
                    'phase#5.Local.c-2.binding.enter',
                    ...(hook === 'binding' ? [] : ['phase#5.Local.c-2.binding.leave']),
                    'phase#5.c-2.binding.enter',
                    'phase#5.c-2.binding.leave',
                    ...(hook === 'binding' ? ['phase#5.Local.c-2.binding.leave'] : []),
                    'phase#5.Global.c-2.bound.enter',
                    'phase#5.Global.c-2.bound.leave',
                    'phase#5.Local.c-2.bound.enter',
                    ...(hook === 'bound' ? [] : ['phase#5.Local.c-2.bound.leave']),
                    'phase#5.c-2.bound.enter',
                    'phase#5.c-2.bound.leave',
                    ...(hook === 'bound' ? ['phase#5.Local.c-2.bound.leave'] : []),
                    'phase#5.Global.c-2.attaching.enter',
                    'phase#5.Global.c-2.attaching.leave',
                    'phase#5.Local.c-2.attaching.enter',
                    ...(hook === 'attaching' ? [] : ['phase#5.Local.c-2.attaching.leave']),
                    'phase#5.c-2.attaching.enter',
                    'phase#5.c-2.attaching.leave',
                    ...(hook === 'attaching' ? ['phase#5.Local.c-2.attaching.leave'] : []),
                    'phase#5.Global.c-2.attached.enter',
                    'phase#5.Global.c-2.attached.leave',
                    'phase#5.Local.c-2.attached.enter',
                    ...(hook === 'attached' ? [] : ['phase#5.Local.c-2.attached.leave']),
                    'phase#5.c-2.attached.enter',
                    'phase#5.c-2.attached.leave',
                    ...(hook === 'attached' ? ['phase#5.Local.c-2.attached.leave'] : []),
                ], 'phase#5');
                // stop
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.Global.if.detaching.enter',
                    'stop.Global.if.detaching.leave',
                    'stop.Global.c-2.detaching.enter',
                    'stop.Global.c-2.detaching.leave',
                    'stop.Local.c-2.detaching.enter',
                    'stop.Local.c-2.detaching.leave',
                    'stop.c-2.detaching.enter',
                    'stop.c-2.detaching.leave',
                    'stop.Global.else.detaching.enter',
                    'stop.Global.else.detaching.leave',
                    'stop.Global.app.detaching.enter',
                    'stop.Global.app.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    'stop.Global.c-2.unbinding.enter',
                    'stop.Global.c-2.unbinding.leave',
                    'stop.Local.c-2.unbinding.enter',
                    'stop.Local.c-2.unbinding.leave',
                    'stop.c-2.unbinding.enter',
                    'stop.c-2.unbinding.leave',
                    'stop.Global.if.unbinding.enter',
                    'stop.Global.if.unbinding.leave',
                    'stop.Global.else.unbinding.enter',
                    'stop.Global.else.unbinding.leave',
                    'stop.Global.app.unbinding.enter',
                    'stop.Global.app.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                ], 'stop');
            });
        });
        describe(`long running activation promise on ${hook} - promise is rejected`, function () {
            it(`Individual CE deactivation via template controller (if.bind)`, async function () {
                function getPendingActivationLog(prefix, isDeactivated) {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push(`${prefix}.c-2.attached.enter`, `${prefix}.c-2.attaching.leave`);
                        case 'attaching': logs.push(`${prefix}.c-2.attaching.enter`, `${prefix}.c-2.bound.leave`);
                        case 'bound': logs.push(`${prefix}.c-2.bound.enter`, `${prefix}.c-2.binding.leave`);
                        case 'binding': logs.push(`${prefix}.c-2.binding.enter`);
                    }
                    logs.reverse();
                    logs.unshift(`${prefix}.c-1.detaching.enter`, `${prefix}.c-1.detaching.leave`, `${prefix}.c-1.unbinding.enter`, `${prefix}.c-1.unbinding.leave`);
                    if (!isDeactivated)
                        return logs;
                    // logs.push(`phase#1.c-2.${hook}.leave`);
                    switch (hook) {
                        case 'attaching':
                        case 'attached':
                            logs.push(`${prefix}.c-2.detaching.enter`, `${prefix}.c-2.detaching.leave`);
                        case 'bound':
                            logs.push(`${prefix}.c-2.unbinding.enter`, `${prefix}.c-2.unbinding.leave`);
                    }
                    /* eslint-enable no-fallthrough */
                    return logs;
                }
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.promiseManager = resolve(IPromiseManager);
                        }
                        [`$${hook}`](_initiator, _parent) {
                            return this.promiseManager.createPromise();
                        }
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
                    let _classDecorators = [customElement({ name: 'app', template: '<c-1 if.bind="showC1"></c-1><c-2 else></c-2>' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var Root = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.showC1 = true;
                        }
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
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, IPromiseManager]);
                const rootVm = au.root.controller.viewModel;
                const promiseManager = container.get(IPromiseManager);
                assert.html.textContent(appHost, 'c1', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                const ifCtrl = rootVm.$controller.children[0];
                const ifVm = ifCtrl.viewModel;
                // phase#1: try to activate c-2 with long-running promise
                mgr.setPrefix('phase#1');
                rootVm.showC1 = false;
                const expectedLog = getPendingActivationLog('phase#1', false);
                mgr.assertLog(expectedLog, 'phase#1 - pre-reject');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');
                // trigger deactivation then reject the promise and wait for everything
                /**
                 * Note on manual deactivation instead of setting the value of the if.bind to false:
                 * The `if`-TC is not preemptive.
                 * That is it waits always for the previous change.
                 * Thus, setting the value of the if.bind to false would only queue the deactivation rather than a pre-emptive action.
                 * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
                 */
                const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
                promiseManager.reject(new Error('Synthetic test error - phase#1'));
                await Promise.allSettled([promiseManager.currentPromise, deactivationPromise, ifVm['pending']]);
                mgr.assertLog(getPendingActivationLog('phase#1', true), 'phase#1 - post-reject');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // phase#2: try to activate c-1 - should work
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
                mgr.assertLog([
                    'phase#2.c-1.binding.enter',
                    'phase#2.c-1.binding.leave',
                    'phase#2.c-1.bound.enter',
                    'phase#2.c-1.bound.leave',
                    'phase#2.c-1.attaching.enter',
                    'phase#2.c-1.attaching.leave',
                    'phase#2.c-1.attached.enter',
                    'phase#2.c-1.attached.leave',
                ], 'phase#2');
                // phase#3: try to activate c-2 with rejected promise - should work
                promiseManager.setMode('rejected');
                mgr.setPrefix('phase#3');
                rootVm.showC1 = false;
                await tasksSettled();
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#3.textContent');
                mgr.assertLog(getPendingActivationLog('phase#3', false), 'phase#3');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // phase#4: try to activate c-1 - should work - JFF
                mgr.setPrefix('phase#4');
                rootVm.showC1 = true;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                await Promise.resolve();
                await Promise.resolve();
                assert.html.textContent(appHost, 'c1', 'phase#4.textContent');
                mgr.assertLog([
                    ...(hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#4.c-2.detaching.enter',
                            'phase#4.c-2.detaching.leave',
                            'phase#4.c-2.unbinding.enter',
                            'phase#4.c-2.unbinding.leave',
                        ]
                        : hook === 'bound'
                            ? [
                                'phase#4.c-2.unbinding.enter',
                                'phase#4.c-2.unbinding.leave',
                            ]
                            : []),
                    'phase#4.c-1.binding.enter',
                    'phase#4.c-1.binding.leave',
                    'phase#4.c-1.bound.enter',
                    'phase#4.c-1.bound.leave',
                    'phase#4.c-1.attaching.enter',
                    'phase#4.c-1.attaching.leave',
                    'phase#4.c-1.attached.enter',
                    'phase#4.c-1.attached.leave',
                ], 'phase#4');
                // phase#5: try to activate c-2 with resolved promise - should work
                mgr.setPrefix('phase#5');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#5.textContent');
                mgr.assertLog(getPendingActivationLog('phase#5', false), 'phase#5');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // stop
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    ...(hook === 'attaching' || hook === 'attached'
                        ? [
                            'stop.c-2.detaching.enter',
                            'stop.c-2.detaching.leave',
                        ]
                        : []),
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    ...(hook === 'bound' || hook === 'attaching' || hook === 'attached'
                        ? [
                            'stop.c-2.unbinding.enter',
                            'stop.c-2.unbinding.leave',
                        ]
                        : []),
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                ], 'stop');
            });
            it(`Aurelia instance can be deactivated - with lifecycle hooks`, async function () {
                function getPendingActivationLog(prefix, isDeactivated) {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push(
                        // because the hooks are invoked in parallel
                        `${prefix}.c-2.attached.leave`, `${prefix}.c-2.attached.enter`, `${prefix}.Local.c-2.attached.enter`, `${prefix}.Global.c-2.attached.leave`, `${prefix}.Global.c-2.attached.enter`);
                        case 'attaching':
                            logs.push(
                            // because the hooks are invoked in parallel
                            `${prefix}.c-2.attaching.leave`, `${prefix}.c-2.attaching.enter`, ...(hook === 'attaching' ? [] : [`${prefix}.Local.c-2.attaching.leave`]), `${prefix}.Local.c-2.attaching.enter`, `${prefix}.Global.c-2.attaching.leave`, `${prefix}.Global.c-2.attaching.enter`);
                        case 'bound':
                            logs.push(
                            // because the hooks are invoked in parallel
                            `${prefix}.c-2.bound.leave`, `${prefix}.c-2.bound.enter`, ...(hook === 'bound' ? [] : [`${prefix}.Local.c-2.bound.leave`]), `${prefix}.Local.c-2.bound.enter`, `${prefix}.Global.c-2.bound.leave`, `${prefix}.Global.c-2.bound.enter`);
                        case 'binding':
                            logs.push(
                            // because the hooks are invoked in parallel
                            `${prefix}.c-2.binding.leave`, `${prefix}.c-2.binding.enter`, ...(hook === 'binding' ? [] : [`${prefix}.Local.c-2.binding.leave`]), `${prefix}.Local.c-2.binding.enter`, `${prefix}.Global.c-2.binding.leave`, `${prefix}.Global.c-2.binding.enter`);
                    }
                    logs.reverse();
                    logs.unshift(`${prefix}.Global.c-1.detaching.enter`, `${prefix}.Global.c-1.detaching.leave`, `${prefix}.c-1.detaching.enter`, `${prefix}.c-1.detaching.leave`, `${prefix}.Global.c-1.unbinding.enter`, `${prefix}.Global.c-1.unbinding.leave`, `${prefix}.c-1.unbinding.enter`, `${prefix}.c-1.unbinding.leave`);
                    if (!isDeactivated)
                        return logs;
                    switch (hook) {
                        case 'attaching':
                        case 'attached':
                            logs.push(`${prefix}.Global.c-2.detaching.enter`, `${prefix}.Global.c-2.detaching.leave`, `${prefix}.Local.c-2.detaching.enter`, `${prefix}.Local.c-2.detaching.leave`, `${prefix}.c-2.detaching.enter`, `${prefix}.c-2.detaching.leave`);
                        case 'bound':
                            logs.push(`${prefix}.Global.c-2.unbinding.enter`, `${prefix}.Global.c-2.unbinding.leave`, `${prefix}.Local.c-2.unbinding.enter`, `${prefix}.Local.c-2.unbinding.leave`, `${prefix}.c-2.unbinding.enter`, `${prefix}.c-2.unbinding.leave`);
                    }
                    /* eslint-enable no-fallthrough */
                    return logs;
                }
                let Global = (() => {
                    let _classDecorators = [lifecycleHooks()];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestHook;
                    var Global = _classThis = class extends _classSuper {
                        get hookName() {
                            return 'Global';
                        }
                    };
                    __setFunctionName(_classThis, "Global");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Global = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Global = _classThis;
                })();
                let Local = (() => {
                    let _classDecorators = [lifecycleHooks()];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestHook;
                    var Local = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.promiseManager = resolve(IPromiseManager);
                        }
                        get hookName() {
                            return 'Local';
                        }
                        [`$${hook}`](_vm, _initiator, _parent) {
                            return this.promiseManager.createPromise();
                        }
                    };
                    __setFunctionName(_classThis, "Local");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Local = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Local = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: 'c2', dependencies: [Local] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, Global]);
                const rootVm = au.root.controller.viewModel;
                const promiseManager = container.get(IPromiseManager);
                assert.html.textContent(appHost, 'c1', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.Global.app.binding.enter',
                    'start.Global.app.binding.leave',
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.Global.app.bound.enter',
                    'start.Global.app.bound.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.Global.app.attaching.enter',
                    'start.Global.app.attaching.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.Global.if.binding.enter',
                    'start.Global.if.binding.leave',
                    'start.Global.if.bound.enter',
                    'start.Global.if.bound.leave',
                    'start.Global.if.attaching.enter',
                    'start.Global.if.attaching.leave',
                    'start.Global.c-1.binding.enter',
                    'start.Global.c-1.binding.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.Global.c-1.bound.enter',
                    'start.Global.c-1.bound.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.Global.c-1.attaching.enter',
                    'start.Global.c-1.attaching.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.Global.c-1.attached.enter',
                    'start.Global.c-1.attached.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.Global.if.attached.enter',
                    'start.Global.if.attached.leave',
                    'start.Global.else.binding.enter',
                    'start.Global.else.binding.leave',
                    'start.Global.else.bound.enter',
                    'start.Global.else.bound.leave',
                    'start.Global.else.attaching.enter',
                    'start.Global.else.attaching.leave',
                    'start.Global.else.attached.enter',
                    'start.Global.else.attached.leave',
                    'start.Global.app.attached.enter',
                    'start.Global.app.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                const ifCtrl = rootVm.$controller.children[0];
                const ifVm = ifCtrl.viewModel;
                // phase#1: try to activate c-2 with long-running promise
                mgr.setPrefix('phase#1');
                rootVm.showC1 = false;
                const expectedLog = getPendingActivationLog('phase#1', false);
                mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#1.textContent');
                // trigger deactivation then resolve the promise and wait for everything
                /**
                 * Note on manual deactivation instead of setting the value of the if.bind to false:
                 * The `if`-TC is not preemptive.
                 * That is it waits always for the previous change.
                 * Thus, setting the value of the if.bind to false would only queue the deactivation rather than a pre-emptive action.
                 * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
                 */
                const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
                promiseManager.reject(new Error('Synthetic test error'));
                await Promise.allSettled([promiseManager.currentPromise, deactivationPromise, ifVm['pending']]);
                mgr.assertLog(getPendingActivationLog('phase#1', true), 'phase#1 - post-resolve');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // phase#2: try to activate c-1 - should work
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#2.textContent');
                mgr.assertLog([
                    'phase#2.Global.c-1.binding.enter',
                    'phase#2.Global.c-1.binding.leave',
                    'phase#2.c-1.binding.enter',
                    'phase#2.c-1.binding.leave',
                    'phase#2.Global.c-1.bound.enter',
                    'phase#2.Global.c-1.bound.leave',
                    'phase#2.c-1.bound.enter',
                    'phase#2.c-1.bound.leave',
                    'phase#2.Global.c-1.attaching.enter',
                    'phase#2.Global.c-1.attaching.leave',
                    'phase#2.c-1.attaching.enter',
                    'phase#2.c-1.attaching.leave',
                    'phase#2.Global.c-1.attached.enter',
                    'phase#2.Global.c-1.attached.leave',
                    'phase#2.c-1.attached.enter',
                    'phase#2.c-1.attached.leave',
                ], 'phase#2');
                // phase#3: try to activate c-2 with resolved promise - should work
                promiseManager.setMode('rejected');
                mgr.setPrefix('phase#3');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#3.textContent');
                mgr.assertLog(getPendingActivationLog('phase#3', false), 'phase#3');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // phase#4: try to activate c-1 - should work - JFF
                mgr.setPrefix('phase#4');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1', 'phase#4.textContent');
                mgr.assertLog([
                    ...(hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#4.Global.c-2.detaching.enter',
                            'phase#4.Global.c-2.detaching.leave',
                            'phase#4.Local.c-2.detaching.enter',
                            'phase#4.Local.c-2.detaching.leave',
                            'phase#4.c-2.detaching.enter',
                            'phase#4.c-2.detaching.leave',
                            'phase#4.Global.c-2.unbinding.enter',
                            'phase#4.Global.c-2.unbinding.leave',
                            'phase#4.Local.c-2.unbinding.enter',
                            'phase#4.Local.c-2.unbinding.leave',
                            'phase#4.c-2.unbinding.enter',
                            'phase#4.c-2.unbinding.leave',
                        ]
                        : hook === 'bound'
                            ? [
                                'phase#4.Global.c-2.unbinding.enter',
                                'phase#4.Global.c-2.unbinding.leave',
                                'phase#4.Local.c-2.unbinding.enter',
                                'phase#4.Local.c-2.unbinding.leave',
                                'phase#4.c-2.unbinding.enter',
                                'phase#4.c-2.unbinding.leave',
                            ]
                            : []),
                    'phase#4.Global.c-1.binding.enter',
                    'phase#4.Global.c-1.binding.leave',
                    'phase#4.c-1.binding.enter',
                    'phase#4.c-1.binding.leave',
                    'phase#4.Global.c-1.bound.enter',
                    'phase#4.Global.c-1.bound.leave',
                    'phase#4.c-1.bound.enter',
                    'phase#4.c-1.bound.leave',
                    'phase#4.Global.c-1.attaching.enter',
                    'phase#4.Global.c-1.attaching.leave',
                    'phase#4.c-1.attaching.enter',
                    'phase#4.c-1.attaching.leave',
                    'phase#4.Global.c-1.attached.enter',
                    'phase#4.Global.c-1.attached.leave',
                    'phase#4.c-1.attached.enter',
                    'phase#4.c-1.attached.leave',
                ], 'phase#4');
                // phase#5: try to activate c-2 with resolved promise - should work
                mgr.setPrefix('phase#5');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2' : '', 'phase#5.textContent');
                mgr.assertLog(getPendingActivationLog('phase#5', false), 'phase#5');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // stop
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.Global.if.detaching.enter',
                    'stop.Global.if.detaching.leave',
                    ...(hook === 'attaching' || hook === 'attached'
                        ? ['stop.Global.c-2.detaching.enter',
                            'stop.Global.c-2.detaching.leave',
                            'stop.Local.c-2.detaching.enter',
                            'stop.Local.c-2.detaching.leave',
                            'stop.c-2.detaching.enter',
                            'stop.c-2.detaching.leave',
                        ]
                        : []),
                    'stop.Global.else.detaching.enter',
                    'stop.Global.else.detaching.leave',
                    'stop.Global.app.detaching.enter',
                    'stop.Global.app.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    ...(hook === 'bound' || hook === 'attaching' || hook === 'attached'
                        ? [
                            'stop.Global.c-2.unbinding.enter',
                            'stop.Global.c-2.unbinding.leave',
                            'stop.Local.c-2.unbinding.enter',
                            'stop.Local.c-2.unbinding.leave',
                            'stop.c-2.unbinding.enter',
                            'stop.c-2.unbinding.leave',
                        ]
                        : []),
                    'stop.Global.if.unbinding.enter',
                    'stop.Global.if.unbinding.leave',
                    'stop.Global.else.unbinding.enter',
                    'stop.Global.else.unbinding.leave',
                    'stop.Global.app.unbinding.enter',
                    'stop.Global.app.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                ], 'stop');
            });
        });
        describe('parent activating done - child activating', function () {
            it(`error on ${hook}`, async function () {
                function getErredActivationLog() {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push('phase#1.c2-c.attached.enter', 'phase#1.c2-c.attaching.leave');
                        case 'attaching': logs.push('phase#1.c2-c.attaching.enter', 'phase#1.c2-c.bound.leave');
                        case 'bound': logs.push('phase#1.c2-c.bound.enter', 'phase#1.c2-c.binding.leave');
                        case 'binding': logs.push('phase#1.c2-c.binding.enter');
                    }
                    /* eslint-enable no-fallthrough */
                    logs.reverse();
                    logs.unshift('phase#1.c1-c.detaching.enter', 'phase#1.c1-c.detaching.leave', 'phase#1.c-1.detaching.enter', 'phase#1.c-1.detaching.leave', 'phase#1.c1-c.unbinding.enter', 'phase#1.c1-c.unbinding.leave', 'phase#1.c-1.unbinding.enter', 'phase#1.c-1.unbinding.leave', 'phase#1.c-2.binding.enter', 'phase#1.c-2.binding.leave', 'phase#1.c-2.bound.enter', 'phase#1.c-2.bound.leave', 'phase#1.c-2.attaching.enter', 'phase#1.c-2.attaching.leave');
                    return logs;
                }
                function getErredDeactivationLog() {
                    return [
                        ...(hook === 'attached' || hook === 'attaching'
                            ? [
                                'phase#2.c2-c.detaching.enter',
                                'phase#2.c2-c.detaching.leave',
                            ]
                            : []),
                        'phase#2.c-2.detaching.enter',
                        'phase#2.c-2.detaching.leave',
                        ...(hook === 'bound' || hook === 'attached' || hook === 'attaching'
                            ? [
                                'phase#2.c2-c.unbinding.enter',
                                'phase#2.c2-c.unbinding.leave',
                            ]
                            : []),
                        'phase#2.c-2.unbinding.enter',
                        'phase#2.c-2.unbinding.leave',
                        'phase#2.c-1.binding.enter',
                        'phase#2.c-1.binding.leave',
                        'phase#2.c-1.bound.enter',
                        'phase#2.c-1.bound.leave',
                        'phase#2.c-1.attaching.enter',
                        'phase#2.c-1.attaching.leave',
                        'phase#2.c1-c.binding.enter',
                        'phase#2.c1-c.binding.leave',
                        'phase#2.c1-c.bound.enter',
                        'phase#2.c1-c.bound.leave',
                        'phase#2.c1-c.attaching.enter',
                        'phase#2.c1-c.attaching.leave',
                        'phase#2.c1-c.attached.enter',
                        'phase#2.c1-c.attached.leave',
                        'phase#2.c-1.attached.enter',
                        'phase#2.c-1.attached.leave',
                    ];
                }
                let C1Child = (() => {
                    let _classDecorators = [customElement({ name: 'c1-c', template: 'c1c' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1Child = _classThis = class extends _classSuper {
                    };
                    __setFunctionName(_classThis, "C1Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C1Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C1Child = _classThis;
                })();
                let C2Child = (() => {
                    let _classDecorators = [customElement({ name: 'c2-c', template: 'c2c' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2Child = _classThis = class extends _classSuper {
                        [`$${hook}`](_initiator, _parent) {
                            throw new Error('Synthetic test error');
                        }
                    };
                    __setFunctionName(_classThis, "C2Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C2Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C2Child = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: '<c1-c></c1-c>', dependencies: [C1Child] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: '<c2-c></c2-c>', dependencies: [C2Child] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, stop, appHost, container } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager]);
                const rootVm = au.root.controller.viewModel;
                assert.html.textContent(appHost, 'c1c', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.c1-c.binding.enter',
                    'start.c1-c.binding.leave',
                    'start.c1-c.bound.enter',
                    'start.c1-c.bound.leave',
                    'start.c1-c.attaching.enter',
                    'start.c1-c.attaching.leave',
                    'start.c1-c.attached.enter',
                    'start.c1-c.attached.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                mgr.setPrefix('phase#1');
                try {
                    rootVm.showC1 = false;
                    assert.fail('expected error');
                }
                catch (e) {
                    assert.instanceOf(e, Error, 'swap');
                }
                mgr.assertLog(getErredActivationLog(), 'phase#1');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2c' : '', 'phase#1.textContent');
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                assert.html.textContent(appHost, 'c1c', 'phase#2.textContent');
                mgr.assertLog(getErredDeactivationLog(), 'phase#2');
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.c1-c.detaching.enter',
                    'stop.c1-c.detaching.leave',
                    'stop.c-1.detaching.enter',
                    'stop.c-1.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    'stop.c1-c.unbinding.enter',
                    'stop.c1-c.unbinding.leave',
                    'stop.c-1.unbinding.enter',
                    'stop.c-1.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c1-c.dispose.enter',
                    'stop.c1-c.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                    'stop.c2-c.dispose.enter',
                    'stop.c2-c.dispose.leave',
                ], 'stop');
                await stop(true);
            });
            it(`long running promise on ${hook} - promise is resolved`, async function () {
                function getPendingActivationLog(isSettled) {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push('phase#1.c2-c.attached.enter', 'phase#1.c2-c.attaching.leave');
                        case 'attaching': logs.push('phase#1.c2-c.attaching.enter', 'phase#1.c2-c.bound.leave');
                        case 'bound': logs.push('phase#1.c2-c.bound.enter', 'phase#1.c2-c.binding.leave');
                        case 'binding': logs.push('phase#1.c2-c.binding.enter');
                    }
                    /* eslint-enable no-fallthrough */
                    logs.reverse();
                    logs.unshift('phase#1.c1-c.detaching.enter', 'phase#1.c1-c.detaching.leave', 'phase#1.c-1.detaching.enter', 'phase#1.c-1.detaching.leave', 'phase#1.c1-c.unbinding.enter', 'phase#1.c1-c.unbinding.leave', 'phase#1.c-1.unbinding.enter', 'phase#1.c-1.unbinding.leave', 'phase#1.c-2.binding.enter', 'phase#1.c-2.binding.leave', 'phase#1.c-2.bound.enter', 'phase#1.c-2.bound.leave', 'phase#1.c-2.attaching.enter', 'phase#1.c-2.attaching.leave');
                    if (!isSettled)
                        return logs;
                    logs.push(`phase#1.c2-c.${hook}.leave`, ...(hook === 'bound' || hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#1.c2-c.detaching.enter',
                            'phase#1.c2-c.detaching.leave',
                        ]
                        : []), 'phase#1.c-2.detaching.enter', 'phase#1.c-2.detaching.leave', 'phase#1.c2-c.unbinding.enter', 'phase#1.c2-c.unbinding.leave', 'phase#1.c-2.unbinding.enter', 'phase#1.c-2.unbinding.leave');
                    return logs;
                }
                let C1Child = (() => {
                    let _classDecorators = [customElement({ name: 'c1-c', template: 'c1c' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1Child = _classThis = class extends _classSuper {
                    };
                    __setFunctionName(_classThis, "C1Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C1Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C1Child = _classThis;
                })();
                let C2Child = (() => {
                    let _classDecorators = [customElement({ name: 'c2-c', template: 'c2c' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2Child = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.promiseManager = resolve(IPromiseManager);
                        }
                        [`$${hook}`](_initiator, _parent) {
                            return this.promiseManager.createPromise();
                        }
                    };
                    __setFunctionName(_classThis, "C2Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C2Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C2Child = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: '<c1-c></c1-c>', dependencies: [C1Child] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: '<c2-c></c2-c>', dependencies: [C2Child] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, IPromiseManager]);
                const rootVm = au.root.controller.viewModel;
                const promiseManager = container.get(IPromiseManager);
                assert.html.textContent(appHost, 'c1c', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.c1-c.binding.enter',
                    'start.c1-c.binding.leave',
                    'start.c1-c.bound.enter',
                    'start.c1-c.bound.leave',
                    'start.c1-c.attaching.enter',
                    'start.c1-c.attaching.leave',
                    'start.c1-c.attached.enter',
                    'start.c1-c.attached.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                const ifCtrl = rootVm.$controller.children[0];
                const ifVm = ifCtrl.viewModel;
                // phase#1: try to activate c-2 with long-running promise
                mgr.setPrefix('phase#1');
                rootVm.showC1 = false;
                const expectedLog = getPendingActivationLog(false);
                mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2c' : '', 'phase#1.textContent');
                // trigger deactivation then resolve the promise and wait for everything
                /**
                 * Note on manual deactivation instead of setting the value of the if.bind to false:
                 * The `if`-TC is not preemptive.
                 * That is it waits always for the previous change.
                 * Thus, setting the value of the if.bind to false would only queue the deactivation rather than a pre-emptive action.
                 * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
                 */
                const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
                promiseManager.resolve();
                await Promise.all([promiseManager.currentPromise, deactivationPromise, ifVm['pending']]);
                mgr.assertLog(getPendingActivationLog(true), 'phase#1 - post-resolve');
                // phase#2: try to activate c-1 - should work
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1c', 'phase#2.textContent');
                mgr.assertLog([
                    'phase#2.c-1.binding.enter',
                    'phase#2.c-1.binding.leave',
                    'phase#2.c-1.bound.enter',
                    'phase#2.c-1.bound.leave',
                    'phase#2.c-1.attaching.enter',
                    'phase#2.c-1.attaching.leave',
                    'phase#2.c1-c.binding.enter',
                    'phase#2.c1-c.binding.leave',
                    'phase#2.c1-c.bound.enter',
                    'phase#2.c1-c.bound.leave',
                    'phase#2.c1-c.attaching.enter',
                    'phase#2.c1-c.attaching.leave',
                    'phase#2.c1-c.attached.enter',
                    'phase#2.c1-c.attached.leave',
                    'phase#2.c-1.attached.enter',
                    'phase#2.c-1.attached.leave',
                ], 'phase#2');
                // phase#3: try to activate c-2 with resolved promise - should work
                promiseManager.setMode('resolved');
                mgr.setPrefix('phase#3');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                await Promise.resolve();
                assert.html.textContent(appHost, 'c2c', 'phase#3.textContent');
                mgr.assertLog([
                    'phase#3.c1-c.detaching.enter',
                    'phase#3.c1-c.detaching.leave',
                    'phase#3.c-1.detaching.enter',
                    'phase#3.c-1.detaching.leave',
                    'phase#3.c1-c.unbinding.enter',
                    'phase#3.c1-c.unbinding.leave',
                    'phase#3.c-1.unbinding.enter',
                    'phase#3.c-1.unbinding.leave',
                    'phase#3.c-2.binding.enter',
                    'phase#3.c-2.binding.leave',
                    'phase#3.c-2.bound.enter',
                    'phase#3.c-2.bound.leave',
                    'phase#3.c-2.attaching.enter',
                    'phase#3.c-2.attaching.leave',
                    'phase#3.c2-c.binding.enter',
                    'phase#3.c2-c.binding.leave',
                    'phase#3.c2-c.bound.enter',
                    'phase#3.c2-c.bound.leave',
                    'phase#3.c2-c.attaching.enter',
                    'phase#3.c2-c.attaching.leave',
                    'phase#3.c2-c.attached.enter',
                    'phase#3.c2-c.attached.leave',
                    'phase#3.c-2.attached.enter',
                    'phase#3.c-2.attached.leave',
                ], 'phase#3');
                // phase#4: try to activate c-1 - should work - JFF
                mgr.setPrefix('phase#4');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1c', 'phase#4.textContent');
                mgr.assertLog([
                    'phase#4.c2-c.detaching.enter',
                    'phase#4.c2-c.detaching.leave',
                    'phase#4.c-2.detaching.enter',
                    'phase#4.c-2.detaching.leave',
                    'phase#4.c2-c.unbinding.enter',
                    'phase#4.c2-c.unbinding.leave',
                    'phase#4.c-2.unbinding.enter',
                    'phase#4.c-2.unbinding.leave',
                    'phase#4.c-1.binding.enter',
                    'phase#4.c-1.binding.leave',
                    'phase#4.c-1.bound.enter',
                    'phase#4.c-1.bound.leave',
                    'phase#4.c-1.attaching.enter',
                    'phase#4.c-1.attaching.leave',
                    'phase#4.c1-c.binding.enter',
                    'phase#4.c1-c.binding.leave',
                    'phase#4.c1-c.bound.enter',
                    'phase#4.c1-c.bound.leave',
                    'phase#4.c1-c.attaching.enter',
                    'phase#4.c1-c.attaching.leave',
                    'phase#4.c1-c.attached.enter',
                    'phase#4.c1-c.attached.leave',
                    'phase#4.c-1.attached.enter',
                    'phase#4.c-1.attached.leave',
                ], 'phase#4');
                // phase#5: try to activate c-2 with resolved promise - should work
                mgr.setPrefix('phase#5');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                await Promise.resolve();
                assert.html.textContent(appHost, 'c2c', 'phase#5.textContent');
                mgr.assertLog([
                    'phase#5.c1-c.detaching.enter',
                    'phase#5.c1-c.detaching.leave',
                    'phase#5.c-1.detaching.enter',
                    'phase#5.c-1.detaching.leave',
                    'phase#5.c1-c.unbinding.enter',
                    'phase#5.c1-c.unbinding.leave',
                    'phase#5.c-1.unbinding.enter',
                    'phase#5.c-1.unbinding.leave',
                    'phase#5.c-2.binding.enter',
                    'phase#5.c-2.binding.leave',
                    'phase#5.c-2.bound.enter',
                    'phase#5.c-2.bound.leave',
                    'phase#5.c-2.attaching.enter',
                    'phase#5.c-2.attaching.leave',
                    'phase#5.c2-c.binding.enter',
                    'phase#5.c2-c.binding.leave',
                    'phase#5.c2-c.bound.enter',
                    'phase#5.c2-c.bound.leave',
                    'phase#5.c2-c.attaching.enter',
                    'phase#5.c2-c.attaching.leave',
                    'phase#5.c2-c.attached.enter',
                    'phase#5.c2-c.attached.leave',
                    'phase#5.c-2.attached.enter',
                    'phase#5.c-2.attached.leave',
                ], 'phase#5');
                // stop
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    'stop.c2-c.detaching.enter',
                    'stop.c2-c.detaching.leave',
                    'stop.c-2.detaching.enter',
                    'stop.c-2.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    'stop.c2-c.unbinding.enter',
                    'stop.c2-c.unbinding.leave',
                    'stop.c-2.unbinding.enter',
                    'stop.c-2.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c1-c.dispose.enter',
                    'stop.c1-c.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                    'stop.c2-c.dispose.enter',
                    'stop.c2-c.dispose.leave',
                ], 'stop');
            });
            it(`long running promise on ${hook} - promise is rejected`, async function () {
                function getPendingActivationLog(prefix, isDeactivated) {
                    const logs = [];
                    /* eslint-disable no-fallthrough */
                    switch (hook) {
                        case 'attached': logs.push(`${prefix}.c2-c.attached.enter`, `${prefix}.c2-c.attaching.leave`);
                        case 'attaching': logs.push(`${prefix}.c2-c.attaching.enter`, `${prefix}.c2-c.bound.leave`);
                        case 'bound': logs.push(`${prefix}.c2-c.bound.enter`, `${prefix}.c2-c.binding.leave`);
                        case 'binding': logs.push(`${prefix}.c2-c.binding.enter`);
                    }
                    /* eslint-enable no-fallthrough */
                    logs.reverse();
                    logs.unshift(`${prefix}.c1-c.detaching.enter`, `${prefix}.c1-c.detaching.leave`, `${prefix}.c-1.detaching.enter`, `${prefix}.c-1.detaching.leave`, `${prefix}.c1-c.unbinding.enter`, `${prefix}.c1-c.unbinding.leave`, `${prefix}.c-1.unbinding.enter`, `${prefix}.c-1.unbinding.leave`, `${prefix}.c-2.binding.enter`, `${prefix}.c-2.binding.leave`, `${prefix}.c-2.bound.enter`, `${prefix}.c-2.bound.leave`, `${prefix}.c-2.attaching.enter`, `${prefix}.c-2.attaching.leave`);
                    if (!isDeactivated)
                        return logs;
                    logs.push(...(hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#1.c2-c.detaching.enter',
                            'phase#1.c2-c.detaching.leave',
                        ]
                        : []), 'phase#1.c-2.detaching.enter', 'phase#1.c-2.detaching.leave', ...(hook === 'bound' || hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#1.c2-c.unbinding.enter',
                            'phase#1.c2-c.unbinding.leave',
                        ]
                        : []), 'phase#1.c-2.unbinding.enter', 'phase#1.c-2.unbinding.leave');
                    return logs;
                }
                let C1Child = (() => {
                    let _classDecorators = [customElement({ name: 'c1-c', template: 'c1c' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1Child = _classThis = class extends _classSuper {
                    };
                    __setFunctionName(_classThis, "C1Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C1Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C1Child = _classThis;
                })();
                let C2Child = (() => {
                    let _classDecorators = [customElement({ name: 'c2-c', template: 'c2c' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2Child = _classThis = class extends _classSuper {
                        constructor() {
                            super(...arguments);
                            this.promiseManager = resolve(IPromiseManager);
                        }
                        [`$${hook}`](_initiator, _parent) {
                            return this.promiseManager.createPromise();
                        }
                    };
                    __setFunctionName(_classThis, "C2Child");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        C2Child = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return C2Child = _classThis;
                })();
                let C1 = (() => {
                    let _classDecorators = [customElement({ name: 'c-1', template: '<c1-c></c1-c>', dependencies: [C1Child] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C1 = _classThis = class extends _classSuper {
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
                    let _classDecorators = [customElement({ name: 'c-2', template: '<c2-c></c2-c>', dependencies: [C2Child] })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = TestVM;
                    var C2 = _classThis = class extends _classSuper {
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
                class Root extends TestVM {
                    constructor() {
                        super(...arguments);
                        this.showC1 = true;
                    }
                }
                const { au, appHost, container, stop } = createFixture('<c-1 if.bind="showC1"></c-1><c-2 else></c-2>', Root, [C1, C2, INotifierManager, IPromiseManager]);
                const rootVm = au.root.controller.viewModel;
                const promiseManager = container.get(IPromiseManager);
                assert.html.textContent(appHost, 'c1c', 'start.textContent');
                const mgr = container.get(INotifierManager);
                mgr.assertLog([
                    'start.app.binding.enter',
                    'start.app.binding.leave',
                    'start.app.bound.enter',
                    'start.app.bound.leave',
                    'start.app.attaching.enter',
                    'start.app.attaching.leave',
                    'start.c-1.binding.enter',
                    'start.c-1.binding.leave',
                    'start.c-1.bound.enter',
                    'start.c-1.bound.leave',
                    'start.c-1.attaching.enter',
                    'start.c-1.attaching.leave',
                    'start.c1-c.binding.enter',
                    'start.c1-c.binding.leave',
                    'start.c1-c.bound.enter',
                    'start.c1-c.bound.leave',
                    'start.c1-c.attaching.enter',
                    'start.c1-c.attaching.leave',
                    'start.c1-c.attached.enter',
                    'start.c1-c.attached.leave',
                    'start.c-1.attached.enter',
                    'start.c-1.attached.leave',
                    'start.app.attached.enter',
                    'start.app.attached.leave',
                ], 'start');
                const ifCtrl = rootVm.$controller.children[0];
                const ifVm = ifCtrl.viewModel;
                // phase#1: try to activate c-2 with long-running promise
                mgr.setPrefix('phase#1');
                rootVm.showC1 = false;
                const expectedLog = getPendingActivationLog('phase#1', false);
                mgr.assertLog(expectedLog, 'phase#1 - pre-resolve');
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2c' : '', 'phase#1.textContent');
                // trigger deactivation then resolve the promise and wait for everything
                /**
                 * Note on manual deactivation instead of setting the value of the if.bind to false:
                 * The `if`-TC is not preemptive.
                 * That is it waits always for the previous change.
                 * Thus, setting the value of the if.bind to false would only queue the deactivation rather than a pre-emptive action.
                 * We might want to change the `if`-TC to be pre-emptive, but that requires more discussion among team and community.
                 */
                const deactivationPromise = ifVm.elseView.deactivate(ifVm.elseView, ifCtrl);
                promiseManager.reject(new Error('Synthetic test error - phase#1'));
                await Promise.allSettled([promiseManager.currentPromise, deactivationPromise, ifVm['pending']]);
                mgr.assertLog(getPendingActivationLog('phase#1', true), 'phase#1 - post-resolve');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // phase#2: try to activate c-1 - should work
                mgr.setPrefix('phase#2');
                rootVm.showC1 = true;
                await tasksSettled();
                assert.html.textContent(appHost, 'c1c', 'phase#2.textContent');
                mgr.assertLog([
                    'phase#2.c-1.binding.enter',
                    'phase#2.c-1.binding.leave',
                    'phase#2.c-1.bound.enter',
                    'phase#2.c-1.bound.leave',
                    'phase#2.c-1.attaching.enter',
                    'phase#2.c-1.attaching.leave',
                    'phase#2.c1-c.binding.enter',
                    'phase#2.c1-c.binding.leave',
                    'phase#2.c1-c.bound.enter',
                    'phase#2.c1-c.bound.leave',
                    'phase#2.c1-c.attaching.enter',
                    'phase#2.c1-c.attaching.leave',
                    'phase#2.c1-c.attached.enter',
                    'phase#2.c1-c.attached.leave',
                    'phase#2.c-1.attached.enter',
                    'phase#2.c-1.attached.leave',
                ], 'phase#2');
                // phase#3: try to activate c-2 with resolved promise - should work
                promiseManager.setMode('rejected');
                mgr.setPrefix('phase#3');
                rootVm.showC1 = false;
                await tasksSettled();
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2c' : '', 'phase#3.textContent');
                mgr.assertLog(getPendingActivationLog('phase#3', false), 'phase#3');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // phase#4: try to activate c-1 - should work - JFF
                mgr.setPrefix('phase#4');
                rootVm.showC1 = true;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                await Promise.resolve();
                await Promise.resolve();
                assert.html.textContent(appHost, 'c1c', 'phase#4.textContent');
                mgr.assertLog([
                    ...(hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#4.c2-c.detaching.enter',
                            'phase#4.c2-c.detaching.leave',
                        ]
                        : []),
                    'phase#4.c-2.detaching.enter',
                    'phase#4.c-2.detaching.leave',
                    ...(hook === 'bound' || hook === 'attaching' || hook === 'attached'
                        ? [
                            'phase#4.c2-c.unbinding.enter',
                            'phase#4.c2-c.unbinding.leave',
                        ]
                        : []),
                    'phase#4.c-2.unbinding.enter',
                    'phase#4.c-2.unbinding.leave',
                    'phase#4.c-1.binding.enter',
                    'phase#4.c-1.binding.leave',
                    'phase#4.c-1.bound.enter',
                    'phase#4.c-1.bound.leave',
                    'phase#4.c-1.attaching.enter',
                    'phase#4.c-1.attaching.leave',
                    'phase#4.c1-c.binding.enter',
                    'phase#4.c1-c.binding.leave',
                    'phase#4.c1-c.bound.enter',
                    'phase#4.c1-c.bound.leave',
                    'phase#4.c1-c.attaching.enter',
                    'phase#4.c1-c.attaching.leave',
                    'phase#4.c1-c.attached.enter',
                    'phase#4.c1-c.attached.leave',
                    'phase#4.c-1.attached.enter',
                    'phase#4.c-1.attached.leave',
                ], 'phase#4');
                // phase#5: try to activate c-2 with resolved promise - should work
                mgr.setPrefix('phase#5');
                rootVm.showC1 = false;
                await tasksSettled();
                // Wait for the promises in the lifecycle hooks
                await Promise.resolve();
                assert.html.textContent(appHost, hook === 'attached' || hook === 'attaching' ? 'c2c' : '', 'phase#5.textContent');
                mgr.assertLog(getPendingActivationLog('phase#5', false), 'phase#5');
                /** clear pending promise from if as it cannot handle a activation rejection by itself */
                ifVm['pending'] = void 0;
                // stop
                mgr.setPrefix('stop');
                let error = null;
                try {
                    await stop(true);
                }
                catch (e) {
                    error = e;
                }
                assert.strictEqual(error, null, 'stop');
                mgr.assertLog([
                    ...(hook === 'attaching' || hook === 'attached'
                        ? [
                            'stop.c2-c.detaching.enter',
                            'stop.c2-c.detaching.leave',
                        ]
                        : []),
                    'stop.c-2.detaching.enter',
                    'stop.c-2.detaching.leave',
                    'stop.app.detaching.enter',
                    'stop.app.detaching.leave',
                    ...(hook === 'bound' || hook === 'attaching' || hook === 'attached'
                        ? [
                            'stop.c2-c.unbinding.enter',
                            'stop.c2-c.unbinding.leave',
                        ]
                        : []),
                    'stop.c-2.unbinding.enter',
                    'stop.c-2.unbinding.leave',
                    'stop.app.unbinding.enter',
                    'stop.app.unbinding.leave',
                    'stop.app.dispose.enter',
                    'stop.app.dispose.leave',
                    'stop.c-1.dispose.enter',
                    'stop.c-1.dispose.leave',
                    'stop.c1-c.dispose.enter',
                    'stop.c1-c.dispose.leave',
                    'stop.c-2.dispose.enter',
                    'stop.c-2.dispose.leave',
                    'stop.c2-c.dispose.enter',
                    'stop.c2-c.dispose.leave',
                ], 'stop');
            });
        });
    }
});
//# sourceMappingURL=controller.deactivation.partially-activated.spec.js.map