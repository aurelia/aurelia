import { DOM } from "../dom";
import { View, IView, IViewOwner } from "./view";
import { IComponent, IAttach, IBindSelf } from "./component";
import { IBinding, Binding } from "../binding/binding";
import { ViewSlot } from "./view-slot";
import { IBindScope, IScope } from "../binding/binding-interfaces";
import { getAST, lookupFunctions } from "./generated";
import { IShadowSlot, ShadowDOM } from "./shadow-dom";
import { ViewFactory } from "./view-factory";
import { bindingMode } from "../binding/binding-mode";
import { Listener } from "../binding/listener";
import { Call } from "../binding/call";
import { Ref } from "../binding/ref";

export interface ITemplate {
  createFor(owner: IViewOwner, host?: Node): IView;
}

export interface CompiledViewSource {
  template: string;
  hasSlots?: boolean;
  targetInstructions: any[];
  surrogateInstructions?: any[];
}

const noViewTemplate: ITemplate = {
  createFor(owner: IViewOwner, host?: Node) {
    return View.none;
  }
};

export const Template = {
  none: noViewTemplate,

  fromCompiledSource(source: CompiledViewSource) {
    if (source && source.template) {
      return new CompiledTemplate(source);
    }

    return noViewTemplate;
  }
};

function applyInstruction(owner: IViewOwner, instruction, target) {
  switch(instruction.type) {
    case 'oneWayText':
      let next = target.nextSibling;
      DOM.treatNodeAsNonWhitespace(next);
      DOM.removeNode(target);
      owner.$bindable.push(new Binding(getAST(instruction.source), next, 'textContent', bindingMode.oneWay, lookupFunctions));
      break;
    case 'oneWay':
      owner.$bindable.push(new Binding(getAST(instruction.source), target, instruction.target, bindingMode.oneWay, lookupFunctions));
      break;
    case 'fromView':
      owner.$bindable.push(new Binding(getAST(instruction.source), target, instruction.target, bindingMode.fromView, lookupFunctions));
      break;
    case 'twoWay':
      owner.$bindable.push(new Binding(getAST(instruction.source), target, instruction.target, bindingMode.twoWay, lookupFunctions));
      break;
    case 'listener':
      owner.$bindable.push(new Listener(instruction.source, instruction.strategy, getAST(instruction.target), target, instruction.preventDefault, lookupFunctions));
      break;
    case 'call':
      owner.$bindable.push(new Call(getAST(instruction.source), target, instruction.target, lookupFunctions));
      break;
    case 'ref':
      owner.$bindable.push(new Ref(getAST(instruction.source), target, lookupFunctions));
      break;
    case 'style':
      owner.$bindable.push(new Binding(getAST(instruction.source), (target as HTMLElement).style, instruction.target, bindingMode.oneWay, lookupFunctions));
      break;
    case 'property':
      target[instruction.target] = instruction.value;
      break;
    case 'slot':
      if (!owner.$useShadowDOM) {
        let slot = ShadowDOM.createSlotFromInstruction(owner, instruction);
        owner.$slots[slot.name] = slot;
        owner.$bindable.push(slot);
        owner.$attachable.push(slot);
        DOM.replaceNode(slot.anchor, target);
      }
      break;
    case 'element':
      let elementInstructions = instruction.instructions;
      let elementModel: (IViewOwner & IComponent) = new instruction.ctor(); //TODO: DI
      (<any>elementModel).$contentView = View.fromCompiledElementContent(elementModel, target);

      elementModel.applyTo(target);

      for (let i = 0, ii = elementInstructions.length; i < ii; ++i) {
        let current = elementInstructions[i];
        let realTarget = current.type === 'style' || current.type === 'listener' ? target : elementModel;
        applyInstruction(owner, current, realTarget);
      }

      owner.$bindable.push(elementModel);
      owner.$attachable.push(elementModel);

      break;
    case 'attribute':
      let attributeInstructions = instruction.instructions;
      let attributeModel: IComponent = new instruction.ctor(target); //TODO: DI

      for (let i = 0, ii = attributeInstructions.length; i < ii; ++i) {
        applyInstruction(owner, attributeInstructions[i], attributeModel);
      }

      owner.$bindable.push(attributeModel);
      owner.$attachable.push(attributeModel);
      break;
    case 'templateController':
      let templateControllerInstructions = instruction.instructions;
      let factory = instruction.factory;

      if (factory === undefined) {
        instruction.factory = factory = ViewFactory.fromCompiledSource(instruction.config);
      }  

      let templateControllerModel: IComponent = new instruction.ctor(
        factory, 
        new ViewSlot(DOM.makeElementIntoAnchor(target), false)
      ); //TODO: DI

      if (instruction.link) {
        (<any>templateControllerModel).link(owner.$attachable[owner.$attachable.length - 1]);
      }

      for (let i = 0, ii = templateControllerInstructions.length; i < ii; ++i) {
        applyInstruction(owner, templateControllerInstructions[i], templateControllerModel);
      }

      owner.$bindable.push(templateControllerModel);
      owner.$attachable.push(templateControllerModel);

      break;
  }
}

class CompiledTemplate implements ITemplate {
  element: HTMLTemplateElement;

  constructor(private source: CompiledViewSource) {
    this.element = DOM.createTemplateElement();
    this.element.innerHTML = source.template;
  }

  createFor(owner: IViewOwner, host?: Node): IView {
    const source = this.source;
    const view = View.fromCompiledTemplate(this.element);
    const targets = view.findTargets();

    const targetInstructions = source.targetInstructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      let instructions = targetInstructions[i];
      let target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        applyInstruction(owner, instructions[j], target);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogateInstructions;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        applyInstruction(owner, surrogateInstructions[i], host);
      }
    }

    return view;
  }
}
