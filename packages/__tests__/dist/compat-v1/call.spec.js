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
import { compatRegistration } from '@aurelia/compat-v1';
import { bindable, customElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
describe('compat-v1/call.spec.ts', function () {
    it('does not throw on missing function', function () {
        let MyCe = (() => {
            let _classDecorators = [customElement({ name: 'my-ce', template: '<button click.trigger="action()"></button>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _action_decorators;
            let _action_initializers = [];
            let _action_extraInitializers = [];
            var MyCe = _classThis = class {
                constructor() {
                    this.action = __runInitializers(this, _action_initializers, void 0);
                    __runInitializers(this, _action_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "MyCe");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _action_decorators = [bindable];
                __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyCe = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyCe = _classThis;
        })();
        const { trigger } = createFixture('<my-ce action.bind="a.b()"></my-ce>', class App {
        }, [MyCe, compatRegistration]);
        trigger.click('button');
    });
    it('works with function call binding', async function () {
        let MyCe = (() => {
            let _classDecorators = [customElement({ name: 'my-ce', template: '<button click.trigger="action()"></button>' })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _action_decorators;
            let _action_initializers = [];
            let _action_extraInitializers = [];
            var MyCe = _classThis = class {
                constructor() {
                    this.action = __runInitializers(this, _action_initializers, void 0);
                    __runInitializers(this, _action_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "MyCe");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _action_decorators = [bindable];
                __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: obj => "action" in obj, get: obj => obj.action, set: (obj, value) => { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                MyCe = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return MyCe = _classThis;
        })();
        const { stop, appHost, component } = createFixture('<my-ce action.call="doSomething()"></my-ce>', class App {
            constructor() {
                this.callCount = 0;
            }
            doSomething() {
                this.callCount++;
            }
        }, [MyCe, compatRegistration]);
        assert.strictEqual(component.callCount, 0);
        const button = appHost.querySelector('button');
        button.click();
        assert.strictEqual(component.callCount, 1);
        await stop();
    });
});
//# sourceMappingURL=call.spec.js.map