import {
  IContainer,
  Registration
} from '@aurelia/kernel';
import { expect } from 'chai';
import {
  CompiledTemplate,
  createRenderContext,
  IDOM,
  INode,
  IRenderable,
  IRenderLocation,
  ITargetedInstruction,
  IViewFactory,
  TemplateDefinition
} from '../src/index';
import { ViewFactory } from '../src/templating/view';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequenceFactory
} from './au-dom';

describe('createRenderContext', () => {
  it('properly initializes a renderContext', () => {
    const parent = AuDOMConfiguration.createContainer();

    class Foo {}
    class Bar {public static register(container: IContainer) { container.register(Registration.singleton(Bar, Bar)); }}
    const sut = createRenderContext(new AuDOM(), parent as any, [Foo as any, Bar], null);
    const viewFactory = new ViewFactory(null, null, null);

    expect(sut['parent']).to.equal(parent);

    expect(sut.has(IViewFactory, false)).to.equal(true);
    expect(sut.has(IRenderable, false)).to.equal(true);
    expect(sut.has(ITargetedInstruction, false)).to.equal(true);
    expect(sut.has(IRenderLocation, false)).to.equal(true);
    expect(sut.has(Foo, false)).to.equal(false);
    expect(sut.has(Bar, false)).to.equal(true);
    expect(sut.has(INode, false)).to.equal(true);
    expect(sut.has(AuNode, false)).to.equal(true);

    expect(typeof sut.render).to.equal('function');
    expect(typeof sut.beginComponentOperation).to.equal('function');
    expect(typeof sut['dispose']).to.equal('function');

    expect(() => sut.get(IViewFactory)).to.throw(/50/);
    expect(sut.get(IRenderable)).to.equal(null);
    expect(sut.get(ITargetedInstruction)).to.equal(null);
    expect(sut.get(IRenderLocation)).to.equal(null);

    const renderable = {} as any;
    const target = {} as any;
    const instruction = {} as any;
    const parts = {} as any;
    const location = {} as any;

    sut.beginComponentOperation(renderable, target, instruction, viewFactory as any, parts, location);

    expect(() => sut.get(IViewFactory)).to.throw(/51/);
    expect(sut.get(IRenderable)).to.equal(renderable);
    expect(sut.get(INode)).to.equal(target);
    expect(sut.get(AuNode)).to.equal(target);
    expect(sut.get(ITargetedInstruction)).to.equal(instruction);
    expect(sut.get(IRenderLocation)).to.equal(location);
  });
});

describe(`CompiledTemplate`, () => {
  describe(`constructor`, () => {
    it(`creates a new createNodeSequence function`, () => {
      class Foo {}
      class Bar {public static register(container: IContainer) { container.register(Registration.singleton(Bar, Bar)); }}
      const container = AuDOMConfiguration.createContainer();
      const dom = container.get<AuDOM>(IDOM);
      const templateNode = AuNode.createTemplate().appendChild(AuNode.createText('foo'));
      const nsFactory = new AuNodeSequenceFactory(dom, templateNode);
      const def = { template: templateNode, dependencies: [Foo, Bar] } as unknown as TemplateDefinition;
      const sut = new CompiledTemplate(dom, def, nsFactory, container as any);

      const nodes = sut.factory.createNodeSequence();
      expect(nodes.childNodes[0].textContent).to.equal('foo');
    });
  });
});
