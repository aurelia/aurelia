import { DOM } from "../dom";
import { View, IView, IViewOwner } from "./view";
import { IComponent, IAttach, IBindSelf } from "./component";
import { IVisual, Visual } from "./visual";
import { IBinding } from "../binding/binding";
import { ViewSlot } from "./view-slot";
import { IBindScope, IScope } from "../binding/binding-interfaces";
import { oneWayText, oneWay, fromView, twoWay, listener, ref, call } from "./generated";
import { makeElementIntoAnchor } from "./anchors";
import { IShadowSlot, ShadowDOM } from "./shadow-dom";
import { ViewFactory } from "./view-factory";

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
      owner.$bindable.push(oneWayText(instruction.source, target));
      break;
    case 'oneWay':
      owner.$bindable.push(oneWay(instruction.source, target, instruction.target));
      break;
    case 'fromView':
      owner.$bindable.push(fromView(instruction.source, target, instruction.target));
      break;
    case 'twoWay':
      owner.$bindable.push(twoWay(instruction.source, target, instruction.target));
      break;
    case 'listener':
      owner.$bindable.push(listener(instruction.source, target, instruction.target, instruction.preventDefault, instruction.strategy));
      break;
    case 'call':
      owner.$bindable.push(call(instruction.source, target, instruction.target));
      break;
    case 'ref':
      owner.$bindable.push(ref(instruction.source, target));
      break;
    case 'style':
      owner.$bindable.push(oneWay(instruction.source, (target as HTMLElement).style, instruction.target))
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
        new ViewSlot(makeElementIntoAnchor(target), false)
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
