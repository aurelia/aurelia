import {
  Constructable,
  DI,
  IContainer,
  InstanceProvider,
  Overwrite,
  Registration
} from '@aurelia/kernel';
import {
  CustomAttributeResource,
  IComponent,
  ICustomAttribute,
  ICustomAttributeType,
  IDOM,
  ILifecycle,
  INode,
  IRenderLocation,
  IController,
  IViewFactory,
  LifecycleFlags as LF
} from '@aurelia/runtime';
import { expect } from 'chai';
import { AuNode, AuDOMConfiguration, AuNodeSequence, AuDOM } from './au-dom';
import { FakeView, FakeViewFactory } from './fakes';
import { createScopeForTest } from './test-builder';

export function ensureSingleChildTemplateControllerBehaviors<T extends ICustomAttributeType>(
  Type: T,
  getChildView: (attribute: ICustomAttribute<AuNode>) => IController<AuNode>
) {
  it('creates a child instance from its template', function () {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    expect(child).to.be.instanceof(FakeView);
  });

  it('enforces the attach lifecycle of its child instance', function () {
    const lifecycle = DI.createContainer().get(ILifecycle);
    const { attribute } = hydrateCustomAttribute(Type, { lifecycle });
    const child = getChildView(attribute);

    let attachCalled = false;
    child.$attach = function () { attachCalled = true; };

    runAttachLifecycle(lifecycle, attribute);

    expect(attachCalled).to.equal(true);
  });

  it('adds a child instance at the render location when attaching', function () {
    const lifecycle = DI.createContainer().get(ILifecycle);
    const { attribute, location } = hydrateCustomAttribute(Type, { lifecycle });
    const child = getChildView(attribute);

    runAttachLifecycle(lifecycle, attribute);

    expect(location!.previousSibling).to.equal(child.$nodes['lastChild']);
  });

  it('enforces the bind lifecycle of its child instance', function () {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let bindCalled = false;
    child.$bind = function () { bindCalled = true; };

    attribute.$bind(LF.fromBind, createScopeForTest());

    expect(bindCalled).to.equal(true);
  });

  it('enforces the detach lifecycle of its child instance', function () {
    const lifecycle = DI.createContainer().get(ILifecycle);
    const { attribute } = hydrateCustomAttribute(Type, { lifecycle });
    const child = getChildView(attribute);

    let detachCalled = false;
    child.$detach = function () { detachCalled = true; };

    runAttachLifecycle(lifecycle, attribute);
    runDetachLifecycle(lifecycle, attribute);

    expect(detachCalled).to.equal(true);
  });

  it('enforces the unbind lifecycle of its child instance', function () {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let unbindCalled = false;
    child.$unbind = function () { unbindCalled = true; };

    attribute.$bind(LF.fromBind, createScopeForTest());
    attribute.$unbind(LF.fromUnbind);

    expect(unbindCalled).to.equal(true);
  });

  function runAttachLifecycle(lifecycle: ILifecycle, item: IComponent) {
    lifecycle.beginAttach();
    item.$attach(LF.none);
    lifecycle.endAttach(LF.none);
  }

  function runDetachLifecycle(lifecycle: ILifecycle, item: IComponent) {
    lifecycle.beginDetach();
    item.$detach(LF.none);
    lifecycle.endDetach(LF.none);
  }
}

interface IAttributeTestOptions {
  lifecycle?: ILifecycle;
  container?: IContainer;
  target?: INode;
}

interface ICustomAttributeCreation<T extends Constructable> {
  attribute: Overwrite<InstanceType<T>, ICustomAttribute<AuNode>>;
  location?: IRenderLocation<AuNode> & AuNode;
  lifecycle: ILifecycle;
}

export function hydrateCustomAttribute<T extends ICustomAttributeType>(
  Type: T,
  options: IAttributeTestOptions = {}
) : ICustomAttributeCreation<T> {
  const AttributeType: ICustomAttributeType<AuNode> = Type as any;
  const container = options.container || AuDOMConfiguration.createContainer();
  const dom = container.get(IDOM);
  if (options.lifecycle) {
    Registration.instance(ILifecycle, options.lifecycle).register(container, ILifecycle);
  }
  const lifecycle = container.get(ILifecycle);

  let location: IRenderLocation<AuNode> & AuNode = null!;

  container.register(AttributeType);

  if (AttributeType.description.isTemplateController) {
    const loc = AuNode.createRenderLocation();
    AuNode.createHost().appendChild(loc.$start!).appendChild(loc);
    const createView: (factory: FakeViewFactory) => IController = factory => {
      const view = new FakeView(lifecycle, factory);
      view.$nodes = new AuNodeSequence(new AuDOM(), AuNode.createTemplate().appendChild(AuNode.createText()));
      return view;
    };
    container.register(
      Registration.instance(
        IRenderLocation,
        location = ((options.target as typeof loc) || loc) as any
      ),
      Registration.instance(IViewFactory, new FakeViewFactory('fake-view', createView, lifecycle))
    );
  } else {
    const hostProvider = new InstanceProvider();
    hostProvider.prepare(options.target || AuNode.createHost());

    dom.registerElementResolver(container, hostProvider);
  }

  const attribute = container.get<InstanceType<T> & ICustomAttribute<AuNode>>(
    CustomAttributeResource.keyFrom(AttributeType.description.name)
  );
  attribute.$hydrate(LF.none, container);

  return { attribute: attribute as Overwrite<InstanceType<T>, ICustomAttribute<AuNode>>, location, lifecycle };
}
