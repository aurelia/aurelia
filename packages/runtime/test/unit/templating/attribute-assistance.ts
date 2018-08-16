import {
  DOM,
  IViewFactory,
  IRenderLocation,
  CustomAttributeResource,
  ICustomAttributeType,
  ICustomAttribute,
  IRenderingEngine,
  InstanceProvider,
  INode
} from "@aurelia/runtime";
import { DI, Registration, IContainer, Constructable } from '@aurelia/kernel';
import { ViewFactoryFake } from "./fakes/view-factory-fake";

function createRenderLocation() {
  const parent = document.createElement('div');
  const child = document.createElement('div');
  parent.appendChild(child);
  return DOM.convertToRenderLocation(child);
}
interface IAttributeTestOptions {
  container?: IContainer;
  target?: INode;
}

export function hydrateCustomAttribute<T>(
  Type: Constructable<T>,
  options: IAttributeTestOptions = {}
) {
  const AttributeType: ICustomAttributeType = Type as any;
  const container = options.container || DI.createContainer();

  let location: IRenderLocation = null;

  container.register(AttributeType);

  if (AttributeType.description.isTemplateController) {
    container.register(
      Registration.instance(
        IRenderLocation,
        location = options.target || createRenderLocation()
      ),
      Registration.singleton(IViewFactory, ViewFactoryFake)
    );
  } else {
    const hostProvider = new InstanceProvider();
    hostProvider.prepare(
      options.target || document.createElement('div')
    );

    DOM.registerElementResolver(
      container,
      hostProvider
    );
  }

  const attribute = container.get<T & ICustomAttribute>(
    CustomAttributeResource.keyFrom(AttributeType.description.name)
  );

  attribute.$hydrate(container.get(IRenderingEngine));

  return { attribute, location };
}
