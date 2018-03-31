import { DOM } from "../dom";
import { View, IView, IViewOwner } from "./view";
import { IComponent, IAttach, IBindSelf } from "./component";
import { IBinding, Binding } from "../binding/binding";
import { ViewSlot } from "./view-slot";
import { IBindScope, IScope } from "../binding/binding-interfaces";
import { IShadowSlot, ShadowDOM } from "./shadow-dom";
import { bindingMode } from "../binding/binding-mode";
import { Listener } from "../binding/listener";
import { Call } from "../binding/call";
import { Ref } from "../binding/ref";
import { Expression } from "../binding/expression";
import { DI, IContainer, IResolver, IRegistration} from "../di";

export interface ITemplate {
  createFor(owner: IViewOwner, host?: Node): IView;
}

export interface CompiledViewSource {
  template: string;
  resources: any[];
  hasSlots?: boolean;
  targetInstructions: any[];
  surrogateInstructions?: any[];
}

const noViewTemplate: ITemplate = {
  createFor(owner: IViewOwner, host?: Node) {
    return View.none;
  }
};

export interface IVisual extends IBindScope, IAttach, IViewOwner { }

export const IViewFactory = DI.createInterface('IViewFactory');

export interface IViewFactory {
  create(): IVisual;
}

class DefaultViewFactory implements IViewFactory {
  constructor(private type: any) {}

  create(): IVisual {
    return new this.type();
  }
}

export const ViewEngine = {
  templateFromCompiledSource(source: CompiledViewSource) {
    if (source && source.template) {
      return new CompiledTemplate(source);
    }

    return noViewTemplate;
  },

  factoryFromCompiledSource(source: CompiledViewSource): IViewFactory {
    const template = ViewEngine.templateFromCompiledSource(source);

    const CompiledVisual = class extends Visual {
      static template: ITemplate = template;
      static source: CompiledViewSource = source;

      $slots: Record<string, IShadowSlot> = source.hasSlots ? {} : null;

      createView() {
        return template.createFor(this);
      }
    }

    return new DefaultViewFactory(CompiledVisual);
  }
};

function applyInstruction(owner: IViewOwner, instruction, target, container: TemplateContainer) {
  switch(instruction.type) {
    case 'oneWayText':
      let next = target.nextSibling;
      DOM.treatNodeAsNonWhitespace(next);
      DOM.removeNode(target);
      owner.$bindable.push(new Binding(Expression.from(instruction.source), next, 'textContent', bindingMode.oneWay, container));
      break;
    case 'oneWay':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), target, instruction.target, bindingMode.oneWay, container));
      break;
    case 'fromView':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), target, instruction.target, bindingMode.fromView, container));
      break;
    case 'twoWay':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), target, instruction.target, bindingMode.twoWay, container));
      break;
    case 'listener':
      owner.$bindable.push(new Listener(instruction.source, instruction.strategy, Expression.from(instruction.target), target, instruction.preventDefault, container));
      break;
    case 'call':
      owner.$bindable.push(new Call(Expression.from(instruction.source), target, instruction.target, container));
      break;
    case 'ref':
      owner.$bindable.push(new Ref(Expression.from(instruction.source), target, container));
      break;
    case 'style':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), (target as HTMLElement).style, instruction.target, bindingMode.oneWay, container));
      break;
    case 'property':
      target[instruction.target] = instruction.value;
      break;
    case 'slot':
      if (owner.$useShadowDOM) {
        return;
      }

      let fallbackFactory = instruction.factory;

      if (fallbackFactory === undefined && instruction.fallback) {
        instruction.factory = fallbackFactory = ViewEngine.factoryFromCompiledSource(instruction.fallback);
      }

      let slot = ShadowDOM.createSlot(owner, instruction.name, instruction.destination, fallbackFactory);
      owner.$slots[slot.name] = slot;
      owner.$bindable.push(slot);
      owner.$attachable.push(slot);
      DOM.replaceNode(slot.anchor, target);

      break;
    case 'element':
      let elementInstructions = instruction.instructions;

      container.element.instance = target;
      let elementModel = container.get<IViewOwner & IComponent>(instruction.resource);
      (<any>elementModel).$contentView = View.fromCompiledElementContent(elementModel, target);

      elementModel.applyTo(target);

      for (let i = 0, ii = elementInstructions.length; i < ii; ++i) {
        let current = elementInstructions[i];
        let realTarget = current.type === 'style' || current.type === 'listener' ? target : elementModel;
        applyInstruction(owner, current, realTarget, container);
      }

      owner.$bindable.push(elementModel);
      owner.$attachable.push(elementModel);

      break;
    case 'attribute':
      let attributeInstructions = instruction.instructions;

      container.element.instance = target;
      let attributeModel = container.get<IComponent>(instruction.resource);

      for (let i = 0, ii = attributeInstructions.length; i < ii; ++i) {
        applyInstruction(owner, attributeInstructions[i], attributeModel, container);
      }

      owner.$bindable.push(attributeModel);
      owner.$attachable.push(attributeModel);
      break;
    case 'templateController':
      let templateControllerInstructions = instruction.instructions;
      let factory = instruction.factory;

      if (factory === undefined) {
        instruction.factory = factory = ViewEngine.factoryFromCompiledSource(instruction.config);
      }

      container.element.instance = target;
      container.viewFactory.instance = factory;
      container.viewSlot.instance = new ViewSlot(DOM.makeElementIntoAnchor(target), false);
      let templateControllerModel = container.get<IComponent>(instruction.resource);

      if (instruction.link) {
        (<any>templateControllerModel).link(owner.$attachable[owner.$attachable.length - 1]);
      }

      for (let i = 0, ii = templateControllerInstructions.length; i < ii; ++i) {
        applyInstruction(owner, templateControllerInstructions[i], templateControllerModel, container);
      }

      owner.$bindable.push(templateControllerModel);
      owner.$attachable.push(templateControllerModel);

      break;
  }
}

class FastInstance<T> implements IResolver {
  public instance: T;

  get(handler: IContainer, requestor: IContainer) {
    return this.instance;
  }
}

type TemplateContainer = IContainer & {
  element: FastInstance<Element>,
  viewFactory: FastInstance<IViewFactory>,
  viewSlot: FastInstance<ViewSlot>
};

function createTemplateContainer(dependencies) {
  let container = <TemplateContainer>DI.createChild();

  container.registerResolver(Element, container.element = new FastInstance());
  container.registerResolver(IViewFactory, container.viewFactory = new FastInstance());
  container.registerResolver(ViewSlot, container.viewSlot = new FastInstance());

  if (dependencies) {
    container.register(...dependencies);
  }

  return container;
}

class CompiledTemplate implements ITemplate {
  private element: HTMLTemplateElement;
  private container: TemplateContainer;

  constructor(private source: CompiledViewSource) {
    this.container = createTemplateContainer(source.resources);
    this.element = DOM.createTemplateElement();
    this.element.innerHTML = source.template;
  }

  createFor(owner: IViewOwner, host?: Node): IView {
    const source = this.source;
    const view = View.fromCompiledTemplate(this.element);
    const targets = view.findTargets();
    const container = this.container;

    const targetInstructions = source.targetInstructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      let instructions = targetInstructions[i];
      let target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        applyInstruction(owner, instructions[j], target, container);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogateInstructions;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        applyInstruction(owner, surrogateInstructions[i], host, container);
      }
    }

    return view;
  }
}

abstract class Visual implements IVisual {
  $bindable: IBindScope[] = [];
  $attachable: IAttach[] = [];
  $scope: IScope;
  $view: IView;
  $isBound = false;

  constructor() {
    this.$view = this.createView();
  }

  abstract createView(): IView;

  bind(scope: IScope) {
    this.$scope = scope;

    let bindable = this.$bindable;

    for (let i = 0, ii = bindable.length; i < ii; ++i) {
      bindable[i].bind(scope);
    }

    this.$isBound = true;
  }

  attach() {
    let attachable = this.$attachable;

    for (let i = 0, ii = attachable.length; i < ii; ++i) {
      attachable[i].attach();
    }
  }

  detach() { 
    let attachable = this.$attachable;
    let i = attachable.length;

    while (i--) {
      attachable[i].detach();
    }
  }

  unbind() {
    let bindable = this.$bindable;
    let i = bindable.length;

    while (i--) {
      bindable[i].unbind();
    }

    this.$isBound = false;
  }
}
