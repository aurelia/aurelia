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
import { IRouteContext, IRouter, NavigationStrategy, route } from '@aurelia/router';
import { CustomElement, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
describe('router/generate-path.spec.ts', function () {
    describe('router', function () {
        class AbstractVm {
            constructor() {
                this.routeContext = resolve(IRouteContext);
                this._router = resolve(IRouter);
            }
            generateRelativePath(instructionOrInstructions, context) {
                return this._router.generatePath(instructionOrInstructions, context ?? this);
            }
            loading(params, next, _current) {
                this.params = structuredClone(params);
                this.query = next.queryParams.toString();
            }
        }
        it('flat hierarchy', async function () {
            let C1 = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
                let _classSuper = AbstractVm;
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
            let C3 = (() => {
                let _classDecorators = [customElement({ name: 'c-3', template: 'c3 ${params.id} ${query}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C3 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['', 'c1'], component: C1 },
                            C2,
                            { id: 'bar', path: 'foo/:id', component: C3 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
            const { host, au, container, rootVm } = await start({ appRoot: Root, registrations: [C1, C2, C3] });
            assert.html.textContent(host, 'c1', 'init');
            const router = container.get(IRouter);
            // #region round#1
            let expected = 'c-2';
            let path = await router.generatePath(C2);
            assert.strictEqual(path, expected, 'round#1 - generatePath(C2)');
            path = await router.generatePath(C2, rootVm);
            assert.strictEqual(path, expected, 'round#1 - generatePath(C2, rootVm)');
            path = await router.generatePath('c-2');
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\')');
            path = await router.generatePath('c-2', rootVm);
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', rootVm)');
            const c1 = CustomElement.for(host.querySelector('c-1')).viewModel;
            path = await c1.generateRelativePath('../c-2');
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'../c-2\', C1)');
            path = await c1.generateRelativePath('c-2', c1.routeContext.parent);
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', C1)');
            await router.load(path);
            assert.html.textContent(host, 'c2', 'round#1 - load(path)');
            // #endregion
            // #region round#2
            expected = 'foo/1';
            path = await router.generatePath({ component: C3, params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } })');
            path = await router.generatePath({ component: C3, params: { id: 1 } }, rootVm);
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } }, rootVm)');
            path = await router.generatePath({ component: 'bar', params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } })');
            path = await router.generatePath({ component: 'bar', params: { id: 1 } }, rootVm);
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, rootVm)');
            const c2 = CustomElement.for(host.querySelector('c-2')).viewModel;
            path = await c2.generateRelativePath({ component: '../bar', params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'../bar\', params: { id: 1 } }, C2)');
            path = await c2.generateRelativePath({ component: 'bar', params: { id: 1 } }, c2.routeContext.parent);
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, C2)');
            await router.load(path);
            assert.html.textContent(host, 'c3 1', 'round#2 - load(path)');
            // #endregion
            // #region round#3
            expected = '';
            path = await router.generatePath(C1);
            assert.strictEqual(path, expected, 'round#3 - generatePath(C1)');
            path = await router.generatePath(C1, rootVm);
            assert.strictEqual(path, expected, 'round#3 - generatePath(C1, rootVm)');
            path = await router.generatePath('');
            assert.strictEqual(path, expected, 'round#3 - generatePath(\'\')');
            path = await router.generatePath('', rootVm);
            assert.strictEqual(path, expected, 'round#3 - generatePath(\'\', rootVm)');
            path = await router.generatePath({ component: C1 });
            assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 })');
            path = await router.generatePath({ component: C1 }, rootVm);
            assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 }, rootVm)');
            path = await router.generatePath({ component: '' });
            assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' })');
            path = await router.generatePath({ component: '' }, rootVm);
            assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' }, rootVm)');
            await router.load(path);
            assert.html.textContent(host, 'c1', 'round#3 - load(path)');
            // #endregion
            // #region round#4 - querystring
            expected = 'foo/1?bar=baz';
            path = await router.generatePath({ component: C3, params: { id: 1, bar: 'baz' } });
            assert.strictEqual(path, expected, 'round#4 - generatePath({ component: C3, params: { id: 1, bar: \'baz\' } })');
            await router.load(path);
            assert.html.textContent(host, 'c3 1 bar=baz', 'round#4 - load(path)');
            // #endregion
            await au.stop(true);
        });
        it('multi-level hierarchy', async function () {
            let GC1 = (() => {
                let _classDecorators = [route('gc1'), customElement({ name: 'gc-1', template: 'gc1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var GC1 = _classThis = class extends _classSuper {
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
            let GC2 = (() => {
                let _classDecorators = [route({ id: 'gc2', path: 'gc2/:id' }), customElement({ name: 'gc-2', template: 'gc2 ${params.id} ${query}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var GC2 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "GC2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC2 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c1 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
                let _classDecorators = [customElement({ name: 'c-2', template: 'c2 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
            let C3 = (() => {
                let _classDecorators = [route({ id: 'c3', path: 'foo/:id' }), customElement({ name: 'c-3', template: 'c3 ${params.id}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C3 = _classThis;
            })();
            let C4 = (() => {
                let _classDecorators = [route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'], routes: [GC1, GC2] }), customElement({
                        name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">\${params.id1} \${params.id2}</template>
        <template case="v2">\${params.id3} \${params.id4}</template>
        <template case="v3">\${params.id5} \${params.rest}</template>
      </template>
      <au-viewport></au-viewport>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C4 = _classThis = class extends _classSuper {
                    async loading(params, _next, _current) {
                        await super.loading(params, _next, _current);
                        this.view = params.id1 != null
                            ? 'v1'
                            : params.id3 != null
                                ? 'v2'
                                : 'v3';
                    }
                };
                __setFunctionName(_classThis, "C4");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C4 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C4 = _classThis;
            })();
            let P1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['c1', ''], component: C1 },
                            C3,
                        ]
                    }), customElement({ name: 'p-1', template: 'p1 <a href.bind="route"></a> <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P1 = _classThis = class extends _classSuper {
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
                            { path: ['c2', ''], component: C2 },
                            C4,
                        ]
                    }), customElement({ name: 'p-2', template: 'p2 <a href.bind="route"></a> <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P2 = _classThis = class extends _classSuper {
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
                            { id: 'p1', path: ['p1', ''], component: P1 },
                            { id: 'p2', path: 'p2', component: P2 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
            const { host, au, container, rootVm } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2] });
            const router = container.get(IRouter);
            const platform = container.get(IPlatform);
            const domQueue = platform.domQueue;
            const taskQueue = platform.taskQueue;
            const $yield = () => Promise.all([
                domQueue.yield(),
                taskQueue.yield(),
            ]);
            assert.html.textContent(host, 'p1 c1', 'init');
            // #region round#1
            let expected = 'p2';
            let path = await router.generatePath(P2);
            assert.strictEqual(path, expected, 'round#1 - generatePath(P2)');
            path = await router.generatePath(P2, rootVm);
            assert.strictEqual(path, expected, 'round#1 - generatePath(P2, rootVm)');
            path = await router.generatePath('p2');
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\')');
            path = await router.generatePath('p2', rootVm);
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', rootVm)');
            const p1 = CustomElement.for(host.querySelector('p-1')).viewModel;
            path = await p1.generateRelativePath('../p2');
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'../p2\', P1)');
            path = await p1.generateRelativePath('p2', p1.routeContext.parent);
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', P1)');
            let c1 = CustomElement.for(host.querySelector('c-1')).viewModel;
            path = await c1.generateRelativePath('../../p2');
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'../../p2\', C1)');
            path = await c1.generateRelativePath('p2', c1.routeContext.parent.parent);
            assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', C1)');
            await router.load(path);
            assert.html.textContent(host, 'p2 c2', 'round#1 - load(path)');
            // #endregion
            // #region round#2
            expected = 'p1/foo/1';
            // route id
            path = await router.generatePath({ component: 'p1', children: [{ component: 'c3', params: { id: 1 } }] });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'p1\', children: [{ component: \'c3\', params: { id: 1 } }] })');
            // custom element
            path = await router.generatePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] })');
            // custom element definition
            path = await router.generatePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] })');
            // function
            path = await router.generatePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] });
            assert.strictEqual(path, expected, 'round#2 - generatePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] })');
            await router.load(path);
            assert.html.textContent(host, 'p1 c3 1', 'round#2 - load(path)');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#2 - reset - load(\'p2/c2\')');
            // #region round#3 - resolve relative path at child using ancestor context
            let c2El = host.querySelector('c-2');
            let c2 = CustomElement.for(c2El).viewModel;
            let context = c2.context = c2.routeContext.parent.parent;
            // route id
            path = await c2.generateRelativePath({ component: 'p1', children: [{ component: 'c3', params: { id: 1 } }] }, context);
            assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: \'p1\', children: [{ component: \'c3\', params: { id: 1 } }] }, context)');
            // custom element
            path = await c2.generateRelativePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] }, context);
            assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: P1, children: [{ component: C3, params: { id: 1 } }] }, context)');
            // custom element definition
            path = await c2.generateRelativePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] }, context);
            assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: CustomElement.getDefinition(P1), children: [{ component: CustomElement.getDefinition(C3), params: { id: 1 } }] }, context)');
            // function
            path = await c2.generateRelativePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] }, context);
            assert.strictEqual(path, expected, 'round#3 - c2.generateRelativePath({ component: () => P1, children: [{ component: () => C3, params: { id: 1 } }] }, context)');
            // click on link
            c2.route = expected;
            await $yield();
            c2El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p1 c3 1', 'round#3 - click on link');
            // #endregion
            // reset to p1/c1
            await router.load('p1/c1');
            assert.html.textContent(host, 'p1 c1', 'round#3 - reset - load(\'p1/c1\')');
            // #region round#4 - resolve relative path at child using parent context
            expected = 'foo/1';
            let c1El = host.querySelector('c-1');
            c1 = CustomElement.for(c1El).viewModel;
            context = c1.context = c1.routeContext.parent;
            // route id
            path = await c1.generateRelativePath({ component: 'c3', params: { id: 1 } }, context);
            assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: \'c3\', params: { id: 1 } }, context)');
            // custom element
            path = await c1.generateRelativePath({ component: C3, params: { id: 1 } }, context);
            assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: C3, params: { id: 1 } }, context)');
            // custom element definition
            path = await c1.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } }, context);
            assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } }, context)');
            // function
            path = await c1.generateRelativePath({ component: () => C3, params: { id: 1 } }, context);
            assert.strictEqual(path, expected, 'round#4 - c1.generateRelativePath({ component: () => C3, params: { id: 1 } }, context)');
            // click on link
            c1.route = expected;
            await $yield();
            c1El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p1 c3 1', 'round#4 - click on link');
            // #endregion
            // reset to p1/c1
            await router.load('p1/c1');
            assert.html.textContent(host, 'p1 c1', 'round#4 - reset - load(\'p1/c1\')');
            // #region round#5 - resolve relative path to child
            const p1El = host.querySelector('p-1');
            const p1Vm = CustomElement.for(p1El).viewModel;
            // route id
            path = await p1Vm.generateRelativePath({ component: 'c3', params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: \'c3\', params: { id: 1 } })');
            // custom element
            path = await p1Vm.generateRelativePath({ component: C3, params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: C3, params: { id: 1 } })');
            // custom element definition
            path = await p1Vm.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: CustomElement.getDefinition(C3), params: { id: 1 } })');
            // function
            path = await p1Vm.generateRelativePath({ component: () => C3, params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#5 - p1.generateRelativePath({ component: () => C3, params: { id: 1 } })');
            // click on link
            p1Vm.route = expected;
            await $yield();
            p1El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p1 c3 1', 'round#5 - click on link');
            // #endregion
            // reset to p1/c1
            await router.load('p1/c1');
            assert.html.textContent(host, 'p1 c1', 'round#5 - reset - load(\'p1/c1\')');
            // #region round#6 - resolve relative path to a child (required parameters) under the parent's sibling
            expected = 'p2/bar/1/2';
            c1El = host.querySelector('c-1');
            c1 = CustomElement.for(c1El).viewModel;
            context = c1.context = c1.routeContext.parent.parent;
            // route id
            path = await c1.generateRelativePath({ component: 'p2', children: [{ component: 'c4', params: { id1: 1, id2: 2 } }] }, context);
            assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: \'p2\', children: [{ component: \'c4\', params: { id1: 1, id2: 2 } }] }, context)');
            // custom element
            path = await c1.generateRelativePath({ component: P2, children: [{ component: C4, params: { id1: 1, id2: 2 } }] }, context);
            assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: P2, children: [{ component: C4, params: { id1: 1, id2: 2 } }] }, context)');
            // custom element definition
            path = await c1.generateRelativePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id1: 1, id2: 2 } }] }, context);
            assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id1: 1, id2: 2 } }] }, context)');
            // function
            path = await c1.generateRelativePath({ component: () => P2, children: [{ component: () => C4, params: { id1: 1, id2: 2 } }] }, context);
            assert.strictEqual(path, expected, 'round#6 - c1.generateRelativePath({ component: () => P2, children: [{ component: () => C4, params: { id1: 1, id2: 2 } }] }, context)');
            // click on link
            c1.route = expected;
            await $yield();
            c1El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 1 2', 'round#6 - click on link');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#6 - reset - load(\'p2/c2\')');
            // #region round#7 - resolve relative path to a different child (optional parameters - value for all) under parent
            expected = 'fizz/1/2';
            c2El = host.querySelector('c-2');
            c2 = CustomElement.for(c2El).viewModel;
            context = c2.context = c2.routeContext.parent;
            // route id
            path = await c2.generateRelativePath({ component: 'c4', params: { id3: 1, id4: 2 } }, context);
            assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: \'c4\', params: { id3: 1, id4: 2 } }, context)');
            // custom element
            path = await c2.generateRelativePath({ component: C4, params: { id3: 1, id4: 2 } }, context);
            assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: C4, params: { id3: 1, id4: 2 } }, context)');
            // custom element definition
            path = await c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1, id4: 2 } }, context);
            assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1, id4: 2 } }, context)');
            // function
            path = await c2.generateRelativePath({ component: () => C4, params: { id3: 1, id4: 2 } }, context);
            assert.strictEqual(path, expected, 'round#7 - c2.generateRelativePath({ component: () => C4, params: { id3: 1, id4: 2 } }, context)');
            // click on link
            c2.route = expected;
            await $yield();
            c2El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 1 2', 'round#7 - click on link');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#7 - reset - load(\'p2/c2\')');
            // #region round#8 - resolve relative path to a different child (optional parameters - no value) under parent
            expected = 'fizz/1/';
            c2El = host.querySelector('c-2');
            c2 = CustomElement.for(c2El).viewModel;
            context = c2.context = c2.routeContext.parent;
            // route id
            path = await c2.generateRelativePath({ component: 'c4', params: { id3: 1 } }, context);
            assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: \'c4\', params: { id3: 1 } }, context)');
            // custom element
            path = await c2.generateRelativePath({ component: C4, params: { id3: 1 } }, context);
            assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: C4, params: { id3: 1 } }, context)');
            // custom element definition
            path = await c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1 } }, context);
            assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id3: 1 } }, context)');
            // function
            path = await c2.generateRelativePath({ component: () => C4, params: { id3: 1 } }, context);
            assert.strictEqual(path, expected, 'round#8 - c2.generateRelativePath({ component: () => C4, params: { id3: 1 } }, context)');
            // click on link
            c2.route = expected;
            await $yield();
            c2El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 1', 'round#8 - click on link');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#8 - reset - load(\'p2/c2\')');
            // #region round#9 - resolve relative path to a child (wildcard parameter)
            expected = 'buzz/1/2%2F3%2F4';
            const p2El = host.querySelector('p-2');
            const p2 = CustomElement.for(p2El).viewModel;
            // route id
            path = await p2.generateRelativePath({ component: 'c4', params: { id5: 1, rest: '2/3/4' } });
            assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: \'c4\', params: { id5: 1, rest: \'2/3/4\' } })');
            // custom element
            path = await p2.generateRelativePath({ component: C4, params: { id5: 1, rest: '2/3/4' } });
            assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: C4, params: { id5: 1, rest: \'2/3/4\' } })');
            // custom element definition
            path = await p2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id5: 1, rest: '2/3/4' } });
            assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: CustomElement.getDefinition(C4), params: { id5: 1, rest: \'2/3/4\' } })');
            // function
            path = await p2.generateRelativePath({ component: () => C4, params: { id5: 1, rest: '2/3/4' } });
            assert.strictEqual(path, expected, 'round#9 - p2.generateRelativePath({ component: () => C4, params: { id5: 1, rest: \'2/3/4\' } })');
            // click on link
            p2.route = expected;
            await $yield();
            p2El.querySelector('a').click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 1 2/3/4', 'round#9 - click on link');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#9 - reset - load(\'p2/c2\')');
            // #region round #10 - resolve to a grandchild without parameter
            expected = 'p2/fizz/2/3/gc1';
            // custom element
            path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] }] });
            assert.strictEqual(path, expected, 'round#10 - generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] }] })');
            // route id
            path = await router.generatePath({ component: 'p2', children: [{ component: 'c4', params: { id3: 2, id4: 3 }, children: ['gc1'] }] });
            assert.strictEqual(path, expected, 'round#10 - generatePath({ component: \'p2\', children: [{ component: \'c4\', params: { id3: 2, id4: 3 }, children: [\'gc-1\'] }] })');
            // custom element definition
            path = await router.generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [CustomElement.getDefinition(GC1)] }] });
            assert.strictEqual(path, expected, 'round#10 - generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [CustomElement.getDefinition(GC1)] }] })');
            // function
            path = await router.generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [() => GC1] }] });
            assert.strictEqual(path, expected, 'round#10 - generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [() => GC1] }] })');
            await router.load(path);
            assert.html.textContent(host, 'p2 c4 2 3 gc1', 'round#10 - load(path)');
            // #endregion
            // #region round #11 - resolve to a grandchild with parameter
            expected = 'p2/fizz/2/3/gc2/4';
            // custom element
            path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] });
            assert.strictEqual(path, expected, 'round#11 - generatePath({ component: P2, children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] })');
            // route id
            path = await router.generatePath({ component: 'p2', children: [{ component: 'c4', params: { id3: 2, id4: 3 }, children: [{ component: 'gc2', params: { id: 4 } }] }] });
            assert.strictEqual(path, expected, 'round#11 - generatePath({ component: \'p2\', children: [{ component: \'c4\', params: { id3: 2, id4: 3 }, children: [{ component: \'gc-2\', params: { id: 4 } }] }] })');
            // custom element definition
            path = await router.generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [{ component: CustomElement.getDefinition(GC2), params: { id: 4 } }] }] });
            assert.strictEqual(path, expected, 'round#11 - generatePath({ component: CustomElement.getDefinition(P2), children: [{ component: CustomElement.getDefinition(C4), params: { id3: 2, id4: 3 }, children: [CustomElement.getDefinition(GC2, { params: { id: 4 } })] }] })');
            // function
            path = await router.generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [{ component: () => GC2, params: { id: 4 } }] }] });
            assert.strictEqual(path, expected, 'round#11 - generatePath({ component: () => P2, children: [{ component: () => C4, params: { id3: 2, id4: 3 }, children: [() => GC2] }] })');
            await router.load(path);
            assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#11 - load(path)');
            // #endregion
            // #region round 12 - query string - single valued
            expected = 'p2/bar/2/3/gc2/4?id4=4&bar=baz';
            path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4 }, children: [{ component: GC2, params: { id: 4, bar: 'baz' } }] }] });
            assert.strictEqual(path, expected, 'round#12 - generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4 }, children: [{ component: GC2, params: { id: 4, bar: \'baz\' } }] }] })');
            await router.load(path);
            assert.html.textContent(host, 'p2 c4 2 3 gc2 4 id4=4&bar=baz', 'round#12 - load(path)');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#12 - reset - load(\'p2/c2\')');
            // #region round 13 - query string - multi valued
            expected = 'p2/bar/2/3/gc2/4?id4=4&bar=baz&bar=qux';
            path = await router.generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4, bar: 'baz' }, children: [{ component: GC2, params: { id: 4, bar: 'qux' } }] }] });
            assert.strictEqual(path, expected, 'round#13 - generatePath({ component: P2, children: [{ component: C4, params: { id1: 2, id2: 3, id4: 4, bar: \'baz\' }, children: [{ component: GC2, params: { id: 4, bar: \'qux\' } }] }] })');
            await router.load(path);
            assert.html.textContent(host, 'p2 c4 2 3 gc2 4 id4=4&bar=baz&bar=qux', 'round#13 - load(path)');
            // #endregion
            await au.stop(true);
        });
        it('flat hierarchy with sibling viewports', async function () {
            let C1 = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
                let _classSuper = AbstractVm;
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
            let C3 = (() => {
                let _classDecorators = [customElement({ name: 'c-3', template: 'c3 ${params.id} ${query}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C3 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            C1,
                            C2,
                            { id: 'bar', path: 'foo/:id', component: C3 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })];
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
            const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3] });
            const router = container.get(IRouter);
            // round#1
            let expected = 'c-2+foo/1';
            let path = await router.generatePath([C2, { component: C3, params: { id: 1 } }]);
            assert.strictEqual(path, expected, 'round#1 - generatePath([C2, { component: C3, params: { id: 1 } }])');
            await router.load(path);
            assert.html.textContent(host, 'c2 c3 1', 'round#1 - load(path)');
            // round#2
            expected = 'foo/2+c-1';
            path = await router.generatePath([{ component: 'bar', params: { id: 2 } }, C1]);
            assert.strictEqual(path, expected, 'round#2 - generatePath([{ component: \'bar\', params: { id: 2 } }, C1])');
            await router.load(path);
            assert.html.textContent(host, 'c3 2 c1', 'round#2 - load(path)');
            // round#3 - named viewports
            expected = 'c-2@vp2+foo/3@vp1';
            path = await router.generatePath([{ component: 'c-2', viewport: 'vp2' }, { component: C3, params: { id: 3 }, viewport: 'vp1' }]);
            assert.strictEqual(path, expected, 'round#3 - generatePath([{ component: C2, viewport: \'vp2\' }, { component: C3, params: { id: 3 }, viewport: \'vp1\' }])');
            await router.load(path);
            assert.html.textContent(host, 'c3 3 c2', 'round#3 - load(path)');
            // round#4 - named viewports
            expected = 'foo/4@vp1+c-1@vp2';
            path = await router.generatePath([{ component: 'bar', params: { id: 4 }, viewport: 'vp1' }, { component: C1, viewport: 'vp2' }]);
            assert.strictEqual(path, expected, 'round#4 - generatePath([{ component: \'bar\', params: { id: 4 }, viewport: \'vp1\' }, { component: C1, viewport: \'vp2\' }])');
            await router.load(path);
            assert.html.textContent(host, 'c3 4 c1', 'round#4 - load(path)');
            // round#5 - query string
            expected = 'foo/5@vp2+c-2@vp1?bar=baz&fizz=qux';
            path = await router.generatePath([{ component: 'bar', params: { id: 5, bar: 'baz' }, viewport: 'vp2' }, { component: C2, viewport: 'vp1', params: { fizz: 'qux' } }]);
            assert.strictEqual(path, expected, 'round#5 - generatePath([{ component: \'bar\', params: { id: 5, bar: \'baz\' }, viewport: \'vp2\' }, { component: C2, viewport: \'vp1\', params: { fizz: \'qux\' } }])');
            await router.load(path);
            assert.html.textContent(host, 'c2 c3 5 bar=baz&fizz=qux', 'round#5 - load(path)');
            await au.stop(true);
        });
        it('multi-level hierarchy with sibling viewports', async function () {
            let C1 = (() => {
                let _classDecorators = [route('c1'), customElement({ name: 'c-1', template: 'c1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
                let _classDecorators = [route('c2'), customElement({ name: 'c-2', template: 'c2' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
            let C3 = (() => {
                let _classDecorators = [route({ id: 'c3', path: 'foo/:id' }), customElement({ name: 'c-3', template: 'c3 ${params.id}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C3 = _classThis;
            })();
            let C4 = (() => {
                let _classDecorators = [route({ id: 'c4', path: 'bar/:id1/:id2' }), customElement({ name: 'c-4', template: 'c4 ${params.id1} ${params.id2}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C4 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C4");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C4 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C4 = _classThis;
            })();
            let P1 = (() => {
                let _classDecorators = [route({ path: 'p1', routes: [C1, C3,] }), customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P1 = _classThis = class extends _classSuper {
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
                let _classDecorators = [route({ path: 'p2', routes: [C2, C4,] }), customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P2 = _classThis = class extends _classSuper {
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
                let _classDecorators = [route({ routes: [P1, P2] }), customElement({ name: 'ro-ot', template: '<au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })];
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
            const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2] });
            const router = container.get(IRouter);
            // round #1
            let expected = 'p2@vp2+p1@vp1';
            let path = await router.generatePath([{ component: P2, viewport: 'vp2' }, { component: P1, viewport: 'vp1' }]);
            assert.strictEqual(path, expected, 'round#1 - generatePath([{ component: P2, viewport: \'vp2\' }, { component: P1, viewport: \'vp1\' }])');
            await router.load(path);
            assert.html.textContent(host, 'p1 p2', 'round#1 - load(path)');
            // round #2
            expected = 'p1@vp1/foo/1+p2@vp2/c2';
            path = await router.generatePath([{ component: P1, children: [{ component: 'c3', params: { id: 1 } }], viewport: 'vp1' }, { component: P2, children: ['c2'], viewport: 'vp2' }]);
            assert.strictEqual(path, expected, 'round#2 - generatePath([{ component: P1, children: [{ component: C3, params: { id: 1 } }], viewport: \'vp1\' }, { component: P2, children: [C2], viewport: \'vp2\' }])');
            await router.load(path);
            assert.html.textContent(host, 'p1 c3 1 p2 c2', 'round#2 - load(path)');
            // round #3
            expected = 'p2@vp1/bar/2/3+p1@vp2/c1';
            path = await router.generatePath([{ component: 'p2', children: [{ component: C4, params: { id1: 2, id2: 3 } }], viewport: 'vp1' }, { component: 'p1', children: [C1], viewport: 'vp2' }]);
            assert.strictEqual(path, expected, 'round#3 - generatePath([{ component: \'p-2\', children: [{ component: C4, params: { id1: 2, id2: 3 } }], viewport: \'vp1\' }, { component: \'p-1\', children: [C1], viewport: \'vp2\' }])');
            await router.load(path);
            assert.html.textContent(host, 'p2 c4 2 3 p1 c1', 'round#3 - load(path)');
            await au.stop(true);
        });
        describe('does not work', function () {
            let C1 = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var C1 = _classThis = class {
                };
                __setFunctionName(_classThis, "C1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
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
                var C2 = _classThis = class {
                };
                __setFunctionName(_classThis, "C2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C2 = _classThis;
            })();
            let P1 = (() => {
                let _classDecorators = [route({ routes: [C2] }), customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var P1 = _classThis = class {
                };
                __setFunctionName(_classThis, "P1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    P1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return P1 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({ routes: [C1, P1] }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
            it('if the component is a promise', async function () {
                const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1] });
                const router = container.get(IRouter);
                try {
                    await router.generatePath({ component: Promise.resolve(C1) });
                    assert.fail('should not have generated a path');
                }
                catch (error) {
                    assert.instanceOf(error, Error, 'Expected an error to be thrown');
                    assert.includes(error.message, 'AUR3404', 'Unexpected event ID.');
                }
                await au.stop(true);
            });
            it('if the component is a function returning promise', async function () {
                const { au, container } = await start({ appRoot: Root, registrations: [C1] });
                const router = container.get(IRouter);
                try {
                    await router.generatePath({ component: () => Promise.resolve(C1) });
                    assert.fail('should not have generated a path');
                }
                catch (error) {
                    assert.instanceOf(error, Error, 'Expected an error to be thrown');
                    assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
                }
                await au.stop(true);
            });
            it('if the component is an instance of navigation strategy', async function () {
                const { au, container } = await start({ appRoot: Root, registrations: [C1] });
                const router = container.get(IRouter);
                try {
                    await router.generatePath({ component: new NavigationStrategy(() => { throw new Error('does not matter'); }) });
                    assert.fail('should not have generated a path');
                }
                catch (error) {
                    assert.instanceOf(error, Error, 'Expected an error to be thrown');
                    assert.includes(error.message, 'AUR3404', 'Unexpected event ID.');
                }
                await au.stop(true);
            });
            it('if the child component is a promise', async function () {
                const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1] });
                const router = container.get(IRouter);
                try {
                    await router.generatePath({ component: P1, children: [Promise.resolve(C2)] });
                    assert.fail('should not have generated a path');
                }
                catch (error) {
                    assert.instanceOf(error, Error, 'Expected an error to be thrown');
                    assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
                }
                await au.stop(true);
            });
            it('if the child component is a function returning a promise', async function () {
                const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1] });
                const router = container.get(IRouter);
                try {
                    await router.generatePath({ component: P1, children: [() => Promise.resolve(C2)] });
                    assert.fail('should not have generated a path');
                }
                catch (error) {
                    assert.instanceOf(error, Error, 'Expected an error to be thrown');
                    assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
                }
                await au.stop(true);
            });
            it('if the child component is an instance of navigation strategy', async function () {
                const { au, container } = await start({ appRoot: Root, registrations: [C1, C2, P1] });
                const router = container.get(IRouter);
                try {
                    await router.generatePath({ component: P1, children: [new NavigationStrategy(() => { throw new Error('does not matter'); })] });
                    assert.fail('should not have generated a path');
                }
                catch (error) {
                    assert.instanceOf(error, Error, 'Expected an error to be thrown');
                    assert.includes(error.message, 'AUR3166', 'Unexpected event ID.');
                }
                await au.stop(true);
            });
        });
    });
    describe('route-context', function () {
        class AbstractVm {
            constructor() {
                this.routeContext = resolve(IRouteContext);
            }
            generateRelativePath(instructionOrInstructions) {
                return this.routeContext.generateRelativePath(instructionOrInstructions);
            }
            generateRootedPath(instructionOrInstructions) {
                return this.routeContext.generateRootedPath(instructionOrInstructions);
            }
            loading(params, next, _current) {
                this.params = structuredClone(params);
                this.query = next.queryParams.toString();
            }
        }
        it('relative path generation with multi-level hierarchy', async function () {
            let GC1 = (() => {
                let _classDecorators = [route('gc1'), customElement({ name: 'gc-1', template: 'gc1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var GC1 = _classThis = class extends _classSuper {
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
            let GC2 = (() => {
                let _classDecorators = [route({ id: 'gc2', path: 'gc2/:id' }), customElement({ name: 'gc-2', template: 'gc2 ${params.id} ${query}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var GC2 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "GC2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC2 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [customElement({ name: 'c-1', template: 'c1 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
                let _classDecorators = [customElement({ name: 'c-2', template: 'c2 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
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
            let C3 = (() => {
                let _classDecorators = [route({ id: 'c3', path: 'foo/:id' }), customElement({ name: 'c-3', template: 'c3 ${params.id}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C3 = _classThis;
            })();
            let C4 = (() => {
                let _classDecorators = [route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'], routes: [GC1, GC2] }), customElement({
                        name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">\${params.id1} \${params.id2}</template>
        <template case="v2">\${params.id3} \${params.id4}</template>
        <template case="v3">\${params.id5} \${params.rest}</template>
      </template>
      <au-viewport></au-viewport>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C4 = _classThis = class extends _classSuper {
                    async loading(params, _next, _current) {
                        await super.loading(params, _next, _current);
                        this.view = params.id1 != null
                            ? 'v1'
                            : params.id3 != null
                                ? 'v2'
                                : 'v3';
                    }
                };
                __setFunctionName(_classThis, "C4");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C4 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C4 = _classThis;
            })();
            let P1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['c1', ''], component: C1 },
                            C3,
                        ]
                    }), customElement({ name: 'p-1', template: 'p1 <a href.bind="route"></a> <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P1 = _classThis = class extends _classSuper {
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
                            { path: ['c2', ''], component: C2 },
                            C4,
                        ]
                    }), customElement({ name: 'p-2', template: 'p2 <a href.bind="route"></a> <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P2 = _classThis = class extends _classSuper {
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
                            { id: 'p1', path: ['p1', ''], component: P1 },
                            { id: 'p2', path: 'p2', component: P2 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
            const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2] });
            const router = container.get(IRouter);
            const platform = container.get(IPlatform);
            const domQueue = platform.domQueue;
            const taskQueue = platform.taskQueue;
            const $yield = () => Promise.all([
                domQueue.yield(),
                taskQueue.yield(),
            ]);
            assert.html.textContent(host, 'p1 c1', 'init');
            // #region round#1 - create rooted path via relative path
            let expected = 'p2/c2';
            const p1El = host.querySelector('p-1');
            const p1 = CustomElement.for(p1El).viewModel;
            const c1El = host.querySelector('c-1');
            const c1 = CustomElement.for(c1El).viewModel;
            let path = await p1.generateRelativePath({ component: '../p2', children: [{ component: C2 }] });
            assert.strictEqual(path, expected, 'round#1 - p1.generateRelativePath({ component: \'../p2\', children: [{ component: C2 }] })');
            path = await c1.generateRelativePath({ component: '../../p2', children: [{ component: C2 }] });
            assert.strictEqual(path, expected, 'round#1 - c1.generateRelativePath({ component: \'../../p2\', children: [{ component: C2 }] })');
            // #endregion
            // #region round#2 - create a relative path
            expected = 'foo/1';
            path = await p1.generateRelativePath({ component: C3, params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#2 - p1.generateRelativePath({ component: C3, params: { id: 1 } })');
            path = await c1.generateRelativePath({ component: '../c3', params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#2 - c1.generateRelativePath({ component: \'../c3\', params: { id: 1 } })');
            let anchor = p1El.querySelector('a');
            p1.route = expected;
            await $yield();
            anchor.click();
            await $yield();
            assert.html.textContent(host, 'p1 c3 1', 'round#2 - click on link');
            // #endregion
            // #region round#3 - relative path to grandchild without parameter
            // arrange - go to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#3 - load(\'p2/c2\')');
            expected = 'fizz/2/3/gc1';
            let p2El = host.querySelector('p-2');
            let p2 = CustomElement.for(p2El).viewModel;
            path = await p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] });
            assert.strictEqual(path, expected, 'round#3 - p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [GC1] })');
            // path = await p2.generateRelativePath({ component: 'c4', params: { id3: 2, id4: 3 }, children: ['gc1'] });
            // assert.strictEqual(path, expected, 'round#3 - p2.generateRelativePath({ component: \'c4\', params: { id3: 2, id4: 3 }, children: [GC1] })');
            anchor = p2El.querySelector('a');
            p2.route = expected;
            await $yield();
            anchor.click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 2 3 gc1', 'round#3 - click on link');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#3 - reset - load(\'p2/c2\')');
            // #region round#4 - relative path to grandchild with parameter - anchor at child with root context
            expected = 'p2/fizz/2/3/gc2/4';
            p2El = host.querySelector('p-2');
            p2 = CustomElement.for(p2El).viewModel;
            let c2El = host.querySelector('c-2');
            let c2 = CustomElement.for(c2El).viewModel;
            path = await c2.generateRelativePath({ component: '../../p2', children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] });
            assert.strictEqual(path, expected, 'round#4 - c2.generateRelativePath({ component: \'../p2\', children: [{ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] }] })');
            path = await c2.generateRelativePath({ component: '../../p2', children: [{ component: 'c4', params: { id3: 2, id4: 3 }, children: [{ component: 'gc2', params: { id: 4 } }] }] });
            assert.strictEqual(path, expected, 'round#4 - c2.generateRelativePath({ component: \'../p2\', children: [{ component: \'c4\', params: { id3: 2, id4: 3 }, children: [{ component: \'gc2\', params: { id: 4 } }] }] })');
            anchor = c2El.querySelector('a');
            c2.route = expected;
            c2.context = null; // root context
            await $yield();
            anchor.click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#4 - click on link');
            // #endregion
            // reset to p2/c2
            await router.load('p2/c2');
            assert.html.textContent(host, 'p2 c2', 'round#4 - reset - load(\'p2/c2\')');
            // #region round#5 - relative path to grandchild with parameter - anchor at child with parent context
            expected = 'fizz/2/3/gc2/4';
            p2El = host.querySelector('p-2');
            p2 = CustomElement.for(p2El).viewModel;
            c2El = host.querySelector('c-2');
            c2 = CustomElement.for(c2El).viewModel;
            path = await c2.generateRelativePath({ component: '../c4', params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] });
            assert.strictEqual(path, expected, 'round#5 - c2.generateRelativePath({ component: \'../c4\', params: { id3: 2, id4: 3 }, children: [{ component: GC2, params: { id: 4 } }] })');
            path = await p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: 'gc2', params: { id: 4 } }] });
            assert.strictEqual(path, expected, 'round#5 - p2.generateRelativePath({ component: C4, params: { id3: 2, id4: 3 }, children: [{ component: \'gc2\', params: { id: 4 } }] })');
            anchor = c2El.querySelector('a');
            c2.route = expected;
            c2.context = p2.routeContext;
            await $yield();
            anchor.click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#5 - click on link');
            // #endregion
            await au.stop(true);
        });
        it('rooted path generation with multi-level hierarchy', async function () {
            let GC1 = (() => {
                let _classDecorators = [route('gc1'), customElement({ name: 'gc-1', template: 'gc1 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var GC1 = _classThis = class extends _classSuper {
                    constructor() {
                        super(...arguments);
                        this.context = null;
                    }
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
            let GC2 = (() => {
                let _classDecorators = [route({ id: 'gc2', path: 'gc2/:id' }), customElement({ name: 'gc-2', template: 'gc2 ${params.id} ${query}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var GC2 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "GC2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC2 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [route({ id: 'c1', path: 'c1' }), customElement({ name: 'c-1', template: 'c1 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C1 = _classThis = class extends _classSuper {
                    constructor() {
                        super(...arguments);
                        this.context = null;
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
            let C2 = (() => {
                let _classDecorators = [route({ id: 'c2', path: 'c2' }), customElement({ name: 'c-2', template: 'c2 <a load="route.bind: route; context.bind: context"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C2 = _classThis = class extends _classSuper {
                    constructor() {
                        super(...arguments);
                        this.context = null;
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
            let C3 = (() => {
                let _classDecorators = [route({ id: 'c3', path: 'foo/:id' }), customElement({ name: 'c-3', template: 'c3 ${params.id}' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "C3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C3 = _classThis;
            })();
            let C4 = (() => {
                let _classDecorators = [route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'], routes: [GC1, GC2] }), customElement({
                        name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">${'${params.id1}'} ${'${params.id2}'}</template>
        <template case="v2">${'${params.id3}'} ${'${params.id4}'}</template>
        <template case="v3">${'${params.id5}'} ${'${params.rest}'}</template>
      </template>
      <au-viewport></au-viewport>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var C4 = _classThis = class extends _classSuper {
                    async loading(params, _next, _current) {
                        await super.loading(params, _next, _current);
                        this.view = params.id1 != null
                            ? 'v1'
                            : params.id3 != null
                                ? 'v2'
                                : 'v3';
                    }
                };
                __setFunctionName(_classThis, "C4");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    C4 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return C4 = _classThis;
            })();
            let P1 = (() => {
                let _classDecorators = [route({ routes: [C1, C3] }), customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P1 = _classThis = class extends _classSuper {
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
                let _classDecorators = [route({ routes: [C2, C4] }), customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AbstractVm;
                var P2 = _classThis = class extends _classSuper {
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
                            { id: 'p1', path: 'p1', component: P1 },
                            { id: 'p2', path: 'p2', component: P2 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
            const { host, au, container } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2] });
            const router = container.get(IRouter);
            const platform = container.get(IPlatform);
            const domQueue = platform.domQueue;
            const taskQueue = platform.taskQueue;
            const $yield = () => Promise.all([
                domQueue.yield(),
                taskQueue.yield(),
            ]);
            // we intentionally avoid empty paths for this test, otherwise the path generation will result in empty parent paths.
            await router.load('p1/c1');
            assert.html.textContent(host, 'p1 c1', 'init');
            // #region round#1 - the rooted path to sibling route at child level
            let expected = 'p1/foo/1';
            const p1El = host.querySelector('p-1');
            const p1 = CustomElement.for(p1El).viewModel;
            const c1El = host.querySelector('c-1');
            const c1 = CustomElement.for(c1El).viewModel;
            let path = await p1.generateRootedPath({ component: C3, params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#1 - p1.generateRootedPath({ component: C3 })');
            path = await c1.generateRootedPath({ component: '../c3', params: { id: 1 } });
            assert.strictEqual(path, expected, 'round#1 - c1.generateRootedPath({ component: \'../c3\', params: { id: 1 } })');
            let anchor = c1El.querySelector('a');
            c1.route = expected;
            await $yield();
            anchor.click();
            await $yield();
            assert.html.textContent(host, 'p1 c3 1', 'round#1 - click on link');
            // #endregion
            // #region round#2 - the rooted path to sibling route at grandchild level
            // go to grandchild
            await router.load('p2/bar/2/3/gc1');
            assert.html.textContent(host, 'p2 c4 2 3 gc1', 'round#2 - load(\'p2/bar/2/3/gc1\')');
            expected = 'p2/bar/2/3/gc2/4';
            // const p2El = host.querySelector('p-2')!;
            // const p2 = CustomElement.for<P2>(p2El).viewModel;
            const c4El = host.querySelector('c-4');
            const c4 = CustomElement.for(c4El).viewModel;
            const gc1El = host.querySelector('gc-1');
            const gc1 = CustomElement.for(gc1El).viewModel;
            path = await c4.generateRootedPath({ component: GC2, params: { id: 4 } });
            assert.strictEqual(path, expected, 'round#2 - c4.generateRootedPath({ component: GC2, params: { id: 4 } })');
            path = await gc1.generateRootedPath({ component: '../gc2', params: { id: 4 } });
            assert.strictEqual(path, expected, 'round#2 - gc1.generateRootedPath({ component: \'../gc2\', params: { id: 4 } })');
            anchor = gc1El.querySelector('a');
            gc1.route = expected;
            await $yield();
            anchor.click();
            await $yield();
            assert.html.textContent(host, 'p2 c4 2 3 gc2 4', 'round#2 - click on link');
            // #endregion
            await au.stop(true);
        });
    });
});
//# sourceMappingURL=generate-path.spec.js.map