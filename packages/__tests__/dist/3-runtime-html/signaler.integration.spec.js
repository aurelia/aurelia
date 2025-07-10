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
import { ConsoleSink, LoggerConfiguration, LogLevel, resolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { ISignaler, customElement, valueConverter, Aurelia, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture, TestContext } from '@aurelia/testing';
describe('3-runtime-html/signaler.integration.spec.ts', function () {
    it('1 non-observed input and 2 observed inputs - toView', async function () {
        const ctx = TestContext.create();
        ctx.container.register(LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.warn }));
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement('div');
        let counter = 0;
        let AddValueConverter = (() => {
            let _classDecorators = [valueConverter({ name: 'add' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AddValueConverter = _classThis = class {
                toView(input, factor) {
                    return input + (++counter * factor);
                }
            };
            __setFunctionName(_classThis, "AddValueConverter");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AddValueConverter = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AddValueConverter = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: `\${input | add:factor & signal:'increment'}`,
                    dependencies: [AddValueConverter],
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.input = 0;
                    this.factor = 1;
                    this.signaler = resolve(ISignaler);
                }
                increment() {
                    this.signaler.dispatchSignal('increment');
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
        const component = au.container.get(App);
        au.app({ host, component });
        await au.start();
        assert.visibleTextEqual(host, '1', 'assert #1');
        assert.areTaskQueuesEmpty();
        component.increment();
        assert.visibleTextEqual(host, '1', 'assert #2');
        await tasksSettled();
        assert.visibleTextEqual(host, '2', 'assert #3');
        component.factor = 2;
        assert.visibleTextEqual(host, '2', 'assert #4');
        await tasksSettled();
        assert.visibleTextEqual(host, '6', 'assert #5');
        component.increment();
        assert.visibleTextEqual(host, '6', 'assert #6');
        await tasksSettled();
        assert.visibleTextEqual(host, '8', 'assert #7');
        component.input = 10;
        assert.visibleTextEqual(host, '8', 'assert #8');
        await tasksSettled();
        assert.visibleTextEqual(host, '20', 'assert #9');
        component.increment();
        assert.visibleTextEqual(host, '20', 'assert #10');
        await tasksSettled();
        assert.visibleTextEqual(host, '22', 'assert #11');
        await au.stop();
    });
    describe('array index assignment with repeater', function () {
        for (const expr of [
            `& signal:'updateItem'`,
            `& oneTime & signal:'updateItem'`,
            `& signal:'updateItem' & oneTime`,
        ]) {
            it(expr, async function () {
                const ctx = TestContext.create();
                ctx.container.register(LoggerConfiguration.create({ $console: console, level: LogLevel.warn }));
                const au = new Aurelia(ctx.container);
                const host = ctx.createElement('div');
                const items = [0, 1, 2];
                let App = (() => {
                    let _classDecorators = [customElement({
                            name: 'app',
                            template: `<div repeat.for="i of 3">\${items[i] ${expr}}</div>`,
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var App = _classThis = class {
                        constructor() {
                            this.items = items;
                            this.signaler = resolve(ISignaler);
                        }
                        updateItem() {
                            this.signaler.dispatchSignal('updateItem');
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
                const component = au.container.get(App);
                au.app({ host, component });
                await au.start();
                assert.visibleTextEqual(host, '012', 'assert #1');
                assert.areTaskQueuesEmpty();
                items[0] = 2;
                assert.areTaskQueuesEmpty();
                component.updateItem();
                assert.visibleTextEqual(host, '012', 'assert #2');
                await tasksSettled();
                assert.visibleTextEqual(host, '212', 'assert #3');
                items[0] = 3;
                items[1] = 4;
                items[2] = 5;
                assert.areTaskQueuesEmpty();
                component.updateItem();
                assert.visibleTextEqual(host, '212', 'assert #3');
                await tasksSettled();
                assert.visibleTextEqual(host, '345', 'assert #4');
                items.reverse();
                assert.visibleTextEqual(host, '345', 'assert #5');
                if (expr.includes('oneTime')) {
                    await tasksSettled();
                    assert.visibleTextEqual(host, '345', 'assert #6');
                    component.updateItem();
                    assert.visibleTextEqual(host, '345', 'assert #7');
                    await tasksSettled();
                    assert.visibleTextEqual(host, '543', 'assert #8');
                }
                else {
                    await tasksSettled();
                    assert.visibleTextEqual(host, '543', 'assert #9');
                }
                items[1] = 6;
                assert.areTaskQueuesEmpty();
                component.updateItem();
                assert.visibleTextEqual(host, '543', 'assert #10');
                await tasksSettled();
                assert.visibleTextEqual(host, '563', 'assert #11');
                await au.stop();
            });
        }
    });
    it('takes signal from multiple value converters', async function () {
        let addCount = 0;
        let minusCount = 0;
        const { assertText, container } = createFixture
            .component({ value: 0 })
            .html `\${value | add | minus}`
            .deps(ValueConverter.define('add', class {
            constructor() {
                this.signals = ['add'];
                this.toView = v => {
                    addCount++;
                    return v + 2;
                };
            }
        }), ValueConverter.define('minus', class {
            constructor() {
                this.signals = ['minus'];
                this.toView = v => {
                    minusCount++;
                    return v - 1;
                };
            }
        }))
            .build();
        assertText('1');
        assert.strictEqual(addCount, 1);
        assert.strictEqual(minusCount, 1);
        container.get(ISignaler).dispatchSignal('add');
        await tasksSettled();
        assert.strictEqual(addCount, 2);
        assert.strictEqual(minusCount, 2);
        container.get(ISignaler).dispatchSignal('minus');
        assertText('1');
    });
});
//# sourceMappingURL=signaler.integration.spec.js.map