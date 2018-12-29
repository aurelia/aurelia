import { IContainer, Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  CompiledTemplate,
  IDOM,
  INode,
  IRenderable,
  IRenderLocation,
  ITargetedInstruction,
  IViewFactory,
  TemplateDefinition,
  ViewFactory
} from '../src/index';
import { AuDOM, AuDOMConfiguration, AuNode, AuNodeSequenceFactory } from './au-dom';

describe(`CompiledTemplate`, () => {
  describe(`constructor`, () => {
    it(`creates a new renderContext and createNodeSequence function`, () => {
      class Foo {}
      class Bar {public static register(container: IContainer) { container.register(Registration.singleton(Bar, Bar)); }}
      const container = AuDOMConfiguration.createContainer();
      const dom = container.get<AuDOM>(IDOM);
      const templateNode = AuNode.createTemplate().appendChild(AuNode.createText('foo'));
      const nsFactory = new AuNodeSequenceFactory(dom, templateNode);
      const def = { template: templateNode, dependencies: [Foo, Bar] } as unknown as TemplateDefinition;
      const viewFactory = new ViewFactory(null, null, null);
      const sut = new CompiledTemplate(dom, def, nsFactory, container as any);

      expect(sut.renderContext['parent']).to.equal(container);

      expect(sut.renderContext.has(IViewFactory, false)).to.equal(true);
      expect(sut.renderContext.has(IRenderable, false)).to.equal(true);
      expect(sut.renderContext.has(ITargetedInstruction, false)).to.equal(true);
      expect(sut.renderContext.has(IRenderLocation, false)).to.equal(true);
      expect(sut.renderContext.has(Foo, false)).to.equal(false);
      expect(sut.renderContext.has(Bar, false)).to.equal(true);
      expect(sut.renderContext.has(INode, false)).to.equal(true);
      expect(sut.renderContext.has(AuNode, false)).to.equal(true);

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

      sut.renderContext.beginComponentOperation(renderable, target, instruction, viewFactory as any, parts, location);

      expect(() => sut.renderContext.get(IViewFactory)).to.throw(/51/);
      expect(sut.renderContext.get(IRenderable)).to.equal(renderable);
      expect(sut.renderContext.get(INode)).to.equal(target);
      expect(sut.renderContext.get(AuNode)).to.equal(target);
      expect(sut.renderContext.get(ITargetedInstruction)).to.equal(instruction);
      expect(sut.renderContext.get(IRenderLocation)).to.equal(location);

      const nodes = sut.factory.createNodeSequence();
      expect(nodes.childNodes[0].textContent).to.equal('foo');
    });
  });
});
