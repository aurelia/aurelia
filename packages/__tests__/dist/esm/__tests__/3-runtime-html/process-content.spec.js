var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { noop, toArray } from '@aurelia/kernel';
import { Aurelia, bindable, CustomElement, customElement, INode, IPlatform, processContent } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction } from '../util.js';
describe('3-runtime-html/process-content.spec.ts', function () {
    var Tabs_1;
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
                const controller = await au.enhance({ host, component: CustomElement.define({ name: 'app', isStrictBinding: true }, App) });
                app = controller.viewModel;
                stop = () => controller.deactivate(controller, null);
            }
            else {
                await au.app({ host, component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App) })
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
        var MyElement_1, MyElement_2;
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
                    isStrictBinding: true,
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
                    isStrictBinding: true,
                    template: `<div><au-slot></au-slot></div>`,
                    processContent: MyElement.processContent
                }, MyElement)
            ], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            let MyElement = MyElement_1 = class MyElement {
                static processContent(_node, _p) {
                    this.hookInvoked = true;
                }
            };
            MyElement.hookInvoked = false;
            MyElement = MyElement_1 = __decorate([
                processContent(MyElement_1.processContent),
                customElement({
                    name: 'my-element',
                    isStrictBinding: true,
                    template: `<div><au-slot></au-slot></div>`,
                })
            ], MyElement);
            yield new TestData('processContent hook can be configured using class-level decorator - function - order 1', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            let MyElement = MyElement_2 = class MyElement {
                static processContent(_node, _p) {
                    this.hookInvoked = true;
                }
            };
            MyElement.hookInvoked = false;
            MyElement = MyElement_2 = __decorate([
                customElement({
                    name: 'my-element',
                    isStrictBinding: true,
                    template: `<div><au-slot></au-slot></div>`,
                }),
                processContent(MyElement_2.processContent)
            ], MyElement);
            yield new TestData('processContent hook can be configured using class-level decorator - function - order 2', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            function processContent1(_node, _p) {
                this.hookInvoked = true;
            }
            let MyElement = class MyElement {
            };
            MyElement.hookInvoked = false;
            MyElement = __decorate([
                processContent(processContent1),
                customElement({
                    name: 'my-element',
                    isStrictBinding: true,
                    template: `<div><au-slot></au-slot></div>`,
                })
            ], MyElement);
            yield new TestData('processContent hook can be configured using class-level decorator - standalone function', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        {
            let MyElement = class MyElement {
                static processContent(_node, _p) {
                    this.hookInvoked = true;
                }
            };
            MyElement.hookInvoked = false;
            __decorate([
                processContent(),
                __metadata("design:type", Function),
                __metadata("design:paramtypes", [Object, Object]),
                __metadata("design:returntype", void 0)
            ], MyElement, "processContent", null);
            MyElement = __decorate([
                customElement({
                    name: 'my-element',
                    isStrictBinding: true,
                    template: `<div><au-slot></au-slot></div>`,
                })
            ], MyElement);
            yield new TestData('processContent hook can be configured using method-level decorator', `<my-element normal="foo" bold="bar"></my-element>`, [MyElement], {}, () => {
                assert.strictEqual(MyElement.hookInvoked, true);
            });
        }
        yield new TestData('can mutate node content', `<my-element normal="foo" bold="bar"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                isStrictBinding: true,
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
                isStrictBinding: true,
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
            isStrictBinding: true,
            template: '<span>${value}</span>',
            bindables: { value: { mode: 8 /* BindingMode.default */ } },
        }, class SpanCe {
        });
        const StrongCe = CustomElement.define({
            name: 'strong-ce',
            isStrictBinding: true,
            template: '<strong>${value}</strong>',
            bindables: { value: { mode: 8 /* BindingMode.default */ } },
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
                isStrictBinding: true,
                template: `<div><au-slot></au-slot></div>`,
                processContent: processContentWithCe(true),
            }, class MyElement {
            })
        ], { 'my-element': '<div><span-ce class="au"><span>foo</span></span-ce><strong-ce class="au"><strong>bar</strong></strong-ce></div>' });
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
                isStrictBinding: true,
                template: '${textLength}',
                bindables: { textLength: { mode: 8 /* BindingMode.default */ } },
                processContent: processContentWithNewBinding(true),
            }, class MyElement {
            })
        ], { 'my-element': '6' });
        yield new TestData('host compilation cannot be skipped', // as that does not make any sense
        `<my-element normal="foo" bold="bar"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                isStrictBinding: true,
                template: '${textLength}',
                bindables: { textLength: { mode: 8 /* BindingMode.default */ } },
                processContent: processContentWithNewBinding(false),
            }, class MyElement {
            })
        ], { 'my-element': '6' });
        yield new TestData('compilation can be instructed to be skipped - children - w/o additional host binding', `<my-element normal="foo" bold="bar"></my-element>`, [
            SpanCe,
            StrongCe,
            CustomElement.define({
                name: 'my-element',
                isStrictBinding: true,
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
                isStrictBinding: true,
                template: '${rand}<div><au-slot></au-slot></div>',
                bindables: { rand: { mode: 8 /* BindingMode.default */ } },
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
                isStrictBinding: true,
                template: '<div><au-slot></au-slot></div>',
                processContent: processContentWithCe(true),
            }, class MyElement {
            })
        ], { 'my-element': `<div><span-ce class="au"><span>foo</span></span-ce><strong-ce class="au"><strong>bar</strong></strong-ce></div>` }, noop, true);
        /**
         * MDN template example: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template#Examples
         * Note that this is also possible without `processContent` hook, by adding the named template directly to the CE's own defined template.
         * This example only shows that the new nodes added via the `processContent` hook are accessible from the lifecycle hooks as well.
         */
        yield new TestData('compilation can be instructed to be skipped - children - example of grabbing the inner template', `<my-element products.bind="[[1,'a'],[2,'b']]"></my-element>`, [
            CustomElement.define({
                name: 'my-element',
                isStrictBinding: true,
                template: `<table><thead><tr><td>UPC_Code</td><td>Product_Name</td></tr></thead><tbody></tbody></table>`,
                bindables: { products: { mode: 8 /* BindingMode.default */ } },
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
        let Tabs = Tabs_1 = class Tabs {
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
        };
        __decorate([
            bindable,
            __metadata("design:type", String)
        ], Tabs.prototype, "activeTabId", void 0);
        Tabs = Tabs_1 = __decorate([
            customElement({
                name: 'tabs',
                isStrictBinding: true,
                template: '<div class="header"><au-slot name="header"></au-slot></div><div class="content"><au-slot name="content"></au-slot></div>',
                processContent: Tabs_1.processTabs
            })
        ], Tabs);
        $it('semi-real-life example with tabs', async function (ctx) {
            const platform = ctx.platform;
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
                platform.domWriteQueue.flush();
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