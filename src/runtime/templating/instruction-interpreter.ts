import { IViewOwner } from './view';
import { INode, DOM } from '../dom';
import { ITemplateSource, IHydrateElementInstruction, TargetedInstructionType, ITextBindingInstruction, IOneWayBindingInstruction, IFromViewBindingInstruction, ITwoWayBindingInstruction, IListenerBindingInstruction, ICallBindingInstruction, IRefBindingInstruction, IStylePropertyBindingInstruction, ISetPropertyInstruction, ISetAttributeInstruction, IHydrateSlotInstruction, IHydrateAttributeInstruction, IHydrateTemplateController } from "./instructions";
import { IElementComponent, IAttributeComponent } from './component';
import { ITaskQueue } from '../task-queue';
import { IObserverLocator } from '../binding/observer-locator';
import { IEventManager } from '../binding/event-manager';
import { IParser } from '../binding/parser';
import { ITemplateEngine } from './template-engine';
import { BindingMode } from '../binding/binding-mode';
import { Binding } from '../binding/binding';
import { Listener } from '../binding/listener';
import { Call } from '../binding/call';
import { Ref } from '../binding/ref';
import { ShadowDOMEmulation } from './shadow-dom';
import { DI, inject, IContainer } from '../di';
import { ITemplateContainer } from './template-container';

export interface IInstructionInterpreter {
  interpret(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>): void;
  applyElementInstructionToComponentInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent): void;
}

/* @internal */
export class InstructionInterpreter {
  constructor(
    private container: ITemplateContainer,
    private taskQueue: ITaskQueue, 
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IParser,
    private templateEngine: ITemplateEngine
  ) {}

  interpret(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>): void {
    let targetInstructions = source.instructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      let instructions = targetInstructions[i];
      let target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        let current = instructions[j];
        (<any>this[current.type])(owner, target, current, replacements);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogates;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        let current = surrogateInstructions[i];
        (<any>this[current.type])(owner, host, current, replacements);
      }
    }
  }

  applyElementInstructionToComponentInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent) {
    let childInstructions = instruction.instructions;
  
    component.$hydrate(
      this.templateEngine,
      target, 
      instruction.replacements,
      instruction.contentElement
    );
    
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      let currentType = current.type;
      let realTarget;
      
      if (currentType === TargetedInstructionType.stylePropertyBinding || currentType === TargetedInstructionType.listenerBinding) {
        realTarget = target;
      } else {
        realTarget = component;
      }
  
      (<any>this[current.type])(owner, realTarget, current);
    }
  
    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  [TargetedInstructionType.textBinding](owner: IViewOwner,target: any, instruction: ITextBindingInstruction) {
    let next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), next, 'textContent', BindingMode.oneWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.oneWayBinding](owner: IViewOwner,target: any, instruction: IOneWayBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.oneWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.fromViewBinding](owner: IViewOwner,target: any, instruction: IFromViewBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.fromView, this.observerLocator, this.container));
  }

  [TargetedInstructionType.twoWayBinding](owner: IViewOwner,target: any, instruction: ITwoWayBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.twoWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.listenerBinding](owner: IViewOwner,target: any, instruction: IListenerBindingInstruction) {
    owner.$bindable.push(new Listener(instruction.src, instruction.strategy, this.parser.parse(instruction.dest), target, instruction.preventDefault, this.eventManager, this.container));
  }

  [TargetedInstructionType.callBinding](owner: IViewOwner,target: any, instruction: ICallBindingInstruction) {
    owner.$bindable.push(new Call(this.parser.parse(instruction.src), target, instruction.dest, this.observerLocator, this.container));
  }

  [TargetedInstructionType.refBinding](owner: IViewOwner,target: any, instruction: IRefBindingInstruction) {
    owner.$bindable.push(new Ref(this.parser.parse(instruction.src), target, this.container));
  }

  [TargetedInstructionType.stylePropertyBinding](owner: IViewOwner,target: any, instruction: IStylePropertyBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), (<any>target).style, instruction.dest, BindingMode.oneWay, this.observerLocator, this.container));
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

    let fallbackFactory = this.templateEngine.getVisualFactory(this.container, instruction.fallback);
    let slot = ShadowDOMEmulation.createSlot(target, owner, instruction.name, instruction.dest, fallbackFactory);

    owner.$slots[slot.name] = slot;
    owner.$bindable.push(slot);
    owner.$attachable.push(slot);
  }

  [TargetedInstructionType.hydrateElement](owner: IViewOwner, target: any, instruction: IHydrateElementInstruction) {
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);
    container.slot.prepare(target, true);
    
    let component = container.get<IElementComponent>(instruction.res);
    this.applyElementInstructionToComponentInstance(owner, target, instruction, component);
    container.slot.connectCustomElement(component);
    
    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();
    container.slot.dispose();
  }

  [TargetedInstructionType.hydrateAttribute](owner: IViewOwner, target: any, instruction: IHydrateAttributeInstruction) {
    let childInstructions = instruction.instructions;
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);

    let component = container.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.templateEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      (<any>this[current.type])(owner, component, current);
    }

    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();

    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  [TargetedInstructionType.hydrateTemplateController](owner: IViewOwner, target: any, instruction: IHydrateTemplateController, replacements?: Record<string, ITemplateSource>) {
    let childInstructions = instruction.instructions;
    let factory = this.templateEngine.getVisualFactory(this.container, instruction.src);
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);
    container.factory.prepare(factory, replacements);
    container.slot.prepare(DOM.convertToAnchor(target), false);

    let component = container.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.templateEngine);
    container.slot.connectTemplateController(component);

    if (instruction.link) {
      (<any>component).link(owner.$attachable[owner.$attachable.length - 1]);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      (<any>this[current.type])(owner, component, current);
    }

    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();
    container.factory.dispose();
    container.slot.dispose();

    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }
}
