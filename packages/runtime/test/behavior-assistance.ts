import {
  Constructable,
  IContainer,
  Registration
} from '@aurelia/kernel';
import {
  CustomAttributeResource,
  ICustomAttribute,
  ICustomAttributeType,
  IDOM,
  ILifecycle,
  INode,
  InstanceProvider,
  IRenderingEngine,
  IRenderLocation,
  IViewFactory,
  Lifecycle
} from '../src/index';
import { AuDOMConfiguration, AuNode } from './au-dom';
import { ViewFactoryFake } from './fakes/view-factory-fake';

interface IAttributeTestOptions {
  lifecycle?: Lifecycle;
  container?: IContainer;
  target?: INode;
}

interface ICustomAttributeCreation<T extends Constructable> {
  attribute: InstanceType<T> & ICustomAttribute<AuNode>;
  location?: IRenderLocation<AuNode> & AuNode;
  lifecycle: Lifecycle;
}

export function hydrateCustomAttribute<T extends Constructable>(
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
      Registration.singleton(IViewFactory, ViewFactoryFake)
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
  attribute.$hydrate(renderingEngine);

  return { attribute, location, lifecycle } as ICustomAttributeCreation<T>;
}
