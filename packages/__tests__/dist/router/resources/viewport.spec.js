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
import { IRouter, route } from '@aurelia/router';
import { CustomElement, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';
describe('router/resources/viewport.spec.ts', function () {
    function assertText(vps, expected) {
        for (let i = 0; i < expected.length; i++) {
            assert.html.textContent(vps[i], expected[i], `content #${i + 1}`);
        }
    }
    it('sibling viewports with non-default routes are supported by binding the default property to null', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: 'ce2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-one'],
                            component: CeOne,
                        },
                        {
                            path: 'ce-two',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const [vp1, vp2] = Array.from(host.querySelectorAll('au-viewport'));
        const vm1 = CustomElement.for(vp1).viewModel;
        const vm2 = CustomElement.for(vp2).viewModel;
        assert.strictEqual(vm1.name, '$1');
        assert.strictEqual(vm2.name, '$2');
        assert.html.textContent(vp1, 'ce1');
        assert.html.textContent(vp2, '');
        await router.load('ce-two');
        await queue.yield();
        assert.html.textContent(vp1, 'ce2');
        assert.html.textContent(vp2, '');
        await router.load('ce-one');
        await queue.yield();
        assert.html.textContent(vp1, 'ce1');
        assert.html.textContent(vp2, '');
        await router.load('ce-two@$1+ce-one@$2');
        await queue.yield();
        assert.html.textContent(vp1, 'ce2');
        assert.html.textContent(vp2, 'ce1');
        await au.stop(true);
    });
    it('sibling viewports in children with non-default routes are supported by binding the default property to null', async function () {
        let CeOneOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-11', template: `ce11` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOneOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOneOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOneOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOneOne = _classThis;
        })();
        let CeTwoOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-21', template: `ce21` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwoOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeTwoOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwoOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwoOne = _classThis;
        })();
        let CeOne = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-11'],
                            component: CeOneOne,
                        }
                    ]
                }), customElement({
                    name: 'ce-one', template: `ce1
        <au-viewport name="$1"></au-viewport>
        <au-viewport name="$2" default.bind="null"></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-21'],
                            component: CeTwoOne,
                        }
                    ]
                }), customElement({
                    name: 'ce-two', template: `ce2
    <au-viewport name="$1"></au-viewport>
    <au-viewport name="$2" default.bind="null"></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-one'],
                            component: CeOne,
                        },
                        {
                            path: 'ce-two',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        assert.html.textContent(host, 'ce1 ce11');
        await router.load('ce-two');
        await queue.yield();
        assert.html.textContent(host, 'ce2 ce21');
        await router.load('ce-one/ce-11');
        await queue.yield();
        assert.html.textContent(host, 'ce1 ce11');
        await router.load('ce-two@$1+ce-one@$2');
        await queue.yield();
        assert.html.textContent(host, 'ce2 ce21 ce1 ce11');
        await au.stop(true);
    });
    it('sibling viewports in children with non-default routes are supported by binding the default property to null - transition plan: invoke-lifecycle', async function () {
        let CeTwoOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-21', template: `ce21` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwoOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeTwoOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwoOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwoOne = _classThis;
        })();
        let CeOne = (() => {
            let _classDecorators = [customElement({
                    name: 'ce-one', template: `ce1`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-21'],
                            component: CeTwoOne,
                        }
                    ]
                }), customElement({
                    name: 'ce-two', template: `ce2
    <au-viewport name="$1"></au-viewport>
    <au-viewport name="$2" default.bind="null"></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-one'],
                            component: CeOne,
                        },
                        {
                            path: 'ce-two',
                            component: CeTwo,
                        },
                    ],
                    transitionPlan() { return 'invoke-lifecycles'; }
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const [vp1, vp2] = Array.from(host.querySelectorAll('au-viewport'));
        const vm1 = CustomElement.for(vp1).viewModel;
        const vm2 = CustomElement.for(vp2).viewModel;
        assert.strictEqual(vm1.name, '$1');
        assert.strictEqual(vm2.name, '$2');
        assert.html.textContent(vp1, 'ce1');
        assert.html.textContent(vp2, '');
        await router.load('ce-two/ce-21');
        await queue.yield();
        assert.html.textContent(vp1, 'ce2 ce21');
        assert.html.textContent(vp2, '');
        await router.load('ce-two@$2+ce-one@$1');
        await queue.yield();
        assert.html.textContent(vp1, 'ce1');
        assert.html.textContent(vp2, 'ce2 ce21');
        await au.stop(true);
    });
    it('sibling viewports - load non-empty-route@non-default-vp+empty-alias-route@default-vp', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: 'ce2 ${id}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: ['', 'ce-one'],
                            component: CeOne,
                        },
                        {
                            path: 'ce-two/:id',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport name="$1"></au-viewport>
                <au-viewport name="$2" default.bind="null"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        assert.html.textContent(host, 'ce1');
        await router.load('ce-two/42@$2+ce-one@$1');
        await queue.yield();
        assert.html.textContent(host, 'ce1 ce2 42');
        await au.stop(true);
    });
    // precondition: exists a mixture of named and unnamed viewports
    // action: components are attempted to be loaded into named viewports
    // expectation: components are loaded into named viewports
    it('targeted components can be loaded into named viewports even when default viewports are present', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: 'ce2 ${id}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: 'ce-one',
                            component: CeOne,
                        },
                        {
                            path: 'ce-two/:id',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport></au-viewport>
                <au-viewport name="$1"></au-viewport>
                <au-viewport></au-viewport>
                <au-viewport name="$2"></au-viewport>
                <au-viewport></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const vps = Array.from(host.querySelectorAll('au-viewport'));
        const vms = vps.map(vp => CustomElement.for(vp).viewModel);
        assert.deepStrictEqual(vms.map(vm => vm.name), ['default', '$1', 'default', '$2', 'default']);
        await router.load('ce-one@$1');
        await queue.yield();
        assertText(vps, ['', 'ce1', '', '', '']);
        await router.load('ce-one@$2+ce-two/42@$1');
        await queue.yield();
        assertText(vps, ['', 'ce2 42', '', 'ce1', '']);
        await router.load('ce-one+ce-two/42');
        await queue.yield();
        assertText(vps, ['ce1', 'ce2 42', '', '', '']);
        await au.stop(true);
    });
    it('viewport configuration for route is respected', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: 'ce2 ${id}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: 'ce-one',
                            component: CeOne,
                            viewport: '$2',
                        },
                        {
                            path: 'ce-two/:id',
                            component: CeTwo,
                            viewport: '$1',
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport></au-viewport>
                <au-viewport name="$1"></au-viewport>
                <au-viewport></au-viewport>
                <au-viewport name="$2"></au-viewport>
                <au-viewport></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const vps = Array.from(host.querySelectorAll('au-viewport'));
        const vms = vps.map(vp => CustomElement.for(vp).viewModel);
        assert.deepStrictEqual(vms.map(vm => vm.name), ['default', '$1', 'default', '$2', 'default']);
        await router.load('ce-one');
        await queue.yield();
        assertText(vps, ['', '', '', 'ce1', '']);
        await router.load('ce-one+ce-two/42');
        await queue.yield();
        assertText(vps, ['', 'ce2 42', '', 'ce1', '']);
        try {
            await router.load('ce-one@$1');
            assert.fail('expected error for loading ce-one@$1');
        }
        catch {
            /** ignore */
        }
        try {
            await router.load('ce-two/42@$2');
            assert.fail('expected error for loading ce-two/42@$2');
        }
        catch {
            /** ignore */
        }
        await au.stop(true);
    });
    it('multiple routes can use the same viewport', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: 'ce2 ${id}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            path: 'ce-one',
                            component: CeOne,
                            viewport: '$1',
                        },
                        {
                            path: 'ce-two/:id',
                            component: CeTwo,
                            viewport: '$1',
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport></au-viewport>
                <au-viewport name="$1"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const vps = Array.from(host.querySelectorAll('au-viewport'));
        const vms = vps.map(vp => CustomElement.for(vp).viewModel);
        assert.deepStrictEqual(vms.map(vm => vm.name), ['default', '$1']);
        await router.load('ce-one');
        await queue.yield();
        assertText(vps, ['', 'ce1']);
        await router.load('ce-two/42');
        await queue.yield();
        assertText(vps, ['', 'ce2 42']);
        try {
            await router.load('ce-one+ce-two/42');
            assert.fail('expected error for loading ce-one+ce-two/42');
        }
        catch {
            /** ignore */
        }
        await au.stop(true);
    });
    it('used-by is respected', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: '${id1} ce2 ${id2}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id1 = params.id1;
                    this.id2 = params.id2;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            id: 'ce1',
                            path: 'ce-one',
                            component: CeOne,
                        },
                        {
                            id: 'ce2',
                            path: ':id1/foo/:id2',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport used-by="whatever"></au-viewport>
                <au-viewport used-by="ce-two"></au-viewport>
                <au-viewport used-by="ce-one"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const vps = Array.from(host.querySelectorAll('au-viewport'));
        await router.load('ce-one');
        await queue.yield();
        assertText(vps, ['', '', 'ce1']);
        await router.load('42/foo/43');
        await queue.yield();
        assertText(vps, ['', '42 ce2 43', '']);
        await router.load('ce1+43/foo/42');
        await queue.yield();
        assertText(vps, ['', '43 ce2 42', 'ce1']);
        await au.stop(true);
    });
    it('comma-separated used-by is respected', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: '${id1} ce2 ${id2}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id1 = params.id1;
                    this.id2 = params.id2;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            id: 'ce1',
                            path: 'ce-one',
                            component: CeOne,
                        },
                        {
                            id: 'ce2',
                            path: ':id1/foo/:id2',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport used-by="whatever"></au-viewport>
                <au-viewport used-by="ce-one,ce-two"></au-viewport>
                <au-viewport used-by="ce-one"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const vps = Array.from(host.querySelectorAll('au-viewport'));
        await router.load('ce-one');
        await queue.yield();
        assertText(vps, ['', 'ce1', '']);
        await router.load('42/foo/43');
        await queue.yield();
        assertText(vps, ['', '42 ce2 43', '']);
        await router.load('43/foo/42+ce1');
        await queue.yield();
        assertText(vps, ['', '43 ce2 42', 'ce1']);
        try {
            await router.load('ce1+43/foo/42');
            assert.fail('expected failure due to no free viewport to handle "43/foo/42" from the instruction "ce1+43/foo/42"');
        }
        catch {
            /* ignore */
        }
        await au.stop(true);
    });
    it('a preceding default (without used-by) can load components', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: 'ce1' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: '${id1} ce2 ${id2}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                canLoad(params) {
                    this.id1 = params.id1;
                    this.id2 = params.id2;
                    return true;
                }
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        {
                            id: 'ce1',
                            path: 'ce-one',
                            component: CeOne,
                        },
                        {
                            id: 'ce2',
                            path: ':id1/foo/:id2',
                            component: CeTwo,
                        },
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
                <au-viewport></au-viewport>
                <au-viewport used-by="ce-one,ce-two"></au-viewport>
            `
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
        const { au, container, host } = await start({ appRoot: Root, registrations: [CeOne] });
        const queue = container.get(IPlatform).domQueue;
        const router = container.get(IRouter);
        await queue.yield();
        const vps = Array.from(host.querySelectorAll('au-viewport'));
        await router.load('ce-one');
        await queue.yield();
        assertText(vps, ['ce1', '']);
        await router.load('42/foo/43');
        await queue.yield();
        assertText(vps, ['42 ce2 43', '']);
        await router.load('43/foo/42+ce1');
        await queue.yield();
        assertText(vps, ['43 ce2 42', 'ce1']);
        await au.stop(true);
    });
});
//# sourceMappingURL=viewport.spec.js.map