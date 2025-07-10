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
import { CustomElement, SVGAnalyzer, bindable, customElement, } from '@aurelia/runtime-html';
import { assert, createFixture, PLATFORM, TestContext } from '@aurelia/testing';
import { Registration } from '@aurelia/kernel';
import { runTasks } from '@aurelia/runtime';
import { isNode } from '../util.js';
describe('3-runtime-html/template-compiler.test-apps.spec.ts', function () {
    it('renders fractal tree', async function () {
        if (isNode()) {
            return;
        }
        const ctx = TestContext.create();
        const state = new State();
        Registration.instance(State, state).register(ctx.container);
        ctx.container.register(SVGAnalyzer, createPythagorasElement());
        const { startPromise, appHost, component, tearDown } = createFixture(`<div style='height: 50px;' css='max-width: \${width}px;'>
        <label>Count: \${totalNodes}</label>
      </div>
      <div style='width: 100%; height: calc(100% - 50px);' mousemove.trigger='onMouseMove($event)'>
        <svg>
          <g as-element='pythagoras' level.bind='0' css='transform: \${baseTransform}'></g>
        </svg>
      </div>`, class App {
            static get inject() {
                return [State];
            }
            constructor($state) {
                this.state = $state || state;
                const base = state.baseSize;
                this.totalNodes = 2 ** (MAX_LEVEL + 1) - 1;
                this.baseTransform = `translate(50%, 100%) translate(-${base / 2}px, 0) scale(${base}, ${-base})`;
            }
            onMouseMove({ clientX, clientY }) {
                this.state.mouseMoved(clientX, clientY);
            }
        }, [], true, ctx);
        await startPromise;
        const expectedNodeCount = /* MAX_LEVEL = 6 > 2 ** 7 - 1 nodes */ 2 ** 7 - 1;
        let gNodes = appHost.querySelectorAll('svg g');
        assert.strictEqual(gNodes.length, expectedNodeCount, 'should have rendered 127 <g/>');
        gNodes.forEach((g, idx) => {
            assert.equal(g.getAttribute('transform'), idx === 0 ? null : '');
        });
        component.onMouseMove({ clientX: 50, clientY: 50 });
        runTasks();
        gNodes = appHost.querySelectorAll('svg g');
        assert.strictEqual(gNodes.length, expectedNodeCount, 'should have rendered 127 <g/>');
        gNodes.forEach(g => {
            assert.notEqual(g.getAttribute('transform'), '');
        });
        await tearDown();
    });
    const MAX_LEVEL = 6;
    const BASE_SIZE = 100;
    const DEGREES = 180 / Math.PI;
    class State {
        constructor() {
            this.leftTransform = '';
            this.rightTransform = '';
            this.baseSize = BASE_SIZE;
        }
        mouseMoved(x, y) {
            const height = window.innerHeight;
            const width = window.innerWidth;
            this.update(1 - y / height, x / width);
        }
        update(ratioH, ratioW) {
            const h = 0.8 * ratioH;
            const h2 = h * h;
            const l = 0.01 + 0.98 * ratioW;
            const r = 1 - l;
            const leftScale = Math.sqrt(h2 + l * l);
            const rightScale = Math.sqrt(h2 + r * r);
            const leftRotation = Math.atan2(h, l) * DEGREES;
            const rightRotation = -Math.atan2(h, r) * DEGREES;
            this.leftTransform = `translate(0, 1) scale(${leftScale}) rotate(${leftRotation})`;
            this.rightTransform = `translate(${1 - rightScale}, 1) scale(${rightScale}) rotate(${rightRotation} 1 0)`;
        }
    }
    function createPythagorasElement() {
        const TEMPLATE = `<template>
      <svg remove>
        <rect
          x='0'
          y='0'
          width='1'
          height='1'
          fill.bind='fill'></rect>
        <g
          if.bind='renderLeft'
          as-element='pythagoras'
          level.bind='level + 1'
          transform.bind='state.leftTransform'></g>
        <g
          if.bind='renderRight'
          as-element='pythagoras'
          level.bind='level + 1'
          transform.bind='state.rightTransform'></g>
      </svg>
    </template>`;
        const memoizedViridis = (() => {
            const memo = {};
            const key = (lvl, maxlvl) => `${lvl}_${maxlvl}`;
            return (lvl, maxlvl) => {
                const memoKey = key(lvl, maxlvl);
                if (memoKey in memo) {
                    return memo[memoKey];
                }
                else {
                    const random = Math.random().toString(16);
                    return memo[memoKey] = `#${random.substring(random.length - 6)}`;
                }
            };
        })();
        return CustomElement.define({
            name: 'pythagoras',
            template: (() => {
                const parser = PLATFORM.document.createElement('div');
                parser.innerHTML = TEMPLATE;
                const template = parser.firstElementChild;
                const svg = template.content.firstElementChild;
                while (svg.firstChild) {
                    template.content.appendChild(svg.firstChild);
                }
                svg.remove();
                template.remove();
                return template;
            })(),
            bindables: ['level'],
        }, class Pythagoras {
            static get inject() {
                return [State];
            }
            constructor(state) {
                this.state = state;
                this.level = undefined;
                this.fill = '';
                this.renderLeft = this.renderRight = false;
            }
            binding() {
                this.renderLeft = this.renderRight = this.level < MAX_LEVEL;
                this.fill = memoizedViridis(this.level, MAX_LEVEL);
            }
        });
    }
    it('understands local recursive element', async function () {
        let Child = (() => {
            let _classDecorators = [customElement({
                    name: 'child',
                    template: '${v}<child if.bind="v > 0" v.bind="v - 1">'
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _v_decorators;
            let _v_initializers = [];
            let _v_extraInitializers = [];
            var Child = _classThis = class {
                constructor() {
                    this.v = __runInitializers(this, _v_initializers, void 0);
                    __runInitializers(this, _v_extraInitializers);
                }
            };
            __setFunctionName(_classThis, "Child");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                _v_decorators = [bindable];
                __esDecorate(null, null, _v_decorators, { kind: "field", name: "v", static: false, private: false, access: { has: obj => "v" in obj, get: obj => obj.v, set: (obj, value) => { obj.v = value; } }, metadata: _metadata }, _v_initializers, _v_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Child = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Child = _classThis;
        })();
        let Parent = (() => {
            let _classDecorators = [customElement({
                    name: 'parent',
                    template: '<child v.bind="1">',
                    dependencies: [Child]
                })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            var Parent = _classThis = class {
            };
            __setFunctionName(_classThis, "Parent");
            (() => {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                Parent = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            })();
            return Parent = _classThis;
        })();
        const { assertHtml } = createFixture(`<parent></parent>`, class {
        }, [Parent]);
        assertHtml('<parent><child>1<child>0</child></child></parent>', { compact: true });
    });
});
//# sourceMappingURL=template-compiler.test-apps.spec.js.map