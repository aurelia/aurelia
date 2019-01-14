import { Constructable, IContainer, Overwrite, Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import {
  CustomAttributeResource,
  IAttach,
  ICustomAttribute,
  ICustomAttributeType,
  IDOM,
  ILifecycle,
  INode,
  IRenderingEngine,
  IRenderLocation,
  IView,
  IViewFactory,
  LifecycleFlags
} from '../../../src/index';
import { Lifecycle } from '../../../src/lifecycle';
import { InstanceProvider } from '../../../src/rendering-engine';
import { FakeView } from '../../_doubles/fake-view';
import { FakeViewFactory } from '../../_doubles/fake-view-factory';
import { AuDOMConfiguration, AuNode } from '../../au-dom';
import { createScopeForTest } from '../../util';

export function ensureSingleChildTemplateControllerBehaviors<T extends ICustomAttributeType>(
  Type: T,
  getChildView: (attribute: ICustomAttribute<AuNode>) => IView<AuNode>
) {
  it('creates a child instance from its template', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    expect(child).to.be.instanceof(FakeView);
  });

  it('enforces the attach lifecycle of its child instance', () => {
    const lifecycle = new Lifecycle();
    const { attribute } = hydrateCustomAttribute(Type, { lifecycle });
    const child = getChildView(attribute);

    let attachCalled = false;
    child.$attach = function() { attachCalled = true; };

    runAttachLifecycle(lifecycle, attribute);

    expect(attachCalled).to.equal(true);
  });

  it('adds a child instance at the render location when attaching', () => {
    const lifecycle = new Lifecycle();
    const { attribute, location } = hydrateCustomAttribute(Type, { lifecycle });
    const child = getChildView(attribute);

    runAttachLifecycle(lifecycle, attribute);

    expect(location.previousSibling).to.equal(child.$nodes['lastChild']);
  });

  it('enforces the bind lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let bindCalled = false;
    child.$bind = function() { bindCalled = true; };

    attribute.$bind(LifecycleFlags.fromBind, createScopeForTest());

    expect(bindCalled).to.equal(true);
  });

  it('enforces the detach lifecycle of its child instance', () => {
    const lifecycle = new Lifecycle();
    const { attribute } = hydrateCustomAttribute(Type, { lifecycle });
    const child = getChildView(attribute);

    let detachCalled = false;
    child.$detach = function() { detachCalled = true; };

    runAttachLifecycle(lifecycle, attribute);
    runDetachLifecycle(lifecycle, attribute);

    expect(detachCalled).to.equal(true);
  });

  it('enforces the unbind lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let unbindCalled = false;
    child.$unbind = function() { unbindCalled = true; };

    attribute.$bind(LifecycleFlags.fromBind, createScopeForTest());
    attribute.$unbind(LifecycleFlags.fromUnbind);

    expect(unbindCalled).to.equal(true);
  });

  function runAttachLifecycle(lifecycle: Lifecycle, item: IAttach) {
    lifecycle.beginAttach();
    item.$attach(LifecycleFlags.none);
    lifecycle.endAttach(LifecycleFlags.none);
  }

  function runDetachLifecycle(lifecycle: Lifecycle, item: IAttach) {
    lifecycle.beginDetach();
    item.$detach(LifecycleFlags.none);
    lifecycle.endDetach(LifecycleFlags.none);
  }
}

interface IAttributeTestOptions {
  lifecycle?: Lifecycle;
  container?: IContainer;
  target?: INode;
}

interface ICustomAttributeCreation<T extends Constructable> {
  attribute: Overwrite<InstanceType<T>, ICustomAttribute<AuNode>>;
  location?: IRenderLocation<AuNode> & AuNode;
  lifecycle: Lifecycle;
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
  const lifecycle = container.get(ILifecycle) as Lifecycle;

  let location: IRenderLocation<AuNode> & AuNode = null;

  container.register(AttributeType);

  if (AttributeType.description.isTemplateController) {
    const loc = AuNode.createRenderLocation();
    AuNode.createHost().appendChild(loc.$start).appendChild(loc);
    container.register(
      Registration.instance(
        IRenderLocation,
        location = (options.target as typeof loc) || loc
      ),
      Registration.singleton(IViewFactory, FakeViewFactory)
    );
  } else {
    const hostProvider = new InstanceProvider();
    hostProvider.prepare(options.target || AuNode.createHost());

    dom.registerElementResolver(container, hostProvider);
  }

  const attribute = container.get<InstanceType<T> & ICustomAttribute<AuNode>>(
    CustomAttributeResource.keyFrom(AttributeType.description.name)
  );
  const renderingEngine = container.get(IRenderingEngine);
  attribute.$hydrate(0, renderingEngine);

  return { attribute: attribute as Overwrite<InstanceType<T>, ICustomAttribute<AuNode>>, location, lifecycle };
}
