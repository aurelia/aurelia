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
import { observable, SetterObserver, IObserverLocator } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';
import { noop, resolve } from '@aurelia/kernel';
import { ValueConverter, customElement, watch } from '@aurelia/runtime-html';
describe('3-runtime-html/decorator-observable.spec.ts', function () {
    const oldValue = 'old';
    const newValue = 'new';
    // [UNIT] tests needed:         change handler, symbol key, symbol change handler
    // todo: define the spec how it should behave for:
    // [INTEGRATION] tests needed:  <select 2 way /> <radio 2 way />
    it('initializes with TS', function () {
        let callCount = 0;
        let Test = (() => {
            var _a;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            return _a = class Test {
                    valueChanged() {
                        callCount++;
                    }
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, oldValue);
                        __runInitializers(this, _value_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [observable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const instance = new Test();
        // with TC39 decorator, the initialization callback can be avoided.
        assert.strictEqual(callCount, 0);
        assert.strictEqual(instance.value, oldValue);
        assert.notInstanceOf(instance.$observers['value'], SetterObserver);
        instance.value = newValue;
        assert.strictEqual(callCount, 1);
        assert.strictEqual(instance.value, newValue);
    });
    it('should not call valueChanged when property is assigned the same value', function () {
        let callCount = 0;
        let Test = (() => {
            var _a;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            return _a = class Test {
                    valueChanged() {
                        callCount++;
                    }
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, oldValue);
                        __runInitializers(this, _value_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [observable];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const instance = new Test();
        assert.strictEqual(callCount, 0);
        instance.value = oldValue;
        assert.strictEqual(callCount, 0);
    });
    it('initialize with Babel property decorator', function () {
        let callCount = 0;
        class Test {
            constructor() {
                // this mimics the generated code by Babel
                const instanceInitializers = [];
                const metadata = Object.create(null);
                const context = {
                    kind: 'field',
                    name: 'value',
                    addInitializer: (fn) => instanceInitializers.push(fn),
                    private: false,
                    static: false,
                    metadata,
                    access: {
                        get(object) {
                            return object.value;
                        },
                        set(object, value) {
                            object.value = value;
                        },
                        has(object) {
                            return 'value' in object;
                        }
                    }
                };
                const valueInitializer = observable(undefined, context);
                Object.defineProperty(this, 'value', { value: valueInitializer.call(this, oldValue), enumerable: true, configurable: true, writable: true });
                for (const initializer of instanceInitializers) {
                    initializer.call(this);
                }
            }
            valueChanged() {
                callCount++;
            }
        }
        const instance = new Test();
        assert.strictEqual(callCount, 0);
        assert.strictEqual(instance.value, oldValue);
        instance.value = oldValue;
        assert.strictEqual(callCount, 0);
        instance.value = newValue;
        assert.strictEqual(callCount, 1);
    });
    it('should call customHandler when changing the property', function () {
        let callCount = 0;
        let Test = (() => {
            var _a;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            return _a = class Test {
                    customHandler() {
                        callCount++;
                    }
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, oldValue);
                        __runInitializers(this, _value_extraInitializers);
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [observable({ callback: 'customHandler' })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })();
        const instance = new Test();
        assert.strictEqual(callCount, 0);
        instance.value = newValue;
        assert.strictEqual(callCount, 1);
        instance.customHandler = noop;
        instance.value = oldValue;
        // change handler is resolved once
        assert.strictEqual(callCount, 2);
    });
    describe('with normal app', function () {
        it('works in basic scenario', async function () {
            const noValue = {};
            let $div = noValue;
            let App = (() => {
                var _a;
                let _div_decorators;
                let _div_initializers = [];
                let _div_extraInitializers = [];
                return _a = class App {
                        divChanged(div) {
                            $div = div;
                        }
                        constructor() {
                            this.div = __runInitializers(this, _div_initializers, void 0);
                            __runInitializers(this, _div_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _div_decorators = [observable];
                        __esDecorate(null, null, _div_decorators, { kind: "field", name: "div", static: false, private: false, access: { has: obj => "div" in obj, get: obj => obj.div, set: (obj, value) => { obj.div = value; } }, metadata: _metadata }, _div_initializers, _div_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { component, platform, testHost, tearDown, startPromise } = createFixture(`<div ref="div"></div>\${div.tagName}`, App);
            await startPromise;
            assert.notDeepStrictEqual($div, noValue);
            assert.strictEqual(testHost.textContent, 'DIV');
            component.div = { tagName: 'hello' };
            platform.domQueue.flush();
            assert.strictEqual(testHost.textContent, 'hello');
            await tearDown();
        });
        it('works for 2 way binding', async function () {
            let changeCount = 0;
            let App = (() => {
                var _a;
                let _v_decorators;
                let _v_initializers = [];
                let _v_extraInitializers = [];
                return _a = class App {
                        vChanged(_input) {
                            changeCount++;
                        }
                        constructor() {
                            this.v = __runInitializers(this, _v_initializers, void 0);
                            __runInitializers(this, _v_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _v_decorators = [observable];
                        __esDecorate(null, null, _v_decorators, { kind: "field", name: "v", static: false, private: false, access: { has: obj => "v" in obj, get: obj => obj.v, set: (obj, value) => { obj.v = value; } }, metadata: _metadata }, _v_initializers, _v_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { ctx, component, platform, testHost, tearDown, startPromise } = createFixture('<input value.bind="v">', App);
            await startPromise;
            const input = testHost.querySelector('input');
            assert.strictEqual(input.value, '');
            component.v = 'v';
            assert.strictEqual(changeCount, 1);
            assert.strictEqual(input.value, '');
            platform.domQueue.flush();
            assert.strictEqual(changeCount, 1);
            assert.strictEqual(input.value, 'v');
            input.value = 'vv';
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 'vv');
            assert.strictEqual(changeCount, 2);
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 'vv');
            assert.strictEqual(changeCount, 2);
            await tearDown();
        });
        it('works with 2 way binding and converter', async function () {
            let changeCount = 0;
            let App = (() => {
                var _a;
                let _v_decorators;
                let _v_initializers = [];
                let _v_extraInitializers = [];
                return _a = class App {
                        vChanged(_input) {
                            changeCount++;
                        }
                        constructor() {
                            this.v = __runInitializers(this, _v_initializers, void 0);
                            __runInitializers(this, _v_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _v_decorators = [observable({
                                set: v => Number(v) || 0
                            })];
                        __esDecorate(null, null, _v_decorators, { kind: "field", name: "v", static: false, private: false, access: { has: obj => "v" in obj, get: obj => obj.v, set: (obj, value) => { obj.v = value; } }, metadata: _metadata }, _v_initializers, _v_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { ctx, component, platform, testHost, tearDown, startPromise } = createFixture('<input value.bind="v">', App);
            await startPromise;
            const input = testHost.querySelector('input');
            assert.strictEqual(input.value, '', 'err1');
            component.v = 'v';
            assert.strictEqual(component.v, 0, 'err2');
            assert.strictEqual(changeCount, 1, 'err3');
            assert.strictEqual(input.value, '', 'err4');
            platform.domQueue.flush();
            assert.strictEqual(changeCount, 1, 'err5');
            assert.strictEqual(input.value, '0', 'err6');
            input.value = 'vv';
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 0, 'err7');
            assert.strictEqual(changeCount, 1, 'err8');
            assert.strictEqual(input.value, 'vv', 'err9');
            platform.domQueue.flush();
            // for this assignment, the component.v still 0
            // so there was no change, and it's not propagated back to the input
            assert.strictEqual(input.value, 'vv', 'err10');
            assert.strictEqual(component.v, 0, 'err11');
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 0, 'err12');
            assert.strictEqual(changeCount, 1, 'err13');
            assert.strictEqual(input.value, 'vv', 'err14');
            platform.domQueue.flush();
            assert.strictEqual(input.value, 'vv', 'err15');
            assert.strictEqual(component.v, 0, 'err16');
            // real valid input assertion
            input.value = '1';
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 1, 'err17');
            assert.strictEqual(changeCount, 2, 'err18');
            platform.domQueue.flush();
            assert.strictEqual(input.value, '1', 'err19');
            await tearDown();
        });
        it('works with 2 way binding and value converter', async function () {
            let changeCount = 0;
            let App = (() => {
                var _a;
                let _v_decorators;
                let _v_initializers = [];
                let _v_extraInitializers = [];
                return _a = class App {
                        vChanged(_input) {
                            changeCount++;
                        }
                        constructor() {
                            this.v = __runInitializers(this, _v_initializers, void 0);
                            __runInitializers(this, _v_extraInitializers);
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _v_decorators = [observable({
                                set: v => Number(v) || 0
                            })];
                        __esDecorate(null, null, _v_decorators, { kind: "field", name: "v", static: false, private: false, access: { has: obj => "v" in obj, get: obj => obj.v, set: (obj, value) => { obj.v = value; } }, metadata: _metadata }, _v_initializers, _v_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { ctx, component, platform, testHost, tearDown, startPromise } = createFixture('<input value.bind="v | two">', App, [ValueConverter.define('two', class {
                    fromView(v) {
                        // converting back and forth with number
                        // so prefixing with '0' to avoid infinite loop
                        return `0${v}`;
                    }
                    toView(v) {
                        return v;
                    }
                })]);
            await startPromise;
            const input = testHost.querySelector('input');
            assert.strictEqual(input.value, '', 'err1');
            component.v = 'v';
            assert.strictEqual(component.v, 0, 'err2');
            assert.strictEqual(changeCount, 1, 'err3');
            assert.strictEqual(input.value, '', 'err4');
            platform.domQueue.flush();
            assert.strictEqual(changeCount, 1, 'err5');
            assert.strictEqual(input.value, '0', 'err6');
            input.value = 'vv';
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 0, 'err7');
            assert.strictEqual(changeCount, 1, 'err8');
            assert.strictEqual(input.value, 'vv', 'err9');
            platform.domQueue.flush();
            // for this assignment, the component.v still 0
            // so there was no change, and it's not propagated back to the input
            assert.strictEqual(input.value, 'vv', 'err10');
            assert.strictEqual(component.v, 0, 'err11');
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 0, 'err12');
            assert.strictEqual(changeCount, 1, 'err13');
            assert.strictEqual(input.value, 'vv', 'err14');
            platform.domQueue.flush();
            assert.strictEqual(input.value, 'vv', 'err15');
            assert.strictEqual(component.v, 0, 'err16');
            // real valid input assertion
            input.value = '1';
            input.dispatchEvent(new ctx.CustomEvent('input'));
            assert.strictEqual(component.v, 1, 'err17');
            assert.strictEqual(changeCount, 2, 'err18');
            platform.domQueue.flush();
            assert.strictEqual(input.value, '1', 'err19');
            await tearDown();
        });
    });
    it('handle recursive changes', function () {
        let MyApp = (() => {
            let _classDecorators = [customElement('')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _count_decorators;
            let _count_initializers = [];
            let _count_extraInitializers = [];
            var MyApp = _classThis = class {
                constructor() {
                    this.message = 'Hello Aurelia 2!';
                    this.logs = [];
                    this.count = __runInitializers(this, _count_initializers, 0);
                    this.countObs = __runInitializers(this, _count_extraInitializers);
                    this.obsLoc = resolve(IObserverLocator);
                }
                created() {
                    this.countObs = this.obsLoc.getObserver(this, 'count');
                    this.countObs.subscribe({
                        handleChange: (value, oldValue) => {
                            if (value > 0 && value < 3) {
                                this.log('S.1. handleChange()', value, oldValue);
                                if (value > oldValue) {
                                    this.count++;
                                }
                                else {
                                    this.count--;
                                }
                            }
                        }
                    });
                }
                countChanged(value) {
                    this.log('P.1. countChanged()', value);
                }
                incr() {
                    if (this.count < 10) {
                        this.count++;
                        this.log('After incr()', this.count);
                        // console.assert(this.count, 9);
                    }
                }
                decr() {
                    if (this.count > 0) {
                        this.count--;
                        this.log('After decr()', this.count);
                        // console.assert(this.count, 1);
                    }
                }
                log(...msgs) {
                    this.logs.push(msgs);
                }
            };
            __setFunctionName(_classThis, "MyApp");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _count_decorators = [observable];
                __esDecorate(null, null, _count_decorators, { kind: "field", name: "count", static: false, private: false, access: { has: obj => "count" in obj, get: obj => obj.count, set: (obj, value) => { obj.count = value; } }, metadata: _metadata }, _count_initializers, _count_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyApp = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyApp = _classThis;
        })();
        const { component, getAllBy, stop } = createFixture(`
      <button click.trigger="incr()">Incr()</button>
      <button click.trigger="decr()">Decr()</button>
      <div id="logs"><div repeat.for="log of logs">\${log}</div></div>
    `, MyApp);
        assert.deepStrictEqual(component.logs, []);
        const [incrButton, decrButton] = getAllBy('button');
        // when clicking on increment, increase count all the way to 3 by 1 at a time
        incrButton.click();
        assert.deepStrictEqual(component.logs, [
            ['S.1. handleChange()', 1, 0],
            ['S.1. handleChange()', 2, 1],
            ['P.1. countChanged()', 3],
            ['After incr()', 3]
        ]);
        // when clicking on decrement, decrease count all the way to 0 by 1 at a time
        decrButton.click();
        assert.deepStrictEqual(component.logs, [
            ['S.1. handleChange()', 1, 0],
            ['S.1. handleChange()', 2, 1],
            ['P.1. countChanged()', 3],
            ['After incr()', 3],
            ['S.1. handleChange()', 2, 3],
            ['S.1. handleChange()', 1, 2],
            ['P.1. countChanged()', 0],
            ['After decr()', 0]
        ]);
        void stop(true);
    });
    // https://github.com/aurelia/aurelia/issues/2022
    it('calls change handler callback after propagating changes', function () {
        const logs = [];
        createFixture('<outer-component>', (() => {
            var _a;
            let _instanceExtraInitializers = [];
            let _prop1_decorators;
            let _prop1_initializers = [];
            let _prop1_extraInitializers = [];
            let _prop2_decorators;
            let _prop2_initializers = [];
            let _prop2_extraInitializers = [];
            let _handleProp1Changed_decorators;
            return _a = class OuterComponent {
                    constructor() {
                        this.prop1 = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _prop1_initializers, 1));
                        this.prop2 = (__runInitializers(this, _prop1_extraInitializers), __runInitializers(this, _prop2_initializers, 1));
                        this.prop3 = (__runInitializers(this, _prop2_extraInitializers), 0);
                    }
                    // trigger point here
                    attached() {
                        this.prop1 = 2;
                    }
                    prop1Changed() {
                        this.prop2 = 2;
                    }
                    prop2Changed() {
                        logs.push(`prop3: ${this.prop3}`);
                    }
                    handleProp1Changed() {
                        this.prop3 = 3;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _prop1_decorators = [observable];
                    _prop2_decorators = [observable];
                    _handleProp1Changed_decorators = [watch('prop1')];
                    __esDecorate(_a, null, _handleProp1Changed_decorators, { kind: "method", name: "handleProp1Changed", static: false, private: false, access: { has: obj => "handleProp1Changed" in obj, get: obj => obj.handleProp1Changed }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _prop1_decorators, { kind: "field", name: "prop1", static: false, private: false, access: { has: obj => "prop1" in obj, get: obj => obj.prop1, set: (obj, value) => { obj.prop1 = value; } }, metadata: _metadata }, _prop1_initializers, _prop1_extraInitializers);
                    __esDecorate(null, null, _prop2_decorators, { kind: "field", name: "prop2", static: false, private: false, access: { has: obj => "prop2" in obj, get: obj => obj.prop2, set: (obj, value) => { obj.prop2 = value; } }, metadata: _metadata }, _prop2_initializers, _prop2_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })());
        assert.deepStrictEqual(logs, ['prop3: 3']);
    });
});
//# sourceMappingURL=decorator-observable.spec.js.map