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
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { resolve } from '@aurelia/kernel';
import { ICurrentRoute, IRouter, route } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
describe('router/current-route.spec.ts', function () {
    const emptyParams = Object.create(null);
    function assertCurrentRoute(actual, expected, messagePrefix = '') {
        assert.strictEqual(actual.path, expected.path, `${messagePrefix} - path`);
        assert.strictEqual(actual.url.endsWith(expected.url), true, `${messagePrefix} - url: ${actual.url} vs ${expected.url}`);
        assert.strictEqual(actual.title, expected.title, `${messagePrefix} - title`);
        assert.strictEqual(actual.query.toString(), expected.query.toString(), `${messagePrefix} - query`);
        assert.strictEqual(actual.parameterInformation.length, expected.parameterInformation.length, `${messagePrefix} - parameterInformation.length`);
        for (let i = 0; i < actual.parameterInformation.length; i++) {
            assertParameterInformation(actual.parameterInformation[i], expected.parameterInformation[i], `${messagePrefix} - parameterInformation[${i}]`);
        }
    }
    function assertParameterInformation(actual, expected, messagePrefix) {
        assert.strictEqual(actual.config?.id, expected.config.id, `${messagePrefix}.config.id`);
        assert.strictEqual(actual.viewport, expected.viewport, `${messagePrefix}.viewport`);
        const expectedParams = Object.create(null);
        Object.assign(expectedParams, expected.params);
        assert.deepStrictEqual(actual.params, expectedParams, `${messagePrefix}.params`);
        assert.strictEqual(actual.children.length, expected.children.length, `${messagePrefix}.children.length`);
        for (let i = 0; i < actual.children.length; i++) {
            assertParameterInformation(actual.children[i], expected.children[i], `${messagePrefix}.children[${i}]`);
        }
    }
    it('single-level', async function () {
        let C1 = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: '' })];
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
            let _classDecorators = [customElement({ name: 'c-2', template: '' })];
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
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c-1', 'c-1/:id1'], component: C1, title: 'C1' },
                        { id: 'r2', path: ['c-2', 'c-2/:id2'], component: C2, title: 'C2' },
                    ]
                }), customElement({ name: 'app', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.currentRoute = resolve(ICurrentRoute);
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
        const { au, container, rootVm } = await start({ appRoot: App });
        const router = container.get(IRouter);
        assertCurrentRoute(rootVm.currentRoute, {
            path: '',
            url: '',
            title: 'C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [],
                }
            ]
        }, 'round#0');
        await router.load('c-1');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1',
            url: 'c-1',
            title: 'C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [],
                }
            ]
        }, 'round#1');
        await router.load('c-2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2',
            url: 'c-2',
            title: 'C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [],
                }
            ]
        }, 'round#2');
        await router.load('c-1/1');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/1',
            url: 'c-1/1',
            title: 'C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: { id1: '1' },
                    children: [],
                }
            ]
        }, 'round#3');
        await router.load('c-2/2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/2',
            url: 'c-2/2',
            title: 'C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: { id2: '2' },
                    children: [],
                }
            ]
        }, 'round#4');
        await router.load('c-1/3?foo=bar');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/3',
            url: 'c-1/3?foo=bar',
            title: 'C1',
            query: new URLSearchParams('foo=bar'),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: { id1: '3' },
                    children: [],
                }
            ]
        }, 'round#5');
        await router.load('c-2/4?fizz=bizz');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/4',
            url: 'c-2/4?fizz=bizz',
            title: 'C2',
            query: new URLSearchParams('fizz=bizz'),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: { id2: '4' },
                    children: [],
                }
            ]
        }, 'round#6');
        await au.stop();
    });
    it('parent/child', async function () {
        let C11 = (() => {
            let _classDecorators = [customElement({ name: 'c-11', template: 'c-11' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C11 = _classThis = class {
            };
            __setFunctionName(_classThis, "C11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C11 = _classThis;
        })();
        let C12 = (() => {
            let _classDecorators = [customElement({ name: 'c-12', template: 'c-12' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C12 = _classThis = class {
            };
            __setFunctionName(_classThis, "C12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C12 = _classThis;
        })();
        let C21 = (() => {
            let _classDecorators = [customElement({ name: 'c-21', template: 'c-21' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C21 = _classThis = class {
            };
            __setFunctionName(_classThis, "C21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C21 = _classThis;
        })();
        let C22 = (() => {
            let _classDecorators = [customElement({ name: 'c-22', template: 'c-22' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C22 = _classThis = class {
            };
            __setFunctionName(_classThis, "C22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C22 = _classThis;
        })();
        let C1 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r11', path: ['', 'c-11', 'c-11/:id1'], component: C11, title: 'C11' },
                        { id: 'r12', path: ['c-12', 'c-12/:id2'], component: C12, title: 'C12' },
                    ]
                }), customElement({ name: 'c-1', template: 'c-1 <au-viewport></au-viewport>' })];
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
            let _classDecorators = [route({
                    routes: [
                        { id: 'r21', path: ['', 'c-21', 'c-21/:id1'], component: C21, title: 'C21' },
                        { id: 'r22', path: ['c-22', 'c-22/:id2'], component: C22, title: 'C22' },
                    ]
                }), customElement({ name: 'c-2', template: 'c-2 <au-viewport></au-viewport>' })];
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
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c-1'], component: C1, title: 'C1' },
                        { id: 'r2', path: ['c-2'], component: C2, title: 'C2' },
                    ]
                }), customElement({ name: 'app', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.currentRoute = resolve(ICurrentRoute);
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
        const { au, container, rootVm } = await start({ appRoot: App, registrations: [C11, C12, C21, C22] });
        const router = container.get(IRouter);
        assertCurrentRoute(rootVm.currentRoute, {
            path: '',
            url: '',
            title: 'C11 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#0');
        await router.load('c-1/c-11');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/c-11',
            url: 'c-1/c-11',
            title: 'C11 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#1');
        await router.load('c-2/c-21');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/c-21',
            url: 'c-2/c-21',
            title: 'C21 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#2');
        await router.load('c-1/c-12/1');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/c-12/1',
            url: 'c-1/c-12/1',
            title: 'C12 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: { id2: '1' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#3');
        await router.load('c-1/c-12/2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/c-12/2',
            url: 'c-1/c-12/2',
            title: 'C12 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: { id2: '2' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#4');
        await router.load('c-1/c-11/3');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/c-11/3',
            url: 'c-1/c-11/3',
            title: 'C11 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: { id1: '3' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#5');
        await router.load('c-2/c-21/4');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/c-21/4',
            url: 'c-2/c-21/4',
            title: 'C21 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: { id1: '4' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#6');
        await router.load('c-2/c-22/5');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/c-22/5',
            url: 'c-2/c-22/5',
            title: 'C22 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r22' },
                            viewport: 'default',
                            params: { id2: '5' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#7');
        await router.load('c-1/c-12/6?foo=bar');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/c-12/6',
            url: 'c-1/c-12/6?foo=bar',
            title: 'C12 | C1',
            query: new URLSearchParams('foo=bar'),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: { id2: '6' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#8');
        await router.load('c-2/c-21/7?fizz=bizz');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/c-21/7',
            url: 'c-2/c-21/7?fizz=bizz',
            title: 'C21 | C2',
            query: new URLSearchParams('fizz=bizz'),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: { id1: '7' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#9');
        await au.stop();
    });
    it('optional constrained parameter', async function () {
        let C11 = (() => {
            let _classDecorators = [customElement({ name: 'c-11', template: 'c-11' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C11 = _classThis = class {
            };
            __setFunctionName(_classThis, "C11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C11 = _classThis;
        })();
        let C12 = (() => {
            let _classDecorators = [customElement({ name: 'c-12', template: 'c-12' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C12 = _classThis = class {
            };
            __setFunctionName(_classThis, "C12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C12 = _classThis;
        })();
        let C21 = (() => {
            let _classDecorators = [customElement({ name: 'c-21', template: 'c-21' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C21 = _classThis = class {
            };
            __setFunctionName(_classThis, "C21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C21 = _classThis;
        })();
        let C22 = (() => {
            let _classDecorators = [customElement({ name: 'c-22', template: 'c-22' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C22 = _classThis = class {
            };
            __setFunctionName(_classThis, "C22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C22 = _classThis;
        })();
        let C1 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r11', path: ['', 'c-11/:id1?'], component: C11, title: 'C11' },
                        { id: 'r12', path: ['c-12/:id2?'], component: C12, title: 'C12' },
                    ]
                }), customElement({ name: 'c-1', template: 'c-1 <au-viewport></au-viewport>' })];
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
            let _classDecorators = [route({
                    routes: [
                        { id: 'r21', path: ['', 'c-21/:id1?'], component: C21, title: 'C21' },
                        { id: 'r22', path: ['c-22/:id2?'], component: C22, title: 'C22' },
                    ]
                }), customElement({ name: 'c-2', template: 'c-2 <au-viewport></au-viewport>' })];
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
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c-1/:id{{^\\d+$}}?'], component: C1, title: 'C1' },
                        { id: 'r2', path: ['c-2/:id{{^\\d+$}}?'], component: C2, title: 'C2' },
                    ]
                }), customElement({ name: 'app', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.currentRoute = resolve(ICurrentRoute);
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
        const { au, container, rootVm } = await start({ appRoot: App, registrations: [C11, C12, C21, C22] });
        const router = container.get(IRouter);
        assertCurrentRoute(rootVm.currentRoute, {
            path: '',
            url: '',
            title: 'C11 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#0');
        await router.load('c-2/c-22');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/c-22',
            url: 'c-2/c-22',
            title: 'C22 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: { id: undefined },
                    children: [
                        {
                            config: { id: 'r22' },
                            viewport: 'default',
                            params: { id2: undefined },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#1');
        await router.load('c-2/1/c-21/2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/1/c-21/2',
            url: 'c-2/1/c-21/2',
            title: 'C21 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'default',
                    params: { id: '1' },
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: { id1: '2' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#2');
        await router.load('c-1/c-12/1');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/c-12/1',
            url: 'c-1/c-12/1',
            title: 'C12 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'default',
                    params: { id: undefined },
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: { id2: '1' },
                            children: [],
                        }
                    ],
                }
            ]
        }, 'round#3');
        await au.stop();
    });
    it('sibling', async function () {
        let C1 = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: '' })];
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
            let _classDecorators = [customElement({ name: 'c-2', template: '' })];
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
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c-1', 'c-1/:id1'], component: C1, title: 'C1' },
                        { id: 'r2', path: ['c-2', 'c-2/:id2'], component: C2, title: 'C2' },
                    ]
                }), customElement({ name: 'app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2"></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.currentRoute = resolve(ICurrentRoute);
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
        const { au, container, rootVm } = await start({ appRoot: App });
        const router = container.get(IRouter);
        assertCurrentRoute(rootVm.currentRoute, {
            path: '+',
            url: '',
            title: 'C1 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [],
                },
            ]
        }, 'round#0');
        await router.load('c-1+c-2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1@vp1+c-2@vp2',
            url: 'c-1@vp1+c-2@vp2',
            title: 'C1 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [],
                },
                {
                    config: { id: 'r2' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [],
                },
            ]
        }, 'round#1');
        await router.load('c-1@vp2+c-2@vp1');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1@vp2+c-2@vp1',
            url: 'c-1@vp2+c-2@vp1',
            title: 'C1 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [],
                },
                {
                    config: { id: 'r2' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [],
                },
            ]
        }, 'round#2');
        await router.load('c-2/1@vp1+c-1@vp2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/1@vp1+c-1@vp2',
            url: 'c-2/1@vp1+c-1@vp2',
            title: 'C2 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'vp1',
                    params: { id2: '1' },
                    children: [],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [],
                },
            ]
        }, 'round#3');
        await router.load('c-2/1@vp1+c-1/3@vp2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2/1@vp1+c-1/3@vp2',
            url: 'c-2/1@vp1+c-1/3@vp2',
            title: 'C2 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'vp1',
                    params: { id2: '1' },
                    children: [],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: { id1: '3' },
                    children: [],
                },
            ]
        }, 'round#4');
        await router.load('c-1/2@vp1+c-1/4@vp2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/2@vp1+c-1/4@vp2',
            url: 'c-1/2@vp1+c-1/4@vp2',
            title: 'C1 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp1',
                    params: { id1: '2' },
                    children: [],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: { id1: '4' },
                    children: [],
                },
            ]
        }, 'round#5');
        await router.load('c-1/2@vp1+c-1/4@vp2?foo=bar');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1/2@vp1+c-1/4@vp2',
            url: 'c-1/2@vp1+c-1/4@vp2?foo=bar',
            title: 'C1 | C1',
            query: new URLSearchParams('foo=bar'),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp1',
                    params: { id1: '2' },
                    children: [],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: { id1: '4' },
                    children: [],
                },
            ]
        }, 'round#6');
        await au.stop();
    });
    it('parent/child + sibling', async function () {
        let C11 = (() => {
            let _classDecorators = [customElement({ name: 'c-11', template: 'c-11' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C11 = _classThis = class {
            };
            __setFunctionName(_classThis, "C11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C11 = _classThis;
        })();
        let C12 = (() => {
            let _classDecorators = [customElement({ name: 'c-12', template: 'c-12' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C12 = _classThis = class {
            };
            __setFunctionName(_classThis, "C12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C12 = _classThis;
        })();
        let C21 = (() => {
            let _classDecorators = [customElement({ name: 'c-21', template: 'c-21' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C21 = _classThis = class {
            };
            __setFunctionName(_classThis, "C21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C21 = _classThis;
        })();
        let C22 = (() => {
            let _classDecorators = [customElement({ name: 'c-22', template: 'c-22' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C22 = _classThis = class {
            };
            __setFunctionName(_classThis, "C22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C22 = _classThis;
        })();
        let C1 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r11', path: ['', 'c-11', 'c-11/:id1'], component: C11, title: 'C11' },
                        { id: 'r12', path: ['c-12', 'c-12/:id2'], component: C12, title: 'C12' },
                    ]
                }), customElement({ name: 'c-1', template: 'c-1 <au-viewport></au-viewport>' })];
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
            let _classDecorators = [route({
                    routes: [
                        { id: 'r21', path: ['', 'c-21', 'c-21/:id1'], component: C21, title: 'C21' },
                        { id: 'r22', path: ['c-22', 'c-22/:id2'], component: C22, title: 'C22' },
                    ]
                }), customElement({ name: 'c-2', template: 'c-2 <au-viewport></au-viewport>' })];
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
        let App = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'r1', path: ['', 'c-1'], component: C1, title: 'C1' },
                        { id: 'r2', path: ['c-2'], component: C2, title: 'C2' },
                    ]
                }), customElement({ name: 'app', template: '<au-viewport name="vp1"></au-viewport><au-viewport name="vp2"></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.currentRoute = resolve(ICurrentRoute);
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
        const { au, container, rootVm } = await start({ appRoot: App });
        const router = container.get(IRouter);
        assertCurrentRoute(rootVm.currentRoute, {
            path: '+',
            url: '',
            title: 'C11 | C1 | C11 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                },
            ]
        }, 'round#0');
        await router.load('c-1/c-11+c-2/c-21');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1@vp1/c-11+c-2@vp2/c-21',
            url: 'c-1@vp1/c-11+c-2@vp2/c-21',
            title: 'C11 | C1 | C21 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r11' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                },
                {
                    config: { id: 'r2' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                },
            ]
        }, 'round#1');
        await router.load('c-1@vp2/c-12+c-2@vp1/c-22');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-1@vp2/c-12+c-2@vp1/c-22',
            url: 'c-1@vp2/c-12+c-2@vp1/c-22',
            title: 'C12 | C1 | C22 | C2',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                },
                {
                    config: { id: 'r2' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r22' },
                            viewport: 'default',
                            params: emptyParams,
                            children: [],
                        }
                    ],
                },
            ]
        }, 'round#2');
        await router.load('c-2@vp1/c-21/1+c-1@vp2/c-12/2');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2',
            url: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2',
            title: 'C21 | C2 | C12 | C1',
            query: new URLSearchParams(),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: { id1: '1' },
                            children: [],
                        }
                    ],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: { id2: '2' },
                            children: [],
                        }
                    ],
                },
            ]
        }, 'round#3');
        await router.load('c-2@vp1/c-21/1+c-1@vp2/c-12/2?foo=bar');
        assertCurrentRoute(rootVm.currentRoute, {
            path: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2',
            url: 'c-2@vp1/c-21/1+c-1@vp2/c-12/2?foo=bar',
            title: 'C21 | C2 | C12 | C1',
            query: new URLSearchParams("foo=bar"),
            parameterInformation: [
                {
                    config: { id: 'r2' },
                    viewport: 'vp1',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r21' },
                            viewport: 'default',
                            params: { id1: '1' },
                            children: [],
                        }
                    ],
                },
                {
                    config: { id: 'r1' },
                    viewport: 'vp2',
                    params: emptyParams,
                    children: [
                        {
                            config: { id: 'r12' },
                            viewport: 'default',
                            params: { id2: '2' },
                            children: [],
                        }
                    ],
                },
            ]
        }, 'round#4');
        await au.stop();
    });
});
//# sourceMappingURL=current-route.spec.js.map