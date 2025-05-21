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
import { alias, valueConverter, bindable, customAttribute, INode, customElement, PropertyBinding, } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
import { resolve } from '@aurelia/kernel';
// TemplateCompiler - value converter integration
describe('3-runtime-html/value-converters.spec.ts', function () {
    // custom elements
    describe('01. Aliases', function () {
        let WootConverter = (() => {
            let _classDecorators = [valueConverter({ name: 'woot1', aliases: ['woot13'] }), alias(...['woot11', 'woot12'])];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var WootConverter = _classThis = class {
                toView() {
                    return 'wOOt1';
                }
            };
            __setFunctionName(_classThis, "WootConverter");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                WootConverter = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return WootConverter = _classThis;
        })();
        let WootConverter2 = (() => {
            let _classDecorators = [valueConverter({ name: 'woot2', aliases: ['woot23'] }), alias('woot21', 'woot22')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var WootConverter2 = _classThis = class {
                toView() {
                    return 'wOOt1';
                }
            };
            __setFunctionName(_classThis, "WootConverter2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                WootConverter2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return WootConverter2 = _classThis;
        })();
        let FooAttribute = (() => {
            let _classDecorators = [customAttribute({ name: 'foo5', aliases: ['foo53'] }), alias(...['foo51', 'foo52'])];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var FooAttribute = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    this.element = (__runInitializers(this, _value_extraInitializers), resolve(INode));
                }
                bound() {
                    this.element.setAttribute('test', this.value);
                }
            };
            __setFunctionName(_classThis, "FooAttribute");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable({ primary: true })];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooAttribute = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooAttribute = _classThis;
        })();
        let FooAttribute2 = (() => {
            let _classDecorators = [customAttribute({ name: 'foo4', aliases: ['foo43'] }), alias('foo41', 'foo42')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var FooAttribute2 = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    this.element = (__runInitializers(this, _value_extraInitializers), resolve(INode));
                }
                bound() {
                    this.element.setAttribute('test', this.value);
                }
            };
            __setFunctionName(_classThis, "FooAttribute2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable({ primary: true })];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooAttribute2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooAttribute2 = _classThis;
        })();
        const resources = [WootConverter, WootConverter2, FooAttribute2, FooAttribute];
        const app = class {
            constructor() {
                this.value = 'wOOt';
            }
        };
        it('Simple spread Alias doesn\'t break def alias works on value converter', async function () {
            const options = createFixture('<template> <div foo53.bind="value | woot13"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple spread Alias (1st position) works on value converter', async function () {
            const options = createFixture('<template> <div foo51.bind="value | woot11"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple spread Alias (2nd position) works on value converter', async function () {
            const options = createFixture('<template> <div foo52.bind="value | woot12"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple spread Alias doesn\'t break original value converter', async function () {
            const options = createFixture('<template> <div foo5.bind="value | woot2"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple Alias doesn\'t break def alias works on value converter', async function () {
            const options = createFixture('<template> <div foo43.bind="value | woot23"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple Alias (1st position) works on value converter', async function () {
            const options = createFixture('<template> <div foo41.bind="value | woot21"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple Alias (2nd position) works on value converter', async function () {
            const options = createFixture('<template> <div foo42.bind="value | woot22"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
        it('Simple Alias doesn\'t break original value converter', async function () {
            const options = createFixture('<template> <div foo4.bind="value | woot2"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt1');
            await options.stop(true);
        });
    });
    describe('02. Caller Context', function () {
        it('passes the binding as the second argument if withContext is true', async function () {
            let CallerAwareConverter = (() => {
                let _classDecorators = [valueConverter({ name: 'callerAware' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var CallerAwareConverter = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(value, caller) {
                        return caller?.binding ? `${value}-called` : value;
                    }
                    fromView(value, caller) {
                        return caller?.binding ? `${value}-from` : value;
                    }
                };
                __setFunctionName(_classThis, "CallerAwareConverter");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CallerAwareConverter = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CallerAwareConverter = _classThis;
            })();
            const resources = [CallerAwareConverter];
            const app = class {
                constructor() {
                    this.value = 'foo';
                }
            };
            const fixture = createFixture('<template> <input value.bind="value | callerAware"></template>', app, resources);
            // toView assertion
            fixture.assertValue('input', 'foo-called');
            fixture.type('input', 'bar');
            assert.strictEqual(fixture.component.value, 'bar-from');
        });
        it('does not pass the binding as the second argument if withContext is not set', async function () {
            let NoCallerConverter = (() => {
                let _classDecorators = [valueConverter('noCaller')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var NoCallerConverter = _classThis = class {
                    toView(value, ...params) {
                        // Should not receive a PropertyBinding as second arg
                        return params.length > 0 && typeof params[0]?.updateTarget === 'function' ? 'fail' : `${value}-plain`;
                    }
                };
                __setFunctionName(_classThis, "NoCallerConverter");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    NoCallerConverter = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return NoCallerConverter = _classThis;
            })();
            const resources = [NoCallerConverter];
            const app = class {
                constructor() {
                    this.value = 'bar';
                }
            };
            const fixture = createFixture('<template> <div>${value | noCaller}</div> </template>', app, resources);
            fixture.assertText('div', 'bar-plain');
        });
        it('passes both the context and additional arguments to a withContext value converter', async function () {
            let receivedContext;
            let receivedArg1, receivedArg2;
            let ContextAndArgsConverter = (() => {
                let _classDecorators = [valueConverter({ name: 'contextAndArgs' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ContextAndArgsConverter = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(value, context, arg1, arg2) {
                        receivedContext = context;
                        receivedArg1 = arg1;
                        receivedArg2 = arg2;
                        return `${value}-${arg1}-${arg2}`;
                    }
                };
                __setFunctionName(_classThis, "ContextAndArgsConverter");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ContextAndArgsConverter = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ContextAndArgsConverter = _classThis;
            })();
            const resources = [ContextAndArgsConverter];
            const app = class {
                constructor() {
                    this.value = 'foo';
                    this.arg1 = 'bar';
                    this.arg2 = 42;
                }
            };
            const fixture = createFixture('<template> <div>${value | contextAndArgs:arg1:arg2}</div> </template>', app, resources);
            fixture.assertText('div', 'foo-bar-42');
            assert.strictEqual(typeof receivedContext, 'object');
            assert.notStrictEqual(receivedContext, null);
            assert.strictEqual(receivedArg1, 'bar');
            assert.strictEqual(receivedArg2, 42);
        });
    });
    describe('03. Caller Context – property & attribute bindings', function () {
        it('provides caller.source for property binding and caller.binding for binding context', async function () {
            let capturedSource = null;
            let capturedBinding = null;
            let PropCallerConverter = (() => {
                let _classDecorators = [valueConverter({ name: 'propCaller' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var PropCallerConverter = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(v, caller) {
                        capturedSource = caller.source;
                        capturedBinding = caller.binding;
                        return v;
                    }
                };
                __setFunctionName(_classThis, "PropCallerConverter");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    PropCallerConverter = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return PropCallerConverter = _classThis;
            })();
            let MyButton = (() => {
                let _classDecorators = [customElement({
                        name: 'my-button',
                        template: '<input value.bind="value | propCaller">',
                        dependencies: [PropCallerConverter]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyButton = _classThis = class {
                    constructor() {
                        this.value = 'hello';
                    }
                };
                __setFunctionName(_classThis, "MyButton");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyButton = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyButton = _classThis;
            })();
            const fixture = createFixture('<template><my-button></my-button></template>', class {
            }, [MyButton]);
            await fixture.startPromise;
            assert.instanceOf(capturedBinding, PropertyBinding);
            assert.instanceOf(capturedSource, MyButton);
            await fixture.stop(true);
        });
        it('provides caller.source for custom attribute binding', async function () {
            let capturedSource = null;
            let capturedBinding = null;
            let AttrCallerConverter = (() => {
                let _classDecorators = [valueConverter({ name: 'attrCaller' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var AttrCallerConverter = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(v, caller) {
                        capturedSource = caller.source;
                        capturedBinding = caller.binding;
                        return v;
                    }
                };
                __setFunctionName(_classThis, "AttrCallerConverter");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    AttrCallerConverter = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return AttrCallerConverter = _classThis;
            })();
            let DummyAttr = (() => {
                let _classDecorators = [customAttribute('dummy')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _value_decorators;
                let _value_initializers = [];
                let _value_extraInitializers = [];
                var DummyAttr = _classThis = class {
                    constructor() {
                        this.value = __runInitializers(this, _value_initializers, void 0);
                        __runInitializers(this, _value_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "DummyAttr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _value_decorators = [bindable({ primary: true })];
                    __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    DummyAttr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return DummyAttr = _classThis;
            })();
            const resources = [AttrCallerConverter, DummyAttr];
            const app = class {
                constructor() {
                    this.value = 'hi';
                }
            };
            const fixture = createFixture('<template><div dummy.bind="value | attrCaller"></div></template>', app, resources);
            assert.instanceOf(capturedBinding, PropertyBinding);
            // source is the component view-model, which is the app instance in this case
            assert.instanceOf(capturedSource, app);
        });
    });
    // 04. Caller Context – component resolution via interpolation
    describe('04. Caller Context - component resolution via interpolation', function () {
        it('captures the component via caller.source and binding via caller.binding when using interpolation in a custom element', async function () {
            let capturedSource = null;
            let capturedBinding = null;
            let VmCallerConverter = (() => {
                let _classDecorators = [valueConverter({ name: 'vmCaller' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var VmCallerConverter = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(v, caller) {
                        capturedSource = caller.source;
                        capturedBinding = caller.binding;
                        return v;
                    }
                };
                __setFunctionName(_classThis, "VmCallerConverter");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    VmCallerConverter = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return VmCallerConverter = _classThis;
            })();
            let MyButton = (() => {
                let _classDecorators = [customElement({
                        name: 'my-button',
                        template: '<button>${label | vmCaller}</button>',
                        dependencies: [VmCallerConverter]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyButton = _classThis = class {
                    constructor() {
                        this.label = 'Press';
                    }
                };
                __setFunctionName(_classThis, "MyButton");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyButton = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyButton = _classThis;
            })();
            const fixture = createFixture('<template><my-button></my-button></template>', class {
            }, [MyButton]);
            assert.instanceOf(capturedBinding, Object); // _ContentBinding or similar
            assert.instanceOf(capturedSource, MyButton);
        });
    });
    // 05. Caller Context – au-slot
    describe('05. Caller Context - au-slot', function () {
        it('provides correct caller.source and caller.binding when VC with context is used in projected content', async function () {
            let capturedSource = null;
            let capturedBinding = null;
            let SlotContextVc = (() => {
                let _classDecorators = [valueConverter({ name: 'slotContextVc' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var SlotContextVc = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(v, caller) {
                        capturedSource = caller.source;
                        capturedBinding = caller.binding;
                        return v;
                    }
                };
                __setFunctionName(_classThis, "SlotContextVc");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    SlotContextVc = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return SlotContextVc = _classThis;
            })();
            let ChildEl = (() => {
                let _classDecorators = [customElement({
                        name: 'child-el',
                        template: '<au-slot></au-slot>',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildEl = _classThis = class {
                };
                __setFunctionName(_classThis, "ChildEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildEl = _classThis;
            })();
            let ParentEl = (() => {
                let _classDecorators = [customElement({
                        name: 'parent-el',
                        template: '<child-el>${message | slotContextVc}</child-el>',
                        dependencies: [ChildEl, SlotContextVc],
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ParentEl = _classThis = class {
                    constructor() {
                        this.message = 'hello from slot';
                    }
                };
                __setFunctionName(_classThis, "ParentEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ParentEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ParentEl = _classThis;
            })();
            const fixture = createFixture('<parent-el></parent-el>', class {
            }, [ParentEl]);
            await fixture.startPromise;
            assert.instanceOf(capturedBinding, Object, 'capturedBinding should be an object'); // Binding instance
            assert.instanceOf(capturedSource, ParentEl, 'capturedSource should be ParentEl instance');
            assert.strictEqual(capturedSource.message, 'hello from slot');
        });
        it('provides correct caller.source and caller.binding when VC with context is used in projected content with explicit slot name', async function () {
            let capturedSource = null;
            let capturedBinding = null;
            let SlotContextNamedVc = (() => {
                let _classDecorators = [valueConverter({ name: 'slotContextNamedVc' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var SlotContextNamedVc = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(v, caller) {
                        capturedSource = caller.source;
                        capturedBinding = caller.binding;
                        return v;
                    }
                };
                __setFunctionName(_classThis, "SlotContextNamedVc");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    SlotContextNamedVc = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return SlotContextNamedVc = _classThis;
            })();
            let ChildElNamed = (() => {
                let _classDecorators = [customElement({
                        name: 'child-el-named',
                        template: '<au-slot name="s1"></au-slot>',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildElNamed = _classThis = class {
                };
                __setFunctionName(_classThis, "ChildElNamed");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildElNamed = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildElNamed = _classThis;
            })();
            let ParentElNamed = (() => {
                let _classDecorators = [customElement({
                        name: 'parent-el-named',
                        template: '<child-el-named><div au-slot="s1">${message | slotContextNamedVc}</div></child-el-named>',
                        dependencies: [ChildElNamed, SlotContextNamedVc],
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ParentElNamed = _classThis = class {
                    constructor() {
                        this.message = 'hello from named slot';
                    }
                };
                __setFunctionName(_classThis, "ParentElNamed");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ParentElNamed = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ParentElNamed = _classThis;
            })();
            const fixture = createFixture('<parent-el-named></parent-el-named>', class {
            }, [ParentElNamed]);
            await fixture.startPromise;
            assert.instanceOf(capturedBinding, Object, 'capturedBinding should be an object for named slot'); // Binding instance
            assert.instanceOf(capturedSource, ParentElNamed, 'capturedSource should be ParentElNamed instance for named slot');
            assert.strictEqual(capturedSource.message, 'hello from named slot');
        });
        it('provides correct caller.source from repeater scope for VC in slotted content inside repeater', async function () {
            const capturedSources = [];
            const capturedBindings = [];
            let RepeaterSlotVc = (() => {
                let _classDecorators = [valueConverter({ name: 'repeaterSlotVc' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var RepeaterSlotVc = _classThis = class {
                    constructor() {
                        this.withContext = true;
                    }
                    toView(v, caller) {
                        capturedSources.push(caller.source);
                        capturedBindings.push(caller.binding);
                        return v;
                    }
                };
                __setFunctionName(_classThis, "RepeaterSlotVc");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    RepeaterSlotVc = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return RepeaterSlotVc = _classThis;
            })();
            let ChildRepeaterEl = (() => {
                let _classDecorators = [customElement({
                        name: 'child-repeater-el',
                        template: '<au-slot></au-slot>',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildRepeaterEl = _classThis = class {
                };
                __setFunctionName(_classThis, "ChildRepeaterEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildRepeaterEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildRepeaterEl = _classThis;
            })();
            let ParentRepeaterEl = (() => {
                let _classDecorators = [customElement({
                        name: 'parent-repeater-el',
                        template: '<child-repeater-el repeat.for="item of items">${item.name | repeaterSlotVc}</child-repeater-el>',
                        dependencies: [ChildRepeaterEl, RepeaterSlotVc],
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ParentRepeaterEl = _classThis = class {
                    constructor() {
                        this.items = [{ name: 'item1' }, { name: 'item2' }];
                    }
                };
                __setFunctionName(_classThis, "ParentRepeaterEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ParentRepeaterEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ParentRepeaterEl = _classThis;
            })();
            const fixture = createFixture('<parent-repeater-el></parent-repeater-el>', class {
            }, [ParentRepeaterEl]);
            await fixture.startPromise;
            assert.strictEqual(capturedSources.length, 2, 'Should have captured two sources');
            assert.strictEqual(capturedBindings.length, 2, 'Should have captured two bindings');
            assert.instanceOf(capturedSources[0], ParentRepeaterEl, 'First captured source should be ParentRepeaterEl');
            assert.instanceOf(capturedSources[1], ParentRepeaterEl, 'Second captured source should be ParentRepeaterEl');
            assert.strictEqual(capturedSources[0], capturedSources[1], 'Both sources should be the same ParentRepeaterEl instance');
            assert.instanceOf(capturedBindings[0], Object, 'First captured binding should be an object');
            assert.instanceOf(capturedBindings[1], Object, 'Second captured binding should be an object');
            assert.notStrictEqual(capturedBindings[0], capturedBindings[1], 'Bindings should be different for each item');
        });
    });
});
//# sourceMappingURL=value-converters.spec.js.map