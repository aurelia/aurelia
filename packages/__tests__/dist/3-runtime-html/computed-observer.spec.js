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
import { computed, ComputedObserver, IDirtyChecker, IObserverLocator, runTasks, tasksSettled } from '@aurelia/runtime';
import { assert, createFixture, eachCartesianJoin, } from '@aurelia/testing';
import { bindable, BindingMode, customElement } from '@aurelia/runtime-html';
describe('3-runtime-html/computed-observer.spec.ts', function () {
    const computedObserverTestCases = [
        {
            title: 'works in basic scenario',
            template: `\${total}`,
            ViewModel: class TestClass {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1 };
                    });
                }
                get total() {
                    return this.items.reduce((total, item) => total + (item.value > 5 ? item.value : 0), 0);
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '40');
                component.items[0].value = 100;
                assert.strictEqual(host.textContent, '40');
                runTasks();
                assert.strictEqual(host.textContent, '140');
                component.items.splice(1, 1, { name: 'item - 1', value: 100 });
                // todo: this scenario
                // component.items[1] = { name: 'item - 1', value: 100 };
                assert.strictEqual(host.textContent, '140');
                runTasks();
                assert.strictEqual(host.textContent, '240');
            },
        },
        {
            title: 'works with [].filter https://github.com/aurelia/aurelia/issues/534',
            template: `\${total}`,
            ViewModel: class App {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                }
                get total() {
                    return this.items.filter(item => item.isDone).length;
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '5');
                component.items[1].isDone = true;
                assert.strictEqual(host.textContent, '5');
                runTasks();
                assert.strictEqual(host.textContent, '6');
            },
        },
        {
            title: 'works with multiple layers of fn call',
            template: `\${total}`,
            ViewModel: class App {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                }
                get total() {
                    return this
                        .items
                        .filter(item => item.isDone)
                        .filter(item => item.value > 1)
                        .length;
                }
            },
            assertFn: (ctx, host, component) => {
                assert.html.textContent(host, '4');
                component.items[1].isDone = true;
                assert.html.textContent(host, '4');
                runTasks();
                assert.html.textContent(host, '5');
            },
        },
        {
            title: 'works with Map.size',
            template: `\${total}`,
            ViewModel: class App {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                    this.itemMap = new Map([1, 2, 3].map(i => [`item - ${i}`, i]));
                }
                get total() {
                    return this.itemMap.size;
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '3');
                component.itemMap.set(`item - 4`, 10);
                assert.strictEqual(host.textContent, '3');
                runTasks();
                assert.strictEqual(host.textContent, '4');
            },
        },
        {
            title: 'works with multiple computed dependencies',
            template: `\${total}`,
            ViewModel: class App {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                }
                get activeItems() {
                    return this.items.filter(i => !i.isDone);
                }
                get total() {
                    return this.activeItems.reduce((total, item) => total + item.value, 0);
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '30' /* idx 0, 2, 4, 6, 8 only */);
                component.items[0].isDone = false;
                assert.strictEqual(component.activeItems.length, 6);
                assert.strictEqual(host.textContent, '30');
                runTasks();
                assert.strictEqual(host.textContent, '31');
            },
        },
        {
            title: 'works with array index',
            template: `\${total}`,
            ViewModel: class AppBase {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                }
                get total() {
                    return this.items[0].value;
                }
            },
            assertFn: (ctx, host, component) => {
                const dirtyChecker = ctx.container.get(IDirtyChecker);
                assert.strictEqual(dirtyChecker.tracked.length, 0, 'Should have had no dirty checking');
                assert.html.textContent(host, '1');
                component.items.splice(0, 1, { name: 'mock', value: 1000 });
                assert.html.textContent(host, '1');
                runTasks();
                assert.html.textContent(host, '1000');
            },
        },
        {
            title: 'Works with <let/>',
            template: `<let real-total.bind="total * 2"></let>\${realTotal}`,
            ViewModel: class App {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                }
                get total() {
                    return this.items.reduce((total, item) => total + item.value, 0);
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '110');
                component.items[0].value = 100;
                assert.strictEqual(host.textContent, '110');
                runTasks();
                assert.strictEqual(host.textContent, '308');
            },
        },
        {
            title: 'Works with [repeat]',
            template: `<div repeat.for="item of activeItems">\${item.value}.</div>`,
            ViewModel: class App {
                constructor() {
                    this.items = Array.from({ length: 10 }, (_, idx) => {
                        return { name: `i-${idx}`, value: idx + 1, isDone: idx % 2 === 0 };
                    });
                }
                get activeItems() {
                    return this.items.filter(i => !i.isDone);
                }
                get total() {
                    return this.activeItems.reduce((total, item) => total + item.value, 0);
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '2.4.6.8.10.');
                component.items[1].isDone = true;
                runTasks();
                assert.strictEqual(host.textContent, '4.6.8.10.');
            },
        },
        {
            title: 'Works with set/get (class property)',
            template: `<input value.bind="nameProp.value">\${nameProp.value}`,
            ViewModel: class App {
                constructor() {
                    this.items = [];
                    this.total = 0;
                    this.nameProp = new Property('value', '');
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '');
                const inputEl = host.querySelector('input');
                inputEl.value = '50';
                inputEl.dispatchEvent(new ctx.CustomEvent('input'));
                assert.strictEqual(host.textContent, '');
                runTasks();
                assert.strictEqual(host.textContent, '50');
                assert.strictEqual(component.nameProp.value, '50');
                assert.strictEqual(component.nameProp._value, '50');
                const observerLocator = ctx.container.get(IObserverLocator);
                const namePropValueObserver = observerLocator
                    .getObserver(component.nameProp, 'value');
                assert.instanceOf(namePropValueObserver, ComputedObserver);
                assert.strictEqual(namePropValueObserver.$get, Object.getOwnPropertyDescriptor(Property.prototype, 'value').get, 'It should have kept information about the original descriptor [[get]]');
                assert.strictEqual(namePropValueObserver.$set, Object.getOwnPropertyDescriptor(Property.prototype, 'value').set, 'It should have kept information about the original descriptor [[set]]');
            },
        },
        {
            title: 'Works with set/get (object literal property)',
            template: `<input value.bind="nameProp.value">\${nameProp.value}`,
            ViewModel: class App {
                constructor() {
                    this.items = [];
                    this.total = 0;
                    this.nameProp = {
                        _value: '',
                        get value() {
                            return this._value;
                        },
                        set value(v) {
                            this._value = v;
                            this.valueChanged.publish();
                        },
                        valueChanged: {
                            publish() { },
                        },
                    };
                }
            },
            assertFn: (ctx, host, component) => {
                assert.strictEqual(host.textContent, '');
                const inputEl = host.querySelector('input');
                inputEl.value = '50';
                inputEl.dispatchEvent(new ctx.CustomEvent('input'));
                assert.strictEqual(host.textContent, '');
                runTasks();
                assert.strictEqual(host.textContent, '50');
                assert.strictEqual(component.nameProp.value, '50');
                assert.strictEqual(component.nameProp._value, '50');
                const observerLocator = ctx.container.get(IObserverLocator);
                const namePropValueObserver = observerLocator
                    .getObserver(component.nameProp, 'value');
                assert.instanceOf(namePropValueObserver, ComputedObserver);
            },
        },
        /* eslint-disable */
        ...[
            ['ArrayBuffer', () => new ArrayBuffer(0)],
            ['Boolean', () => new Boolean()],
            ['DataView', () => new DataView(new ArrayBuffer(0))],
            ['Date', () => new Date()],
            ['Error', () => new Error()],
            ['EvalError', () => new EvalError()],
            ['Float32Array', () => new Float32Array()],
            ['Float64Array', () => new Float64Array()],
            ['Function', () => new Function('')],
            ['Int8Array', () => new Int8Array()],
            ['Int16Array', () => new Int16Array()],
            ['Int64Array', () => new Int32Array()],
            ['Number', () => new Number()],
            ['Promise', () => new Promise(r => r())],
            ['RangeError', () => new RangeError()],
            ['ReferenceError', () => new ReferenceError()],
            ['RegExp', () => new RegExp('a')],
            // ideally, properties on Map & Set that are not special (methods & 'size')
            // should be treated as normal properties, and should be observable by getter/setter
            // though probably it's good to start with not observing unless there's a need for it
            // example: Map/Set subclasses that have special properties.
            // todo: add connectable.observe(target, key) in proxy-observation.ts
            ['Map', () => new Map()],
            ['Set', () => new Set()],
            ['SharedArrayBuffer', () => new SharedArrayBuffer(0)],
            ['String', () => new String()],
            ['SyntaxError', () => new SyntaxError()],
            ['TypeError', () => new TypeError()],
            ['Uint8Array', () => new Uint8Array()],
            ['Uint8ClampedArray', () => new Uint8ClampedArray()],
            ['Uint16Array', () => new Uint16Array()],
            ['Uint32Array', () => new Uint32Array()],
            ['URIError', () => new URIError()],
            ['WeakMap', () => new WeakMap()],
            ['WeakSet', () => new WeakSet()],
            ['Math', () => Math],
            ['JSON', () => JSON],
            ['Reflect', () => Reflect],
            ['Atomics', () => Atomics],
        ].filter(([title, createInstrinsic]) => {
            try {
                switch (Object.prototype.toString.call(createInstrinsic())) {
                    case '[object Object]':
                    case '[object Array]':
                    case '[object Set]':
                    case '[object Map]':
                        return false;
                    default:
                        return true;
                }
            }
            catch {
                return false;
            }
        }).map(([title, createInstrinsic]) => {
            return {
                title: `does not observe ${title}`,
                template: `<div>\${someProp || 'no value'}</div>`,
                ViewModel: class App {
                    constructor() {
                        this.items = [];
                        this.total = 0;
                        this.instrinsic = createInstrinsic();
                    }
                    get someProp() {
                        return this.instrinsic.someProp;
                    }
                },
                assertFn: (ctx, host, component) => {
                    assert.strictEqual(host.textContent, 'no value');
                    component.instrinsic.someProp = 'value';
                    assert.strictEqual(host.textContent, 'no value');
                    runTasks();
                    assert.strictEqual(host.textContent, 'no value');
                    component.instrinsic = { someProp: 'has value' };
                    assert.strictEqual(host.textContent, 'no value');
                    runTasks();
                    assert.strictEqual(host.textContent, 'has value');
                },
            };
        }),
        /* eslint-enable */
    ];
    eachCartesianJoin([computedObserverTestCases], ({ only, title, template, ViewModel, assertFn }) => {
        // eslint-disable-next-line mocha/no-exclusive-tests
        const $it = (title_, fn) => only ? it.only(title_, fn) : it(title_, fn);
        $it(title, async function () {
            const { ctx, component, testHost, tearDown } = createFixture(template, ViewModel);
            await assertFn(ctx, testHost, component);
            // test cases could be sharing the same context document
            // so wait a bit before running the next test
            await tearDown();
        });
    });
    it('works with two layers of getter', async function () {
        const { assertText } = createFixture(`\${msg}`, class MyApp {
            get one() {
                return 'One';
            }
            get onetwo() {
                return `${this.one} two`;
            }
            get msg() {
                return this.onetwo;
            }
        });
        assertText('One two');
    });
    it('observers property in 2nd layer getter', async function () {
        const { component, assertText } = createFixture(`\${msg}`, class MyApp {
            constructor() {
                this.message = 'One';
            }
            get one() {
                return this.message;
            }
            get onetwo() {
                return `${this.one} two`;
            }
            get msg() {
                return this.onetwo;
            }
        });
        assertText('One two');
        component.message = '1';
        runTasks();
        assertText('1 two');
    });
    it('notifies all bindings when multiple bindings use the same getter #2093', async function () {
        // issue summary:
        // with surrogate binding subscribings after content bindings
        // we have the sequence as below:
        //
        // 1. [if] subscribes first, before [class] on <template>
        // 2. when vm state changes,
        //    2.1 [if] gets notified before [class] on <template>
        //      because [if] subscribes to `hasNotifications`, it "short-circuit"
        //      `hasErrors` handleChange()
        //      - [if] retrieves value `hasErrors` observer, without `hasErros`.run()
        //      - `_value` property inside `hasErrors` computed observer is updated
        //    2.2 [class] gets <template> is notified
        //      because `_value` was updated previously in 2.1,
        //      `.run()` doesn't notify any subscribers
        // ---
        // This is because we try to reuse the same property "_value" in computed observer
        // for both new value and old value
        let NotificationWrapper = (() => {
            let _classDecorators = [customElement({
                    name: 'notification-wrapper',
                    template: `
        <template class="wrapper \${hasErrors ? 'has-errors' : ''}">
          <au-slot name="content"></au-slot>
          <div
            id="d2"
            if.bind="state.hasNotifications"
            class="notifications \${hasErrors ? 'red' : ''}"
          >
            hey
          </div>
        </template>
      `
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _errorsInput_decorators;
            let _errorsInput_initializers = [];
            let _errorsInput_extraInitializers = [];
            var NotificationWrapper = _classThis = class {
                constructor() {
                    this.errorsInput = __runInitializers(this, _errorsInput_initializers, []);
                    this.state = __runInitializers(this, _errorsInput_extraInitializers);
                    this.updateState();
                }
                get hasErrors() {
                    return this.state.hasErrors;
                }
                // PRIVATE
                updateState() {
                    const hasErrors = this.errorsInput?.length > 0;
                    const hasNotifications = hasErrors;
                    this.state = {
                        hasErrors,
                        hasNotifications,
                    };
                }
                // EVENT HANDLERS - OBSERVABLES
                propertiesChanged(properties) {
                    if (properties.errorsInput) {
                        this.updateState();
                    }
                }
            };
            __setFunctionName(_classThis, "NotificationWrapper");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _errorsInput_decorators = [bindable({ attribute: 'errors', mode: BindingMode.toView })];
                __esDecorate(null, null, _errorsInput_decorators, { kind: "field", name: "errorsInput", static: false, private: false, access: { has: obj => "errorsInput" in obj, get: obj => obj.errorsInput, set: (obj, value) => { obj.errorsInput = value; } }, metadata: _metadata }, _errorsInput_initializers, _errorsInput_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                NotificationWrapper = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return NotificationWrapper = _classThis;
        })();
        const { trigger, queryBy } = createFixture(`<style>.red { background-color: pink } .has-errors { color: red }</style>
      <notification-wrapper id="d1" errors.bind="errors">
        <button au-slot="content" click.trigger="toggle()">Set error</button>
      </notification-wrapper>
      `, class {
            constructor() {
                this.errors = [];
            }
            toggle() {
                this.errors = ['error'];
            }
        }, [NotificationWrapper]);
        assert.strictEqual(queryBy('.has-errors'), null);
        assert.strictEqual(queryBy('.red'), null);
        trigger.click('button');
        await tasksSettled();
        assert.notStrictEqual(queryBy('.red'), null);
        assert.notStrictEqual(queryBy('.has-errors'), null);
    });
    it('flushes immediately when decorated with @computed({ flush: "sync" })', async function () {
        let i1 = 0;
        let i2 = 0;
        const { component } = createFixture(`\${msg} \${msg2}`, (() => {
            var _a;
            let _instanceExtraInitializers = [];
            let _get_msg_decorators;
            let _get_msg2_decorators;
            return _a = class MyApp {
                    constructor() {
                        this.one = (__runInitializers(this, _instanceExtraInitializers), '1');
                        this.two = '2';
                    }
                    get msg() {
                        i1++;
                        return `${this.one} ${this.two}`;
                    }
                    get msg2() {
                        i2++;
                        return `${this.one} ${this.two}`;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _get_msg_decorators = [computed({ flush: 'sync' })];
                    _get_msg2_decorators = [computed({ flush: 'async' })];
                    __esDecorate(_a, null, _get_msg_decorators, { kind: "getter", name: "msg", static: false, private: false, access: { has: obj => "msg" in obj, get: obj => obj.msg }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(_a, null, _get_msg2_decorators, { kind: "getter", name: "msg2", static: false, private: false, access: { has: obj => "msg2" in obj, get: obj => obj.msg2 }, metadata: _metadata }, null, _instanceExtraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a;
        })());
        assert.deepStrictEqual([i1, i2], [1, 1]);
        component.one = '10';
        assert.deepStrictEqual([i1, i2], [2, 1]);
        component.two = '20';
        assert.deepStrictEqual([i1, i2], [3, 1]);
        await Promise.resolve();
        assert.deepStrictEqual([i1, i2], [3, 2]);
    });
    class Property {
        constructor(name, value) {
            this.name = name;
            this._value = value;
            this.valueChanged = {
                publish: () => {
                    // todo
                }
            };
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.valueChanged.publish();
        }
    }
});
//# sourceMappingURL=computed-observer.spec.js.map