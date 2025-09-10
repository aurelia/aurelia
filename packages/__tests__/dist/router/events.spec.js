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
import { DI, LogLevel, noop, resolve } from '@aurelia/kernel';
import { IRouter, IRouterEvents, pathUrlParser, RouterConfiguration, route } from '@aurelia/router';
import { AppTask, Aurelia, customElement } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';
describe('router/events.spec.ts', function () {
    async function start({ appRoot, registrations = [] }) {
        const ctx = TestContext.create();
        const { container } = ctx;
        container.register(TestRouterConfiguration.for(LogLevel.warn), RouterConfiguration, ...registrations, IRouterEventLoggerService, AppTask.creating(IRouterEventLoggerService, noop), // force the service creation
        AppTask.deactivating(IRouterEventLoggerService, service => service.dispose()));
        const au = new Aurelia(container);
        const host = ctx.createElement('div');
        await au.app({ component: appRoot, host }).start();
        const rootVm = au.root.controller.viewModel;
        return { host, au, container, rootVm };
    }
    const IRouterEventLoggerService = DI.createInterface('IRouterEventLoggerService', x => x.singleton(RouterEventLoggerService));
    class RouterEventLoggerService {
        constructor() {
            this.log = [];
            const events = resolve(IRouterEvents);
            this.subscriptions = [
                events.subscribe('au:router:navigation-start', (event) => {
                    this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, pathUrlParser, true)}'`);
                }),
                events.subscribe('au:router:navigation-end', (event) => {
                    this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, pathUrlParser, true)}'`);
                }),
                events.subscribe('au:router:navigation-cancel', (event) => {
                    this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, pathUrlParser, true)}' - ${String(event.reason)}`);
                }),
                events.subscribe('au:router:navigation-error', (event) => {
                    this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, pathUrlParser, true)}' - ${String(event.error)}`);
                }),
            ];
        }
        clear() {
            this.log.length = 0;
        }
        dispose() {
            const subscriptions = this.subscriptions;
            this.subscriptions.length = 0;
            const len = subscriptions.length;
            for (let i = 0; i < len; i++) {
                subscriptions[i].dispose();
            }
        }
    }
    it('successful navigation', async function () {
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildOne = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildOne = _classThis;
        })();
        let ChildTwo = (() => {
            let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c1'], component: ChildOne },
                        { id: 'r2', path: 'c2', component: ChildTwo },
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
        const { au, host, container } = await start({ appRoot: Root });
        const service = container.get(IRouterEventLoggerService);
        const router = container.get(IRouter);
        // init
        assert.html.textContent(host, 'c1');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 1 - \'\'',
            'au:router:navigation-end - 1 - \'\'',
        ]);
        // round#1
        service.clear();
        await router.load('c2');
        assert.html.textContent(host, 'c2');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 2 - \'c2\'',
            'au:router:navigation-end - 2 - \'c2\'',
        ]);
        // round#2
        service.clear();
        await router.load('c1');
        assert.html.textContent(host, 'c1');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 3 - \'c1\'',
            'au:router:navigation-end - 3 - \'c1\'',
        ]);
        await au.stop(true);
    });
    it('cancelled navigation - canLoad', async function () {
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildOne = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildOne = _classThis;
        })();
        let ChildTwo = (() => {
            let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildTwo = _classThis = class {
                canLoad(params) {
                    return Number(params.id) % 2 === 0;
                }
            };
            __setFunctionName(_classThis, "ChildTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: ['', 'c1'], component: ChildOne },
                        { path: 'c2/:id', component: ChildTwo },
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
        const { au, host, container } = await start({ appRoot: Root });
        const service = container.get(IRouterEventLoggerService);
        const router = container.get(IRouter);
        // init
        assert.html.textContent(host, 'c1');
        // round#1
        service.clear();
        await router.load('c2/43');
        assert.html.textContent(host, 'c1');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 2 - \'c2/43\'',
            'au:router:navigation-cancel - 2 - \'c2/43\' - guardsResult is false',
        ]);
        // round#2
        service.clear();
        await router.load('c2/42');
        assert.html.textContent(host, 'c2');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 3 - \'c2/42\'',
            'au:router:navigation-end - 3 - \'c2/42\'',
        ]);
        await au.stop(true);
    });
    it('cancelled navigation - canUnload', async function () {
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildOne = _classThis = class {
                canUnload() { return false; }
            };
            __setFunctionName(_classThis, "ChildOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildOne = _classThis;
        })();
        let ChildTwo = (() => {
            let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: ['', 'c1'], component: ChildOne },
                        { path: 'c2', component: ChildTwo },
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
        const { au, host, container } = await start({ appRoot: Root });
        const service = container.get(IRouterEventLoggerService);
        const router = container.get(IRouter);
        // init
        assert.html.textContent(host, 'c1');
        // round#1
        service.clear();
        await router.load('c2');
        assert.html.textContent(host, 'c1');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 2 - \'c2\'',
            'au:router:navigation-cancel - 2 - \'c2\' - guardsResult is false',
        ]);
        await au.stop(true);
    });
    it('cancelled navigation - unknown route', async function () {
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildOne = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildOne = _classThis;
        })();
        let ChildTwo = (() => {
            let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c1'], component: ChildOne },
                        { id: 'r2', path: 'c2', component: ChildTwo },
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
        const { au, host, container } = await start({ appRoot: Root });
        const service = container.get(IRouterEventLoggerService);
        const router = container.get(IRouter);
        // init
        assert.html.textContent(host, 'c1');
        // round#1
        service.clear();
        try {
            await router.load('c3');
            assert.fail('expected error due to unknown path');
        }
        catch (e) {
            /* noop */
        }
        assert.html.textContent(host, 'c1');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 2 - \'c3\'',
            'au:router:navigation-cancel - 2 - \'c3\' - guardsResult is true',
            'au:router:navigation-start - 3 - \'\'',
            'au:router:navigation-end - 3 - \'\'',
        ]);
        await au.stop(true);
    });
    it('erred navigation - without recovery', async function () {
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildOne = _classThis = class {
            };
            __setFunctionName(_classThis, "ChildOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildOne = _classThis;
        })();
        let ChildTwo = (() => {
            let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildTwo = _classThis = class {
                loading() {
                    throw new Error('synthetic test error');
                }
            };
            __setFunctionName(_classThis, "ChildTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ChildTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ChildTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c1'], component: ChildOne },
                        { id: 'r2', path: 'c2', component: ChildTwo },
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
        const { au, host, container } = await start({ appRoot: Root });
        const service = container.get(IRouterEventLoggerService);
        const router = container.get(IRouter);
        // init
        assert.html.textContent(host, 'c1', 'initial');
        // round#1
        service.clear();
        try {
            await router.load('c2');
            assert.fail('expected error');
        }
        catch (e) {
            /* noop */
        }
        assert.html.textContent(host, 'c1', 'post-erred navigation');
        assert.deepStrictEqual(service.log, [
            'au:router:navigation-start - 2 - \'c2\'',
            'au:router:navigation-error - 2 - \'c2\' - Error: synthetic test error',
            'au:router:navigation-cancel - 2 - \'c2\' - guardsResult is true',
            'au:router:navigation-start - 3 - \'\'',
            'au:router:navigation-end - 3 - \'\'',
        ]);
        await au.stop(true);
    });
});
//# sourceMappingURL=events.spec.js.map