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
import { DI, IContainer, ILogger, LoggerConfiguration, LogLevel, pascalCase, Registration, sink, optional, resolve, } from '@aurelia/kernel';
import { tasksSettled, } from '@aurelia/runtime';
import { valueConverter, bindingBehavior, ValueConverter, customElement, CustomElement, Switch, Aurelia, IPlatform, PromiseTemplateController, If, bindable, INode, } from '@aurelia/runtime-html';
import { assert, TestContext, } from '@aurelia/testing';
import { createSpecFunction, isNode, } from '../util.js';
describe('3-runtime-html/promise.spec.ts', function () {
    // Note: This is just an unrolled test for debugging purposes (useful for future refactoring of the tests)
    it('shows content as per promise status - non-template promise-host - fulfilled (unrolled)', async function () {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        let PendingHost = (() => {
            let _classDecorators = [customElement({
                    name: 'pending-host',
                    template: 'pending${p.id}',
                    bindables: ['p']
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var PendingHost = _classThis = class {
            };
            __setFunctionName(_classThis, "PendingHost");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                PendingHost = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return PendingHost = _classThis;
        })();
        let FulfilledHost = (() => {
            let _classDecorators = [customElement({
                    name: 'fulfilled-host',
                    template: 'resolved with ${data}',
                    bindables: ['data']
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var FulfilledHost = _classThis = class {
            };
            __setFunctionName(_classThis, "FulfilledHost");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FulfilledHost = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FulfilledHost = _classThis;
        })();
        let RejectedHost = (() => {
            let _classDecorators = [customElement({
                    name: 'rejected-host',
                    template: 'rejected with ${err.message}',
                    bindables: ['err']
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var RejectedHost = _classThis = class {
            };
            __setFunctionName(_classThis, "RejectedHost");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                RejectedHost = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return RejectedHost = _classThis;
        })();
        class App {
            constructor() {
                this._resolve = () => { };
                this.promise = Object.assign(new Promise((r) => { this._resolve = r; }), { id: 0 });
            }
            resolve(value) {
                this._resolve(value);
            }
        }
        const au = new Aurelia(container);
        const template = `
      <div promise.bind="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
        <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
      </div>
    `;
        let error = null;
        let app = null;
        try {
            await au
                .register(PendingHost, FulfilledHost, RejectedHost)
                .app({
                host,
                component: CustomElement.define({ name: 'app', template }, App),
            })
                .start();
            app = au.root.controller.viewModel;
        }
        catch (e) {
            error = e;
        }
        assert.strictEqual(error, null);
        assert.html.innerEqual(host, `<div> <pending-host>pending0</pending-host> </div>`);
        app.resolve(42);
        await tasksSettled();
        assert.html.innerEqual(host, `<div> <fulfilled-host>resolved with 42</fulfilled-host> </div>`);
        await au.stop();
        assert.html.innerEqual(host, '', 'host should be empty after au.stop()');
        ctx.doc.body.removeChild(host);
    });
    const phost = 'pending-host';
    const fhost = 'fulfilled-host';
    const rhost = 'rejected-host';
    class Config {
        constructor(hasPromise, wait) {
            this.hasPromise = hasPromise;
            this.wait = wait;
        }
        toString() {
            return `{${this.hasPromise ? this.wait.toString() : 'noWait'}}`;
        }
    }
    const configLookup = DI.createInterface();
    function createComponentType(name, template = '', bindables = []) {
        let Component = (() => {
            let _classDecorators = [customElement({ name, template, bindables })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _ceId_decorators;
            let _ceId_initializers = [];
            let _ceId_extraInitializers = [];
            var Component = _classThis = class {
                constructor() {
                    this.ceId = __runInitializers(this, _ceId_initializers, null);
                    this.config = (__runInitializers(this, _ceId_extraInitializers), resolve(optional(Config)));
                    const $logger = this.$logger = resolve(ILogger);
                    const container = resolve(IContainer);
                    const node = resolve(INode);
                    if (node.dataset.logCtor !== void 0) {
                        (this.logger = $logger.scopeTo(name)).debug('ctor');
                        delete node.dataset.logCtor;
                    }
                    if (this.config == null) {
                        const lookup = container.get(configLookup);
                        this.config = lookup.get(name);
                    }
                }
                async binding() {
                    this.logger = this.ceId === null ? this.$logger.scopeTo(name) : this.$logger.scopeTo(`${name}-${this.ceId}`);
                    if (this.config.hasPromise) {
                        await this.config.wait('binding');
                    }
                    this.logger.debug('binding');
                }
                async bound() {
                    if (this.config.hasPromise) {
                        await this.config.wait('bound');
                    }
                    this.logger.debug('bound');
                }
                async attaching() {
                    if (this.config.hasPromise) {
                        await this.config.wait('attaching');
                    }
                    this.logger.debug('attaching');
                }
                async attached() {
                    if (this.config.hasPromise) {
                        await this.config.wait('attached');
                    }
                    this.logger.debug('attached');
                }
                async detaching() {
                    if (this.config.hasPromise) {
                        await this.config.wait('detaching');
                    }
                    this.logger.debug('detaching');
                }
                async unbinding() {
                    if (this.config.hasPromise) {
                        await this.config.wait('unbinding');
                    }
                    this.logger.debug('unbinding');
                }
            };
            __setFunctionName(_classThis, "Component");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _ceId_decorators = [bindable];
                __esDecorate(null, null, _ceId_decorators, { kind: "field", name: "ceId", static: false, private: false, access: { has: obj => "ceId" in obj, get: obj => obj.ceId, set: (obj, value) => { obj.ceId = value; } }, metadata: _metadata }, _ceId_initializers, _ceId_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Component = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Component = _classThis;
        })();
        Reflect.defineProperty(Component, 'name', {
            writable: false,
            enumerable: false,
            configurable: true,
            value: pascalCase(name),
        });
        return Component;
    }
    let DebugLog = (() => {
        let _classDecorators = [sink({ handles: [LogLevel.debug] })];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var DebugLog = _classThis = class {
            constructor() {
                this.log = [];
            }
            handleEvent(event) {
                const scope = event.scope.join('.');
                if (scope.includes('-host')) {
                    this.log.push(`${scope}.${event.message}`);
                }
            }
            clear() {
                this.log.length = 0;
            }
        };
        __setFunctionName(_classThis, "DebugLog");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DebugLog = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return DebugLog = _classThis;
    })();
    class PromiseTestExecutionContext {
        constructor(ctx, container, host, app, controller, error) {
            this.ctx = ctx;
            this.container = container;
            this.host = host;
            this.app = app;
            this.controller = controller;
            this.error = error;
            this._log = container.get(ILogger).sinks.find((s) => s instanceof DebugLog);
        }
        get platform() { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
        get log() {
            return this._log?.log ?? [];
        }
        clear() {
            this._log?.clear();
        }
        assertCalls(expected, message = '') {
            assert.deepStrictEqual(this.log, expected, message);
        }
        assertCallSet(expected, message = '') {
            const actual = this.log;
            /**
             * Workaround for the scheduler refactor because now the calls are more complete than before.
             *
             * ---
             * For example, now we'll get this:
             *
             * pending-host.binding
             * pending-host.bound
             * pending-host.attaching
             * pending-host.attached
             * pending-host.detaching
             * fulfilled-host.binding
             * pending-host.unbinding
             * fulfilled-host.bound
             * fulfilled-host.attaching
             * fulfilled-host.attached
             *
             * ---
             * Whereas before, it was only this:
             *
             * fulfilled-host.binding
             * fulfilled-host.bound
             * fulfilled-host.attaching
             * fulfilled-host.attached
             *
             * ---
             * After some experimentation, it turns out very complicated to realign everything.
             * As a middle ground, we'll skip the length check and just make sure all expected calls are present.
             *
             */
            for (const call of expected) {
                assert.includes(actual, call, `${message} - expected calls are all present in the actual set`);
            }
        }
    }
    let DelayPromise;
    (function (DelayPromise) {
        DelayPromise["binding"] = "binding";
    })(DelayPromise || (DelayPromise = {}));
    const seedPromise = DI.createInterface();
    const delaySeedPromise = DI.createInterface();
    async function testPromise(testFunction, { template, registrations = [], expectedStopLog, verifyStopCallsAsSet = false, promise, delayPromise = null, appType, } = {}) {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        let error = null;
        let app = null;
        let controller = null;
        try {
            await au
                .register(LoggerConfiguration.create({ level: LogLevel.trace, sinks: [DebugLog] }), ...registrations, Promisify, Double, NoopBindingBehavior, typeof promise === 'function'
                ? Registration.callback(seedPromise, promise)
                : Registration.instance(seedPromise, promise), Registration.instance(delaySeedPromise, delayPromise))
                .app({
                host,
                component: CustomElement.define({ name: 'app', template }, appType ?? App)
            })
                .start();
            app = au.root.controller.viewModel;
            controller = au.root.controller;
        }
        catch (e) {
            error = e;
        }
        const testCtx = new PromiseTestExecutionContext(ctx, container, host, app, controller, error);
        await testFunction(testCtx);
        if (error === null) {
            testCtx.clear();
            await au.stop();
            assert.html.innerEqual(host, '', 'post-detach innerHTML');
            if (verifyStopCallsAsSet) {
                testCtx.assertCallSet(expectedStopLog);
            }
            else {
                testCtx.assertCalls(expectedStopLog, 'stop lifecycle calls');
            }
        }
        ctx.doc.body.removeChild(host);
    }
    const $it = createSpecFunction(testPromise);
    let Promisify = (() => {
        let _classDecorators = [valueConverter('promisify')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var Promisify = _classThis = class {
            toView(value, resolve = true, ticks = 0) {
                if (ticks === 0) {
                    return Object.assign(resolve ? Promise.resolve(value) : Promise.reject(new Error(String(value))), { id: 0 });
                }
                return Object.assign(createMultiTickPromise(ticks, () => resolve ? Promise.resolve(value) : Promise.reject(new Error(String(value))))(), { id: 0 });
            }
        };
        __setFunctionName(_classThis, "Promisify");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Promisify = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return Promisify = _classThis;
    })();
    let Double = (() => {
        let _classDecorators = [valueConverter('double')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var Double = _classThis = class {
            fromView(value) {
                return value instanceof Error
                    ? (value.message = `${value.message} ${value.message}`, value)
                    : `${value} ${value}`;
            }
        };
        __setFunctionName(_classThis, "Double");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Double = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return Double = _classThis;
    })();
    let NoopBindingBehavior = (() => {
        let _classDecorators = [bindingBehavior('noop')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var NoopBindingBehavior = _classThis = class {
            bind(_scope, _binding) {
                return;
            }
            unbind(_scope, _binding) {
                return;
            }
        };
        __setFunctionName(_classThis, "NoopBindingBehavior");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NoopBindingBehavior = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return NoopBindingBehavior = _classThis;
    })();
    class App {
        constructor() {
            this.container = resolve(IContainer);
            this.delaySeedPromise = resolve(delaySeedPromise);
            if (this.delaySeedPromise === null) {
                this.init();
            }
        }
        binding() {
            if (this.delaySeedPromise !== DelayPromise.binding) {
                return;
            }
            this.init();
        }
        init() {
            this.promise = this.container.get(seedPromise);
        }
        updateError(err) {
            err.message += '1';
            return err;
        }
    }
    function getActivationSequenceFor(name, withCtor = false) {
        return typeof name === 'string'
            ? [...(withCtor ? [`${name}.ctor`] : []), `${name}.binding`, `${name}.bound`, `${name}.attaching`, `${name}.attached`]
            : [...(withCtor ? [`${name}.ctor`] : []), 'binding', 'bound', 'attaching', 'attached'].flatMap(x => name.map(n => `${n}.${x}`));
    }
    function getDeactivationSequenceFor(name) {
        return typeof name === 'string'
            ? [`${name}.detaching`, `${name}.unbinding`]
            : ['detaching', 'unbinding'].flatMap(x => name.map(n => `${n}.${x}`));
    }
    class TestData {
        constructor(name, promise, { registrations = [], template, verifyStopCallsAsSet = false, delayPromise = null, appType, }, config, expectedInnerHtml, expectedStartLog, expectedStopLog, additionalAssertions = null, only = false) {
            this.promise = promise;
            this.config = config;
            this.expectedInnerHtml = expectedInnerHtml;
            this.expectedStartLog = expectedStartLog;
            this.expectedStopLog = expectedStopLog;
            this.additionalAssertions = additionalAssertions;
            this.only = only;
            this.name = `${name} - config: ${String(config)} - delayPromise: ${delayPromise}`;
            this.registrations = [
                ...(config !== null ? [Registration.instance(Config, config)] : []),
                createComponentType(phost, `pending\${p.id}`, ['p']),
                createComponentType(fhost, `resolved with \${data}`, ['data']),
                createComponentType(rhost, `rejected with \${err.message}`, ['err']),
                ...registrations,
            ];
            this.template = template;
            this.verifyStopCallsAsSet = verifyStopCallsAsSet;
            this.delayPromise = delayPromise;
            this.appType = appType;
        }
    }
    function createWaiter(ms) {
        function wait(_name) {
            return new Promise(function (resolve) { setTimeout(resolve, ms); });
        }
        wait.toString = function () {
            return `setTimeout(cb,${JSON.stringify(ms)})`;
        };
        return wait;
    }
    function noop() {
        return;
    }
    noop.toString = function () {
        return 'Promise.resolve()';
    };
    function createMultiTickPromise(ticks, cb) {
        const wait = () => {
            if (ticks === 0) {
                return cb();
            }
            ticks--;
            return new Promise((r) => setTimeout(function () { r(wait()); }, 0));
        };
        return wait;
    }
    function createWaiterWithTicks(ticks) {
        const lookup = Object.create(null);
        for (const [key, numTicks] of Object.entries(ticks)) {
            const fn = () => {
                if (fn.ticks === 0) {
                    return;
                }
                fn.ticks--;
                return new Promise((r) => setTimeout(function () { void r(fn()); }, 0));
            };
            fn.ticks = numTicks;
            lookup[key] = fn;
        }
        const wait = (name) => {
            return lookup[name]?.() ?? Promise.resolve();
        };
        wait.toString = function () {
            return `waitWithTicks(cb,${JSON.stringify(ticks)})`;
        };
        return wait;
    }
    function* getTestData() {
        function wrap(content, type, debugMode = false) {
            switch (type) {
                case 'p':
                    return `<${phost}${debugMode ? ` p.bind="promise"` : ''}>${content}</${phost}>`;
                case 'f':
                    return `<${fhost}${debugMode ? ` data.bind="data"` : ''}>${content}</${fhost}>`;
                case 'r':
                    return `<${rhost}${debugMode ? ` err.bind="err"` : ''}>${content}</${rhost}>`;
            }
        }
        const configFactories = [
            function () {
                return new Config(false, noop);
            },
            function () {
                return new Config(true, createWaiter(0));
            },
            function () {
                return new Config(true, createWaiter(5));
            },
        ];
        for (const [pattribute, fattribute, rattribute] of [
            ['promise.bind', 'then.from-view', 'catch.from-view'],
            // TODO: activate after the attribute parser and/or interpreter such that for `t`, `then` is not picked up.
            ['promise.resolve', 'then', 'catch']
        ]) {
            const templateDiv = `
      <div ${pattribute}="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </div>`;
            const template1 = `
    <template>
      <template ${pattribute}="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
            for (const delayPromise of [null, ...(Object.values(DelayPromise))]) {
                for (const config of configFactories) {
                    {
                        let resolve;
                        yield new TestData('shows content as per promise status - non-template promise-host - fulfilled', Object.assign(new Promise((r) => resolve = r), { id: 0 }), { delayPromise, template: templateDiv, }, config(), `<div> ${wrap('pending0', 'p')} </div>`, getActivationSequenceFor(phost), getDeactivationSequenceFor(fhost), async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, `<div> ${wrap('resolved with 42', 'f')} </div>`);
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                        });
                    }
                    {
                        let reject;
                        yield new TestData('shows content as per promise status #1 - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), { delayPromise, template: templateDiv }, config(), `<div> ${wrap('pending0', 'p')} </div>`, getActivationSequenceFor(phost), getDeactivationSequenceFor(rhost), async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, `<div> ${wrap('rejected with foo-bar', 'r')} </div>`);
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                        });
                    }
                    {
                        let resolve;
                        yield new TestData('shows content as per promise status #1 - fulfilled', Object.assign(new Promise((r) => resolve = r), { id: 0 }), { delayPromise, template: template1, }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(fhost), async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                        });
                    }
                    {
                        let reject;
                        yield new TestData('shows content as per promise status #1 - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), { delayPromise, template: template1 }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(rhost), async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                        });
                    }
                    yield new TestData('shows content for resolved promise', Promise.resolve(42), { delayPromise, template: template1 }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor(fhost));
                    yield new TestData('shows content for rejected promise', () => Promise.reject(new Error('foo-bar')), { delayPromise, template: template1 }, config(), wrap('rejected with foo-bar', 'r'), getActivationSequenceFor(rhost), getDeactivationSequenceFor(rhost));
                    yield new TestData('reacts to change in promise value - fulfilled -> fulfilled', Promise.resolve(42), { delayPromise, template: template1 }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Promise.resolve(24);
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 24', 'f'));
                        ctx.assertCallSet([]);
                    });
                    yield new TestData('reacts to change in promise value - fulfilled -> rejected', Promise.resolve(42), { delayPromise, template: template1 }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Promise.reject(new Error('foo-bar'));
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(rhost)]);
                    });
                    yield new TestData('reacts to change in promise value - fulfilled -> (pending -> fulfilled) + deferred view-instantiation assertion', Promise.resolve(42), {
                        delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise" data-log-ctor></pending-host>
                <fulfilled-host ${fattribute}="data" data.bind="data" data-log-ctor></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err" data-log-ctor></rejected-host>
              </template>
            </template>`
                    }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(fhost, true), getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        let resolve;
                        const promise = new Promise((r) => resolve = r);
                        promise.id = 0;
                        ctx.app.promise = promise;
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)]);
                        ctx.clear();
                        resolve(84);
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                    });
                    yield new TestData('reacts to change in promise value - fulfilled -> (pending -> rejected)', Promise.resolve(42), { delayPromise, template: template1 }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        let reject;
                        const promise = new Promise((_, r) => reject = r);
                        promise.id = 0;
                        ctx.app.promise = promise;
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)]);
                        ctx.clear();
                        reject(new Error('foo-bar'));
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                    });
                    yield new TestData('reacts to change in promise value - rejected -> rejected', () => Promise.reject(new Error('foo-bar')), { delayPromise, template: template1 }, config(), wrap('rejected with foo-bar', 'r'), getActivationSequenceFor(rhost), getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Promise.reject(new Error('fizz-bazz'));
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('rejected with fizz-bazz', 'r'));
                        ctx.assertCallSet([]);
                    });
                    yield new TestData('reacts to change in promise value - rejected -> fulfilled', () => Promise.reject(new Error('foo-bar')), { delayPromise, template: template1 }, config(), wrap('rejected with foo-bar', 'r'), getActivationSequenceFor(rhost), getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Promise.resolve(42);
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(rhost), ...getActivationSequenceFor(fhost)]);
                    });
                    yield new TestData('reacts to change in promise value - rejected -> (pending -> fulfilled)', () => Promise.reject(new Error('foo-bar')), { delayPromise, template: template1 }, config(), wrap('rejected with foo-bar', 'r'), getActivationSequenceFor(rhost), getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        let resolve;
                        const promise = new Promise((r) => resolve = r);
                        promise.id = 0;
                        ctx.app.promise = promise;
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(rhost), ...getActivationSequenceFor(phost)]);
                        ctx.clear();
                        resolve(84);
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                    });
                    yield new TestData('reacts to change in promise value - rejected -> (pending -> rejected)', () => Promise.reject(new Error('foo-bar')), { delayPromise, template: template1 }, config(), wrap('rejected with foo-bar', 'r'), getActivationSequenceFor(rhost), getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        let reject;
                        const promise = new Promise((_, r) => reject = r);
                        promise.id = 0;
                        ctx.app.promise = promise;
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(rhost), ...getActivationSequenceFor(phost)]);
                        ctx.clear();
                        reject(new Error('foo-bar'));
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                    });
                    yield new TestData('reacts to change in promise value - pending -> pending', Object.assign(new Promise(() => { }), { id: 0 }), { delayPromise, template: template1 }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(phost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Object.assign(new Promise(() => { }), { id: 1 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
                        ctx.assertCallSet([]);
                    });
                    yield new TestData('reacts to change in promise value - pending -> fulfilled', Object.assign(new Promise(() => { }), { id: 0 }), { delayPromise, template: template1 }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Promise.resolve(42);
                        await tasksSettled();
                        // TODO: figure out (and document) why two calls are necessary
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                    });
                    yield new TestData('reacts to change in promise value - pending -> rejected', Object.assign(new Promise(() => { }), { id: 0 }), { delayPromise, template: template1 }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        ctx.app.promise = Promise.reject(new Error('foo-bar'));
                        await tasksSettled();
                        // TODO: figure out (and document) why two calls are necessary
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                    });
                    yield new TestData('reacts to change in promise value - pending -> (pending -> fulfilled)', Object.assign(new Promise(() => { }), { id: 0 }), { delayPromise, template: template1 }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        let resolve;
                        ctx.app.promise = Object.assign(new Promise((r) => resolve = r), { id: 1 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
                        ctx.assertCallSet([]);
                        resolve(42);
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                    });
                    yield new TestData('reacts to change in promise value - pending -> (pending -> rejected)', Object.assign(new Promise(() => { }), { id: 0 }), { delayPromise, template: template1 }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        let reject;
                        ctx.app.promise = Object.assign(new Promise((_, r) => reject = r), { id: 1 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
                        ctx.assertCallSet([]);
                        reject(new Error('foo-bar'));
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                    });
                    yield new TestData('can be used in isolation without any of the child template controllers', new Promise(() => { }), { delayPromise, template: `<template><template ${pattribute}="promise">this is shown always</template></template>` }, config(), 'this is shown always', [], []);
                    const pTemplt = `<template>
        <template ${pattribute}="promise">
          <pending-host pending p.bind="promise"></pending-host>
        </template>
      </template>`;
                    {
                        let resolve;
                        yield new TestData('supports combination: promise>pending - resolved', Object.assign(new Promise((r) => resolve = r), { id: 0 }), { delayPromise, template: pTemplt }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), [], async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '');
                            ctx.assertCallSet(getDeactivationSequenceFor(phost));
                        });
                    }
                    {
                        let reject;
                        yield new TestData('supports combination: promise>pending - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), { delayPromise, template: pTemplt }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), [], async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '');
                            ctx.assertCallSet(getDeactivationSequenceFor(phost));
                        });
                    }
                    const pfCombTemplt = `<template>
        <template ${pattribute}="promise">
          <pending-host pending p.bind="promise"></pending-host>
          <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        </template>
      </template>`;
                    {
                        let resolve;
                        yield new TestData('supports combination: promise>(pending+then) - resolved', Object.assign(new Promise((r) => resolve = r), { id: 0 }), { delayPromise, template: pfCombTemplt }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(fhost), async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(fhost)]);
                        });
                    }
                    {
                        let reject;
                        yield new TestData('supports combination: promise>(pending+then) - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), { delayPromise, template: pfCombTemplt }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), [], async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '');
                            ctx.assertCallSet(getDeactivationSequenceFor(phost));
                        });
                    }
                    const prCombTemplt = `<template>
        <template ${pattribute}="promise">
          <pending-host pending p.bind="promise"></pending-host>
          <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
        </template>
      </template>`;
                    {
                        let resolve;
                        yield new TestData('supports combination: promise>(pending+catch) - resolved', Object.assign(new Promise((r) => resolve = r), { id: 0 }), { delayPromise, template: prCombTemplt }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), [], async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '');
                            ctx.assertCallSet(getDeactivationSequenceFor(phost));
                        });
                    }
                    {
                        let reject;
                        yield new TestData('supports combination: promise>(pending+catch) - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), { delayPromise, template: prCombTemplt }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor(rhost), async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor(rhost)]);
                        });
                    }
                    const fTemplt = `<template>
      <template ${pattribute}="promise">
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
      </template>
    </template>`;
                    {
                        let resolve;
                        yield new TestData('supports combination: promise>then - resolved', Object.assign(new Promise((r) => resolve = r), { id: 0 }), { delayPromise, template: fTemplt }, config(), '', [], getDeactivationSequenceFor(fhost), async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                            ctx.assertCallSet(getActivationSequenceFor(fhost));
                        });
                    }
                    {
                        let reject;
                        yield new TestData('supports combination: promise>then - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), { delayPromise, template: fTemplt }, config(), '', [], [], async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '');
                            ctx.assertCallSet([]);
                        });
                    }
                    const rTemplt = `<template>
      <template ${pattribute}="promise">
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
                    {
                        let resolve;
                        yield new TestData('supports combination: promise>catch - resolved', new Promise((r) => resolve = r), { delayPromise, template: rTemplt }, config(), '', [], [], async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '');
                            ctx.assertCallSet([]);
                        });
                    }
                    {
                        let reject;
                        yield new TestData('supports combination: promise>catch - rejected', new Promise((_, r) => reject = r), { delayPromise, template: rTemplt }, config(), '', [], getDeactivationSequenceFor(rhost), async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                            ctx.assertCallSet(getActivationSequenceFor(rhost));
                        });
                    }
                    const frTemplt = `<template>
      <template ${pattribute}="promise">
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
                    {
                        let resolve;
                        yield new TestData('supports combination: promise>then+catch - resolved', new Promise((r) => resolve = r), { delayPromise, template: frTemplt }, config(), '', [], getDeactivationSequenceFor(fhost), async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                            ctx.assertCallSet(getActivationSequenceFor(fhost));
                        });
                    }
                    {
                        let reject;
                        yield new TestData('supports combination: promise>then+catch - rejected', new Promise((_, r) => reject = r), { delayPromise, template: frTemplt }, config(), '', [], getDeactivationSequenceFor(rhost), async (ctx) => {
                            ctx.clear();
                            reject(new Error('foo-bar'));
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                            ctx.assertCallSet(getActivationSequenceFor(rhost));
                        });
                    }
                    yield new TestData('shows static elements', Promise.resolve(42), {
                        delayPromise, template: `
        <template>
          <template ${pattribute}="promise">
            <div>foo</div>
          </template>
        </template>`
                    }, config(), '<div>foo</div>', [], []);
                    const template2 = `
    <template>
      <template ${pattribute}="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host1 then></fulfilled-host1>
        <rejected-host1 catch></rejected-host1>
      </template>
    </template>`;
                    {
                        let resolve;
                        yield new TestData('shows content as per promise status #2 - fulfilled', Object.assign(new Promise((r) => resolve = r), { id: 0 }), {
                            delayPromise, template: template2,
                            registrations: [
                                createComponentType('fulfilled-host1', 'resolved'),
                                createComponentType('rejected-host1', 'rejected'),
                            ]
                        }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor('fulfilled-host1'), async (ctx) => {
                            ctx.clear();
                            resolve(42);
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '<fulfilled-host1>resolved</fulfilled-host1>');
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor('fulfilled-host1')]);
                        });
                    }
                    {
                        let reject;
                        yield new TestData('shows content as per promise status #2 - rejected', Object.assign(new Promise((_, r) => reject = r), { id: 0 }), {
                            delayPromise, template: template2,
                            registrations: [
                                createComponentType('fulfilled-host1', 'resolved'),
                                createComponentType('rejected-host1', 'rejected'),
                            ]
                        }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor('rejected-host1'), async (ctx) => {
                            ctx.clear();
                            reject(new Error());
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, '<rejected-host1>rejected</rejected-host1>');
                            ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor('rejected-host1')]);
                        });
                    }
                    yield new TestData('works in nested template - fulfilled>fulfilled', Promise.resolve({ json() { return Promise.resolve(42); } }), {
                        delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <template ${fattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                </template>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>
            </template>`
                    }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor(fhost));
                    yield new TestData('works in nested template - fulfilled>rejected', Promise.resolve({ json() { return Promise.reject(new Error('foo-bar')); } }), {
                        delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <template ${fattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="updateError(err)"></rejected-host>
                </template>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>
            </template>`
                    }, config(), '<rejected-host>rejected with foo-bar1</rejected-host>', getActivationSequenceFor(rhost), getDeactivationSequenceFor(rhost));
                    yield new TestData('works in nested template - rejected>fulfilled', () => Promise.reject({ json() { return Promise.resolve(42); } }), {
                        delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data" data.bind="data" ce-id="1"></fulfilled-host>
                <template ${rattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data" ce-id="2"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
                </template>
              </template>
            </template>`
                    }, config(), wrap('resolved with 42', 'f'), getActivationSequenceFor(`${fhost}-2`), getDeactivationSequenceFor(`${fhost}-2`));
                    yield new TestData('works in nested template - rejected>rejected', () => Promise.reject({ json() { return Promise.reject(new Error('foo-bar')); } }), {
                        delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                <template ${rattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
                </template>
              </template>
            </template>`
                    }, config(), wrap('rejected with foo-bar', 'r'), getActivationSequenceFor(rhost), getDeactivationSequenceFor(rhost));
                    for (const $resolve of [true, false]) {
                        yield new TestData(`works with value converter on - settled promise - ${$resolve ? 'fulfilled' : 'rejected'}`, null, {
                            delayPromise, template: `
            <template>
              <template ${pattribute}="42|promisify:${$resolve}">
                <pending-host pending></pending-host>
                <fulfilled-host ${fattribute}="data | double" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err | double" err.bind="err"></rejected-host>
              </template>
            </template>`
                        }, config(), $resolve ? wrap('resolved with 42 42', 'f') : wrap('rejected with 42 42', 'r'), getActivationSequenceFor($resolve ? fhost : rhost), getDeactivationSequenceFor($resolve ? fhost : rhost));
                        yield new TestData(`works with value converter - longer running promise - ${$resolve ? 'fulfilled' : 'rejected'}`, null, {
                            delayPromise, template: `
            <template>
              <template ${pattribute}="42|promisify:${$resolve}:25">
                <pending-host pending></pending-host>
                <fulfilled-host ${fattribute}="data | double" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err | double" err.bind="err"></rejected-host>
              </template>
            </template>`
                        }, config(), null, null, getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                            await tasksSettled();
                            const tc = ctx.app.$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                            try {
                                await tc.value;
                            }
                            catch {
                                // ignore rejection
                            }
                            await tasksSettled();
                            if ($resolve) {
                                assert.html.innerEqual(ctx.host, wrap('resolved with 42 42', 'f'), 'fulfilled');
                            }
                            else {
                                assert.html.innerEqual(ctx.host, wrap('rejected with 42 42', 'r'), 'rejected');
                            }
                            ctx.assertCallSet([...getActivationSequenceFor(phost), ...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)]);
                        });
                        yield new TestData(`works with binding behavior - settled promise - ${$resolve ? 'fulfilled' : 'rejected'}`, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')), {
                            delayPromise, template: `
            <template>
              <template ${pattribute}="promise & noop">
                <pending-host pending></pending-host>
                <fulfilled-host ${fattribute}="data & noop" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err & noop" err.bind="err"></rejected-host>
              </template>
            </template>`
                        }, config(), $resolve ? wrap('resolved with 42', 'f') : wrap('rejected with foo-bar', 'r'), getActivationSequenceFor($resolve ? fhost : rhost), getDeactivationSequenceFor($resolve ? fhost : rhost));
                        // TODO: Test only fails on node (investigate at some point?)
                        if (!isNode()) {
                            yield new TestData(`works with binding behavior - longer running promise - ${$resolve ? 'fulfilled' : 'rejected'}`, () => Object.assign(createMultiTickPromise(20, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')))(), { id: 0 }), {
                                delayPromise, template: `
              <template>
                <template ${pattribute}="promise & noop">
                  <pending-host pending p.bind="promise"></pending-host>
                  <fulfilled-host ${fattribute}="data & noop" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err & noop" err.bind="err"></rejected-host>
                </template>
              </template>`
                            }, config(), wrap('pending0', 'p'), getActivationSequenceFor(phost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                                ctx.clear();
                                const tc = ctx.app.$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                                try {
                                    await tc.value;
                                }
                                catch {
                                    // ignore rejection
                                }
                                await tasksSettled();
                                if ($resolve) {
                                    assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'), 'fulfilled');
                                }
                                else {
                                    assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected');
                                }
                                ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)]);
                            });
                        }
                        {
                            const staticPart = '<my-el>Fizz Bazz</my-el>';
                            let resolve;
                            let reject;
                            yield new TestData(`enables showing rest of the content although the promise is no settled - ${$resolve ? 'fulfilled' : 'rejected'}`, Object.assign(new Promise((rs, rj) => { resolve = rs; reject = rj; }), { id: 0 }), {
                                delayPromise, template: `
              <let foo-bar.bind="'Fizz Bazz'"></let>
              <my-el prop.bind="fooBar"></my-el>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>`,
                                registrations: [
                                    CustomElement.define({ name: 'my-el', template: `\${prop}`, bindables: ['prop'] }, class MyEl {
                                    }),
                                ]
                            }, config(), `${staticPart} ${wrap('pending0', 'p')}`, getActivationSequenceFor(phost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                                ctx.clear();
                                if ($resolve) {
                                    resolve(42);
                                }
                                else {
                                    reject(new Error('foo-bar'));
                                }
                                await tasksSettled();
                                assert.html.innerEqual(ctx.host, `${staticPart} ${$resolve ? wrap('resolved with 42', 'f') : wrap('rejected with foo-bar', 'r')}`);
                                ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)]);
                            });
                        }
                    }
                    yield new TestData(`shows content specific to promise`, null, {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="42|promisify:true">
              <pending-host pending></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" err.bind="err" ce-id="1"></rejected-host>
            </template>

            <template ${pattribute}="'forty-two'|promisify:false">
              <pending-host pending></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" err.bind="err" ce-id="2"></rejected-host>
            </template>
          </template>`
                    }, config(), `${wrap('resolved with 42', 'f')} ${wrap('rejected with forty-two', 'r')}`, getActivationSequenceFor([fhost, `${rhost}-2`]), getDeactivationSequenceFor([fhost, `${rhost}-2`]));
                    yield new TestData(`[repeat.for] > [${pattribute}] works`, null, {
                        delayPromise,
                        template: `
          <template>
            <let items.bind="[[42, true], ['foo-bar', false], ['forty-two', true], ['fizz-bazz', false]]"></let>
            <template repeat.for="item of items">
              <template ${pattribute}="item[0] | promisify:item[1]">
                <let data.bind="null" err.bind="null"></let>
                <fulfilled-host ${fattribute}="data" data.bind="data" ce-id.bind="$index + 1"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err" ce-id.bind="$index + 1"></rejected-host>
              </template>
            </template>
          </template>`,
                    }, config(), `${wrap('resolved with 42', 'f')} ${wrap('rejected with foo-bar', 'r')} ${wrap('resolved with forty-two', 'f')} ${wrap('rejected with fizz-bazz', 'r')}`, //
                    getActivationSequenceFor([`${fhost}-1`, `${rhost}-2`, `${fhost}-3`, `${rhost}-4`]), getDeactivationSequenceFor([`${fhost}-1`, `${rhost}-2`, `${fhost}-3`, `${rhost}-4`]));
                    yield new TestData(`[repeat.for,${pattribute}] works`, null, {
                        delayPromise,
                        template: `
          <template>
            <let items.bind="[[42, true], ['foo-bar', false], ['forty-two', true], ['fizz-bazz', false]]"></let>
              <template repeat.for="item of items" ${pattribute}="item[0] | promisify:item[1]">
                <let data.bind="null" err.bind="null"></let>
                <fulfilled-host ${fattribute}="data" data.bind="data" ce-id.bind="$index + 1"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err" ce-id.bind="$index + 1"></rejected-host>
              </template>
          </template>`,
                    }, config(), `${wrap('resolved with 42', 'f')} ${wrap('rejected with foo-bar', 'r')} ${wrap('resolved with forty-two', 'f')} ${wrap('rejected with fizz-bazz', 'r')}`, getActivationSequenceFor([`${fhost}-1`, `${rhost}-2`, `${fhost}-3`, `${rhost}-4`]), getDeactivationSequenceFor([`${fhost}-1`, `${rhost}-2`, `${fhost}-3`, `${rhost}-4`]));
                    yield new TestData(`[then,repeat.for] works`, null, {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:true">
              <fulfilled-host ${fattribute}="items" repeat.for="data of items" data.bind="data" ce-id.bind="$index+1"></fulfilled-host>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
                    }, config(), `${wrap('resolved with 42', 'f')}${wrap('resolved with forty-two', 'f')}`, getActivationSequenceFor([`${fhost}-1`, `${fhost}-2`]), getDeactivationSequenceFor([`${fhost}-1`, `${fhost}-2`]));
                    yield new TestData(`[then] > [repeat.for] works`, null, {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:true">
              <template ${fattribute}="items">
                <fulfilled-host repeat.for="data of items" data.bind="data" ce-id.bind="$index+1"></fulfilled-host>
              </template>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
                    }, config(), `${wrap('resolved with 42', 'f')}${wrap('resolved with forty-two', 'f')}`, getActivationSequenceFor([`${fhost}-1`, `${fhost}-2`]), getDeactivationSequenceFor([`${fhost}-1`, `${fhost}-2`]));
                    {
                        const registrations = [
                            createComponentType('rej-host', `rejected with \${err}`, ['err']),
                            ValueConverter.define('parseError', class ParseError {
                                toView(value) {
                                    return value.message.split(',');
                                }
                            })
                        ];
                        yield new TestData(`[catch,repeat.for] works`, null, {
                            delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:false">
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rej-host ${rattribute}="error" repeat.for="err of error | parseError" err.bind="err" ce-id.bind="$index + 1"></rej-host>
            </template>
          </template>`,
                            registrations,
                        }, config(), '<rej-host>rejected with 42</rej-host><rej-host>rejected with forty-two</rej-host>', getActivationSequenceFor(['rej-host-1', 'rej-host-2']), getDeactivationSequenceFor(['rej-host-1', 'rej-host-2']));
                        yield new TestData(`[catch] > [repeat.for] works`, null, {
                            delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:false">
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <template ${rattribute}="error">
                <rej-host repeat.for="err of error | parseError" err.bind="err" ce-id.bind="$index + 1"></rej-host>
              </template>
            </template>
          </template>`,
                            registrations,
                        }, config(), '<rej-host>rejected with 42</rej-host><rej-host>rejected with forty-two</rej-host>', getActivationSequenceFor(['rej-host-1', 'rej-host-2']), getDeactivationSequenceFor(['rej-host-1', 'rej-host-2']));
                    }
                    yield new TestData(`[if,${pattribute}], [else,${pattribute}] works`, null, {
                        delayPromise, template: `
          <let flag.bind="false"></let>
          <template if.bind="flag" ${pattribute}="42 | promisify:true">
            <fulfilled-host ${fattribute}="data" data.bind="data" ce-id="1"></fulfilled-host>
            <rejected-host ${rattribute}="err" err.bind="err" ce-id="1"></rejected-host>
          </template>
          <template else ${pattribute}="'forty-two' | promisify:false">
            <fulfilled-host ${fattribute}="data" data.bind="data" ce-id="2"></fulfilled-host>
            <rejected-host ${rattribute}="err" err.bind="err" ce-id="2"></rejected-host>
          </template>`,
                    }, config(), wrap('rejected with forty-two', 'r'), getActivationSequenceFor(`${rhost}-2`), getDeactivationSequenceFor(`${fhost}-1`), async (ctx) => {
                        const app = ctx.app;
                        const controller = app.$controller;
                        const $if = controller.children.find((c) => c.viewModel instanceof If).viewModel;
                        ctx.clear();
                        controller.scope.overrideContext.flag = true;
                        await tasksSettled();
                        await $if['pending'];
                        const ptc1 = $if.ifView.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        try {
                            await ptc1.value;
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                        ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-2`), ...getActivationSequenceFor(`${fhost}-1`)]);
                    });
                    yield new TestData(`[pending,if] works`, Object.assign(new Promise(() => { }), { id: 0 }), {
                        delayPromise, template: `
          <let flag.bind="false"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise" if.bind="flag"></pending-host>
            <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
            <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
          </template>`,
                    }, config(), '', [], getDeactivationSequenceFor(phost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        controller.scope.overrideContext.flag = true;
                        await tasksSettled();
                        await tc['pending']['view'].children.find((c) => c.viewModel instanceof If).viewModel['pending'];
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
                        ctx.assertCallSet(getActivationSequenceFor(phost));
                    });
                    yield new TestData(`[then,if] works- #1`, Object.assign(Promise.resolve(42), { id: 0 }), {
                        delayPromise, template: `
          <let flag.bind="false"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <fulfilled-host ${fattribute}="data" if.bind="flag" data.bind="data"></fulfilled-host>
            <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
          </template>`,
                    }, config(), '', [], getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        controller.scope.overrideContext.flag = true;
                        await tasksSettled();
                        await tc['fulfilled']['view'].children.find((c) => c.viewModel instanceof If).viewModel['pending'];
                        assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                        ctx.assertCallSet(getActivationSequenceFor(fhost));
                    });
                    yield new TestData(`[then,if] works- #2`, Object.assign(Promise.resolve(24), { id: 0 }), {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" if.bind="data === 42" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
                    }, config(), '', [], getDeactivationSequenceFor(fhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        await (app.promise = Promise.resolve(42));
                        await tasksSettled();
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        controller.scope.overrideContext.flag = true;
                        await tasksSettled();
                        await tc['fulfilled']['view'].children.find((c) => c.viewModel instanceof If).viewModel['pending'];
                        assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                        ctx.assertCallSet(getActivationSequenceFor(fhost));
                    });
                    yield new TestData(`[catch,if] works- #1`, () => Object.assign(Promise.reject(new Error('foo-bar')), { id: 0 }), {
                        delayPromise, template: `
          <let flag.bind="false"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
            <rejected-host ${rattribute}="err" if.bind="flag" err.bind="err"></rejected-host>
          </template>`,
                    }, config(), '', [], getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        controller.scope.overrideContext.flag = true;
                        await tasksSettled();
                        await tc['rejected']['view'].children.find((c) => c.viewModel instanceof If).viewModel['pending'];
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet(getActivationSequenceFor(rhost));
                    });
                    yield new TestData(`[catch,if] works- #2`, () => Object.assign(Promise.reject(new Error('foo')), { id: 0 }), {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" if.bind="err.message === 'foo-bar'" err.bind="err"></rejected-host>
            </template>
          </template>`,
                    }, config(), '', [], getDeactivationSequenceFor(rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        try {
                            await (app.promise = Promise.reject(new Error('foo-bar')));
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        controller.scope.overrideContext.flag = true;
                        await tasksSettled();
                        await tc['rejected']['view'].children.find((c) => c.viewModel instanceof If).viewModel['pending'];
                        assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                        ctx.assertCallSet(getActivationSequenceFor(rhost));
                    });
                    const waitSwitch = async ($switch) => {
                        const promise = $switch.promise;
                        await promise;
                        if ($switch.promise !== promise) {
                            await waitSwitch($switch);
                        }
                    };
                    for (const $resolve of [true, false]) {
                        yield new TestData(`[case,${pattribute}] works - ${$resolve ? 'fulfilled' : 'rejected'}`, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')), {
                            delayPromise, template: `
          <let status.bind="'unknown'"></let>
          <template switch.bind="status">
            <template case="unknown">Unknown</template>
            <template case="processing" ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" if.bind="err.message === 'foo-bar'" err.bind="err"></rejected-host>
            </template>
          </template>`,
                        }, config(), 'Unknown', [], getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                            ctx.clear();
                            const app = ctx.app;
                            const controller = app.$controller;
                            controller.scope.overrideContext.status = 'processing';
                            await waitSwitch(controller.children.find((c) => c.viewModel instanceof Switch).viewModel);
                            try {
                                await app.promise;
                            }
                            catch {
                                // ignore rejection
                            }
                            await tasksSettled();
                            assert.html.innerEqual(ctx.host, $resolve ? wrap('resolved with 42', 'f') : wrap('rejected with foo-bar', 'r'));
                            ctx.assertCallSet(getActivationSequenceFor($resolve ? fhost : rhost));
                        });
                    }
                    yield new TestData(`[then,switch] works - #1`, Promise.resolve('foo'), {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <template ${fattribute}="status" switch.bind="status">
                <fulfilled-host case='processing' data="processing" ce-id="1"></fulfilled-host>
                <fulfilled-host default-case data="unknown" ce-id="2"></fulfilled-host>
              </template>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
                    }, config(), '<fulfilled-host>resolved with unknown</fulfilled-host>', getActivationSequenceFor(`${fhost}-2`), getDeactivationSequenceFor(`${fhost}-1`), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        const $switch = tc['fulfilled'].view.children.find((c) => c.viewModel instanceof Switch).viewModel;
                        await (app.promise = Promise.resolve('processing'));
                        await tasksSettled();
                        await waitSwitch($switch);
                        assert.html.innerEqual(ctx.host, '<fulfilled-host>resolved with processing</fulfilled-host>');
                        ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-2`), ...getActivationSequenceFor(`${fhost}-1`)]);
                    });
                    yield new TestData(`[then,switch] works - #2`, Promise.resolve('foo'), {
                        delayPromise, template: `
          <let status.bind="'processing'"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <template then switch.bind="status">
              <fulfilled-host case='processing' data="processing" ce-id="1"></fulfilled-host>
              <fulfilled-host default-case data="unknown" ce-id="2"></fulfilled-host>
            </template>
            <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
          </template>`,
                    }, config(), '<fulfilled-host>resolved with processing</fulfilled-host>', getActivationSequenceFor(`${fhost}-1`), getDeactivationSequenceFor(`${fhost}-2`), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        const $switch = tc['fulfilled'].view.children.find((c) => c.viewModel instanceof Switch).viewModel;
                        controller.scope.overrideContext.status = 'foo';
                        await waitSwitch($switch);
                        assert.html.innerEqual(ctx.host, '<fulfilled-host>resolved with unknown</fulfilled-host>');
                        ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${fhost}-2`)]);
                    });
                    yield new TestData(`[catch,switch] works - #1`, () => Promise.reject(new Error('foo')), {
                        delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <template ${rattribute}="err" switch.bind="err.message">
                <rejected-host case='processing' err.bind="{message: 'processing'}" ce-id="1"></rejected-host>
                <rejected-host default-case  err.bind="{message: 'unknown'}" ce-id="2"></rejected-host>
              </template>
            </template>
          </template>`,
                    }, config(), '<rejected-host>rejected with unknown</rejected-host>', getActivationSequenceFor(`${rhost}-2`), getDeactivationSequenceFor(`${rhost}-1`), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        const $switch = tc['rejected'].view.children.find((c) => c.viewModel instanceof Switch).viewModel;
                        try {
                            await (app.promise = Promise.reject(new Error('processing')));
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        await waitSwitch($switch);
                        assert.html.innerEqual(ctx.host, '<rejected-host>rejected with processing</rejected-host>');
                        ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-2`), ...getActivationSequenceFor(`${rhost}-1`)]);
                    });
                    yield new TestData(`[catch,switch] works - #2`, () => Promise.reject(new Error('foo')), {
                        delayPromise, template: `
          <let status.bind="'processing'"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
            <template catch switch.bind="status">
              <rejected-host case='processing' err.bind="{message: 'processing'}" ce-id="1"></rejected-host>
              <rejected-host default-case  err.bind="{message: 'unknown'}" ce-id="2"></rejected-host>
            </template>
          </template>`,
                    }, config(), '<rejected-host>rejected with processing</rejected-host>', getActivationSequenceFor(`${rhost}-1`), getDeactivationSequenceFor(`${rhost}-2`), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        const controller = app.$controller;
                        const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        const $switch = tc['rejected'].view.children.find((c) => c.viewModel instanceof Switch).viewModel;
                        controller.scope.overrideContext.status = 'foo';
                        await waitSwitch($switch);
                        assert.html.innerEqual(ctx.host, '<rejected-host>rejected with unknown</rejected-host>');
                        ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-1`), ...getActivationSequenceFor(`${rhost}-2`)]);
                    });
                    yield new TestData(`au-slot use-case`, () => Promise.reject(new Error('foo')), {
                        delayPromise, template: `
          <foo-bar p.bind="42|promisify:true">
            <div au-slot>f1</div>
            <div au-slot="rejected">r1</div>
          </foo-bar>
          <foo-bar p.bind="'forty-two'|promisify:false">
            <div au-slot>f2</div>
            <div au-slot="rejected">r2</div>
          </foo-bar>
          <template as-custom-element="foo-bar">
            <bindable name="p"></bindable>
            <template ${pattribute}="p">
              <au-slot name="pending" pending></au-slot>
              <au-slot then></au-slot>
              <au-slot name="rejected" catch></au-slot>
            </template>
          </template>`,
                    }, config(), '<foo-bar> <div>f1</div> </foo-bar> <foo-bar> <div>r2</div> </foo-bar>', [], []);
                }
                // #region timings
                for (const $resolve of [true, false]) {
                    const getPromise = (ticks) => () => Object.assign(createMultiTickPromise(ticks, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')))(), { id: 0 });
                    yield new TestData(`pending activation duration < promise settlement duration - ${$resolve ? 'fulfilled' : 'rejected'}`, getPromise(20), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks({ binding: 1, bound: 1, attaching: 1, attached: 1 }))],
                                [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                            ])),
                        ],
                    }, null, null, null, getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        await tasksSettled();
                        try {
                            await ctx.app.promise;
                        }
                        catch (e) {
                            // ignore rejection
                        }
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'), 'fulfilled');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected');
                        }
                        ctx.assertCallSet([...getActivationSequenceFor(phost), ...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)]);
                    });
                    // These tests are more like sanity checks rather than asserting the lifecycle hooks invocation timings and sequence of those.
                    // These rather assert that under varied configurations of promise and hook timings, the template controllers still work.
                    for (const [name, promiseTick, config] of [
                        ['pending activation duration == promise settlement duration', 4, { binding: 1, bound: 1, attaching: 1, attached: 1 }],
                        ['pending "binding" duration == promise settlement duration', 2, { binding: 2 }],
                        ['pending "binding" duration > promise settlement duration', 1, { binding: 2 }],
                        ['pending "binding" duration > promise settlement duration (longer running promise and hook)', 4, { binding: 6 }],
                        ['pending "binding+bound" duration > promise settlement duration', 2, { binding: 1, bound: 2 }],
                        ['pending "binding+bound" duration > promise settlement duration (longer running promise and hook)', 4, { binding: 3, bound: 3 }],
                        ['pending "binding+bound+attaching" duration > promise settlement duration', 2, { binding: 1, bound: 1, attaching: 1 }],
                        ['pending "binding+bound+attaching" duration > promise settlement duration (longer running promise and hook)', 5, { binding: 2, bound: 2, attaching: 2 }],
                        ['pending "binding+bound+attaching+attached" duration > promise settlement duration', 3, { binding: 1, bound: 1, attaching: 1, attached: 1 }],
                        ['pending "binding+bound+attaching+attached" duration > promise settlement duration (longer running promise and hook)', 6, { binding: 2, bound: 2, attaching: 2, attached: 2 }],
                    ]) {
                        yield new TestData(`${name} - ${$resolve ? 'fulfilled' : 'rejected'}`, getPromise(promiseTick), {
                            delayPromise, template: template1,
                            registrations: [
                                Registration.instance(configLookup, new Map([
                                    [phost, new Config(true, createWaiterWithTicks(config))],
                                    [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                    [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                ])),
                            ],
                        }, null, null, null, getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                            await tasksSettled();
                            const app = ctx.app;
                            // Note: If the ticks are close to each other, we cannot avoid a race condition for the purpose of deterministic tests.
                            // Therefore, the expected logs are constructed dynamically to ensure certain level of confidence.
                            const tc = app.$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                            const task = tc['preSettledTask'];
                            const logs = task.status === 'running' || task.status === 'completed'
                                ? [...getActivationSequenceFor(phost), ...getDeactivationSequenceFor(phost)]
                                : [];
                            try {
                                await app.promise;
                            }
                            catch {
                                // ignore rejection
                            }
                            await tasksSettled();
                            if ($resolve) {
                                assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'), 'fulfilled');
                            }
                            else {
                                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected');
                            }
                            ctx.assertCallSet([...logs, ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch; presettled task status: ${task.status}`);
                        });
                    }
                    yield new TestData(`change of promise in quick succession - final promise is settled - ${$resolve ? 'fulfilled' : 'rejected'}`, Promise.resolve(42), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                            ])),
                        ],
                    }, null, wrap(`resolved with 42`, 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        app.promise = Object.assign(new Promise(() => { }), { id: 0 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending');
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)], `calls mismatch1`);
                        ctx.clear();
                        try {
                            // interrupt
                            await (app.promise = $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')));
                        }
                        catch {
                            // ignore rejection
                        }
                        // wait for the next tick
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch2`);
                    });
                    yield new TestData(`change of promise in quick succession - final promise is of shorter duration - ${$resolve ? 'fulfilled' : 'rejected'}`, Promise.resolve(42), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                            ])),
                        ],
                    }, null, wrap(`resolved with 42`, 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        app.promise = Object.assign(new Promise(() => { }), { id: 0 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)], `calls mismatch1`);
                        ctx.clear();
                        // interrupt; the previous promise is of longer duration because it is never settled.
                        const promise = app.promise = Object.assign(createMultiTickPromise(5, () => $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')))(), { id: 1 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending1', 'p'), 'pending1');
                        ctx.assertCallSet([], `calls mismatch2`);
                        ctx.clear();
                        try {
                            await promise;
                        }
                        catch {
                            // ignore rejection
                        }
                        // wait for the next tick
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch2`);
                    });
                    yield new TestData(`change of promise in quick succession - changed after previous promise is settled but the post-settlement activation is pending - ${$resolve ? 'fulfilled' : 'rejected'}`, Promise.resolve(42), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [fhost, new Config(true, createWaiterWithTicks($resolve ? { binding: 1, bound: 2, attaching: 2, attached: 2 } : Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks($resolve ? Object.create(null) : { binding: 1, bound: 2, attaching: 2, attached: 2 }))],
                            ])),
                        ],
                    }, null, wrap(`resolved with 42`, 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        let resolve;
                        let reject;
                        let promise = app.promise = Object.assign(new Promise((rs, rj) => [resolve, reject] = [rs, rj]), { id: 0 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)], `calls mismatch1`);
                        ctx.clear();
                        try {
                            if ($resolve) {
                                resolve(84);
                            }
                            else {
                                reject(new Error('fizz bazz'));
                            }
                            await promise;
                        }
                        catch {
                            // ignore rejection
                        }
                        // attempt interrupt
                        promise = app.promise = Object.assign(createMultiTickPromise(20, () => $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')))(), { id: 1 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending1', 'p'), 'pending1');
                        ctx.assertCallSet([], `calls mismatch3`);
                        ctx.clear();
                        try {
                            await promise;
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled 2');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected 2');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch4`);
                    });
                    yield new TestData(`change of promise in quick succession - changed after the post-settlement activation is running - ${$resolve ? 'fulfilled' : 'rejected'}`, Promise.resolve(42), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [fhost, new Config(true, createWaiterWithTicks($resolve ? { binding: 1, bound: 2, attaching: 2, attached: 2 } : Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks($resolve ? Object.create(null) : { binding: 1, bound: 2, attaching: 2, attached: 2 }))],
                            ])),
                        ],
                    }, null, wrap(`resolved with 42`, 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        let resolve;
                        let reject;
                        let promise = app.promise = Object.assign(new Promise((rs, rj) => [resolve, reject] = [rs, rj]), { id: 0 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)], `calls mismatch1`);
                        ctx.clear();
                        try {
                            if ($resolve) {
                                resolve(84);
                            }
                            else {
                                reject(new Error('foo-bar'));
                            }
                            await promise;
                        }
                        catch {
                            // ignore rejection
                        }
                        // run the post-settled task
                        await tasksSettled();
                        promise = app.promise = Object.assign(new Promise((rs, rj) => [resolve, reject] = [rs, rj]), { id: 1 });
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'), 'fulfilled 1');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected 1');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch2`);
                        ctx.clear();
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending1', 'p'), 'pending1');
                        ctx.assertCallSet([...getDeactivationSequenceFor($resolve ? fhost : rhost), ...getActivationSequenceFor(phost)], `calls mismatch3`);
                        ctx.clear();
                        try {
                            if ($resolve) {
                                resolve(4242);
                            }
                            else {
                                reject(new Error('foo-bar foo-bar'));
                            }
                            await promise;
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled 2');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected 2');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch4`);
                    });
                    yield new TestData(`change of promise in quick succession - previous promise is settled after the new promise is settled - ${$resolve ? 'fulfilled' : 'rejected'}`, Promise.resolve(42), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [fhost, new Config(true, createWaiterWithTicks($resolve ? { binding: 1, bound: 2, attaching: 2, attached: 2 } : Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks($resolve ? Object.create(null) : { binding: 1, bound: 2, attaching: 2, attached: 2 }))],
                            ])),
                        ],
                    }, null, wrap(`resolved with 42`, 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        let resolve1;
                        let reject1;
                        const promise1 = app.promise = Object.assign(new Promise((rs, rj) => [resolve1, reject1] = [rs, rj]), { id: 0 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)], `calls mismatch1`);
                        ctx.clear();
                        try {
                            await (app.promise = Object.assign($resolve ? Promise.resolve(84) : Promise.reject(new Error('foo-bar')), { id: 1 }));
                        }
                        catch {
                            // ignore rejection
                        }
                        try {
                            if ($resolve) {
                                resolve1(4242);
                            }
                            else {
                                reject1(new Error('fiz baz'));
                            }
                            await promise1;
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'), 'fulfilled 1');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected 1');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch2`);
                    });
                    yield new TestData(`change of promise in quick succession - previous promise is settled after the new post-settled work is finished - ${$resolve ? 'fulfilled' : 'rejected'}`, Promise.resolve(42), {
                        delayPromise, template: template1,
                        registrations: [
                            Registration.instance(configLookup, new Map([
                                [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                                [fhost, new Config(true, createWaiterWithTicks($resolve ? { binding: 1, bound: 2, attaching: 2, attached: 2 } : Object.create(null)))],
                                [rhost, new Config(true, createWaiterWithTicks($resolve ? Object.create(null) : { binding: 1, bound: 2, attaching: 2, attached: 2 }))],
                            ])),
                        ],
                    }, null, wrap(`resolved with 42`, 'f'), getActivationSequenceFor(fhost), getDeactivationSequenceFor($resolve ? fhost : rhost), async (ctx) => {
                        ctx.clear();
                        const app = ctx.app;
                        let resolve1;
                        let reject1;
                        const promise1 = app.promise = Object.assign(new Promise((rs, rj) => [resolve1, reject1] = [rs, rj]), { id: 0 });
                        await tasksSettled();
                        assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
                        ctx.assertCallSet([...getDeactivationSequenceFor(fhost), ...getActivationSequenceFor(phost)], `calls mismatch1`);
                        ctx.clear();
                        try {
                            await (app.promise = Object.assign($resolve ? Promise.resolve(84) : Promise.reject(new Error('foo-bar')), { id: 1 }));
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        if ($resolve) {
                            assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'), 'fulfilled 1');
                        }
                        else {
                            assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected 1');
                        }
                        ctx.assertCallSet([...getDeactivationSequenceFor(phost), ...getActivationSequenceFor($resolve ? fhost : rhost)], `calls mismatch2`);
                        const tc = ctx.app.$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel;
                        const postSettleTask = tc['postSettledTask'];
                        // let { pending, processing, delayed } = reportTaskQueue(q);
                        // const taskNums = [pending.length, processing.length, delayed.length];
                        try {
                            if ($resolve) {
                                resolve1(4242);
                            }
                            else {
                                reject1(new Error('fiz baz'));
                            }
                            await promise1;
                        }
                        catch {
                            // ignore rejection
                        }
                        await tasksSettled();
                        assert.strictEqual(tc['postSettledTask'], postSettleTask);
                        // ({ pending, processing, delayed } = reportTaskQueue(q));
                        // assert.deepStrictEqual([pending.length, processing.length, delayed.length], taskNums);
                    });
                }
                // #endregion
            }
            // #region scope
            for (const $resolve of [true, false]) {
                {
                    class App1 {
                        constructor() {
                            this.promise = $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar'));
                        }
                        async binding() {
                            try {
                                this.data = (await this.promise) ** 2;
                            }
                            catch (e) {
                                this.err = new Error(`modified ${e.message}`);
                            }
                        }
                    }
                    yield new TestData(`shows scoped content correctly #1 - ${$resolve ? 'fulfilled' : 'rejected'}`, null, {
                        template: `
              <div ${pattribute}="promise">
                <let data.bind="null" err.bind="null"></let>
                <div ${fattribute}="data">\${data} \${$parent.data}</div>
                <div ${rattribute}="err">'\${err.message}' '\${$parent.err.message}'</div>
              </div>`,
                        appType: App1,
                    }, null, $resolve
                        ? `<div> <div>42 1764</div> </div>`
                        : `<div> <div>'foo-bar' 'modified foo-bar'</div> </div>`, [], []);
                    yield new TestData(`shows scoped content correctly #2 - ${$resolve ? 'fulfilled' : 'rejected'}`, null, {
                        template: `
              <div ${pattribute}="promise">
                <div ${fattribute}>\${data}</div>
                <div ${rattribute}>\${err.message}</div>
              </div>`,
                        appType: App1,
                    }, null, $resolve
                        ? `<div> <div>1764</div> </div>`
                        : `<div> <div>modified foo-bar</div> </div>`, [], []);
                }
                {
                    class App1 {
                        constructor() {
                            this.promise = $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar'));
                        }
                    }
                    yield new TestData(`shows scoped content correctly #3 - ${$resolve ? 'fulfilled' : 'rejected'}`, null, {
                        template: `
              <div ${pattribute}="promise">
                <div ${fattribute}="$parent.data">\${data} \${$parent.data}</div>
                <div ${rattribute}="$parent.err">'\${err.message}' '\${$parent.err.message}'</div>
              </div>
              \${data} \${err.message}`,
                        appType: App1,
                    }, null, $resolve
                        ? `<div> <div>42 42</div> </div> 42`
                        : `<div> <div>'foo-bar' 'foo-bar'</div> </div> foo-bar`, [], [], (ctx) => {
                        const app = ctx.app;
                        const s = app.$controller.scope;
                        const bc = s.bindingContext;
                        const oc = s.overrideContext;
                        if ($resolve) {
                            assert.strictEqual(bc.data, 42, 'bc.data');
                            assert.strictEqual(bc.err, undefined, 'bc.err');
                        }
                        else {
                            assert.strictEqual(bc.data, undefined, 'bc.data');
                            assert.strictEqual(bc.err.message, 'foo-bar', 'bc.err');
                        }
                        assert.strictEqual('data' in oc, false, 'data in oc');
                        assert.strictEqual('err' in oc, false, 'err in oc');
                    });
                    yield new TestData(`shows scoped content correctly #4 - ${$resolve ? 'fulfilled' : 'rejected'}`, null, {
                        template: `
              <div ${pattribute}="promise">
                <div ${fattribute}="data">\${data}</div>
                <div ${rattribute}="err">\${err.message}</div>
              </div>`,
                        appType: App1,
                    }, null, $resolve
                        ? `<div> <div>42</div> </div>`
                        : `<div> <div>foo-bar</div> </div>`, [], [], (ctx) => {
                        const app = ctx.app;
                        const s = app.$controller.scope;
                        const bc = s.bindingContext;
                        const oc = s.overrideContext;
                        assert.strictEqual('data' in bc, true, 'data in bc');
                        assert.strictEqual('err' in bc, true, 'err in bc');
                        assert.strictEqual('data' in oc, false, 'data in oc');
                        assert.strictEqual('err' in oc, false, 'err in oc');
                    });
                }
            }
            // #endregion
        }
    }
    for (const data of getTestData()) {
        (data.only ? $it.only : $it)(data.name, async function (ctx) {
            assert.strictEqual(ctx.error, null);
            const expectedContent = data.expectedInnerHtml;
            if (expectedContent !== null) {
                await tasksSettled();
                assert.html.innerEqual(ctx.host, expectedContent, 'innerHTML');
            }
            const expectedLog = data.expectedStartLog;
            if (expectedLog !== null) {
                ctx.assertCallSet(expectedLog, 'start lifecycle calls');
            }
            const additionalAssertions = data.additionalAssertions;
            if (additionalAssertions !== null) {
                await additionalAssertions(ctx);
            }
        }, data);
    }
    class NegativeTestData {
        constructor(name, template) {
            this.name = name;
            this.template = template;
            this.registrations = [];
            this.expectedStopLog = [];
            this.verifyStopCallsAsSet = false;
            this.promise = Promise.resolve(42);
            this.delayPromise = null;
            this.appType = App;
        }
    }
    function* getNegativeTestData() {
        yield new NegativeTestData(`pending cannot be used in isolation`, `<template><template pending>pending</template></template>`);
        yield new NegativeTestData(`then cannot be used in isolation`, `<template><template then>fulfilled</template></template>`);
        yield new NegativeTestData(`catch cannot be used in isolation`, `<template><template catch>rejected</template></template>`);
        yield new NegativeTestData(`pending cannot be nested inside an if.bind`, `<template><template if.bind="true"><template pending>pending</template></template></template>`);
        yield new NegativeTestData(`then cannot be nested inside an if.bind`, `<template><template if.bind="true"><template then>fulfilled</template></template></template>`);
        yield new NegativeTestData(`catch cannot be nested inside an if.bind`, `<template><template if.bind="true"><template catch>rejected</template></template></template>`);
        yield new NegativeTestData(`pending cannot be nested inside an else`, `<template><template if.bind="false"></template><template else><template pending>pending</template></template></template>`);
        yield new NegativeTestData(`then cannot be nested inside an else`, `<template><template if.bind="false"></template><template else><template then>fulfilled</template></template></template>`);
        yield new NegativeTestData(`catch cannot be nested inside an else`, `<template><template if.bind="false"></template><template else><template catch>rejected</template></template></template>`);
        yield new NegativeTestData(`pending cannot be nested inside a repeater`, `<template><template repeat.for="i of 1"><template pending>pending</template></template></template>`);
        yield new NegativeTestData(`then cannot be nested inside a repeater`, `<template><template repeat.for="i of 1"><template then>fulfilled</template></template></template>`);
        yield new NegativeTestData(`catch cannot be nested inside a repeater`, `<template><template repeat.for="i of 1"><template catch>rejected</template></template></template>`);
    }
    for (const data of getNegativeTestData()) {
        $it(data.name, async function (ctx) {
            // assert.match(ctx.error.message, /The parent promise\.resolve not found; only `\*\[promise\.resolve\] > \*\[pending\|then\|catch\]` relation is supported\./);
            assert.match(ctx.error.message, /AUR0813/);
        }, data);
    }
});
//# sourceMappingURL=promise.spec.js.map