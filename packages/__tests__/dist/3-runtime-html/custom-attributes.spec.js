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
import { DI, IContainer, Registration, resolve } from '@aurelia/kernel';
import { observable, } from '@aurelia/runtime';
import { CustomAttribute, IAurelia, INode, IRenderLocation, IViewFactory, alias, bindable, customAttribute, customElement, templateController } from '@aurelia/runtime-html';
import { assert, createFixture, eachCartesianJoin } from '@aurelia/testing';
describe('3-runtime-html/custom-attributes.spec.ts', function () {
    // custom elements
    describe('01. Aliases', function () {
        let Fooatt5 = (() => {
            let _classDecorators = [customAttribute({ name: 'foo5', aliases: ['foo53'] }), alias(...['foo51', 'foo52'])];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var Fooatt5 = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    this.element = (__runInitializers(this, _value_extraInitializers), resolve(INode));
                }
                bound() {
                    this.element.setAttribute('test', this.value);
                }
            };
            __setFunctionName(_classThis, "Fooatt5");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable({ primary: true })];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Fooatt5 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Fooatt5 = _classThis;
        })();
        let Fooatt4 = (() => {
            let _classDecorators = [customAttribute({ name: 'foo4', aliases: ['foo43'] }), alias('foo41', 'foo42')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var Fooatt4 = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    this.element = (__runInitializers(this, _value_extraInitializers), resolve(INode));
                }
                bound() {
                    this.element.setAttribute('test', this.value);
                }
            };
            __setFunctionName(_classThis, "Fooatt4");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable({ primary: true })];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Fooatt4 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Fooatt4 = _classThis;
        })();
        let FooMultipleAlias = (() => {
            let _classDecorators = [customAttribute({ name: 'foo44', aliases: ['foo431'] }), alias('foo411', 'foo421'), alias('foo422', 'foo422')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var FooMultipleAlias = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    this.element = (__runInitializers(this, _value_extraInitializers), resolve(INode));
                }
                bound() {
                    this.element.setAttribute('test', this.value);
                }
            };
            __setFunctionName(_classThis, "FooMultipleAlias");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable({ primary: true })];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooMultipleAlias = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooMultipleAlias = _classThis;
        })();
        const resources = [Fooatt4, Fooatt5, FooMultipleAlias];
        const app = class {
            constructor() {
                this.value = 'wOOt';
            }
        };
        it('Simple spread Alias doesn\'t break def alias works on custom attribute', async function () {
            const options = createFixture('<template> <div foo53.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('2 aliases and attribute alias original works', async function () {
            const options = createFixture('<template> <div foo44.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('2 aliases and attribute alias first alias deco works', async function () {
            const options = createFixture('<template> <div foo411.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('2 aliases and attribute alias def alias works', async function () {
            const options = createFixture('<template> <div foo431.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('2 aliases and attribute alias second alias works', async function () {
            const options = createFixture('<template> <div foo422.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple spread Alias (1st position) works on custom attribute', async function () {
            const options = createFixture('<template> <div foo51.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple spread Alias (2nd position) works on custom attribute', async function () {
            const options = createFixture('<template> <div foo52.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple spread Alias doesn\'t break original custom attribute', async function () {
            const options = createFixture('<template> <div foo5.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple Alias doesn\'t break def alias works on custom attribute', async function () {
            const options = createFixture('<template> <div foo43.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple Alias (1st position) works on custom attribute', async function () {
            const options = createFixture('<template> <div foo41.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple Alias (2nd position) works on custom attribute', async function () {
            const options = createFixture('<template> <div foo42.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
        it('Simple Alias doesn\'t break original custom attribute', async function () {
            const options = createFixture('<template> <div foo4.bind="value"></div> </template>', app, resources);
            assert.strictEqual(options.appHost.firstElementChild.getAttribute('test'), 'wOOt');
            await options.tearDown();
        });
    });
    describe('0.2 Multiple bindings', function () {
        let Multi = (() => {
            let _classDecorators = [customAttribute('multi')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _a_decorators;
            let _a_initializers = [];
            let _a_extraInitializers = [];
            let _b_decorators;
            let _b_initializers = [];
            let _b_extraInitializers = [];
            var Multi = _classThis = class {
                constructor(element = resolve(INode)) {
                    this.element = element;
                    this.a = __runInitializers(this, _a_initializers, void 0);
                    this.b = (__runInitializers(this, _a_extraInitializers), __runInitializers(this, _b_initializers, void 0));
                    this.aResult = __runInitializers(this, _b_extraInitializers);
                    this.element.innerHTML = 'Created';
                }
                bound() {
                    this.aChanged();
                    this.bChanged();
                }
                aChanged() {
                    this.aResult = this.a;
                    this.updateContent();
                }
                bChanged() {
                    this.bResult = this.b;
                    this.updateContent();
                }
                updateContent() {
                    this.element.innerHTML = `a: ${this.aResult}, b: ${this.bResult}`;
                }
            };
            __setFunctionName(_classThis, "Multi");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _a_decorators = [bindable];
                _b_decorators = [bindable];
                __esDecorate(null, null, _a_decorators, { kind: "field", name: "a", static: false, private: false, access: { has: obj => "a" in obj, get: obj => obj.a, set: (obj, value) => { obj.a = value; } }, metadata: _metadata }, _a_initializers, _a_extraInitializers);
                __esDecorate(null, null, _b_decorators, { kind: "field", name: "b", static: false, private: false, access: { has: obj => "b" in obj, get: obj => obj.b, set: (obj, value) => { obj.b = value; } }, metadata: _metadata }, _b_initializers, _b_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Multi = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Multi = _classThis;
        })();
        let Multi2 = (() => {
            let _classDecorators = [customAttribute('multi2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _a_decorators;
            let _a_initializers = [];
            let _a_extraInitializers = [];
            let _b_decorators;
            let _b_initializers = [];
            let _b_extraInitializers = [];
            var Multi2 = _classThis = class {
                constructor(element = resolve(INode)) {
                    this.element = element;
                    this.a = __runInitializers(this, _a_initializers, void 0);
                    this.b = (__runInitializers(this, _a_extraInitializers), __runInitializers(this, _b_initializers, void 0));
                    this.aResult = __runInitializers(this, _b_extraInitializers);
                    this.element.innerHTML = 'Created';
                }
                bound() {
                    this.aChanged();
                    this.bChanged();
                }
                aChanged() {
                    this.aResult = this.a;
                    this.updateContent();
                }
                bChanged() {
                    this.bResult = this.b;
                    this.updateContent();
                }
                updateContent() {
                    this.element.innerHTML = `a: ${this.aResult}, b: ${this.bResult}`;
                }
            };
            __setFunctionName(_classThis, "Multi2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _a_decorators = [bindable];
                _b_decorators = [bindable({ primary: true })];
                __esDecorate(null, null, _a_decorators, { kind: "field", name: "a", static: false, private: false, access: { has: obj => "a" in obj, get: obj => obj.a, set: (obj, value) => { obj.a = value; } }, metadata: _metadata }, _a_initializers, _a_extraInitializers);
                __esDecorate(null, null, _b_decorators, { kind: "field", name: "b", static: false, private: false, access: { has: obj => "b" in obj, get: obj => obj.b, set: (obj, value) => { obj.b = value; } }, metadata: _metadata }, _b_initializers, _b_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Multi2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Multi2 = _classThis;
        })();
        const app = class {
            constructor() {
                this.value = 'bound';
            }
        };
        it('binds to multiple properties correctly', async function () {
            const options = createFixture('<template> <div multi="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi]);
            assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
            await options.tearDown();
        });
        it('binds to multiple properties correctly when there’s a default property', async function () {
            const options = createFixture('<template> <div multi2="a.bind: true; b.bind: value">Initial</div> </template>', app, [Multi2]);
            assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: true, b: bound');
            await options.tearDown();
        });
        it('binds to the default property correctly', async function () {
            const options = createFixture('<template> <div multi2.bind="value">Initial</div> </template>', app, [Multi2]);
            assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: bound');
            await options.tearDown();
        });
        describe('with noMultiBindings: true', function () {
            let Multi3 = (() => {
                let _classDecorators = [customAttribute({
                        name: 'multi3',
                        noMultiBindings: true,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Multi2;
                var Multi3 = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "Multi3");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Multi3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Multi3 = _classThis;
            })();
            it('works with multi binding syntax', async function () {
                const options = createFixture('<template> <div multi3="a.bind: 5; b.bind: 6">Initial</div> </template>', app, [Multi3]);
                assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: a.bind: 5; b.bind: 6');
                await options.tearDown();
            });
            it('works with URL value', async function () {
                const options = createFixture('<template> <div multi3="http://google.com">Initial</div> </template>', app, [Multi3]);
                assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: http://google.com');
                await options.tearDown();
            });
            it('works with escaped colon', async function () {
                const options = createFixture('<template> <div multi3="http\\://google.com">Initial</div> </template>', app, [Multi3]);
                assert.strictEqual(options.appHost.firstElementChild.textContent, 'a: undefined, b: http\\://google.com');
                await options.tearDown();
            });
        });
    });
    describe('03. Change Handler', function () {
        let Foo = (() => {
            let _classDecorators = [customAttribute('foo')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    this.propChangedCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                }
                propChanged() {
                    this.propChangedCallCount++;
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable()];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        it('does not invoke change handler when starts with plain usage', async function () {
            const { fooVm, tearDown } = setupChangeHandlerTest('<div foo="prop"></div>');
            assert.strictEqual(fooVm.propChangedCallCount, 0);
            fooVm.prop = '5';
            assert.strictEqual(fooVm.propChangedCallCount, 1);
            await tearDown();
        });
        it('does not invoke change handler when starts with commands', async function () {
            const { fooVm, tearDown } = setupChangeHandlerTest('<div foo.bind="prop"></foo>');
            assert.strictEqual(fooVm.propChangedCallCount, 0);
            fooVm.prop = '5';
            assert.strictEqual(fooVm.propChangedCallCount, 1);
            await tearDown();
        });
        it('does not invoke change handler when starts with interpolation', async function () {
            const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo="\${prop}"></foo>`);
            assert.strictEqual(fooVm.propChangedCallCount, 0);
            fooVm.prop = '5';
            assert.strictEqual(fooVm.propChangedCallCount, 1);
            await tearDown();
        });
        it('does not invoke change handler when starts with two way binding', async function () {
            const { fooVm, tearDown } = setupChangeHandlerTest(`<div foo.two-way="prop"></foo>`);
            assert.strictEqual(fooVm.propChangedCallCount, 0, '#1 should have had 0 calls at start');
            fooVm.prop = '5';
            assert.strictEqual(fooVm.propChangedCallCount, 1, '#2 shoulda had 1 call after mutation');
            await tearDown();
        });
        function setupChangeHandlerTest(template) {
            const options = createFixture(template, class {
            }, [Foo]);
            const fooEl = options.appHost.querySelector('div');
            const fooVm = CustomAttribute.for(fooEl, 'foo').viewModel;
            return {
                fooVm: fooVm,
                tearDown: () => options.tearDown()
            };
        }
    });
    // in the tests here, we use a combination of change handler and property change handler
    // and assert that they work in the same way, the presence of one callback is equivalent with the other
    // foo1: has both normal change handler and all properties change handler
    // foo2: has only normal change handler
    // foo3: has only all properties change handler
    describe('04. Change handler with "propertyChanged" callback', function () {
        let Foo1 = (() => {
            let _classDecorators = [customAttribute('foo1')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo1 = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    this.propChangedCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                    this.propertyChangedCallCount = 0;
                    this.propertyChangedCallArguments = [];
                }
                propChanged() {
                    this.propChangedCallCount++;
                }
                propertyChanged(...args) {
                    this.propertyChangedCallCount++;
                    this.propertyChangedCallArguments.push(args);
                }
            };
            __setFunctionName(_classThis, "Foo1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable()];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo1 = _classThis;
        })();
        let Foo2 = (() => {
            let _classDecorators = [customAttribute('foo2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo2 = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    this.propChangedCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                    this.propertyChangedCallCount = 0;
                    this.propertyChangedCallArguments = [];
                }
                propChanged() {
                    this.propChangedCallCount++;
                }
            };
            __setFunctionName(_classThis, "Foo2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable()];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo2 = _classThis;
        })();
        let Foo3 = (() => {
            let _classDecorators = [customAttribute('foo3')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo3 = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    this.propChangedCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                    this.propertyChangedCallCount = 0;
                    this.propertyChangedCallArguments = [];
                }
                propertyChanged(...args) {
                    this.propertyChangedCallCount++;
                    this.propertyChangedCallArguments.push(args);
                }
            };
            __setFunctionName(_classThis, "Foo3");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable()];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo3 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo3 = _classThis;
        })();
        const templateUsages = [
            ['plain', '="prop"'],
            ['binding command', '.bind="prop"'],
            // ['two-way binding', '.two-way="prop"'],
            ['interpolation', `=\${prop}"`],
        ];
        const testCases = [
            {
                callCounts: [
                    /* foo1: has both normal change handler and all properties change handler */
                    [
                        /* normal change handler call count */ 1,
                        /* all properties change handler call count */ 1,
                        /* corresponding count of arguments of all properties change handler */ [3]
                    ],
                    /* foo2: has only normal change handler */
                    [
                        /* normal change handler call count */ 1,
                        /* all properties change handler call count */ 0,
                        /* corresponding count of arguments of all properties change handler */ []
                    ],
                    /* foo3: has only all properties change handler */
                    [
                        /* normal change handler call count */ 0,
                        /* all properties change handler call count */ 1,
                        /* corresponding count of arguments of all properties change handler */ [3]
                    ]
                ]
            }
        ];
        eachCartesianJoin([templateUsages, testCases], ([usageDesc, usageSyntax], testCase) => {
            it(`does not invoke change handler when starts with ${usageDesc} usage`, async function () {
                const template = `<div foo1${usageSyntax} foo2${usageSyntax} foo3${usageSyntax}></div>`;
                const { foos, tearDown } = setupChangeHandlerTest(template);
                const callCounts = testCase.callCounts;
                foos.forEach((fooVm, idx) => {
                    assert.strictEqual(fooVm.propChangedCallCount, 0, `#1 Foo${idx + 1} count`);
                    assert.strictEqual(fooVm.propertyChangedCallCount, 0, `#2 Foo${idx + 1} count`);
                    fooVm.prop = '5';
                });
                foos.forEach((fooVm, idx) => {
                    assert.strictEqual(fooVm.propChangedCallCount, callCounts[idx][0], `#3 callCounts[${idx}][0]`);
                    assert.strictEqual(fooVm.propertyChangedCallCount, callCounts[idx][1], `#4 callCounts[${idx}][1]`);
                    if (fooVm.propertyChangedCallCount > 0) {
                        for (let i = 0; fooVm.propertyChangedCallCount > i; ++i) {
                            assert.strictEqual(fooVm.propertyChangedCallArguments[i].length, callCounts[idx][2][i], `#5 callCounts[${idx}][2][${i}]`);
                        }
                    }
                });
                await tearDown();
            });
        });
        describe('04.1 + with two-way', function () {
            it('does not invoke change handler when starts with two-way usage', async function () {
                const template = `<div foo1.two-way="prop"></div>`;
                const options = createFixture(template, class {
                    constructor() {
                        this.prop = 'prop';
                    }
                }, [Foo1]);
                const fooEl = options.appHost.querySelector('div');
                const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel;
                assert.strictEqual(foo1Vm.propChangedCallCount, 0, `#1 Foo1 count`);
                assert.strictEqual(foo1Vm.propertyChangedCallCount, 0, `#2 Foo1 count`);
                assert.strictEqual(foo1Vm.prop, `prop`);
                const rootVm = options.au.root.controller.viewModel;
                // changing source value should trigger the change handler
                rootVm['prop'] = 5;
                assert.strictEqual(foo1Vm.propChangedCallCount, 1, '#3 Foo1 propChanged()');
                assert.strictEqual(foo1Vm.propertyChangedCallCount, 1, '#3 Foo1 propChanged()');
                assert.strictEqual(foo1Vm.prop, 5);
                // manually setting the value in the view model should also trigger the change handler
                foo1Vm.prop = 6;
                assert.strictEqual(foo1Vm.propChangedCallCount, 2, '#4 Foo1 propChanged()');
                assert.strictEqual(foo1Vm.propertyChangedCallCount, 2, '#4 Foo1 propChanged()');
                assert.strictEqual(foo1Vm.prop, 6);
                assert.strictEqual(rootVm['prop'], 6);
                await options.tearDown();
            });
            // Foo1 should cover both Foo2, and Foo3
            // but for completeness, should have tests for Foo2 & Foo3, similar like above
            // todo: test with Foo2, and Foo3
        });
        function setupChangeHandlerTest(template) {
            const options = createFixture(template, class {
            }, [Foo1, Foo2, Foo3]);
            const fooEl = options.appHost.querySelector('div');
            const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel;
            const foo2Vm = CustomAttribute.for(fooEl, 'foo2').viewModel;
            const foo3Vm = CustomAttribute.for(fooEl, 'foo3').viewModel;
            return {
                rootVm: options.component,
                fooVm: foo1Vm,
                foo2Vm,
                foo3Vm,
                foos: [foo1Vm, foo2Vm, foo3Vm],
                tearDown: () => options.tearDown()
            };
        }
    });
    describe('05. with setter', function () {
        /**
         * Specs:
         * - with setter coercing to string for "prop" property
         */
        let Foo1 = (() => {
            let _classDecorators = [customAttribute('foo1')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo1 = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    __runInitializers(this, _prop_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable({
                        set: String
                    })];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo1 = _classThis;
        })();
        /**
         * Specs:
         * - plain bindable "prop"
         */
        let Foo2 = (() => {
            let _classDecorators = [customAttribute('foo2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo2 = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    __runInitializers(this, _prop_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable()];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo2 = _classThis;
        })();
        /**
         * Specs:
         * - with setter/getter coercing to string for "prop" property
         */
        let Foo3 = (() => {
            let _classDecorators = [customAttribute('foo3')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo3 = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    __runInitializers(this, _prop_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo3");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable({
                        set: String,
                    })];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo3 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo3 = _classThis;
        })();
        /**
         * Foo4 specs:
         * - with primary bindable with setter
         * - with setter coercing to number
         * - with change handler for "prop" property
         */
        let Foo4 = (() => {
            let _classDecorators = [customAttribute('foo4')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop1_decorators;
            let _prop1_initializers = [];
            let _prop1_extraInitializers = [];
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo4 = _classThis = class {
                constructor() {
                    this.prop1 = __runInitializers(this, _prop1_initializers, void 0);
                    this.prop = (__runInitializers(this, _prop1_extraInitializers), __runInitializers(this, _prop_initializers, void 0));
                    this.propChangedCallCount = (__runInitializers(this, _prop_extraInitializers), 0);
                    this.propHistory = [];
                }
                propChanged(newValue) {
                    this.propHistory.push(newValue);
                    this.propChangedCallCount++;
                }
            };
            __setFunctionName(_classThis, "Foo4");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop1_decorators = [bindable()];
                _prop_decorators = [bindable({
                        primary: true,
                        set: (val) => Number(val) > 0 ? Number(val) : 0
                    })];
                __esDecorate(null, null, _prop1_decorators, { kind: "field", name: "prop1", static: false, private: false, access: { has: obj => "prop1" in obj, get: obj => obj.prop1, set: (obj, value) => { obj.prop1 = value; } }, metadata: _metadata }, _prop1_initializers, _prop1_extraInitializers);
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo4 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo4 = _classThis;
        })();
        let UsageType;
        (function (UsageType) {
            // plain = 1,
            UsageType[UsageType["command"] = 1] = "command";
            UsageType[UsageType["interpolation"] = 2] = "interpolation";
            UsageType[UsageType["multi"] = 4] = "multi";
            UsageType[UsageType["multiWithCommand"] = 5] = "multiWithCommand";
            UsageType[UsageType["multiWithInterpolation"] = 6] = "multiWithInterpolation";
        })(UsageType || (UsageType = {}));
        const templateUsages = [
            // [UsageType.plain, '="prop"'],
            [UsageType.command, '.bind="prop"'],
            // ['two-way binding', '.two-way="prop"'],
            [UsageType.interpolation, `="\${prop}"`],
            [UsageType.multiWithCommand, '="prop.bind: prop"'],
            [UsageType.multiWithInterpolation, `="prop: \${prop}"`],
        ];
        const testCases = [
            [
                5,
                () => /* foo1 has setter */ '5',
                (usageType) => (usageType & UsageType.interpolation) > 0 ? '5' : 5,
                () => '5',
                () => 5
            ],
            [
                'prop1',
                () => 'prop1',
                () => 'prop1',
                () => 'prop1',
                () => 0
            ],
            (() => {
                const date = new Date();
                return [
                    date,
                    () => String(date),
                    (usageType) => (usageType & UsageType.interpolation) > 0 ? date.toString() : date,
                    () => date.toString(),
                    (usageType) => (usageType & UsageType.interpolation) > 0
                        ? /* Number('...') -> 0 */ 0
                        : date.getTime(),
                ];
            })(),
            (() => {
                const values = [1, 2, 3, 4];
                return [
                    values,
                    () => `1,2,3,4`,
                    (usageType) => (usageType & UsageType.interpolation) > 0 ? '1,2,3,4' : values,
                    () => '1,2,3,4',
                    () => /* Number([...]) === NaN -> */ 0
                ];
            })(),
        ];
        eachCartesianJoin([templateUsages, testCases], ([usageType, usageSyntax], [mutationValue, ...getFooVmProps]) => {
            it(`does not invoke change handler when starts with ${UsageType[usageType]} usage`, async function () {
                const template = `<div
              foo1${usageSyntax}
              foo2${usageSyntax}
              foo3${usageSyntax}
              foo4${usageSyntax}></div>`;
                const { rootVm, foos, tearDown } = setupChangeHandlerTest(template);
                foos.forEach((fooVm, idx) => {
                    assert.strictEqual(fooVm.prop, fooVm instanceof Foo4 ? 0 : 'prop', `#1 asserting Foo${idx + 1} initial`);
                });
                rootVm.prop = mutationValue;
                foos.forEach((fooVm, idx) => {
                    assert.strictEqual(fooVm.prop, getFooVmProps[idx](usageType), `#2 asserting Foo${idx + 1}`);
                });
                await tearDown();
            });
        });
        function setupChangeHandlerTest(template) {
            const options = createFixture(template, class {
                constructor() {
                    this.prop = 'prop';
                }
            }, [Foo1, Foo2, Foo3, Foo4]);
            const fooEl = options.appHost.querySelector('div');
            const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel;
            const foo2Vm = CustomAttribute.for(fooEl, 'foo2').viewModel;
            const foo3Vm = CustomAttribute.for(fooEl, 'foo3').viewModel;
            const foo4Vm = CustomAttribute.for(fooEl, 'foo4').viewModel;
            return {
                rootVm: options.component,
                foo1Vm,
                foo2Vm,
                foo3Vm,
                foo4Vm,
                foos: [foo1Vm, foo2Vm, foo3Vm, foo4Vm],
                tearDown: () => options.tearDown()
            };
        }
        describe('05.1 + with two-way', function () {
            it('works properly when two-way binding with number setter interceptor', async function () {
                const template = `<div foo1.two-way="prop">\${prop}</div>`;
                const options = createFixture(template, class {
                    constructor() {
                        this.prop = 'prop';
                    }
                }, [Foo1, Foo2, Foo3, Foo4]);
                const fooEl = options.appHost.querySelector('div');
                const rootVm = options.au.root.controller.viewModel;
                const foo1Vm = CustomAttribute.for(fooEl, 'foo1').viewModel;
                assert.strictEqual(foo1Vm.prop, 'prop', '#1 <-> Foo1 initial');
                assert.strictEqual(rootVm.prop, 'prop', '#1 <-> RootVm initial');
                assert.strictEqual(options.appHost.textContent, 'prop');
                rootVm.prop = 5;
                assert.strictEqual(foo1Vm.prop, '5', '#2 <-> RootVm.prop << 5');
                assert.strictEqual(rootVm.prop, '5', '#2 <-> RootVm.prop << 5');
                options.platform.domQueue.flush();
                assert.strictEqual(options.appHost.textContent, '5');
                const date = new Date();
                foo1Vm.prop = date;
                assert.strictEqual(foo1Vm.prop, date.toString(), '#3 <-> foo1Vm.prop << Date');
                assert.strictEqual(rootVm.prop, date.toString(), '#3 <-> foo1Vm.prop << Date');
                options.platform.domQueue.flush();
                assert.strictEqual(options.appHost.textContent, date.toString());
                await options.tearDown();
            });
            it('does not result in overflow error when dealing with NaN', async function () {
                /**
                 * Specs:
                 * - With bindable with getter coerce to string, setter coerce to number for "prop" property
                 */
                let Foo5 = (() => {
                    let _classDecorators = [customAttribute('foo5')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var Foo5 = _classThis = class {
                        constructor() {
                            this.prop = __runInitializers(this, _prop_initializers, void 0);
                            __runInitializers(this, _prop_extraInitializers);
                        }
                    };
                    __setFunctionName(_classThis, "Foo5");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _prop_decorators = [bindable({
                                set: Number,
                            })];
                        __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Foo5 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Foo5 = _classThis;
                })();
                const template = `<div foo5.two-way="prop">\${prop}</div>`;
                const options = createFixture(template, class {
                    constructor() {
                        this.prop = 'prop';
                    }
                }, [Foo5]);
                const fooEl = options.appHost.querySelector('div');
                const rootVm = options.au.root.controller.viewModel;
                const foo5Vm = CustomAttribute.for(fooEl, 'foo5').viewModel;
                assert.strictEqual(foo5Vm.prop, NaN, '#1 <-> Foo1 initial');
                assert.strictEqual(rootVm.prop, 'prop', '#1 <-> RootVm initial');
                assert.strictEqual(options.appHost.textContent, 'prop');
                rootVm.prop = 5;
                assert.strictEqual(foo5Vm.prop, 5, '#2 <-> RootVm.prop << 5 -> foo5Vm');
                assert.strictEqual(foo5Vm.$observers.prop.getValue(), 5, '#2 Foo5.$observer.prop.getValue()');
                assert.strictEqual(rootVm.prop, 5, '#2 <-> RootVm.prop << 5 -> rootVm');
                options.platform.domQueue.flush();
                assert.strictEqual(options.appHost.textContent, '5');
                const date = new Date();
                foo5Vm.prop = date;
                assert.strictEqual(foo5Vm.prop, date.getTime(), '#3 <-> foo1Vm.prop << Date');
                assert.strictEqual(rootVm.prop, date.getTime(), '#3 <-> foo1Vm.prop << Date');
                options.platform.domQueue.flush();
                assert.strictEqual(options.appHost.textContent, date.getTime().toString());
                rootVm.prop = NaN;
                assert.strictEqual(Object.is(foo5Vm.prop, NaN), true, '#1 <-> Foo1 initial');
                assert.strictEqual(Object.is(rootVm.prop, NaN), true, '#1 <-> RootVm initial');
                options.platform.domQueue.flush();
                assert.strictEqual(options.appHost.textContent, 'NaN');
                await options.tearDown();
            });
        });
    });
    describe('resolve', function () {
        afterEach(function () {
            assert.throws(() => resolve(class Abc {
            }));
        });
        it('works with resolve and inheritance', function () {
            class Base {
                constructor() {
                    this.au = resolve(IAurelia);
                }
            }
            let Attr = (() => {
                let _classDecorators = [customAttribute('attr')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Base;
                var Attr = _classThis = class extends _classSuper {
                };
                __setFunctionName(_classThis, "Attr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Attr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Attr = _classThis;
            })();
            const { au, component } = createFixture('<div attr attr.ref="attr">', class App {
            }, [Attr]);
            assert.strictEqual(au, component.attr.au);
        });
    });
    describe('getter/[setter] bindable', function () {
        it('works in basic scenario', function () {
            const { assertText } = createFixture(`<div my-attr="hi">`, class App {
            }, [CustomAttribute.define({ name: 'my-attr', bindables: ['message'] }, class {
                    constructor() {
                        this._m = 'hey';
                        this.host = resolve(INode);
                    }
                    get message() {
                        return this._m;
                    }
                    set message(v) {
                        this._m = v;
                    }
                    attached() {
                        this.host.textContent = this._m;
                    }
                })]);
            assertText('hi');
        });
        it('works with readonly bindable + [from-view]', function () {
            const { assertText } = createFixture('<div my-attr.from-view="message">${message}', class App {
                constructor() {
                    this.message = '';
                }
            }, [CustomAttribute.define({ name: 'my-attr', bindables: ['_m', 'message'] }, class {
                    constructor() {
                        this._m = '2';
                    }
                    get message() {
                        return this._m;
                    }
                    binding() {
                        this._m = '2+';
                    }
                })]);
            assertText('2+');
        });
        it('works with coercer bindable', function () {
            let setCount = 0;
            const values = [];
            let MyAttr = (() => {
                let _classDecorators = [customAttribute('my-attr')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _get_message_decorators;
                var MyAttr = _classThis = class {
                    constructor() {
                        this._m = (__runInitializers(this, _instanceExtraInitializers), '');
                    }
                    get message() {
                        return this._m;
                    }
                    set message(v) {
                        this._m = v;
                    }
                };
                __setFunctionName(_classThis, "MyAttr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _get_message_decorators = [bindable({ set: v => {
                                setCount++;
                                v = Number(v);
                                values.push(v);
                                return v;
                            } })];
                    __esDecorate(_classThis, null, _get_message_decorators, { kind: "getter", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyAttr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyAttr = _classThis;
            })();
            const { component } = createFixture(`<div my-attr.bind="value">`, { value: '1' }, [MyAttr]);
            assert.strictEqual(setCount, 1);
            assert.deepStrictEqual(values, [1]);
            component.value = '2';
            assert.strictEqual(setCount, 2);
            assert.deepStrictEqual(values, [1, 2]);
        });
        it('works with array based computed bindable', function () {
            const MyAttr = CustomAttribute.define({
                name: 'my-attr',
                bindables: ['message']
            }, class {
                constructor() {
                    this._m = [{ v: 'hello' }, { v: 'world' }];
                }
                get message() {
                    return this._m.map(v => v.v).join(' ');
                }
            });
            const { component } = createFixture('<div my-attr.ref=attr my-attr.from-view="value">', class App {
            }, [MyAttr]);
            assert.strictEqual(component.value, 'hello world');
            component.attr._m[1].v = 'world+';
            assert.strictEqual(component.value, 'hello world+');
        });
    });
    describe('template controller', function () {
        const IExample = DI.createInterface("IExample");
        let ExampleTemplateController = (() => {
            let _classDecorators = [templateController({
                    name: 'example',
                    containerStrategy: 'new'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var ExampleTemplateController = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    this.viewFactory = (__runInitializers(this, _value_extraInitializers), resolve(IViewFactory));
                    this.location = resolve(IRenderLocation);
                }
                bound() {
                    this.viewFactory.container.register(Registration.instance(IExample, this.value));
                    const view = this.viewFactory.create();
                    view.setLocation(this.location);
                    return view.activate(view, this.$controller, this.$controller.scope);
                }
            };
            __setFunctionName(_classThis, "ExampleTemplateController");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ExampleTemplateController = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ExampleTemplateController = _classThis;
        })();
        it('creates new container for factory when containerStrategy is "new"', function () {
            let MyAttr = (() => {
                let _classDecorators = [customAttribute('my-attr')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyAttr = _classThis = class {
                    constructor() {
                        this.v = resolve(IExample);
                        this.host = resolve(INode);
                    }
                    bound() {
                        this.host.textContent = String(this.v);
                    }
                };
                __setFunctionName(_classThis, "MyAttr");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyAttr = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyAttr = _classThis;
            })();
            let examples;
            let MyEl = (() => {
                let _classDecorators = [customElement({
                        name: 'my-el',
                        template: `<div example.bind="5" my-attr></div>
        <div example.bind="6" my-attr></div>`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyEl = _classThis = class {
                    constructor() {
                        this.c = resolve(IContainer);
                    }
                    attached() {
                        examples = this.c.getAll(IExample, false);
                    }
                };
                __setFunctionName(_classThis, "MyEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyEl = _classThis;
            })();
            const { assertText } = createFixture('<my-el>', class App {
            }, [ExampleTemplateController, MyAttr, MyEl]);
            assertText('5 6', { compact: true });
            assert.deepStrictEqual(examples, []);
        });
        it('new container strategy does not get affected by nesting', function () {
            let MyCe = (() => {
                let _classDecorators = [customElement('my-ce')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyCe = _classThis = class {
                    constructor() {
                        this.e = resolve(IExample);
                        this.host = resolve(INode);
                    }
                    attached() {
                        this.host.textContent = String(this.e);
                    }
                };
                __setFunctionName(_classThis, "MyCe");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyCe = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyCe = _classThis;
            })();
            const { getAllBy } = createFixture(`<div example.bind="1">
          <my-ce></my-ce>
          <div example.bind="2">
            <my-ce></my-ce>
            <my-ce></my-ce>
          </div>
          <my-ce />
        </div>`, class App {
            }, [ExampleTemplateController, MyCe]);
            assert.deepStrictEqual(getAllBy('my-ce').map(el => el.textContent), ['1', '2', '2', '1']);
        });
    });
    describe('finding closest', function () {
        const Foo = CustomAttribute.define('foo', class Foo {
            constructor() {
                this.host = resolve(INode);
            }
        });
        const Baz = CustomAttribute.define('baz', class Baz {
            constructor() {
                this.host = resolve(INode);
                this.parent = CustomAttribute.closest(this.host, 'foo')?.viewModel;
            }
            bound() {
                this.host.textContent = this.parent?.value ?? this.value;
            }
        });
        const Bar = CustomAttribute.define('bar', class Bar {
            constructor() {
                this.host = resolve(INode);
                this.parent = CustomAttribute.closest(this.host, Foo)?.viewModel;
            }
            bound() {
                this.host.textContent = this.parent?.value ?? this.value;
            }
        });
        it('finds closest custom attribute using string', function () {
            const { assertText } = createFixture(`<div foo="1"><div baz="2"></div></div>`, class App {
            }, [Foo, Baz]);
            assertText('1');
        });
        it('finds closest custom attribute using view model constructor', function () {
            const { assertText } = createFixture(`<div foo="1"><div bar="2"></div></div>`, class App {
            }, [Foo, Bar]);
            assertText('1');
        });
        it('returns null if no controller for the name can be found', function () {
            const { assertText } = createFixture(
            // Bar is not on an child element that hosts Foo
            `
        <div foo="1"></div>
        <div bar="2"></div>
        <div baz="3"></div>
      `, class App {
            }, [Foo, Bar, Baz]);
            assertText('2 3', { compact: true });
        });
        it('finds closest custom attribute when nested multiple dom layers', function () {
            const { assertText } = createFixture(`
        <div foo="1">
          <center>
            <div bar="2"></div>
            <div baz="3"></div>
          </center>
        </div>
        `, class App {
            }, [Foo, Bar, Baz]);
            assertText('1 1', { compact: true });
        });
        it('finds closest custom attribute when nested multiple dom layers + multiple parent attributes', function () {
            const { assertText } = createFixture(`
        <div foo="1">
          <center>
            <div foo="3">
              <div bar="2"></div>
            </div>
            <div baz="4"></div>
          </center>
        </div>
        `, class App {
            }, [Foo, Bar, Baz]);
            assertText('3 1', { compact: true });
        });
        it('throws when theres no attribute definition associated with the type', function () {
            const { appHost } = createFixture('');
            assert.throws(() => CustomAttribute.closest(appHost, class NotAttr {
            }));
        });
    });
    describe('bindable inheritance', function () {
        it('works for array', async function () {
            let CeOne = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-1',
                        bindables: ['p21', { name: 'p22' }]
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _p1_decorators;
                let _p1_initializers = [];
                let _p1_extraInitializers = [];
                var CeOne = _classThis = class {
                    constructor() {
                        this.p1 = __runInitializers(this, _p1_initializers, void 0);
                        this.p21 = __runInitializers(this, _p1_extraInitializers);
                        this.el = resolve(INode);
                    }
                    attached(_initiator) {
                        this.el.textContent = `${this.p1} ${this.p21} ${this.p22}`;
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _p1_decorators = [bindable];
                    __esDecorate(null, null, _p1_decorators, { kind: "field", name: "p1", static: false, private: false, access: { has: obj => "p1" in obj, get: obj => obj.p1, set: (obj, value) => { obj.p1 = value; } }, metadata: _metadata }, _p1_initializers, _p1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-2',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = CeOne;
                let _p3_decorators;
                let _p3_initializers = [];
                let _p3_extraInitializers = [];
                var CeTwo = _classThis = class extends _classSuper {
                    attached(_initiator) {
                        this.el.textContent = `${this.p3} ${this.p1} ${this.p21} ${this.p22}`;
                    }
                    constructor() {
                        super(...arguments);
                        this.p3 = __runInitializers(this, _p3_initializers, void 0);
                        __runInitializers(this, _p3_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "CeTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _p3_decorators = [bindable];
                    __esDecorate(null, null, _p3_decorators, { kind: "field", name: "p3", static: false, private: false, access: { has: obj => "p3" in obj, get: obj => obj.p3, set: (obj, value) => { obj.p3 = value; } }, metadata: _metadata }, _p3_initializers, _p3_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeTwo = _classThis;
            })();
            const { appHost } = createFixture(`<span c-1="p1:c1-p1; p21:c1-p21; p22:c1-p22"></span> <span c-2="p1:c2-p1; p21:c2-p21; p22:c2-p22; p3:c2-p3"></span>`, {}, [CeOne, CeTwo]);
            assert.html.textContent(appHost, 'c1-p1 c1-p21 c1-p22 c2-p3 c2-p1 c2-p21 c2-p22');
        });
        it('works for object', async function () {
            let CeOne = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-1',
                        bindables: { p2: {} }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _p1_decorators;
                let _p1_initializers = [];
                let _p1_extraInitializers = [];
                var CeOne = _classThis = class {
                    constructor() {
                        this.p1 = __runInitializers(this, _p1_initializers, void 0);
                        this.p2 = __runInitializers(this, _p1_extraInitializers);
                        this.el = resolve(INode);
                    }
                    attached(_initiator) {
                        this.el.textContent = `${this.p1} ${this.p2}`;
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _p1_decorators = [bindable];
                    __esDecorate(null, null, _p1_decorators, { kind: "field", name: "p1", static: false, private: false, access: { has: obj => "p1" in obj, get: obj => obj.p1, set: (obj, value) => { obj.p1 = value; } }, metadata: _metadata }, _p1_initializers, _p1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-2',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = CeOne;
                let _p3_decorators;
                let _p3_initializers = [];
                let _p3_extraInitializers = [];
                var CeTwo = _classThis = class extends _classSuper {
                    attached(_initiator) {
                        this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
                    }
                    constructor() {
                        super(...arguments);
                        this.p3 = __runInitializers(this, _p3_initializers, void 0);
                        __runInitializers(this, _p3_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "CeTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _p3_decorators = [bindable];
                    __esDecorate(null, null, _p3_decorators, { kind: "field", name: "p3", static: false, private: false, access: { has: obj => "p3" in obj, get: obj => obj.p3, set: (obj, value) => { obj.p3 = value; } }, metadata: _metadata }, _p3_initializers, _p3_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeTwo = _classThis;
            })();
            const { appHost } = createFixture(`<span c-1="p1:c1-p1; p2:c1-p2"></span> <span c-2="p1:c2-p1; p2:c2-p2; p3:c2-p3"></span>`, {}, [CeOne, CeTwo]);
            assert.html.textContent(appHost, 'c1-p1 c1-p2 c2-p3 c2-p1 c2-p2');
        });
        it('works for primary bindable on parent', async function () {
            let CeOne = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-1',
                        bindables: { p2: { primary: true } }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _p1_decorators;
                let _p1_initializers = [];
                let _p1_extraInitializers = [];
                var CeOne = _classThis = class {
                    constructor() {
                        this.p1 = __runInitializers(this, _p1_initializers, 'dp1');
                        this.p2 = __runInitializers(this, _p1_extraInitializers);
                        this.el = resolve(INode);
                    }
                    attached(_initiator) {
                        this.el.textContent = `${this.p1} ${this.p2}`;
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _p1_decorators = [bindable];
                    __esDecorate(null, null, _p1_decorators, { kind: "field", name: "p1", static: false, private: false, access: { has: obj => "p1" in obj, get: obj => obj.p1, set: (obj, value) => { obj.p1 = value; } }, metadata: _metadata }, _p1_initializers, _p1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-2',
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = CeOne;
                let _p3_decorators;
                let _p3_initializers = [];
                let _p3_extraInitializers = [];
                var CeTwo = _classThis = class extends _classSuper {
                    attached(_initiator) {
                        this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
                    }
                    constructor() {
                        super(...arguments);
                        this.p3 = __runInitializers(this, _p3_initializers, 'dp3');
                        __runInitializers(this, _p3_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "CeTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _p3_decorators = [bindable];
                    __esDecorate(null, null, _p3_decorators, { kind: "field", name: "p3", static: false, private: false, access: { has: obj => "p3" in obj, get: obj => obj.p3, set: (obj, value) => { obj.p3 = value; } }, metadata: _metadata }, _p3_initializers, _p3_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeTwo = _classThis;
            })();
            const { appHost } = createFixture(`<span c-1="c1-p2"></span> <span c-2="c2-p2"></span>`, {}, [CeOne, CeTwo]);
            assert.html.textContent(appHost, 'dp1 c1-p2 dp3 dp1 c2-p2');
        });
        it('works for primary bindable on child', async function () {
            let CeOne = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-1',
                        bindables: { p2: {} }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _p1_decorators;
                let _p1_initializers = [];
                let _p1_extraInitializers = [];
                var CeOne = _classThis = class {
                    constructor() {
                        this.p1 = __runInitializers(this, _p1_initializers, 'dp1');
                        this.p2 = __runInitializers(this, _p1_extraInitializers);
                        this.el = resolve(INode);
                    }
                    attached(_initiator) {
                        this.el.textContent = `${this.p1} ${this.p2}`;
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _p1_decorators = [bindable];
                    __esDecorate(null, null, _p1_decorators, { kind: "field", name: "p1", static: false, private: false, access: { has: obj => "p1" in obj, get: obj => obj.p1, set: (obj, value) => { obj.p1 = value; } }, metadata: _metadata }, _p1_initializers, _p1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-2',
                        bindables: { p2: { primary: true } }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = CeOne;
                let _p3_decorators;
                let _p3_initializers = [];
                let _p3_extraInitializers = [];
                var CeTwo = _classThis = class extends _classSuper {
                    attached(_initiator) {
                        this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
                    }
                    constructor() {
                        super(...arguments);
                        this.p3 = __runInitializers(this, _p3_initializers, 'dp3');
                        __runInitializers(this, _p3_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "CeTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _p3_decorators = [bindable];
                    __esDecorate(null, null, _p3_decorators, { kind: "field", name: "p3", static: false, private: false, access: { has: obj => "p3" in obj, get: obj => obj.p3, set: (obj, value) => { obj.p3 = value; } }, metadata: _metadata }, _p3_initializers, _p3_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeTwo = _classThis;
            })();
            const { appHost } = createFixture(`<span c-1="p1:c1-p1; p2:c1-p2"></span> <span c-2="c2-p2"></span>`, {}, [CeOne, CeTwo]);
            assert.html.textContent(appHost, 'c1-p1 c1-p2 dp3 dp1 c2-p2');
        });
        it('does not work for if child defines a second primary bindable', async function () {
            let CeOne = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-1',
                        bindables: { p2: { primary: true } }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _p1_decorators;
                let _p1_initializers = [];
                let _p1_extraInitializers = [];
                var CeOne = _classThis = class {
                    constructor() {
                        this.p1 = __runInitializers(this, _p1_initializers, 'dp1');
                        this.p2 = __runInitializers(this, _p1_extraInitializers);
                        this.el = resolve(INode);
                    }
                    attached(_initiator) {
                        this.el.textContent = `${this.p1} ${this.p2}`;
                    }
                };
                __setFunctionName(_classThis, "CeOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _p1_decorators = [bindable];
                    __esDecorate(null, null, _p1_decorators, { kind: "field", name: "p1", static: false, private: false, access: { has: obj => "p1" in obj, get: obj => obj.p1, set: (obj, value) => { obj.p1 = value; } }, metadata: _metadata }, _p1_initializers, _p1_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeOne = _classThis;
            })();
            let CeTwo = (() => {
                let _classDecorators = [customAttribute({
                        name: 'c-2',
                        bindables: { p3: { primary: true } }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = CeOne;
                var CeTwo = _classThis = class extends _classSuper {
                    attached(_initiator) {
                        this.el.textContent = `${this.p3} ${this.p1} ${this.p2}`;
                    }
                };
                __setFunctionName(_classThis, "CeTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    CeTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return CeTwo = _classThis;
            })();
            try {
                createFixture(`<span c-1="c1-p2"></span> <span c-2="c2-p3"></span>`, {}, [CeOne, CeTwo]);
                assert.fail('Should have thrown due to conflicting primary bindables.');
            }
            catch (e) {
                assert.match(e.message, /714/, 'incorrect error code');
            }
        });
    });
    describe('aggregated callback', function () {
        it('calls aggregated callback', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_1 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_1 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_1 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop = 2;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
        });
        it('calls aggregated callback only once for 2 changes', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_2 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_2 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_2 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop = 2;
            component.prop = 3;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 3, oldValue: 2 } });
        });
        it('does not call aggregated callback again after first call if there is no new changes', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_3 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_3 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_3 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop = 2;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
            changes = void 0;
            await Promise.resolve();
            assert.deepStrictEqual(changes, void 0);
        });
        it('calls aggregated callback again after first call if there are new changes during callback', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_4 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                                if (this.prop === 2) {
                                    this.prop = 3;
                                }
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_4 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_4 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop = 2;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
            changes = void 0;
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 3, oldValue: 2 } });
        });
        it('does not call aggregated callback after unbind', async function () {
            let changes = void 0;
            const { component, stop } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_5 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_5 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_5 = _classThis;
                })()]);
            component.prop = 2;
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
            changes = void 0;
            await stop(true);
            component.prop = 3;
            await Promise.resolve();
            assert.deepStrictEqual(changes, void 0);
        });
        it('does not call aggregated callback if the component is unbound before next tick', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div if.bind="show" foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                    this.show = true;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_6 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_6 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_6 = _classThis;
                })()]);
            component.prop = 2;
            component.show = false;
            await Promise.resolve();
            assert.deepStrictEqual(changes, void 0);
        });
        it('does not call aggregated callback for @observable', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_7 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [observable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_7 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_7 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop = 2;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.strictEqual(changes, void 0);
        });
        it('calls both change handler and aggregated callback', async function () {
            let changes = void 0;
            let propChangedCallCount = 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_8 = (_classThis = class {
                            propChanged() {
                                propChangedCallCount++;
                            }
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_8 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_8 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            assert.strictEqual(propChangedCallCount, 0);
            component.prop = 2;
            assert.strictEqual(changes, void 0);
            assert.strictEqual(propChangedCallCount, 1);
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
        });
        it('calls change handler, propertyChanged and aggregated callback', async function () {
            let changes = void 0;
            let propChangedCallCount = 0;
            let propertyChangedCallCount = 0;
            const { component } = createFixture(`<div foo.bind="prop"></div>`, class App {
                constructor() {
                    this.prop = 1;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop_decorators;
                    let _prop_initializers = [];
                    let _prop_extraInitializers = [];
                    var class_9 = (_classThis = class {
                            propChanged() {
                                propChangedCallCount++;
                            }
                            propertyChanged() {
                                propertyChangedCallCount++;
                            }
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop = __runInitializers(this, _prop_initializers, 0);
                                __runInitializers(this, _prop_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop_decorators = [bindable];
                            __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_9 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_9 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            assert.strictEqual(propChangedCallCount, 0);
            assert.strictEqual(propertyChangedCallCount, 0);
            component.prop = 2;
            assert.strictEqual(changes, void 0);
            assert.strictEqual(propChangedCallCount, 1);
            assert.strictEqual(propertyChangedCallCount, 1);
            await Promise.resolve();
            assert.deepStrictEqual(changes, { prop: { newValue: 2, oldValue: 1 } });
            assert.strictEqual(propChangedCallCount, 1);
            assert.strictEqual(propertyChangedCallCount, 1);
        });
        it('aggregates changes for multiple properties', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo="prop1.bind: prop1; prop2.bind: prop2"></div>`, class App {
                constructor() {
                    this.prop1 = 1;
                    this.prop2 = 2;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop1_decorators;
                    let _prop1_initializers = [];
                    let _prop1_extraInitializers = [];
                    let _prop2_decorators;
                    let _prop2_initializers = [];
                    let _prop2_extraInitializers = [];
                    var class_10 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop1 = __runInitializers(this, _prop1_initializers, 0);
                                this.prop2 = (__runInitializers(this, _prop1_extraInitializers), __runInitializers(this, _prop2_initializers, 0));
                                __runInitializers(this, _prop2_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop1_decorators = [bindable];
                            _prop2_decorators = [bindable];
                            __esDecorate(null, null, _prop1_decorators, { kind: "field", name: "prop1", static: false, private: false, access: { has: obj => "prop1" in obj, get: obj => obj.prop1, set: (obj, value) => { obj.prop1 = value; } }, metadata: _metadata }, _prop1_initializers, _prop1_extraInitializers);
                            __esDecorate(null, null, _prop2_decorators, { kind: "field", name: "prop2", static: false, private: false, access: { has: obj => "prop2" in obj, get: obj => obj.prop2, set: (obj, value) => { obj.prop2 = value; } }, metadata: _metadata }, _prop2_initializers, _prop2_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_10 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_10 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop1 = 2;
            component.prop2 = 3;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.deepStrictEqual(changes, {
                prop1: { newValue: 2, oldValue: 1 },
                prop2: { newValue: 3, oldValue: 2 }
            });
        });
        it('calls aggregated callback for multiple properties with the right key', async function () {
            let changes = void 0;
            const { component } = createFixture(`<div foo="prop1.bind: prop1; 5.bind: prop2"></div>`, class App {
                constructor() {
                    this.prop1 = 1;
                    this.prop2 = 2;
                }
            }, [(() => {
                    let _classDecorators = [customAttribute('foo')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _prop1_decorators;
                    let _prop1_initializers = [];
                    let _prop1_extraInitializers = [];
                    let _member_decorators;
                    let _member_initializers = [];
                    let _member_extraInitializers = [];
                    var class_11 = (_classThis = class {
                            propertiesChanged($changes) {
                                changes = $changes;
                            }
                            constructor() {
                                this.prop1 = __runInitializers(this, _prop1_initializers, 0);
                                this[5] = (__runInitializers(this, _prop1_extraInitializers), __runInitializers(this, _member_initializers, 0));
                                __runInitializers(this, _member_extraInitializers);
                            }
                        },
                        __setFunctionName(_classThis, ""),
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop1_decorators = [bindable];
                            _member_decorators = [bindable];
                            __esDecorate(null, null, _prop1_decorators, { kind: "field", name: "prop1", static: false, private: false, access: { has: obj => "prop1" in obj, get: obj => obj.prop1, set: (obj, value) => { obj.prop1 = value; } }, metadata: _metadata }, _prop1_initializers, _prop1_extraInitializers);
                            __esDecorate(null, null, _member_decorators, { kind: "field", name: "5", static: false, private: false, access: { has: obj => "5" in obj, get: obj => obj["5"], set: (obj, value) => { obj["5"] = value; } }, metadata: _metadata }, _member_initializers, _member_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            class_11 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })(),
                        _classThis);
                    return class_11 = _classThis;
                })()]);
            assert.strictEqual(changes, void 0);
            component.prop1 = 2;
            component.prop2 = 3;
            assert.strictEqual(changes, void 0);
            await Promise.resolve();
            assert.deepStrictEqual(changes, {
                prop1: { newValue: 2, oldValue: 1 },
                5: { newValue: 3, oldValue: 2 }
            });
        });
    });
});
//# sourceMappingURL=custom-attributes.spec.js.map