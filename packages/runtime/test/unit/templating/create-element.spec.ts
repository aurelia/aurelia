import { expect } from 'chai';
import { createElement as sut, PotentialRenderable } from "../../../src/templating/create-element";
import { eachCartesianJoinFactory, eachCartesianJoin, createElement, _ } from '../util';
import { TargetedInstruction, INode } from '../../../src';

describe(`createElement() creates element based on tag`, () => {
  eachCartesianJoin([['div', 'template']], (tag: string) => {
    describe(`tag=${tag}`, () => {
      it(`translates raw object properties to attributes`, () => {
        const actual = sut(tag, { title: 'asdf', foo: 'bar' });

        const node = actual['node'] as Element;

        expect(node.getAttribute('title')).to.equal('asdf');
        expect(node.getAttribute('foo')).to.equal('bar');

        expect(actual['instructions'].length).to.equal(0);
        expect(node.getAttribute('class')).to.be.null;
      });

      eachCartesianJoin([[[null, 'null'], [undefined, 'undefined']]], ([props, str]) => {
        it(`can handle ${str} props`, () => {
          const actual = sut(tag, props);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.be.null;
        });
      });

      eachCartesianJoin([['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']], t => {
        it(`understands targeted instruction type=${t}`, () => {
          const actual = sut(tag, { prop: { type: t }});

          const instruction = actual['instructions'][0][0] as TargetedInstruction;
          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(1);
          expect(actual['instructions'][0].length).to.equal(1);
          expect(instruction.type).to.equal(t);
          expect(node.getAttribute('class')).to.equal('au');
        });
      });

      eachCartesianJoinFactory([
        <(() => [Array<PotentialRenderable | string | INode>, string])[]>[
          () => [['foo', 'bar'], 'foobar'],
          () => [[createElement('<div>foo</div>'), createElement('<div>bar</div>')], 'foobar'],
          () => [['foo', createElement('<div>bar</div>')], 'foobar']
        ],
        <(($1: [Array<PotentialRenderable | string | INode>, string]) => [Array<PotentialRenderable | string | INode>, string])[]>[
          ([children, expected]) => [children, expected],
          ([children, expected]) => [[sut('div', null, ['baz']), ...children], `baz${expected}`],
          ([children, expected]) => [[sut('div', null, [createElement('<div>baz</div>')]), ...children], `baz${expected}`]
        ]
      ], ($1, [children, expected]) => {
        it(_`adds children (${children})`, () => {
          const actual = sut(tag, null, children);

          const node = actual['node'] as Element;

          expect(actual['instructions'].length).to.equal(0);
          expect(node.getAttribute('class')).to.be.null;

          expect(node.textContent).to.equal(expected);
        });
      });
    });
  });
});
