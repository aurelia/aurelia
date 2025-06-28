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
import { kebabCase, } from '@aurelia/kernel';
import { assert, } from '@aurelia/testing';
import { Router, } from '@aurelia/router-direct';
import { customElement, CustomElement, } from '@aurelia/runtime-html';
import { createFixture, translateOptions } from './_shared/create-fixture.js';
function vp(count, name = '') {
    if (count === 1) {
        return `<au-viewport${name.length > 0 ? ` name="${name}"` : ''}></au-viewport>`;
    }
    let template = '';
    for (let i = 0; i < count; ++i) {
        template = `${template}<au-viewport name="${name}$${i}"></au-viewport>`;
    }
    return template;
}
function name(type) {
    return kebabCase(type.name);
}
function getDefaultHIAConfig() {
    return {
        resolveTimeoutMs: 100,
        resolveLabels: [],
    };
}
function getText(spec) {
    return spec.map(function (x) {
        if (x instanceof Array) {
            return getText(x);
        }
        return kebabCase(x.name);
    }).join('');
}
function assertComponentsVisible(host, spec, msg = '') {
    assert.strictEqual(host.textContent, getText(spec), msg);
}
function assertIsActive(router, instruction, options, expected, assertId) {
    if (options instanceof Router) {
        options = {};
    }
    const isActive = router.checkActive(instruction, options);
    assert.strictEqual(isActive, expected, `expected isActive to return ${expected} (assertId ${assertId})`);
}
describe('router-direct/smoke-tests.spec.ts', function () {
    describe('without any configuration, deps registered globally', function () {
        let A01 = (() => {
            let _classDecorators = [customElement({ name: 'a01', template: `a01${vp(0)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A01 = _classThis = class {
            };
            __setFunctionName(_classThis, "A01");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A01 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A01 = _classThis;
        })();
        let A02 = (() => {
            let _classDecorators = [customElement({ name: 'a02', template: `a02${vp(0)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A02 = _classThis = class {
            };
            __setFunctionName(_classThis, "A02");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A02 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A02 = _classThis;
        })();
        const A0 = [A01, A02];
        let Root1 = (() => {
            let _classDecorators = [customElement({ name: 'root1', template: `root1${vp(1)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root1 = _classThis = class {
            };
            __setFunctionName(_classThis, "Root1");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root1 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root1 = _classThis;
        })();
        let A11 = (() => {
            let _classDecorators = [customElement({ name: 'a11', template: `a11${vp(1)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A11 = _classThis = class {
            };
            __setFunctionName(_classThis, "A11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A11 = _classThis;
        })();
        let A12 = (() => {
            let _classDecorators = [customElement({ name: 'a12', template: `a12${vp(1)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A12 = _classThis = class {
            };
            __setFunctionName(_classThis, "A12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A12 = _classThis;
        })();
        const A1 = [A11, A12];
        let Root2 = (() => {
            let _classDecorators = [customElement({ name: 'root2', template: `root2${vp(2)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Root2 = _classThis = class {
            };
            __setFunctionName(_classThis, "Root2");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Root2 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Root2 = _classThis;
        })();
        let A21 = (() => {
            let _classDecorators = [customElement({ name: 'a21', template: `a21${vp(2)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A21 = _classThis = class {
            };
            __setFunctionName(_classThis, "A21");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A21 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A21 = _classThis;
        })();
        let A22 = (() => {
            let _classDecorators = [customElement({ name: 'a22', template: `a22${vp(2)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var A22 = _classThis = class {
            };
            __setFunctionName(_classThis, "A22");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                A22 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return A22 = _classThis;
        })();
        const A2 = [A21, A22];
        const A = [...A0, ...A1, ...A2];
        let B01 = (() => {
            let _classDecorators = [customElement({ name: 'b01', template: `b01${vp(0)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B01 = _classThis = class {
                async canUnload(_params, _instruction, _navigation) {
                    await new Promise(function (resolve) { setTimeout(resolve, 0); });
                    return true;
                }
            };
            __setFunctionName(_classThis, "B01");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B01 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B01 = _classThis;
        })();
        let B02 = (() => {
            let _classDecorators = [customElement({ name: 'b02', template: `b02${vp(0)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B02 = _classThis = class {
                async canUnload(_params, _instruction, _navigation) {
                    await new Promise(function (resolve) { setTimeout(resolve, 0); });
                    return false;
                }
            };
            __setFunctionName(_classThis, "B02");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B02 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B02 = _classThis;
        })();
        const B0 = [B01, B02];
        let B11 = (() => {
            let _classDecorators = [customElement({ name: 'b11', template: `b11${vp(1)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B11 = _classThis = class {
                async canUnload(_params, _instruction, _navigation) {
                    await new Promise(function (resolve) { setTimeout(resolve, 0); });
                    return true;
                }
            };
            __setFunctionName(_classThis, "B11");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B11 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B11 = _classThis;
        })();
        let B12 = (() => {
            let _classDecorators = [customElement({ name: 'b12', template: `b12${vp(1)}` })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var B12 = _classThis = class {
                async canUnload(_params, _instruction, _navigation) {
                    await new Promise(function (resolve) { setTimeout(resolve, 0); });
                    return false;
                }
            };
            __setFunctionName(_classThis, "B12");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                B12 = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return B12 = _classThis;
        })();
        const B1 = [B11, B12];
        const B = [...B0, ...B1];
        const Z = [...A, ...B];
        const getRouterOptions = () => translateOptions({});
        // Start with a broad sample of non-generated tests that are easy to debug and mess around with.
        it(`${name(Root1)} can load ${name(A01)} as a string and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load('a01');
            assertComponentsVisible(host, [Root1, A01]);
            assertIsActive(router, A01, {}, true, 1);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A01)} as a type and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(A01);
            assertComponentsVisible(host, [Root1, A01]);
            assertIsActive(router, A01, {}, true, 1);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A01)} as a RoutingInstruction and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load({ component: A01 });
            assertComponentsVisible(host, [Root1, A01]);
            assertIsActive(router, { component: A01 }, {}, true, 1);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A01)} as a CustomElementDefinition and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(CustomElement.getDefinition(A01));
            assertComponentsVisible(host, [Root1, A01]);
            assertIsActive(router, CustomElement.getDefinition(A01), {}, true, 1);
            await tearDown();
        });
        it(`${name(Root1)} can load ({ name: 'a31', template: \`A31\${vp(0)}\` } as an object and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            const def = { name: 'a31', template: `a31${vp(0)}` };
            await router.load(def);
            const A31 = CustomElement.define(def);
            assertComponentsVisible(host, [Root1, A31]);
            assertIsActive(router, CustomElement.getDefinition(A31), {}, true, 1);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A01)},${name(A02)} in order and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load('a01');
            assertComponentsVisible(host, [Root1, A01]);
            assertIsActive(router, A01, {}, true, 1);
            await router.load('a02');
            assertComponentsVisible(host, [Root1, A02]);
            assertIsActive(router, A02, {}, true, 2);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A11)},${name(A11)}/${name(A02)} in order with context and can determine if it's active`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(A11);
            assertComponentsVisible(host, [Root1, A11]);
            assertIsActive(router, A11, {}, true, 1);
            const loadOptions = { origin: router.allEndpoints('Viewport')[0].getContent().componentInstance }; // A11 view model
            await router.load(A02, loadOptions);
            assertComponentsVisible(host, [Root1, A11, A02]);
            assertIsActive(router, A02, loadOptions, true, 2);
            assertIsActive(router, A02, {}, false, 3);
            assertIsActive(router, A11, {}, true, 3);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A11)}/${name(A01)},${name(A11)}/${name(A02)} in order with context`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load({ component: A11, children: [A01] });
            assertComponentsVisible(host, [Root1, A11, A01]);
            const loadOptions = { origin: router.allEndpoints('Viewport')[0].getContent().componentInstance }; // A11 view model
            await router.load(A02, loadOptions);
            assertComponentsVisible(host, [Root1, A11, A02]);
            await tearDown();
        });
        it(`${name(Root1)} correctly handles canUnload with load ${name(B01)},${name(A01)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            let result = await router.load(B01);
            assertComponentsVisible(host, [Root1, B01]);
            assert.strictEqual(result, true, '#1 result===true');
            result = await router.load(A01);
            assertComponentsVisible(host, [Root1, A01]);
            assert.strictEqual(result, true, '#2 result===true');
            await tearDown();
        });
        it(`${name(Root1)} correctly handles canUnload with load ${name(B02)},${name(A01)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            let result = await router.load(B02);
            assertComponentsVisible(host, [Root1, B02]);
            assert.strictEqual(result, true, '#1 result===true');
            result = await router.load(A01);
            assertComponentsVisible(host, [Root1, B02]);
            assert.strictEqual(result, false, '#2 result===false');
            await tearDown();
        });
        it(`${name(Root1)} correctly handles canUnload with load ${name(B02)},${name(A01)},${name(A02)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            let result = await router.load(B02);
            assertComponentsVisible(host, [Root1, B02], '#1');
            assert.strictEqual(result, true, '#1 result===true');
            result = await router.load(A01);
            assertComponentsVisible(host, [Root1, B02], '#2');
            assert.strictEqual(result, false, '#2 result===false');
            result = await router.load(A02);
            assertComponentsVisible(host, [Root1, B02], '#3');
            assert.strictEqual(result, false, '#3 result===false');
            await tearDown();
        });
        it(`${name(Root1)} correctly handles canUnload with load ${name(B11)}/${name(B02)},${name(B11)}/${name(A02)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            let result = await router.load(`b11/b02`);
            assertComponentsVisible(host, [Root1, B11, [B02]]);
            assert.strictEqual(result, true, '#1 result===true');
            result = await router.load(`b11/a02`);
            assertComponentsVisible(host, [Root1, B11, [B02]]);
            assert.strictEqual(result, false, '#2 result===false');
            await tearDown();
        });
        it(`${name(Root1)} correctly handles canUnload with load ${name(B12)}/${name(B01)},${name(B11)}/${name(B01)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            let result = await router.load(`b12/b01`);
            assertComponentsVisible(host, [Root1, B12, [B01]]);
            assert.strictEqual(result, true, '#1 result===true');
            result = await router.load(`b11/b01`);
            assertComponentsVisible(host, [Root1, B12, [B01]]);
            assert.strictEqual(result, false, '#2 result===false');
            await tearDown();
        });
        it(`${name(Root1)} correctly handles canUnload with load ${name(B12)}/${name(B01)},${name(B12)}/${name(A01)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            let result = await router.load(`b12/b01`);
            assertComponentsVisible(host, [Root1, B12, [B01]]);
            assert.strictEqual(result, true, '#1 result===true');
            result = await router.load(`b12/a01`);
            assertComponentsVisible(host, [Root1, B12, [A01]]);
            assert.strictEqual(result, true, '#2 result===true');
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A11)}/${name(A01)} as a string`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(`a11/a01`);
            assertComponentsVisible(host, [Root1, A11, A01]);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A11)}/${name(A01)} as a RoutingInstruction`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load({ component: A11, children: [A01] });
            assertComponentsVisible(host, [Root1, A11, A01]);
            await tearDown();
        });
        it(`${name(Root1)} can load ${name(A11)}/${name(A01)},${name(A11)}/${name(A02)} in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(`a11/a01`);
            assertComponentsVisible(host, [Root1, A11, A01]);
            await router.load(`a11/a02`);
            assertComponentsVisible(host, [Root1, A11, A02]);
            await tearDown();
        });
        it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as a string`, async function () {
            const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(`${name(A01)}@$0+${name(A02)}@$1`);
            assertComponentsVisible(host, [Root2, A01, A02]);
            await tearDown();
        });
        it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as an array of strings`, async function () {
            const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load([`${name(A01)}@$0`, `${name(A02)}@$1`]);
            assertComponentsVisible(host, [Root2, A01, A02]);
            await tearDown();
        });
        it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as an array of types`, async function () {
            const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load([{ component: A01, viewport: '$0' }, { component: A02, viewport: '$1' }]);
            assertComponentsVisible(host, [Root2, A01, A02]);
            await tearDown();
        });
        it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1 as a mixed array type and string`, async function () {
            const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load([{ component: A01, viewport: '$0' }, `${name(A02)}@$1`]);
            assertComponentsVisible(host, [Root2, A01, A02]);
            await tearDown();
        });
        it(`${name(Root2)} can load ${name(A01)}@$0+${name(A02)}@$1,${name(A02)}@$0+${name(A01)}@$1 in order`, async function () {
            const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(`${name(A01)}@$0+${name(A02)}@$1`);
            assertComponentsVisible(host, [Root2, A01, A02]);
            await router.load(`${name(A02)}@$0+${name(A01)}@$1`);
            assertComponentsVisible(host, [Root2, A02, A01]);
            await tearDown();
        });
        it(`${name(Root2)} can load ${name(A11)}@$0/${name(A12)}/${name(A01)}+${name(A12)}@$1/${name(A01)},${name(A11)}@$0/${name(A12)}/${name(A01)}+${name(A12)}@$1/${name(A11)}/${name(A01)},${name(A11)}@$0/${name(A12)}/${name(A02)}+${name(A12)}@$1/${name(A11)}/${name(A01)} in order with context`, async function () {
            const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
            await router.load(`${name(A11)}@$0/${name(A12)}/${name(A01)}+${name(A12)}@$1/${name(A01)}`);
            assertComponentsVisible(host, [Root2, [A11, [A12, [A01]]], [A12, [A01]]], '#1');
            let loadOptions = { origin: router.allEndpoints('Viewport')[1].getContent().componentInstance }; // Top A12 view model
            await router.load(`${name(A11)}@$0/${name(A01)}`, loadOptions);
            assertComponentsVisible(host, [Root2, [A11, [A12, [A01]]], [A12, [A11, [A01]]]], '#2');
            loadOptions = { origin: router.allEndpoints('Viewport')[2].getContent().componentInstance }; // Second level A12 view model
            await router.load(`${name(A02)}`, loadOptions);
            assertComponentsVisible(host, [Root2, [A11, [A12, [A02]]], [A12, [A11, [A01]]]], '#3');
            await tearDown();
        });
        // Now generate stuff
        const $1vp = {
            // [x]
            [`a01`]: [A01],
            [`a02`]: [A02],
            // [x/x]
            [`a11/a01`]: [A11, [A01]],
            [`a11/a02`]: [A11, [A02]],
            [`a12/a01`]: [A12, [A01]],
            [`a12/a02`]: [A12, [A02]],
            // [x/x/x]
            [`a11/a12/a01`]: [A11, [A12, [A01]]],
            [`a11/a12/a02`]: [A11, [A12, [A02]]],
            [`a12/a11/a01`]: [A12, [A11, [A01]]],
            [`a12/a11/a02`]: [A12, [A11, [A02]]],
        };
        const $2vps = {
            // [x+x]
            [`${name(A01)}@$0+${name(A02)}@$1`]: [[A01], [A02]],
            [`${name(A02)}@$0+${name(A01)}@$1`]: [[A02], [A01]],
            // [x/x+x]
            [`${name(A11)}@$0/${name(A01)}+${name(A02)}@$1`]: [[A11, [A01]], [A02]],
            [`${name(A11)}@$0/${name(A02)}+${name(A01)}@$1`]: [[A11, [A02]], [A01]],
            [`${name(A12)}@$0/${name(A01)}+${name(A02)}@$1`]: [[A12, [A01]], [A02]],
            [`${name(A12)}@$0/${name(A02)}+${name(A01)}@$1`]: [[A12, [A02]], [A01]],
            // [x+x/x]
            [`${name(A01)}@$0+${name(A11)}@$1/${name(A02)}`]: [[A01], [A11, [A02]]],
            [`${name(A02)}@$0+${name(A11)}@$1/${name(A01)}`]: [[A02], [A11, [A01]]],
            [`${name(A01)}@$0+${name(A12)}@$1/${name(A02)}`]: [[A01], [A12, [A02]]],
            [`${name(A02)}@$0+${name(A12)}@$1/${name(A01)}`]: [[A02], [A12, [A01]]],
            // [x/x+x/x]
            [`${name(A11)}@$0/${name(A01)}+${name(A12)}@$1/${name(A02)}`]: [[A11, [A01]], [A12, [A02]]],
            [`${name(A11)}@$0/${name(A02)}+${name(A12)}@$1/${name(A01)}`]: [[A11, [A02]], [A12, [A01]]],
            [`${name(A12)}@$0/${name(A01)}+${name(A11)}@$1/${name(A02)}`]: [[A12, [A01]], [A11, [A02]]],
            [`${name(A12)}@$0/${name(A02)}+${name(A11)}@$1/${name(A01)}`]: [[A12, [A02]], [A11, [A01]]],
        };
        const $1vpKeys = Object.keys($1vp);
        for (let i = 0, ii = $1vpKeys.length; i < ii; ++i) {
            const key11 = $1vpKeys[i];
            const value11 = $1vp[key11];
            it(`${name(Root1)} can load ${key11}`, async function () {
                const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
                await router.load(key11);
                assertComponentsVisible(host, [Root1, value11]);
                await tearDown();
            });
            if (i >= 1) {
                const key11prev = $1vpKeys[i - 1];
                const value11prev = $1vp[key11prev];
                it(`${name(Root1)} can load ${key11prev},${key11} in order`, async function () {
                    const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
                    await router.load(key11prev);
                    assertComponentsVisible(host, [Root1, value11prev]);
                    await router.load(key11);
                    assertComponentsVisible(host, [Root1, value11]);
                    await tearDown();
                });
                it(`${name(Root1)} can load ${key11},${key11prev} in order`, async function () {
                    const { router, host, tearDown } = await createFixture(Root1, Z, getDefaultHIAConfig, getRouterOptions);
                    await router.load(key11);
                    assertComponentsVisible(host, [Root1, value11]);
                    await router.load(key11prev);
                    assertComponentsVisible(host, [Root1, value11prev]);
                    await tearDown();
                });
            }
        }
        const $2vpsKeys = Object.keys($2vps);
        for (let i = 0, ii = $2vpsKeys.length; i < ii; ++i) {
            const key21 = $2vpsKeys[i];
            const value21 = $2vps[key21];
            it(`${name(Root2)} can load ${key21}`, async function () {
                const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
                await router.load(key21);
                assertComponentsVisible(host, [Root2, value21]);
                await tearDown();
            });
            if (i >= 1) {
                const key21prev = $2vpsKeys[i - 1];
                const value21prev = $2vps[key21prev];
                it(`${name(Root2)} can load ${key21prev},${key21} in order`, async function () {
                    const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
                    await router.load(key21prev);
                    assertComponentsVisible(host, [Root2, value21prev]);
                    await router.load(key21);
                    assertComponentsVisible(host, [Root2, value21]);
                    await tearDown();
                });
                it(`${name(Root2)} can load ${key21},${key21prev} in order`, async function () {
                    const { router, host, tearDown } = await createFixture(Root2, Z, getDefaultHIAConfig, getRouterOptions);
                    await router.load(key21);
                    assertComponentsVisible(host, [Root2, value21]);
                    await router.load(key21prev);
                    assertComponentsVisible(host, [Root2, value21prev]);
                    await tearDown();
                });
            }
        }
    });
});
//# sourceMappingURL=smoke-tests.spec.js.map