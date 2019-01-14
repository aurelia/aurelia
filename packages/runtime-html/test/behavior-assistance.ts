
import { Constructable } from '@aurelia/kernel';
import {
  CustomElementResource,
  ICustomElement,
  ICustomElementType,
  IHydrateElementInstruction,
  IProjectorLocator,
  IRenderable,
  IRenderingEngine,
  ITargetedInstruction,
  TargetedInstructionType
} from '@aurelia/runtime';
import { InstanceProvider } from '../../runtime/src/rendering-engine';
import { FakeView } from './_doubles/fake-view';
import { HTMLTestContext } from './util';

export function hydrateCustomElement<T>(Type: Constructable<T>, ctx: HTMLTestContext) {
  const { container, dom } = ctx;
  const ElementType: ICustomElementType = Type as any;
  const parent = ctx.createElement('div');
  const host = ctx.createElement(ElementType.description.name);
  const renderable = new FakeView(ctx);
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
  element.$hydrate(0, dom, projectorLocator, renderingEngine, host);

  return { element, parent };
}
