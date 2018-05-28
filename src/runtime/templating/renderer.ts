import { IViewOwner } from './view';
import { INode, DOM } from '../dom';
import { ITemplateSource, IHydrateElementInstruction, TargetedInstructionType, ITextBindingInstruction, IOneWayBindingInstruction, IFromViewBindingInstruction, ITwoWayBindingInstruction, IListenerBindingInstruction, ICallBindingInstruction, IRefBindingInstruction, IStylePropertyBindingInstruction, ISetPropertyInstruction, ISetAttributeInstruction, IHydrateSlotInstruction, IHydrateAttributeInstruction, IHydrateTemplateController } from "./instructions";
import { IElementComponent, IAttributeComponent } from './component';
import { ITaskQueue } from '../task-queue';
import { IObserverLocator } from '../binding/observer-locator';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IRenderingEngine } from './rendering-engine';
import { BindingMode } from '../binding/binding-mode';
import { Binding } from '../binding/binding';
import { Listener } from '../binding/listener';
import { Call } from '../binding/call';
import { Ref } from '../binding/ref';
import { ShadowDOMEmulation } from './shadow-dom';
import { DI, inject, IContainer } from '../di';
import { IRenderContext } from './render-context';

export interface IRenderer {
  render(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>): void;
  hydrateElementInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent): void;
}

/* @internal */
export class Renderer {
  constructor(
    private context: IRenderContext,
    private taskQueue: ITaskQueue, 
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private renderingEngine: IRenderingEngine
  ) {}

  render(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>): void {
    const targetInstructions = source.instructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      const instructions = targetInstructions[i];
      const target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        const current = instructions[j];
        (this[current.type] as any)(owner, target, current, replacements);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogates;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        (this[current.type] as any)(owner, host, current, replacements);
      }
    }
  }

  hydrateElementInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent) {
    let childInstructions = instruction.instructions;
  
    component.$hydrate(this.renderingEngine, target, instruction.replacements, instruction.contentElement);
    
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      const currentType = current.type;
      let realTarget;
      
      if (currentType === TargetedInstructionType.stylePropertyBinding || currentType === TargetedInstructionType.listenerBinding) {
        realTarget = target;
      } else {
        realTarget = component;
      }
  
      (this[current.type] as any)(owner, realTarget, current);
    }
  
    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  [TargetedInstructionType.textBinding](owner: IViewOwner,target: any, instruction: ITextBindingInstruction) {
    const next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), next, 'textContent', BindingMode.oneWay, this.observerLocator, this.context));
  }

  [TargetedInstructionType.oneWayBinding](owner: IViewOwner,target: any, instruction: IOneWayBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.oneWay, this.observerLocator, this.context));
  }

  [TargetedInstructionType.fromViewBinding](owner: IViewOwner,target: any, instruction: IFromViewBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.fromView, this.observerLocator, this.context));
  }

  [TargetedInstructionType.twoWayBinding](owner: IViewOwner,target: any, instruction: ITwoWayBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.twoWay, this.observerLocator, this.context));
  }

  [TargetedInstructionType.listenerBinding](owner: IViewOwner,target: any, instruction: IListenerBindingInstruction) {
    owner.$bindable.push(new Listener(instruction.src, instruction.strategy, this.parser.parse(instruction.dest), target, instruction.preventDefault, this.eventManager, this.context));
  }

  [TargetedInstructionType.callBinding](owner: IViewOwner,target: any, instruction: ICallBindingInstruction) {
    owner.$bindable.push(new Call(this.parser.parse(instruction.src), target, instruction.dest, this.observerLocator, this.context));
  }

  [TargetedInstructionType.refBinding](owner: IViewOwner,target: any, instruction: IRefBindingInstruction) {
    owner.$bindable.push(new Ref(this.parser.parse(instruction.src), target, this.context));
  }

  [TargetedInstructionType.stylePropertyBinding](owner: IViewOwner,target: any, instruction: IStylePropertyBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), (<any>target).style, instruction.dest, BindingMode.oneWay, this.observerLocator, this.context));
  }

  [TargetedInstructionType.setProperty](owner: IViewOwner, target: any, instruction: ISetPropertyInstruction) {
    target[instruction.dest] = instruction.value;
  }

  [TargetedInstructionType.setAttribute](owner: IViewOwner, target: any, instruction: ISetAttributeInstruction) {
    DOM.setAttribute(target, instruction.dest, instruction.value);
  }

  [TargetedInstructionType.hydrateSlot](owner: IElementComponent, target: any, instruction: IHydrateSlotInstruction) {   
    if (!owner.$usingSlotEmulation) {
      return;
    }

    const fallbackFactory = this.renderingEngine.getVisualFactory(this.context, instruction.fallback);
    const slot = ShadowDOMEmulation.createSlot(target, owner, instruction.name, instruction.dest, fallbackFactory);

    owner.$slots[slot.name] = slot;
    owner.$bindable.push(slot);
    owner.$attachable.push(slot);
  }

  [TargetedInstructionType.hydrateElement](owner: IViewOwner, target: any, instruction: IHydrateElementInstruction) {
    const context = this.context;
    const operation = context.beginComponentOperation(owner, target, instruction, null, null, target, true);
    const component = context.get<IElementComponent>(instruction.res);

    this.hydrateElementInstance(owner, target, instruction, component);
    operation.tryConnectElementToSlot(component);
    
    operation.dispose();
  }

  [TargetedInstructionType.hydrateAttribute](owner: IViewOwner, target: any, instruction: IHydrateAttributeInstruction) {
    const childInstructions = instruction.instructions;
    const context = this.context;
    const operation = context.beginComponentOperation(owner, target, instruction);

    const component = context.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this[current.type] as any)(owner, component, current);
    }

    owner.$bindable.push(component);
    owner.$attachable.push(component);

    operation.dispose();
  }

  [TargetedInstructionType.hydrateTemplateController](owner: IViewOwner, target: any, instruction: IHydrateTemplateController, replacements?: Record<string, ITemplateSource>) {
    const childInstructions = instruction.instructions;
    const factory = this.renderingEngine.getVisualFactory(this.context, instruction.src);
    const context = this.context;
    const operation = context.beginComponentOperation(owner, target, instruction, factory, replacements, DOM.convertToAnchor(target), false);

    const component = context.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.renderingEngine);
    operation.tryConnectTemplateControllerToSlot(component);

    if (instruction.link) {
      (component as any).link(owner.$attachable[owner.$attachable.length - 1]);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this[current.type] as any)(owner, component, current);
    }

    owner.$bindable.push(component);
    owner.$attachable.push(component);

    operation.dispose();
  }
}
