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
import { route } from '@aurelia/router';
import { containerless, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
describe('router/router-containerless.spec.ts', function () {
    it('does not render container when the routable component has @containerless', async function () {
        let Foo = (() => {
            let _classDecorators = [containerless(), customElement({
                    name: 'foo',
                    template: 'foo'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Foo = _classThis = class {
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'foo', path: '', component: Foo },
                    ]
                }), customElement({
                    name: 'root',
                    template: 'root <au-viewport>'
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
        const { host } = await start({ appRoot: App });
        assert.strictEqual(null, host.querySelector('foo'));
    });
    it('cleans up when rendering another component after a containerless component', async function () {
        let Foo = (() => {
            let _classDecorators = [containerless(), customElement({ name: 'foo', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Foo = _classThis = class {
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let NormalFoo = (() => {
            let _classDecorators = [customElement({ name: 'normal-foo', template: 'normal-foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var NormalFoo = _classThis = class {
            };
            __setFunctionName(_classThis, "NormalFoo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                NormalFoo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return NormalFoo = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'foo', path: '', component: Foo },
                        { id: 'normal-foo', path: 'normal-foo', component: NormalFoo },
                    ]
                }), customElement({
                    name: 'root',
                    template: 'root <a href="./normal-foo"></a><au-viewport>'
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
        const { host, container } = await start({ appRoot: App });
        assert.strictEqual(null, host.querySelector('foo'));
        assert.html.textContent(host.querySelector('au-viewport'), 'foo');
        host.querySelector('a').click();
        await container.get(IPlatform).domQueue.yield();
        assert.html.textContent(host.querySelector('au-viewport'), 'normal-foo');
        assert.notIncludes(host.innerHTML, '<!--au-start-->');
        assert.includes(host.innerHTML, '<normal-foo>normal-foo</normal-foo>');
    });
});
//# sourceMappingURL=router-containerless.spec.js.map