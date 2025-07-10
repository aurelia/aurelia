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
import { DI, ILogger, LoggerConfiguration, LogLevel, pascalCase, Registration, resolve, sink, } from '@aurelia/kernel';
import { tasksSettled, } from '@aurelia/runtime';
import { bindingBehavior, customElement, CustomElement, Switch, Aurelia, IPlatform, bindable, INode, valueConverter, } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext, } from '@aurelia/testing';
import { createSpecFunction, } from '../util.js';
describe('3-runtime-html/switch.spec.ts', function () {
    let Status;
    (function (Status) {
        Status["unknown"] = "unknown";
        Status["received"] = "received";
        Status["processing"] = "processing";
        Status["dispatched"] = "dispatched";
        Status["delivered"] = "delivered";
    })(Status || (Status = {}));
    let StatusNum;
    (function (StatusNum) {
        StatusNum[StatusNum["unknown"] = 0] = "unknown";
        StatusNum[StatusNum["received"] = 1] = "received";
        StatusNum[StatusNum["processing"] = 2] = "processing";
        StatusNum[StatusNum["dispatched"] = 3] = "dispatched";
        StatusNum[StatusNum["delivered"] = 4] = "delivered";
    })(StatusNum || (StatusNum = {}));
    const InitialStatus = DI.createInterface('InitialStatus');
    const InitialStatusNum = DI.createInterface('InitialStatusNum');
    class Config {
        constructor(hasPromise, hasTimeout, wait) {
            this.hasPromise = hasPromise;
            this.hasTimeout = hasTimeout;
            this.wait = wait;
        }
        toString() {
            return `{${this.hasPromise ? this.wait.toString() : 'noWait'}}`;
        }
    }
    const IConfig = DI.createInterface('Config', x => x.singleton(Config));
    function createComponentType(name, template, bindables = []) {
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
                    this.config = (__runInitializers(this, _ceId_extraInitializers), resolve(IConfig));
                    this.$logger = resolve(ILogger);
                    const node = resolve(INode);
                    const ceId = node.dataset.ceId;
                    if (ceId) {
                        (this.logger = resolve(ILogger).scopeTo(`${name}-${ceId}`)).debug('ctor');
                        delete node.dataset.ceId;
                    }
                }
                async binding() {
                    this.logger ??= this.ceId === null ? this.$logger.scopeTo(name) : this.$logger.scopeTo(`${name}-${this.ceId}`);
                    if (this.config.hasPromise) {
                        await this.config.wait();
                    }
                    this.logger.debug('binding');
                }
                async bound() {
                    if (this.config.hasPromise) {
                        await this.config.wait();
                    }
                    this.logger.debug('bound');
                }
                async attaching() {
                    if (this.config.hasPromise) {
                        await this.config.wait();
                    }
                    this.logger.debug('attaching');
                }
                async attached() {
                    if (this.config.hasPromise) {
                        await this.config.wait();
                    }
                    this.logger.debug('attached');
                }
                async detaching() {
                    if (this.config.hasPromise) {
                        await this.config.wait();
                    }
                    this.logger.debug('detaching');
                }
                async unbinding() {
                    if (this.config.hasPromise) {
                        await this.config.wait();
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
                this.log.push(`${event.scope.join('.')}.${event.message}`);
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
    class SwitchTestExecutionContext {
        constructor(ctx, container, host, app, controller, error) {
            this.ctx = ctx;
            this.container = container;
            this.host = host;
            this.app = app;
            this.controller = controller;
            this.error = error;
            this.changeId = 0;
            this._log = container.get(ILogger).sinks.find((s) => s instanceof DebugLog);
        }
        get platform() { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
        get log() {
            return this._log.log;
        }
        getSwitches(controller = this.controller) {
            return controller.children
                .reduce((acc, c) => {
                const vm = c.viewModel;
                if (vm instanceof Switch) {
                    acc.push(vm);
                }
                return acc;
            }, []);
        }
        clear() {
            this._log.clear();
        }
        async wait($switch) {
            const promise = $switch.promise;
            await promise;
            if ($switch.promise !== promise) {
                await this.wait($switch);
            }
        }
        assertCalls(expected, message = '') {
            assert.deepStrictEqual(this.log, this.transformCalls(expected), message);
        }
        assertCallSet(expected, message = '') {
            expected = this.transformCalls(expected);
            const actual = this.log;
            assert.strictEqual(actual.length, expected.length, `${message} - calls.length`);
            assert.strictEqual(actual.filter((c) => !expected.includes(c)).length, 0, `${message} - calls set equality \n actual:\t${actual} \n expected:\t ${expected}`);
        }
        async assertChange($switch, act, expectedHtml, expectedLog) {
            this.clear();
            act();
            await this.wait($switch);
            const change = `change${++this.changeId}`;
            assert.html.innerEqual(this.host, expectedHtml, `${change} innerHTML`);
            this.assertCalls(expectedLog, change);
        }
        transformCalls(calls) {
            let cases;
            const getCases = () => cases ?? (cases = this.getSwitches().flatMap((s) => s['cases']));
            return calls.map((item) => typeof item === 'string' ? item : `Case-#${getCases()[item - 1].id}.isMatch()`);
        }
    }
    async function testSwitch(testFunction, { template, registrations = [], initialStatus = "unknown" /* Status.unknown */, initialStatusNum = 0 /* StatusNum.unknown */, expectedStopLog, verifyStopCallsAsSet = false, } = {}) {
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
                .register(LoggerConfiguration.create({ level: LogLevel.trace, sinks: [DebugLog] }), ...registrations, Registration.instance(InitialStatus, initialStatus), Registration.instance(InitialStatusNum, initialStatusNum), ToStatusStringValueConverter, NoopBindingBehavior)
                .app({
                host,
                component: CustomElement.define({ name: 'app', template }, App)
            })
                .start();
            app = au.root.controller.viewModel;
            controller = au.root.controller;
        }
        catch (e) {
            error = e;
        }
        const testCtx = new SwitchTestExecutionContext(ctx, container, host, app, controller, error);
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
    const $it = createSpecFunction(testSwitch);
    let ToStatusStringValueConverter = (() => {
        let _classDecorators = [valueConverter('toStatusString')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        var ToStatusStringValueConverter = _classThis = class {
            toView(value) {
                switch (value) {
                    case 1 /* StatusNum.received */:
                        return "received" /* Status.received */;
                    case 2 /* StatusNum.processing */:
                        return "processing" /* Status.processing */;
                    case 3 /* StatusNum.dispatched */:
                        return "dispatched" /* Status.dispatched */;
                    case 4 /* StatusNum.delivered */:
                        return "delivered" /* Status.delivered */;
                    case 0 /* StatusNum.unknown */:
                        return "unknown" /* Status.unknown */;
                }
            }
        };
        __setFunctionName(_classThis, "ToStatusStringValueConverter");
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ToStatusStringValueConverter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        return ToStatusStringValueConverter = _classThis;
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
            this.status1 = "received" /* Status.received */;
            this.status2 = "processing" /* Status.processing */;
            this.statuses = ["received" /* Status.received */, "processing" /* Status.processing */];
            this.status = resolve(InitialStatus);
            this.statusNum = resolve(InitialStatusNum);
        }
    }
    function getActivationSequenceFor(name, withCtor = false) {
        return typeof name === 'string'
            ? [...(withCtor ? [`${name}.ctor`] : []), `${name}.binding`, `${name}.bound`, `${name}.attaching`, `${name}.attached`]
            : [...(withCtor ? ['ctor'] : []), 'binding', 'bound', 'attaching', 'attached'].flatMap(x => name.map(n => `${n}.${x}`));
    }
    function getDeactivationSequenceFor(name) {
        return typeof name === 'string'
            ? [`${name}.detaching`, `${name}.unbinding`]
            : ['detaching', 'unbinding'].flatMap(x => name.map(n => `${n}.${x}`));
    }
    class TestData {
        constructor(name, { initialStatus = "unknown" /* Status.unknown */, initialStatusNum = 0 /* StatusNum.unknown */, registrations = [], template, verifyStopCallsAsSet = false, }, config = null, expectedInnerHtml = '', expectedStartLog, expectedStopLog, additionalAssertions = null, only = false) {
            this.name = name;
            this.config = config;
            this.expectedInnerHtml = expectedInnerHtml;
            this.expectedStartLog = expectedStartLog;
            this.expectedStopLog = expectedStopLog;
            this.additionalAssertions = additionalAssertions;
            this.only = only;
            this.initialStatus = initialStatus;
            this.initialStatusNum = initialStatusNum;
            this.registrations = [
                Registration.instance(Config, config),
                createComponentType('case-host', '<au-slot>'),
                createComponentType('default-case-host', '<au-slot>'),
                ...registrations,
            ];
            this.template = template;
            this.verifyStopCallsAsSet = verifyStopCallsAsSet;
        }
    }
    function createWaiter(ms) {
        function wait() {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, ms);
            });
        }
        wait.toString = function () {
            return `setTimeout(cb,${ms})`;
        };
        return wait;
    }
    function noop() {
        return;
    }
    noop.toString = function () {
        return 'Promise.resolve()';
    };
    const configFactories = [
        function () {
            return new Config(false, false, noop);
        },
        function () {
            return new Config(true, false, noop);
        },
        function () {
            return new Config(true, true, createWaiter(0));
        },
        function () {
            return new Config(true, true, createWaiter(5));
        },
    ];
    function* getTestData() {
        function wrap(content, isDefault = false) {
            const host = isDefault ? 'default-case-host' : 'case-host';
            return `<${host}>${content}</${host}>`;
        }
        for (const config of configFactories) {
            const MyEcho = createComponentType('my-echo', `Echoed '\${message}'`, ['message']);
            yield new TestData('works for simple switch-case', {
                initialStatus: "processing" /* Status.processing */,
                template: `
          <template>
            <template switch.bind="status">
              <case-host case="received"   ce-id="1">Order received.</case-host>
              <case-host case="dispatched" ce-id="2">On the way.</case-host>
              <case-host case="processing" ce-id="3">Processing your order.</case-host>
              <case-host case="delivered"  ce-id="4">Delivered.</case-host>
            </template>
          </template>`,
            }, config(), wrap('Processing your order.'), [1, 2, 3, ...getActivationSequenceFor('case-host-3')], getDeactivationSequenceFor('case-host-3'));
            yield new TestData('reacts to switch value change + deferred view-instantiation assertion', {
                initialStatus: "dispatched" /* Status.dispatched */,
                template: `
          <template>
            <template switch.bind="status">
              <case-host case="received"   data-ce-id="1">Order received.</case-host>
              <case-host case="dispatched" data-ce-id="2">On the way.</case-host>
              <case-host case="processing" data-ce-id="3">Processing your order.</case-host>
              <case-host case="delivered"  data-ce-id="4">Delivered.</case-host>
            </template>
          </template>`
            }, config(), wrap('On the way.'), [1, 2, ...getActivationSequenceFor('case-host-2', true)], getDeactivationSequenceFor('case-host-2'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "delivered" /* Status.delivered */; }, wrap('Delivered.'), [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-4', true)]);
                await ctx.assertChange($switch, () => { ctx.app.status = "unknown" /* Status.unknown */; }, '', [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-4')]);
                await ctx.assertChange($switch, () => { ctx.app.status = "received" /* Status.received */; }, wrap('Order received.'), [1, ...getActivationSequenceFor('case-host-1', true)]);
                await ctx.assertChange($switch, () => { ctx.app.status = "dispatched" /* Status.dispatched */; }, wrap('On the way.'), [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]);
            });
            const templateWithDefaultCase = `
    <template>
      <template switch.bind="status">
        <case-host case="received"   ce-id="1">Order received.</case-host>
        <case-host case="dispatched" ce-id="2">On the way.</case-host>
        <case-host case="processing" ce-id="3">Processing your order.</case-host>
        <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Not found.</default-case-host>
      </template>
    </template>`;
            yield new TestData('supports default-case', {
                initialStatus: "unknown" /* Status.unknown */,
                template: templateWithDefaultCase
            }, config(), wrap('Not found.', true), [1, 2, 3, 4, ...getActivationSequenceFor('default-case-host-1')], getDeactivationSequenceFor('default-case-host-1'));
            yield new TestData('reacts to switch value change - default case', {
                initialStatus: "dispatched" /* Status.dispatched */,
                template: templateWithDefaultCase,
            }, config(), wrap('On the way.'), [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-4'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "unknown" /* Status.unknown */; }, wrap('Not found.', true), [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('default-case-host-1')]);
                await ctx.assertChange($switch, () => { ctx.app.status = "delivered" /* Status.delivered */; }, wrap('Delivered.'), [1, 2, 3, 4, ...getDeactivationSequenceFor('default-case-host-1'), ...getActivationSequenceFor('case-host-4')]);
            });
            yield new TestData('supports case.bind - #1', {
                initialStatus: "processing" /* Status.processing */,
                template: `
    <template>
      <template switch.bind="true">
        <case-host case.bind="status === 'received'"   ce-id="1">Order received.</case-host>
        <case-host case.bind="status === 'processing'" ce-id="2">Processing your order.</case-host>
        <case-host case.bind="status === 'dispatched'" ce-id="3">On the way.</case-host>
        <case-host case.bind="status === 'delivered'"  ce-id="4">Delivered.</case-host>
      </template>
    </template>`,
            }, config(), wrap('Processing your order.'), [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-3'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "dispatched" /* Status.dispatched */; }, wrap('On the way.'), [2, ...getDeactivationSequenceFor('case-host-2'), 3, ...getActivationSequenceFor('case-host-3')]);
            });
            yield new TestData('supports case.bind - #2', {
                initialStatus: "processing" /* Status.processing */,
                template: `
    <template>
      <template switch.bind="status">
        <case-host case.bind="status1" ce-id="1">Order received.</case-host>
        <case-host case.bind="status2" ce-id="2">Processing your order.</case-host>
        <case-host case="dispatched"   ce-id="3">On the way.</case-host>
        <case-host case="delivered"    ce-id="4">Delivered.</case-host>
      </template>
    </template>`,
            }, config(), wrap('Processing your order.'), [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-1'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "dispatched" /* Status.dispatched */; }, wrap('On the way.'), [1, 2, 3, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-3')]);
                await ctx.assertChange($switch, () => { ctx.app.status1 = "processing" /* Status.processing */; }, wrap('On the way.'), [1]);
                await ctx.assertChange($switch, () => { ctx.app.status = "processing" /* Status.processing */; }, wrap('Order received.'), [1, ...getDeactivationSequenceFor('case-host-3'), ...getActivationSequenceFor('case-host-1')]);
            });
            yield new TestData('supports case.bind - #3', {
                template: `
    <template>
      <let num.bind="9"></let>
      <template switch.bind="true">
        <case-host case.bind="num % 3 === 0 && num % 5 === 0" ce-id="1">FizzBuzz</case-host>
        <case-host case.bind="num % 3 === 0" ce-id="2">Fizz</case-host>
        <case-host case.bind="num % 5 === 0" ce-id="3">Buzz</case-host>
      </template>
    </template>`,
            }, config(), wrap('Fizz'), [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-1'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.controller.scope.overrideContext.num = 49; }, '', [2, ...getDeactivationSequenceFor('case-host-2')]);
                await ctx.assertChange($switch, () => { ctx.controller.scope.overrideContext.num = 15; }, wrap('FizzBuzz'), [1, ...getActivationSequenceFor('case-host-1'), 2, 3]);
            });
            yield new TestData('supports multi-case', {
                initialStatus: "processing" /* Status.processing */,
                template: `
    <template>
      <template switch.bind="status">
        <case-host case.bind="['received', 'processing']" ce-id="1">Processing.</case-host>
        <case-host case="dispatched" ce-id="2">On the way.</case-host>
        <case-host case="delivered"  ce-id="3">Delivered.</case-host>
      </template>
    </template>`,
            }, config(), wrap('Processing.'), [1, ...getActivationSequenceFor('case-host-1')], getDeactivationSequenceFor('case-host-1'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "dispatched" /* Status.dispatched */; }, wrap('On the way.'), [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]);
                await ctx.assertChange($switch, () => { ctx.app.status = "received" /* Status.received */; }, wrap('Processing.'), [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]);
            });
            yield new TestData('supports multi-case collection change - #1', {
                initialStatus: "received" /* Status.received */,
                template: `
    <template>
      <template switch.bind="status">
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
      </template>
    </template>`,
            }, config(), wrap('Processing.'), [1, ...getActivationSequenceFor('case-host-1')], getDeactivationSequenceFor('case-host-1'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "dispatched" /* Status.dispatched */; }, wrap('On the way.'), [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]);
                await ctx.assertChange($switch, () => { ctx.app.statuses = ["dispatched" /* Status.dispatched */]; }, wrap('Processing.'), [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]);
            });
            yield new TestData('supports multi-case collection change - #2', {
                initialStatus: "dispatched" /* Status.dispatched */,
                template: `
    <template>
      <template switch.bind="status">
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Unknown.</default-case-host>
      </template>
    </template>`,
            }, config(), wrap('On the way.'), [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-1'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.statuses = ["dispatched" /* Status.dispatched */]; }, wrap('Processing.'), [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]);
                await ctx.assertChange($switch, () => { ctx.app.status = "unknown" /* Status.unknown */; }, wrap('Unknown.', true), [1, 2, 3, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('default-case-host-1')]);
                await ctx.assertChange($switch, () => { ctx.app.statuses = [ctx.app.status = "delivered" /* Status.delivered */]; }, wrap('Processing.'), [1, 2, 3, ...getDeactivationSequenceFor('default-case-host-1'), ...getActivationSequenceFor('case-host-3'), 1, ...getDeactivationSequenceFor('case-host-3'), ...getActivationSequenceFor('case-host-1')]);
            });
            yield new TestData('supports multi-case collection mutation', {
                initialStatus: "dispatched" /* Status.dispatched */,
                template: `
    <template>
      <template switch.bind="status">
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Unknown.</default-case-host>
      </template>
    </template>`,
            }, config(), wrap('On the way.'), [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-1'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.statuses.push("dispatched" /* Status.dispatched */); }, wrap('Processing.'), [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]);
                await ctx.assertChange($switch, () => { ctx.app.status = "unknown" /* Status.unknown */; }, wrap('Unknown.', true), [1, 2, 3, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('default-case-host-1')]);
                await ctx.assertChange($switch, () => { ctx.app.statuses.push(ctx.app.status = "delivered" /* Status.delivered */); }, wrap('Processing.'), [1, 2, 3, ...getDeactivationSequenceFor('default-case-host-1'), ...getActivationSequenceFor('case-host-3'), 1, ...getDeactivationSequenceFor('case-host-3'), ...getActivationSequenceFor('case-host-1')]);
            });
            const fallThroughTemplate = `
      <template>
        <template switch.bind="status">
          <case-host case="received"                                   ce-id="1">Order received.</case-host>
          <case-host case="value:dispatched; fall-through.bind:true"   ce-id="2">On the way.</case-host>
          <case-host case="value.bind:'processing'; fall-through:true" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"                                  ce-id="4">Delivered.</case-host>
        </template>
      </template>`;
            yield new TestData('supports fall-through #1', {
                initialStatus: "dispatched" /* Status.dispatched */,
                template: fallThroughTemplate,
            }, config(), `${wrap('On the way.')} ${wrap('Processing your order.')} ${wrap('Delivered.')}`, [1, 2, ...getActivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4'])], getDeactivationSequenceFor('case-host-4'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "delivered" /* Status.delivered */; }, wrap('Delivered.'), [1, 2, 3, 4, ...getDeactivationSequenceFor(['case-host-2', 'case-host-3'])]);
            });
            yield new TestData('supports fall-through #2', {
                initialStatus: "delivered" /* Status.delivered */,
                template: fallThroughTemplate,
            }, config(), wrap('Delivered.'), [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor(['case-host-3', 'case-host-4']), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "processing" /* Status.processing */; }, `${wrap('Processing your order.')} ${wrap('Delivered.')}`, [1, 2, 3, ...getActivationSequenceFor('case-host-3')]);
            });
            yield new TestData('supports fall-through #3', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
    <template>
      <template switch.bind="true">
        <case-host case.bind="status === 'received'"                                 ce-id="1">Order received.</case-host>
        <case-host case="value.bind:status === 'processing'; fall-through:true"      ce-id="2">Processing your order.</case-host>
        <case-host case="value.bind:status === 'dispatched'; fall-through.bind:true" ce-id="3">On the way.</case-host>
        <case-host case.bind="status === 'delivered'"                                ce-id="4">Delivered.</case-host>
      </template>
    </template>`,
            }, config(), wrap('Delivered.'), [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4']), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "processing" /* Status.processing */; }, `${wrap('Processing your order.')} ${wrap('On the way.')} ${wrap('Delivered.')}`, [2, ...getActivationSequenceFor(['case-host-2', 'case-host-3']), 4]);
            });
            yield new TestData('works without case', {
                initialStatus: "processing" /* Status.processing */,
                template: `
        <template>
          <div switch.bind="status">
            the curious case of \${status}
          </div>
        </template>`,
            }, config(), '<div> the curious case of processing </div>', [], [], async (ctx) => {
                ctx.app.status = "delivered" /* Status.delivered */;
                await tasksSettled();
                assert.html.innerEqual(ctx.host, '<div> the curious case of delivered </div>', 'change innerHTML1');
            });
            yield new TestData('supports non-case elements', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <template switch.bind="status">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
          <span>foobar</span>
          <span if.bind="true">foo</span><span else>bar</span>
          <span if.bind="false">foo</span><span else>bar</span>
          <span repeat.for="i of 3">\${i}</span>
          <my-echo message="awesome possum"></my-echo>
        </template>
      </template>`,
                registrations: [MyEcho],
            }, config(), `${wrap('Delivered.')} <span>foobar</span> <span>foo</span> <span>bar</span> <span>0</span><span>1</span><span>2</span> <my-echo>Echoed 'awesome possum'</my-echo>`, [...getActivationSequenceFor('my-echo'), 1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor(['case-host-4', 'my-echo']));
            yield new TestData('works with value converter for switch expression', {
                initialStatusNum: 4 /* StatusNum.delivered */,
                template: `
      <template>
        <template switch.bind="statusNum | toStatusString">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
            }, config(), wrap('Delivered.'), [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor('case-host-3'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.statusNum = 2 /* StatusNum.processing */; }, wrap('Processing your order.'), [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]);
            });
            yield new TestData('works with value converter for case expression', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <template switch.bind="status">
          <case-host case.bind="1 | toStatusString" ce-id="1">Order received.</case-host>
          <case-host case.bind="3 | toStatusString" ce-id="2">On the way.</case-host>
          <case-host case.bind="2 | toStatusString" ce-id="3">Processing your order.</case-host>
          <case-host case.bind="4 | toStatusString" ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
            }, config(), wrap('Delivered.'), [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor('case-host-3'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "processing" /* Status.processing */; }, wrap('Processing your order.'), [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]);
            });
            yield new TestData('works with bindingBehavior for switch expression', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <template switch.bind="status & noop">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
            }, config(), wrap('Delivered.'), [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor('case-host-3'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "processing" /* Status.processing */; }, wrap('Processing your order.'), [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]);
            });
            yield new TestData('works with bindingBehavior for case expression', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <template switch.bind="status">
          <case-host case.bind="'received' & noop"   ce-id="1">Order received.</case-host>
          <case-host case.bind="'dispatched' & noop" ce-id="2">On the way.</case-host>
          <case-host case.bind="'processing' & noop" ce-id="3">Processing your order.</case-host>
          <case-host case.bind="'delivered' & noop"  ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
            }, config(), wrap('Delivered.'), [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')], getDeactivationSequenceFor('case-host-3'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "processing" /* Status.processing */; }, wrap('Processing your order.'), [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]);
            });
            yield new TestData('works with repeater - switch expression', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <div repeat.for="s of ['received', 'dispatched']">
          <template switch.bind="s">
            <case-host case="received"   ce-id.bind="$index * 4 + 1">Order received.</case-host>
            <case-host case="dispatched" ce-id.bind="$index * 4 + 2">On the way.</case-host>
            <case-host case="processing" ce-id.bind="$index * 4 + 3">Processing your order.</case-host>
            <case-host case="delivered"  ce-id.bind="$index * 4 + 4">Delivered.</case-host>
          </template>
        </div>
      </template>`,
            }, config(), `<div> ${wrap('Order received.')} </div><div> ${wrap('On the way.')} </div>`, null, getDeactivationSequenceFor(['case-host-1', 'case-host-6']), (ctx) => {
                const switches = ctx.controller.children[0].viewModel
                    .views
                    .map((v) => v.children[0].viewModel);
                ctx.assertCallSet([
                    `Case-#${switches[0]['cases'][0].id}.isMatch()`,
                    ...getActivationSequenceFor('case-host-1'),
                    `Case-#${switches[1]['cases'][0].id}.isMatch()`,
                    `Case-#${switches[1]['cases'][1].id}.isMatch()`,
                    ...getActivationSequenceFor('case-host-6')
                ], 'post-start lifecycle calls');
            });
            yield new TestData('*[switch][repeat.for] works', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <div repeat.for="s of ['received', 'dispatched']" switch.bind="s">
          <case-host case="received"   ce-id.bind="$index * 4 + 1">Order received.</case-host>
          <case-host case="dispatched" ce-id.bind="$index * 4 + 2">On the way.</case-host>
          <case-host case="processing" ce-id.bind="$index * 4 + 3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id.bind="$index * 4 + 4">Delivered.</case-host>
        </div>
      </template>`,
            }, config(), `<div> ${wrap('Order received.')} </div><div> ${wrap('On the way.')} </div>`, null, getDeactivationSequenceFor(['case-host-1', 'case-host-6']), (ctx) => {
                const switches = ctx.controller.children[0].viewModel
                    .views
                    .map((v) => v.children[0].viewModel);
                ctx.assertCallSet([
                    `Case-#${switches[0]['cases'][0].id}.isMatch()`,
                    ...getActivationSequenceFor('case-host-1'),
                    `Case-#${switches[1]['cases'][0].id}.isMatch()`,
                    `Case-#${switches[1]['cases'][1].id}.isMatch()`,
                    ...getActivationSequenceFor('case-host-6')
                ], 'post-start lifecycle calls');
            });
            // tag: nonsense example
            yield new TestData('*[switch][if] works', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
        <div if.bind="true" switch.bind="status">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </div>
        <div if.bind="false" switch.bind="status">
          <case-host case="received"   ce-id="5">Order received.</case-host>
          <case-host case="dispatched" ce-id="6">On the way.</case-host>
          <case-host case="processing" ce-id="7">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="8">Delivered.</case-host>
        </div>
      `,
            }, config(), `<div> ${wrap('Delivered.')} </div>`, null, getDeactivationSequenceFor('case-host-4'));
            // tag: nonsense example
            yield new TestData('*[case][if=true]', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
        <div switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <case-host case="delivered" if.bind="true" ce-id="2">Delivered.</case-host>
        </div>`,
            }, config(), `<div> ${wrap('Delivered.')} </div>`, [1, 2, ...getActivationSequenceFor('case-host-2')], getDeactivationSequenceFor('case-host-2'));
            // tag: nonsense example
            yield new TestData('*[case][if=false] leads to unexpected result', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
        <div switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <span if.bind="false" case="delivered">Delivered.</span>
        </div>`,
            }, config(), '<div> </div>', [1], []);
            // tag: nonsense example
            yield new TestData('*[if=false][case] leads to unexpected result', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
        <div switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <case-host case="delivered" if.bind="false" ce-id="2">Delivered.</case-host>
        </div>`,
            }, config(), '<div> </div>', [1, 2], []);
            // tag: nonsense example
            yield new TestData('*[switch]>*[case][repeat.for] leads to unexpected result', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template>
        <template switch.bind="status">
          <case-host case.bind="s" repeat.for="s of ['received','dispatched','processing','delivered',]" ce-id="1">\${s}</case-host>
        </template>
        <template switch.bind="status">
          <case-host case.bind="s" repeat.for="s of ['delivered','received','dispatched','processing',]" ce-id="2">\${s}</case-host>
        </template>
      </template>`,
            }, config(), '', [1, 2], []);
            // tag: nonsense example
            yield new TestData('*[switch]>*[case][repeat.for] - static case - leads to unexpected result', {
                initialStatus: "received" /* Status.received */,
                template: `
      <template>
        <template switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <case-host case="received" repeat.for="i of 3" ce-id.bind="2+i">\${i}</case-host>
        </template>
      </template>`,
            }, config(), `${wrap('0')}${wrap('1')}${wrap('2')}`, [1, 2, ...getActivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4'])], getDeactivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4']));
            // yield new TestData(
            //   'supports nested switch',
            //   {
            //     initialStatus: Status.delivered,
            //     template: `
            // <template>
            //   <let day.bind="2"></let>
            //   <template switch.bind="status">
            //     <case-host case="received"   ce-id="1">Order received.</case-host>
            //     <case-host case="dispatched" ce-id="2">On the way.</case-host>
            //     <case-host case="processing" ce-id="3">Processing your order.</case-host>
            //     <case-host case="delivered"  ce-id="4">
            //       <template switch.bind="day">
            //         Expected to be delivered
            //         <case-host case.bind="1" ce-id="5">tomorrow.</case-host>
            //         <case-host case.bind="2" ce-id="6">in 2 days.</case-host>
            //         <case-host default-case  ce-id="7">in few days.</case-host>
            //       </template>
            //     </case-host>
            //   </template>
            // </template>`,
            //     verifyStopCallsAsSet: true,
            //   },
            //   config(),
            //   wrap(` Expected to be delivered ${wrap('in 2 days.')} `),
            //   null,
            //   getDeactivationSequenceFor(['case-host-4', 'case-host-6']),
            //   (ctx) => {
            //     const $switch = ctx.getSwitches()[0];
            //     const $switch2 = ctx.getSwitches(($switch['cases'][3] as Case).view as unknown as Controller)[0];
            //     ctx.assertCalls([
            //       1, 2, 3, 4, ...getActivationSequenceFor('case-host-4'),
            //       `Case-#${$switch2['cases'][0].id}.isMatch()`, `Case-#${$switch2['cases'][1].id}.isMatch()`, ...getActivationSequenceFor('case-host-6')
            //     ]);
            //   }
            // );
            yield new TestData('works with local template', {
                initialStatus: "delivered" /* Status.delivered */,
                template: `
      <template as-custom-element="foo-bar">
        <bindable name="status"></bindable>
        <div switch.bind="status">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </div>
      </template>

      <foo-bar status.bind="status"></foo-bar>
      `,
            }, config(), `<foo-bar> <div> ${wrap('Delivered.')} </div> </foo-bar>`, null, getDeactivationSequenceFor('case-host-4'), (ctx) => {
                const fooBarController = ctx.controller.children[0];
                const $switch = ctx.getSwitches(fooBarController)[0];
                ctx.assertCalls([
                    ...new Array(4).fill(0).map((_, i) => `Case-#${$switch['cases'][i].id}.isMatch()`),
                    ...getActivationSequenceFor('case-host-4')
                ]);
            });
            yield new TestData('works with au-slot[case]', {
                initialStatus: "received" /* Status.received */,
                template: `
      <template as-custom-element="foo-bar">
        <bindable name="status"></bindable>
        <div switch.bind="status">
          <au-slot name="s1" case="received">Order received.</au-slot>
          <au-slot name="s2" case="dispatched">On the way.</au-slot>
          <au-slot name="s3" case="processing">Processing your order.</au-slot>
          <au-slot name="s4" case="delivered">Delivered.</au-slot>
        </div>
      </template>

      <foo-bar status.bind="status">
        <span au-slot="s1">Projection</span>
      </foo-bar>
      `,
            }, config(), '<foo-bar> <div> <span>Projection</span> </div> </foo-bar>', null, [], async (ctx) => {
                const fooBarController = ctx.controller.children[0];
                const $switch = ctx.getSwitches(fooBarController)[0];
                ctx.assertCalls([`Case-#${$switch['cases'][0].id}.isMatch()`]);
                await ctx.assertChange($switch, () => { ctx.app.status = "delivered" /* Status.delivered */; }, '<foo-bar> <div> Delivered. </div> </foo-bar>', new Array(4).fill(0).map((_, i) => `Case-#${$switch['cases'][i].id}.isMatch()`));
            });
            yield new TestData('works with case on CE', {
                initialStatus: "received" /* Status.received */,
                template: `
      <template>
        <template switch.bind="status">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <my-echo case="delivered"    message="Delivered."></my-echo>
        </template>
      </template>`,
                registrations: [MyEcho]
            }, config(), wrap('Order received.'), [1, ...getActivationSequenceFor('case-host-1')], getDeactivationSequenceFor('my-echo'), async (ctx) => {
                const $switch = ctx.getSwitches()[0];
                await ctx.assertChange($switch, () => { ctx.app.status = "delivered" /* Status.delivered */; }, '<my-echo>Echoed \'Delivered.\'</my-echo>', [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('my-echo')]);
            });
            yield new TestData('slot integration - switch wrapped with au-slot', {
                initialStatus: "received" /* Status.received */,
                template: `
      <template as-custom-element="foo-bar">
        <au-slot name="s1"></au-slot>
      </template>

      <foo-bar>
        <template au-slot="s1">
          <template switch.bind="status">
            <case-host case="received"   ce-id="1">Order received.</case-host>
            <case-host case="dispatched" ce-id="2">On the way.</case-host>
            <case-host case="processing" ce-id="3">Processing your order.</case-host>
            <case-host case="delivered"  ce-id="4">Delivered.</case-host>
          </template>
        </template>
      </foo-bar>
      `,
            }, config(), `<foo-bar> ${wrap('Order received.')} </foo-bar>`, null, getDeactivationSequenceFor('case-host-4'), async (ctx) => {
                const fooBarController = ctx.controller.children[0];
                const auSlot = fooBarController.children[0].viewModel;
                const $switch = ctx.getSwitches(auSlot.view)[0];
                ctx.assertCalls([`Case-#${$switch['cases'][0].id}.isMatch()`, ...getActivationSequenceFor('case-host-1')]);
                await ctx.assertChange($switch, () => { ctx.app.status = "delivered" /* Status.delivered */; }, `<foo-bar> ${wrap('Delivered.')} </foo-bar>`, [...new Array(4).fill(0).map((_, i) => `Case-#${$switch['cases'][i].id}.isMatch()`), ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-4')]);
            });
            yield new TestData('*[switch] native-html-element *[case] works', {
                initialStatus: "received" /* Status.received */,
                template: `
      <template>
        <template switch.bind="status">
          <div>
            <div>
              <case-host case="received"   ce-id="1">Order received.</case-host>
              <case-host case="dispatched" ce-id="2">On the way.</case-host>
              <case-host case="processing" ce-id="3">Processing your order.</case-host>
              <case-host case="delivered"  ce-id="4">Delivered.</case-host>
            </div>
          </div>
        </template>
      </template>`,
            }, config(), `<div> <div> ${wrap('Order received.')} </div> </div>`, [1, ...getActivationSequenceFor('case-host-1')], getDeactivationSequenceFor('case-host-1'));
            // tag: not supported
            // yield new TestData(
            //   '*[switch]>CE>*[case] produces some output',
            //   {
            //     initialStatus: Status.dispatched,
            //     template: `
            // <template as-custom-element="foo-bar">
            //   foo bar
            // </template>
            // <template switch.bind="status">
            //   <foo-bar>
            //     <case-host case="dispatched" ce-id="1">On the way.</case-host>
            //     <case-host case="delivered"  ce-id="2">Delivered.</case-host>
            //   </foo-bar>
            // </template>`,
            //   },
            //   config(),
            //   `<foo-bar> ${wrap('On the way.')} foo bar </foo-bar>`,
            //   [1, ...getActivationSequenceFor('case-host-1')],
            //   getDeactivationSequenceFor('case-host-1')
            // );
            // yield new TestData(
            //   '*[switch]>CE>CE>*[case] works',
            //   {
            //     initialStatus: Status.dispatched,
            //     template: `
            // <template as-custom-element="foo-bar">
            //   foo bar
            // </template>
            // <template as-custom-element="fiz-baz">
            //   fiz baz
            // </template>
            // <template switch.bind="status">
            //   <foo-bar>
            //     <fiz-baz>
            //       <case-host case="dispatched" ce-id="1">On the way.</case-host>
            //       <case-host case="delivered"  ce-id="2">Delivered.</case-host>
            //     </fiz-baz>
            //   </foo-bar>
            // </template>`,
            //   },
            //   config(),
            //   `<foo-bar> <fiz-baz> ${wrap('On the way.')} fiz baz </fiz-baz> foo bar </foo-bar>`,
            //   [1, ...getActivationSequenceFor('case-host-1')],
            //   getDeactivationSequenceFor('case-host-1')
            // );
            // yield new TestData(
            //   'works with case binding changed to array and back',
            //   {
            //     initialStatus: Status.received,
            //     template: `
            // <template>
            //   <let s.bind="'received'"></let>
            //   <template switch.bind="status">
            //     <case-host case.bind="s"     ce-id="1">Order received.</case-host>
            //     <case-host case="dispatched" ce-id="2">On the way.</case-host>
            //     <case-host case="processing" ce-id="3">Processing your order.</case-host>
            //     <case-host case="delivered"  ce-id="4">Delivered.</case-host>
            //   </template>
            // </template>`,
            //   },
            //   config(),
            //   wrap('Order received.'),
            //   [1, ...getActivationSequenceFor('case-host-1')],
            //   getDeactivationSequenceFor('case-host-1'),
            //   async (ctx) => {
            //     const $switch = ctx.getSwitches()[0];
            //     await ctx.assertChange(
            //       $switch,
            //       () => { ctx.app.status = Status.delivered; },
            //       wrap('Delivered.'),
            //       [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-4')]
            //     );
            //     const arr = [Status.received, Status.delivered];
            //     const observer = ctx.container.get(IObserverLocator).getArrayObserver(arr);
            //     const addSpy = createSpy(observer, "subscribe", true);
            //     const removeSpy = createSpy(observer, "unsubscribe", true);
            //     await ctx.assertChange(
            //       $switch,
            //       () => { ctx.controller.scope.overrideContext.s = arr; },
            //       wrap('Order received.'),
            //       [1, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-1')]
            //     );
            //     assert.strictEqual(addSpy.calls.length, 1, 'subscribe count');
            //     assert.strictEqual(addSpy.calls[0][0], $switch['cases'][0], 'subscribe arg');
            //     await ctx.assertChange(
            //       $switch,
            //       () => { ctx.app.status = Status.dispatched; },
            //       wrap('On the way.'),
            //       [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]
            //     );
            //     const arr2 = [Status.received, Status.dispatched];
            //     const observer2 = ctx.container.get(IObserverLocator).getArrayObserver(arr2);
            //     const addSpy2 = createSpy(observer2, "subscribe", true);
            //     const removeSpy2 = createSpy(observer2, "unsubscribe", true);
            //     await ctx.assertChange(
            //       $switch,
            //       () => { ctx.controller.scope.overrideContext.s = arr2; },
            //       wrap('Order received.'),
            //       [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]
            //     );
            //     assert.strictEqual(removeSpy.calls.length, 1, 'subscibe count');
            //     assert.strictEqual(removeSpy.calls[0][0], $switch['cases'][0], 'subscibe arg');
            //     assert.strictEqual(addSpy2.calls.length, 1, 'subscibe count #2');
            //     assert.strictEqual(addSpy2.calls[0][0], $switch['cases'][0], 'subscibe arg #2');
            //     await ctx.assertChange(
            //       $switch,
            //       () => { ctx.app.status = Status.delivered; },
            //       wrap('Delivered.'),
            //       [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-4')]
            //     );
            //     await ctx.assertChange(
            //       $switch,
            //       () => { ctx.controller.scope.overrideContext.s = Status.delivered; },
            //       wrap('Order received.'),
            //       [1, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-1')]
            //     );
            //     assert.strictEqual(removeSpy2.calls.length, 1, 'subscibe count #2');
            //     assert.strictEqual(removeSpy2.calls[0][0], $switch['cases'][0], 'subscibe arg #2');
            //   }
            // );
        }
    }
    for (const data of getTestData()) {
        (data.only ? $it.only : $it)(data.name, async function (ctx) {
            assert.strictEqual(ctx.error, null);
            assert.html.innerEqual(ctx.host, data.expectedInnerHtml, 'innerHTML');
            if (data.expectedStartLog !== null) {
                ctx.assertCalls(data.expectedStartLog, 'start lifecycle calls');
            }
            const additionalAssertions = data.additionalAssertions;
            if (additionalAssertions !== null) {
                await additionalAssertions(ctx);
            }
        }, data);
    }
    function* getNegativeTestData() {
        yield new TestData('case without switch', {
            template: `
        <template as-custom-element="foo-bar">
          <case-host case="delivered">delivered</case-host>
        </template>
        <foo-bar></foo-bar>
        `,
        }, new Config(false, false, noop), null, null, null);
        yield new TestData('*[switch]>*[if]>*[case]', {
            template: `
      <template>
        <template switch.bind="status">
          <template if.bind="true">
            <case-host case="delivered">delivered</case-host>
          </template>
        </template>
      </template>`,
        }, new Config(false, false, noop), null, null, null);
        yield new TestData('*[switch]>*[repeat.for]>*[case]', {
            template: `
      <template>
        <template switch.bind="status">
          <template repeat.for="s of ['received','dispatched','processing','delivered',]">
            <case-host case.bind="s">\${s}</case-host>
          </template>
        </template>
      </template>`,
        }, new Config(false, false, noop), null, null, null);
        yield new TestData('*[switch]>*[repeat.for][case]', {
            template: `
      <template>
        <template switch.bind="status">
          <span repeat.for="s of ['received','dispatched','processing','delivered',]" case.bind="s">\${s}</span>
        </template>
      </template>`,
        }, new Config(false, false, noop), null, null, null);
        yield new TestData('*[switch]>*[au-slot]>*[case]', {
            template: `
      <template as-custom-element="foo-bar">
        <au-slot name="s1"></au-slot>
      </template>

      <foo-bar switch.bind="status">
        <template au-slot="s1">
          <case-host case="dispatched">On the way.</case-host>
          <case-host case="delivered">Delivered.</case-host>
        </template>
      </foo-bar>`,
        }, new Config(false, false, noop), null, null, null);
        yield new TestData('*[if=true][case]', {
            template: `
        <div switch.bind="status">
          <case-host case="processing">Processing your order.</case-host>
          <span if.bind="true" case="delivered">Delivered.</span>
        </div>`,
        }, new Config(false, false, noop), null, null, null);
        yield new TestData('*[else][case]', {
            initialStatus: "delivered" /* Status.delivered */,
            template: `
        <div switch.bind="status">
          <span if.bind="false" case="processing">Processing your order.</span>
          <span else case="delivered">Delivered.</span>
        </div>`,
        }, new Config(false, false, noop), null, null, null);
    }
    for (const data of getNegativeTestData()) {
        $it(`${data.name} does not work`, function (ctx) {
            // assert.match(ctx.error.message, /The parent switch not found; only `\*\[switch\] > \*\[case\|default-case\]` relation is supported\./);
            assert.match(ctx.error.message, /AUR0815/);
        }, data);
    }
    $it(`multiple default-cases throws error`, function (ctx) {
        // assert.match(ctx.error.message, /Multiple 'default-case's are not allowed./);
        assert.match(ctx.error.message, /AUR0816/);
    }, {
        template: `
  <template>
    <template switch.bind="status">
      <case-host case.bind="statuses">Processing.</case-host>
      <case-host case="dispatched">On the way.</case-host>
      <default-case-host default-case>dc1.</default-case-host>
      <default-case-host default-case>dc2.</default-case-host>
    </template>
  </template>`
    });
    $it(`*[case][else] throws error`, function (ctx) {
        /**
         * ATM the error is thrown from Else#link as controller.children is undefined.
         * But probably it is not necessary to assert that exact error here.
         */
        assert.match(ctx.error.message, /.+/);
    }, {
        initialStatus: "delivered" /* Status.delivered */,
        template: `
        <div switch.bind="status">
          <span if.bind="false" case="processing">Processing your order.</span>
          <case-host case="delivered" else>Delivered.</case-host>
        </div>`
    });
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('TODO: supports nested switches', async function () {
        // this already working, just need proper tests
        // the old tests are absolute beast in terms of modifiability + debuggability
        // will need to simplify them using LifeycleHooks or something similar
        await createFixture
            .html `
        <let day.bind="2"></let>
        <template switch.bind="status">
          <div case="received"   ce-id="1">Order received.<div>
          <div case="dispatched" ce-id="2">On the way.<div>
          <div case="processing" ce-id="3">Processing your order.<div>
          <div case="delivered"  ce-id="4" switch.bind="day">
            Expected to be delivered
            <div case.bind="1" ce-id="5">tomorrow.<div>
            <div case.bind="2" ce-id="6">in 2 days.<div>
            <div default-case  ce-id="7">in few days.<div>
          <div>
        </template>
      `
            .build().started;
    });
    // Note: This is just an unrolled test for debugging purposes (useful for future refactoring of the tests)
    for (const config of [
        new Config(false, false, noop),
        new Config(true, false, noop),
        new Config(true, true, createWaiter(0)),
        new Config(true, true, createWaiter(5)),
    ]) {
        it('supports multi-case collection mutation (unwrapped)', async function () {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `
    <template>
      <template switch.bind="status">
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Unknown.</default-case-host>
      </template>
    </template>`
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.status1 = "received" /* Status.received */;
                        this.status2 = "processing" /* Status.processing */;
                        this.statuses = ["received" /* Status.received */, "processing" /* Status.processing */];
                        this.status = "dispatched" /* Status.dispatched */;
                        this.statusNum = 0 /* StatusNum.unknown */;
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
            let CaseHost = (() => {
                let _classDecorators = [customElement({ name: 'case-host', template: '<au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _ceId_decorators;
                let _ceId_initializers = [];
                let _ceId_extraInitializers = [];
                var CaseHost = _classThis = class {
                    constructor() {
                        this.ceId = __runInitializers(this, _ceId_initializers, null);
                        this.$logger = (__runInitializers(this, _ceId_extraInitializers), resolve(ILogger));
                        const node = resolve(INode);
                        const ceId = node.dataset.ceId;
                        if (ceId) {
                            (this.logger = resolve(ILogger).scopeTo(`case-host-${ceId}`)).debug('ctor');
                            delete node.dataset.ceId;
                        }
                    }
                    async binding() {
                        this.logger ??= this.ceId === null ? this.$logger.scopeTo('case-host') : this.$logger.scopeTo(`case-host-${this.ceId}`);
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('binding');
                    }
                    async bound() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('bound');
                    }
                    async attaching() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('attaching');
                    }
                    async attached() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('attached');
                    }
                    async detaching() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('detaching');
                    }
                    async unbinding() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('unbinding');
                    }
                };
                __setFunctionName(_classThis, "CaseHost");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _ceId_decorators = [bindable];
                    __esDecorate(null, null, _ceId_decorators, { kind: "field", name: "ceId", static: false, private: false, access: { has: obj => "ceId" in obj, get: obj => obj.ceId, set: (obj, value) => { obj.ceId = value; } }, metadata: _metadata }, _ceId_initializers, _ceId_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CaseHost = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CaseHost = _classThis;
            })();
            let DefaultCaseHost = (() => {
                let _classDecorators = [customElement({ name: 'default-case-host', template: '<au-slot>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _ceId_decorators;
                let _ceId_initializers = [];
                let _ceId_extraInitializers = [];
                var DefaultCaseHost = _classThis = class {
                    constructor() {
                        this.ceId = __runInitializers(this, _ceId_initializers, null);
                        this.$logger = (__runInitializers(this, _ceId_extraInitializers), resolve(ILogger));
                        const node = resolve(INode);
                        const ceId = node.dataset.ceId;
                        if (ceId) {
                            (this.logger = resolve(ILogger).scopeTo(`default-case-host-${ceId}`)).debug('ctor');
                            delete node.dataset.ceId;
                        }
                    }
                    async binding() {
                        this.logger ??= this.ceId === null ? this.$logger.scopeTo('default-case-host') : this.$logger.scopeTo(`default-case-host-${this.ceId}`);
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('binding');
                    }
                    async bound() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('bound');
                    }
                    async attaching() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('attaching');
                    }
                    async attached() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('attached');
                    }
                    async detaching() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('detaching');
                    }
                    async unbinding() {
                        if (config.hasPromise)
                            await config.wait();
                        this.logger.debug('unbinding');
                    }
                };
                __setFunctionName(_classThis, "DefaultCaseHost");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _ceId_decorators = [bindable];
                    __esDecorate(null, null, _ceId_decorators, { kind: "field", name: "ceId", static: false, private: false, access: { has: obj => "ceId" in obj, get: obj => obj.ceId, set: (obj, value) => { obj.ceId = value; } }, metadata: _metadata }, _ceId_initializers, _ceId_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    DefaultCaseHost = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return DefaultCaseHost = _classThis;
            })();
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
                    .register(LoggerConfiguration.create({ level: LogLevel.trace, sinks: [DebugLog] }), ToStatusStringValueConverter, NoopBindingBehavior, Registration.instance(Config, config), CaseHost, DefaultCaseHost)
                    .app({
                    host,
                    component: App
                })
                    .start();
                app = au.root.controller.viewModel;
                controller = au.root.controller;
            }
            catch (e) {
                error = e;
            }
            const wait = async ($switch) => {
                const promise = $switch.promise;
                await promise;
                if ($switch.promise !== promise) {
                    await wait($switch);
                }
            };
            assert.strictEqual(error, null);
            assert.html.innerEqual(host, `<case-host>On the way.</case-host>`, 'innerHTML');
            const log = container.get(ILogger).sinks.find(s => s instanceof DebugLog);
            const $switch = controller.children.find(x => x.viewModel instanceof Switch).viewModel;
            const cases = $switch['cases'];
            const expectedStartLog = [
                `Case-#${cases[0]['id']}.isMatch()`,
                `Case-#${cases[1]['id']}.isMatch()`,
                'case-host-2.binding',
                'case-host-2.bound',
                'case-host-2.attaching',
                'case-host-2.attached',
            ];
            assert.deepStrictEqual(log.log, expectedStartLog, 'start lifecycle calls');
            log.clear();
            app.statuses.push("dispatched" /* Status.dispatched */);
            await wait($switch);
            assert.html.innerEqual(host, `<case-host>Processing.</case-host>`, `change1 innerHTML`);
            const expectedLog1 = [
                `Case-#${cases[0]['id']}.isMatch()`,
                'case-host-2.detaching',
                'case-host-2.unbinding',
                'case-host-1.binding',
                'case-host-1.bound',
                'case-host-1.attaching',
                'case-host-1.attached',
            ];
            assert.deepStrictEqual(log.log, expectedLog1, 'change1');
            log.clear();
            app.status = "unknown" /* Status.unknown */;
            await wait($switch);
            assert.html.innerEqual(host, `<default-case-host>Unknown.</default-case-host>`, `change2 innerHTML`);
            const expectedLog2 = [
                `Case-#${cases[0]['id']}.isMatch()`,
                `Case-#${cases[1]['id']}.isMatch()`,
                `Case-#${cases[2]['id']}.isMatch()`,
                'case-host-1.detaching',
                'case-host-1.unbinding',
                'default-case-host-1.binding',
                'default-case-host-1.bound',
                'default-case-host-1.attaching',
                'default-case-host-1.attached',
            ];
            assert.deepStrictEqual(log.log, expectedLog2, 'change2');
            log.clear();
            app.statuses.push(app.status = "delivered" /* Status.delivered */);
            await wait($switch);
            await new Promise(resolve => setTimeout(resolve, 100));
            assert.html.innerEqual(host, `<case-host>Processing.</case-host>`, `change3 innerHTML`);
            const expectedLog3 = [
                `Case-#${cases[0]['id']}.isMatch()`,
                `Case-#${cases[1]['id']}.isMatch()`,
                `Case-#${cases[2]['id']}.isMatch()`,
                'default-case-host-1.detaching',
                'default-case-host-1.unbinding',
                'case-host-3.binding',
                'case-host-3.bound',
                'case-host-3.attaching',
                'case-host-3.attached',
                `Case-#${cases[0]['id']}.isMatch()`,
                'case-host-3.detaching',
                'case-host-3.unbinding',
                'case-host-1.binding',
                'case-host-1.bound',
                'case-host-1.attaching',
                'case-host-1.attached',
            ];
            assert.deepStrictEqual(log.log, expectedLog3, 'change3');
            log.clear();
            await au.stop();
            assert.html.innerEqual(host, '', 'post-detach innerHTML');
            const expectedStopLog = [
                'case-host-1.detaching',
                'case-host-1.unbinding',
            ];
            assert.deepStrictEqual(log.log, expectedStopLog, 'stop lifecycle calls');
            ctx.doc.body.removeChild(host);
        });
    }
});
//# sourceMappingURL=switch.spec.js.map