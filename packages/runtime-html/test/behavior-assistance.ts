
import {
  Constructable,
  IContainer,
  Registration
} from '@aurelia/kernel';
import {
  CustomElementResource,
  ICustomElement,
  ICustomElementType,
  IDOM,
  IHydrateElementInstruction,
  ILifecycle,
  IProjectorLocator,
  IRenderable,
  IRenderingEngine,
  ITargetedInstruction,
  TargetedInstructionType
} from '@aurelia/runtime';
import {
  InstanceProvider
} from '../../runtime/src/index';
import {
  FakeView
} from '../../runtime/test/_doubles/fake-view';
import { HTMLDOM, HTMLRuntimeConfiguration } from '../src/index';


interface IElementTestOptions {
  lifecycle?: ILifecycle;
  container?: IContainer;
}

export function hydrateCustomElement<T>(
  Type: Constructable<T>,
  options: IElementTestOptions = {}
) {
  const ElementType: ICustomElementType = Type as any;
  const container = options.container || HTMLRuntimeConfiguration.createContainer();
  const dom = new HTMLDOM(document);
  Registration.instance(IDOM, dom).register(container, IDOM);
  if (options.lifecycle) {
    Registration.instance(ILifecycle, options.lifecycle).register(container, ILifecycle);
  }
  const lifecycle = container.get(ILifecycle);
  const parent = document.createElement('div');
  const host = document.createElement(ElementType.description.name);
  // @ts-ignore
  const renderable = new FakeView(lifecycle);
  const instruction: IHydrateElementInstruction = {
    type: TargetedInstructionType.hydrateElement,
    res: 'au-compose',
    instructions: []
  };

  dom.appendChild(parent, host);

  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();

  renderableProvider.prepare(renderable);
  elementProvider.prepare(host);
  instructionProvider.prepare(instruction);

  container.register(ElementType);
  container.registerResolver(IRenderable, renderableProvider);
  container.registerResolver(ITargetedInstruction, instructionProvider);
  dom.registerElementResolver(container, elementProvider);

  const element = container.get<T & ICustomElement>(
    CustomElementResource.keyFrom(ElementType.description.name)
  ) as T & ICustomElement & InstanceType<typeof Type>;

  const renderingEngine = container.get(IRenderingEngine);
  const projectorLocator = container.get(IProjectorLocator);
  element.$hydrate(dom, projectorLocator, renderingEngine, host);

  return { dom, element, parent, lifecycle };
}
