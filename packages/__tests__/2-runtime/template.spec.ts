import {
  IContainer,
  Registration
} from '@aurelia/kernel';
import {
  CompiledTemplate,
  RenderContext,
  IDOM,
  INode,
  IController,
  IRenderLocation,
  ITargetedInstruction,
  IViewFactory,
  CustomElementDefinition,
  ViewFactory
} from '@aurelia/runtime';
import {
  AuDOM,
  AuDOMConfiguration,
  AuNode,
  AuNodeSequenceFactory,
  assert
} from '@aurelia/testing';

describe('RenderContext', function () {
  it('constructor properly initializes a renderContext', function () {
    const parent = AuDOMConfiguration.createContainer();

    class Foo {}
    class Bar {public static register(container: IContainer) { container.register(Registration.singleton(Bar, Bar)); }}
    const sut = new RenderContext(new AuDOM(), parent as any, [Foo as any, Bar], null);
    const viewFactory = new ViewFactory(null, null, null);

    assert.strictEqual(sut.has(IViewFactory, false), true, `sut.has(IViewFactory, false)`);
    assert.strictEqual(sut.has(IController, false), true, `sut.has(IController, false)`);
    assert.strictEqual(sut.has(ITargetedInstruction, false), true, `sut.has(ITargetedInstruction, false)`);
    assert.strictEqual(sut.has(IRenderLocation, false), true, `sut.has(IRenderLocation, false)`);
    assert.strictEqual(sut.has(Foo, false), true, `sut.has(Foo, false)`);
    assert.strictEqual(sut.has(Bar, false), true, `sut.has(Bar, false)`);
    assert.strictEqual(sut.has(INode, false), true, `sut.has(INode, false)`);
    assert.strictEqual(sut.has(AuNode, false), true, `sut.has(AuNode, false)`);

    assert.strictEqual(typeof sut.render, 'function', `typeof sut.render`);
    assert.strictEqual(typeof sut.beginComponentOperation, 'function', `typeof sut.beginComponentOperation`);
    assert.strictEqual(typeof sut['dispose'], 'function', `typeof sut['dispose']`);

    assert.throws(() => sut.get(IViewFactory), /50/, `() => sut.get(IViewFactory)`);
    assert.strictEqual(sut.get(IController), null, `sut.get(IController)`);
    assert.strictEqual(sut.get(ITargetedInstruction), null, `sut.get(ITargetedInstruction)`);
    assert.strictEqual(sut.get(IRenderLocation), null, `sut.get(IRenderLocation)`);

    const renderable = {} as any;
    const target = {} as any;
    const instruction = {} as any;
    const parts = {} as any;
    const location = {} as any;

    sut.beginComponentOperation(renderable, target, instruction, viewFactory as any, parts, location);

    assert.throws(() => sut.get(IViewFactory), /51/, `() => sut.get(IViewFactory)`);
    assert.strictEqual(sut.get(IController), renderable, `sut.get(IController)`);
    assert.strictEqual(sut.get(INode), target, `sut.get(INode)`);
    assert.strictEqual(sut.get(AuNode), target, `sut.get(AuNode)`);
    assert.strictEqual(sut.get(ITargetedInstruction), instruction, `sut.get(ITargetedInstruction)`);
    assert.strictEqual(sut.get(IRenderLocation), location, `sut.get(IRenderLocation)`);
  });
});

describe(`CompiledTemplate`, function () {
  describe(`constructor`, function () {
    it(`creates a new createNodeSequence function`, function () {
      class Foo {}
      class Bar {public static register(container2: IContainer) { container2.register(Registration.singleton(Bar, Bar)); }}
      const container = AuDOMConfiguration.createContainer();
      const dom = container.get<AuDOM>(IDOM);
      const templateNode = AuNode.createTemplate().appendChild(AuNode.createText('foo'));
      const nsFactory = new AuNodeSequenceFactory(dom, templateNode);
      const def = { template: templateNode, dependencies: [Foo, Bar] } as unknown as CustomElementDefinition;
      const sut = new CompiledTemplate(dom, def, nsFactory, container as any);

      const nodes = sut.factory.createNodeSequence();
      assert.strictEqual(nodes.childNodes[0].textContent, 'foo', `nodes.childNodes[0].textContent`);
    });
  });
});
