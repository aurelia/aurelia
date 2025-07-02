var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { runTasks } from '@aurelia/runtime';
import { BindingMode, bindable, customAttribute, customElement, watch } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
describe('3-runtime-html/decorator-watch.expression.spec.ts', function () {
    const testCases = [
        {
            title: 'observes property access',
            get: `\`\${runner.first} \${runner.last}\``,
            created: (post, _, decoratorCount) => {
                assert.strictEqual(post.deliveryCount, 0);
                post.runner.first = 'f';
                runTasks();
                assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
                post.runner.first = 'f';
                runTasks();
                assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
                post.runner = { first: 'f1', last: 'l1', phone: 'p1' };
                runTasks();
                assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
                post.runner = null;
                runTasks();
                assert.strictEqual(post.deliveryCount, 3 * decoratorCount);
            },
            disposed: (post, _, decoratorCount) => {
                post.runner = null;
                assert.strictEqual(post.deliveryCount, 3 * decoratorCount);
            },
        },
        {
            title: 'observes property access expression containing array indices',
            get: 'deliveries[0].done',
            created: (post, _, decoratorCount) => {
                assert.strictEqual(post.deliveryCount, 0);
                post.deliveries.unshift({ id: 1, name: '1', done: false });
                runTasks();
                // value changed from void to 1, hence 1 change handler call
                assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
                post.deliveries.splice(0, 1, { id: 1, name: 'hello', done: true });
                runTasks();
                assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
                post.deliveries.splice(0, 1, { id: 1, name: 'hello', done: false });
                runTasks();
                assert.strictEqual(post.deliveryCount, 3 * decoratorCount);
                post.deliveries[0].done = true;
                runTasks();
                assert.strictEqual(post.deliveryCount, 4 * decoratorCount);
            },
            disposed: (post, _, decoratorCount) => {
                post.deliveries[0].done = false;
                assert.strictEqual(post.deliveryCount, 4 * decoratorCount);
            },
        },
        {
            title: 'observes symbol',
            get: Symbol.for('packages'),
            created: (post, _, decoratorCount) => {
                assert.strictEqual(post.deliveryCount, 0);
                post[Symbol.for('packages')] = 0;
                runTasks();
                assert.strictEqual(post.deliveryCount, 1 * decoratorCount);
                post[Symbol.for('packages')] = 1;
                runTasks();
                assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
            },
            disposed: (post, _, decoratorCount) => {
                assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
                post[Symbol.for('packages')] = 0;
                assert.strictEqual(post.deliveryCount, 2 * decoratorCount);
            },
        },
    ];
    for (const { title, only = false, get, created, disposed } of testCases) {
        const $it = only ? it.only : it;
        $it(`${title} on method`, function () {
            let Post = (() => {
                var _a;
                let _instanceExtraInitializers = [];
                let _log_decorators;
                return _a = class Post {
                        constructor() {
                            this.runner = (__runInitializers(this, _instanceExtraInitializers), {
                                first: 'first',
                                last: 'last',
                                phone: 'phone'
                            });
                            this.deliveries = [];
                            this.selectedItem = void 0;
                            this.counter = 0;
                            this.deliveryCount = 0;
                        }
                        log() {
                            this.deliveryCount++;
                        }
                    },
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _log_decorators = [watch(get)];
                        __esDecorate(_a, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            })();
            const { ctx, component, tearDown } = createFixture('', Post);
            created(component, ctx, 1);
            void tearDown();
            disposed?.(component, ctx, 1);
        });
        $it(`${title} on class`, function () {
            let Post = (() => {
                let _classDecorators = [watch(get, (v, o, a) => a.log())];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Post = _classThis = class {
                    constructor() {
                        this.runner = {
                            first: 'first',
                            last: 'last',
                            phone: 'phone'
                        };
                        this.deliveries = [];
                        this.counter = 0;
                        this.deliveryCount = 0;
                    }
                    log() {
                        this.deliveryCount++;
                    }
                };
                __setFunctionName(_classThis, "Post");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Post = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Post = _classThis;
            })();
            const { ctx, component, tearDown } = createFixture('', Post);
            created(component, ctx, 1);
            void tearDown();
            disposed?.(component, ctx, 1);
        });
        $it(`${title} on class, before @customElement decorator`, function () {
            let Post = (() => {
                let _classDecorators = [watch(get, (v, o, a) => a.log()), customElement({ name: 'post' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Post = _classThis = class {
                    constructor() {
                        this.runner = {
                            first: 'first',
                            last: 'last',
                            phone: 'phone'
                        };
                        this.deliveries = [];
                        this.counter = 0;
                        this.deliveryCount = 0;
                    }
                    log() {
                        this.deliveryCount++;
                    }
                };
                __setFunctionName(_classThis, "Post");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Post = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Post = _classThis;
            })();
            const { ctx, component, tearDown } = createFixture('<post component.ref="post">', class App {
            }, [Post]);
            const post = component.post;
            created(post, ctx, 1);
            void tearDown();
            disposed?.(post, ctx, 1);
        });
        $it(`${title} on class, after @customElement decorator`, function () {
            let Post = (() => {
                let _classDecorators = [customElement({ name: 'post' }), watch(get, (v, o, a) => a.log())];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Post = _classThis = class {
                    constructor() {
                        this.runner = {
                            first: 'first',
                            last: 'last',
                            phone: 'phone'
                        };
                        this.deliveries = [];
                        this.counter = 0;
                        this.deliveryCount = 0;
                    }
                    log() {
                        this.deliveryCount++;
                    }
                };
                __setFunctionName(_classThis, "Post");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Post = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Post = _classThis;
            })();
            const { ctx, component, tearDown } = createFixture('<post component.ref="post">', class App {
            }, [Post]);
            const post = component.post;
            created(post, ctx, 1);
            void tearDown();
            disposed?.(post, ctx, 1);
        });
        $it(`${title} on both class and method`, function () {
            let Post = (() => {
                let _classDecorators = [watch(get, (v, o, a) => a.log())];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _log_decorators;
                var Post = _classThis = class {
                    constructor() {
                        this.runner = (__runInitializers(this, _instanceExtraInitializers), {
                            first: 'first',
                            last: 'last',
                            phone: 'phone'
                        });
                        this.deliveries = [];
                        this.counter = 0;
                        this.deliveryCount = 0;
                    }
                    log() {
                        this.deliveryCount++;
                    }
                };
                __setFunctionName(_classThis, "Post");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _log_decorators = [watch(get)];
                    __esDecorate(_classThis, null, _log_decorators, { kind: "method", name: "log", static: false, private: false, access: { has: obj => "log" in obj, get: obj => obj.log }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Post = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Post = _classThis;
            })();
            const { ctx, component, tearDown } = createFixture('', Post);
            created(component, ctx, 2);
            void tearDown();
            disposed?.(component, ctx, 2);
        });
    }
    describe('on Custom attribute', function () {
        it('works when decorating on class [before @customAttribute]', async function () {
            let callCount = 0;
            let ListActiveIndicator = (() => {
                let _classDecorators = [watch('items.length', (_, __, x) => x.filterChanged()), customAttribute('list-active')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _items_decorators;
                let _items_initializers = [];
                let _items_extraInitializers = [];
                let _active_decorators;
                let _active_initializers = [];
                let _active_extraInitializers = [];
                var ListActiveIndicator = _classThis = class {
                    filterChanged() {
                        callCount++;
                        this.active = this.items?.some(i => i.active);
                    }
                    constructor() {
                        this.items = __runInitializers(this, _items_initializers, void 0);
                        this.active = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _active_initializers, void 0));
                        __runInitializers(this, _active_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "ListActiveIndicator");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _items_decorators = [bindable];
                    _active_decorators = [bindable({ mode: BindingMode.fromView })];
                    __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
                    __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ListActiveIndicator = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ListActiveIndicator = _classThis;
            })();
            const { component, startPromise, tearDown } = createFixture(`<div list-active="items.bind: items; active.bind: active" active.class="active">`, class App {
                constructor() {
                    this.items = [{ active: false }, { active: false }];
                }
            }, [ListActiveIndicator]);
            await startPromise;
            assert.strictEqual(component.active, undefined);
            component.items.push({ active: true });
            runTasks();
            assert.strictEqual(component.active, true);
            assert.strictEqual(callCount, 1);
            await tearDown();
        });
        it('works when decorating on class [after @customAttribute]', async function () {
            let callCount = 0;
            let ListActiveIndicator = (() => {
                let _classDecorators = [customAttribute('list-active'), watch('items.length', (_, __, x) => x.filterChanged())];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _items_decorators;
                let _items_initializers = [];
                let _items_extraInitializers = [];
                let _active_decorators;
                let _active_initializers = [];
                let _active_extraInitializers = [];
                var ListActiveIndicator = _classThis = class {
                    filterChanged() {
                        callCount++;
                        this.active = this.items?.some(i => i.active);
                    }
                    constructor() {
                        this.items = __runInitializers(this, _items_initializers, void 0);
                        this.active = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _active_initializers, void 0));
                        __runInitializers(this, _active_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "ListActiveIndicator");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _items_decorators = [bindable];
                    _active_decorators = [bindable({ mode: BindingMode.fromView })];
                    __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
                    __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ListActiveIndicator = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ListActiveIndicator = _classThis;
            })();
            const { component, startPromise, tearDown } = createFixture(`<div list-active="items.bind: items; active.bind: active" active.class="active">`, class App {
                constructor() {
                    this.items = [{ active: false }, { active: false }];
                }
            }, [ListActiveIndicator]);
            await startPromise;
            assert.strictEqual(component.active, undefined);
            component.items.push({ active: true });
            runTasks();
            assert.strictEqual(component.active, true);
            assert.strictEqual(callCount, 1);
            await tearDown();
        });
        it('works when decorating on method', async function () {
            let callCount = 0;
            let ListActiveIndicator = (() => {
                let _classDecorators = [customAttribute('list-active')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _items_decorators;
                let _items_initializers = [];
                let _items_extraInitializers = [];
                let _active_decorators;
                let _active_initializers = [];
                let _active_extraInitializers = [];
                let _filterChanged_decorators;
                var ListActiveIndicator = _classThis = class {
                    filterChanged() {
                        callCount++;
                        this.active = this.items?.some(i => i.active);
                    }
                    constructor() {
                        this.items = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _items_initializers, void 0));
                        this.active = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _active_initializers, void 0));
                        __runInitializers(this, _active_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "ListActiveIndicator");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _items_decorators = [bindable];
                    _active_decorators = [bindable({ mode: BindingMode.fromView })];
                    _filterChanged_decorators = [watch('items.length')];
                    __esDecorate(_classThis, null, _filterChanged_decorators, { kind: "method", name: "filterChanged", static: false, private: false, access: { has: obj => "filterChanged" in obj, get: obj => obj.filterChanged }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
                    __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ListActiveIndicator = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ListActiveIndicator = _classThis;
            })();
            const { component, startPromise, tearDown } = createFixture(`<div list-active="items.bind: items; active.bind: active" active.class="active">`, class App {
                constructor() {
                    this.items = [{ active: false }, { active: false }];
                }
            }, [ListActiveIndicator]);
            await startPromise;
            assert.strictEqual(component.active, undefined);
            component.items.push({ active: true });
            runTasks();
            assert.strictEqual(component.active, true);
            assert.strictEqual(callCount, 1);
            await tearDown();
        });
        it('works when decorating on both class + method ', async function () {
            let callCount = 0;
            let ListActiveIndicator = (() => {
                let _classDecorators = [customAttribute('list-active'), watch('items.length', (_, __, x) => x.filterChanged())];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _instanceExtraInitializers = [];
                let _items_decorators;
                let _items_initializers = [];
                let _items_extraInitializers = [];
                let _active_decorators;
                let _active_initializers = [];
                let _active_extraInitializers = [];
                let _filterChanged_decorators;
                var ListActiveIndicator = _classThis = class {
                    filterChanged() {
                        callCount++;
                        this.active = this.items?.some(i => i.active);
                    }
                    constructor() {
                        this.items = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _items_initializers, void 0));
                        this.active = (__runInitializers(this, _items_extraInitializers), __runInitializers(this, _active_initializers, void 0));
                        __runInitializers(this, _active_extraInitializers);
                    }
                };
                __setFunctionName(_classThis, "ListActiveIndicator");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _items_decorators = [bindable];
                    _active_decorators = [bindable({ mode: BindingMode.fromView })];
                    _filterChanged_decorators = [watch('items.length')];
                    __esDecorate(_classThis, null, _filterChanged_decorators, { kind: "method", name: "filterChanged", static: false, private: false, access: { has: obj => "filterChanged" in obj, get: obj => obj.filterChanged }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: obj => "items" in obj, get: obj => obj.items, set: (obj, value) => { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
                    __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ListActiveIndicator = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ListActiveIndicator = _classThis;
            })();
            const { component, startPromise, tearDown } = createFixture(`<div list-active="items.bind: items; active.bind: active" active.class="active">`, class App {
                constructor() {
                    this.items = [{ active: false }, { active: false }];
                }
            }, [ListActiveIndicator]);
            await startPromise;
            assert.strictEqual(component.active, undefined);
            component.items.push({ active: true });
            runTasks();
            assert.strictEqual(component.active, true);
            assert.strictEqual(callCount, 2);
            await tearDown();
        });
    });
});
//# sourceMappingURL=decorator-watch.expression.spec.js.map