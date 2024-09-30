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
import { delegateSyntax } from '@aurelia/compat-v1';
import { kebabCase, } from '@aurelia/kernel';
import { Interpolation, AccessScopeExpression, PrimitiveLiteralExpression, IExpressionParser, ExpressionParser, } from '@aurelia/expression-parser';
import { bindable, BindingMode, customAttribute, CustomAttribute, customElement, CustomElement, CustomElementDefinition, } from '@aurelia/runtime-html';
import { TemplateCompilerHooks, HydrateElementInstruction, InstructionType as HTT, InstructionType as TT, HydrateAttributeInstruction, AttrSyntax, attributePattern, PropertyBindingInstruction, InterpolationInstruction, InstructionType, IteratorBindingInstruction, RefBindingInstruction, AttributeBindingInstruction, SetPropertyInstruction, SpreadValueBindingInstruction, } from '@aurelia/template-compiler';
import { assert, TestContext, verifyBindingInstructionsEqual, } from '@aurelia/testing';
describe('3-runtime-html/template-compiler.spec.ts', function () {
    describe('base assertions', function () {
        let ctx;
        let sut;
        let container;
        beforeEach(function () {
            ctx = TestContext.create();
            container = ctx.container;
            sut = createCompilerWrapper(ctx.templateCompiler);
            sut.resolveResources = false;
            container.register(CustomAttribute.define('foo', class {
            }));
        });
        describe('compileElement()', function () {
            describe('with compilation hooks', function () {
                it('invokes hook before compilation', function () {
                    let i = 0;
                    container.register(TemplateCompilerHooks.define(class {
                        compiling() {
                            i = 1;
                        }
                    }));
                    sut.compile({ template: '<template>' }, container);
                    assert.strictEqual(i, 1);
                });
                it('does not do anything if needsCompile is false', function () {
                    let i = 0;
                    container.register(TemplateCompilerHooks.define(class {
                        compiling() {
                            i = 1;
                        }
                    }));
                    sut.compile({ template: '<template>', needsCompile: false }, container);
                    assert.strictEqual(i, 0);
                });
            });
            describe('with <slot/>', function () {
                it('set hasSlots to true', function () {
                    const definition = compileWith('<template><slot></slot></template>', [], true);
                    assert.strictEqual(definition.hasSlots, true, `definition.hasSlots`);
                });
                it('recognizes slot in nested <template>', function () {
                    const definition = compileWith('<template><template if.bind="true"><slot></slot></template></template>', [], true);
                    assert.strictEqual(definition.hasSlots, true, `definition.hasSlots`);
                });
                it('does not discriminate slot name', function () {
                    const definition = compileWith('<template><slot name="slot"></slot></template>', [], true);
                    assert.strictEqual(definition.hasSlots, true, `definition.hasSlots`);
                });
                // <template> shouldn't be compiled
                it('does not recognize slot in <template> without template controller', function () {
                    const definition = compileWith('<template><template ><slot></slot></template></template>', [], true);
                    assert.strictEqual(definition.hasSlots, false, `definition.hasSlots`);
                });
                it('throws when <slot> is used without shadow dom', function () {
                    assert.throws(() => compileWith('<template><slot></slot></template>', [], false));
                });
            });
            describe('with nested <template> without template controller', function () {
                it('does not compile <template> without template controller', function () {
                    const { instructions } = compileWith(`<template><template>\${prop}</template></template>`, []);
                    assert.deepStrictEqual(instructions, [], `definition.instructions`);
                });
            });
            describe('with custom element', function () {
                describe('compiles surrogate', function () {
                    it('compiles surrogate plain class attribute', function () {
                        const { instructions, surrogates } = compileWith(`<template class="h-100"></template>`, []);
                        verifyInstructions(instructions, []);
                        verifyInstructions(surrogates, [{ toVerify: ['type', 'value'], type: HTT.setClassAttribute, value: 'h-100' }]);
                    });
                    it('compiles surrogate plain style attribute', function () {
                        const { instructions, surrogates } = compileWith(`<template style="background: red"></template>`, []);
                        verifyInstructions(instructions, []);
                        verifyInstructions(surrogates, [{ toVerify: ['type', 'value'], type: HTT.setStyleAttribute, value: 'background: red' }]);
                    });
                    it('compiles surrogate with binding expression', function () {
                        const { instructions, surrogates } = compileWith(`<template class.bind="base"></template>`, []);
                        verifyInstructions(instructions, [], 'normal');
                        verifyInstructions(surrogates, [{ toVerify: ['type', 'to'], type: TT.propertyBinding, to: 'class' }], 'surrogate');
                    });
                    it('compiles surrogate with interpolation expression', function () {
                        const { instructions, surrogates } = compileWith(`<template class="h-100 \${base}"></template>`, []);
                        verifyInstructions(instructions, [], 'normal');
                        verifyInstructions(surrogates, [{ toVerify: ['type', 'to'], type: TT.interpolation, to: 'class' }], 'surrogate');
                    });
                    it('throws on attributes that require to be unique', function () {
                        const attrs = ['id'];
                        attrs.forEach(attr => {
                            assert.throws(() => compileWith(`<template ${attr}="${attr}"></template>`, []), /(Attribute id is invalid on surrogate)|(AUR0702:id)/);
                        });
                    });
                    it('does not create a prop binding when attribute value is an empty string', function () {
                        const { instructions, surrogates } = compileWith(`<template foo>hello</template>`);
                        verifyInstructions(instructions, [], 'normal');
                        verifyInstructions(surrogates, [
                            { toVerify: ['type', 'to', 'res', 'props'], type: TT.hydrateAttribute, res: 'foo', props: [] }
                        ], 'surrogate');
                    });
                    it('compiles surrogate with interpolation binding + custom attribute', function () {
                        const { instructions, surrogates } = compileWith(`<template foo="\${bar}">hello</template>`);
                        verifyInstructions(instructions, [], 'normal');
                        verifyInstructions(surrogates, [
                            { toVerify: ['type', 'to', 'props'], type: TT.hydrateAttribute, res: 'foo', props: [
                                    new InterpolationInstruction(new Interpolation(['', ''], [new AccessScopeExpression('bar')]), 'value')
                                ] }
                        ], 'surrogate');
                    });
                });
                it('understands attr precendence: element prop > custom attr', function () {
                    let El = (() => {
                        let _classDecorators = [customElement('el')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _prop1_decorators;
                        let _prop1_initializers = [];
                        let _prop1_extraInitializers = [];
                        let _prop2_decorators;
                        let _prop2_initializers = [];
                        let _prop2_extraInitializers = [];
                        let _prop3_decorators;
                        let _prop3_initializers = [];
                        let _prop3_extraInitializers = [];
                        var El = _classThis = class {
                            constructor() {
                                this.prop1 = __runInitializers(this, _prop1_initializers, void 0);
                                this.prop2 = (__runInitializers(this, _prop1_extraInitializers), __runInitializers(this, _prop2_initializers, void 0));
                                this.prop3 = (__runInitializers(this, _prop2_extraInitializers), __runInitializers(this, _prop3_initializers, void 0));
                                __runInitializers(this, _prop3_extraInitializers);
                            }
                        };
                        __setFunctionName(_classThis, "El");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _prop1_decorators = [bindable()];
                            _prop2_decorators = [bindable()];
                            _prop3_decorators = [bindable()];
                            __esDecorate(null, null, _prop1_decorators, { kind: "field", name: "prop1", static: false, private: false, access: { has: obj => "prop1" in obj, get: obj => obj.prop1, set: (obj, value) => { obj.prop1 = value; } }, metadata: _metadata }, _prop1_initializers, _prop1_extraInitializers);
                            __esDecorate(null, null, _prop2_decorators, { kind: "field", name: "prop2", static: false, private: false, access: { has: obj => "prop2" in obj, get: obj => obj.prop2, set: (obj, value) => { obj.prop2 = value; } }, metadata: _metadata }, _prop2_initializers, _prop2_extraInitializers);
                            __esDecorate(null, null, _prop3_decorators, { kind: "field", name: "prop3", static: false, private: false, access: { has: obj => "prop3" in obj, get: obj => obj.prop3, set: (obj, value) => { obj.prop3 = value; } }, metadata: _metadata }, _prop3_initializers, _prop3_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            El = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return El = _classThis;
                    })();
                    let Prop3 = (() => {
                        let _classDecorators = [customAttribute('prop3')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        var Prop3 = _classThis = class {
                        };
                        __setFunctionName(_classThis, "Prop3");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Prop3 = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return Prop3 = _classThis;
                    })();
                    const actual = compileWith(`<template>
            <el prop1.bind="p" prop2.bind="p" prop3.bind="t" prop3="t"></el>
          </template>`, [El, Prop3]);
                    // only 1 target
                    assert.strictEqual(actual.instructions.length, 1, `actual.instructions.length`);
                    // the target has only 1 instruction, which is hydrate custom element <el>
                    assert.strictEqual(actual.instructions[0].length, 1, `actual.instructions[0].length`);
                    const rootInstructions = actual.instructions[0][0]['props'];
                    const expectedRootInstructions = [
                        { toVerify: ['type', 'res', 'to'], type: TT.propertyBinding, to: 'prop1' },
                        { toVerify: ['type', 'res', 'to'], type: TT.propertyBinding, to: 'prop2' },
                        { toVerify: ['type', 'res', 'to'], type: TT.propertyBinding, to: 'prop3' },
                        { toVerify: ['type', 'res', 'to'], type: TT.setProperty, to: 'prop3' }
                    ];
                    verifyInstructions(rootInstructions, expectedRootInstructions);
                });
                it('distinguishes element properties / normal attributes', function () {
                    let El = (() => {
                        let _classDecorators = [customElement('el')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _name_decorators;
                        let _name_initializers = [];
                        let _name_extraInitializers = [];
                        var El = _classThis = class {
                            constructor() {
                                this.name = __runInitializers(this, _name_initializers, void 0);
                                __runInitializers(this, _name_extraInitializers);
                            }
                        };
                        __setFunctionName(_classThis, "El");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _name_decorators = [bindable()];
                            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            El = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return El = _classThis;
                    })();
                    const actual = compileWith(`<template>
            <el name="name" name2="label"></el>
          </template>`, [El]);
                    const rootInstructions = actual.instructions[0];
                    const expectedRootInstructions = [
                        { toVerify: ['type', 'res'], type: TT.hydrateElement, res: 'el' }
                    ];
                    verifyInstructions(rootInstructions, expectedRootInstructions);
                    const expectedElInstructions = [
                        { toVerify: ['type', 'to', 'value'], type: TT.setProperty, to: 'name', value: 'name' }
                    ];
                    verifyInstructions(rootInstructions[0].props, expectedElInstructions);
                });
                it('understands element property casing', function () {
                    let El = (() => {
                        let _classDecorators = [customElement('el')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _backgroundColor_decorators;
                        let _backgroundColor_initializers = [];
                        let _backgroundColor_extraInitializers = [];
                        var El = _classThis = class {
                            constructor() {
                                this.backgroundColor = __runInitializers(this, _backgroundColor_initializers, void 0);
                                __runInitializers(this, _backgroundColor_extraInitializers);
                            }
                        };
                        __setFunctionName(_classThis, "El");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _backgroundColor_decorators = [bindable()];
                            __esDecorate(null, null, _backgroundColor_decorators, { kind: "field", name: "backgroundColor", static: false, private: false, access: { has: obj => "backgroundColor" in obj, get: obj => obj.backgroundColor, set: (obj, value) => { obj.backgroundColor = value; } }, metadata: _metadata }, _backgroundColor_initializers, _backgroundColor_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            El = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return El = _classThis;
                    })();
                    const actual = compileWith(`<template>
            <el background-color="label"></el>
          </template>`, [El]);
                    const rootInstructions = actual.instructions[0];
                    const expectedElInstructions = [
                        { toVerify: ['type', 'value', 'to'], type: TT.setProperty, value: 'label', to: 'backgroundColor' },
                    ];
                    verifyInstructions(rootInstructions[0].props, expectedElInstructions);
                });
                it('understands binding commands', function () {
                    let El = (() => {
                        let _classDecorators = [customElement('el')];
                        let _classDescriptor;
                        let _classExtraInitializers = [];
                        let _classThis;
                        let _propProp1_decorators;
                        let _propProp1_initializers = [];
                        let _propProp1_extraInitializers = [];
                        let _prop2_decorators;
                        let _prop2_initializers = [];
                        let _prop2_extraInitializers = [];
                        let _propProp3_decorators;
                        let _propProp3_initializers = [];
                        let _propProp3_extraInitializers = [];
                        let _prop4_decorators;
                        let _prop4_initializers = [];
                        let _prop4_extraInitializers = [];
                        let _propProp5_decorators;
                        let _propProp5_initializers = [];
                        let _propProp5_extraInitializers = [];
                        var El = _classThis = class {
                            constructor() {
                                this.propProp1 = __runInitializers(this, _propProp1_initializers, void 0);
                                this.prop2 = (__runInitializers(this, _propProp1_extraInitializers), __runInitializers(this, _prop2_initializers, void 0));
                                this.propProp3 = (__runInitializers(this, _prop2_extraInitializers), __runInitializers(this, _propProp3_initializers, void 0));
                                this.prop4 = (__runInitializers(this, _propProp3_extraInitializers), __runInitializers(this, _prop4_initializers, void 0));
                                this.propProp5 = (__runInitializers(this, _prop4_extraInitializers), __runInitializers(this, _propProp5_initializers, void 0));
                                __runInitializers(this, _propProp5_extraInitializers);
                            }
                        };
                        __setFunctionName(_classThis, "El");
                        (() => {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                            _propProp1_decorators = [bindable({ mode: BindingMode.twoWay })];
                            _prop2_decorators = [bindable()];
                            _propProp3_decorators = [bindable()];
                            _prop4_decorators = [bindable()];
                            _propProp5_decorators = [bindable()];
                            __esDecorate(null, null, _propProp1_decorators, { kind: "field", name: "propProp1", static: false, private: false, access: { has: obj => "propProp1" in obj, get: obj => obj.propProp1, set: (obj, value) => { obj.propProp1 = value; } }, metadata: _metadata }, _propProp1_initializers, _propProp1_extraInitializers);
                            __esDecorate(null, null, _prop2_decorators, { kind: "field", name: "prop2", static: false, private: false, access: { has: obj => "prop2" in obj, get: obj => obj.prop2, set: (obj, value) => { obj.prop2 = value; } }, metadata: _metadata }, _prop2_initializers, _prop2_extraInitializers);
                            __esDecorate(null, null, _propProp3_decorators, { kind: "field", name: "propProp3", static: false, private: false, access: { has: obj => "propProp3" in obj, get: obj => obj.propProp3, set: (obj, value) => { obj.propProp3 = value; } }, metadata: _metadata }, _propProp3_initializers, _propProp3_extraInitializers);
                            __esDecorate(null, null, _prop4_decorators, { kind: "field", name: "prop4", static: false, private: false, access: { has: obj => "prop4" in obj, get: obj => obj.prop4, set: (obj, value) => { obj.prop4 = value; } }, metadata: _metadata }, _prop4_initializers, _prop4_extraInitializers);
                            __esDecorate(null, null, _propProp5_decorators, { kind: "field", name: "propProp5", static: false, private: false, access: { has: obj => "propProp5" in obj, get: obj => obj.propProp5, set: (obj, value) => { obj.propProp5 = value; } }, metadata: _metadata }, _propProp5_initializers, _propProp5_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            El = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        })();
                        return El = _classThis;
                    })();
                    const actual = compileWith(`<template>
            <el
              prop-prop1.bind="prop1"
              prop2.one-time="prop2"
              prop-prop3.to-view="prop3"
              prop4.from-view="prop4"
              prop-prop5.two-way="prop5"
              ></el>
          </template>`, [El]);
                    const rootInstructions = actual.instructions[0];
                    const expectedElInstructions = [
                        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.twoWay, to: 'propProp1' },
                        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.oneTime, to: 'prop2' },
                        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.toView, to: 'propProp3' },
                        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.fromView, to: 'prop4' },
                        { toVerify: ['type', 'mode', 'to'], mode: BindingMode.twoWay, to: 'propProp5' },
                    ].map((e) => {
                        e.type = TT.propertyBinding;
                        return e;
                    });
                    verifyInstructions(rootInstructions[0].props, expectedElInstructions);
                });
                it('enables binding commands to override custom attribute', function () {
                    const { template, instructions } = compileWith(`<el foo.trigger="1">`, [CustomAttribute.define('foo', class {
                        })]);
                    assertTemplateHtml(template, '<!--au*--><el></el>');
                    verifyInstructions(instructions[0], [
                        { toVerify: ['type', 'from', 'to', 'capture'],
                            type: TT.listenerBinding,
                            from: new PrimitiveLiteralExpression(1),
                            to: 'foo',
                            capture: false
                        },
                    ]);
                });
                describe('with template controller', function () {
                    it('compiles', function () {
                        let Prop = (() => {
                            let _classDecorators = [customAttribute({
                                    name: 'prop',
                                    isTemplateController: true
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            var Prop = _classThis = class {
                            };
                            __setFunctionName(_classThis, "Prop");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Prop = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Prop = _classThis;
                        })();
                        const { template, instructions } = compileWith(`<template><el prop.bind="p"></el></template>`, [Prop]);
                        assert.strictEqual(template.outerHTML, '<template><!--au*--><!--au-start--><!--au-end--></template>', `(template as HTMLTemplateElement).outerHTML`);
                        const [hydratePropAttrInstruction] = instructions[0];
                        assert.strictEqual(hydratePropAttrInstruction.def.template.outerHTML, '<template><el></el></template>', `(hydratePropAttrInstruction.def.template as HTMLTemplateElement).outerHTML`);
                    });
                    it('moves attrbiutes instructions before the template controller into it', function () {
                        let Prop = (() => {
                            let _classDecorators = [customAttribute({
                                    name: 'prop',
                                    isTemplateController: true
                                })];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            var Prop = _classThis = class {
                            };
                            __setFunctionName(_classThis, "Prop");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Prop = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Prop = _classThis;
                        })();
                        const { template, instructions } = compileWith(`<template><el name.bind="name" title.bind="title" prop.bind="p"></el></template>`, [Prop]);
                        assert.strictEqual(template.outerHTML, '<template><!--au*--><!--au-start--><!--au-end--></template>', `(template as HTMLTemplateElement).outerHTML`);
                        const [hydratePropAttrInstruction] = instructions[0];
                        verifyInstructions(hydratePropAttrInstruction.props, [
                            {
                                toVerify: ['type', 'to', 'from'],
                                type: TT.propertyBinding, to: 'value', from: new AccessScopeExpression('p')
                            }
                        ]);
                        verifyInstructions(hydratePropAttrInstruction.def.instructions[0], [
                            {
                                toVerify: ['type', 'to', 'from'],
                                type: TT.propertyBinding, to: 'name', from: new AccessScopeExpression('name')
                            },
                            {
                                toVerify: ['type', 'to', 'from'],
                                type: TT.propertyBinding, to: 'title', from: new AccessScopeExpression('title')
                            },
                        ]);
                    });
                    describe('[as-element]', function () {
                        it('understands [as-element]', function () {
                            let NotDiv = (() => {
                                let _classDecorators = [customElement('not-div')];
                                let _classDescriptor;
                                let _classExtraInitializers = [];
                                let _classThis;
                                var NotDiv = _classThis = class {
                                };
                                __setFunctionName(_classThis, "NotDiv");
                                (() => {
                                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                    NotDiv = _classThis = _classDescriptor.value;
                                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                    __runInitializers(_classThis, _classExtraInitializers);
                                })();
                                return NotDiv = _classThis;
                            })();
                            const { instructions } = compileWith('<template><div as-element="not-div"></div></template>', [NotDiv]);
                            verifyInstructions(instructions[0], [
                                {
                                    toVerify: ['type', 'res'],
                                    type: TT.hydrateElement, res: 'not-div'
                                }
                            ]);
                        });
                        it('does not throw when element is not found', function () {
                            const { instructions } = compileWith('<template><div as-element="not-div"></div></template>');
                            assert.strictEqual(instructions.length, 0, `instructions.length`);
                        });
                        describe('with template controller', function () {
                            it('compiles', function () {
                                let NotDiv = (() => {
                                    let _classDecorators = [customElement('not-div')];
                                    let _classDescriptor;
                                    let _classExtraInitializers = [];
                                    let _classThis;
                                    var NotDiv = _classThis = class {
                                    };
                                    __setFunctionName(_classThis, "NotDiv");
                                    (() => {
                                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                        NotDiv = _classThis = _classDescriptor.value;
                                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                        __runInitializers(_classThis, _classExtraInitializers);
                                    })();
                                    return NotDiv = _classThis;
                                })();
                                const { instructions } = compileWith('<template><div if.bind="value" as-element="not-div"></div></template>', [NotDiv]);
                                verifyInstructions(instructions[0], [
                                    {
                                        toVerify: ['type', 'res', 'to'],
                                        type: TT.hydrateTemplateController, res: 'if'
                                    }
                                ]);
                                const templateControllerInst = instructions[0][0];
                                verifyInstructions(templateControllerInst.props, [
                                    {
                                        toVerify: ['type', 'to', 'from'],
                                        type: TT.propertyBinding, to: 'value', from: new AccessScopeExpression('value')
                                    }
                                ]);
                                const [hydrateNotDivInstruction] = templateControllerInst.def.instructions[0];
                                verifyInstructions([hydrateNotDivInstruction], [
                                    {
                                        toVerify: ['type', 'res'],
                                        type: TT.hydrateElement, res: 'not-div'
                                    }
                                ]);
                                verifyInstructions(hydrateNotDivInstruction.props, []);
                            });
                        });
                    });
                });
                describe('<let/> element', function () {
                    it('compiles', function () {
                        const { template, instructions } = compileWith(`<template><let></let></template>`);
                        assert.strictEqual(instructions.length, 1, `instructions.length`);
                        assert.strictEqual(template.outerHTML, '<template><!--au*--><let></let></template>');
                    });
                    it('does not generate instructions when there is no bindings', function () {
                        const { instructions } = compileWith(`<template><let></let></template>`);
                        assert.strictEqual(instructions[0][0].instructions.length, 0, `(instructions[0][0]).instructions.length`);
                    });
                    it('ignores custom element resource', function () {
                        let Let = (() => {
                            let _classDecorators = [customElement('let')];
                            let _classDescriptor;
                            let _classExtraInitializers = [];
                            let _classThis;
                            var Let = _classThis = class {
                            };
                            __setFunctionName(_classThis, "Let");
                            (() => {
                                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                                Let = _classThis = _classDescriptor.value;
                                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                                __runInitializers(_classThis, _classExtraInitializers);
                            })();
                            return Let = _classThis;
                        })();
                        const { instructions } = compileWith(`<template><let></let></template>`, [Let]);
                        verifyInstructions(instructions[0], [
                            { toVerify: ['type'], type: TT.hydrateLetElement }
                        ]);
                    });
                    it('compiles with attributes', function () {
                        const { instructions } = compileWith(`<let a.bind="b" c="\${d}"></let>`);
                        verifyInstructions(instructions[0][0].instructions, [
                            {
                                toVerify: ['type', 'to', 'srcOrExp'],
                                type: TT.letBinding, to: 'a', from: 'b'
                            },
                            {
                                toVerify: ['type', 'to'],
                                type: TT.letBinding, to: 'c'
                            }
                        ]);
                    });
                    describe('[to-binding-context]', function () {
                        it('understands [to-binding-context]', function () {
                            const { instructions } = compileWith(`<template><let to-binding-context></let></template>`);
                            assert.strictEqual(instructions[0][0].toBindingContext, true, `(instructions[0][0]).toBindingContext`);
                        });
                        it('ignores [to-binding-context] order', function () {
                            let instructions = compileWith(`<template><let a.bind="a" to-binding-context></let></template>`).instructions[0];
                            verifyInstructions(instructions, [
                                { toVerify: ['type', 'toBindingContext'], type: TT.hydrateLetElement, toBindingContext: true }
                            ]);
                            instructions = compileWith(`<template><let to-binding-context a.bind="a"></let></template>`).instructions[0];
                            verifyInstructions(instructions, [
                                { toVerify: ['type', 'toBindingContext'], type: TT.hydrateLetElement, toBindingContext: true }
                            ]);
                        });
                    });
                });
                describe('with containerless', function () {
                    it('compiles [containerless] attribute', function () {
                        const { template } = compileWith('<el containerless>', [CustomElement.define({ name: 'el' })]);
                        assertTemplateHtml(template, '<!--au*--><!--au-start--><!--au-end-->');
                    });
                    it('compiles [containerless] after an interpolation', function () {
                        const { template } = compileWith('${message}<el containerless>', [CustomElement.define({ name: 'el' })]);
                        assertTemplateHtml(template, '<!--au*--> <!--au*--><!--au-start--><!--au-end-->');
                    });
                    it('compiles [containerless] before an interpolation', function () {
                        const { template } = compileWith('<el containerless></el>${message}', [CustomElement.define({ name: 'el' })]);
                        assertTemplateHtml(template, '<!--au*--><!--au-start--><!--au-end--><!--au*--> ');
                    });
                    it('compiles [containerless] next to each other', function () {
                        const { template } = compileWith('<el containerless></el><el containerless></el>', [CustomElement.define({ name: 'el' })]);
                        assertTemplateHtml(template, '<!--au*--><!--au-start--><!--au-end-->'.repeat(2));
                    });
                });
            });
            function compileWith(markup, extraResources = [], shadow = false) {
                extraResources.forEach(e => container.register(e));
                const templateDefinition = {
                    template: markup,
                    instructions: [],
                    surrogates: [],
                    shadowOptions: shadow ? { mode: 'open' } : null
                };
                return sut.compile(templateDefinition, container);
            }
            function verifyInstructions(actual, expectation, type) {
                assert.strictEqual(actual.length, expectation.length, `Expected to have ${expectation.length} ${type ? type : ''} instructions. Received: ${actual.length}`);
                for (let i = 0, ii = actual.length; i < ii; ++i) {
                    const actualInst = actual[i];
                    const expectedInst = expectation[i];
                    const ofType = type ? `of ${type}` : '';
                    for (const prop of expectedInst.toVerify) {
                        if (expectedInst[prop] instanceof Object) {
                            assert.deepStrictEqual(actualInst[prop], expectedInst[prop], `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`);
                        }
                        else {
                            assert.deepStrictEqual(actualInst[prop], expectedInst[prop], `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`);
                        }
                    }
                }
            }
        });
        describe('compileSpread', function () {
            it('throws when spreading a template controller', function () {
                let Bar = (() => {
                    let _classDecorators = [customAttribute({ name: 'bar', isTemplateController: true })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var Bar = _classThis = class {
                    };
                    __setFunctionName(_classThis, "Bar");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        Bar = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return Bar = _classThis;
                })();
                container.register(Bar);
                assert.throws(() => sut.compileSpread(CustomElementDefinition.create({ name: 'el', template: '<template></template>' }), [
                    { command: null, target: 'bar', rawValue: '', parts: [], rawName: 'bar' }
                ], container, ctx.doc.createElement('div')));
            });
        });
    });
    const elementInfoLookup = new WeakMap();
    /**
     * Pre-processed information about a custom element resource, optimized
     * for consumption by the template compiler.
     */
    class ElementInfo {
        constructor(name, alias, containerless) {
            this.name = name;
            this.alias = alias;
            this.containerless = containerless;
            /**
             * A lookup of the bindables of this element, indexed by the (pre-processed)
             * attribute names as they would be found in parsed markup.
             */
            this.bindables = Object.create(null);
        }
        static from(def, alias) {
            if (def === null) {
                return null;
            }
            let rec = elementInfoLookup.get(def);
            if (rec === void 0) {
                elementInfoLookup.set(def, rec = Object.create(null));
            }
            let info = rec[alias];
            if (info === void 0) {
                info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
                const bindables = def.bindables;
                const defaultBindingMode = BindingMode.toView;
                let bindable;
                let prop;
                let attr;
                let mode;
                for (prop in bindables) {
                    bindable = bindables[prop];
                    // explicitly provided property name has priority over the implicit property name
                    if (bindable.name !== void 0) {
                        prop = bindable.name;
                    }
                    // explicitly provided attribute name has priority over the derived implicit attribute name
                    if (bindable.attribute !== void 0) {
                        attr = bindable.attribute;
                    }
                    else {
                        // derive the attribute name from the resolved property name
                        attr = kebabCase(prop);
                    }
                    if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                        mode = bindable.mode;
                    }
                    else {
                        mode = defaultBindingMode;
                    }
                    info.bindables[attr] = new BindableInfo(prop, mode);
                }
            }
            return info;
        }
    }
    const attrInfoLookup = new WeakMap();
    /**
     * Pre-processed information about a custom attribute resource, optimized
     * for consumption by the template compiler.
     */
    class AttrInfo {
        constructor(name, alias, isTemplateController, noMultiBindings) {
            this.name = name;
            this.alias = alias;
            this.isTemplateController = isTemplateController;
            this.noMultiBindings = noMultiBindings;
            /**
             * A lookup of the bindables of this attribute, indexed by the (pre-processed)
             * bindable names as they would be found in the attribute value.
             *
             * Only applicable to multi attribute bindings (semicolon-separated).
             */
            this.bindables = Object.create(null);
            /**
             * The single or first bindable of this attribute, or a default 'value'
             * bindable if no bindables were defined on the attribute.
             *
             * Only applicable to single attribute bindings (where the attribute value
             * contains no semicolons)
             */
            this.bindable = null;
        }
        static from(def, alias) {
            if (def === null) {
                return null;
            }
            let rec = attrInfoLookup.get(def);
            if (rec === void 0) {
                attrInfoLookup.set(def, rec = Object.create(null));
            }
            let info = rec[alias];
            if (info === void 0) {
                info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
                const bindables = def.bindables;
                const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
                    ? def.defaultBindingMode
                    : BindingMode.toView;
                let bindable;
                let prop;
                let mode;
                let hasPrimary = false;
                let isPrimary = false;
                let bindableInfo;
                for (prop in bindables) {
                    bindable = bindables[prop];
                    // explicitly provided property name has priority over the implicit property name
                    if (bindable.name !== void 0) {
                        prop = bindable.name;
                    }
                    if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                        mode = bindable.mode;
                    }
                    else {
                        mode = defaultBindingMode;
                    }
                    isPrimary = bindable.primary === true;
                    bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
                    if (isPrimary) {
                        if (hasPrimary) {
                            throw new Error('primary already exists');
                        }
                        hasPrimary = true;
                        info.bindable = bindableInfo;
                    }
                    // set to first bindable by convention
                    if (info.bindable === null) {
                        info.bindable = bindableInfo;
                    }
                }
                // if no bindables are present, default to "value"
                if (info.bindable === null) {
                    info.bindable = new BindableInfo('value', defaultBindingMode);
                }
            }
            return info;
        }
    }
    /**
     * A pre-processed piece of information about a defined bindable property on a custom
     * element or attribute, optimized for consumption by the template compiler.
     */
    class BindableInfo {
        constructor(
        /**
         * The pre-processed *property* (not attribute) name of the bindable, which is
         * (in order of priority):
         *
         * 1. The `property` from the description (if defined)
         * 2. The name of the property of the bindable itself
         */
        propName, 
        /**
         * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
         *
         * 1. The `mode` from the bindable (if defined and not bindingMode.default)
         * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
         * 3. `bindingMode.toView`
         */
        mode) {
            this.propName = propName;
            this.mode = mode;
        }
    }
    describe(`combination assertions`, function () {
        function createFixture(ctx = TestContext.create(), ...globals) {
            const container = ctx.container;
            container.register(...globals, delegateSyntax);
            const sut = createCompilerWrapper(ctx.templateCompiler);
            return { container, sut };
        }
        describe('TemplateCompiler - combinations -- plain attributes', function () {
            for (const debug of [true, false]) {
                it(`[debug: ${debug}] compiles ref`, function () {
                    const { result, createRef } = compileTemplate({ template: '<div ref=el>', debug });
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        needsCompile: false,
                        template: debug
                            ? '<template><!--au*--><div ref="el"></div></template>'
                            : '<template><!--au*--><div></div></template>',
                        instructions: [[createRef('el', 'element')]],
                        type: 'custom-element',
                        surrogates: [],
                        dependencies: [],
                        hasSlots: false,
                    });
                });
                it(`[debug: ${debug}] compiles data-* attributes`, function () {
                    const { result, createPropBinding: createProp, createInterpolation } = compileTemplate({
                        template: '<div data-a="b" data-b.bind="1" data-c="${hey}">',
                        debug
                    });
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        template: debug
                            ? '<template><!--au*--><div data-a="b" data-b.bind="1" data-c="${hey}"></div></template>'
                            : '<template><!--au*--><div data-a="b"></div></template>',
                        needsCompile: false,
                        instructions: [[
                                createProp({ from: '1', to: 'data-b' }),
                                createInterpolation({ from: '${hey}', to: 'data-c' })
                            ]],
                        type: 'custom-element',
                        surrogates: [],
                        dependencies: [],
                        hasSlots: false,
                    });
                });
                it(`[debug: ${debug}] compiles class attribute`, function () {
                    const { result, createAttr, createInterpolation } = compileTemplate({
                        template: '<div d.class="a" class="a ${b} c">',
                        debug
                    });
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        template: debug
                            ? '<template><!--au*--><div d.class="a" class="a ${b} c"></div></template>'
                            : '<template><!--au*--><div></div></template>',
                        needsCompile: false,
                        instructions: [[
                                createAttr({ attr: 'class', from: 'a', to: 'd' }),
                                createInterpolation({ from: 'a ${b} c', to: 'class' })
                            ]],
                        type: 'custom-element',
                        surrogates: [],
                        dependencies: [],
                        hasSlots: false,
                    });
                });
                it(`[debug: ${debug}] compiles style attribute`, function () {
                    const { result, createAttr, createInterpolation } = compileTemplate({
                        template: '<div bg.style="a" style="a ${b} c">',
                        debug
                    });
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        template: debug
                            ? '<template><!--au*--><div bg.style="a" style="a ${b} c"></div></template>'
                            : '<template><!--au*--><div></div></template>',
                        needsCompile: false,
                        instructions: [[
                                createAttr({ attr: 'style', from: 'a', to: 'bg' }),
                                createInterpolation({ from: 'a ${b} c', to: 'style' })
                            ]],
                        type: 'custom-element',
                        surrogates: [],
                        dependencies: [],
                        hasSlots: false,
                    });
                });
            }
        });
        describe('TemplateCompiler - combinations -- custom attributes', function () {
            const MyAttr = CustomAttribute.define('my-attr', class MyAttr {
            });
            it('compiles custom attribute without value', function () {
                const { result } = compileTemplate('<div my-attr>', MyAttr);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><div></div></template>',
                    needsCompile: false,
                    instructions: [[{
                                type: TT.hydrateAttribute,
                                res: CustomAttribute.getDefinition(MyAttr),
                                props: []
                            }]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false,
                });
            });
            it('compiles custom attribute with interpolation', function () {
                const { result, createInterpolation } = compileTemplate('<div my-attr="${attr}">', MyAttr);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><div></div></template>',
                    needsCompile: false,
                    instructions: [[{
                                type: TT.hydrateAttribute,
                                res: CustomAttribute.getDefinition(MyAttr),
                                props: [createInterpolation({ from: '${attr}', to: 'value' })]
                            }]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false,
                });
            });
            it('compiles custom attribute with command', function () {
                const { result, createPropBinding } = compileTemplate('<div my-attr.bind="v">', MyAttr);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><div></div></template>',
                    needsCompile: false,
                    instructions: [[{
                                type: TT.hydrateAttribute,
                                res: CustomAttribute.getDefinition(MyAttr),
                                props: [createPropBinding({ from: 'v', to: 'value' })]
                            }]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false,
                });
            });
            it('compiles attribute on a template element', function () {
                const { result, createPropBinding } = compileTemplate('<template><template my-attr.bind="v">', MyAttr);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><template></template></template>',
                    needsCompile: false,
                    instructions: [[{
                                type: TT.hydrateAttribute,
                                res: CustomAttribute.getDefinition(MyAttr),
                                props: [createPropBinding({ from: 'v', to: 'value' })]
                            }]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false,
                });
            });
        });
        describe('TemplateCompiler - combinations -- custom attributes with multiple bindings', function () {
            var _a, _b, _c, _d;
            const MyAttr = CustomAttribute.define('my-attr', (_a = class MyAttr {
                },
                _a.bindables = ['a', 'b'],
                _a));
            const YourAttr = CustomAttribute.define('your-attr', (_b = class MyAttr {
                },
                _b.bindables = ['c', 'd'],
                _b));
            const NoMultiAttr = CustomAttribute.define({ name: 'no-multi-attr', noMultiBindings: true }, (_c = class {
                },
                _c.bindables = ['a', 'b'],
                _c));
            const TemplateControllerAttr = CustomAttribute.define({ name: 'tc-attr', isTemplateController: true }, class {
            });
            const AttrWithLongBindable = CustomAttribute.define({ name: 'long-attr' }, (_d = class {
                },
                _d.bindables = [{ name: 'a', attribute: 'a-a' }],
                _d));
            it('compiles an attribute with 2 bindings', function () {
                const { result, createPropBinding: createProp } = compileTemplate('<div my-attr="a.bind: 1; b: 2">', MyAttr);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(MyAttr),
                    props: [createProp({ from: '1', to: 'a' }), { type: InstructionType.setProperty, value: '2', to: 'b' }]
                });
            });
            it('compiles multiple attributes with 2 bindings', function () {
                const { result, createPropBinding: createProp } = compileTemplate('<div my-attr="a.bind: 1; b: 2" your-attr="c: 3; d.one-time: 4">', ...[MyAttr, YourAttr]);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(MyAttr),
                    props: [createProp({ from: '1', to: 'a' }), { type: InstructionType.setProperty, value: '2', to: 'b' }]
                });
                verifyBindingInstructionsEqual(result.instructions[0][1], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(YourAttr),
                    props: [{ type: InstructionType.setProperty, value: '3', to: 'c' }, createProp({ from: '4', to: 'd', mode: BindingMode.oneTime })]
                });
            });
            it('compiles attr with interpolation', function () {
                const { result, createInterpolation } = compileTemplate('<div my-attr="${hey}">', MyAttr);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(MyAttr),
                    props: [createInterpolation({ from: '${hey}', to: 'a' })]
                });
            });
            it('compiles multiple binding with interpolation', function () {
                const { result, createInterpolation, createPropBinding: createProp } = compileTemplate('<div my-attr="a: ${hey}; b.bind: 1">', MyAttr);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(MyAttr),
                    props: [createInterpolation({ from: '${hey}', to: 'a' }), createProp({ from: '1', to: 'b' })]
                });
            });
            it('compiles attr with no multi binding', function () {
                const { result, createInterpolation } = compileTemplate('<div no-multi-attr="a: ${hey}; b.bind: 1">', NoMultiAttr);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(NoMultiAttr),
                    props: [createInterpolation({ from: 'a: ${hey}; b.bind: 1', to: 'a' })]
                });
            });
            it('compiles template compiler with interpolation', function () {
                const { result, createInterpolation } = compileTemplate('<div tc-attr="${hey}">', TemplateControllerAttr);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateTemplateController,
                    res: CustomAttribute.getDefinition(TemplateControllerAttr),
                    props: [createInterpolation({ from: '${hey}', to: 'value' })],
                    def: {
                        name: 'unamed',
                        needsCompile: false,
                        template: '<template><div></div></template>',
                        instructions: [],
                        type: 'custom-element',
                    }
                });
            });
            it('compiles attr with long bindable name', function () {
                const { result, createInterpolation } = compileTemplate('<div long-attr="a-a: ${hey}">', AttrWithLongBindable);
                verifyBindingInstructionsEqual(result.instructions[0][0], {
                    type: InstructionType.hydrateAttribute,
                    res: CustomAttribute.getDefinition(AttrWithLongBindable),
                    props: [createInterpolation({ from: '${hey}', to: 'a' })]
                });
            });
        });
        describe('TemplateCompiler - combinations -- nested template controllers (one per element)', function () {
            const Foo = CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo {
            });
            const Bar = CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar {
            });
            const Baz = CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz {
            });
            const Qux = CustomAttribute.define({ name: 'qux', isTemplateController: true }, class Qux {
            });
            it('compiles nested template controller', function () {
                const { result } = compileTemplate('<div foo><div id="2" bar><div id="3" baz><div id="4" qux>', Foo, Bar, Baz, Qux);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    needsCompile: false,
                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                    dependencies: [],
                    surrogates: [],
                    hasSlots: false,
                    type: 'custom-element',
                    instructions: [[{
                                type: InstructionType.hydrateTemplateController,
                                res: CustomAttribute.getDefinition(Foo),
                                props: [],
                                def: {
                                    name: 'unamed',
                                    needsCompile: false,
                                    template: '<template><div><!--au*--><!--au-start--><!--au-end--></div></template>',
                                    instructions: [[{
                                                type: InstructionType.hydrateTemplateController,
                                                res: CustomAttribute.getDefinition(Bar),
                                                props: [],
                                                def: {
                                                    name: 'unamed',
                                                    needsCompile: false,
                                                    template: '<template><div id="2"><!--au*--><!--au-start--><!--au-end--></div></template>',
                                                    type: 'custom-element',
                                                    instructions: [[{
                                                                type: InstructionType.hydrateTemplateController,
                                                                res: CustomAttribute.getDefinition(Baz),
                                                                props: [],
                                                                def: {
                                                                    name: 'unamed',
                                                                    needsCompile: false,
                                                                    template: '<template><div id="3"><!--au*--><!--au-start--><!--au-end--></div></template>',
                                                                    type: 'custom-element',
                                                                    instructions: [[{
                                                                                type: InstructionType.hydrateTemplateController,
                                                                                res: CustomAttribute.getDefinition(Qux),
                                                                                props: [],
                                                                                def: {
                                                                                    name: 'unamed',
                                                                                    template: '<template><div id="4"></div></template>',
                                                                                    needsCompile: false,
                                                                                    instructions: [],
                                                                                    type: 'custom-element',
                                                                                }
                                                                            }]],
                                                                }
                                                            }]],
                                                }
                                            }]],
                                    type: 'custom-element',
                                }
                            }]]
                });
            });
        });
        describe('TemplateCompiler - combinations -- nested template controllers (multiple per element)', function () {
            const Foo = CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo {
            });
            const Bar = CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar {
            });
            const Baz = CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz {
            });
            const Qux = CustomAttribute.define({ name: 'qux', isTemplateController: true }, class Qux {
            });
            const Quux = CustomAttribute.define({ name: 'quux', isTemplateController: true }, class Quux {
            });
            for (const resolveResources of [true, false]) {
                it('compiles multiple nested template controllers per element on normal <div/>s', function () {
                    const { createIterateProp, result } = compileTemplate({
                        template: `<div foo bar.for="i of ii" baz><div qux.for="i of ii" id="2" quux></div>`,
                        resolveResources
                    }, ...[Foo, Bar, Baz, Qux, Quux]);
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                        needsCompile: false,
                        dependencies: [],
                        surrogates: [],
                        hasSlots: false,
                        type: 'custom-element',
                        instructions: [[{
                                    type: InstructionType.hydrateTemplateController,
                                    res: resolveResources ? CustomAttribute.getDefinition(Foo) : 'foo',
                                    props: [],
                                    def: {
                                        name: 'unamed',
                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                        needsCompile: false,
                                        type: 'custom-element',
                                        instructions: [[{
                                                    type: InstructionType.hydrateTemplateController,
                                                    res: resolveResources ? CustomAttribute.getDefinition(Bar) : 'bar',
                                                    props: [createIterateProp('i of ii', 'value', [])],
                                                    def: {
                                                        name: 'unamed',
                                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                        needsCompile: false,
                                                        type: 'custom-element',
                                                        instructions: [[{
                                                                    type: InstructionType.hydrateTemplateController,
                                                                    res: resolveResources ? CustomAttribute.getDefinition(Baz) : 'baz',
                                                                    props: [],
                                                                    def: {
                                                                        name: 'unamed',
                                                                        template: '<template><div><!--au*--><!--au-start--><!--au-end--></div></template>',
                                                                        needsCompile: false,
                                                                        type: 'custom-element',
                                                                        instructions: [[{
                                                                                    type: InstructionType.hydrateTemplateController,
                                                                                    res: resolveResources ? CustomAttribute.getDefinition(Qux) : 'qux',
                                                                                    props: [createIterateProp('i of ii', 'value', [])],
                                                                                    def: {
                                                                                        name: 'unamed',
                                                                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                                                        needsCompile: false,
                                                                                        type: 'custom-element',
                                                                                        instructions: [[{
                                                                                                    type: InstructionType.hydrateTemplateController,
                                                                                                    res: resolveResources ? CustomAttribute.getDefinition(Quux) : 'quux',
                                                                                                    props: [],
                                                                                                    def: {
                                                                                                        name: 'unamed',
                                                                                                        template: '<template><div id="2"></div></template>',
                                                                                                        needsCompile: false,
                                                                                                        instructions: [],
                                                                                                        type: 'custom-element',
                                                                                                    }
                                                                                                }]]
                                                                                    }
                                                                                }]]
                                                                    }
                                                                }]]
                                                    }
                                                }]]
                                    }
                                }]]
                    });
                });
                it('compiles multiple nested template controllers per element on mixed of <template /> + <div/>s', function () {
                    const { createIterateProp, result } = compileTemplate(
                    // need an extra template wrapping as it will be considered surrogates otherwise
                    {
                        template: `<template><template foo bar.for="i of ii" baz><div qux.for="i of ii" id="2" quux></template></template>`,
                        resolveResources
                    }, ...[Foo, Bar, Baz, Qux, Quux]);
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                        needsCompile: false,
                        dependencies: [],
                        surrogates: [],
                        hasSlots: false,
                        type: 'custom-element',
                        instructions: [[{
                                    type: InstructionType.hydrateTemplateController,
                                    res: resolveResources ? CustomAttribute.getDefinition(Foo) : 'foo',
                                    props: [],
                                    def: {
                                        name: 'unamed',
                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                        needsCompile: false,
                                        type: 'custom-element',
                                        instructions: [[{
                                                    type: InstructionType.hydrateTemplateController,
                                                    res: resolveResources ? CustomAttribute.getDefinition(Bar) : 'bar',
                                                    props: [createIterateProp('i of ii', 'value', [])],
                                                    def: {
                                                        name: 'unamed',
                                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                        needsCompile: false,
                                                        type: 'custom-element',
                                                        instructions: [[{
                                                                    type: InstructionType.hydrateTemplateController,
                                                                    res: resolveResources ? CustomAttribute.getDefinition(Baz) : 'baz',
                                                                    props: [],
                                                                    def: {
                                                                        name: 'unamed',
                                                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                                        needsCompile: false,
                                                                        type: 'custom-element',
                                                                        instructions: [[{
                                                                                    type: InstructionType.hydrateTemplateController,
                                                                                    res: resolveResources ? CustomAttribute.getDefinition(Qux) : 'qux',
                                                                                    props: [createIterateProp('i of ii', 'value', [])],
                                                                                    def: {
                                                                                        name: 'unamed',
                                                                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                                                        needsCompile: false,
                                                                                        type: 'custom-element',
                                                                                        instructions: [[{
                                                                                                    type: InstructionType.hydrateTemplateController,
                                                                                                    res: resolveResources ? CustomAttribute.getDefinition(Quux) : 'quux',
                                                                                                    props: [],
                                                                                                    def: {
                                                                                                        name: 'unamed',
                                                                                                        template: '<template><div id="2"></div></template>',
                                                                                                        needsCompile: false,
                                                                                                        instructions: [],
                                                                                                        type: 'custom-element',
                                                                                                    }
                                                                                                }]]
                                                                                    }
                                                                                }]]
                                                                    }
                                                                }]]
                                                    }
                                                }]]
                                    }
                                }]]
                    });
                });
            }
        });
        describe('TemplateCompiler - combinations -- sibling template controllers', function () {
            const Foo = CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo {
            });
            const Bar = CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar {
            });
            const Baz = CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz {
            });
            for (const [otherAttrPosition, appTemplate] of [
                ['before', '<div a.bind="b" foo bar>'],
                ['middle', '<div foo a.bind="b" bar>'],
                ['after', '<div foo bar a.bind="b">'],
            ]) {
                it(`compiles 2 template controller on an elements with another attribute in ${otherAttrPosition}`, function () {
                    const { result, createPropBinding } = compileTemplate(appTemplate, Foo, Bar);
                    verifyBindingInstructionsEqual(result, {
                        name: 'unamed',
                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                        instructions: [[{
                                    type: InstructionType.hydrateTemplateController,
                                    res: CustomAttribute.getDefinition(Foo),
                                    props: [],
                                    def: {
                                        name: 'unamed',
                                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                        needsCompile: false,
                                        type: 'custom-element',
                                        instructions: [[{
                                                    type: InstructionType.hydrateTemplateController,
                                                    res: CustomAttribute.getDefinition(Bar),
                                                    props: [],
                                                    def: {
                                                        name: 'unamed',
                                                        template: '<template><!--au*--><div></div></template>',
                                                        needsCompile: false,
                                                        instructions: [[createPropBinding({ from: 'b', to: 'a' })]],
                                                        type: 'custom-element',
                                                    }
                                                }]],
                                    }
                                }]],
                        type: 'custom-element',
                        surrogates: [],
                        dependencies: [],
                        hasSlots: false,
                        needsCompile: false,
                    });
                });
            }
            it('compiles with multiple controller and different commands on a <div/>', function () {
                const { result, createIterateProp, createPropBinding } = compileTemplate('<div><div foo="" id="1" bar.for="i of ii" baz.bind="e">', Foo, Bar, Baz);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><div><!--au*--><!--au-start--><!--au-end--></div></template>',
                    instructions: [[{
                                // for foo=""
                                name: 'unamed',
                                type: InstructionType.hydrateTemplateController,
                                res: CustomAttribute.getDefinition(Foo),
                                props: [],
                                def: {
                                    name: 'unamed',
                                    type: 'custom-element',
                                    needsCompile: false,
                                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                    instructions: [[{
                                                // for bar.for
                                                type: InstructionType.hydrateTemplateController,
                                                res: CustomAttribute.getDefinition(Bar),
                                                props: [createIterateProp('i of ii', 'value', [])],
                                                def: {
                                                    name: 'unamed',
                                                    type: 'custom-element',
                                                    needsCompile: false,
                                                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                    instructions: [[{
                                                                type: InstructionType.hydrateTemplateController,
                                                                res: CustomAttribute.getDefinition(Baz),
                                                                props: [createPropBinding({ from: 'e', to: 'value' })],
                                                                def: {
                                                                    name: 'unamed',
                                                                    needsCompile: false,
                                                                    template: '<template><div id="1"></div></template>',
                                                                    type: 'custom-element',
                                                                    instructions: [],
                                                                }
                                                            }]]
                                                }
                                            }]]
                                }
                            }]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false,
                    needsCompile: false,
                });
            });
            it('compiles with multiple controller and different commands on a <template/>', function () {
                const { result, createIterateProp, createPropBinding } = compileTemplate('<div><template foo="" id="1" bar.for="i of ii" baz.bind="e">', Foo, Bar, Baz);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><div><!--au*--><!--au-start--><!--au-end--></div></template>',
                    instructions: [[{
                                // for foo=""
                                name: 'unamed',
                                type: InstructionType.hydrateTemplateController,
                                res: CustomAttribute.getDefinition(Foo),
                                props: [],
                                def: {
                                    name: 'unamed',
                                    type: 'custom-element',
                                    needsCompile: false,
                                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                    instructions: [[{
                                                // for bar.for
                                                name: 'unamed',
                                                type: InstructionType.hydrateTemplateController,
                                                res: CustomAttribute.getDefinition(Bar),
                                                props: [createIterateProp('i of ii', 'value', [])],
                                                def: {
                                                    name: 'unamed',
                                                    type: 'custom-element',
                                                    needsCompile: false,
                                                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                                                    instructions: [[{
                                                                name: 'unamed',
                                                                type: InstructionType.hydrateTemplateController,
                                                                res: CustomAttribute.getDefinition(Baz),
                                                                props: [createPropBinding({ from: 'e', to: 'value', mode: 2 })],
                                                                def: {
                                                                    name: 'unamed',
                                                                    type: 'custom-element',
                                                                    needsCompile: false,
                                                                    template: '<template id="1"></template>',
                                                                    instructions: []
                                                                }
                                                            }]]
                                                }
                                            }]]
                                }
                            }]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    needsCompile: false,
                    hasSlots: false,
                });
            });
        });
        describe('TemplateCompiler - combinations -- attributes on custom elements', function () {
            var _a;
            const MyEl = CustomElement.define({ name: 'my-el' }, (_a = class {
                },
                _a.bindables = ['a', { name: 'p', attribute: 'my-prop' }],
                _a));
            const MyAttr = CustomAttribute.define({ name: 'my-attr' }, class {
            });
            it('compiles a custom attribute on a custom element', function () {
                const { result, createElement } = compileTemplate('<my-el foo="bar" my-attr>', MyEl, MyAttr);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><my-el foo="bar"></my-el></template>',
                    needsCompile: false,
                    instructions: [[
                            createElement({
                                ctor: MyEl
                            }),
                            {
                                type: InstructionType.hydrateAttribute,
                                res: CustomAttribute.getDefinition(MyAttr),
                                props: []
                            }
                        ]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false
                });
            });
            it('lets custom element bindable override custom attribute with the same name', function () {
                const MyProp = CustomAttribute.define({ name: 'my-prop' }, class {
                });
                const { result, createElement, createSetProp, createPropBinding, createInterpolation } = compileTemplate('<my-el foo="bar" my-prop my-prop.bind="" a="a ${b} c">', ...[MyEl, MyProp]);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><my-el foo="bar"></my-el></template>',
                    needsCompile: false,
                    instructions: [[
                            createElement({
                                ctor: MyEl,
                                props: [
                                    createSetProp({ value: '', to: 'p' }),
                                    createPropBinding({ from: 'myProp', to: 'p' }),
                                    createInterpolation({ from: 'a ${b} c', to: 'a' })
                                ]
                            })
                        ]],
                    type: 'custom-element',
                    surrogates: [],
                    dependencies: [],
                    hasSlots: false
                });
            });
        });
        describe('TemplateCompiler - combinations -- custom elements', function () {
            const Foo = CustomElement.define({ name: 'foo' }, class Foo {
            });
            it('compiles custom element with as-element', function () {
                const { result, createElement } = compileTemplate('<div as-element="foo">', Foo);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><div></div></template>',
                    needsCompile: false,
                    instructions: [[
                            createElement({
                                ctor: Foo,
                            })
                        ]],
                    type: 'custom-element',
                    dependencies: [],
                    surrogates: [],
                    hasSlots: false,
                });
            });
            it('compiles custom element with as-element on a <template>', function () {
                const { result, createElement } = compileTemplate('<template><template as-element="foo">', Foo);
                verifyBindingInstructionsEqual(result, {
                    name: 'unamed',
                    template: '<template><!--au*--><template></template></template>',
                    needsCompile: false,
                    instructions: [[
                            createElement({
                                ctor: Foo,
                            })
                        ]],
                    type: 'custom-element',
                    dependencies: [],
                    surrogates: [],
                    hasSlots: false,
                });
            });
        });
        describe('TemplateCompiler - combinations -- captures & ...$attrs & ...', function () {
            const MyElement = CustomElement.define({
                name: 'my-element',
                capture: true,
                bindables: ['prop1']
            });
            const MyAttr = CustomAttribute.define({
                name: 'my-attr',
                bindables: ['value']
            }, class MyAttr {
            });
            it('captures normal attributes', function () {
                const { sut, container } = createFixture(TestContext.create(), MyElement);
                const definition = sut.compile({
                    name: 'rando',
                    template: '<my-element value.bind="value">',
                }, container);
                assert.deepStrictEqual(definition.instructions[0][0].captures, [new AttrSyntax('value.bind', 'value', 'value', 'bind')]);
            });
            it('does not capture bindable', function () {
                const { sut, container } = createFixture(TestContext.create(), MyElement);
                const definition = sut.compile({
                    name: 'rando',
                    template: '<my-element prop1.bind="value">',
                }, container);
                assert.deepStrictEqual(definition.instructions[0][0].captures, []);
            });
            it('captures bindable-like on ignore-attr command', function () {
                const { sut, container } = createFixture(TestContext.create(), MyElement);
                const definition = sut.compile({
                    name: 'rando',
                    template: '<my-element prop1.trigger="value()">',
                }, container);
                assert.deepStrictEqual(definition.instructions[0][0].captures, [new AttrSyntax('prop1.trigger', 'value()', 'prop1', 'trigger')]);
            });
            it('captures custom attribute', function () {
                const { sut, container } = createFixture(TestContext.create(), MyElement, MyAttr);
                const definition = sut.compile({
                    name: 'rando',
                    template: '<my-element my-attr.bind="myAttrValue">',
                }, container);
                assert.deepStrictEqual(definition.instructions[0][0].captures, [new AttrSyntax('my-attr.bind', 'myAttrValue', 'my-attr', 'bind')]);
            });
            it('captures ...$attrs command', function () {
                const { sut, container } = createFixture(TestContext.create(), MyElement, MyAttr);
                const definition = sut.compile({
                    name: 'rando',
                    template: '<my-element ...$attrs>',
                }, container);
                assert.deepStrictEqual(definition.instructions[0][0].captures, [new AttrSyntax('...$attrs', '', '...$attrs', null)]);
            });
            it('does not capture template controller', function () {
                const { sut, container } = createFixture(TestContext.create(), MyElement);
                const definition = sut.compile({
                    name: 'rando',
                    template: '<my-element if.bind>',
                }, container);
                assert.deepStrictEqual(definition.instructions[0][0].def.instructions[0][0].captures, []);
            });
            it('compiles shorthand spread syntax', function () {
                const { sut, container } = createFixture(TestContext.create(), CustomElement.define({ name: 'my-element', bindables: ['item'] }));
                sut.resolveResources = false;
                const definition = sut.compile({ name: 'rando', template: '<my-element ...item>' }, container);
                verifyBindingInstructionsEqual(definition.instructions[0], [
                    new HydrateElementInstruction('my-element', [new SpreadValueBindingInstruction('$bindables', 'item')], null, false, [], {}),
                ]);
            });
            it('compiles shorthand $bindables syntax', function () {
                const { sut, container } = createFixture(TestContext.create(), CustomElement.define({ name: 'my-element', bindables: ['item'] }));
                sut.resolveResources = false;
                const definition = sut.compile({ name: 'rando', template: '<my-element ...$bindables="item">' }, container);
                verifyBindingInstructionsEqual(definition.instructions[0], [
                    new HydrateElementInstruction('my-element', [new SpreadValueBindingInstruction('$bindables', 'item')], null, false, [], {}),
                ]);
            });
        });
        describe('TemplateCompiler - combinations -- with attribute patterns', function () {
            // all tests are using pattern that is `my-attr`
            // and the template will have an element with an attribute `my-attr`
            const createPattern = (createSyntax) => {
                let MyAttrPattern = (() => {
                    let _classDecorators = [attributePattern({ pattern: 'my-attr', symbols: '' })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var MyAttrPattern = _classThis = class {
                        'my-attr'(rawName, rawValue, parts) {
                            return createSyntax(rawName, rawValue, parts);
                        }
                    };
                    __setFunctionName(_classThis, "MyAttrPattern");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyAttrPattern = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return MyAttrPattern = _classThis;
                })();
                return MyAttrPattern;
            };
            it('works with pattern returning command', function () {
                const MyPattern = createPattern((name, val, _parts) => new AttrSyntax(name, val, 'id', 'bind'));
                const { result } = compileTemplate('<div my-attr>', MyPattern);
                assert.deepStrictEqual(result.instructions[0], [new PropertyBindingInstruction(new AccessScopeExpression('id'), 'id', BindingMode.toView)]);
            });
            it('works when pattern returning interpolation', function () {
                const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, `\${a}a`, 'id', null));
                const { result } = compileTemplate('<div my-attr>', MyPattern);
                assert.deepStrictEqual(result.instructions[0], [new InterpolationInstruction(new Interpolation(['', 'a'], [new AccessScopeExpression('a')]), 'id')]);
            });
            it('ignores when pattern DOES NOT return command or interpolation', function () {
                const MyPattern = createPattern((name, val, _parts) => new AttrSyntax(name, val, 'id', null));
                const { result } = compileTemplate('<div my-attr>', MyPattern);
                assert.deepStrictEqual(result.instructions[0], undefined);
                assert.deepStrictEqual(result.template.content.querySelector('div').className, '');
            });
            it('lets pattern control the binding value', function () {
                const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, 'bb', 'id', 'bind'));
                const { result } = compileTemplate('<div my-attr>', MyPattern);
                assert.deepStrictEqual(result.instructions[0], 
                // default value is '' attr pattern changed it to 'bb'
                [new PropertyBindingInstruction(new AccessScopeExpression('bb'), 'id', BindingMode.toView)]);
            });
            it('works with pattern returning custom attribute + command', function () {
                let MyAttr = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'my-attr'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var MyAttr = _classThis = class {
                    };
                    __setFunctionName(_classThis, "MyAttr");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyAttr = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return MyAttr = _classThis;
                })();
                const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, 'bb', 'my-attr', 'bind'));
                const { result } = compileTemplate('<div my-attr>', MyPattern, MyAttr);
                assert.deepStrictEqual(result.instructions[0], [new HydrateAttributeInstruction(CustomAttribute.getDefinition(MyAttr), undefined, [
                        new PropertyBindingInstruction(new AccessScopeExpression('bb'), 'value', BindingMode.toView)
                    ])]);
            });
            it('works with pattern returning custom attribute + multi bindings', function () {
                let MyAttr = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'my-attr'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var MyAttr = _classThis = class {
                    };
                    __setFunctionName(_classThis, "MyAttr");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyAttr = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return MyAttr = _classThis;
                })();
                const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, 'value.bind: bb', 'my-attr', null));
                const { result } = compileTemplate('<div my-attr>', MyPattern, MyAttr);
                assert.deepStrictEqual(result.instructions[0], [new HydrateAttributeInstruction(CustomAttribute.getDefinition(MyAttr), undefined, [
                        // this bindingMode.toView is because it's from defaultBindingMode on `@customAttribute`
                        new PropertyBindingInstruction(new AccessScopeExpression('bb'), 'value', BindingMode.toView)
                    ])]);
            });
            it('works with pattern returning custom attribute + interpolation', function () {
                let MyAttr = (() => {
                    let _classDecorators = [customAttribute({
                            name: 'my-attr'
                        })];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    var MyAttr = _classThis = class {
                    };
                    __setFunctionName(_classThis, "MyAttr");
                    (() => {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyAttr = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    })();
                    return MyAttr = _classThis;
                })();
                const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, `\${bb}`, 'my-attr', null));
                const { result } = compileTemplate('<div my-attr>', MyPattern, MyAttr);
                assert.deepStrictEqual(result.instructions[0], [new HydrateAttributeInstruction(CustomAttribute.getDefinition(MyAttr), undefined, [
                        new InterpolationInstruction(new Interpolation(['', ''], [new AccessScopeExpression('bb')]), 'value')
                    ])]);
            });
        });
    });
    function assertTemplateHtml(template, expected) {
        assert.strictEqual(typeof template === 'string'
            ? template
            : template.innerHTML, expected);
    }
    // interface IWrappedTemplateCompiler extends ITemplateCompiler {
    //   compile(def: PartialCustomElementDefinition, container: IContainer): CustomElementDefinition;
    // }
    function createCompilerWrapper(compiler) {
        return {
            get resolveResources() { return compiler.resolveResources; },
            set resolveResources(value) { compiler.resolveResources = value; },
            get debug() { return compiler.debug; },
            set debug(value) { compiler.debug = value; },
            compile(definition, container) {
                return CustomElementDefinition.getOrCreate(compiler.compile(CustomElementDefinition.create(definition), container));
            },
            compileSpread(...args) {
                // eslint-disable-next-line prefer-spread
                return compiler.compileSpread.apply(compiler, args);
            }
        };
    }
    function compileTemplate(markupOrOptions, ...extraResources) {
        const ctx = TestContext.create();
        const container = ctx.container;
        const sut = ctx.templateCompiler;
        container.register(ExpressionParser, ...extraResources);
        const markup = typeof markupOrOptions === 'string' || 'nodeType' in markupOrOptions
            ? markupOrOptions
            : markupOrOptions.template;
        const options = typeof markupOrOptions === 'string' || 'nodeType' in markupOrOptions
            ? {}
            : markupOrOptions;
        if ('debug' in options) {
            sut.debug = options.debug;
        }
        if ('resolveResources' in options) {
            sut.resolveResources = options.resolveResources;
        }
        const templateDefinition = {
            type: 'custom-element',
            template: markup,
            // instructions: [],
            // surrogates: [],
            // shadowOptions: { mode: 'open' }
        };
        const parser = container.get(IExpressionParser);
        return {
            result: sut.compile(templateDefinition, container),
            parser,
            createElement: ({ ctor, props = [], projections = null, containerless = false, captures = [], data = {} }) => new HydrateElementInstruction(CustomElement.getDefinition(ctor), props, projections, containerless, captures, data),
            createSetProp: ({ value, to }) => new SetPropertyInstruction(value, to),
            createRef: (name, to) => new RefBindingInstruction(parser.parse(name, 'IsProperty'), to),
            createPropBinding: ({ from, to, mode = BindingMode.toView }) => new PropertyBindingInstruction(parser.parse(from, 'IsFunction'), to, mode),
            createAttr: ({ attr, from, to }) => new AttributeBindingInstruction(attr, parser.parse(from, 'IsProperty'), to),
            createInterpolation: ({ from, to }) => new InterpolationInstruction(parser.parse(from, 'Interpolation'), to),
            createIterateProp: (expression, to, props) => new IteratorBindingInstruction(parser.parse(expression, 'IsIterator'), to, props)
        };
    }
});
//# sourceMappingURL=template-compiler.spec.js.map