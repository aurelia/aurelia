import { IContainer, IResolver, IInterfaceSymbol, IServiceLocator } from "../di";
import { RenderSlot, IRenderSlot } from "./render-slot";
import { INode, DOM } from "../dom";
import { PLATFORM } from "../platform";
import { ITemplateSource, ITargetedInstruction, IHydrateElementInstruction, TargetedInstructionType } from "./instructions";
import { IRenderingEngine } from "./rendering-engine";
import { IRenderer } from "./renderer";
import { IViewOwner } from "./view";
import { IVisualFactory } from "./visual";
import { IAttributeComponent, IElementComponent } from "./component";
import { Constructable } from "../interfaces";

export interface IRenderContext extends IServiceLocator {
  createChild(): IRenderContext;
  render(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>);
  hydrateElement(owner: IViewOwner, target: any, instruction: IHydrateElementInstruction): void;
  hydrateElementInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent): void;
  beginComponentOperation(owner: IViewOwner, target: any, instruction: ITargetedInstruction, factory?: IVisualFactory, replacements?: Record<string, ITemplateSource>, anchor?: INode, anchorIsContainer?: boolean): IComponentOperation;
};

export interface IComponentOperation {
  tryConnectTemplateControllerToSlot(owner: IAttributeComponent): void;
  tryConnectElementToSlot(owner: IElementComponent): void;
  dispose();
}

type ExposedContext = IRenderContext & IComponentOperation & IContainer;

export function createRenderContext(renderingEngine: IRenderingEngine, parentContext: IRenderContext, dependencies: any[]): IRenderContext {
  let context = <ExposedContext>parentContext.createChild();
  let ownerProvider = new InstanceProvider();
  let elementProvider = new InstanceProvider();
  let instructionProvider = new InstanceProvider<ITargetedInstruction>();
  let factoryProvider = new ViewFactoryProvider(renderingEngine);
  let slotProvider = new RenderSlotProvider();
  let renderer = renderingEngine.createRenderer(context);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IVisualFactory, factoryProvider);
  context.registerResolver(IRenderSlot, slotProvider);
  context.registerResolver(IViewOwner, ownerProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>) {
    renderer.render(owner, targets, source, host, replacements)
  };

  context.beginComponentOperation = function(owner: IViewOwner, target: any, instruction: ITargetedInstruction, factory?: IVisualFactory, replacements?: Record<string, ITemplateSource>, anchor?: INode, anchorIsContainer?: boolean) {
    ownerProvider.prepare(owner);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);
    
    if (factory) {
      factoryProvider.prepare(factory, replacements);
    }

    if (anchor) {
      slotProvider.prepare(anchor, anchorIsContainer);
    }

    return context;
  };

  context.hydrateElement = function(owner: IViewOwner, target: any, instruction: IHydrateElementInstruction): void {
    renderer[TargetedInstructionType.hydrateElement](owner, target, instruction);
  };

  context.hydrateElementInstance = function(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent) {
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
  private replacements: Record<string, ITemplateSource>;

  constructor(private renderingEngine: IRenderingEngine) {}

  prepare(factory: IVisualFactory, replacements: Record<string, ITemplateSource>) { 
    this.factory = factory;
    this.replacements = replacements || PLATFORM.emptyObject;
  }

  resolve(handler: IContainer, requestor: ExposedContext) {
    let found = this.replacements[this.factory.name];

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
      (<any>slot).$isContentProjectionSource = true; // Usage: Shadow DOM Emulation
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
