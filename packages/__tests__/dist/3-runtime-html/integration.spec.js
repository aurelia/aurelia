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
import { tasksSettled } from '@aurelia/runtime';
import { BindingMode, Aurelia, CustomElement, customElement, IPlatform, bindable, } from '@aurelia/runtime-html';
import { assert, TestContext, } from '@aurelia/testing';
import { createSpecFunction, } from '../util.js';
describe('3-runtime-html/integration.spec.ts', function () {
    async function runTest(testFunction, { component, registrations, } = {}) {
        const ctx = TestContext.create();
        const host = ctx.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        let error = null;
        let app = null;
        let controller = null;
        try {
            await au
                .register(...registrations)
                .app({ host, component })
                .start();
            app = au.root.controller.viewModel;
            controller = au.root.controller;
        }
        catch (e) {
            error = e;
        }
        const testCtx = new IntegrationTestExecutionContext(ctx, container, host, app, controller, error);
        await testFunction(testCtx);
        if (error === null) {
            await au.stop();
            assert.html.innerEqual(host, '', 'post-detach innerHTML');
        }
        ctx.doc.body.removeChild(host);
    }
    class IntegrationTestExecutionContext {
        constructor(ctx, container, host, app, controller, error) {
            this.ctx = ctx;
            this.container = container;
            this.host = host;
            this.app = app;
            this.controller = controller;
            this.error = error;
        }
        get platform() { return this._platform ?? (this._platform = this.container.get(IPlatform)); }
    }
    const $it = createSpecFunction(runTest);
    class TestData {
        constructor(name, component, registrations = [], verify, only = false) {
            this.name = name;
            this.component = component;
            this.registrations = registrations;
            this.verify = verify;
            this.only = only;
        }
    }
    function* getTestData() {
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<div ref="container" id="cr">1</div><child ref="child" id="child"></child><div ref="container2" id="cr2">11</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.container = void 0;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<div ref="container" id="cc">2</div><grand-child ref="grandChild" id="grandChild"></grand-child><div ref="container2" id="cc2">22</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Child = _classThis = class {
                    constructor() {
                        this.container = void 0;
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let GrandChild = (() => {
                let _classDecorators = [customElement({ name: 'grand-child', template: '<div ref="container" id="cgc">3</div><div ref="container2" id="cgc2">33</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChild = _classThis = class {
                    constructor() {
                        this.container = void 0;
                    }
                };
                __setFunctionName(_classThis, "GrandChild");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChild = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChild = _classThis;
            })();
            yield new TestData(
            // depending on TS config, explicitly uninitialized, and non-defined properties might or might not be same.
            'ref-binding with initialized, uninitialized, and non-defined properties', App, [Child, GrandChild], function (ctx) {
                const app = ctx.app;
                const container = app.container;
                const host = ctx.host;
                assert.strictEqual(container, host.querySelector('#cr'), '#cr');
                assert.strictEqual(app['container2'], host.querySelector('#cr2'), '#cr2');
                assert.html.textContent(container, '1');
                const childEl = host.querySelector('#child');
                assert.strictEqual(app.child, childEl);
                const childVm = CustomElement.for(childEl).viewModel;
                const childContainer = childVm.container;
                assert.strictEqual(childEl.querySelector('#cc'), childContainer, '#cc');
                assert.strictEqual(childVm['container2'], childEl.querySelector('#cc2'), '#cc2');
                assert.html.textContent(childContainer, '2');
                const grandChildEl = childEl.querySelector('#grandChild');
                assert.strictEqual(childVm.grandChild, grandChildEl, '#grandChild');
                const grandChildVm = CustomElement.for(grandChildEl).viewModel;
                const grandChildContainer = grandChildVm.container;
                assert.strictEqual(grandChildEl.querySelector('#cgc'), grandChildContainer, '#cgc');
                assert.strictEqual(grandChildVm['container2'], grandChildEl.querySelector('#cgc2'), '#cgc2');
                assert.html.textContent(grandChildContainer, '3');
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `
        <child component.ref="c1" id="c1"></child>
        <child component.ref="c2" id="c2"></child>
        <child component.ref="c3" id="c3"></child>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.c1 = void 0;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Child = _classThis = class {
                    constructor() {
                        this.id = Child.id++;
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.id = 1;
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            yield new TestData(
            // depending on TS config, explicitly uninitialized, and non-defined properties might or might not be same.
            'view-model.ref-binding with initialized, uninitialized, and non-defined properties', App, [Child], function (ctx) {
                const app = ctx.app;
                const c1 = app.c1;
                const c2 = app.c2;
                const c3 = app['c3'];
                assert.strictEqual(c1.id, 1);
                assert.instanceOf(c1, Child);
                assert.strictEqual(c2.id, 2);
                assert.instanceOf(c2, Child);
                assert.strictEqual(c3.id, 3);
                assert.instanceOf(c3, Child);
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<child value.from-view="value"></child><div id="cr">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = 1;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<grand-child value.from-view="value"></grand-child><div id="cc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Child = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let GrandChild = (() => {
                let _classDecorators = [customElement({ name: 'grand-child', template: '<div id="cgc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var GrandChild = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, 3);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "GrandChild");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChild = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChild = _classThis;
            })();
            yield new TestData('from-view with change', App, [Child, GrandChild], async function (ctx) {
                const app = ctx.app;
                const host = ctx.host;
                const cgc = host.querySelector('#cgc');
                const cc = host.querySelector('#cc');
                const cr = host.querySelector('#cr');
                assert.html.textContent(cgc, '3');
                assert.html.textContent(cc, '3');
                assert.html.textContent(cr, '3');
                const childVm = CustomElement.for(host.querySelector('child')).viewModel;
                assert.strictEqual(childVm.value, 3);
                assert.strictEqual(app.value, 3);
                const grandchildVm = CustomElement.for(host.querySelector('grand-child')).viewModel;
                grandchildVm.value = 42;
                await tasksSettled();
                assert.html.textContent(cgc, '42');
                assert.html.textContent(cc, '42');
                assert.html.textContent(cr, '42');
                assert.strictEqual(childVm.value, 42);
                assert.strictEqual(app.value, 42);
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<child value.to-view="value"></child><div id="cr">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = 1;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<grand-child value.to-view="value"></grand-child><div id="cc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Child = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let GrandChild = (() => {
                let _classDecorators = [customElement({ name: 'grand-child', template: '<div id="cgc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var GrandChild = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, 3);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "GrandChild");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChild = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChild = _classThis;
            })();
            yield new TestData('to-view with change', App, [Child, GrandChild], async function (ctx) {
                const app = ctx.app;
                const host = ctx.host;
                const cgc = host.querySelector('#cgc');
                const cc = host.querySelector('#cc');
                const cr = host.querySelector('#cr');
                assert.html.textContent(cgc, '1');
                assert.html.textContent(cc, '1');
                assert.html.textContent(cr, '1');
                const childVm = CustomElement.for(host.querySelector('child')).viewModel;
                const grandchildVm = CustomElement.for(host.querySelector('grand-child')).viewModel;
                assert.strictEqual(grandchildVm.value, 1);
                assert.strictEqual(childVm.value, 1);
                app.value = 42;
                await tasksSettled();
                assert.html.textContent(cgc, '42');
                assert.html.textContent(cc, '42');
                assert.html.textContent(cr, '42');
                assert.strictEqual(grandchildVm.value, 42);
                assert.strictEqual(childVm.value, 42);
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<child value.two-way="value"></child><div id="cr">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = 1;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<grand-child value.two-way="value"></grand-child><div id="cc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Child = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let GrandChild = (() => {
                let _classDecorators = [customElement({ name: 'grand-child', template: '<div id="cgc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var GrandChild = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, 3);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "GrandChild");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChild = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChild = _classThis;
            })();
            yield new TestData('two-way with change', App, [Child, GrandChild], async function (ctx) {
                const app = ctx.app;
                const host = ctx.host;
                const cgc = host.querySelector('#cgc');
                const cc = host.querySelector('#cc');
                const cr = host.querySelector('#cr');
                assert.html.textContent(cgc, '1');
                assert.html.textContent(cc, '1');
                assert.html.textContent(cr, '1');
                const childVm = CustomElement.for(host.querySelector('child')).viewModel;
                const grandchildVm = CustomElement.for(host.querySelector('grand-child')).viewModel;
                assert.strictEqual(grandchildVm.value, 1);
                assert.strictEqual(childVm.value, 1);
                grandchildVm.value = 42;
                await tasksSettled();
                assert.html.textContent(cgc, '42');
                assert.html.textContent(cc, '42');
                assert.html.textContent(cr, '42');
                assert.strictEqual(childVm.value, 42);
                assert.strictEqual(app.value, 42);
                childVm.value = 24;
                await tasksSettled();
                assert.html.textContent(cgc, '24');
                assert.html.textContent(cc, '24');
                assert.html.textContent(cr, '24');
                assert.strictEqual(grandchildVm.value, 24);
                assert.strictEqual(app.value, 24);
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<child value.to-view="value"></child><div id="cr">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = 1;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<div id="cc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Child = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable({ mode: BindingMode.fromView })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            yield new TestData('to-view (root) -> from-view (child)', App, [Child], async function (ctx) {
                const app = ctx.app;
                const host = ctx.host;
                const cc = host.querySelector('#cc');
                const cr = host.querySelector('#cr');
                assert.html.textContent(cc, '1', 'cc.text.1');
                assert.html.textContent(cr, '1', 'cr.text.1');
                const childVm = CustomElement.for(host.querySelector('child')).viewModel;
                assert.strictEqual(childVm.value, 1, 'child.value.1');
                childVm.value = 42;
                await tasksSettled();
                assert.strictEqual(app.value, 1, 'app.value.2');
                assert.html.textContent(cc, '42', 'cc.text.2');
                assert.html.textContent(cr, '1', 'cr.text.2');
                app.value = 24;
                await tasksSettled();
                assert.strictEqual(childVm.value, 24, 'child.value.3');
                assert.html.textContent(cc, '24', 'cc.text.3');
                assert.html.textContent(cr, '24', 'cr.text.3');
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<child value.from-view="value"></child><div id="cr">${value}</div>' })];
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<div id="cc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Child = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, 2);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable({ mode: BindingMode.toView })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            yield new TestData('to-view (child) -> from-view (root)', App, [Child], async function (ctx) {
                const app = ctx.app;
                const host = ctx.host;
                const cc = host.querySelector('#cc');
                const cr = host.querySelector('#cr');
                assert.html.textContent(cc, '2', 'cc.text.1');
                assert.html.textContent(cr, '2', 'cr.text.1');
                assert.strictEqual(app.value, 2, 'app.value.1');
                app.value = 24;
                await tasksSettled();
                const childVm = CustomElement.for(host.querySelector('child')).viewModel;
                assert.strictEqual(childVm.value, 2, 'child.value.2');
                assert.html.textContent(cc, '2', 'cc.text.2');
                assert.html.textContent(cr, '24', 'cr.text.2');
                childVm.value = 42;
                await tasksSettled();
                assert.strictEqual(app.value, 42, 'app.value.3');
                assert.html.textContent(cc, '42', 'cc.text.3');
                assert.html.textContent(cr, '42', 'cr.text.3');
            });
        }
        {
            let App = (() => {
                let _classDecorators = [customElement({ name: 'app', template: '<child value.two-way="value"></child><div id="cr">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = 1;
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
            let Child = (() => {
                let _classDecorators = [customElement({ name: 'child', template: '<grand-child if.bind="condition" value.two-way="value"></grand-child><div id="cc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Child = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        this.condition = (__runInitializers(this, _value_extraInitializers), false);
                    }
                };
                __setFunctionName(_classThis, "Child");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Child = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Child = _classThis;
            })();
            let GrandChild = (() => {
                let _classDecorators = [customElement({ name: 'grand-child', template: '<div id="cgc">${value}</div>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var GrandChild = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, 3);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "GrandChild");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChild = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChild = _classThis;
            })();
            yield new TestData('property-binding with `if` + change', App, [Child, GrandChild], async function (ctx) {
                const app = ctx.app;
                const host = ctx.host;
                assert.strictEqual(host.querySelector('grand-child'), null);
                assert.strictEqual(host.querySelector('#cgc'), null);
                const cc = host.querySelector('#cc');
                const cr = host.querySelector('#cr');
                assert.html.textContent(cc, '1');
                assert.html.textContent(cr, '1');
                const childVm = CustomElement.for(host.querySelector('child')).viewModel;
                assert.strictEqual(childVm.value, 1);
                childVm.condition = true;
                await tasksSettled();
                const grandchildVm = CustomElement.for(host.querySelector('grand-child')).viewModel;
                assert.strictEqual(grandchildVm.value, 1);
                const cgc = host.querySelector('#cgc');
                assert.html.textContent(cgc, '1');
                grandchildVm.value = 42;
                await tasksSettled();
                assert.html.textContent(cgc, '42');
                assert.html.textContent(cc, '42');
                assert.html.textContent(cr, '42');
                assert.strictEqual(childVm.value, 42);
                assert.strictEqual(app.value, 42);
            });
        }
        const templates = [
            `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <template repeat.for="i of 3">
                \${$parent.$parent.i + $parent.i + i}
              </template>
            </template>
          </template>
        </template>`,
            `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <let gp.bind="$parent"></let>
              <template repeat.for="i of 3">
                <let p.bind="$parent"></let>
                \${gp.i + p.i + i}
              </template>
            </template>
          </template>
        </template>`,
            `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <template repeat.for="i of 3">
                <let gp.bind="$parent.$parent" p.bind="$parent"></let>
                \${gp.i + p.i + i}
              </template>
            </template>
          </template>
        </template>`,
            `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <template repeat.for="i of 3">
                <let gp.bind="$parent.$parent" p.bind="$parent" k.bind="gp.i" j.bind="p.i"></let>
                \${k + j + i}
              </template>
            </template>
          </template>
        </template>`,
            // The following template is not supported; kept here for documentation purpose.
            // `<template>
            //     <template repeat.for="i of 3">
            //       <template repeat.for="i of 3">
            //         <template repeat.for="i of 3">
            //           <let p.bind="$parent" gp.bind="p.$parent"></let>
            //           \${gp.i + p.i + i}
            //         </template>
            //       </template>
            //     </template>
            //   </template>`,
        ];
        for (let i = 0, ii = templates.length; i < ii; i++) {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: templates[i]
                    })];
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
            yield new TestData(`repeater + $parent - #${i + 1}`, App, [], function (ctx) {
                const host = ctx.host;
                assert.html.textContent(host, '0 1 2 1 2 3 2 3 4 1 2 3 2 3 4 3 4 5 2 3 4 3 4 5 4 5 6');
            });
        }
    }
    for (const data of getTestData()) {
        (data.only ? $it.only : $it)(data.name, async function (ctx) {
            await data.verify(ctx);
        }, data);
    }
});
//# sourceMappingURL=integration.spec.js.map