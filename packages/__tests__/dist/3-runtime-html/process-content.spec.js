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
import { noop, toArray } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { Aurelia, BindingMode, bindable, CustomElement, customElement, IPlatform, processContent } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction } from '../util.js';
describe('3-runtime-html/process-content.spec.ts', function () {
    class TestExecutionContext {
        constructor(ctx, container, host, app, error) {
            this.ctx = ctx;
            this.container = container;
            this.host = host;
            this.app = app;
            this.error = error;
        }
        get platform() { return this._platform ?? (this._platform = this.container.get(IPlatform)); }
    }
    async function testAuSlot(testFunction, { template, registrations, enhance = false } = {}) {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        let error = null;
        let app = null;
        let stop;
        try {
            au.register(...registrations);
            if (enhance) {
                host.innerHTML = template;
                const enhanceRoot = await au.enhance({ host, component: CustomElement.define({ name: 'app' }, App) });
                app = enhanceRoot.controller.viewModel;
                stop = () => enhanceRoot.deactivate();
            }
            else {
                await au.app({ host, component: CustomElement.define({ name: 'app', template }, App) })
                    .start();
                app = au.root.controller.viewModel;
            }
        }
        catch (e) {
            error = e;
        }
        await testFunction(new TestExecutionContext(ctx, container, host, app, error));
        if (error === null) {
            await au.stop();
            await stop?.();
        }
        ctx.doc.body.removeChild(host);
    }
    const $it = createSpecFunction(testAuSlot);
    class App {
    }
    class TestData {
        constructor(spec, template, registrations, expectedInnerHtmlMap, additionalAssertion, enhance = false, only = false) {
            this.spec = spec;
            this.template = template;
            this.registrations = registrations;
            this.expectedInnerHtmlMap = expectedInnerHtmlMap;
            this.additionalAssertion = additionalAssertion;
            this.enhance = enhance;
            this.only = only;
        }
    }
    function* getTestData() {
        var _a;
        {
            class MyElement {
                static processContent(_node, _p) {
                    this.hookInvoked = true;
                }
            }
            MyElement.hookInvoked = false;
            yield new TestData('a static processContent method is auto-discovered', `<my-element normal="foo" bold="bar"></my-element>`, [
                CustomElement.define({
                    name: 'my-element',
                    template: `<div><au-slot></au-slot></div>`,
                }, MyElement)
            ], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            class MyElement {
                static processContent(_node, _p) {
                    this.hookInvoked = true;
                }
            }
            MyElement.hookInvoked = false;
            yield new TestData('a static function can be used as the processContent hook', `<my-element normal="foo" bold="bar"></my-element>`, [
                CustomElement.define({
                    name: 'my-element',
                    template: `<div><au-slot></au-slot></div>`,
                    processContent: MyElement.processContent
                }, MyElement)
            ], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        // The following tests don't work. Refer: https://github.com/microsoft/TypeScript/issues/57366
        // {
        //   @processContent(MyElement.processContent)
        //   @customElement({
        //     name: 'my-element',
        //     template: `<div><au-slot></au-slot></div>`,
        //   })
        //   class MyElement {
        //     public static hookInvoked: boolean = false;
        //     public static processContent(_node: INode, _p: IPlatform) {
        //       this.hookInvoked = true;
        //     }
        //   }
        //   yield new TestData(
        //     'processContent hook can be configured using class-level decorator - function - order 1',
        //     `<my-element normal="foo" bold="bar"></my-element>`,
        //     [MyElement],
        //     {},
        //     () => {
        //       assert.strictEqual(MyElement.hookInvoked, true);
        //     }
        //   );
        // }
        // {
        //   @customElement({
        //     name: 'my-element',
        //     template: `<div><au-slot></au-slot></div>`,
        //   })
        //   @processContent(MyElement.processContent)
        //   class MyElement {
        //     public static hookInvoked: boolean = false;
        //     public static processContent(_node: INode, _p: IPlatform) {
        //       this.hookInvoked = true;
        //     }
        //   }
        //   yield new TestData(
        //     'processContent hook can be configured using class-level decorator - function - order 2',
        //     `<my-element normal="foo" bold="bar"></my-element>`,
        //     [MyElement],
        //     {},
        //     () => {
        //       assert.strictEqual(MyElement.hookInvoked, true);
        //     }
        //   );
        // }
        {
            let MyElement = (() => {
                let _classDecorators = [processContent('processContent'), customElement({
                        name: 'my-element',
                        template: `<div><au-slot></au-slot></div>`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElement = _classThis = class {
                    static processContent(_node, _p) {
                        this.hookInvoked = true;
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.hookInvoked = false;
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('processContent hook can be configured using class-level decorator - function name - order 1', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            let MyElement = (() => {
                let _classDecorators = [customElement({
                        name: 'my-element',
                        template: `<div><au-slot></au-slot></div>`,
                    }), processContent('processContent')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElement = _classThis = class {
                    static processContent(_node, _p) {
                        this.hookInvoked = true;
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.hookInvoked = false;
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('processContent hook can be configured using class-level decorator - function name - order 2', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            function processContent1(_node, _p) {
                this.hookInvoked = true;
            }
            let MyElement = (() => {
                let _classDecorators = [processContent(processContent1), customElement({
                        name: 'my-element',
                        template: `<div><au-slot></au-slot></div>`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var MyElement = _classThis = class {
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.hookInvoked = false;
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('processContent hook can be configured using class-level decorator - standalone function', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            let MyElement = (() => {
                let _classDecorators = [customElement({
                        name: 'my-element',
                        template: `<div><au-slot></au-slot></div>`,
                    })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _staticExtraInitializers = [];
                let _static_processContent_decorators;
                var MyElement = _classThis = class {
                    static processContent(_node, _p, _data) {
                        this.hookInvoked = true;
                    }
                };
                __setFunctionName(_classThis, "MyElement");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _static_processContent_decorators = [processContent()];
                    __esDecorate(_classThis, null, _static_processContent_decorators, { kind: "method", name: "processContent", static: true, private: false, access: { has: obj => "processContent" in obj, get: obj => obj.processContent }, metadata: _metadata }, null, _staticExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    MyElement = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })();
                _classThis.hookInvoked = (__runInitializers(_classThis, _staticExtraInitializers), false);
                (() => {
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return MyElement = _classThis;
            })();
            yield new TestData('processContent hook can be configured using method-level decorator', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        yield new TestData('can mutate node content', `<my-element normal="foo" bold="bar"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                template: `<div><au-slot></au-slot></div>`,
                processContent(node, p) {
                    const el = node;
                    const text = el.getAttribute('normal');
                    const bold = el.getAttribute('bold');
                    if (text !== null || bold !== null) {
                        const projection = p.document.createElement('template');
                        projection.setAttribute('au-slot', '');
                        const content = projection.content;
                        if (text !== null) {
                            const span = p.document.createElement('span');
                            span.textContent = text;
                            el.removeAttribute('normal');
                            content.append(span);
                        }
                        if (bold !== null) {
                            const strong = p.document.createElement('strong');
                            strong.textContent = bold;
                            el.removeAttribute('bold');
                            content.append(strong);
                        }
                        node.appendChild(projection);
                    }
                }
            }, class MyElement {
            })
        ], { 'my-element': '<div><span>foo</span><strong>bar</strong></div>' });
        yield new TestData('default au-slot use-case', `<my-element><span>foo</span><span au-slot="s1">s1 projection</span><strong>bar</strong></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                template: `<div><au-slot></au-slot><au-slot name="s1"></au-slot></div>`,
                processContent(node, p) {
                    const projection = p.document.createElement('template');
                    projection.setAttribute('au-slot', '');
                    const content = projection.content;
                    for (const child of toArray(node.childNodes)) {
                        if (!child.hasAttribute('au-slot')) {
                            content.append(child);
                        }
                    }
                    if (content.childElementCount > 0) {
                        node.appendChild(projection);
                    }
                }
            }, class MyElement {
            })
        ], { 'my-element': '<div><span>foo</span><strong>bar</strong><span>s1 projection</span></div>' });
        const SpanCe = CustomElement.define({
            name: 'span-ce',
            template: '<span>${value}</span>',
            bindables: { value: { mode: BindingMode.default } },
        }, class SpanCe {
        });
        const StrongCe = CustomElement.define({
            name: 'strong-ce',
            template: '<strong>${value}</strong>',
            bindables: { value: { mode: BindingMode.default } },
        }, class StrongCe {
        });
        function processContentWithCe(compile) {
            return function (node, p) {
                const el = node;
                const text = el.getAttribute('normal');
                const bold = el.getAttribute('bold');
                if (text !== null || bold !== null) {
                    const projection = p.document.createElement('template');
                    projection.setAttribute('au-slot', '');
                    const content = projection.content;
                    if (text !== null) {
                        const span = p.document.createElement('span-ce');
                        span.setAttribute('value', text);
                        el.removeAttribute('normal');
                        content.append(span);
                    }
                    if (bold !== null) {
                        const strong = p.document.createElement('strong-ce');
                        strong.setAttribute('value', bold);
                        el.removeAttribute('bold');
                        content.append(strong);
                    }
                    node.appendChild(projection);
                }
                return compile;
            };
        }
        yield new TestData('mutated node content can contain custom-element', `<my-element normal="foo" bold="bar"></my-element>`, [
            SpanCe,
            StrongCe,
            CustomElement.define({
                name: 'my-element',
                template: `<div><au-slot></au-slot></div>`,
                processContent: processContentWithCe(true),
            }, class MyElement {
            })
        ], { 'my-element': '<div><span-ce><span>foo</span></span-ce><strong-ce><strong>bar</strong></strong-ce></div>' });
        function processContentWithNewBinding(compile) {
            return function (node, _p) {
                const el = node;
                const l1 = el.getAttribute('normal')?.length ?? 0;
                const l2 = el.getAttribute('bold')?.length ?? 0;
                el.removeAttribute('normal');
                el.removeAttribute('bold');
                el.setAttribute('text-length.bind', `${l1} + ${l2}`);
                return compile;
            };
        }
        yield new TestData('mutated node content can have new bindings for the host element', `<my-element normal="foo" bold="bar"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                template: '${textLength}',
                bindables: { textLength: { mode: BindingMode.default } },
                processContent: processContentWithNewBinding(true),
            }, class MyElement {
            })
        ], { 'my-element': '6' });
        yield new TestData('host compilation cannot be skipped', // as that does not make any sense
        `<my-element normal="foo" bold="bar"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                template: '${textLength}',
                bindables: { textLength: { mode: BindingMode.default } },
                processContent: processContentWithNewBinding(false),
            }, class MyElement {
            })
        ], { 'my-element': '6' });
        yield new TestData('compilation can be instructed to be skipped - children - w/o additional host binding', `<my-element normal="foo" bold="bar"></my-element>`, [
            SpanCe,
            StrongCe,
            CustomElement.define({
                name: 'my-element',
                template: `<div><au-slot></au-slot></div>`,
                processContent: processContentWithCe(false),
            }, class MyElement {
            })
        ], { 'my-element': '<template au-slot=""><span-ce value="foo"></span-ce><strong-ce value="bar"></strong-ce></template><div></div>' });
        const rand = Math.random();
        yield new TestData('compilation can be instructed to be skipped - children - with additional host binding', `<my-element normal="foo" bold="bar"></my-element>`, [
            SpanCe,
            StrongCe,
            CustomElement.define({
                name: 'my-element',
                template: '${rand}<div><au-slot></au-slot></div>',
                bindables: { rand: { mode: BindingMode.default } },
                processContent(node, p) {
                    const retVal = processContentWithCe(false)(node, p);
                    node.setAttribute('rand.bind', rand.toString());
                    return retVal;
                }
            }, class MyElement {
            })
        ], { 'my-element': `<template au-slot=""><span-ce value="foo"></span-ce><strong-ce value="bar"></strong-ce></template>${rand}<div></div>` });
        yield new TestData('works with enhance', `<my-element normal="foo" bold="bar"></my-element>`, [
            SpanCe,
            StrongCe,
            CustomElement.define({
                name: 'my-element',
                template: '<div><au-slot></au-slot></div>',
                processContent: processContentWithCe(true),
            }, class MyElement {
            })
        ], { 'my-element': `<div><span-ce><span>foo</span></span-ce><strong-ce><strong>bar</strong></strong-ce></div>` }, noop, true);
        /**
         * MDN template example: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template#Examples
         * Note that this is also possible without `processContent` hook, by adding the named template directly to the CE's own defined template.
         * This example only shows that the new nodes added via the `processContent` hook are accessible from the lifecycle hooks as well.
         */
        yield new TestData('compilation can be instructed to be skipped - children - example of grabbing the inner template', `<my-element products.bind="[[1,'a'],[2,'b']]"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                template: `<table><thead><tr><td>UPC_Code</td><td>Product_Name</td></tr></thead><tbody></tbody></table>`,
                bindables: { products: { mode: BindingMode.default } },
                processContent(node, p) {
                    /*
                    <template id="productrow">
                      <tr>
                        <td></td>
                        <td></td>
                      </tr>
                    </template>
                    */
                    const template = p.document.createElement('template');
                    template.setAttribute('id', 'productrow');
                    const tr = p.document.createElement('tr');
                    tr.append(p.document.createElement('td'), p.document.createElement('td'));
                    template.content.append(tr);
                    node.appendChild(template);
                    return false;
                }
            }, (_a = class MyElement {
                    constructor(platform) {
                        this.platform = platform;
                    }
                    attaching() {
                        const p = this.platform;
                        const tbody = p.document.querySelector('tbody');
                        const template = p.document.querySelector('#productrow');
                        for (const [code, name] of this.products) {
                            // Clone the new row and insert it into the table
                            const clone = template.content.cloneNode(true);
                            const td = clone.querySelectorAll('td');
                            td[0].textContent = code.toString();
                            td[1].textContent = name;
                            tbody.appendChild(clone);
                        }
                    }
                },
                _a.inject = [IPlatform],
                _a))
        ], { 'my-element': '<template id="productrow"><tr><td></td><td></td></tr></template><table><thead><tr><td>UPC_Code</td><td>Product_Name</td></tr></thead><tbody><tr><td>1</td><td>a</td></tr><tr><td>2</td><td>b</td></tr></tbody></table>' }, function (ctx) {
            assert.visibleTextEqual(ctx.host, 'UPC_CodeProduct_Name1a2b');
        });
    }
    for (const { spec, template, expectedInnerHtmlMap, registrations, additionalAssertion, enhance, only } of getTestData()) {
        (only ? $it.only : $it)(spec, async function (ctx) {
            const { host, error } = ctx;
            assert.deepEqual(error, null);
            for (const [selector, expectedInnerHtml] of Object.entries(expectedInnerHtmlMap)) {
                if (selector) {
                    assert.html.innerEqual(selector, expectedInnerHtml, `${selector}.innerHTML`, host);
                }
                else {
                    assert.html.innerEqual(host, expectedInnerHtml, `root.innerHTML`);
                }
            }
            if (additionalAssertion != null) {
                await additionalAssertion(ctx);
            }
        }, { template, registrations, enhance });
    }
    // A semi-real-life example
    {
        let Tabs = (() => {
            let _classDecorators = [customElement({
                    name: 'tabs',
                    template: '<div class="header"><au-slot name="header"></au-slot></div><div class="content"><au-slot name="content"></au-slot></div>',
                    // processContent: Tabs.processTabs // <- this won't work; refer: https://github.com/microsoft/TypeScript/issues/57366
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _staticExtraInitializers = [];
            let _static_processTabs_decorators;
            let _activeTabId_decorators;
            let _activeTabId_initializers = [];
            let _activeTabId_extraInitializers = [];
            var Tabs = _classThis = class {
                showTab(tabId) {
                    this.activeTabId = tabId;
                }
                static processTabs(node, p) {
                    const el = node;
                    const headerTemplate = p.document.createElement('template');
                    headerTemplate.setAttribute('au-slot', 'header');
                    const contentTemplate = p.document.createElement('template');
                    contentTemplate.setAttribute('au-slot', 'content');
                    const tabs = toArray(el.querySelectorAll('tab'));
                    for (let i = 0; i < tabs.length; i++) {
                        const tab = tabs[i];
                        // add header
                        const header = p.document.createElement('button');
                        header.setAttribute('class.bind', `$host.activeTabId=='${i}'?'active':''`);
                        header.setAttribute('click.trigger', `$host.showTab('${i}')`);
                        header.appendChild(p.document.createTextNode(tab.getAttribute('header')));
                        headerTemplate.content.appendChild(header);
                        // add content
                        const content = p.document.createElement('div');
                        content.setAttribute('if.bind', `$host.activeTabId=='${i}'`);
                        content.append(...toArray(tab.childNodes));
                        contentTemplate.content.appendChild(content);
                        el.removeChild(tab);
                    }
                    el.setAttribute('active-tab-id', '0');
                    el.append(headerTemplate, contentTemplate);
                }
                constructor() {
                    this.activeTabId = __runInitializers(this, _activeTabId_initializers, void 0);
                    __runInitializers(this, _activeTabId_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Tabs");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _activeTabId_decorators = [bindable];
                _static_processTabs_decorators = [processContent()];
                __esDecorate(_classThis, null, _static_processTabs_decorators, { kind: "method", name: "processTabs", static: true, private: false, access: { has: obj => "processTabs" in obj, get: obj => obj.processTabs }, metadata: _metadata }, null, _staticExtraInitializers);
                __esDecorate(null, null, _activeTabId_decorators, { kind: "field", name: "activeTabId", static: false, private: false, access: { has: obj => "activeTabId" in obj, get: obj => obj.activeTabId, set: (obj, value) => { obj.activeTabId = value; } }, metadata: _metadata }, _activeTabId_initializers, _activeTabId_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Tabs = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _staticExtraInitializers);
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Tabs = _classThis;
        })();
        $it('semi-real-life example with tabs', async function (ctx) {
            const host = ctx.host;
            const tabs = host.querySelector('tabs');
            const headers = tabs.querySelectorAll('div.header button');
            const numTabs = headers.length;
            const expectedHeaders = ['Tab1', 'Tab2', 'Tab3'];
            const expectedContents = ['<span>content 1</span>', '<span>content 2</span>', 'Nothing to see here.'];
            for (let i = numTabs - 1; i > -1; i--) {
                // assert content
                const header = headers[i];
                assert.html.textContent(header, expectedHeaders[i], `header#${i} content`);
                // assert the bound trigger
                header.click();
                await tasksSettled();
                for (let j = numTabs - 1; j > -1; j--) {
                    assert.strictEqual(headers[j].classList.contains('active'), i === j, `header#${j} class`);
                    assert.html.innerEqual(tabs.querySelector('div.content div'), expectedContents[i], `content#${i} content`);
                }
            }
        }, {
            registrations: [Tabs],
            template: `
        <tabs>
          <tab header="Tab1">
            <span>content 1</span>
          </tab>
          <tab header="Tab2">
            <span>content 2</span>
          </tab>
          <tab header="Tab3"> Nothing to see here. </tab>
        </tabs>
        `,
        });
    }
});
//# sourceMappingURL=process-content.spec.js.map