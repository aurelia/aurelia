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
import { route } from '@aurelia/router';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';
describe('router/resources/href.spec.ts', function () {
    it('allow navigating to route defined in parent context using ../ prefix', async function () {
        let Product = (() => {
            let _classDecorators = [customElement({ name: 'pro-duct', template: `product \${id} <a href="../products"></a>` })];
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
            let _classDecorators = [customElement({ name: 'pro-ducts', template: `<a href="../product/1"></a><a href="../product/2"></a> products` })];
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
    it('allow navigating to route defined in grand-parent context using ../../ prefix', async function () {
        let L21 = (() => {
            let _classDecorators = [customElement({ name: 'l-21', template: `l21 \${id} <a href="../../l12"></a>` })];
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
            let _classDecorators = [customElement({ name: 'l-22', template: `l22 \${id} <a href="../../l11"></a>` })];
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
    // slightly more complex use-case
    it('cross children navigation with multiple hierarchical routing configuration', async function () {
        let L21 = (() => {
            let _classDecorators = [customElement({ name: 'l-21', template: `l21 <a href="../l22"></a>` })];
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
            let _classDecorators = [customElement({ name: 'l-22', template: `l22 <a href="../../l12"></a>` })];
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
            let _classDecorators = [customElement({ name: 'l-23', template: `l23 <a href="../l24"></a>` })];
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
            let _classDecorators = [customElement({ name: 'l-24', template: `l24 <a href="../../l11"></a>` })];
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
        let CeThreeChild = (() => {
            let _classDecorators = [customElement({ name: 'ce-three-child', template: `ce3child` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeThreeChild = _classThis = class {
            };
            __setFunctionName(_classThis, "CeThreeChild");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeThreeChild = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeThreeChild = _classThis;
        })();
        let CeThree = (() => {
            let _classDecorators = [customElement({ name: 'ce-three', template: `ce3 <a id="ce3a1" href="../ce-one"></a> <a id="ce3a2" href="ce-three-child"></a> <au-viewport></au-viewport>` }), route({
                    routes: [
                        {
                            path: 'ce-three-child',
                            component: CeThreeChild,
                        },
                    ]
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeThree = _classThis = class {
            };
            __setFunctionName(_classThis, "CeThree");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                CeThree = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return CeThree = _classThis;
        })();
        let Root = (() => {
            let _classDecorators = [customElement({
                    name: 'ro-ot',
                    template: `
      <a href="#ce-one"></a>
      <a href="#ce-two"></a>
      <a href="ce-two"></a>
      <a href="./ce-three"></a>
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
                        {
                            path: 'ce-three',
                            component: CeThree,
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
        const { au, host, container } = await start({ appRoot: Root, useHash: true, registrations: [CeOne, CeTwo, CeThree] });
        const queue = container.get(IPlatform).domQueue;
        await queue.yield();
        const anchors = Array.from(host.querySelectorAll('a'));
        assert.deepStrictEqual(anchors.map(a => a.getAttribute('href')), ['#ce-one', '#ce-two', '#ce-two', './ce-three']);
        anchors[1].click();
        await queue.yield();
        assert.html.textContent(host, 'ce2');
        anchors[0].click();
        await queue.yield();
        assert.html.textContent(host, 'ce1');
        anchors[2].click();
        await queue.yield();
        assert.html.textContent(host, 'ce2');
        anchors[3].click();
        await queue.yield();
        assert.html.textContent(host, 'ce3');
        let anchor = host.querySelector('a#ce3a1');
        assert.strictEqual(anchor.getAttribute('href'), '../ce-one');
        anchor.click();
        await queue.yield();
        assert.html.textContent(host, 'ce1');
        anchors[3].click();
        await queue.yield();
        assert.html.textContent(host, 'ce3');
        anchor = host.querySelector('a#ce3a2');
        assert.strictEqual(anchor.getAttribute('href'), 'ce-three-child');
        anchor.click();
        await queue.yield();
        assert.html.textContent(host, 'ce3 ce3child');
        await au.stop(true);
    });
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
            let _classDecorators = [route({ routes: [{ id: 'c1', component: C1 }] }), customElement({ name: 'ro-ot', template: '<a href="c1(id1=1)"></a> <a href="c1(id1=2,id2=3)"></a> <au-viewport></au-viewport>' })];
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
        <a href="product/42"></a>
        <a href="product/bar"></a>
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
        assert.html.textContent(host, 'product 42', 'round#1');
        anchors[1].click();
        await queue.yield();
        assert.html.textContent(host, 'nf', 'round#2');
        await au.stop(true);
    });
});
//# sourceMappingURL=href.spec.js.map