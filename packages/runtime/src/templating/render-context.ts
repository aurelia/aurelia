import { IContainer, IDisposable, Immutable, ImmutableArray, IResolver, IServiceLocator, PLATFORM } from '@aurelia/kernel';
import { DOM, INode, IRenderLocation } from '../dom';
import { ICustomAttribute } from './custom-attribute';
import { ICustomElement } from './custom-element';
import { IHydrateElementInstruction, ITargetedInstruction, TargetedInstructionType, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';
import { IViewFactory } from './view';
import { IViewSlot, ViewSlot } from './view-slot';

export interface IRenderContext extends IServiceLocator {
  createChild(): IRenderContext;
  render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
  hydrateElement(renderable: IRenderable, target: any, instruction: Immutable<IHydrateElementInstruction>): void;
  hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void;
  beginComponentOperation(renderable: IRenderable, target: any, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation, locationIsContainer?: boolean): IComponentOperation;
}

export interface IComponentOperation extends IDisposable {
  tryConnectTemplateControllerToSlot(customAttribute: ICustomAttribute): void;
  tryConnectElementToSlot(customElement: ICustomElement): void;
}

/*@internal*/
export type ExposedContext = IRenderContext & IComponentOperation & IContainer;

export function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<any>): IRenderContext {
  const context = <ExposedContext>parentRenderContext.createChild();
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider(renderingEngine);
  const slotProvider = new ViewSlotProvider();
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = renderingEngine.createRenderer(context);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IViewSlot, slotProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    renderer.render(renderable, targets, templateDefinition, host, parts)
  };

  context.beginComponentOperation = function(renderable: IRenderable, target: any, instruction: ITargetedInstruction, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation, locationIsContainer?: boolean): IComponentOperation {
    renderableProvider.prepare(renderable);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);

    if (factory) {
      factoryProvider.prepare(factory, parts);
    }

    if (location) {
      renderLocationProvider.prepare(location);
      slotProvider.prepare(location, locationIsContainer);
    }

    return context;
  };

  context.hydrateElement = function(renderable: IRenderable, target: any, instruction: Immutable<IHydrateElementInstruction>): void {
    renderer[TargetedInstructionType.hydrateElement](renderable, target, instruction);
  };

  context.hydrateElementInstance = function(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void {
    renderer.hydrateElementInstance(renderable, target, instruction, component);
  };

  context.tryConnectTemplateControllerToSlot = function(renderable: ICustomAttribute): void {
    slotProvider.tryConnectTemplateControllerToSlot(renderable);
  };

  context.tryConnectElementToSlot = function(renderable: ICustomElement): void {
    slotProvider.tryConnectElementToSlot(renderable);
  };

  context.dispose = function(): void {
    factoryProvider.dispose();
    slotProvider.dispose();
    renderableProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
    renderLocationProvider.dispose();
  };

  return context;
}

/*@internal*/
export class InstanceProvider<T> implements IResolver {
  private instance: T = null;

  public prepare(instance: T): void {
    this.instance = instance;
  }

  public resolve(handler: IContainer, requestor: IContainer): T {
    return this.instance;
  }

  public dispose(): void {
    this.instance = null;
  }
}

/*@internal*/
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory;
  private replacements: TemplatePartDefinitions;

  constructor(private renderingEngine: IRenderingEngine) {}

  public prepare(factory: IViewFactory, parts: TemplatePartDefinitions): void {
    this.factory = factory;
    this.replacements = parts || PLATFORM.emptyObject;
  }

  public resolve(handler: IContainer, requestor: ExposedContext): IViewFactory {
    const found = this.replacements[this.factory.name];

    if (found) {
      return this.renderingEngine.getViewFactory(requestor, found);
    }

    return this.factory;
  }

  public dispose(): void {
    this.factory = null;
    this.replacements = null;
  }
}

/*@internal*/
export class ViewSlotProvider implements IResolver {
  private node: INode = null;
  private locationIsContainer: boolean = false;
  private slot: IViewSlot = null;

  public prepare(element: INode, locationIsContainer: boolean = false): void {
    this.node = element;
    this.locationIsContainer = locationIsContainer;
  }

  public resolve(handler: IContainer, requestor: IContainer): IViewSlot {
    return this.slot || (this.slot = ViewSlot.create(this.node, this.locationIsContainer));
  }

  public tryConnectTemplateControllerToSlot(customAttribute): void {
    const slot = this.slot;

    if (slot !== null) {
      customAttribute.$child = slot; // Usage: Custom Attributes
    }
  }

  public tryConnectElementToSlot(customElement): void {
    const slot = this.slot;

    if (slot !== null) {
      customElement.$child = slot; // Usage: Custom Elements
    }
  }

  public dispose(): void {
    this.node = null;
    this.slot = null;
  }
}
