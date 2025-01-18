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
import { inlineView } from '@aurelia/compat-v1';
import { customElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
describe('compat-v1/inlineView.spec.ts', function () {
    it('@inlineView before @customElement(NAME)', async function () {
        let FooBar = (() => {
            let _classDecorators = [inlineView('fizz-buzz'), customElement('foo-bar')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
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
        assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');
        await stop(true);
    });
    it('@inlineView after @customElement(NAME)', async function () {
        let FooBar = (() => {
            let _classDecorators = [customElement('foo-bar'), inlineView('fizz-buzz')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
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
        assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');
        await stop(true);
    });
    it('@inlineView before @customElement({NAME, TEMPLATE})', async function () {
        let FooBar = (() => {
            let _classDecorators = [inlineView('fizz-buzz'), customElement({ name: 'foo-bar', template: 'foo-bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
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
        assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');
        await stop(true);
    });
    it('@inlineView after @customElement({NAME, TEMPLATE})', async function () {
        let FooBar = (() => {
            let _classDecorators = [customElement({ name: 'foo-bar', template: 'foo-bar' }), inlineView('fizz-buzz')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooBar = _classThis = class {
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
        assert.html.textContent(fooBar, 'fizz-buzz', 'foo-bar content');
        await stop(true);
    });
});
//# sourceMappingURL=inlineView.spec.js.map