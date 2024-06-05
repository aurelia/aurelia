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
import { TestContext, assert, createFixture } from '@aurelia/testing';
import { BindingMode, customElement, bindable, Aurelia, ISignaler } from '@aurelia/runtime-html';
import { delegateSyntax } from '@aurelia/compat-v1';
async function wait(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
// TemplateCompiler - Binding Resources integration
describe('3-runtime-html/binding-commands.throttle-debounce.spec.ts', function () {
    this.retries(3);
    function $createFixture() {
        const ctx = TestContext.create();
        const au = new Aurelia(ctx.container);
        const host = ctx.createElement('div');
        return {
            au,
            host,
            ctx,
        };
    }
    describe('debounce', function () {
        // if we are to turn the v1 behavior of throttle back on
        // the following test should be enabled
        // ===================================================
        // it('works with toView bindings to elements', async function () {
        //   @customElement({
        //     name: 'app',
        //     template: `<input ref="receiver" value.to-view="value & debounce:25">`,
        //   })
        //   class App {
        //     public value: string = '0';
        //     public receiver: HTMLInputElement;
        //   }
        //   const { au, host, ctx } = createFixture();
        //   const component = new App();
        //   au.app({ component, host });
        //   await au.start();
        //   const receiver = component.receiver;
        //   component.value = '1';
        //   assert.strictEqual(receiver.value, '0', 'target value pre #1');
        //   ctx.platform.domQueue.flush();
        //   assert.strictEqual(receiver.value, '0', 'target value #1');
        //   component.value = '2';
        //   assert.strictEqual(receiver.value, '0', 'target value pre #2');
        //   ctx.platform.domQueue.flush();
        //   assert.strictEqual(receiver.value, '0', 'target value #2');
        //   await wait(20);
        //   assert.strictEqual(receiver.value, '0', 'target value pre #2 + wait(20)');
        //   ctx.platform.domQueue.flush();
        //   assert.strictEqual(receiver.value, '0', 'target value #2 + wait(20)');
        //   await wait(10);
        //   assert.strictEqual(receiver.value, '0', 'target value pre #2 + wait(30)');
        //   ctx.platform.domQueue.flush();
        //   assert.strictEqual(receiver.value, '2', 'target value #2 + wait(30) + flush()');
        //   component.value = '3';
        //   assert.strictEqual(receiver.value, '2', 'target value pre #3');
        //   ctx.platform.domQueue.flush();
        //   assert.strictEqual(receiver.value, '2', 'target value #3');
        //   await wait(50);
        //   assert.strictEqual(receiver.value, '3', 'target value pre #4');
        //   ctx.platform.domQueue.flush();
        //   assert.strictEqual(receiver.value, '3', 'target value #4');
        //   await au.stop();
        //   au.dispose();
        // });
        it('works without parameters', async function () {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<input ref="receiver" value.bind="value & debounce">`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = '0';
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
            const { au, host, ctx } = $createFixture();
            const component = new App();
            au.app({ component, host });
            await au.start();
            const receiver = component.receiver;
            receiver.value = '1';
            receiver.dispatchEvent(new ctx.CustomEvent('change'));
            await wait(10);
            assert.strictEqual(component.value, '0', 'component value pre 200ms');
            await wait(200);
            assert.strictEqual(component.value, '1', 'component value post 200ms');
            await au.stop();
            au.dispose();
        });
        it('works with toView bindings to [elements]', async function () {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<input ref="receiver" value.to-view="value & debounce:25">`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = '0';
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
            const { au, host, ctx } = $createFixture();
            const component = new App();
            au.app({ component, host });
            await au.start();
            const receiver = component.receiver;
            component.value = '1';
            assert.strictEqual(receiver.value, '0', 'target value pre #1');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.value, '0', 'target value #1');
            component.value = '2';
            assert.strictEqual(receiver.value, '0', 'target value pre #2');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.value, '0', 'target value #2');
            await ctx.platform.taskQueue.yield();
            assert.strictEqual(receiver.value, '2', 'target value #2 + yield');
            component.value = '3';
            assert.strictEqual(receiver.value, '2', 'target value pre #3');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.value, '2', 'target value #3');
            await wait(50);
            assert.strictEqual(receiver.value, '3', 'target value pre #4');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.value, '3', 'target value #4');
            await au.stop();
            au.dispose();
        });
        it('works with special toView bindings ([selected.class="...."]) to elements', async function () {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<div ref="receiver" selected.class="value & debounce:25">`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = 0;
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
            const { au, host, ctx } = $createFixture();
            const component = new App();
            au.app({ component, host });
            await au.start();
            const receiver = component.receiver;
            component.value = 1;
            assert.strictEqual(receiver.className, '', 'target value pre #1');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.className, '', 'target value #1');
            component.value = false;
            assert.strictEqual(receiver.className, '', 'target value pre #2');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.className, '', 'target value #2');
            component.value = true;
            assert.strictEqual(receiver.className, '', 'target value pre #3');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.className, '', 'target value #3');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.className, '', 'target value #4');
            await ctx.platform.taskQueue.yield();
            assert.strictEqual(receiver.className, 'selected', 'target value pre #5');
            component.value = false;
            assert.strictEqual(receiver.className, 'selected', 'target value pre #5');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.className, 'selected', 'target value #5');
            ctx.platform.domQueue.flush();
            assert.strictEqual(receiver.className, 'selected', 'target value #6');
            ctx.platform.domQueue.flush();
            await ctx.platform.taskQueue.yield();
            assert.strictEqual(receiver.className, '', 'target value #6');
            await au.stop();
            au.dispose();
        });
        it('works with toView bindings to other [components]', async function () {
            let Receiver = (() => {
                let _classDecorators = [customElement({
                        name: 'au-receiver',
                        template: null,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Receiver = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, '0');
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Receiver");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable({ mode: BindingMode.toView })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Receiver = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Receiver = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<au-receiver component.ref="receiver" value.bind="value & debounce:25"></au-receiver>`,
                        dependencies: [Receiver],
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = '0';
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
            const { au, host, ctx } = $createFixture();
            const component = new App();
            au.app({ component, host });
            await au.start();
            const receiver = component.receiver;
            // set source value
            component.value = '1';
            assert.strictEqual(receiver.value, '0');
            // set target value
            receiver.value = '1.5';
            assert.strictEqual(receiver.value, '1.5');
            // set source value
            component.value = '3';
            assert.strictEqual(component.value, '3');
            assert.strictEqual(receiver.value, '1.5');
            await ctx.platform.taskQueue.yield();
            assert.strictEqual(receiver.value, '3');
            await au.stop();
            assert.strictEqual(receiver.value, '3');
            au.dispose();
            assert.strictEqual(receiver.value, '3');
        });
        it('works with twoWay bindings to other components', async function () {
            let Receiver = (() => {
                let _classDecorators = [customElement({
                        name: 'au-receiver',
                        template: null,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Receiver = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, '0');
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Receiver");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable({ mode: BindingMode.twoWay })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Receiver = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Receiver = _classThis;
            })();
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<au-receiver component.ref="receiver" value.bind="value & debounce:25"></au-receiver>`,
                        dependencies: [Receiver],
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = '0';
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
            const { au, host } = $createFixture();
            const component = new App();
            au.app({ component, host });
            await au.start();
            const receiver = component.receiver;
            component.value = '1';
            assert.strictEqual(component.value, '1');
            assert.strictEqual(receiver.value, '1');
            receiver.value = '2';
            await wait(20);
            assert.strictEqual(component.value, '1', `change 2 not yet propagated to component`);
            assert.strictEqual(receiver.value, '2', `receiver keeps change 2`);
            component.value = '3';
            assert.strictEqual(component.value, '3');
            assert.strictEqual(receiver.value, '3');
            await wait(50);
            assert.strictEqual(component.value, '2');
            assert.strictEqual(receiver.value, '2');
            // old new v2-behavior:
            //
            // assert that in 2 way binding, after a target update has been debounced
            // any changes from source should override and discard that queue
            // assert.strictEqual(receiver.value, '3', `change 3 propagated`);
            //
            // -------
            // not sure whether this should be the case, since in reality, user input normally should wins everything
            await au.stop();
            au.dispose();
        });
        for (const command of ['trigger', 'capture', 'delegate']) {
            it(`works with ${command} bindings`, async function () {
                let App = (() => {
                    let _classDecorators = [customElement({
                            name: 'app',
                            template: `<div ref="receiver" click.${command}="handleClick($event) & debounce:25"></div>`,
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var App = _classThis = class {
                        constructor() {
                            this.events = [];
                        }
                        handleClick($event) {
                            this.events.push($event);
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
                const { au, host, ctx } = $createFixture();
                const component = new App();
                ctx.container.register(delegateSyntax);
                ctx.doc.body.appendChild(host);
                au.app({ component, host });
                await au.start();
                const eventInit = { bubbles: true, cancelable: true };
                const receiver = component.receiver;
                const event1 = new ctx.CustomEvent('click', eventInit);
                receiver.dispatchEvent(event1);
                await wait(20);
                assert.strictEqual(component.events.length, 0, `event 1 propagated`);
                const event2 = new ctx.CustomEvent('click', eventInit);
                receiver.dispatchEvent(event2);
                await wait(20);
                assert.strictEqual(component.events.length, 0, `event 2 not yet propagated, event 1 is discarded because of debounce`);
                const event3 = new ctx.CustomEvent('click', eventInit);
                receiver.dispatchEvent(event3);
                await wait(20);
                assert.strictEqual(component.events.length, 0, `event 3 not yet propagated, event 2 is discarded because of debounce`);
                await ctx.platform.taskQueue.yield();
                assert.strictEqual(component.events.length, 1, `event 3 propagated`);
                assert.strictEqual(component.events[0], event3, `event 3 is the specific event that propagated`);
                host.remove();
                await au.stop();
                au.dispose();
            });
        }
        it('works with let binding', async function () {
            let a = void 0;
            let aCount = 0;
            const { ctx, component } = createFixture('<let to-binding-context a.bind="b & debounce: 25">', class {
                constructor() {
                    this.b = 1;
                }
                set a(v) {
                    aCount++;
                    a = v;
                }
            });
            assert.strictEqual(a, 1);
            assert.strictEqual(aCount, 1);
            component.b = 2;
            assert.strictEqual(a, 1, 'debounce holds 2 from propagating');
            assert.strictEqual(aCount, 1);
            component.b = 3;
            assert.strictEqual(a, 1, 'debounce holds 3 from propagating');
            assert.strictEqual(aCount, 1);
            await ctx.platform.taskQueue.yield();
            assert.strictEqual(a, 3);
            assert.strictEqual(aCount, 2);
        });
        it('updates let on flush signals', async function () {
            let a = void 0;
            let aCount = 0;
            const { ctx, component } = createFixture('<let to-binding-context a.bind="b & debounce :25 : `hurry`">', class {
                constructor() {
                    this.b = 1;
                }
                set a(v) {
                    aCount++;
                    a = v;
                }
            });
            assert.strictEqual(a, 1);
            assert.strictEqual(aCount, 1);
            component.b = 2;
            assert.strictEqual(a, 1, 'debounce holds 2 from propagating');
            assert.strictEqual(aCount, 1);
            component.b = 3;
            assert.strictEqual(a, 1, 'debounce holds 3 from propagating');
            assert.strictEqual(aCount, 1);
            ctx.container.get(ISignaler).dispatchSignal('hurry');
            assert.strictEqual(a, 3);
            assert.strictEqual(aCount, 2);
        });
        it('updates let on flush multiple signals', async function () {
            let a = void 0;
            let aCount = 0;
            const { ctx, component } = createFixture('<let to-binding-context a.bind="b & debounce :25 : [`hurry`, `running`]">', class {
                constructor() {
                    this.b = 1;
                }
                set a(v) {
                    aCount++;
                    a = v;
                }
            });
            assert.strictEqual(a, 1);
            assert.strictEqual(aCount, 1);
            component.b = 2;
            assert.strictEqual(a, 1, 'debounce holds 2 from propagating');
            assert.strictEqual(aCount, 1);
            component.b = 3;
            assert.strictEqual(a, 1, 'debounce holds 3 from propagating');
            assert.strictEqual(aCount, 1);
            ctx.container.get(ISignaler).dispatchSignal('running');
            assert.strictEqual(a, 3);
            assert.strictEqual(aCount, 2);
        });
    });
    describe('throttle', function () {
        // this following test should work, if we ever bring back the v1 behavior:
        // - throttle target -> source in 2 way
        // - throttle source -> target in 1 way
        // ============================================
        it('works with [oneWay] binding to elements', async function () {
            let App = (() => {
                let _classDecorators = [customElement({
                        name: 'app',
                        template: `<input ref="receiver" value.to-view="value & throttle:25">`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var App = _classThis = class {
                    constructor() {
                        this.value = '0';
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
            const { component, flush } = createFixture('<input ref="receiver" value.to-view="value & throttle:25">', App);
            const receiver = component.receiver;
            component.value = '1';
            assert.strictEqual(receiver.value, '0', 'target value pre #1');
            flush();
            assert.strictEqual(receiver.value, '1', 'target value #1');
            component.value = '2';
            assert.strictEqual(receiver.value, '1', 'target value pre #2');
            flush();
            assert.strictEqual(receiver.value, '1', 'target value #2');
            await wait(20);
            assert.strictEqual(receiver.value, '1', 'target value pre #2 + wait(20)');
            flush();
            assert.strictEqual(receiver.value, '1', 'target value #2 + wait(20)');
            component.value = '3';
            assert.strictEqual(receiver.value, '1', 'target value pre #3');
            flush();
            assert.strictEqual(receiver.value, '1', 'target value #3');
            await wait(10);
            assert.strictEqual(receiver.value, '3', 'target value pre #3 + wait(10) (total wait 30 > 25)');
        });
        it('works with [twoWay] bindings to other components', async function () {
            let Receiver = (() => {
                let _classDecorators = [customElement({
                        name: 'au-receiver',
                        template: null,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var Receiver = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, '0');
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "Receiver");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable({ mode: BindingMode.twoWay })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Receiver = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Receiver = _classThis;
            })();
            class App {
                constructor() {
                    this.value = '0';
                }
            }
            const { component } = createFixture(`<au-receiver component.ref="receiver" value.bind="value & throttle:25"></au-receiver>`, App, [Receiver]);
            const receiver = component.receiver;
            component.value = '1';
            assert.strictEqual(receiver.value, '1');
            assert.strictEqual(component.value, '1');
            receiver.value = '2';
            assert.strictEqual(receiver.value, '2', `receiver keeps change 2`);
            assert.strictEqual(component.value, '2', 'change 2 propagated immediately to component');
            receiver.value = '3';
            assert.strictEqual(receiver.value, '3', `receiver keeps change 3`);
            assert.strictEqual(component.value, '2', 'change 3 throttled');
            await wait(20);
            assert.strictEqual(receiver.value, '3', `receiver keeps change 3`);
            assert.strictEqual(component.value, '2', 'change 3 still throttled after 20ms');
            receiver.value = '4';
            assert.strictEqual(receiver.value, '4', `receiver keeps change 4`);
            assert.strictEqual(component.value, '2', 'change 4 still throttled after 20ms');
            await wait(10);
            assert.strictEqual(receiver.value, '4', `receiver keeps change 4`);
            assert.strictEqual(component.value, '4', 'change 4 propagated after 30ms');
            // ensure throttle not immediately throttle again
            await wait(50);
            // in the next block, verify that on the fly target->source throttled update
            // will be discarded when source is updated while the throttle task is queued
            receiver.value = '5';
            assert.strictEqual(receiver.value, '5', 'receiver keeps change 5');
            assert.strictEqual(component.value, '5', 'change 5 propagated immediately to component');
            // target -> source
            receiver.value = '6';
            assert.strictEqual(receiver.value, '6', `receiver keeps change 6`);
            assert.strictEqual(component.value, '5', 'change 6 throttled');
            await wait(20);
            assert.strictEqual(receiver.value, '6', `receiver keeps change 6`);
            assert.strictEqual(component.value, '5', 'change 6 still throttled after 20ms');
            // source -> target | should discard previously queued value
            component.value = '7';
            assert.strictEqual(receiver.value, '7', 'receiver takes change 7');
            assert.strictEqual(component.value, '7', 'change 7(from source)');
            await wait(50);
            // old new v2-behavior:
            //
            // assert that in 2 way binding, after a target update has been debounced
            // any changes from source should override and discard that queue
            //
            // -------
            // not sure whether this should be the case, since in reality, user input normally should wins everything
            // see the test line 222 title
            // it('works with toView bindings to other [components]',
            // for similar scenario
            assert.strictEqual(receiver.value, '6', `change 6 propagated`); // change from line 555 above
        });
        it('flushes on signals', function () {
            class App {
                constructor() {
                    this.value = '0';
                }
            }
            const { ctx, component, flush } = createFixture('<input ref="receiver" value.to-view="value & throttle:25:`hurry`">', App);
            const receiver = component.receiver;
            const signaler = ctx.container.get(ISignaler);
            component.value = '1';
            // this flush hasn't set a time for throttle yet, since it' only the first run of throttle
            flush();
            assert.strictEqual(receiver.value, '1');
            component.value = '2';
            assert.strictEqual(receiver.value, '1');
            // this flush is gonna call a throttled updateTarget, since we just called in in the flush above
            flush();
            assert.strictEqual(receiver.value, '1');
            signaler.dispatchSignal('hurry');
            assert.strictEqual(receiver.value, '2');
        });
        it('flushes on multiple signals', function () {
            class App {
                constructor() {
                    this.value = '0';
                }
            }
            const { ctx, component, flush } = createFixture('<input ref="receiver" value.to-view="value & throttle:25:[`now`, `hurry`]">', App);
            const receiver = component.receiver;
            const signaler = ctx.container.get(ISignaler);
            component.value = '1';
            // this flush hasn't set a time for throttle yet, since it' only the first run of throttle
            flush();
            assert.strictEqual(receiver.value, '1');
            component.value = '2';
            assert.strictEqual(receiver.value, '1');
            // this flush is gonna call a throttled updateTarget, since we just called in in the flush above
            flush();
            assert.strictEqual(receiver.value, '1');
            signaler.dispatchSignal('hurry');
            assert.strictEqual(receiver.value, '2');
        });
    });
    it('works with updateTrigger', async function () {
        const { ctx, component, startPromise, tearDown } = createFixture(`<input ref="inputEl" value.bind="value & updateTrigger:'blur'" />`, class App {
            constructor() {
                this.value = '0';
            }
        });
        await startPromise;
        assert.strictEqual(component.inputEl.value, '0');
        // only blur will trigger
        component.inputEl.value = 'a';
        component.inputEl.dispatchEvent(new ctx.CustomEvent('input'));
        assert.strictEqual(component.value, '0');
        component.inputEl.dispatchEvent(new ctx.CustomEvent('blur'));
        assert.strictEqual(component.value, 'a');
        await tearDown();
    });
});
//# sourceMappingURL=binding-commands.throttle-debounce.spec.js.map