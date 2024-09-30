var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { ProxyObservable } from '@aurelia/runtime';
import { bindable, ComputedWatcher, customAttribute, customElement, watch, } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
describe('3-runtime-html/decorator-watch.computed.spec.ts', function () {
    it('typings work', function () {
        const symbolMethod = Symbol();
        let App = (() => {
            let _classDecorators = [watch(app => app.col.has(Symbol), 5), watch(app => app.col.has(Symbol), 'someMethod'), watch(app => app.col.has(Symbol), symbolMethod), watch(app => app.col.has(Symbol), (v, o, a) => a.someMethod(v, o, a)), watch((app) => app.col.has(Symbol), 5), watch((app) => app.col.has(Symbol), 'someMethod'), watch((app) => app.col.has(Symbol), symbolMethod), watch((app) => app.col.has(Symbol), (v, o, a) => a.someMethod(v, o, a)), watch('some.expression', 5), watch('some.expression', 'someMethod'), watch('some.expression', symbolMethod), watch('some.expression', (v, o, a) => a.someMethod(v, o, a)), watch('some.expression', function (v, o, a) { a.someMethod(v, o, a); }), watch(Symbol(), 5), watch(Symbol(), 'someMethod'), watch(Symbol(), symbolMethod), watch(Symbol(), (v, o, a) => a.someMethod(v, o, a)), watch(Symbol(), function (v, o, a) { a.someMethod(v, o, a); })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _instanceExtraInitializers = [];
            let _someMethod_decorators;
            var App = _classThis = class {
                constructor() {
                    this.col = __runInitializers(this, _instanceExtraInitializers);
                }
                someMethod(_n, _o, _app) { }
                [(_someMethod_decorators = [watch(app => app.col.has(Symbol)), watch((app) => app.col.has(Symbol)), watch('some.expression'), watch(Symbol()), watch(5)], symbolMethod)](_n, _o, _app) { }
                5(_n, _o, _app) { }
            };
            __setFunctionName(_classThis, "App");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(_classThis, null, _someMethod_decorators, { kind: "method", name: "someMethod", static: false, private: false, access: { has: obj => "someMethod" in obj, get: obj => obj.someMethod }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                App = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return App = _classThis;
        })();
        const app = new App();
        assert.strictEqual(app.col, undefined);
    });
    for (const methodName of [Symbol('method'), 'bla', 5]) {
        it(`validates method "${String(methodName)}" not found when decorating on class`, function () {
            assert.throws(() => {
                let App = (() => {
                    let _classDecorators = [watch('..', methodName)];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var App = _classThis = class {
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                return new App();
            }, 
            // /Invalid change handler config/
            /AUR0773/);
        });
    }
    it('throws on @watch usage on static method', function () {
        assert.throws(() => (() => {
            var _a;
            let _staticExtraInitializers = [];
            let _static_method_decorators;
            return _a = class App {
                    static method() { }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _static_method_decorators = [watch('')];
                    __esDecorate(_a, null, _static_method_decorators, { kind: "method", name: "method", static: true, private: false, access: { has: obj => "method" in obj, get: obj => obj.method }, metadata: _metadata }, null, _staticExtraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_a, _staticExtraInitializers);
                })(),
                _a;
        })(), /AUR0774/);
    });
    it('works in basic scenario', function () {
        let callCount = 0;
        let App = (() => {
            var _a;
            let _instanceExtraInitializers = [];
            let _phoneChanged_decorators;
            return _a = class App {
                    constructor() {
                        this.person = (__runInitializers(this, _instanceExtraInitializers), {
                            first: 'bi',
                            last: 'go',
                            phone: '0134',
                            address: '1/34'
                        });
                        this.name = '';
                    }
                    phoneChanged(phoneValue) {
                        callCount++;
                        this.name = phoneValue;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _phoneChanged_decorators = [watch((test) => test.person.phone)];
                    __esDecorate(_a, null, _phoneChanged_decorators, { kind: "method", name: "phoneChanged", static: false, private: false, access: { has: obj => "phoneChanged" in obj, get: obj => obj.phoneChanged }, metadata: _metadata }, null, _instanceExtraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const { ctx, component, appHost, tearDown } = createFixture(`\${name}`, App);
        // with TS, initialization of class field are in constructor
        assert.strictEqual(callCount, 0);
        component.person.first = 'bi ';
        assert.strictEqual(callCount, 0);
        ctx.platform.domQueue.flush();
        assert.strictEqual(appHost.textContent, '');
        component.person.phone = '0413';
        assert.strictEqual(callCount, 1);
        assert.strictEqual(appHost.textContent, '');
        ctx.platform.domQueue.flush();
        assert.strictEqual(appHost.textContent, '0413');
        void tearDown();
    });
    it('watches deep', function () {
        let callCount = 0;
        let App = (() => {
            var _a;
            let _instanceExtraInitializers = [];
            let _phoneChanged_decorators;
            return _a = class App {
                    constructor() {
                        this.person = (__runInitializers(this, _instanceExtraInitializers), {
                            first: 'bi',
                            last: 'go',
                            phone: '0134',
                            addresses: [
                                {
                                    primary: false,
                                    number: 3,
                                    strName: 'Aus',
                                    state: 'ACT'
                                },
                                {
                                    primary: true,
                                    number: 3,
                                    strName: 'Aus',
                                    state: 'VIC'
                                }
                            ]
                        });
                        this.name = '';
                    }
                    phoneChanged(strName) {
                        callCount++;
                        this.name = strName;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _phoneChanged_decorators = [watch((app) => app.person.addresses.find(addr => addr.primary).strName)];
                    __esDecorate(_a, null, _phoneChanged_decorators, { kind: "method", name: "phoneChanged", static: false, private: false, access: { has: obj => "phoneChanged" in obj, get: obj => obj.phoneChanged }, metadata: _metadata }, null, _instanceExtraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const { ctx, component, appHost, tearDown } = createFixture(`<div>\${name}</div>`, App);
        const textNode = appHost.querySelector('div');
        // with TS, initialization of class field are in constructor
        assert.strictEqual(callCount, 0);
        component.person.addresses[1].state = 'QLD';
        assert.strictEqual(callCount, 0);
        component.person.addresses[1].strName = '3cp';
        assert.strictEqual(callCount, 1);
        assert.strictEqual(textNode.textContent, '');
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, '3cp');
        void tearDown();
        component.person.addresses[1].strName = 'Chunpeng Huo';
        assert.strictEqual(textNode.textContent, '3cp');
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, '3cp');
    });
    describe('timing', function () {
        it('ensures proper timing with custom elements', async function () {
            let childBindingCallCount = 0;
            let childBoundCallCount = 0;
            let childUnbindingCallCount = 0;
            let appBindingCallCount = 0;
            let appBoundCallCount = 0;
            let appUnbindingCallCount = 0;
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: `\${prop}` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _prop_decorators;
                let _prop_initializers = [];
                let _prop_extraInitializers = [];
                let _log_decorators;
                var Child = _classThis = class {
                    constructor() {
                        this.prop = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _prop_initializers, 0));
                        this.logCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                    }
                    log() {
                        this.logCallCount++;
                    }
                    binding() {
                        childBindingCallCount++;
                        assert.strictEqual(this.logCallCount, 0);
                        this.prop++;
                        assert.strictEqual(this.logCallCount, 0);
                    }
                    bound() {
                        childBoundCallCount++;
                        assert.strictEqual(this.logCallCount, 0);
                        this.prop++;
                        assert.strictEqual(this.logCallCount, 1);
                    }
                    unbinding() {
                        childUnbindingCallCount++;
                        // test body prop changed, callCount++
                        assert.strictEqual(this.logCallCount, 2);
                        this.prop++;
                        assert.strictEqual(this.logCallCount, 3);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _prop_decorators = [bindable()];
                    _log_decorators = [watch((child) => child.prop)];
                    __esDecorate(_classThis, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let App = (() => {
                var _a;
                let _instanceExtraInitializers = [];
                let _prop_decorators;
                let _prop_initializers = [];
                let _prop_extraInitializers = [];
                let _log_decorators;
                return _a = class App {
                        constructor() {
                            this.child = __runInitializers(this, _instanceExtraInitializers);
                            this.prop = __runInitializers(this, _prop_initializers, 1);
                            this.logCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                        }
                        log() {
                            this.logCallCount++;
                        }
                        binding() {
                            appBindingCallCount++;
                            assert.strictEqual(this.logCallCount, 0);
                            this.prop++;
                            assert.strictEqual(this.logCallCount, 0);
                        }
                        bound() {
                            appBoundCallCount++;
                            assert.strictEqual(this.logCallCount, 0);
                            assert.strictEqual(this.child.logCallCount, 0);
                            this.prop++;
                            assert.strictEqual(this.logCallCount, 1);
                            // child bound hasn't been called yet,
                            // so watcher won't be activated and thus, no log call
                            assert.strictEqual(this.child.logCallCount, 0);
                        }
                        unbinding() {
                            appUnbindingCallCount++;
                            // already got the modification in the code below, so it starts at 2
                            assert.strictEqual(this.logCallCount, 2);
                            // child unbinding is called before app unbinding
                            assert.strictEqual(this.child.logCallCount, 3);
                            this.prop++;
                            assert.strictEqual(this.logCallCount, 3);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _prop_decorators = [bindable()];
                        _log_decorators = [watch((child) => child.prop)];
                        __esDecorate(_a, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { component, startPromise, tearDown } = createFixture('<child component.ref="child" prop.bind=prop>', App, [Child]);
            await startPromise;
            assert.strictEqual(appBindingCallCount, 1);
            assert.strictEqual(appBoundCallCount, 1);
            assert.strictEqual(appUnbindingCallCount, 0);
            assert.strictEqual(childBindingCallCount, 1);
            assert.strictEqual(childBoundCallCount, 1);
            assert.strictEqual(component.logCallCount, 1);
            assert.strictEqual(component.child.logCallCount, 1);
            component.prop++;
            assert.strictEqual(component.logCallCount, 2);
            assert.strictEqual(component.child.logCallCount, 2);
            const bindings = component.$controller.bindings;
            assert.strictEqual(bindings.length, 3);
            // watcher should be created before all else
            assert.instanceOf(bindings[0], ComputedWatcher);
            const child = component.child;
            const childBindings = child.$controller.bindings;
            assert.strictEqual(childBindings.length, 2);
            // watcher should be created before all else
            assert.instanceOf(childBindings[0], ComputedWatcher);
            await tearDown();
            assert.strictEqual(appBindingCallCount, 1);
            assert.strictEqual(appBoundCallCount, 1);
            assert.strictEqual(appUnbindingCallCount, 1);
            assert.strictEqual(childBindingCallCount, 1);
            assert.strictEqual(childBoundCallCount, 1);
            assert.strictEqual(childUnbindingCallCount, 1);
            assert.strictEqual(component.logCallCount, 3);
            assert.strictEqual(child.logCallCount, 3);
            component.prop++;
            assert.strictEqual(component.logCallCount, 3);
            assert.strictEqual(child.logCallCount, 3);
        });
        it('ensures proper timing with custom attribute', async function () {
            let childBindingCallCount = 0;
            let childBoundCallCount = 0;
            let childUnbindingCallCount = 0;
            let appBindingCallCount = 0;
            let appBoundCallCount = 0;
            let appUnbindingCallCount = 0;
            let Child = (() => {
                let _classDecorators = [customAttribute({ name: 'child' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _prop_decorators;
                let _prop_initializers = [];
                let _prop_extraInitializers = [];
                let _log_decorators;
                var Child = _classThis = class {
                    constructor() {
                        this.prop = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _prop_initializers, 0));
                        this.logCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                    }
                    log() {
                        this.logCallCount++;
                    }
                    binding() {
                        childBindingCallCount++;
                        assert.strictEqual(this.logCallCount, 0);
                        this.prop++;
                        assert.strictEqual(this.logCallCount, 0);
                    }
                    bound() {
                        childBoundCallCount++;
                        assert.strictEqual(this.logCallCount, 0);
                        this.prop++;
                        assert.strictEqual(this.logCallCount, 1);
                    }
                    unbinding() {
                        childUnbindingCallCount++;
                        // test body prop changed, callCount++
                        assert.strictEqual(this.logCallCount, 2);
                        this.prop++;
                        assert.strictEqual(this.logCallCount, 3);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _prop_decorators = [bindable()];
                    _log_decorators = [watch((child) => child.prop)];
                    __esDecorate(_classThis, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let App = (() => {
                var _a;
                let _instanceExtraInitializers = [];
                let _prop_decorators;
                let _prop_initializers = [];
                let _prop_extraInitializers = [];
                let _log_decorators;
                return _a = class App {
                        constructor() {
                            this.child = __runInitializers(this, _instanceExtraInitializers);
                            this.prop = __runInitializers(this, _prop_initializers, 1);
                            this.logCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                        }
                        log() {
                            this.logCallCount++;
                        }
                        binding() {
                            appBindingCallCount++;
                            assert.strictEqual(this.logCallCount, 0);
                            this.prop++;
                            assert.strictEqual(this.logCallCount, 0);
                        }
                        bound() {
                            appBoundCallCount++;
                            assert.strictEqual(this.logCallCount, 0);
                            assert.strictEqual(this.child.logCallCount, 0);
                            this.prop++;
                            assert.strictEqual(this.logCallCount, 1);
                            // child after bind hasn't been called yet,
                            // so watcher won't be activated and thus, no log call
                            assert.strictEqual(this.child.logCallCount, 0);
                        }
                        unbinding() {
                            appUnbindingCallCount++;
                            // already got the modification in the code below, so it starts at 2
                            assert.strictEqual(this.logCallCount, 2);
                            // child unbinding is aclled before this unbinding
                            assert.strictEqual(this.child.logCallCount, 3);
                            this.prop++;
                            assert.strictEqual(this.logCallCount, 3);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _prop_decorators = [bindable()];
                        _log_decorators = [watch((child) => child.prop)];
                        __esDecorate(_a, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { component, startPromise, tearDown } = createFixture('<div child.bind="prop" child.ref="child">', App, [Child]);
            await startPromise;
            assert.strictEqual(appBindingCallCount, 1);
            assert.strictEqual(appBoundCallCount, 1);
            assert.strictEqual(appUnbindingCallCount, 0);
            assert.strictEqual(childBindingCallCount, 1);
            assert.strictEqual(childBoundCallCount, 1);
            assert.strictEqual(component.logCallCount, 1);
            assert.strictEqual(component.child.logCallCount, 1);
            component.prop++;
            assert.strictEqual(component.logCallCount, 2);
            assert.strictEqual(component.child.logCallCount, 2);
            const bindings = component.$controller.bindings;
            assert.strictEqual(bindings.length, 3);
            // watcher should be created before all else
            assert.instanceOf(bindings[0], ComputedWatcher);
            const child = component.child;
            const childBindings = child.$controller.bindings;
            assert.strictEqual(childBindings.length, 1);
            // watcher should be created before all else
            assert.instanceOf(childBindings[0], ComputedWatcher);
            await tearDown();
            assert.strictEqual(appBindingCallCount, 1);
            assert.strictEqual(appBoundCallCount, 1);
            assert.strictEqual(appUnbindingCallCount, 1);
            assert.strictEqual(childBindingCallCount, 1);
            assert.strictEqual(childBoundCallCount, 1);
            assert.strictEqual(childUnbindingCallCount, 1);
            assert.strictEqual(component.logCallCount, 3);
            assert.strictEqual(child.logCallCount, 3);
            component.prop++;
            assert.strictEqual(component.logCallCount, 3);
            assert.strictEqual(child.logCallCount, 3);
        });
    });
    it('observes collection', function () {
        let callCount = 0;
        let PostOffice = (() => {
            var _a;
            let _instanceExtraInitializers = [];
            let _onDelivered_decorators;
            return _a = class PostOffice {
                    constructor() {
                        this.storage = (__runInitializers(this, _instanceExtraInitializers), [
                            { id: 1, name: 'box', delivered: false },
                            { id: 2, name: 'toy', delivered: true },
                            { id: 3, name: 'letter', delivered: false },
                        ]);
                        (this.deliveries = [this.storage[1]]).toString = function () {
                            return json(this);
                        };
                    }
                    newDelivery(delivery) {
                        this.storage.push(delivery);
                    }
                    delivered(id) {
                        const delivery = this.storage.find(delivery => delivery.id === id);
                        if (delivery != null) {
                            delivery.delivered = true;
                        }
                    }
                    onDelivered(deliveries) {
                        callCount++;
                        deliveries.toString = function () {
                            return json(this);
                        };
                        this.deliveries = deliveries;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _onDelivered_decorators = [watch((postOffice) => postOffice.storage.filter(d => d.delivered))];
                    __esDecorate(_a, null, _onDelivered_decorators, { kind: "method", name: "onDelivered", static: false, private: false, access: { has: obj => "onDelivered" in obj, get: obj => obj.onDelivered }, metadata: _metadata }, null, _instanceExtraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const { ctx, component, appHost, tearDown } = createFixture(`<div>\${deliveries}</div>`, PostOffice);
        const textNode = appHost.querySelector('div');
        assert.strictEqual(callCount, 0);
        assert.strictEqual(textNode.textContent, json([{ id: 2, name: 'toy', delivered: true }]));
        component.newDelivery({ id: 4, name: 'cookware', delivered: false });
        assert.strictEqual(callCount, 1);
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, json([{ id: 2, name: 'toy', delivered: true }]));
        component.delivered(1);
        assert.strictEqual(callCount, 2);
        assert.strictEqual(textNode.textContent, json([{ id: 2, name: 'toy', delivered: true }]));
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, json([
            { id: 1, name: 'box', delivered: true },
            { id: 2, name: 'toy', delivered: true }
        ]));
        void tearDown();
        assert.strictEqual(appHost.textContent, '');
        component.newDelivery({ id: 5, name: 'gardenware', delivered: true });
        component.delivered(3);
        assert.strictEqual(textNode.textContent, json([
            { id: 1, name: 'box', delivered: true },
            { id: 2, name: 'toy', delivered: true }
        ]));
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, json([
            { id: 1, name: 'box', delivered: true },
            { id: 2, name: 'toy', delivered: true }
        ]));
        assert.strictEqual(appHost.textContent, '');
    });
    it('observes chain lighting', function () {
        let callCount = 0;
        let PostOffice = (() => {
            var _a;
            let _instanceExtraInitializers = [];
            let _boxDelivered_decorators;
            return _a = class PostOffice {
                    constructor() {
                        this.storage = (__runInitializers(this, _instanceExtraInitializers), [
                            { id: 1, name: 'box', delivered: false },
                            { id: 2, name: 'toy', delivered: true },
                            { id: 3, name: 'letter', delivered: false },
                        ]);
                        this.deliveries = 0;
                    }
                    newDelivery(delivery) {
                        this.storage.push(delivery);
                    }
                    delivered(id) {
                        const delivery = this.storage.find(delivery => delivery.id === id);
                        if (delivery != null) {
                            delivery.delivered = true;
                        }
                    }
                    boxDelivered(deliveries) {
                        callCount++;
                        this.deliveries = deliveries;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _boxDelivered_decorators = [watch((postOffice) => postOffice
                            .storage
                            .filter(d => d.delivered)
                            .filter(d => d.name === 'box')
                            .length)];
                    __esDecorate(_a, null, _boxDelivered_decorators, { kind: "method", name: "boxDelivered", static: false, private: false, access: { has: obj => "boxDelivered" in obj, get: obj => obj.boxDelivered }, metadata: _metadata }, null, _instanceExtraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const { ctx, component, appHost, tearDown } = createFixture(`<div>\${deliveries}</div>`, PostOffice);
        const textNode = appHost.querySelector('div');
        assert.strictEqual(callCount, 0);
        assert.strictEqual(textNode.textContent, '0');
        component.newDelivery({ id: 4, name: 'cookware', delivered: false });
        assert.strictEqual(callCount, 0);
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, '0');
        component.delivered(1);
        assert.strictEqual(callCount, 1);
        assert.strictEqual(textNode.textContent, '0');
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, '1');
        void tearDown();
        component.newDelivery({ id: 5, name: 'gardenware', delivered: true });
        component.delivered(3);
        assert.strictEqual(textNode.textContent, '1');
        assert.strictEqual(callCount, 1);
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, '1');
        component.newDelivery({ id: 6, name: 'box', delivered: true });
        ctx.platform.domQueue.flush();
        assert.strictEqual(textNode.textContent, '1');
    });
    describe('Array', function () {
        const testCases = [
            ...[
                ['.push()', (post) => post.packages.push({ id: 10, name: 'box 10', delivered: true })],
                ['.pop()', (post) => post.packages.pop()],
                ['.shift()', (post) => post.packages.shift()],
                ['.unshift()', (post) => post.packages.unshift({ id: 10, name: 'box 10', delivered: true })],
                ['.splice()', (post) => post.packages.splice(0, 1, { id: 10, name: 'box 10', delivered: true })],
                ['.reverse()', (post) => post.packages.reverse()],
            ].map(([name, getter]) => ({
                title: `does NOT observe mutation method ${name}`,
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: getter,
                created: post => {
                    assert.strictEqual(post.callCount, 0);
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 0);
                    post.newDelivery(5, 'box 5');
                    assert.strictEqual(post.callCount, 0);
                },
                disposed: post => {
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(2);
                    assert.strictEqual(post.callCount, 0);
                },
            })),
            {
                title: 'observes .filter()',
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: post => post.packages.filter(d => d.delivered).length,
                created: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.newDelivery(5, 'box 5');
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                },
                disposed: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.delivered(2);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                },
            },
            {
                title: 'observes .find()',
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: post => post.packages.find(d => d.delivered),
                created: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.undelivered(4);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.undelivered(1);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                },
                disposed: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                },
            },
            ...[
                ['.indexOf()', (post) => post.packages.indexOf(post.selected)],
                ['.findIndex()', (post) => post.packages.findIndex(v => v === post.selected)],
                ['.lastIndexOf()', (post) => post.packages.lastIndexOf(post.selected)],
                ['.includes()', (post) => post.packages.includes(post.selected)],
            ].map(([name, getter]) => ({
                title: `observes ${name}`,
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: getter,
                created: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    post.selected = post.packages[2];
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.selected = null;
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.selected = post.packages[1];
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                },
                disposed: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                    post.selected = post.packages[1];
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                },
            })),
            {
                title: 'observes .some()',
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: post => post.packages.some(d => d.delivered),
                created: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.undelivered(4);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.undelivered(1);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                },
                disposed: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                },
            },
            {
                title: 'observes .every()',
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: post => post.packages.every(d => d.delivered),
                created: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(2);
                    assert.strictEqual(post.callCount, 0);
                    post.delivered(3);
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                },
                disposed: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                },
            },
            ...[
                ['.slice()', (post) => post.packages.slice(0).map(d => d.delivered).join(', ')],
                ['.map()', (post) => post.packages.map(d => d.delivered).join(', ')],
                ['.flat()', (post) => post.packages.flat().map(d => d.delivered).join(', ')],
                ['.flatMap()', (post) => post.packages.flatMap(d => [d.id, d.delivered]).join(', ')],
                ['for..in', (post) => {
                        const results = [];
                        const packages = post.packages;
                        // eslint-disable-next-line
                        for (const i in packages) {
                            results.push(packages[i].delivered);
                        }
                        return results.join(', ');
                    }],
                ['.reduce()', (post) => post
                        .packages
                        .reduce((str, d, idx, arr) => `${str}${idx === arr.length - 1 ? d.delivered : `, ${d.delivered}`}`, ''),
                ],
                ['.reduceRight()', (post) => post
                        .packages
                        .reduceRight((str, d, idx, arr) => `${str}${idx === arr.length - 1 ? d.delivered : `, ${d.delivered}`}`, ''),
                ],
            ].map(([name, getter]) => ({
                title: `observes ${name}`,
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: getter,
                created: (post) => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                    post.newDelivery(5, 'box 5');
                    assert.strictEqual(post.callCount, 4 * decoratorCount);
                    post.packages[0].name = 'h';
                    assert.strictEqual(post.callCount, 4 * decoratorCount);
                },
                disposed: post => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 4 * decoratorCount);
                    post.delivered(2);
                    assert.strictEqual(post.callCount, 4 * decoratorCount);
                },
            })),
            ...[
                ['for..of', (post) => {
                        const result = [];
                        for (const p of post.packages) {
                            result.push(p.delivered);
                        }
                        return result.join(', ');
                    }],
                ['.entries()', (post) => {
                        const result = [];
                        for (const p of post.packages.entries()) {
                            result.push(p[1].delivered);
                        }
                        return result.join(', ');
                    }],
                ['.values()', (post) => {
                        const result = [];
                        for (const p of post.packages.values()) {
                            result.push(p.delivered);
                        }
                        return result.join(', ');
                    }],
                ['.keys()', (post) => {
                        const result = [];
                        for (const index of post.packages.keys()) {
                            result.push(post.packages[index].delivered);
                        }
                        return result.join(', ');
                    }],
            ].map(([name, getter]) => ({
                title: `observers ${name}`,
                init: () => Array.from({ length: 3 }, (_, idx) => ({ id: idx + 1, name: `box ${idx + 1}`, delivered: false })),
                get: getter,
                created: (post) => {
                    const decoratorCount = post.decoratorCount;
                    assert.strictEqual(post.callCount, 0);
                    // mutate                       // assert the effect
                    post.newDelivery(4, 'box 4');
                    assert.strictEqual(post.callCount, 1 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 2 * decoratorCount);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                },
                disposed: (post) => {
                    const decoratorCount = post.decoratorCount;
                    post.newDelivery(5, 'box 5');
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                    post.delivered(4);
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                    post.delivered(1);
                    assert.strictEqual(post.callCount, 3 * decoratorCount);
                },
            })),
        ];
        for (const { title, only, init, get, created, disposed } of testCases) {
            const $it = only ? it.only : it;
            $it(`${title} on class`, async function () {
                let App = (() => {
                    let _classDecorators = [watch(get, 'log')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var App = _classThis = class {
                        constructor() {
                            this.decoratorCount = 1;
                            this.packages = init?.() ?? [];
                            this.counter = 0;
                            this.callCount = 0;
                        }
                        delivered(id) {
                            const p = this.packages.find(p => p.id === id);
                            if (p) {
                                p.delivered = true;
                            }
                        }
                        undelivered(id) {
                            const p = this.packages.find(p => p.id === id);
                            if (p) {
                                p.delivered = false;
                            }
                        }
                        newDelivery(id, name, delivered = false) {
                            this.packages.push({ id, name, delivered });
                        }
                        log() {
                            this.callCount++;
                        }
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                const { component, ctx, startPromise, tearDown } = createFixture('', App);
                await startPromise;
                created(component, ctx, 1);
                await tearDown();
                disposed?.(component, ctx, 1);
            });
            $it(`${title} on method`, async function () {
                let App = (() => {
                    var _a;
                    let _instanceExtraInitializers = [];
                    let _log_decorators;
                    return _a = class App {
                            constructor() {
                                this.decoratorCount = (__runInitializers(this, _instanceExtraInitializers), 1);
                                this.packages = init?.() ?? [];
                                this.counter = 0;
                                this.callCount = 0;
                            }
                            delivered(id) {
                                const p = this.packages.find(p => p.id === id);
                                if (p) {
                                    p.delivered = true;
                                }
                            }
                            undelivered(id) {
                                const p = this.packages.find(p => p.id === id);
                                if (p) {
                                    p.delivered = false;
                                }
                            }
                            newDelivery(id, name, delivered = false) {
                                this.packages.push({ id, name, delivered });
                            }
                            log() {
                                this.callCount++;
                            }
                        },
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _log_decorators = [watch(get)];
                            __esDecorate(_a, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })(),
                        _a;
                })();
                const { component, ctx, startPromise, tearDown } = createFixture('', App);
                await startPromise;
                created(component, ctx, 1);
                await tearDown();
                disposed?.(component, ctx, 1);
            });
            $it(`${title} on both class and method`, async function () {
                let App = (() => {
                    let _classDecorators = [watch(get, 'log')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _instanceExtraInitializers = [];
                    let _log_decorators;
                    var App = _classThis = class {
                        constructor() {
                            this.decoratorCount = (__runInitializers(this, _instanceExtraInitializers), 2);
                            this.packages = init?.() ?? [];
                            this.counter = 0;
                            this.callCount = 0;
                        }
                        delivered(id) {
                            const p = this.packages.find(p => p.id === id);
                            if (p) {
                                p.delivered = true;
                            }
                        }
                        undelivered(id) {
                            const p = this.packages.find(p => p.id === id);
                            if (p) {
                                p.delivered = false;
                            }
                        }
                        newDelivery(id, name, delivered = false) {
                            this.packages.push({ id, name, delivered });
                        }
                        log() {
                            this.callCount++;
                        }
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _log_decorators = [watch(get)];
                        __esDecorate(_classThis, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                const { component, ctx, startPromise, tearDown } = createFixture('', App);
                await startPromise;
                created(component, ctx, 1);
                await tearDown();
                disposed?.(component, ctx, 1);
            });
        }
    });
    describe('Map', function () {
        const symbol = Symbol();
        const testCases = [
            {
                title: 'observes .get()',
                get: (app) => app.map.get(symbol),
                created: (app) => {
                    app.map.set(symbol, 0);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.map.delete(symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
                disposed: (app) => {
                    app.map.set(symbol, 'a');
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount, 'after disposed');
                },
            },
            {
                title: 'observes .has()',
                get: app => app.map.has(symbol) ? ++ProxyObservable.getRaw(app).counter : 0,
                created: (app) => {
                    assert.strictEqual(app.counter, 0);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(symbol, '');
                    assert.strictEqual(app.counter, app.decoratorCount);
                    assert.strictEqual(app.callCount, app.decoratorCount);
                },
                disposed: (app) => {
                    assert.strictEqual(app.counter, app.decoratorCount);
                    assert.strictEqual(app.callCount, app.decoratorCount);
                    app.map.set(symbol, '');
                    assert.strictEqual(app.counter, app.decoratorCount);
                    assert.strictEqual(app.callCount, app.decoratorCount);
                },
            },
            {
                title: 'observes .keys()',
                get: app => Array.from(app.map.keys()).filter(k => k === symbol).length,
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.map.set('a', 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(symbol, '1');
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            },
            {
                title: 'observers .values()',
                get: app => Array.from(app.map.values()).filter(v => v === symbol).length,
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    // mutate                     // assert the effect
                    app.map.set('a', 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set('a', symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.map.set('b', symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
            },
            {
                title: 'observers @@Symbol.iterator',
                get: app => {
                    let count = 0;
                    for (const [, value] of app.map) {
                        if (value === symbol)
                            count++;
                    }
                    return count;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    // mutate                     // assert the effect
                    app.map.set('a', 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set('a', symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.map.set('b', symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
            },
            {
                title: 'observers .entries()',
                get: app => {
                    let count = 0;
                    for (const [, value] of app.map.entries()) {
                        if (value === symbol)
                            count++;
                    }
                    return count;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    // mutate                     // assert the effect
                    app.map.set('a', 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set('a', symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.map.set('b', symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
            },
            {
                title: 'observes .size',
                get: app => app.map.size,
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(symbol, 2);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.map.set(symbol, 1);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.map.set(1, symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
            },
            {
                title: 'does not observe mutation by .set()',
                get: app => app.map.set(symbol, 1),
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(symbol, 2);
                    app.map.set(1, symbol);
                    assert.strictEqual(app.callCount, 0);
                },
            },
            {
                title: 'does not observe mutation by .delete()',
                get: app => app.map.delete(symbol),
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(symbol, 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(1, 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(1, symbol);
                    assert.strictEqual(app.callCount, 0);
                },
            },
            {
                title: 'does not observe mutation by .clear()',
                get: app => app.map.clear(),
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(symbol, 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(1, 2);
                    assert.strictEqual(app.callCount, 0);
                    app.map.set(1, symbol);
                    assert.strictEqual(app.callCount, 0);
                },
            },
            {
                title: 'watcher callback is not invoked when getter throws error',
                get: app => {
                    // track
                    // eslint-disable-next-line
                    app.counter;
                    if (ProxyObservable.getRaw(app).started) {
                        throw new Error('err');
                    }
                },
                created: app => {
                    app.started = true;
                    assert.strictEqual(app.callCount, 0);
                    let ex;
                    try {
                        app.counter++;
                    }
                    catch (e) {
                        ex = e;
                    }
                    assert.strictEqual(app.callCount, 0);
                    assert.instanceOf(ex, Error);
                    assert.strictEqual(ex.message, 'err');
                },
            },
            {
                title: 'works with ===',
                get: app => {
                    let has = false;
                    app.map.forEach(v => {
                        if (v === app.selectedItem) {
                            has = true;
                        }
                    });
                    return has;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0, '=== #1');
                    const item1 = {};
                    const item2 = {};
                    app.map = new Map([[1, item1], [2, item2]]);
                    assert.strictEqual(app.callCount, 0, '=== #2');
                    app.selectedItem = item1;
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount, '=== #3');
                },
            },
            {
                title: 'works with Object.is()',
                get: app => {
                    let has = false;
                    app.map.forEach(v => {
                        if (Object.is(v, app.selectedItem)) {
                            has = true;
                        }
                    });
                    return has;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    const item1 = {};
                    const item2 = {};
                    app.map = new Map([[1, item1], [2, item2]]);
                    assert.strictEqual(app.callCount, 0);
                    app.selectedItem = item1;
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            }
        ];
        for (const { title, only = false, get, created, disposed } of testCases) {
            const $it = only ? it.only : it;
            $it(`${title} on method`, async function () {
                let App = (() => {
                    var _a;
                    let _instanceExtraInitializers = [];
                    let _log_decorators;
                    return _a = class App {
                            constructor() {
                                this.started = (__runInitializers(this, _instanceExtraInitializers), false);
                                this.decoratorCount = 1;
                                this.map = new Map();
                                this.selectedItem = void 0;
                                this.counter = 0;
                                this.callCount = 0;
                            }
                            log() {
                                this.callCount++;
                            }
                        },
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _log_decorators = [watch(get)];
                            __esDecorate(_a, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })(),
                        _a;
                })();
                const { ctx, component, startPromise, tearDown } = createFixture('', App);
                await startPromise;
                created(component, ctx, 1);
                await tearDown();
                disposed?.(component, ctx, 1);
            });
            $it(`${title} on class`, async function () {
                let App = (() => {
                    let _classDecorators = [watch(get, (_v, _o, a) => a.log())];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var App = _classThis = class {
                        constructor() {
                            this.started = false;
                            this.decoratorCount = 1;
                            this.map = new Map();
                            this.counter = 0;
                            this.callCount = 0;
                        }
                        log() {
                            this.callCount++;
                        }
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                const { ctx, component, tearDown, startPromise } = createFixture('', App);
                await startPromise;
                created(component, ctx, 1);
                await tearDown();
                disposed?.(component, ctx, 1);
            });
            $it(`${title} on both class and method`, async function () {
                let App = (() => {
                    let _classDecorators = [watch(get, (_v, _o, a) => a.log())];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _instanceExtraInitializers = [];
                    let _log_decorators;
                    var App = _classThis = class {
                        constructor() {
                            this.started = (__runInitializers(this, _instanceExtraInitializers), false);
                            this.decoratorCount = 2;
                            this.map = new Map();
                            this.counter = 0;
                            this.callCount = 0;
                        }
                        log() {
                            this.callCount++;
                        }
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _log_decorators = [watch(get)];
                        __esDecorate(_classThis, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                const { ctx, component, startPromise, tearDown } = createFixture('', App);
                await startPromise;
                created(component, ctx, 2);
                await tearDown();
                disposed?.(component, ctx, 2);
            });
        }
    });
    describe('Set', function () {
        const symbol = Symbol();
        const testCases = [
            {
                title: 'observes .has()',
                get: app => app.set.has(symbol),
                created: (app) => {
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.set.delete(symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
                disposed: (app) => {
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                    app.set.delete(symbol);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                },
            },
            {
                title: 'observes .keys()',
                get: app => Array.from(app.set.keys()).filter(k => k === symbol).length,
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.set.add('a');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            },
            {
                title: 'observers .values()',
                get: app => Array.from(app.set.values()).filter(v => v === symbol).length,
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    // mutate                 // assert the effect
                    app.set.add('a');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add('b');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            },
            {
                title: 'observers @@Symbol.iterator',
                get: app => {
                    let count = 0;
                    for (const value of app.set) {
                        if (value === symbol)
                            count++;
                    }
                    return count;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    // mutate                 // assert the effect
                    app.set.add('a');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add('b');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            },
            {
                title: 'observers .entries()',
                get: app => {
                    let count = 0;
                    for (const [, value] of app.set.entries()) {
                        if (value === symbol)
                            count++;
                    }
                    return count;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    // mutate                 // assert the effect
                    app.set.add('a');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add('b');
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            },
            {
                title: 'observes .size',
                get: app => app.set.size,
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                    app.set.add(2);
                    assert.strictEqual(app.callCount, 2 * app.decoratorCount);
                    app.set.add(1);
                    assert.strictEqual(app.callCount, 3 * app.decoratorCount);
                },
            },
            {
                title: 'does not observe mutation by .add()',
                get: app => app.set.add(symbol),
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(1);
                    app.set.add(2);
                    assert.strictEqual(app.callCount, 0);
                },
            },
            {
                title: 'does not observe mutation by .delete()',
                get: app => app.set.delete(symbol),
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(1);
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(2);
                    assert.strictEqual(app.callCount, 0);
                },
            },
            {
                title: 'does not observe mutation by .clear()',
                get: app => app.set.clear(),
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(symbol);
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(1);
                    assert.strictEqual(app.callCount, 0);
                    app.set.add(2);
                    assert.strictEqual(app.callCount, 0);
                },
            },
            {
                title: 'watcher callback is not invoked when getter throws error',
                get: app => {
                    // track
                    // eslint-disable-next-line
                    app.counter;
                    if (ProxyObservable.getRaw(app).started) {
                        throw new Error('err');
                    }
                    return 0;
                },
                created: app => {
                    app.started = true;
                    assert.strictEqual(app.callCount, 0);
                    let ex;
                    try {
                        app.counter++;
                    }
                    catch (e) {
                        ex = e;
                    }
                    assert.strictEqual(app.callCount, 0);
                    assert.instanceOf(ex, Error);
                    assert.strictEqual(ex.message, 'err');
                },
            },
            {
                title: 'works with ===',
                get: app => {
                    let has = false;
                    app.set.forEach(v => {
                        if (v === app.selectedItem) {
                            has = true;
                        }
                    });
                    return has;
                },
                created: app => {
                    app.started = true;
                    assert.strictEqual(app.callCount, 0, 'Set === #1');
                    const item1 = {};
                    const item2 = {};
                    app.set = new Set([item1, item2]);
                    assert.strictEqual(app.callCount, 0, 'Set === #2');
                    app.selectedItem = item1;
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount, 'Set === #3');
                },
            },
            {
                title: 'works with Object.is()',
                get: app => {
                    let has = false;
                    app.set.forEach(v => {
                        if (Object.is(v, app.selectedItem)) {
                            has = true;
                        }
                    });
                    return has;
                },
                created: app => {
                    assert.strictEqual(app.callCount, 0);
                    const item1 = {};
                    const item2 = {};
                    app.set = new Set([item1, item2]);
                    assert.strictEqual(app.callCount, 0);
                    app.selectedItem = item1;
                    assert.strictEqual(app.callCount, 1 * app.decoratorCount);
                },
            }
        ];
        for (const { title, only = false, get, created, disposed } of testCases) {
            const $it = only ? it.only : it;
            $it(`${title} on method`, async function () {
                let App = (() => {
                    var _a;
                    let _instanceExtraInitializers = [];
                    let _log_decorators;
                    return _a = class App {
                            constructor() {
                                this.started = (__runInitializers(this, _instanceExtraInitializers), false);
                                this.decoratorCount = 1;
                                this.set = new Set();
                                this.selectedItem = void 0;
                                this.counter = 0;
                                this.callCount = 0;
                            }
                            log() {
                                this.callCount++;
                            }
                        },
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _log_decorators = [watch(get)];
                            __esDecorate(_a, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })(),
                        _a;
                })();
                const { ctx, component, startPromise, tearDown } = createFixture('', App);
                try {
                    await startPromise;
                    created(component, ctx, 1);
                }
                finally {
                    await tearDown();
                    disposed?.(component, ctx, 1);
                }
            });
            $it(`${title} on class`, async function () {
                let App = (() => {
                    let _classDecorators = [watch(get, (_v, _o, a) => a.log())];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var App = _classThis = class {
                        constructor() {
                            this.started = false;
                            this.decoratorCount = 1;
                            this.set = new Set();
                            this.counter = 0;
                            this.callCount = 0;
                        }
                        log() {
                            this.callCount++;
                        }
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                const { ctx, component, tearDown, startPromise } = createFixture('', App);
                try {
                    await startPromise;
                    created(component, ctx, 1);
                }
                finally {
                    await tearDown();
                    disposed?.(component, ctx, 1);
                }
            });
            $it(`${title} on both class and method`, async function () {
                let App = (() => {
                    let _classDecorators = [watch(get, (_v, _o, a) => a.log())];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _instanceExtraInitializers = [];
                    let _log_decorators;
                    var App = _classThis = class {
                        constructor() {
                            this.started = (__runInitializers(this, _instanceExtraInitializers), false);
                            this.decoratorCount = 2;
                            this.set = new Set();
                            this.counter = 0;
                            this.callCount = 0;
                        }
                        log() {
                            this.callCount++;
                        }
                    };
                    __setFunctionName(_classThis, "App");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _log_decorators = [watch(get)];
                        __esDecorate(_classThis, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        App = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return App = _classThis;
                })();
                const { ctx, component, startPromise, tearDown } = createFixture('', App);
                try {
                    await startPromise;
                    created(component, ctx, 2);
                }
                finally {
                    await tearDown();
                    disposed?.(component, ctx, 2);
                }
            });
        }
    });
    function json(d) {
        return JSON.stringify(d);
    }
    it('initialises once for each instance', function () {
        const logs = [];
        let MyButton = (() => {
            let _classDecorators = [customElement({
                    name: 'my-button',
                    template: '<button click.trigger="count++">Count: ${count}</button>'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _instanceExtraInitializers = [];
            let _logCountChanged_decorators;
            var MyButton = _classThis = class {
                constructor() {
                    this.count = (__runInitializers(this, _instanceExtraInitializers), 0);
                }
                logCountChanged() {
                    logs.push(this.count);
                }
            };
            __setFunctionName(_classThis, "MyButton");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _logCountChanged_decorators = [watch('count')];
                __esDecorate(_classThis, null, _logCountChanged_decorators, { kind: "method", name: "logCountChanged", static: false, private: false, access: { has: obj => "logCountChanged" in obj, get: obj => obj.logCountChanged }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyButton = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyButton = _classThis;
        })();
        const { getAllBy } = createFixture('<my-button repeat.for="i of 3">', {}, [MyButton]);
        const buttons = getAllBy('button');
        assert.strictEqual(buttons.length, 3);
        buttons.forEach(button => button.click());
        assert.deepStrictEqual(logs, [1, 1, 1]);
    });
});
//# sourceMappingURL=decorator-watch.computed.spec.js.map