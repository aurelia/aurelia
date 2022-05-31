import {
  BindingMode
} from '@aurelia/runtime';
import {
  AuSlot, CustomElement, CustomElementDefinition, CustomElementType, HydrateElementInstruction, InstructionType
} from '@aurelia/runtime-html';
import {
  assert, TestContext
} from '@aurelia/testing';

export function createAttribute(name: string, value: string): Attr {
  const attr = document.createAttribute(name);
  attr.value = value;
  return attr;
}

describe('[UNIT] 3-runtime-html/template-compiler.au-slot.spec.ts', function () {
  function createFixture() {
    const ctx = TestContext.create();
    const container = ctx.container;
    const sut = ctx.templateCompiler;
    return { ctx, container, sut };
  }
  function $createCustomElement(template: string, name: string) {
    return CustomElement.define({ name, isStrictBinding: true, template, bindables: { people: { mode: BindingMode.default } }, }, class MyElement { });
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
    ) {
    }
  }

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
      [['my-element', { 'default': '<au-m class="au"></au-m>' }]],
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
  for (const { customElements, template, expectedSlotInfos, allExpectedProjections } of getTestData()) {
    it(`compiles - ${template}`, function () {
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
          && (typeof (i as HEI).res === 'string' && ((i as HEI).res as string).includes('au-slot')
            || (i as HEI).res === CustomElement.getDefinition(AuSlot)
          )
          && (i as HydrateElementInstruction).auSlot.name === expectedSlotInfo.slotName
        ) as HydrateElementInstruction;
        assert.notEqual(actualInstruction, void 0, 'instruction');
        const actualSlotInfo = actualInstruction.auSlot;
        assert.deepStrictEqual((actualSlotInfo.fallback.template as HTMLElement).outerHTML, `<template>${expectedSlotInfo.content}</template>`, 'content');
        assert.deepStrictEqual(actualSlotInfo.fallback.needsCompile, false, 'needsCompile');
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
            || (i as HEI).res === container.find(CustomElement, elName)
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
});
