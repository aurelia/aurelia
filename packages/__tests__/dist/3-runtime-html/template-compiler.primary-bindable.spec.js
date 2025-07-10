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
import { resolve, } from '@aurelia/kernel';
import { assert, TestContext, } from '@aurelia/testing';
import { bindable, bindingBehavior, valueConverter, customAttribute, CustomElement, INode, CustomAttribute, Aurelia, ValueConverter, } from '@aurelia/runtime-html';
import { isNode } from '../util.js';
import { runTasks } from '@aurelia/runtime';
describe('3-runtime-html/template-compiler.primary-bindable.spec.ts', function () {
    const testCases = [
        {
            title: '(1) works in basic scenario',
            template: '<div square="red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute('square')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.color = __runInitializers(this, _color_initializers, void 0);
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        {
            title: '(2) works in basic scenario, with [primary] 1st position',
            template: '<div square="red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute('square')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.color = __runInitializers(this, _color_initializers, void 0);
                            this.diameter = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _diameter_initializers, void 0));
                            this.el = (__runInitializers(this, _diameter_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                            assert.strictEqual(this.diameter, undefined, 'diameter === undefined');
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _color_decorators = [bindable({ primary: true })];
                        _diameter_decorators = [bindable()];
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        {
            title: '(3) works in basic scenario, with [primary] 2nd position',
            template: '<div square="red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute('square')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.diameter = __runInitializers(this, _diameter_initializers, void 0);
                            this.color = (__runInitializers(this, _diameter_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                            assert.strictEqual(this.diameter, undefined, 'diameter === undefined');
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _diameter_decorators = [bindable()];
                        _color_decorators = [bindable({ primary: true })];
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        {
            title: '(4) works in basic scenario, [dynamic options style]',
            template: '<div square="color: red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.color = __runInitializers(this, _color_initializers, void 0);
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        {
            title: '(5) works in basic scenario, [dynamic options style] + [primary] 1st position',
            template: '<div square="color: red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.color = __runInitializers(this, _color_initializers, void 0);
                            this.diameter = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _diameter_initializers, void 0));
                            this.el = (__runInitializers(this, _diameter_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                            assert.strictEqual(this.diameter, undefined);
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _color_decorators = [bindable({ primary: true })];
                        _diameter_decorators = [bindable()];
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        {
            title: '(6) works in basic scenario, [dynamic options style] + [primary] 2nd position',
            template: '<div square="color: red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.diameter = __runInitializers(this, _diameter_initializers, void 0);
                            this.color = (__runInitializers(this, _diameter_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _diameter_decorators = [bindable()];
                        _color_decorators = [bindable({ primary: true })];
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        {
            title: '(7) works with interpolation',
            template: `<div square="color: \${\`red\`}; diameter: \${5}"></div>`,
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.diameter = __runInitializers(this, _diameter_initializers, void 0);
                            this.color = (__runInitializers(this, _diameter_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.background = this.color;
                            this.el.style.width = this.el.style.height = `${this.diameter}px`;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _diameter_decorators = [bindable()];
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp, _attrs) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
                assert.equal(host.querySelector('div').style.width, '5px');
            }
        },
        {
            title: '(8) default to "value" as primary bindable',
            template: '<div square.bind="color || `red`">',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({ name: 'square' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var Square = _classThis = class {
                        constructor() {
                            this.el = resolve(INode);
                        }
                        binding() {
                            this.el.style.background = this.value;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host, _comp) => {
                assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
            }
        },
        ...[
            'color | identity: value',
            '`literal:literal`',
            'color & bb:value',
        ].map((expression, idx) => {
            return {
                title: `(${8 + idx + 1}) does not get interpreted as multi bindings when there is a binding command with colon in value: ${expression}`,
                template: `<div square.bind="${expression}">`,
                attrResources: () => {
                    let Square = (() => {
                        let _classDecorators = [customAttribute({ name: 'square' })];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var Square = _classThis = class {
                            constructor() {
                                this.el = resolve(INode);
                            }
                            binding() {
                                const value = this.value === 'literal:literal' ? 'red' : this.value;
                                this.el.style.background = value;
                            }
                        };
                        __setFunctionName(_classThis, "Square");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Square = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Square = _classThis;
                    })();
                    let Identity = (() => {
                        let _classDecorators = [valueConverter('identity')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var Identity = _classThis = class {
                            toView(val, alternativeValue) {
                                return alternativeValue || val;
                            }
                        };
                        __setFunctionName(_classThis, "Identity");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Identity = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Identity = _classThis;
                    })();
                    let BB = (() => {
                        let _classDecorators = [bindingBehavior('bb')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var BB = _classThis = class {
                            bind() { }
                            unbind() { }
                        };
                        __setFunctionName(_classThis, "BB");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            BB = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return BB = _classThis;
                    })();
                    return [Square, Identity, BB];
                },
                root: class App {
                    constructor() {
                        this.color = 'red';
                    }
                },
                assertFn: (_ctx, host, _comp) => {
                    assert.equal(host.querySelector('div').style.backgroundColor, 'red', 'background === red');
                }
            };
        }),
        // unhappy usage
        {
            title: 'throws when combining binding commnd with interpolation',
            template: `<div square="color.bind: \${\`red\`}; diameter: \${5}"></div>`,
            testWillThrow: true,
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.diameter = __runInitializers(this, _diameter_initializers, void 0);
                            this.color = (__runInitializers(this, _diameter_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _diameter_decorators = [bindable()];
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, _host, _comp, _attrs) => {
                throw new Error('Should not have run');
            }
        },
        {
            title: 'throws when there are two primaries',
            template: '<div square="red"></div>',
            testWillThrow: true,
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.diameter = __runInitializers(this, _diameter_initializers, void 0);
                            this.color = (__runInitializers(this, _diameter_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _diameter_decorators = [bindable({ primary: true })];
                        _color_decorators = [bindable({ primary: true })];
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, _host, _comp, _attrs) => {
                throw new Error('Should not have run');
            }
        },
        {
            title: 'works with long name, in single binding syntax',
            template: '<div square="5"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _borderRadius_decorators;
                    let _borderRadius_initializers = [];
                    let _borderRadius_extraInitializers = [];
                    let _diameter_decorators;
                    let _diameter_initializers = [];
                    let _diameter_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.borderRadius = __runInitializers(this, _borderRadius_initializers, void 0);
                            this.diameter = (__runInitializers(this, _borderRadius_extraInitializers), __runInitializers(this, _diameter_initializers, void 0));
                            this.color = (__runInitializers(this, _diameter_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.borderRadius = `${this.borderRadius || 0}px`;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _borderRadius_decorators = [bindable({ primary: true })];
                        _diameter_decorators = [bindable()];
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _borderRadius_decorators, { kind: "field", name: "borderRadius", static: false, private: false, access: { has: obj => "borderRadius" in obj, get: obj => obj.borderRadius, set: (obj, value) => { obj.borderRadius = value; } }, metadata: _metadata }, _borderRadius_initializers, _borderRadius_extraInitializers);
                        __esDecorate(null, null, _diameter_decorators, { kind: "field", name: "diameter", static: false, private: false, access: { has: obj => "diameter" in obj, get: obj => obj.diameter, set: (obj, value) => { obj.diameter = value; } }, metadata: _metadata }, _diameter_initializers, _diameter_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host) => {
                assert.strictEqual(host.querySelector('div').style.borderRadius, '5px');
            }
        },
        {
            title: 'works with long name, in multi binding syntax',
            template: '<div square="border-radius: 5; color: red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _borderRadius_decorators;
                    let _borderRadius_initializers = [];
                    let _borderRadius_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.borderRadius = __runInitializers(this, _borderRadius_initializers, void 0);
                            this.color = (__runInitializers(this, _borderRadius_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.borderRadius = `${this.borderRadius || 0}px`;
                            this.el.style.color = this.color;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _borderRadius_decorators = [bindable({ primary: true })];
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _borderRadius_decorators, { kind: "field", name: "borderRadius", static: false, private: false, access: { has: obj => "borderRadius" in obj, get: obj => obj.borderRadius, set: (obj, value) => { obj.borderRadius = value; } }, metadata: _metadata }, _borderRadius_initializers, _borderRadius_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host) => {
                const divEl = host.querySelector('div');
                assert.strictEqual(divEl.style.borderRadius, '5px');
                assert.strictEqual(divEl.style.color, 'red');
            }
        },
        {
            title: 'works with long name, in multi binding syntax + with binding command',
            template: '<div square="border-radius.bind: 5; color: red"></div>',
            attrResources: () => {
                let Square = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'square'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _borderRadius_decorators;
                    let _borderRadius_initializers = [];
                    let _borderRadius_extraInitializers = [];
                    let _color_decorators;
                    let _color_initializers = [];
                    let _color_extraInitializers = [];
                    var Square = _classThis = class {
                        constructor() {
                            this.borderRadius = __runInitializers(this, _borderRadius_initializers, void 0);
                            this.color = (__runInitializers(this, _borderRadius_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                            this.el = (__runInitializers(this, _color_extraInitializers), resolve(INode));
                        }
                        binding() {
                            this.el.style.borderRadius = `${this.borderRadius || 0}px`;
                            this.el.style.color = this.color;
                        }
                    };
                    __setFunctionName(_classThis, "Square");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _borderRadius_decorators = [bindable({ primary: true })];
                        _color_decorators = [bindable()];
                        __esDecorate(null, null, _borderRadius_decorators, { kind: "field", name: "borderRadius", static: false, private: false, access: { has: obj => "borderRadius" in obj, get: obj => obj.borderRadius, set: (obj, value) => { obj.borderRadius = value; } }, metadata: _metadata }, _borderRadius_initializers, _borderRadius_extraInitializers);
                        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Square = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Square = _classThis;
                })();
                return [Square];
            },
            assertFn: (_ctx, host) => {
                const divEl = host.querySelector('div');
                assert.strictEqual(divEl.style.borderRadius, '5px');
                assert.strictEqual(divEl.style.color, 'red');
            }
        },
    ];
    for (const testCase of testCases) {
        const { title, template, root, attrResources = () => [], resources = [], only, assertFn, testWillThrow } = testCase;
        // if (!PLATFORM.isBrowserLike && browserOnly) {
        //   continue;
        // }
        const suit = (_title, fn) => only
            // eslint-disable-next-line mocha/no-exclusive-tests
            ? it.only(_title, fn)
            : it(_title, fn);
        suit(title, async function () {
            let body;
            let host;
            try {
                const ctx = TestContext.create();
                const App = CustomElement.define({ name: 'app', template }, root);
                const au = new Aurelia(ctx.container);
                const attrs = typeof attrResources === 'function' ? attrResources() : attrResources;
                body = ctx.doc.body;
                host = body.appendChild(ctx.createElement('app'));
                ctx.container.register(...resources, ...attrs);
                let component;
                try {
                    au.app({ host, component: App });
                    await au.start();
                    component = au.root.controller.viewModel;
                }
                catch (ex) {
                    if (testWillThrow) {
                        // dont try to assert anything on throw
                        // just bails
                        try {
                            await au.stop();
                        }
                        catch { /* and ignore all errors trying to stop */ }
                        return;
                    }
                    throw ex;
                }
                if (testWillThrow) {
                    throw new Error('Expected test to throw, but did NOT');
                }
                await assertFn(ctx, host, component, attrs);
                await au.stop();
                au.dispose();
                // await assertFn_AfterDestroy(ctx, host, component);
            }
            finally {
                if (host) {
                    host.remove();
                }
                if (body) {
                    body.focus();
                }
            }
        });
    }
    describe('mimic vCurrent route-href', function () {
        let $RouteHref$ = (() => {
            var _a;
            let _params_decorators;
            let _params_initializers = [];
            let _params_extraInitializers = [];
            let _href_decorators;
            let _href_initializers = [];
            let _href_extraInitializers = [];
            let _route_decorators;
            let _route_initializers = [];
            let _route_extraInitializers = [];
            return _a = class $RouteHref$ {
                    constructor(el) {
                        this.el = el;
                        this.params = __runInitializers(this, _params_initializers, void 0);
                        this.href = (__runInitializers(this, _params_extraInitializers), __runInitializers(this, _href_initializers, void 0));
                        this.route = (__runInitializers(this, _href_extraInitializers), __runInitializers(this, _route_initializers, void 0));
                        __runInitializers(this, _route_extraInitializers);
                        this.el = el;
                    }
                    binding() {
                        this.updateAnchor('route');
                    }
                    routeChanged() {
                        this.updateAnchor('route');
                    }
                    paramsChanged() {
                        this.updateAnchor('params');
                    }
                    updateAnchor(property) {
                        this.el.href = `/?${property}=${String(this[property] || '')}`;
                    }
                },
                (() => {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                    _params_decorators = [bindable()];
                    _href_decorators = [bindable()];
                    _route_decorators = [bindable({ primary: true })];
                    __esDecorate(null, null, _params_decorators, { kind: "field", name: "params", static: false, private: false, access: { has: obj => "params" in obj, get: obj => obj.params, set: (obj, value) => { obj.params = value; } }, metadata: _metadata }, _params_initializers, _params_extraInitializers);
                    __esDecorate(null, null, _href_decorators, { kind: "field", name: "href", static: false, private: false, access: { has: obj => "href" in obj, get: obj => obj.href, set: (obj, value) => { obj.href = value; } }, metadata: _metadata }, _href_initializers, _href_extraInitializers);
                    __esDecorate(null, null, _route_decorators, { kind: "field", name: "route", static: false, private: false, access: { has: obj => "route" in obj, get: obj => obj.route, set: (obj, value) => { obj.route = value; } }, metadata: _metadata }, _route_initializers, _route_extraInitializers);
                    if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                })(),
                _a.inject = [INode],
                _a;
        })();
        const RouteHref = CustomAttribute.define('route-href', $RouteHref$);
        const DotConverter = ValueConverter.define({
            // should it throw when defining a value converter with dash in name?
            // name: 'dot-converter'
            name: 'dotConverter'
        }, class $$DotConverter {
            toView(val, replaceWith) {
                return typeof val === 'string' && typeof replaceWith === 'string'
                    ? val.replace(/\./g, replaceWith)
                    : val;
            }
        });
        it('works correctly when binding only route name', async function () {
            const ctx = TestContext.create();
            const App = CustomElement.define({
                name: 'app',
                template: `<a route-href="home.main">Home page</a>`
            });
            const au = new Aurelia(ctx.container);
            const body = ctx.doc.body;
            const host = body.appendChild(ctx.createElement('app'));
            ctx.container.register(RouteHref);
            au.app({ component: App, host });
            await au.start();
            if (isNode()) {
                assert.strictEqual(host.querySelector('a').href, `/?route=home.main`);
            }
            else {
                assert.includes(host.querySelector('a').search, `?route=home.main`);
            }
            await au.stop();
            au.dispose();
            host.remove();
        });
        it('works correctly when using with value converter and a colon', async function () {
            const ctx = TestContext.create();
            const App = CustomElement.define({
                name: 'app',
                template: `<a route-href="\${'home.main' | dotConverter:'--'}">Home page</a>`
            });
            const au = new Aurelia(ctx.container);
            const body = ctx.doc.body;
            const host = body.appendChild(ctx.createElement('app'));
            ctx.container.register(RouteHref, DotConverter);
            au.app({ component: App, host });
            await au.start();
            if (isNode()) {
                assert.strictEqual(host.querySelector('a').href, '/?route=home--main');
            }
            else {
                assert.strictEqual(host.querySelector('a').search, '?route=home--main');
            }
            await au.stop();
            au.dispose();
            host.remove();
        });
        // todo: fix:
        //      + timing issue (change handler is invoked before binding)
        it('works correctly when using multi binding syntax', async function () {
            const ctx = TestContext.create();
            const App = CustomElement.define({
                name: 'app',
                template: `<a route-href="route: home.main; params.bind: { id: appId }">Home page</a>`
            }, class App {
            });
            const au = new Aurelia(ctx.container);
            const body = ctx.doc.body;
            const host = body.appendChild(ctx.createElement('app'));
            ctx.container.register(RouteHref);
            au.app({ component: App, host });
            await au.start();
            const anchorEl = host.querySelector('a');
            if (isNode()) {
                assert.strictEqual(anchorEl.href, '/?route=home.main');
            }
            else {
                assert.strictEqual(anchorEl.search, '?route=home.main');
            }
            const app = au.root.controller.viewModel;
            app.appId = 'appId-appId';
            runTasks();
            if (isNode()) {
                assert.strictEqual(anchorEl.href, '/?params=[object Object]');
            }
            else {
                assert.strictEqual(anchorEl.search, `?params=[object%20Object]`);
            }
            await au.stop();
            au.dispose();
            host.remove();
        });
    });
});
//# sourceMappingURL=template-compiler.primary-bindable.spec.js.map