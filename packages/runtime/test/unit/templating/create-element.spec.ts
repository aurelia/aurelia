import { expect } from 'chai';
import { eachCartesianJoinFactory, eachCartesianJoin, createElement, _ } from '../util';
import { Registration } from '../../../../kernel/src/index';
import { TargetedInstruction, INode, ICustomElementType, CustomElementResource, TargetedInstructionType, createElement as sut, RenderPlan, HydrateElementInstruction, IDOM, DOM } from '../../../src/index';

const dom = new DOM(<any>document);
const domRegistration = Registration.instance(IDOM, dom);

describe(`createElement() creates element based on tag`, () => {
  eachCartesianJoin([['div', 'template']], (tag: string) => {
    describe(`tag=${tag}`, () => {
      it(`translates raw object properties to attributes`, () => {
        const actual = sut(dom, tag, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;

        expect(node.getAttribute('title')).to.equal('asdf');
        expect(node.getAttribute('foo')).to.equal('bar');

        expect(actual['instructions'].length).to.equal(0);
        expect(node.getAttribute('class')).to.be.null;
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, () => {
          const actual = sut(dom, tag, props);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.be.null;
        });
      });

      eachCartesianJoin([['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']], t => {
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
        <(() => [Array<RenderPlan | string | INode>, string])[]>[
          () => [['foo', 'bar'], 'foobar'],
          () => [[createElement('<div>foo</div>'), createElement('<div>bar</div>')], 'foobar'],
          () => [['foo', createElement('<div>bar</div>')], 'foobar']
        ],
        <(($1: [Array<RenderPlan | string | INode>, string]) => [Array<RenderPlan | string | INode>, string])[]>[
          ([children, expected]) => [children, expected],
          ([children, expected]) => [[sut(dom, 'div', null, ['baz']), ...children], `baz${expected}`],
          ([children, expected]) => [[sut(dom, 'div', null, [createElement('<div>baz</div>')]), ...children], `baz${expected}`]
        ]
      ], ($1, [children, expected]) => {
        it(_`adds children (${children})`, () => {
          const actual = sut(dom, tag, null, children);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.be.null;

          expect(node.textContent).to.equal(expected);
        });
      });
    });
  });
});

describe(`createElement() creates element based on type`, () => {
  eachCartesianJoin([
    <(() => ICustomElementType)[]>[
      () => CustomElementResource.define({ name: 'foo' }, class Foo{}),
      () => CustomElementResource.define({ name: 'foo', bindables: { foo: {} } }, class Foo{})
    ]
  ],
  (createType: () => ICustomElementType) => {
    describe(_`type=${createType()}`, () => {
      it(`translates raw object properties to attributes`, () => {
        const type = createType();
        const actual = sut(dom, type, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;
        const instruction = (<any>actual['instructions'][0][0]) as HydrateElementInstruction

        expect(node.getAttribute('title')).to.be.null;
        expect(node.getAttribute('foo')).to.be.null;

        expect(actual['instructions'].length).to.equal(1);
        expect(actual['instructions'][0].length).to.equal(1);
        expect(instruction.type).to.equal(TargetedInstructionType.hydrateElement);
        expect(instruction.res).to.equal(type.description.name);
        expect(instruction.instructions.length).to.equal(2);
        expect(instruction.instructions[0].type).to.equal(TargetedInstructionType.setAttribute);
        expect(instruction.instructions[0]['to']).to.equal('title');
        expect(instruction.instructions[0]['value']).to.equal('asdf');
        if (type.description.bindables['foo']) {
          expect(instruction.instructions[1].type).to.equal(TargetedInstructionType.setProperty);
        } else {
          expect(instruction.instructions[1].type).to.equal(TargetedInstructionType.setAttribute);
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
          const instruction = (<any>actual['instructions'][0][0]) as HydrateElementInstruction

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.instructions.length).to.equal(0);
          expect(node.getAttribute('class')).to.equal('au');
        });
      });

      eachCartesianJoin([['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']], t => {
        it(`understands targeted instruction type=${t}`, () => {
          const type = createType();
          const actual = sut(dom, type, { prop: { type: t }});

          const node = actual['node'] as Element;
          const instruction = (<any>actual['instructions'][0][0]) as HydrateElementInstruction

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
        <(() => [Array<RenderPlan | string | INode>, string])[]>[
          () => [['foo', 'bar'], 'foobar'],
          () => [[createElement('<div>foo</div>'), createElement('<div>bar</div>')], 'foobar'],
          () => [['foo', createElement('<div>bar</div>')], 'foobar']
        ],
        <(($1: [Array<RenderPlan | string | INode>, string]) => [Array<RenderPlan | string | INode>, string])[]>[
          ([children, expected]) => [children, expected],
          ([children, expected]) => [[sut(dom, 'div', null, ['baz']), ...children], `baz${expected}`],
          ([children, expected]) => [[sut(dom, 'div', null, [createElement('<div>baz</div>')]), ...children], `baz${expected}`]
        ]
      ], ($1, [children, expected]) => {
        it(_`adds children (${children})`, () => {
          const type = createType();
          const actual = sut(dom, type, null, children);

          const node = actual['node'] as Element;
          const instruction = (<any>actual['instructions'][0][0]) as HydrateElementInstruction

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
