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
import { IPlatform, resolve } from '@aurelia/kernel';
import { IRouter, IRouterEvents, route } from '@aurelia/router';
import { customElement, IHistory, IWindow } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { isNode } from '../util.js';
import { getLocationChangeHandlerRegistration } from './_shared/configuration.js';
import { start } from './_shared/create-fixture.js';
describe('router/location-manager.spec.ts', function () {
    if (isNode()) {
        return;
    }
    for (const [useHash, event] of [[true, 'hashchange'], [false, 'popstate']]) {
        it(`listens to ${event} event and facilitates navigation when useUrlFragmentHash is set to ${useHash}`, async function () {
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
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['', 'c1'], component: C1 },
                            { path: 'c2', component: C2 },
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
            const { au, container, host } = await start({ appRoot: Root, useHash, registrations: [getLocationChangeHandlerRegistration()], historyStrategy: 'push' });
            const router = container.get(IRouter);
            const queue = container.get(IPlatform).taskQueue;
            const eventLog = [];
            const subscriber = container.get(IRouterEvents)
                .subscribe('au:router:location-change', (ev) => {
                eventLog.push([ev.trigger, ev.url]);
            });
            assert.html.textContent(host, 'c1', 'init');
            assert.deepStrictEqual(eventLog, [], 'init event log');
            // first make some navigation
            await router.load('c2');
            assert.html.textContent(host, 'c2', 'nav1');
            assert.deepStrictEqual(eventLog, [], 'nav1 event log');
            await router.load('c1');
            assert.html.textContent(host, 'c1', 'nav2');
            assert.deepStrictEqual(eventLog, [], 'nav2 event log');
            // navigate through history states - round#1
            const history = container.get(IHistory);
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c2', 'back');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c2$/, 'back event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1', 'forward');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            // navigate through history states - round#2
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c2', 'back');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c2$/, 'back event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1', 'forward');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            // navigate through history states - round#3
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c2', 'back');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c2$/, 'back event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1', 'forward');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            // lastly dispatch a hashchange event
            eventLog.length = 0;
            const unsubscribedEvent = useHash ? 'popstate' : 'hashchange';
            container.get(IWindow).dispatchEvent(new HashChangeEvent(unsubscribedEvent));
            await queue.yield();
            assert.deepStrictEqual(eventLog, [], `${unsubscribedEvent} event log`);
            subscriber.dispose();
            await au.stop(true);
        });
        it(`listens to ${event} event and facilitates navigation when useUrlFragmentHash is set to ${useHash} - parent-child`, async function () {
            let GC1 = (() => {
                let _classDecorators = [customElement({ name: 'gc-1', template: 'gc1' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC1 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC1 = _classThis;
            })();
            let GC2 = (() => {
                let _classDecorators = [customElement({ name: 'gc-2', template: 'gc2' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC2 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC2 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['', 'gc-1'], component: GC1 },
                            { path: 'gc-2', component: GC2 },
                        ]
                    }), customElement({ name: 'c-1', template: '<a load="gc-2"></a> c1 <au-viewport></au-viewport>' })];
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
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['', 'c1'], component: C1 },
                            { path: 'c2', component: C2 },
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
            const { au, container, host } = await start({ appRoot: Root, useHash, registrations: [getLocationChangeHandlerRegistration()], historyStrategy: 'push' });
            const router = container.get(IRouter);
            const queue = container.get(IPlatform).taskQueue;
            const eventLog = [];
            const subscriber = container.get(IRouterEvents)
                .subscribe('au:router:location-change', (ev) => {
                eventLog.push([ev.trigger, ev.url]);
            });
            assert.html.textContent(host, 'c1 gc1', 'init');
            assert.deepStrictEqual(eventLog, [], 'init event log');
            // first make some navigation
            await router.load('c2');
            assert.html.textContent(host, 'c2', 'nav1');
            assert.deepStrictEqual(eventLog, [], 'nav1 event log');
            await router.load('c1');
            assert.html.textContent(host, 'c1 gc1', 'nav2');
            assert.deepStrictEqual(eventLog, [], 'nav2 event log');
            const anchor = host.querySelector('a');
            anchor.click();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'nav3');
            assert.deepStrictEqual(eventLog, [], 'nav1 event log');
            // navigate through history states - round#1
            const history = container.get(IHistory);
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc1', 'back1');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'forward1');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1\/gc-2$/, 'back event log path');
            // navigate through history states - round#2
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc1', 'back2');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'forward2');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1\/gc-2$/, 'back event log path');
            // navigate through history states - round#3
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc1', 'back3');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'forward3');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1\/gc-2$/, 'back event log path');
            subscriber.dispose();
            await au.stop(true);
        });
        it(`listens to ${event} event and facilitates navigation when useUrlFragmentHash is set to ${useHash} - sibling`, async function () {
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
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'c1', component: C1 },
                            { path: 'c2', component: C2 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport> <au-viewport></au-viewport>' })];
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
            const { au, container, host } = await start({ appRoot: Root, useHash, registrations: [getLocationChangeHandlerRegistration()], historyStrategy: 'push' });
            const router = container.get(IRouter);
            const queue = container.get(IPlatform).taskQueue;
            const eventLog = [];
            const subscriber = container.get(IRouterEvents)
                .subscribe('au:router:location-change', (ev) => {
                eventLog.push([ev.trigger, ev.url]);
            });
            // first make some navigation
            await router.load('c1+c2');
            assert.html.textContent(host, 'c1 c2', 'nav1');
            assert.deepStrictEqual(eventLog, [], 'nav1 event log');
            await router.load('c2+c1');
            assert.html.textContent(host, 'c2 c1', 'nav2');
            assert.deepStrictEqual(eventLog, [], 'nav2 event log');
            // navigate through history states - round#1
            const history = container.get(IHistory);
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 c2', 'back1');
            assert.strictEqual(eventLog.length, 1, 'back1 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back1 event log trigger');
            assert.match(eventLog[0][1], /c1\+c2$/, 'back1 event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c2 c1', 'forward1');
            assert.strictEqual(eventLog.length, 1, 'forward1 event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward1 event log trigger');
            assert.match(eventLog[0][1], /c2\+c1$/, 'forward1 event log path');
            // navigate through history states - round#2
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 c2', 'back2');
            assert.strictEqual(eventLog.length, 1, 'back2 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back2 event log trigger');
            assert.match(eventLog[0][1], /c1\+c2$/, 'back2 event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c2 c1', 'forward2');
            assert.strictEqual(eventLog.length, 1, 'forward2 event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward2 event log trigger');
            assert.match(eventLog[0][1], /c2\+c1$/, 'forward2 event log path');
            // navigate through history states - round#3
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 c2', 'back3');
            assert.strictEqual(eventLog.length, 1, 'back3 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back3 event log trigger');
            assert.match(eventLog[0][1], /c1\+c2$/, 'back3 event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c2 c1', 'forward3');
            assert.strictEqual(eventLog.length, 1, 'forward3 event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward3 event log trigger');
            assert.match(eventLog[0][1], /c2\+c1$/, 'forward3 event log path');
            subscriber.dispose();
            await au.stop(true);
        });
        it(`listens to ${event} event and facilitates navigation when useUrlFragmentHash is set to ${useHash} - sibling/child`, async function () {
            let GC11 = (() => {
                let _classDecorators = [customElement({ name: 'gc-11', template: 'gc11' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC11 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC11");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC11 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC11 = _classThis;
            })();
            let GC12 = (() => {
                let _classDecorators = [customElement({ name: 'gc-12', template: 'gc12' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC12 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC12");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC12 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC12 = _classThis;
            })();
            let GC21 = (() => {
                let _classDecorators = [customElement({ name: 'gc-21', template: 'gc21' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC21 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC21");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC21 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC21 = _classThis;
            })();
            let GC22 = (() => {
                let _classDecorators = [customElement({ name: 'gc-22', template: 'gc22' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC22 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC22");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC22 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC22 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['', 'gc-11'], component: GC11 },
                            { path: 'gc-12', component: GC12 },
                        ]
                    }), customElement({ name: 'c-1', template: 'c1 <au-viewport></au-viewport>' })];
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
                            { path: ['', 'gc-21'], component: GC21 },
                            { path: 'gc-22', component: GC22 },
                        ]
                    }), customElement({ name: 'c-2', template: 'c2 <au-viewport></au-viewport>' })];
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
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'c1', component: C1 },
                            { path: 'c2', component: C2 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport> <au-viewport></au-viewport>' })];
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
            const { au, container, host } = await start({ appRoot: Root, useHash, registrations: [getLocationChangeHandlerRegistration()], historyStrategy: 'push' });
            const router = container.get(IRouter);
            const queue = container.get(IPlatform).taskQueue;
            const eventLog = [];
            const subscriber = container.get(IRouterEvents)
                .subscribe('au:router:location-change', (ev) => {
                eventLog.push([ev.trigger, ev.url]);
            });
            // first make some navigation
            await router.load('c1+c2');
            assert.html.textContent(host, 'c1 gc11 c2 gc21', 'nav1');
            assert.deepStrictEqual(eventLog, [], 'nav1 event log');
            await router.load('c2/gc-22+c1/gc-12');
            assert.html.textContent(host, 'c2 gc22 c1 gc12', 'nav2');
            assert.deepStrictEqual(eventLog, [], 'nav2 event log');
            // navigate through history states - round#1
            const history = container.get(IHistory);
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc11 c2 gc21', 'back1');
            assert.strictEqual(eventLog.length, 1, 'back1 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back1 event log trigger');
            assert.match(eventLog[0][1], /c1\+c2$/, 'back1 event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c2 gc22 c1 gc12', 'forward1');
            assert.strictEqual(eventLog.length, 1, 'forward1 event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward1 event log trigger');
            assert.match(eventLog[0][1], /c2\/gc-22\+c1\/gc-12$/, 'forward1 event log path');
            // navigate through history states - round#2
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc11 c2 gc21', 'back2');
            assert.strictEqual(eventLog.length, 1, 'back2 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back2 event log trigger');
            assert.match(eventLog[0][1], /c1\+c2$/, 'back2 event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c2 gc22 c1 gc12', 'forward2');
            assert.strictEqual(eventLog.length, 1, 'forward2 event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward2 event log trigger');
            assert.match(eventLog[0][1], /c2\/gc-22\+c1\/gc-12$/, 'forward2 event log path');
            // navigate through history states - round#3
            eventLog.length = 0;
            history.back();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc11 c2 gc21', 'back3');
            assert.strictEqual(eventLog.length, 1, 'back3 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back3 event log trigger');
            assert.match(eventLog[0][1], /c1\+c2$/, 'back3 event log path');
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c2 gc22 c1 gc12', 'forward3');
            assert.strictEqual(eventLog.length, 1, 'forward3 event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward3 event log trigger');
            assert.match(eventLog[0][1], /c2\/gc-22\+c1\/gc-12$/, 'forward3 event log path');
            subscriber.dispose();
            await au.stop(true);
        });
        it(`parent-child - replicates GH issue 1658 - useUrlFragmentHash: ${useHash}, event: ${event}`, async function () {
            let GC1 = (() => {
                let _classDecorators = [customElement({ name: 'gc-1', template: 'gc1 <a href="../gc-2"></a>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC1 = _classThis = class {
                };
                __setFunctionName(_classThis, "GC1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC1 = _classThis;
            })();
            let GC2 = (() => {
                let _classDecorators = [customElement({ name: 'gc-2', template: 'gc2 <button click.trigger="goBack()"></button>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GC2 = _classThis = class {
                    constructor() {
                        this.history = resolve(IHistory);
                    }
                    goBack() { history.back(); }
                };
                __setFunctionName(_classThis, "GC2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GC2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GC2 = _classThis;
            })();
            let C1 = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: ['', 'gc-1'], component: GC1 },
                            { path: 'gc-2', component: GC2 },
                        ]
                    }), customElement({ name: 'c-1', template: 'c1 <au-viewport></au-viewport>' })];
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
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'c1', component: C1 },
                            { path: 'c2', component: C2 },
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
            const { au, container, host } = await start({ appRoot: Root, useHash, registrations: [getLocationChangeHandlerRegistration()], historyStrategy: 'push' });
            const router = container.get(IRouter);
            const queue = container.get(IPlatform).taskQueue;
            const history = container.get(IHistory);
            const eventLog = [];
            const subscriber = container.get(IRouterEvents)
                .subscribe('au:router:location-change', (ev) => {
                eventLog.push([ev.trigger, ev.url]);
            });
            assert.html.textContent(host, '', 'init');
            // load c1/gc-1
            await router.load('c1');
            assert.html.textContent(host, 'c1 gc1', 'nav1');
            assert.deepStrictEqual(eventLog, [], 'nav1 event log');
            // round#1
            // go to c1/gc-2 by clicking the link
            host.querySelector('a').click();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'nav2');
            assert.deepStrictEqual(eventLog, [], 'nav2 event log');
            // go back to c1/gc-1 by clicking the button
            host.querySelector('button').click();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc1', 'back1');
            assert.strictEqual(eventLog.length, 1, 'back event log length');
            assert.strictEqual(eventLog[0][0], event, 'back event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back event log path');
            // round#2
            // go to c1/gc-2 by clicking the link
            eventLog.length = 0;
            host.querySelector('a').click();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'nav3');
            assert.deepStrictEqual(eventLog, [], 'nav3 event log');
            // go back to c1/gc-1 by clicking the button
            eventLog.length = 0;
            host.querySelector('button').click();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc1', 'back2');
            assert.strictEqual(eventLog.length, 1, 'back2 event log length');
            assert.strictEqual(eventLog[0][0], event, 'back2 event log trigger');
            assert.match(eventLog[0][1], /c1$/, 'back2 event log path');
            // go forward using history state
            eventLog.length = 0;
            history.forward();
            await queue.yield();
            assert.html.textContent(host, 'c1 gc2', 'forward');
            assert.strictEqual(eventLog.length, 1, 'forward event log length');
            assert.strictEqual(eventLog[0][0], event, 'forward event log trigger');
            assert.match(eventLog[0][1], /c1\/gc-2$/, 'forward event log path');
            subscriber.dispose();
            await au.stop(true);
        });
    }
});
//# sourceMappingURL=location-manager.spec.js.map