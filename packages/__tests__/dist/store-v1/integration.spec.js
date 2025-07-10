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
import { Aurelia, customElement } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';
import { StoreConfiguration, Store, connectTo, dispatchify } from "@aurelia/store-v1";
async function createFixture({ component, options, initialState }) {
    const ctx = TestContext.create();
    const host = ctx.platform.document.createElement('app');
    const au = new Aurelia(ctx.container);
    const actualState = typeof initialState === "undefined"
        ? {
            foo: "bar",
            bar: "whatever"
        }
        : initialState;
    await au.register(StoreConfiguration.withInitialState(actualState)
        .withOptions(options))
        .app({ host, component })
        .start();
    const store = au.container.get(Store);
    return {
        container: au.container,
        ctx,
        initialState: actualState,
        store,
        host,
        tearDown: async () => {
            await au.stop();
        }
    };
}
describe("store-v1/integration.spec.ts", function () {
    this.timeout(100);
    it("should allow to use the store without any options by using defaults", async function () {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor(store) {
                    this.store = store;
                    this.storeSubscription = this.store.state.subscribe((state) => this.state = state);
                }
                unbinding() {
                    this.storeSubscription.unsubscribe();
                }
            };
            __setFunctionName(_classThis, "App");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                App = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })();
            _classThis.inject = [Store];
            (() => {
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return App = _classThis;
        })();
        const { store, tearDown, host } = await createFixture({ component: App });
        assert.equal(host.querySelector("#sut").textContent, "bar");
        assert.equal(store['_state'].getValue().foo, "bar");
        await tearDown();
    });
    it("should throw if no initial state was provided", async function () {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>` })];
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
        await assert.rejects(() => createFixture({ component: App, initialState: null }));
    });
    it("should inject the proper store for connectTo", async function () {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>` }), connectTo()];
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
        const { store, tearDown, host } = await createFixture({ component: App });
        assert.equal(host.querySelector("#sut").textContent, "bar");
        assert.equal(store['_state'].getValue().foo, "bar");
        await tearDown();
    });
    it("should create a proper default state history if option enabled but simple state given", async function () {
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span id="sut">\${state.present.foo}</span>` }), connectTo()];
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
        const { initialState, store, tearDown, host } = await createFixture({
            component: App,
            options: { history: { undoable: true } }
        });
        assert.equal(host.querySelector("#sut").textContent, "bar");
        assert.deepEqual(store['_state'].getValue(), {
            past: [], present: initialState, future: []
        });
        await tearDown();
    });
    it("should be possible to quickly create dispatchable actions with dispatchify", async function () {
        const changeFoo = (state, newFoo) => {
            return { ...state, foo: newFoo };
        };
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: `<span id="sut">\${state.foo}</span>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor(store) {
                    this.store = store;
                    this.storeSubscription = this.store.state.subscribe((state) => this.state = state);
                    this.store.registerAction("changeFoo", changeFoo);
                }
                async changeFoo() {
                    await dispatchify(changeFoo)("foobar");
                }
                unbinding() {
                    this.storeSubscription.unsubscribe();
                }
            };
            __setFunctionName(_classThis, "App");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                App = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })();
            _classThis.inject = [Store];
            (() => {
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return App = _classThis;
        })();
        const { host, store, ctx, tearDown } = await createFixture({ component: App });
        assert.equal(host.querySelector("#sut").textContent, "bar");
        assert.equal(store['_state'].getValue().foo, "bar");
        const sut = ctx.container.get(App);
        await sut.changeFoo();
        await tasksSettled();
        assert.equal(host.querySelector("#sut").textContent, "foobar");
        assert.equal(store['_state'].getValue().foo, "foobar");
        await tearDown();
    });
});
//# sourceMappingURL=integration.spec.js.map