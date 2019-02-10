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

describe('createRenderContext', function() {
  it('properly initializes a renderContext', function() {
    const parent = AuDOMConfiguration.createContainer();

    class Foo {}
    class Bar {public static register(container: IContainer) { container.register(Registration.singleton(Bar, Bar)); }}
    const sut = createRenderContext(new AuDOM(), parent as any, [Foo as any, Bar], null);
    const viewFactory = new ViewFactory(null, null, null);

    expect(sut['parent']).to.equal(parent, `sut['parent']`);

    expect(sut.has(IViewFactory, false)).to.equal(true, `sut.has(IViewFactory, false)`);
    expect(sut.has(IRenderable, false)).to.equal(true, `sut.has(IRenderable, false)`);
    expect(sut.has(ITargetedInstruction, false)).to.equal(true, `sut.has(ITargetedInstruction, false)`);
    expect(sut.has(IRenderLocation, false)).to.equal(true, `sut.has(IRenderLocation, false)`);
    expect(sut.has(Foo, false)).to.equal(true, `sut.has(Foo, false)`);
    expect(sut.has(Bar, false)).to.equal(true, `sut.has(Bar, false)`);
    expect(sut.has(INode, false)).to.equal(true, `sut.has(INode, false)`);
    expect(sut.has(AuNode, false)).to.equal(true, `sut.has(AuNode, false)`);

    expect(typeof sut.render).to.equal('function', `typeof sut.render`);
    expect(typeof sut.beginComponentOperation).to.equal('function', `typeof sut.beginComponentOperation`);
    expect(typeof sut['dispose']).to.equal('function', `typeof sut['dispose']`);

    expect(() => sut.get(IViewFactory)).to.throw(/50/);
    expect(sut.get(IRenderable)).to.equal(null, `sut.get(IRenderable)`);
    expect(sut.get(ITargetedInstruction)).to.equal(null, `sut.get(ITargetedInstruction)`);
    expect(sut.get(IRenderLocation)).to.equal(null, `sut.get(IRenderLocation)`);

    const renderable = {} as any;
    const target = {} as any;
    const instruction = {} as any;
    const parts = {} as any;
    const location = {} as any;

    sut.beginComponentOperation(renderable, target, instruction, viewFactory as any, parts, location);

    expect(() => sut.get(IViewFactory)).to.throw(/51/);
    expect(sut.get(IRenderable)).to.equal(renderable, `sut.get(IRenderable)`);
    expect(sut.get(INode)).to.equal(target, `sut.get(INode)`);
    expect(sut.get(AuNode)).to.equal(target, `sut.get(AuNode)`);
    expect(sut.get(ITargetedInstruction)).to.equal(instruction, `sut.get(ITargetedInstruction)`);
    expect(sut.get(IRenderLocation)).to.equal(location, `sut.get(IRenderLocation)`);
  });
});

describe(`CompiledTemplate`, function() {
  describe(`constructor`, function() {
    it(`creates a new createNodeSequence function`, function() {
      class Foo {}
      class Bar {public static register(container2: IContainer) { container2.register(Registration.singleton(Bar, Bar)); }}
      const container = AuDOMConfiguration.createContainer();
      const dom = container.get<AuDOM>(IDOM);
      const templateNode = AuNode.createTemplate().appendChild(AuNode.createText('foo'));
      const nsFactory = new AuNodeSequenceFactory(dom, templateNode);
      const def = { template: templateNode, dependencies: [Foo, Bar] } as unknown as TemplateDefinition;
      const sut = new CompiledTemplate(dom, def, nsFactory, container as any);

      const nodes = sut.factory.createNodeSequence();
      expect(nodes.childNodes[0].textContent).to.equal('foo', `nodes.childNodes[0].textContent`);
    });
  });
});
