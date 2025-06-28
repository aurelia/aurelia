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
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { createFixture } from './_shared/create-fixture.js';
describe('router/external.spec.ts', function () {
    for (const useUrlFragmentHash of [true, false])
        for (const attr of ['external', 'data-external']) {
            it(`recognizes "${attr}" attribute - useUrlFragmentHash: ${useUrlFragmentHash}`, async function () {
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
                let Root1 = (() => {
                    let _classDecorators = [route({
                            routes: [
                                {
                                    path: 'a11',
                                    component: A11,
                                },
                                {
                                    path: 'a12',
                                    component: A12,
                                },
                            ]
                        }), customElement({
                            name: 'root1',
                            template: `<a href.bind="compLink"></a><a href.bind="httpLink" external></a><span href="a12"></span>${vp(1)}`
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var Root1 = _classThis = class {
                        constructor() {
                            this.httpLink = 'https://google.com';
                            this.compLink = 'a11';
                        }
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
                const { router, host, tearDown } = await createFixture(Root1, [A11, A12], getDefaultHIAConfig, () => ({ useUrlFragmentHash }));
                const anchors = Array.from(host.querySelectorAll('a'));
                const loadArgs = [];
                router.load = (fn => function (...args) {
                    loadArgs.push(args);
                    return fn.apply(router, args);
                })(router.load);
                const [internalLink, externalLink] = anchors;
                if (useUrlFragmentHash) {
                    assert.match(internalLink.href, /#/);
                }
                else {
                    assert.notMatch(internalLink.href, /#/);
                }
                assert.notMatch(externalLink.href, /#/);
                const spanWithHref = host.querySelector('span');
                let externalLinkClick = 0;
                host.addEventListener('click', function (e) {
                    const target = e.target;
                    if (target.hasAttribute('external') || target.hasAttribute('data-external')) {
                        // prevent browser navigate
                        e.preventDefault();
                        externalLinkClick++;
                    }
                });
                assert.strictEqual(host.textContent, '');
                internalLink.click();
                await router['currentTr'].promise;
                assert.strictEqual(loadArgs.length, 1);
                assert.strictEqual(host.textContent, 'a11');
                externalLink.click();
                assert.strictEqual(loadArgs.length, 1);
                assert.strictEqual(externalLinkClick, 1);
                assert.strictEqual(host.textContent, 'a11');
                await router['currentTr'].promise;
                assert.strictEqual(loadArgs.length, 1);
                assert.strictEqual(externalLinkClick, 1);
                assert.strictEqual(host.textContent, 'a11');
                spanWithHref.click();
                assert.strictEqual(loadArgs.length, 1);
                await tearDown();
            });
        }
});
function vp(count) {
    return '<au-viewport></au-viewport>'.repeat(count);
}
function getDefaultHIAConfig() {
    return {
        resolveTimeoutMs: 100,
        resolveLabels: [],
    };
}
//# sourceMappingURL=external.spec.js.map