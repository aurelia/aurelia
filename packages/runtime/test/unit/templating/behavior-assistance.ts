import {
  DOM,
  IViewFactory,
  IRenderLocation,
  CustomAttributeResource,
  ICustomAttributeType,
  ICustomAttribute,
  IRenderingEngine,
  InstanceProvider,
  INode,
  ICustomElementType,
  ICustomElement,
  CustomElementResource,
  ITargetedInstruction,
  IRenderable,
  TargetedInstructionType,
  IHydrateElementInstruction,
  IRenderContext,
  View
} from "../../../src/index";
import { DI, Registration, IContainer, Constructable } from '../../../../kernel/src/index';
import { ViewFactoryFake } from "./fakes/view-factory-fake";
import { ViewFake } from "./fakes/view-fake";

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

export function hydrateCustomElement<T>(Type: Constructable<T>) {
  const ElementType: ICustomElementType = Type as any;
  const container = DI.createContainer();
  const parent = DOM.createElement('div');
  const host = DOM.createElement(ElementType.description.name);
  const renderable = new ViewFake();
  const instruction: IHydrateElementInstruction = {
    type: TargetedInstructionType.hydrateElement,
    res: 'au-compose',
    instructions: []
  };

  DOM.appendChild(parent, host);

  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();

  renderableProvider.prepare(renderable);
  elementProvider.prepare(host);
  instructionProvider.prepare(instruction);

  container.register(ElementType);
  container.registerResolver(IRenderable, renderableProvider);
  container.registerResolver(ITargetedInstruction, instructionProvider);
  DOM.registerElementResolver(container, elementProvider);

  const element = container.get<T & ICustomElement>(
    CustomElementResource.keyFrom(ElementType.description.name)
  );

  element.$hydrate(container.get(IRenderingEngine), host);

  return { element, parent };
}
