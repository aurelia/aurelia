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
  View,
  ILifecycle,
  Lifecycle
} from "../../../src/index";
import { DI, Registration, IContainer, Constructable, IRegistry } from '../../../../kernel/src/index';
import { ViewFactoryFake } from "./fakes/view-factory-fake";
import { ViewFake } from "./fakes/view-fake";

function createRenderLocation() {
  const parent = document.createElement('div');
  const child = document.createElement('div');
  parent.appendChild(child);
  return DOM.convertToRenderLocation(child);
}
interface IAttributeTestOptions {
  lifecycle?: Lifecycle;
  container?: IContainer;
  target?: INode;
}

interface ICustomAttributeCreation<T extends Constructable> {
  attribute: InstanceType<T> & ICustomAttribute,
  location?: IRenderLocation,
  lifecycle: Lifecycle
}

export function hydrateCustomAttribute<T extends Constructable>(
  Type: T,
  options: IAttributeTestOptions = {}
) : ICustomAttributeCreation<T> {
  const AttributeType: ICustomAttributeType = Type as any;
  const container = options.container || DI.createContainer();
  if (options.lifecycle) {
    Registration.instance(ILifecycle, options.lifecycle).register(container, ILifecycle);
  }
  const lifecycle = container.get(ILifecycle) as Lifecycle;

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
    hostProvider.prepare(options.target || document.createElement('div'));

    DOM.registerElementResolver(container, hostProvider);
  }

  const attribute = container.get<InstanceType<T> & ICustomAttribute>(
    CustomAttributeResource.keyFrom(AttributeType.description.name)
  );
  const renderingEngine = container.get(IRenderingEngine);
  attribute.$hydrate(renderingEngine);

  return { attribute, location, lifecycle } as ICustomAttributeCreation<T>;
}
interface IElementTestOptions {
  lifecycle?: Lifecycle;
  container?: IContainer;
}

export function hydrateCustomElement<T>(
  Type: Constructable<T>,
  options: IAttributeTestOptions = {}
) {
  const ElementType: ICustomElementType = Type as any;
  const container = options.container || DI.createContainer();
  if (options.lifecycle) {
    Registration.instance(ILifecycle, options.lifecycle).register(container, ILifecycle);
  }
  const lifecycle = container.get(ILifecycle) as Lifecycle;
  const parent = DOM.createElement('div');
  const host = DOM.createElement(ElementType.description.name);
  const renderable = new ViewFake(lifecycle);
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

  const renderingEngine = container.get(IRenderingEngine);
  element.$hydrate(renderingEngine, host);

  return { element, parent };
}
