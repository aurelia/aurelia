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
// This is to test for some intrinsic properties of enhance which is otherwise difficult to test in Data-driven tests parallel to `.app`
import { BrowserPlatform } from '@aurelia/platform-browser';
import { DI, IContainer, Registration, onResolve, resolve } from '@aurelia/kernel';
import { CustomElement, IPlatform, Aurelia, customElement, bindable, StandardConfiguration, ValueConverter, AppTask, BindingBehavior, } from '@aurelia/runtime-html';
import { runTasks } from '@aurelia/runtime';
import { assert, TestContext } from '@aurelia/testing';
import { createSpecFunction } from '../util.js';
import { delegateSyntax } from '@aurelia/compat-v1';
describe('3-runtime-html/enhance.spec.ts', function () {
    class EnhanceTestExecutionContext {
        constructor(ctx, container, host, app, childNode, platform = container.get(IPlatform)) {
            this.ctx = ctx;
            this.container = container;
            this.host = host;
            this.app = app;
            this.childNode = childNode;
            this.platform = platform;
        }
    }
    async function testEnhance(testFunction, { getComponent, template, childIndex, beforeHydration } = {}) {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        host.innerHTML = template;
        ctx.doc.body.appendChild(host);
        const child = childIndex !== void 0
            ? host.childNodes.item(childIndex)
            : null;
        if (typeof beforeHydration === 'function') {
            beforeHydration(host, child);
        }
        const container = ctx.container;
        const au = new Aurelia(container);
        const enhanceRoot = await au.enhance({ host, component: getComponent() });
        const app = enhanceRoot.controller.scope.bindingContext;
        await testFunction(new EnhanceTestExecutionContext(ctx, container, host, app, child));
        await au.stop();
        await enhanceRoot.deactivate();
        ctx.doc.body.removeChild(host);
        au.dispose();
    }
    const $it = createSpecFunction(testEnhance);
    class App1 {
        constructor() {
            this.foo = 'Bar';
        }
    }
    for (const { text, getComponent } of [
        { text: 'class', getComponent: () => CustomElement.define("app", App1) },
        { text: 'instance', getComponent: () => new App1() },
        { text: 'raw object', getComponent: () => ({ foo: 'Bar' }) },
    ]) {
        $it(`hydrates the root - ${text}`, async function ({ host }) {
            assert.html.textContent('span', 'Bar', 'span.text', host);
        }, { getComponent, template: `<span>\${foo}</span>` });
        let handled = false;
        $it(`preserves the element reference - ${text}`, function ({ host }) {
            handled = false;
            host.querySelector('span').click();
            runTasks();
            assert.equal(handled, true);
        }, {
            getComponent,
            template: `<span>\${foo}</span>`,
            childIndex: 0,
            beforeHydration(host, child) {
                child.addEventListener('click', function () { handled = true; });
            }
        });
    }
    for (const initialMethod of ['app', 'enhance']) {
        it(`can be applied on an unhydrated inner node after initial hydration - ${initialMethod} - new container`, async function () {
            const message = "Awesome Possum";
            const template = `
    <button click.delegate="enhance()"></button>
    <div ref="r1" innerhtml.bind="'<div>\${message}</div>'"></div>
    <div ref="r2" innerhtml.bind="'<div>\${message}</div>'"></div>
    `;
            class App2 {
                constructor() {
                    this.container = resolve(IContainer);
                }
                async attaching() {
                    await this.enhance(this.r1);
                }
                async enhance(host = this.r2) {
                    await new Aurelia(TestContext.create().container)
                        .enhance({ host: host.querySelector('div'), component: { message } });
                }
            }
            const ctx = TestContext.create();
            const host = ctx.doc.createElement('div');
            ctx.doc.body.appendChild(host);
            const container = ctx.container;
            const au = new Aurelia(container);
            container.register(delegateSyntax);
            let component;
            let dispose;
            if (initialMethod === 'app') {
                component = CustomElement.define({ name: 'app', template }, App2);
                await au.app({ host, component }).start();
            }
            else {
                host.innerHTML = template;
                component = CustomElement.define('app', App2);
                const enhanceRoot = await au.enhance({ host, component });
                dispose = () => onResolve(enhanceRoot.deactivate(), () => enhanceRoot.dispose());
            }
            assert.html.textContent('div', message, 'div', host);
            host.querySelector('button').click();
            await Promise.resolve();
            runTasks();
            runTasks();
            assert.html.textContent('div:nth-of-type(2)', message, 'div:nth-of-type(2)', host);
            await au.stop();
            await dispose?.();
            ctx.doc.body.removeChild(host);
            au.dispose();
        });
    }
    it(`respects the hooks in raw object component`, async function () {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        host.innerHTML = '<span></span>';
        ctx.doc.body.appendChild(host);
        const component = {
            eventLog: [],
            hydrating() { this.eventLog.push('hydrating'); },
            hydrated() { this.eventLog.push('hydrated'); },
            created() { this.eventLog.push('created'); },
            binding() { this.eventLog.push('binding'); },
            bound() { this.eventLog.push('bound'); },
            attaching() { this.eventLog.push('attaching'); },
            attached() { this.eventLog.push('attached'); },
        };
        const container = ctx.container;
        const au = new Aurelia(container);
        const enhanceRoot = await au.enhance({ host, component });
        await au.stop();
        await enhanceRoot.deactivate();
        ctx.doc.body.removeChild(host);
        assert.deepStrictEqual(component.eventLog, [
            'hydrating',
            'hydrated',
            'created',
            'binding',
            'bound',
            'attaching',
            'attached',
        ]);
        au.dispose();
    });
    it('throws when enhancing a realmless node (without window connected document)', async function () {
        const ctx = TestContext.create();
        assert.throws(() => new Aurelia().enhance({
            host: new ctx.DOMParser().parseFromString('<div></div>', 'text/html').body.firstElementChild,
            component: {}
        }));
    });
    it(`enhance works on detached node`, async function () {
        let MyElement = (() => {
            let _classDecorators = [customElement({ name: 'my-element', template: '<span>${value}</span>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _value_decorators;
            let _value_initializers = [];
            let _value_extraInitializers = [];
            var MyElement = _classThis = class {
                constructor() {
                    this.value = __runInitializers(this, _value_initializers, void 0);
                    __runInitializers(this, _value_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "MyElement");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _value_decorators = [bindable];
                __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyElement = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyElement = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({
                    name: 'app',
                    template: '<div ref="container" id="container"></div>'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
                async bound() {
                    const _host = this.enhancedHost = ctx.doc.adoptNode(new ctx.DOMParser().parseFromString('<div><my-element value.bind="42.toString()"></my-element></div>', 'text/html').body.firstElementChild);
                    // this.container.appendChild(this.enhancedHost);
                    const _au = new Aurelia(DI.createContainer()
                        .register(Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis)), StandardConfiguration));
                    this.enhanceView = await _au
                        .register(MyElement) // in real app, there should be more
                        .enhance({ host: _host, component: CustomElement.define({ name: 'enhance' }, class EnhanceRoot {
                        }) });
                    assert.html.innerEqual(_host, '<my-element><span>42</span></my-element>', 'enhanced.innerHtml');
                    assert.html.innerEqual(this.container, '', 'container.innerHtml - before attach');
                }
                attaching() {
                    this.container.appendChild(this.enhancedHost);
                }
                // The inverse order of the stop and detaching is intentional
                async detaching() {
                    await this.enhanceView.deactivate();
                    assert.html.innerEqual(this.enhancedHost, '<my-element></my-element>', 'enhanced.innerHtml');
                    assert.html.innerEqual(this.container, '<div><my-element></my-element></div>', 'enhanced.innerHtml');
                }
                unbinding() {
                    this.enhancedHost.remove();
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
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        ctx.doc.body.appendChild(host);
        const container = ctx.container;
        const au = new Aurelia(container);
        await au
            .app({ host, component: App })
            .start();
        assert.html.innerEqual(host.querySelector('#container'), '<div><my-element><span>42</span></my-element></div>', 'container.innerHTML - after attach');
        await au.stop();
        assert.html.innerEqual(host, '', 'post-stop host.innerHTML');
        ctx.doc.body.removeChild(host);
        au.dispose();
    });
    it('can re-activate an enhancement result', async function () {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        const container = ctx.container;
        const au = new Aurelia(container);
        host.innerHTML = `<div repeat.for="i of 3">\${i}</div>`;
        const root = await au.enhance({ host, component: { message: 'hello world' } });
        assert.html.textContent(host, '012');
        assert.strictEqual(host.querySelectorAll('div').length, 3);
        await root.deactivate();
        assert.html.textContent(host, '');
        await root.activate();
        assert.html.textContent(host, '012');
        assert.strictEqual(host.querySelectorAll('div').length, 3);
    });
    // we dont need to support this since the activation/deactivation can be awaited in the life cycle of any component
    //
    // it('can connect with parent controller if any', async function () {
    //   let parentController: IController;
    //   const { appHost, component, start, tearDown } = createFixture(
    //     '<my-el html.bind="html" controller.ref="myElController">',
    //     class App {
    //       public html = `<div>\${message}</div>`;
    //       public myElController: ICustomElementController;
    //     },
    //     [
    //       CustomElement.define({
    //         name: 'my-el',
    //         template: '<div innerhtml.bind="html" ref="div">',
    //         bindables: ['html']
    //       }, class MyEl {
    //         public static inject = [IAurelia];
    //         public div: HTMLDivElement;
    //         public enhancedRoot: ICustomElementController;
    //         public constructor(private readonly au$: Aurelia) {}
    //         public async attaching() {
    //           this.div.removeAttribute('class');
    //           this.enhancedRoot = await this.au$.enhance(
    //             {
    //               host: this.div,
    //               component: {
    //                 message: 'Hello _div_',
    //                 attaching(_, parent) {
    //                   parentController = parent;
    //                 }
    //               }
    //             },
    //             (this as any).$controller
    //           );
    //         }
    //         public detaching() {
    //           void this.enhancedRoot.deactivate(this.enhancedRoot, null);
    //           parentController = void 0;
    //         }
    //       }),
    //     ],
    //     false,
    //   );
    //   await start();
    //   assert.notStrictEqual(parentController, void 0);
    //   assert.strictEqual(component.myElController === parentController, true);
    //   assert.html.innerEqual(appHost, '<my-el><div><div>Hello _div_</div></div></my-el>');
    //   await tearDown();
    //   assert.strictEqual(parentController, void 0);
    //   assert.strictEqual(component.myElController, null);
    //   assert.html.innerEqual(appHost, '');
    // });
    it('uses resources in existing root container', async function () {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        const container = ctx.container.register(ValueConverter.define('x2', class X2 {
            toView(val) {
                return Number(val) * 2;
            }
        }));
        const au = new Aurelia(container);
        host.innerHTML = '<div data-id.bind="1 | x2 | plus10"></div>';
        const root = await au.enhance({
            host,
            component: {},
            container: container.createChild().register(ValueConverter.define('plus10', class Plus10 {
                toView(val) {
                    return Number(val) + 10;
                }
            }))
        });
        assert.strictEqual(host.innerHTML, '<div data-id="12"></div>');
        await root.deactivate();
    });
    it('uses resources given in the container', async function () {
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        const container = ctx.container;
        const au = new Aurelia(container);
        host.innerHTML = '<div data-id.bind="i | plus10"></div>';
        const root = await au.enhance({
            host,
            component: { i: 1 },
            container: container.createChild().register(ValueConverter.define('plus10', class Plus10 {
                toView(v) {
                    return Number(v) + 10;
                }
            }), BindingBehavior.define('xoixoi', class Xoixoi {
            }))
        });
        assert.strictEqual(host.innerHTML, '<div data-id="11"></div>');
        assert.strictEqual(ValueConverter.find(container, 'plus10'), null, 'It should register resources with the given container only.');
        assert.strictEqual(BindingBehavior.find(container, 'xoixoi'), null, 'It should register resources with the given container only.');
        await root.deactivate();
    });
    it('calls app tasks', async function () {
        const logs = [];
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        const au = new Aurelia();
        host.innerHTML = '<div>${message}</div>';
        const root = au.enhance({ host, component: {
                message: 'hello world',
                created() { logs.push('created'); },
                hydrating() { logs.push('hydrating'); },
                hydrated() { logs.push('hydrated'); },
                binding() { logs.push('binding'); },
                bound() { logs.push('bound'); },
                attaching() { logs.push('attaching'); },
                attached() { logs.push('attached'); },
                detaching() { logs.push('detaching'); },
                unbinding() { logs.push('unbinding'); },
            }, container: ctx.container.createChild().register(AppTask.creating(() => logs.push('Task.creating')), AppTask.hydrating(() => logs.push('Task.hydrating')), AppTask.hydrated(() => logs.push('Task.hydrated')), AppTask.activating(() => logs.push('Task.activating')), AppTask.activated(() => logs.push('Task.activated')), AppTask.deactivating(() => logs.push('Task.deactivating')), AppTask.deactivated(() => logs.push('Task.deactivated'))) });
        assert.strictEqual(host.textContent, 'hello world');
        const activationLogs = [
            'Task.creating',
            'Task.hydrating',
            'hydrating',
            'hydrated',
            'Task.hydrated',
            'created',
            'Task.activating',
            'binding',
            'bound',
            'attaching',
            'attached',
            'Task.activated',
        ];
        assert.deepStrictEqual(logs, activationLogs);
        logs.length = 0;
        await onResolve(root, (root) => onResolve(root.deactivate(), () => {
            assert.deepStrictEqual(logs, [
                'Task.deactivating',
                'detaching',
                'unbinding',
                'Task.deactivated',
            ]);
        }));
    });
    it('does not call app task on the original container', async function () {
        const logs = [];
        const ctx = TestContext.create();
        const host = ctx.doc.createElement('div');
        const au = new Aurelia(ctx.container.register(AppTask.creating(() => logs.push('Task.creating')), AppTask.deactivating(() => logs.push('Task.deactivating'))));
        await onResolve(au.enhance({ host, component: {} }), (root) => {
            assert.deepStrictEqual(logs, []);
            return onResolve(root.deactivate(), () => {
                assert.deepStrictEqual(logs, []);
            });
        });
    });
});
//# sourceMappingURL=enhance.spec.js.map