import {
  CustomElement,
  HydrateElementInstruction,
  CustomElementType,
  INode,
  TargetedInstruction,
  TargetedInstructionType
} from '@aurelia/runtime';
import {
  createElement as sut,
  HTMLTargetedInstructionType,
  RenderPlan,
  HTMLTargetedInstruction
} from '@aurelia/runtime-html';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  HTMLTestContext,
  TestContext,
  assert
} from '@aurelia/testing';

describe(`createElement() creates element based on tag`, function () {
  eachCartesianJoin([['div', 'template']], (tag: string) => {
    describe(`tag=${tag}`, function () {
      it(`translates raw object properties to attributes`, function () {
        const ctx = TestContext.createHTMLTestContext();
        const actual = sut(ctx.dom, tag, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;

        assert.strictEqual(node.getAttribute('title'), 'asdf', `node.getAttribute('title')`);
        assert.strictEqual(node.getAttribute('foo'), 'bar', `node.getAttribute('foo')`);

        assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
        assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, function () {
          const ctx = TestContext.createHTMLTestContext();
          const actual = sut(ctx.dom, tag, props as unknown as Record<string, string>);

          const node = actual['node'] as Element;

          assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
          assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
        });
      });

      eachCartesianJoin(
        [
          [
            TargetedInstructionType.callBinding,
            TargetedInstructionType.hydrateAttribute,
            TargetedInstructionType.hydrateElement,
            TargetedInstructionType.hydrateLetElement,
            TargetedInstructionType.hydrateTemplateController,
            TargetedInstructionType.interpolation,
            TargetedInstructionType.iteratorBinding,
            TargetedInstructionType.letBinding,
            TargetedInstructionType.propertyBinding,
            TargetedInstructionType.refBinding,
            TargetedInstructionType.setProperty,
            HTMLTargetedInstructionType.listenerBinding,
            HTMLTargetedInstructionType.setAttribute,
            HTMLTargetedInstructionType.stylePropertyBinding,
            HTMLTargetedInstructionType.textBinding
          ]
        ],
        t => {
          it(`understands targeted instruction type=${t}`, function () {
            const ctx = TestContext.createHTMLTestContext();
            const actual = sut(ctx.dom, tag, { prop: { type: t }  as unknown as string|HTMLTargetedInstruction});

            const instruction = actual['instructions'][0][0] as TargetedInstruction;
            const node = actual['node'] as Element;

            assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
            assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
            assert.strictEqual(instruction.type, t, `instruction.type`);
            assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
          });
        });

      eachCartesianJoinFactory([
        [
          TestContext.createHTMLTestContext
        ],
        [
          ctx => [['foo', 'bar'], 'foobar'],
          ctx => [[ctx.createElementFromMarkup('<div>foo</div>'), ctx.createElementFromMarkup('<div>bar</div>')], 'foobar'],
          ctx => [['foo', ctx.createElementFromMarkup('<div>bar</div>')], 'foobar']
        ] as ((ctx: HTMLTestContext) => [(RenderPlan | string | INode)[], string])[],
        [
          (ctx, [children, expected]) => [children, expected],
          (ctx, [children, expected]) => [[sut(ctx.dom, 'div', null, ['baz']), ...children], `baz${expected}`],
          (ctx, [children, expected]) => [[sut(ctx.dom, 'div', null, [ctx.createElementFromMarkup('<div>baz</div>')]), ...children], `baz${expected}`]
        ] as ((ctx: HTMLTestContext, $1: [(RenderPlan | string | INode)[], string]) => [(RenderPlan | string | INode)[], string])[]
      ],                       (ctx, $1, [children, expected]) => {
        it(_`adds children (${children})`, function () {
          const actual = sut(ctx.dom, tag, null, children);

          const node = actual['node'] as Element;

          assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
          assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);

          assert.strictEqual(node.textContent, expected, `node.textContent`);
        });
      });
    });
  });
});

describe(`createElement() creates element based on type`, function () {
  eachCartesianJoin([
    [
      () => CustomElement.define({ name: 'foo' }, class Foo {}),
      () => CustomElement.define({ name: 'foo', bindables: { foo: {} } }, class Foo {})
    ] as (() => CustomElementType)[]
  ],
  (createType: () => CustomElementType) => {
    describe(_`type=${createType()}`, function () {
      it(`translates raw object properties to attributes`, function () {
        const ctx = TestContext.createHTMLTestContext();
        const type = createType();
        const definition = CustomElement.getDefinition(type);
        const actual = sut(ctx.dom, type, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;
        const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

        assert.strictEqual(node.getAttribute('title'), null, `node.getAttribute('title')`);
        assert.strictEqual(node.getAttribute('foo'), null, `node.getAttribute('foo')`);

        assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
        assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
        assert.strictEqual(instruction.type, TargetedInstructionType.hydrateElement, `instruction.type`);
        assert.strictEqual(instruction.res, definition.name, `instruction.res`);
        assert.strictEqual(instruction.instructions.length, 2, `instruction.instructions.length`);
        assert.strictEqual(instruction.instructions[0].type, HTMLTargetedInstructionType.setAttribute, `instruction.instructions[0].type`);
        assert.strictEqual(instruction.instructions[0]['to'], 'title', `instruction.instructions[0]['to']`);
        assert.strictEqual(instruction.instructions[0]['value'], 'asdf', `instruction.instructions[0]['value']`);
        if (definition.bindables['foo']) {
          assert.strictEqual(instruction.instructions[1].type, TargetedInstructionType.setProperty, `instruction.instructions[1].type`);
        } else {
          assert.strictEqual(instruction.instructions[1].type, HTMLTargetedInstructionType.setAttribute, `instruction.instructions[1].type`);
        }
        assert.strictEqual(instruction.instructions[1]['to'], 'foo', `instruction.instructions[1]['to']`);
        assert.strictEqual(instruction.instructions[1]['value'], 'bar', `instruction.instructions[1]['value']`);
        assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, function () {
          const type = createType();
          const ctx = TestContext.createHTMLTestContext();
          const actual = sut(ctx.dom, type, props as unknown as Record<string, string|HTMLTargetedInstruction>);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

          assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
          assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
          assert.strictEqual(instruction.instructions.length, 0, `instruction.instructions.length`);
          assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
        });
      });

      eachCartesianJoin(
        [
          [
            TargetedInstructionType.callBinding,
            TargetedInstructionType.hydrateAttribute,
            TargetedInstructionType.hydrateElement,
            TargetedInstructionType.hydrateLetElement,
            TargetedInstructionType.hydrateTemplateController,
            TargetedInstructionType.interpolation,
            TargetedInstructionType.iteratorBinding,
            TargetedInstructionType.letBinding,
            TargetedInstructionType.propertyBinding,
            TargetedInstructionType.refBinding,
            TargetedInstructionType.setProperty,
            HTMLTargetedInstructionType.listenerBinding,
            HTMLTargetedInstructionType.setAttribute,
            HTMLTargetedInstructionType.stylePropertyBinding,
            HTMLTargetedInstructionType.textBinding
          ]
        ],
        t => {
          it(`understands targeted instruction type=${t}`, function () {
            const type = createType();
            const definition = CustomElement.getDefinition(type);
            const ctx = TestContext.createHTMLTestContext();
            const actual = sut(ctx.dom, type, { prop: { type: t } as unknown as string|HTMLTargetedInstruction});

            const node = actual['node'] as Element;
            const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

            assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
            assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
            assert.strictEqual(instruction.type, TargetedInstructionType.hydrateElement, `instruction.type`);
            assert.strictEqual(instruction.res, definition.name, `instruction.res`);
            assert.strictEqual(instruction.instructions.length, 1, `instruction.instructions.length`);
            assert.strictEqual(instruction.instructions[0].type, t, `instruction.instructions[0].type`);
            assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
          });
        });

      eachCartesianJoinFactory([
        [
          TestContext.createHTMLTestContext
        ],
        [
          ctx => [['foo', 'bar'], 'foobar'],
          ctx => [[ctx.createElementFromMarkup('<div>foo</div>'), ctx.createElementFromMarkup('<div>bar</div>')], 'foobar'],
          ctx => [['foo', ctx.createElementFromMarkup('<div>bar</div>')], 'foobar']
        ] as ((ctx: HTMLTestContext) => [(RenderPlan | string | INode)[], string])[],
        [
          (ctx, [children, expected]) => [children, expected],
          (ctx, [children, expected]) => [[sut(ctx.dom, 'div', null, ['baz']), ...children], `baz${expected}`],
          (ctx, [children, expected]) => [[sut(ctx.dom, 'div', null, [ctx.createElementFromMarkup('<div>baz</div>')]), ...children], `baz${expected}`]
        ] as ((ctx: HTMLTestContext, $1: [(RenderPlan | string | INode)[], string]) => [(RenderPlan | string | INode)[], string])[]
      ],                       (ctx, $1, [children, expected]) => {
        it(_`adds children (${children})`, function () {
          const type = createType();
          const definition = CustomElement.getDefinition(type);
          const actual = sut(ctx.dom, type, null, children);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

          assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
          assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
          assert.strictEqual(instruction.type, TargetedInstructionType.hydrateElement, `instruction.type`);
          assert.strictEqual(instruction.res, definition.name, `instruction.res`);
          assert.strictEqual(instruction.instructions.length, 0, `instruction.instructions.length`);
          assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);

          assert.strictEqual(node.textContent, expected, `node.textContent`);
        });
      });
    });
  });
});
