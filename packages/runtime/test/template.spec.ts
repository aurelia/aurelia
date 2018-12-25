import { IContainer, Registration, DI } from '@aurelia/kernel';
import { MockRenderingEngine } from "../mock";
import {
  Renderer,
  CompiledTemplate,
  ViewFactory,
  IViewFactory,
  IRenderable,
  ITargetedInstruction,
  IRenderLocation,
  INode,
  DOM

} from '../src/index';
import { expect } from 'chai';
import { createElement } from '../util';

const dom = new DOM(<any>document);

describe(`CompiledTemplate`, () => {
  describe(`constructor`, () => {
    it(`creates a new renderContext and createNodeSequence function`, () => {
      class Foo{}
      class Bar{static register(container: IContainer){ container.register(Registration.singleton(Bar, Bar)) }}
      const def = { template: createElement('<div>foo</div>'), dependencies: [Foo, Bar] };
      const viewFactory = new ViewFactory(null, null, null);
      const renderer = new Renderer([]);
      const renderingEngine = new MockRenderingEngine(null, viewFactory, renderer, null);
      const container = DI.createContainer();
      const sut = new CompiledTemplate(dom, renderingEngine, container as any, def as any);

      expect(sut.renderContext['parent']).to.equal(container);

      expect(sut.renderContext.has(IViewFactory, false)).to.equal(true);
      expect(sut.renderContext.has(IRenderable, false)).to.equal(true);
      expect(sut.renderContext.has(ITargetedInstruction, false)).to.equal(true);
      expect(sut.renderContext.has(IRenderLocation, false)).to.equal(true);
      expect(sut.renderContext.has(Foo, false)).to.equal(false);
      expect(sut.renderContext.has(Bar, false)).to.equal(true);
      expect(sut.renderContext.has(INode, false)).to.equal(true);
      expect(sut.renderContext.has(Element, false)).to.equal(true);
      expect(sut.renderContext.has(HTMLElement, false)).to.equal(true);
      expect(sut.renderContext.has(SVGElement, false)).to.equal(true);

      expect(typeof sut.renderContext.render).to.equal('function');
      expect(typeof sut.renderContext.beginComponentOperation).to.equal('function');
      expect(typeof sut.renderContext['dispose']).to.equal('function');

      expect(() => sut.renderContext.get(IViewFactory)).to.throw(/50/);
      expect(sut.renderContext.get(IRenderable)).to.equal(null);
      expect(sut.renderContext.get(ITargetedInstruction)).to.equal(null);
      expect(sut.renderContext.get(IRenderLocation)).to.equal(null);

      const renderable = {} as any;
      const target = {} as any;
      const instruction = {} as any;
      const parts = {} as any;
      const location = {} as any;

      sut.renderContext.beginComponentOperation(renderable, target, instruction, viewFactory, parts, location);

      expect(() => sut.renderContext.get(IViewFactory)).to.throw(/51/);
      expect(sut.renderContext.get(IRenderable)).to.equal(renderable);
      expect(sut.renderContext.get(INode)).to.equal(target);
      expect(sut.renderContext.get(Element)).to.equal(target);
      expect(sut.renderContext.get(HTMLElement)).to.equal(target);
      expect(sut.renderContext.get(SVGElement)).to.equal(target);
      expect(sut.renderContext.get(ITargetedInstruction)).to.equal(instruction);
      expect(sut.renderContext.get(IRenderLocation)).to.equal(location);

      const nodes = sut.factory.createNodeSequence();
      expect(nodes.firstChild['textContent']).to.equal('foo');
    })
  });
});
