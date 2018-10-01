import { Container, Registration } from '../../../../kernel/src';
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

} from '../../../src';
import { expect } from 'chai';
import { createElement } from '../util';


describe(`CompiledTemplate`, () => {
  describe(`constructor`, () => {
    it(`creates a new renderContext and createNodeSequence function`, () => {
      class Foo{}
      class Bar{static register(container: Container){ container.register(Registration.singleton(Bar, Bar)) }}
      const src = { templateOrNode: createElement('<div>foo</div>'), dependencies: [Foo, Bar] };
      const viewFactory = new ViewFactory(null, null);
      const renderer = new Renderer(null, null, null, null, null);
      const renderingEngine = new MockRenderingEngine(null, viewFactory, renderer, null);
      const container = new Container();
      const sut = new CompiledTemplate(renderingEngine, container as any, src as any);

      expect(sut.renderContext['parent']).to.equal(container);

      expect(sut.renderContext.has(IViewFactory, false)).to.be.true;
      expect(sut.renderContext.has(IRenderable, false)).to.be.true;
      expect(sut.renderContext.has(ITargetedInstruction, false)).to.be.true;
      expect(sut.renderContext.has(IRenderLocation, false)).to.be.true;
      expect(sut.renderContext.has(Foo, false)).to.be.false;
      expect(sut.renderContext.has(Bar, false)).to.be.true;
      expect(sut.renderContext.has(INode, false)).to.be.true;
      expect(sut.renderContext.has(Element, false)).to.be.true;
      expect(sut.renderContext.has(HTMLElement, false)).to.be.true;
      expect(sut.renderContext.has(SVGElement, false)).to.be.true;

      expect(typeof sut.renderContext.render).to.equal('function');
      expect(typeof sut.renderContext.beginComponentOperation).to.equal('function');
      expect(typeof sut.renderContext['dispose']).to.equal('function');

      expect(() => sut.renderContext.get(IViewFactory)).to.throw(/50/);
      expect(sut.renderContext.get(IRenderable)).to.be.null;
      expect(sut.renderContext.get(ITargetedInstruction)).to.be.null;
      expect(sut.renderContext.get(IRenderLocation)).to.be.null;

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

      const nodes = sut['createNodeSequence']();
      expect(nodes.firstChild['textContent']).to.equal('foo');
    })
  });
});
