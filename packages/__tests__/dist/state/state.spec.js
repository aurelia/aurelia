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
import { ValueConverter, customAttribute, customElement, IWindow } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { StateDefaultConfiguration, fromState, createStateMemoizer, Store } from '@aurelia/state';
import { assert, createFixture, onFixtureCreated } from '@aurelia/testing';
describe('state/state.spec.ts', function () {
    this.beforeEach(function () {
        onFixtureCreated(({ ctx }) => {
            const window = ctx.container.get(IWindow);
            if ('__REDUX_DEVTOOLS_EXTENSION__' in window)
                return;
            Object.assign(window, {
                __REDUX_DEVTOOLS_EXTENSION__: {
                    connect: () => ({ init: () => { }, subscribe: () => { } })
                }
            });
        });
    });
    it('connects to initial state object', async function () {
        const state = { text: '123' };
        const { getBy } = await createFixture
            .html `<input value.state="text">`
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        assert.strictEqual(getBy('input').value, '123');
    });
    it('understands shorthand syntax', async function () {
        const state = { value: '1' };
        const { assertValue } = createFixture
            .html `<input value.state>`
            .deps(StateDefaultConfiguration.init(state))
            .build();
        assertValue('input', '1');
    });
    it('does not throw in access member - object nullish', async function () {
        const state = { a: null };
        assert.doesNotThrow(() => createFixture
            .html `<input value.state="a.b">`
            .deps(StateDefaultConfiguration.init(state))
            .build());
    });
    it('[strict] throws in access member - object nullish', async function () {
        const state = { a: null };
        assert.throws(() => {
            var _a;
            return createFixture
                .html `<input value.state="a.b">`
                .component((_a = class {
                },
                _a.strict = true,
                _a))
                .deps(StateDefaultConfiguration.init(state))
                .build();
        });
    });
    it('works with value converter', async function () {
        const state = { text: 'aaa' };
        const { getBy } = await createFixture
            .html `<input value.state="text | suffix1">`
            .deps(StateDefaultConfiguration.init(state), ValueConverter.define('suffix1', class {
            toView(v) { return `${v}1`; }
        }))
            .build().started;
        assert.strictEqual(getBy('input').value, 'aaa1');
    });
    // it('does not observe global state object', async function () {
    //   const state = { text: '123' };
    //   const { getBy, ctx } = await createFixture
    //     .html('<input value.state="text">')
    //     .deps(StandardStateConfiguration.init(state))
    //     .build().started;
    //   assert.strictEqual(getBy('input').value, '123');
    //   // assert that it's not observed
    //   state.text = 'abc';
    //   ctx.platform.domQueue.flush();
    //   assert.strictEqual(getBy('input').value, '123');
    // });
    it('does not see property on view model without $parent', async function () {
        const state = { text: '123' };
        const { getBy } = await createFixture
            .component({ vmText: '456' })
            .html('<input value.state="vmText">')
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        assert.strictEqual(getBy('input').value, '');
    });
    it('allows access to component scope state via $parent in .state command', async function () {
        const state = { text: '123' };
        const { getBy } = await createFixture
            .component({ text: '456' })
            .html('<input value.state="$parent.text">')
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        assert.strictEqual(getBy('input').value, '456');
    });
    it('remains in state boundary via this in .state command', async function () {
        const state = { text: '123' };
        const { getBy } = await createFixture
            .component({ text: '456' })
            .html('<input value.state="this.text">')
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        assert.strictEqual(getBy('input').value, '123');
    });
    it('reacts to view model changes', async function () {
        const state = { text: '123' };
        const { component, getBy } = await createFixture
            .component({ value: '--' })
            .html('<input value.state="text + $parent.value">')
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        assert.strictEqual(getBy('input').value, '123--');
        component.value = '';
        await tasksSettled();
        assert.strictEqual(getBy('input').value, '123');
    });
    it('works with promise', async function () {
        const state = { data: () => resolveAfter(1, 'value-1-2') };
        const { getBy } = await createFixture
            .html `<input value.state="data()">`
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        await resolveAfter(2);
        assert.strictEqual(getBy('input').value, 'value-1-2');
    });
    it('works with rx-style observable', async function () {
        let disposeCallCount = 0;
        const state = {
            data: () => {
                return {
                    subscribe(cb) {
                        cb('value-1');
                        setTimeout(() => {
                            cb('value-2');
                        }, 1);
                        return () => { disposeCallCount++; };
                    }
                };
            }
        };
        const { getBy, tearDown } = await createFixture
            .html `<input value.state="data()">`
            .deps(StateDefaultConfiguration.init(state))
            .build().started;
        assert.strictEqual(getBy('input').value, 'value-1');
        await resolveAfter(2);
        assert.strictEqual(getBy('input').value, 'value-2');
        // observable doesn't invoke disposal of the subscription
        // only updating the target
        assert.strictEqual(disposeCallCount, 0);
        await tearDown();
        assert.strictEqual(disposeCallCount, 1);
    });
    describe('& state binding behavior', function () {
        it('connects normal binding to the global store', async function () {
            const { getBy } = await createFixture
                .html `<input value.bind="text & state">`
                .deps(StateDefaultConfiguration.init({ text: '123' }))
                .build().started;
            assert.strictEqual(getBy('input').value, '123');
        });
        it('prevents normal scope traversal', async function () {
            const { getBy } = await createFixture
                .html `<input value.bind="text & state">`
                .component({ text: 'from view model' })
                .deps(StateDefaultConfiguration.init({}))
                .build().started;
            assert.strictEqual(getBy('input').value, '');
        });
        it('allows access to host scope via $parent', async function () {
            const { getBy } = await createFixture
                .html `<input value.bind="$parent.text & state">`
                .component({ text: 'from view model' })
                .deps(StateDefaultConfiguration.init({ text: 'from state' }))
                .build().started;
            assert.strictEqual(getBy('input').value, 'from view model');
        });
        it('works with repeat', async function () {
            const { assertText } = await createFixture
                .html `<button repeat.for="item of items & state">-\${item}</button>`
                .deps(StateDefaultConfiguration.init({ items: ['sleep', 'exercise', 'eat'] }))
                .build().started;
            assertText('-sleep-exercise-eat');
        });
        it('works with text interpolation', async function () {
            const { assertText } = await createFixture
                .html `<div>\${text & state}</div>`
                .component({ text: 'from view model' })
                .deps(StateDefaultConfiguration.init({ text: 'from state' }))
                .build().started;
            assertText('from state');
        });
        it('updates text when state changes', async function () {
            const { trigger, getBy } = await createFixture
                .html `<input value.bind="text & state" input.dispatch="$event.target.value">`
                .component({ text: 'from view model' })
                .deps(StateDefaultConfiguration.init({ text: '1' }, (s, a) => ({ text: s.text + a })))
                .build().started;
            trigger('input', 'input');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '11');
        });
        it('updates repeat when state changes', async function () {
            const { trigger, assertText } = await createFixture
                .html `
          <button click.dispatch="''">change</button>
          <center><div repeat.for="item of items & state">\${item}`
                .deps(StateDefaultConfiguration.init({ items: [1, 2, 3] }, () => ({ items: [4, 5, 6] })))
                .build().started;
            assertText('center', '123');
            trigger('button', 'click');
            await tasksSettled();
            assertText('center', '456');
        });
    });
    describe('.dispatch', function () {
        it('dispatches action', async function () {
            const state = { text: '1' };
            const { getBy, trigger } = await createFixture
                .html `<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">`
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => type === 'event' ? { text: s.text + v } : s))
                .build().started;
            assert.strictEqual(getBy('input').value, '1');
            trigger('input', 'input');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '11');
        });
        it('handles multiple action types in a single reducer', async function () {
            const state = { text: '1' };
            const { getBy, trigger } = await createFixture
                .html `
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
          <button click.dispatch="{ type: 'clear' }">Clear</button>
        `
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => type === 'event'
                ? { text: s.text + v }
                : type === 'clear'
                    ? { text: '' }
                    : s))
                .build().started;
            assert.strictEqual(getBy('input').value, '1');
            trigger('input', 'input');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '11');
            trigger.click('button');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '');
        });
        it('does not throw on unreged action type', async function () {
            const state = { text: '1' };
            const { trigger, getBy } = await createFixture
                .html `<input value.state="text" input.dispatch="{ type: 'no-reg', v: $event.target.value }">`
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => type === 'event' ? { text: s.text + v } : s))
                .build().started;
            trigger('input', 'input');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '1');
        });
        it('works with debounce', async function () {
            // firefox not pleasant with throttling & debouncing
            this.retries(3);
            const state = { text: '1' };
            const { getBy, trigger } = createFixture
                .html `<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value } & debounce:5">`
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => type === 'event' ? { text: s.text + v } : s))
                .build();
            trigger('input', 'input');
            await resolveAfter(1);
            assert.strictEqual(getBy('input').value, '1');
            await resolveAfter(10);
            assert.strictEqual(getBy('input').value, '11');
        });
        it('works with throttle', async function () {
            // firefox not pleasant with throttling & debouncing
            this.retries(3);
            let actionCallCount = 0;
            const state = { text: '1' };
            const { getBy, trigger } = await createFixture
                .html `<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value } & throttle:10">`
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => {
                if (type === 'event') {
                    actionCallCount++;
                    return { text: s.text + v };
                }
                return s;
            }))
                .build().started;
            trigger('input', 'input');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '11');
            trigger('input', 'input');
            await resolveAfter(1);
            assert.strictEqual(getBy('input').value, '11');
            await resolveAfter(20);
            assert.strictEqual(actionCallCount, 2);
            assert.strictEqual(getBy('input').value, '1111');
        });
        it('notifies changes only once for single synchronous dispatch', async function () {
            let started = 0;
            const logs = [];
            const state = { text: '1', click: 0 };
            const { trigger } = await createFixture
                .html `
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
          <button click.dispatch="{ type: 'click' }">Change</button>
        `
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => {
                if (type === 'event') {
                    return { ...s, text: s.text + v };
                }
                if (type === 'click') {
                    return { ...s, click: s.click + 1 };
                }
                return s;
            }))
                .component((() => {
                var _a;
                let _text_decorators;
                let _text_initializers = [];
                let _text_extraInitializers = [];
                return _a = class {
                        constructor() {
                            this.text = __runInitializers(this, _text_initializers, void 0);
                            __runInitializers(this, _text_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _text_decorators = [fromState(state => {
                                if (started > 0) {
                                    logs.push({ ...state });
                                }
                                return state.text;
                            })];
                        __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })())
                .build().started;
            started = 1;
            trigger('input', 'input');
            trigger('button', 'click');
            assert.deepEqual(logs, [
                { text: '11', click: 0 },
                { text: '11', click: 1 }
            ]);
        });
        it('notifies changes only once for single asynchronous dispatch', async function () {
            let started = 0;
            const logs = [];
            const state = { text: '1', click: 0 };
            const { trigger, assertValue } = await createFixture
                .html `
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
        `
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => {
                return Promise.resolve().then(() => {
                    if (type === 'event') {
                        return { ...s, text: s.text + v };
                    }
                    if (type === 'click') {
                        return { ...s, click: s.click + 1 };
                    }
                    return s;
                });
            }))
                .component((() => {
                var _a;
                let _text_decorators;
                let _text_initializers = [];
                let _text_extraInitializers = [];
                return _a = class {
                        constructor() {
                            this.text = __runInitializers(this, _text_initializers, void 0);
                            __runInitializers(this, _text_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _text_decorators = [fromState(state => {
                                if (started > 0) {
                                    logs.push({ ...state });
                                }
                                return state.text;
                            })];
                        __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })())
                .build().started;
            started = 1;
            trigger('input', 'input');
            await resolveAfter(1);
            assert.deepEqual(logs, [
                { text: '11', click: 0 },
            ]);
            await resolveAfter(1);
            assertValue('input', '11');
        });
        it('notifies change for every dispatch', async function () {
            let started = false;
            const logs = [];
            const state = { text: '1', click: 0 };
            const { trigger, assertValue } = await createFixture
                .html `
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
          <button click.dispatch="{ type: 'click' }">Change</button>
        `
                .deps(StateDefaultConfiguration.init(state, (s, { type, v }) => {
                return Promise.resolve().then(() => {
                    if (type === 'event') {
                        return { ...s, text: s.text + v };
                    }
                    if (type === 'click') {
                        return { ...s, click: s.click + 1 };
                    }
                    return s;
                });
            }))
                .component((() => {
                var _a;
                let _text_decorators;
                let _text_initializers = [];
                let _text_extraInitializers = [];
                return _a = class {
                        constructor() {
                            this.text = __runInitializers(this, _text_initializers, void 0);
                            __runInitializers(this, _text_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _text_decorators = [fromState(state => {
                                if (started) {
                                    logs.push({ ...state });
                                }
                                return state.text;
                            })];
                        __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })())
                .build().started;
            started = true;
            trigger('input', 'input');
            trigger('button', 'click');
            assert.deepEqual(logs, []);
            await resolveAfter(1);
            assert.deepEqual(logs, [
                { text: '11', click: 0 },
                { text: '11', click: 1 }
            ]);
            await resolveAfter(1);
            await tasksSettled();
            assertValue('input', '11');
            trigger('input', 'input');
            trigger('button', 'click');
            await resolveAfter(1);
            assert.deepEqual(logs, [
                { text: '11', click: 0 },
                { text: '11', click: 1 },
                { text: '1111', click: 1 },
                { text: '1111', click: 2 },
            ]);
            assertValue('input', '1111');
            await resolveAfter(1);
            assertValue('input', '1111');
        });
    });
    describe('@state decorator', function () {
        it('works on custom element', async function () {
            let MyEl = (() => {
                let _classDecorators = [customElement({ name: 'my-el', template: `<input value.bind="text">` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _text_decorators;
                let _text_initializers = [];
                let _text_extraInitializers = [];
                var MyEl = _classThis = class {
                    constructor() {
                        this.text = __runInitializers(this, _text_initializers, void 0);
                        __runInitializers(this, _text_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "MyEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _text_decorators = [fromState(s => s.text)];
                    __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyEl = _classThis;
            })();
            const state = { text: '1' };
            const { getBy } = await createFixture
                .html `<my-el>`
                .deps(MyEl, StateDefaultConfiguration.init(state))
                .build().started;
            assert.strictEqual(getBy('input').value, '1', 'text-input value');
        });
        it('works on custom attribute', async function () {
            let MyAttr = (() => {
                let _classDecorators = [customAttribute('myattr')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _set_text_decorators;
                var MyAttr = _classThis = class {
                    constructor() {
                        this.$controller = __runInitializers(this, _instanceExtraInitializers);
                    }
                    set text(v) {
                        this.$controller.host.setAttribute('hello', 'world');
                    }
                };
                __setFunctionName(_classThis, "MyAttr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _set_text_decorators = [fromState(s => s.text)];
                    __esDecorate(_classThis, null, _set_text_decorators, { kind: "setter", name: "text", static: false, private: false, access: { has: obj => "text" in obj, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyAttr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyAttr = _classThis;
            })();
            const state = { text: '1' };
            const { queryBy } = await createFixture
                .html `<div myattr>`
                .deps(MyAttr, StateDefaultConfiguration.init(state))
                .build().started;
            assert.notStrictEqual(queryBy('div[hello=world]'), null);
        });
        it('updates when state changed', async function () {
            let MyEl = (() => {
                let _classDecorators = [customElement({ name: 'my-el', template: `<input value.bind="text" input.dispatch="{ type: 'input', v: $event.target.value }">` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _text_decorators;
                let _text_initializers = [];
                let _text_extraInitializers = [];
                var MyEl = _classThis = class {
                    constructor() {
                        this.text = __runInitializers(this, _text_initializers, void 0);
                        __runInitializers(this, _text_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "MyEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _text_decorators = [fromState(s => s.text)];
                    __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyEl = _classThis;
            })();
            const state = { text: '1' };
            const { trigger, getBy } = await createFixture
                .html `<my-el>`
                .deps(MyEl, StateDefaultConfiguration.init(state, (s, { v }) => ({ text: s.text + v })))
                .build().started;
            trigger('input', 'input');
            await tasksSettled();
            assert.strictEqual(getBy('input').value, '11');
        });
        it('updates custom attribute prop when state changes', async function () {
            let MyAttr = (() => {
                let _classDecorators = [customAttribute('myattr')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _set_text_decorators;
                var MyAttr = _classThis = class {
                    constructor() {
                        this.$controller = __runInitializers(this, _instanceExtraInitializers);
                    }
                    set text(v) {
                        this.$controller.host.setAttribute('hello', v);
                    }
                };
                __setFunctionName(_classThis, "MyAttr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _set_text_decorators = [fromState(s => s.text)];
                    __esDecorate(_classThis, null, _set_text_decorators, { kind: "setter", name: "text", static: false, private: false, access: { has: obj => "text" in obj, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyAttr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyAttr = _classThis;
            })();
            const state = { text: '1' };
            const { trigger, queryBy } = await createFixture
                .html `<div myattr click.dispatch="{ type: '' }">`
                .deps(MyAttr, StateDefaultConfiguration.init(state, () => ({ text: '2' })))
                .build().started;
            trigger('div', 'click');
            assert.notStrictEqual(queryBy('div[hello="2"]'), null);
        });
    });
    describe('middleware', function () {
        it('throws on action that throws synchronously', function () {
            const state = { text: '1' };
            const { container } = createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, () => {
                throw new Error('err');
            }))
                .build();
            const store = container.get(Store);
            try {
                void store.dispatch({ type: 'increment' });
                assert.fail('should have thrown');
            }
            catch (ex) {
                assert.strictEqual(ex.message, 'err');
            }
        });
        it('executes before middleware before action handlers', function () {
            const logs = [];
            const state = { counter: 0 };
            const beforeMiddleware = (s, _action) => {
                logs.push('before middleware');
                return s;
            };
            const actionHandler = (s, _action) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: beforeMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build();
            const store = ctx.container.get(Store);
            void store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['before middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 1 });
        });
        it('executes after middleware after action handlers', async function () {
            const logs = [];
            const state = { counter: 0 };
            const afterMiddleware = (s, _action) => {
                logs.push('after middleware');
                return s;
            };
            const actionHandler = (s, _action) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: afterMiddleware, placement: 'after' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            void store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['action handler', 'after middleware']);
            assert.deepStrictEqual(store.getState(), { counter: 1 });
        });
        it('allows middleware to modify state', async function () {
            const state = { counter: 0, modified: false };
            const beforeMiddleware = (s, _action) => {
                return { ...s, modified: true };
            };
            const actionHandler = (s, _action) => {
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: beforeMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            void store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(store.getState(), { counter: 1, modified: true });
        });
        it('can block action execution by returning false', async function () {
            const state = { counter: 0 };
            const blockingMiddleware = () => {
                return false; // Block the action
            };
            const actionHandler = (s) => {
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: blockingMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            // State should remain unchanged
            assert.deepStrictEqual(store.getState(), { counter: 0 });
        });
        it('can register and unregister middleware at runtime', async function () {
            const logs = [];
            const state = { counter: 0 };
            const middleware = (s) => {
                logs.push('middleware executed');
                return s;
            };
            const actionHandler = (s) => {
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            // Register middleware
            store.registerMiddleware(middleware, 'before');
            await store.dispatch({ type: 'increment' });
            assert.strictEqual(logs.length, 1);
            // Unregister middleware
            store.unregisterMiddleware(middleware);
            await store.dispatch({ type: 'increment' });
            // Should still be 1 (middleware not executed second time)
            assert.strictEqual(logs.length, 1);
        });
        it('continues execution when middleware throws error', async function () {
            const logs = [];
            const state = { counter: 0 };
            const errorMiddleware = () => {
                logs.push('error middleware');
                throw new Error('Test error');
            };
            const normalMiddleware = (s) => {
                logs.push('normal middleware');
                return s;
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: errorMiddleware, placement: 'before' },
                    { middleware: normalMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            // All should execute despite the error
            assert.deepStrictEqual(logs, ['error middleware', 'normal middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 1 });
            logs.length = 0;
            await store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['error middleware', 'normal middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 2 });
        });
        it('continues execution when async middleware throws error', async function () {
            const logs = [];
            const state = { counter: 0 };
            const errorMiddleware = async () => {
                logs.push('error middleware');
                await new Promise(resolve => setTimeout(resolve, 1));
                throw new Error('Test error');
            };
            const normalMiddleware = (s) => {
                logs.push('normal middleware');
                return s;
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: errorMiddleware, placement: 'before' },
                    { middleware: normalMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            // All should execute despite the error
            assert.deepStrictEqual(logs, ['error middleware', 'normal middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 1 });
            logs.length = 0;
            await store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['error middleware', 'normal middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 2 });
        });
        it('executes async middleware and applies its result', async function () {
            const logs = [];
            const state = { counter: 0 };
            const asyncMiddleware = async (s) => {
                await new Promise(resolve => setTimeout(resolve, 1));
                logs.push('async middleware');
                return { ...s, counter: 999 }; // Should be applied
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: asyncMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            const dispatchResult = store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, []);
            await dispatchResult;
            // Both async middleware and action handler should execute
            assert.deepStrictEqual(logs, ['async middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 1000 });
        });
        it('handles multiple middlewares with async in mix (executes all in order)', async function () {
            const logs = [];
            const state = { counter: 0, processedBy: [] };
            const syncMiddleware = (s) => {
                logs.push('sync middleware');
                return { ...s, processedBy: [...s.processedBy, 'sync'] };
            };
            const asyncMiddleware = async (s) => {
                await new Promise(resolve => setTimeout(resolve, 1));
                logs.push('async middleware');
                return { ...s, processedBy: [...s.processedBy, 'async'] };
            };
            const syncMiddleware2 = (s) => {
                logs.push('sync middleware 2');
                return { ...s, processedBy: [...s.processedBy, 'sync2'] };
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1, processedBy: [...s.processedBy, 'handler'] };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: syncMiddleware, placement: 'before' },
                    { middleware: asyncMiddleware, placement: 'before' },
                    { middleware: syncMiddleware2, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            // All middlewares should execute in order before handler
            assert.deepStrictEqual(logs, ['sync middleware', 'async middleware', 'sync middleware 2', 'action handler']);
            assert.deepStrictEqual(store.getState(), {
                counter: 1,
                processedBy: ['sync', 'async', 'sync2', 'handler']
            });
        });
        it('handles sync middleware that throws errors', async function () {
            const logs = [];
            const state = { counter: 0 };
            const errorMiddleware = () => {
                logs.push('error middleware');
                throw new Error('Sync middleware error');
            };
            const normalMiddleware = (s) => {
                logs.push('normal middleware');
                return s;
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: errorMiddleware, placement: 'before' },
                    { middleware: normalMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            // Should continue execution despite sync error in middleware
            assert.deepStrictEqual(logs, ['error middleware', 'normal middleware', 'action handler']);
            assert.deepStrictEqual(store.getState(), { counter: 1 });
        });
        it('handles sync middleware that returns false to block action', function () {
            const logs = [];
            const state = { counter: 0 };
            const syncBlockingMiddleware = () => {
                logs.push('sync blocking middleware');
                return false; // Block the action
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: syncBlockingMiddleware, placement: 'before' }
                ]
            }, actionHandler))
                .build();
            const store = ctx.container.get(Store);
            void store.dispatch({ type: 'increment' });
            // Action should be blocked
            assert.deepStrictEqual(logs, ['sync blocking middleware']);
            assert.deepStrictEqual(store.getState(), { counter: 0 });
            void store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['sync blocking middleware', 'sync blocking middleware']);
            assert.deepStrictEqual(store.getState(), { counter: 0 });
        });
        it('handles sync after middleware', async function () {
            const logs = [];
            const state = { counter: 0, modified: false };
            const syncAfterMiddleware = (s) => {
                logs.push('sync after middleware');
                return { ...s, modified: true };
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1 };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: syncAfterMiddleware, placement: 'after' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['action handler', 'sync after middleware']);
            assert.deepStrictEqual(store.getState(), { counter: 1, modified: true });
        });
        it('handles multiple sync middlewares in sequence', async function () {
            const logs = [];
            const state = { counter: 0, processedBy: [] };
            const syncMiddleware1 = (s) => {
                logs.push('sync middleware 1');
                return { ...s, processedBy: [...s.processedBy, 'middleware1'] };
            };
            const syncMiddleware2 = (s) => {
                logs.push('sync middleware 2');
                return { ...s, processedBy: [...s.processedBy, 'middleware2'] };
            };
            const actionHandler = (s) => {
                logs.push('action handler');
                return { ...s, counter: s.counter + 1, processedBy: [...s.processedBy, 'handler'] };
            };
            const { ctx } = await createFixture
                .html `<div>`
                .deps(StateDefaultConfiguration.init(state, {
                middlewares: [
                    { middleware: syncMiddleware1, placement: 'before' },
                    { middleware: syncMiddleware2, placement: 'before' }
                ]
            }, actionHandler))
                .build().started;
            const store = ctx.container.get(Store);
            await store.dispatch({ type: 'increment' });
            assert.deepStrictEqual(logs, ['sync middleware 1', 'sync middleware 2', 'action handler']);
            assert.deepStrictEqual(store.getState(), {
                counter: 1,
                processedBy: ['middleware1', 'middleware2', 'handler']
            });
        });
    });
    describe('createStateMemoizer', function () {
        it('memoizes results based on dependencies', function () {
            const items = [1, 2, 3];
            let computeCalls = 0;
            const total = createStateMemoizer((s) => s.items, (i) => { computeCalls++; return i.reduce((a, b) => a + b, 0); });
            const s1 = { items, flag: true };
            assert.strictEqual(total(s1), 6);
            assert.strictEqual(computeCalls, 1);
            const s2 = { items, flag: false };
            assert.strictEqual(total(s2), 6);
            assert.strictEqual(computeCalls, 1);
            const s3 = { items: [1, 2, 3, 4], flag: false };
            assert.strictEqual(total(s3), 10);
            assert.strictEqual(computeCalls, 2);
        });
        it('memoizes when single selector is provided', function () {
            let calls = 0;
            const selectFlag = createStateMemoizer((s) => { calls++; return s.flag; });
            const s = { flag: true };
            assert.strictEqual(selectFlag(s), true);
            selectFlag(s);
            assert.strictEqual(calls, 1);
        });
    });
    it('works with the fromState decorator', async function () {
        let computeCalls = 0;
        const selectTotal = createStateMemoizer((s) => s.items, items => { computeCalls++; return items.reduce((a, b) => a + b, 0); });
        let MyEl = (() => {
            let _classDecorators = [customElement({ name: 'my-el', template: `\${total}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _total_decorators;
            let _total_initializers = [];
            let _total_extraInitializers = [];
            var MyEl = _classThis = class {
                constructor() {
                    this.total = __runInitializers(this, _total_initializers, void 0);
                    __runInitializers(this, _total_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "MyEl");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _total_decorators = [fromState(selectTotal)];
                __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: obj => "total" in obj, get: obj => obj.total, set: (obj, value) => { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyEl = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyEl = _classThis;
        })();
        const state = { items: [1, 2, 3], flag: false };
        const { trigger, assertText } = await createFixture
            .html `
        <my-el></my-el>
        <button id="flag" click.dispatch="{ type: 'toggle' }"></button>
        <button id="add" click.dispatch="{ type: 'add', value: 4 }"></button>
      `
            .deps(MyEl, StateDefaultConfiguration.init(state, (s, a) => {
            if (a.type === 'toggle') {
                return { ...s, flag: !s.flag };
            }
            if (a.type === 'add') {
                return { ...s, items: [...s.items, a.value] };
            }
            return s;
        }))
            .build().started;
        assertText('my-el', '6');
        assert.strictEqual(computeCalls, 1);
        trigger('#flag', 'click');
        await Promise.resolve();
        assertText('my-el', '6');
        assert.strictEqual(computeCalls, 1);
        trigger('#add', 'click');
        await Promise.resolve();
        assertText('my-el', '10');
        assert.strictEqual(computeCalls, 2);
    });
    it('shares memoized results across components', async function () {
        let computeCalls = 0;
        const selectTotal = createStateMemoizer((s) => s.items, items => { computeCalls++; return items.reduce((a, b) => a + b, 0); });
        let ElA = (() => {
            let _classDecorators = [customElement({ name: 'el-a', template: `\${total}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _total_decorators;
            let _total_initializers = [];
            let _total_extraInitializers = [];
            var ElA = _classThis = class {
                constructor() {
                    this.total = __runInitializers(this, _total_initializers, void 0);
                    __runInitializers(this, _total_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "ElA");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _total_decorators = [fromState(selectTotal)];
                __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: obj => "total" in obj, get: obj => obj.total, set: (obj, value) => { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ElA = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ElA = _classThis;
        })();
        let ElB = (() => {
            let _classDecorators = [customElement({ name: 'el-b', template: `\${total}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _total_decorators;
            let _total_initializers = [];
            let _total_extraInitializers = [];
            var ElB = _classThis = class {
                constructor() {
                    this.total = __runInitializers(this, _total_initializers, void 0);
                    __runInitializers(this, _total_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "ElB");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _total_decorators = [fromState(selectTotal)];
                __esDecorate(null, null, _total_decorators, { kind: "field", name: "total", static: false, private: false, access: { has: obj => "total" in obj, get: obj => obj.total, set: (obj, value) => { obj.total = value; } }, metadata: _metadata }, _total_initializers, _total_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ElB = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ElB = _classThis;
        })();
        const state = { items: [1, 2, 3], flag: false };
        const { trigger, assertText } = await createFixture
            .html `
        <el-a></el-a>
        <el-b></el-b>
        <button id="flag" click.dispatch="{ type: 'toggle' }"></button>
        <button id="add" click.dispatch="{ type: 'add', value: 4 }"></button>
      `
            .deps(ElA, ElB, StateDefaultConfiguration.init(state, (s, a) => {
            if (a.type === 'toggle') {
                return { ...s, flag: !s.flag };
            }
            if (a.type === 'add') {
                return { ...s, items: [...s.items, a.value] };
            }
            return s;
        }))
            .build().started;
        assertText('el-a', '6');
        assertText('el-b', '6');
        assert.strictEqual(computeCalls, 1);
        trigger('#flag', 'click');
        await Promise.resolve();
        assertText('el-a', '6');
        assertText('el-b', '6');
        assert.strictEqual(computeCalls, 1);
        trigger('#add', 'click');
        await Promise.resolve();
        assertText('el-a', '10');
        assertText('el-b', '10');
        assert.strictEqual(computeCalls, 2);
    });
});
const resolveAfter = (time, value) => new Promise(r => setTimeout(() => r(value), time));
//# sourceMappingURL=state.spec.js.map