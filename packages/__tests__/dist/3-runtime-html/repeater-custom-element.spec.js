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
import { tasksSettled } from '@aurelia/runtime';
import { BindingBehavior, customElement, bindable, CustomElement, Aurelia, IPlatform, } from '@aurelia/runtime-html';
import { assert, getVisibleText, TestContext, } from '@aurelia/testing';
import { createSpecFunction, } from '../util.js';
describe('3-runtime-html/repeater-custom-element.spec.ts', function () {
    async function testRepeatForCustomElement(testFunction, { template, registrations = [], app, }) {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        await au.register(...registrations, BindingBehavior.define('keyed', class NoopKeyedBindingBehavior {
        }))
            .app({
            host,
            component: CustomElement.define({ name: 'app', template }, app ?? class {
            })
        })
            .start();
        const component = au.root.controller.viewModel;
        try {
            await testFunction({ app: component, container, ctx, host, platform: container.get(IPlatform) });
        }
        catch (ex) {
            ctx.doc.body.removeChild(host);
            throw ex;
        }
        finally {
            await au.stop();
        }
        try {
            assert.strictEqual(host.textContent, '', `host.textContent`);
        }
        finally {
            ctx.doc.body.removeChild(host);
        }
    }
    const $it = createSpecFunction(testRepeatForCustomElement);
    // repeater with custom element
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: 'a' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Foo = _classThis = class {
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count"></foo>`,
        };
        $it('static child content', async function ({ app, platform, host }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            const q = platform.domQueue;
            await q.yield();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '${prop}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    __runInitializers(this, _prop_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<template>
          <template repeat.for="i of 3">
            <foo prop.bind="i"></foo>
          </template>
        </template>`,
        };
        $it('dynamic child content', async function ({ platform, host }) {
            const q = platform.domQueue;
            await q.yield();
            assert.html.innerEqual(host, '<foo>0</foo> <foo>1</foo> <foo>2</foo>', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '${prop}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    __runInitializers(this, _prop_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<let items.bind="[{p: 1}, {p: 2}, {p: 3}]"></let>` +
                `<template repeat.for="item of items">
          <foo prop.bind="item.p"></foo>
        </template>`,
        };
        $it('let integration', async function ({ platform, host }) {
            const q = platform.domQueue;
            await q.yield();
            assert.html.innerEqual(host, '<foo>1</foo> <foo>2</foo> <foo>3</foo>', `host.textContent`);
        }, setup);
    }
    {
        let Bar = (() => {
            let _classDecorators = [customElement({ name: 'bar', template: 'bar' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _id_decorators;
            let _id_initializers = [];
            let _id_extraInitializers = [];
            var Bar = _classThis = class {
                constructor() {
                    this.id = __runInitializers(this, _id_initializers, Bar.id++);
                    __runInitializers(this, _id_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Bar");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _id_decorators = [bindable];
                __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Bar = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })();
            _classThis.id = 1;
            (() => {
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Bar = _classThis;
        })();
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '${prop}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _prop_decorators;
            let _prop_initializers = [];
            let _prop_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.prop = __runInitializers(this, _prop_initializers, void 0);
                    __runInitializers(this, _prop_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _prop_decorators = [bindable];
                __esDecorate(null, null, _prop_decorators, { kind: "field", name: "prop", static: false, private: false, access: { has: obj => "prop" in obj, get: obj => obj.prop, set: (obj, value) => { obj.prop = value; } }, metadata: _metadata }, _prop_initializers, _prop_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Bar, Foo],
            template: `<template>
          <template repeat.for="i of 2">
            <let id.bind="null"></let>
            <bar id.from-view="id"></bar>
            <foo prop.bind="id"></foo>
          </template>
        </template>`,
        };
        $it('from-view integration', async function ({ platform, host }) {
            const q = platform.domQueue;
            await q.yield();
            assert.html.innerEqual(host, '<bar>bar</bar> <foo>1</foo> <bar>bar</bar> <foo>2</foo>', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'b';
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo text.bind="theText" repeat.for="i of count"></foo>`,
        };
        $it('repeater with custom element + inner bindable with different name than outer property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.theText = 'a';
            // await tasksSettled();
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.text = 'b';
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo text.bind="text" repeat.for="i of count"></foo>`,
        };
        $it('repeater with custom element + inner bindable with same name as outer property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.text = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count" text.bind="theText"></foo>`,
        };
        $it('repeater with custom element + inner bindable with different name than outer property, reversed - uninitialized property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.theText = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count" text.bind="text"></foo>`,
        };
        $it('repeater with custom element + inner bindable with same name as outer property, reversed - uninitialized property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.text = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'a';
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count" text.bind="theText"></foo>`,
        };
        $it('repeater with custom element + inner bindable with different name than outer property, reversed - initialized property', async function ({ host }) {
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'a';
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count" text.bind="theText"></foo>`,
        };
        $it('repeater with custom element + inner bindable with same name as outer property, reversed - initialized property', async function ({ host }) {
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div repeat.for="item of todos">${item}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _todos_decorators;
            let _todos_initializers = [];
            let _todos_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.todos = __runInitializers(this, _todos_initializers, void 0);
                    __runInitializers(this, _todos_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _todos_decorators = [bindable];
                __esDecorate(null, null, _todos_decorators, { kind: "field", name: "todos", static: false, private: false, access: { has: obj => "todos" in obj, get: obj => obj.todos, set: (obj, value) => { obj.todos = value; } }, metadata: _metadata }, _todos_initializers, _todos_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.todos = ['a', 'b', 'c'];
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count" todos.bind="todos"></foo>`,
        };
        $it('repeater with custom element with repeater', async function ({ platform, host, app }) {
            const q = platform.domQueue;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
            app.count = 1;
            await q.yield();
            assert.strictEqual(host.textContent, 'abc', `host.textContent`);
            app.count = 3;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _todos_decorators;
            let _todos_initializers = [];
            let _todos_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.todos = __runInitializers(this, _todos_initializers, void 0);
                    __runInitializers(this, _todos_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _todos_decorators = [bindable];
                __esDecorate(null, null, _todos_decorators, { kind: "field", name: "todos", static: false, private: false, access: { has: obj => "todos" in obj, get: obj => obj.todos, set: (obj, value) => { obj.todos = value; } }, metadata: _metadata }, _todos_initializers, _todos_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']];
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count" todos.bind="todos"></foo>`,
        };
        $it('repeater with custom element with repeater, nested arrays', async function ({ platform, host, app }) {
            const q = platform.domQueue;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);
            app.count = 1;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
            app.count = 3;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);
        }, setup);
    }
    {
        let childrenCount = 0;
        let FooEl = (() => {
            let _classDecorators = [customElement({
                    name: 'foo-el',
                    template: `\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt"></foo-el>`,
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _cnt_decorators;
            let _cnt_initializers = [];
            let _cnt_extraInitializers = [];
            let _max_decorators;
            let _max_initializers = [];
            let _max_extraInitializers = [];
            let _cur_decorators;
            let _cur_initializers = [];
            let _cur_extraInitializers = [];
            let _txt_decorators;
            let _txt_initializers = [];
            let _txt_extraInitializers = [];
            var FooEl = _classThis = class {
                constructor() {
                    this.cnt = __runInitializers(this, _cnt_initializers, void 0);
                    this.max = (__runInitializers(this, _cnt_extraInitializers), __runInitializers(this, _max_initializers, void 0));
                    this.cur = (__runInitializers(this, _max_extraInitializers), __runInitializers(this, _cur_initializers, void 0));
                    this.txt = (__runInitializers(this, _cur_extraInitializers), __runInitializers(this, _txt_initializers, void 0));
                    this.$controller = __runInitializers(this, _txt_extraInitializers);
                }
                attached() {
                    childrenCount += this.$controller.children.length;
                }
            };
            __setFunctionName(_classThis, "FooEl");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _cnt_decorators = [bindable];
                _max_decorators = [bindable];
                _cur_decorators = [bindable];
                _txt_decorators = [bindable];
                __esDecorate(null, null, _cnt_decorators, { kind: "field", name: "cnt", static: false, private: false, access: { has: obj => "cnt" in obj, get: obj => obj.cnt, set: (obj, value) => { obj.cnt = value; } }, metadata: _metadata }, _cnt_initializers, _cnt_extraInitializers);
                __esDecorate(null, null, _max_decorators, { kind: "field", name: "max", static: false, private: false, access: { has: obj => "max" in obj, get: obj => obj.max, set: (obj, value) => { obj.max = value; } }, metadata: _metadata }, _max_initializers, _max_extraInitializers);
                __esDecorate(null, null, _cur_decorators, { kind: "field", name: "cur", static: false, private: false, access: { has: obj => "cur" in obj, get: obj => obj.cur, set: (obj, value) => { obj.cur = value; } }, metadata: _metadata }, _cur_initializers, _cur_extraInitializers);
                __esDecorate(null, null, _txt_decorators, { kind: "field", name: "txt", static: false, private: false, access: { has: obj => "txt" in obj, get: obj => obj.txt, set: (obj, value) => { obj.txt = value; } }, metadata: _metadata }, _txt_initializers, _txt_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooEl = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooEl = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.cnt = 10;
                    this.max = 3;
                    this.txt = 'a';
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
        const setup = {
            app: App,
            registrations: [FooEl],
            template: `<foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt" ref.bind="'foo'+i"></foo-el>`,
        };
        $it('repeater with custom element and children observer', async function ({ host, app }) {
            const content = getVisibleText(host, true);
            let expectedCount = 10 + 10 ** 2 + 10 ** 3;
            assert.strictEqual(content.length, expectedCount, `getVisibleText(au, host).length`);
            assert.strictEqual(content, 'a'.repeat(expectedCount), `getVisibleText(au, host)`);
            assert.strictEqual(childrenCount, expectedCount, `childrenCount #1`);
            assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length #1`);
            app.cnt = 11;
            await Promise.resolve();
            // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
            if (typeof window !== 'undefined') {
                expectedCount = 11 + 11 ** 2 + 11 ** 3;
                assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length #2`);
                assert.strictEqual(childrenCount, expectedCount, `childrenCount #2`);
            }
        }, setup);
    }
    {
        let childrenCount = 0;
        let FooEl = (() => {
            let _classDecorators = [customElement({
                    name: 'foo-el',
                    template: `\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt;key:n"></foo-el>`,
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _cnt_decorators;
            let _cnt_initializers = [];
            let _cnt_extraInitializers = [];
            let _max_decorators;
            let _max_initializers = [];
            let _max_extraInitializers = [];
            let _cur_decorators;
            let _cur_initializers = [];
            let _cur_extraInitializers = [];
            let _txt_decorators;
            let _txt_initializers = [];
            let _txt_extraInitializers = [];
            var FooEl = _classThis = class {
                constructor() {
                    this.cnt = __runInitializers(this, _cnt_initializers, void 0);
                    this.max = (__runInitializers(this, _cnt_extraInitializers), __runInitializers(this, _max_initializers, void 0));
                    this.cur = (__runInitializers(this, _max_extraInitializers), __runInitializers(this, _cur_initializers, void 0));
                    this.txt = (__runInitializers(this, _cur_extraInitializers), __runInitializers(this, _txt_initializers, void 0));
                    this.$controller = __runInitializers(this, _txt_extraInitializers);
                }
                attached() {
                    childrenCount += this.$controller.children.length;
                }
            };
            __setFunctionName(_classThis, "FooEl");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _cnt_decorators = [bindable];
                _max_decorators = [bindable];
                _cur_decorators = [bindable];
                _txt_decorators = [bindable];
                __esDecorate(null, null, _cnt_decorators, { kind: "field", name: "cnt", static: false, private: false, access: { has: obj => "cnt" in obj, get: obj => obj.cnt, set: (obj, value) => { obj.cnt = value; } }, metadata: _metadata }, _cnt_initializers, _cnt_extraInitializers);
                __esDecorate(null, null, _max_decorators, { kind: "field", name: "max", static: false, private: false, access: { has: obj => "max" in obj, get: obj => obj.max, set: (obj, value) => { obj.max = value; } }, metadata: _metadata }, _max_initializers, _max_extraInitializers);
                __esDecorate(null, null, _cur_decorators, { kind: "field", name: "cur", static: false, private: false, access: { has: obj => "cur" in obj, get: obj => obj.cur, set: (obj, value) => { obj.cur = value; } }, metadata: _metadata }, _cur_initializers, _cur_extraInitializers);
                __esDecorate(null, null, _txt_decorators, { kind: "field", name: "txt", static: false, private: false, access: { has: obj => "txt" in obj, get: obj => obj.txt, set: (obj, value) => { obj.txt = value; } }, metadata: _metadata }, _txt_initializers, _txt_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooEl = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooEl = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.cnt = Array(10).fill(null).map((v, i) => ({ n: i }));
                    this.max = 3;
                    this.txt = 'a';
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
        const setup = {
            app: App,
            registrations: [FooEl],
            template: `<foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt;key:n" ref.bind="'foo'+i.n"></foo-el>`,
        };
        $it('repeater with custom element and children observer', async function ({ host, app }) {
            const content = getVisibleText(host, true);
            let expectedCount = 10 + 10 ** 2 + 10 ** 3;
            assert.strictEqual(content.length, expectedCount, `getVisibleText(au, host).length`);
            assert.strictEqual(content, 'a'.repeat(expectedCount), `getVisibleText(au, host)`);
            assert.strictEqual(childrenCount, expectedCount, `childrenCount #1`);
            assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length #1`);
            app.cnt = Array(11).fill(null).map((v, i) => ({ n: i }));
            await Promise.resolve();
            // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
            if (typeof window !== 'undefined') {
                expectedCount = 11 + 11 ** 2 + 11 ** 3;
                assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length #2`);
                assert.strictEqual(childrenCount, expectedCount, `childrenCount #2`);
            }
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: 'a', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Foo = _classThis = class {
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed"></foo>`,
        };
        $it('repeater with custom element', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'b';
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo text.bind="theText" repeat.for="i of count & keyed"></foo>`,
        };
        $it('repeater with custom element + inner bindable with different name than outer property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.theText = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.text = 'b';
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo text.bind="text" repeat.for="i of count & keyed"></foo>`,
        };
        $it('repeater with custom element + inner bindable with same name as outer property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.text = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'b';
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed" text.bind="theText"></foo>`,
        };
        $it('repeater with custom element + inner bindable with different name than outer property, reversed, uninitialized property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.theText = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.text = 'b';
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed" text.bind="text"></foo>`,
        };
        $it('repeater with custom element + inner bindable with same name as outer property, reversed, uninitialized property', async function ({ host, app }) {
            assert.strictEqual(host.textContent, '', `host.textContent`);
            app.count = 3;
            app.text = 'a';
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'a';
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed" text.bind="theText"></foo>`,
        };
        $it('repeater with custom element + inner bindable with different name than outer property, reversed', async function ({ host }) {
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _text_decorators;
            let _text_initializers = [];
            let _text_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.text = __runInitializers(this, _text_initializers, void 0);
                    __runInitializers(this, _text_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _text_decorators = [bindable];
                __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.theText = 'a';
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed" text.bind="theText"></foo>`,
        };
        $it('repeater with custom element + inner bindable with same name as outer property, reversed', async function ({ host }) {
            await tasksSettled();
            assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div repeat.for="item of todos & keyed">${item}</div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _todos_decorators;
            let _todos_initializers = [];
            let _todos_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.todos = __runInitializers(this, _todos_initializers, void 0);
                    __runInitializers(this, _todos_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _todos_decorators = [bindable];
                __esDecorate(null, null, _todos_decorators, { kind: "field", name: "todos", static: false, private: false, access: { has: obj => "todos" in obj, get: obj => obj.todos, set: (obj, value) => { obj.todos = value; } }, metadata: _metadata }, _todos_initializers, _todos_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.todos = ['a', 'b', 'c'];
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed" todos.bind="todos"></foo>`,
        };
        $it('repeater with custom element with repeater', async function ({ platform, host, app }) {
            const q = platform.domQueue;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
            app.count = 1;
            await q.yield();
            assert.strictEqual(host.textContent, 'abc', `host.textContent`);
            app.count = 3;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
        }, setup);
    }
    {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'foo', template: '<div repeat.for="innerTodos of todos & keyed"><div repeat.for="item of innerTodos & keyed">${item}</div></div>', instructions: [] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _todos_decorators;
            let _todos_initializers = [];
            let _todos_extraInitializers = [];
            var Foo = _classThis = class {
                constructor() {
                    this.todos = __runInitializers(this, _todos_initializers, void 0);
                    __runInitializers(this, _todos_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _todos_decorators = [bindable];
                __esDecorate(null, null, _todos_decorators, { kind: "field", name: "todos", static: false, private: false, access: { has: obj => "todos" in obj, get: obj => obj.todos, set: (obj, value) => { obj.todos = value; } }, metadata: _metadata }, _todos_initializers, _todos_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        class App {
            constructor() {
                this.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']];
                this.count = 3;
            }
        }
        const setup = {
            app: App,
            registrations: [Foo],
            template: `<foo repeat.for="i of count & keyed" todos.bind="todos"></foo>`,
        };
        $it('repeater with custom element with repeater, nested arrays', async function ({ platform, host, app }) {
            const q = platform.domQueue;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);
            app.count = 1;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
            app.count = 3;
            await q.yield();
            assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);
        }, setup);
    }
    // TODO: figure out why repeater in keyed mode gives different numbers
    {
        let childrenCount = 0;
        let FooEl = (() => {
            let _classDecorators = [customElement({
                    name: 'foo-el',
                    template: `\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt"></foo-el>`,
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _cnt_decorators;
            let _cnt_initializers = [];
            let _cnt_extraInitializers = [];
            let _max_decorators;
            let _max_initializers = [];
            let _max_extraInitializers = [];
            let _cur_decorators;
            let _cur_initializers = [];
            let _cur_extraInitializers = [];
            let _txt_decorators;
            let _txt_initializers = [];
            let _txt_extraInitializers = [];
            var FooEl = _classThis = class {
                constructor() {
                    this.cnt = __runInitializers(this, _cnt_initializers, void 0);
                    this.max = (__runInitializers(this, _cnt_extraInitializers), __runInitializers(this, _max_initializers, void 0));
                    this.cur = (__runInitializers(this, _max_extraInitializers), __runInitializers(this, _cur_initializers, void 0));
                    this.txt = (__runInitializers(this, _cur_extraInitializers), __runInitializers(this, _txt_initializers, void 0));
                    this.$controller = __runInitializers(this, _txt_extraInitializers);
                }
                attached() {
                    childrenCount += this.$controller.children.length;
                }
            };
            __setFunctionName(_classThis, "FooEl");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _cnt_decorators = [bindable];
                _max_decorators = [bindable];
                _cur_decorators = [bindable];
                _txt_decorators = [bindable];
                __esDecorate(null, null, _cnt_decorators, { kind: "field", name: "cnt", static: false, private: false, access: { has: obj => "cnt" in obj, get: obj => obj.cnt, set: (obj, value) => { obj.cnt = value; } }, metadata: _metadata }, _cnt_initializers, _cnt_extraInitializers);
                __esDecorate(null, null, _max_decorators, { kind: "field", name: "max", static: false, private: false, access: { has: obj => "max" in obj, get: obj => obj.max, set: (obj, value) => { obj.max = value; } }, metadata: _metadata }, _max_initializers, _max_extraInitializers);
                __esDecorate(null, null, _cur_decorators, { kind: "field", name: "cur", static: false, private: false, access: { has: obj => "cur" in obj, get: obj => obj.cur, set: (obj, value) => { obj.cur = value; } }, metadata: _metadata }, _cur_initializers, _cur_extraInitializers);
                __esDecorate(null, null, _txt_decorators, { kind: "field", name: "txt", static: false, private: false, access: { has: obj => "txt" in obj, get: obj => obj.txt, set: (obj, value) => { obj.txt = value; } }, metadata: _metadata }, _txt_initializers, _txt_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                FooEl = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return FooEl = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    shadowOptions: { mode: 'open' }
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                constructor() {
                    this.cnt = 10;
                    this.max = 3;
                    this.txt = 'a';
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
        const setup = {
            app: App,
            registrations: [FooEl],
            template: `<foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt" ref.bind="'foo'+i"></foo-el>`,
        };
        $it('repeater with custom element and children observer', async function ({ host, app }) {
            const content = getVisibleText(host, true);
            let expectedCount = 10 + 10 ** 2 + 10 ** 3;
            assert.strictEqual(content.length, expectedCount, `getVisibleText(au, host).length`);
            assert.strictEqual(content, 'a'.repeat(expectedCount), `getVisibleText(au, host)`);
            assert.strictEqual(childrenCount, expectedCount, `childrenCount - #1`);
            assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length - #1`);
            app['cnt'] = 11;
            await Promise.resolve();
            // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
            if (typeof window !== 'undefined') {
                expectedCount = 11 + 11 ** 2 + 11 ** 3;
                assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length - #2`);
                assert.strictEqual(childrenCount, expectedCount, `childrenCount - #2`);
            }
        }, setup);
    }
});
//# sourceMappingURL=repeater-custom-element.spec.js.map