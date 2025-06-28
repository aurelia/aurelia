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
import { IRouteContext, route } from '@aurelia/router';
import { CustomElement, customElement, ILocation, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';
import { resolve } from '@aurelia/kernel';
describe('router/resources/load.spec.ts', function () {
    function assertAnchors(anchors, expected, message = '', assertActive = true) {
        const len = anchors.length;
        assert.strictEqual(len, expected.length, `${message} length`);
        for (let i = 0; i < len; i++) {
            const anchor = anchors[i];
            const item = expected[i];
            assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
            if (!assertActive)
                continue;
            assert.strictEqual(anchor.classList.contains('active'), !!item.active, `${message} - #${i} active`);
        }
    }
    it('active status works correctly', async function () {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: '' })];
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
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'foo', path: 'foo/:id', component: Foo }
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
    <a load="route:foo; params.bind:{id: 1}; active.bind:active1" active.class="active1"></a>
    <a load="route:foo/2; active.bind:active2" active.class="active2"></a>
    <au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = host.querySelectorAll('a');
        const a1 = { href: 'foo/1', active: false };
        const a2 = { href: 'foo/2', active: false };
        assertAnchors(anchors, [a1, a2], 'round#1');
        anchors[1].click();
        await queue.yield();
        a2.active = true;
        assertAnchors(anchors, [a1, a2], 'round#2');
        anchors[0].click();
        await queue.yield();
        a1.active = true;
        a2.active = false;
        assertAnchors(anchors, [a1, a2], 'round#3');
        await au.stop(true);
    });
    it('adds activeClass when configured', async function () {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: '${instanceId} ${id}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Foo = _classThis = class {
                constructor() {
                    this.instanceId = ++Foo.instanceId;
                }
                loading(params) {
                    this.id = params.id;
                }
            };
            __setFunctionName(_classThis, "Foo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Foo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })();
            _classThis.instanceId = 0;
            (() => {
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Foo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    transitionPlan: 'replace',
                    routes: [
                        { id: 'foo', path: 'foo/:id', component: Foo }
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
    <a load="route:foo; params.bind:{id: 1}"></a>
    <a load="route:foo/2"></a>
    <au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const activeClass = 'au-rl-active';
        const { au, host, container } = await start({ appRoot: Root, registrations: [Foo], activeClass });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = host.querySelectorAll('a');
        const a1 = { href: 'foo/1', active: false };
        const a2 = { href: 'foo/2', active: false };
        assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#1');
        anchors[1].click();
        await queue.yield();
        a2.active = true;
        assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#2');
        assert.html.textContent(host, '1 2', 'round#2 - text');
        anchors[1].click();
        await queue.yield();
        assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#3');
        assert.html.textContent(host, '1 2', 'round#3 - text');
        anchors[0].click();
        await queue.yield();
        a1.active = true;
        a2.active = false;
        assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#4');
        assert.html.textContent(host, '2 1', 'round#4 - text');
        anchors[0].click();
        await queue.yield();
        assertAnchorsWithClass(anchors, [a1, a2], activeClass, 'round#5');
        assert.html.textContent(host, '2 1', 'round#5 - text');
        await au.stop(true);
        function assertAnchorsWithClass(anchors, expected, activeClass = null, message = '') {
            const len = anchors.length;
            assert.strictEqual(len, expected.length, `${message} length`);
            for (let i = 0; i < len; i++) {
                const anchor = anchors[i];
                const item = expected[i];
                assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
                assert.strictEqual(anchor.classList.contains(activeClass), !!item.active, `${message} - #${i} active`);
            }
        }
    });
    it('does not add activeClass when not configured', async function () {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: '' })];
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
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'foo', path: 'foo/:id', component: Foo }
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `
    <a load="route:foo; params.bind:{id: 1}"></a>
    <a load="route:foo/2"></a>
    <au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = host.querySelectorAll('a');
        const a1 = { href: 'foo/1', active: false };
        const a2 = { href: 'foo/2', active: false };
        assertAnchorsWithoutClass(anchors, [a1, a2], 'round#1');
        anchors[1].click();
        await queue.yield();
        a2.active = true;
        assertAnchorsWithoutClass(anchors, [a1, a2], 'round#2');
        anchors[0].click();
        await queue.yield();
        a1.active = true;
        a2.active = false;
        assertAnchorsWithoutClass(anchors, [a1, a2], 'round#3');
        await au.stop(true);
        function assertAnchorsWithoutClass(anchors, expected, message = '') {
            const len = anchors.length;
            assert.strictEqual(len, expected.length, `${message} length`);
            for (let i = 0; i < len; i++) {
                const anchor = anchors[i];
                const item = expected[i];
                assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
            }
        }
    });
    it('un-configured parameters are added to the querystring', async function () {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: '' })];
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
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'foo', path: 'foo/:id', component: Foo }
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchor = host.querySelector('a');
        assert.match(anchor.href, /foo\/3\?a=2/);
        await au.stop(true);
    });
    it('the most matched path is generated', async function () {
        let Foo = (() => {
            let _classDecorators = [customElement({ name: 'fo-o', template: 'foo' })];
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
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'foo', path: ['foo/:id', 'foo/:id/bar/:a', 'bar/fizz'], component: Foo }
                    ]
                }), customElement({
                    name: 'ro-ot',
                    template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><a load="route:foo; params.bind:{id: 3, b: 2};"></a><a load="bar/fizz"></a><au-viewport></au-viewport>`
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = Array.from(host.querySelectorAll('a'));
        const hrefs = anchors.map(a => a.href);
        assert.match(hrefs[0], /foo\/3\/bar\/2/);
        assert.match(hrefs[1], /foo\/3\?b=2/); // this one ensures the rejection of non-monotonically increment in the parameter consumption
        assert.match(hrefs[2], /bar\/fizz/);
        anchors[2].click();
        await queue.yield();
        assert.html.textContent(host, 'foo');
        await au.stop(true);
    });
    it('allow navigating to route defined in parent context using ../ prefix', async function () {
        let Product = (() => {
            let _classDecorators = [customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Product = _classThis = class {
                canLoad(params, _next, _current) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "Product");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Product = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Product = _classThis;
        })();
        let Products = (() => {
            let _classDecorators = [customElement({ name: 'pro-ducts', template: `<a load="../product/1"></a><a load="../product/2"></a> products` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Products = _classThis = class {
            };
            __setFunctionName(_classThis, "Products");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Products = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Products = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'products', path: ['', 'products'], component: Products },
                        { id: 'product', path: 'product/:id', component: Product },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'products');
        const anchors = Array.from(host.querySelectorAll('a'));
        const hrefs = anchors.map(a => a.href);
        assert.match(hrefs[0], /product\/1$/);
        assert.match(hrefs[1], /product\/2$/);
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'product 1');
        // go back
        const back = host.querySelector('a');
        assert.match(back.href, /products$/);
        back.click();
        await queue.yield();
        assert.html.textContent(host, 'products');
        // 2nd round
        host.querySelector('a:nth-of-type(2)').click();
        await queue.yield();
        assert.html.textContent(host, 'product 2');
        // go back
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'products');
        await au.stop(true);
    });
    it('allow navigating to route defined in parent context using ../ prefix - with parameters', async function () {
        let Product = (() => {
            let _classDecorators = [customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Product = _classThis = class {
                canLoad(params, _next, _current) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "Product");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Product = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Product = _classThis;
        })();
        let Products = (() => {
            let _classDecorators = [customElement({ name: 'pro-ducts', template: `<a load="route:../product; params.bind:{id:'1'}"></a><a load="route:../product; params.bind:{id:'2'}"></a> products` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Products = _classThis = class {
            };
            __setFunctionName(_classThis, "Products");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Products = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Products = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'products', path: ['', 'products'], component: Products },
                        { id: 'product', path: 'product/:id', component: Product },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'products');
        const anchors = Array.from(host.querySelectorAll('a'));
        const hrefs = anchors.map(a => a.href);
        assert.match(hrefs[0], /product\/1$/);
        assert.match(hrefs[1], /product\/2$/);
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'product 1');
        // go back
        const back = host.querySelector('a');
        assert.match(back.href, /products$/);
        back.click();
        await queue.yield();
        assert.html.textContent(host, 'products');
        // 2nd round
        host.querySelector('a:nth-of-type(2)').click();
        await queue.yield();
        assert.html.textContent(host, 'product 2');
        // go back
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'products');
        await au.stop(true);
    });
    it('allow navigating to route defined in parent context using explicit routing context', async function () {
        let Product = (() => {
            let _classDecorators = [customElement({ name: 'pro-duct', template: `product \${id} <a load="route:products; context.bind:rtCtx.parent"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Product = _classThis = class {
                canLoad(params, next, _current) {
                    this.id = params.id;
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "Product");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Product = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Product = _classThis;
        })();
        let Products = (() => {
            let _classDecorators = [customElement({ name: 'pro-ducts', template: `<a load="route:product/1; context.bind:rtCtx.parent"></a><a load="route:product; params.bind:{id: 2}; context.bind:rtCtx.parent"></a> products` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Products = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "Products");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Products = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Products = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'products', path: ['', 'products'], component: Products },
                        { id: 'product', path: 'product/:id', component: Product },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'products');
        const anchors = Array.from(host.querySelectorAll('a'));
        const hrefs = anchors.map(a => a.href);
        assert.match(hrefs[0], /product\/1$/);
        assert.match(hrefs[1], /product\/2$/);
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'product 1');
        // go back
        const back = host.querySelector('a');
        assert.match(back.href, /products$/);
        back.click();
        await queue.yield();
        assert.html.textContent(host, 'products');
        // 2nd round
        host.querySelector('a:nth-of-type(2)').click();
        await queue.yield();
        assert.html.textContent(host, 'product 2');
        // go back
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'products');
        await au.stop(true);
    });
    it('allow navigating to route defined in grand-parent context using ../../ prefix', async function () {
        let L21 = (() => {
            let _classDecorators = [customElement({ name: 'l-21', template: `l21 <a load="../../l12"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L21 = _classThis = class {
            };
            __setFunctionName(_classThis, "L21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L21 = _classThis;
        })();
        let L22 = (() => {
            let _classDecorators = [customElement({ name: 'l-22', template: `l22 <a load="../../l11"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L22 = _classThis = class {
            };
            __setFunctionName(_classThis, "L22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L22 = _classThis;
        })();
        let L11 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l21', path: ['', 'l21'], component: L21 },
                    ]
                }), customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L11 = _classThis = class {
            };
            __setFunctionName(_classThis, "L11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L11 = _classThis;
        })();
        let L12 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l22', path: ['', 'l22'], component: L22 },
                    ]
                }), customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L12 = _classThis = class {
            };
            __setFunctionName(_classThis, "L12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L12 = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l11', path: ['', 'l11'], component: L11 },
                        { id: 'l12', path: 'l12', component: L12 },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'l11 l21');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l12 l22');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l11 l21');
        await au.stop(true);
    });
    it('allow navigating to route defined in grand-parent context using ../../ prefix - with parameters', async function () {
        let L21 = (() => {
            let _classDecorators = [customElement({ name: 'l-21', template: `l21 <a load="route:../../l12; params.bind:{id: '42'}"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L21 = _classThis = class {
            };
            __setFunctionName(_classThis, "L21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L21 = _classThis;
        })();
        let L22 = (() => {
            let _classDecorators = [customElement({ name: 'l-22', template: `l22 <a load="route:../../l11; params.bind:{id: '42'}"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L22 = _classThis = class {
            };
            __setFunctionName(_classThis, "L22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L22 = _classThis;
        })();
        let L11 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l21', path: ['', 'l21'], component: L21 },
                    ]
                }), customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L11 = _classThis = class {
            };
            __setFunctionName(_classThis, "L11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L11 = _classThis;
        })();
        let L12 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l22', path: ['', 'l22'], component: L22 },
                    ]
                }), customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L12 = _classThis = class {
            };
            __setFunctionName(_classThis, "L12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L12 = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', redirectTo: 'l11/42' },
                        { id: 'l11', path: 'l11/:id', component: L11 },
                        { id: 'l12', path: 'l12/:id', component: L12 },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'l11 l21');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l12 l22');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l11 l21');
        await au.stop(true);
    });
    it('allow navigating to route defined in grand-parent context using explicit routing context', async function () {
        let L21 = (() => {
            let _classDecorators = [customElement({ name: 'l-21', template: `l21 <a load="route:l12; context.bind:rtCtx.parent.parent"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L21 = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L21 = _classThis;
        })();
        let L22 = (() => {
            let _classDecorators = [customElement({ name: 'l-22', template: `l22 <a load="route:l11; context.bind:rtCtx.parent.parent"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L22 = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L22 = _classThis;
        })();
        let L11 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l21', path: ['', 'l21'], component: L21 },
                    ]
                }), customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L11 = _classThis = class {
            };
            __setFunctionName(_classThis, "L11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L11 = _classThis;
        })();
        let L12 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l22', path: ['', 'l22'], component: L22 },
                    ]
                }), customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L12 = _classThis = class {
            };
            __setFunctionName(_classThis, "L12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L12 = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l11', path: ['', 'l11'], component: L11 },
                        { id: 'l12', path: 'l12', component: L12 },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'l11 l21');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l12 l22');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l11 l21');
        await au.stop(true);
    });
    it('allow explicitly binding the routing context to null to perform navigation from root', async function () {
        let L21 = (() => {
            let _classDecorators = [customElement({ name: 'l-21', template: `l21 <a load="route:l22; context.bind:rtCtx.parent"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L21 = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L21 = _classThis;
        })();
        let L22 = (() => {
            let _classDecorators = [customElement({ name: 'l-22', template: `l22 <a load="route:l12; context.bind:null"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L22 = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L22 = _classThis;
        })();
        let L23 = (() => {
            let _classDecorators = [customElement({ name: 'l-23', template: `l23 <a load="route:l24; context.bind:rtCtx.parent"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L23 = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L23");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L23 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L23 = _classThis;
        })();
        let L24 = (() => {
            let _classDecorators = [customElement({ name: 'l-24', template: `l24 <a load="route:l11; context.bind:null"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L24 = _classThis = class {
                canLoad(params, next, _current) {
                    this.rtCtx = next.context;
                    return true;
                }
            };
            __setFunctionName(_classThis, "L24");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L24 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L24 = _classThis;
        })();
        let L11 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l21', path: ['', 'l21'], component: L21 },
                        { id: 'l22', path: 'l22', component: L22 },
                    ]
                }), customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L11 = _classThis = class {
            };
            __setFunctionName(_classThis, "L11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L11 = _classThis;
        })();
        let L12 = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l23', path: ['', 'l23'], component: L23 },
                        { id: 'l24', path: 'l24', component: L24 },
                    ]
                }), customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var L12 = _classThis = class {
            };
            __setFunctionName(_classThis, "L12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                L12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return L12 = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'l11', path: ['', 'l11'], component: L11 },
                        { id: 'l12', path: 'l12', component: L12 },
                    ]
                }), customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22, L23, L24] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'l11 l21', 'init');
        // l21 -> l22
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l11 l22', '#2 l21 -> l22');
        // l22 -> l12
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l12 l23', '#3 l22 -> l12');
        // l23 -> l24
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l12 l24', '#4 l23 -> l24');
        // l24 -> l11
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'l11 l21', '#5 l24 -> l11');
        await au.stop(true);
    });
    it('adds hash correctly to the href when useUrlFragmentHash is set', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'ce-one', template: `ce1` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeOne = _classThis = class {
            };
            __setFunctionName(_classThis, "CeOne");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeOne = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeOne = _classThis;
        })();
        let CeTwo = (() => {
            let _classDecorators = [customElement({ name: 'ce-two', template: `ce2` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
            };
            __setFunctionName(_classThis, "CeTwo");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeTwo = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeTwo = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [customElement({
                    name: 'ro-ot',
                    template: `
      <a load="#ce-one"></a>
      <a load="#ce-two"></a>
      <a load="ce-two"></a>
      <au-viewport></au-viewport>
      `
                }), route({
                    routes: [
                        {
                            path: 'ce-one',
                            component: CeOne,
                        },
                        {
                            path: 'ce-two',
                            component: CeTwo,
                        },
                    ]
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, useHash: true, registrations: [CeOne, CeTwo] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = Array.from(host.querySelectorAll('a'));
        assert.deepStrictEqual(anchors.map(a => a.getAttribute('href')), ['/#/ce-one', '/#/ce-two', '/#/ce-two']);
        anchors[1].click();
        await queue.yield();
        assert.html.textContent(host, 'ce2');
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'ce1');
        anchors[2].click();
        await queue.yield();
        assert.html.textContent(host, 'ce2');
        await au.stop(true);
    });
    class HrefGenerationForChildComponentTestData {
        constructor(name, templates, expectedHrefs) {
            this.name = name;
            this.templates = templates;
            this.expectedHrefs = expectedHrefs;
        }
    }
    function* getHrefGenerationForChildComponentTestData() {
        yield new HrefGenerationForChildComponentTestData('using path', [
            `
    <a load="c1">C1</a>
    <a load="c2">C2</a>
    <au-viewport></au-viewport>`,
            `c1
    <a load="gc11">gc11</a>
    <a load="gc12">gc12</a>
    <a load="route: c2; context.bind: parentCtx">c2</a>
    <au-viewport></au-viewport>`,
            `c2
    <a load="gc21">gc21</a>
    <a load="gc22">gc22</a>
    <a load="route: c1; context.bind: parentCtx">c1</a>
    <au-viewport></au-viewport>`
        ], [
            [
                { href: 'c1' },
                { href: 'c2' },
                { href: 'c1/gc11' },
                { href: 'c1/gc12' },
                { href: 'c2' },
            ],
            [
                { href: 'c1' },
                { href: 'c2' },
                { href: 'c2/gc21' },
                { href: 'c2/gc22' },
                { href: 'c1' },
            ]
        ]);
        yield new HrefGenerationForChildComponentTestData('using route-id', [
            `
    <a load="r1">C1</a>
    <a load="r2">C2</a>
    <au-viewport></au-viewport>`,
            `c1
    <a load="r1">gc11</a>
    <a load="r2">gc12</a>
    <a load="route: r2; context.bind: parentCtx">c2</a>
    <au-viewport></au-viewport>`,
            `c2
    <a load="r1">gc21</a>
    <a load="r2">gc22</a>
    <a load="route: r1; context.bind: parentCtx">c1</a>
    <au-viewport></au-viewport>`
        ], [
            [
                { href: 'r1' },
                { href: 'r2' },
                { href: 'c1/r1' },
                { href: 'c1/r2' },
                { href: 'r2' },
            ],
            [
                { href: 'r1' },
                { href: 'r2' },
                { href: 'c2/r1' },
                { href: 'c2/r2' },
                { href: 'r1' },
            ]
        ]);
    }
    for (const { name, templates: [rt, t1, t2], expectedHrefs: [expectations1, expectations2] } of getHrefGenerationForChildComponentTestData()) {
        it(`href attribute value is correctly generated for child components - ${name}`, async function () {
            let GrandChildOneOne = (() => {
                let _classDecorators = [customElement({ name: 'gc-11', template: 'gc11' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildOneOne = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildOneOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildOneOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildOneOne = _classThis;
            })();
            let GrandChildOneTwo = (() => {
                let _classDecorators = [customElement({ name: 'gc-12', template: 'gc12' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildOneTwo = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildOneTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildOneTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildOneTwo = _classThis;
            })();
            let ChildOne = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: '', redirectTo: 'gc11' },
                            { id: 'r1', path: 'gc11', component: GrandChildOneOne },
                            { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
                        ],
                    }), customElement({ name: 'c-one', template: t1 })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildOne = _classThis = class {
                    constructor() {
                        this.parentCtx = resolve(IRouteContext).parent;
                    }
                };
                __setFunctionName(_classThis, "ChildOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildOne = _classThis;
            })();
            let GrandChildTwoOne = (() => {
                let _classDecorators = [customElement({ name: 'gc-21', template: 'gc21' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildTwoOne = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildTwoOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildTwoOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildTwoOne = _classThis;
            })();
            let GrandChildTwoTwo = (() => {
                let _classDecorators = [customElement({ name: 'gc-22', template: 'gc22' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildTwoTwo = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildTwoTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildTwoTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildTwoTwo = _classThis;
            })();
            let ChildTwo = (() => {
                let _classDecorators = [route({
                        routes: [
                            { path: '', redirectTo: 'gc21' },
                            { id: 'r1', path: 'gc21', component: GrandChildTwoOne },
                            { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
                        ],
                    }), customElement({ name: 'c-two', template: t2 })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildTwo = _classThis = class {
                    constructor() {
                        this.parentCtx = resolve(IRouteContext).parent;
                    }
                };
                __setFunctionName(_classThis, "ChildTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildTwo = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            {
                                path: '',
                                redirectTo: 'c1',
                            },
                            {
                                id: 'r1',
                                path: 'c1',
                                component: ChildOne,
                            },
                            {
                                id: 'r2',
                                path: 'c2',
                                component: ChildTwo,
                            },
                        ],
                    }), customElement({ name: 'my-app', template: rt })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Root = _classThis = class {
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { au, host, container } = await start({ appRoot: Root });
            const location = container.get(ILocation);
            const queue = container.get(IPlatform).domQueue;
            await queue.yield();
            let anchors = host.querySelectorAll('a');
            assertAnchors(anchors, expectations1, 'round#1 - anchors', false);
            assert.match(location.path, /c1\/gc11$/, 'round#1 - location.path');
            anchors[3].click();
            await queue.yield();
            assertAnchors(anchors, expectations1, 'round#2 - anchors', false);
            assert.match(location.path, /c1\/gc12$/, 'round#2 - location.path');
            anchors[2].click();
            await queue.yield();
            assertAnchors(anchors, expectations1, 'round#3 - anchors', false);
            assert.match(location.path, /c1\/gc11$/, 'round#3 - location.path');
            anchors[1].click();
            await queue.yield();
            anchors = host.querySelectorAll('a');
            assertAnchors(anchors, expectations2, 'round#4', false);
            assert.match(location.path, /c2\/gc21$/, 'round#4 - location.path');
            anchors[3].click();
            await queue.yield();
            assertAnchors(anchors, expectations2, 'round#5 - anchors', false);
            assert.match(location.path, /c2\/gc22$/, 'round#5 - location.path');
            anchors[2].click();
            await queue.yield();
            assertAnchors(anchors, expectations2, 'round#6 - anchors', false);
            assert.match(location.path, /c2\/gc21$/, 'round#6 - location.path');
            anchors[4].click();
            await queue.yield();
            anchors = host.querySelectorAll('a');
            assertAnchors(anchors, expectations1, 'round#7', false);
            assert.match(location.path, /c1\/gc11$/, 'round#7 - location.path');
            await au.stop(true);
        });
    }
    class HrefGenerationForChildComponentSiblingTestData {
        constructor(name, templates, expectedHrefs) {
            this.name = name;
            this.templates = templates;
            this.expectedHrefs = expectedHrefs;
        }
    }
    function* getHrefGenerationForChildComponentSiblingTestData() {
        yield new HrefGenerationForChildComponentSiblingTestData('using path', [
            `
    <a load="c1">C1</a>
    <a load="c2">C2</a>
    <au-viewport></au-viewport>`,
            `c1
    <a load="gc11+gc12">gc11+gc12</a>
    <a load="gc12+gc13">gc12+gc13</a>
    <a load="gc13+gc11">gc13+gc11</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`,
            `c2
    <a load="gc21+gc22">gc21+gc22</a>
    <a load="gc22+gc23">gc22+gc23</a>
    <a load="gc23+gc21">gc23+gc21</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`
        ], [
            [
                { href: 'c1' },
                { href: 'c2' },
                { href: 'c1/gc11+gc12' },
                { href: 'c1/gc12+gc13' },
                { href: 'c1/gc13+gc11' },
            ],
            [
                { href: 'c1' },
                { href: 'c2' },
                { href: 'c2/gc21+gc22' },
                { href: 'c2/gc22+gc23' },
                { href: 'c2/gc23+gc21' },
            ]
        ]);
        yield new HrefGenerationForChildComponentSiblingTestData('using route-id', [
            `
    <a load="r1">C1</a>
    <a load="r2">C2</a>
    <au-viewport></au-viewport>`,
            `c1
    <a load="r1+r2">gc11+gc12</a>
    <a load="r2+r3">gc12+gc13</a>
    <a load="r3+r1">gc13+gc11</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`,
            `c2
    <a load="r1+r2">gc21+gc22</a>
    <a load="r2+r3">gc22+gc23</a>
    <a load="r3+r1">gc23+gc21</a>
    <au-viewport default.bind="null"></au-viewport><au-viewport default.bind="null"></au-viewport>`
        ], [
            [
                { href: 'r1' },
                { href: 'r2' },
                { href: 'c1/r1+r2' },
                { href: 'c1/r2+r3' },
                { href: 'c1/r3+r1' },
            ],
            [
                { href: 'r1' },
                { href: 'r2' },
                { href: 'c2/r1+r2' },
                { href: 'c2/r2+r3' },
                { href: 'c2/r3+r1' },
            ]
        ]);
    }
    for (const { name, templates: [rt, t1, t2], expectedHrefs: [expectations1, expectations2] } of getHrefGenerationForChildComponentSiblingTestData()) {
        it(`href attribute value is correctly generated for child components - sibling instructions - ${name}`, async function () {
            let GrandChildOneOne = (() => {
                let _classDecorators = [customElement({ name: 'gc-11', template: 'gc11' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildOneOne = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildOneOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildOneOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildOneOne = _classThis;
            })();
            let GrandChildOneTwo = (() => {
                let _classDecorators = [customElement({ name: 'gc-12', template: 'gc12' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildOneTwo = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildOneTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildOneTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildOneTwo = _classThis;
            })();
            let GrandChildOneThree = (() => {
                let _classDecorators = [customElement({ name: 'gc-13', template: 'gc13' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildOneThree = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildOneThree");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildOneThree = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildOneThree = _classThis;
            })();
            let ChildOne = (() => {
                let _classDecorators = [route({
                        routes: [
                            { id: 'r1', path: 'gc11', component: GrandChildOneOne },
                            { id: 'r2', path: 'gc12', component: GrandChildOneTwo },
                            { id: 'r3', path: 'gc13', component: GrandChildOneThree },
                        ],
                    }), customElement({ name: 'c-one', template: t1 })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildOne = _classThis = class {
                    constructor() {
                        this.parentCtx = resolve(IRouteContext).parent;
                    }
                };
                __setFunctionName(_classThis, "ChildOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildOne = _classThis;
            })();
            let GrandChildTwoOne = (() => {
                let _classDecorators = [customElement({ name: 'gc-21', template: 'gc21' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildTwoOne = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildTwoOne");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildTwoOne = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildTwoOne = _classThis;
            })();
            let GrandChildTwoTwo = (() => {
                let _classDecorators = [customElement({ name: 'gc-22', template: 'gc22' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildTwoTwo = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildTwoTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildTwoTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildTwoTwo = _classThis;
            })();
            let GrandChildTwoThree = (() => {
                let _classDecorators = [customElement({ name: 'gc-23', template: 'gc23' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var GrandChildTwoThree = _classThis = class {
                };
                __setFunctionName(_classThis, "GrandChildTwoThree");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    GrandChildTwoThree = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return GrandChildTwoThree = _classThis;
            })();
            let ChildTwo = (() => {
                let _classDecorators = [route({
                        routes: [
                            { id: 'r1', path: 'gc21', component: GrandChildTwoOne },
                            { id: 'r2', path: 'gc22', component: GrandChildTwoTwo },
                            { id: 'r3', path: 'gc23', component: GrandChildTwoThree },
                        ],
                    }), customElement({ name: 'c-two', template: t2 })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var ChildTwo = _classThis = class {
                    constructor() {
                        this.parentCtx = resolve(IRouteContext).parent;
                    }
                };
                __setFunctionName(_classThis, "ChildTwo");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ChildTwo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return ChildTwo = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            {
                                path: '',
                                redirectTo: 'c1',
                            },
                            {
                                id: 'r1',
                                path: 'c1',
                                component: ChildOne,
                            },
                            {
                                id: 'r2',
                                path: 'c2',
                                component: ChildTwo,
                            },
                        ],
                    }), customElement({ name: 'my-app', template: rt })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Root = _classThis = class {
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { au, host, container } = await start({ appRoot: Root });
            const location = container.get(ILocation);
            const queue = container.get(IPlatform).domQueue;
            await queue.yield();
            let anchors = host.querySelectorAll('a');
            assertAnchors(anchors, expectations1, 'round#1 - anchors', false);
            assert.match(location.path, /c1$/, 'round#1 - location.path');
            anchors[2].click();
            await queue.yield();
            assert.match(location.path, /c1\/gc11\+gc12$/, 'round#2 - location.path');
            anchors[3].click();
            await queue.yield();
            assert.match(location.path, /c1\/gc12\+gc13$/, 'round#3 - location.path');
            anchors[4].click();
            await queue.yield();
            assert.match(location.path, /c1\/gc13\+gc11$/, 'round#4 - location.path');
            anchors[1].click();
            await queue.yield();
            anchors = host.querySelectorAll('a');
            assertAnchors(anchors, expectations2, 'round#5 - anchors', false);
            assert.match(location.path, /c2$/, 'round#5 - location.path');
            anchors[2].click();
            await queue.yield();
            assert.match(location.path, /c2\/gc21\+gc22$/, 'round#6 - location.path');
            anchors[3].click();
            await queue.yield();
            assert.match(location.path, /c2\/gc22\+gc23$/, 'round#7 - location.path');
            anchors[4].click();
            await queue.yield();
            assert.match(location.path, /c2\/gc23\+gc21$/, 'round#8 - location.path');
            anchors[0].click();
            await queue.yield();
            anchors = host.querySelectorAll('a');
            assertAnchors(anchors, expectations1, 'round#9 - anchors', false);
            assert.match(location.path, /c1$/, 'round#9 - location.path');
            await au.stop(true);
        });
    }
    it('supports routing instruction with parenthesized parameters', async function () {
        let C1 = (() => {
            let _classDecorators = [route('c1/:id1/:id2?'), customElement({ name: 'c-1', template: 'c1 ${id1} ${id2}' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var C1 = _classThis = class {
                loading(params, _next, _current) {
                    this.id1 = params.id1;
                    this.id2 = params.id2;
                }
            };
            __setFunctionName(_classThis, "C1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                C1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return C1 = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({ routes: [{ id: 'c1', component: C1 }] }), customElement({ name: 'ro-ot', template: '<a load="c1(id1=1)"></a> <a load="c1(id1=2,id2=3)"></a> <au-viewport></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, container, host } = await start({ appRoot: Root });
        const queue = container.get(IPlatform).domQueue;
        assert.html.textContent(host, '', 'init');
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'c1 1', 'round#1');
        host.querySelector('a:nth-of-type(2)').click();
        await queue.yield();
        assert.html.textContent(host, 'c1 2 3', 'round#2');
        await au.stop(true);
    });
    it('allow navigating to route defined in parent context using ../ prefix with replace transitionPlan and child viewport', async function () {
        let Product = (() => {
            let _classDecorators = [customElement({ name: 'product-details', template: `product \${id} <a load="../../products"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Product = _classThis = class {
                canLoad(params, _next, _current) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "Product");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Product = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Product = _classThis;
        })();
        let ProductInit = (() => {
            let _classDecorators = [customElement({ name: 'product-init', template: `product init <a load="../product/1"></a><a load="../product/2"></a>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var ProductInit = _classThis = class {
            };
            __setFunctionName(_classThis, "ProductInit");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                ProductInit = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return ProductInit = _classThis;
        })();
        let Products = (() => {
            let _classDecorators = [route({
                    routes: [
                        { path: '', component: ProductInit },
                        { path: 'product/:id', component: Product },
                    ]
                }), customElement({ name: 'pro-ducts', template: `<au-viewport name="products"></au-viewport>` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Products = _classThis = class {
            };
            __setFunctionName(_classThis, "Products");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Products = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Products = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({
                    routes: [
                        { id: 'products', path: ['', 'products'], component: Products },
                    ],
                    transitionPlan: 'replace',
                }), customElement({ name: 'ro-ot', template: '<au-viewport name="root"></au-viewport>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        assert.html.textContent(host, 'product init');
        const anchors = Array.from(host.querySelectorAll('a'));
        const hrefs = anchors.map(a => a.href);
        assert.match(hrefs[0], /product\/1$/);
        assert.match(hrefs[1], /product\/2$/);
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'product 1', 'round#1');
        // go back
        const back = host.querySelector('a');
        assert.match(back.href, /products$/, 'round#1 - back - href');
        back.click();
        await queue.yield();
        assert.html.textContent(host, 'product init', 'round#1 - back - text');
        // 2nd round
        host.querySelector('a:nth-of-type(2)').click();
        await queue.yield();
        assert.html.textContent(host, 'product 2', 'round#2');
        // go back
        host.querySelector('a').click();
        await queue.yield();
        assert.html.textContent(host, 'product init', 'round#2 - back - text');
        await au.stop(true);
    });
    for (const value of [null, undefined]) {
        it(`${value} value for a query-string param is ignored`, async function () {
            let Product = (() => {
                let _classDecorators = [route('product'), customElement({ name: 'pro-duct', template: `product` })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Product = _classThis = class {
                    canLoad(_params, _next, _current) {
                        this.query = _next.queryParams;
                        return true;
                    }
                };
                __setFunctionName(_classThis, "Product");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Product = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Product = _classThis;
            })();
            let Root = (() => {
                let _classDecorators = [route({
                        routes: [
                            Product,
                        ]
                    }), customElement({ name: 'ro-ot', template: '<a load="route:product; params.bind: {id: value}"></a><au-viewport></au-viewport>' })];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                var Root = _classThis = class {
                    constructor() {
                        this.value = value;
                    }
                };
                __setFunctionName(_classThis, "Root");
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Root = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                })();
                return Root = _classThis;
            })();
            const { au, host, container } = await start({ appRoot: Root, registrations: [Product] });
            const queue = container.get(IPlatform).domQueue;
            await queue.yield();
            host.querySelector('a').click();
            await queue.yield();
            const product = CustomElement.for(host.querySelector('pro-duct')).viewModel;
            const query = product.query;
            assert.strictEqual(query.get('id'), null);
            assert.deepStrictEqual(Array.from(query.keys()), []);
            await au.stop(true);
        });
    }
    it('respects constrained routes', async function () {
        let NotFound = (() => {
            let _classDecorators = [route('nf'), customElement({ name: 'not-found', template: `nf` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var NotFound = _classThis = class {
            };
            __setFunctionName(_classThis, "NotFound");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                NotFound = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return NotFound = _classThis;
        })();
        let Product = (() => {
            let _classDecorators = [route({ id: 'product', path: 'product/:id{{^\\d+$}}' }), customElement({ name: 'pro-duct', template: `product \${id}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Product = _classThis = class {
                canLoad(params, _next, _current) {
                    this.id = params.id;
                    return true;
                }
            };
            __setFunctionName(_classThis, "Product");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Product = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Product = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [route({ routes: [Product, NotFound], fallback: 'nf' }), customElement({
                    name: 'ro-ot',
                    template: `
        <a load="route:product; params.bind:{id: 42}"></a>
        <a load="route:product; params.bind:{id: foo}"></a>
        <a load="product/bar"></a>
        <au-viewport></au-viewport>
      `
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root = _classThis = class {
            };
            __setFunctionName(_classThis, "Root");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root = _classThis;
        })();
        const { au, host, container } = await start({ appRoot: Root });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = Array.from(host.querySelectorAll('a'));
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'product 42');
        anchors[1].click();
        await queue.yield();
        assert.html.textContent(host, 'nf');
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'product 42');
        anchors[2].click();
        await queue.yield();
        assert.html.textContent(host, 'nf');
        await au.stop(true);
    });
    {
        class TestData {
            constructor(name, routeParam) {
                this.name = name;
                this.routeParam = routeParam;
                this.encodedRouteParam = encodeURIComponent(routeParam);
            }
        }
        const testData = [
            new TestData('with /', 'foo/bar'),
            new TestData('with %', 'foo%bar'),
            new TestData('with ?', 'foo?bar'),
            new TestData('with #', 'foo#bar'),
            new TestData('with &', 'foo&bar'),
            new TestData('with emoji', 'foo😀bar'),
        ];
        const numTestData = testData.length;
        for (const useHash of [true, false]) {
            for (let i = 0; i < numTestData; ++i) {
                const { name, routeParam, encodedRouteParam } = testData[i];
                it(`decodes route parameters correctly - ${name} - with hash: ${useHash}`, async function () {
                    let P1 = (() => {
                        let _classDecorators = [route('p1/*rest'), customElement({ name: 'p-1', template: `p1 \${rest}` })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var P1 = _classThis = class {
                            loading(params, _next, _current) {
                                this.rest = params.rest;
                            }
                        };
                        __setFunctionName(_classThis, "P1");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            P1 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return P1 = _classThis;
                    })();
                    let Root = (() => {
                        let _classDecorators = [route({ routes: [P1] }), customElement({ name: 'ro-ot', template: '<a load.bind="route"></a><au-viewport></au-viewport>' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var Root = _classThis = class {
                            constructor() {
                                this.route = `p1/${encodedRouteParam}`;
                            }
                        };
                        __setFunctionName(_classThis, "Root");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Root = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Root = _classThis;
                    })();
                    const { au, host, container, rootVm } = await start({ appRoot: Root, registrations: [P1], useHash });
                    const queue = container.get(IPlatform).domQueue;
                    const anchor = host.querySelector('a');
                    anchor.click();
                    await queue.yield();
                    assert.html.textContent(host, `p1 ${routeParam}`, 'round#1');
                    // change route
                    const { routeParam: nextRouteParam, encodedRouteParam: nextEncodedRouteParam } = testData[(i + 1) % numTestData];
                    const nextRoute = rootVm.route = `p1/${nextEncodedRouteParam}`;
                    await queue.yield();
                    assert.strictEqual(anchor.getAttribute('href').endsWith(nextRoute), true, 'round#2 - href');
                    anchor.click();
                    await queue.yield();
                    assert.html.textContent(host, `p1 ${nextRouteParam}`, 'round#2');
                    await au.stop(true);
                });
            }
        }
    }
});
//# sourceMappingURL=load.spec.js.map