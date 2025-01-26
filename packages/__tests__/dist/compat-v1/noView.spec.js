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
import { resolve } from '@aurelia/kernel';
import { noView } from '@aurelia/compat-v1';
import { customElement, INode } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
describe('compat-v1/noView.spec.ts', function () {
    it('@noView before @customElement(NAME)', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [noView, customElement('foo-bar')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
    it('@noView after @customElement(NAME)', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [customElement('foo-bar'), noView];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
    it('@noView before @customElement({NAME, TEMPLATE})', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [noView, customElement({ name: 'foo-bar', template: 'foo-bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
    it('@noView after @customElement({NAME, TEMPLATE})', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [customElement({ name: 'foo-bar', template: 'foo-bar' }), noView];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
    it('@noView with @customElement(NAME) and projected content', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [noView, customElement('foo-bar')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar>fizz-buzz</foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
    it('@noView with @customElement({NAME, TEMPLATE}) and projected content', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [noView, customElement({ name: 'foo-bar', template: 'foo-bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar>fizz-buzz</foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
    it('@noView with @customElement and injected node', async function () {
        let FooBar = (() => {
            let _classDecorators = [noView, customElement({ name: 'foo-bar', template: 'foo-bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                constructor() {
                    this.host = resolve(INode);
                }
                attached(_initiator) {
                    this.host.textContent = '42';
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar>fizz-buzz</foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '42', 'foo-bar content');
        await stop(true);
    });
    it('@noView()', async function () {
        let attached = false;
        let FooBar = (() => {
            let _classDecorators = [noView(), customElement('foo-bar')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
                attached(_initiator) {
                    attached = true;
                }
            };
            __setFunctionName(_classThis, "FooBar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooBar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooBar = _classThis;
        })();
        const { appHost, stop, startPromise } = createFixture(`<foo-bar></foo-bar>`, undefined, [FooBar]);
        await startPromise;
        const fooBar = appHost.querySelector('foo-bar');
        assert.notEqual(fooBar, null, 'foo-bar not found');
        assert.html.textContent(fooBar, '', 'foo-bar content');
        assert.strictEqual(attached, true, 'attached not called');
        await stop(true);
    });
});
//# sourceMappingURL=noView.spec.js.map