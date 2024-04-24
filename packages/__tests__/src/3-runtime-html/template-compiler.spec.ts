import { delegateSyntax } from '@aurelia/compat-v1';
import {
  Constructable,
  IContainer,
  kebabCase,
} from '@aurelia/kernel';
import {
  Interpolation,
  AccessScopeExpression,
  PrimitiveLiteralExpression,
  IExpressionParser,
} from '@aurelia/expression-parser';
import {
  bindable,
  BindingMode,
  BindableDefinition,
  customAttribute,
  CustomAttribute,
  customElement,
  CustomElement,
  PartialCustomElementDefinition,
  CustomElementDefinition,
  IInstruction,
  HydrateElementInstruction,
  HydrateTemplateController,
  InstructionType as HTT,
  InstructionType as TT,
  HydrateLetElementInstruction,
  CustomAttributeDefinition,
  HydrateAttributeInstruction,
  AttrSyntax,
  If,
  attributePattern,
  PropertyBindingInstruction,
  InterpolationInstruction,
  InstructionType,
  DefaultBindingSyntax,
  TemplateCompilerHooks,
  IteratorBindingInstruction,
  RefBindingInstruction,
  AttributeBindingInstruction,
  SetPropertyInstruction,
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext,
  verifyBindingInstructionsEqual,
} from '@aurelia/testing';
import { IElementComponentDefinition, ITemplateCompiler } from '@aurelia/template-compiler';

describe('3-runtime-html/template-compiler.spec.ts', function () {
  describe('base assertions', function () {
    let ctx: TestContext;
    let sut: ReturnType<typeof createCompilerWrapper>;
    let container: IContainer;

    beforeEach(function () {
      ctx = TestContext.create();
      container = ctx.container;
      sut = createCompilerWrapper(ctx.templateCompiler);
      sut.resolveResources = false;
      container.register(CustomAttribute.define('foo', class {}));
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
          sut.compile({ template: '<template>' } as any, container);
          assert.strictEqual(i, 1);
        });

        it('does not do anything if needsCompile is false', function () {
          let i = 0;
          container.register(TemplateCompilerHooks.define(class {
            compiling() {
              i = 1;
            }
          }));
          sut.compile({ template: '<template>', needsCompile: false } as any, container);
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
            const { instructions, surrogates } = compileWith(
              `<template class="h-100"></template>`,
              []
            );
            verifyInstructions(instructions, []);
            verifyInstructions(
              surrogates,
              [{ toVerify: ['type', 'value'], type: HTT.setClassAttribute, value: 'h-100' }]
            );
          });

          it('compiles surrogate plain style attribute', function () {
            const { instructions, surrogates } = compileWith(
              `<template style="background: red"></template>`,
              []
            );
            verifyInstructions(instructions, []);
            verifyInstructions(
              surrogates,
              [{ toVerify: ['type', 'value'], type: HTT.setStyleAttribute, value: 'background: red' }]
            );
          });

          it('compiles surrogate with binding expression', function () {
            const { instructions, surrogates } = compileWith(
              `<template class.bind="base"></template>`,
              []
            );
            verifyInstructions(instructions, [], 'normal');
            verifyInstructions(
              surrogates,
              [{ toVerify: ['type', 'to'], type: TT.propertyBinding, to: 'class' }],
              'surrogate'
            );
          });

          it('compiles surrogate with interpolation expression', function () {
            const { instructions, surrogates } = compileWith(
              `<template class="h-100 \${base}"></template>`,
              []
            );
            verifyInstructions(instructions, [], 'normal');
            verifyInstructions(
              surrogates,
              [{ toVerify: ['type', 'to'], type: TT.interpolation, to: 'class' }],
              'surrogate'
            );
          });

          it('throws on attributes that require to be unique', function () {
            const attrs = ['id'];
            attrs.forEach(attr => {
              assert.throws(
                () => compileWith(`<template ${attr}="${attr}"></template>`, []),
                /(Attribute id is invalid on surrogate)|(AUR0702:id)/,
              );
            });
          });

          it('does not create a prop binding when attribute value is an empty string', function () {
            const { instructions, surrogates } = compileWith(`<template foo>hello</template>`);
            console.log(surrogates);
            verifyInstructions(instructions, [], 'normal');
            verifyInstructions(surrogates, [
              { toVerify: ['type', 'to', 'res', 'props'], type: TT.hydrateAttribute, res: 'foo', props: [] }
            ], 'surrogate');
          });

          it('compiles surrogate with interpolation binding + custom attribute', function () {
            const { instructions, surrogates } = compileWith(`<template foo="\${bar}">hello</template>`);
            verifyInstructions(instructions, [], 'normal');
            verifyInstructions(
              surrogates,
              [
                { toVerify: ['type', 'to', 'props'], type: TT.hydrateAttribute, res: 'foo', props: [
                  new InterpolationInstruction(new Interpolation(['', ''], [new AccessScopeExpression('bar')]), 'value')
                ]}
              ],
              'surrogate'
            );
          });
        });

        it('understands attr precendence: element prop > custom attr', function () {
          @customElement('el')
          class El {
            @bindable() public prop1: string;
            @bindable() public prop2: string;
            @bindable() public prop3: string;
          }

          @customAttribute('prop3')
          class Prop3 { }

          const actual = compileWith(
            `<template>
            <el prop1.bind="p" prop2.bind="p" prop3.bind="t" prop3="t"></el>
          </template>`,
            [El, Prop3]
          );
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
          @customElement('el')
          class El {

            @bindable()
            public name: string;
          }

          const actual = compileWith(
            `<template>
            <el name="name" name2="label"></el>
          </template>`,
            [El]
          );
          const rootInstructions = actual.instructions[0];
          const expectedRootInstructions = [
            { toVerify: ['type', 'res'], type: TT.hydrateElement, res: 'el' }
          ];
          verifyInstructions(rootInstructions, expectedRootInstructions);

          const expectedElInstructions = [
            { toVerify: ['type', 'to', 'value'], type: TT.setProperty, to: 'name', value: 'name' }
          ];
          verifyInstructions((rootInstructions[0] as HydrateElementInstruction).props, expectedElInstructions);
        });

        it('understands element property casing', function () {
          @customElement('el')
          class El {

            @bindable()
            public backgroundColor: string;
          }

          const actual = compileWith(
            `<template>
            <el background-color="label"></el>
          </template>`,
            [El]
          );
          const rootInstructions = actual.instructions[0];

          const expectedElInstructions = [
            { toVerify: ['type', 'value', 'to'], type: TT.setProperty, value: 'label', to: 'backgroundColor' },
          ];
          verifyInstructions((rootInstructions[0] as HydrateElementInstruction).props, expectedElInstructions);
        });

        it('understands binding commands', function () {
          @customElement('el')
          class El {
            @bindable({ mode: BindingMode.twoWay }) public propProp1: string;
            @bindable() public prop2: string;
            @bindable() public propProp3: string;
            @bindable() public prop4: string;
            @bindable() public propProp5: string;
          }
          const actual = compileWith(
            `<template>
            <el
              prop-prop1.bind="prop1"
              prop2.one-time="prop2"
              prop-prop3.to-view="prop3"
              prop4.from-view="prop4"
              prop-prop5.two-way="prop5"
              ></el>
          </template>`,
            [El]
          );
          const rootInstructions = actual.instructions[0];

          const expectedElInstructions = [
            { toVerify: ['type', 'mode', 'to'], mode: BindingMode.twoWay, to: 'propProp1' },
            { toVerify: ['type', 'mode', 'to'], mode: BindingMode.oneTime, to: 'prop2' },
            { toVerify: ['type', 'mode', 'to'], mode: BindingMode.toView, to: 'propProp3' },
            { toVerify: ['type', 'mode', 'to'], mode: BindingMode.fromView, to: 'prop4' },
            { toVerify: ['type', 'mode', 'to'], mode: BindingMode.twoWay, to: 'propProp5' },
          ].map((e: any) => {
            e.type = TT.propertyBinding;
            return e;
          });
          verifyInstructions((rootInstructions[0] as HydrateElementInstruction).props, expectedElInstructions);
        });

        it('enables binding commands to override custom attribute', function () {
          const { template, instructions } = compileWith(
            `<el foo.trigger="1">`,
            [DefaultBindingSyntax, CustomAttribute.define('foo', class {})]
          );

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
            @customAttribute({
              name: 'prop',
              isTemplateController: true
            })
            class Prop {
              public value: any;
            }
            const { template, instructions } = compileWith(
              `<template><el prop.bind="p"></el></template>`,
              [Prop]
            );
            assert.strictEqual((template as HTMLTemplateElement).outerHTML, '<template><!--au*--><!--au-start--><!--au-end--></template>', `(template as HTMLTemplateElement).outerHTML`);
            const [hydratePropAttrInstruction] = instructions[0] as unknown as [HydrateTemplateController];
            assert.strictEqual((hydratePropAttrInstruction.def.template as HTMLTemplateElement).outerHTML, '<template><el></el></template>', `(hydratePropAttrInstruction.def.template as HTMLTemplateElement).outerHTML`);
          });

          it('moves attrbiutes instructions before the template controller into it', function () {
            @customAttribute({
              name: 'prop',
              isTemplateController: true
            })
            class Prop {
              public value: any;
            }
            const { template, instructions } = compileWith(
              `<template><el name.bind="name" title.bind="title" prop.bind="p"></el></template>`,
              [Prop]
            );
            assert.strictEqual((template as HTMLTemplateElement).outerHTML, '<template><!--au*--><!--au-start--><!--au-end--></template>', `(template as HTMLTemplateElement).outerHTML`);
            const [hydratePropAttrInstruction] = instructions[0] as unknown as [HydrateTemplateController];
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
              @customElement('not-div')
              class NotDiv { }
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
                @customElement('not-div')
                class NotDiv { }
                const { instructions } = compileWith(
                  '<template><div if.bind="value" as-element="not-div"></div></template>',
                  [NotDiv]
                );

                verifyInstructions(instructions[0], [
                  {
                    toVerify: ['type', 'res', 'to'],
                    type: TT.hydrateTemplateController, res: 'if'
                  }
                ]);
                const templateControllerInst = instructions[0][0] as HydrateTemplateController;
                verifyInstructions(templateControllerInst.props, [
                  {
                    toVerify: ['type', 'to', 'from'],
                    type: TT.propertyBinding, to: 'value', from: new AccessScopeExpression('value')
                  }
                ]);
                const [hydrateNotDivInstruction] = templateControllerInst.def.instructions[0] as [HydrateElementInstruction];
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
            assert.strictEqual((template as Element).outerHTML, '<template><!--au*--><let></let></template>');
          });

          it('does not generate instructions when there is no bindings', function () {
            const { instructions } = compileWith(`<template><let></let></template>`);
            assert.strictEqual((instructions[0][0] as HydrateLetElementInstruction).instructions.length, 0, `(instructions[0][0]).instructions.length`);
          });

          it('ignores custom element resource', function () {
            @customElement('let')
            class Let { }

            const { instructions } = compileWith(
              `<template><let></let></template>`,
              [Let]
            );
            verifyInstructions(instructions[0], [
              { toVerify: ['type'], type: TT.hydrateLetElement }
            ]);
          });

          it('compiles with attributes', function () {
            const { instructions } = compileWith(`<let a.bind="b" c="\${d}"></let>`);
            verifyInstructions((instructions[0][0] as HydrateLetElementInstruction).instructions, [
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
              assert.strictEqual((instructions[0][0] as HydrateLetElementInstruction).toBindingContext, true, `(instructions[0][0]).toBindingContext`);
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
            const { template } = compileWith(
              '<el containerless>',
              [CustomElement.define({ name: 'el' })]
            );

            assertTemplateHtml(template, '<!--au*--><!--au-start--><!--au-end-->');
          });

          it('compiles [containerless] after an interpolation', function () {
            const { template } = compileWith(
              '${message}<el containerless>',
              [CustomElement.define({ name: 'el' })]
            );

            assertTemplateHtml(template, '<!--au*--> <!--au*--><!--au-start--><!--au-end-->');
          });

          it('compiles [containerless] before an interpolation', function () {
            const { template } = compileWith(
              '<el containerless></el>${message}',
              [CustomElement.define({ name: 'el' })]
            );

            assertTemplateHtml(template, '<!--au*--><!--au-start--><!--au-end--><!--au*--> ');
          });

          it('compiles [containerless] next to each other', function () {
            const { template } = compileWith(
              '<el containerless></el><el containerless></el>',
              [CustomElement.define({ name: 'el' })]
            );

            assertTemplateHtml(template, '<!--au*--><!--au-start--><!--au-end-->'.repeat(2));
          });
        });
      });

      interface IExpectedInstruction {
        [prop: string]: any;
        toVerify: string[];
      }

      function compileWith(markup: string | Element, extraResources: any[] = [], shadow = false) {
        extraResources.forEach(e => container.register(e));
        const templateDefinition: PartialCustomElementDefinition = {
          template: markup,
          instructions: [],
          surrogates: [],
          shadowOptions: shadow ? { mode: 'open' } : null
        } as unknown as PartialCustomElementDefinition;
        return sut.compile(templateDefinition, container);
      }

      function verifyInstructions(actual: readonly any[], expectation: IExpectedInstruction[], type?: string) {
        assert.strictEqual(actual.length, expectation.length, `Expected to have ${expectation.length} ${type ? type : ''} instructions. Received: ${actual.length}`);
        for (let i = 0, ii = actual.length; i < ii; ++i) {
          const actualInst = actual[i];
          const expectedInst = expectation[i];
          const ofType = type ? `of ${type}` : '';
          for (const prop of expectedInst.toVerify) {
            if (expectedInst[prop] instanceof Object) {
              assert.deepStrictEqual(
                actualInst[prop],
                expectedInst[prop],
                `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
              );
            } else {
              assert.deepStrictEqual(
                actualInst[prop],
                expectedInst[prop],
                `Expected actual instruction ${ofType} to have "${prop}": ${expectedInst[prop]}. Received: ${actualInst[prop]} (on index: ${i})`
              );
            }
          }
        }
      }
    });

    describe('compileSpread', function () {
      it('throws when spreading a template controller', function () {
        @customAttribute({ name: 'bar', isTemplateController: true })
        class Bar {}

        container.register(Bar);

        assert.throws(() => sut.compileSpread(
          CustomElementDefinition.create({ name: 'el', template: '<template></template>' }),
          [
            { command: null, target: 'bar', rawValue: '', parts: [], rawName: 'bar' }
          ],
          container,
          ctx.doc.createElement('div'),
        ));
      });
    });
  });

  const elementInfoLookup = new WeakMap<CustomElementDefinition, Record<string, ElementInfo>>();

  /**
   * Pre-processed information about a custom element resource, optimized
   * for consumption by the template compiler.
   */
  class ElementInfo {
    /**
     * A lookup of the bindables of this element, indexed by the (pre-processed)
     * attribute names as they would be found in parsed markup.
     */
    public bindables: Record<string, BindableInfo | undefined> = Object.create(null);

    public constructor(
      public name: string,
      public alias: string | undefined,
      public containerless: boolean,
    ) { }

    public static from(def: CustomElementDefinition | null, alias: string): ElementInfo | null {
      if (def === null) {
        return null;
      }
      let rec = elementInfoLookup.get(def);
      if (rec === void 0) {
        elementInfoLookup.set(def, rec = Object.create(null) as Record<string, ElementInfo>);
      }
      let info = rec[alias];
      if (info === void 0) {
        info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
        const bindables = def.bindables;
        const defaultBindingMode = BindingMode.toView;

        let bindable: BindableDefinition;
        let prop: string;
        let attr: string;
        let mode: string | number;

        for (prop in bindables) {
          bindable = bindables[prop];
          // explicitly provided property name has priority over the implicit property name
          if (bindable.name !== void 0) {
            prop = bindable.name;
          }
          // explicitly provided attribute name has priority over the derived implicit attribute name
          if (bindable.attribute !== void 0) {
            attr = bindable.attribute;
          } else {
            // derive the attribute name from the resolved property name
            attr = kebabCase(prop);
          }
          if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
            mode = bindable.mode;
          } else {
            mode = defaultBindingMode;
          }
          info.bindables[attr] = new BindableInfo(prop, mode);
        }
      }
      return info;
    }
  }

  const attrInfoLookup = new WeakMap<CustomAttributeDefinition, Record<string, AttrInfo>>();

  /**
   * Pre-processed information about a custom attribute resource, optimized
   * for consumption by the template compiler.
   */
  class AttrInfo {
    /**
     * A lookup of the bindables of this attribute, indexed by the (pre-processed)
     * bindable names as they would be found in the attribute value.
     *
     * Only applicable to multi attribute bindings (semicolon-separated).
     */
    public bindables: Record<string, BindableInfo | undefined> = Object.create(null);
    /**
     * The single or first bindable of this attribute, or a default 'value'
     * bindable if no bindables were defined on the attribute.
     *
     * Only applicable to single attribute bindings (where the attribute value
     * contains no semicolons)
     */
    public bindable: BindableInfo | null = null;

    public constructor(
      public name: string,
      public alias: string | undefined,
      public isTemplateController: boolean,
      public noMultiBindings: boolean,
    ) { }

    public static from(def: CustomAttributeDefinition | null, alias: string): AttrInfo | null {
      if (def === null) {
        return null;
      }
      let rec = attrInfoLookup.get(def);
      if (rec === void 0) {
        attrInfoLookup.set(def, rec = Object.create(null) as Record<string, AttrInfo>);
      }
      let info = rec[alias];
      if (info === void 0) {
        info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
        const bindables = def.bindables;
        const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
          ? def.defaultBindingMode
          : BindingMode.toView;

        let bindable: BindableDefinition;
        let prop: string;
        let mode: string | number;
        let hasPrimary: boolean = false;
        let isPrimary: boolean = false;
        let bindableInfo: BindableInfo;

        for (prop in bindables) {
          bindable = bindables[prop];
          // explicitly provided property name has priority over the implicit property name
          if (bindable.name !== void 0) {
            prop = bindable.name;
          }
          if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
            mode = bindable.mode;
          } else {
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
    public constructor(
      /**
       * The pre-processed *property* (not attribute) name of the bindable, which is
       * (in order of priority):
       *
       * 1. The `property` from the description (if defined)
       * 2. The name of the property of the bindable itself
       */
      public propName: string,
      /**
       * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
       *
       * 1. The `mode` from the bindable (if defined and not bindingMode.default)
       * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
       * 3. `bindingMode.toView`
       */
      public mode: string | number,
    ) { }
  }

  describe(`combination assertions`, function () {
    function createFixture(ctx: TestContext, ...globals: any[]) {
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
            surrogates: [],
            dependencies: [],
            hasSlots: false,
          });
        });
      }
    });

    describe('TemplateCompiler - combinations -- custom attributes', function () {
      const MyAttr = CustomAttribute.define('my-attr', class MyAttr {});

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
          surrogates: [],
          dependencies: [],
          hasSlots: false,
        });
      });
    });

    describe('TemplateCompiler - combinations -- custom attributes with multiple bindings', function () {
      const MyAttr = CustomAttribute.define('my-attr', class MyAttr { static bindables = ['a', 'b']; });
      const YourAttr = CustomAttribute.define('your-attr', class MyAttr { static bindables = ['c', 'd']; });
      const NoMultiAttr = CustomAttribute.define({ name: 'no-multi-attr', noMultiBindings: true }, class { static bindables = ['a', 'b']; });
      const TemplateControllerAttr = CustomAttribute.define({ name: 'tc-attr', isTemplateController: true }, class {});
      const AttrWithLongBindable = CustomAttribute.define({ name: 'long-attr' }, class { static bindables = [{ name: 'a', attribute: 'a-a' }]; });

      it('compiles an attribute with 2 bindings', function () {
        const { result, createPropBinding: createProp } = compileTemplate('<div my-attr="a.bind: 1; b: 2">', MyAttr);
        verifyBindingInstructionsEqual(result.instructions[0][0], {
          type: InstructionType.hydrateAttribute,
          res: CustomAttribute.getDefinition(MyAttr),
          props: [createProp({ from: '1', to: 'a' }), { type: InstructionType.setProperty, value: '2', to: 'b' }]
        });
      });

      it('compiles multiple attributes with 2 bindings', function () {
        const { result, createPropBinding: createProp } = compileTemplate(
          '<div my-attr="a.bind: 1; b: 2" your-attr="c: 3; d.one-time: 4">',
          ...[MyAttr, YourAttr]
        );
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
        const { result, createInterpolation } = compileTemplate(
          '<div my-attr="${hey}">',
          MyAttr
        );
        verifyBindingInstructionsEqual(result.instructions[0][0], {
          type: InstructionType.hydrateAttribute,
          res: CustomAttribute.getDefinition(MyAttr),
          props: [createInterpolation({ from: '${hey}', to: 'a' })]
        });
      });

      it('compiles multiple binding with interpolation', function () {
        const { result, createInterpolation, createPropBinding: createProp } = compileTemplate(
          '<div my-attr="a: ${hey}; b.bind: 1">',
          MyAttr
        );
        verifyBindingInstructionsEqual(result.instructions[0][0], {
          type: InstructionType.hydrateAttribute,
          res: CustomAttribute.getDefinition(MyAttr),
          props: [createInterpolation({ from: '${hey}', to: 'a' }), createProp({from: '1', to: 'b' })]
        });
      });

      it('compiles attr with no multi binding', function () {
        const { result, createInterpolation } = compileTemplate(
          '<div no-multi-attr="a: ${hey}; b.bind: 1">',
          NoMultiAttr
        );
        verifyBindingInstructionsEqual(result.instructions[0][0], {
          type: InstructionType.hydrateAttribute,
          res: CustomAttribute.getDefinition(NoMultiAttr),
          props: [createInterpolation({ from: 'a: ${hey}; b.bind: 1', to: 'a' })]
        });
      });

      it('compiles template compiler with interpolation', function () {
        const { result, createInterpolation } = compileTemplate(
          '<div tc-attr="${hey}">',
          TemplateControllerAttr
        );
        verifyBindingInstructionsEqual(result.instructions[0][0], {
          type: InstructionType.hydrateTemplateController,
          res: CustomAttribute.getDefinition(TemplateControllerAttr),
          props: [createInterpolation({ from: '${hey}', to: 'value' })],
          def: {
            name: 'unamed',
            needsCompile: false,
            template: '<template><div></div></template>',
            instructions: [],
          }
        });
      });

      it('compiles attr with long bindable name', function () {
        const { result, createInterpolation } = compileTemplate(
          '<div long-attr="a-a: ${hey}">',
          AttrWithLongBindable
        );
        verifyBindingInstructionsEqual(result.instructions[0][0], {
          type: InstructionType.hydrateAttribute,
          res: CustomAttribute.getDefinition(AttrWithLongBindable),
          props: [createInterpolation({ from: '${hey}', to: 'a' })]
        });
      });
    });

    describe('TemplateCompiler - combinations -- nested template controllers (one per element)', function () {
      const Foo = CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo { });
      const Bar = CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar { });
      const Baz = CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz { });
      const Qux = CustomAttribute.define({ name: 'qux', isTemplateController: true }, class Qux { });

      it('compiles nested template controller', function () {
        const { result } = compileTemplate('<div foo><div id="2" bar><div id="3" baz><div id="4" qux>', Foo, Bar, Baz, Qux);

        verifyBindingInstructionsEqual(result, {
          name: 'unamed',
          needsCompile: false,
          template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
          dependencies: [],
          surrogates: [],
          hasSlots: false,
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
                  instructions: [[{
                    type: InstructionType.hydrateTemplateController,
                    res: CustomAttribute.getDefinition(Baz),
                    props: [],
                    def: {
                      name: 'unamed',
                      needsCompile: false,
                      template: '<template><div id="3"><!--au*--><!--au-start--><!--au-end--></div></template>',
                      instructions: [[{
                        type: InstructionType.hydrateTemplateController,
                        res: CustomAttribute.getDefinition(Qux),
                        props: [],
                        def: {
                          name: 'unamed',
                          template: '<template><div id="4"></div></template>',
                          needsCompile: false,
                          instructions: [],
                        }
                      }]],
                    }
                  }]],
                }
              }]]
            }
          }]]
        });
      });
    });

    describe('TemplateCompiler - combinations -- nested template controllers (multiple per element)', function () {
      const Foo = CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo { });
      const Bar = CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar { });
      const Baz = CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz { });
      const Qux = CustomAttribute.define({ name: 'qux', isTemplateController: true }, class Qux { });
      const Quux = CustomAttribute.define({ name: 'quux', isTemplateController: true }, class Quux { });

      for (const resolveResources of [true, false]) {
        it('compiles multiple nested template controllers per element on normal <div/>s', function () {
          const { createIterateProp, result } = compileTemplate(
            {
              template: `<div foo bar.for="i of ii" baz><div qux.for="i of ii" id="2" quux></div>`,
              resolveResources
            },
            ...[Foo, Bar, Baz, Qux, Quux]
          );

          verifyBindingInstructionsEqual(result, {
            name: 'unamed',
            template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
            needsCompile: false,
            dependencies: [],
            surrogates: [],
            hasSlots: false,
            instructions: [[{
              type: InstructionType.hydrateTemplateController,
              res: resolveResources ? CustomAttribute.getDefinition(Foo) : 'foo',
              props: [],
              def: {
                name: 'unamed',
                template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                needsCompile: false,
                instructions: [[{
                  type: InstructionType.hydrateTemplateController,
                  res: resolveResources ? CustomAttribute.getDefinition(Bar) : 'bar',
                  props: [createIterateProp('i of ii', 'value', [])],
                  def: {
                    name: 'unamed',
                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                    needsCompile: false,
                    instructions: [[{
                      type: InstructionType.hydrateTemplateController,
                      res: resolveResources ? CustomAttribute.getDefinition(Baz) : 'baz',
                      props: [],
                      def: {
                        name: 'unamed',
                        template: '<template><div><!--au*--><!--au-start--><!--au-end--></div></template>',
                        needsCompile: false,
                        instructions: [[{
                          type: InstructionType.hydrateTemplateController,
                          res: resolveResources ? CustomAttribute.getDefinition(Qux) : 'qux',
                          props: [createIterateProp('i of ii', 'value', [])],
                          def: {
                            name: 'unamed',
                            template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                            needsCompile: false,
                            instructions: [[{
                              type: InstructionType.hydrateTemplateController,
                              res: resolveResources ? CustomAttribute.getDefinition(Quux) : 'quux',
                              props: [],
                              def: {
                                name: 'unamed',
                                template: '<template><div id="2"></div></template>',
                                needsCompile: false,
                                instructions: []
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
            },
            ...[Foo, Bar, Baz, Qux, Quux]
          );

          verifyBindingInstructionsEqual(result, {
            name: 'unamed',
            template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
            needsCompile: false,
            dependencies: [],
            surrogates: [],
            hasSlots: false,
            instructions: [[{
              type: InstructionType.hydrateTemplateController,
              res: resolveResources ? CustomAttribute.getDefinition(Foo) : 'foo',
              props: [],
              def: {
                name: 'unamed',
                template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                needsCompile: false,
                instructions: [[{
                  type: InstructionType.hydrateTemplateController,
                  res: resolveResources ? CustomAttribute.getDefinition(Bar) : 'bar',
                  props: [createIterateProp('i of ii', 'value', [])],
                  def: {
                    name: 'unamed',
                    template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                    needsCompile: false,
                    instructions: [[{
                      type: InstructionType.hydrateTemplateController,
                      res: resolveResources ? CustomAttribute.getDefinition(Baz) : 'baz',
                      props: [],
                      def: {
                        name: 'unamed',
                        template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                        needsCompile: false,
                        instructions: [[{
                          type: InstructionType.hydrateTemplateController,
                          res: resolveResources ? CustomAttribute.getDefinition(Qux) : 'qux',
                          props: [createIterateProp('i of ii', 'value', [])],
                          def: {
                            name: 'unamed',
                            template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                            needsCompile: false,
                            instructions: [[{
                              type: InstructionType.hydrateTemplateController,
                              res: resolveResources ? CustomAttribute.getDefinition(Quux) : 'quux',
                              props: [],
                              def: {
                                name: 'unamed',
                                template: '<template><div id="2"></div></template>',
                                needsCompile: false,
                                instructions: []
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
      const Foo = CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo { });
      const Bar = CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar { });
      const Baz = CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz { });

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
                instructions: [[{
                  type: InstructionType.hydrateTemplateController,
                  res: CustomAttribute.getDefinition(Bar),
                  props: [],
                  def: {
                    name: 'unamed',
                    template: '<template><!--au*--><div></div></template>',
                    needsCompile: false,
                    instructions: [[createPropBinding({ from: 'b', to: 'a' })]],
                  }
                }]],
              }
            }]],
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
              needsCompile: false,
              template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
              instructions: [[{
                // for bar.for
                type: InstructionType.hydrateTemplateController,
                res: CustomAttribute.getDefinition(Bar),
                props: [createIterateProp('i of ii', 'value', [])],
                def: {
                  name: 'unamed',
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
                      instructions: []
                    }
                  }]]
                }
              }]]
            }
          }]],
          surrogates: [],
          dependencies: [],
          hasSlots: false,
          needsCompile: false,
        });
      });

      it('compiles with multiple controller and different commands on a <template/>', function () {
        const { result, createIterateProp, createPropBinding  } = compileTemplate('<div><template foo="" id="1" bar.for="i of ii" baz.bind="e">', Foo, Bar, Baz);
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
                  needsCompile: false,
                  template: '<template><!--au*--><!--au-start--><!--au-end--></template>',
                  instructions: [[{
                    name: 'unamed',
                    type: InstructionType.hydrateTemplateController,
                    res: CustomAttribute.getDefinition(Baz),
                    props: [createPropBinding({ from: 'e', to: 'value' })],
                    def: {
                      name: 'unamed',
                      needsCompile: false,
                      template: '<template id="1"></template>',
                      instructions: []
                    }
                  }]]
                }
              }]]
            }
          }]],
          surrogates: [],
          dependencies: [],
          needsCompile: false,
          hasSlots: false,
        });
      });
    });

    describe('TemplateCompiler - combinations -- attributes on custom elements', function () {
      const MyEl = CustomElement.define({ name: 'my-el' }, class { static bindables = ['a', { name: 'p', attribute: 'my-prop' }]; });
      const MyAttr = CustomAttribute.define({ name: 'my-attr' }, class {});

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
          }]],
          surrogates: [],
          dependencies: [],
          hasSlots: false
        });
      });

      it('lets custom element bindable override custom attribute with the same name', function () {
        const MyProp = CustomAttribute.define({ name: 'my-prop' }, class {});

        const { result, createElement, createSetProp, createPropBinding, createInterpolation } = compileTemplate(
          '<my-el foo="bar" my-prop my-prop.bind="" a="a ${b} c">',
          ...[MyEl, MyProp]
        );
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
          surrogates: [],
          dependencies: [],
          hasSlots: false
        });
      });
    });

    describe('TemplateCompiler - combinations -- custom elements', function () {
      const Foo = CustomElement.define({ name: 'foo' }, class Foo { });

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
          dependencies: [],
          surrogates: [],
          hasSlots: false,
        });
      });
    });

    describe('TemplateCompiler - combinations -- captures & ...$attrs', function () {
      const MyElement = CustomElement.define({
        name: 'my-element',
        capture: true,
        bindables: ['prop1']
      });
      const MyAttr = CustomAttribute.define({
        name: 'my-attr',
        bindables: ['value']
      }, class MyAttr { });

      it('captures normal attributes', function () {
        const { sut, container } = createFixture(TestContext.create(), MyElement);
        const definition = sut.compile({
          name: 'rando',
          template: '<my-element value.bind="value">',
        }, container);

        assert.deepStrictEqual(
          (definition.instructions[0][0] as any).captures,
          [new AttrSyntax('value.bind', 'value', 'value', 'bind')]
        );
      });

      it('does not capture bindable', function () {
        const { sut, container } = createFixture(TestContext.create(), MyElement);
        const definition = sut.compile({
          name: 'rando',
          template: '<my-element prop1.bind="value">',
        }, container);

        assert.deepStrictEqual((definition.instructions[0][0] as any).captures, []);
      });

      it('captures bindable-like on ignore-attr command', function () {
        const { sut, container } = createFixture(TestContext.create(), MyElement);
        const definition = sut.compile({
          name: 'rando',
          template: '<my-element prop1.trigger="value()">',
        }, container);

        assert.deepStrictEqual(
          (definition.instructions[0][0] as any).captures,
          [new AttrSyntax('prop1.trigger', 'value()', 'prop1', 'trigger')]
        );
      });

      it('captures custom attribute', function () {
        const { sut, container } = createFixture(TestContext.create(), MyElement, MyAttr);
        const definition = sut.compile({
          name: 'rando',
          template: '<my-element my-attr.bind="myAttrValue">',
        }, container);

        assert.deepStrictEqual(
          (definition.instructions[0][0] as any).captures,
          [new AttrSyntax('my-attr.bind', 'myAttrValue', 'my-attr', 'bind')]
        );
      });

      it('captures ...$attrs command', function () {
        const { sut, container } = createFixture(TestContext.create(), MyElement, MyAttr);
        const definition = sut.compile({
          name: 'rando',
          template: '<my-element ...$attrs>',
        }, container);

        assert.deepStrictEqual(
          (definition.instructions[0][0] as any).captures,
          [new AttrSyntax('...$attrs', '', '', '...$attrs')]
        );
      });

      it('does not capture template controller', function () {
        const { sut, container } = createFixture(TestContext.create(), MyElement, If);
        const definition = sut.compile({
          name: 'rando',
          template: '<my-element if.bind>',
        }, container);

        assert.deepStrictEqual(
          ((definition.instructions[0][0] as HydrateTemplateController).def.instructions[0][0] as any).captures,
          []
        );
      });
    });

    describe('TemplateCompiler - combinations -- with attribute patterns', function () {
      // all tests are using pattern that is `my-attr`
      // and the template will have an element with an attribute `my-attr`
      const createPattern = (createSyntax: (rawName: string, rawValue: string, parts: string[]) => AttrSyntax) => {
        @attributePattern(
          { pattern: 'my-attr', symbols: '' }
        )
        class MyAttrPattern {
          public 'my-attr'(rawName: string, rawValue: string, parts: string[]) {
            return createSyntax(rawName, rawValue, parts);
          }
        }
        return MyAttrPattern;
      };

      it('works with pattern returning command', function () {
        const MyPattern = createPattern((name, val, _parts) => new AttrSyntax(name, val, 'id', 'bind'));

        const { result } = compileTemplate('<div my-attr>', MyPattern);

        assert.deepStrictEqual(
          result.instructions[0],
          [new PropertyBindingInstruction(new PrimitiveLiteralExpression(''), 'id', BindingMode.toView)]
        );
      });

      it('works when pattern returning interpolation', function () {
        const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, `\${a}a`, 'id', null));
        const { result } = compileTemplate('<div my-attr>', MyPattern);

        assert.deepStrictEqual(
          result.instructions[0],
          [new InterpolationInstruction(new Interpolation(['', 'a'], [new AccessScopeExpression('a')]), 'id')]
        );
      });

      it('ignores when pattern DOES NOT return command or interpolation', function () {
        const MyPattern = createPattern((name, val, _parts) => new AttrSyntax(name, val, 'id', null));
        const { result } = compileTemplate('<div my-attr>', MyPattern);

        assert.deepStrictEqual(
          result.instructions[0],
          undefined
        );
        assert.deepStrictEqual(
          (result.template as HTMLTemplateElement).content.querySelector('div').className,
          ''
        );
      });

      it('lets pattern control the binding value', function () {
        const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, 'bb', 'id', 'bind'));
        const { result } = compileTemplate('<div my-attr>', MyPattern);

        assert.deepStrictEqual(
          result.instructions[0],
          // default value is '' attr pattern changed it to 'bb'
          [new PropertyBindingInstruction(new AccessScopeExpression('bb'), 'id', BindingMode.toView)]
        );
      });

      it('works with pattern returning custom attribute + command', function () {
        @customAttribute({
          name: 'my-attr'
        })
        class MyAttr { }
        const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, 'bb', 'my-attr', 'bind'));
        const { result } = compileTemplate('<div my-attr>', MyPattern, MyAttr);

        assert.deepStrictEqual(
          result.instructions[0],
          [new HydrateAttributeInstruction(CustomAttribute.getDefinition(MyAttr), undefined, [
            new PropertyBindingInstruction(new AccessScopeExpression('bb'), 'value', BindingMode.toView)
          ])]
        );
      });

      it('works with pattern returning custom attribute + multi bindings', function () {
        @customAttribute({
          name: 'my-attr'
        })
        class MyAttr { }
        const MyPattern = createPattern((name, _val, _parts) => new AttrSyntax(name, 'value.bind: bb', 'my-attr', null));
        const { result } = compileTemplate('<div my-attr>', MyPattern, MyAttr);

        assert.deepStrictEqual(
          result.instructions[0],
          [new HydrateAttributeInstruction(CustomAttribute.getDefinition(MyAttr), undefined, [
            new PropertyBindingInstruction(new AccessScopeExpression('bb'), 'value', BindingMode.toView)
          ])]
        );
      });

      it('works with pattern returning custom attribute + interpolation', function () {
        @customAttribute({
          name: 'my-attr'
        })
        class MyAttr { }
        const MyPattern = createPattern((name, _val, _parts) =>
          new AttrSyntax(name, `\${bb}`, 'my-attr', null)
        );
        const { result } = compileTemplate('<div my-attr>', MyPattern, MyAttr);

        assert.deepStrictEqual(
          result.instructions[0],
          [new HydrateAttributeInstruction(CustomAttribute.getDefinition(MyAttr), undefined, [
            new InterpolationInstruction(new Interpolation(['', ''], [new AccessScopeExpression('bb')]), 'value')
          ])]
        );
      });
    });
  });

  function assertTemplateHtml(template: string | Node, expected: string) {
    assert.strictEqual(typeof template === 'string'
      ? template
      : (template as HTMLTemplateElement).innerHTML,
      expected
    );
  }

  // interface IWrappedTemplateCompiler extends ITemplateCompiler {
  //   compile(def: PartialCustomElementDefinition, container: IContainer): CustomElementDefinition;
  // }

  function createCompilerWrapper(compiler: ITemplateCompiler) {
    return {
      get resolveResources() { return compiler.resolveResources; },
      set resolveResources(value: boolean) { compiler.resolveResources = value; },
      get debug() { return compiler.debug; },
      set debug(value: boolean) { compiler.debug = value; },
      compile(definition: PartialCustomElementDefinition, container: IContainer) {
        return CustomElementDefinition.getOrCreate(compiler.compile(CustomElementDefinition.create(definition), container));
      },
      compileSpread(...args: any[]) {
        // eslint-disable-next-line prefer-spread
        return compiler.compileSpread.apply(compiler, args);
      }
    };
  }

  function compileTemplate(markupOrOptions: string | Element | { template: string; debug?: boolean; resolveResources?: boolean }, ...extraResources: any[]) {
    const ctx = TestContext.create();
    const container = ctx.container;
    const sut = ctx.templateCompiler;
    container.register(...extraResources);
    const markup = typeof markupOrOptions === 'string' || 'nodeType' in markupOrOptions
        ? markupOrOptions
        : markupOrOptions.template;
    const options: { debug?: boolean; resolveResources?: boolean } = typeof markupOrOptions === 'string' || 'nodeType' in markupOrOptions
      ? {}
      : markupOrOptions;
    if ('debug' in options) {
      sut.debug = options.debug;
    }
    if ('resolveResources' in options) {
      sut.resolveResources = options.resolveResources;
    }
    const templateDefinition = {
      template: markup,
      // instructions: [],
      // surrogates: [],
      // shadowOptions: { mode: 'open' }
    } as unknown as IElementComponentDefinition;
    const parser = container.get(IExpressionParser);

    return {
      result: sut.compile(templateDefinition, container),
      parser,
      createElement: ({ ctor, props = [], projections = null, containerless = false, captures = [], data = {} }: {
        ctor: Constructable;
        props?: IInstruction[];
        projections?: Record<string, PartialCustomElementDefinition>;
        containerless?: boolean;
        captures?: AttrSyntax[];
        data?: Record<PropertyKey, unknown>;
      }) =>
        new HydrateElementInstruction(CustomElement.getDefinition(ctor), props, projections as Record<string, IElementComponentDefinition>, containerless, captures, data),
      createSetProp: ({ value, to }: { value: unknown; to: string }) =>
        new SetPropertyInstruction(value, to),
      createRef: (name: string, to: string) => new RefBindingInstruction(parser.parse(name, 'IsProperty'), to),
      createPropBinding: ({ from, to, mode = BindingMode.toView }: { from: string; to: string; mode?: BindingMode }) =>
        new PropertyBindingInstruction(parser.parse(from, 'IsFunction'), to, mode),
      createAttr: ({ attr, from, to }: { attr: string; from: string; to: string }) =>
        new AttributeBindingInstruction(attr, parser.parse(from, 'IsProperty'), to),
      createInterpolation: ({ from, to }: { from: string; to: string }) =>
        new InterpolationInstruction(parser.parse(from, 'Interpolation'), to),
      createIterateProp: (expression: string, to: string, props: any[]) =>
        new IteratorBindingInstruction(parser.parse(expression, 'IsIterator'), to, props)
    };
  }
});
