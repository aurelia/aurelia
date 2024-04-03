import { IExpressionParser } from '@aurelia/runtime';
import {
  BindingMode,
  AuSlot,
  CustomElement,
  CustomElementDefinition,
  CustomElementType,
  HydrateElementInstruction,
  InstructionType,
  IInstruction,
  DefaultBindingSyntax,
  PropertyBindingInstruction,
  TextBindingInstruction,
} from '@aurelia/runtime-html';
import {
  assert, TestContext
} from '@aurelia/testing';

export function createAttribute(name: string, value: string): Attr {
  const attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

describe('3-runtime-html/template-compiler.au-slot.spec.ts', function () {
  /** Used to ignore some assertion when needed, e.g nested instructions */
  const anything = {} as any;
  function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;
    const sut = ctx.templateCompiler;
    return { ctx, container, sut };
  }
  function $createCustomElement(template: string, name: string) {
    return CustomElement.define({ name, template, bindables: { people: { mode: BindingMode.default } }, }, class MyElement { });
  }

  class ExpectedSlotFallbackInfo {
    public constructor(
      public readonly slotName: string,
      public readonly content: string,
    ) { }
  }
  class TestData {
    public constructor(
      public readonly template: string,
      public readonly customElements: CustomElementType[],
      public readonly allExpectedProjections: [string, Record<string, string>][] | null,
      public readonly expectedSlotInfos: ExpectedSlotFallbackInfo[],
      public readonly only = false,
    ) {
    }
  }

  it('compiles default <au-slot> as the only child', function () {
    const { template, instructions } = compileWith('<au-slot></au-slot>');
    assertTemplateEqual(template, '<!--au*--><!--au-start--><!--au-end-->');
    assertAuSlotFallback(instructions[0][0], null);
  });

  it('compiles 2 default <au-slot>s', function () {
    const { template, instructions } = compileWith(
      '<au-slot></au-slot><au-slot></au-slot>'
    );
    assertTemplateEqual(
      template,
      '<!--au*--><!--au-start--><!--au-end--><!--au*--><!--au-start--><!--au-end-->'
    );
    assertAuSlotFallback(instructions[0][0], null);
    assertAuSlotFallback(instructions[1][0], null);
  });

  it('compiles default <au-slot> with fallback', function () {
    const { template, instructions, createProp } = compileWith(
      '<au-slot><div a.bind="b"></div></au-slot>'
    );
    assertTemplateEqual(
      template,
      '<!--au*--><!--au-start--><!--au-end-->'
    );
    assertAuSlotFallback(
      instructions[0][0],
      { template: '<!--au*--><div></div>', instructions: [
        [createProp({ from: 'b', to: 'a' })]
      ]}
    );
  });

  it('compiles default <au-slot> with [interpolation] fallback', function () {
    const { template, instructions, createTextInterpolation } = compileWith(
      '<au-slot>${message}</au-slot>'
    );
    assertTemplateEqual(
      template,
      '<!--au*--><!--au-start--><!--au-end-->'
    );
    assertAuSlotFallback(
      instructions[0][0],
      { template: '<!--au*--> ', instructions: [
        [createTextInterpolation({ from: 'message' })]
      ]}
    );
  });

  it('compiles together with slot', function () {
    const { template, instructions } = compileWith('<slot></slot><au-slot></au-slot>');
    assertTemplateEqual(template, '<slot></slot><!--au*--><!--au-start--><!--au-end-->');
    assertAuSlotFallback(instructions[0][0], null);
  });

  it('compiles named <au-slot>', function () {
    const { template, instructions } = compileWith('<au-slot name="s1"></au-slot>');
    assertTemplateEqual(template, '<!--au*--><!--au-start--><!--au-end-->');
    assertAuSlotFallback(instructions[0][0], null);
  });

  it('compiles default <au-slot> mixed with named <au-slot>', function () {
    const { template, instructions } = compileWith('<au-slot name="s1"></au-slot><au-slot></au-slot>');
    assertTemplateEqual(template, '<!--au*--><!--au-start--><!--au-end--><!--au*--><!--au-start--><!--au-end-->');
    assertAuSlotFallback(instructions[0][0], null);
    assertAuSlotFallback(instructions[1][0], null);
  });

  it('compiles projection with default [au-slot]', function () {
    const { template, instructions, createProp } = compileWith(
      '<el><div au-slot a.bind="b">',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], { default: {
      template: '<!--au*--><div></div>', instructions: [[createProp({ from: 'b', to: 'a' })]]
    } });
  });

  it('compiles content without the need of [au-slot]', function () {
    const { template, instructions } = compileWith(
      '<el><div>',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], { default: {
      template: '<div></div>', instructions: []
    } });
  });

  it('compiles projection with default [au-slot] as empty string', function () {
    const { template, instructions } = compileWith(
      '<el><div au-slot="">',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], { default: {
      template: '<div></div>', instructions: []
    } });
  });

  it('does not get confused when theres a slot with the same name with project in the template', function () {
    const { template, instructions } = compileWith(
      '<au-slot></au-slot><el><div au-slot="">',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><!--au-start--><!--au-end--><!--au*--><el></el>');
    assertAuSlotFallback(instructions[0][0], null);
    assertProjection(instructions[1][0], { default: {
      template: '<div></div>', instructions: []
    } });
  });

  it('compiles projection with specific [au-slot] name', function () {
    const { template, instructions, createProp } = compileWith(
      '<el><div au-slot="s1" a.bind="b">',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], { s1: {
      template: '<!--au*--><div></div>', instructions: [[createProp({ from: 'b', to: 'a' })]]
    } });
  });

  it('compiles auto projection with named projection', function () {
    const { template, instructions } = compileWith(
      '<el><div></div><div au-slot="s1">',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], {
      default: { template: '<div></div>', instructions: [] },
      s1: { template: '<div></div>', instructions: [] },
    });
  });

  it('compiles projection that has <au-slot>', function () {
    const { template, instructions } = compileWith(
      '<el><au-slot au-slot>',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], { default: {
      template: '<!--au*--><!--au-start--><!--au-end-->', instructions: anything
    } });
    assertAuSlotFallback(
      (instructions[0][0] as HydrateElementInstruction).projections.default.instructions[0][0],
      null,
    );
  });

  it('compiles default <au-slot> in projection with fallback', function () {
    const { template, instructions, createProp } = compileWith(
      '<el><au-slot au-slot"><div a.bind="b">',
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], { default: {
      template: '<!--au*--><!--au-start--><!--au-end-->', instructions: anything
    } });
    assertAuSlotFallback(
      (instructions[0][0] as HydrateElementInstruction).projections.default.instructions[0][0],
      { template: '<!--au*--><div></div>', instructions: [[createProp({ from: 'b', to: 'a' })]] }
    );
  });

  it('compiles multiple <au-slot>s in projection with fallback', function () {
    const { template, instructions, createProp } = compileWith(
      ['<el>',
        '<au-slot au-slot">',
          '<div a.bind="b"></div>',
        '</au-slot>',
        '<au-slot au-slot="s1">',
          '<div b.bind="a"></div>',
        '</au-slot>'
      ].join(''),
      $createCustomElement('', 'el')
    );
    assertTemplateEqual(template, '<!--au*--><el></el>');
    assertProjection(instructions[0][0], {
      default: { template: '<!--au*--><!--au-start--><!--au-end-->', instructions: anything },
      s1: { template: '<!--au*--><!--au-start--><!--au-end-->', instructions: anything }
    });
    assertAuSlotFallback(
      (instructions[0][0] as HydrateElementInstruction).projections.default.instructions[0][0],
      { template: '<!--au*--><div></div>', instructions: [[createProp({ from: 'b', to: 'a' })]] }
    );
    assertAuSlotFallback(
      (instructions[0][0] as HydrateElementInstruction).projections.s1.instructions[0][0],
      { template: '<!--au*--><div></div>', instructions: [[createProp({ from: 'a', to: 'b' })]] }
    );
  });

  function* getTestData() {
    // projections verification
    yield new TestData(
      `<my-element><div au-slot></div></my-element>`,
      [$createCustomElement('', 'my-element')],
      [['my-element', { 'default': '<div></div>' }]],
      [],
    );
    yield new TestData(
      `<my-element><div au-slot="s1">p1</div><div au-slot="s2">p2</div></my-element>`,
      [$createCustomElement('', 'my-element')],
      [['my-element', { s1: '<div>p1</div>', s2: '<div>p2</div>' }]],
      [],
    );
    yield new TestData(
      `<my-element><div au-slot="s1">p1</div><div au-slot="s1">p2</div></my-element>`,
      [$createCustomElement('', 'my-element')],
      [['my-element', { s1: '<div>p1</div><div>p2</div>' }]],
      [],
    );
    yield new TestData(
      `<my-element><au-slot au-slot><div au-slot="s1">p1</div><div au-slot="s1">p2</div></au-slot></my-element>`,
      [$createCustomElement('', 'my-element')],
      [['my-element', { 'default': '<!--au*--><!--au-start--><!--au-end-->' }]],
      [],
    );

    // fallback verification
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><au-slot name="s2"><div>s2fb</div></au-slot>`,
      [],
      null,
      [
        new ExpectedSlotFallbackInfo('s1', 's1fb'),
        new ExpectedSlotFallbackInfo('s2', '<div>s2fb</div>'),
      ],
    );
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><au-slot name="s2"><div>s2fb</div></au-slot>`,
      [],
      null,
      [
        new ExpectedSlotFallbackInfo('s1', 's1fb'),
        new ExpectedSlotFallbackInfo('s2', '<div>s2fb</div>'),
      ],
    );
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><au-slot name="s2"><div>s2fb</div></au-slot>`,
      [],
      null,
      [
        new ExpectedSlotFallbackInfo('s1', 's1fb'),
        new ExpectedSlotFallbackInfo('s2', '<div>s2fb</div>'),
      ],
    );
    yield new TestData(
      `<au-slot name="s1">s1fb</au-slot><my-element><div au-slot>p</div></my-element>`,
      [$createCustomElement('', 'my-element')],
      null,
      [
        new ExpectedSlotFallbackInfo('s1', 's1fb'),
      ],
    );
  }
  for (const { only, customElements, template, expectedSlotInfos, allExpectedProjections } of getTestData()) {
    (only ? it.only : it)(`compiles - ${template}`, function () {
      const { sut, container } = createFixture();
      container.register(AuSlot, ...customElements);

      const compiledDefinition = sut.compile(
        CustomElementDefinition.create({ name: 'my-ce', template }, class MyCe { }),
        container,
        { projections: null }
      );

      type HEI = HydrateElementInstruction;
      const allInstructions = compiledDefinition.instructions.flat();

      for (const expectedSlotInfo of expectedSlotInfos) {
        const actualInstruction = allInstructions.find((i) =>
          i.type === InstructionType.hydrateElement
          && ((i as HEI).res === 'au-slot'
            || (i as HEI).res === CustomElement.getDefinition(AuSlot)
          )
          && expectedSlotInfo.slotName === (i as HEI).data.name
        ) as HydrateElementInstruction;
        assert.notEqual(actualInstruction, void 0, 'instruction');

        const slotFallback = actualInstruction.projections?.default;
        assert.deepStrictEqual((slotFallback?.template as HTMLElement)?.outerHTML, `<template>${expectedSlotInfo.content}</template>`, 'content');
        assert.deepStrictEqual(slotFallback?.needsCompile, false, 'needsCompile');
      }

      // for each element instruction found
      // verify projections for it compiles properly
      if (allExpectedProjections == null) {
        return;
      }

      for (const [elName, projections] of allExpectedProjections) {
        const elementInstruction = allInstructions.find(i =>
          i.type === InstructionType.hydrateElement
          && (typeof (i as HEI).res === 'string' && ((i as HEI).res as string) === elName
            || (i as HEI).res === CustomElement.find(container, elName)
          )
        ) as HydrateElementInstruction;
        assert.notEqual(elementInstruction, void 0, `Instruction for element "${elName}" missing`);
        const actualProjections = elementInstruction.projections;
        for (const slotName in projections) {
          const def = actualProjections[slotName];
          assert.instanceOf(def, CustomElementDefinition);
          assert.deepStrictEqual((def.template as HTMLElement).outerHTML, `<template>${projections[slotName]}</template>`, 'content');
          assert.deepStrictEqual(def.needsCompile, false, 'needsCompile');
        }
      }
    });
  }

  function compileWith(template: string, ...registrations: unknown[]) {
    const { container, sut } = createFixture();
    container.register(DefaultBindingSyntax, ...registrations);

    const templateDefinition = CustomElementDefinition.create({
      name: 'ano',
      template,
      instructions: [],
      surrogates: [],
      shadowOptions: { mode: 'open' },
    });
    const parser = container.get(IExpressionParser);

    return {
      ...sut.compile(templateDefinition, container, { projections: null }),
      createProp: ({ from, to, mode = BindingMode.toView }: { from: string; to: string; mode?: BindingMode }) =>
        new PropertyBindingInstruction(parser.parse(from, 'IsProperty'), to, mode),
      createTextInterpolation: ({ from }: { from: string }) =>
        new TextBindingInstruction(parser.parse(from, 'IsProperty')),
    };
  }

  function assertTemplateEqual(template: string | Node, expected: string | Node, message?: string) {
    assert.strictEqual(
      typeof template === 'string' ? template : (template as Element).innerHTML,
      typeof expected === 'string' ? expected : (expected as Element).innerHTML,
      message
    );
  }

  function assertAuSlotFallback(
    instruction: IInstruction,
    expectedAuslotFallback: null | Pick<CustomElementDefinition, 'template' | 'instructions'> & { name?: string },
    message?: string,
  ) {
    const $auslotInstruction = instruction as HydrateElementInstruction;
    if (expectedAuslotFallback === null) {
      assert.strictEqual($auslotInstruction.projections, null, `<au-slot>.projections === null`);
      return;
    }

    const {
      name: expectedName = 'default',
      template: expectedTemplate,
      instructions: expectedInstructions
    } = expectedAuslotFallback ?? {};

    const { data: { name }, projections: { default: { template, instructions } } = { default: {} } } = $auslotInstruction;
    assert.strictEqual($auslotInstruction.type, InstructionType.hydrateElement, `#instruction.type ${message}`);
    assert.strictEqual(name, expectedName, `#fallback.slotname ${message}`);
    assertTemplateEqual(template, expectedTemplate, `#fallback.template ${message}`);
    if (expectedInstructions !== anything) {
      assert.deepStrictEqual(instructions, expectedInstructions, `#fallback.instructions ${message}`);
    }
  }

  function assertProjection(
    instruction: IInstruction,
    expected: Record<string, Pick<CustomElementDefinition, 'template' | 'instructions'>>,
    message?: string,
  ) {
    const $instruction = instruction as HydrateElementInstruction;
    const projections = $instruction.projections;
    for (const slotName in expected) {
      const projection = projections[slotName];
      assert.notEqual(projection, null, `#projection@slot[${slotName}] is [null] - ${message}`);
      const { template, instructions } = projection;
      const { template: expectedTemplate, instructions: expectedInstructions } = expected[slotName];
      assertTemplateEqual(template, expectedTemplate, `#projection@slot[${slotName}] ${message}`);
      if (expectedInstructions !== anything) {
        assert.deepStrictEqual(instructions, expectedInstructions, `#projection@slot[${slotName}] ${message}`);
      }
    }
  }
});
