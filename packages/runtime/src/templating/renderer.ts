import { Immutable } from '@aurelia/kernel';
import { Binding } from '../binding/binding';
import { BindingMode } from '../binding/binding-mode';
import { Call } from '../binding/call';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { Listener } from '../binding/listener';
import { IObserverLocator } from '../binding/observer-locator';
import { Ref } from '../binding/ref';
import { DOM, INode } from '../dom';
import { CustomAttributeResource, ICustomAttribute } from './custom-attribute';
import { CustomElementResource, ICustomElement } from './custom-element';
import { ICallBindingInstruction, IFromViewBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateSlotInstruction, IHydrateTemplateController, IListenerBindingInstruction, IOneWayBindingInstruction, IRefBindingInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, ITwoWayBindingInstruction, TargetedInstructionType, TemplateDefinition, TemplatePartDefinitions } from "./instructions";
import { IRenderContext } from './render-context';
import { IRenderingEngine } from './rendering-engine';
import { ShadowDOMEmulation } from './shadow-dom';
import { IViewOwner } from './view';

export interface IRenderer {
  render(owner: IViewOwner, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
  hydrateElementInstance(owner: IViewOwner, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void;
}

/* @internal */
export class Renderer implements IRenderer {
  constructor(
    private context: IRenderContext,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private renderingEngine: IRenderingEngine
  ) {}

  public render(owner: IViewOwner, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      const instructions = targetInstructions[i];
      const target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        const current = instructions[j];
        (this[current.type] as any)(owner, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        (this[current.type] as any)(owner, host, current, parts);
      }
    }
  }

  public hydrateElementInstance(owner: IViewOwner, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement) {
    let childInstructions = instruction.instructions;
  
    component.$hydrate(this.renderingEngine, target, instruction);
    
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

  public [TargetedInstructionType.textBinding](owner: IViewOwner,target: any, instruction: Immutable<ITextBindingInstruction>) {
    const next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), next, 'textContent', BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.toViewBinding](owner: IViewOwner,target: any, instruction: Immutable<IOneWayBindingInstruction>) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.fromViewBinding](owner: IViewOwner,target: any, instruction: Immutable<IFromViewBindingInstruction>) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.fromView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.twoWayBinding](owner: IViewOwner,target: any, instruction: Immutable<ITwoWayBindingInstruction>) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.twoWay, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.listenerBinding](owner: IViewOwner,target: any, instruction: Immutable<IListenerBindingInstruction>) {
    owner.$bindable.push(new Listener(instruction.src, instruction.strategy, this.parser.parse(instruction.dest), target, instruction.preventDefault, this.eventManager, this.context));
  }

  public [TargetedInstructionType.callBinding](owner: IViewOwner,target: any, instruction: Immutable<ICallBindingInstruction>) {
    owner.$bindable.push(new Call(this.parser.parse(instruction.src), target, instruction.dest, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.refBinding](owner: IViewOwner,target: any, instruction: Immutable<IRefBindingInstruction>) {
    owner.$bindable.push(new Ref(this.parser.parse(instruction.src), target, this.context));
  }

  public [TargetedInstructionType.stylePropertyBinding](owner: IViewOwner,target: any, instruction: Immutable<IStylePropertyBindingInstruction>) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), (<any>target).style, instruction.dest, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.setProperty](owner: IViewOwner, target: any, instruction: Immutable<ISetPropertyInstruction>) {
    target[instruction.dest] = instruction.value;
  }

  public [TargetedInstructionType.setAttribute](owner: IViewOwner, target: any, instruction: Immutable<ISetAttributeInstruction>) {
    DOM.setAttribute(target, instruction.dest, instruction.value);
  }

  public [TargetedInstructionType.hydrateSlot](owner: ICustomElement, target: any, instruction: Immutable<IHydrateSlotInstruction>) {   
    if (!owner.$usingSlotEmulation) {
      return;
    }

    const fallbackFactory = this.renderingEngine.getVisualFactory(this.context, instruction.fallback);
    const slot = ShadowDOMEmulation.createSlot(target, owner, instruction.name, instruction.dest, fallbackFactory);

    owner.$slots[slot.name] = slot;
    owner.$bindable.push(slot);
    owner.$attachable.push(slot);
  }

  public [TargetedInstructionType.hydrateElement](owner: IViewOwner, target: any, instruction: Immutable<IHydrateElementInstruction>) {
    const context = this.context;
    const operation = context.beginComponentOperation(owner, target, instruction, null, null, target, true);
    const component = context.get<ICustomElement>(CustomElementResource.key(instruction.res));

    this.hydrateElementInstance(owner, target, instruction, component);
    operation.tryConnectElementToSlot(component);
    
    operation.dispose();
  }

  public [TargetedInstructionType.hydrateAttribute](owner: IViewOwner, target: any, instruction: Immutable<IHydrateAttributeInstruction>) {
    const childInstructions = instruction.instructions;
    const context = this.context;
    const operation = context.beginComponentOperation(owner, target, instruction);

    const component = context.get<ICustomAttribute>(CustomAttributeResource.key(instruction.res));
    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this[current.type] as any)(owner, component, current);
    }

    owner.$bindable.push(component);
    owner.$attachable.push(component);

    operation.dispose();
  }

  public [TargetedInstructionType.hydrateTemplateController](owner: IViewOwner, target: any, instruction: Immutable<IHydrateTemplateController>, parts?: TemplatePartDefinitions) {
    const childInstructions = instruction.instructions;
    const factory = this.renderingEngine.getVisualFactory(this.context, instruction.src);
    const context = this.context;
    const operation = context.beginComponentOperation(owner, target, instruction, factory, parts, DOM.convertToAnchor(target), false);

    const component = context.get<ICustomAttribute>(CustomAttributeResource.key(instruction.res));
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
