import { IContainer, IResolver } from "../di";
import { RenderSlot, IRenderSlot } from "./render-slot";
import { INode, DOM } from "../dom";
import { PLATFORM } from "../platform";
import { ITemplateSource, ITargetedInstruction } from "./instructions";
import { ITemplateEngine } from "./template-engine";
import { IInstructionInterpreter } from "./instruction-interpreter";
import { IViewOwner } from "./view";
import { IVisualFactory } from "./visual";

export interface ITemplateContainer extends IContainer {
  element: InstanceProvider<INode>;
  factory: ViewFactoryProvider;
  slot: RenderSlotProvider;
  owner: InstanceProvider<IViewOwner>;
  instruction: InstanceProvider<ITargetedInstruction>
  interpreter: IInstructionInterpreter;
};

export function createTemplateContainer(templateEngine: ITemplateEngine, parentContainer: IContainer, dependencies: any[]): ITemplateContainer {
  let container = <ITemplateContainer>parentContainer.createChild();

  container.interpreter = templateEngine.createInstructionInterpreter(container);
  container.element = new InstanceProvider();
  DOM.registerElementResolver(container, container.element);

  container.registerResolver(IVisualFactory, container.factory = new ViewFactoryProvider(templateEngine));
  container.registerResolver(IRenderSlot, container.slot = new RenderSlotProvider());
  container.registerResolver(IViewOwner, container.owner =  new InstanceProvider());
  container.registerResolver(ITargetedInstruction, container.instruction = new InstanceProvider());

  if (dependencies) {
    container.register(...dependencies);
  }

  return container;
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

  constructor(private templateEngine: ITemplateEngine) {}

  prepare(factory: IVisualFactory, replacements: Record<string, ITemplateSource>) { 
    this.factory = factory;
    this.replacements = replacements || PLATFORM.emptyObject;
  }

  resolve(handler: IContainer, requestor: IContainer) {
    let found = this.replacements[this.factory.name];

    if (found) {
      return this.templateEngine.getVisualFactory(requestor, found);
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

  connectTemplateController(owner) {
    const slot = this.slot;

    if (slot !== null) {
      (<any>slot).$isContentProjectionSource = true; // Usage: Shadow DOM Emulation
      owner.$slot = slot; // Usage: Custom Attributes
    }
  }

  connectCustomElement(owner) {
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
