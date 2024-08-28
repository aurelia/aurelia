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
import { resolve } from '@aurelia/kernel';
import { Controller, CustomElement, customElement, INode, registerHostNode } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
describe('3-runtime-html/controller.smoke-test.spec.ts', function () {
    it('explicit hydration host and hostController can be provided', async function () {
        let CeOne = (() => {
            let _classDecorators = [customElement({ name: 'c-1', template: 'c1' })];
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
            let _classDecorators = [customElement({ name: 'c-2', template: 'c2' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var CeTwo = _classThis = class {
                constructor() {
                    this.ce2El = resolve(INode);
                }
                attached(_initiator) {
                    // at this point, the element should be in the DOM
                    assert.strictEqual(this.ce2El.parentElement, ce1El);
                }
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
        const { appHost, stop, startPromise, platform } = createFixture(`<c-1></c-1>`, class {
        }, [CeOne, CeTwo]);
        await startPromise;
        const ce1El = appHost.querySelector('c-1');
        assert.html.innerEqual(ce1El, 'c1');
        const ce1Ctrl = CustomElement.for(ce1El);
        // activate c-2
        const childCtn = ce1Ctrl.container.createChild({ inheritParentResources: true });
        const ce2El = platform.document.createElement('c-2');
        registerHostNode(childCtn, ce2El);
        assert.html.innerEqual(ce2El, '');
        const ce2Vm = childCtn.invoke(CeTwo);
        assert.strictEqual(ce2Vm.ce2El, ce2El);
        const ce2Ctrl = Controller.$el(childCtn, ce2Vm, ce2El, { hostController: ce1Ctrl, projections: null });
        await ce2Ctrl.activate(ce2Ctrl, ce1Ctrl);
        // post-activation assertion
        assert.html.textContent(ce2El, 'c2');
        assert.html.textContent(ce1El, 'c1c2');
        assert.strictEqual(ce1El.contains(ce2El), true);
        // deactivate c-2
        await ce2Ctrl.deactivate(ce2Ctrl, ce1Ctrl);
        // post-deactivation assertion
        assert.html.textContent(ce2El, '');
        assert.html.textContent(ce1El, 'c1');
        assert.strictEqual(ce1El.contains(ce2El), false);
        await stop(true);
    });
});
//# sourceMappingURL=controller.smoke-test.spec.js.map