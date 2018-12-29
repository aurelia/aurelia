import { CustomElementResource, HydrateElementInstruction, ICustomElementType, INode, TargetedInstruction, TargetedInstructionType } from '@aurelia/runtime';
import { expect } from 'chai';
import { createElement as sut, HTMLDOM, RenderPlan, HTMLTargetedInstructionType } from '../src/index';
import { _, createElement, eachCartesianJoin, eachCartesianJoinFactory } from './util';


describe(`createElement() creates element based on tag`, () => {
  const dom = new HTMLDOM(document);

  eachCartesianJoin([['div', 'template']], (tag: string) => {
    describe(`tag=${tag}`, () => {
      it(`translates raw object properties to attributes`, () => {
        const actual = sut(dom, tag, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;

        expect(node.getAttribute('title')).to.equal('asdf');
        expect(node.getAttribute('foo')).to.equal('bar');

        expect(actual['instructions'].length).to.equal(0);
        expect(node.getAttribute('class')).to.equal(null);
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, () => {
          const actual = sut(dom, tag, props);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.equal(null);
        });
      });

      eachCartesianJoin([[
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
      ]], t => {
        it(`understands targeted instruction type=${t}`, () => {
          const actual = sut(dom, tag, { prop: { type: t }});

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
          () => [['foo', 'bar'], 'foobar'],
          () => [[createElement('<div>foo</div>'), createElement('<div>bar</div>')], 'foobar'],
          () => [['foo', createElement('<div>bar</div>')], 'foobar']
        ] as (() => [(RenderPlan | string | INode)[], string])[],
        [
          ([children, expected]) => [children, expected],
          ([children, expected]) => [[sut(dom, 'div', null, ['baz']), ...children], `baz${expected}`],
          ([children, expected]) => [[sut(dom, 'div', null, [createElement('<div>baz</div>')]), ...children], `baz${expected}`]
        ] as (($1: [(RenderPlan | string | INode)[], string]) => [(RenderPlan | string | INode)[], string])[]
      ],                       ($1, [children, expected]) => {
        it(_`adds children (${children})`, () => {
          const actual = sut(dom, tag, null, children);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.equal(null);

          expect(node.textContent).to.equal(expected);
        });
      });
    });
  });
});

describe(`createElement() creates element based on type`, () => {
  const dom = new HTMLDOM(document);
  eachCartesianJoin([
    [
      () => CustomElementResource.define({ name: 'foo' }, class Foo {}),
      () => CustomElementResource.define({ name: 'foo', bindables: { foo: {} } }, class Foo {})
    ] as (() => ICustomElementType)[]
  ],
                    (createType: () => ICustomElementType) => {
    describe(_`type=${createType()}`, () => {
      it(`translates raw object properties to attributes`, () => {
        const type = createType();
        const actual = sut(dom, type, { title: 'asdf', foo: 'bar' });

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
        it(`can handle ${str} props`, () => {
          const type = createType();
          const actual = sut(dom, type, props);

          const node = actual['node'] as Element;
          const instruction = (actual['instructions'][0][0] as any) as HydrateElementInstruction;

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.instructions.length).to.equal(0);
          expect(node.getAttribute('class')).to.equal('au');
        });
      });

      eachCartesianJoin([[
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
      ]], t => {
        it(`understands targeted instruction type=${t}`, () => {
          const type = createType();
          const actual = sut(dom, type, { prop: { type: t }});

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
          () => [['foo', 'bar'], 'foobar'],
          () => [[createElement('<div>foo</div>'), createElement('<div>bar</div>')], 'foobar'],
          () => [['foo', createElement('<div>bar</div>')], 'foobar']
        ] as (() => [(RenderPlan | string | INode)[], string])[],
        [
          ([children, expected]) => [children, expected],
          ([children, expected]) => [[sut(dom, 'div', null, ['baz']), ...children], `baz${expected}`],
          ([children, expected]) => [[sut(dom, 'div', null, [createElement('<div>baz</div>')]), ...children], `baz${expected}`]
        ] as (($1: [(RenderPlan | string | INode)[], string]) => [(RenderPlan | string | INode)[], string])[]
      ],                       ($1, [children, expected]) => {
        it(_`adds children (${children})`, () => {
          const type = createType();
          const actual = sut(dom, type, null, children);

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
