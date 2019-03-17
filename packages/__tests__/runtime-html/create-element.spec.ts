import {
  CustomElementResource,
  HydrateElementInstruction,
  ICustomElementType,
  INode,
  TargetedInstruction,
  TargetedInstructionType
} from '@aurelia/runtime';
import { expect } from 'chai';
import {
  createElement as sut,
  HTMLTargetedInstructionType,
  RenderPlan
} from '@aurelia/runtime-html';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  HTMLTestContext,
  TestContext
} from '@aurelia/testing';

describe(`createElement() creates element based on tag`, function () {
  eachCartesianJoin([['div', 'template']], (tag: string) => {
    describe(`tag=${tag}`, function () {
      it(`translates raw object properties to attributes`, function () {
        const ctx = TestContext.createHTMLTestContext();
        const actual = sut(ctx.dom, tag, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;

        expect(node.getAttribute('title')).to.equal('asdf');
        expect(node.getAttribute('foo')).to.equal('bar');

        expect(actual['instructions'].length).to.equal(0);
        expect(node.getAttribute('class')).to.equal(null);
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, function () {
          const ctx = TestContext.createHTMLTestContext();
          //@ts-ignore
          const actual = sut(ctx.dom, tag, props);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.equal(null);
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
          //@ts-ignore
          const actual = sut(ctx.dom, tag, { prop: { type: t }});

          const instruction = actual['instructions'][0][0] as TargetedInstruction;
          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.type).to.equal(t);
          expect(node.getAttribute('class')).to.equal('au');
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

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.equal(null);

          expect(node.textContent).to.equal(expected);
        });
      });
    });
  });
});

describe(`createElement() creates element based on type`, function () {
  eachCartesianJoin([
    [
      () => CustomElementResource.define({ name: 'foo' }, class Foo {}),
      () => CustomElementResource.define({ name: 'foo', bindables: { foo: {} } }, class Foo {})
    ] as (() => ICustomElementType)[]
  ],
                    (createType: () => ICustomElementType) => {
    describe(_`type=${createType()}`, function () {
      it(`translates raw object properties to attributes`, function () {
        const ctx = TestContext.createHTMLTestContext();
        const type = createType();
        const actual = sut(ctx.dom, type, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;
        const instruction = (actual['instructions'][0][0] as any) as HydrateElementInstruction;

        expect(node.getAttribute('title')).to.equal(null);
        expect(node.getAttribute('foo')).to.equal(null);

        expect(actual['instructions'].length).to.equal(1);
        expect(actual['instructions'][0].length).to.equal(1);
        expect(instruction.type).to.equal(TargetedInstructionType.hydrateElement);
        expect(instruction.res).to.equal(type.description.name);
        expect(instruction.instructions.length).to.equal(2);
        expect(instruction.instructions[0].type).to.equal(HTMLTargetedInstructionType.setAttribute);
        expect(instruction.instructions[0]['to']).to.equal('title');
        expect(instruction.instructions[0]['value']).to.equal('asdf');
        if (type.description.bindables['foo']) {
          expect(instruction.instructions[1].type).to.equal(TargetedInstructionType.setProperty);
        } else {
          expect(instruction.instructions[1].type).to.equal(HTMLTargetedInstructionType.setAttribute);
        }
        expect(instruction.instructions[1]['to']).to.equal('foo');
        expect(instruction.instructions[1]['value']).to.equal('bar');
        expect(node.getAttribute('class')).to.equal('au');
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, function () {
          const type = createType();
          const ctx = TestContext.createHTMLTestContext();
          //@ts-ignore
          const actual = sut(ctx.dom, type, props);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0] as any) as HydrateElementInstruction;

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.instructions.length).to.equal(0);
          expect(node.getAttribute('class')).to.equal('au');
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
          const ctx = TestContext.createHTMLTestContext();
          //@ts-ignore
          const actual = sut(ctx.dom, type, { prop: { type: t }});

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0] as any) as HydrateElementInstruction;

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.type).to.equal(TargetedInstructionType.hydrateElement);
          expect(instruction.res).to.equal(type.description.name);
          expect(instruction.instructions.length).to.equal(1);
          expect(instruction.instructions[0].type).to.equal(t);
          expect(node.getAttribute('class')).to.equal('au');
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
          const actual = sut(ctx.dom, type, null, children);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0] as any) as HydrateElementInstruction;

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.type).to.equal(TargetedInstructionType.hydrateElement);
          expect(instruction.res).to.equal(type.description.name);
          expect(instruction.instructions.length).to.equal(0);
          expect(node.getAttribute('class')).to.equal('au');

          expect(node.textContent).to.equal(expected);
        });
      });
    });
  });
});
