/**
 * Roughly the followings aspects are tested here:
 * - The invocation of the routing hooks, both instance and the global lifecycle hooks.
 * - The order of invocation.
 * - The preemption in the hooks (hooks returning `false`).
 * - The conflicting navigation instructions etc. (`hook1` redirects to `r1` where as the `hook2` redirects to `r2`).
 * - {Add new test aspects here if it is not already covered above.}
 *
 * Note that an extensive tests of the hooks are already done in the `hook-tests.spec.ts`.
 * However, that misses the `@lifeCycleHooks`. Hence, this spec focuses on that.
 */
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
import { DI, ILogger, ISink, LogLevel, Registration, resolve, } from '@aurelia/kernel';
import { IRouter, IRouterEvents, route, RouteNode, RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, CustomElement, customElement, lifecycleHooks } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';
import { start } from './_shared/create-fixture.js';
describe('router-lite/lifecycle-hooks.spec.ts', function () {
    const IKnownScopes = DI.createInterface();
    class EventLog {
        constructor() {
            this.log = [];
            this.scopes = resolve(IKnownScopes);
        }
        handleEvent(event) {
            if (!event.scope.some(x => this.scopes.includes(x)))
                return;
            this.log.push(event.toString());
        }
        clear() {
            this.log.length = 0;
        }
        assertLog(messagePatterns, message) {
            const log = this.log;
            const len = messagePatterns.length;
            for (let i = 0; i < len; i++) {
                assert.match(log[i], messagePatterns[i], `${message} - unexpected log at index${i}: ${log[i]}; actual log: ${JSON.stringify(log, undefined, 2)}`);
            }
        }
        assertLogOrderInvariant(messagePatterns, offset, message) {
            const log = this.log;
            const len = messagePatterns.length;
            for (let i = offset; i < len; i++) {
                const item = log[i];
                assert.notEqual(messagePatterns.find(pattern => pattern.test(item)), undefined, `${message} - unexpected log at index${i}: ${item}; actual log: ${JSON.stringify(log, undefined, 2)}`);
            }
        }
        static getInstance(container) {
            const eventLog = container.getAll(ISink).find(x => x instanceof this);
            if (eventLog === undefined)
                throw new Error('Event log is not found');
            return eventLog;
        }
    }
    async function createFixture(rootComponent, ...registrations) {
        const ctx = TestContext.create();
        const { container } = ctx;
        container.register(TestRouterConfiguration.for(LogLevel.trace, [
            EventLog
            // uncomment the following line to see the logs in console - debug
            /* , ConsoleSink */
        ]), RouterConfiguration, ...registrations);
        const au = new Aurelia(container);
        const host = ctx.createElement('div');
        await au.app({ component: rootComponent, host }).start();
        return { au, container, host };
    }
    async function log(hookName, rn, waitMs, logger) {
        const component = rn instanceof RouteNode ? rn.instruction.component : rn;
        logger.trace(`${hookName} - start ${component}`);
        if (waitMs === null) {
            await Promise.resolve();
        }
        else {
            await new Promise(res => setTimeout(res, waitMs));
        }
        logger.trace(`${hookName} - end ${component}`);
    }
    class AsyncBaseHook {
        constructor() {
            this.logger = resolve(ILogger).scopeTo(this.constructor.name);
        }
        get waitMs() { return null; }
        getWaitTime(hook) {
            const val = this.waitMs;
            if (val === null)
                return null;
            if (typeof val === 'number')
                return val;
            return val[hook] ?? null;
        }
        async canLoad(_vm, _params, next, _current) {
            await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
            return true;
        }
        async loading(_vm, _params, next, _current) {
            await log('loading', next, this.getWaitTime('loading'), this.logger);
        }
        async canUnload(vm, rn, current) {
            await log('canUnload', current ?? rn, this.getWaitTime('canUnload'), this.logger);
            return true;
        }
        async unloading(vm, rn, current) {
            await log('unloading', current ?? rn, this.getWaitTime('unloading'), this.logger);
        }
    }
    class BaseHook {
        constructor() {
            this.logger = resolve(ILogger).scopeTo(this.constructor.name);
        }
        canLoad(_vm, _params, next, _current) {
            this.logger.trace(`canLoad ${next.instruction.component}`);
            return true;
        }
        loading(_vm, _params, next, _current) {
            this.logger.trace(`loading ${next.instruction.component}`);
        }
        canUnload(vm, rn, current) {
            this.logger.trace(`canUnload ${(current ?? rn).instruction.component}`);
            return true;
        }
        unloading(vm, rn, current) {
            this.logger.trace(`unloading ${(current ?? rn).instruction.component}`);
        }
    }
    class AsyncBaseViewModel {
        constructor() {
            this.logger = resolve(ILogger).scopeTo(this.constructor.name);
        }
        get waitMs() { return null; }
        getWaitTime(hook) {
            const val = this.waitMs;
            if (val === null)
                return null;
            if (typeof val === 'number')
                return val;
            return val[hook] ?? null;
        }
        async canLoad(_params, next, _current) {
            await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
            return true;
        }
        async loading(_params, next, _current) {
            await log('loading', next, this.getWaitTime('loading'), this.logger);
        }
        async canUnload(rn, current) {
            await log('canUnload', current ?? rn, this.getWaitTime('canUnload'), this.logger);
            return true;
        }
        async unloading(rn, current) {
            await log('unloading', current ?? rn, this.getWaitTime('unloading'), this.logger);
        }
    }
    function createHookTimingConfiguration(option = {}) {
        return { canLoad: 1, loading: 1, canUnload: 1, unloading: 1, ...option };
    }
    class AsyncBaseViewModelWithAllHooks {
        get ceName() {
            return this._ceName ??= CustomElement.getDefinition(this.constructor).name;
        }
        constructor(ticks) {
            this.ticks = ticks;
            this._ceName = null;
            this.logger = resolve(ILogger).scopeTo(this.constructor.name);
        }
        binding(_initiator, _parent) {
            return log('binding', this.ceName, this.ticks, this.logger);
        }
        bound(_initiator, _parent) {
            return log('bound', this.ceName, this.ticks, this.logger);
        }
        attaching(_initiator, _parent) {
            return log('attaching', this.ceName, this.ticks, this.logger);
        }
        attached(_initiator) {
            return log('attached', this.ceName, this.ticks, this.logger);
        }
        detaching(_initiator, _parent) {
            return log('detaching', this.ceName, this.ticks, this.logger);
        }
        unbinding(_initiator, _parent) {
            return log('unbinding', this.ceName, this.ticks, this.logger);
        }
        dispose() {
            this.logger.trace(`dispose - ${this.ceName}`);
        }
        async canLoad(_params, _next, _current) {
            await log('canLoad', this.ceName, this.ticks, this.logger);
            return true;
        }
        async loading(_params, _next, _current) {
            await log('loading', this.ceName, this.ticks, this.logger);
        }
        async canUnload(_rn, _current) {
            await log('canUnload', this.ceName, this.ticks, this.logger);
            return true;
        }
        async unloading(_rn, _current) {
            await log('unloading', this.ceName, this.ticks, this.logger);
        }
    }
    // the simplified textbook example of authorization hook
    it('single global (auth) hook', async function () {
        const IAuthenticationService = DI.createInterface('IAuthenticationService', x => x.singleton(AuthenticationService));
        class AuthenticationService {
            hasClaim(type, value) {
                return type === 'read' && value === 'foo';
            }
        }
        let AuthorizationHook = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AuthorizationHook = _classThis = class {
                constructor() {
                    this.logger = resolve(ILogger).scopeTo('AuthHook');
                    this.authService = resolve(IAuthenticationService);
                }
                canLoad(_vm, _params, next, _current) {
                    this.logger.trace(`canLoad ${next.instruction.component}`);
                    const claim = next.data.claim ?? null;
                    if (claim === null)
                        return;
                    if (this.authService.hasClaim(claim.type, claim.value))
                        return;
                    return 'forbidden';
                }
            };
            __setFunctionName(_classThis, "AuthorizationHook");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AuthorizationHook = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AuthorizationHook = _classThis;
        })();
        let Forbidden = (() => {
            let _classDecorators = [customElement({ name: 'for-bidden', template: 'You shall not pass!' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Forbidden = _classThis = class {
            };
            __setFunctionName(_classThis, "Forbidden");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Forbidden = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Forbidden = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Home = _classThis = class {
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let FooList = (() => {
            let _classDecorators = [customElement({ name: 'foo-list', template: 'foo list' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooList = _classThis = class {
            };
            __setFunctionName(_classThis, "FooList");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooList = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooList = _classThis;
        })();
        let FooEdit = (() => {
            let _classDecorators = [customElement({ name: 'foo-edit', template: 'foo edit' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FooEdit = _classThis = class {
            };
            __setFunctionName(_classThis, "FooEdit");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooEdit = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooEdit = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: FooList, data: { claim: { type: 'read', value: 'foo' } } },
                        { path: 'foo/:id', component: FooEdit, data: { claim: { type: 'edit', value: 'foo' } } },
                        { path: 'forbidden', component: Forbidden }
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
        const { au, container, host } = await createFixture(Root, Home, Forbidden, FooList, FooEdit, IAuthenticationService, AuthorizationHook, Registration.instance(IKnownScopes, ['AuthHook']));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([/AuthHook\] canLoad 'home'/], 'init');
        // round 2
        eventLog.clear();
        assert.strictEqual(await router.load('foo/404'), true);
        assert.html.textContent(host, 'You shall not pass!');
        eventLog.assertLog([/AuthHook\] canLoad 'foo\/404'/, /AuthHook\] canLoad 'forbidden'/], 'round#2');
        // round 3
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        assert.html.textContent(host, 'foo list');
        eventLog.assertLog([/AuthHook\] canLoad 'foo'/], 'round#3');
        await au.stop(true);
    });
    it('multiple synchronous hooks - without preemption', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Hook1 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Hook2 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Home = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Foo = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad 'home'/,
            /Hook2\] canLoad 'home'/,
            /Home\] canLoad 'home'/,
            /Hook1\] loading 'home'/,
            /Hook2\] loading 'home'/,
            /Home\] loading 'home'/,
        ], 'init');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        assert.html.textContent(host, 'foo');
        eventLog.assertLog([
            /Hook1\] canUnload 'home'/,
            /Hook2\] canUnload 'home'/,
            /Home\] canUnload 'home'/,
            /Hook1\] canLoad 'foo'/,
            /Hook2\] canLoad 'foo'/,
            /Foo\] canLoad 'foo'/,
            /Hook1\] unloading 'home'/,
            /Hook2\] unloading 'home'/,
            /Home\] unloading 'home'/,
            /Hook1\] loading 'foo'/,
            /Hook2\] loading 'foo'/,
            /Foo\] loading 'foo'/,
        ], 'round#2');
        await au.stop(true);
    });
    it('multiple asynchronous hooks - same timing - without preemption', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Hook1\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Home\] loading - end 'home'/,
        ], 'init');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        assert.html.textContent(host, 'foo');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
            /Hook2\] canLoad - start 'foo'/,
            /Hook2\] canLoad - end 'foo'/,
            /Foo\] canLoad - start 'foo'/,
            /Foo\] canLoad - end 'foo'/,
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Hook1\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook1\] loading - start 'foo'/,
            /Hook2\] loading - start 'foo'/,
            /Foo\] loading - start 'foo'/,
            /Hook1\] loading - end 'foo'/,
            /Hook2\] loading - end 'foo'/,
            /Foo\] loading - end 'foo'/,
        ], 'round#2');
        await au.stop(true);
    });
    it('multiple asynchronous hooks - varied timing monotonically increasing - without preemption', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 2; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 3; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 3; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Hook1\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Home\] loading - end 'home'/,
        ], 'init');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        assert.html.textContent(host, 'foo');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
            /Hook2\] canLoad - start 'foo'/,
            /Hook2\] canLoad - end 'foo'/,
            /Foo\] canLoad - start 'foo'/,
            /Foo\] canLoad - end 'foo'/,
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Hook1\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook1\] loading - start 'foo'/,
            /Hook2\] loading - start 'foo'/,
            /Foo\] loading - start 'foo'/,
            /Hook1\] loading - end 'foo'/,
            /Hook2\] loading - end 'foo'/,
            /Foo\] loading - end 'foo'/,
        ], 'round#2');
        await au.stop(true);
    });
    it('multiple asynchronous hooks - varied timing monotonically decreasing - without preemption', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 3; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 2; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - unloading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        assert.html.textContent(host, 'foo');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
            /Hook2\] canLoad - start 'foo'/,
            /Hook2\] canLoad - end 'foo'/,
            /Foo\] canLoad - start 'foo'/,
            /Foo\] canLoad - end 'foo'/,
        ], 'round#2');
        eventLog.assertLogOrderInvariant([
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Hook1\] unloading - end 'home'/,
        ], 12, 'round#2 - unloading');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'foo'/,
            /Hook2\] loading - start 'foo'/,
            /Foo\] loading - start 'foo'/,
            /Foo\] loading - end 'foo'/,
            /Hook2\] loading - end 'foo'/,
            /Hook1\] loading - end 'foo'/,
        ], 18, 'round#2 - loading');
        await au.stop(true);
    });
    // #region - preemption - first preemption always wins
    it('multiple asynchronous hooks - first canLoad hook preempts with false', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return createHookTimingConfiguration({ canLoad: 2 }); }
                async canLoad(vm, _params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return !(vm instanceof Foo);
                }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), false);
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
        ], 'round#2');
        assert.strictEqual(eventLog.log.length, 8);
        await au.stop(true);
    });
    it('multiple asynchronous hooks - second canLoad hook preempts with false', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return createHookTimingConfiguration({ canLoad: 2 }); }
                async canLoad(vm, _params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return !(vm instanceof Foo);
                }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), false);
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
            /Hook2\] canLoad - start 'foo'/,
            /Hook2\] canLoad - end 'foo'/,
        ], 'round#2');
        assert.strictEqual(eventLog.log.length, 10);
        await au.stop(true);
    });
    it('multiple asynchronous hooks - view-model canLoad hook preempts with false', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
                async canLoad(params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return !Number.isNaN(Number(params.id));
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo/:id', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo/bar'), false, 'round#2-router#load');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo\/bar'/,
            /Hook1\] canLoad - end 'foo\/bar'/,
            /Hook2\] canLoad - start 'foo\/bar'/,
            /Hook2\] canLoad - end 'foo\/bar'/,
            /Foo\] canLoad - start 'foo\/bar'/,
            /Foo\] canLoad - end 'foo\/bar'/,
        ], 'round#2');
        assert.strictEqual(eventLog.log.length, 12);
        // round #3
        eventLog.clear();
        assert.strictEqual(await router.load('foo/123'), true, 'round#3-router#load');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo\/123'/,
            /Hook1\] canLoad - end 'foo\/123'/,
            /Hook2\] canLoad - start 'foo\/123'/,
            /Hook2\] canLoad - end 'foo\/123'/,
            /Foo\] canLoad - start 'foo\/123'/,
            /Foo\] canLoad - end 'foo\/123'/,
        ], 'round#3');
        eventLog.assertLogOrderInvariant([
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Hook1\] unloading - end 'home'/,
        ], 12, 'round#3 - unloading');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'foo\/123'/,
            /Hook2\] loading - start 'foo\/123'/,
            /Foo\] loading - start 'foo\/123'/,
            /Foo\] loading - end 'foo\/123'/,
            /Hook2\] loading - end 'foo\/123'/,
            /Hook1\] loading - end 'foo\/123'/,
        ], 18, 'round#3 - loading');
        assert.strictEqual(eventLog.log.length, 24);
        await au.stop(true);
    });
    it('multiple asynchronous hooks - first canLoad hook preempts with navigation instruction', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return createHookTimingConfiguration({ canLoad: 2 }); }
                async canLoad(vm, _params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return vm instanceof Foo ? 'bar' : true;
                }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
                async canLoad(vm, _params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return vm instanceof Foo ? 'home' : true;
                }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Bar = (() => {
            let _classDecorators = [customElement({ name: 'ba-r', template: 'bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Bar = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Bar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Bar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Bar = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
                        { path: 'bar', component: Bar },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name, Bar.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'bar'/,
            /Hook1\] canLoad - end 'bar'/,
            /Hook2\] canLoad - start 'bar'/,
            /Hook2\] canLoad - end 'bar'/,
            /Bar\] canLoad - start 'bar'/,
            /Bar\] canLoad - end 'bar'/,
        ], 'round#2');
        eventLog.assertLogOrderInvariant([
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Hook1\] unloading - end 'home'/,
        ], 14, 'round#2 - unloading');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'bar'/,
            /Hook2\] loading - start 'bar'/,
            /Bar\] loading - start 'bar'/,
            /Bar\] loading - end 'bar'/,
            /Hook2\] loading - end 'bar'/,
            /Hook1\] loading - end 'bar'/,
        ], 20, 'round#2 - loading');
        await au.stop(true);
    });
    it('multiple asynchronous hooks - second canLoad hook preempts with navigation instruction', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return createHookTimingConfiguration({ canLoad: 2 }); }
                async canLoad(vm, _params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return vm instanceof Foo ? 'bar' : true;
                }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Bar = (() => {
            let _classDecorators = [customElement({ name: 'ba-r', template: 'bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Bar = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Bar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Bar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Bar = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
                        { path: 'bar', component: Bar },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name, Bar.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), true);
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo'/,
            /Hook1\] canLoad - end 'foo'/,
            /Hook2\] canLoad - start 'foo'/,
            /Hook2\] canLoad - end 'foo'/,
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'bar'/,
            /Hook1\] canLoad - end 'bar'/,
            /Hook2\] canLoad - start 'bar'/,
            /Hook2\] canLoad - end 'bar'/,
            /Bar\] canLoad - start 'bar'/,
            /Bar\] canLoad - end 'bar'/,
        ], 'round#2');
        eventLog.assertLogOrderInvariant([
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Hook1\] unloading - end 'home'/,
        ], 14, 'round#2 - unloading');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'bar'/,
            /Hook2\] loading - start 'bar'/,
            /Bar\] loading - start 'bar'/,
            /Bar\] loading - end 'bar'/,
            /Hook2\] loading - end 'bar'/,
            /Hook1\] loading - end 'bar'/,
        ], 20, 'round#2 - loading');
        await au.stop(true);
    });
    it('multiple asynchronous hooks - view-model canLoad hook preempts with navigation instruction', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
                async canLoad(params, next, _current) {
                    await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
                    return Number.isNaN(Number(params.id)) ? 'bar' : true;
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Bar = (() => {
            let _classDecorators = [customElement({ name: 'ba-r', template: 'bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Bar = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Bar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Bar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Bar = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo/:id', component: Foo },
                        { path: 'bar', component: Bar },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name, Bar.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo/bar'), true, 'round#2-router#load');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'foo\/bar'/,
            /Hook1\] canLoad - end 'foo\/bar'/,
            /Hook2\] canLoad - start 'foo\/bar'/,
            /Hook2\] canLoad - end 'foo\/bar'/,
            /Foo\] canLoad - start 'foo\/bar'/,
            /Foo\] canLoad - end 'foo\/bar'/,
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
            /Hook1\] canLoad - start 'bar'/,
            /Hook1\] canLoad - end 'bar'/,
            /Hook2\] canLoad - start 'bar'/,
            /Hook2\] canLoad - end 'bar'/,
            /Bar\] canLoad - start 'bar'/,
            /Bar\] canLoad - end 'bar'/,
        ], 'round#2');
        eventLog.assertLogOrderInvariant([
            /Hook1\] unloading - start 'home'/,
            /Hook2\] unloading - start 'home'/,
            /Home\] unloading - start 'home'/,
            /Home\] unloading - end 'home'/,
            /Hook2\] unloading - end 'home'/,
            /Hook1\] unloading - end 'home'/,
        ], 24, 'round#2 - unloading');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'bar'/,
            /Hook2\] loading - start 'bar'/,
            /Bar\] loading - start 'bar'/,
            /Bar\] loading - end 'bar'/,
            /Hook2\] loading - end 'bar'/,
            /Hook1\] loading - end 'bar'/,
        ], 30, 'round#2 - loading');
        assert.strictEqual(eventLog.log.length, 36);
        // round #3
        eventLog.clear();
        assert.strictEqual(await router.load('foo/123'), true, 'round#3-router#load');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'bar'/,
            /Hook1\] canUnload - end 'bar'/,
            /Hook2\] canUnload - start 'bar'/,
            /Hook2\] canUnload - end 'bar'/,
            /Bar\] canUnload - start 'bar'/,
            /Bar\] canUnload - end 'bar'/,
            /Hook1\] canLoad - start 'foo\/123'/,
            /Hook1\] canLoad - end 'foo\/123'/,
            /Hook2\] canLoad - start 'foo\/123'/,
            /Hook2\] canLoad - end 'foo\/123'/,
            /Foo\] canLoad - start 'foo\/123'/,
            /Foo\] canLoad - end 'foo\/123'/,
        ], 'round#3');
        eventLog.assertLogOrderInvariant([
            /Hook1\] unloading - start 'bar'/,
            /Hook2\] unloading - start 'bar'/,
            /Bar\] unloading - start 'bar'/,
            /Bar\] unloading - end 'bar'/,
            /Hook2\] unloading - end 'bar'/,
            /Hook1\] unloading - end 'bar'/,
        ], 12, 'round#3 - unloading');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'foo\/123'/,
            /Hook2\] loading - start 'foo\/123'/,
            /Foo\] loading - start 'foo\/123'/,
            /Foo\] loading - end 'foo\/123'/,
            /Hook2\] loading - end 'foo\/123'/,
            /Hook1\] loading - end 'foo\/123'/,
        ], 18, 'round#3 - load');
        assert.strictEqual(eventLog.log.length, 24);
        await au.stop(true);
    });
    it('multiple asynchronous hooks - first canUnload hook preempts with false', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return createHookTimingConfiguration({ canLoad: 2 }); }
                async canUnload(vm, _next, current) {
                    await log('canUnload', current, this.getWaitTime('canUnload'), this.logger);
                    return !(vm instanceof Home);
                }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), false);
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
        ], 'round#2');
        assert.strictEqual(eventLog.log.length, 2);
        await au.stop(true);
    });
    it('multiple asynchronous hooks - second canUnload hook preempts with false', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return createHookTimingConfiguration({ canLoad: 2 }); }
                async canUnload(vm, _next, current) {
                    await log('canUnload', current, this.getWaitTime('canUnload'), this.logger);
                    return !(vm instanceof Home);
                }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo'), false);
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
        ], 'round#2');
        assert.strictEqual(eventLog.log.length, 4);
        await au.stop(true);
    });
    it('multiple asynchronous hooks - view-model canUnload hook preempts with false', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook1 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseHook;
            var Hook2 = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Home = (() => {
            let _classDecorators = [customElement({ name: 'ho-me', template: 'home' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Home = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
                async canUnload(_next, current) {
                    await log('canUnload', current, this.getWaitTime('canUnload'), this.logger);
                    return false;
                }
            };
            __setFunctionName(_classThis, "Home");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Home = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Home = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModel;
            var Foo = _classThis = class extends _classSuper {
                get waitMs() { return 1; }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'home' },
                        { path: 'home', component: Home },
                        { path: 'foo', component: Foo },
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
        const { au, container, host } = await createFixture(Root, Hook1, Hook2, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'home');
        eventLog.assertLog([
            /Hook1\] canLoad - start 'home'/,
            /Hook1\] canLoad - end 'home'/,
            /Hook2\] canLoad - start 'home'/,
            /Hook2\] canLoad - end 'home'/,
            /Home\] canLoad - start 'home'/,
            /Home\] canLoad - end 'home'/,
        ], 'init');
        eventLog.assertLogOrderInvariant([
            /Hook1\] loading - start 'home'/,
            /Hook2\] loading - start 'home'/,
            /Home\] loading - start 'home'/,
            /Home\] loading - end 'home'/,
            /Hook2\] loading - end 'home'/,
            /Hook1\] loading - end 'home'/,
        ], 6, 'init - loading');
        // round #2
        eventLog.clear();
        assert.strictEqual(await router.load('foo/bar'), false, 'round#2-router#load');
        eventLog.assertLog([
            /Hook1\] canUnload - start 'home'/,
            /Hook1\] canUnload - end 'home'/,
            /Hook2\] canUnload - start 'home'/,
            /Hook2\] canUnload - end 'home'/,
            /Home\] canUnload - start 'home'/,
            /Home\] canUnload - end 'home'/,
        ], 'round#2');
        assert.strictEqual(eventLog.log.length, 6);
        await au.stop(true);
    });
    // #endregion
    // #region some migrated tests from hook-tests.specs.ts, as the tests were sometimes overly complicated, and accounting for every ticks might be bit too much
    function* getHookTestData() {
        yield {
            name: 'a1(canLoad:4)/a2+b1/b2',
            a1: createHookTimingConfiguration({ canLoad: 4 }),
            a2: createHookTimingConfiguration(),
            b1: createHookTimingConfiguration(),
            b2: createHookTimingConfiguration(),
            assertLog(eventLog) {
                // This cannot be reliably tested in both node and browsers, because node finishes b1 before a1 whereas the browsers don't. Hence, doing order invariant assertions.
                eventLog.assertLogOrderInvariant([
                    /A1\] canLoad - start 'a1'/,
                    /B1\] canLoad - start 'b1'/,
                    /A1\] canLoad - end 'a1'/,
                    /B1\] canLoad - end 'b1'/,
                    /A1\] loading - start 'a1'/,
                    /B1\] loading - start 'b1'/,
                    /A1\] loading - end 'a1'/,
                    /B1\] loading - end 'b1'/,
                    /A2\] canLoad - start 'a2'/,
                    /B2\] canLoad - start 'b2'/,
                    /B2\] canLoad - end 'b2'/,
                    /A2\] canLoad - end 'a2'/,
                    /A2\] loading - start 'a2'/,
                    /B2\] loading - start 'b2'/,
                    /A2\] loading - end 'a2'/,
                    /B2\] loading - end 'b2'/,
                ], 8, 'loading part2');
            }
        };
        yield {
            name: 'a1(canLoad:8)/a2+b1/b2',
            a1: createHookTimingConfiguration({ canLoad: 8 }),
            a2: createHookTimingConfiguration(),
            b1: createHookTimingConfiguration(),
            b2: createHookTimingConfiguration(),
            assertLog(eventLog) {
                eventLog.assertLog([
                    /A1\] canLoad - start 'a1'/,
                    /B1\] canLoad - start 'b1'/,
                    /B1\] canLoad - end 'b1'/,
                    /A1\] canLoad - end 'a1'/,
                    /A1\] loading - start 'a1'/,
                    /B1\] loading - start 'b1'/,
                    /A1\] loading - end 'a1'/,
                    /B1\] loading - end 'b1'/,
                ], 'loading');
                eventLog.assertLogOrderInvariant([
                    /A2\] canLoad - start 'a2'/,
                    /B2\] canLoad - start 'b2'/,
                    /B2\] canLoad - end 'b2'/,
                    /A2\] canLoad - end 'a2'/,
                    /A2\] loading - start 'a2'/,
                    /B2\] loading - start 'b2'/,
                    /A2\] loading - end 'a2'/,
                    /B2\] loading - end 'b2'/,
                ], 8, 'loading part2');
            }
        };
        function assert2(eventLog) {
            eventLog.assertLog([
                /A1\] canLoad - start 'a1'/,
                /B1\] canLoad - start 'b1'/,
                /A1\] canLoad - end 'a1'/,
                /B1\] canLoad - end 'b1'/,
                /A1\] loading - start 'a1'/,
                /B1\] loading - start 'b1'/,
                /A1\] loading - end 'a1'/,
                /B1\] loading - end 'b1'/,
            ], 'loading');
            eventLog.assertLogOrderInvariant([
                /A2\] canLoad - start 'a2'/,
                /B2\] canLoad - start 'b2'/,
                /B2\] canLoad - end 'b2'/,
                /A2\] canLoad - end 'a2'/,
                /A2\] loading - start 'a2'/,
                /B2\] loading - start 'b2'/,
                /A2\] loading - end 'a2'/,
                /B2\] loading - end 'b2'/,
            ], 8, 'loading part2');
        }
        yield {
            name: 'a1/a2+b1(canLoad:2)/b2',
            a1: createHookTimingConfiguration(),
            a2: createHookTimingConfiguration(),
            b1: createHookTimingConfiguration({ canLoad: 2 }),
            b2: createHookTimingConfiguration(),
            assertLog: assert2,
        };
        yield {
            name: 'a1/a2+b1(canLoad:4)/b2',
            a1: createHookTimingConfiguration(),
            a2: createHookTimingConfiguration(),
            b1: createHookTimingConfiguration({ canLoad: 4 }),
            b2: createHookTimingConfiguration(),
            assertLog: assert2,
        };
        yield {
            name: 'a1/a2+b1(canLoad:8)/b2',
            a1: createHookTimingConfiguration(),
            a2: createHookTimingConfiguration(),
            b1: createHookTimingConfiguration({ canLoad: 8 }),
            b2: createHookTimingConfiguration(),
            assertLog: assert2,
        };
    }
    for (const { name, a1, a2, b1, b2, assertLog } of getHookTestData()) {
        it(`parentsiblings-childsiblings - hook of one of the component takes significantly more time than others - no preemption - ${name}`, async function () {
            let A2 = (() => {
                let _classDecorators = [customElement({ name: 'a2', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AsyncBaseViewModel;
                var A2 = _classThis = class extends _classSuper {
                    get waitMs() { return a2; }
                };
                __setFunctionName(_classThis, "A2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A2 = _classThis;
            })();
            let A1 = (() => {
                let _classDecorators = [route({ routes: [{ path: 'a2', component: A2 }] }), customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AsyncBaseViewModel;
                var A1 = _classThis = class extends _classSuper {
                    get waitMs() { return a1; }
                };
                __setFunctionName(_classThis, "A1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A1 = _classThis;
            })();
            let B2 = (() => {
                let _classDecorators = [customElement({ name: 'b2', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AsyncBaseViewModel;
                var B2 = _classThis = class extends _classSuper {
                    get waitMs() { return b2; }
                };
                __setFunctionName(_classThis, "B2");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    B2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return B2 = _classThis;
            })();
            let B1 = (() => {
                let _classDecorators = [route({ routes: [{ path: 'b2', component: B2 }] }), customElement({ name: 'b1', template: '<au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AsyncBaseViewModel;
                var B1 = _classThis = class extends _classSuper {
                    get waitMs() { return b1; }
                };
                __setFunctionName(_classThis, "B1");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    B1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return B1 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'a1', component: A1 },
                            { path: 'b1', component: B1 },
                        ]
                    }), customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })];
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
            const { au, container } = await createFixture(Root, Registration.instance(IKnownScopes, [A1.name, A2.name, B1.name, B2.name]));
            const router = container.get(IRouter);
            const eventLog = EventLog.getInstance(container);
            eventLog.assertLog([], 'init');
            await router.load('a1@$0/a2+b1@$1/b2');
            assertLog(eventLog);
            await au.stop(true);
        });
    }
    class SiblingHookTestData {
        constructor(ticks, root, scopes, assertStartLog, phases, assertStopLog) {
            this.root = root;
            this.scopes = scopes;
            this.assertStartLog = assertStartLog;
            this.phases = phases;
            this.assertStopLog = assertStopLog;
            this.name = `ticks: ${ticks} - ${Array.from(phases.map(x => x[0])).join(' -> ')}`;
        }
    }
    function* getSiblingHookTestData() {
        function createRoot(ticks) {
            class Base extends AsyncBaseViewModelWithAllHooks {
                constructor() {
                    super(ticks);
                }
            }
            let A01 = (() => {
                let _classDecorators = [customElement({ name: 'a01', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var A01 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "A01");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A01 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A01 = _classThis;
            })();
            let A02 = (() => {
                let _classDecorators = [customElement({ name: 'a02', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var A02 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "A02");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A02 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A02 = _classThis;
            })();
            let A03 = (() => {
                let _classDecorators = [customElement({ name: 'a03', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var A03 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "A03");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A03 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A03 = _classThis;
            })();
            let A04 = (() => {
                let _classDecorators = [customElement({ name: 'a04', template: null })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var A04 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "A04");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    A04 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return A04 = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: 'a01', component: A01 },
                            { path: 'a02', component: A02 },
                            { path: 'a03', component: A03 },
                            { path: 'a04', component: A04 },
                        ]
                    }), customElement({ name: 'ro-ot', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var Root = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            return [Root, [Root.name, A01.name, A02.name, A03.name, A04.name]];
        }
        function assertStartLog(eventLog) {
            eventLog.assertLog([
                /Root\] binding - start ro-ot/,
                /Root\] binding - end ro-ot/,
                /Root\] bound - start ro-ot/,
                /Root\] bound - end ro-ot/,
                /Root\] attaching - start ro-ot/,
                /Root\] attaching - end ro-ot/,
                /Root\] attached - start ro-ot/,
                /Root\] attached - end ro-ot/,
            ], 'start');
        }
        for (const ticks of [0, 1]) {
            const [root, scopes] = createRoot(ticks);
            // #region only vp $0 changes with every nav
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a03@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A03\] canUnload - end a03/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A03\] unloading - start a03/,
                            /A03\] unloading - end a03/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase3');
                    },
                ],
                [
                    'a03@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A03\] detaching - start a03/,
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A03\] detaching - end a03/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A03\] unbinding - start a03/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A03\] unbinding - end a03/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A03\] dispose - a03/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase1');
                    },
                ],
                [
                    'a03@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A03\] canUnload - end a03/,
                            /A03\] unloading - start a03/,
                            /A03\] unloading - end a03/,
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                        ], 'phase3');
                    },
                ],
                [
                    'a03@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A03\] detaching - start a03/,
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A03\] detaching - end a03/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A03\] unbinding - start a03/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A03\] unbinding - end a03/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A03\] dispose - a03/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase3');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase3');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase1');
                    },
                ],
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                        ], 'phase3');
                    },
                ],
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                        ], 'phase2');
                    },
                ],
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase3');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase2');
                    },
                ],
                [
                    'a02@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            // #endregion
            // #region only vp $1 changes with every nav
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a01@$0+a03@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A03\] canUnload - end a03/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A03\] unloading - start a03/,
                            /A03\] unloading - end a03/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0+a03@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /A03\] detaching - start a03/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /A03\] detaching - end a03/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /A03\] unbinding - start a03/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /A03\] unbinding - end a03/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                    /A03\] dispose - a03/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase1');
                    },
                ],
                [
                    'a01@$0+a03@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A03\] canUnload - end a03/,
                            /A03\] unloading - start a03/,
                            /A03\] unloading - end a03/,
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0+a03@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /A03\] detaching - start a03/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /A03\] detaching - end a03/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /A03\] unbinding - start a03/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /A03\] unbinding - end a03/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                    /A03\] dispose - a03/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase1');
                    },
                ],
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] loading - end a01/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] loading - end a01/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase2');
                    },
                ],
                [
                    'a01@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase3');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase4');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            // #endregion
            // #region both vp $0 and $1 change with every nav
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 9, 'phase1.2');
                    },
                ],
                [
                    'a03@$0+a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A04\] canLoad - start a04/,
                            /A03\] canLoad - end a03/,
                            /A04\] canLoad - end a04/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A04\] loading - start a04/,
                            /A03\] loading - end a03/,
                            /A04\] loading - end a04/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 17, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A04\] canUnload - start a04/,
                            /A03\] canUnload - end a03/,
                            /A04\] canUnload - end a04/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A03\] unloading - start a03/,
                            /A04\] unloading - start a04/,
                            /A03\] unloading - end a03/,
                            /A04\] unloading - end a04/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 17, 'phase3.2');
                    },
                ],
                [
                    'a03@$0+a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A04\] canLoad - start a04/,
                            /A03\] canLoad - end a03/,
                            /A04\] canLoad - end a04/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A04\] loading - start a04/,
                            /A03\] loading - end a03/,
                            /A04\] loading - end a04/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 17, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A03\] detaching - start a03/,
                    /A04\] detaching - start a04/,
                    /Root\] detaching - start ro-ot/,
                    /A03\] detaching - end a03/,
                    /A04\] detaching - end a04/,
                    /Root\] detaching - end ro-ot/,
                    /A03\] unbinding - start a03/,
                    /A04\] unbinding - start a04/,
                    /Root\] unbinding - start ro-ot/,
                    /A03\] unbinding - end a03/,
                    /A04\] unbinding - end a04/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A03\] dispose - a03/,
                    /A04\] dispose - a04/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 4, 'phase1.2');
                    },
                ],
                [
                    'a03@$0+a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A04\] canLoad - start a04/,
                            /A03\] canLoad - end a03/,
                            /A04\] canLoad - end a04/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A04\] loading - start a04/,
                            /A03\] loading - end a03/,
                            /A04\] loading - end a04/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A04\] canUnload - start a04/,
                            /A03\] canUnload - end a03/,
                            /A04\] canUnload - end a04/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A03\] unloading - start a03/,
                            /A04\] unloading - start a04/,
                            /A03\] unloading - end a03/,
                            /A04\] unloading - end a04/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a03@$0+a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A04\] canLoad - start a04/,
                            /A03\] canLoad - end a03/,
                            /A04\] canLoad - end a04/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A04\] loading - start a04/,
                            /A03\] loading - end a03/,
                            /A04\] loading - end a04/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A03\] detaching - start a03/,
                    /A04\] detaching - start a04/,
                    /Root\] detaching - start ro-ot/,
                    /A03\] detaching - end a03/,
                    /A04\] detaching - end a04/,
                    /Root\] detaching - end ro-ot/,
                    /A03\] unbinding - start a03/,
                    /A04\] unbinding - start a04/,
                    /Root\] unbinding - start ro-ot/,
                    /A03\] unbinding - end a03/,
                    /A04\] unbinding - end a04/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A03\] dispose - a03/,
                    /A04\] dispose - a04/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 4, 'phase1.2');
                    },
                ],
                [
                    'a03@$0+a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A03\] canLoad - start a03/,
                            /A04\] canLoad - start a04/,
                            /A03\] canLoad - end a03/,
                            /A04\] canLoad - end a04/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A03\] loading - start a03/,
                            /A04\] loading - start a04/,
                            /A03\] loading - end a03/,
                            /A04\] loading - end a04/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A04\] canUnload - start a04/,
                            /A03\] canUnload - end a03/,
                            /A04\] canUnload - end a04/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A03\] unloading - start a03/,
                            /A04\] unloading - start a04/,
                            /A03\] unloading - end a03/,
                            /A04\] unloading - end a04/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a03@$0+a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A03\] canLoad - start a03/,
                            /A04\] canLoad - start a04/,
                            /A03\] canLoad - end a03/,
                            /A04\] canLoad - end a04/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A03\] loading - start a03/,
                            /A04\] loading - start a04/,
                            /A03\] loading - end a03/,
                            /A04\] loading - end a04/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A03\] detaching - start a03/,
                    /A04\] detaching - start a04/,
                    /Root\] detaching - start ro-ot/,
                    /A03\] detaching - end a03/,
                    /A04\] detaching - end a04/,
                    /Root\] detaching - end ro-ot/,
                    /A03\] unbinding - start a03/,
                    /A04\] unbinding - start a04/,
                    /Root\] unbinding - start ro-ot/,
                    /A03\] unbinding - end a03/,
                    /A04\] unbinding - end a04/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A03\] dispose - a03/,
                    /A04\] dispose - a04/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 8, 'phase1.2');
                    },
                ],
                [
                    'a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A04\] canLoad - start a04/,
                            /A04\] canLoad - end a04/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A04\] loading - start a04/,
                            /A04\] loading - end a04/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A04\] canUnload - start a04/,
                            /A04\] canUnload - end a04/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A04\] unloading - start a04/,
                            /A04\] unloading - end a04/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a04@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A04\] canLoad - start a04/,
                            /A04\] canLoad - end a04/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A04\] loading - start a04/,
                            /A04\] loading - end a04/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A04\] detaching - start a04/,
                    /Root\] detaching - start ro-ot/,
                    /A04\] detaching - end a04/,
                    /Root\] detaching - end ro-ot/,
                    /A04\] unbinding - start a04/,
                    /Root\] unbinding - start ro-ot/,
                    /A04\] unbinding - end a04/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A04\] dispose - a04/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 8, 'phase1.2');
                    },
                ],
                [
                    'a03@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A03\] canUnload - start a03/,
                            /A03\] canUnload - end a03/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A03\] unloading - start a03/,
                            /A03\] unloading - end a03/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A03\] detaching - start a03/,
                            /A03\] detaching - end a03/,
                            /A03\] unbinding - start a03/,
                            /A03\] unbinding - end a03/,
                            /A03\] dispose - a03/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a03@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A03\] canLoad - start a03/,
                            /A03\] canLoad - end a03/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A03\] loading - start a03/,
                            /A03\] loading - end a03/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A03\] binding - start a03/,
                            /A03\] binding - end a03/,
                            /A03\] bound - start a03/,
                            /A03\] bound - end a03/,
                            /A03\] attaching - start a03/,
                            /A03\] attaching - end a03/,
                            /A03\] attached - start a03/,
                            /A03\] attached - end a03/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A03\] detaching - start a03/,
                    /Root\] detaching - start ro-ot/,
                    /A03\] detaching - end a03/,
                    /Root\] detaching - end ro-ot/,
                    /A03\] unbinding - start a03/,
                    /Root\] unbinding - start ro-ot/,
                    /A03\] unbinding - end a03/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A03\] dispose - a03/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 8, 'phase1.2');
                    },
                ],
                [
                    'a02@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A02\] loading - start a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - end a02/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 16, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - end a02/,
                            /A01\] canUnload - end a01/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - end a02/,
                            /A01\] unloading - end a01/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 16, 'phase3.2');
                    },
                ],
                [
                    'a02@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A02\] loading - start a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - end a02/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 16, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 4, 'phase1.2');
                    },
                ],
                [
                    'a02@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] loading - start a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - end a02/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - end a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - end a02/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a02@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A02\] loading - start a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - end a02/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase1');
                    },
                ],
                [
                    'a02@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - end a02/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - end a02/,
                            /A01\] canUnload - end a01/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - end a02/,
                            /A01\] unloading - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a02@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - end a02/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 8, 'phase1.2');
                    },
                ],
                [
                    'a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 8, 'phase1.2');
                    },
                ],
                [
                    'a02@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a02@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A02\] detaching - start a02/,
                    /Root\] detaching - start ro-ot/,
                    /A02\] detaching - end a02/,
                    /Root\] detaching - end ro-ot/,
                    /A02\] unbinding - start a02/,
                    /Root\] unbinding - start ro-ot/,
                    /A02\] unbinding - end a02/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A02\] dispose - a02/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase1.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 8, 'phase1.2');
                    },
                ],
                [
                    'a04@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A04\] canLoad - start a04/,
                            /A01\] canLoad - start a01/,
                            /A04\] canLoad - end a04/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A04\] loading - start a04/,
                            /A01\] loading - start a01/,
                            /A04\] loading - end a04/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 16, 'phase2.2');
                    },
                ],
                [
                    'a01@$0+a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A04\] canUnload - start a04/,
                            /A01\] canUnload - start a01/,
                            /A04\] canUnload - end a04/,
                            /A01\] canUnload - end a01/,
                            /A01\] canLoad - start a01/,
                            /A02\] canLoad - start a02/,
                            /A01\] canLoad - end a01/,
                            /A02\] canLoad - end a02/,
                            /A04\] unloading - start a04/,
                            /A01\] unloading - start a01/,
                            /A04\] unloading - end a04/,
                            /A01\] unloading - end a01/,
                            /A01\] loading - start a01/,
                            /A02\] loading - start a02/,
                            /A01\] loading - end a01/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 16, 'phase3.2');
                    },
                ],
                [
                    'a04@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A02\] canUnload - start a02/,
                            /A01\] canUnload - end a01/,
                            /A02\] canUnload - end a02/,
                            /A04\] canLoad - start a04/,
                            /A01\] canLoad - start a01/,
                            /A04\] canLoad - end a04/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A02\] unloading - start a02/,
                            /A01\] unloading - end a01/,
                            /A02\] unloading - end a02/,
                            /A04\] loading - start a04/,
                            /A01\] loading - start a01/,
                            /A04\] loading - end a04/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 16, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A04\] detaching - start a04/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A04\] detaching - end a04/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A04\] unbinding - start a04/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A04\] unbinding - end a04/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A04\] dispose - a04/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 'phase1');
                    },
                ],
                [
                    'a04@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A04\] canLoad - start a04/,
                            /A01\] canLoad - start a01/,
                            /A04\] canLoad - end a04/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A04\] loading - start a04/,
                            /A01\] loading - start a01/,
                            /A04\] loading - end a04/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a02@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A04\] canUnload - start a04/,
                            /A01\] canUnload - start a01/,
                            /A04\] canUnload - end a04/,
                            /A01\] canUnload - end a01/,
                            /A02\] canLoad - start a02/,
                            /A02\] canLoad - end a02/,
                            /A04\] unloading - start a04/,
                            /A01\] unloading - start a01/,
                            /A04\] unloading - end a04/,
                            /A01\] unloading - end a01/,
                            /A02\] loading - start a02/,
                            /A02\] loading - end a02/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A02\] binding - start a02/,
                            /A02\] binding - end a02/,
                            /A02\] bound - start a02/,
                            /A02\] bound - end a02/,
                            /A02\] attaching - start a02/,
                            /A02\] attaching - end a02/,
                            /A02\] attached - start a02/,
                            /A02\] attached - end a02/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a04@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A02\] canUnload - start a02/,
                            /A02\] canUnload - end a02/,
                            /A04\] canLoad - start a04/,
                            /A01\] canLoad - start a01/,
                            /A04\] canLoad - end a04/,
                            /A01\] canLoad - end a01/,
                            /A02\] unloading - start a02/,
                            /A02\] unloading - end a02/,
                            /A04\] loading - start a04/,
                            /A01\] loading - start a01/,
                            /A04\] loading - end a04/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A02\] detaching - start a02/,
                            /A02\] detaching - end a02/,
                            /A02\] unbinding - start a02/,
                            /A02\] unbinding - end a02/,
                            /A02\] dispose - a02/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A04\] detaching - start a04/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A04\] detaching - end a04/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A04\] unbinding - start a04/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A04\] unbinding - end a04/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A04\] dispose - a04/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            yield new SiblingHookTestData(ticks, root, scopes, assertStartLog, [
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 'phase1');
                    },
                ],
                [
                    'a04@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A04\] canLoad - start a04/,
                            /A01\] canLoad - start a01/,
                            /A04\] canLoad - end a04/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A04\] loading - start a04/,
                            /A01\] loading - start a01/,
                            /A04\] loading - end a04/,
                            /A01\] loading - end a01/,
                        ], 'phase 2.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase2.2');
                    },
                ],
                [
                    'a01@$0',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A04\] canUnload - start a04/,
                            /A01\] canUnload - start a01/,
                            /A04\] canUnload - end a04/,
                            /A01\] canUnload - end a01/,
                            /A01\] canLoad - start a01/,
                            /A01\] canLoad - end a01/,
                            /A04\] unloading - start a04/,
                            /A01\] unloading - start a01/,
                            /A04\] unloading - end a04/,
                            /A01\] unloading - end a01/,
                            /A01\] loading - start a01/,
                            /A01\] loading - end a01/,
                        ], 'phase 3.1');
                        eventLog.assertLogOrderInvariant([
                            /A04\] detaching - start a04/,
                            /A04\] detaching - end a04/,
                            /A04\] unbinding - start a04/,
                            /A04\] unbinding - end a04/,
                            /A04\] dispose - a04/,
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase3.2');
                    },
                ],
                [
                    'a04@$0+a01@$1',
                    (eventLog) => {
                        eventLog.assertLog([
                            /A01\] canUnload - start a01/,
                            /A01\] canUnload - end a01/,
                            /A04\] canLoad - start a04/,
                            /A01\] canLoad - start a01/,
                            /A04\] canLoad - end a04/,
                            /A01\] canLoad - end a01/,
                            /A01\] unloading - start a01/,
                            /A01\] unloading - end a01/,
                            /A04\] loading - start a04/,
                            /A01\] loading - start a01/,
                            /A04\] loading - end a04/,
                            /A01\] loading - end a01/,
                        ], 'phase 4.1');
                        eventLog.assertLogOrderInvariant([
                            /A01\] detaching - start a01/,
                            /A01\] detaching - end a01/,
                            /A01\] unbinding - start a01/,
                            /A01\] unbinding - end a01/,
                            /A01\] dispose - a01/,
                            /A04\] binding - start a04/,
                            /A04\] binding - end a04/,
                            /A04\] bound - start a04/,
                            /A04\] bound - end a04/,
                            /A04\] attaching - start a04/,
                            /A04\] attaching - end a04/,
                            /A04\] attached - start a04/,
                            /A04\] attached - end a04/,
                            /A01\] binding - start a01/,
                            /A01\] binding - end a01/,
                            /A01\] bound - start a01/,
                            /A01\] bound - end a01/,
                            /A01\] attaching - start a01/,
                            /A01\] attaching - end a01/,
                            /A01\] attached - start a01/,
                            /A01\] attached - end a01/,
                        ], 12, 'phase4.2');
                    },
                ],
            ], (eventLog) => {
                eventLog.assertLog([
                    /A04\] detaching - start a04/,
                    /A01\] detaching - start a01/,
                    /Root\] detaching - start ro-ot/,
                    /A04\] detaching - end a04/,
                    /A01\] detaching - end a01/,
                    /Root\] detaching - end ro-ot/,
                    /A04\] unbinding - start a04/,
                    /A01\] unbinding - start a01/,
                    /Root\] unbinding - start ro-ot/,
                    /A04\] unbinding - end a04/,
                    /A01\] unbinding - end a01/,
                    /Root\] unbinding - end ro-ot/,
                    /Root\] dispose - ro-ot/,
                    /A04\] dispose - a04/,
                    /A01\] dispose - a01/,
                ], 'stop');
            });
            // #endregion
        }
    }
    for (const data of getSiblingHookTestData()) {
        it(`siblings - hook timing - ${data.name}`, async function () {
            const { au, container } = await createFixture(data.root, Registration.instance(IKnownScopes, data.scopes));
            const router = container.get(IRouter);
            const eventLog = EventLog.getInstance(container);
            data.assertStartLog(eventLog);
            for (const [instruction, assertion] of data.phases) {
                eventLog.clear();
                await router.load(instruction);
                assertion(eventLog);
            }
            eventLog.clear();
            await au.stop(true);
            data.assertStopLog(eventLog);
        });
    }
    it('multi-level hierarchical configuration -> navigation to sibling route from child -> parent is not replaced (transitionPlan: replace)', async function () {
        const ticks = 0;
        let L121 = (() => {
            let _classDecorators = [customElement({ name: 'l-121', template: `l-121 <a load="../l122/1"></a><a load="../l122/2"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModelWithAllHooks;
            var L121 = _classThis = class extends _classSuper {
                constructor() {
                    super(ticks);
                }
            };
            __setFunctionName(_classThis, "L121");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L121 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L121 = _classThis;
        })();
        let L122 = (() => {
            let _classDecorators = [customElement({ name: 'l-122', template: `l-122 \${id} <a load="../../l1"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModelWithAllHooks;
            var L122 = _classThis = class extends _classSuper {
                constructor() {
                    super(ticks);
                }
                async canLoad(params, _next, _current) {
                    await super.canLoad(params, _next, _current);
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L122");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L122 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L122 = _classThis;
        })();
        let L1 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', component: L121 },
                        { path: 'l122/:id', component: L122 },
                    ]
                }), customElement({ name: 'l-1', template: `<au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModelWithAllHooks;
            var L1 = _classThis = class extends _classSuper {
                constructor() {
                    super(ticks);
                }
            };
            __setFunctionName(_classThis, "L1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L1 = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l1', path: ['', 'l1'], component: L1 },
                    ],
                    transitionPlan: 'replace',
                }), customElement({ name: 'ro-ot', template: '<au-viewport name="root"></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = AsyncBaseViewModelWithAllHooks;
            var Root = _classThis = class extends _classSuper {
                constructor() {
                    super(ticks);
                }
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await createFixture(Root, Registration.instance(IKnownScopes, [Root.name, L1.name, L121.name, L122.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        assert.html.textContent(host, 'l-121');
        const anchors = Array.from(host.querySelectorAll('a'));
        const hrefs = anchors.map(a => a.href);
        assert.match(hrefs[0], /l122\/1$/);
        assert.match(hrefs[1], /l122\/2$/);
        // phase1
        eventLog.clear();
        anchors[0].click();
        await router.currentTr.promise;
        eventLog.assertLog([
            /L121\] canUnload - start l-121/,
            /L121\] canUnload - end l-121/,
            /L122\] canLoad - start l-122/,
            /L122\] canLoad - end l-122/,
            /L121\] unloading - start l-121/,
            /L121\] unloading - end l-121/,
            /L122\] loading - start l-122/,
            /L122\] loading - end l-122/,
            /L121\] detaching - start l-121/,
            /L121\] detaching - end l-121/,
            /L121\] unbinding - start l-121/,
            /L121\] unbinding - end l-121/,
            /L121\] dispose - l-121/,
            /L122\] binding - start l-122/,
            /L122\] binding - end l-122/,
            /L122\] bound - start l-122/,
            /L122\] bound - end l-122/,
            /L122\] attaching - start l-122/,
            /L122\] attaching - end l-122/,
            /L122\] attached - start l-122/,
            /L122\] attached - end l-122/,
        ], 'phase1');
        // phase2 - go-back
        eventLog.clear();
        host.querySelector('a').click();
        await router.currentTr.promise;
        eventLog.assertLog([
            /L122\] canUnload - start l-122/,
            /L122\] canUnload - end l-122/,
            /L121\] canLoad - start l-121/,
            /L121\] canLoad - end l-121/,
            /L122\] unloading - start l-122/,
            /L122\] unloading - end l-122/,
            /L121\] loading - start l-121/,
            /L121\] loading - end l-121/,
            /L122\] detaching - start l-122/,
            /L122\] detaching - end l-122/,
            /L122\] unbinding - start l-122/,
            /L122\] unbinding - end l-122/,
            /L122\] dispose - l-122/,
            /L121\] binding - start l-121/,
            /L121\] binding - end l-121/,
            /L121\] bound - start l-121/,
            /L121\] bound - end l-121/,
            /L121\] attaching - start l-121/,
            /L121\] attaching - end l-121/,
            /L121\] attached - start l-121/,
            /L121\] attached - end l-121/,
        ], 'phase2');
        // phase3
        eventLog.clear();
        host.querySelector('a:nth-of-type(2)').click();
        await router.currentTr.promise;
        eventLog.assertLog([
            /L121\] canUnload - start l-121/,
            /L121\] canUnload - end l-121/,
            /L122\] canLoad - start l-122/,
            /L122\] canLoad - end l-122/,
            /L121\] unloading - start l-121/,
            /L121\] unloading - end l-121/,
            /L122\] loading - start l-122/,
            /L122\] loading - end l-122/,
            /L121\] detaching - start l-121/,
            /L121\] detaching - end l-121/,
            /L121\] unbinding - start l-121/,
            /L121\] unbinding - end l-121/,
            /L121\] dispose - l-121/,
            /L122\] binding - start l-122/,
            /L122\] binding - end l-122/,
            /L122\] bound - start l-122/,
            /L122\] bound - end l-122/,
            /L122\] attaching - start l-122/,
            /L122\] attaching - end l-122/,
            /L122\] attached - start l-122/,
            /L122\] attached - end l-122/,
        ], 'phase3');
        await au.stop(true);
    });
    // #endregion
    it('navigate away -> false from canUnload -> navigate away with same path', async function () {
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-one', template: `c1` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildOne = _classThis = class {
                constructor() {
                    this.allowUnload = false;
                    this.canUnloadCalled = 0;
                }
                canUnload() {
                    this.canUnloadCalled++;
                    return this.allowUnload;
                }
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
            let _classDecorators = [customElement({ name: 'c-two', template: `c2` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ChildTwo = _classThis = class {
                constructor() {
                    this.allowUnload = false;
                    this.canUnloadCalled = 0;
                }
                canUnload() {
                    this.canUnloadCalled++;
                    return this.allowUnload;
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
                        {
                            path: ['c1/:id?'],
                            component: ChildOne,
                        },
                        {
                            path: ['', 'c2/:id?'],
                            component: ChildTwo,
                        },
                    ],
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
        const { au, container, host } = await start({ appRoot: Root });
        const router = container.get(IRouter);
        assert.html.textContent(host, 'c2', 'content 1');
        let c2vm = CustomElement.for(host.querySelector('c-two')).viewModel;
        assert.strictEqual(await router.load('c1/42'), false, 'expected unsuccessful load 1');
        assert.strictEqual(c2vm.canUnloadCalled, 1, 'c2vm.canUnloadCalled 1');
        assert.strictEqual(await router.load('c1/42'), false, 'expected unsuccessful load 2');
        assert.strictEqual(c2vm.canUnloadCalled, 2, 'c2vm.canUnloadCalled 2');
        c2vm.allowUnload = true;
        assert.strictEqual(await router.load('c1/42'), true, 'expected successful load 1');
        assert.strictEqual(c2vm.canUnloadCalled, 3, 'c2vm.canUnloadCalled 3');
        assert.html.textContent(host, 'c1', 'content 2');
        const c1vm = CustomElement.for(host.querySelector('c-one')).viewModel;
        assert.strictEqual(await router.load('c2/42'), false, 'expected unsuccessful load 3');
        assert.strictEqual(c1vm.canUnloadCalled, 1, 'c1vm.canUnloadCalled 1');
        assert.strictEqual(await router.load('c2/42'), false, 'expected unsuccessful load 4');
        assert.strictEqual(c1vm.canUnloadCalled, 2, 'c1vm.canUnloadCalled 2');
        c1vm.allowUnload = true;
        assert.strictEqual(await router.load('c2/42'), true, 'expected successful load 2');
        assert.strictEqual(c1vm.canUnloadCalled, 3, 'c1vm.canUnloadCalled 3');
        assert.html.textContent(host, 'c2', 'content 3');
        // round#2
        c2vm = CustomElement.for(host.querySelector('c-two')).viewModel;
        c2vm.allowUnload = false;
        assert.strictEqual(await router.load('c2/43'), false, 'expected unsuccessful load 5');
        assert.strictEqual(c2vm.canUnloadCalled, 1, 'c2vm.canUnloadCalled 3');
        assert.strictEqual(await router.load('c1/43'), false, 'expected unsuccessful load 6');
        assert.strictEqual(c2vm.canUnloadCalled, 2, 'c2vm.canUnloadCalled 4');
        c2vm.allowUnload = true;
        assert.strictEqual(await router.load('c1/42'), true, 'expected successful load 3');
        assert.strictEqual(c2vm.canUnloadCalled, 3, 'c1vm.canUnloadCalled 5');
        assert.html.textContent(host, 'c1', 'content 4');
        await au.stop(true);
    });
    it('lifecycle hooks as dependencies are supported', async function () {
        let Hook1 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Hook1 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook1 = _classThis;
        })();
        let Hook2 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Hook2 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook2 = _classThis;
        })();
        let Hook3 = (() => {
            let _classDecorators = [lifecycleHooks()];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = BaseHook;
            var Hook3 = _classThis = class extends _classSuper {
            };
            __setFunctionName(_classThis, "Hook3");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Hook3 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Hook3 = _classThis;
        })();
        let ChildOne = (() => {
            let _classDecorators = [customElement({ name: 'c-one', template: `c1`, dependencies: [Hook1, Hook3] })];
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
            let _classDecorators = [customElement({ name: 'c-two', template: `c2`, dependencies: [Hook2] })];
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
                        {
                            path: ['c1'],
                            component: ChildOne,
                        },
                        {
                            path: ['c2'],
                            component: ChildTwo,
                        },
                    ],
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
        const { au, container, host } = await createFixture(Root, Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Hook3.name]));
        const router = container.get(IRouter);
        const eventLog = EventLog.getInstance(container);
        // round#1
        await router.load('c1');
        assert.html.textContent(host, 'c1');
        eventLog.assertLog([
            /Hook1\] canLoad 'c1'/,
            /Hook3\] canLoad 'c1'/,
            /Hook1\] loading 'c1'/,
            /Hook3\] loading 'c1'/,
        ], 'round#1');
        // round #2
        eventLog.clear();
        await router.load('c2');
        assert.html.textContent(host, 'c2');
        eventLog.assertLog([
            /Hook1\] canUnload 'c1'/,
            /Hook3\] canUnload 'c1'/,
            /Hook2\] canLoad 'c2'/,
            /Hook1\] unloading 'c1'/,
            /Hook3\] unloading 'c1'/,
            /Hook2\] loading 'c2'/,
        ], 'round#2');
        await au.stop(true);
    });
    it('redirecting from canLoad from a child route should work without error', async function () {
        let C1 = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: `c1` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C1 = _classThis = class {
                canLoad(_params, _next, _current) {
                    return 'p-1/c-2';
                }
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
            let _classDecorators = [customElement({ name: 'c-2', template: `c2` })];
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
        let C3 = (() => {
            let _classDecorators = [customElement({ name: 'c-3', template: `c3` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C3 = _classThis = class {
            };
            __setFunctionName(_classThis, "C3");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C3 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C3 = _classThis;
        })();
        let P1 = (() => {
            let _classDecorators = [route({ routes: [C1, C2, C3] }), customElement({ name: 'p-1', template: '<au-viewport></au-viewport>' })];
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
            let _classDecorators = [route({ routes: [P1] }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
        const { au, host, container } = await createFixture(Root, [C1, C2, C3, P1, Registration.instance(IKnownScopes, [ /* Root.name, P1.name, C1.name, C2.name */])]);
        const router = container.get(IRouter);
        let errorCount = 0;
        let cancelCount = 0;
        const routerEvents = container.get(IRouterEvents);
        routerEvents.subscribe('au:router:navigation-error', () => errorCount++);
        routerEvents.subscribe('au:router:navigation-cancel', () => cancelCount++);
        // round#1 - load c1 and redirect to c2 should take place
        await router.load('p-1/c-1');
        assert.html.textContent(host, 'c2');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 1, 'cancelCount');
        // round#2 - load c3 and it should work a as expected
        errorCount = 0;
        cancelCount = 0;
        await router.load('p-1/c-3');
        assert.html.textContent(host, 'c3');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 0, 'cancelCount');
        // round#3 - load c2 normally, and an it should be loaded
        await router.load('p-1/c-2');
        assert.html.textContent(host, 'c2');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 0, 'cancelCount');
        // round#4 - cleanse before testing the c-1 -_ c-2 redirect scenario once again
        await router.load('p-1/c-3');
        assert.html.textContent(host, 'c3');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 0, 'cancelCount');
        // round#5 - load c1 and redirect to c2 should take place
        await router.load('p-1/c-1');
        assert.html.textContent(host, 'c2');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 1, 'cancelCount');
        await au.stop(true);
    });
    it('cancelling from canUnload from a child route should work without error', async function () {
        let C1 = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: `c1` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C1 = _classThis = class {
                canUnload(_next, _current) {
                    return false;
                }
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
            let _classDecorators = [customElement({ name: 'c-2', template: `c2` })];
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
            let _classDecorators = [route({ routes: [C1, C2] }), customElement({ name: 'p-1', template: '<au-viewport></au-viewport>' })];
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
            let _classDecorators = [route({ routes: [P1] }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
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
        const { au, host, container } = await createFixture(Root, [C1, C2, P1, Registration.instance(IKnownScopes, [ /* Root.name, P1.name, C1.name, C2.name */])]);
        const router = container.get(IRouter);
        let errorCount = 0;
        let cancelCount = 0;
        const routerEvents = container.get(IRouterEvents);
        routerEvents.subscribe('au:router:navigation-error', () => errorCount++);
        routerEvents.subscribe('au:router:navigation-cancel', () => cancelCount++);
        await router.load('p-1/c-1');
        assert.html.textContent(host, 'c1');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 0, 'cancelCount');
        await router.load('p-1/c-2');
        assert.html.textContent(host, 'c1');
        assert.strictEqual(errorCount, 0, 'errorCount');
        assert.strictEqual(cancelCount, 1, 'cancelCount');
        await au.stop(true);
    });
});
//# sourceMappingURL=lifecycle-hooks.spec.js.map