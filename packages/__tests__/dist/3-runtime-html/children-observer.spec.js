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
import { runTasks, tasksSettled } from '@aurelia/runtime';
import { children, CustomElement, Aurelia, customElement } from '@aurelia/runtime-html';
import { TestContext, assert, createFixture } from '@aurelia/testing';
describe('3-runtime-html/children-observer.spec.ts', function () {
    it('throws on invalid query', function () {
        let El = (() => {
            let _classDecorators = [customElement({
                    name: 'el',
                    template: '<au-slot>'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _divs_decorators;
            let _divs_initializers = [];
            let _divs_extraInitializers = [];
            var El = _classThis = class {
                constructor() {
                    this.divs = __runInitializers(this, _divs_initializers, void 0);
                    __runInitializers(this, _divs_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "El");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _divs_decorators = [children('div div')];
                __esDecorate(null, null, _divs_decorators, { kind: "field", name: "divs", static: false, private: false, access: { has: obj => "divs" in obj, get: obj => obj.divs, set: (obj, value) => { obj.divs = value; } }, metadata: _metadata }, _divs_initializers, _divs_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                El = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return El = _classThis;
        })();
        assert.throws(() => createFixture('', El));
    });
    describe('populates', function () {
        it('[without shadow DOM] static plain elements', async function () {
            let MyEl = (() => {
                let _classDecorators = [customElement({ name: 'my-el', template: '<slot>', shadowOptions: { mode: 'open' } })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _children_decorators;
                let _children_initializers = [];
                let _children_extraInitializers = [];
                var MyEl = _classThis = class {
                    constructor() {
                        this.children = __runInitializers(this, _children_initializers, void 0);
                        __runInitializers(this, _children_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "MyEl");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _children_decorators = [children({ filter: n => !!n, map: n => n })];
                    __esDecorate(null, null, _children_decorators, { kind: "field", name: "children", static: false, private: false, access: { has: obj => "children" in obj, get: obj => obj.children, set: (obj, value) => { obj.children = value; } }, metadata: _metadata }, _children_initializers, _children_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyEl = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyEl = _classThis;
            })();
            const { getBy } = await createFixture('<my-el><div>one</div><span>two</span>', class {
            }, [MyEl]).started;
            const myElVm = CustomElement.for(getBy('my-el')).viewModel;
            assert.strictEqual(myElVm.children.length, 2);
        });
        it('children array with child view models', async function () {
            const { au, viewModel, ChildOne, ChildTwo } = createAppAndStart();
            await Promise.resolve();
            assert.equal(viewModel.children.length, 2);
            assert.instanceOf(viewModel.children[0], ChildOne);
            assert.instanceOf(viewModel.children[1], ChildTwo);
            await au.stop();
            au.dispose();
        });
        it('children array with by custom query', async function () {
            const { au, viewModel, ChildOne } = createAppAndStart({
                query: '.child-one'
            });
            await Promise.resolve();
            assert.equal(viewModel.children.length, 1);
            assert.instanceOf(viewModel.children[0], ChildOne);
            await au.stop();
            au.dispose();
        });
        it('children array with by custom query, filter, and map', async function () {
            const { au, viewModel, ChildOne } = createAppAndStart({
                query: '.child-one',
                filter: (node) => !!node,
                map: (node) => node
            });
            await Promise.resolve();
            assert.equal(viewModel.children.length, 1);
            assert.equal(viewModel.children[0].tagName, CustomElement.getDefinition(ChildOne).name.toUpperCase());
            await au.stop();
            au.dispose();
        });
        it('queries all nodes when using "$all"', async function () {
            const { component } = createFixture('<e-l component.ref="el">hi<div>hey</div><span></span><p></p><!--hah-->', { el: { children: [] } }, [
                CustomElement.define({ name: 'e-l', template: '<slot>', shadowOptions: { mode: 'open' } }, (() => {
                    var _a;
                    let _children_decorators;
                    let _children_initializers = [];
                    let _children_extraInitializers = [];
                    return _a = class El {
                            constructor() {
                                this.children = __runInitializers(this, _children_initializers, void 0);
                                __runInitializers(this, _children_extraInitializers);
                            }
                        },
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _children_decorators = [children('$all')];
                            __esDecorate(null, null, _children_decorators, { kind: "field", name: "children", static: false, private: false, access: { has: obj => "children" in obj, get: obj => obj.children, set: (obj, value) => { obj.children = value; } }, metadata: _metadata }, _children_initializers, _children_extraInitializers);
                            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        })(),
                        _a;
                })())
            ]);
            assert.strictEqual(component.el.children.length, 5 /* #text + div + span + p + #comment */);
        });
    });
    describe('updates', function () {
        it('children array with child view models', async function () {
            const { au, viewModel, ChildOne, ChildTwo, hostViewModel } = createAppAndStart();
            await Promise.resolve();
            assert.equal(viewModel.children.length, 2);
            assert.equal(viewModel.childrenChangedCallCount, 1);
            hostViewModel.oneCount = 2;
            hostViewModel.twoCount = 2;
            await tasksSettled();
            assert.equal(viewModel.children.length, 4);
            assert.equal(viewModel.childrenChangedCallCount, 2);
            assert.instanceOf(viewModel.children[0], ChildOne);
            assert.instanceOf(viewModel.children[1], ChildOne);
            assert.instanceOf(viewModel.children[2], ChildTwo);
            assert.instanceOf(viewModel.children[3], ChildTwo);
            await au.stop();
            au.dispose();
        });
        it('children array with by custom query', async function () {
            const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
                query: '.child-two'
            });
            await Promise.resolve();
            assert.equal(viewModel.children.length, 1);
            assert.instanceOf(viewModel.children[0], ChildTwo);
            assert.equal(viewModel.childrenChangedCallCount, 1);
            hostViewModel.oneCount = 2;
            hostViewModel.twoCount = 2;
            await tasksSettled();
            assert.equal(viewModel.children.length, 2);
            assert.equal(viewModel.childrenChangedCallCount, 2);
            assert.instanceOf(viewModel.children[0], ChildTwo);
            assert.instanceOf(viewModel.children[1], ChildTwo);
            await au.stop();
            au.dispose();
        });
        it('children array with by custom query, filter, and map', async function () {
            const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
                query: '.child-two',
                filter: (node) => !!node,
                map: (node) => node
            });
            await Promise.resolve();
            const tagName = CustomElement.getDefinition(ChildTwo).name.toUpperCase();
            assert.equal(viewModel.children.length, 1);
            assert.equal(viewModel.children[0].tagName, tagName);
            assert.equal(viewModel.childrenChangedCallCount, 1);
            hostViewModel.oneCount = 2;
            hostViewModel.twoCount = 2;
            await tasksSettled();
            assert.equal(viewModel.children.length, 2);
            assert.equal(viewModel.childrenChangedCallCount, 2);
            assert.equal(viewModel.children[0].tagName, tagName);
            assert.equal(viewModel.children[1].tagName, tagName);
            await au.stop();
            au.dispose();
        });
        it('updates subscribers', async function () {
            let El = (() => {
                let _classDecorators = [customElement({
                        name: 'e-l',
                        template: 'child count: ${nodes.length}',
                        shadowOptions: { mode: 'open' }
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _nodes_decorators;
                let _nodes_initializers = [];
                let _nodes_extraInitializers = [];
                var El = _classThis = class {
                    constructor() {
                        this.nodes = __runInitializers(this, _nodes_initializers, void 0);
                        __runInitializers(this, _nodes_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "El");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _nodes_decorators = [children('div')];
                    __esDecorate(null, null, _nodes_decorators, { kind: "field", name: "nodes", static: false, private: false, access: { has: obj => "nodes" in obj, get: obj => obj.nodes, set: (obj, value) => { obj.nodes = value; } }, metadata: _metadata }, _nodes_initializers, _nodes_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    El = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return El = _classThis;
            })();
            const { assertText } = createFixture('<e-l ref=el><div repeat.for="i of items">', class App {
                constructor() {
                    this.items = 3;
                }
            }, [El]);
            await Promise.resolve();
            runTasks();
            assertText('child count: 3');
        });
    });
    function createAppAndStart(childrenOptions) {
        const ctx = TestContext.create();
        const { container } = ctx;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const HostElement = defineAndRegisterElementWithChildren(container, childrenOptions);
        const ChildOne = defineAndRegisterElement('child-one', container);
        const ChildTwo = defineAndRegisterElement('child-two', container);
        const component = defineAndRegisterHost(`
        <element-with-children>
          <child-one repeat.for="n of oneCount" class="child-one"></child-one>
          <child-two repeat.for="n of twoCount" class="child-two"></child-two>
        </element-with-children>
      `, container);
        const au = new Aurelia(container);
        const host = ctx.createElement(CustomElement.getDefinition(component).name);
        au.app({ host, component });
        void au.start();
        const hostViewModel = CustomElement.for(host).viewModel;
        const viewModel = CustomElement.for(host.children[0]).viewModel;
        return {
            au,
            hostViewModel,
            viewModel,
            ChildOne,
            ChildTwo
        };
    }
    function defineAndRegisterElementWithChildren(container, options) {
        let ElementWithChildren = (() => {
            let _classDecorators = [customElement({
                    name: 'element-with-children',
                    template: `<slot></slot>`,
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _children_decorators;
            let _children_initializers = [];
            let _children_extraInitializers = [];
            var ElementWithChildren = _classThis = class {
                constructor() {
                    this.children = __runInitializers(this, _children_initializers, void 0);
                    this.childrenChangedCallCount = (__runInitializers(this, _children_extraInitializers), 0);
                }
                childrenChanged() {
                    this.childrenChangedCallCount++;
                }
            };
            __setFunctionName(_classThis, "ElementWithChildren");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _children_decorators = [children(options)];
                __esDecorate(null, null, _children_decorators, { kind: "field", name: "children", static: false, private: false, access: { has: obj => "children" in obj, get: obj => obj.children, set: (obj, value) => { obj.children = value; } }, metadata: _metadata }, _children_initializers, _children_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ElementWithChildren = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ElementWithChildren = _classThis;
        })();
        container.register(ElementWithChildren);
        return ElementWithChildren;
    }
    function defineAndRegisterHost(template, container) {
        class HostElement {
            constructor() {
                this.oneCount = 1;
                this.twoCount = 1;
            }
        }
        const element = CustomElement.define({
            name: 'host-element',
            template
        }, HostElement);
        container.register(element);
        return element;
    }
    function defineAndRegisterElement(name, container) {
        class Element {
        }
        const element = CustomElement.define({
            name: name,
            template: `<div>My name is ${name}.`
        }, Element);
        container.register(element);
        return element;
    }
});
//# sourceMappingURL=children-observer.spec.js.map