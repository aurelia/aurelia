import { IContainer, IResolver, IServiceLocator } from "../../kernel/di";
import { RenderSlot, IRenderSlot } from "./render-slot";
import { INode, DOM } from "../dom";
import { PLATFORM } from "../../kernel/platform";
import { ITargetedInstruction, IHydrateElementInstruction, TargetedInstructionType, TemplateDefinition, TemplatePartDefinitions } from "./instructions";
import { IRenderingEngine } from "./rendering-engine";
import { IViewOwner } from "./view";
import { IVisualFactory } from "./visual";
import { IAttributeComponent, IElementComponent } from "./component";
import { ImmutableArray, Immutable } from "../../kernel/interfaces";

export interface IRenderContext extends IServiceLocator {
  createChild(): IRenderContext;
  render(owner: IViewOwner, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions);
  hydrateElement(owner: IViewOwner, target: any, instruction: Immutable<IHydrateElementInstruction>): void;
  hydrateElementInstance(owner: IViewOwner, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: IElementComponent): void;
  beginComponentOperation(owner: IViewOwner, target: any, instruction: Immutable<ITargetedInstruction>, factory?: IVisualFactory, parts?: TemplatePartDefinitions, anchor?: INode, anchorIsContainer?: boolean): IComponentOperation;
};

export interface IComponentOperation {
  tryConnectTemplateControllerToSlot(owner: IAttributeComponent): void;
  tryConnectElementToSlot(owner: IElementComponent): void;
  dispose();
}

type ExposedContext = IRenderContext & IComponentOperation & IContainer;

export function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<any>): IRenderContext {
  const context = <ExposedContext>parentRenderContext.createChild();
  const ownerProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider(renderingEngine);
  const slotProvider = new RenderSlotProvider();
  const renderer = renderingEngine.createRenderer(context);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IVisualFactory, factoryProvider);
  context.registerResolver(IRenderSlot, slotProvider);
  context.registerResolver(IViewOwner, ownerProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(owner: IViewOwner, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions) {
    renderer.render(owner, targets, templateDefinition, host, parts)
  };

  context.beginComponentOperation = function(owner: IViewOwner, target: any, instruction: ITargetedInstruction, factory?: IVisualFactory, parts?: TemplatePartDefinitions, anchor?: INode, anchorIsContainer?: boolean) {
    ownerProvider.prepare(owner);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);
    
    if (factory) {
      factoryProvider.prepare(factory, parts);
    }

    if (anchor) {
      slotProvider.prepare(anchor, anchorIsContainer);
    }

    return context;
  };

  context.hydrateElement = function(owner: IViewOwner, target: any, instruction: Immutable<IHydrateElementInstruction>): void {
    renderer[TargetedInstructionType.hydrateElement](owner, target, instruction);
  };

  context.hydrateElementInstance = function(owner: IViewOwner, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: IElementComponent) {
    renderer.hydrateElementInstance(owner, target, instruction, component);
  };

  context.tryConnectTemplateControllerToSlot = function(owner: IAttributeComponent) {
    slotProvider.tryConnectTemplateControllerToSlot(owner);
  };

  context.tryConnectElementToSlot = function(owner: IElementComponent) {
    slotProvider.tryConnectElementToSlot(owner);
  };

  context.dispose = function() {
    factoryProvider.dispose();
    slotProvider.dispose();
    ownerProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
  };

  return context;
}

class InstanceProvider<T> implements IResolver {
  private instance: T = null;

  prepare(instance: T) {
    this.instance = instance;
  }

  resolve(handler: IContainer, requestor: IContainer) {
    return this.instance;
  }

  dispose() {
    this.instance = null;
  }
}

class ViewFactoryProvider implements IResolver {
  private factory: IVisualFactory
  private replacements: TemplatePartDefinitions;

  constructor(private renderingEngine: IRenderingEngine) {}

  prepare(factory: IVisualFactory, parts: TemplatePartDefinitions) { 
    this.factory = factory;
    this.replacements = parts || PLATFORM.emptyObject;
  }

  resolve(handler: IContainer, requestor: ExposedContext) {
    const found = this.replacements[this.factory.name];

    if (found) {
      return this.renderingEngine.getVisualFactory(requestor, found);
    }

    return this.factory;
  }

  dispose() {
    this.factory = null;
    this.replacements = null;
  }
}

class RenderSlotProvider implements IResolver {
  private node: INode = null;
  private anchorIsContainer = false;
  private slot: IRenderSlot = null;

  prepare(element: INode, anchorIsContainer = false) {
    this.node = element;
    this.anchorIsContainer = anchorIsContainer;
  }

  resolve(handler: IContainer, requestor: IContainer) {
    return this.slot || (this.slot = RenderSlot.create(this.node, this.anchorIsContainer));
  }

  tryConnectTemplateControllerToSlot(owner) {
    const slot = this.slot;

    if (slot !== null) {
      (slot as any).$isContentProjectionSource = true; // Usage: Shadow DOM Emulation
      owner.$slot = slot; // Usage: Custom Attributes
    }
  }

  tryConnectElementToSlot(owner) {
    const slot = this.slot;

    if (slot !== null) {
      owner.$slot = slot; // Usage: Custom Elements
    }
  }

  dispose() {
    this.node = null;
    this.slot = null;
  }
}
