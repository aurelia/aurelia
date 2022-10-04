import {
  CustomElement,
  CustomElementType,
  INode,
  createElement as sut,
  InstructionType,
  HydrateElementInstruction,
  RenderPlan,
  IInstruction,
} from '@aurelia/runtime-html';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  TestContext,
  assert
} from '@aurelia/testing';

describe(`createElement() creates element based on tag`, function () {
  eachCartesianJoin([['div', 'template']], (tag: string) => {
    describe(`tag=${tag}`, function () {
      it(`translates raw object properties to attributes`, function () {
        const ctx = TestContext.create();
        const actual = sut(ctx.platform, tag, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;

        assert.strictEqual(node.getAttribute('title'), 'asdf', `node.getAttribute('title')`);
        assert.strictEqual(node.getAttribute('foo'), 'bar', `node.getAttribute('foo')`);

        assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
        assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, function () {
          const ctx = TestContext.create();
          const actual = sut(ctx.platform, tag, props as unknown as Record<string, string>);

          const node = actual['node'] as Element;

          assert.strictEqual(actual['instructions'].length, 0, `actual['instructions'].length`);
          assert.strictEqual(node.getAttribute('class'), null, `node.getAttribute('class')`);
        });
      });

      eachCartesianJoin(
        [
          [
            InstructionType.hydrateAttribute,
            InstructionType.hydrateElement,
            InstructionType.hydrateLetElement,
            InstructionType.hydrateTemplateController,
            InstructionType.interpolation,
            InstructionType.iteratorBinding,
            InstructionType.letBinding,
            InstructionType.propertyBinding,
            InstructionType.refBinding,
            InstructionType.setProperty,
            InstructionType.listenerBinding,
            InstructionType.setAttribute,
            InstructionType.stylePropertyBinding,
            InstructionType.textBinding
          ]
        ],
        t => {
          it(`understands targeted instruction type=${t}`, function () {
            const ctx = TestContext.create();
            const actual = sut(ctx.platform, tag, { prop: { type: t }  as unknown as string|IInstruction});

            const instruction = actual['instructions'][0][0] as IInstruction;
            const node = actual['node'] as Element;

            assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
            assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
            assert.strictEqual(instruction.type, t, `instruction.type`);
            assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
          });
        });

      eachCartesianJoinFactory([
        [
          TestContext.create
        ],
        [
          _ctx => [['foo', 'bar'], 'foobar'],
          ctx => [[ctx.createElementFromMarkup('<div>foo</div>'), ctx.createElementFromMarkup('<div>bar</div>')], 'foobar'],
          ctx => [['foo', ctx.createElementFromMarkup('<div>bar</div>')], 'foobar']
        ] as ((ctx: TestContext) => [(RenderPlan | string | INode)[], string])[],
        [
          (ctx, [children, expected]) => [children, expected],
          (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, ['baz']), ...children], `baz${expected}`],
          (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, [ctx.createElementFromMarkup('<div>baz</div>')]), ...children], `baz${expected}`]
        ] as ((ctx: TestContext, $1: [(RenderPlan | string | INode)[], string]) => [(RenderPlan | string | INode)[], string])[]
      ],                       (ctx, $1, [children, expected]) => {
        it(_`adds children (${children})`, function () {
          const actual = sut(ctx.platform, tag, null, children);

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
        const ctx = TestContext.create();
        const type = createType();
        const definition = CustomElement.getDefinition(type);
        const actual = sut(ctx.platform, type, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;
        const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

        assert.strictEqual(node.getAttribute('title'), null, `node.getAttribute('title')`);
        assert.strictEqual(node.getAttribute('foo'), null, `node.getAttribute('foo')`);

        assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
        assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
        assert.strictEqual(instruction.type, InstructionType.hydrateElement, `instruction.type`);
        assert.strictEqual(instruction.res, definition, `instruction.res`);
        assert.strictEqual(instruction.props.length, 2, `instruction.props.length`);
        assert.strictEqual(instruction.props[0].type, InstructionType.setAttribute, `instruction.props[0].type`);
        assert.strictEqual(instruction.props[0]['to'], 'title', `instruction.props[0]['to']`);
        assert.strictEqual(instruction.props[0]['value'], 'asdf', `instruction.props[0]['value']`);
        if (definition.bindables['foo']) {
          assert.strictEqual(instruction.props[1].type, InstructionType.setProperty, `instruction.props[1].type`);
        } else {
          assert.strictEqual(instruction.props[1].type, InstructionType.setAttribute, `instruction.props[1].type`);
        }
        assert.strictEqual(instruction.props[1]['to'], 'foo', `instruction.props[1]['to']`);
        assert.strictEqual(instruction.props[1]['value'], 'bar', `instruction.props[1]['value']`);
        assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, function () {
          const type = createType();
          const ctx = TestContext.create();
          const actual = sut(ctx.platform, type, props as unknown as Record<string, string|IInstruction>);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

          assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
          assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
          assert.strictEqual(instruction.props.length, 0, `instruction.props.length`);
          assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
        });
      });

      eachCartesianJoin(
        [
          [
            InstructionType.hydrateAttribute,
            InstructionType.hydrateElement,
            InstructionType.hydrateLetElement,
            InstructionType.hydrateTemplateController,
            InstructionType.interpolation,
            InstructionType.iteratorBinding,
            InstructionType.letBinding,
            InstructionType.propertyBinding,
            InstructionType.refBinding,
            InstructionType.setProperty,
            InstructionType.listenerBinding,
            InstructionType.setAttribute,
            InstructionType.stylePropertyBinding,
            InstructionType.textBinding
          ]
        ],
        t => {
          it(`understands targeted instruction type=${t}`, function () {
            const type = createType();
            const definition = CustomElement.getDefinition(type);
            const ctx = TestContext.create();
            const actual = sut(ctx.platform, type, { prop: { type: t } as unknown as string|IInstruction});

            const node = actual['node'] as Element;
            const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

            assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
            assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
            assert.strictEqual(instruction.type, InstructionType.hydrateElement, `instruction.type`);
            assert.strictEqual(instruction.res, definition, `instruction.res`);
            assert.strictEqual(instruction.props.length, 1, `instruction.props.length`);
            assert.strictEqual(instruction.props[0].type, t, `instruction.props[0].type`);
            assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);
          });
        });

      eachCartesianJoinFactory([
        [
          TestContext.create
        ],
        [
          _ctx => [['foo', 'bar'], 'foobar'],
          ctx => [[ctx.createElementFromMarkup('<div>foo</div>'), ctx.createElementFromMarkup('<div>bar</div>')], 'foobar'],
          ctx => [['foo', ctx.createElementFromMarkup('<div>bar</div>')], 'foobar']
        ] as ((ctx: TestContext) => [(RenderPlan | string | INode)[], string])[],
        [
          (ctx, [children, expected]) => [children, expected],
          (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, ['baz']), ...children], `baz${expected}`],
          (ctx, [children, expected]) => [[sut(ctx.platform, 'div', null, [ctx.createElementFromMarkup('<div>baz</div>')]), ...children], `baz${expected}`]
        ] as ((ctx: TestContext, $1: [(RenderPlan | string | INode)[], string]) => [(RenderPlan | string | INode)[], string])[]
      ],                       (ctx, $1, [children, expected]) => {
        it(_`adds children (${children})`, function () {
          const type = createType();
          const definition = CustomElement.getDefinition(type);
          const actual = sut(ctx.platform, type, null, children);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0]) as HydrateElementInstruction;

          assert.strictEqual(actual['instructions'].length, 1, `actual['instructions'].length`);
          assert.strictEqual(actual['instructions'][0].length, 1, `actual['instructions'][0].length`);
          assert.strictEqual(instruction.type, InstructionType.hydrateElement, `instruction.type`);
          assert.strictEqual(instruction.res, definition, `instruction.res`);
          assert.strictEqual(instruction.props.length, 0, `instruction.props.length`);
          assert.strictEqual(node.getAttribute('class'), 'au', `node.getAttribute('class')`);

          assert.strictEqual(node.textContent, expected, `node.textContent`);
        });
      });
    });
  });
});
