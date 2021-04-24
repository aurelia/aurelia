import {
  Constructable,
  IContainer,
  kebabCase,
  ISink,
  ILogEvent,
  LoggerConfiguration,
  DefaultLogger,
  LogLevel,
  camelCase,
} from '@aurelia/kernel';
import {
  AccessScopeExpression,
  bindable,
  BindableDefinition,
  BindingIdentifier,
  BindingMode,
  BindingType,
  customAttribute,
  CustomAttribute,
  customElement,
  CustomElement,
  DelegationStrategy,
  ForOfStatement,
  ITemplateCompiler,
  PartialCustomElementDefinition,
  PrimitiveLiteralExpression,
  PartialCustomAttributeDefinition,
  CustomElementDefinition,
  IProjections,
  IInstruction,
  CustomElementType,
  AuSlot,
  RegisteredProjections,
  AuSlotContentType,
  Scope,
  parseExpression,
  Aurelia,
  HydrateElementInstruction,
  HydrateTemplateController,
  InstructionType as HTT,
  ITemplateElementFactory,
  InstructionType as TT,
  HydrateLetElementInstruction,
  InstructionType,
  ElementInfo,
  BindableInfo,
  IExpressionParser,
} from '@aurelia/runtime-html';
import {
  assert,
  eachCartesianJoinFactory,
  TestContext,
  verifyBindingInstructionsEqual,
  generateCartesianProduct,
  createScopeForTest,
} from '@aurelia/testing';

export function createAttribute(name: string, value: string): Attr {
  const attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

describe('template-compiler.spec.ts\n  [TemplateCompiler]', function () {
  let ctx: TestContext;
  let sut: ITemplateCompiler;
  let container: IContainer;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    ctx = TestContext.create();
    container = ctx.container;
    sut = ctx.templateCompiler;
    container.registerResolver<string>(CustomAttribute.keyFrom('foo'), { getFactory: () => ({ Type: { description: {} } }) } as any);
  });

  describe('compileElement()', function () {

    it('set hasSlots to true <slot/>', function () {
      const definition = compileWith('<template><slot></slot></template>', []);
      assert.strictEqual(definition.hasSlots, true, `definition.hasSlots`);

      // test this with nested slot inside template controller
    });

    describe('with custom element', function () {

      describe('compiles surrogate', function () {

        it('compiles surrogate', function () {
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
              /Invalid surrogate attribute/,
            );
          });
        });
      });

      it('understands attr precendence: custom attr > element prop', function () {
        @customElement('el')
        class El {
          @bindable() public prop1: string;
          @bindable() public prop2: string;
          @bindable() public prop3: string;
        }

        @customAttribute('prop3')
        class Prop {}

        const actual = compileWith(
          `<template>
            <el prop1.bind="p" prop2.bind="p" prop3.bind="t" prop3="t"></el>
          </template>`,
          [El, Prop]
        );
        assert.strictEqual(actual.instructions.length, 1, `actual.instructions.length`);
        assert.strictEqual(actual.instructions[0].length, 3, `actual.instructions[0].length`);
        const siblingInstructions = actual.instructions[0].slice(1);
        const expectedSiblingInstructions = [
          { toVerify: ['type', 'res', 'to'], type: TT.hydrateAttribute, res: 'prop3' },
          { toVerify: ['type', 'res', 'to'], type: TT.hydrateAttribute, res: 'prop3' }
        ];
        verifyInstructions(siblingInstructions, expectedSiblingInstructions);
        const rootInstructions = actual.instructions[0][0]['instructions'];
        const expectedRootInstructions = [
          { toVerify: ['type', 'res', 'to'], type: TT.propertyBinding, to: 'prop1' },
          { toVerify: ['type', 'res', 'to'], type: TT.propertyBinding, to: 'prop2' }
        ];
        verifyInstructions(rootInstructions, expectedRootInstructions);
      });

      it('distinguishs element properties / normal attributes', function () {
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
        verifyInstructions((rootInstructions[0] as HydrateElementInstruction).instructions, expectedElInstructions);
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
        verifyInstructions((rootInstructions[0] as HydrateElementInstruction).instructions, expectedElInstructions);
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
        verifyInstructions((rootInstructions[0] as HydrateElementInstruction).instructions, expectedElInstructions);
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
          assert.strictEqual((template as HTMLTemplateElement).outerHTML, '<template><au-m class="au"></au-m></template>', `(template as HTMLTemplateElement).outerHTML`);
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
          assert.strictEqual((template as HTMLTemplateElement).outerHTML, '<template><au-m class="au"></au-m></template>', `(template as HTMLTemplateElement).outerHTML`);
          const [hydratePropAttrInstruction] = instructions[0] as unknown as [HydrateTemplateController];
          verifyInstructions(hydratePropAttrInstruction.instructions, [
            { toVerify: ['type', 'to', 'from'],
              type: TT.propertyBinding, to: 'value', from: new AccessScopeExpression('p') }
          ]);
          verifyInstructions(hydratePropAttrInstruction.def.instructions[0], [
            { toVerify: ['type', 'to', 'from'],
              type: TT.propertyBinding, to: 'name', from: new AccessScopeExpression('name') },
            { toVerify: ['type', 'to', 'from'],
              type: TT.propertyBinding, to: 'title', from: new AccessScopeExpression('title') },
          ]);
        });

        describe('[as-element]', function () {
          it('understands [as-element]', function () {
            @customElement('not-div')
            class NotDiv {}
            const { instructions } = compileWith('<template><div as-element="not-div"></div></template>', [NotDiv]);
            verifyInstructions(instructions[0], [
              { toVerify: ['type', 'res'],
                type: TT.hydrateElement, res: 'not-div' }
            ]);
          });

          it('does not throw when element is not found', function () {
            const { instructions } = compileWith('<template><div as-element="not-div"></div></template>');
            assert.strictEqual(instructions.length, 0, `instructions.length`);
          });

          describe('with template controller', function () {
            it('compiles', function () {
              @customElement('not-div')
              class NotDiv {}
              const { instructions } = compileWith(
                '<template><div if.bind="value" as-element="not-div"></div></template>',
                [NotDiv]
              );

              verifyInstructions(instructions[0], [
                { toVerify: ['type', 'res', 'to'],
                  type: TT.hydrateTemplateController, res: 'if' }
              ]);
              const templateControllerInst = instructions[0][0] as HydrateTemplateController;
              verifyInstructions(templateControllerInst.instructions, [
                { toVerify: ['type', 'to', 'from'],
                  type: TT.propertyBinding, to: 'value', from: new AccessScopeExpression('value') }
              ]);
              const [hydrateNotDivInstruction] = templateControllerInst.def.instructions[0] as [HydrateElementInstruction];
              verifyInstructions([hydrateNotDivInstruction], [
                { toVerify: ['type', 'res'],
                  type: TT.hydrateElement, res: 'not-div' }
              ]);
              verifyInstructions(hydrateNotDivInstruction.instructions, []);
            });
          });
        });
      });

      describe('<let/> element', function () {

        it('compiles', function () {
          const { instructions } = compileWith(`<template><let></let></template>`);
          assert.strictEqual(instructions.length, 1, `instructions.length`);
        });

        it('does not generate instructions when there is no bindings', function () {
          const { instructions } = compileWith(`<template><let></let></template>`);
          assert.strictEqual((instructions[0][0] as HydrateLetElementInstruction).instructions.length, 0, `(instructions[0][0]).instructions.length`);
        });

        it('ignores custom element resource', function () {
          @customElement('let')
          class Let {}

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
            { toVerify: ['type', 'to', 'srcOrExp'],
              type: TT.letBinding, to: 'a', from: 'b' },
            { toVerify: ['type', 'to'],
              type: TT.letBinding, to: 'c' }
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
    });

    interface IExpectedInstruction {
      [prop: string]: any;
      toVerify: string[];
    }

    function compileWith(markup: string | Element, extraResources: any[] = []) {
      extraResources.forEach(e => container.register(e));
      const templateDefinition: PartialCustomElementDefinition = { template: markup, instructions: [], surrogates: [] } as unknown as PartialCustomElementDefinition;
      return sut.compile(templateDefinition, container, null);
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
});

function stringOrUnnamed(str: string | undefined): string {
  if (str === void 0) {
    return 'unnamed';
  }
  return str;
}

const defaultCustomElementDefinitionProperties = {
  name: 'unnamed',
  Type: class HTMLOnlyElement {},
  aliases: [],
  key: 'au:resource:custom-element:unnamed',
  cache: 0,
  dependencies: [],
  bindables: {},
  childrenObservers: {},
  containerless: false,
  injectable: null,
  isStrictBinding: false,
  hasSlots: false,
  shadowOptions: null,
  surrogates: [],
  watches: [],
};

function createTplCtrlAttributeInstruction(attr: string, value: string) {
  if (attr === 'repeat.for') {
    return [{
      type: TT.iteratorBinding,
      from: new ForOfStatement(
        new BindingIdentifier(value.split(' of ')[0]),
        new AccessScopeExpression(value.split(' of ')[1])),
      to: 'items'
    }];
  } else if (attr.includes('.')) {
    return [{
      type: TT.propertyBinding,
      from: value.length === 0 ? PrimitiveLiteralExpression.$empty : new AccessScopeExpression(value),
      to: 'value',
      mode: BindingMode.toView,
    }];
  } else {
    return [{
      type: TT.setProperty,
      to: 'value',
      value
    }];
  }
}

function createTemplateController(ctx: TestContext, attr: string, target: string, value: string, tagName: string, finalize: boolean, childInstr?, childTpl?): CTCResult {
  // multiple template controllers per element
  if (tagName == null) {
    const node = ctx.createElementFromMarkup(childTpl);
    const attributes = [];
    while (node.attributes.length) {
      attributes.unshift(node.attributes[0]);
      node.removeAttribute(node.attributes[0].name);
    }
    node.setAttribute(attr, value);
    while (attributes.length) {
      const attrib = attributes.pop();
      node.setAttribute(attrib.name, attrib.value);
    }
    node.setAttribute(attr, value);
    const rawMarkup = node.outerHTML;
    const instruction = {
      type: TT.hydrateTemplateController,
      res: target,
      def: {
        ...defaultCustomElementDefinitionProperties,
        name: stringOrUnnamed(target),
        key: `au:resource:custom-element:${stringOrUnnamed(target)}`,
        template: ctx.createElementFromMarkup(`<template><au-m class="au"></au-m></template>`),
        instructions: [[childInstr]],
        needsCompile: false,
        enhance: false,
        projectionsMap: new Map<IInstruction, IProjections>(),
        processContent: null,
      },
      instructions: createTplCtrlAttributeInstruction(attr, value),
    };
    const input: PartialCustomElementDefinition = {
      template: finalize ? `<div>${rawMarkup}</div>` : rawMarkup,
      instructions: []
    } as unknown as PartialCustomElementDefinition;
    const output: PartialCustomElementDefinition = {
      ...defaultCustomElementDefinitionProperties,
      template: ctx.createElementFromMarkup(`<template><div><au-m class="au"></au-m></div></template>`),
      instructions: [[instruction]],
      needsCompile: false,
      enhance: false,
      projectionsMap: new Map<IInstruction, IProjections>(),
      processContent: null,
    } as unknown as PartialCustomElementDefinition;
    return [input, output];
  } else {
    let compiledMarkup;
    let instructions;
    if (childInstr === undefined) {
      compiledMarkup = `<${tagName}></${tagName}>`;
      instructions = [];
    } else {
      compiledMarkup = `<${tagName}><au-m class="au"></au-m></${tagName}>`;
      instructions = [[childInstr]];
    }
    const instruction = {
      type: TT.hydrateTemplateController,
      res: target,
      def: {
        ...defaultCustomElementDefinitionProperties,
        name: stringOrUnnamed(target),
        key: `au:resource:custom-element:${stringOrUnnamed(target)}`,
        template: ctx.createElementFromMarkup(tagName === 'template' ? compiledMarkup : `<template>${compiledMarkup}</template>`),
        instructions,
        needsCompile: false,
        enhance: false,
        projectionsMap: new Map<IInstruction, IProjections>(),
        processContent: null,
      },
      instructions: createTplCtrlAttributeInstruction(attr, value),
    };
    const rawMarkup = `<${tagName} ${attr}="${value || ''}">${childTpl || ''}</${tagName}>`;
    const input: PartialCustomElementDefinition = {
      template: finalize ? `<div>${rawMarkup}</div>` : rawMarkup,
      instructions: []
    } as unknown as PartialCustomElementDefinition;
    const output: PartialCustomElementDefinition = {
      ...defaultCustomElementDefinitionProperties,
      template: ctx.createElementFromMarkup(finalize ? `<template><div><au-m class="au"></au-m></div></template>` : `<au-m class="au"></au-m>`),
      instructions: [[instruction]],
      needsCompile: false,
      enhance: false,
      projectionsMap: new Map<IInstruction, IProjections>(),
      processContent: null,
    } as unknown as PartialCustomElementDefinition;
    return [input, output];
  }
}

function createCustomElement(
  ctx: TestContext,
  tagName: string,
  finalize: boolean,
  attributes: readonly [string, string][],
  childInstructions: readonly any[],
  siblingInstructions: readonly any[],
  nestedElInstructions: readonly any[],
  childOutput?,
  childInput?,
): [PartialCustomElementDefinition, PartialCustomElementDefinition] {
  const instruction = {
    type: TT.hydrateElement,
    res: tagName,
    instructions: childInstructions,
    slotInfo: null,
  };
  const exprParser = ctx.container.get(IExpressionParser);
  const attributeMarkup = attributes.map(a => `${a[0]}="${a[1]}"`).join(' ');
  const rawMarkup = `<${tagName} ${attributeMarkup}>${(childInput && childInput.template) || ''}</${tagName}>`;
  const input = {
    name: 'unnamed',
    template: finalize ? `<div>${rawMarkup}</div>` : rawMarkup,
    instructions: []
  };
  const outputAttributeMarkup = attributes.map(a => exprParser.parse(a[1], BindingType.Interpolation) !== null ? '' : `${a[0]}="${a[1]}"`).join(' ');
  const outputMarkup = ctx.createElementFromMarkup(`<${tagName} ${outputAttributeMarkup.replace(/\$\{.*\}/, '')}>${(childOutput && childOutput.template.outerHTML) || ''}</${tagName}>`);
  outputMarkup.classList.add('au');
  const output = {
    ...defaultCustomElementDefinitionProperties,
    name: 'unnamed',
    key: 'au:resource:custom-element:unnamed',
    template: finalize ? ctx.createElementFromMarkup(`<template><div>${outputMarkup.outerHTML}</div></template>`) : outputMarkup,
    instructions: [[instruction, ...siblingInstructions], ...nestedElInstructions],
    needsCompile: false,
    enhance: false,
    projectionsMap: new Map<IInstruction, IProjections>(),
    watches: [],
    processContent: null,
  };
  return [input, output];
}

function createCustomAttribute(
  ctx: TestContext,
  resName: string,
  finalize: boolean,
  attributes: readonly [string, string][],
  childInstructions: readonly any[],
  siblingInstructions: readonly any[],
  nestedElInstructions: readonly any[],
  childOutput?,
  childInput?,
): [PartialCustomAttributeDefinition, PartialCustomAttributeDefinition] {
  const instruction = {
    type: TT.hydrateAttribute,
    res: resName,
    instructions: childInstructions
  };
  const attributeMarkup = attributes.map(a => `${a[0]}: ${a[1]};`).join('');
  const rawMarkup = `<div ${resName}="${attributeMarkup}">${(childInput && childInput.template) || ''}</div>`;
  const input = {
    name: 'unnamed',
    template: finalize ? `<div>${rawMarkup}</div>` : rawMarkup,
    instructions: []
  };
  const outputMarkup = ctx.createElementFromMarkup(`<div ${resName}="${attributeMarkup}">${(childOutput && childOutput.template.outerHTML) || ''}</div>`);
  outputMarkup.classList.add('au');
  const output = {
    ...defaultCustomElementDefinitionProperties,
    name: 'unnamed',
    key: 'au:resource:custom-element:unnamed',
    template: finalize ? ctx.createElementFromMarkup(`<template><div>${outputMarkup.outerHTML}</div></template>`) : outputMarkup,
    instructions: [[instruction, ...siblingInstructions], ...nestedElInstructions],
    needsCompile: false,
    enhance: false,
    projectionsMap: new Map<IInstruction, IProjections>(),
    watches: [],
    processContent: null,
  };
  return [input, output];
}

const commandToMode = {
  'one-time': BindingMode.oneTime,
  'to-view': BindingMode.toView,
  'from-view': BindingMode.fromView,
  'two-way': BindingMode.twoWay
};

const validCommands = ['bind', 'one-time', 'to-view', 'from-view', 'two-way', 'trigger', 'delegate', 'capture', 'call'];

function createAttributeInstruction(bindableDescription: BindableDefinition | null, attributeName: string, attributeValue: string, isMulti: boolean) {
  const parts = attributeName.split('.');
  const attr = parts[0];
  const cmd = parts.pop();
  const defaultMode = !!bindableDescription ? (bindableDescription.mode === BindingMode.default ? BindingMode.toView : bindableDescription.mode) : BindingMode.toView;
  const mode = commandToMode[cmd] || defaultMode;

  if (!!bindableDescription) {
    if (!!cmd && validCommands.includes(cmd)) {
      const type = TT.propertyBinding;
      const to = bindableDescription.property;
      const from = parseExpression(attributeValue);
      return { type, to, mode, from };
    } else {
      const from = parseExpression(attributeValue, BindingType.Interpolation);
      if (!!from) {
        const type = TT.interpolation;
        const to = bindableDescription.property;
        return { type, to, from };
      } else {
        const type = TT.setProperty;
        const to = bindableDescription.property;
        const value = attributeValue;
        return { type, to, value };
      }
    }
  } else {
    const type = TT.propertyBinding;
    const to = camelCase(attr);
    if (!!cmd && validCommands.includes(cmd)) {
      const from = parseExpression(attributeValue);
      return { type, to, mode, from };
    } else {
      const from = parseExpression(attributeValue, BindingType.Interpolation);
      if (!!from) {
        const type2 = TT.interpolation;
        return { type: type2, to, from };
      } else if (isMulti) {
        const type3 = TT.setProperty;
        const to3 = attr;
        const value = attributeValue;
        return { type: type3, to: to3, value };
      } else {
        return null;
      }
    }
  }
}

type CTCResult = [PartialCustomElementDefinition, PartialCustomElementDefinition];

type Bindables = { [pdName: string]: BindableDefinition };

describe(`TemplateCompiler - combinations`, function () {
  function createFixture(ctx: TestContext, ...globals: any[]) {
    const container = ctx.container;
    container.register(...globals);
    const sut = ctx.templateCompiler;
    return { container, sut };
  }

  describe('plain attributes', function () {
    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => ['div']
      ] as ((ctx: TestContext) => [string])[],
      [
        (ctx) => ['foo', 'foo', 'bar'],
        (ctx) => ['foo.bar', 'foo', 'bar'],
        (ctx) => ['foo.bind', 'foo', 'bar'],
        (ctx) => ['value', 'value', 'value']
      ] as ((ctx: TestContext, $1: [string]) => [string, string, string])[],
      [
        (ctx, $1, [, , value]) => [`ref`,                     value, { type: TT.refBinding,       from: new AccessScopeExpression(value), to: 'element' }],
        (ctx, $1, [attr, to, value]) => [`${attr}.bind`,      value, { type: TT.propertyBinding,  from: new AccessScopeExpression(value), to, mode: BindingMode.toView,   }],
        (ctx, $1, [attr, to, value]) => [`${attr}.to-view`,   value, { type: TT.propertyBinding,  from: new AccessScopeExpression(value), to, mode: BindingMode.toView,   }],
        (ctx, $1, [attr, to, value]) => [`${attr}.one-time`,  value, { type: TT.propertyBinding,  from: new AccessScopeExpression(value), to, mode: BindingMode.oneTime,  }],
        (ctx, $1, [attr, to, value]) => [`${attr}.from-view`, value, { type: TT.propertyBinding,  from: new AccessScopeExpression(value), to, mode: BindingMode.fromView, }],
        (ctx, $1, [attr, to, value]) => [`${attr}.two-way`,   value, { type: TT.propertyBinding,  from: new AccessScopeExpression(value), to, mode: BindingMode.twoWay,   }],
        (ctx, $1, [attr, to, value]) => [`${attr}.trigger`,   value, { type: HTT.listenerBinding, from: new AccessScopeExpression(value), to, strategy: DelegationStrategy.none,      preventDefault: true }],
        (ctx, $1, [attr, to, value]) => [`${attr}.delegate`,  value, { type: HTT.listenerBinding, from: new AccessScopeExpression(value), to, strategy: DelegationStrategy.bubbling,  preventDefault: false }],
        (ctx, $1, [attr, to, value]) => [`${attr}.capture`,   value, { type: HTT.listenerBinding, from: new AccessScopeExpression(value), to, strategy: DelegationStrategy.capturing, preventDefault: false }],
        (ctx, $1, [attr, to, value]) => [`${attr}.call`,      value, { type: TT.callBinding,      from: new AccessScopeExpression(value), to }]
      ] as ((ctx: TestContext, $1: [string], $2: [string, string, string]) => [string, string, any])[]
    ],                       (ctx, [el], $2, [n1, v1, i1]) => {
      const markup = `<${el} ${n1}="${v1}"></${el}>`;

      it(markup, function () {
        const input: PartialCustomElementDefinition = {
          template: markup,
          instructions: [],
          surrogates: [],
        } as unknown as PartialCustomElementDefinition;
        const expected = {
          ...defaultCustomElementDefinitionProperties,
          template: ctx.createElementFromMarkup(`<template><${el} ${n1}="${v1}" class="au"></${el}></template>`),
          instructions: [[i1]],
          surrogates: [],
          needsCompile: false,
          enhance: false,
          projectionsMap: new Map<IInstruction, IProjections>(),
          processContent: null,
        };

        const { sut, container } = createFixture(ctx);

        const actual = sut.compile(input, container, null);

        verifyBindingInstructionsEqual(actual, expected);
      });
    });
  });

  describe('custom attributes', function () {
    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      // PartialCustomAttributeDefinition.bindables
      [
        (ctx) => [undefined, undefined, 'value'],
        (ctx) => [{}, undefined,  'value'] as any,
        (ctx) => [BindableDefinition.create('asdf', { attribute: 'bazBaz', property: 'bazBaz', mode: BindingMode.oneTime }), BindingMode.oneTime, 'bazBaz'],
        (ctx) => [BindableDefinition.create('asdf', { attribute: 'bazBaz', property: 'bazBaz', mode: BindingMode.fromView }), BindingMode.fromView, 'bazBaz'],
        (ctx) => [BindableDefinition.create('asdf', { attribute: 'bazBaz', property: 'bazBaz', mode: BindingMode.twoWay }), BindingMode.twoWay, 'bazBaz'],
        (ctx) => [BindableDefinition.create('asdf', { attribute: 'bazBaz', property: 'bazBaz', mode: BindingMode.default }), BindingMode.default, 'bazBaz']
      ] as ((ctx: TestContext) => [Record<string, BindableDefinition> | undefined, BindingMode | undefined, string])[],
      [
        (ctx) => ['foo',     '', class Foo {}],
        (ctx) => ['foo-foo', '', class FooFoo {}],
        (ctx) => ['foo',     'bar', class Foo {}],
        (ctx) => ['foo-foo', 'bar', class Foo {}]
      ] as ((ctx: TestContext) => [string, string, Constructable])[],
      // PartialCustomAttributeDefinition.defaultBindingMode
      [
        (ctx) => undefined,
        (ctx) => BindingMode.oneTime,
        (ctx) => BindingMode.toView,
        (ctx) => BindingMode.fromView,
        (ctx) => BindingMode.twoWay
      ] as ((ctx: TestContext) => BindingMode | undefined)[],
      [
        (ctx, [, , to], [attr, value]) => [`${attr}`,           { type: TT.setProperty, to, value }],
        (ctx, [, mode, to], [attr, value], defaultMode) => [`${attr}.bind`,      { type: TT.propertyBinding, from: value.length > 0 ? new AccessScopeExpression(value) : new PrimitiveLiteralExpression(value), to, mode: (mode && mode !== BindingMode.default) ? mode : (defaultMode || BindingMode.toView) }],
        (ctx, [, , to],      [attr, value]) => [`${attr}.to-view`,   { type: TT.propertyBinding, from: value.length > 0 ? new AccessScopeExpression(value) : new PrimitiveLiteralExpression(value), to, mode: BindingMode.toView }],
        (ctx, [, , to],      [attr, value]) => [`${attr}.one-time`,  { type: TT.propertyBinding, from: value.length > 0 ? new AccessScopeExpression(value) : new PrimitiveLiteralExpression(value), to, mode: BindingMode.oneTime }],
        (ctx, [, , to],      [attr, value]) => [`${attr}.from-view`, { type: TT.propertyBinding, from: value.length > 0 ? new AccessScopeExpression(value) : new PrimitiveLiteralExpression(value), to, mode: BindingMode.fromView }],
        (ctx, [, , to],      [attr, value]) => [`${attr}.two-way`,   { type: TT.propertyBinding, from: value.length > 0 ? new AccessScopeExpression(value) : new PrimitiveLiteralExpression(value), to, mode: BindingMode.twoWay }]
      ] as ((ctx: TestContext, $1: [Record<string, BindableDefinition>, BindingMode, string], $2: [string, string, Constructable], $3: BindingMode) => [string, any])[]
    ],                       (ctx, [bindables], [attr, value, ctor], defaultBindingMode, [name, childInstruction]) => {
      const def = { name: attr, defaultBindingMode, bindables };
      const markup = `<div ${name}="${value}"></div>`;

      it(`${markup}  CustomAttribute=${JSON.stringify(def)}`, function () {
        const input: PartialCustomElementDefinition = {
          template: markup,
          instructions: [],
          surrogates: [],
        } as unknown as PartialCustomElementDefinition;
        const instruction = {
          type: TT.hydrateAttribute,
          res: def.name,
          instructions: [childInstruction],
        };
        const expected = {
          ...defaultCustomElementDefinitionProperties,
          template: ctx.createElementFromMarkup(`<template><div ${name}="${value}" class="au"></div></template>`),
          instructions: [[instruction]],
          surrogates: [],
          needsCompile: false,
          enhance: false,
          projectionsMap: new Map<IInstruction, IProjections>(),
          watches: [],
          processContent: null,
        };

        const $def = CustomAttribute.define(def, ctor);
        const { sut, container } = createFixture(ctx, $def);

        const actual = sut.compile(input, container, null);

        verifyBindingInstructionsEqual(actual, expected);
      });
    });
  });

  describe('custom attributes with multiple bindings', function () {

    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => 'foo',
        (ctx) => 'bar42'
      ] as ((ctx: TestContext) => string)[],
      [
        (ctx, pdName) => pdName,
        (ctx, pdName) => `${pdName}Bar` // descriptor.property is different from the actual property name
      ] as ((ctx: TestContext, $1: string) => string)[],
      [
        (ctx, pdName, pdProp) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: kebabCase(pdProp), mode: BindingMode.default  }) }),
        (ctx, pdName, pdProp) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: kebabCase(pdProp), mode: BindingMode.oneTime  }) }),
        (ctx, pdName, pdProp) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: kebabCase(pdProp), mode: BindingMode.toView   }) }),
        (ctx, pdName, pdProp) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: kebabCase(pdProp), mode: BindingMode.fromView }) }),
        (ctx, pdName, pdProp) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: kebabCase(pdProp), mode: BindingMode.twoWay   }) })
      ] as ((ctx: TestContext, $1: string, $2: string) => Bindables)[],
      [
        (ctx) => [``,           `''`],
        (ctx) => [``,           `\${a}`],
        (ctx) => [`.bind`,      `''`],
        (ctx) => [`.one-time`,  `''`],
        (ctx) => [`.to-view`,   `''`],
        (ctx) => [`.from-view`, `''`],
        (ctx) => [`.two-way`,   `''`]
      ] as ((ctx: TestContext) => [string, string])[],
      [
        (ctx, pdName, pdProp, bindables, [cmd]) => [bindables[pdName], `${pdProp}${cmd}`],
        (ctx, pdName, pdProp, bindables, [cmd]) => [bindables[pdName], `${pdProp}.qux${cmd}`],
        (ctx, pdName, pdProp, bindables, [cmd]) => [null,              `${pdProp}Qux${cmd}`]
        // TODO: test fallback to attribute name when no matching binding exists (or throw if we don't want to support this)
      ] as ((ctx: TestContext, $1: string, $2: string, $3: Bindables, $4: [string, string]) => [BindableDefinition, string])[]
    ],                       (ctx, pdName, pdProp, bindables, [cmd, attrValue], [bindableDescription, attrName]) => {
      it(`div - pdName=${pdName}  pdProp=${pdProp}  cmd=${cmd}  attrName=${attrName}  attrValue="${attrValue}"`, function () {

        const { sut, container } = createFixture(
          ctx,
          CustomAttribute.define({ name: 'asdf', bindables }, class FooBar {})
        );

        const instruction = createAttributeInstruction(bindableDescription, attrName, attrValue, true);

        const [input, output] = createCustomAttribute(ctx, 'asdf', true, [[attrName, attrValue]], [instruction], [], []) as [PartialCustomElementDefinition, PartialCustomElementDefinition];

        if (attrName.endsWith('.qux')) {
          let e;
          try {
            sut.compile(input, container, null);
          } catch (err) {
            // console.log('EXPECTED: ', JSON.stringify(output.instructions[0][0], null, 2));
            // console.log('ACTUAL: ', JSON.stringify(actual.instructions[0][0], null, 2));
            e = err;
          }
          assert.instanceOf(e, Error);
        } else {
          // enableTracing();
          // Tracer.enableLiveLogging(SymbolTraceWriter);
          const actual = sut.compile(input, container, null);
          // console.log('\n'+stringifyTemplateDefinition(actual, 0));
          // disableTracing();
          try {
            verifyBindingInstructionsEqual(actual, output);
          } catch (err) {
            // console.log('EXPECTED: ', JSON.stringify(output.instructions[0][0], null, 2));
            // console.log('ACTUAL: ', JSON.stringify(actual.instructions[0][0], null, 2));
            throw err;
          }
        }
      });
    });
  });

  describe('nested template controllers (one per element)', function () {

    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => createTemplateController(ctx, 'foo',        'foo',    '',              'div',      false),
        (ctx) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'div',      false),
        (ctx) => createTemplateController(ctx, 'if.bind',    'if',     'show',          'div',      false),
        (ctx) => createTemplateController(ctx, 'if.bind',    'if',     'show',          'template', false),
        (ctx) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      false),
        (ctx) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false)
      ] as ((ctx: TestContext) => CTCResult)[],
      [
        (ctx, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    '',              'div',      false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'div',      false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'if.bind',    'if',     'show',          'div',      false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'else',       'else',   '',              'div',      false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'else',       'else',   '',              'template', false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'with.bind',  'with',   'foo',           'div',      false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'with.bind',  'with',   'foo',           'template', false, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult) => CTCResult)[],
      [
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    '',              'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'template', false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult, $2: CTCResult) => CTCResult)[],
      [
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'bar',        'bar',    '',              'div',      true, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'bar',        'bar',    'baz',           'div',      true, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'bar',        'bar',    'baz',           'template', true, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      true, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', true, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult, $2: CTCResult, $3: CTCResult) => CTCResult)[]
    ],                       (ctx, $1, $2, $3, [input, output]) => {

      it(`${input.template}`, function () {

        const { sut, container } = createFixture(
          ctx,
          CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo {}),
          CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar {}),
          CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz {}),
          CustomAttribute.define({ name: 'qux', isTemplateController: true }, class Qux {})
        );

        const actual = sut.compile(input, container, null);
        try {
          verifyBindingInstructionsEqual(actual, output);
        } catch (err) {
          // console.log('EXPECTED: ', JSON.stringify(output.instructions[0][0], null, 2));
          // console.log('ACTUAL: ', JSON.stringify(actual.instructions[0][0], null, 2));
          throw err;
        }
      });
    });
  });

  describe('nested template controllers (multiple per element)', function () {

    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => createTemplateController(ctx, 'foo',        'foo',    '',              'div',      false),
        (ctx) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'div',      false),
        (ctx) => createTemplateController(ctx, 'if.bind',    'if',     'show',          'div',      false),
        (ctx) => createTemplateController(ctx, 'if.bind',    'if',     'show',          'template', false),
        (ctx) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      false),
        (ctx) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false)
      ] as ((ctx: TestContext) => CTCResult)[],
      [
        (ctx, [input, output]) => createTemplateController(ctx, 'bar',        'bar',    '',              null,       false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'else',       'else',   '',              null,       false, output.instructions[0][0], input.template),
        (ctx, [input, output]) => createTemplateController(ctx, 'with.bind',  'with',   'foo',           null,       false, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult) => CTCResult)[],
      [
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    '',              'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'foo',        'foo',    'bar',           'template', false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'baz',        'baz',    '',              null,       false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult, $2: CTCResult) => CTCResult)[],
      [
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'qux',        'qux',    '',              null,       false, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'if.bind',    'if',     '',              'template', false, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'if.bind',    'if',     '',              'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div',      false, output.instructions[0][0], input.template),
        (ctx, $1, $2, [input, output]) => createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult, $2: CTCResult, $3: CTCResult) => CTCResult)[],
      [
        (ctx, $1, $2, $3, [input, output]) => createTemplateController(ctx, 'quux',       'quux',   '',              null,       true, output.instructions[0][0], input.template)
      ] as ((ctx: TestContext, $1: CTCResult, $2: CTCResult, $3: CTCResult, $4: CTCResult) => CTCResult)[]
    ],
    (ctx, $1, $2, $3, $4, [input, output]) => {

      it(`${input.template}`, function () {

        const { sut, container } = createFixture(
          ctx,
          CustomAttribute.define({ name: 'foo',  isTemplateController: true }, class Foo {}),
          CustomAttribute.define({ name: 'bar',  isTemplateController: true }, class Bar {}),
          CustomAttribute.define({ name: 'baz',  isTemplateController: true }, class Baz {}),
          CustomAttribute.define({ name: 'qux',  isTemplateController: true }, class Qux {}),
          CustomAttribute.define({ name: 'quux', isTemplateController: true }, class Quux {})
        );

        const actual = sut.compile(input, container, null);
        try {
          verifyBindingInstructionsEqual(actual, output);
        } catch (err) {
          // console.log('EXPECTED: ', JSON.stringify(output.instructions[0][0], null, 2));
          // console.log('ACTUAL: ', JSON.stringify(actual.instructions[0][0], null, 2));
          throw err;
        }
      });
    });
  });

  describe('sibling template controllers', function () {

    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => []
      ] as ((ctx: TestContext) => CTCResult[])[],
      [
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    '',              'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    '',              'template', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    'bar',           'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'if.bind',    'if',     'show',          'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div', false)); }
      ] as ((ctx: TestContext, results: CTCResult[]) => void)[],
      [
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    '',              'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    'bar',           'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'if.bind',    'if',     'show',          'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'if.bind',    'if',     'show',          'template', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'else',       'else',   '',              'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'with.bind',  'with',   'bar',           'div', false)); }
      ] as ((ctx: TestContext, results: CTCResult[]) => void)[],
      [
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    '',              'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'foo',        'foo',    'bar',           'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'div', false)); },
        (ctx, results: CTCResult[]) => { results.push(createTemplateController(ctx, 'repeat.for', 'repeat', 'item of items', 'template', false)); }
      ] as ((ctx: TestContext, results: CTCResult[]) => void)[]
    ],                       (ctx, [[input1, output1], [input2, output2], [input3, output3]]) => {
      const input: PartialCustomElementDefinition = {
        template: `<div>${input1.template}${input2.template}${input3.template}</div>`,
        instructions: []
      } as unknown as PartialCustomElementDefinition;

      it(`${input.template}`, function () {

        const { sut, container } = createFixture(
          ctx,
          CustomAttribute.define({ name: 'foo', isTemplateController: true }, class Foo {}),
          CustomAttribute.define({ name: 'bar', isTemplateController: true }, class Bar {}),
          CustomAttribute.define({ name: 'baz', isTemplateController: true }, class Baz {})
        );

        const output = {
          ...defaultCustomElementDefinitionProperties,
          template: ctx.createElementFromMarkup(`<template><div>${output1.template['outerHTML']}${output2.template['outerHTML']}${output3.template['outerHTML']}</div></template>`),
          instructions: [output1.instructions[0], output2.instructions[0], output3.instructions[0]],
          needsCompile: false,
          enhance: false,
          projectionsMap: new Map<IInstruction, IProjections>(),
          watches: [],
          processContent: null,
        };
        // enableTracing();
        // Tracer.enableLiveLogging(SymbolTraceWriter);
        const actual = sut.compile(input, container, null);
        // console.log('\n'+stringifyTemplateDefinition(actual, 0));
        // disableTracing();
        try {
          verifyBindingInstructionsEqual(actual, output);
        } catch (err) {
          // console.log('EXPECTED: ', JSON.stringify(output.instructions, null, 2));
          // console.log('ACTUAL: ', JSON.stringify(actual.instructions, null, 2));
          throw err;
        }
      });
    });
  });

  describe('attributes on custom elements', function () {
    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => 'foo',
        (ctx) => 'bar42'
      ] as ((ctx: TestContext) => string)[],
      [
        (ctx, pdName) => pdName,
        (ctx, pdName) => `${pdName}Bar` // descriptor.property is different from the actual property name
      ] as ((ctx: TestContext, $1: string) => string)[],
      [
        (ctx, pdName, pdProp) => kebabCase(pdProp),
        (ctx, pdName, pdProp) => `${kebabCase(pdProp)}-baz` // descriptor.attribute is different from kebab-cased descriptor.property
      ] as ((ctx: TestContext, $1: string, $2: string) => string)[],
      [
        (ctx, pdName, pdProp, pdAttr) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: pdAttr, mode: BindingMode.default  }) }),
        (ctx, pdName, pdProp, pdAttr) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: pdAttr, mode: BindingMode.oneTime  }) }),
        (ctx, pdName, pdProp, pdAttr) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: pdAttr, mode: BindingMode.toView   }) }),
        (ctx, pdName, pdProp, pdAttr) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: pdAttr, mode: BindingMode.fromView }) }),
        (ctx, pdName, pdProp, pdAttr) => ({ [pdName]: BindableDefinition.create(pdName, { property: pdProp, attribute: pdAttr, mode: BindingMode.twoWay   }) })
      ] as ((ctx: TestContext, $1: string, $2: string, $3: string) => Bindables)[],
      [
        (ctx) => [``,           `''`],
        (ctx) => [``,           `\${a}`],
        (ctx) => [`.bind`,      `''`],
        (ctx) => [`.one-time`,  `''`],
        (ctx) => [`.to-view`,   `''`],
        (ctx) => [`.from-view`, `''`],
        (ctx) => [`.two-way`,   `''`]
      ] as ((ctx: TestContext) => [string, string])[],
      [
        (ctx, pdName, pdProp, pdAttr, bindables, [cmd]) => [bindables[pdName], `${pdAttr}${cmd}`],
        (ctx, pdName, pdProp, pdAttr, bindables, [cmd]) => [bindables[pdName], `${pdAttr}.qux${cmd}`],
        (ctx, pdName, pdProp, pdAttr, bindables, [cmd]) => [null,              `${pdAttr}-qux${cmd}`]
      ] as ((ctx: TestContext, $1: string, $2: string, $3: string, $4: Bindables, $5: [string, string]) => [BindableDefinition, string])[],
      [
        (ctx) => `''`
      ] as ((ctx: TestContext) => string)[]
    ],
    (ctx, pdName, pdProp, pdAttr, bindables, [cmd, attrValue], [bindableDescription, attrName]) => {
      it(`customElement - pdName=${pdName}  pdProp=${pdProp}  pdAttr=${pdAttr}  cmd=${cmd}  attrName=${attrName}  attrValue="${attrValue}"`, function () {

        const { sut, container } = createFixture(
          ctx,
          CustomElement.define({ name: 'foobar', bindables }, class FooBar {})
        );

        const instruction = createAttributeInstruction(bindableDescription, attrName, attrValue, false);
        const instructions = instruction == null ? [] : [instruction];
        const childInstructions = !!bindableDescription ? instructions : [];
        const siblingInstructions = !bindableDescription ? instructions : [];

        const [input, output] = createCustomElement(ctx, 'foobar', true, [[attrName, attrValue]], childInstructions, siblingInstructions, []) as [PartialCustomElementDefinition, PartialCustomElementDefinition];

        if (attrName.endsWith('.qux')) {
          let e;
          try {
            sut.compile(input, container, null);
          } catch (err) {
            // console.log('EXPECTED: ', JSON.stringify(output.instructions[0][0], null, 2));
            // console.log('ACTUAL: ', JSON.stringify(actual.instructions[0][0], null, 2));
            e = err;
          }
          assert.instanceOf(e, Error);
        } else {
          // enableTracing();
          // Tracer.enableLiveLogging(SymbolTraceWriter);
          const actual = sut.compile(input, container, null);
          // console.log('\n'+stringifyTemplateDefinition(actual, 0));
          // disableTracing();
          try {
            verifyBindingInstructionsEqual(actual, output);
          } catch (err) {
            // console.log('EXPECTED: ', JSON.stringify(output.instructions[0][0], null, 2));
            // console.log('ACTUAL: ', JSON.stringify(actual.instructions[0][0], null, 2));
            throw err;
          }
        }
      });
    });
  });

  describe('custom elements', function () {
    eachCartesianJoinFactory([
      [
        TestContext.create
      ],
      [
        (ctx) => createCustomElement(ctx, `foo`, true, [], [], [], []),
        (ctx) => createCustomElement(ctx, `bar`, true, [], [], [], []),
        (ctx) => createCustomElement(ctx, `baz`, true, [], [], [], [])
      ] as ((ctx: TestContext) => CTCResult)[]
      // <(($1: CTCResult) => CTCResult)[]>[
      //   ([input, output]) => createCustomElement(`foo`, false, [], [], [], output.instructions, output, input),
      //   ([input, output]) => createCustomElement(`bar`, false, [], [], [], output.instructions, output, input),
      //   ([input, output]) => createCustomElement(`baz`, false, [], [], [], output.instructions, output, input)
      // ],
      // <(($1: CTCResult, $2: CTCResult) => CTCResult)[]>[
      //   ($1, [input, output]) => createCustomElement(`foo`, true, [], [], [], output.instructions, output, input),
      //   ($1, [input, output]) => createCustomElement(`bar`, true, [], [], [], output.instructions, output, input),
      //   ($1, [input, output]) => createCustomElement(`baz`, true, [], [], [], output.instructions, output, input)
      // ]
      // ], ($1, $2, [input, output]) => {
    ],
    (ctx, [input, output]) => {
      it(`${input.template}`, function () {

        const { sut, container } = createFixture(
          ctx,
          CustomElement.define({ name: 'foo' }, class Foo {}),
          CustomElement.define({ name: 'bar' }, class Bar {}),
          CustomElement.define({ name: 'baz' }, class Baz {})
        );

        // enableTracing();
        // Tracer.enableLiveLogging(SymbolTraceWriter);
        const actual = sut.compile(input, container, null);
        // console.log('\n'+stringifyTemplateDefinition(actual, 0));
        // disableTracing();
        try {
          verifyBindingInstructionsEqual(actual, output);
        } catch (err) {
          console.log('EXPECTED: ', JSON.stringify(output.instructions, null, 2));
          console.log('ACTUAL: ', JSON.stringify(actual.instructions, null, 2));
          throw err;
        }
      });
    });
  });
});

describe('TemplateCompiler - local templates', function () {
  class EventLog implements ISink {
    public readonly log: ILogEvent[] = [];
    public handleEvent(event: ILogEvent): void {
      this.log.push(event);
    }
  }
  function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;
    container.register(LoggerConfiguration.create({ sinks: [EventLog] }));
    const sut = ctx.templateCompiler;
    return { ctx, container, sut };
  }

  class LocalTemplateTestData {

    public constructor(
      public readonly template: string,
      private readonly expectedResources: Map<string, ElementInfo>,
      private readonly templateFreq: Map<string, number>,
      public readonly expectedContent: string,
    ) {
      this.verifyDefinition = this.verifyDefinition.bind(this);
    }
    public verifyDefinition(definition: CustomElementDefinition, container: IContainer): void {
      assert.equal((definition.template as HTMLTemplateElement).querySelector('template[as-custom-element]'), null);

      for (const [name, info] of this.expectedResources) {
        assert.deepStrictEqual(ElementInfo.from(container.find(CustomElement, name), void 0), info, 'element info');
      }
      const ceInstructions: HydrateElementInstruction[] = definition.instructions.flatMap((i) => i).filter((i) => i instanceof HydrateElementInstruction) as HydrateElementInstruction[];
      for (const [template, freq] of this.templateFreq) {
        assert.strictEqual(ceInstructions.filter((i) => i.res === template).length, freq, 'HydrateElementInstruction.freq');
      }
    }

  }
  function* getLocalTemplateTestData() {
    yield new LocalTemplateTestData(
      `<template as-custom-element="foo-bar">static</template>
      <foo-bar></foo-bar>`,
      new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)]]),
      new Map([['foo-bar', 1]]),
      'static'
    );
    yield new LocalTemplateTestData(
      `<foo-bar></foo-bar>
      <template as-custom-element="foo-bar">static</template>`,
      new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)]]),
      new Map([['foo-bar', 1]]),
      'static'
    );
    yield new LocalTemplateTestData(
      `<foo-bar></foo-bar>
      <template as-custom-element="foo-bar">static</template>
      <foo-bar></foo-bar>`,
      new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)]]),
      new Map([['foo-bar', 2]]),
      'static static'
    );
    yield new LocalTemplateTestData(
      `<template as-custom-element="foo-bar">static foo-bar</template>
      <template as-custom-element="fiz-baz">static fiz-baz</template>
      <fiz-baz></fiz-baz>
      <foo-bar></foo-bar>`,
      new Map([['foo-bar', new ElementInfo('foo-bar', void 0, false)], ['fiz-baz', new ElementInfo('fiz-baz', void 0, false)]]),
      new Map([['foo-bar', 1], ['fiz-baz', 1]]),
      'static fiz-baz static foo-bar'
    );
    const bindingModeMap = new Map([
      ['oneTime', BindingMode.oneTime],
      ['toView', BindingMode.toView],
      ['fromView', BindingMode.fromView],
      ['twoWay', BindingMode.twoWay],
      ['default', BindingMode.toView],
    ]);
    for (const [bindingMode, props, attributeName] of generateCartesianProduct([
      [...bindingModeMap.keys(), void 0],
      [['prop'], ['prop', 'camelProp']],
      ['fiz-baz', undefined],
    ])) {
      const ei = new ElementInfo('foo-bar', void 0, false);
      const mode = bindingModeMap.get(bindingMode) ?? BindingMode.toView;
      let bindables = '';
      let templateBody = '';
      let attrExpr = '';
      let renderedContent = '';
      const value = "awesome possum";
      for (let i = 0, ii = props.length; i < ii; i++) {
        const prop = props[i];
        const bi = new BindableInfo(prop, mode);
        const attr = kebabCase(attributeName !== void 0 ? `${attributeName}${i + 1}` : prop);
        ei.bindables[attr] = bi;

        bindables += `<bindable property='${prop}'${bindingMode !== void 0 ? ` mode="${bindingMode}"` : ''}${attributeName !== void 0 ? ` attribute="${attr}"` : ''}></bindable>`;
        templateBody += ` \${${prop}}`;
        const content = `${value}${i + 1}`;
        attrExpr += ` ${attr}="${content}"`;
        renderedContent += ` ${content}`;
      }

      yield new LocalTemplateTestData(
        `<template as-custom-element="foo-bar">
            ${bindables}
            ${templateBody}
          </template>
          <foo-bar ${attrExpr}></foo-bar>`,
        new Map([['foo-bar', ei]]),
        new Map([['foo-bar', 1]]),
        renderedContent.trim()
      );
    }
  }
  for (const { template, verifyDefinition, expectedContent } of getLocalTemplateTestData()) {
    it(template, function () {
      const { container, sut } = createFixture();
      const definition = sut.compile({ name: 'lorem-ipsum', template }, container, null);
      verifyDefinition(definition, container);
    });
    if (template.includes(`mode="fromView"`)) { continue; }
    it(`${template} - content`, async function () {
      const { ctx, container } = createFixture();
      const host = ctx.doc.createElement('div');
      ctx.doc.body.appendChild(host);
      const au = new Aurelia(container)
        .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class { }) });

      await au.start();

      assert.html.textContent(host, expectedContent);

      await au.stop();
      ctx.doc.body.removeChild(host);
      au.dispose();
    });
  }

  it('works with if', async function () {
    const template = `<template as-custom-element="foo-bar">
    <bindable property='prop'></bindable>
    \${prop}
   </template>
   <foo-bar prop="awesome possum" if.bind="true"></foo-bar>
   <foo-bar prop="ignored" if.bind="false"></foo-bar>`;
    const expectedContent = "awesome possum";

    const { ctx, container } = createFixture();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container)
      .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class { }) });

    await au.start();

    assert.html.textContent(host, expectedContent);

    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
  });

  it('works with for', async function () {
    const template = `<template as-custom-element="foo-bar">
    <bindable property='prop'></bindable>
    \${prop}
   </template>
   <foo-bar repeat.for="i of 5" prop.bind="i"></foo-bar>`;
    const expectedContent = "0 1 2 3 4";

    const { ctx, container } = createFixture();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container)
      .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class { }) });

    await au.start();

    assert.html.textContent(host, expectedContent);

    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
  });

  it('works with nested templates - 1', async function () {
    @customElement({ name: 'level-one', template: `<template as-custom-element="foo-bar"><bindable property='prop'></bindable>Level One \${prop}</template><foo-bar prop.bind="prop"></foo-bar>` })
    class LevelOne {
      @bindable public prop: string;
    }
    @customElement({
      name: 'level-two', template: `
    <template as-custom-element="foo-bar">
      <bindable property='prop'></bindable>
      Level Two \${prop}
      <level-one prop="inter-dimensional portal"></level-one>
    </template>
    <foo-bar prop.bind="prop"></foo-bar>
    <level-one prop.bind="prop"></level-one>
    `})
    class LevelTwo {
      @bindable public prop: string;
    }
    const template = `<level-two prop="foo2"></level-two><level-one prop="foo1"></level-one>`;
    const expectedContent = "Level Two foo2 Level One inter-dimensional portal Level One foo2 Level One foo1";

    const { ctx, container } = createFixture();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container)
      .register(LevelOne, LevelTwo)
      .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class { }) });

    await au.start();

    assert.html.textContent(host, expectedContent);

    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
  });

  it('works with nested templates - 2', async function () {
    const template = `
    <template as-custom-element="el-one">
      <template as-custom-element="one-two">
        1
      </template>
      2
      <one-two></one-two>
    </template>
    <template as-custom-element="el-two">
      <template as-custom-element="two-two">
        3
      </template>
      4
      <two-two></two-two>
    </template>
    <el-two></el-two>
    <el-one></el-one>
    `;
    const expectedContent = "4 3 2 1";

    const { ctx, container } = createFixture();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);
    const au = new Aurelia(container)
      .app({ host, component: CustomElement.define({ name: 'lorem-ipsum', template }, class { }) });

    await au.start();

    assert.html.textContent(host, expectedContent);

    await au.stop();
    ctx.doc.body.removeChild(host);
    au.dispose();
  });

  it('throws error if a root template is a local template', function () {
    const template = `<template as-custom-element="foo-bar">I have local root!</template>`;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The root cannot be a local template itself.');
  });

  it('throws error if the custom element has only local templates', function () {
    const template = `
    <template as-custom-element="foo-bar">Does this work?</template>
    <template as-custom-element="fiz-baz">Of course not!</template>
    `;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The custom element does not have any content other than local template(s).');
  });

  it('throws error if a local template is not under root', function () {
    const template = `<div><template as-custom-element="foo-bar">Can I hide here?</template></div>`;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Local templates needs to be defined directly under root.');
  });

  it('throws error if a local template does not have name', function () {
    const template = `<template as-custom-element="">foo-bar</template><div></div>`;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The value of "as-custom-element" attribute cannot be empty for local template');
  });

  it('throws error if a duplicate local templates are found', function () {
    const template = `<template as-custom-element="foo-bar">foo-bar1</template><template as-custom-element="foo-bar">foo-bar2</template><div></div>`;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Duplicate definition of the local template named foo-bar');
  });

  it('throws error if bindable is not under root', function () {
    const template = `<template as-custom-element="foo-bar">
      <div>
        <bindable property="prop"></bindable>
      </div>
    </template>
    <div></div>`;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'Bindable properties of local templates needs to be defined directly under root.');
  });

  it('throws error if bindable property is missing', function () {
    const template = `<template as-custom-element="foo-bar">
      <bindable attribute="prop"></bindable>
    </template>
    <div></div>`;
    const { container, sut } = createFixture();
    assert.throws(() => sut.compile({ name: 'lorem-ipsum', template }, container, null), 'The attribute \'property\' is missing in <bindable attribute="prop"></bindable>');
  });

  it('throws error if duplicate bindable properties are found', function () {
    const template = `<template as-custom-element="foo-bar">
      <bindable property="prop" attribute="bar"></bindable>
      <bindable property="prop" attribute="baz"></bindable>
    </template>
    <div></div>`;
    const { container, sut } = createFixture();
    assert.throws(
      () => sut.compile({ name: 'lorem-ipsum', template }, container, null),
      'Bindable property and attribute needs to be unique; found property: prop, attribute: '
    );
  });

  it('throws error if duplicate bindable attributes are found', function () {
    const template = `<template as-custom-element="foo-bar">
      <bindable property="prop1" attribute="bar"></bindable>
      <bindable property="prop2" attribute="bar"></bindable>
    </template>
    <div></div>`;
    const { container, sut } = createFixture();
    assert.throws(
      () => sut.compile({ name: 'lorem-ipsum', template }, container, null),
      'Bindable property and attribute needs to be unique; found property: prop2, attribute: bar'
    );
  });

  for (const attr of ['if.bind="true"', 'if.bind="false"', 'else', 'repeat.for="item of items"', 'with.bind="{a:1}"', 'switch.bind="cond"', 'case="case1"']) {
    it(`throws error if local-template surrogate has template controller - ${attr}`, function () {
      const template = `<template as-custom-element="foo-bar" ${attr}>
      <bindable property="prop1" attribute="bar"></bindable>
    </template>
    <foo-bar></foo-bar>`;
      const { ctx, container } = createFixture();

      assert.throws(() =>
        new Aurelia(container)
          .app({ host: ctx.doc.createElement('div'), component: CustomElement.define({ name: 'lorem-ipsum', template }, class { }) }),
        /Cannot have template controller on surrogate element./
      );
    });
  }

  it('warns if bindable element has more attributes other than the allowed', function () {
    const template = `<template as-custom-element="foo-bar">
      <bindable property="prop" unknown-attr who-cares="no one"></bindable>
    </template>
    <div></div>`;
    const { container, sut } = createFixture();

    sut.compile({ name: 'lorem-ipsum', template }, container, null);
    const sinks = container.get(DefaultLogger)['warnSinks'] as ISink[];
    const eventLog = sinks.find((s) => s instanceof EventLog) as EventLog;
    assert.strictEqual(eventLog.log.length, 1, `eventLog.log.length`);
    const event = eventLog.log[0];
    assert.strictEqual(event.severity, LogLevel.warn);
    assert.includes(
      event.toString(),
      'The attribute(s) unknown-attr, who-cares will be ignored for <bindable property="prop" unknown-attr="" who-cares="no one"></bindable>. Only property, attribute, mode are processed.'
    );
  });

});

describe('TemplateCompiler - au-slot', function () {
  function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;
    const sut = ctx.templateCompiler;
    return { ctx, container, sut };
  }
  function $createCustomElement(template: string, name: string = 'my-element') {
    return CustomElement.define({ name, isStrictBinding: true, template, bindables: { people: { mode: BindingMode.default } }, }, class MyElement { });
  }
  type ProjectionMap = Map<IInstruction, Record<string, CustomElementDefinition>>;

  class ExpectedSlotInfo {
    public constructor(
      public readonly slotName: string,
      public readonly contentType: AuSlotContentType,
      public readonly content: string,
      public readonly scope: Scope | null = null,
    ) { }
  }
  class TestData {
    public constructor(
      public readonly template: string,
      public readonly customElements: CustomElementType[],
      public readonly partialTargetedProjections: [Scope, Record<string, string>] | null,
      public readonly expectedProjections: [string, Record<string, string>][],
      public readonly expectedSlotInfos: ExpectedSlotInfo[],
    ) {
      this.getTargetedProjections = this.getTargetedProjections.bind(this);
    }

    public getTargetedProjections(factory: ITemplateElementFactory) {
      if (this.partialTargetedProjections === null) { return null; }
      const [scope, projections] = this.partialTargetedProjections;
      return new RegisteredProjections(
        scope,
        Object.entries(projections)
          .reduce((acc: Record<string, CustomElementDefinition>, [key, template]) => {
            acc[key] = CustomElementDefinition.create({ name: CustomElement.generateName(), template: factory.createTemplate(template), needsCompile: false });
            return acc;
          }, Object.create(null))
      );
    }
  }
  function* getTestData() {
    yield new TestData(
      `<my-element><div au-slot></div></my-element>`,
      [$createCustomElement('')],
      null,
      [['my-element', { 'default': '<div></div>' }]],
      [],
    );
    yield new TestData(
      `<my-element><div au-slot="s1">p1</div><div au-slot="s2">p2</div></my-element>`,
      [$createCustomElement('')],
      null,
      [['my-element', { 's1': '<div>p1</div>', 's2': '<div>p2</div>' }]],
      [],
    );
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><au-slot name="s2"><div>s2fb</div></au-slot>`,
      [],
      null,
      [],
      [
        new ExpectedSlotInfo('s1', AuSlotContentType.Fallback, 's1fb'),
        new ExpectedSlotInfo('s2', AuSlotContentType.Fallback, '<div>s2fb</div>'),
      ],
    );
    const scope1 = createScopeForTest();
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><au-slot name="s2"><div>s2fb</div></au-slot>`,
      [],
      [scope1, { s1: '<span>s1p</span>' }],
      [],
      [
        new ExpectedSlotInfo('s1', AuSlotContentType.Projection, '<span>s1p</span>', scope1),
        new ExpectedSlotInfo('s2', AuSlotContentType.Fallback, '<div>s2fb</div>'),
      ],
    );
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><au-slot name="s2"><div>s2fb</div></au-slot>`,
      [],
      [scope1, { s1: '<span>s1p</span>', s2: '<div><span>s2p</span></div>' }],
      [],
      [
        new ExpectedSlotInfo('s1', AuSlotContentType.Projection, '<span>s1p</span>', scope1),
        new ExpectedSlotInfo('s2', AuSlotContentType.Projection, '<div><span>s2p</span></div>', scope1),
      ],
    );
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><my-element><div au-slot>p</div></my-element>`,
      [$createCustomElement('')],
      [scope1, { s1: '<span>s1p</span>' }],
      [['my-element', { 'default': '<div>p</div>' }]],
      [
        new ExpectedSlotInfo('s1', AuSlotContentType.Projection, '<span>s1p</span>', scope1),
      ],
    );
  }
  for (const { customElements, template, getTargetedProjections, expectedProjections, expectedSlotInfos } of getTestData()) {
    it(`compiles - ${template}`, function () {
      const { sut, container } = createFixture();
      container.register(AuSlot, ...customElements);
      const factory = container.get(ITemplateElementFactory);

      const compiledDefinition = sut.compile(
        CustomElementDefinition.create({ name: 'my-ce', template }, class MyCe { }),
        container,
        getTargetedProjections(factory)
      );

      const actual = Array.from(compiledDefinition.projectionsMap);
      const ii = actual.length;
      assert.strictEqual(ii, expectedProjections.length, 'actual.size');
      for (let i = 0; i < ii; i++) {
        const [ceName, ep] = expectedProjections[i];
        const [instruction, ap] = actual[i];
        assert.includes((instruction as HydrateElementInstruction).res, ceName);
        assert.deepStrictEqual(Object.keys(ap), Object.keys(ep));
        for (const [key, { template: actualTemplate }] of Object.entries(ap)) {
          assert.deepStrictEqual((actualTemplate as HTMLTemplateElement).outerHTML, `<template>${ep[key]}</template>`, 'projections');
        }
      }

      const allInstructions = compiledDefinition.instructions.flat();
      for (const expectedSlotInfo of expectedSlotInfos) {
        const actualInstruction = allInstructions.find((i) =>
          i.type === InstructionType.hydrateElement
          && (i as HydrateElementInstruction).res.includes('au-slot')
          && (i as HydrateElementInstruction).slotInfo.name === expectedSlotInfo.slotName
        ) as HydrateElementInstruction;
        assert.notEqual(actualInstruction, void 0, 'instruction');
        const actualSlotInfo = actualInstruction.slotInfo;
        assert.strictEqual(actualSlotInfo.type, expectedSlotInfo.contentType, 'content type');
        // TODO(Sayan): fix the scope assertions
        // const pCtx = actualSlotInfo.projectionContext;
        // assert.deepStrictEqual(pCtx.scope, expectedSlotInfo.scope, 'scope');
        assert.deepStrictEqual((actualSlotInfo.content.template as HTMLElement).outerHTML, `<template>${expectedSlotInfo.content}</template>`, 'content');
        assert.deepStrictEqual(actualSlotInfo.content.needsCompile, false, 'needsCompile');
      }
    });
  }
});
