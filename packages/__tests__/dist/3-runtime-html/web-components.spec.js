import { CustomElement, INode } from '@aurelia/runtime-html';
import { IWcElementRegistry } from '@aurelia/web-components';
import { assert, createFixture } from '@aurelia/testing';
import { tasksSettled } from '@aurelia/runtime';
describe('3-runtime-html/web-components.spec.ts', function () {
    // do not test in JSDOM
    if (typeof process !== 'undefined') {
        return;
    }
    describe('define', function () {
        it('throws on invalid WC element name', async function () {
            const { container, tearDown } = await createFixture(`<my-element>`, class App {
            }).started;
            assert.throws(() => container.get(IWcElementRegistry).define('myelement', class MyElement {
            }));
            await tearDown();
        });
        it('throws on containerless WC element', async function () {
            const { container, tearDown } = await createFixture(`<my-element>`, class App {
            }).started;
            assert.throws(() => { var _a; return container.get(IWcElementRegistry).define('myelement', (_a = class MyElement {
                },
                _a.containerless = true,
                _a)); });
            assert.throws(() => container.get(IWcElementRegistry).define('myelement', { containerless: true }));
            await tearDown();
        });
        it('works with basic plain class', async function () {
            var _a;
            const { container, appHost, tearDown } = await createFixture(`<my-element>`, class App {
            }).started;
            container.get(IWcElementRegistry).define('my-element', (_a = class MyElement {
                    constructor() {
                        this.message = 'hello world';
                    }
                },
                _a.template = `\${message}`,
                _a));
            assert.html.textContent(appHost, 'hello world');
            await tearDown();
        });
        it('works with literal object element definition', async function () {
            const { container, appHost, tearDown } = await createFixture(`<my-element-1>`, class App {
            }).started;
            container.get(IWcElementRegistry).define('my-element-1', { template: 'hello world' });
            assert.html.textContent(appHost, 'hello world');
            await tearDown();
        });
        it('works with Au custom element class', async function () {
            const { container, appHost, tearDown } = await createFixture(`<my-element-2>`, class App {
            }).started;
            container.get(IWcElementRegistry).define('my-element-2', CustomElement.define({ name: '1', template: `\${message}` }, class MyElement {
                constructor() {
                    this.message = 'hello world';
                }
            }));
            assert.html.textContent(appHost, 'hello world');
            await tearDown();
        });
        it('extends built-in elemenet', async function () {
            const { container, appHost, tearDown } = await createFixture(`<button is="my-btn-1">`, class App {
            }).started;
            container.get(IWcElementRegistry).define('my-btn-1', { template: '<div>hello world</div>' }, { extends: 'button' });
            assert.html.innerEqual(appHost.querySelector('button'), '<div>hello world</div>');
            await tearDown();
        });
        it('observes attribute on normal custom element', async function () {
            var _a;
            const { container, appHost, component, tearDown } = await createFixture(`<my-element-3 message.attr="message">`, class App {
                constructor() {
                    this.message = 'hello world';
                }
            }).started;
            container.get(IWcElementRegistry).define('my-element-3', (_a = class MyElement {
                },
                _a.template = `\${message}`,
                _a.bindables = ['message'],
                _a));
            assert.html.textContent(appHost, 'hello world');
            component.message = 'hello';
            assert.html.textContent(appHost, 'hello world');
            await tasksSettled();
            assert.html.textContent(appHost, 'hello');
            await tearDown();
        });
        it('observes attribute on extended built-in custom element', async function () {
            var _a;
            const { container, appHost, component, tearDown } = await createFixture(`<p is="my-element-4" message.attr="message">`, class App {
                constructor() {
                    this.message = 'hello world';
                }
            }).started;
            container.get(IWcElementRegistry).define('my-element-4', (_a = class MyElement {
                },
                _a.template = `<div>\${message}</div>`,
                _a.bindables = ['message'],
                _a), { extends: 'p' });
            const p = appHost.querySelector('p');
            assert.html.innerEqual(p, '<div>hello world</div>');
            component.message = 'hello';
            assert.html.innerEqual(p, '<div>hello world</div>');
            await tasksSettled();
            assert.html.innerEqual(p, '<div>hello</div>');
            await tearDown();
        });
        it('works with bindable-as-property on normal custom element', async function () {
            var _a;
            const { container, appHost, tearDown } = await createFixture(`<my-element-5 message.attr="message">`, class App {
                constructor() {
                    this.message = 'hello world';
                }
            }).started;
            container.get(IWcElementRegistry).define('my-element-5', (_a = class MyElement {
                },
                _a.template = `<div>\${message}</div>`,
                _a.bindables = ['message'],
                _a));
            const el5 = appHost.querySelector('my-element-5');
            assert.html.innerEqual(el5, '<div>hello world</div>');
            el5.message = 'hello';
            await tasksSettled();
            assert.html.innerEqual(el5, '<div>hello</div>');
            await tearDown();
        });
        it('support host injection', async function () {
            const { platform, container, appHost, tearDown } = await createFixture(`<my-element-6>`, class App {
            }).started;
            class MyElementVm {
                constructor(node, element, htmlElement) {
                    this.message = 'hello world';
                    assert.strictEqual(node, element);
                    assert.strictEqual(element, htmlElement);
                }
            }
            MyElementVm.template = `\${message}`;
            MyElementVm.inject = [INode, platform.Element, platform.HTMLElement];
            container.get(IWcElementRegistry).define('my-element-6', MyElementVm);
            assert.html.textContent(appHost, 'hello world');
            await tearDown();
        });
        it('bindables works when created with document.createElement', async function () {
            const { platform, container, appHost, tearDown } = await createFixture(``).started;
            class MyElementVm {
                constructor(node, element, htmlElement) {
                    this.message = '';
                    assert.strictEqual(node, element);
                    assert.strictEqual(element, htmlElement);
                }
            }
            MyElementVm.template = `\${message}`;
            MyElementVm.bindables = ['message'];
            MyElementVm.inject = [INode, platform.Element, platform.HTMLElement];
            container.get(IWcElementRegistry).define('my-element-7', MyElementVm);
            const myEl7 = platform.document.createElement('my-element-7');
            assert.strictEqual(myEl7['auCtrl'], void 0);
            assert.html.textContent(myEl7, '');
            appHost.appendChild(myEl7);
            myEl7.message = 'hello world';
            assert.html.textContent(myEl7, '');
            await tasksSettled();
            assert.html.textContent(myEl7, 'hello world');
            await tearDown();
        });
        it('works with shadow dom mode', async function () {
            const { container, appHost, tearDown } = await createFixture(`<my-element-8>`).started;
            class MyElementVm {
            }
            MyElementVm.shadowOptions = { mode: 'open' };
            MyElementVm.template = `<div>hello world</div>`;
            container.get(IWcElementRegistry).define('my-element-8', MyElementVm);
            const myEl8 = appHost.querySelector('my-element-8');
            assert.strictEqual(myEl8.textContent, '');
            assert.html.innerEqual(myEl8.shadowRoot, '<div>hello world</div>');
            await tearDown();
        });
    });
    describe('disconnectedCallback()', function () {
        it('deactivate controller', async function () {
            var _a;
            const { container, appHost, tearDown } = await createFixture(`<my-element-20>`, class App {
            }).started;
            container.get(IWcElementRegistry).define('my-element-20', (_a = class MyElement {
                    constructor() {
                        this.message = 'hello world';
                    }
                },
                _a.template = `<div repeat.for="i of 3">\${i}</div>`,
                _a));
            assert.html.textContent(appHost, '012');
            await tearDown();
            assert.html.textContent(appHost, '');
        });
    });
});
//# sourceMappingURL=web-components.spec.js.map