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
import { alias, Aurelia, CustomAttribute, customAttribute, CustomAttributeDefinition, customElement } from '@aurelia/runtime-html';
import { assert, TestContext } from "@aurelia/testing";
async function startAndStop(component) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const au = new Aurelia(container);
    const host = ctx.createElement('div');
    au.app({ host, component });
    await au.start();
    await au.stop();
    au.dispose();
}
describe('3-runtime-html/resources.spec.ts', function () {
    it('works in the most basic scenario', async function () {
        let created = false;
        let AuAttr = (() => {
            let _classDecorators = [customAttribute('au-name')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AuAttr = _classThis = class {
                constructor() { created = true; }
            };
            __setFunctionName(_classThis, "AuAttr");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AuAttr = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AuAttr = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: '<div au-name></div>', dependencies: [AuAttr] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
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
        await startAndStop(App);
        assert.strictEqual(created, true, 'created');
        const $class = AuAttr[Symbol.metadata];
        const $proto = AuAttr.prototype[Symbol.metadata];
        assert.deepStrictEqual($class['au:resource'], CustomAttribute.getDefinition(AuAttr), `$class['au:resource']`);
        assert.deepStrictEqual($class['au:resource:custom-attribute'], CustomAttributeDefinition.create({
            name: 'au-name',
        }, AuAttr), `$class['au:resource:custom-attribute']`);
        assert.strictEqual($proto, void 0, `$proto`);
    });
    // xit('works with alias decorator before customAttribute decorator', function () {
    //   let created = false;
    //   @alias('au-alias')
    //   @customAttribute('au-name')
    //   class AuAttr {
    //     public constructor() { created = true; }
    //   }
    //   @customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })
    //   class App {}
    //   startAndStop(App);
    //   assert.strictEqual(created, true, 'created');
    // });
    it('works with alias decorator after customAttribute decorator', async function () {
        let created = false;
        let AuAttr = (() => {
            let _classDecorators = [customAttribute('au-name'), alias('au-alias')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AuAttr = _classThis = class {
                constructor() { created = true; }
            };
            __setFunctionName(_classThis, "AuAttr");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AuAttr = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AuAttr = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
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
        await startAndStop(App);
        assert.strictEqual(created, true, 'created');
        const $class = AuAttr[Symbol.metadata];
        const $proto = AuAttr.prototype[Symbol.metadata];
        assert.deepStrictEqual($class['au:resource'], CustomAttribute.getDefinition(AuAttr), `$class['au:resource']`);
        assert.deepStrictEqual($class['au:resource:custom-attribute'], CustomAttributeDefinition.create({
            name: 'au-name',
        }, AuAttr), `$class['au:resource:custom-attribute']`);
        assert.strictEqual($proto, void 0, `$proto`);
    });
    it('works with alias property in customAttribute decorator', async function () {
        let created = false;
        let AuAttr = (() => {
            let _classDecorators = [customAttribute({ name: 'au-name', aliases: ['au-alias'] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AuAttr = _classThis = class {
                constructor() { created = true; }
            };
            __setFunctionName(_classThis, "AuAttr");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AuAttr = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AuAttr = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
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
        await startAndStop(App);
        assert.strictEqual(created, true, 'created');
    });
    it('works with aliases static property', async function () {
        let created = false;
        let AuAttr = (() => {
            let _classDecorators = [customAttribute('au-name')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var AuAttr = _classThis = class {
                constructor() { created = true; }
            };
            __setFunctionName(_classThis, "AuAttr");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                AuAttr = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })();
            _classThis.aliases = ['au-alias'];
            (() => {
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return AuAttr = _classThis;
        })();
        let App = (() => {
            let _classDecorators = [customElement({ name: 'app', template: '<div au-alias></div>', dependencies: [AuAttr] })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var App = _classThis = class {
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
        await startAndStop(App);
        assert.strictEqual(created, true, 'created');
    });
});
//# sourceMappingURL=resources.spec.js.map